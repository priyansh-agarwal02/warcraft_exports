import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Search, Plus, Edit, Eye } from "lucide-react"
import type { Metadata } from "next"
import { UsWarehouseToggle } from "@/components/admin/us-warehouse-toggle"
import { DuplicateProductButton } from "@/components/admin/duplicate-product-button"
import { compileSearchWords } from "@/lib/queries/products"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Products — Warcraft Exports Admin" }

type SP = Promise<{ q?: string; nation?: string; era?: string; page?: string; filter?: string }>

async function getAdminProducts(opts: { q?: string; nation?: string; era?: string; page: number; filter?: string }) {
  const supabase = await createClient()
  const PAGE_SIZE = 30
  const offset = (opts.page - 1) * PAGE_SIZE

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, sku, price_usd, sale_price_usd, stock_quantity, nation, era,
       is_featured, is_active, is_on_sale, ships_from_usa, created_at,
       category:categories!category_id(name, slug),
       images:product_images(url, is_hero)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (opts.q) {
    const orStrings = compileSearchWords(opts.q, ["name", "sku"])
    orStrings.forEach(orStr => {
      query = query.or(orStr)
    })
  }
  if (opts.nation) query = query.eq("nation", opts.nation)
  if (opts.era) query = query.eq("era", opts.era)
  if (opts.filter === "low_stock") {
    query = query.gt("stock_quantity", 0).lte("stock_quantity", 5)
  } else if (opts.filter === "out_of_stock") {
    query = query.eq("stock_quantity", 0)
  } else if (opts.filter === "featured") {
    query = query.eq("is_featured", true)
  }

  const { data, count } = await query.range(offset, offset + PAGE_SIZE - 1)

  // Try to fetch categories from join table if it exists
  const productCategoryMap: Record<string, any[]> = {}
  try {
    const productIds = (data ?? []).map(p => p.id)
    if (productIds.length > 0) {
      const { data: rels } = await supabase
        .from("product_categories")
        .select("product_id, category:categories(name, slug)")
        .in("product_id", productIds)
      rels?.forEach((r: any) => {
        if (r.product_id && r.category) {
          if (!productCategoryMap[r.product_id]) productCategoryMap[r.product_id] = []
          productCategoryMap[r.product_id].push(r.category)
        }
      })
    }
  } catch {
    // Ignore
  }

  const productsWithCategories = (data ?? []).map((p: any) => {
    const legacyCat = Array.isArray(p.category) ? p.category[0] : p.category
    const categories = productCategoryMap[p.id] || (legacyCat ? [legacyCat] : [])
    return {
      ...p,
      categories,
    }
  })

  return { products: productsWithCategories, total: count ?? 0, pageSize: PAGE_SIZE }
}

