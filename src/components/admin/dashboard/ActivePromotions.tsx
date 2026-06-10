"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import Link from "next/link"
import { Percent, Tag } from "lucide-react"

interface Promotion {
  id: string
  name: string
  type: "coupon" | "quantity"
  detail: string
}

interface ActivePromotionsProps {
  count: number
  promotions: Promotion[]
}

export function ActivePromotions({ count, promotions }: ActivePromotionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 1.1, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Active Promotions</h2>
        <Link href="/admin/promotions" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
          Manage
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-[#33450D]/10 flex items-center justify-center">
          <Percent size={20} className="text-[#33450D]" />
        </div>
        <div>
          <p className="font-heading text-[24px] font-black text-[#18181B]">{count}</p>
          <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider">Active</p>
        </div>
      </div>

      {promotions.length === 0 ? (
        <p className="text-[12px] text-[#A1A1AA] font-sans">No active promotions</p>
      ) : (
        <div className="space-y-2 max-h-[120px] overflow-y-auto">
          {promotions.slice(0, 5).map((promo) => (
            <div key={promo.id} className="flex items-center justify-between text-[11px] font-sans py-1.5 border-b border-[#F4F4F4] last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                {promo.type === "coupon" ? (
                  <Tag size={11} className="text-[#BBAC48] flex-shrink-0" />
                ) : (
                  <Percent size={11} className="text-[#33450D] flex-shrink-0" />
                )}
                <span className="font-bold text-[#18181B] truncate">{promo.name}</span>
              </div>
              <span className="text-[#71717A] text-[10px] flex-shrink-0 ml-2">{promo.detail}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/admin/promotions"
        className="block text-center border border-[#E4E4E7] py-2 text-[11px] font-sans font-bold uppercase tracking-wider text-[#18181B] hover:bg-[#FAF9F6] transition-colors mt-3"
      >
        Manage Promotions
      </Link>
    </div>
  )
}
