"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductCard, ProductCardSkeleton } from "@/components/products/product-card"
import type { ProductListItem } from "@/types/product"
import { PackageOpen, Hammer, RotateCcw, Compass } from "lucide-react"

interface ProductGridProps {
  products: ProductListItem[]
  isLoading?: boolean
  searchQuery?: string
}

function ProductGridEmptyState({ explicitQuery }: { explicitQuery?: string }) {
  const searchParams = useSearchParams()
  const query = (explicitQuery ?? searchParams?.get("search") ?? searchParams?.get("q") ?? "").trim()

  const contactHref = query
    ? `/contact?subject=${encodeURIComponent(`Item Request: ${query}`)}&item=${encodeURIComponent(query)}`
    : `/contact?subject=${encodeURIComponent("Custom Military Item Request")}`

  return (
    <div className="w-full py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Zero Results Notification Card */}
      <div className="bg-white border-2 border-khaki/50 p-6 sm:p-8 text-center max-w-3xl mx-auto shadow-sm">
        <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mx-auto mb-3.5 text-leather border border-khaki/40">
          <PackageOpen className="w-6 h-6 text-leather" />
        </div>

        <p className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-1.5">
          {query ? "Search Archive" : "Catalog Filter"}
        </p>

        <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-leather-dark uppercase tracking-tight mb-2">
          {query ? (
            <>No Products Found for &ldquo;{query}&rdquo;</>
          ) : (
            <>No Products Match This Selection</>
          )}
        </h3>

        <p className="font-sans text-xs sm:text-sm text-khaki max-w-lg mx-auto leading-relaxed mb-6">
          {query ? (
            <>
              We might carry this pattern under an authentic military specification designation, or our master Kanpur workshop can custom-tailor it for your impression.
            </>
          ) : (
            <>
              Try clearing active nation/era/price filters, or request custom-tailored reproduction gear directly from our master leathercraft artisans.
            </>
          )}
        </p>

        {/* Action Buttons - Fully Responsive Mobile Layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6">
          <Link
            href={contactHref}
            className="inline-flex items-center justify-center gap-2 bg-leather hover:bg-leather-dark active:bg-leather text-parchment font-sans font-bold text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] transition-colors shadow-sm cursor-pointer"
          >
            <Hammer className="w-4 h-4 shrink-0" />
            <span>Request an Item</span>
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-parchment hover:bg-khaki/20 active:bg-parchment text-leather-dark border border-khaki/70 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0 text-khaki" />
            <span>Browse All Products</span>
          </Link>
        </div>

        {/* Quick Category Jump Pills */}
        <div className="pt-4 border-t border-khaki/20">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-leather mb-2.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Popular Departments</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-sans">
            <Link
              href="/shop/category/slings"
              className="px-3 py-1.5 bg-parchment/60 hover:bg-parchment border border-khaki/40 text-leather font-medium transition-colors"
            >
              Rifle Slings
            </Link>
            <Link
              href="/shop/category/holsters"
              className="px-3 py-1.5 bg-parchment/60 hover:bg-parchment border border-khaki/40 text-leather font-medium transition-colors"
            >
              Holsters
            </Link>
            <Link
              href="/shop/category/belts-straps"
              className="px-3 py-1.5 bg-parchment/60 hover:bg-parchment border border-khaki/40 text-leather font-medium transition-colors"
            >
              Belts &amp; Bandoliers
            </Link>
            <Link
              href="/shop/category/equipment"
              className="px-3 py-1.5 bg-parchment/60 hover:bg-parchment border border-khaki/40 text-leather font-medium transition-colors"
            >
              Field Gear
            </Link>
            <Link
              href="/shop/category/weapon-cases"
              className="px-3 py-1.5 bg-parchment/60 hover:bg-parchment border border-khaki/40 text-leather font-medium transition-colors"
            >
              Weapon Cases
            </Link>
            <Link
              href="/shop/category/uniforms"
              className="px-3 py-1.5 bg-parchment/60 hover:bg-parchment border border-khaki/40 text-leather font-medium transition-colors"
            >
              Uniforms &amp; Caps
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ products, isLoading, searchQuery }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen size={40} className="text-khaki mb-4 animate-pulse" />
          <h3 className="font-heading text-xl text-leather-dark mb-2">No products found</h3>
        </div>
      }>
        <ProductGridEmptyState explicitQuery={searchQuery} />
      </Suspense>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceUsd={product.price_usd}
          salePriceUsd={product.sale_price_usd}
          heroImageUrl={product.hero_image}
          nation={product.nation ?? "Universal"}
          era={product.era ?? "WW2"}
          isFeatured={product.is_featured}
          isInStock={product.is_in_stock}
          shipsFromUsa={product.ships_from_usa}
        />
      ))}
    </div>
  )
}

