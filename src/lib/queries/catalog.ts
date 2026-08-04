import { createServiceClient } from '@/lib/supabase/service'
import { CatalogSettings, CatalogProductItem } from '@/types/catalog'

const DEFAULT_LEGAL_TERMS = 'PROPRIETARY & NON-DISCLOSURE NOTICE: Warcraft Exports products are supplied for offline wholesale distribution only. Online sale or marketplace re-listing is strictly prohibited.'

const DEFAULT_BUSINESS_TERMS = `1. DISTRIBUTION & BRAND USE
Warcraft Exports products are supplied to approved distributors for offline wholesale and distribution only. Online listing or sale through Amazon, eBay, Walmart, other marketplaces, e-commerce websites, social-media stores, or any other online sales channel is not permitted, whether under the Warcraft Exports name, the distributor’s own name, or any other brand.

All product designs, photographs, descriptions, specifications, trademarks, and catalog content remain the property of Warcraft Exports, a brand of RAAS ENTERPRISES, and may not be reproduced or commercially used without permission.

2. MINIMUM ORDER & SHIPPING
Minimum order: 100 units or USD 1,000 net order value.
Orders are supplied FOB Kanpur, India. Customs duties, import duties, taxes, and destination charges are the buyer’s responsibility.

3. PAYMENT TERMS
50% advance upon order confirmation and 50% balance prior to dispatch. Payment accepted via wire transfer or PayPal.

4. QUALITY & CLAIMS
Our products are handcrafted using solid brass fittings and top-grain leather. Due to their handcrafted nature, minor variations may occur.

Manufacturing defect claims must be submitted within 14 days of receipt, along with photographs and order details, for review and appropriate replacement or credit.

5. ORDER ACCEPTANCE
Placement of an order confirms the buyer’s acceptance of these wholesale and distributor terms.`

export async function getCatalogSettings(): Promise<CatalogSettings> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('catalog_settings')
      .select('*')
      .limit(1)

    if (error || !data || data.length === 0) {
      return {
        id: '00000000-0000-0000-0000-000000000001',
        title: '2026 WHOLESALE DISTRIBUTOR CATALOG',
        subtitle: 'Handcrafted Reproductions & Historical Militaria',
        price_adjustment_percent: 0,
        show_variants: true,
        distributor_notes: 'Minimum wholesale order: 100 units or USD 1,000 net value. Factory Direct from Kanpur, India.',
        legal_terms: DEFAULT_LEGAL_TERMS,
        business_terms: DEFAULT_BUSINESS_TERMS,
        excluded_product_ids: [],
        excluded_category_ids: [],
      }
    }

    const s = data[0]
    return {
      id: s.id,
      title: s.title || '2026 WHOLESALE DISTRIBUTOR CATALOG',
      subtitle: s.subtitle || 'Handcrafted Reproductions & Historical Militaria',
      price_adjustment_percent: Number(s.price_adjustment_percent) || 0,
      show_variants: s.show_variants ?? true,
      distributor_notes: s.distributor_notes || '',
      legal_terms: s.legal_terms || DEFAULT_LEGAL_TERMS,
      business_terms: s.business_terms || DEFAULT_BUSINESS_TERMS,
      excluded_product_ids: s.excluded_product_ids || [],
      excluded_category_ids: s.excluded_category_ids || [],
    }
  } catch (err) {
    console.error('Error fetching catalog settings:', err)
    return {
      id: '00000000-0000-0000-0000-000000000001',
      title: '2026 WHOLESALE DISTRIBUTOR CATALOG',
      subtitle: 'Handcrafted Reproductions & Historical Militaria',
      price_adjustment_percent: 0,
      show_variants: true,
      distributor_notes: 'Minimum wholesale order: 100 units or USD 1,000 net value. Factory Direct from Kanpur, India.',
      legal_terms: DEFAULT_LEGAL_TERMS,
      business_terms: DEFAULT_BUSINESS_TERMS,
      excluded_product_ids: [],
      excluded_category_ids: [],
    }
  }
}

export async function getCatalogProducts(settings?: CatalogSettings): Promise<{
  settings: CatalogSettings
  allProducts: CatalogProductItem[]
  totalProducts: number
}> {
  const activeSettings = settings || (await getCatalogSettings())
  const supabase = createServiceClient()

  const { data: productsData, error: prodErr } = await supabase
    .from('products')
    .select(`
      id,
      sku,
      name,
      slug,
      nation,
      era,
      material,
      style,
      price_usd,
      category_id,
      product_images (url, is_hero, sort_order),
      product_variants (id, color, size, price_override, stock_quantity, is_active, image_url)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (prodErr || !productsData) {
    console.error('Error fetching products for catalog:', prodErr)
    return { settings: activeSettings, allProducts: [], totalProducts: 0 }
  }

  const multiplier = 1 + activeSettings.price_adjustment_percent / 100

  const excludedProducts = new Set(activeSettings.excluded_product_ids || [])
  const excludedCategories = new Set(activeSettings.excluded_category_ids || [])

  const allProducts: CatalogProductItem[] = []

  productsData.forEach((p: any) => {
    if (excludedProducts.has(p.id)) return
    if (p.category_id && excludedCategories.has(p.category_id)) return

    const sortedImages = (p.product_images || []).sort((a: any, b: any) => {
      if (a.is_hero) return -1
      if (b.is_hero) return 1
      return (a.sort_order || 0) - (b.sort_order || 0)
    })
    const heroImage = sortedImages[0]?.url || null

    const activeVariants = (p.product_variants || [])
      .filter((v: any) => v.is_active !== false)
      .map((v: any) => ({
        id: v.id,
        color: v.color || null,
        size: v.size || null,
        price_override: v.price_override ? Number(v.price_override) : null,
        adjusted_price_override: v.price_override ? Number((Number(v.price_override) * multiplier).toFixed(2)) : null,
        stock_quantity: v.stock_quantity || 0,
        image_url: v.image_url || null,
      }))

    const basePrice = Number(p.price_usd) || 0
    const adjustedPrice = Number((basePrice * multiplier).toFixed(2))

    const item: CatalogProductItem = {
      id: p.id,
      sku: p.sku || '',
      name: p.name || 'Untitled Product',
      slug: p.slug || '',
      nation: p.nation || null,
      era: p.era || null,
      material: p.material || null,
      style: p.style || null,
      price_usd: basePrice,
      adjusted_price_usd: adjustedPrice,
      category_name: 'General',
      category_id: p.category_id || null,
      hero_image: heroImage,
      variants: activeVariants,
    }

    allProducts.push(item)
  })

  return {
    settings: activeSettings,
    allProducts,
    totalProducts: allProducts.length,
  }
}
