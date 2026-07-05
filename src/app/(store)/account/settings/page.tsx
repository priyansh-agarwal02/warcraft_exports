import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ProfileForm } from "@/components/account/profile-form"

export const metadata: Metadata = { title: "Profile Settings — Warcraft Exports" }

async function updateProfile(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from("profiles").update({
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
  }).eq("id", user.id)
  revalidatePath("/account/settings")
  revalidatePath("/account")
}

const INPUT = "w-full border border-khaki/60 bg-parchment/60 px-3 py-2.5 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather transition-colors"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .single()

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
                <Link href="/account/addresses" className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Addresses</Link>
                <Link href="/account/settings" className="text-sm font-sans font-semibold text-leather px-3 py-2 rounded-sm bg-parchment">Profile Settings</Link>
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="w-full text-left text-sm font-sans text-red-600 hover:text-red-700 px-3 py-2 rounded-sm hover:bg-parchment transition-colors">Sign Out</button>
                </form>
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h2 className="font-heading text-xl text-leather-dark mb-5 uppercase font-black">Profile Settings</h2>
              <ProfileForm
                initialProfile={{
                  full_name: profile?.full_name ?? null,
                  email: displayEmail,
                  phone: profile?.phone ?? null,
                }}
                updateAction={updateProfile}
              />
            </div>

            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h2 className="font-heading text-xl text-leather-dark mb-2 uppercase font-black">Password</h2>
              <p className="font-sans text-sm text-leather-dark/70 mb-4">Change your account password.</p>
              <Link href="/auth/reset-password" className="inline-block bg-leather/10 border border-leather/30 text-leather font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-6 py-2.5 hover:bg-leather/20 transition-colors">
                Change Password
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
