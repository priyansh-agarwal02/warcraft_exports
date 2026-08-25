/**
 * Shipping Utility Helpers
 * Dynamically computes delivery day windows, business-day calendar ranges,
 * and standard/expedited badges without hardcoded strings.
 */

export interface ShippingInfo {
  isExpress: boolean
  isUsWarehouse: boolean
  shippingLabel: string
  daysText: string
  estimatedDeliveryWindow: string
}

/**
 * Calculates calendar date range adding business days (skipping weekends).
 */
export function addBusinessDays(startDate: Date, days: number): Date {
  const date = new Date(startDate)
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++
    }
  }
  return date
}

/**
 * Helper to compute shipping details dynamically
 */
export function computeShippingInfo(params: {
  createdAtStr: string
  shippingUsd: number
  notes?: string | null
  standardDaysFromRate?: string | null
  hasUsWarehouseItem?: boolean
}): ShippingInfo {
  const { createdAtStr, shippingUsd, notes, standardDaysFromRate, hasUsWarehouseItem } = params

  const createdDate = new Date(createdAtStr || Date.now())
  const isExpress = !!(notes?.includes("[Shipping Option: Express]") || shippingUsd > 20)
  const isUsWarehouse = !!hasUsWarehouseItem

  let daysText = "7–14"
  if (isUsWarehouse || isExpress) {
    daysText = "3–5"
  } else if (standardDaysFromRate) {
    daysText = standardDaysFromRate.replace("-", "–")
  }

  // Parse min and max days
  const rangeParts = daysText.split("–")
  let minDays = 7
  let maxDays = 14

  if (rangeParts.length === 2) {
    const minParsed = parseInt(rangeParts[0].trim(), 10)
    const maxParsed = parseInt(rangeParts[1].trim(), 10)
    if (!isNaN(minParsed) && !isNaN(maxParsed)) {
      minDays = minParsed
      maxDays = maxParsed
    }
  }

  const minDate = addBusinessDays(createdDate, minDays)
  const maxDate = addBusinessDays(createdDate, maxDays)

  const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
  const minStr = minDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const maxStr = maxDate.toLocaleDateString("en-US", formatOptions)

  const estimatedDeliveryWindow = `${minStr} – ${maxStr}`

  let shippingLabel = `Standard Shipping (${daysText} Business Days)`
  if (isExpress) {
    shippingLabel = `Expedited Shipping (${daysText} Business Days)`
  } else if (isUsWarehouse) {
    shippingLabel = `Expedited Shipping — US Warehouse (${daysText} Business Days)`
  } else if (shippingUsd === 0) {
    shippingLabel = `Free Standard Shipping (${daysText} Business Days)`
  }

  return {
    isExpress: isExpress || isUsWarehouse,
    isUsWarehouse,
    shippingLabel,
    daysText,
    estimatedDeliveryWindow,
  }
}
