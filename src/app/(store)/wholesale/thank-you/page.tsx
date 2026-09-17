import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Check, ArrowLeft, Home, FileText, Mail, Clock, ShieldCheck, Factory } from "lucide-react"

export const metadata: Metadata = {
  title: "Wholesale Inquiry Received — Warcraft Exports",
  description: "Thank you for submitting your B2B wholesale inquiry to Warcraft Exports. Our export trade team is reviewing your requirements.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function WholesaleThankYouPage() {
  return (
    <div className="bg-parchment min-h-screen py-8 md:py-16 px-4 md:px-6 font-sans flex items-center justify-center">
      {/* Google Tag Manager / Analytics Wholesale Conversion Trigger */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: 'wholesale_conversion',
                event_category: 'B2B_Wholesale',
                event_label: 'Wholesale Inquiry Thank You Page Loaded',
                page_path: '/wholesale/thank-you'
              });
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'conversion', {
                  send_to: 'G-0SZPRVLY3R',
                  event_category: 'B2B_Wholesale',
                  event_label: 'Wholesale Inquiry Completed'
                });
              }
            })();
          `,
        }}
      />
      <div className="max-w-[1000px] mx-auto w-full">
        {/* Responsive Dual Column Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-10">
          
          {/* Left Content Section */}
          <div className="flex-1 w-full lg:max-w-[620px] flex flex-col items-start z-10">
            
            {/* Success Icon & Header Stamp Container */}
            <div className="flex flex-row items-center gap-3 mb-2 flex-wrap">
              {/* Gold Check Box */}
              <div className="w-[38px] h-[34px] bg-[#BBAC48] flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <Check className="w-5 h-5 stroke-[3.5]" />
              </div>
              
              {/* Rotated B2B Stamp Badge */}
              <div className="flex items-center justify-center w-[120px] h-[40px] flex-shrink-0">
                <div className="box-border border-2 border-[#BBAC48] px-2 py-0.5 rotate-[-8deg] opacity-90 h-[28px] flex items-center justify-center">
                  <span className="font-sans font-black text-[11px] leading-tight tracking-[1.5px] text-[#BBAC48] uppercase select-none">
                    INQUIRY FILED
                  </span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="flex flex-col items-start pb-2 w-full">
              <h1 className="font-serif font-extrabold text-2xl md:text-3xl lg:text-[32px] leading-tight md:leading-[38px] tracking-[-0.03em] text-[#33450D] uppercase select-text">
                Wholesale Inquiry Received
              </h1>
            </div>

            {/* Sub-paragraph Text */}
            <p className="font-serif font-normal text-sm md:text-[15px] leading-relaxed text-[#45483C] pb-4 max-w-[540px]">
              Thank you for reaching out to Warcraft Exports. Your trade inquiry has been logged with our export management desk. A formal catalog, volume pricing schedule, and sample terms will be delivered to your email within <strong>24 business hours</strong>.
            </p>

            {/* B2B Next Steps & Status Card */}
            <div className="relative w-full bg-white border-2 border-[#C6C8B8] p-4 md:p-5 mb-5 box-border flex flex-col md:flex-row gap-5 md:gap-0 select-text shadow-xs">
              
              {/* Corner Crosshairs */}
              <div className="absolute w-[20px] h-[20px] -left-[2px] -top-[2px] border-t-2 border-l-2 border-[#76786B] z-10" />
              <div className="absolute w-[20px] h-[20px] -right-[2px] -bottom-[2px] border-b-2 border-r-2 border-[#76786B] z-20" />

              {/* Left Column inside card: What Happens Next */}
              <div className="flex-1 flex flex-col gap-3 md:pr-5">
                <div className="flex items-center gap-1.5 text-[#76786B]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-sans font-bold text-[11px] tracking-[1.2px] uppercase">
                    WHAT HAPPENS NEXT
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#33450D] text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <p className="font-serif font-bold text-xs text-[#1A1C1C] leading-snug">
                        Requirement Review
                      </p>
                      <p className="font-sans text-[11px] text-[#566065] leading-relaxed">
                        Our workshop heads assess your selected military eras, custom patterns, and requested volume tiers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#33450D] text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <p className="font-serif font-bold text-xs text-[#1A1C1C] leading-snug">
                        Factory-Direct Pricing Quote
                      </p>
                      <p className="font-sans text-[11px] text-[#566065] leading-relaxed">
                        We calculate factory FOB/CIF air &amp; ocean freight estimates tailored to your destination country.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#33450D] text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <p className="font-serif font-bold text-xs text-[#1A1C1C] leading-snug">
                        Dedicated Trade Liaison
                      </p>
                      <p className="font-sans text-[11px] text-[#566065] leading-relaxed">
                        A personal B2B account manager will follow up via email with wholesale catalogs and ordering terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column inside card: Expedited Contact & Production */}
              <div className="flex-1 flex flex-col justify-between gap-4 md:border-l md:border-[#C6C8B8] md:pl-5">
                <div>
                  <div className="flex items-center gap-1.5 text-[#76786B] mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-sans font-bold text-[11px] tracking-[1.2px] uppercase">
                      TURNAROUND GUARANTEE
                    </span>
                  </div>
                  <p className="font-serif font-bold text-base text-[#BBAC48]">
                    Within 24 Hours
                  </p>
                  <p className="font-sans text-[11px] text-[#566065] mt-1 leading-relaxed">
                    Check your inbox (and spam folder) for an inquiry confirmation receipt from our team.
                  </p>
                </div>

                <div className="bg-parchment/70 border border-[#C6C8B8]/60 p-3 rounded-xs">
                  <div className="flex items-center gap-1.5 text-[#33450D] mb-1">
                    <Mail className="w-3 h-3 text-[#33450D]" />
                    <span className="font-sans font-bold text-[10px] uppercase tracking-wide">
                      Urgent Film / Production Need?
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[#45483C] leading-snug">
                    If you have strict production deadlines or need immediate swatch verification, write directly to:
                  </p>
                  <a
                    href="mailto:warcraftexports@gmail.com?subject=Urgent B2B Inquiry — Warcraft Exports"
                    className="font-sans font-bold text-xs text-[#8B4513] hover:underline mt-1 inline-block"
                  >
                    warcraftexports@gmail.com
                  </a>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[560px] pt-1">
              {/* Primary: Return to Shop */}
              <Link
                href="/shop"
                className="relative flex flex-row justify-center items-center gap-2 px-5 w-full sm:w-[200px] h-[42px] bg-[#33450D] text-white hover:bg-[#4A5D23] transition-all shadow-sm group flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-white transform group-hover:-translate-x-1 transition-transform" />
                <span className="font-sans font-bold text-[12px] leading-none tracking-[1.2px] uppercase">
                  Browse Shop
                </span>
              </Link>

              {/* Secondary: Head Back to Website */}
              <Link
                href="/"
                className="flex flex-row justify-center items-center gap-2 px-5 w-full sm:w-[200px] h-[42px] border-2 border-[#566065] text-[#566065] hover:bg-[#566065] hover:text-white transition-all group flex-shrink-0"
              >
                <Home className="w-3.5 h-3.5 text-current transform group-hover:scale-110 transition-transform" />
                <span className="font-sans font-bold text-[12px] leading-none tracking-[1.2px] uppercase">
                  Return to Home
                </span>
              </Link>

              {/* Tertiary: Wholesale Overview */}
              <Link
                href="/wholesale"
                className="flex flex-row justify-center items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#8B7355] hover:text-leather-dark transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Wholesale Details</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Historical Workshop Credibility Card */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex justify-center lg:justify-end lg:mt-6 z-20">
            <div className="relative w-full max-w-[320px] bg-white p-3.5 pb-4 border-2 border-[#C6C8B8] shadow-md space-y-3">
              <div className="relative h-[180px] w-full bg-leather/10 overflow-hidden border border-[#C6C8B8]/60">
                <Image
                  src="/hero/wholesale-banner-new.webp"
                  alt="Warcraft Exports Kanpur Workshop Craftsmanship"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-leather-dark">
                  <Factory className="w-3.5 h-3.5 text-leather" />
                  <span className="font-heading text-xs font-bold uppercase tracking-wider">
                    Kanpur Export Workshop
                  </span>
                </div>
                <p className="font-sans text-[11px] text-[#566065] leading-relaxed">
                  Direct manufacturing exporter of authentic WW1 &amp; WW2 military reproductions. Supplying living history organizations, film prop departments, and museums across 20+ countries.
                </p>
              </div>

              <div className="border-t border-[#C6C8B8]/60 pt-2 flex items-center justify-between text-[10px] text-[#76786B] font-mono">
                <span>EST. KANPUR, INDIA</span>
                <span className="font-bold text-[#33450D]">RAAS ENTERPRISES</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
