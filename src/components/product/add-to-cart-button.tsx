"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/cart"

interface AddToCartButtonProps {
  productId: string
  productName: string
  slug: string
  heroImage: string | null
  priceUsd: number
  maxQuantity: number
  selectedVariantId: string | null
  variantLabel: string | null
  isInStock: boolean
  quantity?: number
  shipsFromUsa?: boolean
}

export function AddToCartButton({
  productId,
  productName,
  slug,
  heroImage,
  priceUsd,
  maxQuantity,
  selectedVariantId,
  variantLabel,
  isInStock,
  quantity = 1,
  shipsFromUsa,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  function handleClick() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId,
        productName,
        slug,
        heroImage,
        priceUsd,
        maxQuantity,
        variantId: selectedVariantId,
        variantLabel,
        shipsFromUsa: shipsFromUsa ?? false,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (!isInStock) {
    return (
      <button
        disabled
        className="w-full py-3 px-6 bg-khaki/40 text-khaki text-sm font-semibold uppercase tracking-widest cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-3 px-6 bg-leather text-parchment text-sm font-semibold uppercase tracking-widest hover:bg-leather-dark transition-colors"
    >
      {added ? "Added to Cart!" : `Add ${quantity > 1 ? `${quantity} ` : ""}to Cart`}
    </button>
  )
}