const NATIONS = ["British", "German", "US", "Japanese", "Soviet", "Italian", "French"]
const ERAS = ["WW1", "WW2"]

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const page = sp.page ? Number(sp.page) : 1
  const { products, total, pageSize } = await getAdminProducts({
    q: sp.q,
    nation: sp.nation,
    era: sp.era,
    page,
    filter: sp.filter,
  })

  const totalPages = Math.ceil(total / pageSize)

  function buildUrl(params: Record<string, string | undefined>) {
    const base = new URLSearchParams()
    const merged = { q: sp.q, nation: sp.nation, era: sp.era, filter: sp.filter, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) base.set(k, v) })
    return `/admin/products?${base.toString()}`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Products</h1>
          <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{total} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#4A5D23] transition-colors"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E4E4E7] p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <form className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Search by name or SKU…"
              className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white"
            />
          </div>
          <button type="submit" className="bg-[#18181B] text-white text-[11px] font-sans font-bold uppercase px-4 py-2">Search</button>
        </form>

        {/* Nation filter */}
        <div className="flex gap-1 flex-wrap">
          <Link href={buildUrl({ nation: undefined, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${!sp.nation ? "bg-[#18181B] text-white border-[#18181B]" : "border-[#E4E4E7] text-[#71717A] hover:border-[#18181B]"}`}>
            All
          </Link>
          {NATIONS.map(n => (
            <Link key={n} href={buildUrl({ nation: n, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${sp.nation === n ? "bg-[#33450D] text-white border-[#33450D]" : "border-[#E4E4E7] text-[#71717A] hover:border-[#33450D]"}`}>
              {n}
            </Link>
          ))}
        </div>

        {/* Era filter */}
        <div className="flex gap-1">
          {ERAS.map(e => (
            <Link key={e} href={buildUrl({ era: sp.era === e ? undefined : e, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${sp.era === e ? "bg-[#BBAC48] text-[#484000] border-[#BBAC48]" : "border-[#E4E4E7] text-[#71717A] hover:border-[#BBAC48]"}`}>
              {e}
            </Link>
          ))}
        </div>

        {/* Quick filters */}
        {["low_stock", "out_of_stock", "featured"].map(f => (
          <Link key={f} href={buildUrl({ filter: sp.filter === f ? undefined : f, page: "1" })} className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-colors ${sp.filter === f ? "bg-amber-500 text-white border-amber-500" : "border-[#E4E4E7] text-[#71717A] hover:border-amber-500"}`}>
            {f.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E4E4E7] overflow-hidden">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-16">Image</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Product</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Nation / Era</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Category</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Price</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Stock</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">US Warehouse</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {products.map((p: any) => {
              const img = p.images?.find((i: any) => i.is_hero)?.url ?? p.images?.[0]?.url
              const categories = p.categories || []
              const catText = categories.length > 0 ? categories.map((c: any) => c.name).join(", ") : "—"
              const isLow = p.stock_quantity > 0 && p.stock_quantity <= 5
              const isOut = p.stock_quantity === 0
              return (
                <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    {img ? (
                      <img src={img} alt={p.name} className="w-12 h-12 object-cover bg-[#F4F4F4]" />
                    ) : (
                      <div className="w-12 h-12 bg-[#F4F4F4] flex items-center justify-center text-[#D4D4D8] text-[10px]">No img</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#18181B] line-clamp-1 max-w-[250px]">{p.name}</p>
                    <p className="text-[11px] text-[#A1A1AA] font-mono">{p.sku}</p>
                    {p.is_featured && <span className="inline-block mt-0.5 text-[10px] bg-[#BBAC48] text-[#484000] px-1.5 py-0.5 font-bold uppercase">Featured</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-[#18181B] font-medium">{p.nation}</p>
                    <p className="text-[11px] text-[#A1A1AA]">{p.era}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#71717A] text-[12px]">{catText}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-bold text-[#18181B]">${p.price_usd.toFixed(2)}</p>
                    {p.sale_price_usd && <p className="text-[11px] text-[#A1A1AA] line-through">${p.sale_price_usd.toFixed(2)}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-[#33450D]"}`}>
                      {p.stock_quantity}
                    </span>
                    {isLow && <p className="text-[10px] text-amber-500">Low</p>}
                    {isOut && <p className="text-[10px] text-red-500">OOS</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <UsWarehouseToggle productId={p.id} initialValue={p.ships_from_usa ?? false} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/products/${p.id}`} className="p-1.5 text-[#71717A] hover:text-[#33450D] hover:bg-[#F4F4F4] rounded-sm transition-colors" title="Edit">
                        <Edit size={14} />
                      </Link>
                      <DuplicateProductButton productId={p.id} variant="icon" />
                      <Link href={`/product/${p.slug}`} target="_blank" className="p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F4] rounded-sm transition-colors" title="View on store">
                        <Eye size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-16 text-[#A1A1AA] text-[13px]">No products found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[12px] font-sans text-[#71717A]">
            Page {page} of {totalPages} ({total} products)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 text-[12px] font-sans font-bold border border-[#E4E4E7] hover:border-[#33450D] text-[#18181B] transition-colors">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
