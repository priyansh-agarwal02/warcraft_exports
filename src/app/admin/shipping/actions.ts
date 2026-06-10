"use server"

import { revalidatePath } from "next/cache"

export async function saveRate(formData: FormData) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  const countryCode = (formData.get("country_code") as string).trim().toUpperCase()
  
  const data = {
    country_code: countryCode,
    country_name: (formData.get("country_name") as string).trim(),
    standard_price: parseFloat(formData.get("standard_price") as string) || 0,
    standard_days: (formData.get("standard_days") as string).trim(),
    express_price: parseFloat(formData.get("express_price") as string) || 0,
    express_days: (formData.get("express_days") as string).trim(),
    free_threshold: parseFloat(formData.get("free_threshold") as string) || 0,
  }
  
  if (id) {
    const { error } = await supabase.from("shipping_rates").update(data).eq("id", id)
    if (error) {
      console.error("Error updating shipping rate:", error)
      throw new Error(error.message)
    }
  } else {
    // Check if the country code already exists
    const { data: existing, error: checkError } = await supabase
      .from("shipping_rates")
      .select("id")
      .eq("country_code", countryCode)
      .maybeSingle()
      
    if (checkError) {
      console.error("Error checking existing shipping rate:", checkError)
      throw new Error(checkError.message)
    }

    if (existing) {
      // Update the existing record instead of inserting a duplicate
      const { error } = await supabase
        .from("shipping_rates")
        .update(data)
        .eq("id", existing.id)
      if (error) {
        console.error("Error updating existing shipping rate:", error)
        throw new Error(error.message)
      }
    } else {
      // Insert new record
      const { error } = await supabase.from("shipping_rates").insert(data)
      if (error) {
        console.error("Error inserting shipping rate:", error)
        throw new Error(error.message)
      }
    }
  }
  revalidatePath("/admin/shipping")
}


export async function deleteRate(formData: FormData) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("id") as string
  
  const { error } = await supabase.from("shipping_rates").delete().eq("id", id)
  if (error) {
    console.error("Error deleting shipping rate:", error)
    throw new Error(error.message)
  }
  revalidatePath("/admin/shipping")
}

