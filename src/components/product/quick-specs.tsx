import { Archive, Truck, ShieldCheck, Lock, CreditCard } from "lucide-react"

export function QuickSpecs({ sku }: { sku: string }) {
  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Box Container */}
      <div className="w-full bg-[#F3F3F3] border border-[#C6C8B8] flex flex-col p-4">
        
        {/* Row 1: SKU */}
        <div className="flex items-center justify-between pb-3 border-b border-[#C6C8B8]/50">
          <div className="flex items-center gap-2">
            <Archive size={14} className="text-[#45483C]" />
            <span className="font-sans font-bold text-[14px] text-[#45483C]">SKU</span>
          </div>
          <span className="font-mono text-[14px] text-[#45483C]">{sku}</span>
        </div>

        {/* Row 2: Shipping */}
        <div className="flex items-center justify-between py-3 border-b border-[#C6C8B8]/50">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-[#45483C]" />
            <span className="font-sans font-bold text-[14px] text-[#45483C]">Shipping</span>
          </div>
          <span className="font-sans text-[14px] text-[#45483C]">Calculated at checkout</span>
        </div>

        {/* Row 3: Guarantee */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#45483C]" />
            <span className="font-sans font-bold text-[14px] text-[#45483C]">Guarantee</span>
          </div>
          <span className="font-sans text-[14px] text-[#45483C]">30-Day Authenticity</span>
        </div>

      </div>

      {/* Secure Transaction Badge */}
      <div className="flex items-center justify-center gap-3 py-1">
        <Lock size={16} className="text-[#566065]" />
        <CreditCard size={20} className="text-[#566065]" />
        <span className="font-sans text-[10px] uppercase text-[#566065] tracking-[0.05em] ml-1">
          SECURE TRANSACTION
        </span>
      </div>
    </div>
  )
}
