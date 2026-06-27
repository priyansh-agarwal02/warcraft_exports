import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StarRating } from "@/components/ui/star-rating"
import { Quote } from "lucide-react"

export const metadata: Metadata = {
  title: "Customer Reviews — Warcraft Exports",
  description: "Read verified customer reviews for Warcraft Exports historical reproduction gear.",
}

const STATIC_REVIEWS = [
  { id: "s1", reviewer_name: "Laura Golla", rating: 5, body: "Beyond expectations. Exact same brass construction, stitching and material as the original. A perfect reproduction.", source: "Amazon Verified Purchase", created_at: null },
  { id: "s2", reviewer_name: "C. Sha.", rating: 5, body: "The build quality is extraordinary. Solid enough for real-world use, not just display. 6 stars if I could.", source: "Amazon Verified Purchase", created_at: null },
  { id: "s3", reviewer_name: "Robert S.", rating: 5, body: "Arrived on time, packed very well. Exactly as described. Fits perfectly on my M-1910 AEF pistol belt.", source: "eBay Verified Purchase", created_at: null },
  { id: "s4", reviewer_name: "Michael T.", rating: 5, body: "Ordered two holsters for a reenactment — they looked indistinguishable from the originals. Impressed with the craftsmanship.", source: "Amazon Verified Purchase", created_at: null },
  { id: "s5", reviewer_name: "James W.", rating: 5, body: "Great quality leather, very stiff as expected. Perfect for display and reenactment. Fast shipping from India.", source: "eBay Verified Purchase", created_at: null },
  { id: "s6", reviewer_name: "Erik N.", rating: 5, body: "Ordered from Sweden. Shipping was fast. The pouches are exactly what I needed for my WW1 kit.", source: "Warcraft Exports", created_at: null },
]

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: dbReviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, body, source, created_at")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  const reviews = (dbReviews && dbReviews.length > 0) ? dbReviews : STATIC_REVIEWS

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-12">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">
            Verified Customers
          </p>
          <h1 className="font-heading text-[40px] sm:text-[52px] font-black text-leather-dark uppercase leading-tight mb-4">
            Customer Reviews
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} viewBox="0 0 20 20" fill={s <= Math.round(avgRating) ? "#B5A642" : "none"} stroke="#B5A642" className="w-5 h-5">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="font-sans text-sm text-leather-dark font-semibold">{avgRating.toFixed(1)} / 5</span>
            <span className="font-sans text-sm text-leather/60">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/60 border border-khaki/40 p-6 flex flex-col gap-3">
              <Quote size={20} className="text-gold flex-shrink-0" />
              <p className="font-serif text-sm text-leather-dark leading-relaxed flex-1">&ldquo;{review.body}&rdquo;</p>
              <div className="border-t border-khaki/30 pt-3 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-bold text-leather-dark">{review.reviewer_name}</p>
                  <p className="font-sans text-[11px] text-khaki">{review.source}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-leather-dark text-parchment p-8 text-center">
          <h2 className="font-heading text-xl font-black uppercase text-parchment mb-2">
            Authentic. Collector-Grade. Trusted Worldwide.
          </h2>
          <p className="font-sans text-sm text-parchment/70 mb-5">
            Join thousands of reenactors, collectors, and historians who trust Warcraft Exports.
          </p>
          <a
            href="/shop"
            className="inline-block bg-gold text-leather-dark font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-gold/90 transition-colors"
          >
            Shop the Collection
          </a>
        </div>
      </div>
    </div>
  )
}
