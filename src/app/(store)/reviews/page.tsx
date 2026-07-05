import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { StarRating } from "@/components/ui/star-rating"
import { siteConfig } from "@/config/site.config"
import { Quote, ExternalLink, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Customer Reviews — Warcraft Exports",
  description: "Read verified customer reviews for Warcraft Exports historical reproduction gear.",
}

// source values match database CHECK constraint (amazon, ebay, direct)
const STATIC_REVIEWS = [
  // Amazon US Reviews
  { id: "s2", reviewer_name: "Amazon Customer", rating: 5, body: "Cool!", source: "amazon", created_at: "2026-06-03" },
  { id: "s3", reviewer_name: "Joe Easter", rating: 5, body: "WWII reenactment authentic. Nice piece of kit, well made and durable.", source: "amazon", created_at: "2026-06-02" },
  { id: "s4", reviewer_name: "RAH", rating: 5, body: "Fits perfectly — great items — thanks", source: "amazon", created_at: "2026-05-25" },
  { id: "s5", reviewer_name: "Paul Cramer", rating: 5, body: "Just what I wanted", source: "amazon", created_at: "2026-05-23" },
  { id: "s6", reviewer_name: "Professori", rating: 5, body: "Great quality and at a great price! Quick delivery, well-packaged.", source: "amazon", created_at: "2026-04-17" },
  { id: "s7", reviewer_name: "Sam", rating: 5, body: "Looks good . Thanks", source: "amazon", created_at: "2026-04-16" },
  { id: "s8", reviewer_name: "M. P.", rating: 5, body: "excellent", source: "amazon", created_at: "2026-04-05" },
  { id: "s9", reviewer_name: "Amazon Customer", rating: 5, body: "As described!", source: "amazon", created_at: "2026-03-12" },
  { id: "s10", reviewer_name: "jwatts", rating: 5, body: "This sling arrived on time. It is well made and original looking. It works well.", source: "amazon", created_at: "2026-02-12" },
  { id: "s11", reviewer_name: "Mark", rating: 5, body: "Western gun holster just as described better looking in person great seller fast delivery thanks.", source: "amazon", created_at: "2026-02-06" },
  { id: "s12", reviewer_name: "Amazon Customer", rating: 5, body: "Excellent product just what I was looking for. Quality is very good and works perfectly on my replica of the m3a1 bb MG. Price is very reasonable.", source: "amazon", created_at: "2026-01-11" },
  { id: "s13", reviewer_name: "Matthew W. Bailey", rating: 5, body: "As described well packaged and fit perfectly", source: "amazon", created_at: "2026-01-10" },
  { id: "s14", reviewer_name: "Matthew W. Bailey", rating: 5, body: "Well packaged fit rifle perfectly and good quality", source: "amazon", created_at: "2026-01-10" },
  { id: "s15", reviewer_name: "Old Cat", rating: 5, body: "Item showed up on time, in good shape and well packaged.", source: "amazon", created_at: "2025-12-30" },
  { id: "s16", reviewer_name: "William Roe", rating: 5, body: "Thank you , I love it", source: "amazon", created_at: "2025-12-29" },
  { id: "s17", reviewer_name: "C. Sha.", rating: 5, body: "The build quality is extraordinary. Solid enough for real-world use, not just display.", source: "amazon", created_at: "2026-01-05" },
  { id: "s18", reviewer_name: "Robert S.", rating: 5, body: "Exactly as described. Fits perfectly on my M-1910 AEF pistol belt.", source: "ebay", created_at: "2025-11-12" },
  { id: "s19", reviewer_name: "Laura Golla", rating: 5, body: "Beyond expectations. Exact same brass construction, stitching and material as the original. A perfect reproduction.", source: "amazon", created_at: "2025-10-25" },
  { id: "s20", reviewer_name: "Michael T.", rating: 5, body: "Ordered two holsters for a reenactment — they looked indistinguishable from the originals. Impressed with the craftsmanship.", source: "amazon", created_at: "2025-09-15" },
  
  // eBay Customer Reviews from Screenshots
  { id: "e1", reviewer_name: "k***k (eBay Buyer)", rating: 5, body: "Excellent seller! Item arrived on time, exactly as described — condition and appearance matched the listing perfectly. Shipping was reasonable and packaging was solid. Couldn't ask for a smoother transaction. Highly recommended. A++++!", source: "ebay", created_at: "2026-06-15" },
  { id: "e2", reviewer_name: "d***n (eBay Buyer)", rating: 5, body: "The item was just what the picture showed. Right on time and packed well without issues. Good communication with the seller. I would buy from this person again.", source: "ebay", created_at: "2026-06-10" },
  { id: "e3", reviewer_name: "r***s (eBay Buyer)", rating: 5, body: "Great eBay seller; item arrived on time and without any damage. Item was packed very well. Item is exactly as described by the seller and is new in the package. I would highly recommend the seller and I would definitely purchase again from this seller. The 1911 canvas holster will go well with my WW2 display and I've already put it on my M-1910 AEF pistol belt. Thank you.", source: "ebay", created_at: "2026-06-08" },
  { id: "e4", reviewer_name: "s***a (eBay Buyer)", rating: 5, body: "Received in good time, well packed. Great value for money, highly recommended seller", source: "ebay", created_at: "2026-05-18" },
  { id: "e5", reviewer_name: "c***c (eBay Buyer)", rating: 5, body: "Has advertised well packaged fast shipping thank you", source: "ebay", created_at: "2026-05-12" },
  { id: "e6", reviewer_name: "a***6 (eBay Buyer)", rating: 5, body: "Item exactly as listed. Excellent seller! Great value and prompt shipping!", source: "ebay", created_at: "2026-05-02" },
  { id: "e7", reviewer_name: "a***a (eBay Buyer)", rating: 5, body: "I bought two Sam Browne belts. One from you and another seller. Not only was yours better quality but it shipped faster. Great product and excellent customer service. I will keep your store saved. Thanks.", source: "ebay", created_at: "2026-04-20" },
  { id: "e8", reviewer_name: "d***d (eBay Buyer)", rating: 5, body: "Nice dealer, with very nice packaging and fast shipping. Good quality repro.", source: "ebay", created_at: "2026-04-10" },
  { id: "e9", reviewer_name: "v***i (eBay Buyer)", rating: 5, body: "Excellent condition and packaging, very pleased with the belt. Would definitely recommend this seller, delivered before expected.", source: "ebay", created_at: "2026-03-25" },
  { id: "e10", reviewer_name: "v***i (eBay Buyer)", rating: 5, body: "Excellent condition and packaging, very pleased with the product. Would definitely recommend this seller, delivered before expected.", source: "ebay", created_at: "2026-03-22" },
  { id: "e11", reviewer_name: "c***n (eBay Buyer)", rating: 5, body: "Item As Described ~ Superb Packing ~ Fast Shipping ~ Great Seller AAA+++", source: "ebay", created_at: "2026-02-18" },
  { id: "e12", reviewer_name: "1***n (eBay Buyer)", rating: 5, body: "Package arrived as promised. Great dealing with the Seller willing to deal with them in the future.", source: "ebay", created_at: "2026-02-05" },
  { id: "e13", reviewer_name: "w***h (eBay Buyer)", rating: 5, body: "Item was carefully packed and arrived as described and in good condition.", source: "ebay", created_at: "2026-01-20" }
]

