"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, X, Minus, Plus, Tag, Truck, Percent } from "lucide-react"
import { useCartStore } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { useState, useEffect, useMemo } from "react"
import { calculateQuantityDiscount, type QuantityPromotion } from "@/lib/promotions"
import { validateCouponAction } from "@/app/actions/coupon"

const SHIPPING_RATES: Record<string, { label: string; price: number; days: string }> = {
  US: { label: "United States", price: 14.99, days: "7–14 business days" },
  GB: { label: "United Kingdom", price: 12.99, days: "8–14 business days" },
  DE: { label: "Germany", price: 12.99, days: "8–14 business days" },
  AU: { label: "Australia", price: 16.99, days: "10–20 business days" },
  JP: { label: "Japan", price: 16.99, days: "10–18 business days" },
  CA: { label: "Canada", price: 14.99, days: "8–16 business days" },
  FR: { label: "France", price: 12.99, days: "8–14 business days" },
  OTHER: { label: "Rest of World", price: 19.99, days: "12–25 business days" },
}

const FREE_SHIPPING_THRESHOLD = 150

// Demo coupon codes (in real app, validate server-side)
const VALID_COUPONS: Record<string, { type: "percent" | "fixed"; value: number }> = {
  WELCOME10: { type: "percent", value: 10 },
  SAVE15: { type: "fixed", value: 15 },
  WARCRAFT20: { type: "percent", value: 20 },
}

