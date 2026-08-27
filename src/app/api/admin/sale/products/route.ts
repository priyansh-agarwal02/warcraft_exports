import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

// M-1 FIX: Lazy-evaluate service credentials at request time
function getServiceConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return {
    url,
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    } as Record<string, string>,
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const svc = getServiceConfig()

  // Query all active products with sale fields, ordered by name
  const res = await fetch(
    `${svc.url}/rest/v1/products?select=id,name,sku,price_usd,sale_price_usd,is_on_sale,stock_quantity,images:product_images(url)&is_active=eq.true&order=name.asc`,
    {
      method: "GET",
      headers: svc.headers,
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    return NextResponse.json({ error: errorText }, { status: res.status })
  }

  const products = await res.json()
  return NextResponse.json({ products })
}

