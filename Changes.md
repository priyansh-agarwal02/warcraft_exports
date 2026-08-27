# Warcraft Exports — Change Log (`Changes.md`)

This log tracks all code, database, UI, and security updates made during local development and bug fixing sessions.

---

## Bug Fix 29: Instant Multi-Tier Checkout Contact & Address Auto-Population
- **Date**: 2026-08-27
- **Files Modified**:
  - `src/app/api/checkout/user-data/route.ts`: Upgraded recent order lookup query to search by `or(user_id.eq.${user.id},customer_email.ilike.${user.email})` so guest and freshly registered user orders pre-fill shipping info seamlessly.
  - `src/components/checkout/checkout-form.tsx`:
    - Added Tier 0 instant client `localStorage` pre-population on mount (`warcraft_checkout_contact`).
    - Fixed property mismatch where recent order address used `.address1` / `.postalCode` while checkout form looked for `.line1` / `.postal_code`.
    - Auto-saves contact and shipping address details to `localStorage` during order creation.
- **Verification**: Form now pre-populates instantly on repeat checkout visits across guest and logged-in flows.

---

## Bug Fix 28: Resend Email Triggering, Error Handling & Buyer/Seller Decoupling
- **Date**: 2026-08-27
- **Files Modified**:
  - `src/lib/email.ts`:
    - Fixed `isProd` evaluation (`!process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")`) so local development does not force unverified domain sender address (`orders@warcraftexports.com`).
    - Added `safeSendEmail()` wrapper to catch Resend API error objects (`{ data, error }`) as well as network/runtime exceptions and log detailed error responses.
    - Decoupled buyer and seller email dispatches in `sendOrderConfirmation()` using `Promise.all()`. If a buyer email fails (e.g. invalid customer email or testing mode domain restriction), the seller notification to `warcraftexports@gmail.com` still fires and is not blocked.
    - Upgraded all email functions (`sendOrderShippedEmail`, `sendOrderDeliveredEmail`, `sendOrderCancelledEmail`, `sendWelcomeEmail`, etc.) to use `safeSendEmail()`.
  - `src/app/api/orders/route.ts`:
    - Added `await` to `sendOrderConfirmation()` and `sendGuestWelcomeEmail()` so Vercel serverless execution context does not freeze before email HTTP requests finish sending.
- **Verification**: All email functions handle errors gracefully, log explicit status, and guarantee seller notifications are never aborted.

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

---

## Bug Fix 7: Admin Order Management, Email Idempotency Guards & JIRA Workflow Rules
- **Date**: 2026-08-25
- **Files Created / Modified**:
  - `supabase/migrations/017_order_email_tracking.sql`: Added `shipped_email_sent_at`, `delivered_email_sent_at`, `cancelled_email_sent_at`, and `cancellation_reason` columns to `orders` table.
  - `src/lib/email.ts`: Updated `sendOrderShippedEmail` and `sendOrderDeliveredEmail` with DB timestamp checking to ensure emails send **only once** (idempotency guard with `forceResend` flag). Added `sendOrderCancelledEmail` with customizable cancellation reason formatting. Added `sendWholesaleAutoresponder` for visitor B2B receipts.
  - `src/app/(store)/wholesale/page.tsx`: Triggered `sendWholesaleAutoresponder` on wholesale form submission to send visitor a copy of their inquiry.
  - `src/app/admin/actions.ts`: Created `updateOrderStatusAction`, `updateOrderTrackingAction`, and `resendOrderEmailAction` enforcing state workflow transitions (blocking direct `confirmed` $\rightarrow$ `delivered` jumps) and safe email dispatches.
  - `src/app/admin/orders/page.tsx`: Removed inline status dropdown form from order list table. Show static status badges and "View Order" button only.
  - `src/components/admin/order-fulfillment-manager.tsx`: Built interactive Client Component providing JIRA workflow enforcement, instant submit button disability (`disabled={isPending}`), loading spinners, cancellation reason text area pre-filling, toast alerts, and manual email resend controls with 60-second rate limits.
  - `src/app/admin/orders/[id]/page.tsx`: Mounted `<OrderFulfillmentManager />` on order detail view.
- **Verification**: `npx tsc --noEmit` compiled with 0 errors. Double-click email spam vulnerability completely resolved.

---

