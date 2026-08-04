"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FileText,
  Printer,
  ExternalLink,
  Save,
  CheckCircle2,
  Percent,
  Package,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Scale,
  BookOpen,
} from "lucide-react"

type CategoryItem = {
  id: string
  name: string
  slug: string
}

type ProductItem = {
  id: string
  sku: string
  name: string
  price_usd: number
  category_id: string | null
  category_name?: string
}

const DEFAULT_LEGAL_TERMS =
  "PROPRIETARY & NON-DISCLOSURE NOTICE: Direct sale, un-authorized listing, or automated re-selling of these proprietary products or catalog imagery on any public e-commerce platform, 3rd-party marketplace, or retail website is strictly prohibited without prior written authorization from Warcraft Exports. Any commercial misuse or IP infringement will result in immediate cancellation of distributor privileges and legal prosecution under applicable trade & IP laws."

const DEFAULT_BUSINESS_TERMS = `1. DISTRIBUTION & BRAND USE
Warcraft Exports products are supplied to approved distributors for offline wholesale and distribution only. Online listing or sale through Amazon, eBay, Walmart, other marketplaces, e-commerce websites, social-media stores, or any other online sales channel is not permitted, whether under the Warcraft Exports name, the distributor’s own name, or any other brand.

All product designs, photographs, descriptions, specifications, trademarks, and catalog content remain the property of Warcraft Exports, a brand of RAAS ENTERPRISES, and may not be reproduced or commercially used without permission.

2. MINIMUM ORDER & SHIPPING
Minimum order: 100 units or USD 1,000 net order value.
Orders are supplied FOB Kanpur, India. Customs duties, import duties, taxes, and destination charges are the buyer’s responsibility.

3. PAYMENT TERMS
50% advance upon order confirmation and 50% balance prior to dispatch. Payment accepted via wire transfer or PayPal.

4. QUALITY & CLAIMS
Our products are handcrafted using solid brass fittings and top-grain leather. Due to their handcrafted nature, minor variations may occur.

Manufacturing defect claims must be submitted within 14 days of receipt, along with photographs and order details, for review and appropriate replacement or credit.

5. ORDER ACCEPTANCE
Placement of an order confirms the buyer’s acceptance of these wholesale and distributor terms.`

