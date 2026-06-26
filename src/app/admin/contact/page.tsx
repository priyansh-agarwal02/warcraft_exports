import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export const metadata: Metadata = { title: "Contact Queries — Warcraft Exports Admin" }

async function markContacted(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("contact_messages").update({ status: "contacted" }).eq("id", id)
  revalidatePath("/admin/contact")
}

async function markClosed(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("contact_messages").update({ status: "closed" }).eq("id", id)
  revalidatePath("/admin/contact")
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  closed: "bg-gray-100 text-gray-600",
}

export default async function AdminContactPage() {
  const supabase = await createClient()
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, created_at, status")
    .order("created_at", { ascending: false })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Contact Queries</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{messages?.length ?? 0} messages received</p>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-[18%]">Contact</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-[20%]">Subject</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-[35%]">Message</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-[12%]">Date</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-[7%]">Status</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-[8%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(messages ?? []).map((msg: { id: string; name: string; email: string; subject: string; message: string; created_at: string; status: string | null }) => {
              const status = msg.status ?? "pending"
              return (
                <tr key={msg.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-[#18181B]">{msg.name}</p>
                    <p className="text-[11px] text-[#A1A1AA]">{msg.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#71717A] font-medium align-top">{msg.subject}</td>
                  <td className="px-4 py-3 text-[#71717A] whitespace-pre-wrap align-top font-serif leading-relaxed text-[12px]">{msg.message}</td>
                  <td className="px-4 py-3 text-[#71717A] text-[12px] align-top">
                    {new Date(msg.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      {status !== "contacted" && status !== "closed" && (
                        <form action={markContacted.bind(null, msg.id)}>
                          <button type="submit" className="text-[11px] font-bold text-[#33450D] hover:underline uppercase tracking-wide whitespace-nowrap cursor-pointer">
                            Mark Contacted
                          </button>
                        </form>
                      )}
                      {status !== "closed" && (
                        <form action={markClosed.bind(null, msg.id)}>
                          <button type="submit" className="text-[11px] font-bold text-[#71717A] hover:underline uppercase tracking-wide cursor-pointer">
                            Close
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!messages || messages.length === 0) && (
          <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No contact queries yet</div>
        )}
      </div>
    </div>
  )
}
