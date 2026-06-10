import { createClient } from "@/lib/supabase/server"
import type { ShopFilters, ProductListItem, ProductDetail } from "@/types/product"

const PAGE_SIZE = 24

const STOP_WORDS = new Set([
  "and", "the", "a", "an", "or", "with", "for", "to", "in", "on", "at", "by", "of", "this", "that", "these", "those"
])

export function compileSearchWords(search: string, fields: string[]): string[] {
  // Split by whitespace and common delimiters
  const words = search
    .toLowerCase()
    .split(/[\s,.\-\/()]+/)
    .map(w => w.trim().replace(/[^a-z0-9]/g, "")) // keep alphanumeric only
    .filter(w => w.length > 0 && !STOP_WORDS.has(w))

  const finalWords = words.length > 0 ? words : []
  if (finalWords.length === 0) {
    const fallback = search.trim().replace(/[^a-zA-Z0-9\s]/g, "").trim()
    if (fallback) {
      finalWords.push(...fallback.toLowerCase().split(/\s+/).filter(Boolean))
    }
  }

  return finalWords.map(word => {
    return fields.map(field => `${field}.ilike.%${word}%`).join(",")
  })
}

export async function getProducts(
  filters: ShopFilters
): Promise<{ products: ProductListItem[]; total: number }> {
  try {
    const supabase = await createClient()
    const offset = (filters.page - 1) * PAGE_SIZE

    let categoryId: string | null = null
    let productIds: string[] | null = null
    let fallbackToLegacyFilter = false

    if (filters.category) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", filters.category)
        .single()
      categoryId = cat?.id ?? null
      if (!categoryId) return { products: [], total: 0 }

      try {
        const { data: rels, error } = await supabase
          .from("product_categories")
          .select("product_id")
          .eq("category_id", categoryId)
        if (error) throw error
        productIds = (rels ?? []).map((r: any) => r.product_id)
        if (!productIds || productIds.length === 0) return { products: [], total: 0 }
      } catch (e) {
        fallbackToLegacyFilter = true
      }
    }

    let query = supabase
      .from("products")
      .select(
        `id, name, slug, sku, price_usd, sale_price_usd,
         nation, era, is_featured, stock_quantity, ships_from_usa,
         category:categories!category_id(name, slug),
         images:product_images(url, alt_text, is_hero, sort_order)`,
        { count: "exact" }
      )
      .eq("is_active", true)

    if (filters.nation) {
      query = query.ilike("nation", filters.nation)
    }
    if (filters.era) query = query.ilike("era", filters.era)
    if (filters.search) {
      const orStrings = compileSearchWords(filters.search, [
        "name",
        "sku",
        "description",
        "short_description",
        "material",
        "style",
      ])
      orStrings.forEach(orStr => {
        query = query.or(orStr)
      })
    }
    if (fallbackToLegacyFilter && categoryId) {
      query = query.eq("category_id", categoryId)
    } else if (productIds) {
      query = query.in("id", productIds)
    }
    if (filters.in_stock) query = query.gt("stock_quantity", 0)
    if (filters.price_min != null) query = query.gte("price_usd", filters.price_min)
    if (filters.price_max != null) query = query.lte("price_usd", filters.price_max)

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price_usd", { ascending: true })
        break
      case "price_desc":
        query = query.order("price_usd", { ascending: false })
        break
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      default:
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
    }

    const { data, count, error } = await query.range(offset, offset + PAGE_SIZE - 1)
    if (error) throw error

    // Try to fetch multi-categories if the table exists
    const productCategoryMap: Record<string, any[]> = {}
    try {
      const productIdsToFetch = (data ?? []).map(r => r.id)
      if (productIdsToFetch.length > 0) {
        const { data: rels } = await supabase
          .from("product_categories")
          .select("product_id, category:categories(name, slug)")
          .in("product_id", productIdsToFetch)
        
        rels?.forEach((r: any) => {
          if (r.product_id && r.category) {
            if (!productCategoryMap[r.product_id]) {
              productCategoryMap[r.product_id] = []
            }
            productCategoryMap[r.product_id].push(r.category)
          }
        })
      }
    } catch {
      // Table doesn't exist, ignore
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: ProductListItem[] = (data ?? []).map((row: any) => {
      const heroImg =
        (row.images ?? []).find((i: { is_hero: boolean }) => i.is_hero) ??
        row.images?.[0] ??
        null
      const legacyCat = Array.isArray(row.category) ? row.category[0] : row.category
      const categories = productCategoryMap[row.id] || (legacyCat ? [legacyCat] : [])
      const category = categories[0] ?? null

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        sku: row.sku,
        price_usd: row.price_usd,
        sale_price_usd: row.sale_price_usd ?? null,
        nation: row.nation,
        era: row.era,
        is_featured: row.is_featured,
        is_in_stock: (row.stock_quantity ?? 0) > 0,
        stock_quantity: row.stock_quantity ?? 0,
        category: category,
        categories: categories,
        hero_image: heroImg?.url ?? null,
        ships_from_usa: row.ships_from_usa ?? false,
      }
    })

    return { products, total: count ?? 0 }
  } catch (err) {
    console.error("getProducts error:", err)
    return { products: [], total: 0 }
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `id, name, slug, sku, short_description, description, historical_quote,
         price_usd, sale_price_usd,
         nation, era, material, style, weight_kg,
         is_featured, stock_quantity, features, specifications,
         category:categories!category_id(name, slug),
         ships_from_usa`
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (error || !product) return null

    const { data: images } = await supabase
      .from("product_images")
      .select("id, url, alt_text, sort_order, is_hero")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, color, size, sku_suffix, price_override, stock_quantity, is_active")
      .eq("product_id", product.id)
      .eq("is_active", true)

    // Try to fetch multi-categories if the table exists
    let categories: any[] = []
    try {
      const { data: rels } = await supabase
        .from("product_categories")
        .select("category:categories(name, slug)")
        .eq("product_id", product.id)
      categories = rels?.map((r: any) => r.category).filter(Boolean) || []
    } catch {
      // Fallback
    }

    const legacyCat = Array.isArray((product as any).category)
      ? (product as any).category[0]
      : (product as any).category
    
    if (categories.length === 0 && legacyCat) {
      categories = [legacyCat]
    }
    const cat = categories[0] ?? null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = product as any
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      short_description: p.short_description ?? null,
      description: p.description ?? null,
      historical_quote: p.historical_quote ?? null,
      price_usd: p.price_usd,
      sale_price_usd: p.sale_price_usd ?? null,
      nation: p.nation,
      era: p.era,
      material: p.material ?? null,
      style: p.style ?? null,
      weight_kg: p.weight_kg ?? null,
      is_featured: p.is_featured,
      is_in_stock: (p.stock_quantity ?? 0) > 0,
      stock_quantity: p.stock_quantity ?? 0,
      category: cat,
      categories: categories,
      images: images ?? [],
      variants: variants ?? [],
      features: Array.isArray(p.features) ? p.features : [],
      specifications: p.specifications ?? {},
      ships_from_usa: p.ships_from_usa ?? false,
    } as ProductDetail
  } catch (err) {
    console.error("getProductBySlug error:", err)
    return null
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, description, parent_id")
      .eq("slug", slug)
      .single()
    return data
  } catch {
    return null
  }
}
