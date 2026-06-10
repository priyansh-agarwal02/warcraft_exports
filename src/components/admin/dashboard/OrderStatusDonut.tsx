"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"

interface OrderStatusDonutProps {
  data: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#22C55E",
  cancelled: "#EF4444",
  refunded: "#71717A",
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-[#18181B] text-white px-3 py-2 text-[11px] font-sans shadow-lg border border-[#33450D]/30">
      <p className="font-bold">{STATUS_LABELS[d.name] ?? d.name}</p>
      <p className="text-[#BBAC48]">{d.value} orders</p>
    </div>
  )
}

export function OrderStatusDonut({ data }: OrderStatusDonutProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.6, ease: "back.out(1.2)" }
      )
    })
    return () => ctx.revert()
  }, [])

  const total = data.reduce((sum, d) => sum + d.count, 0)
  const hasData = data.length > 0 && total > 0

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Order Status</h2>
        <Link href="/admin/orders" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
          Manage
        </Link>
      </div>

      {!hasData ? (
        <div className="h-[180px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4]">
          <p className="text-[13px] text-[#A1A1AA] font-sans">No orders yet</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-[140px] h-[140px] relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={2}
                  animationDuration={800}
                  animationBegin={600}
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#71717A"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-heading text-[18px] font-black text-[#18181B]">{total}</p>
                <p className="text-[8px] uppercase font-bold text-[#A1A1AA] tracking-wider">Total</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {data.map((d) => (
              <div key={d.status} className="flex items-center justify-between text-[11px] font-sans">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[d.status] ?? "#71717A" }}
                  />
                  <span className="text-[#71717A] capitalize">{STATUS_LABELS[d.status] ?? d.status}</span>
                </div>
                <span className="font-bold text-[#18181B]">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
