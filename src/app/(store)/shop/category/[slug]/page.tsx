import { Suspense } from "react"
import { notFound } from "next/navigation"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { SortControls } from "@/components/shop/sort-controls"
import { ProductGrid } from "@/components/shop/product-grid"
import { Pagination } from "@/components/shop/pagination"
import { getProducts, getCategoryBySlug } from "@/lib/queries/products"
import type { ShopFilters, SortOption } from "@/types/product"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface CategorySeoInfo {
  title: string
  description: string
  keywords: string[]
}

const CATEGORY_SEO_MAP: Record<string, CategorySeoInfo> = {
  slings: {
    title: "WW1 & WW2 Gun Slings | M1 Garand, Kar98k, 1907 Pattern, Kerr Leather Slings",
    description: "Shop authentic reproduction WW1 & WW2 rifle slings. Hand-stitched 1907 pattern leather slings, M1 Garand canvas web slings, Kar98k Mauser slings, and 1-inch buffalo leather straps. Free shipping over $50.",
    keywords: ["m1 garand sling", "1907 pattern leather sling", "kar98k sling", "kerr sling", "m1 carbine sling", "leather rifle sling", "ww2 gun slings", "buffalo leather rifle strap", "military reproduction slings"],
  },
  holsters: {
    title: "WW1 & WW2 Military & Western Holsters | Leather Revolver, Webley, Luger, M3",
    description: "Handcrafted leather military and western cowboy holsters. Authentic reproductions for Webley .455, German Luger P08, M3 shoulder rigs, and tooled western revolvers. Fast worldwide delivery.",
    keywords: ["western holster", "revolver holster", "m3 shoulder holster", "webley holster", "luger holster", "colt 1911 holster", "leather revolver holster", "44 mag holster", "cowboy gun holster"],
  },
  "belts-straps": {
    title: "Military Cartridge Belts, Bandoliers & Leather Suspenders | P1903, M1923, Y-Straps",
    description: "Reproduction WW1 & WW2 cartridge belts, leather bandoliers, and heavy-duty suspenders. P-1903 British bandoliers, M1923 10-pocket Garand belts, and authentic Y-straps.",
    keywords: ["leather bandolier", "british p-1903 bandolier", "m1923 cartridge belt", "leather suspenders for men", "y strap", "m1 garand 10 pocket belt", "jawa costume bandolier"],
  },
  uniforms: {
    title: "WW1 & WW2 Military Reproduction Uniforms | British, US & German Battle Dress",
    description: "Authentic WW1 and WW2 reproduction military uniforms. British Pattern 37 tunics, US field uniforms, and German battle dress tailored from accurate historical wool and cotton.",
    keywords: ["ww2 reproduction uniforms", "british 37 pattern tunic", "ww2 reenactment uniforms", "military battle dress", "ww1 military uniforms"],
  },
  headgear: {
    title: "Historical Military Helmets, Side Caps & Liners | WW1 & WW2 Reproductions",
    description: "Military reproduction headgear including M1917A1 helmet liners, side caps, and field caps for US, British, and Commonwealth reenactment kits.",
    keywords: ["m1917a1 helmet liners", "ww1 helmet", "side cap", "ww2 headgear", "military reenactment caps"],
  },
  "bags-satchels": {
    title: "WW1 & WW2 Military Bags & Satchels | Musette Bags, Thompson Cal Bags",
    description: "Authentic reproduction military canvas bags and field satchels. M1936 musette bags, Thompson submachine gun cal bags, and haversacks crafted to military specs.",
    keywords: ["m1936 musette bag", "thompson cal bag", "grease gun bag", "military satchel", "canvas field bag", "ww2 military bag"],
  },
  equipment: {
    title: "WW1 & WW2 Field Equipment & Pouches | First Aid, MP40 Pouches, Puttees",
    description: "Field gear, canvas pouches, first aid kits, MP40 magazine pouches, chest rigs, and puttees leg wraps. Direct manufacturer reproductions for collectors and reenactors.",
    keywords: ["first aid pouch", "mp40 pouch set", "puttees leg wraps", "gaiters for hiking", "military surplus reproduction", "chicom chest rig", "1911 mag pouch"],
  },
  collectibles: {
    title: "Historical Military Collectibles & Keepsakes | Warcraft Exports",
    description: "Handcrafted historical collectibles, militaria memorabilia, and handcrafted wooden keepsake urns by Warcraft Exports.",
    keywords: ["militaria collectibles", "military reproduction memorabilia", "wooden keepsake urns", "dog urn", "pet urn"],
  },
  "optics-accessories": {
    title: "Vintage Optics Covers & Leather Scope Accessories | Warcraft Exports",
    description: "Leather scope covers and vintage optics accessories designed for historical rifles including Mauser, Enfield, and Springfield models.",
    keywords: ["rifle scope covers leather", "vintage optics accessories", "mauser scope mount", "k98 optics"],
  },
  "weapon-cases": {
    title: "Military Rifle Scabbards & Canvas Weapon Cases | M1 Garand, Carbine Covers",
    description: "Heavy-duty canvas and leather rifle scabbards. Fleece-lined M1 Carbine carry cases, Garand rifle scabbards, and historical long gun covers.",
    keywords: ["m1 garand rifle scabbard", "m1 carbine case", "canvas rifle case", "leather rifle scabbard", "gun scabbard"],
  },
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  const seo = CATEGORY_SEO_MAP[slug]
  const title = seo ? `${seo.title} | Warcraft Exports` : `${category.name} — Historical Military Reproductions | Warcraft Exports`
  const description = seo ? seo.description : (category.description ?? `Browse authentic ${category.name} historical military reproduction gear. Manufacturer-direct from Warcraft Exports. Ships worldwide.`)
  const keywords = seo ? seo.keywords : [category.name.toLowerCase(), "military reproduction", "ww2 gear", "ww1 gear", "warcraft exports"]

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://www.warcraftexports.com/shop/category/${slug}`,
      siteName: "Warcraft Exports",
    },
    alternates: { canonical: `https://www.warcraftexports.com/shop/category/${slug}` },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await params
  const sp = await searchParams

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const filters: ShopFilters = {
    category: slug,
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
          <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-1">
            Category
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl text-leather-dark">{category.name}</h1>
          {category.description && (
            <p className="text-sm text-leather/60 mt-2 max-w-xl">{category.description}</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <Suspense>
            <FilterSidebar lockedCategory={slug} />
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
