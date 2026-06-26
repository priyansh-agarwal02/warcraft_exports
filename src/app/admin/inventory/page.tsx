import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Search } from "lucide-react"
import { revalidatePath } from "next/cache"
import { compileSearchWords } from "@/lib/queries/products"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Inventory — Warcraft Exports Admin" }

type SP = Promise<{ q?: string; page?: string; filter?: string }>
const PAGE_SIZE = 30

async function updateStock(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const productId = formData.get("product_id") as string
  const qty = Number(formData.get("stock_quantity"))
  await supabase.from("products").update({ stock_quantity: qty }).eq("id", productId)
  revalidatePath("/admin/inventory")
}

export default async function AdminInventoryPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select("id, name, sku, stock_quantity, images:product_images(url, is_hero)", { count: "exact" })
    .order("stock_quantity", { ascending: true })
    .range(from, from + PAGE_SIZE - 1)

  if (sp.q) {
    const orStrings = compileSearchWords(sp.q, ["name", "sku"])
    orStrings.forEach(orStr => {
      query = query.or(orStr)
    })
  }
  if (sp.filter === "low") query = query.gt("stock_quantity", 0).lte("stock_quantity", 5)
  else if (sp.filter === "out") query = query.eq("stock_quantity", 0)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(params: Record<string, string | undefined>) {
    const base = new URLSearchParams()
    const merged = { q: sp.q, filter: sp.filter, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) base.set(k, v) })
    return `/admin/inventory?${base.toString()}`
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Inventory</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{count ?? 0} products</p>
      </div>

      <div className="bg-white border border-[#E4E4E7] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <form className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input name="q" defaultValue={sp.q} placeholder="Search by name or SKU…" className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white" />
          </div>
          <button type="submit" className="bg-[#18181B] text-white text-[11px] font-sans font-bold uppercase px-4 py-2">Search</button>
        </form>
        <div className="flex gap-1">
          <Link href={buildUrl({ filter: undefined, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${!sp.filter ? "bg-[#18181B] text-white border-[#18181B]" : "border-[#E4E4E7] text-[#71717A] hover:border-[#18181B]"}`}>All</Link>
          <Link href={buildUrl({ filter: sp.filter === "low" ? undefined : "low", page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${sp.filter === "low" ? "bg-amber-500 text-white border-amber-500" : "border-[#E4E4E7] text-[#71717A] hover:border-amber-500"}`}>Low Stock</Link>
          <Link href={buildUrl({ filter: sp.filter === "out" ? undefined : "out", page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${sp.filter === "out" ? "bg-red-500 text-white border-red-500" : "border-[#E4E4E7] text-[#71717A] hover:border-red-500"}`}>Out of Stock</Link>
        </div>
      </div>

      <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-14">Image</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Product</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">SKU</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Stock</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {(products ?? []).map((p: { id: string; name: string; sku: string; stock_quantity: number; images: { url: string; is_hero: boolean }[] }) => {
              const img = p.images?.find((i) => i.is_hero)?.url ?? p.images?.[0]?.url
              const isLow = p.stock_quantity > 0 && p.stock_quantity <= 5
              const isOut = p.stock_quantity === 0
              return (
                <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    {img ? <img src={img} alt={p.name} className="w-10 h-10 object-cover bg-[#F4F4F4]" /> : <div className="w-10 h-10 bg-[#F4F4F4]" />}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#18181B] line-clamp-1">{p.name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#A1A1AA] hidden md:table-cell">{p.sku}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold text-[14px] ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-[#33450D]"}`}>{p.stock_quantity}</span>
                    {isOut && <p className="text-[10px] text-red-500 font-bold">OOS</p>}
                    {isLow && <p className="text-[10px] text-amber-500 font-bold">Low</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <form action={updateStock} className="flex items-center justify-center gap-2">
                      <input type="hidden" name="product_id" value={p.id} />
                      <input
                        name="stock_quantity"
                        type="number"
                        min="0"
                        defaultValue={p.stock_quantity}
                        className="w-20 border border-[#E4E4E7] px-2 py-1 text-[13px] font-sans text-center focus:border-[#33450D] focus:outline-none"
                      />
                      <button type="submit" className="bg-[#33450D] text-white text-[11px] font-sans font-bold uppercase px-3 py-1.5 hover:bg-[#4A5D23] transition-colors">Save</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!products || products.length === 0) && <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No products found</div>}
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
