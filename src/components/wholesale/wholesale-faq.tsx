"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"

const FAQ_ITEMS = [
  {
    id: "cat",
    question: "1. What military reproduction categories are available for bulk order?",
    answer:
      "We supply wholesale quantities for M1 Garand web and 1907 leather slings, Lee Enfield canvas slings, K98 leather slings and triple ammo pouches, P08 Luger holsters, M1916 Colt .45 holsters, WW1 wool puttees (144-inch), Sam Browne leather belts, and M1936 pistol belts.",
  },
  {
    id: "moq",
    question: "2. What is the Minimum Order Quantity (MOQ) for wholesale buyers?",
    answer:
      "Our standard wholesale Minimum Order Quantity (MOQ) starts at just 10 units per order. Retail store owners, theater prop masters, and reenactment clubs can mix and match across different product categories (slings, holsters, belts, and gaiters) to reach the 10-unit minimum.",
  },
  {
    id: "custom",
    question: "3. Do you provide custom manufacturing for film sets and prop masters?",
    answer:
      "Yes. As a direct manufacturer in Kanpur, India, we offer custom leather embossing, historical pattern matching, and custom canvas dyeing for movie productions, TV series, and living history museum exhibits requiring specific historical specs.",
  },
  {
    id: "shipping",
    question: "4. How are international B2B shipments delivered and customs cleared?",
    answer:
      "We ship worldwide via DHL Express, FedEx, air cargo & ocean freight. All shipments include complete commercial invoices, HS code documentation, and export packing lists for seamless customs clearance in the United States, United Kingdom, Europe, and Australia.",
  },
]

export function WholesaleFaq() {
  const [openId, setOpenId] = useState<string | null>("cat") // First item open by default

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="bg-white/80 border border-khaki/60 p-5 rounded-sm shadow-xs space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-khaki/30 pb-3">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-khaki">
            <HelpCircle size={12} className="text-leather" />
            <span>Factory Direct B2B Outfitting</span>
          </div>
          <h2 className="font-heading text-base sm:text-lg font-black text-leather-dark uppercase tracking-tight">
            B2B Wholesale FAQ &amp; Product Scope
          </h2>
        </div>
        <p className="font-sans text-[11px] text-leather/70 text-left sm:text-right max-w-sm leading-tight">
          Frequently asked questions on bulk ordering, custom prop runs, and export shipping.
        </p>
      </div>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id
          return (
            <div
              key={item.id}
              className="border border-khaki/40 bg-parchment/40 rounded-xs overflow-hidden transition-colors hover:border-leather/60"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left font-sans text-xs font-bold text-leather-dark hover:bg-parchment/80 transition-colors"
              >
                <span>{item.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-leather/70 ml-2"
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-0.5 font-sans text-xs text-leather/85 leading-relaxed border-t border-khaki/20 bg-white/70">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
