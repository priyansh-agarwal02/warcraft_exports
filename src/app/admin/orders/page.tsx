import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Search } from "lucide-react"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Orders — Warcraft Exports Admin" }

type SP = Promise<{ q?: string; status?: string; page?: string }>

const PAGE_SIZE = 25
const STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled"]

async function updateOrderStatus(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("order_id") as string
  const status = formData.get("status") as string
  await supabase.from("orders").update({ status }).eq("id", id)
  revalidatePath("/admin/orders")
}
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_email, status, total_usd, created_at, order_items(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (sp.status) query = query.eq("status", sp.status)
  if (sp.q) query = query.ilike("customer_email", `%${sp.q}%`)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(params: Record<string, string | undefined>) {
    const base = new URLSearchParams()
    const merged = { q: sp.q, status: sp.status, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) base.set(k, v) })
    return `/admin/orders?${base.toString()}`
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Orders</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{count ?? 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E4E4E7] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input name="q" defaultValue={sp.q} placeholder="Search by email…" className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white" />
          </div>
          <button type="submit" className="bg-[#18181B] text-white text-[11px] font-sans font-bold uppercase px-4 py-2">Search</button>
        </form>
        <div className="flex gap-1 flex-wrap">
          <Link href={buildUrl({ status: undefined, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${!sp.status ? "bg-[#18181B] text-white border-[#18181B]" : "border-[#E4E4E7] text-[#71717A] hover:border-[#18181B]"}`}>All</Link>
          {STATUSES.map(s => (
            <Link key={s} href={buildUrl({ status: sp.status === s ? undefined : s, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${sp.status === s ? "bg-[#33450D] text-white border-[#33450D]" : "border-[#E4E4E7] text-[#71717A] hover:border-[#33450D]"}`}>{s}</Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-hidden">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Order #</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Customer</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Items</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Status</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Total</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(orders ?? []).map((o: { id: string; order_number: string | null; customer_email: string | null; status: string | null; total_usd: number | null; created_at: string; order_items: { count: number }[] }) => {
              const itemCount = o.order_items?.[0]?.count ?? 0
              const status = o.status ?? "confirmed"
              return (
                <tr key={o.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-mono text-[12px] text-[#18181B] font-medium">#{o.order_number ?? o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-[#18181B] max-w-[180px] truncate">{o.customer_email ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] hidden md:table-cell text-[12px]">{new Date(o.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-3 text-[#71717A] hidden lg:table-cell">{itemCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>{status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#18181B]">${(o.total_usd ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <form action={updateOrderStatus} className="flex items-center gap-1">
                        <input type="hidden" name="order_id" value={o.id} />
                        <select
                          name="status"
                          defaultValue={status}
                          className="text-[11px] font-sans border border-[#E4E4E7] px-1.5 py-1 bg-white focus:border-[#33450D] focus:outline-none"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="submit" className="bg-[#33450D] text-white text-[10px] font-sans font-bold uppercase px-2 py-1 hover:bg-[#4A5D23] transition-colors">Save</button>
                      </form>
                      <Link href={`/admin/orders/${o.id}`} className="text-[11px] font-sans font-bold text-[#33450D] hover:underline uppercase tracking-wide">View</Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No orders found</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[12px] font-sans text-[#71717A]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">← Prev</Link>}
            {page < totalPages && <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
