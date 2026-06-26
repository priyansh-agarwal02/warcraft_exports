"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  productId, productName, slug, heroImage, priceUsd, maxQuantity,
  selectedVariantId, variantLabel, isInStock, quantity = 1, shipsFromUsa,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  function handleClick() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId, productName, slug, heroImage, priceUsd, maxQuantity,
        variantId: selectedVariantId, variantLabel,
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
    // MOTION: Spring press + success state crossfade
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`w-full py-3 px-6 text-sm font-semibold uppercase tracking-widest transition-colors ${
        added
          ? "bg-[#33450D] text-white"
          : "bg-leather text-parchment hover:bg-leather-dark"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={added ? "added" : "add"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {added ? "✓ Added to Cart!" : `Add ${quantity > 1 ? `${quantity} ` : ""}to Cart`}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
