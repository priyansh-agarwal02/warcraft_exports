"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  DollarSign, ShoppingCart, Clock, Package, AlertTriangle, Users,
  ExternalLink, ChevronRight, Inbox,
} from "lucide-react"

import { MetricCard } from "./MetricCard"
import { DateRangePicker, type DateRange } from "./DateRangePicker"
import { RevenueChart } from "./RevenueChart"
import { OrdersLineChart } from "./OrdersLineChart"
import { OrderStatusDonut } from "./OrderStatusDonut"
import { CustomerVisitsChart } from "./CustomerVisitsChart"
import { CurrencyRevenueChart } from "./CurrencyRevenueChart"
import { RegisteredCustomersChart } from "./RegisteredCustomersChart"
import { ConversionRate } from "./ConversionRate"
import { ActivePromotions } from "./ActivePromotions"
import { OrderStatusSelect } from "@/app/admin/order-status-select"

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardData {
  stats: {
    totalRevenue: number
    totalOrders: number
    ordersToday: number
    confirmedOrders: number
    totalCustomers: number
    totalProducts: number
    lowStockAlerts: number
    wholesaleInquiries: number
    activePromotions: number
  }
  charts: {
    dailyOrders: { date: string; count: number; revenue: number }[]
    orderStatusBreakdown: { status: string; count: number }[]
    revenueByDay: { date: string; amount: number }[]
    customerRegistrations: { date: string; count: number }[]
    revenueByCurrency: { currency: string; amount: number; symbol: string }[]
  }
  feeds: {
    latestOrders: any[]
    lowStockProducts: any[]
  }
  byNation: [string, number][]
  byCategory: [string, number][]
  promotionsList: { id: string; name: string; type: "coupon" | "quantity"; detail: string }[]
  lastUpdated: string
  range: string
  days: number
}

interface AnalyticsData {
  pageviews: { date: string; count: number }[]
  visitors: { date: string; count: number }[]
  totalPageviews: number
  totalVisitors: number
  source?: string
}

interface DashboardClientProps {
  initialData: DashboardData
  initialAnalytics: AnalyticsData
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DashboardClient({ initialData, initialAnalytics }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics)
  const [dateRange, setDateRange] = useState<DateRange>((initialData.range as DateRange) || "30d")
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(initialData.lastUpdated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async (range: DateRange, from?: string, to?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ range })
      if (from) params.set("from", from)
      if (to) params.set("to", to)

