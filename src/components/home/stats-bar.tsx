"use client"
import { useEffect, useRef, useState } from "react"
import { siteConfig } from "@/config/site.config"

const STATS = [
  { value: siteConfig.brand.yearsInBusiness, label: "Years in Business", suffix: "" },
  { value: siteConfig.brand.countriesServed, label: "Countries Served", suffix: "" },
  { value: siteConfig.brand.ordersFulfilled, label: "Orders Fulfilled", suffix: "" },
  { value: siteConfig.brand.products, label: "Products", suffix: "" },
]

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-parchment border-y border-khaki">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-around">
          {STATS.map(({ value, label, suffix }, index) => (
            <div
              key={label}
              className={`w-full px-4 md:px-6 py-4 transition-all duration-700 ${index % 2 === 0 ? "border-r border-khaki md:border-r-0" : ""} ${index >= 2 ? "border-t border-khaki md:border-t-0" : ""} ${index !== 0 ? "md:border-l md:border-khaki" : ""} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="font-heading text-[32px] md:text-[40px] text-leather-dark font-black leading-none mb-1">
                {value}{suffix}
              </div>
              <div className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-muted-text">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
