"use client"
import { useEffect, useRef, useState } from "react"
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency"

export function CurrencySelector() {
  const { currency, setCurrency, fetchRates } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const curr = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]

  useEffect(() => { fetchRates() }, [fetchRates])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-[0.12em] text-parchment/70 hover:text-parchment transition-colors px-2 py-1 border border-parchment/20 hover:border-parchment/40"
      >
        {curr.symbol} {curr.code}
        <svg viewBox="0 0 10 6" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="M1 1l4 4 4-4"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#2A1F14] border border-parchment/20 z-50 max-h-60 overflow-y-auto shadow-xl">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-[11px] font-sans flex items-center justify-between hover:bg-parchment/10 transition-colors ${currency === c.code ? "text-gold" : "text-parchment/70"}`}
            >
              <span>{c.name}</span>
              <span className="font-bold">{c.symbol} {c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