## Bug Fix 8: Customer Order Cancellation Request & Seller Approval/Rejection Workflow
- **Date**: 2026-08-25
- **Files Created / Modified**:
  - `supabase/migrations/018_cancellation_requests.sql`: Added `cancellation_requested`, `customer_cancellation_reason`, `cancellation_request_status`, and `cancellation_rejection_reason` columns to `orders` table.
  - `src/lib/email.ts`: Added `sendCancellationRequestReceiptEmail` (customer receipt), `sendCancellationRequestSellerNotification` (seller alert to `warcraftexports@gmail.com`), and `sendCancellationRejectedEmail` (customer notification when request is rejected with reason).
  - `src/app/(store)/account/orders/[id]/actions.ts`: Created `requestOrderCancellationAction` enforcing ownership, status checks (`confirmed` only), mandatory reason validation, and email dispatches.
  - `src/components/orders/cancel-order-button.tsx`: Created interactive cancellation modal requiring mandatory cancellation reason input.
  - `src/app/admin/actions.ts`: Created `acceptCancellationRequestAction` (marks order `cancelled`, dispatches confirmation email) and `rejectCancellationRequestAction` (saves rejection reason, dispatches rejection email).
  - `src/components/admin/order-fulfillment-manager.tsx`: Rendered Pending Cancellation Request Action Card with customer reason, **Accept Cancellation & Refund** button, and **Reject Cancellation Request** form.
  - `src/app/(store)/account/orders/[id]/page.tsx` & `src/app/admin/orders/[id]/page.tsx`: Integrated cancellation request data & tracking package links.
- **Verification**: `npx tsc --noEmit` compiled with 0 errors.

---

---

---

## Bug Fix 10: Dynamic Shipping Method Badges, US Warehouse Tags & Admin 60/40 Dashboard Restructuring
- **Date**: 2026-08-25
- **Files Created / Modified**:
  - `src/lib/shipping-utils.ts`: Created helper module for computing business-day calendar ranges (skipping weekends) and dynamic shipping method badges.
  - `src/lib/email.ts`: Enhanced `OrderEmailData` interface and order confirmation email template to render dynamic shipping badges, delivery date ranges, and `🇺🇸 Ships from USA` badges.
  - `src/app/(store)/checkout/success/page.tsx`: Updated order confirmation page to fetch `ships_from_usa` and render dynamic shipping badges.
  - `src/app/(store)/account/orders/[id]/page.tsx`: Rendered dynamic shipping badges, estimated business-day delivery date ranges, and US Warehouse badges on customer order view.
  - `src/components/admin/order-fulfillment-manager.tsx`: Enhanced pending cancellation request card with `AlertTriangle` icon (⚠️).
  - `src/app/admin/orders/[id]/page.tsx`: Restructured Admin Order Detail page into a balanced 60/40 2-column grid. Left side displays Order Items + US Badges, Financial & Shipping Summary + Shipping Method Badge + Estimated Delivery Window, Customer Info + Delivery Address, and Payment Gateway Details.
- **Verification**: Zero changes to checkout API (`/api/orders/route.ts`). `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 11: Admin Order Status Dropdown Population & Disabled Guard for Shipped Status
- **Date**: 2026-08-25
- **Files Modified**:
  - `src/components/admin/order-fulfillment-manager.tsx`: Added `shipped` (`Shipped (In Transit)`) to `GENERAL_STATUSES`. Initialized `selectedStatus` directly to `currentStatus`. When `selectedStatus === 'shipped'`, the **SAVE STATUS UPDATE** button is disabled (`Select Status to Update`) to prevent accidental re-saving or status confusion.
- **Verification**: Tested on `localhost:3000`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 12: US Flag Image Badges, 3–5 Business Days US Warehouse Delivery, & Customer Order View Integration
- **Date**: 2026-08-25
- **Files Created / Modified**:
  - `src/lib/shipping-utils.ts`: Updated default delivery window for US Warehouse & Expedited Shipping to **3–5 Business Days** (aligned with product page & admin shipping config).
  - `src/app/(store)/account/orders/[id]/page.tsx`: Integrated Shipping Method Badge, Estimated Delivery Window (`3–5 Business Days` or dynamic `7–14`), and `/images/us-flag.png` US Warehouse badge onto Customer Order View without changing box layout structure.
  - `src/app/admin/orders/[id]/page.tsx`: Updated US Warehouse item badge to use `/images/us-flag.png` image icon.
  - `src/lib/email.ts`: Updated order confirmation email template to render `/images/us-flag.png` badges on US Warehouse items.
- **Verification**: Tested on `localhost:3000`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 13: Product Item Thumbnail in Admin Orders List Table
- **Date**: 2026-08-25
- **Files Modified**:
  - `src/app/admin/orders/page.tsx`: Updated Supabase query to select product images for order items. Rendered a compact `40x40` product thumbnail image right before the Order Number in the Admin Orders list table row.
- **Verification**: Tested on `localhost:3000/admin/orders`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 14: Removal of Obsolete 'Processing' Filter from Admin Orders Page
- **Date**: 2026-08-25
- **Files Modified**:
  - `src/app/admin/orders/page.tsx`: Removed obsolete `"processing"` status option from `STATUSES` array. The admin order filter toolbar now cleanly displays `ALL`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
- **Verification**: Tested on `localhost:3000/admin/orders`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 15: Dynamic Enterprise Order Progress Timeline for Customer Order View
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/(store)/account/orders/[id]/page.tsx`: Updated Order Progress timeline bar to dynamically render state-driven steps based on cancellation workflow state:
    - **Cancellation Pending**: `Confirmed` $\rightarrow$ `Cancellation Requested` (Active ⌛) $\rightarrow$ `Review & Refund` (Pending)
    - **Cancellation Accepted / Cancelled**: `Confirmed` $\rightarrow$ `Cancellation Requested` $\rightarrow$ `Cancelled & Refunded`
    - **Cancellation Rejected**: Displays workshop rejection notice with reason, and resumes standard order progress (`Confirmed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`).
