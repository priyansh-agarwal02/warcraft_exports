"use client"

import { useState, useEffect, useCallback } from "react"
import { PackageOpen, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductDetail } from "@/types/product"

interface ProductImageGalleryProps {
  images: ProductDetail["images"]
  productName: string
  nation?: string | null
  era?: string | null
  isFeatured?: boolean
  shipsFromUsa?: boolean
}

export function ProductImageGallery({ images, productName, nation, era, isFeatured, shipsFromUsa }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "ArrowRight") nextImage()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [lightboxOpen, closeLightbox, prevImage, nextImage])

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-khaki/20 flex flex-col items-center justify-center gap-3 rounded-sm border border-[#C6C8B8]">
        <PackageOpen size={48} className="text-khaki" />
        <span className="text-xs font-sans text-[#566065] uppercase tracking-widest">No Image Available</span>
      </div>
    )
  }

  const active = images[activeIndex]

  return (
    <>
      <div className="flex flex-col md:flex-row items-start gap-4 w-full md:h-[600px]">

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-[96px] overflow-x-auto md:overflow-y-auto md:h-full order-2 md:order-1 no-scrollbar shrink-0">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden bg-white transition-colors flex items-center justify-center relative",
                  i === activeIndex
                    ? "border-[2px] border-[#4A5D23]"
                    : "border border-[#C6C8B8] hover:border-[#4A5D23]/50"
                )}
              >
                <img
                  src={img.url}
                  alt={img.alt_text ?? `${productName} ${i + 1}`}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-white/10 mix-blend-saturation pointer-events-none" />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="relative flex-1 w-full aspect-square md:aspect-auto md:h-full border border-[#C6C8B8] bg-white flex items-center justify-center order-1 md:order-2 overflow-hidden isolation-isolate group/main cursor-zoom-in">
          <img
            src={active.url}
            alt={active.alt_text ?? productName}
            className="w-full h-full object-contain transition-transform duration-500 group-hover/main:scale-110"
            onClick={() => openLightbox(activeIndex)}
          />

          {/* Crosshair corners */}
          <div className="absolute top-[9px] left-[9px] w-4 h-4 border-t-2 border-l-2 border-[#A1A1AA] z-10 pointer-events-none" />
          <div className="absolute top-[9px] right-[9px] w-4 h-4 border-t-2 border-r-2 border-[#A1A1AA] z-10 pointer-events-none" />
          <div className="absolute bottom-[9px] left-[9px] w-4 h-4 border-b-2 border-l-2 border-[#A1A1AA] z-10 pointer-events-none" />
          <div className="absolute bottom-[9px] right-[9px] w-4 h-4 border-b-2 border-r-2 border-[#A1A1AA] z-10 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
            {shipsFromUsa && (
              <div className="bg-[#1D70B8] border border-[#175A94] px-2.5 py-1 w-fit shadow-sm">
                <span className="font-sans text-[12px] text-white uppercase tracking-wide font-bold flex items-center gap-1.5">
                  <img src="/images/us-flag.png" alt="USA Flag" className="w-4.5 h-3 object-cover shrink-0" />
                  Ships from USA
                </span>
              </div>
            )}
            {isFeatured && (
              <div className="bg-[#BBAC48] border border-[#6A5F00] px-2 py-1 w-fit shadow-sm">
                <span className="font-sans text-[12px] text-[#484000] uppercase tracking-wide font-bold">Featured</span>
              </div>
            )}
            {nation && (
              <div className="bg-[#E8E8E8] border border-[#C6C8B8] px-2 py-1 w-fit shadow-sm">
                <span className="font-sans text-[12px] text-[#1A1C1C] uppercase tracking-wide">{nation}</span>
              </div>
            )}
            {era && (
              <div className="bg-white border border-[#C6C8B8] px-2 py-1 w-fit shadow-sm">
                <span className="font-sans text-[12px] text-[#1A1C1C] uppercase tracking-wide">{era}</span>
              </div>
            )}
          </div>

          {/* Zoom button */}
          <button
            onClick={() => openLightbox(activeIndex)}
            className="absolute bottom-[17px] right-[17px] w-9 h-9 bg-white border border-[#C6C8B8] shadow-[2px_2px_0px_rgba(0,0,0,0.1)] flex items-center justify-center z-20 hover:bg-gray-50 transition-colors"
            title="View full size"
          >
            <Search size={18} className="text-[#566065]" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt_text ?? productName}
              className="max-w-full max-h-[90vh] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-[12px] font-sans tracking-widest">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
