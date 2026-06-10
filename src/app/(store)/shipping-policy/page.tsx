import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping Policy — Warcraft Exports",
  description: "Warcraft Exports worldwide shipping policy. DHL, FedEx, Ship Global. Free shipping over $150.",
}

const H2 = "font-heading text-[18px] font-black text-leather-dark uppercase mb-3 mt-8"
const P = "font-sans text-sm text-leather/80 leading-relaxed mb-3"
const TABLE_HEAD = "text-left font-sans font-bold text-[11px] uppercase tracking-wide text-khaki py-2 px-3"
const TABLE_CELL = "font-sans text-sm text-leather-dark py-2 px-3"

export default function ShippingPolicyPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Legal</p>
        <h1 className="font-heading text-[40px] font-black text-leather-dark uppercase leading-tight mb-2">Shipping Policy</h1>
        <p className="font-sans text-xs text-khaki mb-10">Last updated: January 2026</p>

        <div className="prose-leather">
          <h2 className={H2}>Where We Ship</h2>
          <p className={P}>Warcraft Exports ships to 20+ countries worldwide from our factory in Kanpur, India. We use DHL Express, FedEx International, Ship Global, Bombino Express, and USPS Priority depending on destination and order value.</p>

          <h2 className={H2}>Processing Time</h2>
          <p className={P}>All orders are processed within 3&ndash;5 business days of payment confirmation. During peak seasons (October&ndash;December) processing may take up to 7 business days. You will receive a shipping confirmation email with your tracking number once your order has dispatched.</p>

          <h2 className={H2}>Estimated Delivery Times</h2>
          <div className="border border-khaki/40 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-leather-dark/5 border-b border-khaki/30">
                <tr>
                  <th className={TABLE_HEAD}>Region</th>
                  <th className={TABLE_HEAD}>Standard</th>
                  <th className={TABLE_HEAD}>Express (DHL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-khaki/20">
                {[
                  ["United States", "7–14 business days", "5–8 business days"],
                  ["United Kingdom", "7–12 business days", "4–7 business days"],
                  ["European Union", "8–14 business days", "5–8 business days"],
                  ["Australia & NZ", "10–18 business days", "6–9 business days"],
                  ["Japan & East Asia", "8–15 business days", "5–8 business days"],
                  ["Rest of World", "12–25 business days", "7–12 business days"],
                ].map(([region, standard, express]) => (
                  <tr key={region} className="bg-white/30 hover:bg-white/50 transition-colors">
                    <td className={`${TABLE_CELL} font-medium`}>{region}</td>
                    <td className={TABLE_CELL}>{standard}</td>
                    <td className={TABLE_CELL}>{express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-sans text-xs text-khaki mb-6">Times are estimates and may vary due to customs processing, carrier delays, or public holidays.</p>

          <h2 className={H2}>Shipping Rates</h2>
          <p className={P}><strong>Free worldwide shipping</strong> on all orders over $150 USD. For orders under $150, shipping rates are calculated at checkout based on weight, dimensions, and destination.</p>

          <h2 className={H2}>Customs, Duties &amp; Taxes</h2>
          <p className={P}>Import duties, taxes, and customs fees are the buyer&apos;s sole responsibility. We declare all shipments accurately with correct values and cannot mark parcels as &ldquo;gifts&rdquo;. Most countries have a de minimis threshold &mdash; consult your local customs authority for details.</p>
          <p className={P}>Warcraft Exports is not responsible for any delays caused by customs clearance.</p>

          <h2 className={H2}>Tracking</h2>
          <p className={P}>All orders include a tracking number sent via email once shipped. Use the <a href="/track-order" className="text-leather underline underline-offset-2">Track Order</a> page to check your shipment status.</p>

          <h2 className={H2}>Lost or Damaged Shipments</h2>
          <p className={P}>If your parcel arrives damaged or is lost in transit, contact us at warcraftexports@gmail.com within 14 days of the expected delivery date. We will work with the carrier to resolve the issue and arrange a replacement or refund where appropriate.</p>
        </div>
      </div>
    </div>
  )
}
