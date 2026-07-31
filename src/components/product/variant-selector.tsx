"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ProductDetail } from "@/types/product"

type Variant = ProductDetail["variants"][number]

interface VariantSelectorProps {
  variants: Variant[]
  onVariantChange: (id: string | null) => void
}

export function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Auto-select the first in-stock variant on mount/load if available
  useEffect(() => {
    if (!selectedId && variants.length > 0) {
      const firstInStock = variants.find((v) => (v.stock_quantity ?? 0) > 0) || variants[0]
      if (firstInStock) {
        setSelectedId(firstInStock.id)
        onVariantChange(firstInStock.id)
      }
    }
  }, [variants])

  const colors = variants.filter((v) => v.color)
  const sizes = variants.filter((v) => v.size)

  const activeVariant = variants.find((v) => v.id === selectedId)

  function handleSelect(variant: Variant) {
    if ((variant.stock_quantity ?? 0) <= 0) return
    setSelectedId(variant.id)
    onVariantChange(variant.id)
  }

  if (colors.length === 0 && sizes.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 && (
        <div>
          <p className="text-[11px] font-sans font-bold text-leather-dark uppercase tracking-[0.12em] mb-2">
            Color: <span className="font-normal text-leather">{activeVariant?.color || colors[0]?.color}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((v) => (
              <button
                key={v.id}
                disabled={(v.stock_quantity ?? 0) <= 0}
                onClick={() => handleSelect(v)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[12px] font-sans border transition-colors cursor-pointer rounded-sm",
                  selectedId === v.id
                    ? "bg-leather text-white border-leather shadow-sm"
                    : "bg-transparent text-leather-dark border-khaki hover:border-leather",
                  (v.stock_quantity ?? 0) <= 0 && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {v.image_url && (
                  <span className="w-5 h-5 rounded-full overflow-hidden border border-khaki/50 flex-shrink-0">
                    <Image src={v.image_url} alt={v.color || "Color"} width={20} height={20} className="w-full h-full object-cover" />
                  </span>
                )}
                <span>{v.color}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="text-[11px] font-sans font-bold text-leather-dark uppercase tracking-[0.12em] mb-2">
            Size: <span className="font-normal text-leather">{activeVariant?.size || sizes[0]?.size}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((v) => (
              <button
                key={v.id}
                disabled={(v.stock_quantity ?? 0) <= 0}
                onClick={() => handleSelect(v)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-sans border transition-colors cursor-pointer rounded-sm",
                  selectedId === v.id
                    ? "bg-leather text-white border-leather shadow-sm"
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
