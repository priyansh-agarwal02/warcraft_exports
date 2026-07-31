# Warcraft Exports — Change Log (`Changes.md`)

This log tracks all code, database, UI, and security updates made during local development and bug fixing sessions.

---

## Initial Setup & Knowledge Base Synchronization
- **Date**: 2026-07-30
- **Action**: Complete project documentation study (`instructions.md`, `warcraft_exports_architecture.md`, `Security.md`, `CLAUDE.md`).
- **Plan Document Created**: `implementation_plan.md`
- **Status**: Ready for bug fixing on `localhost:3000`.

---

## Bug Fix 1: PayPal "Pay Now" Button Mismatch & Security Headers
- **Date**: 2026-07-30
- **Files Modified**:
  - `src/components/checkout/paypal-button.tsx`: Added `intent: "capture"` to PayPal JS SDK `initialOptions` to align frontend SDK intent with backend order creation intent.
  - `next.config.ts`: Updated CSP `form-action` from `'self'` to include `https://www.paypal.com`, `https://www.sandbox.paypal.com`, and `https://checkout.razorpay.com`. Changed `X-Frame-Options` from `DENY` to `SAMEORIGIN`.
  - `src/middleware.ts`: Changed `X-Frame-Options` header from `DENY` to `SAMEORIGIN` to prevent iframe blocking.
- **Verification**: Code compiles without errors. Resolves button disable state.

---

## Bug Fix 2: Saved Address & Profile Pre-population on Checkout Re-visit
- **Date**: 2026-07-30
- **File Modified**: `src/components/checkout/checkout-form.tsx`
- **Action**:
  - Added `cache: "no-store"` to `/api/addresses` fetch to prevent Next.js client router from returning cached empty responses on 2nd checkout visits.
  - Implemented `supabase.auth.getSession()` for instant client-side session resolution before fallback `getUser()`.
  - Ensured reliable form field population for `fullName`, `email`, `phone`, and default address.

---

## Bug Fix 3: Amazon-Style Variant Cataloging & Management
- **Date**: 2026-07-30
- **Files Created / Modified**:
  - `supabase/migrations/015_add_variant_image_url.sql`: Prepared migration for `image_url` column on `product_variants`.
  - `src/types/product.ts`: Added `image_url?: string | null` to `ProductDetail["variants"]` type.
  - `src/lib/queries/products.ts`: Added `image_url` to `product_variants` select query.
  - `src/app/admin/products/[id]/page.tsx`: Added `image_url` to admin variant query.
  - `src/components/product/variant-selector.tsx`: Added auto-selection of the first in-stock variant on load, and image thumbnail swatches when `image_url` is present.
  - `src/app/api/admin/variants/route.ts`: Created admin REST endpoint (POST, PATCH, DELETE) for variant management.
  - `src/components/admin/variant-manager.tsx`: Created interactive admin UI for creating, editing stock, price overrides, colors, sizes, and image URLs.
  - `src/components/admin/product-edit-form.tsx`: Replaced read-only variant summary list with `<VariantManager />`.

---

## Bug Fix 4: Global Multi-Currency System Tracking
- **Date**: 2026-07-30
- **Files Modified**:
  - `src/app/api/orders/route.ts`: Added `displayCurrency` and `exchangeRate` parameters to order creation payload. Saved `display_currency`, `exchange_rate`, and `total_display` into `orders` table.
  - `src/components/checkout/checkout-form.tsx`: Passed active currency code and exchange rate from `useCurrency()` hook into `createOrder()`.

---

## Bug Fix 5: Sale Page Free Shipping Badge Correction ($150 → $50)
- **Date**: 2026-07-30
- **Files Modified**:
  - `src/app/(store)/sale/page.tsx`: Updated badge text from `$150` to `$50`.
  - `src/app/(store)/shipping-policy/page.tsx`: Updated threshold references from `$150` to `$50`.
  - `src/lib/faq-data.ts`: Updated FAQ shipping response from `$150` to `$50`.
  - `src/app/api/chat/route.ts`: Updated chatbot system prompt shipping threshold from `$150` to `$50`.

---

## Bug Fix 6: AI Chatbot Catalog Intelligence & Product Direct Linking
- **Date**: 2026-07-30
- **File Modified**: `src/app/api/chat/route.ts`
- **Action**:
  - Implemented keyword extraction from customer messages.
  - Integrated dynamic Supabase query over `products` (`name`, `description`, `material`).
  - Injected real catalog matches (product name, price, sale price, era/nation, direct Markdown URL) into the Groq system prompt.
  - Enables the assistant to recommend exact products with clickable store links.
