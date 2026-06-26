import type { Metadata } from "next"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { CheckCircle, XCircle, Percent, Plus, Trash2, Edit3, Tag } from "lucide-react"
import { DeletePromoButton } from "./delete-promo-button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Promotions — Warcraft Exports Admin" }

// ─── Coupon server actions ─────────────────────────────────────────────────

async function addCoupon(formData: FormData) {
  "use server"
  const supabase = createServiceClient()
  await supabase.from("coupons").insert({
    code: (formData.get("code") as string).toUpperCase().trim(),
    type: formData.get("discount_type") as string,
    value: Number(formData.get("discount_value")),
    min_order_usd: formData.get("min_order") ? Number(formData.get("min_order")) : null,
    usage_limit: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
    expires_at: formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null,
    is_active: true,
  })
  revalidatePath("/admin/promotions")
}

async function updateCoupon(formData: FormData) {
  "use server"
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  const code = (formData.get("code") as string).toUpperCase().trim()
  const type = formData.get("discount_type") as string
  const value = Number(formData.get("discount_value"))
  const min_order_usd = formData.get("min_order") ? Number(formData.get("min_order")) : null
  const usage_limit = formData.get("max_uses") ? Number(formData.get("max_uses")) : null
  const expires_at = formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null

  if (!id || !code || isNaN(value)) return

  await supabase.from("coupons").update({
    code,
    type,
    value,
    min_order_usd,
    usage_limit,
    expires_at,
  }).eq("id", id)

  revalidatePath("/admin/promotions")
}

async function toggleCoupon(id: string, isActive: boolean) {
  "use server"
  const supabase = createServiceClient()
  await supabase.from("coupons").update({ is_active: !isActive }).eq("id", id)
  revalidatePath("/admin/promotions")
}

async function deleteCoupon(formData: FormData) {
  "use server"
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  if (!id) return
  await supabase.from("coupons").delete().eq("id", id)
  revalidatePath("/admin/promotions")
}

// ─── Quantity promotion server actions ────────────────────────────────────

async function addQuantityPromotion(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const name = (formData.get("name") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  const min_quantity = Number(formData.get("min_quantity"))
  const discount_percent = Number(formData.get("discount_percent"))
  const expires_at = formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null
  const applies_to = formData.get("applies_to") as string
  const product_ids = formData.getAll("product_ids") as string[]

  if (!name || min_quantity < 2 || discount_percent <= 0) return

  await supabase.from("quantity_promotions").insert({
    name,
    description,
    min_quantity,
    discount_percent,
    applies_to,
    product_ids: applies_to === "products" ? product_ids : [],
    is_active: true,
    expires_at,
  })
  revalidatePath("/admin/promotions")
}

async function updateQuantityPromotion(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  const name = (formData.get("name") as string).trim()
  const description = (formData.get("description") as string | null)?.trim() ?? ""
  const min_quantity = Number(formData.get("min_quantity"))
  const discount_percent = Number(formData.get("discount_percent"))
  const expires_at = formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null
  const applies_to = formData.get("applies_to") as string
  const product_ids = formData.getAll("product_ids") as string[]

  if (!id || !name || min_quantity < 2 || discount_percent <= 0) return

  await supabase.from("quantity_promotions").update({
    name,
    description,
    min_quantity,
    discount_percent,
    applies_to,
    product_ids: applies_to === "products" ? product_ids : [],
    expires_at,
  }).eq("id", id)
  revalidatePath("/admin/promotions")
}

async function toggleQuantityPromotion(id: string, isActive: boolean) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  await supabase.from("quantity_promotions").update({ is_active: !isActive }).eq("id", id)
  revalidatePath("/admin/promotions")
}

async function deleteQuantityPromotion(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  if (!id) return
  await supabase.from("quantity_promotions").delete().eq("id", id)
  revalidatePath("/admin/promotions")
}

// ─── Combo Deal server actions ──────────────────────────────────────────

async function addComboDeal(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const product_id = formData.get("product_id") as string
  const related_product_id = formData.get("related_product_id") as string
  const combo_price = Number(formData.get("combo_price"))

  if (!product_id || !related_product_id || product_id === related_product_id || isNaN(combo_price)) return

  await supabase.from("product_relations").insert({
    product_id,
    related_product_id,
    relation_type: "combo",
    combo_price,
  })
  revalidatePath("/admin/promotions")
}