export function CartView() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotalUsd = useCartStore((s) => s.subtotalUsd())
  const { format } = useCurrency()

  const [selectedCountry, setSelectedCountry] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const setAppliedCoupon = useCartStore((s) => s.setAppliedCoupon)
  const [couponError, setCouponError] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [promotions, setPromotions] = useState<QuantityPromotion[]>([])
  const [promoBannerDismissed, setPromoBannerDismissed] = useState(false)
  const [dbRates, setDbRates] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/shipping-rates")
      .then((r) => r.json())
      .then(({ rates }) => {
        if (rates && rates.length > 0) setDbRates(rates)
      })
      .catch(() => {})
  }, [])

  // Fetch active quantity promotions on mount
  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(({ promotions: data }) => setPromotions(data ?? []))
      .catch(() => {})
  }, [])

  const activeRate = dbRates.find((r) => r.country_code === selectedCountry)
  const shippingRate = selectedCountry ? {
    label: activeRate ? activeRate.country_name : (SHIPPING_RATES[selectedCountry]?.label ?? "Rest of World"),
    price: activeRate ? Number(activeRate.standard_price) : (SHIPPING_RATES[selectedCountry]?.price ?? 19.99),
    days: activeRate ? `${activeRate.standard_days} business days` : (SHIPPING_RATES[selectedCountry]?.days ?? "12–25 business days"),
    freeThreshold: activeRate ? Number(activeRate.free_threshold) : 150
  } : null

  const freeShipping = shippingRate ? (subtotalUsd >= shippingRate.freeThreshold || appliedCoupon?.type === "free_shipping") : false
  const shippingCost = shippingRate ? (freeShipping ? 0 : shippingRate.price) : null

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? subtotalUsd * (appliedCoupon.value / 100)
      : appliedCoupon.type === "fixed"
        ? appliedCoupon.value
        : 0
    : 0

  // Quantity promotion discount — recalculated whenever cart items or promotions change
  const { discountUsd: quantityDiscount, appliedPromotion, nextPromotion, itemsNeededForNext } = useMemo(
    () => calculateQuantityDiscount(
      items.map((i) => ({ productId: i.productId, priceUsd: i.priceUsd, quantity: i.quantity })),
      promotions
    ),
    [items, promotions]
  )

  const totalDiscount = couponDiscount + quantityDiscount
  const total = subtotalUsd - totalDiscount + (shippingCost ?? 0)

  // Total quantity in cart for promotion progress display
  const totalCartQty = items.reduce((s, i) => s + i.quantity, 0)

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const res = await validateCouponAction(couponCode, subtotalUsd)
      if (res.success && res.coupon) {
        setAppliedCoupon({
          id: res.coupon.id,
          code: res.coupon.code,
          type: res.coupon.type,
          value: res.coupon.value,
        })
        setCouponError("")
      } else {
        setCouponError(res.error || "Invalid coupon code.")
        setAppliedCoupon(null)
      }
    } catch (err) {
      setCouponError("Failed to apply coupon. Please try again.")
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <ShoppingBag size={64} className="text-khaki" />
        <div>
          <h2 className="font-heading text-2xl text-leather-dark mb-2">Your cart is empty</h2>
          <p className="text-sm font-sans text-khaki">
            Browse our collection of historical reproduction gear.
          </p>
        </div>
        {/* Show active promotions even on empty cart */}
        {promotions.length > 0 && (
          <div className="bg-[#33450D]/8 border border-[#33450D]/20 px-6 py-4 text-center max-w-md">
            <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-[#33450D] mb-2">Quantity Discounts Available</p>
            <div className="flex flex-wrap justify-center gap-2">
              {promotions.map((p) => (
                <span key={p.id} className="bg-[#33450D] text-white text-[11px] font-sans font-bold px-3 py-1 rounded-full">
                  Buy {p.min_quantity}+ · Save {p.discount_percent}%
                </span>
              ))}
            </div>
          </div>
        )}
        <Link
          href="/shop"
          className="inline-block py-3 px-8 bg-leather text-parchment text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Cart items */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="font-heading text-xl text-leather-dark">
          Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h2>

        {/* ── Quantity Promotion Disclaimer Banner ─────────────────────── */}
        {promotions.length > 0 && !promoBannerDismissed && (
          <div className="relative bg-[#33450D] text-white px-4 py-3">
            <button
              onClick={() => setPromoBannerDismissed(true)}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <Percent size={16} className="text-white/80 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] mb-1.5">
                  Quantity Discounts — Auto-Applied
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {promotions.map((p) => {
                    const qualifying = p.applies_to === "all"
                      ? items
                      : items.filter((i) => p.product_ids.includes(i.productId))
                    const qty = qualifying.reduce((s, i) => s + i.quantity, 0)
                    const met = qty >= p.min_quantity
                    return (
                      <span key={p.id} className={`text-[12px] font-sans flex items-center gap-1.5 ${met ? "text-white font-bold" : "text-white/70"}`}>
                        {met ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center text-[9px]">✓</span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center text-[9px] text-white/60">{p.min_quantity - qty}</span>
                        )}
                        Buy {p.min_quantity}+ save {p.discount_percent}%
                      </span>
                    )
                  })}
                </div>
                {/* Motivational nudge */}
                {appliedPromotion && nextPromotion && itemsNeededForNext > 0 && (
                  <p className="text-[11px] font-sans mt-1.5 text-white/90">
                    🎉 {appliedPromotion.discount_percent}% off applied! Add {itemsNeededForNext} more item{itemsNeededForNext > 1 ? "s" : ""} to upgrade to {nextPromotion.discount_percent}% off.
                  </p>
                )}
                {appliedPromotion && !nextPromotion && (
                  <p className="text-[11px] font-sans mt-1.5 text-white/90">
                    🎉 {appliedPromotion.discount_percent}% off applied — best tier unlocked!
                  </p>
                )}
                {!appliedPromotion && promotions.length > 0 && (
                  <p className="text-[11px] font-sans mt-1.5 text-white/80">
                    Add {Math.max(0, promotions[0].min_quantity - totalCartQty)} more item{promotions[0].min_quantity - totalCartQty !== 1 ? "s" : ""} to unlock {promotions[0].discount_percent}% off your order.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-khaki/40">
          {items.map((item) => {
            const lineTotal = item.priceUsd * item.quantity
            const key = `${item.productId}__${item.variantId ?? "none"}`

            return (
              <div key={key} className="flex gap-4 py-4">
                <div className="flex-shrink-0 w-20 h-20 bg-canvas rounded-sm overflow-hidden border border-khaki/30">
                  {item.heroImage ? (
                    <Image src={item.heroImage} alt={item.productName} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} className="text-khaki" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`} className="font-sans font-semibold text-sm text-leather-dark hover:text-leather transition-colors line-clamp-2">
                    {item.productName}
                  </Link>
                  {item.variantLabel && <p className="text-xs font-sans text-khaki mt-0.5">{item.variantLabel}</p>}
                  <p className="text-sm font-sans text-leather mt-1">{format(item.priceUsd)}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                  <button onClick={() => removeItem(item.productId, item.variantId)} className="text-leather/50 hover:text-red-600 transition-colors" aria-label="Remove item">
                    <X size={16} />
                  </button>
                  <div className="flex items-center border border-khaki rounded-sm">
                    <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 flex items-center justify-center text-leather-dark hover:bg-parchment-dark transition-colors disabled:opacity-40">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-sans text-leather-dark select-none">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} disabled={item.quantity >= item.maxQuantity} className="w-7 h-7 flex items-center justify-center text-leather-dark hover:bg-parchment-dark transition-colors disabled:opacity-40">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-sans font-semibold text-leather-dark">{format(lineTotal)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Shipping Estimate */}
        <div className="border border-khaki/40 p-5 bg-canvas/50">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={16} className="text-leather" />
            <h3 className="font-sans font-bold text-sm text-leather-dark uppercase tracking-[0.1em]">Estimate Shipping</h3>
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-khaki/60 bg-parchment px-3 py-2.5 font-sans text-sm text-leather-dark focus:outline-none focus:border-leather mb-3"
          >
            <option value="">Select country…</option>
            {dbRates.length > 0
              ? dbRates
                  .filter((r) => r.country_code !== "OTHER")
                  .map((r) => (
                    <option key={r.id} value={r.country_code}>
                      {r.country_name}
                    </option>
                  ))
              : Object.entries(SHIPPING_RATES)
                  .filter(([k]) => k !== "OTHER")
                  .map(([code, rate]) => (
                    <option key={code} value={code}>
                      {rate.label}
                    </option>
                  ))}
            <option value="OTHER">Other Country</option>
          </select>
          {shippingRate && (
            <div className="text-xs font-sans space-y-1">
              <div className="flex justify-between text-leather-dark">
                <span>Estimated shipping to {shippingRate.label}</span>
                <span className="font-bold">{freeShipping ? "FREE" : format(shippingRate.price)}</span>
              </div>
              <p className="text-khaki">{shippingRate.days}</p>
              {!freeShipping && shippingRate && (
                <p className="text-leather/70">
                  Add {format(shippingRate.freeThreshold - subtotalUsd)} more for free shipping
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="bg-canvas border border-khaki/40 rounded-sm p-6 sticky top-24">
          <h3 className="font-heading text-lg text-leather-dark mb-4">Order Summary</h3>

          <div className="flex flex-col gap-2 text-sm font-sans">
            <div className="flex justify-between text-leather-dark">
              <span>Subtotal</span>
              <span>{format(subtotalUsd)}</span>
            </div>

            {/* Quantity promotion discount line */}
            {quantityDiscount > 0 && appliedPromotion && (
              <div className="flex justify-between text-[#33450D] font-medium">
                <span className="flex items-center gap-1">
                  <Percent size={12} />
                  {appliedPromotion.discount_percent}% Qty Discount
                </span>
                <span>−{format(quantityDiscount)}</span>
              </div>
            )}

            {/* Coupon discount line */}
            {appliedCoupon && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({appliedCoupon.code})</span>
                <span>
                  {appliedCoupon.type === "free_shipping"
                    ? "Free Shipping"
                    : `−${format(couponDiscount)}`}
                </span>
              </div>
            )}

            <div className="flex justify-between text-khaki">
              <span>Shipping</span>
              <span>{shippingCost !== null ? (shippingCost === 0 ? "FREE" : format(shippingCost)) : "Calculated at checkout"}</span>
            </div>
            <div className="border-t border-khaki/40 pt-2 mt-2 flex justify-between font-semibold text-leather-dark text-base">
              <span>Total</span>
              <span>{format(total)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="text-center text-[11px] font-sans font-bold text-[#33450D] bg-[#33450D]/8 px-2 py-1.5">
                You save {format(totalDiscount)} on this order
              </div>
            )}
          </div>

          {/* Next promotion nudge in summary panel */}
          {nextPromotion && itemsNeededForNext > 0 && promotions.length > 0 && (
            <div className="mt-3 bg-[#33450D]/8 border border-[#33450D]/20 px-3 py-2 text-[11px] font-sans text-[#33450D]">
              Add <strong>{itemsNeededForNext}</strong> more item{itemsNeededForNext !== 1 ? "s" : ""} to unlock <strong>{nextPromotion.discount_percent}% off</strong>
            </div>
          )}

          {/* Coupon Code */}
          <div className="mt-4 border-t border-khaki/40 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-leather" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-leather-dark">Coupon Code</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 text-xs font-sans">
                <span className="text-green-700 font-bold">{appliedCoupon.code} applied!</span>
                <button onClick={removeCoupon} className="text-green-600 hover:text-red-600 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError("") }}
                    placeholder="Enter code"
                    className="flex-1 border border-khaki/60 bg-parchment/60 px-3 py-2 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="bg-leather text-parchment font-sans font-bold text-[11px] uppercase tracking-[0.1em] px-4 hover:bg-leather-dark transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
              </>
            )}
          </div>

          <p className="text-[10px] font-sans text-khaki mt-3">
            Taxes and duties may apply on import — buyer is responsible.
          </p>

          <Link
            href="/checkout"
            className="mt-5 block w-full py-3 px-6 bg-leather text-parchment text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors text-center"
          >
            Proceed to Checkout
          </Link>

          <Link href="/shop" className="mt-3 block text-center text-sm font-sans text-leather/70 hover:text-leather transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
