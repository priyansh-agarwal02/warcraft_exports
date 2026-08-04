import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const supabase = createServiceClient()

    const { data: categories, error: catErr } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true })

    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, sku, name, price_usd, category_id')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (catErr) console.error('Categories fetch error:', catErr)
    if (prodErr) console.error('Products fetch error:', prodErr)

    return NextResponse.json({
      success: true,
      categories: categories || [],
      products: products || [],
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