- **Verification**: Tested on `localhost:3000/account/orders/[id]`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 16: Warning Triangle & Action Needed Tooltip on Pending Cancellation Orders
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/admin/orders/page.tsx`: When an order has an active pending cancellation request (`cancellation_requested = true` & `cancellation_request_status = 'pending'`), the status badge in the Admin Orders list table turns red with a triangle warning icon (`AlertTriangle`) and tooltip `Action Needed: Cancellation Request Received`. No extra columns created.
- **Verification**: Tested on `localhost:3000/admin/orders`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 17: Amazon App UI Mobile Cards & Product Thumbnails for Customer Orders
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/(store)/account/orders/page.tsx`:
    - **Mobile View (`md:hidden`)**: Rendered 100% fitting, non-scrollable Amazon-app style cards displaying product thumbnail, title, +more items, order #, date, price, and status badge. Entire card row is clickable.
    - **Desktop View (`hidden md:block`)**: Added product thumbnail image column before Order #. Entire row remains clickable.
  - `src/app/(store)/account/page.tsx`:
    - Rendered the same responsive mobile Amazon-app style cards & desktop thumbnail layout for Recent Orders on the customer account dashboard.
- **Verification**: Tested on `localhost:3000/account` and `localhost:3000/account/orders` on mobile & desktop viewports. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 18: Removal of Yellow Workflow Tag & Addition of Enterprise Micro-Animations
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/(store)/account/orders/[id]/page.tsx`: Removed yellow `CANCELLATION WORKFLOW ACTIVE` text badge. Order progress title cleanly transitions dynamically (*"Order Progress — Cancellation Request Under Review"*). Added glowing pulse rings, scale transitions, and active step styling.
  - `src/components/orders/cancel-order-button.tsx`: Added interactive hover shadow and active click press scale effect (`active:scale-[0.97]`).
- **Verification**: Tested on `localhost:3000/account/orders/[id]`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 19: Order Alerts & Activity Feed inside Admin Dashboard Order Status Tile
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/admin/page.tsx`: Included `cancellation_requested` and `cancellation_request_status` in latest orders dashboard query.
  - `src/components/admin/dashboard/OrderStatusDonut.tsx`: Added an **Order Alerts (30 Days)** feed directly below the donut chart to fill empty white space.
  - `src/components/admin/dashboard/DashboardClient.tsx`: Passed orders feed prop to `OrderStatusDonut`.
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 20: Ultra-Compact Single-Line Order Alerts Feed in Admin Order Status Tile
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/dashboard/OrderStatusDonut.tsx`: Refactored Order Alerts section to use ultra-compact single-line text rows instead of bulky padded box cards. Maintained exact original tile height aligned with the adjacent REVENUE card.
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 21: Expanded 4-Row Compact Order Alerts Feed in Admin Order Status Tile
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/dashboard/OrderStatusDonut.tsx`: Increased compact alert row limit to 4 items. The feed dynamically displays up to 4 high-priority single-line alerts from the last 30 days (Cancellation Requests, New Orders Received, Shipped Dispatches, and Deliveries).
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 22: Strict 30-Day Window & State-Transition Alert Lifecycle in Admin Order Status Tile
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/dashboard/OrderStatusDonut.tsx`: Refined alert generation logic to strictly enforce 30-day window (`created_at >= 30DaysAgo`) and single active alert per order lifecycle:
    - **Cancellation Pending**: Renders ⚠️ `Action Needed`. Once accepted/rejected by admin, the alert **disappears** automatically.
    - **Order Progression**: When a new order (`New`) is shipped, its alert automatically transitions to 🚚 `Shipped`. Once delivered, it transitions to ✅ `Delivered`.
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 23: Guaranteed Pending Cancellation Request Alert Display
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/dashboard/OrderStatusDonut.tsx`: Ensured that any order with a pending cancellation request (`cancellation_requested = true` & `cancellation_request_status = 'pending'`) is **ALWAYS** surfaced at the top of the alerts feed (`Action Needed` ⚠️) regardless of original order creation date. Once the admin accepts or rejects it, it automatically resolves and disappears.
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 24: Recency-Based Alert Sorting for Shipped & New Orders
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/dashboard/OrderStatusDonut.tsx`: Refined sorting algorithm. Pending Cancellation Requests (`Action Needed` ⚠️) are pinned to top priority. General activity alerts (Shipped, New Order, Delivered) are sorted by **recency (newest `created_at` date first)**. Guaranteed that recent `Shipped` order alerts appear immediately in the feed alongside cancellation requests and new orders.
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 25: Low Stock Alerts Tile Feed Limit Increased to Fill Box Length
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/admin/page.tsx`: Increased `lowStockProducts` query `.limit(5)` to `.limit(10)`.
  - `src/app/api/admin/dashboard/route.ts`: Increased `lowStockProducts` query `.limit(5)` to `.limit(10)`.
  - `src/components/admin/dashboard/DashboardClient.tsx`: Set feed display to top 8 items (`.slice(0, 8)`), filling the exact white space inside the **LOW STOCK ALERTS** tile to align seamlessly with the adjacent **Recent Orders** card without altering any tile styling or behavior.
