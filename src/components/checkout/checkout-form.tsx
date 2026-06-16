"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { RazorpayButton } from "./razorpay-button"
import { PayPalCheckout } from "./paypal-button"
import { createClient } from "@/lib/supabase/client"

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
  "India", "Japan", "Netherlands", "Spain", "Italy", "Belgium", "Sweden", "Norway",
  "Denmark", "Finland", "Switzerland", "Austria", "Poland", "Czech Republic",
  "New Zealand", "Singapore", "UAE", "South Africa", "Brazil", "Mexico", "Argentina", "Other",
]

type FormData = {
  fullName: string; email: string; phone: string; address1: string; address2: string
  city: string; state: string; postalCode: string; country: string; notes: string
}

const INITIAL: FormData = {
  fullName: "", email: "", phone: "", address1: "", address2: "",
  city: "", state: "", postalCode: "", country: "United States", notes: "",
}

export function CheckoutForm() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const subtotalUsd = useCartStore((s) => s.subtotalUsd())
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const clearCart = useCartStore((s) => s.clearCart)
  const { format, currency } = useCurrency()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [mounted, setMounted] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [processingState, setProcessingState] = useState<"verifying" | "recording" | "redirecting" | null>(null)
  const [dbRates, setDbRates] = useState<any[]>([])
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard")

  useEffect(() => {
    setMounted(true)
    fetch("/api/shipping-rates")
      .then((r) => r.json())
      .then(({ rates }) => {
        if (rates && rates.length > 0) setDbRates(rates)
      })
      .catch(() => {})

    // Set default shipping method: express if any US Warehouse item is in cart
    const hasUsa = items.some((item) => item.shipsFromUsa)
    setShippingMethod(hasUsa ? "express" : "standard")

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      try {
        // Fetch user profile info
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single()

        // Fetch addresses via our secure API route (RLS-proof)
        const res = await fetch("/api/addresses")
        const data = await res.json()
        const allAddresses = data.addresses || []

        if (allAddresses.length > 0) {
          setSavedAddresses(allAddresses)
        }

        // Define address using the default address or fallback to the first saved address
        const address = allAddresses.find((a: any) => a.is_default) || allAddresses[0]
        if (address) {
          setSelectedAddressId(address.id)
        }

        setForm((prev) => ({
          ...prev,
          fullName: profile?.full_name || prev.fullName,
          email: user.email || prev.email,
          phone: profile?.phone || prev.phone || "",
          address1: address?.line1 || prev.address1,
          address2: address?.line2 || prev.address2,
          city: address?.city || prev.city,
          state: address?.state || prev.state,
          postalCode: address?.postal_code || prev.postalCode,
          country: address?.country || prev.country,
        }))
      } catch (err) {
        console.error("Failed to load user address for checkout:", err)
      }
    })
  }, [])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formValidated, setFormValidated] = useState(false)

  // Find matching shipping rate for selected country name
  const activeRate = dbRates.find(
    (r) => r.country_name.toLowerCase() === form.country.toLowerCase()
  )
  // Fallback to "Rest of World" / "OTHER" if country doesn't match
  const fallbackRate = dbRates.find((r) => r.country_code === "OTHER")
  const selectedRate = activeRate ?? fallbackRate

  const standardPrice = selectedRate ? Number(selectedRate.standard_price) : 14.99
  const expressPrice = selectedRate ? Number(selectedRate.express_price) : 35.00
  const freeThreshold = selectedRate ? Number(selectedRate.free_threshold) : 150

  const standardDays = selectedRate ? selectedRate.standard_days : "5-10"
  const expressDays = selectedRate ? selectedRate.express_days : "1-3"

  const isExpress = shippingMethod === "express"
  
  // Support free shipping coupons
  const freeShipping = subtotalUsd >= freeThreshold || appliedCoupon?.type === "free_shipping"

  const standardCost = freeShipping ? 0 : standardPrice
  const expressCost = expressPrice

  const shipping = isExpress ? expressCost : standardCost
  
  // Support percent or fixed coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? subtotalUsd * (appliedCoupon.value / 100)
      : appliedCoupon.type === "fixed"
        ? appliedCoupon.value
        : 0
    : 0

  const totalUsd = Math.max(0, subtotalUsd - couponDiscount + shipping)
  const shippingNote = shipping === 0 ? "Free" : format(shipping)

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-canvas border border-khaki/30 p-8 rounded-sm text-center">
        <div className="w-10 h-10 border-2 border-leather border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-sans text-leather/70">Preparing secure checkout...</p>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormValidated(false)
    if (["address1", "address2", "city", "state", "postalCode", "country"].includes(e.target.name)) {
      setSelectedAddressId("")
    }
  }

  function validateForm(): boolean {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in all contact information fields.")
      return false
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setError("Please enter a valid email address.")
      return false
    }
    if (!PHONE_RE.test(form.phone.trim())) {
      setError("Please enter a valid phone number (digits, spaces, dashes, with optional country code).")
      return false
    }
    if (!form.address1.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setError("Please fill in all address fields.")
      return false
    }
    if (form.postalCode.trim().length < 3 || form.postalCode.trim().length > 10) {
      setError("Please enter a valid postal code (3–10 characters).")
      return false
    }
    if (items.length === 0) {
      setError("Your cart is empty.")
      return false
    }
    setError(null)
    setFormValidated(true)
    return true
  }

  async function createOrder(paymentDetails?: { paymentMethod: "razorpay" | "paypal"; paymentIntentId: string; status: string }): Promise<{ orderId: string; orderNumber: string } | null> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: form,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        shippingMethod,
        couponCode: appliedCoupon?.code || null,
        ...paymentDetails,
      }),
    })
    if (!res.ok) return null
    return res.json()
  }

  function handlePaymentSuccess(paymentId: string, paymentMethod: "razorpay" | "paypal" = "razorpay") {
    setProcessingState("recording")
    createOrder({
      paymentMethod,
      paymentIntentId: paymentId,
      status: "confirmed",
    }).then((order) => {
      if (!order) {
        setProcessingState(null)
        setError("Payment received but order recording failed. Please contact support@warcraftexports.com with your payment ID: " + paymentId)
        return
      }
      setProcessingState("redirecting")
      clearCart()
      setTimeout(() => {
        router.push(`/checkout/success?order_id=${order.orderId}&payment_id=${paymentId}`)
      }, 300)
    })
  }

  function handlePaymentError(msg?: string) {
    setError(msg || "Payment was not completed. Please try again or contact support.")
  }

  function handlePaymentButtonClick() {
    return validateForm()
  }

  // Also support submit (COD / manual order)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    setProcessingState("recording")
    setError(null)
    try {
      const order = await createOrder()
      if (!order) throw new Error("Order failed")
      setProcessingState("redirecting")
      clearCart()
      setTimeout(() => {
        router.push(`/checkout/success?order_id=${order.orderId}`)
      }, 300)
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
      setProcessingState(null)
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki/70"
  const labelClass = "block text-xs font-sans font-semibold uppercase tracking-wider text-leather-dark mb-1"

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot — invisible to real users, filled by bots */}
      <input type="text" name="honeypot" tabIndex={-1} aria-hidden="true" className="hidden" readOnly value="" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* LEFT: Form */}
        <div className="lg:col-span-3 flex flex-col gap-8">

          <section className="bg-canvas border border-khaki/40 rounded-sm p-6">
            <h2 className="font-heading text-lg text-leather-dark mb-5">Contact Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="fullName" className={labelClass}>Full Name *</label>
                <input id="fullName" name="fullName" type="text" required maxLength={100} value={form.fullName} onChange={handleChange} placeholder="John Smith" className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email *</label>
                <input id="email" name="email" type="email" required maxLength={254} value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone *</label>
                <input id="phone" name="phone" type="tel" required maxLength={20} value={form.phone} onChange={handleChange} placeholder="+1 or +91 — include country code" className={inputClass} />
              </div>
            </div>
          </section>

          <section className="bg-canvas border border-khaki/40 rounded-sm p-6">
            <h2 className="font-heading text-lg text-leather-dark mb-5">Shipping Address</h2>
            <div className="flex flex-col gap-4">
              {savedAddresses.length > 0 && (
                <div className="bg-parchment/60 p-3 border border-khaki/30">
                  <label htmlFor="savedAddressSelect" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-leather mb-1.5">
                    Use Saved Address
                  </label>
                  <select
                    id="savedAddressSelect"
                    className="w-full px-3 py-2 text-xs font-sans bg-canvas border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark"
                    onChange={(e) => {
                      const addrId = e.target.value
                      setSelectedAddressId(addrId)
                      const addr = savedAddresses.find((a) => a.id === addrId)
                      if (addr) {
                        setForm((prev) => ({
                          ...prev,
                          fullName: addr.full_name || prev.fullName,
                          address1: addr.line1 || "",
                          address2: addr.line2 || "",
                          city: addr.city || "",
                          state: addr.state || "",
                          postalCode: addr.postal_code || "",
                          country: addr.country || "United States",
                        }))
                      }
                    }}
                    value={selectedAddressId}
                  >
                    <option value="">Choose an address...</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label ? `${addr.label}: ` : ""}{addr.line1}, {addr.city} ({addr.country})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="address1" className={labelClass}>Address Line 1 *</label>
                <input id="address1" name="address1" type="text" required maxLength={200} value={form.address1} onChange={handleChange} placeholder="123 Main Street" className={inputClass} />
              </div>
              <div>
                <label htmlFor="address2" className={labelClass}>Address Line 2</label>
                <input id="address2" name="address2" type="text" maxLength={200} value={form.address2} onChange={handleChange} placeholder="Apt, Suite, Unit (optional)" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className={labelClass}>City *</label>
                  <input id="city" name="city" type="text" required maxLength={100} value={form.city} onChange={handleChange} placeholder="City" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>State / Province *</label>
                  <input id="state" name="state" type="text" required maxLength={100} value={form.state} onChange={handleChange} placeholder="State" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className={labelClass}>Postal Code *</label>
                  <input id="postalCode" name="postalCode" type="text" required maxLength={10} value={form.postalCode} onChange={handleChange} placeholder="12345" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>Country *</label>
                  <select id="country" name="country" required value={form.country} onChange={handleChange} className={inputClass}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-canvas border border-khaki/40 rounded-sm p-6 animate-custom-fade-in">
            <h2 className="font-heading text-[20px] text-leather-dark uppercase tracking-wide mb-5">03. Shipping Method</h2>
            <div className="flex flex-col gap-4">
              {/* Standard option */}
              <div 
                className={`flex items-center justify-between p-4 border rounded-sm cursor-pointer transition-all bg-parchment/30 select-none ${
                  shippingMethod === "standard" 
                    ? "border-leather bg-parchment/70 ring-1 ring-leather" 
                    : "border-khaki/60 hover:border-leather"
                }`}
                onClick={() => setShippingMethod("standard")}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-4 h-4 rounded-full border border-leather flex items-center justify-center bg-canvas flex-shrink-0">
                    {shippingMethod === "standard" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-leather" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="block text-[13px] font-sans font-bold text-leather-dark uppercase tracking-wider">
                      Standard Shipping (International Dispatch)
                    </span>
                    <span className="block text-[11px] font-sans text-khaki uppercase tracking-widest mt-1">
                      {standardDays} Business Days
                    </span>
                  </div>
                </div>
                <span className="text-[13px] font-sans font-bold text-leather-dark flex-shrink-0">
                  {standardCost === 0 ? "FREE" : format(standardCost)}
                </span>
              </div>

              {/* Express option */}
              <div 
                className={`flex items-center justify-between p-4 border rounded-sm cursor-pointer transition-all bg-parchment/30 select-none ${
                  shippingMethod === "express" 
                    ? "border-leather bg-parchment/70 ring-1 ring-leather" 
                    : "border-khaki/60 hover:border-leather"
                }`}
                onClick={() => setShippingMethod("express")}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-4 h-4 rounded-full border border-leather flex items-center justify-center bg-canvas flex-shrink-0">
                    {shippingMethod === "express" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-leather" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="block text-[13px] font-sans font-bold text-leather-dark uppercase tracking-wider">
                      Express Shipping (US Warehouse Stock - Expedited)
                    </span>
                    <span className="block text-[11px] font-sans text-khaki uppercase tracking-widest mt-1">
                      {expressDays} Business Days
                    </span>
                  </div>
                </div>
                <span className="text-[13px] font-sans font-bold text-leather-dark flex-shrink-0">
                  {format(expressCost)}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-canvas border border-khaki/40 rounded-sm p-6">
            <h2 className="font-heading text-lg text-leather-dark mb-5">Order Notes</h2>
            <div>
              <label htmlFor="notes" className={labelClass}>Notes (optional)</label>
              <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Special instructions, customisation requests, etc." className={`${inputClass} resize-none`} />
            </div>
          </section>

          {/* Payment */}
          <section className="bg-canvas border border-khaki/40 rounded-sm p-6">
            <h2 className="font-heading text-lg text-leather-dark mb-1">Payment</h2>
            <p className="text-xs font-sans text-khaki mb-5">
              Your payment is processed securely. Amount charged in{" "}
              <span className="font-bold text-leather">{currency}</span>.
            </p>

            {error && (
              <div className="mb-4 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 rounded-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* PayPal - Priority Global Payment Method */}
              <div onClick={() => { if (!handlePaymentButtonClick()) return }}>
                <PayPalCheckout
                  totalUsd={totalUsd}
                  currency={currency}
                  customerName={form.fullName}
                  customerEmail={form.email}
                  customerPhone={form.phone}
                  customerAddress={form}
                  onSuccess={(paymentId) => handlePaymentSuccess(paymentId, "paypal")}
                  onError={handlePaymentError}
                />
              </div>

              {/* Razorpay - Local Indian / UPI Alternative */}
              <div onClick={() => { if (!handlePaymentButtonClick()) return }}>
                <div className="w-full border border-khaki/40 bg-canvas rounded-sm overflow-hidden shadow-sm relative z-0">
                  {/* Tab Header styled in Warcraft Heritage scheme */}
                  <div className="flex border-b border-khaki/40">
                    <div className="flex-1 py-3 text-center text-xs font-sans font-bold uppercase tracking-wider bg-parchment text-leather-dark border-b-2 border-b-leather">
                      Razorpay (Cards / UPI / NetBanking)
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-[11px] font-sans text-khaki leading-relaxed">
                      Pay securely using your credit/debit cards, net banking, wallets, or UPI / QR code.
                    </p>
                    <RazorpayButton
                      totalUsd={totalUsd}
                      currency={currency}
                      customerName={form.fullName}
                      customerEmail={form.email}
                      customerPhone={form.phone}
                      onSuccess={(paymentId) => handlePaymentSuccess(paymentId, "razorpay")}
                      onError={handlePaymentError}
                      onProcessing={setProcessingState}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-sans text-khaki text-center mt-4">
              Taxes and duties may apply on import — buyer is responsible.
            </p>
          </section>
        </div>

        {/* RIGHT: Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-canvas border border-khaki/40 rounded-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg text-leather-dark">Order Summary</h3>
              <Link href="/cart" className="text-xs font-sans text-leather/70 hover:text-leather transition-colors underline underline-offset-2">
                Edit Cart
              </Link>
            </div>

            {items.length === 0 ? (
              <p className="text-sm font-sans text-khaki">Your cart is empty.</p>
            ) : (
              <div className="divide-y divide-khaki/30">
                {items.map((item) => {
                  const key = `${item.productId}__${item.variantId ?? "none"}`
                  return (
                    <div key={key} className="flex gap-3 py-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-parchment rounded-sm overflow-hidden border border-khaki/30">
                        {item.heroImage ? (
                          <Image src={item.heroImage} alt={item.productName} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={16} className="text-khaki" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans font-semibold text-leather-dark line-clamp-2">{item.productName}</p>
                        {item.variantLabel && <p className="text-[10px] font-sans text-khaki">{item.variantLabel}</p>}
                        <p className="text-xs font-sans text-leather mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-sans font-semibold text-leather-dark flex-shrink-0">
                        {format(item.priceUsd * item.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t border-khaki/40 pt-4 mt-4 flex flex-col gap-2 text-sm font-sans">
              <div className="flex justify-between text-leather-dark">
                <span>Subtotal</span>
                <span>{format(subtotalUsd)}</span>
              </div>
              
              {/* Coupon discount line */}
              {appliedCoupon && (
                <div className="flex justify-between text-green-700 text-xs">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>
                    {appliedCoupon.type === "free_shipping"
                      ? "Free Shipping"
                      : `−${format(couponDiscount)}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-khaki text-xs">
                <span>Shipping</span>
                <span>{shippingNote}</span>
              </div>
              <div className="border-t border-khaki/40 pt-2 mt-1 flex justify-between font-semibold text-leather-dark text-base">
                <span>Total</span>
                <span>{format(totalUsd)}</span>
              </div>
              <p className="text-[10px] font-sans text-khaki text-center mt-1">
                Prices shown in {currency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped keyframes and transition styling for full-screen loading */}
      <style>{`
        @keyframes customFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-custom-fade-in {
          animation: customFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Premium Full-Screen Processing Overlay */}
      {processingState && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1E140C]/95 backdrop-blur-md">
          <div className="flex flex-col items-center max-w-sm px-6 text-center animate-custom-fade-in">
            {/* Spinning Heraldic Ring Loader */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-khaki/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-leather border-r-leather animate-spin" />
              <div className="absolute inset-3 rounded-full border border-khaki/10 animate-pulse" />
            </div>

            <h3 className="font-heading text-lg text-parchment tracking-widest uppercase mb-2">
              Warcraft Exports
            </h3>
            
            <p className="text-xs font-sans text-khaki tracking-wider uppercase min-h-[16px] animate-pulse">
              {processingState === "verifying" && "Verifying payment transaction..."}
              {processingState === "recording" && "Forging order records..."}
              {processingState === "redirecting" && "Securing order success..."}
            </p>

            {/* Custom linear progress meter */}
            <div className="w-48 h-[3px] bg-khaki/15 mt-6 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-leather transition-all duration-300 rounded-full ${
                  processingState === "verifying" ? "w-1/3 animate-pulse" :
                  processingState === "recording" ? "w-2/3" : "w-full"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
