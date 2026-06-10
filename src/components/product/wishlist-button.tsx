"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface WishlistButtonProps {
  productId: string
  slug: string
}

export function WishlistButton({ productId, slug }: WishlistButtonProps) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle()

      setWishlisted(!!data)
    })
  }, [productId])

  async function handleToggle() {
    if (!userId) {
      router.push(`/auth/login?next=/product/${slug}`)
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (wishlisted) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
      setWishlisted(false)
    } else {
      await supabase.from("wishlists").insert({
        user_id: userId,
        product_id: productId,
      })
      setWishlisted(true)
    }

    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="p-2 text-leather-dark hover:text-leather transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Heart
        size={20}
        className={wishlisted ? "fill-leather text-leather" : ""}
      />
    </button>
  )
}