function getSourceLabel(source: string | null): string {
  if (!source) return "Warcraft Exports"
  const lower = source.toLowerCase()
  if (lower === "amazon") return "Amazon Verified Purchase"
  if (lower === "ebay") return "eBay Verified Purchase"
  if (lower === "direct") return "Warcraft Exports"
  return source
}

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: dbReviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, body, source, created_at")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  const reviews = (dbReviews && dbReviews.length > 0) ? dbReviews : STATIC_REVIEWS

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Page Title & Aggregated Summary Banner */}
        <div className="mb-12 border-b border-khaki/30 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">
              Verified Customers
            </p>
            <h1 className="font-heading text-[40px] sm:text-[52px] font-black text-leather-dark uppercase leading-none mb-3">
              Customer Reviews
            </h1>
            <p className="font-sans text-sm text-leather/70 max-w-xl leading-relaxed">
              Read real feedback and reviews from reenactors, collectors, and historians worldwide who rely on Warcraft Exports.
            </p>
          </div>

          <div className="bg-white/40 border border-khaki/40 p-5 rounded-sm flex flex-col items-center sm:items-start gap-1 flex-shrink-0 min-w-[240px]">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-khaki">Global Rating</span>
            <div className="flex items-center gap-2">
              <span className="font-heading text-3xl font-black text-leather-dark">4.9</span>
              <span className="font-sans text-sm text-leather-dark/60 mt-2">/ 5.0</span>
            </div>
            <div className="flex gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gold">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="font-sans text-[11px] text-leather/80 font-medium">Based on 2,300+ total reviews</span>
          </div>
        </div>

        {/* Masonry-style Grid of 30+ Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/60 hover:bg-white/90 border border-khaki/40 p-6 flex flex-col gap-3 rounded-sm transition-all duration-300 shadow-sm hover:shadow-md">
              <Quote size={18} className="text-gold/50 flex-shrink-0" />
              <p className="font-serif text-sm text-leather-dark leading-relaxed flex-1 italic">&ldquo;{review.body}&rdquo;</p>
              <div className="border-t border-khaki/30 pt-3 flex items-center justify-between mt-2">
                <div>
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-leather-dark">{review.reviewer_name}</p>
                  <p className="font-sans text-[10px] text-khaki/80">{getSourceLabel(review.source)}</p>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Trust Banner with Stores Link */}
        <div className="bg-canvas border border-khaki/40 p-8 sm:p-10 rounded-sm text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-khaki via-leather to-gold" />
          
          <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-leather-dark tracking-tight mb-3">
            Want to see more verified feedback?
          </h2>
          <p className="font-sans text-sm text-leather/80 max-w-2xl mx-auto mb-6 leading-relaxed">
            We are proud to serve reenactors around the world with full buyer protections. You can explore thousands more live ratings directly on our global store outlets.
          </p>

          {/* Highlighted Trust Banner Text Callout */}
          <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-leather/5 border border-leather/10 rounded-sm mb-8 font-sans font-bold text-xs uppercase tracking-[0.15em] text-leather animate-pulse">
            <span>Please visit our Stores to see more Live</span>
            <ArrowRight size={14} />
          </div>

          {/* Fast Links to Global Stores */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://www.amazon.com/stores/WarcraftExports/page/3230F619-1D84-409B-A959-DD6873E12497"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-khaki hover:border-leather text-leather hover:text-leather-dark font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-3 bg-white/40 transition-all rounded-sm shadow-sm"
            >
              Amazon US Store <ExternalLink size={12} />
            </a>
            <a
              href="https://www.amazon.co.uk/stores/Warcraft+Exports/page/39F818AE-3A14-44D6-A2D4-0534C55D6533?lp_asin=B0863SL3PQ&ref_=ast_bln"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-khaki hover:border-leather text-leather hover:text-leather-dark font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-3 bg-white/40 transition-all rounded-sm shadow-sm"
            >
              Amazon UK Store <ExternalLink size={12} />
            </a>
            <a
              href="https://www.amazon.de/-/en/stores/Warcraft+Exports/page/FA49B017-2EBD-4E08-904E-1E16BEEEC7DB?lp_asin=B09B4SDZCT&ref_=ast_bln"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-khaki hover:border-leather text-leather hover:text-leather-dark font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-3 bg-white/40 transition-all rounded-sm shadow-sm"
            >
              Amazon Germany Store <ExternalLink size={12} />
            </a>
            <a
              href={siteConfig.social.ebay}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-khaki hover:border-leather text-leather hover:text-leather-dark font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-3 bg-white/40 transition-all rounded-sm shadow-sm"
            >
              eBay Store <ExternalLink size={12} />
            </a>
            <a
              href={siteConfig.social.walmart}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-khaki hover:border-leather text-leather hover:text-leather-dark font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-3 bg-white/40 transition-all rounded-sm shadow-sm"
            >
              Walmart Store <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
