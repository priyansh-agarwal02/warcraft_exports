"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"

const NATION_CATEGORIES = [
  { nation: "us", label: "American Gear", code: "US", image: "/Category/american.jpeg" },
  { nation: "german", label: "German Gear", code: "DE", image: "/Category/german.jpeg" },
  { nation: "british", label: "British Gear", code: "GB", image: "/Category/british.jpeg" },
  { nation: "soviet", label: "Soviet Gear", code: "SU", image: "/Category/soviet.jpeg" },
  { nation: "japanese", label: "Japanese Gear", code: "JP", image: "/Category/japenese.jpeg" },
]

// MOTION: Staggered grid reveal
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
}
const headingVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export function FeaturedCategories() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="pt-16 pb-6 bg-parchment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOTION: Header slides in from left */}
        <motion.div
          className="flex items-end justify-between mb-8"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div>
            <p className="text-[12px] font-sans font-bold uppercase tracking-[0.2em] text-muted-text mb-2">
              Browse by Nation
            </p>
            <h2 className="font-heading text-[32px] font-black text-leather-dark uppercase leading-tight">
              Choose Your Militaria
            </h2>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-[0.12em] text-leather hover:text-leather-dark transition-colors">
            All Products <ArrowRight size={12} />
          </Link>
        </motion.div>

        {/* MOTION: Cards stagger in */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {NATION_CATEGORIES.map(({ nation, label, code, image }) => (
            <motion.div key={nation} variants={cardVariants} className={nation === "japanese" ? "hidden sm:block" : "block"}>
              <Link
                href={`/shop/nation/${nation}`}
                className="group relative overflow-hidden border border-khaki bg-card-white aspect-[3/4] flex flex-col justify-end p-4 hover:border-leather transition-colors"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                {/* Country code watermark */}
                <span className="absolute top-3 right-3 font-heading text-2xl font-bold text-white/30 select-none z-10">
                  {code}
                </span>

                {/* Label */}
                <div className="relative z-10">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-white/60 mb-1">
                    {code}
                  </p>
                  <p className="font-heading text-lg font-bold text-white uppercase leading-tight mb-1">
                    {label}
                  </p>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.12em] text-white/50 flex items-center gap-1">
                    Shop Now <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-4 sm:hidden text-center">
          <Link href="/shop" className="text-xs font-sans font-bold uppercase tracking-widest text-leather">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
