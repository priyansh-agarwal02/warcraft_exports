import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export type AdminAuthResult =
  | { error: NextResponse; userId: null }
  | { error: null; userId: string }

export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("[requireAdmin] auth.getUser failed:", userError?.message || "No user");
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[requireAdmin] profile query failed:", profileError.message);
  }

  if (profile?.role !== "admin") {
    console.error("[requireAdmin] user is not admin. Role:", profile?.role, "Email:", profile?.email);
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), userId: null }
  }

  console.log("[requireAdmin] admin authorization successful for:", profile.email);
  return { error: null, userId: user.id }
}

