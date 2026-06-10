"use client"

import { useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  href: string
  color: string
  isWarning?: boolean
  isCurrency?: boolean
  index?: number
}

export function MetricCard({ label, value, icon: Icon, href, color, isWarning, isCurrency, index = 0 }: MetricCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(0)

  // Card entrance animation (runs only once on mount)
  useGSAP(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, delay: index * 0.05, ease: "power2.out" }
    )
  }, { dependencies: [], scope: cardRef })

  // Counter animation when the value updates
  useGSAP(() => {
    const valueEl = valueRef.current
    if (!valueEl) return

    const numericValue = typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]/g, ""))
      : value

    if (isNaN(numericValue) || typeof numericValue !== "number") {
      valueEl.textContent = String(value)
      return
    }

    const prevVal = prevValueRef.current
    const counter = { val: prevVal }

    gsap.to(counter, {
      val: numericValue,
      duration: 1.0,
      ease: "power2.out",
      onUpdate: () => {
        if (isCurrency) {
          valueEl.textContent = `$${counter.val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        } else {
          valueEl.textContent = Math.round(counter.val).toLocaleString("en-US")
        }
      },
      onComplete: () => {
        prevValueRef.current = numericValue
      }
    })
  }, { dependencies: [value], scope: cardRef })

  // Initial SSR / first-paint fallback
  const parsed = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""))
  const displayValue = isCurrency
    ? `$${(isNaN(parsed) ? 0 : parsed).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : (isNaN(parsed) ? String(value) : parsed.toLocaleString("en-US"))

  return (
    <Link
      ref={cardRef}
      href={href}
      className={`${color} border border-[#E4E4E7] p-4 shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 block opacity-0 group cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#71717A] group-hover:text-[#33450D] transition-colors">
          {label}
        </span>
        <Icon size={14} className={`${isWarning ? "text-red-500" : "text-[#71717A]"} group-hover:text-[#33450D] transition-colors`} />
      </div>
      <span
        ref={valueRef}
        className="font-heading text-[18px] sm:text-[20px] lg:text-[22px] font-black text-[#18181B] truncate block"
        title={displayValue}
      >
        {displayValue}
      </span>
    </Link>
  )
}
