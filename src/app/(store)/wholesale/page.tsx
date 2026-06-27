import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"

export const metadata: Metadata = {
  title: "Wholesale Enquiry — Warcraft Exports",
  description:
    "Partner directly with the manufacturer. Factory-direct pricing on WW1 & WW2 historical reproduction gear. Submit a wholesale enquiry today.",
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

        {/* Inquiry form */}
        <div className="max-w-3xl mx-auto">
          <WholesaleForm onSubmit={submitWholesaleAction} />
        </div>

      </div>
    </div>
  )
}
