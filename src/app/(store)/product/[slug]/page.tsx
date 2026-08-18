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

  // Smart Keyword Generation
  const keywordSet = new Set<string>()
  if (product.name) {
    keywordSet.add(product.name.toLowerCase())
    const nameWords = product.name.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, "").trim()).filter(w => w.length > 1)
    nameWords.forEach(w => {
      const lower = w.toLowerCase()
      if (lower !== "and" && lower !== "with" && lower !== "for" && lower !== "reproduction" && lower !== "gear") {
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
  }
  if (era && era !== "Universal") {
    keywordSet.add(era.toLowerCase())
    keywordSet.add(`${era} reproduction`.toLowerCase())
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

  const productNameLower = (product.name ?? "").toLowerCase()
  if (productNameLower.includes("garand") || productNameLower.includes("sling")) {
    keywordSet.add("m1 garand sling")
    keywordSet.add("us gi sling")
    keywordSet.add("british ww2 enfield sling")
    keywordSet.add("mauser g98 sling")
    keywordSet.add("wwii rifle sling")
  }
  if (productNameLower.includes("helmet") || productNameLower.includes("liner")) {
    keywordSet.add("m1917a1 helmet liners")
    keywordSet.add("ww1 helmet")
    keywordSet.add("german ww1 helmet")
    keywordSet.add("ww1 replica helmet")
    keywordSet.add("ww2 us helmet liner")
    keywordSet.add("m1917a1 helmet for sale")
  }
  if (productNameLower.includes("musette") || productNameLower.includes("bag") || productNameLower.includes("haversack")) {
    keywordSet.add("m1936 musette bag")
    keywordSet.add("ww2 us field gear")
    keywordSet.add("wwii reenactment gear")
  }
  if (productNameLower.includes("pouch") || productNameLower.includes("first aid")) {
    keywordSet.add("m1910 1st aid pouches")
    keywordSet.add("m1910 first aid kit")
  }

  keywordSet.add("historical reproduction")
  keywordSet.add("military reenactment gear")
  keywordSet.add("militaria collectibles")
  keywordSet.add("reenactor equipment")
  keywordSet.add("world war 2 gear")
  keywordSet.add("ww2 military surplus")
  keywordSet.add("ww2 army surplus")
  keywordSet.add("ww2 reenactment supplies")
  keywordSet.add("military gear manufacturer")
  keywordSet.add("reproduction militaria")

  const finalKeywords = Array.from(keywordSet).filter(Boolean).slice(0, 45)

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
      availability: product.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/product/${slug}`,
      seller: { "@type": "Organization", name: "Warcraft Exports" },
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
