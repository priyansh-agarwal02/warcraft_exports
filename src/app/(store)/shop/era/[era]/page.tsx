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

const ERA_META: Record<string, { label: string; description: string }> = {
  ww1: {
    label: "WW1 Collection",
    description:
      "Great War reproduction gear — leather holsters, pouches, and equipment from 1914–1918.",
  },
  ww2: {
    label: "WW2 Collection",
    description: "WWII reproduction gear for all major theaters. US, German, British, Soviet, Japanese, and more.",
  },
  "cold-war": {
    label: "Cold War Collection",
    description: "Post-WWII military reproduction gear from the Cold War era.",
  },
  "modern-tactical": {
    label: "Modern Tactical",
    description: "Modern-era tactical gear and accessories.",
  },
  universal: {
    label: "Universal Collection",
    description: "Cross-era gear that suits reenactors of any period.",
  },
}

type Params = Promise<{ era: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { era } = await params
  const meta = ERA_META[era.toLowerCase()]
  if (!meta) return {}
  return {
    title: `${meta.label} — Warcraft Exports`,
    description: meta.description,
  }
}

export default async function EraPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { era } = await params
  const sp = await searchParams

  const meta = ERA_META[era.toLowerCase()]
  if (!meta) notFound()

  const filters: ShopFilters = {
    era,
    nation: typeof sp.nation === "string" ? sp.nation : undefined,
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
            Browse by Era
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl text-leather-dark">{meta.label}</h1>
          <p className="text-sm text-leather/60 mt-2 max-w-xl">{meta.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Suspense>
            <FilterSidebar lockedEra={era} />
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
