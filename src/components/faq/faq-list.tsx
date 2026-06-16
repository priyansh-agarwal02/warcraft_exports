"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { FAQS } from "@/lib/faq-data"


function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-khaki/30 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-sans font-semibold text-sm text-leather-dark group-hover:text-leather transition-colors">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-khaki transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="font-sans text-sm text-leather/80 leading-relaxed pb-5">{a}</p>
      )}
    </div>
  )
}

export function FAQList() {
  return (
    <div className="bg-white/50 border border-khaki/40 px-6 sm:px-8">
      {FAQS.map((item) => (
        <FAQItem key={item.q} q={item.q} a={item.a} />
      ))}
    </div>
  )
}
