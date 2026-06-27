export const siteConfig = {
  name: "Warcraft Exports®",
  tagline: "Historical Reproduction Gear — Crafted in India, Shipped Worldwide",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  email: "support@warcraftexports.com",
  phone: "+91 9839035193",
  address: "Fazalgunj, Kanpur, Uttar Pradesh 208012, India",

  social: {
    amazon: "https://www.amazon.com/stores/WarcraftExports/page/3230F619-1D84-409B-A959-DD6873E12497",
    ebay: "https://www.ebay.com/str/warcraftexports",       // TBD — owner to provide
    walmart: "https://www.walmart.com/browse/0?facet=brand:Warcraft+Exports",    // TBD — owner to provide
  },

  brand: {
    yearsInBusiness: "8+",
    countriesServed: "20+",
    ordersFulfilled: "100K+",
    products: "300+",
  },

  currencies: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"] as const,
  defaultCurrency: "USD" as const,

  nations: ["US", "German", "British", "Japanese", "Soviet", "French", "Italian", "Universal"] as const,
  navNations: ["US", "German", "British", "Japanese", "Soviet"] as const, // Italian excluded from nav (Amendment 011), French excluded (shows French in nation but not there)
  eras: ["WW1", "WW2", "Cold War", "Modern Tactical", "Universal"] as const,

  wholesale: {
    minQty: 100,   // Amendment 002: minimum 100 pieces per order
  },

  features: {
    blog: false,
    threeD: true,     // renders only if product.model_3d_url is set (Amendment 012)
    reviews: true,
    wishlist: true,
    chatbot: true,
  },

  tax: {
    enabled: false,   // Amendment 006: tax = $0 in v1, show disclaimer only
    disclaimer: "Taxes and duties may apply on import — buyer is responsible.",
  },

  announcements: [
    "Free worldwide shipping on orders over $50",
    "Authentic WW2 reproduction gear — made in India since 2017",
    "Trusted by reenactors in 20+ countries",
  ],
} as const;

export type Nation = typeof siteConfig.nations[number];
export type Era = typeof siteConfig.eras[number];
export type Currency = typeof siteConfig.currencies[number];
