"use client"

import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"

const BADGES = [
  { emoji: "🚚", title: "Free Domestic Shipping", sub: "on orders $500+" },
  { emoji: "↩", title: "Hassle Free 30 Day", sub: "Return Period" },
  { emoji: "🛒", title: "100% Safe", sub: "Secure Checkout" },
  { emoji: "🏅", title: "Guaranteed Authentic", sub: "to the Historical Period" },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 22 } },
}

export function TrustBadgesStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <section className="w-full bg-black border-y border-[#3b342c]">
      <div className="max-w-[1280px] mx-auto">
        {/* MOTION: Trust badges stagger in when scrolled into view */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {BADGES.map(({ emoji, title, sub }, i) => (
            <motion.div
              key={title}
              variants={itemVariants}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-4 px-6 py-5 transition-colors
                ${i < 3 ? "border-b lg:border-b-0 lg:border-r border-[#3b342c]" : ""}
                ${i === 1 ? "md:border-b-0" : ""}
              `}
            >
              <div className="text-[#d6c3a5] text-4xl opacity-90 select-none">{emoji}</div>
              <div>
                <h3 className="text-white text-[15px] font-black uppercase tracking-[0.02em] leading-none font-heading mb-1">
                  {title}
                </h3>
                <p className="text-white/80 text-[12px] font-black uppercase tracking-[0.04em] leading-none font-heading">
                  {sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
