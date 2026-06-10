"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import Link from "next/link"

interface CustomerVisitsChartProps {
  pageviews: { date: string; count: number }[]
  visitors: { date: string; count: number }[]
  totalPageviews: number
  totalVisitors: number
  source?: string
}

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
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export function CustomerVisitsChart({ pageviews, visitors, totalPageviews, totalVisitors, source }: CustomerVisitsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.7, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const hasData = pageviews.some(p => p.count > 0)

  // Merge pageviews and visitors into single chart data
  const chartData = pageviews.map((pv, i) => ({
    date: pv.date,
    displayDate: formatDate(pv.date),
    Pageviews: pv.count,
    Visitors: visitors[i]?.count ?? 0,
  }))

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Customer Visits</h2>
        <Link href="/admin/analytics" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
          Analytics
        </Link>
      </div>

      {!hasData ? (
        <div className="h-[180px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4]">
          <div className="text-center px-4">
            <p className="text-[13px] text-[#A1A1AA] font-sans">Analytics data collecting</p>
            <p className="text-[11px] text-[#D4D4D8] font-sans mt-1">
              {source === "none"
                ? "PostHog is now tracking pageviews. Data will appear soon."
                : "Visitor data will appear as traffic is recorded"}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[180px] bg-[#FAF9F6] border border-[#F4F4F4] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="pageviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#33450D" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#33450D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BBAC48" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#BBAC48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 9, fill: "#A1A1AA" }}
                tickLine={false}
                axisLine={{ stroke: "#E4E4E7" }}
                interval={Math.max(0, Math.floor(chartData.length / 6))}
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
                fill="url(#pageviewGrad)"
                strokeWidth={2}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="Visitors"
                stroke="#BBAC48"
                fill="url(#visitorGrad)"
                strokeWidth={2}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-6 border-t border-[#F4F4F4] pt-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-0.5 bg-[#33450D]" />
          <span className="text-[10px] font-sans text-[#71717A]">Pageviews: <strong className="text-[#18181B]">{totalPageviews.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-0.5 bg-[#BBAC48]" />
          <span className="text-[10px] font-sans text-[#71717A]">Visitors: <strong className="text-[#18181B]">{totalVisitors.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  )
}
