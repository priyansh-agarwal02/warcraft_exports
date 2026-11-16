import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmation, sendGuestWelcomeEmail, sendPaymentReviewAlert } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { createServiceClient } from "@/lib/supabase/service"
import { isBlatantTypo, suggestEmailCorrection } from "@/lib/email-validator"
import crypto from "crypto"
import { computeOrderPricing } from "@/lib/orders/pricing"
import { likeExact } from "@/lib/like-escape"
import { paymentCoversTotal, verifyPayPalCapture, verifyPayPalPayment, verifyRazorpayPayment } from "@/lib/payments/gateways"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  // Every order now needs a verified PayPal/Razorpay payment, so fake attempts fail anyway.
  // The limit is generous so a genuine payer on a shared network (office, mobile carrier) is never blocked.
  if (!(await checkRateLimit(`orders:${ip}`, 20, 60_000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // Set once a payment has been verified, so even an unexpected crash still alerts the owner.
  let alertAfterPayment: ((reason: string, customerMessage: string) => Promise<NextResponse>) | null = null

  try {
    const body = await req.json()
    const { customer, items, paymentMethod, paymentIntentId, gatewayOrderId, shippingMethod = "standard", couponCode } = body as {
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
      items: { productId: string; variantId: string | null; variantLabel?: string | null; quantity: number }[]
      paymentMethod?: "razorpay" | "paypal"
      paymentIntentId?: string
      gatewayOrderId?: string
      shippingMethod?: "standard" | "express"
      couponCode?: string | null
      displayCurrency?: string
      exchangeRate?: number
    }

    // Honeypot — silent drop for bots
    if (customer?.honeypot) {
      return NextResponse.json({ orderId: "ok", orderNumber: "WE-OK" })
    }

    // ── 1. Payment verification FIRST — ask PayPal / Razorpay directly; never trust the browser ──
    if ((paymentMethod !== "paypal" && paymentMethod !== "razorpay") || !paymentIntentId) {
      return NextResponse.json({ error: "Payment is required to place an order." }, { status: 402 })
    }
    let paymentRef = String(paymentIntentId).slice(0, 100)
    // gatewayOrderId is missing only for checkouts started on the previous version of the site
    // (open in a browser tab during the update) — those are verified by the payment id alone.
    const gatewayRef = gatewayOrderId ? String(gatewayOrderId).slice(0, 100) : null

    const verification = paymentMethod === "paypal"
      ? (gatewayRef ? await verifyPayPalPayment(gatewayRef) : await verifyPayPalCapture(paymentRef))
      : await verifyRazorpayPayment(gatewayRef, paymentRef)

    if (verification.status === "not_paid") {
      console.warn("[ORDERS] Rejected order with unverified payment:", paymentMethod, verification.reason)
      return NextResponse.json({ error: "We could not confirm your payment. Please contact support if you were charged." }, { status: 402 })
    }

    if (verification.status === "paid") {
      if (paymentMethod === "paypal" && paymentRef !== verification.captureId && (!gatewayRef || paymentRef !== gatewayRef)) {
        return NextResponse.json({ error: "Payment details do not match." }, { status: 402 })
      }
      // Always store the gateway's own capture/payment id (canonical form)
      paymentRef = verification.captureId
    }

    // From here on the customer has (very likely) paid. Any failure must alert the owner
    // with the payment id instead of silently dropping the order.
    const failAfterPayment = async (reason: string, customerMessage: string) => {
      console.error("[ORDERS] Order not saved after payment:", reason, paymentMethod, paymentRef)
      try {
        await sendPaymentReviewAlert({
          orderNumber: "NOT SAVED",
          customerEmail: String(customer?.email ?? "unknown").slice(0, 254),
          totalUsd: 0,
          paymentMethod,
          paymentRef,
          note: `PAID BUT ORDER NOT SAVED — ${reason}. Customer: ${String(customer?.fullName ?? "").slice(0, 100)}, ${String(customer?.phone ?? "").slice(0, 30)}. Items: ${JSON.stringify(items ?? []).slice(0, 800)}`,
        })
      } catch (err) {
        console.error("Payment review alert failed:", err)
      }
      return NextResponse.json(
        { error: `${customerMessage} Your payment was received — please email warcraftexports@gmail.com with payment ID ${paymentRef} and we will complete your order.` },
        { status: 400 }
      )
    }
    alertAfterPayment = failAfterPayment

    // A payment can only ever be used for one order (checked under every id it may be known by)
    const serviceClient = createServiceClient()
    const { count: reuseCount } = await serviceClient
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("payment_intent_id", [...new Set([paymentRef, String(paymentIntentId).slice(0, 100), ...(gatewayRef ? [gatewayRef] : [])])])
    if (reuseCount && reuseCount > 0) {
      return NextResponse.json({ error: "This payment has already been used for an order." }, { status: 409 })
    }

    // ── 2. Customer details ──
    if (
      !customer?.fullName?.trim() || !customer?.email?.trim() ||
      !customer?.address1?.trim() || !customer?.city?.trim() || !customer?.country?.trim()
    ) {
      return failAfterPayment("missing customer fields", "Some required details were missing.")
    }

    // Email format validation
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!EMAIL_RE.test(customer.email.trim())) {
      return failAfterPayment("invalid email", "Your email address looks invalid.")
    }

    let emailTypoNote: string | null = null
    if (isBlatantTypo(customer.email.trim())) {
      // Don't reject a paid order over a suspected typo — flag it for the owner instead.
      emailTypoNote = `Check customer email (possible typo — did they mean ${suggestEmailCorrection(customer.email.trim())}?)`
    }

    // Phone format: keep the order, but don't store junk
    if (customer.phone && !/^\+?[\d\s\-().]{7,20}$/.test(customer.phone.trim())) {
      customer.phone = customer.phone.replace(/[^\d+\s\-().]/g, "").slice(0, 20)
    }

    // Length limits to prevent abuse (trim instead of rejecting a paid order)
    customer.fullName = customer.fullName.trim().slice(0, 100)
    customer.address1 = customer.address1.trim().slice(0, 200)
    customer.city = customer.city.trim().slice(0, 100)
    if (customer.email.length > 254) {
      return failAfterPayment("email too long", "Your email address is too long.")
    }

    // Sanitize notes — strip HTML tags to prevent stored XSS
    if (customer.notes) {
      customer.notes = customer.notes.replace(/<[^>]*>/g, "").slice(0, 2000)
    }

    if (!items?.length) {
      return failAfterPayment("empty cart", "Your cart was empty.")
    }

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const currentUserId = currentUser?.id || null

    // ── 3. Server-side price recalculation — never trust client amounts ──
    // lenient: stock / coupon changes since payment become review notes, not a lost order.
    const pricing = await computeOrderPricing(serviceClient, {
      items,
      country: customer.country,
      shippingMethod,
      couponCode,
      email: customer.email,
      userId: currentUserId,
      lenient: true,
    })
    if (!pricing.ok) {
      return failAfterPayment(`pricing failed: ${pricing.error}`, "We couldn't record your order automatically.")
    }
    const { validatedItems, subtotal, shipping, discountUsd, total, couponId, isExpress, warnings, quantityDiscountUsd, quantityPromotionName } = pricing

    // ── 4. Decide status ──
    // Owner's rule: a payment that PayPal/Razorpay confirm as received is ALWAYS "confirmed".
    // Anything unusual (amount differs, low stock, coupon re-use) is written in the order notes
    // and emailed to the owner — it never changes the status.
    // Only when the gateway could not confirm the money at all (outage / payment still clearing)
    // is the order kept as "pending".
    const status: "confirmed" | "pending" = verification.status === "paid" ? "confirmed" : "pending"
    const reviewReasons: string[] = []
    if (verification.status === "paid") {
      const cover = await paymentCoversTotal(verification.amount, verification.currency, total)
      if (!cover.ok) {
        reviewReasons.push(`charged ${verification.amount} ${verification.currency}${cover.chargedUsd !== null ? ` (~$${cover.chargedUsd.toFixed(2)})` : ""}, order total $${total.toFixed(2)}`)
      }
    } else {
      reviewReasons.push(`could not verify payment automatically (${verification.reason})`)
    }
    reviewReasons.push(...warnings)
    // Owner is alerted whenever something about the payment/order needs a look
    const needsOwnerAttention = reviewReasons.length > 0
    if (emailTypoNote) reviewReasons.push(emailTypoNote)
    const paymentReviewNote = reviewReasons.length
      ? `${needsOwnerAttention ? "CHECK PAYMENT" : "NOTE"}: ${reviewReasons.join("; ")}`
      : null

    // Display-only currency info from the browser: accept only sane values
    const displayCurrency = typeof body.displayCurrency === "string" && /^[A-Z]{3}$/.test(body.displayCurrency) ? body.displayCurrency : "USD"
    const rawRate = Number(body.exchangeRate)
    const exchangeRate = displayCurrency !== "USD" && Number.isFinite(rawRate) && rawRate > 0 && rawRate < 100000 ? rawRate : 1

    const orderNumber = `WE-${Date.now().toString(36).toUpperCase()}`
    const shippingAddress = {
      address1: customer.address1,
      address2: customer.address2 ?? "",
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
    }

    let orderUserId = currentUserId
    let tempPasswordCreated: string | null = null

    if (!orderUserId && customer.email) {
      try {
        let existingUserId: string | null = null

        // 1. Check profiles table first for direct UUID match
        const { data: profileMatch } = await serviceClient
          .from("profiles")
          .select("id")
          .ilike("email", likeExact(customer.email.trim()))
          .maybeSingle()

        if (profileMatch?.id) {
          existingUserId = profileMatch.id
        } else {
          // Fallback: Paginate to find if user exists in auth.users
          let page = 1
          const perPage = 1000
          while (true) {
            const { data, error: listError } = await serviceClient.auth.admin.listUsers({
              page,
              perPage,
            })
            if (listError || !data?.users || data.users.length === 0) break
            const matchedUser = data.users.find(u => u.email?.toLowerCase() === customer.email.trim().toLowerCase())
            if (matchedUser) {
              existingUserId = matchedUser.id
              break
            }
            if (data.users.length < perPage) break
            page++
          }
        }

        if (existingUserId) {
          orderUserId = existingUserId
        } else {
          // 2. User does not exist, create a new user profile on their behalf
          // H-3 FIX: Use cryptographically secure random bytes for temp password
          const tempPassword = `WE-${crypto.randomBytes(12).toString("base64url")}!`
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
      paymentReviewNote ? `[${paymentReviewNote}]` : "",
      quantityDiscountUsd > 0 ? `[Quantity promotion: ${quantityPromotionName ?? "discount"} −$${quantityDiscountUsd.toFixed(2)}]` : "",
      isExpress ? "[Shipping Option: Express]" : "[Shipping Option: Standard]",
      customer.notes ? `Customer Notes: ${customer.notes}` : ""
    ].filter(Boolean).join(" | ")

    const { data: order, error: orderError } = await serviceClient
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
        display_currency: displayCurrency,
        exchange_rate: exchangeRate,
        total_display: Number((total * exchangeRate).toFixed(2)),
        coupon_id: couponId,
        status,
        payment_method: paymentMethod,
        payment_intent_id: paymentRef,
      })
      .select("id")
      .single()

    if (orderError || !order) {
      console.error("Order insert error:", orderError)
      return failAfterPayment(`database insert failed: ${orderError?.message ?? "unknown"}`, "We couldn't record your order automatically.")
    }

    // Auto-save shipping address using RLS-proof service role client if user is logged in or account created
    if (orderUserId) {
      try {
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
        // Auto-update profile with customer full name and phone number
        await serviceClient.from("profiles").upsert({
          id: orderUserId,
          full_name: customer.fullName,
          phone: customer.phone || null,
          email: customer.email,
        }, { onConflict: "id" })
      } catch (addrErr) {
        console.error("Failed to auto-save customer address/profile:", addrErr)
      }
    }

    await serviceClient.from("order_items").insert(
      validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price_usd: item.priceUsd,
        price_usd: item.priceUsd,
        product_snapshot: {
          name: item.productName,
          sku: item.sku,
          variant_label: item.variantLabel,
          color: item.color,
          size: item.size,
        },
      }))
    )

    // Log coupon usage in coupon_uses and update times_used on the coupon table using service role client
    if (couponId && order?.id) {
      try {
        // 1. Log coupon usage
        await serviceClient.from("coupon_uses").insert({
          coupon_id: couponId,
          order_id: order.id,
          user_id: orderUserId || null,
        })
        
        // 2. Atomically increment times_used (prevents race condition)
        await serviceClient.rpc("increment_coupon_usage", { coupon_uuid: couponId })

      } catch (useErr) {
        console.error("Failed to record coupon usage:", useErr)
      }
    }

    // Await order confirmation email so network request completes before serverless context freezes
    try {
      await sendOrderConfirmation({
        orderNumber,
        customerName: customer.fullName,
        customerEmail: customer.email,
        items: validatedItems.map((i) => ({
          name: i.productName,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.priceUsd,
          variantLabel: i.variantLabel ?? undefined,
          shipsFromUsa: i.shipsFromUsa,
        })),
        subtotal,
        shipping,
        discount: discountUsd,
        total,
        shippingAddress,
      })
    } catch (err) {
      console.error("Order confirmation email failed:", err)
    }

    // Alert the store owner when an order needs a manual payment check
    if (needsOwnerAttention && paymentReviewNote) {
      try {
        await sendPaymentReviewAlert({ orderNumber, customerEmail: customer.email, totalUsd: total, paymentMethod, paymentRef, note: paymentReviewNote })
      } catch (err) {
        console.error("Payment review alert failed:", err)
      }
    }

    // Send guest welcome email if a temp password was generated
    if (tempPasswordCreated) {
      try {
        await sendGuestWelcomeEmail(customer.fullName, customer.email, tempPasswordCreated)
      } catch (err) {
        console.error("Guest welcome email failed:", err)
      }
    }

    return NextResponse.json({ orderId: order.id, orderNumber })
  } catch (err) {
    console.error("POST /api/orders error:", err)
    if (alertAfterPayment) {
      return alertAfterPayment(`unexpected error: ${err instanceof Error ? err.message : String(err)}`, "Something went wrong while recording your order.")
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
