"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/cart"

export function CartIcon() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative p-2.5 text-leather-dark hover:text-leather transition-colors"
      aria-label="Cart"
    >
      <ShoppingBag size={20} />
      {mounted && totalItems > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-leather text-parchment text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  )
}
