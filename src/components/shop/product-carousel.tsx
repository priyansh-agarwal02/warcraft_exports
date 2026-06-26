"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductListItem } from "@/types/product";

interface ProductCarouselProps {
  products: ProductListItem[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  // 1. Limit to exactly 12 products
  const displayProducts = products.slice(0, 12);
  
  // 2. Clone for infinite scroll (3 sets total so we can wrap around seamlessly)
  const extendedProducts = [...displayProducts, ...displayProducts, ...displayProducts];
  
  // 3. State
  // Start index at the beginning of the middle set to allow left/right scrolling instantly
  const [currentIndex, setCurrentIndex] = useState(displayProducts.length);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  // 4. Measure item width dynamically for accurate translation across screen sizes
  useEffect(() => {
    const measure = () => {
      if (itemRef.current) {
        // offsetWidth + 16px to account for the gap-4 (1rem) between items
        setItemWidth(itemRef.current.offsetWidth + 16);
      }
    };
    
    measure();
    // Re-measure on window resize to keep it perfectly aligned
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };
  
  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsAnimating(false);
    
    // Boundary checks: if we hit the very end or beginning of our cloned sets,
    // seamlessly snap back to the middle set without any animation.
    if (currentIndex <= 0) {
      setCurrentIndex(displayProducts.length);
    } else if (currentIndex >= displayProducts.length * 2) {
      setCurrentIndex(displayProducts.length);
    }
  };

  if (displayProducts.length === 0) return null;

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 md:left-0 top-[40%] -translate-y-1/2 md:-ml-6 z-10 bg-white border border-khaki shadow-lg p-2 md:p-3 text-leather-dark hover:bg-leather hover:text-white transition-colors"
        aria-label="Previous products"
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 md:right-0 top-[40%] -translate-y-1/2 md:-mr-6 z-10 bg-white border border-khaki shadow-lg p-2 md:p-3 text-leather-dark hover:bg-leather hover:text-white transition-colors"
        aria-label="Next products"
      >
        <ChevronRight size={20} className="md:w-6 md:h-6" />
      </button>

      {/* Carousel Track Container */}
      <div className="overflow-hidden px-2 py-4 -mx-2">
        <div 
          ref={carouselRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex gap-4"
          style={{
            transform: `translateX(-${currentIndex * itemWidth}px)`,
            transition: isAnimating ? "transform 0.5s ease-in-out" : "none",
          }}
        >
          {extendedProducts.map((product, i) => (
            <div 
              key={`${product.id}-${i}`} 
              ref={i === 0 ? itemRef : null}
              // 1 item mobile, 2 tablet, 4 desktop
              className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] flex-shrink-0"
            >
              <ProductCard
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
