import { ProductCard, ProductCardSkeleton } from "@/components/products/product-card"
import type { ProductListItem } from "@/types/product"
import { PackageOpen } from "lucide-react"

interface ProductGridProps {
  products: ProductListItem[]
  isLoading?: boolean
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageOpen size={40} className="text-khaki mb-4" />
        <h3 className="font-heading text-xl text-leather-dark mb-2">No products found</h3>
        <p className="text-sm font-sans text-khaki max-w-xs">
          Try adjusting your filters, or{" "}
          <a href="/shop" className="text-leather underline underline-offset-2">
            browse all products
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceUsd={product.price_usd}
          salePriceUsd={product.sale_price_usd}
          heroImageUrl={product.hero_image}
          nation={product.nation ?? "Universal"}
          era={product.era ?? "WW2"}
          isFeatured={product.is_featured}
          isInStock={product.is_in_stock}
          shipsFromUsa={product.ships_from_usa}
        />
      ))}
    </div>
  )
}
