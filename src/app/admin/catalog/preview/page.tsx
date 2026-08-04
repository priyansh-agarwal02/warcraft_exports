import { getCatalogProducts } from '@/lib/queries/catalog'
import { requireAdmin } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AdminCatalogPrintButton } from './admin-print-button'

export const revalidate = 0 // dynamic rendering for real-time admin sync

export default async function AdminCatalogPreviewPage() {
  const auth = await requireAdmin()
  if (auth.error) {
    redirect('/login')
  }

  const { settings, allProducts, totalProducts } = await getCatalogProducts()

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#18181B] font-sans selection:bg-[#33450D] selection:text-white print:bg-white print:p-0">
      
      {/* ── CSS PRINT RULES: Forces Portrait Orientation & Clean Spacing ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: portrait;
              margin: 8mm;
            }
            @media print {
              html, body {
                background: #ffffff !important;
                color: #18181b !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              aside, header, nav, .print\\:hidden {
                display: none !important;
              }
              .lg\\:ml-64 {
                margin-left: 0 !important;
              }
            }
          `,
        }}
      />

      {/* ── Non-Printable Admin Top Toolbar ── */}
      <div className="print:hidden sticky top-0 z-50 bg-[#18181B] text-white px-4 sm:px-8 py-3.5 shadow-xl border-b border-[#33450D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalog"
            className="text-white/70 hover:text-white text-[12px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
          >
            ← Back to Catalog Config
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-[12px] font-sans text-[#A3E635] font-bold uppercase tracking-wider">
            🔒 Private Admin Catalog ({totalProducts} Products Listed)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AdminCatalogPrintButton />
        </div>
      </div>

      {/* ── MAIN CATALOG CONTAINER ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-10 py-8 print:py-0 print:px-0 print:max-w-none">
        
        {/* ============================================================ */}
        {/* PAGE 1: FRONT COVER PAGE (Clean Portrait Page Break)         */}
        {/* ============================================================ */}
        <section className="min-h-[850px] print:min-h-screen border-4 border-[#18181B] p-6 sm:p-12 bg-[#FAFAF9] relative flex flex-col justify-between print:border-4 print:border-[#18181B] print:break-after-page mb-12 print:mb-0">
          
          {/* Top Brand Header */}
          <div className="flex items-start justify-between border-b-2 border-[#18181B] pb-6">
            <div className="flex items-center gap-4">
              {/* Site Logo / Favicon Symbol */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 bg-[#18181B] p-2 rounded-sm">
                <Image
                  src="/favicon-96x96.png"
                  alt="Warcraft Exports Emblem"
                  width={80}
                  height={80}
                  className="object-contain w-full h-full"
                />
              </div>

              <div>
                <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tighter text-[#18181B] font-black leading-none">
                  WARCRAFT EXPORTS ®
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#703810] mt-1.5">
                  Est. Kanpur, India · Handcrafted Reproductions
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-block bg-[#33450D] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 mb-1">
                Private Distributor Catalog
              </span>
              <p suppressHydrationWarning className="text-[11px] font-mono font-bold text-[#18181B]">{currentDate}</p>
            </div>
          </div>

          {/* Center Cover Title */}
          <div className="my-10 sm:my-14 text-center space-y-3 max-w-[800px] mx-auto">
            <div className="inline-block border border-[#703810] px-4 py-1 bg-[#F5EFEB]">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#703810]">
                Wholesale & B2B Specification Index
              </span>
            </div>

            <h2 className="font-heading text-4xl sm:text-6xl uppercase tracking-tight text-[#18181B] leading-none font-bold">
              {settings.title}
            </h2>

            <p className="text-base sm:text-xl font-serif italic text-[#71717A] max-w-[650px] mx-auto pt-1">
              {settings.subtitle}
            </p>

            {settings.price_adjustment_percent !== 0 && (
              <div className="mt-3 inline-block bg-[#18181B] text-white text-[12px] font-mono font-bold px-4 py-1.5 uppercase tracking-wider">
                Distributor Pricing Tier: {settings.price_adjustment_percent < 0 ? `${Math.abs(settings.price_adjustment_percent)}% Wholesale Discount Applied` : `${settings.price_adjustment_percent}% Adjusted Price Tier`}
              </div>
            )}
          </div>



          {/* Bottom Brand Story & Ordering Terms */}
          <div className="border-t-2 border-[#18181B] pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11.5px]">
              <div>
                <h3 className="font-heading text-xs uppercase tracking-wider text-[#18181B] font-bold mb-1.5">
                  Brand Heritage & Quality Guarantee
                </h3>
                <p className="text-[#52525B] leading-relaxed font-serif text-[11px]">
                  From our workshop in Kanpur — the leather capital of India — we craft every piece using authentic techniques, solid brass fittings, and top-grain leather matching original WW1 & WW2 military specifications.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xs uppercase tracking-wider text-[#18181B] font-bold mb-1.5">
                  Distributor Ordering Terms
                </h3>
                <p className="text-[#52525B] leading-relaxed font-mono text-[10.5px]">
                  {settings.distributor_notes}
                </p>
                <div className="mt-1.5 text-[10.5px] font-bold text-[#703810]">
                  Contact: warcraftexports@gmail.com · Direct Manufacturer Sales
                </div>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-[#E4E4E7] text-[9.5px] font-mono uppercase tracking-widest text-[#71717A]">
              Confidential · Page 1 · Warcraft Exports ® Private Publication · All Rights Reserved
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PAGE 2: DEDICATED WHOLESALE BUSINESS TERMS & PROTECTION PAGE  */}
        {/* ============================================================ */}
        <section className="min-h-[850px] print:min-h-screen border-4 border-[#18181B] p-8 sm:p-12 bg-white relative flex flex-col justify-between print:border-4 print:border-[#18181B] print:break-after-page mb-12 print:mb-0">
          <div>
            {/* Header */}
            <div className="border-b-2 border-[#18181B] pb-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#703810]">
                  Section II · Legal Framework
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-wide text-[#18181B] font-bold">
                  Wholesale Distributor Trading Agreement
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#33450D] bg-[#F4F4F5] px-3 py-1 border border-[#E4E4E7]">
                Page 2 of Catalog
              </span>
            </div>

            {/* Terms Body */}
            <div className="space-y-4 text-[12px] font-sans text-[#18181B] leading-relaxed">
              <div className="bg-[#FAFAF9] border border-[#E4E4E7] p-5 whitespace-pre-wrap font-mono text-[11px] text-[#27272A] leading-relaxed">
                {settings.business_terms}
              </div>
            </div>
          </div>

          {/* Signature & Seal Footer */}
          <div className="border-t-2 border-[#18181B] pt-6 mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-8 text-[11px]">
              <div className="border border-[#E4E4E7] p-3 bg-[#FAFAF9]">
                <p className="font-bold text-[#18181B] uppercase tracking-wider mb-4">
                  Manufacturer Authorization Seal:
                </p>
                <p className="font-heading text-sm text-[#703810] uppercase tracking-wider font-bold">
                  WARCRAFT EXPORTS ®
                </p>
                <p className="text-[10px] font-mono text-[#71717A]">
                  Kanpur, Uttar Pradesh, India
                </p>
              </div>

              <div className="border border-[#E4E4E7] p-3 bg-[#FAFAF9]">
                <p className="font-bold text-[#18181B] uppercase tracking-wider mb-4">
                  Authorized Distributor Acceptance:
                </p>
                <div className="border-b border-[#18181B] pt-4 mb-1" />
                <p className="text-[10px] font-mono text-[#71717A]">
                  Signature & Company Stamp Required
                </p>
              </div>
            </div>

            <div className="text-center pt-2 text-[9.5px] font-mono uppercase tracking-widest text-[#71717A]">
              Page 2 · Warcraft Exports ® Wholesale Trading & Intellectual Property Agreement
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PAGE 3+: CONTINUOUS EQUALLY SPACED PRODUCT GRID              */}
        {/* ============================================================ */}
        <div className="pt-4">
          <div className="border-b-2 border-[#18181B] pb-3 mb-6 flex items-center justify-between">
            <span className="font-heading text-xl uppercase tracking-wide text-[#18181B] font-bold">
              Product Catalog Inventory ({totalProducts} Items)
            </span>
            <span className="text-[11px] font-mono font-bold text-[#703810] bg-[#F5EFEB] px-3 py-1 border border-[#D2B48C]">
              Factory Direct Pricing · USD
            </span>
          </div>

          {/* 2-Column Uniform Portrait Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {allProducts.map((p) => (
              <div
                key={p.id}
                className="border border-[#18181B] bg-white p-3.5 flex flex-col justify-between shadow-sm print:break-inside-avoid print:shadow-none min-h-[190px]"
              >
                <div>
                  {/* Item Header: SKU & Badges */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#F4F4F5] pb-1.5 mb-2.5">
                    <span className="text-[10px] font-mono font-bold text-[#703810] bg-[#F5EFEB] px-2 py-0.5 border border-[#D2B48C]">
                      SKU: {p.sku}
                    </span>
                    <div className="flex items-center gap-1 text-[9.5px] font-bold uppercase text-[#52525B]">
                      {p.nation && <span className="bg-[#F4F4F5] px-1.5 py-0.5">{p.nation}</span>}
                      {p.era && <span className="bg-[#F4F4F5] px-1.5 py-0.5">{p.era}</span>}
                    </div>
                  </div>

                  {/* Image + Info Layout */}
                  <div className="flex gap-3">
                    {/* Hero Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FAFAF9] border border-[#E4E4E7] relative flex-shrink-0 p-1 flex items-center justify-center">
                      {p.hero_image ? (
                        <Image
                          src={p.hero_image}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 96px, 112px"
                          unoptimized
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="text-[9px] font-mono text-[#A1A1AA] text-center">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details & Pricing */}
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading text-[13.5px] font-bold text-[#18181B] leading-tight uppercase tracking-tight line-clamp-2">
                        {p.name}
                      </h3>

                      {p.material && (
                        <p className="text-[10.5px] font-serif text-[#71717A] italic truncate">
                          Material: {p.material} {p.style ? `· ${p.style}` : ''}
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="pt-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-base font-bold text-[#33450D]">
                            ${p.adjusted_price_usd.toFixed(2)} USD
                          </span>
                          {settings.price_adjustment_percent !== 0 && (
                            <span className="font-mono text-[10px] text-[#A1A1AA] line-through">
                              ${p.price_usd.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variation Swatches / Sizes */}
                  {settings.show_variants && p.variants.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#F4F4F5]">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#703810] mb-1">
                        Variations ({p.variants.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {p.variants.map((v) => {
                          const label = [v.color, v.size].filter(Boolean).join(' / ') || 'Standard'
                          const varPrice = v.adjusted_price_override || p.adjusted_price_usd
                          return (
                            <span
                              key={v.id}
                              className="text-[9.5px] font-mono bg-[#FAFAF9] border border-[#E4E4E7] px-1.5 py-0.5 text-[#18181B]"
                            >
                              {label} {v.adjusted_price_override ? `($${varPrice.toFixed(2)})` : ''}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catalog Footer Notice */}
        <div className="mt-12 pt-6 border-t-2 border-[#18181B] text-center space-y-1.5 text-[10.5px] font-mono text-[#71717A] print:mt-10">
          <p className="font-bold text-[#18181B] uppercase tracking-wider">
            Warcraft Exports ® · Confidential Admin Catalog Publication
          </p>
          <p>
            Direct Manufacturer Sales · warcraftexports@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}
