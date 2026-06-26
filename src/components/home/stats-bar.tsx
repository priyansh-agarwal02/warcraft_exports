"use client"
import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { siteConfig } from "@/config/site.config"

const STATS = [
  { value: siteConfig.brand.yearsInBusiness, label: "Years in Business", suffix: "" },
  { value: siteConfig.brand.countriesServed, label: "Countries Served", suffix: "" },
  { value: siteConfig.brand.ordersFulfilled, label: "Orders Fulfilled", suffix: "" },
  { value: siteConfig.brand.products, label: "Products", suffix: "" },
]

// MOTION: Each stat slides up and fades in with a stagger
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  // once: true — animates once when scrolled into view, stays visible
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-parchment border-y border-khaki">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:flex md:flex-row items-center justify-around"
        >
          {STATS.map(({ value, label, suffix }, index) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className={`w-full px-4 md:px-6 py-4
                ${index % 2 === 0 ? "border-r border-khaki md:border-r-0" : ""}
                ${index >= 2 ? "border-t border-khaki md:border-t-0" : ""}
                ${index !== 0 ? "md:border-l md:border-khaki" : ""}
              `}
            >
              <div className="font-heading text-[32px] md:text-[40px] text-leather-dark font-black leading-none mb-1">
                {value}{suffix}
              </div>
              <div className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-muted-text">
                {label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
