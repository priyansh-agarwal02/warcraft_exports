"use server"

import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function getUserProfile() {
  try {
    const cookieStore = await cookies()
    const supabaseSession = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { session } } = await supabaseSession.auth.getSession()
    if (!session?.user?.id) return null

    // Use Service Role to bypass RLS infinite recursion on `profiles`
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email, role, avatar_url")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("[SERVER ACTION] Error fetching profile:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("[SERVER ACTION] Profile exception:", err)
    return null
  }
}
