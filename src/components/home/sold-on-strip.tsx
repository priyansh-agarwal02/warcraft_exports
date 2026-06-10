import LogoCarousel from "@/components/LogoCarousel";

const SOLD_ON_LOGOS = [
  { src: "/logos/amazon.svg", alt: "Amazon", href: "https://www.amazon.com/stores/WarcraftExports/page/3230F619-1D84-409B-A959-DD6873E12497" },
  { src: "/logos/ebay.svg", alt: "eBay", href: "https://www.ebay.com/str/warcraftexports" },
  { src: "/logos/walmart.svg", alt: "Walmart", href: "https://www.walmart.com/browse/0?facet=brand:Warcraft+Exports" },
  { src: "/logos/etsy.svg", alt: "Etsy" },
];

export function SoldOnStrip() {
  return <LogoCarousel title="TRUSTED ON LEADING MARKETPLACES" logos={SOLD_ON_LOGOS} />;
}
