"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Tag, Settings, ChevronRight, Search, Percent } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  price_usd: number
  sale_price_usd: number | null
  is_on_sale: boolean
  stock_quantity: number
  images: { url: string }[]
}

interface BannerSettings {
  enabled: boolean
  title: string
  subtitle: string
  countdownTo: string | null
  bgColor: string
  textColor: string
  accentColor: string
}

const DEFAULT_BANNER: BannerSettings = {
  enabled: false,
  title: "SALE",
  subtitle: "Special discounts on selected items",
  countdownTo: null,
  bgColor: "#18181B",
  textColor: "#FFFFFF",
  accentColor: "#BBAC48",
}

export default function AdminSalePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [banner, setBanner] = useState<BannerSettings>(DEFAULT_BANNER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | "sale">("all")
  
  // Track temporary inputs for inline price edits
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const pRes = await fetch("/api/admin/sale/products")
        if (!pRes.ok) throw new Error(`Products load failed with status ${pRes.status}`)
        const { products: prods } = await pRes.json()
        setProducts(prods ?? [])

        const sRes = await fetch("/api/admin/sale/settings")
        if (!sRes.ok) throw new Error(`Settings load failed with status ${sRes.status}`)
        const { settings } = await sRes.json()
        if (settings) setBanner({ ...DEFAULT_BANNER, ...settings })
      } catch (e) {
        console.error("Error loading sale data:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function toggleProduct(id: string, current: boolean) {
    const next = !current
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_on_sale: next } : p)))
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_on_sale: next }),
    })
  }

  async function updateSalePrice(id: string, valStr: string) {
    const product = products.find((p) => p.id === id)
    if (!product) return

    const value = valStr.trim() === "" ? null : parseFloat(valStr)
    if (value !== null && (isNaN(value) || value < 0)) return

    // Update state
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, sale_price_usd: value } : p))
    )

    // Save to server
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, sale_price_usd: value }),
    })
  }

  async function bulkAction(action: "mark_all" | "clear_all") {
    setBulkLoading(true)
    const value = action === "mark_all"
    
    // Filter to visible search products to make it intuitive
    const visibleProducts = filteredProducts
    const visibleIds = new Set(visibleProducts.map(p => p.id))

    setProducts((prev) =>
      prev.map((p) => (visibleIds.has(p.id) ? { ...p, is_on_sale: value } : p))
    )

    await Promise.all(
      visibleProducts.map((p) =>
        fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, is_on_sale: value }),
        })
      )
    )
    setBulkLoading(false)
  }

  async function saveBannerSettings() {
    setSaving(true)
    setSavedMsg("")
    try {
      const res = await fetch("/api/admin/sale/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server responded with status ${res.status}`)
      }
      setSavedMsg("Saved successfully!")
    } catch (e: any) {
      console.error("Failed to save banner settings:", e)
      setSavedMsg(`Error: ${e.message || "Failed to save"}`)
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(""), 4000)
    }
  }


  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesTab = tab === "all" ? true : p.is_on_sale
    return matchesSearch && matchesTab
  })

  const totalSaleCount = products.filter((p) => p.is_on_sale).length

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="h-8 w-48 bg-[#F4F4F4] animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-[#F4F4F4] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1100px] space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">
            Sale Manager
          </h1>
          <p className="text-[13px] font-sans text-[#71717A] mt-0.5">
            {totalSaleCount} of {products.length} active products on sale
          </p>
        </div>
        <Link
          href="/sale"
          target="_blank"
          className="flex items-center gap-2 text-[12px] font-sans font-bold uppercase tracking-[0.1em] text-[#71717A] hover:text-[#33450D] border border-[#E4E4E7] px-4 py-2 hover:border-[#33450D] transition-colors bg-white"
        >
          Preview Sale Page
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Banner Settings */}
      <div className="bg-white border border-[#E4E4E7] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings size={16} className="text-[#71717A]" />
          <h2 className="font-sans font-bold text-[14px] uppercase tracking-[0.08em] text-[#18181B]">
            Sale Banner Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              onClick={() => setBanner((b) => ({ ...b, enabled: !b.enabled }))}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                banner.enabled ? "bg-[#33450D]" : "bg-[#D4D4D8]"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  banner.enabled ? "translate-x-[18px]" : "translate-x-[3px]"
                }`}
              />
            </button>
            <span className="text-[13px] font-sans font-bold text-[#18181B]">
              {banner.enabled ? "Banner Enabled" : "Banner Disabled"}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#71717A] mb-1.5">
              Banner Title
            </label>
            <input
              value={banner.title}
              onChange={(e) => setBanner((b) => ({ ...b, title: e.target.value }))}
              className="w-full px-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#71717A] mb-1.5">
              Subtitle
            </label>
            <input
              value={banner.subtitle}
              onChange={(e) => setBanner((b) => ({ ...b, subtitle: e.target.value }))}
              className="w-full px-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#71717A] mb-1.5">
              Countdown Target (optional)
            </label>
            <input
              type="datetime-local"
              value={banner.countdownTo ? banner.countdownTo.slice(0, 16) : ""}
              onChange={(e) =>
                setBanner((b) => ({
                  ...b,
                  countdownTo: e.target.value ? new Date(e.target.value).toISOString() : null,
                }))
              }
              className="w-full px-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            {[
              { key: "bgColor" as const, label: "BG Color" },
              { key: "textColor" as const, label: "Text Color" },
              { key: "accentColor" as const, label: "Accent Color" },
            ].map(({ key, label }) => (
              <div key={key} className="flex-1">
                <label className="block text-[11px] font-sans font-bold uppercase tracking-[0.1em] text-[#71717A] mb-1.5">
                  {label}
                </label>
                <div className="flex items-center gap-2 border border-[#E4E4E7] px-2 py-1.5 bg-white">
                  <input
                    type="color"
                    value={banner[key]}
                    onChange={(e) => setBanner((b) => ({ ...b, [key]: e.target.value }))}
                    className="w-6 h-6 cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-[11px] font-mono text-[#71717A]">{banner[key]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={saveBannerSettings}
            disabled={saving}
            className="bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.1em] px-5 py-2.5 hover:bg-[#4A5D23] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Banner Settings"}
          </button>
          {savedMsg && (
            <span className="text-[12px] font-sans text-[#33450D] font-bold">{savedMsg}</span>
          )}
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-[#E4E4E7] p-4 flex flex-wrap gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-3 py-2 text-[13px] font-sans border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex border border-[#E4E4E7]">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 text-[12px] font-sans font-bold uppercase tracking-wide transition-colors ${
              tab === "all"
                ? "bg-[#18181B] text-white"
                : "bg-white text-[#71717A] hover:bg-[#FAFAFA]"
            }`}
          >
            All Active ({products.length})
          </button>
          <button
            onClick={() => setTab("sale")}
            className={`px-4 py-2 text-[12px] font-sans font-bold uppercase tracking-wide transition-colors ${
              tab === "sale"
                ? "bg-[#18181B] text-white"
                : "bg-white text-[#71717A] hover:bg-[#FAFAFA]"
            }`}
          >
            On Sale ({totalSaleCount})
          </button>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#71717A]">
            <Tag size={14} />
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.05em]">
              Bulk (Filter):
            </span>
          </div>
          <button
            onClick={() => bulkAction("mark_all")}
            disabled={bulkLoading || filteredProducts.length === 0}
            className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Put on Sale
          </button>
          <button
            onClick={() => bulkAction("clear_all")}
            disabled={bulkLoading || filteredProducts.length === 0}
            className="text-[11px] font-sans font-bold uppercase tracking-[0.1em] px-4 py-2 border border-[#E4E4E7] text-[#71717A] hover:border-[#18181B] hover:text-[#18181B] transition-colors disabled:opacity-50"
          >
            Remove Sale
          </button>
        </div>
      </div>

      {/* Product list */}
      <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-12">Img</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Product</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-28">Original Price</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-40">Sale Price (USD)</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-24">Discount</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F4]">
            {filteredProducts.map((p) => {
              const img = p.images?.[0]?.url
              const hasDiscount = p.sale_price_usd !== null && p.sale_price_usd < p.price_usd
              const discountPercent = hasDiscount
                ? Math.round(((p.price_usd - (p.sale_price_usd ?? 0)) / p.price_usd) * 100)
                : 0

              const displayVal = priceInputs[p.id] !== undefined
                ? priceInputs[p.id]
                : (p.sale_price_usd !== null ? String(p.sale_price_usd) : "")

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-[#FAFAFA] transition-colors ${
                    p.is_on_sale ? "bg-red-50/20" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    {img ? (
                      <img src={img} alt={p.name} className="w-10 h-10 object-cover bg-[#F4F4F4]" />
                    ) : (
                      <div className="w-10 h-10 bg-[#F4F4F4] flex items-center justify-center text-[#D4D4D8] text-[9px]">No img</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#18181B] line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-[#A1A1AA] font-mono">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#71717A]">
                    ${p.price_usd?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[#A1A1AA]">$</span>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={displayVal}
                        onChange={(e) => {
                          setPriceInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }}
                        onBlur={(e) => {
                          updateSalePrice(p.id, e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateSalePrice(p.id, (e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).blur()
                          }
                        }}
                        className="w-24 text-right px-2 py-1.5 border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none font-mono text-[13px] bg-white"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {hasDiscount ? (
                      <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-800 text-[11px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                        <Percent size={10} />
                        {discountPercent}%
                      </span>
                    ) : (
                      <span className="text-[#A1A1AA]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleProduct(p.id, p.is_on_sale)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        p.is_on_sale ? "bg-red-500" : "bg-[#D4D4D8]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                          p.is_on_sale ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-[#A1A1AA] text-[13px]">
            No products found matching filters
          </div>
        )}
      </div>
    </div>
  )
}
