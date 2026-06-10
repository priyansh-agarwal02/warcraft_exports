export type ProductDetail = {
  id: string
  name: string
  slug: string
  sku: string
  short_description: string | null
  description: string | null
  historical_quote: string | null
  price_usd: number
  sale_price_usd: number | null
  nation: string | null
  era: string | null
  material: string | null
  style: string | null
  weight_kg: number | null
  is_featured: boolean
  is_in_stock: boolean
  stock_quantity: number
  ships_from_usa?: boolean
  category: { name: string; slug: string } | null
  categories?: { name: string; slug: string }[]
  images: { id: string; url: string; alt_text: string | null; sort_order: number; is_hero: boolean }[]
  variants: { id: string; color: string | null; size: string | null; sku_suffix: string | null; price_override: number | null; stock_quantity: number; is_active: boolean }[]
  features: string[]
  specifications: Record<string, string>
}

export type ProductListItem = {
  id: string
  name: string
  slug: string
  sku: string
  price_usd: number
  sale_price_usd: number | null
  nation: string | null
  era: string | null
  is_featured: boolean
  is_in_stock: boolean
  stock_quantity: number
  ships_from_usa?: boolean
  category: { name: string; slug: string } | null
  categories?: { name: string; slug: string }[]
  hero_image: string | null
}

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'newest'

export type ShopFilters = {
  search?: string
  nation?: string
  era?: string
  category?: string
  price_min?: number
  price_max?: number
  in_stock?: boolean
  sort: SortOption
  page: number
}
