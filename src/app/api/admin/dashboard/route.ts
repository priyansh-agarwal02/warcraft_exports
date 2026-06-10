import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { CURRENCIES } from "@/lib/currency"

export const dynamic = "force-dynamic"

function getDateRange(range: string, from?: string, to?: string) {
  const now = new Date()
  let start: Date
  let end: Date = now

  switch (range) {
    case "7d":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "90d":
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case "custom":
      start = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      end = to ? new Date(to) : now
      break
    case "30d":
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
  }

  return { start, end, days: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) }
}

function buildDailyBuckets(start: Date, days: number): Record<string, number> {
  const buckets: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start)
    d.setDate(d.getDate() + i + 1)
    const label = d.toISOString().slice(0, 10)
    buckets[label] = 0
  }
  return buckets
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") ?? "30d"
  const fromParam = searchParams.get("from") ?? undefined
  const toParam = searchParams.get("to") ?? undefined

  const { start, end, days } = getDateRange(range, fromParam, toParam)
  const startISO = start.toISOString()
  const endISO = end.toISOString()

  const supabase = createServiceClient()

  // Parallel data fetching
  const [
    { data: allOrders },
    { data: rangeOrders },
    { count: pendingOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { count: lowStockCount },
    { data: rangeCustomers },
    { data: byNation },
    { data: byCategory },
    { data: latestOrders },
    { data: lowStockProducts },
    { data: wholesaleInquiries },
    { data: activeCoupons },
    { data: activeQtyPromos },
    { data: statusBreakdownData },
  ] = await Promise.all([
    // All-time revenue (for Total Revenue card)
    supabase.from("orders").select("total_usd").neq("status", "cancelled").neq("status", "refunded"),
    // Range orders for charts
    supabase.from("orders").select("id, total_usd, display_currency, status, created_at")
      .gte("created_at", startISO).lte("created_at", endISO)
      .neq("status", "cancelled").neq("status", "refunded"),
    // Pending orders count
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    // Total customers
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    // Active products
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    // Low stock
    supabase.from("products").select("*", { count: "exact", head: true })
      .eq("is_active", true).gt("stock_quantity", 0).lte("stock_quantity", 5),
    // Customer registrations in range
    supabase.from("profiles").select("created_at")
      .gte("created_at", startISO).lte("created_at", endISO),
    // By nation
    supabase.from("products").select("nation").eq("is_active", true),
    // By category
    supabase.from("products").select("product_categories(category:categories(name, slug))").eq("is_active", true),
    // Latest orders feed
    supabase.from("orders").select("id, order_number, guest_email, user_id, status, total_usd, created_at")
      .order("created_at", { ascending: false }).limit(8),
    // Low stock products
    supabase.from("products")
      .select("id, name, sku, stock_quantity, low_stock_threshold, images:product_images(url, is_hero)")
      .eq("is_active", true).gt("stock_quantity", 0).lte("stock_quantity", 5)
      .order("stock_quantity", { ascending: true }).limit(5),
    // Wholesale inquiries count (in range)
    supabase.from("wholesale_inquiries").select("id, created_at")
      .gte("created_at", startISO).lte("created_at", endISO),
    // Active coupons
    supabase.from("coupons").select("id, code, type, value, is_active, expires_at").eq("is_active", true),
    // Active quantity promotions
    (() => {
      try {
        return supabase.from("quantity_promotions")
          .select("id, name, discount_percent, min_quantity, is_active")
          .eq("is_active", true)
      } catch {
        return Promise.resolve({ data: [] as any[] })
      }
    })(),
    // Order status breakdown (all time)
    supabase.from("orders").select("status"),
  ])

  // Aggregate total revenue (all time)
  const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total_usd), 0) ?? 0

  // Orders today
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const ordersToday = rangeOrders?.filter(o => new Date(o.created_at) >= startOfToday).length ?? 0

  // Total orders in range
  const totalOrdersInRange = rangeOrders?.length ?? 0

  // Daily revenue + daily orders
  const revenueBuckets = buildDailyBuckets(start, days)
  const orderBuckets = buildDailyBuckets(start, days)
  rangeOrders?.forEach((o) => {
    const day = new Date(o.created_at).toISOString().slice(0, 10)
    if (revenueBuckets[day] !== undefined) {
      revenueBuckets[day] += Number(o.total_usd)
    }
    if (orderBuckets[day] !== undefined) {
      orderBuckets[day] += 1
    }
  })

  const dailyRevenue = Object.entries(revenueBuckets).map(([date, amount]) => ({
    date,
    amount: Math.round(amount * 100) / 100,
  }))
  const dailyOrders = Object.entries(orderBuckets).map(([date, count]) => ({
    date,
    count,
    revenue: revenueBuckets[date] ?? 0,
  }))

  // Revenue by currency
  const currencyTotals: Record<string, number> = {}
  rangeOrders?.forEach((o) => {
    const cur = o.display_currency || "USD"
    currencyTotals[cur] = (currencyTotals[cur] || 0) + Number(o.total_usd)
  })
  const revenueByCurrency = Object.entries(currencyTotals)
    .map(([currency, amount]) => {
      const info = CURRENCIES.find(c => c.code === currency)
      return { currency, amount: Math.round(amount * 100) / 100, symbol: info?.symbol ?? "$" }
    })
    .sort((a, b) => b.amount - a.amount)

  // Order status breakdown
  const statusCounts: Record<string, number> = {}
  statusBreakdownData?.forEach((o: any) => {
    const s = o.status || "confirmed"
    statusCounts[s] = (statusCounts[s] || 0) + 1
  })
  const orderStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // Customer registrations daily
  const custBuckets = buildDailyBuckets(start, days)
  rangeCustomers?.forEach((c) => {
    const day = new Date(c.created_at).toISOString().slice(0, 10)
    if (custBuckets[day] !== undefined) {
      custBuckets[day] += 1
    }
  })
  const customerRegistrations = Object.entries(custBuckets).map(([date, count]) => ({ date, count }))

  // Nation distribution
  const nationCounts: Record<string, number> = {}
  byNation?.forEach((r: any) => {
    if (r.nation) nationCounts[r.nation] = (nationCounts[r.nation] || 0) + 1
  })

  // Category distribution
  const catCounts: Record<string, number> = {}
  byCategory?.forEach((r: any) => {
    const categories = r.product_categories?.map((pc: any) => pc.category).filter(Boolean) || []
    categories.forEach((cat: any) => {
      if (cat?.name) catCounts[cat.name] = (catCounts[cat.name] || 0) + 1
    })
  })

  // Promotions list
  const promotionsList = [
    ...(activeCoupons ?? []).map((c: any) => ({
      id: c.id,
      name: c.code,
      type: "coupon" as const,
      detail: c.type === "percent" ? `${c.value}% off` : `$${c.value} off`,
    })),
    ...(activeQtyPromos ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: "quantity" as const,
      detail: `Buy ${p.min_quantity}+ → ${p.discount_percent}% off`,
    })),
  ]

  const response = {
    stats: {
      totalRevenue,
      totalOrders: totalOrdersInRange,
      ordersToday,
      confirmedOrders: pendingOrders ?? 0,
      totalCustomers: totalCustomers ?? 0,
      totalProducts: totalProducts ?? 0,
      lowStockAlerts: lowStockCount ?? 0,
      wholesaleInquiries: wholesaleInquiries?.length ?? 0,
      activePromotions: promotionsList.length,
    },
    charts: {
      dailyOrders,
      orderStatusBreakdown,
      revenueByDay: dailyRevenue,
      customerRegistrations,
      revenueByCurrency,
    },
    feeds: {
      latestOrders: latestOrders ?? [],
      lowStockProducts: lowStockProducts ?? [],
    },
    byNation: Object.entries(nationCounts).sort((a, b) => b[1] - a[1]),
    byCategory: Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
    promotionsList,
    lastUpdated: new Date().toISOString(),
    range,
    days,
  }

  console.log("api/admin/dashboard totalCustomers:", totalCustomers)
  return NextResponse.json(response)
}
