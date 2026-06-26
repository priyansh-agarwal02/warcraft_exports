import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Order Detail — Warcraft Exports Admin" }
type Props = { params: Promise<{ id: string }> }

const STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled"]

async function updateOrderStatus(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("order_id") as string
  const status = formData.get("status") as string
  await supabase.from("orders").update({ status }).eq("id", id)

  if (status === "shipped") {
    try {
      const { sendOrderShippedEmail } = await import("@/lib/email")
      await sendOrderShippedEmail(id)
    } catch (err) {
      console.error("Failed to send shipping email on status update:", err)
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
}

async function updateTracking(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("order_id") as string
  const trackingNumber = (formData.get("tracking_number") as string)?.trim()
  const carrier = formData.get("carrier") as string
  const customUrl = (formData.get("custom_tracking_url") as string)?.trim()

  if (!trackingNumber) return

  let trackingUrl = ""
  if (carrier === "dhl") {
    trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  } else if (carrier === "fedex") {
    trackingUrl = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`
  } else if (carrier === "usps") {
    trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  } else if (carrier === "shipglobal") {
    trackingUrl = `https://www.shipglobal.in/track?tracking_id=${trackingNumber}`
  } else if (carrier === "custom") {
    trackingUrl = customUrl || ""
  }

  // Update tracking details and automatically mark as Shipped
  await supabase
    .from("orders")
    .update({ 
      tracking_number: trackingNumber, 
      tracking_url: trackingUrl,
      status: "shipped"
    })
    .eq("id", id)

  try {
    const { sendOrderShippedEmail } = await import("@/lib/email")
    await sendOrderShippedEmail(id)
  } catch (err) {
    console.error("Failed to send shipping email on tracking update:", err)
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${id}`)
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order } = await supabase
    .from("orders")
    .select(`id, order_number, customer_name, customer_email, customer_phone, payment_method, payment_intent_id, status, total_usd, shipping_usd, tax_usd, created_at, tracking_number, tracking_url, shipping_address,
      order_items(id, quantity, unit_price_usd, product:products(name, sku, slug, images:product_images(url, is_hero)))`)
    .eq("id", id)
    .single()

  if (!order) notFound()

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-[12px] font-sans font-bold text-[#71717A] hover:text-[#18181B] uppercase tracking-wide">← Orders</Link>
        <span className="text-[#D4D4D8]">/</span>
        <h1 className="font-heading text-[22px] text-[#18181B] uppercase tracking-tight">
          Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — items + summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase mb-4">Order Items</h2>
            <div className="space-y-4">
              {Array.isArray(order.order_items) && (order.order_items as unknown as { id: string; quantity: number; unit_price_usd: number; product: { name: string; sku: string; slug: string; images: { url: string; is_hero: boolean }[] } | null }[]).map((item) => {
                const img = item.product?.images?.find((i) => i.is_hero)?.url ?? item.product?.images?.[0]?.url
                return (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-[#F4F4F4] last:border-0 last:pb-0">
                    {img ? <img src={img} alt={item.product?.name ?? ""} className="w-14 h-14 object-cover bg-[#F4F4F4]" /> : <div className="w-14 h-14 bg-[#F4F4F4]" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-medium text-[13px] text-[#18181B] truncate">{item.product?.name}</p>
                      <p className="font-sans text-[11px] text-[#A1A1AA] mt-0.5">{item.product?.sku} · Qty {item.quantity}</p>
                    </div>
                    <p className="font-sans font-bold text-[13px] text-[#18181B]">${(item.unit_price_usd * item.quantity).toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-[#E4E4E7] mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-[13px] font-sans text-[#71717A]"><span>Shipping</span><span>${((order.shipping_usd as number | null) ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-[13px] font-sans font-bold text-[#18181B]"><span>Total</span><span>${(order.total_usd ?? 0).toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Right — status, tracking, customer */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase mb-3">Update Status</h2>
            <form action={updateOrderStatus} className="space-y-3">
              <input type="hidden" name="order_id" value={order.id} />
              <select name="status" defaultValue={order.status ?? "confirmed"} className="w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white">
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#4A5D23] transition-colors">Save Status</button>
            </form>
          </div>

          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase mb-3">Tracking & Fulfillment</h2>
            <form action={updateTracking} className="space-y-3">
              <input type="hidden" name="order_id" value={order.id} />
              
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Shipping Partner
                </label>
                <select 
                  name="carrier" 
                  className="w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white"
                  defaultValue={
                    order.tracking_url 
                      ? order.tracking_url.includes("dhl.com") ? "dhl"
                        : order.tracking_url.includes("fedex.com") ? "fedex"
                        : order.tracking_url.includes("usps.com") ? "usps"
                        : order.tracking_url.includes("shipglobal.in") ? "shipglobal"
                        : "custom"
                      : "dhl"
                  }
                >
                  <option value="dhl">DHL Express</option>
                  <option value="fedex">FedEx</option>
                  <option value="usps">USPS</option>
                  <option value="shipglobal">Ship Global</option>
                  <option value="custom">Custom Link / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Tracking Number
                </label>
                <input 
                  name="tracking_number" 
                  type="text" 
                  defaultValue={order.tracking_number ?? ""} 
                  placeholder="e.g. 9876543210" 
                  className="w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Custom Tracking URL (Optional)
                </label>
                <input 
                  name="custom_tracking_url" 
                  type="url" 
                  defaultValue={order.tracking_url ?? ""} 
                  placeholder="https://..." 
                  className="w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white" 
                />
                <p className="text-[10px] text-[#A1A1AA] mt-1">
                  Only used if "Custom Link / Other" is selected as the Shipping Partner.
                </p>
              </div>

              <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#4A5D23] transition-colors cursor-pointer">
                Save & Mark as Shipped
              </button>
            </form>
          </div>

          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase mb-3">Customer</h2>
            <div className="space-y-2 text-[13px] font-sans text-[#18181B]">
              <p><span className="text-[#71717A] font-medium">Name:</span> {order.customer_name ?? "—"}</p>
              <p><span className="text-[#71717A] font-medium">Email:</span> {order.customer_email ?? "—"}</p>
              <p><span className="text-[#71717A] font-medium">Phone:</span> {order.customer_phone ?? "—"}</p>
              <p className="text-[11px] text-[#A1A1AA] mt-2">Ordered on {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase mb-3">Shipping Address</h2>
            <div className="text-[13px] font-sans text-[#18181B] space-y-1">
              {order.shipping_address ? (
                <>
                  <p className="font-semibold">{order.customer_name}</p>
                  <p>{(order.shipping_address as any).address1}</p>
                  {(order.shipping_address as any).address2 && <p>{(order.shipping_address as any).address2}</p>}
                  <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).state} {(order.shipping_address as any).postalCode}</p>
                  <p className="uppercase font-semibold text-[11px] text-[#71717A] mt-1.5">{(order.shipping_address as any).country}</p>
                </>
              ) : (
                <p className="text-[#A1A1AA]">No shipping address recorded</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase mb-3">Payment Details</h2>
            <div className="space-y-2 text-[13px] font-sans text-[#18181B]">
              <p>
                <span className="text-[#71717A] font-medium">Method:</span>{" "}
                {order.payment_method ? (
                  <span className="inline-flex px-1.5 py-0.5 bg-green-100 text-green-800 rounded-sm font-bold uppercase tracking-wider text-[10px]">
                    {order.payment_method}
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold uppercase tracking-wider text-[10px]">Pending Payment</span>
                )}
              </p>
              {order.payment_intent_id && (
                <p className="break-all">
                  <span className="text-[#71717A] font-medium">Reference:</span>{" "}
                  <code className="bg-[#F4F4F4] px-1 py-0.5 rounded text-[11px] font-mono">{order.payment_intent_id}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
