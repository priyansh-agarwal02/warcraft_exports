"use client"

import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Globe, Factory } from "lucide-react"
import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"

const POINTS = [
  {
    icon: Factory,
    title: "Direct from Manufacturer",
    body: "No middlemen. Factory pricing with full quality control — crafted in our Kanpur workshop.",
  },
  {
    icon: ShieldCheck,
    title: "Custom Manufacturing",
    body: "Tailored production runs for museum gift shops, prop houses, and specialized reenactment suppliers.",
  },
  {
    icon: Globe,
    title: "Ships to 20+ Countries",
    body: "DHL, FedEx and Ship Global partnerships ensure reliable and fast delivery worldwide.",
  },
]

const leftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 220, damping: 22, staggerChildren: 0.12 } },
}
const pointVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
}
const rightVariants: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 24, delay: 0.15 } },
}

export function WholesaleSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="py-20 bg-leather-dark text-parchment overflow-hidden">
      <div ref={ref} className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* MOTION: Left content slides in from left */}
          <motion.div
            className="flex-1 text-left"
            variants={leftVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.p variants={pointVariants} className="text-[12px] font-sans font-bold uppercase tracking-[0.2em] text-gold mb-2">
              Wholesale &amp; B2B
            </motion.p>
            <motion.h2 variants={pointVariants} className="font-serif text-4xl lg:text-5xl font-bold uppercase text-parchment mb-6 leading-[1.1]">
              Partner Directly with the Manufacturer
            </motion.h2>
            <motion.p variants={pointVariants} className="text-[15px] text-parchment/70 max-w-xl font-sans mb-12 leading-relaxed">
              Serving retailers, museum gift shops, film &amp; TV prop houses, and reenactment societies since 1989. Bypass the middlemen and source your inventory straight from the source.
            </motion.p>

            <div className="flex flex-col gap-8 mb-12">
              {POINTS.map(({ icon: Icon, title, body }) => (
                <motion.div key={title} variants={pointVariants} className="flex items-start gap-5">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-parchment/10 border border-parchment/20">
                    <Icon size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-parchment mb-1.5 uppercase tracking-[0.08em]">{title}</h3>
                    <p className="text-[13px] text-parchment/60 leading-relaxed font-sans max-w-[400px]">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* MOTION: CTA button with tap spring */}
            <motion.div variants={pointVariants}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="inline-block">
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-3 bg-leather text-white px-8 py-4 text-[12px] font-sans font-bold uppercase tracking-[0.15em] border border-leather hover:bg-[#4A5D23] transition-colors"
                >
                  Submit Wholesale Enquiry
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* MOTION: Right image slides in from right */}
          <motion.div
            className="flex-1 w-full relative h-[650px] hidden lg:block"
            variants={rightVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="absolute inset-0 bg-leather-dark/20 z-10" />
            <Image
              src="/Category/Wholesale.jpeg"
              alt="Wholesale Production Facility"
              fill
              className="object-cover border border-parchment/20"
              style={{ filter: "sepia(0.15) saturate(0.9)" }}
            />
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-gold/40 z-20" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-gold/40 z-20" />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
