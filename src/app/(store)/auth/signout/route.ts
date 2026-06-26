import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// GET — handles direct browser navigation: window.location.href = "/auth/signout"
export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

// POST — kept for backwards compatibility
export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
