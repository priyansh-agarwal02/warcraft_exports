import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Search } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Customers — Warcraft Exports Admin" }

type SP = Promise<{ q?: string; page?: string }>
const PAGE_SIZE = 25

export default async function AdminCustomersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (sp.q) query = query.or(`full_name.ilike.%${sp.q}%,email.ilike.%${sp.q}%`)

  const { data: customers, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Customers</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{count ?? 0} registered customers</p>
      </div>

      <div className="bg-white border border-[#E4E4E7] p-4 mb-4 flex gap-3">
        <form className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input name="q" defaultValue={sp.q} placeholder="Search by name or email…" className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white" />
          </div>
          <button type="submit" className="bg-[#18181B] text-white text-[11px] font-sans font-bold uppercase px-4 py-2">Search</button>
        </form>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Name</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Email</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Joined</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(customers ?? []).map((c: { id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string }) => (
              <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 font-medium text-[#18181B]">{c.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-[#71717A]">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-[#71717A] hidden md:table-cell">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-[#71717A] text-[12px] hidden lg:table-cell">{new Date(c.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/admin/customers/${c.id}`} className="text-[11px] font-bold text-[#33450D] hover:underline uppercase tracking-wide">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No customers found</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[12px] font-sans text-[#71717A]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/customers?page=${page - 1}${sp.q ? `&q=${sp.q}` : ""}`} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">← Prev</Link>}
            {page < totalPages && <Link href={`/admin/customers?page=${page + 1}${sp.q ? `&q=${sp.q}` : ""}`} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
