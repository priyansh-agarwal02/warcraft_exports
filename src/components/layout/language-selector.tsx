"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const LANGUAGES = [
  { code: "en", label: "ENG", name: "English" },
  { code: "de", label: "DEU", name: "Deutsch" },
  { code: "fr", label: "FRA", name: "Français" },
  { code: "ja", label: "JPN", name: "日本語" },
  { code: "ru", label: "RUS", name: "Русский" },
  { code: "it", label: "ITA", name: "Italiano" },
  { code: "es", label: "ESP", name: "Español" },
]

/** Read active language from the googtrans cookie */
function getActiveLangFromCookie(): string {
  if (typeof document === "undefined") return "en"
  const decodedCookie = decodeURIComponent(document.cookie)
  const match = decodedCookie.match(/googtrans=\/[a-zA-Z-]*\/([^;]+)/)
  if (match && match[1] && match[1] !== "en") return match[1]
  return "en"
}



export function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [activeLang, setActiveLang] = useState("en")
  const ref = useRef<HTMLDivElement>(null)

  // ── Read active language from cookie on mount ─────────────────────────
  useEffect(() => {
    setActiveLang(getActiveLangFromCookie())
  }, [])

  // ── Hide Google Translate bar via MutationObserver ─────────────────────
  // Google Translate signals the bar by setting body.style.top = '39px'.
  // We watch that attribute and reset it immediately, then hide the iframe.
  useEffect(() => {
    function suppressBar() {
      // Remove the body top-shift Google applies to make room for the bar
      if (document.body.style.top) {
        document.body.style.top = ""
      }
      // Hide the banner iframe itself
      const iframe = document.querySelector("iframe.goog-te-banner-frame") as HTMLElement | null
      if (iframe) {
        iframe.style.setProperty("display", "none", "important")
        iframe.style.setProperty("height", "0", "important")
      }
    }

    // Run once immediately in case it's already been set
    suppressBar()

    // Watch body for inline style changes (Google sets top via style attribute)
    const observer = new MutationObserver(suppressBar)
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] })

    // Also watch for the iframe being injected into the DOM
    const bodyObserver = new MutationObserver(suppressBar)
    bodyObserver.observe(document.body, { childList: true })

    return () => {
      observer.disconnect()
      bodyObserver.disconnect()
    }
  }, [])

  // ── Close dropdown on outside click ──────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Set language ──────────────────────────────────────────────────────
  const setLang = (langCode: string) => {
    setOpen(false)
    if (langCode === activeLang) return

    // Clear old cookies
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "googtrans=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    if (langCode !== "en") {
      document.cookie = `googtrans=/en/${langCode}; path=/`
      const hostname = window.location.hostname
      if (!hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
        const parts = hostname.split(".")
        if (parts.length >= 2) {
          const baseDomain = parts.slice(-2).join(".")
          document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${baseDomain}`
        }
      }
    }

    // Update label immediately (optimistic UI) before reload
    setActiveLang(langCode)

    // For English: clear cookie and reload — page initialises clean with no translate bar
    if (langCode === "en") {
      window.location.reload()
      return
    }

    // For other languages: try Google Translate's internal select element
    // (avoids a full reload, translation happens in-place)
    try {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null
      if (select) {
        select.value = langCode
        select.dispatchEvent(new Event("change"))
        return
      }
    } catch (_) {
      // ignore
    }

    // Fallback: page reload
    window.location.reload()
  }

  // ── Force full reload on anchor clicks when translated ────────────────
  useEffect(() => {
    if (activeLang === "en") return
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (!href) return
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) return
      const targetAttr = anchor.getAttribute("target")
      if (targetAttr && targetAttr !== "_self") return
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
      {/* MOTION: Trigger button — chevron rotates on open */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-[0.12em] text-parchment/70 hover:text-parchment transition-colors px-2 py-1 border border-parchment/20 hover:border-parchment/40 cursor-pointer"
      >
        {currentLang.label}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          viewBox="0 0 10 6" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M1 1l4 4 4-4"/>
        </motion.svg>
      </motion.button>

      {/* MOTION: Dropdown slides down with spring, language items stagger in */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={{ originY: 0 }}
            className="absolute right-0 top-full mt-1 w-44 bg-[#2A1F14] border border-parchment/20 z-50 shadow-xl overflow-hidden"
          >
            {LANGUAGES.map((lang, i) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                onClick={() => setLang(lang.code)}
                className={`w-full text-left px-3 py-2 text-[11px] font-sans flex items-center justify-between hover:bg-parchment/10 transition-colors cursor-pointer ${activeLang === lang.code ? "text-gold font-semibold" : "text-parchment/70"}`}
              >
                <span>{lang.name}</span>
                <span className="font-mono text-[10px] opacity-60">{lang.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip suppression only — bar hiding is handled by MutationObserver above */}
      <style>{`
        html.translated-ltr .sticky,
        html.translated-rtl .sticky {
          top: 40px !important;
        }
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
