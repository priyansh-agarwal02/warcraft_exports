import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Price } from "@/components/ui/price"

export const metadata: Metadata = { title: "Wishlist — Warcraft Exports" }

async function removeFromWishlist(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from("wishlists").delete()
    .eq("user_id", user.id)
    .eq("product_id", formData.get("product_id") as string)
}

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: wishlist }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    supabase.from("wishlists")
      .select("product_id, products(id, name, slug, price_usd, product_images(url, is_hero))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
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
                <Link href="/account/wishlist" className="text-sm font-sans font-semibold text-leather px-3 py-2 rounded-sm bg-parchment">Wishlist</Link>
                <Link href="/account/addresses" className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Addresses</Link>
                <Link href="/account/settings" className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Profile Settings</Link>
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="w-full text-left text-sm font-sans text-red-600 hover:text-red-700 px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Sign Out</button>
                </form>
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-2">
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h2 className="font-heading text-xl text-leather-dark mb-5 uppercase font-black">
                Wishlist ({wishlist?.length ?? 0} items)
              </h2>
              {!wishlist || wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={36} className="text-khaki mx-auto mb-4" />
                  <p className="text-sm font-sans text-khaki mb-4">Your wishlist is empty.</p>
                  <Link href="/shop" className="inline-block px-6 py-2.5 bg-leather text-parchment text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors">
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => {
                    const product = Array.isArray(item.products) ? item.products[0] : item.products as { id: string; name: string; slug: string; price_usd: number; product_images: { url: string; is_hero: boolean }[] } | null
                    if (!product) return null
                    const images = Array.isArray(product.product_images) ? product.product_images : []
                    const heroImg = images.find((i) => i.is_hero)?.url ?? images[0]?.url
                    return (
                      <div key={item.product_id} className="border border-khaki/30 p-4 flex gap-4">
                        <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                          {heroImg ? (
                            <Image src={heroImg} alt={product.name} width={80} height={80} className="w-20 h-20 object-cover bg-parchment/40" />
                          ) : (
                            <div className="w-20 h-20 bg-parchment/40 flex items-center justify-center">
                              <Package size={20} className="text-khaki" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${product.slug}`} className="font-sans text-sm font-semibold text-leather-dark hover:text-leather line-clamp-2 block">
                            {product.name}
                          </Link>
                          <Price usd={product.price_usd ?? 0} className="font-sans text-sm text-leather mt-1 block" />
                          <div className="flex gap-3 mt-3">
                            <Link href={`/product/${product.slug}`} className="text-[11px] font-sans font-bold uppercase tracking-wide text-parchment bg-leather px-3 py-1.5 hover:bg-leather-dark transition-colors">
                              View
                            </Link>
                            <form action={removeFromWishlist}>
                              <input type="hidden" name="product_id" value={item.product_id} />
                              <button type="submit" className="text-[11px] font-sans font-bold uppercase tracking-wide text-red-600 hover:text-red-700 transition-colors">
                                Remove
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