- **Verification**: Tested on `localhost:3000/admin`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 26: Section 1 & Section 2 Order Status & Tracking Workflow Refinement
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/order-fulfillment-manager.tsx`:
    - **Section 1 ("ORDER STATUS UPDATE")**: Prevented `Shipped` from being selected as a target status from `Confirmed` (since shipping requires mandatory tracking in Section 2). Disabled the Save button when `selectedStatus === currentStatus` displaying `"No Status Change"`.
    - **Section 2 ("FULFILLMENT & TRACKING")**: When an order is already shipped (`isAlreadyShipped`), updated Section 2 header to `"Fulfillment & Tracking (Order Shipped)"`, button text to `"Save Tracking Updates"`, and loading state to `"Saving Tracking Details..."`.
  - `src/app/admin/actions.ts`:
    - Updated `updateOrderTrackingAction` user message for already shipped orders to confirm `"Tracking details updated & saved successfully ✓ (Shipping email was sent previously; use override button below if you wish to resend)."`.
- **Verification**: Tested on `localhost:3000/admin/orders/[id]`. `npx tsc --noEmit` compiled with 0 errors.

---

---

## Bug Fix 27: Section 1 Save Button Disabled State & Status Sync Fix
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/components/admin/order-fulfillment-manager.tsx`:
    - Added `useEffect` state sync to ensure `selectedStatus` immediately synchronizes with `currentStatus` when order status updates (e.g. after marking as shipped in Section 2).
    - Enforced `disabled` state on Section 1 "SAVE STATUS UPDATE" button whenever `isShippedSelected` or `isSameStatusSelected` is true, displaying `"No Status Change"` in disabled grey style.
- **Verification**: Tested on `localhost:3000/admin/orders/[id]`. `npx tsc --noEmit` compiled with 0 errors.

---

## Bug Fix 28: Enterprise QA & Hardening Fixes Across Order Controls & Alerts
- **Date**: 2026-08-26
- **Files Modified**:
  - `src/app/admin/page.tsx`: Explicitly queried pending cancellation requests (`cancellation_request_status = 'pending'`) to guarantee all pending cancellation alerts surface in the dashboard feed regardless of order creation date.
  - `src/app/api/admin/dashboard/route.ts`: Explicitly merged pending cancellation requests into dashboard API feeds.
  - `src/app/admin/actions.ts`: Added workflow status guard to `updateOrderTrackingAction` preventing tracking updates or status overrides on finalized `cancelled` or `delivered` orders.
  - `src/components/admin/order-fulfillment-manager.tsx`: Added tracking input form state synchronization (`useEffect`) when tracking props update.
  - `src/app/(store)/account/orders/[id]/actions.ts`: Added minimum 5-character validation for customer cancellation reason text.
- **Verification**: Tested across all pages. `npx tsc --noEmit` compiled with 0 errors.










































