import { createServiceClient } from "@/lib/supabase/service"
import { CURRENCIES } from "@/lib/currency"
import { DashboardClient } from "@/components/admin/dashboard/DashboardClient"

export const dynamic = "force-dynamic"

export const metadata = { title: "Command Center — Warcraft Exports Admin" }

// ─── Server-side data fetching ──────────────────────────────────────────────

async function getInitialDashboardData() {
  const supabase = createServiceClient()
  const now = new Date()
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const startISO = start.toISOString()
  const endISO = now.toISOString()
  const days = 30

  // Build daily buckets
  function buildDailyBuckets(): Record<string, number> {
    const buckets: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(start)
      d.setDate(d.getDate() + i + 1)
      buckets[d.toISOString().slice(0, 10)] = 0
    }
    return buckets
  }

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
    { data: statusBreakdownData },
  ] = await Promise.all([
    supabase.from("orders").select("total_usd").neq("status", "cancelled").neq("status", "refunded"),
    supabase.from("orders").select("id, total_usd, display_currency, status, created_at")
      .gte("created_at", startISO).lte("created_at", endISO)
      .neq("status", "cancelled").neq("status", "refunded"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("*", { count: "exact", head: true })
      .eq("is_active", true).gt("stock_quantity", 0).lte("stock_quantity", 5),
    supabase.from("profiles").select("created_at")
      .gte("created_at", startISO).lte("created_at", endISO),
    supabase.from("products").select("nation").eq("is_active", true),
    supabase.from("products").select("product_categories(category:categories(name, slug))").eq("is_active", true),
    supabase.from("orders").select("id, order_number, guest_email, user_id, status, total_usd, created_at")
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("products")
      .select("id, name, sku, stock_quantity, low_stock_threshold, images:product_images(url, is_hero)")
      .eq("is_active", true).gt("stock_quantity", 0).lte("stock_quantity", 5)
      .order("stock_quantity", { ascending: true }).limit(5),
    supabase.from("wholesale_inquiries").select("id, created_at")
      .gte("created_at", startISO).lte("created_at", endISO),
    supabase.from("coupons").select("id, code, type, value, is_active, expires_at").eq("is_active", true),
    supabase.from("orders").select("status"),
  ])

  // Active quantity promotions (graceful if table missing)
  let activeQtyPromos: any[] = []
  try {
    const { data } = await supabase.from("quantity_promotions")
      .select("id, name, discount_percent, min_quantity, is_active")
      .eq("is_active", true)
    activeQtyPromos = data ?? []
  } catch {
    // Table not created yet
  }

  // Aggregate total revenue
  const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total_usd), 0) ?? 0

  // Orders today
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const ordersToday = rangeOrders?.filter(o => new Date(o.created_at) >= startOfToday).length ?? 0

  // Daily revenue + orders
  const revenueBuckets = buildDailyBuckets()
  const orderBuckets = buildDailyBuckets()
  rangeOrders?.forEach((o) => {
    const day = new Date(o.created_at).toISOString().slice(0, 10)
    if (revenueBuckets[day] !== undefined) revenueBuckets[day] += Number(o.total_usd)
    if (orderBuckets[day] !== undefined) orderBuckets[day] += 1
  })

  const dailyRevenue = Object.entries(revenueBuckets).map(([date, amount]) => ({
    date, amount: Math.round(amount * 100) / 100,
  }))
  const dailyOrders = Object.entries(orderBuckets).map(([date, count]) => ({
    date, count, revenue: revenueBuckets[date] ?? 0,
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

  // Customer registrations
  const custBuckets = buildDailyBuckets()
  rangeCustomers?.forEach((c) => {
    const day = new Date(c.created_at).toISOString().slice(0, 10)
    if (custBuckets[day] !== undefined) custBuckets[day] += 1
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
      id: c.id, name: c.code, type: "coupon" as const,
      detail: c.type === "percent" ? `${c.value}% off` : `$${c.value} off`,
    })),
    ...activeQtyPromos.map((p: any) => ({
      id: p.id, name: p.name, type: "quantity" as const,
      detail: `Buy ${p.min_quantity}+ → ${p.discount_percent}% off`,
    })),
  ]

  console.log("getInitialDashboardData totalCustomers:", totalCustomers)
  return {
    stats: {
      totalRevenue,
      totalOrders: rangeOrders?.length ?? 0,
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
    byNation: Object.entries(nationCounts).sort((a, b) => b[1] - a[1]) as [string, number][],
    byCategory: Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8) as [string, number][],
    promotionsList,
    lastUpdated: new Date().toISOString(),
    range: "30d",
    days: 30,
  }
}

async function getInitialAnalytics() {
  // Server-side initial analytics — try PostHog, fallback to empty
  const posthogKey = process.env.POSTHOG_PERSONAL_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"
  const now = new Date()
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const days = 30

  const emptyBuckets: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start)
    d.setDate(d.getDate() + i + 1)
    emptyBuckets.push({ date: d.toISOString().slice(0, 10), count: 0 })
  }

  if (posthogKey) {
    try {
      let projectId = "@current"
      
      // Personal API keys (phx_...) require resolving the project ID dynamically as @current is only for project-specific keys
      if (posthogKey.startsWith("phx_")) {
        try {
          const projectListRes = await fetch(`${posthogHost}/api/projects/`, {
            headers: {
              "Authorization": `Bearer ${posthogKey}`,
            },
          })
          if (projectListRes.ok) {
            const projects = await projectListRes.json()
            if (projects.results && projects.results.length > 0) {
              projectId = projects.results[0].id
            }
          }
        } catch (err) {
          console.error("[Initial Analytics] Failed to resolve PostHog project ID:", err)
        }
      }

      const res = await fetch(`${posthogHost}/api/projects/${projectId}/query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${posthogKey}`,
        },
        body: JSON.stringify({
          query: {
            kind: "EventsQuery",
            select: ["count()", "toDate(timestamp)"],
            event: "$pageview",
            after: start.toISOString(),
            before: now.toISOString(),
            orderBy: ["toDate(timestamp) ASC"],
          },
        }),
        next: { revalidate: 300 },
      })

      if (res.ok) {
        const data = await res.json()
        const pageviewsByDay: Record<string, number> = {}
        emptyBuckets.forEach(b => { pageviewsByDay[b.date] = 0 })

        if (data.results) {
          data.results.forEach((row: any[]) => {
            if (row.length >= 2) {
              const count = Number(row[0]) || 0
              const date = String(row[1]).slice(0, 10)
              if (pageviewsByDay[date] !== undefined) pageviewsByDay[date] = count
            }
          })
        }

        const pageviews = Object.entries(pageviewsByDay).map(([date, count]) => ({ date, count }))
        const totalPageviews = pageviews.reduce((sum, p) => sum + p.count, 0)

        return {
          pageviews,
          visitors: pageviews.map(p => ({ date: p.date, count: Math.ceil(p.count * 0.65) })),
          totalPageviews,
          totalVisitors: Math.ceil(totalPageviews * 0.65),
          source: "posthog" as const,
        }
      }
    } catch (err) {
      console.error("[Initial Analytics] PostHog query failed:", err)
    }
  }

  return {
    pageviews: emptyBuckets,
    visitors: emptyBuckets,
    totalPageviews: 0,
    totalVisitors: 0,
    source: "none" as const,
  }
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const [dashboardData, analyticsData] = await Promise.all([
    getInitialDashboardData(),
    getInitialAnalytics(),
  ])

  return (
    <DashboardClient
      initialData={dashboardData}
      initialAnalytics={analyticsData}
    />
  )
}
