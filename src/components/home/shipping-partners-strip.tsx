import LogoCarousel from "@/components/LogoCarousel";

const SHIPPING_LOGOS = [
  { src: "/logos/dhl.svg", alt: "DHL" },
  { src: "/logos/fedex.svg", alt: "FedEx" },
  { src: "/logos/shipglobal.png", alt: "ShipGlobal" },
  { src: "/logos/bombino.png", alt: "Bombino Express" },
  { src: "/logos/usps.svg", alt: "USPS" },
  { src: "/logos/indiapost.svg", alt: "India Post" },
];

export function ShippingPartnersStrip() {
  return <LogoCarousel title="SHIPPING PARTNERS" logos={SHIPPING_LOGOS} />;
}
