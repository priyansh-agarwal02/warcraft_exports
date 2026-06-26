"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash2, Plus, X, Eye } from "lucide-react"
import { DuplicateProductButton } from "@/components/admin/duplicate-product-button"
import { ImageUploader } from "@/components/admin/image-uploader"

const NATIONS = ["British", "German", "US", "Japanese", "Soviet", "Italian", "French"]
const ERAS = ["WW1", "WW2"]

type Category = { id: string; name: string; slug: string }
type Image = { id: string; url: string; alt_text: string | null; sort_order: number; is_hero: boolean }
type Variant = { id: string; color: string | null; size: string | null; sku_suffix: string | null; price_override: number | null; stock_quantity: number; is_active: boolean }
type Product = {
  id: string
  name: string
  slug: string
  sku: string
  amazon_sku?: string
  subtitle?: string | null
  short_description?: string | null
  description?: string | null
  historical_quote?: string | null
  price_usd: number
  sale_price_usd?: number | null
  nation: string
  era: string
  material?: string | null
  style?: string | null
  weight_kg?: number | null
  stock_quantity: number
  low_stock_threshold?: number
  is_featured: boolean
  is_active: boolean
  is_wholesale_only?: boolean
  ships_from_usa?: boolean
  category_id?: string | null
  category_ids?: string[]
  features: string[]
  specifications: Record<string, string>
  images?: Image[]
  variants?: Variant[]
}

interface Props {
  product?: Product
  categories: Category[]
}

