import type { SupabaseClient } from "@supabase/supabase-js"
import { likeExact } from "@/lib/like-escape"
import { calculateQuantityDiscount, type QuantityPromotion } from "@/lib/promotions"

// Single source of truth for order pricing. Used by the payment-creation routes
// (so PayPal / Razorpay charge the server's total) and by /api/orders (to verify it).
// Logic moved unchanged from /api/orders.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type PricingItemInput = {
  productId: string
  variantId: string | null
  variantLabel?: string | null
  quantity: number
}

export type PricingInput = {
  items: PricingItemInput[]
  country: string
  shippingMethod?: "standard" | "express"
  couponCode?: string | null
  email?: string | null
  userId?: string | null
  // After a payment is verified: never fail on stock / coupon re-use — report warnings instead,
  // so a paying customer's order is kept (as pending review) rather than lost.
  lenient?: boolean
}

export type ValidatedItem = {
  productId: string
  productName: string
  sku: string
  priceUsd: number
  quantity: number
  variantId: string | null
  variantLabel: string | null
  color: string | null
  size: string | null
  shipsFromUsa: boolean
}

export type PricingResult =
  | {
      ok: true
      validatedItems: ValidatedItem[]
      subtotal: number
      shipping: number
      discountUsd: number // coupon + quantity promotion
      couponDiscountUsd: number
      quantityDiscountUsd: number
      quantityPromotionName: string | null
      total: number
      couponId: string | null
      isExpress: boolean
      warnings: string[]
    }
  | { ok: false; status: number; error: string }

type ProductRow = {
  id: string
  name: string
  sku: string
  price_usd: number
  sale_price_usd: number | null
  stock_quantity: number | null
  ships_from_usa: boolean | null
}

type VariantRow = {
  id: string
  product_id: string
  price_override: number | null
  color: string | null
  size: string | null
}

