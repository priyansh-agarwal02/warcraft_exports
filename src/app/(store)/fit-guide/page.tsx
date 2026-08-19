import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Ruler, Anchor, Sparkles, ArrowRight, ExternalLink } from "lucide-react"

import { getPageSeo } from "@/lib/queries/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("fit-guide")
  return {
    title: seo?.meta_title || "WW1 & WW2 Reproduction Equipment, Sizing & Impression Guide — Warcraft Exports",
    description: seo?.meta_description || "Complete sizing charts for military tunics, M41/M43 jackets, helmet shell-liner conversions, WW1 wool puttees wrapping, rifle sling mounting, and reenactment equipment guides.",
    keywords: [
      "reproduction gear fit guide",
      "WW1 military kit selector",
      "WW2 military uniforms sizing",
      "WW1 wool puttees wrapping guide",
      "M1917A1 helmet liners for sale",
      "m1 garand sling mounting",
      "British WW2 Enfield sling",
      "WWII reenactment gear",
      "German WW1 helmet sizing",
      "M1936 musette bag",
      "M1910 1st aid pouches",
    ],
  }
}

const NATIONS = [
  { label: "American", slug: "us", code: "US", bg: "#1C2C4A" },
  { label: "German", slug: "german", code: "DE", bg: "#2A2A2A" },
  { label: "British", slug: "british", code: "GB", bg: "#1A2744" },
  { label: "Soviet", slug: "soviet", code: "SU", bg: "#6B0000" },
  { label: "Japanese", slug: "japanese", code: "JP", bg: "#8B0000" },
  { label: "French", slug: "french", code: "FR", bg: "#003189" },
]

