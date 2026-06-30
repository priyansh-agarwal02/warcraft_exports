import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/client"
import { siteConfig } from "@/config/site.config"

export const revalidate = 3600 // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://warcraftexports.com"

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/wholesale`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/fit-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/stores`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/shipping-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/returns-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  // Dynamic nation pages from siteConfig
  const nationPages: MetadataRoute.Sitemap = siteConfig.nations.map((nation) => {
    const slug = nation.toLowerCase()
    return {
      url: `${baseUrl}/shop/nation/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: slug === "us" || slug === "german" ? 0.8 : 0.7,
    }
  })

  // Dynamic era pages from siteConfig
  const eraPages: MetadataRoute.Sitemap = siteConfig.eras.map((era) => {
    const slug = era.toLowerCase().replace(/\s+/g, "-")
    return {
      url: `${baseUrl}/shop/era/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: slug === "ww1" || slug === "ww2" ? 0.8 : 0.6,
    }
  })

  // Dynamic product & category pages
  let productPages: MetadataRoute.Sitemap = []
  let categoryPages: MetadataRoute.Sitemap = []

  try {
    const supabase = await createClient()

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(5000)

    if (products) {
      productPages = products.map((p: { slug: string; updated_at: string }) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    }

    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .eq("is_active", true)

    if (categories) {
      categoryPages = categories.map((c: { slug: string }) => ({
        url: `${baseUrl}/shop/category/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }))
    }
  } catch {
    // Silently fall through — static pages are still generated
  }

  return [...staticPages, ...nationPages, ...eraPages, ...categoryPages, ...productPages]
}
