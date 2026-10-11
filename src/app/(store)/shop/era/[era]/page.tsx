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

const ERA_META: Record<string, { label: string; title: string; description: string; keywords: string[] }> = {
  ww1: {
    label: "WW1 Collection",
    title: "WW1 Military Reproduction Gear | Great War Uniforms, Holsters & Leather Belts",
    description: "Authentic WW1 Great War reproduction military gear. Hand-stitched leather holsters, canvas pouches, Brodie helmet liners, and equipment from 1914–1918.",
    keywords: ["ww1 gear", "ww1 reproduction", "great war militaria", "ww1 helmet", "ww1 leather holsters", "ww1 reenactment supplies", "1907 pattern sling"],
  },
  ww2: {
    label: "WW2 Collection",
    title: "WW2 Military Reproduction Gear | WWII Holsters, Slings, Belts & Field Equipment",
    description: "Shop 300+ authentic WWII military reproductions. US, German, British, Soviet, and Japanese gear. Manufacturer-direct from Warcraft Exports with free shipping over $50.",
    keywords: ["ww2 gear", "ww2 militaria reproductions", "world war 2 gear for sale", "ww2 surplus reproduction", "ww2 reenactment gear", "m1 garand sling", "kar98k sling", "m3 shoulder holster"],
  },
  "cold-war": {
    label: "Cold War Collection",
    title: "Cold War Military Reproduction Gear & Tactical Surplus | Warcraft Exports",
    description: "Post-WWII military reproduction gear from the Cold War era. Authentic field gear, webbing, and collectible accessories.",
    keywords: ["cold war militaria", "cold war gear", "chicom chest rig", "military surplus reproduction"],
  },
  "modern-tactical": {
    label: "Modern Tactical",
    title: "Modern Tactical Gear, Holsters & Range Accessories | Warcraft Exports",
    description: "Modern-era tactical gear, heavy-duty leather gun belts, and rugged range accessories built to demanding field standards.",
    keywords: ["tactical gear", "range accessories", "heavy duty gun belts", "leather holsters"],
  },
  universal: {
    label: "Universal Collection",
    title: "Universal Military Reproduction Gear, Slings & Leather Straps | Warcraft Exports",
    description: "Cross-era historical reproduction gear, buffalo leather rifle straps, and accessories for collectors, hunters, and living historians.",
    keywords: ["leather rifle sling", "hunting rifle strap", "buffalo leather sling", "historical reproduction gear"],
  },
}

type Params = Promise<{ era: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { era } = await params
  const meta = ERA_META[era.toLowerCase()]
  if (!meta) return {}
  return {
    title: `${meta.title} | Warcraft Exports`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.title} | Warcraft Exports`,
      description: meta.description,
      url: `https://www.warcraftexports.com/shop/era/${era.toLowerCase()}`,
      siteName: "Warcraft Exports",
    },
    alternates: { canonical: `https://www.warcraftexports.com/shop/era/${era.toLowerCase()}` },
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
