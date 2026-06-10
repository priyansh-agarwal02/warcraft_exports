import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Warcraft Exports",
  description: "Warcraft Exports privacy policy. How we collect, use, and protect your data.",
}

const H2 = "font-heading text-[18px] font-black text-leather-dark uppercase mb-3 mt-8"
const P = "font-sans text-sm text-leather/80 leading-relaxed mb-3"

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">Legal</p>
        <h1 className="font-heading text-[40px] font-black text-leather-dark uppercase leading-tight mb-2">Privacy Policy</h1>
        <p className="font-sans text-xs text-khaki mb-10">Last updated: January 2026</p>

        <p className={P}>Warcraft Exports (operated by RAAS Enterprises, Fazalgunj, Kanpur, India) is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.</p>

        <h2 className={H2}>Information We Collect</h2>
        <ul className="list-disc list-inside font-sans text-sm text-leather/80 mb-4 space-y-1">
          <li>Account information: name, email address, password (hashed)</li>
          <li>Order information: shipping address, items purchased, payment reference</li>
          <li>Communication: messages sent via the contact form or email</li>
          <li>Usage data: pages visited, search queries (via Vercel Analytics)</li>
        </ul>
        <p className={P}>We do not store payment card numbers. All payments are processed by Razorpay and PayPal under their own privacy policies.</p>

        <h2 className={H2}>How We Use Your Data</h2>
        <ul className="list-disc list-inside font-sans text-sm text-leather/80 mb-4 space-y-1">
          <li>To process and fulfill your orders</li>
          <li>To send order confirmation and shipping updates</li>
          <li>To respond to enquiries and support requests</li>
          <li>To improve our website and product catalogue</li>
          <li>To send marketing emails if you have subscribed (unsubscribe any time)</li>
        </ul>

        <h2 className={H2}>Data Storage &amp; Security</h2>
        <p className={P}>Your data is stored securely on Supabase (PostgreSQL) hosted in the EU. We use HTTPS encryption for all data in transit. Access to your data is restricted to authorised personnel only.</p>

        <h2 className={H2}>Third-Party Services</h2>
        <p className={P}>We use the following third-party services that may process your data: Supabase (database), Vercel (hosting), Resend (email), Razorpay (payments), PayPal (payments), DHL/FedEx (shipping). Each operates under their own privacy policy.</p>

        <h2 className={H2}>Your Rights (GDPR)</h2>
        <p className={P}>If you are in the European Economic Area, you have the right to access, correct, delete, or export your personal data. Email us at warcraftexports@gmail.com to make a request. We will respond within 30 days.</p>

        <h2 className={H2}>Cookies</h2>
        <p className={P}>We use essential cookies for authentication and cart functionality. We use analytics cookies (Vercel Analytics, PostHog) to understand how visitors use our site. You can disable non-essential cookies in your browser settings.</p>

        <h2 className={H2}>Contact</h2>
        <p className={P}>For privacy-related questions, email <a href="mailto:warcraftexports@gmail.com" className="text-leather underline underline-offset-2">warcraftexports@gmail.com</a>.</p>
      </div>
    </div>
  )
}
