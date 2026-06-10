import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: rates, error } = await supabase
      .from("shipping_rates")
      .select("*")
      .order("country_name", { ascending: true })

    if (error) {
      console.error("GET /api/shipping-rates database error:", error)
      return NextResponse.json({ error: "Failed to fetch shipping rates" }, { status: 500 })
    }

    return NextResponse.json({ rates })
  } catch (err) {
    console.error("GET /api/shipping-rates error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
