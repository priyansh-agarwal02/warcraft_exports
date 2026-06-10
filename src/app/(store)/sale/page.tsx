import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/products/product-card"
import { SaleBanner } from "@/components/sale/sale-banner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sale — Warcraft Exports",
  description: "Shop discounted WW1 & WW2 historical reproduction military gear. Limited time offers.",
}

export const dynamic = "force-dynamic"

async function getSaleData() {
  const supabase = await createClient()

  const [{ data: products }, { data: banner }] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, name, slug, price_usd, sale_price_usd, nation, era, is_featured,
         stock_quantity, is_on_sale, ships_from_usa,
         images:product_images(url, is_hero)`
      )
      .or("is_on_sale.eq.true,sale_price_usd.not.is.null")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("content_blocks")
      .select("value")
      .eq("key", "sale_banner")
      .single(),
  ])

  let bannerSettings = null
  if (banner?.value) {
    try {
      bannerSettings = JSON.parse(banner.value) as {
        enabled: boolean; title: string; subtitle: string
        countdownTo: string | null; bgColor: string; textColor: string; accentColor: string
      }
    } catch (e) {
      console.error("Failed to parse sale banner settings:", e)
    }
  }

  return {
    products: products ?? [],
    bannerSettings,
  }
}

export default async function SalePage() {
  const { products, bannerSettings } = await getSaleData()

  return (
    <main>
      {/* Banner */}
      <SaleBanner settings={bannerSettings} />

      {/* Page header */}
      <div className="border-b border-[#18181B] bg-[#FAFAF9]">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-heading text-[32px] md:text-[42px] uppercase tracking-[-0.02em] text-[#18181B] font-black leading-none">
                SALE
              </h1>
              <p className="text-[13px] font-sans text-[#76786B] mt-2 tracking-[0.02em]">
                {products.length} item{products.length !== 1 ? "s" : ""} on sale
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-red-600">
                Limited time offers
              </p>
              <p className="text-[11px] font-sans text-[#76786B] mt-0.5">
                Free shipping over $150
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-[13px] font-sans text-[#76786B] uppercase tracking-[0.12em]">
              No sale items right now
            </div>
            <p className="text-[12px] font-sans text-[#A1A1AA] mt-2">
              Check back soon for special offers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p) => {
              const heroImage = (p.images as { url: string; is_hero: boolean }[])?.find((i) => i.is_hero)?.url
                ?? (p.images as { url: string; is_hero: boolean }[])?.[0]?.url
                ?? null
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  priceUsd={p.price_usd}
                  salePriceUsd={p.sale_price_usd}
                  heroImageUrl={heroImage}
                  nation={p.nation}
                  era={p.era}
                  isFeatured={p.is_featured}
                  isInStock={(p.stock_quantity ?? 0) > 0}
                  shipsFromUsa={p.ships_from_usa}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
