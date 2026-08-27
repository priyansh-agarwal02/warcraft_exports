import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"

export const metadata: Metadata = {
  title: "Order Detail — Warcraft Exports",
}

type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"

const STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: "bg-gold/20 text-gold border border-gold/30",
  processing: "bg-olive/10 text-olive border border-olive/20",
  shipped: "bg-leather/10 text-leather border border-leather/20",
  delivered: "bg-green-700/10 text-green-700 border border-green-700/20",
  cancelled: "bg-red-600/10 text-red-600 border border-red-600/20",
}

const TIMELINE_STEPS: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"]

const STEP_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
}

type Props = { params: Promise<{ id: string }> }

function getCarrierName(trackingUrl: string | null): string {
  if (!trackingUrl) return "Standard Shipping"
  const url = trackingUrl.toLowerCase()
  if (url.includes("dhl.com") || url.includes("dhlglobalmail.com")) return "DHL Express"
  if (url.includes("fedex.com")) return "FedEx"
  if (url.includes("usps.com")) return "USPS"
  if (url.includes("shipglobal.in")) return "Ship Global"
  return "Standard Carrier"
}

// Server action moved to actions.ts to support client component interactivity

export default async function OrderDetailPage({ params }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { id } = await params

  const { createServiceClient } = await import("@/lib/supabase/service")
  const serviceClient = createServiceClient()

  const orderFilter = user.email
    ? `user_id.eq.${user.id},customer_email.ilike.${user.email.trim()}`
    : `user_id.eq.${user.id}`

  const { data: order } = await serviceClient
    .from("orders")
    .select(
      `
      id, order_number, notes, status, total_usd, created_at, shipping_address, customer_name, tracking_number, tracking_url,
      cancellation_requested, cancellation_request_status, customer_cancellation_reason, cancellation_rejection_reason,
      order_items (
        id, quantity, unit_price_usd,
        products ( name, slug, ships_from_usa, images:product_images ( url, is_hero ) )
      )
    `
    )
    .eq("id", id)
    .or(orderFilter)
    .single()

  if (!order) redirect("/account/orders")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? "Customer"
  const displayEmail = profile?.email ?? user.email ?? ""

  const status = (order.status ?? "confirmed") as OrderStatus
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.confirmed
  const displayId = order.order_number ?? order.id.slice(0, 8).toUpperCase()
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const currentStepIndex = TIMELINE_STEPS.indexOf(status)
  const isCancelled = status === "cancelled"

  type OrderItem = {
    id: string
    quantity: number
    unit_price_usd: number
    products: { name: string; slug: string; ships_from_usa?: boolean; images: { url: string; is_hero: boolean }[] } | null
  }

  const items = (order.order_items ?? []) as unknown as OrderItem[]

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price_usd * item.quantity,
    0
  )
  const shipping = (order.total_usd ?? 0) - subtotal

  const shippingAddress =
    order.shipping_address as {
      full_name?: string
      address_line1?: string
      address_line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
      address1?: string
      address2?: string
      postalCode?: string
    } | null

  const hasUsWarehouseItem = items.some((item: any) => item.products?.ships_from_usa)

  let standardDaysFromRate: string | null = null
  if (shippingAddress?.country) {
    const { data: rate } = await serviceClient
      .from("shipping_rates")
      .select("standard_days")
      .eq("country_name", shippingAddress.country)
      .maybeSingle()

    if (rate?.standard_days) {
      standardDaysFromRate = rate.standard_days
    } else {
      const { data: fallback } = await serviceClient
        .from("shipping_rates")
        .select("standard_days")
        .eq("country_code", "OTHER")
        .maybeSingle()
      if (fallback?.standard_days) standardDaysFromRate = fallback.standard_days
    }
  }

  const { computeShippingInfo } = await import("@/lib/shipping-utils")
  const shippingInfo = computeShippingInfo({
    createdAtStr: order.created_at,
    shippingUsd: (order.total_usd ?? 0) - subtotal,
    notes: (order as any).notes,
    standardDaysFromRate,
    hasUsWarehouseItem,
  })

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

          {/* Order Detail */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Link
                    href="/account/orders"
                    className="text-xs font-sans text-khaki hover:text-leather transition-colors mb-2 inline-block"
                  >
                    ← Back to Orders
                  </Link>
                  <h2 className="font-heading text-xl text-leather-dark uppercase font-black">
                    Order #{displayId}
                  </h2>
                  <p className="text-xs font-sans text-leather-dark/60 mt-0.5">Placed on {date}</p>
                </div>
                <span
                  className={`self-start sm:self-auto inline-flex px-3 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider ${statusStyle}`}
                >
                  {status}
                </span>
              </div>
              
              {/* Delivery Option & Estimated Arrival Box */}
              <div className="bg-parchment-dark/30 border border-khaki/30 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-leather-dark">
                <div className="space-y-1">
                  <span className="text-[10px] text-khaki uppercase font-bold tracking-wider block">Selected Shipping Option</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                    shippingInfo.isExpress
                      ? "bg-[#1D70B8]/10 text-[#1D70B8] border-[#1D70B8]/30"
                      : "bg-amber-500/10 text-amber-900 border-amber-500/30"
                  }`}>
                    {shippingInfo.shippingLabel}
                  </span>
                </div>
                <div className="sm:text-right space-y-0.5">
                  <span className="text-[10px] text-khaki uppercase font-bold tracking-wider block">Estimated Delivery Window</span>
                  <span className="font-bold text-sm text-leather-dark block">{shippingInfo.estimatedDeliveryWindow}</span>
                </div>
              </div>
            </div>

            {/* Rejection Alert Notice if Cancellation Request was Rejected */}
            {order.cancellation_request_status === "rejected" && !isCancelled && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 text-xs font-sans rounded-sm space-y-1">
                <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                  ⚠️ Cancellation Request Update
                </p>
                <p>
                  Your cancellation request was reviewed by our workshop management team and could not be approved for the following reason:
                </p>
                <p className="italic bg-amber-100/60 p-2.5 border-l-2 border-amber-600 font-medium">
                  "{order.cancellation_rejection_reason || "Order has already entered fulfillment and carrier dispatch."}"
                </p>
                <p className="pt-1 text-[11px] text-amber-700 font-semibold">
                  Standard order processing and carrier delivery are continuing normally below.
                </p>
              </div>
            )}

            {/* Dynamic Enterprise Order Progress Timeline */}
            {(() => {
              let steps: { label: string; state: "completed" | "active" | "pending" }[] = []
              let headerText = "Order Progress"

              if (order.cancellation_requested && order.cancellation_request_status === "pending") {
                headerText = "Order Progress — Cancellation Request Under Review"
                steps = [
                  { label: "Confirmed", state: "completed" },
                  { label: "Cancellation Requested", state: "active" },
                  { label: "Review & Refund", state: "pending" },
                ]
              } else if (status === "cancelled" || order.cancellation_request_status === "accepted") {
                headerText = "Order Progress — Cancelled & Refunded"
                steps = [
                  { label: "Confirmed", state: "completed" },
                  { label: "Cancellation Requested", state: "completed" },
                  { label: "Cancelled & Refunded", state: "completed" },
                ]
              } else {
                const activeIdx = status === "delivered" ? 2 : status === "shipped" ? 1 : 0
                steps = [
                  { label: "Confirmed", state: activeIdx > 0 ? "completed" : "active" },
                  { label: "Shipped", state: activeIdx > 1 ? "completed" : activeIdx === 1 ? "active" : "pending" },
                  { label: "Delivered", state: activeIdx === 2 ? "completed" : "pending" },
                ]
              }

              return (
                <div className="bg-canvas border border-khaki/30 rounded-sm p-6 shadow-xs">
                  <h3 className="font-heading text-sm text-leather-dark uppercase font-black mb-5">
                    {headerText}
                  </h3>
                  <div className="flex items-center gap-0">
                    {steps.map((step, index) => {
                      const isCompleted = step.state === "completed"
                      const isActive = step.state === "active"
                      const isLast = index === steps.length - 1

                      return (
                        <div key={step.label} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                isCompleted
                                  ? "bg-leather text-parchment shadow-xs scale-100"
                                  : isActive
                                  ? "bg-amber-600 text-white shadow-md animate-pulse ring-4 ring-amber-500/20 scale-105"
                                  : "bg-khaki/20 text-khaki border border-khaki/30 scale-95"
                              }`}
                            >
                              {isCompleted ? "✓" : isActive ? "⌛" : index + 1}
                            </div>
                            <span
                              className={`mt-2 text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                                isCompleted
                                  ? "text-leather"
                                  : isActive
                                  ? "text-amber-800 font-extrabold"
                                  : "text-khaki"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {!isLast && (
                            <div
                              className={`flex-1 h-0.5 mx-1.5 mb-5 transition-all duration-500 ${
                                isCompleted ? "bg-leather" : "bg-khaki/30"
                              }`}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Shipment Tracking Card */}
            {(status === "shipped" || status === "delivered") && (
              <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 bg-olive rounded-full" />
                  <h3 className="font-heading text-sm text-leather-dark uppercase font-black">
                    Shipment Tracking
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2 text-sm font-sans text-leather-dark">
                    <p>
                      <span className="text-khaki uppercase tracking-wide text-xs block font-semibold mb-0.5">Shipping Partner</span>
                      <strong className="text-leather-dark font-bold text-base">{getCarrierName(order.tracking_url)}</strong>
                    </p>
                    <p>
                      <span className="text-khaki uppercase tracking-wide text-xs block font-semibold mb-0.5">Tracking Number</span>
                      <code className="bg-parchment-dark/50 px-2 py-1 rounded text-xs font-mono border border-khaki/20">{order.tracking_number ?? "Pending Assignment"}</code>
                    </p>
                    {status === "shipped" && (
                      <p className="text-xs text-khaki italic mt-2">
                        Your package is on its way. Estimated delivery window: <strong>{shippingInfo.estimatedDeliveryWindow}</strong> ({shippingInfo.daysText} business days).
                      </p>
                    )}
                  </div>
                  {order.tracking_url && (
                    <div className="flex justify-start md:justify-end">
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-olive text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.12em] px-8 py-3.5 hover:bg-olive-light transition-colors shadow-sm"
                      >
                        Track Package &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancel Order Action */}
            {!isCancelled && ["pending", "confirmed", "processing"].includes(status) && (
              <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
                <h3 className="font-heading text-sm text-leather-dark uppercase font-black mb-2">
                  Order Actions
                </h3>
                <p className="text-xs font-sans text-leather-dark/70 mb-4 leading-relaxed">
                  You can cancel this order at any time before it is shipped. Once shipped, cancellations are no longer permitted and standard return policies will apply.
                </p>
                <CancelOrderButton
                  orderId={order.id}
                  cancellationRequested={order.cancellation_requested}
                  cancellationRequestStatus={order.cancellation_request_status}
                />
              </div>
            )}

            {/* Help / Contact Us Redirection */}
            {!isCancelled && ["shipped", "delivered"].includes(status) && (
              <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
                <h3 className="font-heading text-sm text-leather-dark uppercase font-black mb-2">
                  Need Assistance?
                </h3>
                <p className="text-xs font-sans text-leather-dark/70 leading-relaxed">
                  This order has already shipped and cannot be cancelled directly. If you need to make changes, return items, or have inquiries, please contact our customer support team at{" "}
                  <a href="mailto:warcraftexports@gmail.com" className="text-leather hover:underline font-semibold">
                    warcraftexports@gmail.com
                  </a>{" "}
                  or fill out our{" "}
                  <Link href="/contact" className="text-leather hover:underline font-semibold">
                    Contact Us form
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* Items */}
            <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
              <h3 className="font-heading text-sm text-leather-dark uppercase font-black mb-5">
                Items Ordered
              </h3>
              <div className="flex flex-col divide-y divide-khaki/20">
                {items.map((item) => {
                  const product = item.products
                  const imgObj = product?.images?.find((i) => i.is_hero) ?? product?.images?.[0]
                  const imageUrl = imgObj?.url ?? null

                  return (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 flex-shrink-0 bg-khaki/10 rounded-sm overflow-hidden border border-khaki/20">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product?.name ?? "Product image"}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-khaki/40 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {product?.slug ? (
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-sans font-semibold text-sm text-leather-dark hover:text-leather transition-colors line-clamp-2"
                          >
                            {product.name}
                          </Link>
                        ) : (
                          <p className="font-sans font-semibold text-sm text-leather-dark line-clamp-2">
                            {product?.name ?? "Unknown Product"}
                          </p>
                        )}
                        <p className="text-xs font-sans text-khaki mt-1">
                          Qty: {item.quantity} × ${item.unit_price_usd.toFixed(2)}
                        </p>
                        {product?.ships_from_usa && (
                          <div className="bg-[#1D70B8]/10 border border-[#1D70B8]/20 px-3 py-1.5 flex items-center gap-2.5 text-leather-dark text-[12px] font-sans rounded-xs mt-2 w-fit">
                            <img src="/images/us-flag.png" alt="USA Flag" className="w-4 h-3 object-cover shrink-0" />
                            <span className="font-bold text-[#1D70B8] uppercase text-[11px]">Ships from USA — Stocked in US Warehouse</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-sans font-semibold text-sm text-leather-dark">
                          ${(item.unit_price_usd * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="mt-5 pt-4 border-t border-khaki/30 space-y-2">
                <div className="flex justify-between text-xs font-sans text-leather-dark/70">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {shipping !== 0 && (
                  <div className="flex justify-between text-xs font-sans text-leather-dark/70">
                    <span>Shipping</span>
                    <span>{shipping <= 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-sans font-bold text-leather-dark pt-2 border-t border-khaki/20">
                  <span>Total</span>
                  <span>${(order.total_usd ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {shippingAddress && (
              <div className="bg-canvas border border-khaki/30 rounded-sm p-6">
                <h3 className="font-heading text-sm text-leather-dark uppercase font-black mb-4">
                  Shipping Address
                </h3>
                <address className="not-italic font-sans text-sm text-leather-dark/80 space-y-0.5">
                  <p className="font-semibold">{shippingAddress.full_name || order?.customer_name || displayName}</p>
                  <p>{shippingAddress.address_line1 || shippingAddress.address1}</p>
                  {(shippingAddress.address_line2 || shippingAddress.address2) && (
                    <p>{shippingAddress.address_line2 || shippingAddress.address2}</p>
                  )}
                  <p>
                    {[
                      shippingAddress.city,
                      shippingAddress.state,
                      shippingAddress.postal_code || shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </address>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
