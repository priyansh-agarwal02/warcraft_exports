import type { Metadata } from "next"
import Link from "next/link"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Order Confirmed — Warcraft Exports" }

type SP = Promise<{ order_id?: string; payment_id?: string }>

// Calculate estimated arrival date range
function calculateEstimatedArrival(createdAtStr: string, standardDays: string): string {
  try {
    const createdDate = new Date(createdAtStr)
    const rangeParts = standardDays.split("-")
    if (rangeParts.length === 2) {
      const minDays = parseInt(rangeParts[0].trim(), 10)
      const maxDays = parseInt(rangeParts[1].trim(), 10)
      if (!isNaN(minDays) && !isNaN(maxDays)) {
        const minArrival = new Date(createdDate)
        minArrival.setDate(createdDate.getDate() + minDays)
        const maxArrival = new Date(createdDate)
        maxArrival.setDate(createdDate.getDate() + maxDays)
        
        const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
        const minStr = minArrival.toLocaleDateString("en-US", formatOptions)
        const maxStr = maxArrival.toLocaleDateString("en-US", formatOptions)
        return `${minStr} - ${maxStr}`
      }
    }
  } catch (e) {
    console.error("Failed to parse standard_days range:", e)
  }
  return "7-14 Business Days"
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SP }) {
  const { order_id, payment_id } = await searchParams
  let order = null
  let isOwner = false
  let shippingMethod = "Standard Shipping"
  let estimatedArrival = "7-14 Business Days"
  let formattedAddress = ""

  if (order_id) {
    const serviceClient = createServiceClient()
    const { data } = await serviceClient
      .from("orders")
      .select("id, order_number, total_usd, shipping_usd, created_at, customer_name, shipping_address, user_id, payment_intent_id, order_items(id, quantity, unit_price_usd, price_usd, product_snapshot, product:products(name, sku, images:product_images(url, is_hero)))")
      .eq("id", order_id)
      .single()
    
    if (data) {
      order = data

      // Verify ownership — only the order owner or customer with matching payment_intent_id sees the order
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        const isUserMatch = !!(user && (data as any).user_id && user.id === (data as any).user_id)
        const isPaymentMatch = !!(payment_id && (data as any).payment_intent_id && payment_id === (data as any).payment_intent_id)
        
        isOwner = isUserMatch || isPaymentMatch
      } catch {
        isOwner = false
      }
      
      // Format address string
      const addr = data.shipping_address as any
      if (addr) {
        const line1 = addr.address1 || ""
        const line2 = addr.address2 ? ` ${addr.address2}` : ""
        const cityStateZip = `${addr.city || ""}, ${addr.state || ""} ${addr.postalCode || ""}`.trim()
        const country = addr.country || ""
        formattedAddress = `${line1}${line2} ${cityStateZip} ${country}`.replace(/\s+/g, " ").trim()
      }

      // Fetch dynamic country-specific shipping rate details
      if (addr?.country) {
        const { data: rate } = await serviceClient
          .from("shipping_rates")
          .select("standard_days, standard_price, country_name")
          .eq("country_name", addr.country)
          .maybeSingle()
        
        // Fallback to "Rest of World" (OTHER) if country rate is not found
        let activeRate = rate
        if (!activeRate) {
          const { data: fallbackRate } = await serviceClient
            .from("shipping_rates")
            .select("standard_days, standard_price, country_name")
            .eq("country_code", "OTHER")
            .maybeSingle()
          activeRate = fallbackRate
        }

        if (activeRate) {
          const days = activeRate.standard_days
          const isFree = Number(data.shipping_usd) === 0
          shippingMethod = isFree
            ? `Free Standard Shipping (${days} Days)`
            : `Standard Shipping (${days} Days)`
          
          estimatedArrival = calculateEstimatedArrival(data.created_at, days)
        }
      }
    }
  }

  if (!order || !isOwner) {
    return (
      <div className="bg-parchment min-h-screen pt-24 pb-32 px-4 font-sans flex flex-col items-center justify-center text-center">
        <h1 className="font-serif font-extrabold text-[32px] text-[#33450D] uppercase mb-4 tracking-tight">
          Order Not Found
        </h1>
        <p className="font-serif text-[16px] text-[#45483C] max-w-[500px] mb-8 leading-relaxed">
          We could not locate the order details. Please check the order confirmation link in your email or view your orders history.
        </p>
        <Link 
          href="/shop" 
          className="bg-[#33450D] text-white font-sans font-bold text-[12px] px-8 py-4 uppercase tracking-[1.2px] hover:bg-[#4A5D23] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-parchment min-h-screen py-4 md:py-8 px-4 md:px-6 font-sans flex items-center justify-center">
      <div className="max-w-[1000px] mx-auto w-full">
        {/* Responsive Dual Column Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
          
          {/* Left Content Section */}
          <div className="flex-1 w-full lg:max-w-[600px] flex flex-col items-start z-10">
            
            {/* Success Icon & Header Stamp Container */}
            <div className="flex flex-row items-center gap-[12px] mb-[4px] flex-wrap">
              {/* Gold Check Box */}
              <div className="w-[38px] h-[34px] bg-[#BBAC48] flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Rotated Paid Badge */}
              <div className="flex items-center justify-center w-[80px] h-[40px] flex-shrink-0">
                <div className="box-sizing-border-box border-[2px] border-[#BBAC48] px-1.5 py-0.5 rotate-[-10deg] opacity-90 w-[74px] h-[28px] flex items-center justify-center">
                  <span className="font-sans font-black text-[12px] leading-[18px] tracking-[1px] text-[#BBAC48] uppercase select-none">
                    PAID
                  </span>
                </div>
              </div>
            </div>

            {/* Heading 1 */}
            <div className="flex flex-col items-start pb-[6px] w-full">
              <h1 className="font-serif font-extrabold text-[26px] md:text-[32px] leading-[30px] md:leading-[38px] tracking-[-0.96px] text-[#33450D] uppercase select-text">
                Order Confirmed
              </h1>
            </div>

            {/* Sub-paragraph Text */}
            <p className="font-serif font-normal text-[13px] md:text-[14px] leading-[20px] md:leading-[22px] text-[#45483C] pb-[12px] max-w-[520px]">
              Thank you for your order. We have received it and our team will begin processing shortly.
              You will receive a confirmation email within the next few minutes.
            </p>

            {/* Order Details Card */}
            <div className="relative w-full bg-white border-2 border-[#C6C8B8] p-3.5 md:p-4 mb-3 box-sizing-border-box h-auto flex flex-col md:flex-row gap-3 md:gap-0 select-text">
              
              {/* Corner Crosshairs */}
              <div className="absolute w-[20px] h-[20px] -left-[2px] -top-[2px] border-t-2 border-l-2 border-[#76786B] z-10" />
              <div className="absolute w-[20px] h-[20px] -right-[2px] -bottom-[2px] border-b-2 border-r-2 border-[#76786B] z-20" />

              {/* Left Column inside card: ORDER ID & DESTINATION */}
              <div className="flex-1 flex flex-col gap-3.5 md:pr-4">
                {/* ORDER ID */}
                <div className="flex flex-col gap-[2px]">
                  <span className="font-sans font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#76786B] uppercase">
                    ORDER ID
                  </span>
                  <span className="font-serif font-bold text-[16px] md:text-[18px] leading-[22px] text-[#1A1C1C]">
                    {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                
                {/* DESTINATION — only shown to order owner */}
                {isOwner && (
                  <div className="flex flex-col gap-1">
                    <span className="font-sans font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#76786B] uppercase">
                      DESTINATION
                    </span>
                    <div className="font-sans font-normal text-[13px] md:text-[14px] leading-[20px] text-[#1A1C1C]">
                      <strong className="block font-bold mb-0.5">{order.customer_name}</strong>
                      {formattedAddress}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column inside card: ESTIMATED ARRIVAL & SHIPPING METHOD */}
              <div className="flex-1 flex flex-col gap-3.5 md:border-l md:border-[#C6C8B8] md:pl-4">
                {/* ESTIMATED ARRIVAL */}
                <div className="flex flex-col gap-[2px]">
                  <span className="font-sans font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#76786B] uppercase">
                    ESTIMATED ARRIVAL
                  </span>
                  <span className="font-serif font-bold text-[16px] md:text-[18px] leading-[22px] text-[#BBAC48]">
                    {estimatedArrival}
                  </span>
                </div>
                
                {/* SHIPPING METHOD */}
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#76786B] uppercase">
                    SHIPPING METHOD
                  </span>
                  <p className="font-sans font-normal text-[13px] md:text-[14px] leading-[20px] text-[#1A1C1C]">
                    {shippingMethod}
                  </p>
                </div>
              </div>

            </div>

            {/* Ordered Items Summary Accordion/Box */}
            {order.order_items && Array.isArray(order.order_items) && (
              <div className="relative w-full bg-white/40 border border-[#C6C8B8] p-3 mb-3 box-sizing-border-box">
                {/* Visual mini-crosshairs for matching catalog aesthetic */}
                <div className="absolute w-[12px] h-[12px] -left-[1px] -top-[1px] border-t border-l border-[#76786B] z-10" />
                <div className="absolute w-[12px] h-[12px] -right-[1px] -bottom-[1px] border-b border-r border-[#76786B] z-20" />
                
                <h3 className="font-sans font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#76786B] uppercase mb-3">
                  ORDERED ITEMS
                </h3>
                
                <div className="space-y-2.5 max-h-[110px] overflow-y-auto pr-2 divide-y divide-[#C6C8B8]/20 select-text">
                  {(order.order_items as any[]).map((item, idx) => {
                    const img = item.product?.images?.find((i: any) => i.is_hero)?.url ?? item.product?.images?.[0]?.url
                    const productName = item.product?.name || item.product_snapshot?.name || "Product Item"
                    const productSku = item.product?.sku || item.product_snapshot?.sku || "N/A"
                    const itemTotal = (item.unit_price_usd ?? item.price_usd ?? 0) * item.quantity
                    return (
                      <div key={item.id} className={`flex items-center gap-3 ${idx > 0 ? "pt-3" : ""}`}>
                        {img ? (
                          <img 
                            src={img} 
                            alt={productName} 
                            className="w-9 h-9 object-cover bg-canvas border border-[#C6C8B8]/30 flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-9 h-9 bg-canvas border border-[#C6C8B8]/30 flex-shrink-0 flex items-center justify-center text-xs font-mono text-[#76786B]">
                            ITEM
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-bold text-[#1A1C1C] truncate">
                            {productName}
                          </p>
                          <p className="font-sans text-[11px] text-[#76786B] mt-0.5">
                            SKU: {productSku} &middot; Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-serif text-xs font-bold text-[#1A1C1C] flex-shrink-0 pl-2">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>
                
                {/* Total Cost Line */}
                <div className="border-t border-[#C6C8B8] mt-3 pt-3 flex justify-between items-center select-text">
                  <span className="font-sans font-bold text-[11px] tracking-[1.2px] text-[#76786B] uppercase">TOTAL PAID</span>
                  <span className="font-serif font-extrabold text-[16px] text-[#1A1C1C]">${(order.total_usd ?? 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-[12px] w-full max-w-[440px] mb-4 lg:mb-0">
              {/* Button 1: Continue Shopping */}
              <Link 
                href="/shop" 
                className="relative flex flex-row justify-center items-center gap-2 px-4 w-full sm:w-[200px] h-[42px] bg-[#33450D] text-white hover:bg-[#4A5D23] transition-all shadow-sm group flex-shrink-0"
              >
                <svg 
                  className="w-4 h-4 text-white transform group-hover:-translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-sans font-bold text-[12px] leading-[12px] text-center tracking-[1.2px] uppercase">
                  Continue Shopping
                </span>
              </Link>
              
              {/* Button 2: View My Orders */}
              <Link 
                href="/account/orders" 
                className="box-sizing-border-box flex flex-row justify-center items-center gap-2 px-4 w-full sm:w-[200px] h-[42px] border-2 border-[#566065] text-[#566065] hover:bg-[#566065] hover:text-white transition-all group flex-shrink-0"
              >
                <svg 
                  className="w-[15px] h-[15px] text-current transform group-hover:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-sans font-bold text-[12px] leading-[12px] text-center tracking-[1.2px] uppercase">
                  View My Orders
                </span>
              </Link>
            </div>

          </div>

          {/* Right Column: Historical Visual Sidebar */}
          <div className="w-full lg:w-[300px] flex-shrink-0 flex justify-center lg:justify-end lg:mt-[36px] z-20">
            {/* Polaroid Vintage Container */}
            <div className="relative w-full max-w-[300px] bg-white p-[4px] pb-[6px] border-4 border-white shadow-[0px_15px_30px_-10px_rgba(0,0,0,0.2)] rotate-[2deg] hover:rotate-[1deg] hover:scale-[1.01] transition-all duration-500 overflow-hidden select-none">
              
              {/* Image with saturations / filters */}
              <div className="relative w-full aspect-[477/266] bg-[#EEEEEE] overflow-hidden">
                <img 
                  src="/hero/hero-3.jpeg" 
                  alt="Warcraft Exports Historical Archive photo" 
                  className="w-full h-full object-cover filter saturate-[0.12] contrast-[1.1] sepia-[0.35]"
                />
                {/* Gold multiplication overlay */}
                <div className="absolute inset-0 bg-[#6A5F00]/10 mix-blend-multiply pointer-events-none" />
              </div>

              {/* Blurred Caption Panel at bottom */}
              <div className="relative mt-2 bg-black/85 border-t border-white/20 backdrop-blur-[2px] p-3 text-white flex flex-col justify-center min-h-[75px]">
                <p className="font-serif italic font-normal text-[11px] md:text-[12px] leading-[16px] text-white">
                  "Official Registry of Warcraft Exports, Importation Division"
                </p>
                <p className="font-serif italic font-normal text-[11px] md:text-[12px] leading-[16px] text-white/90">
                  "Certified shipment of vintage materials and armor components."
                </p>
                <p className="font-serif italic font-normal text-[10px] leading-[16px] text-white/55 mt-0.5 uppercase tracking-wider">
                  Ledger Entry: {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
