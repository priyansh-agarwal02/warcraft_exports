import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "My Orders — Warcraft Exports",
}

type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"

const STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: "bg-gold/20 text-gold border border-gold/30",
  processing: "bg-olive/10 text-olive border border-olive/20",
  shipped: "bg-leather/10 text-leather border border-leather/20",
  delivered: "bg-green-700/10 text-green-700 border border-green-700/20",
  cancelled: "bg-red-600/10 text-red-600 border border-red-600/20",
}

const PAGE_SIZE = 10

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const resolvedParams = await searchParams
  const currentPage = Math.max(1, parseInt(resolvedParams.page ?? "1", 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: profile }, { data: orders, count }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single(),
    supabase
      .from("orders")
      .select(
        `id, order_number, status, total_usd, created_at, order_items(count)`,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to),
  ])

  const displayName = profile?.full_name ?? user.email ?? "Customer"
  const displayEmail = profile?.email ?? user.email ?? ""
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-3xl text-leather-dark mb-2 uppercase font-black">My Account</h1>
        <p className="text-sm font-sans text-leather-dark/70 mb-8">
          Welcome back, {displayName}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-leather/20 text-leather flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-lg leading-none">
                    {(profile?.full_name ?? displayEmail)[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-sm text-leather-dark truncate">{displayName}</p>
                  <p className="font-sans text-xs text-khaki truncate">{displayEmail}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1 border-t border-khaki/30 pt-4">
                <Link
                  href="/account/orders"
                  className="text-sm font-sans font-semibold text-leather px-3 py-2 rounded-sm bg-parchment"
                >
                  My Orders
                </Link>
                <Link
                  href="/account/wishlist"
                  className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors"
                >
                  Wishlist
                </Link>
                <Link
                  href="/account/addresses"
                  className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors"
                >
                  Addresses
                </Link>
                <Link
                  href="/account/settings"
                  className="text-sm font-sans text-leather-dark hover:text-leather px-3 py-2 rounded-sm hover:bg-parchment transition-colors"
                >
                  Profile Settings
                </Link>
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full text-left text-sm font-sans text-red-600 hover:text-red-700 px-3 py-2 rounded-sm hover:bg-parchment transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* Orders Table */}
          <section className="lg:col-span-2">
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h2 className="font-heading text-xl text-leather-dark mb-5 uppercase font-black">All Orders</h2>

              {!orders || orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-sans text-khaki mb-4">No orders yet. Start shopping!</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-2.5 bg-leather text-parchment text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans">
                      <thead>
                        <tr className="border-b border-khaki/30">
                          <th className="text-left text-xs font-semibold uppercase tracking-widest text-khaki pb-3 pr-4">Order #</th>
                          <th className="text-left text-xs font-semibold uppercase tracking-widest text-khaki pb-3 pr-4">Date</th>
                          <th className="text-left text-xs font-semibold uppercase tracking-widest text-khaki pb-3 pr-4">Items</th>
                          <th className="text-left text-xs font-semibold uppercase tracking-widest text-khaki pb-3 pr-4">Status</th>
                          <th className="text-right text-xs font-semibold uppercase tracking-widest text-khaki pb-3 pr-4">Total</th>
                          <th className="text-right text-xs font-semibold uppercase tracking-widest text-khaki pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-khaki/20">
                        {orders.map((order) => {
                          const status = (order.status ?? "confirmed") as OrderStatus
                          const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.confirmed
                          const displayId = order.order_number ?? order.id.slice(0, 8).toUpperCase()
                          const date = new Date(order.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          const itemCount = Array.isArray(order.order_items)
                            ? (order.order_items[0] as { count: number } | undefined)?.count ?? 0
                            : 0

                          return (
                            <tr key={order.id} className="hover:bg-parchment/50 transition-colors">
                              <td className="py-3 pr-4">
                                <span className="font-mono text-xs text-leather-dark">#{displayId}</span>
                              </td>
                              <td className="py-3 pr-4 text-leather-dark/80 text-xs">{date}</td>
                              <td className="py-3 pr-4 text-leather-dark/80 text-xs">{itemCount}</td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wider ${statusStyle}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-right font-semibold text-leather-dark text-xs">
                                ${(order.total_usd ?? 0).toFixed(2)}
                              </td>
                              <td className="py-3 text-right">
                                <Link
                                  href={`/account/orders/${order.id}`}
                                  className="text-xs font-semibold text-leather hover:text-leather-dark transition-colors"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-khaki/30 flex items-center justify-between">
                      <p className="text-xs font-sans text-khaki">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        {currentPage > 1 && (
                          <Link
                            href={`/account/orders?page=${currentPage - 1}`}
                            className="px-3 py-1.5 text-xs font-semibold font-sans border border-khaki/40 rounded-sm text-leather-dark hover:bg-parchment transition-colors"
                          >
                            Previous
                          </Link>
                        )}
                        {currentPage < totalPages && (
                          <Link
                            href={`/account/orders?page=${currentPage + 1}`}
                            className="px-3 py-1.5 text-xs font-semibold font-sans border border-khaki/40 rounded-sm text-leather-dark hover:bg-parchment transition-colors"
                          >
                            Next
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
