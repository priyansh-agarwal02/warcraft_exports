"use client"

import Link from "next/link"
import { siteConfig } from "@/config/site.config"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"

const CATEGORIES = [
  { name: "Holsters", slug: "holsters" },
  { name: "Slings", slug: "slings" },
  { name: "Collectibles", slug: "collectibles" },
  { name: "Field Equipment", slug: "equipment" },
  { name: "Military Cases", slug: "military-cases" },
  { name: "Belts & Straps", slug: "belts-straps" },
  { name: "Headgear", slug: "headgear" },
  { name: "Bags & Satchels", slug: "bags-satchels" },
  { name: "Uniforms", slug: "uniforms" },
  { name: "Canvas Gear", slug: "canvas-gear" },
  { name: "Optics & Accessories", slug: "optics-accessories" },
]

const panelVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 26 },
  },
  exit: {
    opacity: 0, y: -8, scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
}

const itemVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}
const linkVariant: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 22 } },
}

export function MegaMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* MOTION: Chevron rotates smoothly on open */}
      <button className="flex items-center gap-1 text-[14.5px] font-sans font-bold uppercase tracking-[0.04em] text-[#18181B] hover:text-leather border-b-2 border-transparent hover:border-leather transition-all pb-0.5">
        Shop
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="inline-flex"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* MOTION: Dropdown panel animates in/out */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 mt-0 pt-2 z-50 w-[680px]"
          >
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-parchment border border-khaki shadow-xl rounded-sm p-6 grid grid-cols-3 gap-6"
            >
              {/* By Nation */}
              <div>
                <p className="text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-khaki mb-3 border-b border-khaki/40 pb-2">
                  By Nation
                </p>
                <ul className="space-y-1.5">
                  {siteConfig.navNations.map((n) => (
                    <motion.li key={n} variants={linkVariant}>
                      <Link
                        href={`/shop/nation/${n.toLowerCase()}`}
                        className="text-xs font-sans text-leather-dark hover:text-leather hover:pl-1 transition-all duration-150 block"
                      >
                        {n}
                      </Link>
                    </motion.li>
                  ))}
                  <motion.li variants={linkVariant}>
                    <Link href="/shop" className="text-xs font-sans text-khaki hover:text-leather transition-colors">
                      All Nations →
                    </Link>
                  </motion.li>
                </ul>
              </div>

              {/* By Era */}
              <div>
                <p className="text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-khaki mb-3 border-b border-khaki/40 pb-2">
                  By Era
                </p>
                <ul className="space-y-1.5">
                  {siteConfig.eras.slice(0, 2).map((e) => (
                    <motion.li key={e} variants={linkVariant}>
                      <Link
                        href={`/shop/era/${e.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-xs font-sans text-leather-dark hover:text-leather hover:pl-1 transition-all duration-150 block"
                      >
                        {e}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* By Category */}
              <div>
                <p className="text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-khaki mb-3 border-b border-khaki/40 pb-2">
                  By Category
                </p>
                <ul className="space-y-1.5">
                  {CATEGORIES.map((c) => (
                    <motion.li key={c.slug} variants={linkVariant}>
                      <Link
                        href={`/shop/category/${c.slug}`}
                        className="text-xs font-sans text-leather-dark hover:text-leather hover:pl-1 transition-all duration-150 block"
                      >
                        {c.name}
                      </Link>
                    </motion.li>
                  ))}
                  <motion.li variants={linkVariant}>
                    <Link href="/shop" className="text-xs font-sans text-khaki hover:text-leather transition-colors">
                      All Categories →
                    </Link>
                  </motion.li>
                </ul>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
