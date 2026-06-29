import { Suspense } from "react"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { SortControls } from "@/components/shop/sort-controls"
import { ProductGrid } from "@/components/shop/product-grid"
import { Pagination } from "@/components/shop/pagination"
import { getProducts } from "@/lib/queries/products"
import type { ShopFilters, SortOption } from "@/types/product"
import type { Metadata } from "next"

import { getPageSeo } from "@/lib/queries/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("shop")
  return {
    title: seo?.meta_title || "Shop WW1 & WW2 Military Reproduction Gear | Warcraft Exports",
    description: seo?.meta_description || "Browse 300+ WW1 & WW2 historical reproduction gear items. Handcrafted leather holsters, canvas webbing, belts, slings & helmets. Direct from manufacturer.",
  }
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams

  const filters: ShopFilters = {
    nation: typeof sp.nation === "string" ? sp.nation : undefined,
    era: typeof sp.era === "string" ? sp.era : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
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
        {/* Page header */}
        <div className="mb-8">
          <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-1">
            Collection
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl text-leather-dark">All Products</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Suspense>
            <FilterSidebar />
          </Suspense>

          <div className="flex-1 min-w-0">
            <Suspense>
              <SortControls total={total} />
            </Suspense>
            <ProductGrid products={products} />
            <Suspense>
              <Pagination total={total} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
