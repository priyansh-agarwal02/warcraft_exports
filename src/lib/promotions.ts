export type QuantityPromotion = {
  id: string
  name: string
  description: string
  min_quantity: number
  discount_percent: number
  applies_to: "all" | "products"
  product_ids: string[]
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export type CartItemForPromo = {
  productId: string
  priceUsd: number
  quantity: number
}

export type PromoCalcResult = {
  discountUsd: number
  appliedPromotion: QuantityPromotion | null
  nextPromotion: QuantityPromotion | null
  itemsNeededForNext: number
  qualifyingSubtotal: number
}

export function calculateQuantityDiscount(
  items: CartItemForPromo[],
  promotions: QuantityPromotion[]
): PromoCalcResult {
  // Sort tiers ascending by min_quantity so we can walk up
  const sorted = [...promotions].sort((a, b) => a.min_quantity - b.min_quantity)

  let appliedPromotion: QuantityPromotion | null = null

  for (const promo of sorted) {
    const qualifying = getQualifyingItems(items, promo)
    const totalQty = qualifying.reduce((s, i) => s + i.quantity, 0)
    if (totalQty >= promo.min_quantity) {
      appliedPromotion = promo // Higher tiers naturally override lower ones
    }
  }

  const qualifyingSubtotal = appliedPromotion
    ? getQualifyingItems(items, appliedPromotion).reduce((s, i) => s + i.priceUsd * i.quantity, 0)
    : 0

  const discountUsd = appliedPromotion
    ? qualifyingSubtotal * (appliedPromotion.discount_percent / 100)
    : 0

  // Find the next unlocked tier
  const appliedIdx = appliedPromotion
    ? sorted.findIndex((p) => p.id === appliedPromotion!.id)
    : -1
  const nextPromotion = appliedIdx < sorted.length - 1 ? sorted[appliedIdx + 1] : null

  const itemsNeededForNext = nextPromotion
    ? (() => {
        const qualifying = getQualifyingItems(items, nextPromotion)
        const totalQty = qualifying.reduce((s, i) => s + i.quantity, 0)
        return Math.max(0, nextPromotion.min_quantity - totalQty)
      })()
    : 0

  return { discountUsd, appliedPromotion, nextPromotion, itemsNeededForNext, qualifyingSubtotal }
}

function getQualifyingItems(items: CartItemForPromo[], promo: QuantityPromotion): CartItemForPromo[] {
  if (promo.applies_to === "all") return items
  return items.filter((i) => promo.product_ids.includes(i.productId))
}
