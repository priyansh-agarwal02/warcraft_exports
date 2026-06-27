"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { X, SlidersHorizontal } from "lucide-react"
import { siteConfig } from "@/config/site.config"

const CATEGORIES = [
  { name: "Holsters", slug: "holsters" },
  { name: "Slings", slug: "slings" },
  { name: "Collectibles", slug: "collectibles" },
  { name: "Field Equipment", slug: "equipment" },
  { name: "Military Cases", slug: "military-cases" },
  { name: "Belts & Straps", slug: "belts-straps" },
  { name: "Headgear", slug: "headgear" },
  { name: "Bags & Satchels", slug: "bags-satchels" },
  { name: "Uniforms", slug: "uniforms" },
  { name: "Canvas Gear", slug: "canvas-gear" },
  { name: "Optics & Accessories", slug: "optics-accessories" },
]

interface FilterSidebarProps {
  lockedNation?: string
  lockedEra?: string
  lockedCategory?: string
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <span
        className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? "bg-leather border-leather" : "bg-card-white border-khaki group-hover:border-leather"
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 8 8">
            <path
              d="M1.5 4L3.5 6L7 2"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`text-sm font-sans ${
          checked ? "text-leather-dark font-medium" : "text-muted-text group-hover:text-leather-dark"
        }`}
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
    </label>
  )
}

function ActiveChips({
  currentNation,
  currentEra,
  currentCategory,
  currentStock,
  currentMin,
  currentMax,
  lockedNation,
  lockedEra,
  lockedCategory,
  onRemove,
}: {
  currentNation: string
  currentEra: string
  currentCategory: string
  currentStock: boolean
  currentMin: string
  currentMax: string
  lockedNation?: string
  lockedEra?: string
  lockedCategory?: string
  onRemove: (key: string) => void
}) {
  const chips: { key: string; label: string }[] = []
  if (!lockedNation && currentNation) chips.push({ key: "nation", label: `Nation: ${currentNation}` })
  if (!lockedEra && currentEra) chips.push({ key: "era", label: `Era: ${currentEra}` })
  if (!lockedCategory && currentCategory) {
    const catName = CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory
    chips.push({ key: "category", label: `Category: ${catName}` })
  }
  if (currentStock) chips.push({ key: "stock", label: "In Stock" })
  if (currentMin) chips.push({ key: "min", label: `Min $${currentMin}` })
  if (currentMax) chips.push({ key: "max", label: `Max $${currentMax}` })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="flex items-center gap-1 bg-chip border border-khaki text-[10px] font-sans font-bold uppercase tracking-[0.08em] text-leather-dark px-2 py-1 hover:border-leather transition-colors"
        >
          {chip.label}
          <X size={8} />
        </button>
      ))}
    </div>
  )
}

function FilterContent({
  lockedNation,
  lockedEra,
  lockedCategory,
  onClearAll,
}: {
  lockedNation?: string
  lockedEra?: string
  lockedCategory?: string
  onClearAll: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentNation = searchParams.get("nation") ?? ""
  const currentEra = searchParams.get("era") ?? ""
  const currentCategory = searchParams.get("category") ?? ""
  const currentStock = searchParams.get("stock") === "1"
  const currentMin = searchParams.get("min") ?? ""
  const currentMax = searchParams.get("max") ?? ""

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const removeChip = (key: string) => updateParam(key, null)

  const hasActiveFilters = [
    !lockedNation && currentNation,
    !lockedEra && currentEra,
    !lockedCategory && currentCategory,
    currentStock,
    currentMin,
    currentMax,
  ].some(Boolean)

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-leather-dark">
          Filters
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-[10px] text-muted-text hover:text-leather-dark flex items-center gap-1 transition-colors"
          >
            <X size={10} /> Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      <ActiveChips
        currentNation={currentNation}
        currentEra={currentEra}
        currentCategory={currentCategory}
        currentStock={currentStock}
        currentMin={currentMin}
        currentMax={currentMax}
        lockedNation={lockedNation}
        lockedEra={lockedEra}
        lockedCategory={lockedCategory}
        onRemove={removeChip}
      />

      {/* Nation */}
      {!lockedNation && (
        <div>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-leather-dark border-b border-khaki pb-1 mb-3">
            Nation
          </p>
          <div className="space-y-2.5">
            {siteConfig.navNations.map((nation) => (
              <CheckRow
                key={nation}
                label={nation}
                checked={currentNation === nation}
                onChange={(checked) => updateParam("nation", checked ? nation : null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Era */}
      {!lockedEra && (
        <div>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-leather-dark border-b border-khaki pb-1 mb-3">
            Era
          </p>
          <div className="space-y-2.5">
            {(["WW1", "WW2"] as const).map((era) => (
              <CheckRow
                key={era}
                label={era}
                checked={currentEra === era}
                onChange={(checked) => updateParam("era", checked ? era : null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      {!lockedCategory && (
        <div>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-leather-dark border-b border-khaki pb-1 mb-3">
            Category
          </p>
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {CATEGORIES.map((c) => (
              <CheckRow
                key={c.slug}
                label={c.name}
                checked={currentCategory === c.slug}
                onChange={(checked) => updateParam("category", checked ? c.slug : null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div>
        <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-leather-dark border-b border-khaki pb-1 mb-3">
          Availability
        </p>
        <CheckRow
          label="In Stock Only"
          checked={currentStock}
          onChange={(checked) => updateParam("stock", checked ? "1" : null)}
        />
      </div>

      {/* Price Range */}
      <div>
        <p className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-leather-dark border-b border-khaki pb-1 mb-3">
          Price (USD)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMin}
            onChange={(e) => updateParam("min", e.target.value || null)}
            className="bg-parchment border border-khaki text-xs p-2 rounded-none w-full text-leather-dark placeholder:text-khaki focus:outline-none focus:border-leather"
          />
          <span className="text-muted-text text-xs flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMax}
            onChange={(e) => updateParam("max", e.target.value || null)}
            className="bg-parchment border border-khaki text-xs p-2 rounded-none w-full text-leather-dark placeholder:text-khaki focus:outline-none focus:border-leather"
          />
        </div>
        {/* Apply Filters CTA */}
        <button
          onClick={() => {/* filters apply in real time via URL params */}}
          className="w-full py-2.5 bg-leather text-parchment text-[11px] font-sans font-bold uppercase tracking-[0.15em] mt-4 hover:bg-olive-light transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}

export function FilterSidebar({ lockedNation, lockedEra, lockedCategory }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const clearAll = () => {
    router.push(pathname)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-zinc border-r-2 border-border-dark pr-6 py-6 pl-0 min-h-[60vh]">
          <FilterContent
            lockedNation={lockedNation}
            lockedEra={lockedEra}
            lockedCategory={lockedCategory}
            onClearAll={clearAll}
          />
        </div>
      </aside>

      {/* Mobile trigger button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-[0.1em] border border-khaki text-leather-dark hover:border-leather transition-colors"
        >
          <SlidersHorizontal size={12} />
          Filters
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-zinc p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-sm font-bold text-leather-dark uppercase tracking-[0.1em]">
                Filters
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-muted-text hover:text-leather-dark transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <FilterContent
              lockedNation={lockedNation}
              lockedEra={lockedEra}
              lockedCategory={lockedCategory}
              onClearAll={clearAll}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full py-3 bg-leather text-parchment text-xs font-sans font-bold uppercase tracking-[0.15em] hover:bg-olive-light transition-colors"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  )
}
