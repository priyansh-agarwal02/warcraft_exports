import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DeleteCategoryButton } from "@/components/admin/delete-category-button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Categories — Warcraft Exports Admin" }

async function addCategory(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const name = (formData.get("name") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  if (!name) return
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  await supabase.from("categories").insert({ name, slug, description })
  revalidatePath("/admin/categories")
}

async function updateCategory(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  const name = (formData.get("name") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  const meta_title = (formData.get("meta_title") as string | null)?.trim() ?? ""
  const meta_description = (formData.get("meta_description") as string | null)?.trim() ?? ""
  if (!id || !name) return
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  await supabase.from("categories").update({ name, slug, description, meta_title, meta_description }).eq("id", id)
  revalidatePath("/admin/categories")
}

async function deleteCategory(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  if (!id) return
  // Unlink products from this category before deleting
  await supabase.from("products").update({ category_id: null }).eq("category_id", id)
  await supabase.from("categories").delete().eq("id", id)
  revalidatePath("/admin/categories")
}

const INPUT = "w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white"
const LABEL = "block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1"

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, description, meta_title, meta_description")
    .order("name")

  const { data: counts } = await supabase.from("product_categories").select("category_id")
  const countMap: Record<string, number> = {}
  counts?.forEach((r: { category_id: string }) => {
    if (r.category_id) countMap[r.category_id] = (countMap[r.category_id] || 0) + 1
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Categories</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-1">{cats?.length ?? 0} categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category list */}
        <div className="lg:col-span-2 space-y-3">
          {(cats ?? []).map((cat: { id: string; name: string; slug: string; description: string | null; meta_title: string | null; meta_description: string | null }) => (
            <details key={cat.id} className="bg-white border border-[#E4E4E7] group">
              <summary className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA] list-none">
                <div className="flex items-center gap-3">
                  <span className="font-sans font-medium text-[13px] text-[#18181B]">{cat.name}</span>
                  <span className="font-mono text-[11px] text-[#A1A1AA]">{cat.slug}</span>
                  <span className="text-[11px] font-sans font-bold text-[#33450D]">{countMap[cat.id] ?? 0} products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/shop/category/${cat.slug}`} target="_blank" className="text-[11px] text-[#33450D] hover:underline font-bold uppercase tracking-wide">View →</Link>
                  <DeleteCategoryButton id={cat.id} name={cat.name} action={deleteCategory} />
                </div>
              </summary>
              {/* Edit form (expanded on click) */}
              <div className="px-5 pb-5 pt-3 border-t border-[#F4F4F4]">
                <form action={updateCategory} className="space-y-3">
                  <input type="hidden" name="id" value={cat.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Name *</label>
                      <input name="name" defaultValue={cat.name} required className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Slug (auto-generated)</label>
                      <input value={cat.slug} disabled className={`${INPUT} bg-[#F4F4F4] text-[#A1A1AA] cursor-not-allowed`} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Description</label>
                    <textarea name="description" defaultValue={cat.description ?? ""} rows={2} className={`${INPUT} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>SEO Meta Title</label>
                      <input name="meta_title" defaultValue={cat.meta_title ?? ""} placeholder="Overrides default" className={INPUT} maxLength={70} />
                    </div>
                    <div>
                      <label className={LABEL}>SEO Meta Description</label>
                      <input name="meta_description" defaultValue={cat.meta_description ?? ""} placeholder="Overrides default" className={INPUT} maxLength={160} />
                    </div>
                  </div>
                  <button type="submit" className="bg-[#33450D] text-white text-[11px] font-sans font-bold uppercase tracking-[0.1em] px-4 py-2 hover:bg-[#4A5D23] transition-colors">
                    Save Changes
                  </button>
                </form>
              </div>
            </details>
          ))}
          {(!cats || cats.length === 0) && (
            <div className="bg-white border border-[#E4E4E7] text-center py-12 text-[#A1A1AA] text-[13px]">No categories yet</div>
          )}
        </div>

        {/* Add category form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E4E4E7] p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={16} className="text-[#33450D]" />
              <h2 className="font-heading text-[15px] text-[#18181B] uppercase">Add Category</h2>
            </div>
            <form action={addCategory} className="space-y-3">
              <div>
                <label className={LABEL}>Name *</label>
                <input name="name" type="text" required placeholder="e.g. Hip Holsters" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Description</label>
                <textarea name="description" rows={3} placeholder="Optional description shown on shop page" className={`${INPUT} resize-none`} />
              </div>
              <p className="text-[11px] font-sans text-[#A1A1AA]">Slug is auto-generated from the name.</p>
              <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-2.5 hover:bg-[#4A5D23] transition-colors">
                Add Category
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
