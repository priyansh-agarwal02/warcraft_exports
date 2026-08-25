import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OrderFulfillmentManager } from "@/components/admin/order-fulfillment-manager"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Order Detail — Warcraft Exports Admin" }
type Props = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order } = await supabase
    .from("orders")
    .select(`id, order_number, notes, customer_name, customer_email, customer_phone, payment_method, payment_intent_id, status, total_usd, subtotal_usd, shipping_usd, discount_usd, tax_usd, created_at, tracking_number, tracking_url, shipping_address, shipped_email_sent_at, delivered_email_sent_at, cancelled_email_sent_at, cancellation_reason, cancellation_requested, customer_cancellation_reason, cancellation_request_status, cancellation_rejection_reason,
      order_items(id, quantity, unit_price_usd, product:products(name, sku, slug, ships_from_usa, images:product_images(url, is_hero)))`)
    .eq("id", id)
    .single()

  if (!order) notFound()

  // Compute items & check if any item is US Warehouse stocked
  const items = Array.isArray(order.order_items)
    ? (order.order_items as unknown as {
        id: string
        quantity: number
        unit_price_usd: number
        product: { name: string; sku: string; slug: string; ships_from_usa?: boolean; images: { url: string; is_hero: boolean }[] } | null
      }[])
    : []

  const hasUsWarehouseItem = items.some((item) => item.product?.ships_from_usa)

  // Fetch dynamic country-specific shipping rate details
  const shippingAddress = order.shipping_address as {
    address1?: string
    address2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  } | null

  let standardDaysFromRate: string | null = null
  if (shippingAddress?.country) {
    const { data: rate } = await supabase
      .from("shipping_rates")
      .select("standard_days")
      .eq("country_name", shippingAddress.country)
      .maybeSingle()

    if (rate?.standard_days) {
      standardDaysFromRate = rate.standard_days
    } else {
      const { data: fallback } = await supabase
        .from("shipping_rates")
        .select("standard_days")
        .eq("country_code", "OTHER")
        .maybeSingle()
      if (fallback?.standard_days) standardDaysFromRate = fallback.standard_days
    }
  }

  const { computeShippingInfo } = await import("@/lib/shipping-utils")
  const shippingInfo = computeShippingInfo({
    createdAtStr: order.created_at,
    shippingUsd: (order.shipping_usd as number) ?? 0,
    notes: order.notes,
    standardDaysFromRate,
    hasUsWarehouseItem,
  })

  const subtotal = order.subtotal_usd ?? items.reduce((sum, i) => sum + i.unit_price_usd * i.quantity, 0)
  const shippingCost = (order.shipping_usd as number) ?? 0
  const discountCost = (order.discount_usd as number) ?? 0

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-[12px] font-sans font-bold text-[#71717A] hover:text-[#18181B] uppercase tracking-wide">← Orders</Link>
        <span className="text-[#D4D4D8]">/</span>
        <h1 className="font-heading text-[22px] text-[#18181B] uppercase tracking-tight flex items-center gap-3">
          <span>Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</span>
          <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-sans font-bold uppercase tracking-wider ${
            order.status === "shipped" ? "bg-blue-100 text-blue-800" :
            order.status === "delivered" ? "bg-green-100 text-green-800" :
            order.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
          }`}>
            {order.status ?? "confirmed"}
          </span>
        </h1>
      </div>

      {/* Structured 60/40 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (60% Width - Main Details) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Order Items & US Warehouse Badges */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase font-black mb-4 border-b border-[#F4F4F4] pb-3">
              Order Items ({items.length})
            </h2>
            <div className="space-y-4">
              {items.map((item) => {
                const img = item.product?.images?.find((i) => i.is_hero)?.url ?? item.product?.images?.[0]?.url
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4F4F4] last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      {img ? (
                        <img src={img} alt={item.product?.name ?? ""} className="w-16 h-16 object-cover bg-[#F4F4F4] shrink-0 rounded-xs border border-[#E4E4E7]" />
                      ) : (
                        <div className="w-16 h-16 bg-[#F4F4F4] shrink-0 rounded-xs border border-[#E4E4E7]" />
                      )}
                      <div className="space-y-1">
                        <p className="font-sans font-semibold text-[13px] text-[#18181B]">{item.product?.name}</p>
                        <p className="font-sans text-[11px] text-[#71717A]">SKU: {item.product?.sku ?? "N/A"} · Qty: {item.quantity} × ${item.unit_price_usd.toFixed(2)}</p>
                        {item.product?.ships_from_usa && (
                          <div className="inline-flex items-center gap-2 bg-[#1D70B8]/10 text-[#1D70B8] border border-[#1D70B8]/20 px-2.5 py-1 rounded-xs text-[11px] font-sans font-bold uppercase tracking-wider mt-1">
                            <img src="/images/us-flag.png" alt="USA Flag" className="w-4 h-3 object-cover shrink-0" />
                            <span>Ships from USA — Stocked in US Warehouse</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="font-sans font-bold text-[14px] text-[#18181B] self-end sm:self-center">
                      ${(item.unit_price_usd * item.quantity).toFixed(2)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 2: Financial Breakdown & Shipping Method Badge */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs space-y-4">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase font-black border-b border-[#F4F4F4] pb-3">
              Financial Summary & Shipping Method
            </h2>

            {/* Shipping Method Tag */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">Selected Delivery Option</span>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-sans font-bold uppercase tracking-wider border ${
                  shippingInfo.isExpress
                    ? "bg-[#1D70B8]/10 text-[#1D70B8] border-[#1D70B8]/30"
                    : "bg-amber-500/10 text-amber-900 border-amber-500/30"
                }`}>
                  <span>{shippingInfo.shippingLabel}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#64748B] block">Estimated Delivery Window</span>
                <span className="text-[13px] font-sans font-bold text-[#1E293B]">{shippingInfo.estimatedDeliveryWindow}</span>
              </div>
            </div>

            {/* Financial Rows */}
            <div className="space-y-2 pt-2 text-[13px] font-sans text-[#71717A]">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-[#18181B]">${subtotal.toFixed(2)}</span></div>
              {discountCost > 0 && (
                <div className="flex justify-between text-green-700"><span>Discount</span><span className="font-medium">-${discountCost.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span>Shipping</span><span className="font-medium text-[#18181B]">{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span></div>
              <div className="border-t border-[#E4E4E7] pt-3 flex justify-between text-[15px] font-sans font-bold text-[#18181B]">
                <span>Total Paid</span>
                <span>${(order.total_usd ?? 0).toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Card 3: Customer Information & Delivery Address */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs space-y-4">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase font-black border-b border-[#F4F4F4] pb-3">
              Customer Details & Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] font-sans text-[#18181B]">
              <div className="space-y-2">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#71717A]">Customer Info</p>
                <p><span className="text-[#71717A]">Name:</span> <strong className="font-semibold">{order.customer_name ?? "—"}</strong></p>
                <p><span className="text-[#71717A]">Email:</span> <a href={`mailto:${order.customer_email}`} className="text-blue-600 hover:underline">{order.customer_email ?? "—"}</a></p>
                <p><span className="text-[#71717A]">Phone:</span> {order.customer_phone ?? "—"}</p>
                <p className="text-[11px] text-[#A1A1AA] pt-1">
                  Ordered on {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#71717A] mb-2">Shipping Destination</p>
                {shippingAddress ? (
                  <>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p>{shippingAddress.address1}</p>
                    {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                    <p className="uppercase font-bold text-[12px] text-[#18181B] mt-2 inline-block bg-[#F4F4F4] px-2 py-0.5 rounded-xs">{shippingAddress.country}</p>
                  </>
                ) : (
                  <p className="text-[#A1A1AA]">No shipping address provided</p>
                )}
              </div>
            </div>
            {order.notes && (
              <div className="border-t border-[#F4F4F4] pt-3 text-[12px] font-sans text-[#71717A]">
                <strong className="text-[#18181B]">Order Notes:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Card 4: Payment Details */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase font-black mb-3 border-b border-[#F4F4F4] pb-3">
              Payment Gateway Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-sans text-[#18181B]">
              <div>
                <span className="text-[#71717A] text-[11px] uppercase font-bold tracking-wider block mb-1">Payment Method</span>
                {order.payment_method ? (
                  <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-800 rounded-xs font-bold uppercase tracking-wider text-[11px]">
                    {order.payment_method}
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-1 bg-amber-100 text-amber-800 rounded-xs font-bold uppercase tracking-wider text-[11px]">
                    Pending Confirmation
                  </span>
                )}
              </div>
              {order.payment_intent_id && (
                <div>
                  <span className="text-[#71717A] text-[11px] uppercase font-bold tracking-wider block mb-1">Gateway Reference ID</span>
                  <code className="bg-[#F4F4F4] border border-[#E4E4E7] px-2 py-1 rounded text-[12px] font-mono text-[#18181B] break-all inline-block">
                    {order.payment_intent_id}
                  </code>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (40% Width - Fulfillment & Controls) */}
        <div className="space-y-6">
          <OrderFulfillmentManager
            orderId={order.id}
            orderNumber={order.order_number ?? order.id.slice(0, 8).toUpperCase()}
            currentStatus={order.status ?? "confirmed"}
            trackingNumber={order.tracking_number}
            trackingUrl={order.tracking_url}
            customerEmail={order.customer_email}
            shippedEmailSentAt={(order as any).shipped_email_sent_at ?? null}
            deliveredEmailSentAt={(order as any).delivered_email_sent_at ?? null}
            cancelledEmailSentAt={(order as any).cancelled_email_sent_at ?? null}
            cancellationReason={(order as any).cancellation_reason ?? null}
            cancellationRequested={(order as any).cancellation_requested ?? false}
            customerCancellationReason={(order as any).customer_cancellation_reason ?? null}
            cancellationRequestStatus={(order as any).cancellation_request_status ?? null}
            cancellationRejectionReason={(order as any).cancellation_rejection_reason ?? null}
          />
        </div>

      </div>
    </div>
  )
}
