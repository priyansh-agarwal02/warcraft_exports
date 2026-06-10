"use client"

import { useState } from "react"

interface UsWarehouseToggleProps {
  productId: string
  initialValue: boolean
}

export function UsWarehouseToggle({ productId, initialValue }: UsWarehouseToggleProps) {
  const [shipsFromUsa, setShipsFromUsa] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !shipsFromUsa
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, ships_from_usa: next }),
      })
      if (res.ok) setShipsFromUsa(next)
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={shipsFromUsa ? "Remove from US warehouse" : "Mark as US warehouse"}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
        shipsFromUsa ? "bg-[#1D70B8]" : "bg-[#D4D4D8]"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          shipsFromUsa ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  )
}
