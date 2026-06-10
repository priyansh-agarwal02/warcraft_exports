import Link from "next/link"
import { StarRating } from "@/components/ui/star-rating"
import { Quote } from "lucide-react"

const REVIEWS = [
  {
    name: "Laura Golla",
    rating: 5,
    body: "Beyond expectations. Exact same brass construction, stitching and material as the original. A perfect reproduction.",
    source: "Amazon Verified Purchase",
  },
  {
    name: "C. Sha.",
    rating: 5,
    body: "The build quality is extraordinary. Solid enough for real-world use, not just display. 6 stars if I could.",
    source: "Amazon Verified Purchase",
  },
  {
    name: "Robert S.",
    rating: 5,
    body: "Arrived on time, packed very well. Exactly as described. Fits perfectly on my M-1910 AEF pistol belt.",
    source: "eBay Verified Purchase",
  },
]

export function ReviewsSection() {
  return (
    <section className="py-16 bg-parchment border-t border-khaki">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-text mb-2">
            Collector Reviews
          </p>
          <h2 className="font-heading text-[32px] font-black text-leather-dark uppercase leading-tight">
            Trusted by Reenactors Worldwide
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <StarRating rating={5} showCount={false} size="md" />
            <span className="text-sm font-sans text-muted-text">4.9/5 from 2,400+ reviews</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-card-white border border-khaki p-5 relative">
              <Quote size={20} className="text-gold/40 absolute top-4 right-4" />
              <StarRating rating={r.rating} showCount={false} size="sm" className="mb-3" />
              <p className="font-serif text-sm text-leather-dark leading-relaxed mb-4 italic">
                &ldquo;{r.body}&rdquo;
              </p>
              <div>
                <p className="text-[12px] font-sans font-bold uppercase tracking-[0.1em] text-leather-dark">
                  {r.name}
                </p>
                <p className="text-[10px] font-sans text-muted-text uppercase tracking-wider">{r.source}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 border border-leather text-leather font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-6 py-3 hover:bg-leather hover:text-parchment transition-colors"
          >
            More Reviews
          </Link>
        </div>
      </div>
    </section>
  )
}
