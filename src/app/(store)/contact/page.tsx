import type { Metadata } from "next"
import { Suspense } from "react"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { siteConfig } from "@/config/site.config"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"
import { getPageSeo } from "@/lib/queries/seo"
import { sendContactNotification, sendContactAutoresponder } from "@/lib/email"
import { ContactForm } from "@/components/contact/contact-form"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {}
  const seo = await getPageSeo("contact")
  const hasQueryParams = Object.keys(resolvedParams || {}).length > 0

  return {
    title: seo?.meta_title || "Contact Us — Warcraft Exports",
    description: seo?.meta_description || "Get in touch with Warcraft Exports. Questions about orders, products, or wholesale enquiries — our team responds within 2 business days.",
    alternates: { canonical: "https://www.warcraftexports.com/contact" },
    robots: hasQueryParams
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
          },
        },
  }
}

async function submitContactAction(name: string, email: string, subject: string, message: string) {
  "use server"
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`contact:${ip}`, 5, 3600_000)) {
    return { success: false, error: "Too many submissions. Please try again in an hour." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
  })
  if (error) {
    console.error("Database contact insert failed:", error.message)
    return { success: false, error: error.message }
  }
  try {
    await sendContactNotification(name, email, subject, message)
    await sendContactAutoresponder(name, email, subject, message)
  } catch (emailErr: any) {
    console.error("Email notification failed:", emailErr.message)
  }
  return { success: true }
}

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: Phone,
    label: "Phone / WhatsApp",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone}`,
  },
  {
    icon: MapPin,
    label: "Factory Address",
    value: siteConfig.address,
    href: null,
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon – Sat, 10:00 AM – 6:00 PM IST",
    href: null,
  },
]

export default function ContactPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">
            Get in Touch
          </p>
          <h1 className="font-heading text-[40px] sm:text-[52px] font-black text-leather-dark uppercase leading-tight">
            Contact Us
          </h1>
          <p className="font-sans text-sm text-leather/70 mt-3 max-w-xl leading-relaxed">
            We respond to every enquiry personally. For product questions, include the SKU in your
            subject line. For wholesale, use the{" "}
            <a href="/wholesale" className="text-leather underline underline-offset-2 hover:text-leather-dark">
              Wholesale Enquiry form
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact info */}
          <aside className="lg:col-span-2 space-y-6">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-leather/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-leather" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-khaki mb-0.5">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="font-sans text-sm text-leather-dark hover:text-leather transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="font-sans text-sm text-leather-dark">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="border-t border-khaki/30 pt-6">
              <p className="font-sans text-xs text-khaki leading-relaxed">
                We are a factory-direct manufacturer in Kanpur, India. We do not have a retail
                storefront. All orders ship internationally via DHL, FedEx, and Ship Global.
              </p>
            </div>
          </aside>

          {/* Contact form wrapped in Suspense boundary for searchParams */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div className="bg-white/50 border border-khaki/40 p-8 h-[450px] animate-pulse" />}>
              <ContactForm onSubmit={submitContactAction} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
