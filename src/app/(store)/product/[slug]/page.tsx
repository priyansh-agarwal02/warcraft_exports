import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getProductBySlug, getProducts } from "@/lib/queries/products"
import { ProductImageGallery } from "@/components/product/image-gallery"
import { ProductActions } from "@/components/product/product-actions"
import { ProductTabs } from "@/components/product/product-tabs"
import { ProductCard } from "@/components/products/product-card"
import { QuickSpecs } from "@/components/product/quick-specs"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product Not Found — Warcraft Exports" }

  const BASE_URL = process.env.NODE_ENV === "production"
    ? "https://www.warcraftexports.com"
    : (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.warcraftexports.com")
  const heroImage = product.images.find((img) => img.is_hero)?.url ?? product.images[0]?.url
  const description = product.short_description ?? `Buy ${product.name} — WW1 & WW2 reproduction military gear from Warcraft Exports. Ships worldwide.`
  const price = product.sale_price_usd ?? product.price_usd

  const eraLabel = product.era ? ` ${product.era}` : ""
  const nationLabel = product.nation && product.nation !== "Universal" ? ` ${product.nation}` : ""
  const title = `${product.name}${nationLabel}${eraLabel} Reproduction | Warcraft Exports`

  // Master 22-Cluster Keyword & Intent Classification Engine
  const keywordSet = new Set<string>()
  const pName = (product.name ?? "").toLowerCase()
  const pDesc = (product.description ?? "").toLowerCase()
  const pShort = (product.short_description ?? "").toLowerCase()
  const pText = `${pName} ${pDesc} ${pShort}`

  if (product.name) {
    keywordSet.add(product.name.toLowerCase())
    const nameWords = product.name.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, "").trim()).filter(w => w.length > 1)
    nameWords.forEach(w => {
      const lower = w.toLowerCase()
      if (!["and", "with", "for", "the", "reproduction", "gear"].includes(lower)) {
        keywordSet.add(lower)
      }
    })
    for (let i = 0; i < nameWords.length - 1; i++) {
      keywordSet.add(`${nameWords[i]} ${nameWords[i+1]}`.toLowerCase())
    }
  }

  const nation = product.nation ?? ""
  const era = product.era ?? ""
  const material = product.material ?? ""
  const style = product.style ?? ""
  const categoryName = product.category?.name ?? ""

  if (nation && nation !== "Universal") {
    keywordSet.add(nation.toLowerCase())
    keywordSet.add(`${nation} militaria`.toLowerCase())
    keywordSet.add(`${nation} reproduction`.toLowerCase())
    keywordSet.add(`${nation} military gear`.toLowerCase())
  }
  if (era && era !== "Universal") {
    keywordSet.add(era.toLowerCase())
    keywordSet.add(`${era} reproduction`.toLowerCase())
    keywordSet.add(`${era} military collectibles`.toLowerCase())
  }
  if (nation && era && nation !== "Universal" && era !== "Universal") {
    keywordSet.add(`${era} ${nation}`.toLowerCase())
    keywordSet.add(`${era} ${nation} gear`.toLowerCase())
    keywordSet.add(`${era} ${nation} reproduction`.toLowerCase())
  }
  if (material) {
    keywordSet.add(material.toLowerCase())
    if (categoryName) keywordSet.add(`${material} ${categoryName}`.toLowerCase())
  }
  if (style) {
    keywordSet.add(style.toLowerCase())
  }
  if (era && nation && categoryName && nation !== "Universal" && era !== "Universal") {
    keywordSet.add(`${era} ${nation} ${categoryName}`.toLowerCase())
  }
  if (product.tags && Array.isArray(product.tags)) {
    product.tags.forEach((tag: string) => {
      if (tag) {
        const cleanTag = tag.trim().toLowerCase()
        keywordSet.add(cleanTag)
        keywordSet.add(`warcraft exports ${cleanTag}`)
      }
    })
  }

  // 1. M1 Carbine & Combo Oiler
  if (pText.includes("carbine") || pText.includes("oiler") || pText.includes("m1 carbine")) {
    keywordSet.add("m1 carbine")
    keywordSet.add("m1 carbine accessories")
    keywordSet.add("m1 carbine sling")
    keywordSet.add("m1 carbine bayonet")
    keywordSet.add("m1 carbine magazine pouch")
    keywordSet.add("m1 carbine sling oiler buttstock pouch")
    keywordSet.add("od green m1 carbine pouch and oiler")
    keywordSet.add("airsoft m1 carbine sling")
    keywordSet.add("1907 carbine canvas")
  }

  // 2. 1907 Pattern M1 Steel Brown Leather Sling
  if (pText.includes("1907") || (pText.includes("leather") && pText.includes("sling"))) {
    keywordSet.add("1907 pattern leather sling")
    keywordSet.add("brown genuine leather military reproduction")
    keywordSet.add("hand stitched leather strap")
    keywordSet.add("copper rivets steel hardware")
    keywordSet.add("vintage military sling replacement")
    keywordSet.add("classic leather rifle strap")
    keywordSet.add("historical reproduction sling")
  }

  // 3. 1-Inch Sling & Buffalo Leather / Hunting
  if (pText.includes("buffalo") || pText.includes("hunting") || pText.includes("1 inch") || pText.includes("1\"")) {
    keywordSet.add("leather rifle sling")
    keywordSet.add("gun sling")
    keywordSet.add("shotgun sling")
    keywordSet.add("10/22 sling")
    keywordSet.add("buffalo leather hunting rifle strap")
    keywordSet.add("crazy horse leather gun")
    keywordSet.add("hand stitched leather sling")
    keywordSet.add("rifle strap for hunting")
    keywordSet.add("adjustable gun shoulder strap")
  }

  // 4. Western Cowboy & Revolver Holsters
  if (pText.includes("western") || pText.includes("cowboy") || pText.includes("revolver") || pText.includes("tooled")) {
    keywordSet.add("western holster")
    keywordSet.add("revolver holster")
    keywordSet.add("cowboy gun holster")
    keywordSet.add("leather revolver holster")
    keywordSet.add("22 revolver holster")
    keywordSet.add("cowboy holster .22 .38 .44 .45 .357 .358 caliber holster")
    keywordSet.add("4 to 8 inch barrel holster")
    keywordSet.add("western cowboy holster vintage")
    keywordSet.add("tooled leather holster")
  }

  // 5. Y-Strap & Suspenders
  if (pText.includes("y-strap") || pText.includes("y strap") || pText.includes("suspender") || pText.includes("braces")) {
    keywordSet.add("suspenders for men")
    keywordSet.add("leather suspenders for men")
    keywordSet.add("brown suspenders for men")
    keywordSet.add("occidental leather suspenders")
    keywordSet.add("genuine leather braces")
    keywordSet.add("adjustable shoulder straps")
    keywordSet.add("vintage leather straps")
    keywordSet.add("heavy duty leather suspenders")
    keywordSet.add("y strap costume accessories")
    keywordSet.add("durable leather harness")
  }

  // 6 & 8. Bandoliers (5-Pocket & 9-Pocket P1903 British & Jawa Costume)
  if (pText.includes("bandolier") || pText.includes("p1903") || pText.includes("p-1903") || pText.includes("jawa") || pText.includes("martini")) {
    keywordSet.add("bandolier")
    keywordSet.add("leather bandolier belt")
    keywordSet.add("leather bandolier")
    keywordSet.add("bandolier bag")
    keywordSet.add("crossbody ww1 gear")
    keywordSet.add("pirate bandolier")
    keywordSet.add("jawa products")
    keywordSet.add("german luger martini costume belt")
    keywordSet.add("magazine bandolier")
    keywordSet.add("costume bandolier")
    keywordSet.add("british p-1903 leather nine pocket bandolier")
    keywordSet.add("british army infantry military reproduction")
    keywordSet.add("p1903 1903 ww1 ammo clips shoulder rig")
  }

  // 7. 10-Pocket Khaki M1 Garand Belt
  if (pText.includes("10 pocket") || pText.includes("cartridge belt") || (pText.includes("garand") && pText.includes("belt"))) {
    keywordSet.add("m1 garand cartridge belt")
    keywordSet.add("m1 garand clips")
    keywordSet.add("ww2 rifles belt")
    keywordSet.add("cartridge ammunition ammo pouch")
    keywordSet.add("us airsoft webbing")
    keywordSet.add("8 round clips parts canvas")
    keywordSet.add("m1923 m1 garand cartridge 10 pocket canvas belt")
  }

  // 9. First Aid & Medical Pouch
  if (pText.includes("first aid") || pText.includes("medical") || pText.includes("m1910") || pText.includes("trauma")) {
    keywordSet.add("first aid pouch molle")
    keywordSet.add("medical pouch")
    keywordSet.add("ww2 uniform")
    keywordSet.add("ww1 gear")
    keywordSet.add("military surplus gear")
    keywordSet.add("ww2 german gear")
    keywordSet.add("roll 1 trauma pouch")
    keywordSet.add("canvas belt pouch")
    keywordSet.add("m1910 1st aid pouches")
    keywordSet.add("m1910 first aid kit")
  }

  // 10. M3 Shoulder & Chest Holster
  if (pText.includes("m3") || pText.includes("shoulder holster") || pText.includes("chest holster")) {
    keywordSet.add("m3 shoulder holster")
    keywordSet.add("revolver holster")
    keywordSet.add("44 mag holster")
    keywordSet.add("n frame holster")
    keywordSet.add("chest holster for revolver")
    keywordSet.add("taurus raging hunter holster")
    keywordSet.add("shoulder holster for men")
    keywordSet.add("chest holsters for pistols")
    keywordSet.add("snub nose revolver holster")
    keywordSet.add("38 special holster")
  }

  // 11. Chest Rig (Chicom & Rhodesian)
  if (pText.includes("chest rig") || pText.includes("chicom") || pText.includes("rhodesian")) {
    keywordSet.add("chest rig")
    keywordSet.add("rhodesian chicom chest rig")
    keywordSet.add("308 mag pouch")
    keywordSet.add("tactical chest rig")
    keywordSet.add("rhodesian brushstroke camo")
    keywordSet.add("krydex chest rig")
    keywordSet.add("split rig chest rig")
    keywordSet.add("7.62 mag pouch")
  }

  // 12. Cal Bag & Thompson / Grease Gun
  if (pText.includes("thompson") || pText.includes("grease gun") || pText.includes("cal bag") || pText.includes("d 90242")) {
    keywordSet.add("smg magazine pouch")
    keywordSet.add("grease gun holder")
    keywordSet.add("airsoft thompson")
    keywordSet.add("ww2 guns")
    keywordSet.add("thompson magazine pouch")
    keywordSet.add("thompson shoulder bag")
    keywordSet.add("cal bag 45 sub mg clip d 90242")
    keywordSet.add("thompson carry case pouch")
  }

  // 13. Kar98k K98 Mauser Sling
  if (pText.includes("kar98") || pText.includes("k98") || pText.includes("mauser") || pText.includes("g43") || pText.includes("yugo")) {
    keywordSet.add("kar98k leather rifle sling")
    keywordSet.add("ww2 german gear")
    keywordSet.add("mauser sling keeper")
    keywordSet.add("sks sling")
    keywordSet.add("kar98k airsoft")
    keywordSet.add("g43 accessories")
    keywordSet.add("dak kar98k")
    keywordSet.add("m98 yugo 98")
    keywordSet.add("k98 bayonet")
    keywordSet.add("m98 mauser rifle sling")
  }

  // 14. Kerr Sling & Springfield M1A1
  if (pText.includes("kerr") || pText.includes("m1a") || pText.includes("sr3") || pText.includes("1903")) {
    keywordSet.add("kerr sling")
    keywordSet.add("wwii sr3 sling")
    keywordSet.add("m1 carbine sling")
    keywordSet.add("m1a sling")
    keywordSet.add("m16 sling")
    keywordSet.add("lever action sling")
    keywordSet.add("thompson m1a1 carbine ww1 web 1907 rifle sling")
    keywordSet.add("warcraft exports us m1 kerr sling")
    keywordSet.add("1903 springfield clips")
    keywordSet.add("springfield m1a accessories")
  }

  // 15. M1 Garand & Web Sling
  if (pText.includes("garand") || pText.includes("web sling") || pText.includes("usgi")) {
    keywordSet.add("m1 garand sling")
    keywordSet.add("m16 sling")
    keywordSet.add("usgi sling")
    keywordSet.add("airsoft m1 garand")
    keywordSet.add("springfield m1a accessories")
    keywordSet.add("m1903 springfield sling")
    keywordSet.add("rifle web sling od green canvas cotton military sling")
    keywordSet.add("wwii rifle sling")
  }

  // 17. Double Magazine Pouch & Colt 1911
  if (pText.includes("1911") || pText.includes("magazine pouch") || pText.includes("mag pouch") || pText.includes("glock")) {
    keywordSet.add("leather magazine holder")
    keywordSet.add("glock 19 accessories")
    keywordSet.add("ammo storage mag pouch")
    keywordSet.add("9mm magazine holder")
    keywordSet.add("wwii mag pouch")
    keywordSet.add("colt 1911 magazine pouch")
    keywordSet.add("1911 mag holder")
    keywordSet.add("leather ammo pouch double magazine pouch")
    keywordSet.add("45 acp mag pouch")
  }

  // 18 & 20. Weapon Cases & Scabbards
  if (pText.includes("scabbard") || pText.includes("case") || pText.includes("cover") || pText.includes("fleece")) {
    keywordSet.add("m1 carry case")
    keywordSet.add("m1 carbine gun cover")
    keywordSet.add("canvas carry case for m1 garand rifle")
    keywordSet.add("wwii fleece lined m1 carbine case with carry strap marked us")
    keywordSet.add("m1 garand rifle scabbard")
    keywordSet.add("airsoft m1 garand")
    keywordSet.add("gun scabbard")
    keywordSet.add("soft gun cases for rifles")
  }

  // 19. Gaiters & Puttees Leg Wraps
  if (pText.includes("gaiter") || pText.includes("puttee") || pText.includes("leg wrap") || pText.includes("chaps")) {
    keywordSet.add("gaiters for hiking")
    keywordSet.add("ww2 gear")
    keywordSet.add("ww2 boots")
    keywordSet.add("boot gaiters")
    keywordSet.add("tick gaiters")
    keywordSet.add("leg gaiters for men")
    keywordSet.add("snake gaiters for men")
    keywordSet.add("ww2 costume puttees")
    keywordSet.add("ww2 uniform")
    keywordSet.add("puttees leg wraps")
    keywordSet.add("half chaps")
    keywordSet.add("surplus military equipment")
  }

  // 21. Wooden Urns (Pet & Human Keepsakes)
  if (pText.includes("urn") || pText.includes("ashes") || pText.includes("cremation")) {
    keywordSet.add("dog urn")
    keywordSet.add("urn for dog ashes")
    keywordSet.add("dog ashes keepsake")
    keywordSet.add("small dog urns for ashes")
    keywordSet.add("urn for cat ashes")
    keywordSet.add("pet urn")
    keywordSet.add("wooden dog cremation urns")
    keywordSet.add("wooden urns for human ashes")
    keywordSet.add("cremation boxes for human ashes")
    keywordSet.add("custom urns for human ashes")
  }

  // 22. MP38 / MP40 Pouch Set
  if (pText.includes("mp40") || pText.includes("mp38") || pText.includes("umarex")) {
    keywordSet.add("mp40 airsoft")
    keywordSet.add("umarex mp40 airsoft")
    keywordSet.add("mp40 airsoft gun")
    keywordSet.add("ww2 german gear")
    keywordSet.add("smg magazine pouch")
    keywordSet.add("leather ammo pouch")
  }

  // Universal High-Authority MilSurp & Reenactment Terms
  keywordSet.add("warcraft exports")
  keywordSet.add("historical reproduction")
  keywordSet.add("military reenactment gear")
  keywordSet.add("militaria collectibles")
  keywordSet.add("reenactor equipment")
  keywordSet.add("world war 2 gear")
  keywordSet.add("ww2 military surplus reproduction")
  keywordSet.add("military gear manufacturer")
  keywordSet.add("reproduction militaria direct")

  const finalKeywords = Array.from(keywordSet).filter(Boolean).slice(0, 50)

  return {
    title,
    description,
    keywords: finalKeywords,
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE_URL}/product/${slug}`,
      siteName: "Warcraft Exports",
      images: heroImage ? [{ url: heroImage, width: 800, height: 600, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: heroImage ? [heroImage] : [],
    },
    alternates: { canonical: `${BASE_URL}/product/${slug}` },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "USD",
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const BASE_URL = process.env.NODE_ENV === "production"
    ? "https://www.warcraftexports.com"
    : (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.warcraftexports.com")
  const heroImage = product.images.find((img) => img.is_hero)?.url ?? product.images[0]?.url ?? null

  // Fetch reviews for this product from the database
  let dbReviews: any[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("reviews")
      .select("reviewer_name, rating, title, body, created_at")
      .eq("product_id", product.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
    if (data) dbReviews = data
  } catch (err) {
    console.error("Failed to fetch product reviews for JSON-LD:", err)
  }

  const reviewsCount = dbReviews.length
  const avgRating = reviewsCount > 0
    ? Math.round((dbReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount) * 10) / 10
    : 5

  const aggregateRating = reviewsCount > 0 ? {
    "@type": "AggregateRating",
    ratingValue: String(avgRating),
    reviewCount: String(reviewsCount),
    bestRating: "5",
    worstRating: "1",
  } : undefined

  const reviewsJsonLd = reviewsCount > 0 ? dbReviews.map((r) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(r.rating),
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: r.reviewer_name || "Verified Collector",
    },
    datePublished: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : undefined,
    reviewBody: r.body || "",
    name: r.title || "",
  })) : undefined

  const safeSku = (product.sku && product.sku.trim())
    ? product.sku.trim()
    : `WE-${slug.toUpperCase().replace(/[^A-Z0-9-]/g, "")}`

  // JSON-LD Product structured data for Google Shopping & AI citation
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description ?? "",
    sku: safeSku,
    mpn: safeSku,
    image: product.images.map((img: { url: string }) => img.url),
    url: `${BASE_URL}/product/${slug}`,
    brand: {
      "@type": "Brand",
      name: "Warcraft Exports",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Warcraft Exports",
      address: { "@type": "PostalAddress", addressLocality: "Kanpur", addressCountry: "IN" },
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: String(product.sale_price_usd ?? product.price_usd),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/product/${slug}`,
      seller: { "@type": "Organization", name: "Warcraft Exports" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 5,
            maxValue: 12,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    audience: {
      "@type": "PeopleAudience",
      audienceType: "WW1 & WWII Reenactors, Militaria Collectors, and Film Prop Directors",
    },
    ...(product.material ? { material: product.material } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviewsJsonLd ? { review: reviewsJsonLd } : {}),
  }

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${BASE_URL}/shop` },
      ...(product.category ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${BASE_URL}/shop/category/${product.category.slug}` }] : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: `${BASE_URL}/product/${slug}` },
    ],
  }

  // Fetch related products (same nation, excluding current)
  const { products: allRelated } = await getProducts({ nation: product.nation ?? undefined, page: 1, sort: "featured" })
  const relatedProducts = allRelated.filter((p) => p.id !== product.id).slice(0, 4)

  const stockLabel = product.is_in_stock
    ? product.stock_quantity <= 10 ? `Only ${product.stock_quantity} left` : "In Stock"
    : "Out of Stock"

  return (
    <div className="bg-parchment min-h-screen">
      {/* Structured data for Google/AI */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-sans text-khaki mb-10 uppercase tracking-[0.08em]">
          <Link href="/" className="hover:text-leather-dark transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-leather-dark transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop/category/${product.category.slug}`} className="hover:text-leather-dark transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-leather-dark">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image gallery */}
          <ProductImageGallery 
            images={product.images} 
            productName={product.name} 
            nation={product.nation}
            era={product.era}
            isFeatured={product.is_featured}
            shipsFromUsa={product.ships_from_usa}
          />

          {/* Product info */}
          <div className="flex flex-col gap-5">
            {/* Tags moved to image gallery */}

            {/* Product name */}
            <h1 className="font-heading text-[32px] leading-[1.1] tracking-[-0.02em] text-leather-dark uppercase font-black">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="text-[10px] font-sans text-khaki uppercase tracking-[0.1em]">
              SKU: {product.sku}
            </p>

            {/* Stock */}
            <p className={`text-[11px] font-sans font-bold uppercase tracking-[0.1em] flex items-center gap-2 ${product.is_in_stock ? "text-leather" : "text-red-700"}`}>
              <span className={`w-2 h-2 rounded-full ${product.is_in_stock ? "bg-leather" : "bg-red-700"}`} />
              {stockLabel}
            </p>

            {product.ships_from_usa && (
              <div className="bg-[#1D70B8]/10 border border-[#1D70B8]/20 px-4 py-3 flex items-start gap-3 text-leather-dark text-[13px] font-sans">
                <img src="/images/us-flag.png" alt="USA Flag" className="w-5 h-3.5 object-cover mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#1D70B8] uppercase tracking-wider text-[11px] block mb-0.5">Ships from USA</span>
                  This item is stocked in our US warehouse. Orders ship fast via USPS/UPS. Expedited shipping is selected by default at checkout.
                </div>
              </div>
            )}

            <div className="border-t border-khaki" />

            {/* Short description */}
            {product.short_description && (
              <p className="text-[14px] font-sans text-leather-dark/80 leading-[1.7]">
                {product.short_description}
              </p>
            )}

            {/* Actions */}
            <ProductActions
              productId={product.id}
              productName={product.name}
              slug={product.slug}
              heroImage={heroImage}
              priceUsd={product.price_usd}
              salePriceUsd={product.sale_price_usd}
              maxQuantity={product.stock_quantity}
              variants={product.variants}
              isInStock={product.is_in_stock}
              shipsFromUsa={product.ships_from_usa}
            />

            <Link
              href={`/contact?product=${product.slug}`}
              className="text-center py-3 px-6 border border-khaki text-leather-dark text-[12px] font-sans font-bold uppercase tracking-[0.12em] hover:border-leather hover:bg-leather hover:text-white transition-colors"
            >
              Send Inquiry
            </Link>

            <QuickSpecs sku={product.sku} />
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mb-16">
          <ProductTabs
            productName={product.name}
            description={product.description}
            shortDescription={product.short_description}
            specs={{
              material: product.material,
              style: product.style,
              weight_kg: product.weight_kg,
              nation: product.nation,
              era: product.era,
              sku: product.sku,
            }}
            features={product.features}
            specifications={product.specifications}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-end justify-between border-b-2 border-khaki pb-4 mb-8">
              <div>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.12em] text-khaki mb-1">
                  From the Same Collection
                </p>
                <h2 className="font-heading text-[28px] leading-tight uppercase text-leather-dark font-black">
                  You May Also Like
                </h2>
              </div>
              <Link
                href={`/shop/nation/${(product.nation ?? "").toLowerCase()}`}
                className="text-[11px] font-sans font-bold uppercase tracking-[0.12em] text-khaki hover:text-leather-dark transition-colors whitespace-nowrap"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  priceUsd={p.price_usd}
                  salePriceUsd={p.sale_price_usd}
                  heroImageUrl={p.hero_image}
                  nation={p.nation ?? ""}
                  isFeatured={p.is_featured}
                  isInStock={p.is_in_stock}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
