import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"
import { getPageSeo } from "@/lib/queries/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("wholesale")
  return {
    title: seo?.meta_title || "Wholesale Historical Reenactment Gear & Military Props | Warcraft Exports",
    description: seo?.meta_description || "Buy WW1 & WW2 reproduction military gear in bulk. Factory-direct supplier for theatre shows, movies, reenactor clubs, and retail shops. Custom leather & canvas manufacturing from Kanpur, India.",
  }
}

import { sendWholesaleNotification } from "@/lib/email"
import { WholesaleForm } from "@/components/wholesale/wholesale-form"

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

const BENEFITS = [
  {
    icon: "🏭",
    title: "Factory-Direct Pricing",
    desc: "No middlemen. You buy directly from RAAS Enterprises, the manufacturer in Kanpur, India.",
  },
  {
    icon: "📦",
    title: "Flexible Volumes",
    desc: "We work with reenactment groups, retailers, and distributors. Enquire with your requirements.",
  },
  {
    icon: "🌍",
    title: "Ships Worldwide",
    desc: "We export to 20+ countries via DHL, FedEx, and Ship Global. Full documentation provided.",
  },
  {
    icon: "🏅",
    title: "Trusted Since 2018",
    desc: "Over 70,000 orders fulfilled. Museums, film productions, and collectors trust our quality.",
  },
]

const PRODUCT_CATEGORIES = [
  "US Gear",
  "German Gear",
  "British Gear",
  "Japanese Gear",
  "Soviet Gear",
  "All Nations",
]

const VOLUME_OPTIONS = [
  "Under 100 units",
  "100–500 units",
  "500–1,000 units",
  "1,000+ units",
]

export default function WholesalePage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-2">
            For Retailers, Distributors &amp; Bulk Buyers
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-leather-dark mb-4">
            Partner Directly with the Manufacturer
          </h1>
          <p className="font-sans text-leather/80 max-w-2xl mx-auto text-base leading-relaxed">
            RAAS Enterprises has supplied historical reproduction gear to retailers, reenactment
            groups, and collectors in 20+ countries since 2018. Submit an enquiry and our team
            will respond within 24 hours.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white/60 border border-khaki/40 rounded-sm p-6 text-center"
            >
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="font-heading text-base text-leather-dark mb-2">{b.title}</h3>
              <p className="font-sans text-xs text-leather/70 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* B2B Segments and Keywords Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 border-t border-b border-khaki/30 py-12">
          <div>
            <h2 className="font-heading text-2xl text-leather-dark mb-4">
              Theatrical Plays, Stage Shows &amp; Film Production Supplies
            </h2>
            <p className="font-sans text-sm text-leather/80 leading-relaxed mb-4">
              Warcraft Exports is a trusted B2B partner for theater groups, movie set prop masters, drama societies, and television costume directors. We specialize in supplying bulk historical reproductions of WW1 and WW2 military gear, enabling production companies to achieve complete period-accuracy.
            </p>
            <p className="font-sans text-sm text-leather/80 leading-relaxed">
              Whether outfitting a full platoon of actors for a stage play, outfitting extras for a feature film, or looking for specific vintage leather goods and canvas web accessories, we provide custom bulk solutions tailored to your production timeline.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-leather-dark mb-4">
              Wholesale Reenactment Gear &amp; Exporter Services
            </h2>
            <p className="font-sans text-sm text-leather/80 leading-relaxed mb-4">
              As the direct retail brand of RAAS Enterprises in Fazalgunj, Kanpur, we are a leading exporter of handcrafted leather military goods. Our facility supports custom production runs, pattern replication, and bulk wholesale logistics for international distributors, military surplus stores, and living history organizations.
            </p>
            <p className="font-sans text-sm text-leather/80 leading-relaxed">
              Our B2B catalog spans US, German, British, Soviet, and Japanese military gear reproductions. We handle export documentation, customs clearance, and global air/ocean freight to ensure seamless delivery to your retail warehouse or club address.
            </p>
          </div>
        </div>

        {/* Inquiry form */}
        <div className="max-w-3xl mx-auto">
          <WholesaleForm onSubmit={submitWholesaleAction} />
        </div>

      </div>
    </div>
  )
}
