import { createClient } from "@/lib/supabase/server"
import { ShippingRatesTable } from "@/components/admin/shipping-rates-table"
import { saveRate } from "./actions"

// Demo shipping rates as initial data
const DEMO_RATES = [
  { id: "1", country_code: "US", country_name: "United States", standard_days: "7-14", standard_price: 14.99, express_days: "3-5", express_price: 34.99, free_threshold: 150 },
  { id: "2", country_code: "GB", country_name: "United Kingdom", standard_days: "8-14", standard_price: 12.99, express_days: "3-5", express_price: 32.99, free_threshold: 150 },
  { id: "3", country_code: "DE", country_name: "Germany", standard_days: "8-14", standard_price: 12.99, express_days: "3-5", express_price: 32.99, free_threshold: 150 },
  { id: "4", country_code: "AU", country_name: "Australia", standard_days: "10-20", standard_price: 16.99, express_days: "5-8", express_price: 42.99, free_threshold: 150 },
  { id: "5", country_code: "JP", country_name: "Japan", standard_days: "10-18", standard_price: 16.99, express_days: "5-8", express_price: 39.99, free_threshold: 150 },
  { id: "6", country_code: "CA", country_name: "Canada", standard_days: "8-16", standard_price: 14.99, express_days: "4-6", express_price: 34.99, free_threshold: 150 },
  { id: "7", country_code: "FR", country_name: "France", standard_days: "8-14", standard_price: 12.99, express_days: "3-5", express_price: 32.99, free_threshold: 150 },
  { id: "8", country_code: "NL", country_name: "Netherlands", standard_days: "8-14", standard_price: 12.99, express_days: "3-5", express_price: 32.99, free_threshold: 150 },
  { id: "9", country_code: "SE", country_name: "Sweden", standard_days: "8-14", standard_price: 13.99, express_days: "4-6", express_price: 33.99, free_threshold: 150 },
  { id: "10", country_code: "OTHER", country_name: "Rest of World", standard_days: "12-25", standard_price: 19.99, express_days: "5-8", express_price: 49.99, free_threshold: 150 },
]

// Local actions moved to actions.ts

export default async function AdminShippingPage() {
  const supabase = await createClient()
  let { data: rates, error } = await supabase
    .from("shipping_rates")
    .select("*")
    .order("country_name", { ascending: true })

  const tableExists = !(error && error.code === "PGRST205")

  // Seed the database automatically if the table exists and is empty
  if (tableExists && (!rates || rates.length === 0)) {
    const { createServiceClient } = await import("@/lib/supabase/service")
    const serviceClient = createServiceClient()
    const seedData = DEMO_RATES.map(({ id, ...rest }) => rest)
    await serviceClient.from("shipping_rates").insert(seedData)
    
    // Fetch seeded rates
    const { data: freshRates } = await supabase
      .from("shipping_rates")
      .select("*")
      .order("country_name", { ascending: true })
    rates = freshRates ?? []
  }

  const INPUT = "w-full border border-[#E4E4E7] bg-white px-2 py-1.5 text-[12px] font-sans text-[#18181B] focus:outline-none focus:border-[#33450D]"

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Shipping Configuration</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-1">
          Configure standard and express shipping rates by destination. Free shipping threshold applies to all destinations.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-[#33450D]/10 border border-[#33450D]/20 p-4 mb-6 text-[12px] font-sans text-[#33450D]">
        <strong>Free Shipping Threshold:</strong> Orders above the threshold qualify for free standard shipping. Currently set per-country.
        Express shipping always has a fixed charge regardless of order value.
      </div>

      {!tableExists ? (
        <div className="bg-amber-50 border border-amber-200 p-5 text-[13px] font-sans text-amber-800 mb-8 animate-custom-fade-in">
          <p className="font-bold mb-1">Table not set up yet</p>
          <p className="mb-3">
            The <code className="bg-amber-100 px-1 rounded text-[12px]">shipping_rates</code> table does not exist in your database.
          </p>
          <p>
            Please copy and run the SQL commands in <code className="bg-amber-100 px-1 rounded text-[12px]">supabase/migrations/006_shipping_rates.sql</code> inside your Supabase SQL Editor to create and configure the table.
          </p>
        </div>
      ) : (
        <>
          <ShippingRatesTable rates={rates || []} />

          {/* Add new rate form */}
          <div className="bg-white border border-[#E4E4E7] p-6 animate-custom-fade-in">
            <h2 className="font-heading text-[16px] text-[#18181B] uppercase mb-5">Add / Update Rate</h2>
            <form action={saveRate} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <input type="hidden" name="id" value="" />
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Country Code *</label>
                <input name="country_code" type="text" required placeholder="US" maxLength={10} className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Country Name *</label>
                <input name="country_name" type="text" required placeholder="United States" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Standard Price ($) *</label>
                <input name="standard_price" type="number" step="0.01" required placeholder="14.99" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Standard Days *</label>
                <input name="standard_days" type="text" required placeholder="7-14" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Express Price ($) *</label>
                <input name="express_price" type="number" step="0.01" required placeholder="34.99" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Express Days *</label>
                <input name="express_days" type="text" required placeholder="3-5" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] mb-1.5">Free Threshold ($) *</label>
                <input name="free_threshold" type="number" step="1" required placeholder="150" className={INPUT} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.1em] py-2 hover:bg-[#4A5D23] transition-colors">
                  Add Rate
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
