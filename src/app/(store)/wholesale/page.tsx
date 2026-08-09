import type { Metadata } from "next"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"
import { getPageSeo } from "@/lib/queries/seo"
import { sendWholesaleNotification } from "@/lib/email"
import { WholesaleForm } from "@/components/wholesale/wholesale-form"
import { WholesaleProductStack } from "@/components/wholesale/wholesale-product-stack"
import { Truck, Factory, Layers, Film, Globe, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("wholesale")
  const title = seo?.meta_title || "Wholesale Historical Reenactment Gear & Military Props | Warcraft Exports"
  const description = seo?.meta_description || "Buy WW1 & WW2 reproduction military gear in bulk. Direct factory supplier from Kanpur, India for theater shows, movies, reenactor clubs, and retail shops."

  return {
    title,
    description,
    keywords: [
      "Wholesale Military Gear",
      "WW1 Reproduction Wholesale",
      "WW2 Reenactment Gear Bulk",
      "Film Prop Military Supplier",
      "Theater Costume Outfitting",
      "Kanpur Leather Goods Exporter",
      "RAAS Enterprises Wholesale",
      "Warcraft Exports B2B",
    ],
    alternates: { canonical: "https://www.warcraftexports.com/wholesale" },
    openGraph: {
      title,
      description,
      url: "https://www.warcraftexports.com/wholesale",
      siteName: "Warcraft Exports",
      type: "website",
      images: [
        {
          url: "https://www.warcraftexports.com/hero/wholesale-banner-new.webp",
          width: 1536,
          height: 1024,
          alt: "Warcraft Exports Kanpur Workshop Craftsmanship",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.warcraftexports.com/hero/wholesale-banner-new.webp"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

async function submitWholesaleAction(data: {
  name: string
  company: string
  country: string
  email: string
  phone: string
  categories: string[]
  volume: string
  message: string
}) {
  "use server"
  if (!data.name?.trim() || !data.country?.trim() || !data.email?.trim() || !data.phone?.trim() || !data.volume) {
    return { success: false, error: "Missing required fields" }
  }

  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`wholesale:${ip}`, 5, 3600_000)) {
    return { success: false, error: "Too many submissions. Please try again in an hour." }
  }

  const supabase = await createClient()

  const formattedMessage = [
    data.message ? `Message: ${data.message}` : "",
    data.categories.length > 0 ? `Product Categories of Interest: ${data.categories.join(", ")}` : "",
  ].filter(Boolean).join("\n\n")

  const { error } = await supabase.from("wholesale_inquiries").insert({
    contact_name: data.name,
    company_name: data.company?.trim() || "N/A",
    country: data.country,
    email: data.email,
    phone: data.phone,
    estimated_monthly_volume: data.volume,
    message: formattedMessage || null,
  })

  if (error) {
    console.error("Database wholesale insert failed:", error.message)
    return { success: false, error: error.message }
  }

  try {
    await sendWholesaleNotification({
      name: data.name,
      company: data.company,
      country: data.country,
      email: data.email,
      phone: data.phone || undefined,
      categories: data.categories,
      volume: data.volume,
      message: data.message || undefined,
    })
  } catch (emailErr: any) {
    console.error("Email B2B notification failed:", emailErr.message)
  }

  return { success: true }
}

const BENEFIT_CARDS = [
  {
    icon: Factory,
    title: "Factory-Direct Pricing",
    desc: "Buy directly from our Kanpur workshop (RAAS Enterprises). No middlemen markup.",
  },
  {
    icon: Layers,
    title: "Low 10+ Unit MOQ",
    desc: "Flexible order volumes starting at just 10 units with multi-category mix & match.",
  },
  {
    icon: Film,
    title: "Film & Stage Props",
    desc: "Trusted by theater companies, film set prop masters & museum living history archives.",
  },
  {
    icon: Truck,
    title: "Global Express Freight",
    desc: "Exporting to 20+ countries via DHL, FedEx & Ocean Freight with full documentation.",
  },
]

export default function WholesalePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Warcraft Exports",
    legalName: "RAAS Enterprises",
    url: "https://www.warcraftexports.com",
    logo: "https://www.warcraftexports.com/hero/wholesale-banner-new.webp",
    description: "Direct manufacturer and exporter of handcrafted WW1 & WW2 reproduction military gear and canvas goods from Kanpur, India.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kanpur",
      addressRegion: "Uttar Pradesh",
      addressCountry: "India",
    },
    knowsAbout: [
      "Historical Reenactment Gear",
      "Film Prop Supply",
      "Stage Show Costumes",
      "WW1 Military Reproductions",
      "WW2 Military Gear",
    ],
  }

  return (
    <div className="bg-parchment min-h-screen selection:bg-leather selection:text-parchment pb-4">
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── TOP HERO BANNER (Full Color WebP Banner) ── */}
      <div className="relative bg-[#18181B] text-white border-b-2 border-leather overflow-hidden">
        {/* Desktop WebP Banner (sm screens and above — untouched!) */}
        <div className="absolute inset-0 opacity-95 hidden sm:block">
          <Image
            src="/hero/wholesale-banner-new.webp"
            alt="Warcraft Exports Kanpur Workshop Craftsmanship"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Mobile WebP Banner (mobile screens under sm only!) */}
        <div className="absolute inset-0 opacity-95 block sm:hidden">
          <Image
            src="/hero/Mobile-wholesale-banner.webp"
            alt="Warcraft Exports Kanpur Workshop Craftsmanship"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Clear center overlay backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/35" />

        {/* Hero Content Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight text-white font-black leading-tight max-w-4xl mx-auto drop-shadow-lg">
            Handcrafted Historical Reproductions
          </h1>

          <p className="font-sans text-xs sm:text-base text-parchment max-w-2xl mx-auto mt-2 leading-relaxed font-semibold drop-shadow-md">
            Warcraft Exports — Handcrafted Leather &amp; Canvas Goods from Kanpur, India. Supplying Retailers, Theater Productions, Reenactment Clubs &amp; Collectors Worldwide.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (Tight Bottom Padding) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Benefits, Verified Showcase & Exporter Services (6 cols) */}
          <div className="lg:col-span-6 space-y-4 font-sans">
            
            {/* Benefit Grid (2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BENEFIT_CARDS.map((b) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.title}
                    className="bg-white/90 border border-khaki/60 p-3 rounded-sm shadow-xs hover:border-leather transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-parchment/80 border border-khaki/40 rounded-xs text-leather">
                        <Icon size={15} />
                      </div>
                      <h3 className="font-heading text-xs text-leather-dark font-bold uppercase tracking-wide">
                        {b.title}
                      </h3>
                    </div>
                    <p className="font-sans text-[11px] text-leather/70 leading-snug">
                      {b.desc}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Simplified Interactive Rotating Product Showcase */}
            <WholesaleProductStack />

            {/* Film, Theater & Reenactment Industry Credibility Box */}
            <div className="bg-[#18181B] text-parchment border-2 border-leather p-4.5 rounded-sm space-y-2 shadow-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Film size={17} className="text-[#A3E635]" />
                <h3 className="font-heading text-xs text-white uppercase tracking-wide font-bold">
                  Film Sets, Stage Shows &amp; Living History Outfitting
                </h3>
              </div>
              <p className="font-sans text-[11px] text-white/80 leading-relaxed">
                Warcraft Exports is a trusted direct supplier for theater prop directors, costume designers, and film production companies requiring period accuracy. We support custom production runs and bulk freight.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {["Theater Prop Depts", "Film Costume Directors", "Living History Clubs", "Museum Reenactors"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-sans font-bold uppercase tracking-wider bg-white/10 border border-white/15 px-2 py-0.5 text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Wholesale Reenactment Gear & Exporter Services Box */}
            <div className="bg-white/90 border border-khaki/60 p-4.5 rounded-sm shadow-xs space-y-2">
              <div className="flex items-center gap-2 border-b border-khaki/30 pb-2">
                <Globe size={16} className="text-leather" />
                <h3 className="font-heading text-xs uppercase tracking-wider text-leather-dark font-bold">
                  Wholesale Reenactment Gear &amp; Exporter Services
                </h3>
              </div>
              <p className="font-sans text-[11px] text-leather/80 leading-relaxed">
                Direct retail brand of RAAS Enterprises in Fazalgunj, Kanpur. We manufacture and export handcrafted leather &amp; canvas military goods spanning US, German, British, Soviet, and Japanese historical gear.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-[10px] text-leather-dark font-semibold">
                <div className="flex items-center gap-1.5 bg-parchment/60 p-1.5 border border-khaki/40 rounded-xs">
                  <CheckCircle2 size={12} className="text-[#33450D]" />
                  <span>Custom Production &amp; Patterns</span>
                </div>
                <div className="flex items-center gap-1.5 bg-parchment/60 p-1.5 border border-khaki/40 rounded-xs">
                  <CheckCircle2 size={12} className="text-[#33450D]" />
                  <span>Full Export Customs Clearance</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Wholesale Inquiry Form (6 cols — Equal & Perfectly Balanced) */}
          <div className="lg:col-span-6 sticky top-6">
            <WholesaleForm onSubmit={submitWholesaleAction} />
          </div>

        </div>
      </div>
    </div>
  )
}
