"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { useWishlistStore } from "@/lib/wishlist"
import { useState, useEffect } from "react"

export interface ProductCardProps {
  id: string
  slug: string
  name: string
  priceUsd: number
  salePriceUsd?: number | null
  heroImageUrl?: string | null
  nation: string
  era?: string
  isFeatured?: boolean
  isInStock?: boolean
  className?: string
  shipsFromUsa?: boolean
}

export function ProductCard({
  id, slug, name, priceUsd, salePriceUsd, heroImageUrl, nation,
  isFeatured, isInStock = true, className, shipsFromUsa,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { format } = useCurrency()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const wishlistLoad = useWishlistStore((s) => s.load)
  const wishlistToggle = useWishlistStore((s) => s.toggle)
  const wishlisted = useWishlistStore((s) => s.has(id))
  const wishlistUserId = useWishlistStore((s) => s.userId)
  const wishlistLoaded = useWishlistStore((s) => s.loaded)

  useEffect(() => { wishlistLoad() }, [wishlistLoad])

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: id,
      productName: name,
      slug,
      heroImage: heroImageUrl ?? null,
      priceUsd: salePriceUsd ?? priceUsd,
      maxQuantity: 99,
      variantId: null,
      variantLabel: null,
      shipsFromUsa: shipsFromUsa ?? false,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!wishlistLoaded) return
    if (!wishlistUserId) {
      router.push(`/auth/login?next=/product/${slug}`)
      return
    }
    if (wishlistLoading) return
    setWishlistLoading(true)
    try { await wishlistToggle(id) }
    finally { setWishlistLoading(false) }
  }

  return (
    // MOTION: Card lifts on hover with subtle shadow — mobile-safe (no hover on touch)
    <motion.div
      className={cn("group flex flex-col", className)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link href={`/product/${slug}`} className="flex flex-col flex-1">
        <article className="bg-card-white border border-khaki flex flex-col hover:border-leather transition-colors duration-200 h-full">
          {/* Image area */}
          <div className="relative overflow-hidden bg-canvas border-b border-khaki" style={{ aspectRatio: "4/3" }}>
            {heroImageUrl ? (
              // MOTION: Image subtly scales up on hover
              <motion.img
                src={heroImageUrl}
                alt={name}
                className="object-cover w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#76786B" strokeWidth="1" className="opacity-40">
                  <rect x="3" y="3" width="18" height="18" rx="0"/>
                  <path d="M3 9l4-4 4 4 4-4 4 4"/>
                  <path d="M3 15l4 4 4-4 4 4 4-4"/>
                </svg>
                <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-khaki">No Image</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {shipsFromUsa && (
                <span className="bg-[#1D70B8] text-white text-[11px] font-sans font-bold uppercase tracking-[0.03em] px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                  <img src="/images/us-flag.png" alt="USA Flag" className="w-4 h-2.5 object-cover shrink-0" />
                  Ships from USA
                </span>
              )}
              {isFeatured && (
                <span className="bg-gold text-[#484000] text-[10px] font-sans font-bold uppercase tracking-[0.03em] px-2 py-0.5 w-fit">
                  Featured
                </span>
              )}
              {salePriceUsd && (
                <span className="bg-[#18181B] text-white text-[10px] font-sans font-bold uppercase tracking-[0.03em] px-2 py-0.5 w-fit">
                  Sale
                </span>
              )}
            </div>

            {/* MOTION: Wishlist heart — burst on toggle */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 1.4 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className={cn(
                "absolute top-2 right-2 w-8 h-8 flex items-center justify-center border transition-colors z-10",
                wishlisted
                  ? "bg-leather border-leather text-parchment"
                  : "bg-white/80 border-khaki/60 text-leather hover:border-leather hover:text-leather"
              )}
              aria-label="Add to wishlist"
            >
              <motion.div
                animate={wishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart size={14} className={wishlisted ? "fill-parchment" : ""} />
              </motion.div>
            </motion.button>
          </div>

          {/* Info */}
          <div className="px-3 pt-3 pb-2 flex flex-col flex-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.05em] text-muted-text mb-1">
              {nation}
            </span>
            <h3 className="font-heading text-[14px] leading-tight text-leather-dark mb-2 flex-1 line-clamp-2">
              {name}
            </h3>
            <div className="flex items-center justify-between border-t border-khaki pt-2">
              <div className="flex items-baseline gap-1.5">
                {salePriceUsd ? (
                  <>
                    <span className="font-sans font-bold text-[15px] text-leather-dark" suppressHydrationWarning>{format(salePriceUsd)}</span>
                    <span className="font-sans text-[12px] text-khaki line-through" suppressHydrationWarning>{format(priceUsd)}</span>
                  </>
                ) : (
                  <span className="font-sans font-bold text-[15px] text-leather-dark" suppressHydrationWarning>{format(priceUsd)}</span>
                )}
              </div>
              {isInStock ? (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-leather flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-leather rounded-full inline-block" />
                  In Stock
                </span>
              ) : (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-khaki">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>

      {/* MOTION: Add to Cart — spring tap + success pulse */}
      <motion.button
        onClick={handleAddToCart}
        disabled={!isInStock}
        whileHover={isInStock ? { scale: 1.01 } : {}}
        whileTap={isInStock ? { scale: 0.96 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          "w-full text-[11px] font-sans font-bold uppercase tracking-[0.12em] py-2.5 flex justify-center items-center gap-2 cursor-pointer border-x border-b transition-colors",
          isInStock
            ? added
              ? "bg-[#33450D] text-white border-[#33450D]"
              : "bg-leather text-white border-leather hover:bg-leather-dark hover:border-leather-dark"
            : "bg-khaki/20 text-khaki border-khaki cursor-not-allowed"
        )}
      >
        {/* MOTION: Cart icon spins briefly when added */}
        <motion.div
          animate={added ? { rotate: [0, -15, 15, -10, 10, 0] } : { rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ShoppingCart size={14} />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span
            key={added ? "added" : "add"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {!isInStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("block", className)}>
      <div className="bg-card-white border border-khaki">
        <div className="bg-canvas animate-pulse" style={{ aspectRatio: "4/3" }} />
        <div className="p-3 space-y-2">
          <div className="h-2.5 w-14 bg-parchment-dark animate-pulse" />
          <div className="h-3.5 w-full bg-parchment-dark animate-pulse" />
          <div className="h-3.5 w-3/4 bg-parchment-dark animate-pulse" />
          <div className="border-t border-khaki pt-2 mt-2">
            <div className="h-4 w-16 bg-parchment-dark animate-pulse" />
          </div>
        </div>
      </div>
      <div className="h-9 bg-parchment-dark animate-pulse" />
    </div>
  )
}