      const [dashRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/dashboard?${params.toString()}`),
        fetch(`/api/admin/analytics?${params.toString()}`),
      ])

      if (dashRes.ok) {
        const newData = await dashRes.json()
        setData(newData)
        setLastUpdated(newData.lastUpdated)
      }

      if (analyticsRes.ok) {
        const newAnalytics = await analyticsRes.json()
        setAnalytics(newAnalytics)
      }
    } catch (err) {
      console.error("Failed to refresh dashboard:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDateChange = useCallback((range: DateRange, from?: string, to?: string) => {
    setDateRange(range)
    fetchData(range, from, to)
  }, [fetchData])

  // Metric cards configuration
  const metricCards = [
    { label: "Total Revenue", value: data.stats.totalRevenue, icon: DollarSign, href: "/admin/orders", color: "border-l-4 border-l-green-600 bg-white", isCurrency: true },
    { label: "Total Orders", value: data.stats.totalOrders, icon: ShoppingCart, href: "/admin/orders", color: "border-l-4 border-l-[#33450D] bg-white" },
    { label: "Registered Users", value: data.stats.totalCustomers, icon: Users, href: "/admin/customers", color: "border-l-4 border-l-[#BBAC48] bg-white" },
    { label: "Active Products", value: data.stats.totalProducts, icon: Package, href: "/admin/products", color: "border-l-4 border-l-[#33450D] bg-white" },
    { label: "Low Stock Items", value: data.stats.lowStockAlerts, icon: AlertTriangle, href: "/admin/products?filter=low_stock", color: "border-l-4 border-l-red-500 bg-white", isWarning: data.stats.lowStockAlerts > 0 },
    { label: "B2B Inquiries", value: data.stats.wholesaleInquiries, icon: Inbox, href: "/admin/b2b", color: "border-l-4 border-l-purple-500 bg-white" },
  ]

  return (
    <div className="p-8 space-y-8 bg-[#FAF9F6]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Command Center</h1>
          <p className="text-[13px] font-sans text-[#71717A] mt-0.5">
            Real-time stats, charts, and order feed
            <span className="text-[#A1A1AA] ml-2">
              · Last updated: {mounted ? new Date(lastUpdated).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border border-[#E4E4E7] px-4 py-2 hover:bg-white transition-all">
            View Live Store
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* ── Date Range Picker ──────────────────────────────────────────── */}
      <DateRangePicker
        value={dateRange}
        onChange={handleDateChange}
        loading={loading}
      />

      {/* ── Metric Cards Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, i) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            href={card.href}
            color={card.color}
            isWarning={card.isWarning}
            isCurrency={card.isCurrency}
            index={i}
          />
        ))}
      </div>

      {/* ── Primary Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E4E4E7] p-6 shadow-sm">
          {mounted ? (
            <RevenueChart data={data.charts.revenueByDay} />
          ) : (
            <div className="h-[280px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
              <div className="text-center font-sans text-xs text-[#A1A1AA]">Loading Revenue...</div>
            </div>
          )}
        </div>

        {/* Order Status Donut */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          {mounted ? (
            <OrderStatusDonut data={data.charts.orderStatusBreakdown} />
          ) : (
            <div className="h-[220px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
              <div className="text-center font-sans text-xs text-[#A1A1AA]">Loading status breakdown...</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Secondary Charts Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Line Chart */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          {mounted ? (
            <OrdersLineChart data={data.charts.dailyOrders} />
          ) : (
            <div className="h-[220px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
              <div className="text-center font-sans text-xs text-[#A1A1AA]">Loading orders...</div>
            </div>
          )}
        </div>

        {/* Customer Visits Chart */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          {mounted ? (
            <CustomerVisitsChart
              pageviews={analytics.pageviews}
              visitors={analytics.visitors}
              totalPageviews={analytics.totalPageviews}
              totalVisitors={analytics.totalVisitors}
              source={analytics.source}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
              <div className="text-center font-sans text-xs text-[#A1A1AA]">Loading visits...</div>
            </div>
          )}
        </div>

        {/* Registered Customers Chart */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          {mounted ? (
            <RegisteredCustomersChart
              data={data.charts.customerRegistrations}
              totalCustomers={data.stats.totalCustomers}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
              <div className="text-center font-sans text-xs text-[#A1A1AA]">Loading registered users...</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue by Currency + Conversion + Promotions ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Revenue Chart */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          {mounted ? (
            <CurrencyRevenueChart data={data.charts.revenueByCurrency} />
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
              <div className="text-center font-sans text-xs text-[#A1A1AA]">Loading currency split...</div>
            </div>
          )}
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <ConversionRate
            totalOrders={data.stats.totalOrders}
            totalPageviews={analytics.totalPageviews}
          />
        </div>

        {/* Active Promotions */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <ActivePromotions
            count={data.stats.activePromotions}
            promotions={data.promotionsList}
          />
        </div>
      </div>

      {/* ── Recent Orders & Low Stock ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Feed */}
        <div className="lg:col-span-2 bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] font-sans">
              <thead>
                <tr className="border-b border-[#E4E4E7] text-[#71717A] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5 text-right">Total</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right w-36">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4]">
                {data.feeds.latestOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-[#FAF9F6]/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#18181B]">{order.order_number}</td>
                    <td className="py-3 text-[#71717A] truncate max-w-[120px]" title={order.guest_email}>{order.guest_email || "Customer"}</td>
                    <td className="py-3 text-right font-bold text-[#18181B]">${Number(order.total_usd).toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                        order.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-zinc-100 text-zinc-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B] flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500 animate-bounce" />
                Low Stock Alerts
              </h2>
              <Link href="/admin/products?filter=low_stock" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
                Manage
              </Link>
            </div>

            {data.feeds.lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-[#A1A1AA] text-[12px] font-sans">
                All products well stocked ✓
              </div>
            ) : (
              <div className="divide-y divide-[#F4F4F4]">
                {data.feeds.lowStockProducts.map((p: any) => {
                  const img = p.images?.find((i: any) => i.is_hero)?.url ?? p.images?.[0]?.url
                  return (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-[12px] font-sans">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {img ? (
                          <img src={img} alt="" className="w-8 h-8 object-cover bg-[#F4F4F4] border border-[#E4E4E7]" />
                        ) : (
                          <div className="w-8 h-8 bg-[#F4F4F4] border border-[#E4E4E7]" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#18181B] truncate">{p.name}</p>
                          <p className="text-[10px] text-[#A1A1AA] font-mono">{p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded text-[11px]">
                          {p.stock_quantity} left
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <Link href="/admin/products?filter=low_stock" className="block text-center border border-[#E4E4E7] py-2 text-[11px] font-sans font-bold uppercase tracking-wider text-[#18181B] hover:bg-[#FAF9F6] transition-colors mt-4">
            View All Stock Alerts
          </Link>
        </div>
      </div>

      {/* ── Catalog Distribution & Quick Management ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog Distribution */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col gap-6">
          {/* By Nation */}
          <div>
            <h3 className="font-heading text-[14px] uppercase tracking-wide text-[#18181B] mb-3">Products by Nation</h3>
            <div className="space-y-2.5">
              {data.byNation.map(([nation, count]) => (
                <div key={nation} className="flex items-center justify-between gap-3 text-[12px] font-sans">
                  <span className="font-medium text-[#18181B] w-20">{nation}</span>
                  <div className="flex-1 bg-[#F4F4F4] h-1.5">
                    <div
                      className="bg-[#33450D] h-1.5 transition-all duration-500"
                      style={{ width: `${(count / data.stats.totalProducts) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#71717A] font-bold w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Category */}
          <div>
            <h3 className="font-heading text-[14px] uppercase tracking-wide text-[#18181B] mb-3">Top Categories</h3>
            <div className="space-y-2.5">
              {data.byCategory.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between gap-3 text-[12px] font-sans">
                  <span className="font-medium text-[#18181B] truncate flex-1">{cat}</span>
                  <div className="w-24 bg-[#F4F4F4] h-1.5">
                    <div
                      className="bg-[#BBAC48] h-1.5 transition-all duration-500"
                      style={{ width: `${(count / data.stats.totalProducts) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#71717A] font-bold w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Management */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B] mb-4">Quick Management</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Product", href: "/admin/products/new", desc: "Add single catalog item" },
              { label: "Manage Orders", href: "/admin/orders", desc: "View & ship orders" },
              { label: "Run Catalog Sale", href: "/admin/sale", desc: "Setup active sale prices" },
              { label: "Coupons & Promos", href: "/admin/promotions", desc: "Setup custom coupon tier" },
              { label: "B2B Inquiries", href: "/admin/b2b", desc: "View wholesale requests" },
              { label: "Subscribers", href: "/admin/subscribers", desc: "Email subscriber list" },
            ].map((btn) => (
              <Link key={btn.label} href={btn.href} className="border border-[#E4E4E7] p-3 text-left hover:border-[#33450D] hover:bg-[#FAF9F6] transition-all group">
                <span className="font-sans font-bold text-[12px] text-[#18181B] group-hover:text-[#33450D] flex items-center justify-between">
                  {btn.label}
                  <ChevronRight size={12} className="text-[#A1A1AA]" />
                </span>
                <span className="block text-[10px] text-[#71717A] mt-1">{btn.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Wholesale Inquiries mini widget */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Wholesale Inquiries</h2>
            <Link href="/admin/b2b" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
              View All
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-50 flex items-center justify-center">
              <Inbox size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-heading text-[24px] font-black text-[#18181B]">{data.stats.wholesaleInquiries}</p>
              <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider">In this period</p>
            </div>
          </div>
          <Link
            href="/admin/b2b"
            className="block text-center border border-[#E4E4E7] py-2 text-[11px] font-sans font-bold uppercase tracking-wider text-[#18181B] hover:bg-[#FAF9F6] transition-colors"
          >
            View B2B Inquiries
          </Link>
        </div>
      </div>
    </div>
  )
}
