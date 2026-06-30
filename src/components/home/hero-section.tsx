"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

const slides = [
  {
    type: "image",
    src: "/hero/hero-1.webp",
    eyebrow: "WW2 Collection · 2026 Archive",
    heading: "AUTHENTIC\nWARTIME\nREPRODUCTIONS",
    lede: "Manufacturer-direct leather holsters, canvas gear, and military equipment. Hand-crafted in Kanpur, India. Ships to 50+ countries.",
    cta: { label: "Shop WW2 Collection", href: "/shop/era/ww2" },
    ghost: { label: "View All Products", href: "/shop" },
  },
  {
    type: "image",
    src: "/hero/hero-2.webp",
    eyebrow: "WW1 Collection · Great War Archive",
    heading: "THE GREAT\nWAR\nARCHIVE",
    lede: "1914–1918 reproduction gear from all major powers. US, British, French, German, and Imperial forces accurately reproduced.",
    cta: { label: "Shop WW1 Collection", href: "/shop/era/ww1" },
    ghost: { label: "Wholesale Enquiry", href: "/wholesale" },
  },
  {
    type: "image",
    src: "/hero/hero-3.webp",
    eyebrow: "By Nation · Browse Collections",
    heading: "SEVEN\nNATIONS\nONE MAKER",
    lede: "US, German, British, Soviet, Japanese, French & Italian forces. Every nation's gear reproduced to museum standard.",
    cta: { label: "Browse by Nation", href: "/shop" },
    ghost: { label: "About Our Process", href: "/about" },
  },
  {
    type: "image",
    src: "/hero/hero-4.webp",
    eyebrow: "Wholesale · Trade Buyers",
    heading: "GLOBAL\nTRADE\nPARTNER",
    lede: "Factory-direct pricing. No middlemen. Trusted by reenactment suppliers, film productions, and collectors worldwide.",
    cta: { label: "Wholesale Pricing", href: "/wholesale" },
    ghost: { label: "Contact Us", href: "/contact" },
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <section className="relative h-[550px] bg-[#18181B] overflow-hidden isolate">
      {/* Slides */}
      {slides.map((slide, i) => {
        // Only load other slide images after hydration when they are needed or adjacent to prefetch
        const shouldRenderImage = i === 0 || i === current || (mounted && (i === (current + 1) % slides.length || i === (current - 1 + slides.length) % slides.length))

        return (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {shouldRenderImage && (
              <>
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? "high" : "low"}
                  sizes="(max-width: 768px) 100vw, 100vw"
                  className="object-cover"
                  style={{ filter: "sepia(0.15) saturate(0.9)" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.82) 100%)" }} />
              </>
            )}
          </div>
        )
      })}

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-[160px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 w-full">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-[#BBAC48]" />
            <span className="text-[#BBAC48] text-[11px] font-sans font-bold uppercase tracking-[0.3em]">
              {slides[current].eyebrow}
            </span>
            <div className="w-8 h-px bg-[#BBAC48]" />
          </div>

          {/* Heading */}
          <h1 className="font-heading font-black text-white uppercase leading-[0.85] tracking-[-1.5px] mb-4"
            style={{ fontSize: "clamp(36px, 6.5vw, 64px)" }}>
            {slides[current].heading.split("\n").map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>

          {/* Lede */}
          <p className="text-white/85 text-[16px] font-sans leading-[1.55] max-w-[560px] mb-8">
            {slides[current].lede}
          </p>

          {/* CTAs */}
          <div className="flex gap-4 flex-wrap">
            <Link
              href={slides[current].cta.href}
              className="inline-flex items-center gap-2.5 bg-leather text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-6 py-[14px] border border-leather hover:bg-[#4A5D23] transition-colors"
            >
              {slides[current].cta.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href={slides[current].ghost.href}
              className="inline-flex items-center gap-2.5 bg-transparent text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-6 py-[14px] border border-white hover:bg-white hover:text-[#1A1C1C] transition-colors"
            >
              {slides[current].ghost.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators (bottom left) */}
      <div className="absolute bottom-12 left-4 sm:left-8 z-20 flex gap-3 items-center">
        <span className="text-white/70 text-[11px] font-sans tracking-[0.2em]">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-3 ml-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all"
              style={{
                width: "40px",
                height: i === current ? "3px" : "2px",
                background: i === current ? "#BBAC48" : "rgba(255,255,255,0.3)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Arrow controls (bottom right) */}
      <div className="absolute bottom-8 right-4 sm:right-8 z-20 flex gap-2">
        <button
          onClick={prev}
          className="w-11 h-11 border border-white/40 text-white flex items-center justify-center bg-black/30 hover:bg-leather hover:border-leather transition-colors"
          aria-label="Previous slide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={next}
          className="w-11 h-11 border border-white/40 text-white flex items-center justify-center bg-black/30 hover:bg-leather hover:border-leather transition-colors"
          aria-label="Next slide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  )
}
