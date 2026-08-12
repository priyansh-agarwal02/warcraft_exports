"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Layers, ArrowRight } from "lucide-react"

type ProductCard = {
  sku: string
  name: string
  image: string
  nation?: string
}

// 100% Database-Verified SKUs, Titles & Image URLs from Supabase
const FEATURED_PRODUCTS: ProductCard[] = [
  {
    sku: "V8-KMPG-YKOQ",
    name: "German WWI 98 Leather Sling (Gewehr M98)",
    image: "https://m.media-amazon.com/images/I/71HeDUAs5sL.jpg",
    nation: "German WWI",
  },
  {
    sku: "4P-NQB3-MP6K",
    name: "British 1871 Martini-Henry Black-Tan Leather Sling",
    image: "https://m.media-amazon.com/images/I/61Ugb-Gu1KL.jpg",
    nation: "British WWI",
  },
  {
    sku: "K6-8Q08-14SQ",
    name: "Warcraft Exports U.S. Army WWII M1 Canvas Belt (Pack of 5)",
    image: "https://m.media-amazon.com/images/I/414gYz50OcL.jpg",
    nation: "US WWII",
  },
  {
    sku: "IY-9X9S-07M5",
    name: "US Army Cotton Cloth Garand Bandolier (Pack of 5)",
    image: "https://m.media-amazon.com/images/I/41AtLsvxA-L.jpg",
    nation: "US WWII",
  },
  {
    sku: "J0-R8D3-B0VJ",
    name: "Leather Officers Sam Browne Pouch (Dark Brown)",
    image: "https://m.media-amazon.com/images/I/81kahR10fDL.jpg",
    nation: "British",
  },
  {
    sku: "TT-Q8SW-WC2P",
    name: "Rhodesian Fereday & Sons Canvas Chest Rig",
    image: "https://m.media-amazon.com/images/I/41s669q6JPL.jpg",
    nation: "Rhodesian",
  },
  {
    sku: "JN-FHCA-JBUG",
    name: "U.S. Army M1923 10-Pocket Canvas Belt",
    image: "https://m.media-amazon.com/images/I/813OcDptTiL.jpg",
    nation: "US WWII",
  },
  {
    sku: "British Tunic-L",
    name: "British 37 Pattern Tunic Battle Uniform Reproduction",
    image: "https://m.media-amazon.com/images/I/41TTVCGVP5L.jpg",
    nation: "British WWII",
  },
  {
    sku: "34-PHL4-REQ2",
    name: "British 37 Pattern Trousers Battle Uniform Reproduction",
    image: "https://m.media-amazon.com/images/I/31+eGovbVzL.jpg",
    nation: "British WWII",
  },
  {
    sku: "83-7DRZ-J41Y",
    name: "British WWII Army 1940 Chip Side Hat Reproduction",
    image: "https://m.media-amazon.com/images/I/61KjcJ0y0iL.jpg",
    nation: "British WWII",
  },
  {
    sku: "D5-DWR4-3IX9",
    name: "German M40 EM WWII Overseas Field Cap",
    image: "https://m.media-amazon.com/images/I/71CgfevGXDS.jpg",
    nation: "German WWII",
  },
  {
    sku: "EE-8R55-SJF8",
    name: "Warcraft Exports Medic Canvas Messenger Shoulder Bag",
    image: "https://m.media-amazon.com/images/I/818RiCtwWGL.jpg",
    nation: "US WWII",
  },
  {
    sku: "AT-UAXL-DJN3",
    name: "WW1 U.S. Army Putties & M1910 Canvas Leggings Wraps",
    image: "https://m.media-amazon.com/images/I/713ZCqoj+aL.jpg",
    nation: "US WWI",
  },
]

export function WholesaleProductStack() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto rotation timer (rotates every 3.8s unless hovered)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_PRODUCTS.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [isPaused])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_PRODUCTS.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + FEATURED_PRODUCTS.length) % FEATURED_PRODUCTS.length)
  }

  const currentProduct = FEATURED_PRODUCTS[currentIndex]

  const handleInquiryClick = () => {
    const inquiryForm = document.getElementById("wholesale-inquiry-form")
    if (inquiryForm) {
      inquiryForm.scrollIntoView({ behavior: "smooth" })
      const nameInput = document.getElementById("name")
      if (nameInput) nameInput.focus()
    }
  }

  return (
    <div className="bg-white/90 border border-khaki/60 p-4 rounded-sm shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-khaki/30 mb-3">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-leather" />
          <h3 className="font-heading text-xs uppercase tracking-wider text-leather-dark font-bold">
            Featured Production Catalog Items
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-leather bg-parchment/80 px-2 py-0.5 border border-khaki/50">
          MOQ 10+ Units · Mix & Match
        </span>
      </div>

      {/* Product Card */}
      <div
        className="relative bg-parchment/40 border border-khaki/40 p-4 rounded-sm transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Image */}
          <div className="w-28 h-28 bg-white border border-khaki/50 relative flex-shrink-0 flex items-center justify-center p-1.5 rounded-xs overflow-hidden shadow-xs">
            <Image
              src={currentProduct.image}
              alt={currentProduct.name}
              fill
              sizes="112px"
              unoptimized
              className="object-contain p-1"
            />
          </div>

          {/* Details & INQUIRE NOW Button */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="text-[9px] font-mono font-bold text-leather bg-white px-1.5 py-0.5 border border-khaki/40">
                SKU: {currentProduct.sku}
              </span>
              {currentProduct.nation && (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-khaki bg-white px-1.5 py-0.5 border border-khaki/30">
                  {currentProduct.nation}
                </span>
              )}
            </div>

            <h4 className="font-heading text-xs text-leather-dark leading-snug font-bold line-clamp-2">
              {currentProduct.name}
            </h4>

            {/* INQUIRE NOW Button */}
            <div className="pt-1.5 flex items-center justify-center sm:justify-start">
              <button
                type="button"
                onClick={handleInquiryClick}
                className="inline-flex items-center gap-2 bg-[#33450D] text-white hover:bg-[#27350A] text-[11px] font-sans font-bold uppercase tracking-wider px-4 py-2 rounded-xs transition-all shadow-xs cursor-pointer"
              >
                <span>INQUIRE NOW</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls (No Counter Numbers) */}
        <div className="mt-3 pt-2.5 border-t border-khaki/20 flex items-center justify-between">
          <span className="text-[10px] font-sans italic text-khaki font-medium">
            Handcrafted in Kanpur, India
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevSlide}
              className="p-1 bg-white border border-khaki/60 text-leather hover:bg-leather hover:text-parchment transition-colors rounded-xs"
              aria-label="Previous product"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="p-1 bg-white border border-khaki/60 text-leather hover:bg-leather hover:text-parchment transition-colors rounded-xs"
              aria-label="Next product"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
