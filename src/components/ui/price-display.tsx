"use client"
import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  priceUsd: number
  salePriceUsd?: number | null
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

// Simple client-side currency formatting — full Zustand store added in Phase 6
export function PriceDisplay({ priceUsd, salePriceUsd, className, size = "md" }: PriceDisplayProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)

  const hasDiscount = salePriceUsd && salePriceUsd < priceUsd

  return (
    <div className={cn("flex items-baseline gap-2 font-heading", className)}>
      <span className={cn(sizes[size], "text-leather-dark font-800")}>
        {fmt(hasDiscount ? salePriceUsd! : priceUsd)}
      </span>
      {hasDiscount && (
        <span className={cn("text-khaki line-through", size === "xl" ? "text-xl" : "text-sm")}>
          {fmt(priceUsd)}
        </span>
      )}
    </div>
  )
}
