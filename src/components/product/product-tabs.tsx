"use client"

import type { ProductDetail } from "@/types/product"

interface ProductTabsProps {
  productName?: string
  description: string | null
  shortDescription: string | null
  specs: {
    material: string | null
    style: string | null
    weight_kg: number | null
    nation: string | null
    era: string | null
    sku: string
  }
  features: string[]
  specifications: Record<string, string>
}

export function ProductTabs({ productName, description, shortDescription, specs, features, specifications }: ProductTabsProps) {
  const content = description ?? shortDescription ?? null

  // Determine item-specific historical specification copy dynamically
  const nameLower = (productName ?? "").toLowerCase()
  let extraHeading = "Historical Reproductions & Reenactment Standard"
  let extraContent = "Every historical reproduction from Warcraft Exports is crafted in our Kanpur workshop using period-accurate materials, heavy-duty stitching, and solid hardware. Engineered for living history reenactors, museum curators, and film armorers requiring authentic WWI & WWII specifications."

  if (nameLower.includes("sling") || nameLower.includes("garand") || nameLower.includes("enfield") || nameLower.includes("mauser") || nameLower.includes("mosin")) {
    extraHeading = "Rifle Sling Specifications & Historical Hardware"
    extraContent = "Authentic reproduction military rifle sling built to historical WWI & WWII ordnance department specifications. Features heavy-duty cotton canvas webbing or vegetable-tanned oil-treated leather, steel/brass adjustment keepers, and authentic mounting hardware. Fully compatible with M1 Garand, Lee Enfield SMLE / No.4, Mauser G98 / K98, Mosin Nagant, and vintage military rifles for living history reenactment."
  } else if (nameLower.includes("helmet") || nameLower.includes("liner") || nameLower.includes("stahlhelm") || nameLower.includes("brodie")) {
    extraHeading = "Military Helmet & Liner Specifications"
    extraContent = "Period-accurate reproduction military steel helmet and liner constructed to authentic wartime specifications. Includes authentic webbing suspension, leather sweatband, and adjustable chinstraps. Ideal for WWII M1 helmet liners, M1917A1 Doughboy helmets, German M16/M35/M40/M42 Stahlhelm replicas, and British Brodie helmets."
  } else if (nameLower.includes("musette") || nameLower.includes("bag") || nameLower.includes("pouch") || nameLower.includes("haversack") || nameLower.includes("first aid")) {
    extraHeading = "Field Gear & Webbing Loadout Specifications"
    extraContent = "Museum-grade reproduction military webbing & field gear manufactured in our Kanpur workshop. Features heavy OD cotton duck canvas or thick vegetable-tanned leather, heavy-duty snap fasteners, and authentic USGI / Wehrmacht markings. Perfect for M1936 musette bags, M1910 first aid pouches, MP40 / 1911 mag pouches, and reenactment impression loadouts."
  } else if (nameLower.includes("jacket") || nameLower.includes("tunic") || nameLower.includes("uniform") || nameLower.includes("trouser") || nameLower.includes("smock")) {
    extraHeading = "Historical Uniform Tailoring & Cloth Standard"
    extraContent = "Crafted by master tailors in Kanpur, India using period-authentic wool, HBT cotton, or heavy canvas weave matching original wartime patterns. Features authentic pebble buttons, rank loops, and historical lining for WW1 Tommy tunics, US M41/M43 field jackets, German Wehrmacht M43 tunics, and Red Army Gymnasterka."
  }

  const specRows: { label: string; value: string }[] = [
    { label: "SKU", value: specs.sku },
    { label: "Nation", value: specs.nation ?? "" },
    { label: "Era", value: specs.era ?? "" },
    { label: "Material", value: specs.material ?? "" },
    { label: "Style", value: specs.style ?? "" },
    { label: "Weight", value: specs.weight_kg ? `${specs.weight_kg} kg (approx)` : "" },
    ...Object.entries(specifications).map(([k, v]) => ({ label: k, value: String(v) })),
  ].filter((r) => r.value)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12 mt-4 pt-12 border-t-2 border-khaki/30">
      
      {/* Left Column: Description */}
      <div className="flex flex-col">
        <h2 className="font-heading text-[24px] uppercase text-leather-dark font-black mb-6 tracking-[0.02em]">
          Description
        </h2>
        <div className="max-w-prose">
          {content ? (
            <p className="text-[15px] font-sans text-leather-dark/90 leading-[1.8]">
              {content}
            </p>
          ) : (
            <p className="text-sm font-sans text-khaki italic">No description available.</p>
          )}

          {features.length > 0 && (
            <ul className="mt-8 space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] font-sans text-leather-dark/90">
                  <span className="text-leather mt-1 text-[10px]">◆</span>
                  {String(f)}
                </li>
              ))}
            </ul>
          )}

          {/* Supplementary Item-Specific Historical Specifications & Reenactment Notes (Additive) */}
          <div className="mt-8 pt-6 border-t border-khaki/30">
            <h3 className="font-heading text-[15px] uppercase text-leather-dark font-bold mb-2 tracking-wide">
              {extraHeading}
            </h3>
            <p className="text-[13px] font-sans text-leather/80 leading-relaxed">
              {extraContent}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Specifications Table */}
      <div className="flex flex-col w-full bg-white border border-[#C6C8B8] h-fit">
        
        {/* Table Header */}
        <div className="bg-[#E8E8E8] border-b border-[#C6C8B8] px-4 py-3">
          <h3 className="font-sans text-[12px] uppercase tracking-[1.2px] text-[#1A1C1C]">
            Technical Specifications
          </h3>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {specRows.length > 0 ? (
            specRows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-2 px-4 py-4 ${
                  idx !== specRows.length - 1 ? "border-b border-[#C6C8B8]" : ""
                }`}
              >
                <div className="font-sans font-bold text-[14px] text-[#566065]">
                  {row.label}
                </div>
                <div className="font-sans text-[14px] text-[#1A1C1C]">
                  {row.value}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm font-sans text-khaki italic">No specifications available.</p>
            </div>
          )}
        </div>

      </div>
      
    </div>
  )
}
