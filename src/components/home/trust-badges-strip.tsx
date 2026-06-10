export function TrustBadgesStrip() {
  return (
    <section className="w-full bg-black border-y border-[#3b342c]">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

          {/* Item 1 */}
          <div className="flex items-center gap-4 px-6 py-5 border-b lg:border-b-0 lg:border-r border-[#3b342c]">
            <div className="text-[#d6c3a5] text-4xl opacity-90">
              🚚
            </div>

            <div>
              <h3 className="text-white text-[15px] font-black uppercase tracking-[0.02em] leading-none font-heading mb-1">
                Free Domestic Shipping
              </h3>
              <p className="text-white/80 text-[12px] font-black uppercase tracking-[0.04em] leading-none font-heading">
                on orders $500+
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-4 px-6 py-5 border-b lg:border-b-0 lg:border-r border-[#3b342c]">
            <div className="text-white text-4xl opacity-90">
              ↩
            </div>
            <div>
              <h3 className="text-white text-[15px] font-black uppercase tracking-[0.02em] leading-none font-heading mb-1">
                Hassle Free 30 Day
              </h3>
              <p className="text-white/80 text-[12px] font-black uppercase tracking-[0.04em] leading-none font-heading">
                Return Period
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-4 px-6 py-5 border-b md:border-b-0 lg:border-r border-[#3b342c]">
            <div className="text-white text-4xl opacity-90">
              🛒
            </div>
            <div>
              <h3 className="text-white text-[15px] font-black uppercase tracking-[0.02em] leading-none font-heading mb-1">
                100% Safe
              </h3>
              <p className="text-white/80 text-[12px] font-black uppercase tracking-[0.04em] leading-none font-heading">
                Secure Checkout
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="text-white text-4xl opacity-90">
              🏅
            </div>
            <div>
              <h3 className="text-white text-[15px] font-black uppercase tracking-[0.02em] leading-none font-heading mb-1">
                Guaranteed Authentic
              </h3>
              <p className="text-white/80 text-[12px] font-black uppercase tracking-[0.04em] leading-none font-heading">
                to the Historical Period
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
