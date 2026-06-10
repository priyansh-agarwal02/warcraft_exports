"use client"
import { useEffect, useRef, useState } from "react"

const LANGUAGES = [
  { code: "en", label: "ENG", name: "English" },
  { code: "de", label: "DEU", name: "Deutsch" },
  { code: "fr", label: "FRA", name: "Français" },
  { code: "ja", label: "JPN", name: "日本語" },
  { code: "ru", label: "RUS", name: "Русский" },
  { code: "it", label: "ITA", name: "Italiano" },
  { code: "es", label: "ESP", name: "Español" },
]

function getActiveLang(): string {
  if (typeof document === "undefined") return "en"
  const decodedCookie = decodeURIComponent(document.cookie)
  // Google Translate cookie format: googtrans=/sourceLang/targetLang
  // Example: /en/fr or /auto/fr
  const match = decodedCookie.match(/googtrans=\/[a-zA-Z]*\/([^;]+)/)
  return match ? match[1] : "en"
}

export function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [activeLang, setActiveLang] = useState("en")
  const ref = useRef<HTMLDivElement>(null)

  const setLang = (langCode: string) => {
    // 1. Clear any existing cookies first
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "googtrans=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    if (langCode !== "en") {
      // Set cookie for current host (essential for localhost)
      document.cookie = `googtrans=/en/${langCode}; path=/`
      
      // Also try setting it for base domain if applicable
      const hostname = window.location.hostname
      if (!hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
        const parts = hostname.split(".")
        if (parts.length >= 2) {
          const baseDomain = parts.slice(-2).join(".")
          document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${baseDomain}`
        }
      }
    }

    // 2. Always reload to ensure the translation is applied consistently across all client/server components on the entire site
    window.location.reload()
  }

  useEffect(() => {
    setActiveLang(getActiveLang())
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Intercept anchor clicks when a non-English language is active
  // to force a full browser reload, ensuring Google Translate translates the next page on load.
  useEffect(() => {
    if (activeLang === "en") return

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return

      // Do not intercept external links, hashes, mailto, tel
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return
      }

      // Check if target is set (e.g. target="_blank")
      const targetAttr = anchor.getAttribute("target")
      if (targetAttr && targetAttr !== "_self") return

      // Intercept navigation and force a full reload
      e.preventDefault()
      e.stopPropagation()
      window.location.href = href
    }

    document.addEventListener("click", handleAnchorClick, true)
    return () => document.removeEventListener("click", handleAnchorClick, true)
  }, [activeLang])

  const currentLang = LANGUAGES.find(l => l.code === activeLang) ?? LANGUAGES[0]

  return (
    <div ref={ref} className="relative">

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-[0.12em] text-parchment/70 hover:text-parchment transition-colors px-2 py-1 border border-parchment/20 hover:border-parchment/40 cursor-pointer"
      >
        {currentLang.label}
        <svg viewBox="0 0 10 6" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="M1 1l4 4 4-4"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#2A1F14] border border-parchment/20 z-50 shadow-xl">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLang(lang.code); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-[11px] font-sans flex items-center justify-between hover:bg-parchment/10 transition-colors cursor-pointer ${activeLang === lang.code ? "text-gold font-semibold" : "text-parchment/70"}`}
            >
              <span>{lang.name}</span>
              <span className="font-mono text-[10px] opacity-60">{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Scoped styling to shift website header down to accommodate the Google Translate top banner */}
      <style>{`
        html.translated-ltr .sticky,
        html.translated-rtl .sticky {
          top: 40px !important;
        }

        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
        }

        iframe.goog-te-banner-frame {
          z-index: 99999 !important;
        }
      `}</style>
    </div>
  )
}
