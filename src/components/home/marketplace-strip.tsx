const MARKETPLACES = ["Amazon", "eBay", "Walmart", "Google Shopping", "Amazon UK", "Amazon DE", "Amazon JP", "eBay UK"]
const SHIPPERS = ["DHL Express", "FedEx International", "Ship Global", "Bombino Express", "USPS Priority", "India Post EMS"]

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-8 w-max ${reverse ? "animate-marquee-slow" : "animate-marquee"}`}
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-[11px] font-sans font-700 uppercase tracking-[0.15em] text-leather whitespace-nowrap">
            <span className="w-1 h-1 bg-gold rounded-full flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function MarketplaceStrip() {
  return (
    <section className="py-10 bg-canvas border-y border-khaki/40 overflow-hidden space-y-3">
      <div className="mb-1 text-center">
        <p className="text-[9px] font-sans font-700 uppercase tracking-[0.2em] text-khaki">
          Sold On · Shipped With
        </p>
      </div>
      <MarqueeRow items={MARKETPLACES} />
      <MarqueeRow items={SHIPPERS} reverse />
    </section>
  )
}
