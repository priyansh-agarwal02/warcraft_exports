import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Track Your Order — Warcraft Exports",
  description: "Enter your order number and email to track your Warcraft Exports shipment.",
}

type SP = Promise<{ order_number?: string; email?: string }>

async function getOrder(orderNumber: string, email: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_usd,
      subtotal_usd,
      shipping_usd,
      tax_usd,
      discount_usd,
      tracking_number,
      tracking_url,
      created_at,
      shipping_address,
      customer_name,
      order_items (
        id,
        quantity,
        price_usd,
        unit_price_usd,
        product_snapshot,
        product:products (
          name,
          slug,
          images:product_images (
            url,
            is_hero
          )
        )
      )
    `)
    .eq("order_number", orderNumber)
    .or(`customer_email.eq.${email},guest_email.eq.${email}`)
    .single()
  return data
}

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"]

const STEP_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
}

export default async function TrackOrderPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const order = sp.order_number && sp.email ? await getOrder(sp.order_number, sp.email) : null
  const notFound = sp.order_number && sp.email && !order

  // Check if user is logged in to conditionally show dashboard details link
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()

  // Calculate subtotal and shipping if order exists
  let subtotal = 0
  let shipping = 0
  let itemsList: any[] = []
  let shippingAddress: any = null

  if (order) {
    itemsList = (order.order_items ?? []) as any[]
    subtotal = order.subtotal_usd ?? itemsList.reduce((sum, item) => sum + (item.unit_price_usd ?? item.price_usd ?? 0) * item.quantity, 0)
    shipping = order.shipping_usd ?? ((order.total_usd ?? 0) - subtotal)
    shippingAddress = order.shipping_address as any
  }

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Shipment Tracking</p>
        <h1 className="font-heading text-[40px] font-black text-leather-dark uppercase leading-tight mb-4">Track Your Order</h1>
        <p className="font-sans text-sm text-leather/70 mb-10">Enter your order number and the email used at checkout.</p>

        <form className="bg-white/50 border border-khaki/40 p-8 space-y-5 mb-8">
          <div>
            <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Order Number</label>
            <input name="order_number" type="text" defaultValue={sp.order_number} required placeholder="WE-2026-0001" className="w-full border border-khaki/60 bg-parchment/60 px-3 py-2.5 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Email Address</label>
            <input name="email" type="email" defaultValue={sp.email} required placeholder="you@email.com" className="w-full border border-khaki/60 bg-parchment/60 px-3 py-2.5 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather transition-colors" />
          </div>
          <button type="submit" className="w-full bg-leather text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.15em] py-3.5 hover:bg-leather-dark transition-colors cursor-pointer">Track Order</button>
        </form>

        {notFound && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-sm p-4 text-center">
            No order found. Check your order number and email and try again.
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-khaki/30 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-khaki/20 pb-4">
                <div>
                  <h2 className="font-heading text-lg font-black text-leather-dark uppercase">
                    Order Status
                  </h2>
                  <p className="text-xs font-sans text-khaki">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-white bg-leather px-2.5 py-1 rounded-sm uppercase tracking-wider">
                  #{order.order_number || sp.order_number}
                </span>
              </div>

              {/* Status Timeline */}
              {order.status !== "cancelled" ? (
                <div className="flex items-center gap-0 py-2 overflow-x-auto min-w-[280px]">
                  {STATUS_STEPS.map((step, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(order.status ?? "confirmed")
                    const done = i <= currentIdx
                    const isLast = i === STATUS_STEPS.length - 1
                    return (
                      <div key={step} className="flex items-center flex-1 min-w-[65px]">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            done ? "bg-leather text-parchment" : "bg-white border border-khaki/40 text-khaki"
                          }`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <p className={`text-[9px] font-sans font-bold uppercase tracking-wider mt-1 text-center whitespace-nowrap ${done ? "text-leather" : "text-khaki"}`}>
                            {STEP_LABELS[step] ?? step}
                          </p>
                        </div>
                        {!isLast && (
                          <div className={`flex-1 h-0.5 mx-1 mb-4 min-w-[15px] ${i < currentIdx ? "bg-leather" : "bg-khaki/30"}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-sm p-4 text-center rounded-sm">
                  This order has been cancelled.
                </div>
              )}

              {/* Carrier Details */}
              {order.tracking_number && (
                <div className="pt-4 border-t border-khaki/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-khaki">Tracking Number</span>
                    <div>
                      <p className="font-mono text-sm text-leather-dark bg-parchment-dark/50 px-2 py-1 border border-khaki/20 rounded-sm inline-block">
                        {order.tracking_number}
                      </p>
                    </div>
                  </div>
                  {order.tracking_url && (
                    <div className="flex sm:justify-end sm:items-center">
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-[#33450D] text-white font-sans font-bold text-[11px] uppercase tracking-widest px-5 py-2.5 hover:bg-[#4A5D23] transition-colors rounded-sm"
                      >
                        Track Package &rarr;
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Items Ordered Card */}
            <div className="bg-white border border-khaki/30 p-6 sm:p-8 rounded-sm shadow-sm space-y-4">
              <h3 className="font-heading text-sm text-leather-dark uppercase font-black border-b border-khaki/20 pb-2">
                Items Ordered
              </h3>
              <div className="divide-y divide-khaki/20">
                {itemsList.map((item) => {
                  const product = item.product
                  const snap = item.product_snapshot as any
                  const name = product?.name ?? snap?.name ?? "Historical Gear Item"
                  const sku = product?.sku ?? snap?.sku ?? "N/A"
                  const unitPrice = item.unit_price_usd ?? item.price_usd ?? 0
                  
                  // Extract image
                  const imgObj = product?.images?.find((i: any) => i.is_hero) ?? product?.images?.[0]
                  const imageUrl = imgObj?.url ?? null

                  return (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 flex-shrink-0 bg-khaki/10 border border-khaki/20 rounded-sm overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-sans font-bold text-khaki uppercase tracking-widest">No Img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-sm text-leather-dark line-clamp-2">
                          {name}
                        </p>
                        <p className="text-xs font-mono text-khaki mt-0.5">
                          SKU: {sku}
                        </p>
                        <p className="text-xs font-sans text-khaki mt-1">
                          Qty: {item.quantity} × ${unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-sans font-semibold text-sm text-leather-dark">
                          ${(unitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-khaki/20 space-y-2">
                <div className="flex justify-between text-xs font-sans text-khaki">
                  <span>Subtotal</span>
                  <span className="text-leather-dark">${subtotal.toFixed(2)}</span>
                </div>
                {shipping !== 0 && (
                  <div className="flex justify-between text-xs font-sans text-khaki">
                    <span>Shipping</span>
                    <span className="text-leather-dark">{shipping <= 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                )}
                {order.discount_usd > 0 && (
                  <div className="flex justify-between text-xs font-sans text-green-700">
                    <span>Discount</span>
                    <span>-${order.discount_usd.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-sans font-bold text-leather-dark pt-2 border-t border-khaki/20">
                  <span>Total</span>
                  <span>${(order.total_usd ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            {shippingAddress && (
              <div className="bg-white border border-khaki/30 p-6 sm:p-8 rounded-sm shadow-sm space-y-3">
                <h3 className="font-heading text-sm text-leather-dark uppercase font-black border-b border-khaki/20 pb-2">
                  Shipping Address
                </h3>
                <address className="not-italic font-sans text-sm text-leather-dark/80 space-y-0.5">
                  <p className="font-bold">{shippingAddress.full_name || order.customer_name}</p>
                  <p>{shippingAddress.address_line1 || shippingAddress.address1}</p>
                  {(shippingAddress.address_line2 || shippingAddress.address2) && (
                    <p>{shippingAddress.address_line2 || shippingAddress.address2}</p>
                  )}
                  <p>
                    {[
                      shippingAddress.city,
                      shippingAddress.state,
                      shippingAddress.postal_code || shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </address>
              </div>
            )}

            {/* Link to Full Details if Logged In */}
            {user && (
              <div className="text-center pt-2">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-xs font-sans font-bold text-leather hover:text-leather-dark uppercase tracking-widest transition-colors inline-block"
                >
                  View Full Order Dashboard Details &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
