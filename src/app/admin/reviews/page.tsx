import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Star } from "lucide-react"
import { revalidatePath } from "next/cache"

export const metadata: Metadata = { title: "Reviews — Warcraft Exports Admin" }

async function toggleFeatured(id: string, featured: boolean) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  await supabase.from("reviews").update({ is_featured: !featured }).eq("id", id)
  revalidatePath("/admin/reviews")
}

async function addReview(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  await supabase.from("reviews").insert({
    reviewer_name: formData.get("reviewer_name") as string,
    rating: Number(formData.get("rating")),
    body: formData.get("body") as string,
    source: formData.get("source") as string,
    is_featured: false,
  })
  revalidatePath("/admin/reviews")
}

const INPUT = "w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white"
const LABEL = "block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-[#D4D4D8]"} />
      ))}
    </div>
  )
}

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, body, source, is_featured, created_at")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Reviews</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{reviews?.length ?? 0} reviews</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review list */}
        <div className="lg:col-span-2 space-y-3">
          {(reviews ?? []).map((r: { id: string; reviewer_name: string | null; rating: number | null; body: string | null; source: string | null; is_featured: boolean | null; created_at: string }) => (
            <div key={r.id} className={`bg-white border p-4 flex gap-4 ${r.is_featured ? "border-[#BBAC48]" : "border-[#E4E4E7]"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-sans font-bold text-[13px] text-[#18181B]">{r.reviewer_name ?? "Anonymous"}</p>
                  <StarRating rating={r.rating ?? 0} />
                  {r.source && <span className="text-[10px] font-sans text-[#A1A1AA] uppercase">{r.source}</span>}
                  {r.is_featured && <span className="text-[10px] font-bold font-sans bg-[#BBAC48] text-[#484000] px-1.5 py-0.5 uppercase">Featured</span>}
                </div>
                <p className="font-sans text-[12px] text-[#71717A] line-clamp-2">{r.body ?? "—"}</p>
                <p className="font-sans text-[11px] text-[#A1A1AA] mt-1">{new Date(r.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <form action={toggleFeatured.bind(null, r.id, r.is_featured ?? false)} className="flex-shrink-0">
                <button type="submit" className={`text-[11px] font-sans font-bold uppercase tracking-wide px-3 py-1.5 border transition-colors ${r.is_featured ? "border-[#BBAC48] text-[#484000] hover:bg-[#BBAC48]/10" : "border-[#E4E4E7] text-[#71717A] hover:border-[#BBAC48]"}`}>
                  {r.is_featured ? "Unfeature" : "Feature"}
                </button>
              </form>
            </div>
          ))}
          {(!reviews || reviews.length === 0) && (
            <div className="bg-white border border-[#E4E4E7] text-center py-12 text-[#A1A1AA] text-[13px]">No reviews yet</div>
          )}
        </div>

        {/* Add review form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E4E4E7] p-6">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase mb-4">Add Review</h2>
            <form action={addReview} className="space-y-4">
              <div>
                <label className={LABEL}>Reviewer Name</label>
                <input name="reviewer_name" type="text" required placeholder="John S." className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Rating (1–5)</label>
                <select name="rating" className={INPUT}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Review Text</label>
                <textarea name="body" required rows={4} placeholder="Review content…" className={`${INPUT} resize-none`} />
              </div>
              <div>
                <label className={LABEL}>Source</label>
                <select name="source" className={INPUT}>
                  <option value="manual">Manual</option>
                  <option value="amazon">Amazon</option>
                  <option value="ebay">eBay</option>
                  <option value="google">Google</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#4A5D23] transition-colors">Add Review</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
