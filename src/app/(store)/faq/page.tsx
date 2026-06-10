"use client"
import type { Metadata } from "next"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Most orders ship within 3–5 business days from our Kanpur factory. Delivery typically takes 7–14 business days to the US and Europe, and 10–20 business days to Australia, Japan, and Southeast Asia. Express DHL shipping (5–8 business days worldwide) is available at checkout.",
  },
  {
    q: "Are your products authentic reproductions?",
    a: "Yes. Every item is researched against period documentation, museum specimens, and collector archives. We manufacture in Kanpur, India — historically one of the world's leather capitals — using the same hand-cutting, brass-fitting, and hand-stitching methods as original wartime production. These are collector-grade reproductions, not toys or costume pieces.",
  },
  {
    q: "What materials do you use?",
    a: "We use full-grain vegetable-tanned leather for holsters and straps, heavy-duty cotton canvas for webbing and pouches, solid brass hardware (buckles, rivets, snaps), and period-accurate thread. Material specifics are listed on each product page.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes. Items in unused, undamaged condition may be returned within 30 days of delivery. The buyer is responsible for return shipping costs. Exchanges for a different size or variant ship free. Custom or personalised items are non-returnable.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — we ship to 20+ countries via DHL Express, FedEx International, Ship Global, Bombino Express, and USPS Priority. Free worldwide shipping is available on orders over $150. All international shipments include full export documentation.",
  },
  {
    q: "Will I have to pay customs duties or import taxes?",
    a: "Import duties and taxes depend on your country's regulations and are the buyer's responsibility. We declare shipments accurately and cannot mark them as 'gifts'. Most countries have a de minimis threshold below which no duty applies — check your local customs rules.",
  },
  {
    q: "Do you offer wholesale pricing?",
    a: "Yes. We supply reenactment retailers, museum gift shops, film and TV prop houses, and distributors worldwide. Wholesale is enquiry-only — submit the Wholesale Enquiry form and our team will respond within 2 business days with pricing and availability.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once your order ships, you'll receive an email with a tracking number. You can also visit the Track Order page and enter your order ID and email address for real-time status updates.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Razorpay, and PayPal for international buyers. All transactions are secured with SSL encryption. We do not store your card details.",
  },
  {
    q: "Do you offer personalisation or engraving?",
    a: "We do not offer personalisation, engraving, or custom labelling in our standard retail range. For large wholesale orders, contact us to discuss options.",
  },
  {
    q: "How do I care for leather items?",
    a: "Keep leather items dry and away from prolonged direct sunlight. Clean with a damp cloth and mild soap. Condition with a quality leather conditioner (neatsfoot oil or beeswax-based) every 6–12 months to prevent cracking. Store in a cool, dry place.",
  },
  {
    q: "Can I change or cancel my order after placing it?",
    a: "We can usually accommodate changes or cancellations within 24 hours of ordering, before the item enters production or packs for shipping. Contact us immediately at warcraftexports@gmail.com with your order number. Once shipped, orders cannot be cancelled.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-khaki/30 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-sans font-semibold text-sm text-leather-dark group-hover:text-leather transition-colors">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-khaki transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="font-sans text-sm text-leather/80 leading-relaxed pb-5">{a}</p>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="bg-parchment min-h-screen">
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

        <div className="bg-white/50 border border-khaki/40 px-6 sm:px-8">
          {FAQS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

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
