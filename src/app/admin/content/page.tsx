import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export const metadata: Metadata = { title: "Content — Warcraft Exports Admin" }

async function saveBlock(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const id = formData.get("id") as string
  await supabase.from("content_blocks").update({
    title: formData.get("title") as string,
    body: formData.get("body") as string,
  }).eq("id", id)
  revalidatePath("/admin/content")
}

const INPUT = "w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white"

export default async function AdminContentPage() {
  const supabase = await createClient()
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("id, key, title, body, updated_at")
    .order("key", { ascending: true })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Content Blocks</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">Edit homepage and site-wide content blocks</p>
      </div>

      {(!blocks || blocks.length === 0) ? (
        <div className="bg-white border border-[#E4E4E7] text-center py-16 text-[#A1A1AA] text-[13px]">
          No content blocks found. Add rows to the <span className="font-mono">content_blocks</span> table in Supabase.
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block: { id: string; key: string; title: string | null; body: string | null; updated_at: string }) => (
            <div key={block.id} className="bg-white border border-[#E4E4E7] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[11px] bg-[#F4F4F4] text-[#71717A] px-2 py-0.5 border border-[#E4E4E7]">{block.key}</span>
                {block.updated_at && (
                  <span className="text-[11px] text-[#A1A1AA]">Last updated {new Date(block.updated_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                )}
              </div>
              <form action={saveBlock} className="space-y-3">
                <input type="hidden" name="id" value={block.id} />
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1">Title</label>
                  <input name="title" type="text" defaultValue={block.title ?? ""} placeholder="Block title…" className={INPUT} />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1">Body</label>
                  <textarea name="body" rows={5} defaultValue={block.body ?? ""} placeholder="Block content…" className={`${INPUT} resize-y`} />
                </div>
                <button type="submit" className="bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#4A5D23] transition-colors">Save Block</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
