import { HeroSection } from "@/components/home/hero-section"
import { StatsBar } from "@/components/home/stats-bar"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { ReviewsSection } from "@/components/home/reviews-section"
import { WholesaleSection } from "@/components/home/wholesale-section"
import { SoldOnStrip } from "@/components/home/sold-on-strip"
import { ShippingPartnersStrip } from "@/components/home/shipping-partners-strip"
import { TrustBadgesStrip } from "@/components/home/trust-badges-strip"
import { ProductCarousel } from "@/components/shop/product-carousel"
import { getProducts } from "@/lib/queries/products"
import Link from "next/link"
import type { Metadata } from "next"

import { getPageSeo } from "@/lib/queries/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("home")
  const title = seo?.meta_title || "WW1 & WW2 Military Uniforms & Reproduction Gear | Warcraft Exports"
  const description = seo?.meta_description || "Shop 300+ WW1 & WW2 reproduction military uniforms, German Wehrmacht jackets, US field jackets, jackboots, M1 helmets, leather holsters, rifle slings & ammo pouches. Direct from manufacturer."
  const keywords = [
    "ww2 military uniforms",
    "german ww2 uniform",
    "world war 2 uniforms",
    "ww2 german camo",
    "m43 jacket",
    "m41 field jacket",
    "us navy deck jacket",
    "jackboots",
    "jack boots",
    "garrison cap",
    "world war 2 helmets",
    "m1 helmet buy",
    "replica stahlhelm",
    "world war 2 gear",
    "ww2 military surplus",
    "ww2 army surplus",
    "ww2 reenactment shop",
    "luger holster",
    "luger p08 holster",
    "m1916 holster",
    "garand sling",
    "mosin nagant sling",
    "k98 sling",
    "mp40 magazine pouch",
    "1911 leather mag pouch",
    "ww2 german bread bag",
    "musette bag wwii",
    "puttees ww1",
    "ww1 leggings",
    "ww1 wool puttees",
    "british ww1 puttees",
    "ww1 canvas leggings",
    "us army leggings ww1",
    "British WW2 Enfield sling",
    "M1917A1 helmet liners",
    "M1910 1st aid pouches",
    "WW1 helmet",
    "German WW1 helmet",
    "WWII reenactment gear",
    "M1936 musette bag",
    "M1917A1 helmet for sale",
    "WW2 US field gear",
    "WW1 replica helmet",
    "Mauser G98 sling",
    "WW1 Brodie helmet",
    "M1 Garand bayonet reproduction",
    "reproduction military holsters",
    "WW1 Stahlhelm",
    "warcraft exports",
    "raas enterprises kanpur",
  ]

  return {
    title,
    description,
    keywords,
    alternates: { canonical: "https://www.warcraftexports.com" },
    openGraph: {
      title,
      description,
      url: "https://www.warcraftexports.com",
      siteName: "Warcraft Exports",
      type: "website",
      images: [
        {
          url: "https://www.warcraftexports.com/hero/homepage-hero.webp",
          width: 1200,
          height: 630,
          alt: "WW1 & WW2 Military Reproduction Gear",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.warcraftexports.com/hero/homepage-hero.webp"],
    },
  }
}

export default async function HomePage() {
  const { products } = await getProducts({ sort: "featured", page: 1 })

  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Sold On — Marketplace Logos */}
      <SoldOnStrip />

      {/* 3. Featured Categories */}
      <FeaturedCategories />

      {/* 4. Featured Products */}
      {products.length > 0 && (
        <section className="pt-6 pb-16 bg-parchment">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b-2 border-khaki pb-6 mb-12">
              <div>
                <p className="text-[12px] font-sans font-bold uppercase tracking-[0.12em] text-khaki mb-2">
                  Latest Arrivals
                </p>
                <h2 className="font-heading text-[32px] sm:text-[48px] leading-[1.05] tracking-[-0.02em] uppercase text-leather-dark font-black">
                  Hot Selling
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-khaki hover:text-leather-dark whitespace-nowrap transition-colors mt-1 sm:mt-0"
              >
                View All Products →
              </Link>
            </div>
            <ProductCarousel products={products} />
            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 bg-leather text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-8 py-4 border border-leather hover:bg-[#4A5D23] transition-colors"
              >
                Browse Full Catalogue
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Wholesale */}
      <WholesaleSection />

      {/* 6. Reviews */}
      <ReviewsSection />

      {/* 7. Shipping Partners — Logistics Logos */}
      <ShippingPartnersStrip />

      {/* 8. Stats Bar */}
      <StatsBar />

      {/* 9. Trust Badges */}
      <TrustBadgesStrip />
    </>
  )
}

