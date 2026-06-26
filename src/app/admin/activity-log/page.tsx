import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const metadata: Metadata = { title: "Activity Log — Warcraft Exports Admin" }

type SP = Promise<{ page?: string }>
const PAGE_SIZE = 50

export default async function AdminActivityLogPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const { data: logs, count } = await supabase
    .from("admin_activity_log")
    .select("id, created_at, admin_id, action, entity_type, entity_id, metadata, description", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Activity Log</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{count ?? 0} events recorded</p>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Time</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Action</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Entity</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Entity ID</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(logs ?? []).map((log: { id: string; created_at: string; admin_id: string | null; action: string | null; entity_type: string | null; entity_id: string | null; metadata: Record<string, unknown> | null; description: string | null }) => (
              <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-[#71717A] text-[12px] whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[12px] text-[#18181B] font-medium">{log.action ?? "—"}</span>
                  {log.description && <p className="text-[11px] text-[#71717A] mt-0.5">{log.description}</p>}
                </td>
                <td className="px-4 py-3 text-[#71717A] hidden md:table-cell capitalize">{log.entity_type ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#A1A1AA] hidden lg:table-cell">{log.entity_id ? log.entity_id.slice(0, 12) + "…" : "—"}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#A1A1AA] hidden lg:table-cell">{log.admin_id ? log.admin_id.slice(0, 12) + "…" : "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No activity recorded yet</div>}
      </div>

      {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-[12px] font-sans text-[#71717A]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/activity-log?page=${page - 1}`} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">← Prev</Link>}
              {page < totalPages && <Link href={`/admin/activity-log?page=${page + 1}`} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">Next →</Link>}
            </div>
          </div>
        )}
    </div>
  )
}
