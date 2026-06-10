"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, CheckCircle2, Tag } from "lucide-react"
import { VariantSelector } from "@/components/product/variant-selector"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { useCurrency } from "@/lib/currency"
import type { ProductDetail } from "@/types/product"
import type { QuantityPromotion } from "@/lib/promotions"

interface ProductActionsProps {
  productId: string
  productName: string
  slug: string
  heroImage: string | null
  priceUsd: number
  salePriceUsd?: number | null
  maxQuantity: number
  variants: ProductDetail["variants"]
  isInStock: boolean
  shipsFromUsa?: boolean
}

export function ProductActions({
  productId, productName, slug, heroImage, priceUsd, salePriceUsd, maxQuantity, variants, isInStock, shipsFromUsa,
}: ProductActionsProps) {
  const { format } = useCurrency()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [promotions, setPromotions] = useState<QuantityPromotion[]>([])

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(({ promotions: data }) => setPromotions(data ?? []))
      .catch(() => {})
  }, [])

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const effectivePrice = selectedVariant?.price_override ?? salePriceUsd ?? priceUsd
  const hasPriceOverride = selectedVariant?.price_override != null && selectedVariant.price_override !== priceUsd

  const variantLabel = selectedVariant
    ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" / ")
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic price display */}
      <div className="flex items-center flex-wrap gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-sans font-bold text-[28px] text-leather-dark">
            {format(effectivePrice)}
          </span>
          {(hasPriceOverride || salePriceUsd) && effectivePrice !== priceUsd && (
            <span className="font-sans text-[18px] text-khaki line-through">
              {format(priceUsd)}
            </span>
          )}
          {(hasPriceOverride || salePriceUsd) && (
            <span className="text-[11px] font-sans font-bold bg-[#18181B] text-white px-2 py-0.5 uppercase tracking-wide">
              {hasPriceOverride ? "Variant Price" : "Sale"}
            </span>
          )}
        </div>

        {/* In Stock Badge */}
        {isInStock && (
          <div className="flex items-center gap-1.5 ml-2 mt-1">
            <CheckCircle2 size={14} className="text-white fill-[#4A5D23]" />
            <span className="text-[11px] font-sans font-bold text-[#4A5D23] uppercase tracking-wider">
              In Stock - Ready to Dispatch
            </span>
          </div>
        )}
      </div>

      {variants.length > 0 && (
        <VariantSelector variants={variants} onVariantChange={setSelectedVariantId} />
      )}

      {/* Quantity selector */}
      {isInStock && (
        <div>
          <p className="text-[11px] font-sans font-bold text-leather-dark uppercase tracking-[0.12em] mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-khaki">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center text-leather-dark hover:bg-parchment-dark transition-colors disabled:opacity-40"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-sans text-leather-dark select-none font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                className="w-9 h-9 flex items-center justify-center text-leather-dark hover:bg-parchment-dark transition-colors disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-[11px] font-sans text-khaki">
              {maxQuantity <= 10 ? `Only ${maxQuantity} left` : "In Stock"}
            </span>
          </div>
        </div>
      )}

      {/* Quantity promotion tiers */}
      {promotions.length > 0 && (
        <div className="border border-[#33450D]/25 bg-[#33450D]/5 px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-[#33450D]" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.12em] text-[#33450D]">
              Quantity Discounts — Auto-Applied at Checkout
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {promotions.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 bg-[#33450D] text-white text-[11px] font-sans font-semibold px-3 py-1"
              >
                Buy {p.min_quantity}+ · Save {p.discount_percent}%
              </span>
            ))}
          </div>
        </div>
      )}

      <AddToCartButton
        productId={productId}
        productName={productName}
        slug={slug}
        heroImage={heroImage}
        priceUsd={effectivePrice}
        maxQuantity={maxQuantity}
        selectedVariantId={selectedVariantId}
        variantLabel={variantLabel}
        isInStock={isInStock}
        quantity={quantity}
        shipsFromUsa={shipsFromUsa}
      />
    </div>
  )
}
