export type CatalogSettings = {
  id: string
  title: string
  subtitle: string
  price_adjustment_percent: number
  show_variants: boolean
  distributor_notes: string
  legal_terms?: string
  business_terms?: string
  excluded_product_ids: string[]
  excluded_category_ids: string[]
  updated_at?: string
}

export type CatalogProductItem = {
  id: string
  sku: string
  name: string
  slug: string
  nation: string | null
  era: string | null
  material: string | null
  style: string | null
  price_usd: number
  adjusted_price_usd: number
  category_name: string
  category_id: string | null
  hero_image: string | null
  variants: {
    id: string
    color: string | null
    size: string | null
    price_override: number | null
    adjusted_price_override: number | null
    stock_quantity: number
    image_url?: string | null
  }[]
}
