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

const NATION_META: Record<string, { label: string; title: string; description: string; keywords: string[] }> = {
  us: {
    label: "American Gear",
    title: "US WW1 & WW2 Military Reproduction Gear | M1 Garand, Holsters & Webbing",
    description: "Authentic US Army reproduction militaria for WW1 & WW2. Handcrafted M1 Garand slings, 1907 leather slings, M3 shoulder holsters, M1923 cartridge belts, and reenactment kits.",
    keywords: ["us militaria reproduction", "ww2 us gear", "m1 garand sling", "1907 pattern sling", "m3 shoulder holster", "m1 carbine accessories", "colt 1911 magazine pouch", "us army reenactment"],
  },
  german: {
    label: "German Gear",
    title: "German WW1 & WW2 Militaria Reproductions | Kar98k, Luger, MP40 & P08 Holsters",
    description: "Authentic Wehrmacht and Imperial German reproduction gear. Kar98k leather slings, Luger P08 holsters, MP40 pouch sets, and field equipment crafted to strict historical patterns.",
    keywords: ["german militaria", "ww2 german gear", "kar98k leather rifle sling", "luger holster", "mp40 pouch set", "german ww1 helmet", "mauser sling keeper", "german reenactment gear"],
  },
  british: {
    label: "British Gear",
    title: "British Army WW1 & WW2 Reproduction Gear | Webley, P1903 Bandoliers & Slings",
    description: "British Army WW1 & WW2 reproduction leather and canvas equipment. Authentic Webley .455 holsters, P-1903 5-pocket and 9-pocket bandoliers, Enfield slings, and Pattern 37 uniforms.",
    keywords: ["british militaria", "british ww2 enfield sling", "webley holster", "british p-1903 bandolier", "leather bandolier belt", "british 37 pattern tunic", "martini henry accessories"],
  },
  japanese: {
    label: "Japanese Gear",
    title: "Imperial Japanese Army Reproduction Militaria & Gear | Warcraft Exports",
    description: "Imperial Japanese Army (IJA) WW2 reproduction leather equipment, Arisaka slings, ammunition pouches, and field collectibles.",
    keywords: ["japanese militaria", "ww2 japanese gear", "arisaka sling", "ija reproduction equipment"],
  },
  soviet: {
    label: "Soviet Gear",
    title: "Soviet Red Army WW2 Reproduction Militaria & Field Gear | Warcraft Exports",
    description: "Red Army WW2 reproduction gear, Mosin Nagant accessories, Tokarev holsters, and Soviet reenactment supplies.",
    keywords: ["soviet militaria", "red army gear", "ww2 soviet reproduction", "mosin nagant sling"],
  },
  french: {
    label: "French Gear",
    title: "French Army WW1 & WW2 Historical Reproduction Equipment | Warcraft Exports",
    description: "French Army WW1 & WW2 historical reproduction leather holsters, Lebel accessories, and field equipment.",
    keywords: ["french militaria", "french ww1 gear", "historical military reproduction"],
  },
  italian: {
    label: "Italian Gear",
    title: "Italian Army WW2 Historical Reproduction Gear & Holsters | Warcraft Exports",
    description: "Italian Army WW2 historical reproduction leather holsters, Carcano accessories, and militaria collectibles.",
    keywords: ["italian militaria", "ww2 italian gear", "beretta holster reproduction"],
  },
  universal: {
    label: "Universal Gear",
    title: "Universal Military & Western Leather Gear, Slings & Suspenders | Warcraft Exports",
    description: "Cross-era historical reproduction gear, western cowboy holsters, heavy-duty leather suspenders, and rifle scabbards.",
    keywords: ["western holster", "leather suspenders for men", "buffalo leather rifle sling", "gun scabbard", "historical reproduction gear"],
  },
}

type Params = Promise<{ nation: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { nation } = await params
  const meta = NATION_META[nation.toLowerCase()]
  if (!meta) return {}
  return {
    title: `${meta.title} | Warcraft Exports`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.title} | Warcraft Exports`,
      description: meta.description,
      url: `https://www.warcraftexports.com/shop/nation/${nation.toLowerCase()}`,
      siteName: "Warcraft Exports",
    },
    alternates: { canonical: `https://www.warcraftexports.com/shop/nation/${nation.toLowerCase()}` },
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
