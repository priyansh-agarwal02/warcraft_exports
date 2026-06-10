"use client"
import { useCurrency } from "@/lib/currency"
import { useEffect } from "react"

interface PriceProps {
  usd: number
  className?: string
  strikethrough?: boolean
}

export function Price({ usd, className, strikethrough }: PriceProps) {
  const { format, fetchRates } = useCurrency()
  useEffect(() => { fetchRates() }, [fetchRates])

  return (
    <span className={`${className ?? ""} ${strikethrough ? "line-through opacity-60" : ""}`}>
      {format(usd)}
    </span>
  )
}
