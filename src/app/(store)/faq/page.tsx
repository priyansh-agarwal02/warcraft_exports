import type { Metadata } from "next"
import { FAQList } from "@/components/faq/faq-list"
import { FAQS } from "@/lib/faq-data"

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Warcraft Exports",
  description:
    "Find answers to commonly asked questions about shipping times, customs duties, materials, return policy, and wholesale military gear reproductions.",
  keywords: [
    "Warcraft Exports FAQ",
    "militaria shipping speed",
    "leather gear care",
    "reproduction gear returns",
    "wholesale military reproductions",
  ],
}

export default function FAQPage() {
  // FAQ Schema JSON-LD for rich snippets and AI indexing
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  }

  return (
    <div className="bg-parchment min-h-screen">
      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">
          Help Centre
        </p>
        <h1 className="font-heading text-[40px] sm:text-[52px] font-black text-leather-dark uppercase leading-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="font-sans text-sm text-leather/70 mb-12 leading-relaxed">
          Can&apos;t find an answer? Email us at{" "}
          <a href="mailto:warcraftexports@gmail.com" className="text-leather underline underline-offset-2">
            warcraftexports@gmail.com
          </a>{" "}
          and a human will reply within 2 business days.
        </p>

        <FAQList />

        <div className="mt-10 bg-leather-dark text-parchment p-8 text-center">
          <h2 className="font-heading text-xl font-black uppercase text-parchment mb-2">
            Still Need Help?
          </h2>
          <p className="font-sans text-sm text-parchment/70 mb-5">
            Our team is based in Kanpur, India (IST). We respond Mon–Sat.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gold text-leather-dark font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-gold/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
