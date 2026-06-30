"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, X, Minus, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CartIcon() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems())
  const subtotalUsd = useCartStore((s) => s.subtotalUsd())
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  
  const { format } = useCurrency()
  const [prevItems, setPrevItems] = useState(0)
  const [bounce, setBounce] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Trigger bounce animation whenever cart count increases
  useEffect(() => {
    if (!mounted) return
    if (totalItems > prevItems) {
      setBounce(true)
      const t = setTimeout(() => setBounce(false), 600)
      return () => clearTimeout(t)
    }
    setPrevItems(totalItems)
  }, [totalItems, mounted])

  return (
    <div
      onMouseEnter={() => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
          setIsOpen(true)
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
          setIsOpen(false)
        }
      }}
      className="relative inline-block"
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger className="relative p-1.5 sm:p-2.5 text-leather-dark hover:text-leather transition-colors cursor-pointer outline-none block focus:outline-none" aria-label="Cart">
          {/* MOTION: Icon scales slightly on hover, taps down on click */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative"
          >
            {/* MOTION: Bag icon bounces when item is added */}
            <motion.div
              animate={bounce ? { scale: [1, 1.35, 0.9, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >
              <ShoppingBag size={20} />
            </motion.div>

            {/* MOTION: Badge pops in/out with spring */}
            <AnimatePresence>
              {mounted && totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-leather text-parchment text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          alignOffset={-32}
          className="w-80 mt-1.5 border-[#76786B] bg-white select-none overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 p-0"
          onMouseEnter={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 1024) {
              setIsOpen(true)
            }
          }}
          onMouseLeave={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 1024) {
              setIsOpen(false)
            }
          }}
        >
          {!mounted ? (
            <div className="p-4 text-center text-xs font-sans text-khaki">
              Loading cart...
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingBag size={32} className="mx-auto text-khaki mb-2" />
              <p className="font-heading text-xs font-bold uppercase tracking-wider text-leather-dark">Your cart is empty</p>
              <p className="font-sans text-[10.5px] text-khaki mt-1">Browse our collection of military gear.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-3 py-2 border-b border-khaki/30 flex justify-between items-center bg-[#FAFAF9]">
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#33450D]">Cart ({totalItems})</span>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="font-sans text-[10px] font-bold uppercase tracking-wider text-khaki hover:text-leather transition-colors"
                >
                  View Full Cart →
                </Link>
              </div>

              {/* Items List */}
              <div className="max-h-[260px] overflow-y-auto divide-y divide-khaki/20">
                {items.map((item) => {
                  const key = `${item.productId}__${item.variantId ?? "none"}`
                  return (
                    <div key={key} className="flex gap-2.5 p-3 hover:bg-[#FAFAF9]/50 transition-colors">
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 flex-shrink-0 bg-canvas border border-khaki/20 rounded-sm overflow-hidden">
                        {item.heroImage ? (
                          <img src={item.heroImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={14} className="text-khaki" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="font-sans font-bold text-[11px] text-leather-dark hover:text-leather transition-colors line-clamp-1 block"
                        >
                          {item.productName}
                        </Link>
                        {item.variantLabel && (
                          <span className="font-sans text-[9px] text-khaki block leading-tight mt-0.5">{item.variantLabel}</span>
                        )}
                        <span className="font-sans text-[10px] text-leather font-bold block mt-1">{format(item.priceUsd)}</span>
                      </div>

                      {/* Quantity & Remove Controls */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeItem(item.productId, item.variantId)
                          }}
                          className="text-leather/40 hover:text-red-600 transition-colors -mt-0.5"
                          aria-label="Remove item"
                        >
                          <X size={12} />
                        </button>
                        
                        {/* Quantity Modifier */}
                        <div
                          className="flex items-center border border-khaki/50 rounded-sm bg-white mt-2"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              updateQuantity(item.productId, item.variantId, item.quantity - 1)
                            }}
                            disabled={item.quantity <= 1}
                            className="w-5 h-5 flex items-center justify-center text-leather-dark hover:bg-[#F0F0EF] transition-colors disabled:opacity-40"
                          >
                            <Minus size={8} />
                          </button>
                          <span className="w-5 text-center text-[10px] font-sans text-leather-dark font-medium select-none">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              updateQuantity(item.productId, item.variantId, item.quantity + 1)
                            }}
                            disabled={item.quantity >= item.maxQuantity}
                            className="w-5 h-5 flex items-center justify-center text-[#1A1C1C] hover:bg-[#F0F0EF] transition-colors disabled:opacity-40"
                          >
                            <Plus size={8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Subtotal & Footer Actions */}
              <div className="border-t border-khaki/30 p-3 bg-canvas/30 space-y-2.5">
                <div className="flex justify-between items-center text-[11px] font-sans">
                  <span className="font-bold text-khaki uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold text-leather-dark text-xs">{format(subtotalUsd)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center border border-leather text-leather hover:bg-[#F0F0EF] py-2 text-[10px] font-sans font-bold uppercase tracking-[0.1em] transition-colors duration-150"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center bg-leather text-white hover:bg-[#4A5D23] py-2 text-[10px] font-sans font-bold uppercase tracking-[0.1em] transition-colors duration-150"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
