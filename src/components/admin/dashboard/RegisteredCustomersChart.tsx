"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import Link from "next/link"

interface RegisteredCustomersChartProps {
  data: { date: string; count: number }[]
  totalCustomers: number
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
      <p className="text-[#BBAC48]">{payload[0]?.value} new registrations</p>
    </div>
  )
}

export function RegisteredCustomersChart({ data, totalCustomers }: RegisteredCustomersChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.9, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const newInPeriod = data.reduce((sum, d) => sum + d.count, 0)
  const hasData = data.some(d => d.count > 0)
  const chartData = data.map(d => ({ ...d, displayDate: formatDate(d.date) }))

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Registered Customers</h2>
        <Link href="/admin/customers" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
          View All
        </Link>
      </div>

      {!hasData ? (
        <div className="h-[160px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4]">
          <div className="text-center">
            <p className="text-[13px] text-[#A1A1AA] font-sans">No new registrations</p>
            <p className="text-[11px] text-[#D4D4D8] font-sans mt-1">{totalCustomers} total customers</p>
          </div>
        </div>
      ) : (
        <div className="h-[160px] bg-[#FAF9F6] border border-[#F4F4F4] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 9, fill: "#A1A1AA" }}
                tickLine={false}
                axisLine={{ stroke: "#E4E4E7" }}
                interval={Math.max(0, Math.floor(data.length / 6))}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#A1A1AA" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#BBAC48"
                strokeWidth={2}
                dot={{ r: 3, fill: "#BBAC48", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#33450D", strokeWidth: 0 }}
                animationDuration={1000}
                animationBegin={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-[#F4F4F4] pt-3 mt-3">
        <span className="text-[10px] font-sans text-[#71717A]">New in period: <strong className="text-[#18181B]">{newInPeriod}</strong></span>
        <span className="text-[10px] font-sans text-[#71717A]">Total: <strong className="text-[#18181B]">{totalCustomers}</strong></span>
      </div>
    </div>
  )
}
