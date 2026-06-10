"use client"
import { useState, useEffect } from "react"
import { siteConfig } from "@/config/site.config"
import { CurrencySelector } from "./currency-selector"
import { LanguageSelector } from "./language-selector"

export function AnnouncementBar() {
  const msgs = siteConfig.announcements
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % msgs.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [msgs.length])

  return (
    <div className="bg-leather-dark border-b border-khaki/20 py-1.5 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: static label (hidden on mobile) */}
        <span className="hidden lg:block text-[10px] font-sans text-parchment/40 tracking-[0.1em] flex-shrink-0 whitespace-nowrap">
          Handcrafted · Est. Kanpur, India
        </span>

        {/* Center: rotating text */}
        <p
          className={`text-[11px] font-sans font-bold uppercase tracking-[0.22em] text-parchment/80 transition-opacity duration-400 text-center flex-1 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          {msgs[idx]}
        </p>

        {/* Right: language + currency */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <LanguageSelector />
          <div className="w-px h-3 bg-parchment/20" />
          <CurrencySelector />
        </div>
      </div>
    </div>
  )
}
