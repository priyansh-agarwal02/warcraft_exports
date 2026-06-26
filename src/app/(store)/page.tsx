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

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Warcraft Exports — Historical Reproduction Military Gear",
  description:
    "Manufacturer-direct WW1 & WW2 historical reproduction gear. 300+ products. Ships worldwide from Kanpur, India.",
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
            <div className="flex justify-between items-end border-b-2 border-khaki pb-6 mb-12">
              <div>
                <p className="text-[12px] font-sans font-bold uppercase tracking-[0.12em] text-khaki mb-2">
                  Latest Arrivals
                </p>
                <h2 className="font-heading text-[48px] leading-[1.05] tracking-[-0.02em] uppercase text-leather-dark font-black">
                  Hot Selling
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-khaki hover:text-leather-dark whitespace-nowrap transition-colors"
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

