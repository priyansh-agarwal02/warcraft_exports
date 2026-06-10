import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"

type WishlistStore = {
  /** Set of wishlisted product IDs */
  ids: Set<string>
  /** Current authenticated user ID, or null */
  userId: string | null
  /** Whether the initial load has completed */
  loaded: boolean
  /** Whether a load is currently in progress (prevents duplicate calls) */
  _loading: boolean
  /** Load the user's wishlist from Supabase (safe to call multiple times) */
  load: () => Promise<void>
  /** Toggle a product in the wishlist — returns the new wishlisted state */
  toggle: (productId: string) => Promise<boolean>
  /** Check if a product is wishlisted */
  has: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  ids: new Set<string>(),
  userId: null,
  loaded: false,
  _loading: false,

  async load() {
    // Prevent multiple concurrent loads
    if (get()._loading || get().loaded) return
    set({ _loading: true })

    try {
      const supabase = createClient()
      
      // Subscribe to auth state changes to dynamically load/clear wishlist
      supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user ?? null
        if (!user) {
          set({ userId: null, ids: new Set(), loaded: true, _loading: false })
          return
        }

        try {
          const { data } = await supabase
            .from("wishlists")
            .select("product_id")
            .eq("user_id", user.id)

          const idSet = new Set<string>()
          if (data) {
            for (const row of data) {
              idSet.add(row.product_id)
            }
          }
          set({ userId: user.id, ids: idSet, loaded: true, _loading: false })
        } catch (err) {
          console.error("Error loading wishlist in auth change callback:", err)
          set({ userId: user.id, loaded: true, _loading: false })
        }
      })
    } catch (err) {
      console.error("Failed to initialize wishlist store listener:", err)
      set({ loaded: true, _loading: false })
    }
  },

  async toggle(productId: string) {
    const { userId, ids } = get()
    if (!userId) return false

    const supabase = createClient()
    const isCurrentlyWishlisted = ids.has(productId)

    // Optimistic update
    const newIds = new Set(ids)
    if (isCurrentlyWishlisted) {
      newIds.delete(productId)
    } else {
      newIds.add(productId)
    }
    set({ ids: newIds })

    try {
      if (isCurrentlyWishlisted) {
        await supabase.from("wishlists").delete()
          .eq("user_id", userId)
          .eq("product_id", productId)
      } else {
        await supabase.from("wishlists").insert({
          user_id: userId,
          product_id: productId,
        })
      }
    } catch (err) {
      // Revert on error
      console.error("Wishlist toggle error:", err)
      set({ ids })
    }

    return !isCurrentlyWishlisted
  },

  has(productId: string) {
    return get().ids.has(productId)
  },
}))
