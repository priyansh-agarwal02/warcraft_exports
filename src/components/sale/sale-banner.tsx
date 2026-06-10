"use client"

import { useEffect, useState } from "react"

interface BannerSettings {
  enabled: boolean
  title: string
  subtitle: string
  countdownTo: string | null
  bgColor: string
  textColor: string
  accentColor: string
}

interface SaleBannerProps {
  settings: BannerSettings | null
}

function useCountdown(targetIso: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    if (!targetIso) return
    const target = new Date(targetIso).getTime()

    function tick() {
      const diff = target - Date.now()
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
        return
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  return timeLeft
}

function Pad({ n }: { n: number }) {
  return <>{String(n).padStart(2, "0")}</>
}

export function SaleBanner({ settings }: SaleBannerProps) {
  const timeLeft = useCountdown(settings?.countdownTo ?? null)

  if (!settings?.enabled) return null

  const bg = settings.bgColor ?? "#18181B"
  const text = settings.textColor ?? "#FFFFFF"
  const accent = settings.accentColor ?? "#BBAC48"

  return (
    <div
      style={{ backgroundColor: bg, color: text }}
      className="w-full py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div className="text-center sm:text-left">
        <h2
          className="font-heading text-[22px] md:text-[28px] uppercase tracking-[-0.02em] font-black leading-none"
          style={{ color: accent }}
        >
          {settings.title}
        </h2>
        {settings.subtitle && (
          <p className="text-[12px] font-sans uppercase tracking-[0.12em] mt-1 opacity-80">
            {settings.subtitle}
          </p>
        )}
      </div>

      {settings.countdownTo && timeLeft && (
        <div className="flex items-center gap-3">
          {[
            { label: "Days", val: timeLeft.d },
            { label: "Hrs", val: timeLeft.h },
            { label: "Min", val: timeLeft.m },
            { label: "Sec", val: timeLeft.s },
          ].map(({ label, val }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span
                  className="font-heading text-[28px] md:text-[36px] font-black leading-none tabular-nums"
                  style={{ color: accent }}
                >
                  <Pad n={val} />
                </span>
                <span className="text-[9px] font-sans uppercase tracking-[0.12em] opacity-60 mt-0.5">
                  {label}
                </span>
              </div>
              {i < 3 && (
                <span className="font-heading text-[24px] font-black opacity-40 mt-[-8px]">:</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
