import { cn } from "@/lib/utils"

const BADGE_STYLES: Record<string, string> = {
  WW1:      "bg-canvas text-leather-dark border-khaki",
  WW2:      "bg-leather-dark text-parchment border-leather-dark",
  LEATHER:  "bg-leather/10 text-leather border-leather",
  CANVAS:   "bg-olive/10 text-olive border-olive/30",
  FEATURED: "bg-gold/20 text-leather-dark border-gold/40",
  NEW:      "bg-olive text-parchment border-olive",
  SALE:     "bg-red-700 text-white border-red-700",
  default:  "bg-parchment-dark text-leather-dark border-khaki",
}

interface HeritageBadgeProps {
  label: string
  className?: string
}

export function HeritageBadge({ label, className }: HeritageBadgeProps) {
  const style = BADGE_STYLES[label.toUpperCase()] ?? BADGE_STYLES.default
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-sans font-700 uppercase tracking-widest border rounded-sm",
        style,
        className
      )}
    >
      {label}
    </span>
  )
}
