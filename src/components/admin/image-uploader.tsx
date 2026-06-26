"use client"



import { useState, useTransition } from "react"
import { Trash2, Star, Plus, Link as LinkIcon, Loader2, UploadCloud } from "lucide-react"

type Image = { id: string; url: string; alt_text: string | null; sort_order: number; is_hero: boolean }

interface ImageUploaderProps {
  productId?: string
  images: Image[]
  onImagesChange: (images: Image[]) => void
  newImages: { url: string; is_hero: boolean }[]
  onNewImagesChange: (newImages: { url: string; is_hero: boolean }[]) => void
}

export function ImageUploader({
  productId,
  images,
  onImagesChange,
  newImages,
  onNewImagesChange,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isUploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    await uploadLocalFiles(Array.from(e.target.files))
  }

  async function uploadLocalFiles(files: File[]) {
    setError("")
    setUploading(true)
    setUploadProgress("Preparing upload...")

    const uploadedResults: any[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`)

        const body = new FormData()
        body.append("file", file)

        const res = await fetch("/api/admin/products/upload", {
          method: "POST",
          body,
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `Upload failed for ${file.name}`)
        }

        const data = await res.json()
        uploadedResults.push({ url: data.url, name: data.name })
      }

      handleUploadComplete(uploadedResults)
    } catch (e: any) {
      setError(e.message || "Failed to upload file(s).")
    } finally {
      setUploading(false)
      setUploadProgress("")
    }
  }

  // 1. Add Image from Paste URL
  async function addImageUrl() {
    setError("")
    if (!urlInput.trim()) return

    if (!urlInput.startsWith("https://")) {
      setError("Image URL must use secure HTTPS protocol.")
      return
    }

    if (productId) {
      // For existing product: save to database immediately
      startTransition(async () => {
        try {
          const res = await fetch("/api/admin/products/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: productId,
              url: urlInput,
              alt_text: "Product Image",
              sort_order: images.length,
              is_hero: images.length === 0,
            }),
          })

          if (!res.ok) {
            const err = await res.json()
            setError(err.error ?? "Failed to save image link.")
            return
          }

          const savedImage = await res.json()
          onImagesChange([...images, savedImage])
          setUrlInput("")
        } catch {
          setError("Connection failed. Try again.")
        }
      })
    } else {
      // For new product: store in local state list
      const isFirst = newImages.length === 0
      onNewImagesChange([...newImages, { url: urlInput, is_hero: isFirst }])
      setUrlInput("")
    }
  }

  // 2. Local File Upload Success Callback
  function handleUploadComplete(res: any[]) {
    setError("")
    if (!res || res.length === 0) return

    if (productId) {
      // For existing product: save each uploaded file link to DB
      startTransition(async () => {
        try {
          const added = []
          for (let index = 0; index < res.length; index++) {
            const file = res[index]
            const isFirst = images.length === 0 && index === 0
            const dbRes = await fetch("/api/admin/products/images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: productId,
                url: file.url,
                alt_text: "Product Image",
                sort_order: images.length + index,
                is_hero: isFirst,
              }),
            })

            if (dbRes.ok) {
              const saved = await dbRes.json()
              added.push(saved)
            }
          }
          onImagesChange([...images, ...added])
        } catch {
          setError("Failed to record uploaded files in the database.")
        }
      })
    } else {
      // For new product: add to local newImages state list
      const currentNew = [...newImages]
      res.forEach((file) => {
        const isFirst = currentNew.length === 0
        currentNew.push({ url: file.url, is_hero: isFirst })
      })
      onNewImagesChange(currentNew)
    }
  }

  // 3. Delete Image
  async function deleteImage(img: { id?: string; url: string }) {
    setError("")
    if (img.id) {
      // Database image
      startTransition(async () => {
        try {
          const res = await fetch(`/api/admin/products/images?id=${img.id}`, {
            method: "DELETE",
          })

          if (!res.ok) {
            const err = await res.json()
            setError(err.error ?? "Failed to delete image.")
            return
          }

          // Remove locally
          const updated = images.filter((i) => i.id !== img.id)
          
          // Failsafe: if deleted hero, set next item as hero automatically
          const wasHero = images.find((i) => i.id === img.id)?.is_hero
          if (wasHero && updated.length > 0) {
            updated[0].is_hero = true
            await fetch("/api/admin/products/images", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: updated[0].id,
                product_id: productId,
                is_hero: true,
              }),
            })
          }
          onImagesChange(updated)
        } catch {
          setError("Failed to delete image.")
        }
      })
    } else {
      // Local state image (new product)
      const updated = newImages.filter((i) => i.url !== img.url)
      // Failsafe: set next item as hero if deleted hero
      const wasHero = newImages.find((i) => i.url === img.url)?.is_hero
      if (wasHero && updated.length > 0) {
        updated[0].is_hero = true
      }
      onNewImagesChange(updated)
    }
  }

  // 4. Toggle Hero Image
  async function makeHero(img: { id?: string; url: string }) {
    setError("")
    if (img.id) {
      // Database image
      startTransition(async () => {
        try {
          const res = await fetch("/api/admin/products/images", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: img.id,
              product_id: productId,
              is_hero: true,
            }),
          })

          if (!res.ok) {
            const err = await res.json()
            setError(err.error ?? "Failed to update hero photo.")
            return
          }

          // Update state locally
          onImagesChange(
            images.map((i) => ({
              ...i,
              is_hero: i.id === img.id,
            }))
          )
        } catch {
          setError("Failed to set hero photo.")
        }
      })
    } else {
      // Local state image (new product)
      onNewImagesChange(
        newImages.map((i) => ({
          ...i,
          is_hero: i.url === img.url,
        }))
      )
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-[11px] font-sans font-bold text-red-600 bg-red-50 p-2 border border-red-200">
          {error}
        </div>
      )}

      {/* Grid of existing photos */}
      {((productId && images.length > 0) || (!productId && newImages.length > 0)) && (
        <div className="grid grid-cols-3 gap-3">
          {(productId ? images : newImages).map((img, idx) => {
            const isHero = "is_hero" in img ? img.is_hero : false
            const key = img.url
            return (
              <div
                key={key}
                className={`relative group border rounded-sm overflow-hidden aspect-square bg-[#F5F5F4] ${
                  isHero ? "border-[#33450D] ring-2 ring-[#33450D]/20" : "border-[#E4E4E7]"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />

                {/* Hero Badge */}
                {isHero && (
                  <span className="absolute top-1.5 left-1.5 bg-[#33450D] text-white text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm rounded-sm">
                    Hero
                  </span>
                )}

                {/* Action Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isHero && (
                    <button
                      onClick={() => makeHero(img)}
                      disabled={isPending}
                      className="p-1.5 bg-white text-[#33450D] hover:bg-[#33450D] hover:text-white transition-colors rounded-sm shadow-sm"
                      title="Set as Hero"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(img)}
                    disabled={isPending}
                    className="p-1.5 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-sm shadow-sm"
                    title="Delete Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Loading Overlay */}
      {isPending && (
        <div className="flex items-center justify-center py-4 text-xs font-sans text-khaki gap-2">
          <Loader2 size={16} className="animate-spin text-[#33450D]" />
          <span>Updating listing photos...</span>
        </div>
      )}

      {/* Paste URL block */}
      <div className="pt-2 border-t border-dashed border-[#E4E4E7]">
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
          Paste image link
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-khaki" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full pl-9 pr-3 py-2 text-[12px] border border-[#E4E4E7] focus:border-[#33450D] focus:outline-none bg-white font-sans text-leather-dark placeholder-khaki/50"
            />
          </div>
          <button
            onClick={addImageUrl}
            disabled={isPending || !urlInput.trim()}
            className="px-4 py-2 bg-[#33450D] text-white hover:bg-[#4A5D23] text-[11px] font-sans font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Local Drag & Drop dropzone */}
      <div className="pt-2 border-t border-dashed border-[#E4E4E7]">
        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
          Or upload files from computer
        </label>
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#33450D]/60 bg-white rounded-sm space-y-3">
            <Loader2 size={24} className="animate-spin text-[#33450D]" />
            <span className="text-[12px] font-sans font-medium text-leather-dark">{uploadProgress}</span>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                uploadLocalFiles(Array.from(e.dataTransfer.files))
              }
            }}
            className="flex flex-col items-center justify-center border border-dashed border-[#76786B]/40 hover:border-[#33450D]/60 transition-colors p-8 bg-white rounded-sm cursor-pointer group"
            onClick={() => document.getElementById("file-select-input")?.click()}
          >
            <input
              type="file"
              id="file-select-input"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <UploadCloud size={28} className="text-[#33450D] opacity-60 group-hover:opacity-100 transition-opacity mb-2" />
            <span className="text-[12px] font-sans text-leather-dark font-medium">
              Drag & drop photos here or <span className="text-[#33450D] underline font-semibold">Choose files</span>
            </span>
            <span className="text-[10px] font-sans text-[#71717A] mt-1">
              Supports JPG, PNG, WEBP (Max 4MB each)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