export async function computeOrderPricing(
  serviceClient: SupabaseClient,
  input: PricingInput
): Promise<PricingResult> {
  const { items, country, shippingMethod = "standard", couponCode, email, userId, lenient = false } = input
  const warnings: string[] = []

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, error: "Cart is empty" }
  }
  if (items.length > 50) {
    return { ok: false, status: 400, error: "Too many items in cart" }
  }
  for (const item of items) {
    if (!UUID_RE.test(String(item.productId))) {
      return { ok: false, status: 400, error: "Invalid product id" }
    }
    if (item.variantId != null && !UUID_RE.test(String(item.variantId))) {
      return { ok: false, status: 400, error: "Invalid variant id" }
    }
  }
  if (!country || typeof country !== "string") {
    return { ok: false, status: 400, error: "Missing shipping country" }
  }

  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: dbProducts, error: fetchError } = await serviceClient
    .from("products")
    .select("id, name, sku, price_usd, sale_price_usd, stock_quantity, ships_from_usa")
    .in("id", productIds)

  if (fetchError || !dbProducts) {
    return { ok: false, status: 500, error: "Failed to validate products" }
  }

  const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[]
  let dbVariants: VariantRow[] = []
  if (variantIds.length > 0) {
    const { data, error } = await serviceClient
      .from("product_variants")
      .select("id, product_id, price_override, color, size")
      .in("id", variantIds)
    if (!error && data) dbVariants = data as VariantRow[]
  }
  const variantMap = new Map(dbVariants.map((v) => [v.id, v]))
  const productMap = new Map((dbProducts as ProductRow[]).map((p) => [p.id, p]))

  const validatedItems: ValidatedItem[] = []
  let subtotal = 0

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) return { ok: false, status: 400, error: "Product not found" }

    const qty = Math.max(1, Math.min(Math.floor(Number(item.quantity)) || 1, 100))

    if (product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity < qty) {
      if (lenient) {
        warnings.push(`Low stock: "${product.name}" has ${product.stock_quantity} left, ${qty} ordered`)
      } else return {
        ok: false,
        status: 400,
        error: `"${product.name}" has insufficient stock (${product.stock_quantity} available, ${qty} requested).`,
      }
    }

    // A variant only counts if it belongs to THIS product — otherwise a cheap variant of another
    // product could be used to buy an expensive product at the cheap variant's price.
    const rawVariant = item.variantId ? variantMap.get(item.variantId) : null
    let variant: VariantRow | null = null
    if (item.variantId) {
      if (rawVariant && rawVariant.product_id === product.id) {
        variant = rawVariant
      } else if (!lenient) {
        return { ok: false, status: 400, error: `Please re-select the option for "${product.name}" and try again.` }
      } else {
        warnings.push(`Option on "${product.name}" did not match the product — charged the product's normal price`)
      }
    }
    const unitPrice = variant?.price_override != null
      ? Number(variant.price_override)
      : Number(product.sale_price_usd ?? product.price_usd)

    const derivedVariantLabel = variant ? [variant.color, variant.size].filter(Boolean).join(" / ") : null
    const variantLabel = (typeof item.variantLabel === "string" ? item.variantLabel.slice(0, 120) : null) || derivedVariantLabel || null

    subtotal += unitPrice * qty
    validatedItems.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      priceUsd: unitPrice,
      quantity: qty,
      variantId: variant ? variant.id : null,
      variantLabel,
      color: variant?.color ?? null,
      size: variant?.size ?? null,
      shipsFromUsa: Boolean(product.ships_from_usa),
    })
  }

  subtotal = Math.round(subtotal * 100) / 100

  let couponId: string | null = null
  let couponType: string | null = null
  let couponValue = 0

  if (couponCode && typeof couponCode === "string") {
    const cleanCouponCode = couponCode.toUpperCase().trim().slice(0, 50)
    const { data: dbCoupon, error: couponErr } = await serviceClient
      .from("coupons")
      .select("id, code, type, value, min_order_usd, usage_limit, times_used, is_active, expires_at")
      .ilike("code", likeExact(cleanCouponCode))
      .maybeSingle()

    if (!couponErr && dbCoupon && dbCoupon.is_active) {
      const isNotExpired = !dbCoupon.expires_at || new Date(dbCoupon.expires_at) >= new Date()
      const isMinOrderMet = !dbCoupon.min_order_usd || subtotal >= Number(dbCoupon.min_order_usd)
      const isUnderLimit = !dbCoupon.usage_limit || (dbCoupon.times_used ?? 0) < dbCoupon.usage_limit

      if (isNotExpired && isMinOrderMet && isUnderLimit) {
        if (userId) {
          const { count, error } = await serviceClient
            .from("coupon_uses")
            .select("id", { count: "exact", head: true })
            .eq("coupon_id", dbCoupon.id)
            .eq("user_id", userId)
          if (!error && count && count > 0) {
            if (!lenient) return { ok: false, status: 400, error: "You have already used this coupon." }
            warnings.push(`Coupon ${dbCoupon.code} was already used by this customer`)
          }
        }
        if (email) {
          const { count, error } = await serviceClient
            .from("orders")
            .select("id", { count: "exact", head: true })
            .ilike("customer_email", likeExact(email.trim()))
            .eq("coupon_id", dbCoupon.id)
          if (!error && count && count > 0) {
            if (!lenient) return { ok: false, status: 400, error: "You have already used this coupon." }
            warnings.push(`Coupon ${dbCoupon.code} was already used by this customer`)
          }
        }
        couponId = dbCoupon.id
        couponType = dbCoupon.type
        couponValue = Number(dbCoupon.value)
      }
    }
  }

  const { data: dbRate } = await serviceClient
    .from("shipping_rates")
    .select("standard_price, free_threshold, express_price")
    .ilike("country_name", likeExact(country.trim()))
    .limit(1)
    .maybeSingle()

  let activeRate = dbRate
  if (!activeRate) {
    const { data: fallbackRate } = await serviceClient
      .from("shipping_rates")
      .select("standard_price, free_threshold, express_price")
      .eq("country_code", "OTHER")
      .maybeSingle()
    activeRate = fallbackRate
  }

  const standardPrice = activeRate ? Number(activeRate.standard_price) : 14.99
  const expressPrice = activeRate ? Number(activeRate.express_price) : 35.0
  const freeThreshold = activeRate ? Number(activeRate.free_threshold) : 150

  const isExpress = shippingMethod === "express"
  const standardCost = subtotal >= freeThreshold || couponType === "free_shipping" ? 0 : standardPrice
  const shipping = isExpress ? expressPrice : standardCost

  let couponDiscountUsd = 0
  if (couponType === "percent") {
    couponDiscountUsd = Math.round(subtotal * (couponValue / 100) * 100) / 100
  } else if (couponType === "fixed") {
    couponDiscountUsd = Math.min(subtotal, couponValue)
  }

  // Quantity promotions ("Buy 2+ save 5%") — the same rule the cart page shows,
  // using the same calculateQuantityDiscount() function, so cart, checkout and charge all agree.
  let quantityDiscountUsd = 0
  let quantityPromotionName: string | null = null
  const { data: promoRows, error: promoErr } = await serviceClient
    .from("quantity_promotions")
    .select("id, name, description, min_quantity, discount_percent, applies_to, product_ids, is_active, expires_at, created_at")
    .eq("is_active", true)
  if (!promoErr && Array.isArray(promoRows) && promoRows.length) {
    const now = Date.now()
    const active = (promoRows as QuantityPromotion[]).filter((p) => !p.expires_at || new Date(p.expires_at).getTime() > now)
    const promo = calculateQuantityDiscount(
      validatedItems.map((i) => ({ productId: i.productId, priceUsd: i.priceUsd, quantity: i.quantity })),
      active
    )
    quantityDiscountUsd = Math.round(promo.discountUsd * 100) / 100
    quantityPromotionName = promo.appliedPromotion?.name ?? null
  }

  const discountUsd = Math.round((couponDiscountUsd + quantityDiscountUsd) * 100) / 100
  const total = Math.round(Math.max(0, subtotal - discountUsd + shipping) * 100) / 100

  return {
    ok: true, validatedItems, subtotal, shipping, discountUsd, couponDiscountUsd, quantityDiscountUsd,
    quantityPromotionName, total, couponId, isExpress, warnings,
  }
}
