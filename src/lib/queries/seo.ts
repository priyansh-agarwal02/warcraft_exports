import { createClient } from "@/lib/supabase/client"
import { createServiceClient } from "@/lib/supabase/service"

export async function getPageSeo(pageName: string): Promise<{ meta_title: string | null; meta_description: string | null } | null> {
  try {
    // Use service client for server environments to avoid RLS restrictions on metadata lookups
    const isServer = typeof window === "undefined"
    const supabase = isServer ? createServiceClient() : createClient()
    
    const { data, error } = await supabase
      .from("page_seo")
      .select("meta_title, meta_description")
      .eq("page", pageName)
      .maybeSingle()

    if (error) {
      console.error(`Error loading page SEO for ${pageName}:`, error.message)
      return null
    }

    return data
  } catch (err) {
    console.error(`Failed to load page SEO for ${pageName}:`, err)
    return null
  }
}