export default function FitGuidePage() {
  return (
    <div className="bg-parchment min-h-screen selection:bg-leather selection:text-parchment">
      {/* ── Top Hero Banner ── */}
      <div className="relative bg-[#18181B] text-parchment border-b-2 border-leather py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: "url('/hero/hero-1.webp')" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-3">
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-khaki drop-shadow-xs">
            Historical Equipment &amp; Sizing Standard
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
            WW1 &amp; WW2 Reenactment Gear, US Field Gear &amp; Sizing Guide
          </h1>
          <p className="font-sans text-xs sm:text-sm text-parchment/90 max-w-3xl mx-auto leading-relaxed drop-shadow-xs">
            Detailed measurement charts for military uniforms, M1917A1 helmet liners, WW1 wool puttees, US field gear, rifle slings, and WWII reenactment gear loadouts.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* ── TOP SECTION: Impression & Equipment Loadout Guides (Direct Product Cross-Links) ── */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-leather-dark uppercase">
              WW1 &amp; WWII Equipment Loadouts &amp; Direct Product Links
            </h2>
            <p className="font-sans text-xs text-leather/70 mt-1">
              Explore key equipment pieces used across US, British, and German historical loadouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Guide 1: US Army Infantry */}
            <div className="bg-white/90 border border-khaki/60 p-5 rounded-sm shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-khaki/30 pb-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-khaki">US Army WWII</span>
                  <span className="text-[9px] font-sans font-bold bg-[#1C2C4A] text-white px-2 py-0.5 rounded-xs">USGI</span>
                </div>
                <h3 className="font-heading text-base font-bold text-leather-dark uppercase">
                  WWII US Army Infantry Equipment
                </h3>
                <p className="font-sans text-[11px] text-leather/75 leading-relaxed">
                  Key field webbing, rifle slings, M1 canvas belts, and vintage medic pouches for US infantry impressions.
                </p>
                <div className="space-y-1.5 pt-2">
                  <Link
                    href="/product/warcraft-exports-exports-m1-garand-1903-web-sling-us-gi-patt-1"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>M1 Garand US GI Web Sling</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/product/pack-of-5-warcraft-exports-us-army-wwii-m1-webbing-canvas-be"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>M1 Webbing Canvas Belt</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/product/warcraft-exports-vintage-medic-canvas-bag-with-cross-militar"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>M1910 Vintage Medic Pouch Bag</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <Link
                href="/shop/nation/us"
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-khaki hover:text-leather transition-colors block text-center pt-2"
              >
                Browse All WWII US Gear &rarr;
              </Link>
            </div>

            {/* Guide 2: British Tommy */}
            <div className="bg-white/90 border border-khaki/60 p-5 rounded-sm shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-khaki/30 pb-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-khaki">British Army WW1 &amp; WW2</span>
                  <span className="text-[9px] font-sans font-bold bg-[#1A2744] text-white px-2 py-0.5 rounded-xs">UK</span>
                </div>
                <h3 className="font-heading text-base font-bold text-leather-dark uppercase">
                  British Tommy Webbing &amp; Slings
                </h3>
                <p className="font-sans text-[11px] text-leather/75 leading-relaxed">
                  1937 pattern khaki webbing, Lee Enfield rifle slings, 144&quot; wool puttees, and Webley revolver holsters.
                </p>
                <div className="space-y-1.5 pt-2">
                  <Link
                    href="/product/wwii-british-style-enfield-sling-light-khaki-canvas-webbing"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>British Lee Enfield Rifle Sling</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/shop?search=putties"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>WW1 Wool Long Puttees (144&quot;)</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/product/british-army-455-webley-luger-revolver-canvas-holster-khaki"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>British .455 Webley Revolver Holster</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <Link
                href="/shop/nation/british"
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-khaki hover:text-leather transition-colors block text-center pt-2"
              >
                Browse All British Gear &rarr;
              </Link>
            </div>

            {/* Guide 3: German Wehrmacht & WWI */}
            <div className="bg-white/90 border border-khaki/60 p-5 rounded-sm shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-khaki/30 pb-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-khaki">German WW1 &amp; WW2</span>
                  <span className="text-[9px] font-sans font-bold bg-[#2A2A2A] text-white px-2 py-0.5 rounded-xs">DE</span>
                </div>
                <h3 className="font-heading text-base font-bold text-leather-dark uppercase">
                  German Wehrmacht Leather &amp; Gear
                </h3>
                <p className="font-sans text-[11px] text-leather/75 leading-relaxed">
                  K98/G98 embossed leather slings, Luger P08 holsters, and MP38/MP40 ammo magazine pouch sets.
                </p>
                <div className="space-y-1.5 pt-2">
                  <Link
                    href="/product/german-mauser-kar-98-k98-98k-k98k-kar98-g41-g43-k43-leather"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>German K98/G98 Leather Sling</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/product/wwii-german-p08-luger-pistol-holster-black-with-takedown-too"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>Luger P08 Hard Shell Holster</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/product/german-wwii-mp40-wehrmacht-magazine-pouch-set-grey-get-free"
                    className="group flex items-center justify-between text-xs font-sans font-semibold text-leather hover:text-leather-dark p-2 bg-parchment/60 rounded-xs border border-khaki/30 transition-all"
                  >
                    <span>German MP40 Ammo Pouch Set</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <Link
                href="/shop/nation/german"
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-khaki hover:text-leather transition-colors block text-center pt-2"
              >
                Browse All German Gear &rarr;
              </Link>
            </div>

          </div>
        </section>

        {/* ── BOTTOM SECTION: Technical Sizing & Measurement Charts ── */}
        <section className="space-y-8 pt-4 border-t-2 border-khaki">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-leather-dark uppercase">
              Uniform, Puttees &amp; Helmet Liner Sizing Charts
            </h2>
            <p className="font-sans text-xs text-leather/70 mt-1">
              Refer to our measurement standards below to find your correct uniform chest size, helmet liner size, or belt waist length.
            </p>
          </div>

          {/* Table A: Uniforms & Jackets */}
          <div className="bg-white/90 border border-khaki/60 p-6 rounded-sm shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-leather" />
              <h3 className="font-heading text-lg font-bold text-leather-dark uppercase">
                1. Military Uniform &amp; Jacket Sizing Chart (Tunics, M41/M43 Jackets)
              </h3>
            </div>
            <p className="font-sans text-xs text-leather/80 leading-relaxed">
              Our reproduction tunics and jackets are tailored according to original historical specifications. For best fit when wearing over a wool shirt, measure your chest with a tape measure level across your shoulder blades.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-parchment border-b border-khaki/60 text-leather-dark font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-2.5">Size Tag</th>
                    <th className="p-2.5">Chest Size (Inches)</th>
                    <th className="p-2.5">Chest Size (CM)</th>
                    <th className="p-2.5">Shoulder Width</th>
                    <th className="p-2.5">Sleeve Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-khaki/30 text-leather/90">
                  <tr><td className="p-2.5 font-bold">Small (38)</td><td className="p-2.5">36&quot; – 38&quot;</td><td className="p-2.5">91 – 96 cm</td><td className="p-2.5">18.0&quot; (45 cm)</td><td className="p-2.5">24.5&quot; (62 cm)</td></tr>
                  <tr className="bg-parchment/30"><td className="p-2.5 font-bold">Medium (40)</td><td className="p-2.5">38&quot; – 40&quot;</td><td className="p-2.5">96 – 101 cm</td><td className="p-2.5">18.5&quot; (47 cm)</td><td className="p-2.5">25.0&quot; (63 cm)</td></tr>
                  <tr><td className="p-2.5 font-bold">Large (42)</td><td className="p-2.5">40&quot; – 42&quot;</td><td className="p-2.5">101 – 106 cm</td><td className="p-2.5">19.2&quot; (49 cm)</td><td className="p-2.5">25.5&quot; (65 cm)</td></tr>
                  <tr className="bg-parchment/30"><td className="p-2.5 font-bold">X-Large (44)</td><td className="p-2.5">42&quot; – 44&quot;</td><td className="p-2.5">106 – 111 cm</td><td className="p-2.5">20.0&quot; (51 cm)</td><td className="p-2.5">26.0&quot; (66 cm)</td></tr>
                  <tr><td className="p-2.5 font-bold">XX-Large (48)</td><td className="p-2.5">46&quot; – 48&quot;</td><td className="p-2.5">116 – 122 cm</td><td className="p-2.5">21.0&quot; (53 cm)</td><td className="p-2.5">26.5&quot; (67 cm)</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table B: WW1 Wool Puttees & Canvas Leggings */}
          <div className="bg-white/90 border border-khaki/60 p-6 rounded-sm shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-leather" />
              <h3 className="font-heading text-lg font-bold text-leather-dark uppercase">
                2. WW1 Wool Puttees &amp; Canvas Leggings Fitting Standard
              </h3>
            </div>
            <p className="font-sans text-xs text-leather/80 leading-relaxed">
              Warcraft Exports manufactures authentic WW1 British &amp; US pattern wool puttees woven to full 9-foot (2.75-meter) length with heavy cotton securing tapes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-parchment/50 border border-khaki/40 p-4 rounded-xs space-y-2">
                <h4 className="font-heading text-xs font-bold text-leather-dark uppercase tracking-wide">
                  Puttees Wrapping Instructions
                </h4>
                <ol className="list-decimal list-inside font-sans text-xs text-leather/80 space-y-1">
                  <li>Start wrapping just above the boot ankle bone.</li>
                  <li>Overlap each turn by 50% moving upward toward the knee.</li>
                  <li>Keep uniform tension to prevent slippage during field movement.</li>
                  <li>Tie off secured cotton tape neatly below the knee joint.</li>
                </ol>
              </div>
              <div className="bg-parchment/50 border border-khaki/40 p-4 rounded-xs space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading text-xs font-bold text-leather-dark uppercase tracking-wide">
                    Puttees Specifications
                  </h4>
                  <p className="font-sans text-xs text-leather/80 mt-1">
                    Standard 9 ft length (275 cm) × 4 in width (10 cm). Made from 100% thick woven khaki wool cloth with heavy cotton tapes.
                  </p>
                </div>
                <Link
                  href="/shop?search=putties"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-leather hover:text-leather-dark uppercase tracking-wide pt-2"
                >
                  View WW1 Wool Puttees &amp; Leggings in Catalog &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Table C: Helmet Shell & Liner Size Conversion */}
          <div className="bg-white/90 border border-khaki/60 p-6 rounded-sm shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Anchor size={18} className="text-leather" />
              <h3 className="font-heading text-lg font-bold text-leather-dark uppercase">
                3. Helmet Shell &amp; Liner Head Size Conversion Table
              </h3>
            </div>
            <p className="font-sans text-xs text-leather/80 leading-relaxed">
              Historical steel helmets (German Stahlhelm M16/M35/M40/M42 and US M1917A1 Doughboy) use specific shell sizes fitted with internal leather/canvas liners.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-parchment border-b border-khaki/60 text-leather-dark font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-2.5">Helmet Type</th>
                    <th className="p-2.5">Steel Shell Size</th>
                    <th className="p-2.5">Liner Head Size (CM)</th>
                    <th className="p-2.5">Hat Size (US)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-khaki/30 text-leather/90">
                  <tr><td className="p-2.5 font-bold">M1917A1 Doughboy / Brodie</td><td className="p-2.5">Standard One-Size Shell</td><td className="p-2.5">56 cm – 60 cm</td><td className="p-2.5">7 to 7-1/2 (Adjustable Webbing)</td></tr>
                  <tr className="bg-parchment/30"><td className="p-2.5 font-bold">German Stahlhelm (Small Shell)</td><td className="p-2.5">Shell Size 64</td><td className="p-2.5">56 cm – 57 cm</td><td className="p-2.5">7 to 7-1/8</td></tr>
                  <tr><td className="p-2.5 font-bold">German Stahlhelm (Medium Shell)</td><td className="p-2.5">Shell Size 66</td><td className="p-2.5">58 cm – 59 cm</td><td className="p-2.5">7-1/4 to 7-3/8</td></tr>
                  <tr className="bg-parchment/30"><td className="p-2.5 font-bold">German Stahlhelm (Large Shell)</td><td className="p-2.5">Shell Size 68</td><td className="p-2.5">60 cm – 61 cm</td><td className="p-2.5">7-1/2 to 7-5/8</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table D: Leather Belts & Holster Waist Sizes */}
          <div className="bg-white/90 border border-khaki/60 p-6 rounded-sm shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-leather" />
              <h3 className="font-heading text-lg font-bold text-leather-dark uppercase">
                4. Leather Waist Belts &amp; Holster Fitment Chart
              </h3>
            </div>
            <p className="font-sans text-xs text-leather/80 leading-relaxed">
              Military leather waist belts are worn over tunic cloth. Always measure your waist size over your tunic when selecting belt length.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
              <div className="bg-parchment/50 p-3 border border-khaki/40 rounded-xs">
                <p className="font-bold text-leather-dark uppercase text-[11px]">95 cm Belt</p>
                <p className="text-leather/70 text-[11px] mt-0.5">Fits waist 32&quot; – 35&quot; (80 – 90 cm)</p>
              </div>
              <div className="bg-parchment/50 p-3 border border-khaki/40 rounded-xs">
                <p className="font-bold text-leather-dark uppercase text-[11px]">105 cm Belt</p>
                <p className="text-leather/70 text-[11px] mt-0.5">Fits waist 36&quot; – 39&quot; (90 – 100 cm)</p>
              </div>
              <div className="bg-parchment/50 p-3 border border-khaki/40 rounded-xs">
                <p className="font-bold text-leather-dark uppercase text-[11px]">115 cm Belt</p>
                <p className="text-leather/70 text-[11px] mt-0.5">Fits waist 40&quot; – 43&quot; (100 – 110 cm)</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA & Catalogue Search ── */}
        <div className="border border-khaki/60 bg-white/70 p-6 text-center rounded-sm shadow-xs space-y-4">
          <h3 className="font-heading text-lg font-bold text-leather-dark uppercase">
            Need Custom Sizing or Bulk Wholesale Outfitting?
          </h3>
          <p className="font-sans text-xs text-leather/80 max-w-xl mx-auto leading-relaxed">
            We support theater prop departments, film production teams, and living history reenactment clubs with custom sizing runs and bulk wholesale orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link
              href="/wholesale"
              className="inline-block bg-leather text-parchment font-sans font-bold text-xs uppercase tracking-[0.15em] px-6 py-3 hover:bg-leather-dark transition-colors"
            >
              Wholesale B2B Inquiry &rarr;
            </Link>
            <Link
              href="/shop"
              className="inline-block border border-leather text-leather font-sans font-bold text-xs uppercase tracking-[0.15em] px-6 py-3 hover:bg-leather hover:text-parchment transition-colors"
            >
              Browse Full Catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
