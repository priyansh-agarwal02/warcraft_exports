export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-8 animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-[#E4E4E7] rounded-sm" />
        <div className="h-8 w-32 bg-[#E4E4E7] rounded-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-[#E4E4E7] rounded-sm p-4 space-y-3">
            <div className="h-4 w-24 bg-[#F4F4F4] rounded-sm" />
            <div className="h-7 w-32 bg-[#F4F4F4] rounded-sm" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-white border border-[#E4E4E7] rounded-sm p-6 space-y-4">
        <div className="h-5 w-40 bg-[#F4F4F4] rounded-sm" />
        <div className="h-40 bg-[#FAFAF9] rounded-sm" />
      </div>
    </div>
  )
}
