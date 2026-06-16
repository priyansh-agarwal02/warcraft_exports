import type { Metadata } from "next"
import { siteConfig } from "@/config/site.config"

export const metadata: Metadata = {
  title: "About Us — Warcraft Exports",
  description:
    "RAAS Enterprises — manufacturing WW1 & WW2 historical reproduction gear in Kanpur, India since 2014. Factory-direct, hand-crafted, shipped to 20+ countries.",
}

const STATS = [
  { value: siteConfig.brand.yearsInBusiness, label: "Years in Business" },
  { value: siteConfig.brand.countriesServed, label: "Countries Served" },
  { value: siteConfig.brand.ordersFulfilled, label: "Orders Fulfilled" },
  { value: siteConfig.brand.products, label: "Products" },
]

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Hand-Cutting",
    desc: "Every piece begins with artisan leather workers hand-cutting hides to pattern. No shortcuts, no laser cutting — the same method used in original wartime production.",
  },
  {
    step: "02",
    title: "Brass Fittings",
    desc: "We source solid brass buckles, rivets, and hardware. Each fitting is hand-set and checked for correct placement against period documentation.",
  },
  {
    step: "03",
    title: "Expert Stitching",
    desc: "Load-bearing seams are saddle-stitched by hand for durability. Decorative stitching follows original patterns documented from museum specimens.",
  },
  {
    step: "04",
    title: "Finishing & Quality Check",
    desc: "Every item is edge-finished, burnished, and inspected before packaging. Rejected pieces are recycled — they never leave the factory.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-2">
            Our Story
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-leather-dark mb-5">
            Crafted in Kanpur Since 2014
          </h1>
          <p className="font-sans text-leather/80 max-w-2xl mx-auto text-base leading-relaxed">
            RAAS Enterprises began as a small leather workshop in the heart of Fazalgunj, Kanpur —
            India&apos;s oldest leather-working district. Today we ship to over 20 countries, but
            every item is still made by hand, in the same factory, by the same craftspeople.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-leather-dark text-parchment rounded-sm p-6 text-center"
            >
              <div className="font-heading text-3xl sm:text-4xl text-gold mb-1">{s.value}</div>
              <div className="font-sans text-xs uppercase tracking-widest text-parchment/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Story section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-3">
              Factory-Direct
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark mb-5">
              No Middlemen. No Compromises.
            </h2>
            <div className="space-y-4 font-serif text-leather/80 text-sm leading-relaxed">
              <p>
                Warcraft Exports is the direct retail brand of RAAS Enterprises, Fazalgunj, Kanpur,
                Uttar Pradesh. We are not a reseller — we are the manufacturer. When you order from
                us, you are ordering directly from the workshop where your item was made.
              </p>
              <p>
                Kanpur has been India&apos;s leather capital for over two centuries, supplying
                Allied forces during both World Wars. Our craftspeople carry that tradition forward,
                producing historical reproductions that meet the expectations of museum curators,
                film armourers, and serious collectors worldwide.
              </p>
              <p>
                We serve reenactment groups across the United States, Germany, the United Kingdom,
                Japan, Australia, and beyond — shipping via DHL, FedEx, and Ship Global with full
                export documentation.
              </p>
            </div>
          </div>

          {/* Factory info card */}
          <div className="bg-leather-dark/5 border border-khaki/40 rounded-sm p-8">
            <h3 className="font-heading text-xl text-leather-dark mb-5">Company Details</h3>
            <dl className="space-y-4">
              {[
                { term: "Registered Name", detail: "RAAS Enterprises" },
                { term: "Location", detail: "Fazalgunj, Kanpur, Uttar Pradesh 208012, India" },
                { term: "Established", detail: "2018" },
                { term: "Specialisation", detail: "WW1 & WW2 Historical Reproduction Leather Gear" },
                { term: "Export Markets", detail: "20+ Countries across USA, Canada, Mexico, Europe, Japan, Australia, Asia-Pacific" },
                { term: "Contact", detail: siteConfig.email },
              ].map(({ term, detail }) => (
                <div key={term} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="font-sans text-[10px] uppercase tracking-widest text-khaki min-w-[140px] mb-0.5 sm:mb-0">
                    {term}
                  </dt>
                  <dd className="font-sans text-sm text-leather-dark">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Marketplace Storefronts */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">
              Our Marketplaces
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark">
              Our Global Storefronts
            </h2>
            <p className="font-sans text-leather/80 max-w-2xl mx-auto text-sm leading-relaxed mt-2">
              To offer the most flexible shipping, regional pricing, and convenient buying options, 
              we maintain official stores on the world&apos;s leading platforms in addition to our direct workshop site.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Amazon Storefront",
                tagline: "Prime Shipping & Global Fulfilment",
                desc: "Purchase our museum-grade WWII and WWI leather gear with Amazon's familiar checkout, Prime eligibility, and reliable customer service.",
                url: siteConfig.social.amazon,
                buttonText: "Shop on Amazon",
                color: "hover:border-[#FF9900]/60",
                badge: "bg-[#FF9900]/10 text-[#FF9900]",
              },
              {
                name: "eBay Outlet",
                tagline: "Specialized Auctions & Direct Lots",
                desc: "Bid on special auction batches, unique militaria items, and bundle deals directly through our authorized eBay storefront.",
                url: siteConfig.social.ebay,
                buttonText: "Shop on eBay",
                color: "hover:border-[#0064D2]/60",
                badge: "bg-[#0064D2]/10 text-[#0064D2]",
              },
              {
                name: "Walmart Marketplace",
                tagline: "Walmart Certified Partner",
                desc: "Shop our reproductions on Walmart's marketplace platform, integrated directly with your Walmart account and domestic support.",
                url: siteConfig.social.walmart,
                buttonText: "Shop on Walmart",
                color: "hover:border-[#0071CE]/60",
                badge: "bg-[#0071CE]/10 text-[#0071CE]",
              },
            ].map((store) => (
              <div
                key={store.name}
                className={`flex flex-col justify-between bg-white border border-khaki/30 rounded-sm p-6 hover:shadow-md transition-all duration-300 ${store.color} hover:translate-y-[-2px]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-lg text-leather-dark">{store.name}</h3>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${store.badge}`}>
                      Active
                    </span>
                  </div>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-khaki mb-4">
                    {store.tagline}
                  </p>
                  <p className="font-sans text-xs text-leather/70 leading-relaxed mb-6">
                    {store.desc}
                  </p>
                </div>
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#33450D] text-white py-2.5 text-xs font-sans font-bold uppercase tracking-[0.1em] hover:bg-[#4A5D23] transition-colors rounded-sm"
                >
                  {store.buttonText}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturing process */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-2">
              How We Make It
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark">
              The Manufacturing Process
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="border border-khaki/40 rounded-sm p-6 bg-white/50"
              >
                <div className="font-heading text-4xl text-khaki/50 mb-3">{step.step}</div>
                <h3 className="font-heading text-base text-leather-dark mb-2">{step.title}</h3>
                <p className="font-sans text-xs text-leather/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="bg-leather-dark rounded-sm p-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-parchment mb-4">
            Museum-Standard Quality
          </h2>
          <p className="font-sans text-parchment/70 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            Every product we make is researched against period documentation, surviving original
            specimens, and collector archives. We produce items for reenactors who demand accuracy,
            collectors who prize authenticity, and institutions that require durability. Our quality
            standard is simple: if it would not pass inspection in 1942, it does not leave our factory.
          </p>
          <a
            href="/shop"
            className="inline-block bg-gold text-leather-dark font-sans font-semibold text-xs uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-gold/90 transition-colors"
          >
            Browse the Collection
          </a>
        </div>

      </div>
    </div>
  )
}
