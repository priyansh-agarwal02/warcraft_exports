import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/admin-auth'

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

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('catalog_settings')
      .select('*')
      .limit(1)

    if (error) throw error

    const settings = data && data[0] ? data[0] : {
      title: '2026 WHOLESALE DISTRIBUTOR CATALOG',
      subtitle: 'Handcrafted Reproductions & Historical Militaria',
      price_adjustment_percent: 0,
      show_variants: true,
      distributor_notes: 'Minimum wholesale order: 100 units or USD 1,000 net order value. Factory Direct from Kanpur, India.',
      legal_terms: DEFAULT_LEGAL_TERMS,
      business_terms: DEFAULT_BUSINESS_TERMS,
      excluded_product_ids: [],
      excluded_category_ids: [],
    }

    return NextResponse.json({ success: true, settings })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const {
      title,
      subtitle,
      price_adjustment_percent,
      show_variants,
      distributor_notes,
      legal_terms,
      business_terms,
      excluded_product_ids,
      excluded_category_ids,
    } = body

    const supabase = createServiceClient()

    const { data: existing } = await supabase.from('catalog_settings').select('id').limit(1)

    let error
    if (existing && existing.length > 0) {
      const targetId = existing[0].id
      const res = await supabase
        .from('catalog_settings')
        .update({
          title,
          subtitle,
          price_adjustment_percent: Number(price_adjustment_percent) || 0,
          show_variants: Boolean(show_variants),
          distributor_notes,
          legal_terms,
          business_terms,
          excluded_product_ids: excluded_product_ids || [],
          excluded_category_ids: excluded_category_ids || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetId)
      error = res.error
    } else {
      const res = await supabase.from('catalog_settings').insert({
        title: title || '2026 WHOLESALE DISTRIBUTOR CATALOG',
        subtitle,
        price_adjustment_percent: Number(price_adjustment_percent) || 0,
        show_variants: Boolean(show_variants),
        distributor_notes,
        legal_terms,
        business_terms,
        excluded_product_ids: excluded_product_ids || [],
        excluded_category_ids: excluded_category_ids || [],
      })
      error = res.error
    }

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Catalog settings saved successfully' })
  } catch (err: any) {
    console.error('API /api/admin/catalog error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
