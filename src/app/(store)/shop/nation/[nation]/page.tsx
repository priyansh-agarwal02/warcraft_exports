import { Suspense } from "react"
import { notFound } from "next/navigation"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { SortControls } from "@/components/shop/sort-controls"
import { ProductGrid } from "@/components/shop/product-grid"
import { Pagination } from "@/components/shop/pagination"
import { getProducts } from "@/lib/queries/products"
import type { ShopFilters, SortOption } from "@/types/product"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

const NATION_META: Record<string, { label: string; description: string }> = {
  us: {
    label: "American Gear",
    description: "WW1 & WW2 US Army reproduction gear — holsters, belts, pouches, and reenactment sets.",
  },
  german: {
    label: "German Gear",
    description: "Wehrmacht and Imperial German reproduction gear for reenactors and collectors.",
  },
  british: {
    label: "British Gear",
    description: "British Army WW1 & WW2 reproduction leather and canvas equipment.",
  },
  japanese: {
    label: "Japanese Gear",
    description: "Imperial Japanese Army reproduction gear and collectibles.",
  },
  soviet: {
    label: "Soviet Gear",
    description: "Red Army WW2 reproduction gear for serious reenactors.",
  },
  french: {
    label: "French Gear",
    description: "French Army WW1 & WW2 historical reproduction equipment.",
  },
  italian: {
    label: "Italian Gear",
    description: "Italian Army reproduction gear for collectors.",
  },
  universal: {
    label: "Universal Gear",
    description: "Cross-era and multi-nation gear for reenactors and collectors.",
  },
}

type Params = Promise<{ nation: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { nation } = await params
  const meta = NATION_META[nation.toLowerCase()]
  if (!meta) return {}
  return {
    title: `${meta.label} — Warcraft Exports`,
    description: meta.description,
  }
}

export default async function NationPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { nation } = await params
  const sp = await searchParams

  const meta = NATION_META[nation.toLowerCase()]
  if (!meta) notFound()

  const normalizedNation = nation.charAt(0).toUpperCase() + nation.slice(1).toLowerCase()
  const filters: ShopFilters = {
    nation: normalizedNation,
    era: typeof sp.era === "string" ? sp.era : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
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
          <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-1">
            Browse by Nation
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl text-leather-dark">{meta.label}</h1>
          <p className="text-sm text-leather/60 mt-2 max-w-xl">{meta.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Suspense>
            <FilterSidebar lockedNation={nation} />
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
