import { Suspense } from "react"
import type { Metadata } from "next"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { SortControls } from "@/components/shop/sort-controls"
import { ProductGrid } from "@/components/shop/product-grid"
import { Pagination } from "@/components/shop/pagination"
import { getProducts } from "@/lib/queries/products"
import type { ShopFilters, SortOption } from "@/types/product"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Search — Warcraft Exports",
  description: "Search our catalogue of 300+ WW1 & WW2 historical reproduction gear.",
}

type SP = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""

  const filters: ShopFilters = {
    search: q,
    nation: typeof sp.nation === "string" ? sp.nation : undefined,
    era: typeof sp.era === "string" ? sp.era : undefined,
    price_min: sp.min ? Number(sp.min) : undefined,
    price_max: sp.max ? Number(sp.max) : undefined,
    in_stock: sp.stock === "1",
    sort: (typeof sp.sort === "string" ? sp.sort : "featured") as SortOption,
    page: sp.page ? Number(sp.page) : 1,
  }

  const { products, total } = await getProducts(filters)

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-1">Search Results</p>
          <h1 className="font-heading text-[40px] font-black text-leather-dark uppercase">
            {q ? `"${q}"` : "All Products"}
          </h1>
          {q && <p className="font-sans text-sm text-khaki mt-1">{total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Suspense><FilterSidebar /></Suspense>
          <div className="flex-1 min-w-0">
            <Suspense><SortControls total={total} /></Suspense>
            {products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-sans text-base text-leather-dark mb-2">No results found for &ldquo;{q}&rdquo;</p>
                <p className="font-sans text-sm text-khaki mb-6">Try different keywords, or browse all products.</p>
                <a href="/shop" className="inline-block bg-leather text-parchment font-sans font-bold text-xs uppercase tracking-widest px-8 py-3 hover:bg-leather-dark transition-colors">Browse All Products</a>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                <Suspense><Pagination total={total} /></Suspense>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
