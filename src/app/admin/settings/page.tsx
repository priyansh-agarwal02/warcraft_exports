export default function AdminSettingsPage() {
  return (
    <div className="p-4 sm:p-8">
      <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight mb-2">Settings</h1>
      <div className="bg-white border border-[#E4E4E7] p-6 max-w-lg">
        <p className="text-[13px] font-sans text-[#71717A] mb-4">Configure your store settings below.</p>
        <div className="space-y-4 text-[13px] font-sans">
          <div className="flex justify-between items-center py-3 border-b border-[#F4F4F4]">
            <span className="text-[#18181B] font-medium">Supabase Project</span>
            <span className="text-[#71717A] font-mono text-[11px]">arqanxcxcydzyjibxecl</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#F4F4F4]">
            <span className="text-[#18181B] font-medium">Currency</span>
            <span className="text-[#71717A]">USD</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#F4F4F4]">
            <span className="text-[#18181B] font-medium">Store Status</span>
            <span className="text-green-600 font-bold">Live</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-[#18181B] font-medium">Payment</span>
            <span className="text-amber-600">Razorpay — Add keys to go live</span>
          </div>
        </div>
      </div>
    </div>
  )
}
