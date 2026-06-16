import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Fit Guide & Kit Selector — Warcraft Exports",
  description:
    "Interactive kit selector for WW1 & WW2 reproduction military gear. Browse leather holsters, canvas pouches, and historical collector items by era and nation.",
  keywords: [
    "reproduction gear fit guide",
    "WW1 military kit selector",
    "WW2 military kit selector",
    "historical reenactment gear builder",
  ],
}

const NATIONS = [
  { label: "American", slug: "us", code: "US", bg: "#1C2C4A" },
  { label: "German", slug: "german", code: "DE", bg: "#2A2A2A" },
  { label: "British", slug: "british", code: "GB", bg: "#1A2744" },
  { label: "Soviet", slug: "soviet", code: "SU", bg: "#6B0000" },
  { label: "Japanese", slug: "japanese", code: "JP", bg: "#8B0000" },
  { label: "French", slug: "french", code: "FR", bg: "#003189" },
]

const ERAS = ["WW1", "WW2"]

export default function FitGuidePage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Kit Selector</p>
        <h1 className="font-heading text-[40px] sm:text-[52px] font-black text-leather-dark uppercase leading-tight mb-3">
          Find Your Kit
        </h1>
        <p className="font-sans text-sm text-leather/70 mb-12 leading-relaxed">
          Select a nation and era below to browse matching historical reproduction gear.
        </p>

        {/* Era tabs */}
        {ERAS.map((era) => (
          <div key={era} className="mb-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-px bg-khaki" />
              <h2 className="font-heading text-[20px] font-black text-leather-dark uppercase tracking-wide">{era}</h2>
              <div className="flex-1 h-px bg-khaki/30" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NATIONS.map(({ label, slug, code, bg }) => (
                <Link
                  key={slug}
                  href={`/shop/nation/${slug}?era=${era}`}
                  className="group relative overflow-hidden aspect-[4/3] flex flex-col justify-end p-4 hover:ring-2 hover:ring-leather transition-all"
                  style={{ background: bg }}
                >
                  <span className="absolute top-3 right-3 font-heading text-3xl font-bold text-white/15 select-none">{code}</span>
                  <p className="relative text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-white/60 mb-0.5">{era}</p>
                  <p className="relative font-heading text-lg font-black text-white uppercase">{label}</p>
                  <p className="relative text-[10px] font-sans font-bold uppercase tracking-wide text-white/50 mt-0.5 group-hover:text-white/80 transition-colors">Browse gear &rarr;</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-10 border border-khaki/40 bg-white/50 p-6 text-center">
          <p className="font-sans text-sm text-leather-dark mb-4">Looking for something specific? Browse the full catalogue or search by item type.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="inline-block bg-leather text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-6 py-3 hover:bg-leather-dark transition-colors">All Products</Link>
            <Link href="/search" className="inline-block border border-leather text-leather font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-6 py-3 hover:bg-leather hover:text-parchment transition-colors">Search Catalogue</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
