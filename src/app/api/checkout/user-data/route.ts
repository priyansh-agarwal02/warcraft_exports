import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    let user: any = null

    // 1. Try Bearer token from Authorization header
    const authHeader = req.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim()
      if (token) {
        const supabaseAnon = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabaseAnon.auth.getUser(token)
        user = data?.user
      }
    }

    // 2. Fallback to server cookies
    if (!user) {
      try {
        const supabaseAuth = await createServerClient()
        const { data } = await supabaseAuth.auth.getUser()
        user = data?.user
      } catch {
        // Ignore cookie parsing error
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 3. Bypass RLS using service role client to reliably fetch user profile, addresses, and recent order fallback
    const serviceClient = createServiceClient()
    const [{ data: profile }, { data: addresses }, { data: recentOrder }] = await Promise.all([
      serviceClient.from("profiles").select("full_name, phone, email").eq("id", user.id).maybeSingle(),
      serviceClient.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
      serviceClient.from("orders").select("customer_name, customer_email, customer_phone, shipping_address").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ])

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        metaName: user.user_metadata?.full_name || user.user_metadata?.name || "",
        metaPhone: user.user_metadata?.phone || "",
      },
      profile: profile || null,
      addresses: addresses || [],
      recentOrder: recentOrder || null,
    })
  } catch (err: any) {
    console.error("GET /api/checkout/user-data error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
