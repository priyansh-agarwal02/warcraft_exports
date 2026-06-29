import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"
import { siteConfig } from "@/config/site.config"

import { getPageSeo } from "@/lib/queries/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("stores")
  return {
    title: seo?.meta_title || "Where to Find Us — Warcraft Exports",
    description: seo?.meta_description || "Shop Warcraft Exports on Amazon, eBay, Walmart, and Google Shopping. Official stores with full buyer protection.",
  }
}

const STORES = [
  { name: "Amazon", region: "United States", url: siteConfig.social.amazon, live: true, note: "Our primary storefront. Full product range with Amazon Prime shipping for US buyers." },
  { name: "Amazon UK", region: "United Kingdom", url: null, live: false, note: "Coming soon. For UK orders, please use our main website or Amazon US." },
  { name: "Amazon DE", region: "Germany", url: null, live: false, note: "Coming soon. European orders ship from our Kanpur factory." },
  { name: "eBay", region: "United States", url: siteConfig.social.ebay || null, live: false, note: "eBay store URL will be listed here once active." },
  { name: "Walmart Marketplace", region: "United States", url: siteConfig.social.walmart || null, live: false, note: "Walmart listing coming soon." },
]

export default function StoresPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Our Presence</p>
        <h1 className="font-heading text-[40px] sm:text-[52px] font-black text-leather-dark uppercase leading-tight mb-4">
          Where to Find Us
        </h1>
        <p className="font-sans text-sm text-leather/70 mb-12 leading-relaxed max-w-2xl">
          Warcraft Exports products are available on multiple platforms. Buying directly from this website guarantees the widest selection and direct manufacturer support.
        </p>

        <div className="space-y-4 mb-12">
          {STORES.map((store) => (
            <div key={store.name} className={`border p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${store.live ? "border-khaki/60 bg-white/50" : "border-khaki/30 bg-parchment/30"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-heading text-base font-black text-leather-dark uppercase">{store.name}</h2>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-khaki">{store.region}</span>
                  {store.live ? (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-leather bg-leather/10 px-2 py-0.5">Live</span>
                  ) : (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-khaki bg-khaki/10 px-2 py-0.5">Coming Soon</span>
                  )}
                </div>
                <p className="font-sans text-xs text-leather/70">{store.note}</p>
              </div>
              {store.live && store.url && (
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-leather text-parchment font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-leather-dark transition-colors whitespace-nowrap"
                >
                  Visit Store <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="bg-leather-dark text-parchment p-8 text-center">
          <h2 className="font-heading text-xl font-black uppercase mb-2">Best Selection Here</h2>
          <p className="font-sans text-sm text-parchment/70 mb-5">Our website always carries the full catalogue &mdash; 300+ products, with direct manufacturer support.</p>
          <a href="/shop" className="inline-block bg-gold text-leather-dark font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-gold/90 transition-colors">Browse All Products</a>
        </div>
      </div>
    </div>
  )
}
