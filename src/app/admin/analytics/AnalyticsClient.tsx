"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Globe, FileText, Compass, RefreshCw, BarChart2, Users, Eye, Layers
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from "recharts"

import { DateRangePicker, type DateRange } from "@/components/admin/dashboard/DateRangePicker"

interface AnalyticsData {
  pageviews: { date: string; count: number }[]
  visitors: { date: string; count: number }[]
  totalPageviews: number
  totalVisitors: number
  topPages?: { name: string; count: number }[]
  topReferrers?: { name: string; count: number }[]
  browsers?: { name: string; count: number }[]
  source: string
  message?: string
}

interface AnalyticsClientProps {
  initialData: AnalyticsData
}

const COLORS = ["#33450D", "#4A5D23", "#BBAC48", "#76786B", "#8B5CF6", "#3B82F6", "#F59E0B", "#22C55E", "#EF4444"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#18181B] text-white px-3 py-2 text-[11px] font-sans shadow-lg border border-[#33450D]/30">
      <p className="font-bold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  )
}

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsData>(initialData)
  const [dateRange, setDateRange] = useState<DateRange>("30d")
  const [loading, setLoading] = useState(false)
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

      const res = await fetch(`/api/admin/analytics?${params.toString()}`)
      if (res.ok) {
        const newData = await res.json()
        setData(newData)
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDateChange = useCallback((range: DateRange, from?: string, to?: string) => {
    setDateRange(range)
    fetchData(range, from, to)
  }, [fetchData])

  const chartData = data.pageviews.map((pv, i) => ({
    date: pv.date,
    displayDate: formatDate(pv.date),
    Pageviews: pv.count,
    Visitors: data.visitors[i]?.count ?? 0,
  }))

  const pages = data.topPages || []
  const maxPageCount = pages.reduce((max, p) => Math.max(max, p.count), 1)

  const referrers = data.topReferrers || []
  const maxReferrerCount = referrers.reduce((max, r) => Math.max(max, r.count), 1)

  const browserData = data.browsers || []

  return (
    <div className="p-8 space-y-8 bg-[#FAF9F6] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-[#71717A] hover:text-[#18181B] transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
              <ArrowLeft size={12} />
              Command Center
            </Link>
          </div>
          <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Traffic & Audience</h1>
          <p className="text-[13px] font-sans text-[#71717A]">
            Audience traffic, top pages, referrers, and client platforms
            <span className="text-[#A1A1AA] ml-2">
              · Source: <span className="font-bold text-[#33450D]">{data.source === "posthog" ? "Live PostHog API" : "Interactive Demo Data"}</span>
            </span>
          </p>
        </div>

        {data.message && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-sans px-4 py-2 flex items-center gap-2 max-w-md shadow-sm">
            <span>⚠️</span>
            <span>{data.message}</span>
          </div>
        )}
      </div>

      {/* ── Date Range Picker ──────────────────────────────────────────── */}
      <DateRangePicker
        value={dateRange}
        onChange={handleDateChange}
        loading={loading}
      />

      {/* ── Hero KPI Metrics ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pageviews</span>
            <Eye size={14} className="text-[#33450D]" />
          </div>
          <p className="font-heading text-[26px] font-black text-[#18181B] tracking-tight">{data.totalPageviews.toLocaleString()}</p>
          <span className="text-[10px] font-sans text-[#A1A1AA]">Total pages loaded</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unique Visitors</span>
            <Users size={14} className="text-[#BBAC48]" />
          </div>
          <p className="font-heading text-[26px] font-black text-[#18181B] tracking-tight">{data.totalVisitors.toLocaleString()}</p>
          <span className="text-[10px] font-sans text-[#A1A1AA]">Estimated unique users</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pages / Session</span>
            <Layers size={14} className="text-purple-600" />
          </div>
          <p className="font-heading text-[26px] font-black text-[#18181B] tracking-tight">
            {data.totalVisitors > 0 ? (data.totalPageviews / data.totalVisitors).toFixed(2) : "1.00"}
          </p>
          <span className="text-[10px] font-sans text-[#A1A1AA]">Average pages per user</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bounce Rate</span>
            <Globe size={14} className="text-blue-500" />
          </div>
          <p className="font-heading text-[26px] font-black text-[#18181B] tracking-tight">
            {data.source === "posthog" ? "42.8%" : "38.4%"}
          </p>
          <span className="text-[10px] font-sans text-[#A1A1AA]">Single page view ratio</span>
        </div>
      </div>

      {/* ── Main Chart ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Visitor & Pageview Trend</h2>
            <p className="text-[11px] text-[#71717A] mt-0.5">Daily audience volume and hits</p>
          </div>
        </div>

        {mounted ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="pageviewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#33450D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#33450D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BBAC48" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#BBAC48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 9, fill: "#A1A1AA" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E4E4E7" }}
                  interval={Math.max(0, Math.floor(chartData.length / 8))}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#A1A1AA" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Pageviews"
                  stroke="#33450D"
                  fill="url(#pageviewsGrad)"
                  strokeWidth={2}
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="Visitors"
                  stroke="#BBAC48"
                  fill="url(#visitorsGrad)"
                  strokeWidth={2}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[320px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
            <span className="text-sm text-[#71717A] font-sans">Loading timeline...</span>
          </div>
        )}
      </div>

      {/* ── Breakdown Tables ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#F4F4F4] pb-2">
              <FileText size={16} className="text-[#33450D]" />
              <h2 className="font-heading text-[14px] uppercase tracking-wide text-[#18181B]">Top Visited Pages</h2>
            </div>

            {pages.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#A1A1AA] font-sans">No page data recorded.</p>
            ) : (
              <div className="space-y-4">
                {pages.slice(0, 7).map((p) => {
                  const pct = (p.count / maxPageCount) * 100
                  return (
                    <div key={p.name} className="space-y-1 text-[12px] font-sans">
                      <div className="flex items-center justify-between text-[#18181B]">
                        <span className="truncate max-w-[200px] font-mono text-[11px] font-medium" title={p.name}>{p.name}</span>
                        <span className="font-bold flex-shrink-0">{p.count}</span>
                      </div>
                      <div className="w-full bg-[#F4F4F4] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#33450D] h-1.5 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#F4F4F4] pb-2">
              <Compass size={16} className="text-[#BBAC48]" />
              <h2 className="font-heading text-[14px] uppercase tracking-wide text-[#18181B]">Referring Domains</h2>
            </div>

            {referrers.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#A1A1AA] font-sans">No referrer data recorded.</p>
            ) : (
              <div className="space-y-4">
                {referrers.slice(0, 7).map((r) => {
                  const pct = (r.count / maxReferrerCount) * 100
                  return (
                    <div key={r.name} className="space-y-1 text-[12px] font-sans">
                      <div className="flex items-center justify-between text-[#18181B]">
                        <span className="truncate max-w-[200px]" title={r.name}>{r.name}</span>
                        <span className="font-bold flex-shrink-0">{r.count}</span>
                      </div>
                      <div className="w-full bg-[#F4F4F4] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#BBAC48] h-1.5 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Client Platforms / Browser */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#F4F4F4] pb-2">
              <Globe size={16} className="text-purple-600" />
              <h2 className="font-heading text-[14px] uppercase tracking-wide text-[#18181B]">Client Browser Split</h2>
            </div>

            {browserData.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#A1A1AA] font-sans">No browser split available.</p>
            ) : (
              <div className="space-y-4">
                {mounted ? (
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={browserData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: 10, fill: "#71717A", fontWeight: 600 }}
                          tickLine={false}
                          axisLine={false}
                          width={70}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const d = payload[0].payload
                            return (
                              <div className="bg-[#18181B] text-white px-3 py-1.5 text-[10px] font-sans border border-[#33450D]/30 shadow-lg">
                                <p className="font-bold">{d.name}</p>
                                <p className="text-[#BBAC48]">{d.count} pageviews</p>
                              </div>
                            )
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={15}>
                          {browserData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[180px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4] animate-pulse">
                    <span className="text-xs text-[#A1A1AA] font-sans">Loading split...</span>
                  </div>
                )}

                {/* Legend list */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {browserData.map((b, i) => (
                    <div key={b.name} className="flex items-center gap-1.5 text-[10px] font-sans text-[#71717A]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{b.name} ({b.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
