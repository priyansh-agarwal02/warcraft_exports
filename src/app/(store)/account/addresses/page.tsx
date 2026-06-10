import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createServiceClient } from "@/lib/supabase/service"

export const metadata: Metadata = { title: "My Addresses — Warcraft Exports" }

async function deleteAddress(formData: FormData) {
  "use server"
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return

  const supabase = createServiceClient()
  await supabase.from("addresses").delete()
    .eq("id", formData.get("address_id") as string)
    .eq("user_id", user.id)
  revalidatePath("/account/addresses")
}

async function addAddress(formData: FormData) {
  "use server"
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return

  const supabase = createServiceClient()

  // Set is_default to true if it is their first address
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  const isDefault = count === 0

  await supabase.from("addresses").insert({
    user_id: user.id,
    type: "shipping",
    full_name: formData.get("full_name") as string,
    line1: formData.get("line1") as string,
    line2: formData.get("line2") as string || null,
    city: formData.get("city") as string,
    state: formData.get("state") as string || null,
    postal_code: formData.get("postal_code") as string,
    country: formData.get("country") as string,
    is_default: isDefault,
  })
  revalidatePath("/account/addresses")
}

const INPUT = "w-full border border-khaki/60 bg-parchment/60 px-3 py-2.5 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather transition-colors"

export default async function AddressesPage() {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect("/auth/login")

  const supabase = createServiceClient()
  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
  ])

  const displayName = profile?.full_name ?? user.email ?? "Customer"
  const displayEmail = profile?.email ?? user.email ?? ""

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-3xl text-leather-dark mb-2 uppercase font-black">My Account</h1>
        <p className="text-sm font-sans text-leather-dark/70 mb-8">Welcome back, {displayName}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-leather/20 text-leather flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-lg leading-none">{(profile?.full_name ?? displayEmail)[0]?.toUpperCase() ?? "?"}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-sm text-leather-dark truncate">{displayName}</p>
                  <p className="font-sans text-xs text-khaki truncate">{displayEmail}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 border-t border-khaki/30 pt-4">
                <Link href="/account/orders" className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors">My Orders</Link>
                <Link href="/account/wishlist" className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Wishlist</Link>
                <Link href="/account/addresses" className="text-sm font-sans font-semibold text-leather px-3 py-2 rounded-sm bg-parchment">Addresses</Link>
                <Link href="/account/settings" className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Profile Settings</Link>
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="w-full text-left text-sm font-sans text-red-600 hover:text-red-700 px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Sign Out</button>
                </form>
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Saved Addresses */}
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h2 className="font-heading text-xl text-leather-dark mb-5 uppercase font-black">Saved Addresses</h2>
              {!addresses || addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin size={32} className="text-khaki mx-auto mb-3" />
                  <p className="text-sm font-sans text-khaki">No saved addresses yet. Add one below.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr: {
                    id: string; full_name: string; line1: string;
                    line2?: string; city: string; state?: string; postal_code: string;
                    country: string; is_default: boolean
                  }) => (
                    <div key={addr.id} className={`border rounded-sm p-4 relative ${addr.is_default ? "border-leather" : "border-khaki/30"}`}>
                      {addr.is_default && (
                        <span className="absolute top-3 right-3 text-[10px] font-sans font-bold uppercase tracking-wide bg-leather text-parchment px-2 py-0.5">
                          Default
                        </span>
                      )}
                      <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-khaki mb-2">Shipping Address</p>
                      <address className="not-italic font-sans text-sm text-leather-dark/80 space-y-0.5">
                        <p className="font-semibold text-leather-dark">{addr.full_name}</p>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}</p>
                        <p>{addr.country}</p>
                      </address>
                      <form action={deleteAddress} className="mt-3">
                        <input type="hidden" name="address_id" value={addr.id} />
                        <button type="submit" className="flex items-center gap-1.5 text-[11px] font-sans text-red-600 hover:text-red-700 transition-colors">
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Address */}
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h2 className="font-heading text-xl text-leather-dark mb-5 uppercase font-black">Add New Address</h2>
              <form action={addAddress} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Full Name *</label>
                  <input name="full_name" type="text" required placeholder="John Smith" className={INPUT} />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Address Line 1 *</label>
                  <input name="line1" type="text" required placeholder="123 Main Street" className={INPUT} />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Address Line 2</label>
                  <input name="line2" type="text" placeholder="Apt, Suite, Unit (optional)" className={INPUT} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">City *</label>
                    <input name="city" type="text" required placeholder="New York" className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">State / Province</label>
                    <input name="state" type="text" placeholder="NY" className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Postal Code *</label>
                    <input name="postal_code" type="text" required placeholder="10001" className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Country *</label>
                  <input name="country" type="text" required placeholder="United States" className={INPUT} />
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-leather text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-leather-dark transition-colors">
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
