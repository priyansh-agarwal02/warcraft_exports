import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: string
  productName: string
  slug: string
  heroImage: string | null
  priceUsd: number
  variantId: string | null
  variantLabel: string | null
  quantity: number
  maxQuantity: number
  shipsFromUsa?: boolean
}

export type AppliedCoupon = {
  id: string
  code: string
  type: "percent" | "fixed" | "free_shipping"
  value: number
}

type CartStore = {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotalUsd: () => number
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
}

function itemKey(productId: string, variantId: string | null) {
  return `${productId}__${variantId ?? "none"}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem(incoming) {
        set((state) => {
          const key = itemKey(incoming.productId, incoming.variantId)
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.variantId) === key
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQuantity) }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { ...incoming, quantity: 1 },
            ],
          }
        })
      },

      removeItem(productId, variantId) {
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.productId, i.variantId) !== itemKey(productId, variantId)
          ),
        }))
      },

      updateQuantity(productId, variantId, quantity) {
        const key = itemKey(productId, variantId)
        set((state) => ({
          items: state.items
            .map((i) =>
              itemKey(i.productId, i.variantId) === key
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        }))
      },

      clearCart() {
        set({ items: [], appliedCoupon: null })
      },

      totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      subtotalUsd() {
        return get().items.reduce((sum, i) => sum + i.priceUsd * i.quantity, 0)
      },

      setAppliedCoupon(coupon) {
        set({ appliedCoupon: coupon })
      },
    }),
    {
      name: "warcraft-cart",
    }
  )
)

