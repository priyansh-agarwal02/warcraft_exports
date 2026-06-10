import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export const metadata: Metadata = { title: "B2B Enquiries — Warcraft Exports Admin" }

async function markContacted(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("wholesale_inquiries").update({ status: "contacted" }).eq("id", id)
  revalidatePath("/admin/b2b")
}

async function markClosed(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("wholesale_inquiries").update({ status: "closed" }).eq("id", id)
  revalidatePath("/admin/b2b")
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  closed: "bg-gray-100 text-gray-600",
}

export default async function AdminB2BPage() {
  const supabase = await createClient()
  const { data: inquiries } = await supabase
    .from("wholesale_inquiries")
    .select("id, contact_name, company_name, email, country, estimated_monthly_volume, created_at, status")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">B2B Enquiries</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{inquiries?.length ?? 0} wholesale inquiries</p>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-hidden">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Contact</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Country</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Est. Monthly Vol.</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Status</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(inquiries ?? []).map((inq: { id: string; contact_name: string | null; company_name: string | null; email: string | null; country: string | null; estimated_monthly_volume: string | null; created_at: string; status: string | null }) => {
              const status = inq.status ?? "new"
              return (
                <tr key={inq.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#18181B]">{inq.contact_name ?? "—"}</p>
                    <p className="text-[11px] text-[#A1A1AA]">{inq.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-[#71717A] hidden md:table-cell">{inq.company_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] hidden lg:table-cell">{inq.country ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] hidden lg:table-cell">{inq.estimated_monthly_volume ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] text-[12px] hidden md:table-cell">{new Date(inq.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {status !== "contacted" && status !== "closed" && (
                        <form action={markContacted.bind(null, inq.id)}>
                          <button type="submit" className="text-[11px] font-bold text-[#33450D] hover:underline uppercase tracking-wide whitespace-nowrap">Mark Contacted</button>
                        </form>
                      )}
                      {status !== "closed" && (
                        <form action={markClosed.bind(null, inq.id)}>
                          <button type="submit" className="text-[11px] font-bold text-[#71717A] hover:underline uppercase tracking-wide">Close</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!inquiries || inquiries.length === 0) && <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No B2B enquiries yet</div>}
      </div>
    </div>
  )
}
