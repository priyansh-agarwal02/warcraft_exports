import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  count?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function StarRating({ rating, count, size = "md", showCount = true, className }: StarRatingProps) {
  const sizes = { sm: 12, md: 14, lg: 18 }
  const px = sizes[size]
  const full = Math.floor(rating)
  const partial = rating - full

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="relative inline-flex">
            {/* Empty star */}
            <Star size={px} className="text-khaki fill-transparent" />
            {/* Filled overlay */}
            {i < full && (
              <Star size={px} className="absolute inset-0 text-gold fill-gold" />
            )}
            {i === full && partial > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${partial * 100}%` }}
              >
                <Star size={px} className="text-gold fill-gold" />
              </span>
            )}
          </span>
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-khaki font-sans">({count.toLocaleString()})</span>
      )}
    </div>
  )
}