export default function AdminCatalogPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Config state
  const [title, setTitle] = useState("2026 WHOLESALE DISTRIBUTOR CATALOG")
  const [subtitle, setSubtitle] = useState("Handcrafted Reproductions & Historical Militaria")
  const [priceAdjustmentPercent, setPriceAdjustmentPercent] = useState<number>(0)
  const [showVariants, setShowVariants] = useState(true)
  const [distributorNotes, setDistributorNotes] = useState(
    "Minimum wholesale order: 100 units. Factory Direct from Kanpur, India."
  )
  const [legalTerms, setLegalTerms] = useState(DEFAULT_LEGAL_TERMS)
  const [businessTerms, setBusinessTerms] = useState(DEFAULT_BUSINESS_TERMS)

  // Product and Category Exclusions (empty array = everything included by default)
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([])
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<string[]>([])

  // Database lists
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch catalog settings
      const settingsRes = await fetch("/api/admin/catalog")
      const settingsData = await settingsRes.json()

      if (settingsData.success && settingsData.settings) {
        const s = settingsData.settings
        setTitle(s.title || "2026 WHOLESALE DISTRIBUTOR CATALOG")
        setSubtitle(s.subtitle || "Handcrafted Reproductions & Historical Militaria")
        setPriceAdjustmentPercent(Number(s.price_adjustment_percent) || 0)
        setShowVariants(s.show_variants ?? true)
        setDistributorNotes(s.distributor_notes || "")
        setLegalTerms(s.legal_terms || DEFAULT_LEGAL_TERMS)
        setBusinessTerms(s.business_terms || DEFAULT_BUSINESS_TERMS)
        setExcludedProductIds(s.excluded_product_ids || [])
        setExcludedCategoryIds(s.excluded_category_ids || [])
      }

      // 2. Fetch categories & products for management checklist
      const prodRes = await fetch("/api/admin/catalog/data")
      if (prodRes.ok) {
        const data = await prodRes.json()
        setCategories(data.categories || [])
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("Error fetching catalog admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          price_adjustment_percent: priceAdjustmentPercent,
          show_variants: showVariants,
          distributor_notes: distributorNotes,
          legal_terms: legalTerms,
          business_terms: businessTerms,
          excluded_product_ids: excludedProductIds,
          excluded_category_ids: excludedCategoryIds,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast("Catalog settings & legal terms updated successfully!")
      } else {
        alert("Error saving catalog settings: " + data.error)
      }
    } catch (err: any) {
      alert("Failed to save settings: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const toggleProductExclusion = (id: string) => {
    setExcludedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const toggleCategoryExclusion = (id: string) => {
    setExcludedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const resetExclusions = () => {
    setExcludedProductIds([])
    setExcludedCategoryIds([])
    showToast("Reset: All products & categories are now included by default.")
  }

  const handleDirectExportPDF = async () => {
    await handleSave()
    const printWin = window.open("/admin/catalog/preview", "_blank")
    if (printWin) {
      printWin.focus()
      setTimeout(() => {
        printWin.print()
      }, 800)
    }
  }

  const sampleBasePrice = 100
  const sampleAdjustedPrice = Number(
    (sampleBasePrice * (1 + priceAdjustmentPercent / 100)).toFixed(2)
  )

  if (loading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto font-sans">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 bg-black/10 rounded-full" />
          <div className="h-6 bg-black/10 w-64 rounded" />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-black/5 rounded-md animate-pulse" />
          <div className="h-64 bg-black/5 rounded-md animate-pulse col-span-2" />
        </div>
      </div>
    )
  }

  const activeProductsCount = products.length - excludedProductIds.length

  return (
    <div className="p-4 sm:p-8 max-w-[1280px] mx-auto font-sans text-[#18181B] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-5 py-3.5 rounded-sm shadow-xl flex items-center gap-3 border border-[#33450D]">
          <CheckCircle2 size={18} className="text-[#A3E635]" />
          <span className="text-[13px] font-sans font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E4E4E7]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#703810] mb-1">
            <ShieldCheck size={14} />
            <span>Admin Console · Confidential Distributor Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading uppercase tracking-tight text-[#18181B]">
            Distributor Catalog Config
          </h1>
          <p className="text-[13px] text-[#71717A] mt-1">
            Configure price adjustments, legal protection terms, and export PDF catalogs directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDirectExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#33450D] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#27350A] transition-all shadow-md"
          >
            <Printer size={16} />
            <span>Print / Export PDF</span>
          </button>

          <Link
            href="/admin/catalog/preview"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#18181B] text-[#18181B] text-[13px] font-bold uppercase tracking-wider hover:bg-[#FAFAF9] transition-all shadow-sm"
          >
            <span>Admin Preview</span>
            <ExternalLink size={14} className="opacity-60" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#18181B] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-black transition-all shadow-md disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Config"}</span>
          </button>
        </div>
      </div>

      {/* Quick Auto-Update Status Banner */}
      <div className="mt-6 bg-[#F4F4F5] border-l-4 border-[#33450D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <Sparkles className="text-[#33450D] flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
          <div>
            <p className="text-[13px] font-bold text-[#18181B]">
              Auto-Sync Enabled: All new product listings are included by default
            </p>
            <p className="text-[12px] text-[#71717A]">
              Currently listing {activeProductsCount} of {products.length} products across {categories.length} categories.
            </p>
          </div>
        </div>
        {excludedProductIds.length > 0 || excludedCategoryIds.length > 0 ? (
          <button
            onClick={resetExclusions}
            className="flex items-center gap-1.5 text-[12px] font-bold text-[#703810] hover:underline"
          >
            <RotateCcw size={14} />
            <span>Reset Exclusions</span>
          </button>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pricing & Cover Settings */}
        <div className="space-y-6">
          {/* Section 1: Price Adjustment Percentage */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-[#703810]" />
                <h2 className="font-heading text-lg uppercase tracking-wide">
                  Price Adjustment
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4F4F5] text-[#18181B] px-2 py-0.5">
                Global Modifier
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#18181B] mb-1.5">
                  Percentage Adjustment (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    value={priceAdjustmentPercent}
                    onChange={(e) => setPriceAdjustmentPercent(parseFloat(e.target.value) || 0)}
                    className="w-32 bg-[#FAFAF9] border border-[#18181B] px-3 py-2 text-base font-mono font-bold text-[#18181B] outline-none focus:ring-1 focus:ring-[#18181B]"
                  />
                  <span className="text-[13px] font-semibold text-[#71717A]">
                    {priceAdjustmentPercent < 0
                      ? `${Math.abs(priceAdjustmentPercent)}% Wholesale Discount`
                      : priceAdjustmentPercent > 0
                      ? `${priceAdjustmentPercent}% Price Markup`
                      : "Base Store Prices (0% adjustment)"}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-2">
                  Quick Presets:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Base (0%)", val: 0 },
                    { label: "-15% Wholesale", val: -15 },
                    { label: "-20% Bulk", val: -20 },
                    { label: "+10% Retail", val: 10 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPriceAdjustmentPercent(p.val)}
                      className={`text-[11px] font-bold uppercase py-1.5 border transition-all ${
                        priceAdjustmentPercent === p.val
                          ? "bg-[#33450D] text-white border-[#33450D]"
                          : "bg-white text-[#18181B] border-[#E4E4E7] hover:border-[#18181B]"
                      }`}
                    >
                      {p.val > 0 ? `+${p.val}%` : `${p.val}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Calculation Preview */}
              <div className="bg-[#FAFAF9] border border-[#E4E4E7] p-3.5 text-[12px] space-y-1">
                <div className="flex justify-between font-medium text-[#71717A]">
                  <span>Example $100.00 Item Base:</span>
                  <span className="line-through">$100.00 USD</span>
                </div>
                <div className="flex justify-between font-bold text-[#18181B] text-[13.5px] pt-1 border-t border-[#E4E4E7]">
                  <span>Catalog Output Price:</span>
                  <span className="text-[#33450D]">${sampleAdjustedPrice.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cover & Information Customizer */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4F4F5]">
              <FileText size={18} className="text-[#703810]" />
              <h2 className="font-heading text-lg uppercase tracking-wide">
                Front Cover Settings
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  Catalog Title:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#18181B] px-3 py-2 text-[13px] font-sans font-bold text-[#18181B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  Catalog Subtitle:
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans text-[#18181B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  Distributor Ordering Terms:
                </label>
                <textarea
                  rows={3}
                  value={distributorNotes}
                  onChange={(e) => setDistributorNotes(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E4E4E7] p-3 text-[12px] font-sans text-[#18181B] outline-none resize-none"
                  placeholder="Minimum order details, FOB location, lead times..."
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVariants}
                    onChange={(e) => setShowVariants(e.target.checked)}
                    className="w-4 h-4 accent-[#33450D]"
                  />
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Include color & size variation breakdowns in catalog
                  </span>
                </label>
              </div>
            </div>
          </div>



          {/* Section 4: Page 2 Detailed Business & Trading Terms */}
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F4F4F5]">
              <BookOpen size={18} className="text-[#703810]" />
              <h2 className="font-heading text-lg uppercase tracking-wide">
                Page 2 Business Terms
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-[11.5px] text-[#71717A]">
                Full wholesale trading terms displayed on a dedicated **Page 2** before product inventory.
              </p>
              <textarea
                rows={8}
                value={businessTerms}
                onChange={(e) => setBusinessTerms(e.target.value)}
                className="w-full bg-[#FAFAF9] border border-[#18181B] p-3 text-[11.5px] font-mono text-[#18181B] outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product & Category Management Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#703810]" />
                <div>
                  <h2 className="font-heading text-lg uppercase tracking-wide">
                    Catalog Product Inventory
                  </h2>
                  <p className="text-[12px] text-[#71717A]">
                    Uncheck items to exclude them from the catalog. New additions auto-select by default.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetExclusions}
                  className="px-3 py-1.5 bg-[#FAFAF9] border border-[#E4E4E7] text-[11px] font-bold uppercase tracking-wider text-[#18181B] hover:bg-[#F4F4F5]"
                >
                  Include All Products
                </button>
              </div>
            </div>

            {/* Categories & Products Checklist */}
            <div className="mt-6 space-y-6">
              {categories.map((cat) => {
                const catProducts = products.filter(
                  (p) => p.category_id === cat.id || p.category_name === cat.name
                )
                const isCategoryExcluded = excludedCategoryIds.includes(cat.id)

                return (
                  <div
                    key={cat.id}
                    className="border border-[#E4E4E7] rounded-sm overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="bg-[#FAFAF9] px-4 py-3 border-b border-[#E4E4E7] flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!isCategoryExcluded}
                          onChange={() => toggleCategoryExclusion(cat.id)}
                          className="w-4 h-4 accent-[#33450D]"
                        />
                        <span className="font-heading text-sm uppercase tracking-wide text-[#18181B]">
                          {cat.name} ({catProducts.length} items)
                        </span>
                      </label>

                      <span className="text-[11px] font-semibold text-[#71717A]">
                        {isCategoryExcluded ? (
                          <span className="text-red-600 font-bold">Category Excluded</span>
                        ) : (
                          <span className="text-[#33450D] font-bold">Active in Catalog</span>
                        )}
                      </span>
                    </div>

                    {/* Products Grid inside Category */}
                    {!isCategoryExcluded && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-white">
                        {catProducts.map((prod) => {
                          const isProductExcluded = excludedProductIds.includes(prod.id)
                          return (
                            <label
                              key={prod.id}
                              className={`flex items-center justify-between p-2 border text-[12px] cursor-pointer transition-colors ${
                                isProductExcluded
                                  ? "bg-red-50/40 border-red-200 text-[#71717A]"
                                  : "bg-white border-[#F4F4F5] hover:border-[#E4E4E7] text-[#18181B]"
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <input
                                  type="checkbox"
                                  checked={!isProductExcluded}
                                  onChange={() => toggleProductExclusion(prod.id)}
                                  className="w-3.5 h-3.5 accent-[#33450D]"
                                />
                                <span className="truncate font-medium">{prod.name}</span>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-[#703810] ml-2 flex-shrink-0">
                                ${prod.price_usd.toFixed(2)}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Uncategorized products if any */}
              {products.filter((p) => !p.category_id).length > 0 && (
                <div className="border border-[#E4E4E7] rounded-sm overflow-hidden">
                  <div className="bg-[#FAFAF9] px-4 py-3 border-b border-[#E4E4E7]">
                    <span className="font-heading text-sm uppercase tracking-wide text-[#18181B]">
                      General Inventory (Uncategorized)
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-white">
                    {products
                      .filter((p) => !p.category_id)
                      .map((prod) => {
                        const isProductExcluded = excludedProductIds.includes(prod.id)
                        return (
                          <label
                            key={prod.id}
                            className="flex items-center justify-between p-2 border border-[#F4F4F5] text-[12px] cursor-pointer"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={!isProductExcluded}
                                onChange={() => toggleProductExclusion(prod.id)}
                                className="w-3.5 h-3.5 accent-[#33450D]"
                              />
                              <span className="truncate font-medium">{prod.name}</span>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#703810]">
                              ${prod.price_usd.toFixed(2)}
                            </span>
                          </label>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
