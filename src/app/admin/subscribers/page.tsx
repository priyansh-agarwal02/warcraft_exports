import type { Metadata } from "next"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

export const metadata: Metadata = { title: "Subscribers — Warcraft Exports Admin" }

async function toggleSubscriber(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  const isActive = formData.get("is_active") === "true"
  await supabase.from("newsletter_subscribers").update({ is_active: !isActive }).eq("id", id)
  revalidatePath("/admin/subscribers")
}

async function deleteSubscriber(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  await supabase.from("newsletter_subscribers").delete().eq("id", id)
  revalidatePath("/admin/subscribers")
}

export default async function AdminSubscribersPage() {
  const supabase = createServiceClient()
  const { data: subscribers, count } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Newsletter Subscribers</h1>
          <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{count ?? 0} total subscribers</p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-hidden">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Email</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Subscribed</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Status</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(subscribers ?? []).map((sub: { id: string; email: string; created_at: string; is_active: boolean }) => (
              <tr key={sub.id} className="hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-medium text-[#18181B]">{sub.email}</td>
                <td className="px-4 py-3 text-[#71717A] hidden md:table-cell">
                  {new Date(sub.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 ${sub.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {sub.is_active ? "Active" : "Unsubscribed"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <form action={toggleSubscriber}>
                      <input type="hidden" name="id" value={sub.id} />
                      <input type="hidden" name="is_active" value={String(sub.is_active)} />
                      <button type="submit" className="text-[11px] font-sans font-bold text-[#71717A] hover:text-[#18181B] border border-[#E4E4E7] px-2 py-1 hover:border-[#18181B] transition-colors">
                        {sub.is_active ? "Unsub" : "Re-sub"}
                      </button>
                    </form>
                    <form action={deleteSubscriber}>
                      <input type="hidden" name="id" value={sub.id} />
                      <button type="submit" className="text-[11px] font-sans font-bold text-red-500 border border-red-200 px-2 py-1 hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!subscribers || subscribers.length === 0) && (
          <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No subscribers yet</div>
        )}
      </div>
    </div>
  )
}
