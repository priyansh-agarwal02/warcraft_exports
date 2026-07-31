import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { B2BTable, WholesaleInquiry } from "@/components/admin/b2b-table"

export const metadata: Metadata = { title: "B2B Enquiries — Warcraft Exports Admin" }

async function markContacted(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("wholesale_inquiries").update({ status: "contacted" }).eq("id", id)
  revalidatePath("/admin/b2b")
}

async function markClosed(id: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("wholesale_inquiries").update({ status: "closed" }).eq("id", id)
  revalidatePath("/admin/b2b")
}

export default async function AdminB2BPage() {
  const supabase = await createClient()
  const { data: rawInquiries } = await supabase
    .from("wholesale_inquiries")
    .select("id, company_name, contact_name, email, phone, country, business_type, estimated_monthly_volume, message, status, admin_notes, created_at")
    .order("created_at", { ascending: false })

  const inquiries = (rawInquiries || []) as WholesaleInquiry[]

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">B2B Enquiries</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">{inquiries.length} wholesale inquiries</p>
      </div>

      <B2BTable
        inquiries={inquiries}
        onMarkContacted={markContacted}
        onMarkClosed={markClosed}
      />
    </div>
  )
}
