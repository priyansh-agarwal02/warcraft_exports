import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmation, sendGuestWelcomeEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { createServiceClient } from "@/lib/supabase/service"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`orders:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { customer, items, paymentMethod, paymentIntentId, shippingMethod = "standard", status = "confirmed", couponCode } = body as {
      customer: {
        fullName: string
        email: string
        phone: string
        address1: string
        address2?: string
        city: string
        state: string
        postalCode: string
        country: string
        notes?: string
        honeypot?: string
      }
      items: { productId: string; variantId: string | null; quantity: number }[]
      paymentMethod?: "razorpay" | "paypal"
      paymentIntentId?: string
      shippingMethod?: "standard" | "express"
      status?: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
      couponCode?: string | null
    }

    // Honeypot — silent drop for bots
    if (customer?.honeypot) {
      return NextResponse.json({ orderId: "ok", orderNumber: "WE-OK" })
    }

    if (
      !customer?.fullName?.trim() || !customer?.email?.trim() ||
      !customer?.address1?.trim() || !customer?.city?.trim() || !customer?.country?.trim()
    ) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 })
    }

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    for (const item of items) {
      if (!UUID_RE.test(String(item.productId))) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
      }
    }

    const supabase = await createClient()

    // Server-side price recalculation — never trust client amounts
    const productIds = [...new Set(items.map((i) => i.productId))]
    const { data: dbProducts, error: fetchError } = await supabase
      .from("products")
      .select("id, name, sku, price_usd, sale_price_usd")
      .in("id", productIds)

    if (fetchError || !dbProducts) {
      return NextResponse.json({ error: "Failed to validate products" }, { status: 500 })
    }

    // Fetch product variants if any items have a variant selected
    const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[]
    let dbVariants: any[] = []
    if (variantIds.length > 0) {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, price_override")
        .in("id", variantIds)
      if (!error && data) {
        dbVariants = data
      }
    }
    const variantMap = new Map(dbVariants.map((v) => [v.id, v]))

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))
    const validatedItems: {
      productId: string; productName: string; sku: string
      priceUsd: number; quantity: number; variantId: string | null
    }[] = []
    let subtotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product not found` }, { status: 400 })
      }
      const qty = Math.max(1, Math.min(Number(item.quantity) || 1, 100))
      
      // Check for variant price override
      const variant = item.variantId ? variantMap.get(item.variantId) : null
      const unitPrice = variant?.price_override != null
        ? Number(variant.price_override)
        : (product.sale_price_usd ?? product.price_usd)

      subtotal += unitPrice * qty
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        priceUsd: unitPrice,
        quantity: qty,
        variantId: item.variantId ?? null,
      })
    }

    subtotal = Math.round(subtotal * 100) / 100

    let couponId: string | null = null
    let couponType: string | null = null
    let couponValue = 0

    if (couponCode) {
      const cleanCouponCode = couponCode.toUpperCase().trim()
      const serviceClient = createServiceClient()
      const { data: dbCoupon, error: couponErr } = await serviceClient
        .from("coupons")
        .select("id, code, type, value, min_order_usd, usage_limit, times_used, is_active, expires_at")
        .ilike("code", cleanCouponCode)
        .maybeSingle()

      if (!couponErr && dbCoupon && dbCoupon.is_active) {
        const isNotExpired = !dbCoupon.expires_at || new Date(dbCoupon.expires_at) >= new Date()
        const isMinOrderMet = !dbCoupon.min_order_usd || subtotal >= Number(dbCoupon.min_order_usd)
        const isUnderLimit = !dbCoupon.usage_limit || (dbCoupon.times_used ?? 0) < dbCoupon.usage_limit

        if (isNotExpired && isMinOrderMet && isUnderLimit) {
          couponId = dbCoupon.id
          couponType = dbCoupon.type
          couponValue = Number(dbCoupon.value)
        }
      }
    }

    // Fetch active shipping rate from database based on selected country name
    const { data: dbRate } = await supabase
      .from("shipping_rates")
      .select("standard_price, free_threshold, express_price")
      .eq("country_name", customer.country)
      .maybeSingle()

    // Fallback to "Rest of World" / "OTHER" if no country-specific rate exists
    let activeRate = dbRate
    if (!activeRate) {
      const { data: fallbackRate } = await supabase
        .from("shipping_rates")
        .select("standard_price, free_threshold, express_price")
        .eq("country_code", "OTHER")
        .maybeSingle()
      activeRate = fallbackRate
    }

    const standardPrice = activeRate ? Number(activeRate.standard_price) : 14.99
    const expressPrice = activeRate ? Number(activeRate.express_price) : 35.00
    const freeThreshold = activeRate ? Number(activeRate.free_threshold) : 150

    const isExpress = shippingMethod === "express"
    const standardCost = (subtotal >= freeThreshold || couponType === "free_shipping") ? 0 : standardPrice
    const expressCost = expressPrice

    const shipping = isExpress ? expressCost : standardCost
      
    let discountUsd = 0
    if (couponType === "percent") {
      discountUsd = Math.round(subtotal * (couponValue / 100) * 100) / 100
    } else if (couponType === "fixed") {
      discountUsd = Math.min(subtotal, couponValue)
    }

    const total = Math.round(Math.max(0, subtotal - discountUsd + shipping) * 100) / 100

    const orderNumber = `WE-${Date.now().toString(36).toUpperCase()}`
    const shippingAddress = {
      address1: customer.address1,
      address2: customer.address2 ?? "",
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
    }

    const { data: { user } } = await supabase.auth.getUser()
    let orderUserId = user?.id || null
    let tempPasswordCreated: string | null = null

    if (!orderUserId && customer.email) {
      try {
        const serviceClient = createServiceClient()
        let existingUserId: string | null = null

        // 1. Paginate to find if user already exists in auth.users
        let page = 1
        const perPage = 1000
        while (true) {
          const { data, error: listError } = await serviceClient.auth.admin.listUsers({
            page,
            perPage,
          })
          if (listError || !data?.users || data.users.length === 0) break
          const matchedUser = data.users.find(u => u.email?.toLowerCase() === customer.email.toLowerCase())
          if (matchedUser) {
            existingUserId = matchedUser.id
            break
          }
          if (data.users.length < perPage) break
          page++
        }

        if (existingUserId) {
          orderUserId = existingUserId
        } else {
          // 2. User does not exist, create a new user profile on their behalf
          const tempPassword = `WE-${Math.random().toString(36).substring(2, 10).toUpperCase()}!`
          const { data: newAuthUser, error: signUpError } = await serviceClient.auth.admin.createUser({
            email: customer.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: customer.fullName }
          })

          if (signUpError) {
            console.warn("[CHECKOUT] Guest user creation failed:", signUpError)
          } else if (newAuthUser?.user) {
            orderUserId = newAuthUser.user.id
            tempPasswordCreated = tempPassword
          }
        }
      } catch (err) {
        console.error("[CHECKOUT] Guest user resolution error:", err)
      }
    }

    const formattedNotes = [
      isExpress ? "[Shipping Option: Express]" : "[Shipping Option: Standard]",
      customer.notes ? `Customer Notes: ${customer.notes}` : ""
    ].filter(Boolean).join(" | ")

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: orderUserId || null,
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
        notes: formattedNotes || null,
        subtotal_usd: subtotal,
        shipping_usd: shipping,
        discount_usd: discountUsd,
        total_usd: total,
        coupon_id: couponId,
        status: status || "confirmed",
        payment_method: paymentMethod || null,
        payment_intent_id: paymentIntentId || null,
      })
      .select("id")
      .single()

    if (orderError || !order) {
      console.error("Order insert error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Auto-save shipping address using RLS-proof service role client if user is logged in or account created
    if (orderUserId) {
      try {
        const serviceClient = createServiceClient()
        const { data: existingAddress } = await serviceClient
          .from("addresses")
          .select("id")
          .eq("user_id", orderUserId)
          .eq("line1", customer.address1)
          .eq("city", customer.city)
          .eq("postal_code", customer.postalCode)
          .eq("country", customer.country)
          .maybeSingle()

        if (!existingAddress) {
          const { count } = await serviceClient
            .from("addresses")
            .select("id", { count: "exact", head: true })
            .eq("user_id", orderUserId)

          const isDefault = count === 0

          await serviceClient.from("addresses").insert({
            user_id: orderUserId,
            type: "shipping",
            full_name: customer.fullName,
            line1: customer.address1,
            line2: customer.address2 || null,
            city: customer.city,
            state: customer.state || null,
            country: customer.country,
            postal_code: customer.postalCode,
            is_default: isDefault,
          })
        }
      } catch (addrErr) {
        console.error("Failed to auto-save customer address:", addrErr)
      }
    }

    await supabase.from("order_items").insert(
      validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price_usd: item.priceUsd,
        price_usd: item.priceUsd,
        product_snapshot: { name: item.productName, sku: item.sku }
      }))
    )

    // Log coupon usage in coupon_uses and update times_used on the coupon table using service role client
    if (couponId && order?.id) {
      try {
        const serviceClient = createServiceClient()
        // 1. Log coupon usage
        await serviceClient.from("coupon_uses").insert({
          coupon_id: couponId,
          order_id: order.id,
          user_id: orderUserId || null,
        })
        
        // 2. Increment times_used on coupon
        const { data: currCoupon } = await serviceClient
          .from("coupons")
          .select("times_used")
          .eq("id", couponId)
          .single()
        
        await serviceClient
          .from("coupons")
          .update({ times_used: (currCoupon?.times_used ?? 0) + 1 })
          .eq("id", couponId)
      } catch (useErr) {
        console.error("Failed to record coupon usage:", useErr)
      }
    }

    // Run order confirmation email asynchronously to optimize redirect response speed
    sendOrderConfirmation({
      orderNumber,
      customerName: customer.fullName,
      customerEmail: customer.email,
      items: validatedItems.map((i) => ({
        name: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.priceUsd,
      })),
      subtotal,
      shipping,
      discount: discountUsd,
      total,
      shippingAddress,
    }).catch((err) => console.error("Order confirmation email failed:", err))

    // Send guest welcome email if a temp password was generated
    if (tempPasswordCreated) {
      sendGuestWelcomeEmail(customer.fullName, customer.email, tempPasswordCreated)
        .catch((err) => console.error("Guest welcome email failed:", err))
    }

    return NextResponse.json({ orderId: order.id, orderNumber })
  } catch (err) {
    console.error("POST /api/orders error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
