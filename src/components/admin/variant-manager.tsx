"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, UploadCloud, CheckCircle } from "lucide-react"

export type VariantItem = {
  id: string
  color: string | null
  size: string | null
  sku_suffix: string | null
  price_override: number | null
  stock_quantity: number
  is_active: boolean
  image_url?: string | null
}

interface VariantManagerProps {
  productId: string
  initialVariants: VariantItem[]
  productImages?: { url: string }[]
}

export function VariantManager({ productId, initialVariants, productImages = [] }: VariantManagerProps) {
  const [variants, setVariants] = useState<VariantItem[]>(initialVariants)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form for adding new variant
  const [isAdding, setIsAdding] = useState(false)
  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")
  const [newSkuSuffix, setNewSkuSuffix] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newStock, setNewStock] = useState("10")
  const [newImageUrl, setNewImageUrl] = useState("")

  // Form for editing active variant
  const [editColor, setEditColor] = useState("")
  const [editSize, setEditSize] = useState("")
  const [editSkuSuffix, setEditSkuSuffix] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editStock, setEditStock] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")

  async function uploadVariantFile(file: File, target: "new" | "edit") {
    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body,
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Image upload failed")
      }
      const data = await res.json()
      if (target === "new") {
        setNewImageUrl(data.url)
      } else {
        setEditImageUrl(data.url)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function startEdit(v: VariantItem) {
    setEditingId(v.id)
    setEditColor(v.color || "")
    setEditSize(v.size || "")
    setEditSkuSuffix(v.sku_suffix || "")
    setEditPrice(v.price_override != null ? String(v.price_override) : "")
    setEditStock(String(v.stock_quantity ?? 0))
    setEditImageUrl(v.image_url || "")
    setError(null)
  }

  async function handleCreateVariant() {
    if (!newColor.trim() && !newSize.trim() && !newSkuSuffix.trim()) {
      setError("Please specify at least a Color, Size, or SKU Suffix.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          color: newColor.trim() || null,
          size: newSize.trim() || null,
          sku_suffix: newSkuSuffix.trim() || null,
          price_override: newPrice ? Number(newPrice) : null,
          stock_quantity: Number(newStock) || 0,
          image_url: newImageUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create variant")

      const created = data.variant
      setVariants((prev) => [...prev, created])
      setIsAdding(false)
      setNewColor("")
      setNewSize("")
      setNewSkuSuffix("")
      setNewPrice("")
      setNewStock("10")
      setNewImageUrl("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateVariant(id: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/variants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          color: editColor.trim() || null,
          size: editSize.trim() || null,
          sku_suffix: editSkuSuffix.trim() || null,
          price_override: editPrice !== "" ? Number(editPrice) : null,
          stock_quantity: Number(editStock) || 0,
          image_url: editImageUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update variant")

      const updated = data.variant
      setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)))
      setEditingId(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteVariant(id: string) {
    if (!confirm("Are you sure you want to delete this variant?")) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/variants?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete variant")

      setVariants((prev) => prev.filter((v) => v.id !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "px-2.5 py-1.5 text-xs font-sans border border-[#E4E4E7] rounded-sm bg-white text-[#18181B] focus:outline-none focus:border-[#33450D]"

  return (
    <section className="bg-white border border-[#E4E4E7] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-wide">
            Product Variants ({variants.length})
          </h2>
          <p className="text-[11px] font-sans text-[#71717A] mt-0.5">
            Configure color swatches, size options, custom stock levels, and dedicated variant photos.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setError(null); }}
            className="flex items-center gap-1.5 text-xs font-sans font-bold bg-[#33450D] text-white px-3 py-1.5 rounded-sm hover:bg-[#4A5D23] transition-colors"
          >
            <Plus size={14} />
            Add Variant
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-xs font-sans text-red-600 bg-red-50 p-2.5 border border-red-200 rounded-sm">
          {error}
        </div>
      )}

      {/* New Variant Form */}
      {isAdding && (
        <div className="mb-5 p-4 border border-[#33450D]/30 bg-[#33450D]/5 rounded-sm space-y-4">
          <p className="text-xs font-sans font-bold text-[#33450D] uppercase tracking-wider">New Variant Configuration</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1">Color Name</label>
              <input type="text" placeholder="e.g. Brown, Olive Drab" value={newColor} onChange={(e) => setNewColor(e.target.value)} className={`w-full ${inputClass}`} />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1">Size Option</label>
              <input type="text" placeholder="e.g. Large, 42" value={newSize} onChange={(e) => setNewSize(e.target.value)} className={`w-full ${inputClass}`} />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1">SKU Suffix</label>
              <input type="text" placeholder="-BRN-L" value={newSkuSuffix} onChange={(e) => setNewSkuSuffix(e.target.value)} className={`w-full ${inputClass}`} />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1">Variant Price ($ Override)</label>
              <input type="number" step="0.01" placeholder="Leave empty for base price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className={`w-full ${inputClass}`} />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1">Stock Quantity *</label>
              <input type="number" placeholder="10" value={newStock} onChange={(e) => setNewStock(e.target.value)} className={`w-full ${inputClass}`} />
            </div>
          </div>

          {/* Photo assignment helper */}
          <div>
            <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1.5">Variant Photo (Choose from listing photos or upload)</label>

            {/* Select from existing listing photos */}
            {productImages.length > 0 && (
              <div className="mb-2">
                <span className="block text-[10px] font-sans text-[#71717A] mb-1">Click a listing photo to assign:</span>
                <div className="flex flex-wrap gap-2">
                  {productImages.map((img, i) => (
                    <button
                      key={img.url + i}
                      type="button"
                      onClick={() => setNewImageUrl(img.url)}
                      className={`w-10 h-10 rounded-sm overflow-hidden border transition-all relative ${
                        newImageUrl === img.url ? "border-[#33450D] ring-2 ring-[#33450D]/40 scale-105" : "border-khaki/40 hover:border-leather"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {newImageUrl === img.url && (
                        <div className="absolute inset-0 bg-[#33450D]/30 flex items-center justify-center">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="url"
                placeholder="https://... or select photo above"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className={`flex-1 min-w-0 ${inputClass}`}
              />
              <label className="shrink-0 whitespace-nowrap px-3 py-2 bg-[#33450D] text-white hover:bg-[#4A5D23] text-[11px] font-sans font-bold uppercase tracking-wider rounded-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-colors">
                <UploadCloud size={14} className="shrink-0" />
                <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) uploadVariantFile(e.target.files[0], "new")
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreateVariant}
              disabled={loading || uploading}
              className="px-3 py-1.5 bg-[#33450D] text-white text-xs font-sans font-bold uppercase rounded-sm hover:bg-[#4A5D23] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Variant"}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 border border-[#E4E4E7] text-[#71717A] text-xs font-sans uppercase rounded-sm hover:text-[#18181B]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Variants List */}
      {variants.length === 0 ? (
        <p className="text-xs font-sans text-[#71717A] italic">No variants configured for this product yet.</p>
      ) : (
        <div className="divide-y divide-[#E4E4E7] border-t border-[#E4E4E7]">
          {variants.map((v) => {
            const isEditing = editingId === v.id
            if (isEditing) {
              return (
                <div key={v.id} className="py-3 bg-amber-50/50 p-3 rounded-sm space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-sans text-[#71717A] mb-0.5">Color Name</label>
                      <input type="text" value={editColor} onChange={(e) => setEditColor(e.target.value)} className={`w-full ${inputClass}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans text-[#71717A] mb-0.5">Size Option</label>
                      <input type="text" value={editSize} onChange={(e) => setEditSize(e.target.value)} className={`w-full ${inputClass}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans text-[#71717A] mb-0.5">SKU Suffix</label>
                      <input type="text" value={editSkuSuffix} onChange={(e) => setEditSkuSuffix(e.target.value)} className={`w-full ${inputClass}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans text-[#71717A] mb-0.5">Price ($ Override)</label>
                      <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={`w-full ${inputClass}`} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans text-[#71717A] mb-0.5">Stock Quantity</label>
                      <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className={`w-full ${inputClass}`} />
                    </div>
                  </div>

                  {/* Photo picker for edit */}
                  <div>
                    <label className="block text-[10px] font-sans font-semibold uppercase text-[#71717A] mb-1">Variant Photo</label>

                    {productImages.length > 0 && (
                      <div className="mb-2">
                        <span className="block text-[10px] font-sans text-[#71717A] mb-1">Select listing photo:</span>
                        <div className="flex flex-wrap gap-2">
                          {productImages.map((img, i) => (
                            <button
                              key={img.url + i}
                              type="button"
                              onClick={() => setEditImageUrl(img.url)}
                              className={`w-9 h-9 rounded-sm overflow-hidden border transition-all relative ${
                                editImageUrl === img.url ? "border-[#33450D] ring-2 ring-[#33450D]/40 scale-105" : "border-khaki/40 hover:border-leather"
                              }`}
                            >
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                              {editImageUrl === img.url && (
                                <div className="absolute inset-0 bg-[#33450D]/30 flex items-center justify-center">
                                  <CheckCircle size={12} className="text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input type="url" placeholder="https://... or select photo above" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} className={`flex-1 min-w-0 ${inputClass}`} />
                      <label className="shrink-0 whitespace-nowrap px-3 py-2 bg-[#33450D] text-white hover:bg-[#4A5D23] text-[11px] font-sans font-bold uppercase tracking-wider rounded-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-colors">
                        <UploadCloud size={14} className="shrink-0" />
                        <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) uploadVariantFile(e.target.files[0], "edit")
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateVariant(v.id)}
                      disabled={loading || uploading}
                      className="px-2.5 py-1 bg-[#33450D] text-white text-[11px] font-sans font-bold uppercase rounded-sm"
                    >
                      <Check size={12} className="inline mr-1" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 border border-[#E4E4E7] text-[#71717A] text-[11px] font-sans uppercase rounded-sm"
                    >
                      <X size={12} className="inline mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={v.id} className="py-2.5 flex items-center justify-between gap-3 text-xs font-sans">
                <div className="flex items-center gap-3 min-w-0">
                  {v.image_url ? (
                    <div className="w-8 h-8 rounded-sm overflow-hidden border border-[#E4E4E7] flex-shrink-0">
                      <Image src={v.image_url} alt="Variant image" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-sm bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center flex-shrink-0 text-[#A1A1AA]">
                      <ImageIcon size={14} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-[#18181B] truncate">
                      {[v.color, v.size].filter(Boolean).join(" / ") || v.sku_suffix || "Default Variant"}
                    </p>
                    <p className="text-[11px] text-[#71717A]">
                      Stock: <span className={v.stock_quantity > 0 ? "font-bold text-green-700" : "font-bold text-red-600"}>{v.stock_quantity}</span>
                      {v.price_override != null && ` · Price: $${v.price_override}`}
                      {v.sku_suffix && ` · Suffix: ${v.sku_suffix}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => startEdit(v)}
                    className="p-1 text-[#71717A] hover:text-[#18181B] transition-colors"
                    title="Edit Variant"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(v.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Variant"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
