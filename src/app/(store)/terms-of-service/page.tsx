import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Warcraft Exports",
  description: "Warcraft Exports terms of service and conditions of purchase.",
}

const H2 = "font-heading text-[18px] font-black text-leather-dark uppercase mb-3 mt-8"
const P = "font-sans text-sm text-leather/80 leading-relaxed mb-3"

export default function TermsOfServicePage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Legal</p>
        <h1 className="font-heading text-[40px] font-black text-leather-dark uppercase leading-tight mb-2">Terms of Service</h1>
        <p className="font-sans text-xs text-khaki mb-10">Last updated: January 2026</p>

        <p className={P}>By using the Warcraft Exports website and placing an order, you agree to the following terms. Please read them carefully.</p>

        <h2 className={H2}>1. Company Information</h2>
        <p className={P}>Warcraft Exports is operated by RAAS Enterprises, Fazalgunj, Kanpur, Uttar Pradesh 208012, India. Contact: warcraftexports@gmail.com.</p>

        <h2 className={H2}>2. Products</h2>
        <p className={P}>All products are historical reproduction items for collector, reenactment, and display purposes only. They are not original wartime artefacts. Descriptions are accurate to the best of our knowledge; minor variations in material and colour may occur due to the handmade nature of our products.</p>

        <h2 className={H2}>3. Ordering &amp; Payment</h2>
        <p className={P}>Orders are accepted subject to product availability. Payment is due in full at the time of ordering. We accept credit/debit cards via Razorpay and PayPal. Prices are displayed in USD and may vary with exchange rates for other currencies.</p>

        <h2 className={H2}>4. Shipping &amp; Delivery</h2>
        <p className={P}>Delivery times are estimates only and not guaranteed. We are not responsible for delays caused by customs, carrier issues, or force majeure events. Risk of loss passes to the buyer upon handover to the carrier.</p>

        <h2 className={H2}>5. Returns &amp; Refunds</h2>
        <p className={P}>See our <a href="/returns-policy" className="text-leather underline underline-offset-2">Returns Policy</a> for full details. Items must be returned unused within 30 days.</p>

        <h2 className={H2}>6. Intellectual Property</h2>
        <p className={P}>All content on this website &mdash; including product photographs, descriptions, and the Warcraft Exports name &mdash; is the property of RAAS Enterprises and may not be reproduced without written permission.</p>

        <h2 className={H2}>7. Limitation of Liability</h2>
        <p className={P}>To the maximum extent permitted by law, RAAS Enterprises is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability is limited to the value of the order in question.</p>

        <h2 className={H2}>8. Governing Law</h2>
        <p className={P}>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Kanpur, Uttar Pradesh.</p>

        <h2 className={H2}>9. Changes to Terms</h2>
        <p className={P}>We may update these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>
      </div>
    </div>
  )
}
