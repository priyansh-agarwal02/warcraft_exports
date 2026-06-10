"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

interface ConversionRateProps {
  totalOrders: number
  totalPageviews: number
}

export function ConversionRate({ totalOrders, totalPageviews }: ConversionRateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(0)

  const rate = totalPageviews > 0 ? (totalOrders / totalPageviews) * 100 : 0
  const hasData = totalPageviews > 0

  // Card entrance animation (runs once on mount)
  useGSAP(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, delay: 1.0, ease: "power2.out" }
    )
  }, { dependencies: [], scope: containerRef })

  // Counter animation when rate changes
  useGSAP(() => {
    const valueEl = valueRef.current
    if (!valueEl || !hasData) return

    const prevVal = prevValueRef.current
    const counter = { val: prevVal }

    gsap.to(counter, {
      val: rate,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (valueEl) {
          valueEl.textContent = counter.val.toFixed(2) + "%"
        }
      },
      onComplete: () => {
        prevValueRef.current = rate
      }
    })
  }, { dependencies: [rate, hasData], scope: containerRef })

  return (
    <Link href="/admin/analytics" className="block">
      <div ref={containerRef} className="opacity-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Conversion Rate</h2>
          <TrendingUp size={16} className="text-[#33450D]" />
        </div>

        {!hasData ? (
          <div className="text-center py-6">
            <p className="font-heading text-[32px] font-black text-[#A1A1AA]">N/A</p>
            <p className="text-[11px] text-[#D4D4D8] font-sans mt-1">Awaiting analytics data</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <span ref={valueRef} className="font-heading text-[36px] font-black text-[#33450D]">
              {rate.toFixed(2)}%
            </span>
            <p className="text-[11px] text-[#71717A] font-sans mt-2">
              {totalOrders} orders / {totalPageviews.toLocaleString()} visits
            </p>

            {/* Mini progress bar */}
            <div className="mt-3 w-full bg-[#F4F4F4] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#33450D] to-[#BBAC48] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(rate * 10, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
