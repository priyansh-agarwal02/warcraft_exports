"use client"

import type { ProductDetail } from "@/types/product"

interface ProductTabsProps {
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

export function ProductTabs({ description, shortDescription, specs, features, specifications }: ProductTabsProps) {
  const content = description ?? shortDescription ?? null

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