export function ProductEditForm({ product, categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    amazon_sku: product?.amazon_sku ?? "",
    nation: product?.nation ?? "British",
    era: product?.era ?? "WW2",
    category_ids: product?.category_ids ?? (product?.category_id ? [product.category_id] : []),
    price_usd: String(product?.price_usd ?? ""),
    sale_price_usd: String(product?.sale_price_usd ?? ""),
    stock_quantity: String(product?.stock_quantity ?? "0"),
    low_stock_threshold: String(product?.low_stock_threshold ?? "5"),
    material: product?.material ?? "",
    style: product?.style ?? "",
    weight_kg: String(product?.weight_kg ?? ""),
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    historical_quote: product?.historical_quote ?? "",
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    is_wholesale_only: product?.is_wholesale_only ?? false,
    ships_from_usa: product?.ships_from_usa ?? false,
    features: (product?.features ?? []).join("\n"),
    imageUrl: "",
  })

  const set = (field: string, value: string | boolean | string[]) =>
    setForm(f => ({ ...f, [field]: value }))

  async function saveProduct() {
    setError("")
    setSuccess("")
    if (!form.name || !form.sku || !form.price_usd) {
      setError("Name, SKU, and Price are required.")
      return
    }

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 70)

    const body = {
      ...(product ? { id: product.id } : {}),
      name: form.name,
      sku: form.sku,
      amazon_sku: form.amazon_sku || form.sku,
      slug: product?.slug ?? slug,
      nation: form.nation,
      era: form.era,
      category_id: form.category_ids[0] || null,
      category_ids: form.category_ids,
      price_usd: parseFloat(form.price_usd),
      sale_price_usd: form.sale_price_usd ? parseFloat(form.sale_price_usd) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      material: form.material || null,
      style: form.style || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      short_description: form.short_description || null,
      description: form.description || null,
      historical_quote: form.historical_quote || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      is_wholesale_only: form.is_wholesale_only,
      ships_from_usa: form.ships_from_usa,
      features: form.features.split("\n").map((s: string) => s.trim()).filter(Boolean),
      specifications: {},
    }

    const res = await fetch("/api/admin/products", {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(err.message ?? "Failed to save product.")
      return
    }

    const result = await res.json()
    const savedId = product?.id ?? (Array.isArray(result) ? result[0]?.id : result?.id)

    // Save new product images if any
    if (!product && newImages.length > 0 && savedId) {
      for (let index = 0; index < newImages.length; index++) {
        const img = newImages[index]
        await fetch("/api/admin/products/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: savedId,
            url: img.url,
            alt_text: form.name,
            sort_order: index,
            is_hero: img.is_hero,
          }),
        })
      }
    }

    setSuccess("Product saved successfully!")
    if (!product && savedId) {
      router.push(`/admin/products/${savedId}`)
    }
  }

  async function generateDescription() {
    if (!form.name) {
      setError("Enter a product name first.")
      return
    }
    setAiLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/ai-describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          nation: form.nation,
          era: form.era,
          material: form.material,
          style: form.style,
          features: form.features.split("\n").filter(Boolean),
        }),
      })
      const data = await res.json() as { description?: string; error?: string }
      if (data.description) {
        const paras = data.description.split("\n\n")
        set("short_description", paras[0] ?? data.description)
        set("description", data.description)
      } else {
        setError("AI description failed. Please write manually.")
      }
    } catch {
      setError("AI description failed. Please write manually.")
    } finally {
      setAiLoading(false)
    }
  }

  async function deleteProduct() {
    if (!product || !confirm("Delete this product? This cannot be undone.")) return
    const res = await fetch(`/api/admin/products?id=${product.id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/admin/products")
    }
  }

  const [images, setImages] = useState<Image[]>(product?.images ?? [])
  const [newImages, setNewImages] = useState<{ url: string; is_hero: boolean }[]>([])
  const variants: Variant[] = product?.variants ?? []

  return (
    <div className="max-w-4xl">
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-[13px]">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <section className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Product Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => set("sku", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Amazon SKU</label>
                  <input value={form.amazon_sku} onChange={e => set("amazon_sku", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Nation</label>
                  <select value={form.nation} onChange={e => set("nation", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white">
                    {NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Era</label>
                  <select value={form.era} onChange={e => set("era", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white">
                    {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Categories</label>
                <div className="border border-[#E4E4E7] p-3 max-h-40 overflow-y-auto space-y-2 bg-white">
                  {categories.map(c => {
                    const checked = form.category_ids.includes(c.id)
                    return (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const newIds = e.target.checked
                              ? [...form.category_ids, c.id]
                              : form.category_ids.filter((id: string) => id !== c.id)
                            set("category_ids", newIds)
                          }}
                          className="w-4 h-4 accent-[#33450D]"
                        />
                        <span className="text-[13px] font-sans text-[#18181B]">{c.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Price (USD) *</label>
                <input type="number" step="0.01" value={form.price_usd} onChange={e => set("price_usd", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Sale Price (USD)</label>
                <input type="number" step="0.01" value={form.sale_price_usd} onChange={e => set("sale_price_usd", e.target.value)} placeholder="Leave blank if no sale" className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Stock Quantity</label>
                <input type="number" value={form.stock_quantity} onChange={e => set("stock_quantity", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Low Stock Threshold</label>
                <input type="number" value={form.low_stock_threshold} onChange={e => set("low_stock_threshold", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white border border-[#E4E4E7] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide">Description</h2>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-[11px] font-sans font-bold text-[#33450D] border border-[#33450D] px-3 py-1 hover:bg-[#33450D] hover:text-white transition-colors disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {aiLoading ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Short Description</label>
                <textarea value={form.short_description} onChange={e => set("short_description", e.target.value)} rows={2} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Full Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={6} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none resize-y" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Features (one per line)</label>
                <textarea value={form.features} onChange={e => set("features", e.target.value)} rows={4} placeholder="100% Genuine Leather&#10;Brass fittings&#10;..." className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none resize-y font-mono" />
              </div>
            </div>
          </section>

          {/* Physical */}
          <section className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide mb-4">Physical Details</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Material</label>
                <input value={form.material} onChange={e => set("material", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Style</label>
                <input value={form.style} onChange={e => set("style", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A] mb-1">Weight (kg)</label>
                <input type="number" step="0.01" value={form.weight_kg} onChange={e => set("weight_kg", e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none" />
              </div>
            </div>
          </section>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Status */}
          <section className="bg-white border border-[#E4E4E7] p-5">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide mb-4">Status</h2>
            <div className="space-y-3">
              {([["is_active", "Active / Published"], ["is_featured", "Featured"], ["is_wholesale_only", "Wholesale Only"], ["ships_from_usa", "Ships from USA"]] as [string, string][]).map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form[field as keyof typeof form]}
                    onChange={e => set(field, e.target.checked)}
                    className="w-4 h-4 accent-[#33450D]"
                  />
                  <span className="text-[13px] font-sans text-[#18181B]">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Images */}
          <section className="bg-white border border-[#E4E4E7] p-5">
            <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide mb-4">
              Images ({product ? images.length : newImages.length})
            </h2>
            <ImageUploader
              productId={product?.id}
              images={images}
              onImagesChange={setImages}
              newImages={newImages}
              onNewImagesChange={setNewImages}
            />
          </section>

          {/* Variants summary */}
          {variants.length > 0 && (
            <section className="bg-white border border-[#E4E4E7] p-5">
              <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide mb-3">Variants ({variants.length})</h2>
              <div className="space-y-2">
                {variants.slice(0, 5).map(v => (
                  <div key={v.id} className="flex items-center justify-between text-[12px]">
                    <span className="text-[#18181B]">{v.color ?? v.size ?? v.sku_suffix ?? "Variant"}</span>
                    <span className="text-[#71717A]">Qty: {v.stock_quantity}</span>
                  </div>
                ))}
                {variants.length > 5 && <p className="text-[11px] text-[#A1A1AA]">+{variants.length - 5} more</p>}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => startTransition(saveProduct)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-3 hover:bg-[#4A5D23] transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {isPending ? "Saving…" : "Save Product"}
            </button>
            {product && (
              <>
                <a
                  href={`/product/${product.slug}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 border border-[#E4E4E7] text-[#18181B] text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-3 hover:border-[#33450D] transition-colors"
                >
                  <Eye size={14} />
                  View on Store
                </a>
                <DuplicateProductButton productId={product.id} variant="button" />
                <button
                  onClick={() => startTransition(deleteProduct)}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-3 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Product
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
