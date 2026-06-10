"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import type { SortOption } from "@/types/product"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

export function SortControls({
  total,
  onFilterOpen,
}: {
  total: number
  onFilterOpen?: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = (searchParams.get("sort") as SortOption) ?? "featured"

  const setSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {/* Mobile filter button */}
        {onFilterOpen && (
          <button
            onClick={onFilterOpen}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs border border-khaki/50 rounded-sm text-leather hover:border-leather transition-colors"
          >
            <SlidersHorizontal size={12} />
            Filters
          </button>
        )}
        <p className="text-xs text-leather/60">
          <span className="font-semibold text-leather-dark">{total}</span> products
        </p>
      </div>

      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-khaki/50 rounded-sm bg-parchment text-leather-dark focus:outline-none focus:border-leather cursor-pointer"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-khaki pointer-events-none"
        />
      </div>
    </div>
  )
}
