import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Returns Policy — Warcraft Exports",
  description: "30-day returns on unused Warcraft Exports items. Exchange welcome. Buyer pays return shipping.",
}

const H2 = "font-heading text-[18px] font-black text-leather-dark uppercase mb-3 mt-8"
const P = "font-sans text-sm text-leather/80 leading-relaxed mb-3"

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Legal</p>
        <h1 className="font-heading text-[40px] font-black text-leather-dark uppercase leading-tight mb-2">Returns Policy</h1>
        <p className="font-sans text-xs text-khaki mb-10">Last updated: January 2026</p>

        <h2 className={H2}>30-Day Return Window</h2>
        <p className={P}>We accept returns within 30 days of the delivery date. Items must be unused, undamaged, and in original packaging. We inspect all returned items before processing refunds or exchanges.</p>

        <h2 className={H2}>How to Return</h2>
        <p className={P}>Email us at <a href="mailto:warcraftexports@gmail.com" className="text-leather underline underline-offset-2">warcraftexports@gmail.com</a> with your order number and the reason for return. We will provide the return address and instructions within 2 business days.</p>

        <h2 className={H2}>Return Shipping Costs</h2>
        <p className={P}>The buyer is responsible for return shipping costs. We recommend using a tracked service as we cannot be held responsible for items lost in transit. Refunds are processed once the item is received and inspected.</p>

        <h2 className={H2}>Exchanges</h2>
        <p className={P}>We are happy to exchange items for a different size or variant. Return shipping is at the buyer&apos;s cost; we will ship the replacement free of charge.</p>

        <h2 className={H2}>Refunds</h2>
        <p className={P}>Approved refunds are issued to the original payment method within 5&ndash;7 business days of receiving the return. Original shipping fees are non-refundable unless the item was faulty.</p>

        <h2 className={H2}>Non-Returnable Items</h2>
        <ul className="list-disc list-inside font-sans text-sm text-leather/80 mb-4 space-y-1">
          <li>Items showing signs of use, damage, or alteration</li>
          <li>Items returned after 30 days</li>
          <li>Custom or personalised orders</li>
          <li>Items purchased on clearance (marked as final sale)</li>
        </ul>

        <h2 className={H2}>Faulty Items</h2>
        <p className={P}>If your item has a manufacturing defect, contact us immediately with photos. We will arrange a free replacement or full refund including return shipping costs.</p>

        <div className="mt-10 bg-leather-dark/5 border border-khaki/40 p-6">
          <p className="font-sans text-sm text-leather-dark font-medium mb-1">Questions?</p>
          <p className="font-sans text-sm text-leather/70">Email <a href="mailto:warcraftexports@gmail.com" className="text-leather underline underline-offset-2">warcraftexports@gmail.com</a> with your order number. We respond within 2 business days.</p>
        </div>
      </div>
    </div>
  )
}
