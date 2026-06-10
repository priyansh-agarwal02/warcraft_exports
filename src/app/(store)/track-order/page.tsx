import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Track Your Order — Warcraft Exports",
  description: "Enter your order number and email to track your Warcraft Exports shipment.",
}

type SP = Promise<{ order_number?: string; email?: string }>

async function getOrder(orderNumber: string, email: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select("id, status, tracking_number, created_at, shipping_address, order_items(id, quantity, product:products(name, sku))")
    .eq("order_number", orderNumber)
    .eq("customer_email", email)
    .single()
  return data
}

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"]

export default async function TrackOrderPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const order = sp.order_number && sp.email ? await getOrder(sp.order_number, sp.email) : null
  const notFound = sp.order_number && sp.email && !order

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
          <button type="submit" className="w-full bg-leather text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.15em] py-3.5 hover:bg-leather-dark transition-colors">Track Order</button>
        </form>

        {notFound && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-sm p-4 text-center">
            No order found. Check your order number and email and try again.
          </div>
        )}

        {order && (
          <div className="bg-white/50 border border-khaki/40 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-black text-leather-dark uppercase">Order Status</h2>
              <span className="font-mono text-xs text-leather">#{sp.order_number}</span>
            </div>

            {/* Status timeline */}
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => {
                const currentIdx = STATUS_STEPS.indexOf(order.status ?? "confirmed")
                const done = i <= currentIdx
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center flex-1 ${i < STATUS_STEPS.length - 1 ? "relative" : ""}`}>
                      <div className={`w-4 h-4 rounded-full border-2 ${done ? "bg-leather border-leather" : "bg-white border-khaki/40"}`} />
                      <p className={`text-[9px] font-sans font-bold uppercase tracking-wide mt-1 text-center ${done ? "text-leather" : "text-khaki"}`}>{step}</p>
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIdx ? "bg-leather" : "bg-khaki/30"}`} />}
                  </div>
                )
              })}
            </div>

            {order.tracking_number && (
              <p className="font-sans text-sm text-leather-dark"><span className="font-bold">Tracking Number:</span> {order.tracking_number}</p>
            )}

            <div className="border-t border-khaki/30 pt-4">
              <Link href={`/account/orders/${order.id}`} className="text-xs font-sans font-bold text-leather hover:text-leather-dark uppercase tracking-wide transition-colors">View Full Order Details &rarr;</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
