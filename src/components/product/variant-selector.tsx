"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ProductDetail } from "@/types/product"

type Variant = ProductDetail["variants"][number]

interface VariantSelectorProps {
  variants: Variant[]
  onVariantChange: (id: string | null) => void
}

export function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const colors = variants.filter((v) => v.color)
  const sizes = variants.filter((v) => v.size)

  function handleSelect(variant: Variant) {
    if ((variant.stock_quantity ?? 0) <= 0) return
    const next = selectedId === variant.id ? null : variant.id
    setSelectedId(next)
    onVariantChange(next)
  }

  if (colors.length === 0 && sizes.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 && (
        <div>
          <p className="text-[11px] font-sans font-bold text-leather-dark uppercase tracking-[0.12em] mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((v) => (
              <button
                key={v.id}
                disabled={(v.stock_quantity ?? 0) <= 0}
                onClick={() => handleSelect(v)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-sans border transition-colors cursor-pointer",
                  selectedId === v.id
                    ? "bg-leather text-white border-leather"
                    : "bg-transparent text-leather-dark border-khaki hover:border-leather",
                  (v.stock_quantity ?? 0) <= 0 && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {v.color}
              </button>
            ))}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="text-[11px] font-sans font-bold text-leather-dark uppercase tracking-[0.12em] mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((v) => (
              <button
                key={v.id}
                disabled={(v.stock_quantity ?? 0) <= 0}
                onClick={() => handleSelect(v)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-sans border transition-colors cursor-pointer",
                  selectedId === v.id
                    ? "bg-leather text-white border-leather"
                    : "bg-transparent text-leather-dark border-khaki hover:border-leather",
                  (v.stock_quantity ?? 0) <= 0 && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