async function deleteComboDeal(formData: FormData) {
  "use server"
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  if (!id) return
  await supabase.from("product_relations").delete().eq("id", id)
  revalidatePath("/admin/promotions")
}

// ─── Styles ───────────────────────────────────────────────────────────────

const INPUT = "w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white"
const LABEL = "block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1"

// ─── Page ─────────────────────────────────────────────────────────────────

type SP = Promise<{ edit?: string; edit_coupon?: string }>

export default async function AdminPromotionsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const editId = sp.edit
  const editCouponId = sp.edit_coupon
  const supabase = createServiceClient()

  // Fetch Coupons
  const { data: coupons } = await supabase
    .from("coupons")
    .select("id, code, type, value, min_order_usd, usage_limit, times_used, expires_at, is_active, created_at")
    .order("created_at", { ascending: false })

  // Fetch Active Products
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, sku, price_usd")
    .eq("is_active", true)
    .order("name")

  const productMap = new Map((allProducts ?? []).map((p) => [p.id, p]))

  // Quantity promotions — gracefully handle missing table
  let qtyPromos: {
    id: string; name: string; description: string; min_quantity: number;
    discount_percent: number; applies_to: string; is_active: boolean;
    expires_at: string | null; created_at: string; product_ids: string[]
  }[] = []
  try {
    const { data } = await supabase
      .from("quantity_promotions")
      .select("id, name, description, min_quantity, discount_percent, applies_to, is_active, expires_at, created_at, product_ids")
      .order("min_quantity", { ascending: true })
    qtyPromos = data ?? []
  } catch {
    // table not yet created — show setup notice
  }

  const tableExists = qtyPromos !== null && qtyPromos.length !== undefined

  // Find editing promo
  const editingPromo = editId ? qtyPromos.find(p => p.id === editId) : null

  // Find editing coupon
  const editingCoupon = editCouponId ? (coupons ?? []).find(c => c.id === editCouponId) : null

  // Fetch Combo Deals
  let comboDeals: { id: string; product_id: string; related_product_id: string; combo_price: number }[] = []
  let comboTableOk = true
  try {
    const { data, error } = await supabase
      .from("product_relations")
      .select("id, product_id, related_product_id, combo_price")
      .eq("relation_type", "combo")
    if (error) throw error
    comboDeals = data ?? []
  } catch {
    comboTableOk = false
  }

  return (
    <div className="p-4 sm:p-8 space-y-10">
      <div className="mb-2">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Promotions</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">Manage coupon codes, quantity-based discounts, and combo deals</p>
      </div>

      {/* ── Section 1: Quantity Promotions ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Percent size={18} className="text-[#33450D]" />
          <h2 className="font-heading text-[18px] text-[#18181B] uppercase">Quantity Promotions</h2>
        </div>
        <p className="text-[13px] font-sans text-[#71717A] mb-5">
          Auto-applied discounts when customers add a minimum number of items to their cart.
          Shown as a banner in the cart and as badges on product listings. Supports all products or specific item targeting.
        </p>

        {!tableExists ? (
          <div className="bg-amber-50 border border-amber-200 p-5 text-[13px] font-sans text-amber-800">
            <p className="font-bold mb-1">Table not set up yet</p>
            <p>Run <code className="bg-amber-100 px-1 rounded text-[12px]">supabase/migrations/003_quantity_promotions.sql</code> in your Supabase SQL Editor to enable quantity promotions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Existing quantity promotions list */}
            <div className="lg:col-span-2 space-y-4">
              {qtyPromos.length === 0 ? (
                <div className="bg-white border border-[#E4E4E7] py-10 text-center text-[13px] font-sans text-[#A1A1AA]">
                  No quantity promotions yet. Create one →
                </div>
              ) : (
                <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
                  <table className="w-full text-[13px] font-sans">
                    <thead>
                      <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Name</th>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Trigger</th>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Scope</th>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Discount</th>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Expires</th>
                        <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Active</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F4F4]">
                      {qtyPromos.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#18181B]">
                            {p.name}
                            {p.description && <span className="block text-[11px] text-[#A1A1AA]">{p.description}</span>}
                          </td>
                          <td className="px-4 py-3 text-[#18181B]">
                            <span className="bg-[#33450D]/10 text-[#33450D] text-[11px] font-bold px-2 py-0.5 rounded-full">
                              ≥ {p.min_quantity} items
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#18181B]">
                            {p.applies_to === "all" ? (
                              <span className="text-[11px] bg-zinc-100 text-zinc-800 px-2 py-0.5 uppercase tracking-wide font-bold">Site-wide</span>
                            ) : (
                              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 uppercase tracking-wide font-bold">{p.product_ids?.length ?? 0} Products</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#33450D]">{p.discount_percent}% off</td>
                          <td className="px-4 py-3 text-[#71717A] hidden md:table-cell text-[12px]">
                            {p.expires_at ? new Date(p.expires_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <form action={toggleQuantityPromotion.bind(null, p.id, p.is_active)}>
                              <button type="submit" title={p.is_active ? "Deactivate" : "Activate"} className="inline-flex items-center justify-center hover:opacity-70 transition-opacity">
                                {p.is_active
                                  ? <CheckCircle size={18} className="text-green-600" />
                                  : <XCircle size={18} className="text-[#D4D4D8]" />}
                              </button>
                            </form>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/admin/promotions?edit=${p.id}`}
                                title="Edit"
                                className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                              >
                                <Edit3 size={14} />
                              </Link>
                              <DeletePromoButton
                                action={deleteQuantityPromotion}
                                id={p.id}
                                confirmMessage={`Delete "${p.name}"?`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Live preview of how banner looks */}
              {qtyPromos.filter(p => p.is_active).length > 0 && (
                <div className="border border-[#33450D]/20 bg-[#33450D]/5 p-4">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#33450D] mb-2">Cart Banner Preview</p>
                  <div className="bg-[#33450D] text-white px-4 py-3 text-[12px] font-sans flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold uppercase tracking-wide text-[10px]">🏷 Quantity Discount</span>
                    {qtyPromos.filter(p => p.is_active).map(p => (
                      <span key={p.id} className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
                        {p.name} (Buy {p.min_quantity}+ → Save {p.discount_percent}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add / Edit quantity promotion form */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E4E4E7] p-5 sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus size={15} className="text-[#33450D]" />
                    <h3 className="font-heading text-[14px] text-[#18181B] uppercase">
                      {editingPromo ? "Edit Tier" : "New Tier"}
                    </h3>
                  </div>
                  {editingPromo && (
                    <Link href="/admin/promotions" className="text-[11px] font-sans text-red-500 hover:underline">
                      Cancel
                    </Link>
                  )}
                </div>
                <form action={editingPromo ? updateQuantityPromotion : addQuantityPromotion} className="space-y-3">
                  {editingPromo && <input type="hidden" name="id" value={editingPromo.id} />}
                  <div>
                    <label className={LABEL}>Name *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Buy 2+ Save 10%"
                      defaultValue={editingPromo?.name ?? ""}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Description</label>
                    <input
                      name="description"
                      type="text"
                      placeholder="Shown in cart banner"
                      defaultValue={editingPromo?.description ?? ""}
                      className={INPUT}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={LABEL}>Min Items *</label>
                      <input
                        name="min_quantity"
                        type="number"
                        required
                        min="2"
                        placeholder="2"
                        defaultValue={editingPromo?.min_quantity ?? ""}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Discount % *</label>
                      <input
                        name="discount_percent"
                        type="number"
                        required
                        min="1"
                        max="100"
                        step="0.01"
                        placeholder="10"
                        defaultValue={editingPromo?.discount_percent ?? ""}
                        className={INPUT}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Expires At — optional</label>
                    <input
                      name="expires_at"
                      type="date"
                      defaultValue={editingPromo?.expires_at ? editingPromo.expires_at.slice(0, 10) : ""}
                      className={INPUT}
                    />
                  </div>
                  
                  {/* Scope Selector */}
                  <div>
                    <label className={LABEL}>Applies To</label>
                    <select
                      name="applies_to"
                      defaultValue={editingPromo?.applies_to ?? "all"}
                      className={INPUT}
                    >
                      <option value="all">All Products</option>
                      <option value="products">Specific Products</option>
                    </select>
                  </div>

                  {/* Scrollable Product Picker */}
                  <div className="space-y-1">
                    <label className={LABEL}>Select Target Products (If Specific Products selected)</label>
                    <div className="border border-[#E4E4E7] p-2.5 max-h-40 overflow-y-auto space-y-1.5 bg-[#FAFAFA]">
                      {(allProducts ?? []).map((p) => {
                        const isChecked = editingPromo?.product_ids?.includes(p.id) ?? false
                        return (
                          <label key={p.id} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              name="product_ids"
                              value={p.id}
                              defaultChecked={isChecked}
                              className="w-3.5 h-3.5 accent-[#33450D]"
                            />
                            <span className="text-[12px] font-sans text-[#18181B] line-clamp-1">
                              {p.name} <span className="text-[#71717A] text-[11px] font-mono">({p.sku})</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-2.5 hover:bg-[#4A5D23] transition-colors">
                    {editingPromo ? "Save Changes" : "Create Promotion"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2: Combo Deals ───────────────────────────────────────── */}
      <section className="border-t border-[#E4E4E7] pt-10">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-[#33450D]" />
          <h2 className="font-heading text-[18px] text-[#18181B] uppercase">Combo Deals</h2>
        </div>
        <p className="text-[13px] font-sans text-[#71717A] mb-5">
          Link 2 products together for a discounted combo price (e.g. Holster + Belt combo).
        </p>

        {!comboTableOk ? (
          <div className="bg-amber-50 border border-amber-200 p-5 text-[13px] font-sans text-amber-800">
            <p className="font-bold mb-1">Database Update Required</p>
            <p>Paste the following SQL migration in your Supabase SQL Editor to support combo deal prices:</p>
            <pre className="bg-[#18181B] text-[#A1A1AA] p-3 text-[11px] font-mono mt-2 overflow-x-auto whitespace-pre rounded">
              {`ALTER TABLE product_relations ADD COLUMN IF NOT EXISTS combo_price decimal(10,2);`}
            </pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Combo deals list */}
            <div className="lg:col-span-2">
              {comboDeals.length === 0 ? (
                <div className="bg-white border border-[#E4E4E7] py-10 text-center text-[13px] font-sans text-[#A1A1AA]">
                  No combo deals created yet.
                </div>
              ) : (
                <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
                  <table className="w-full text-[13px] font-sans">
                    <thead>
                      <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Product A</th>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Product B</th>
                        <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Individual sum</th>
                        <th className="text-right px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Combo Price</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F4F4]">
                      {comboDeals.map((c) => {
                        const pA = productMap.get(c.product_id)
                        const pB = productMap.get(c.related_product_id)
                        const sum = (pA?.price_usd ?? 0) + (pB?.price_usd ?? 0)
                        return (
                          <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                            <td className="px-4 py-3 font-medium text-[#18181B]">
                              {pA?.name ?? "Unknown Product"}
                              <span className="block text-[11px] text-[#A1A1AA]">{pA?.sku ?? ""} (${pA?.price_usd?.toFixed(2) ?? "0.00"})</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-[#18181B]">
                              {pB?.name ?? "Unknown Product"}
                              <span className="block text-[11px] text-[#A1A1AA]">{pB?.sku ?? ""} (${pB?.price_usd?.toFixed(2) ?? "0.00"})</span>
                            </td>
                            <td className="px-4 py-3 text-right text-[#71717A]">${sum.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-[#33450D]">${c.combo_price?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <DeletePromoButton
                                action={deleteComboDeal}
                                id={c.id}
                                confirmMessage="Delete this combo deal?"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Create combo deal form */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E4E4E7] p-5">
                <h3 className="font-heading text-[14px] text-[#18181B] uppercase mb-4">New Combo Deal</h3>
                <form action={addComboDeal} className="space-y-4">
                  <div>
                    <label className={LABEL}>Product A (Primary) *</label>
                    <select name="product_id" required className={INPUT}>
                      <option value="">— Select Product —</option>
                      {(allProducts ?? []).map((p) => {
                        const maxLen = 30
                        const truncatedName = p.name.length > maxLen ? p.name.slice(0, maxLen) + "..." : p.name
                        return (
                          <option key={p.id} value={p.id}>
                            {truncatedName} ({p.sku}) - ${p.price_usd.toFixed(2)}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Product B (Related) *</label>
                    <select name="related_product_id" required className={INPUT}>
                      <option value="">— Select Product —</option>
                      {(allProducts ?? []).map((p) => {
                        const maxLen = 30
                        const truncatedName = p.name.length > maxLen ? p.name.slice(0, maxLen) + "..." : p.name
                        return (
                          <option key={p.id} value={p.id}>
                            {truncatedName} ({p.sku}) - ${p.price_usd.toFixed(2)}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Combo Deal Price (USD) *</label>
                    <input name="combo_price" type="number" step="0.01" required placeholder="49.99" className={INPUT} />
                  </div>
                  <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-2.5 hover:bg-[#4A5D23] transition-colors">
                    Add Combo Deal
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Section 3: Coupon Codes ─────────────────────────────────────── */}
      <section className="border-t border-[#E4E4E7] pt-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-heading text-[18px] text-[#18181B] uppercase">Coupon Codes</h2>
        </div>
        <p className="text-[13px] font-sans text-[#71717A] mb-5">
          Manual discount codes customers enter at checkout.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coupon list */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E4E4E7] overflow-x-auto">
              <table className="w-full text-[13px] font-sans">
                <thead>
                  <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Code</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Discount</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden md:table-cell">Uses</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px] hidden lg:table-cell">Expires</th>
                    <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-[#71717A] text-[11px]">Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F4]">
                  {(coupons ?? []).map((c: { id: string; code: string; type: string; value: number; min_order_usd: number | null; usage_limit: number | null; times_used: number | null; expires_at: string | null; is_active: boolean }) => (
                    <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#18181B]">{c.code}</td>
                      <td className="px-4 py-3 text-[#18181B]">
                        {c.type === "percent" ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                        {c.min_order_usd && <span className="text-[11px] text-[#A1A1AA] block">Min ${c.min_order_usd}</span>}
                      </td>
                      <td className="px-4 py-3 text-[#71717A] hidden md:table-cell">
                        {c.times_used ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-[#71717A] hidden lg:table-cell text-[12px]">
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <form action={toggleCoupon.bind(null, c.id, c.is_active)}>
                           <button type="submit" title={c.is_active ? "Deactivate" : "Activate"} className="inline-flex items-center justify-center hover:opacity-70 transition-opacity">
                            {c.is_active
                              ? <CheckCircle size={18} className="text-green-600" />
                              : <XCircle size={18} className="text-[#D4D4D8]" />}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/promotions?edit_coupon=${c.id}`}
                            title="Edit"
                            className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <DeletePromoButton
                            action={deleteCoupon}
                            id={c.id}
                            confirmMessage={`Delete coupon code "${c.code}"?`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!coupons || coupons.length === 0) && <div className="text-center py-12 text-[#A1A1AA] text-[13px]">No coupons yet</div>}
            </div>
          </div>

          {/* Add / Edit coupon form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E4E4E7] p-6 sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editingCoupon ? <Edit3 size={15} className="text-[#33450D]" /> : <Plus size={15} className="text-[#33450D]" />}
                  <h3 className="font-heading text-[14px] text-[#18181B] uppercase">
                    {editingCoupon ? "Edit Coupon" : "New Coupon"}
                  </h3>
                </div>
                {editingCoupon && (
                  <Link href="/admin/promotions" className="text-[11px] font-sans text-red-500 hover:underline">
                    Cancel
                  </Link>
                )}
              </div>
              <form action={editingCoupon ? updateCoupon : addCoupon} className="space-y-4">
                {editingCoupon && <input type="hidden" name="id" value={editingCoupon.id} />}
                <div>
                  <label className={LABEL}>Code</label>
                  <input
                    name="code"
                    type="text"
                    required
                    placeholder="SUMMER20"
                    defaultValue={editingCoupon?.code ?? ""}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Discount Type</label>
                  <select name="discount_type" defaultValue={editingCoupon?.type ?? "percent"} className={INPUT}>
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Discount Value</label>
                  <input
                    name="discount_value"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="20"
                    defaultValue={editingCoupon?.value ?? ""}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Min Order ($) — optional</label>
                  <input
                    name="min_order"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    defaultValue={editingCoupon?.min_order_usd ?? ""}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Max Uses — optional</label>
                  <input
                    name="max_uses"
                    type="number"
                    min="1"
                    placeholder="100"
                    defaultValue={editingCoupon?.usage_limit ?? ""}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Expires At — optional</label>
                  <input
                    name="expires_at"
                    type="date"
                    defaultValue={editingCoupon?.expires_at ? editingCoupon.expires_at.slice(0, 10) : ""}
                    className={INPUT}
                  />
                </div>
                <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#4A5D23] transition-colors">
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
