# FE Buyer Backend Gaps

This file tracks BE items needed by FE buyer pages. FE should not invent behavior outside the matching contract.

## Catalog

Status: sufficient for FE buyer catalog.

Implemented and verified:

- `GET /api/v1/categories`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/products/featured`
- `GET /api/v1/products/hot`
- `GET /api/v1/products/new`
- `GET /api/v1/products/{id}/similar`
- `GET /api/v1/products/brands`

Resolved in BE:

- Product seed has at least 10 active products via existing catalog migrations.
- Flyway `V38__catalog_real_image_urls.sql` updates catalog/category/banner demo images from placeholder/mock URLs to real product image URLs. FE contract is unchanged: product list/detail should keep using `images[]`, `imageDetails[]`, `primaryImage`, and category/banner image fields as before.
- Flyway `V39__catalog_real_product_names.sql` replaces catalog product names/slugs that used `Demo xx` placeholders with real phone/accessory model names. FE does not need to special-case or hide demo product names.
- Flyway `V40__catalog_min_three_variants_images.sql` ensures every catalog product has at least 3 variants and at least 3 real product image URLs. FE product detail/gallery/variant selector can rely on non-empty multi-option data.
- Flyway `V41__catalog_variant_specific_images.sql` ensures every variant has at least one `product_images.variant_id` image. FE product detail can switch gallery by selected variant using `imageDetails[].variantId`; variant image should be shown first, followed by shared product images.
- Flyway `V42__buyer_menu_real_catalog_data.sql` and `V43__buyer_menu_variant_backfill.sql` add real catalog data for the buyer header menu. FE menu should use real `GET /api/v1/categories` + `GET /api/v1/products` data, map menu groups by category slug, and link filters with backend UUID `categoryId`.
- FE buyer product list now re-syncs filters from URL query whenever header menu changes `categoryId`, `categorySlug`, `brand`, or price params inside the same `/products` route.
- `categoryId` filter now includes the selected category and all descendant categories, so FE can pass a root category id directly.
- Product detail combo section now has typed public endpoints:
  - `GET /api/v1/combos`
  - `GET /api/v1/combos/{id}`
  - `GET /api/v1/products/{productId}/combos`
- Flyway `V25__buyer_public_combos.sql` seeds active buyer combos using real UUID catalog products.
- Product detail supplier extras are not needed for B2C display; FE should keep visible seller/store copy as `CELLPHONES`.

FE update 2026-05-24:

- Product detail now uses `GET /api/v1/products/{productId}/combos` through `comboApi.getForProduct`.
- Product detail no longer calls legacy B2B `supplierApi` or mock `chatApi.createConversation`.
- Combo purchase action now adds combo items to cart through the existing cart flow.
- No blocking BE change is needed for FE integration.
- Non-blocking data QA: review seeded combo names/composition if demo copy must match every product in the combo exactly.

## Next Gap Review

Review cart and order contracts next:

- `be/docs/FE_CART_CONTRACT.md`
- `be/docs/FE_ORDER_CONTRACT.md`

## Cart And Checkout

Status: sufficient for first buyer checkout flow.

Implemented and verified:

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart`
- `POST /api/v1/cart/validate`
- `POST /api/v1/orders`

Resolved / non-blocking:

- Stable customer address API is implemented and persisted in PostgreSQL:
  - `GET /api/v1/users/me/addresses`
  - `POST /api/v1/users/me/addresses`
  - `PATCH /api/v1/users/me/addresses/{id}`
  - `DELETE /api/v1/users/me/addresses/{id}`
  - `PATCH /api/v1/users/me/addresses/{id}/set-default`
- `POST /api/v1/orders` now accepts `shippingAddressId`, validates ownership by `X-User-Id`, snapshots the address, and stores `orders.shipping_address_id`.
- Provide non-destructive checkout test fixture or endpoint guidance if FE should verify order creation repeatedly without manually cleaning created orders.
- Promotion validation already returns `valid`, `promotion`, and `discount` in `be/docs/FE_PROMOTION_CONTRACT.md`; order creation still re-validates `promotionCode`.

Resolved in BE:

- Public installment endpoints from BA are implemented for product detail/checkout:
  - `GET /api/v1/installment-plans`
  - `POST /api/v1/installment-plans/calculate`
- Response and calculation rules are documented in `be/docs/FE_INSTALLMENT_CONTRACT.md`.
- `months` is returned as an array for FE/BA compatibility, while current DB stores one month value per plan row.

## Buyer Orders

Status: sufficient for list/detail/cancel integration and demo QA data.

Implemented and verified:

- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`
- `DELETE /api/v1/orders/{id}/cancel`

Resolved in BE:

- Flyway `V23__buyer_demo_gap_data.sql` adds 10 buyer order seed records for demo customer `00000000-0000-4000-8000-000000000199`, covering `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, and `RETURNED`.
- Order list summary `items.firstItem` now includes `productId` and `variantId` for direct navigation from order cards.
- Non-destructive QA fixture is now the seeded `QA-BUYER-0001..0010` orders.

FE update 2026-05-24:

- Buyer order detail no longer calls mock/B2B `chatApi.createConversation`.
- No blocking BE change is needed for current order detail actions.
- Future optional BE scope: define a B2C customer support conversation/ticket endpoint before FE restores any order-level contact action.

## Buyer Payments, Invoices, Shipments

Status: sufficient for FE integration and demo QA data.

Implemented and verified:

- `GET /api/v1/payments`
- `GET /api/v1/payments/{id}`
- `POST /api/v1/payments/{id}/gateway-session`
- `GET /api/v1/invoices`
- `GET /api/v1/invoices/{id}`
- `GET /api/v1/orders/{id}/invoice`
- `GET /api/v1/shipments`
- `GET /api/v1/shipments/{id}`
- `GET /api/v1/orders/{id}/shipment`

Resolved in BE:

- Flyway `V23__buyer_demo_gap_data.sql` adds 10 payment records for the demo customer, covering `UNPAID`, `PAID`, `OVERDUE`, `FAILED`, `REFUNDED`, and `PARTIALLY_REFUNDED`.
- Flyway `V23__buyer_demo_gap_data.sql` adds 10 invoice records for the demo customer, covering `PENDING`, `PAID`, `OVERDUE`, and `CANCELLED`.
- Flyway `V23__buyer_demo_gap_data.sql` adds 10 shipment records for the demo customer, covering `AWAITING_PICKUP`, `IN_TRANSIT`, `DELIVERED`, and `FAILED`.

Resolved in BE:

- Customer invoice DTO now includes invoice line items, seller/company tax metadata, notes, and invoice type for accurate invoice detail/print preview.
- Customer shipment DTO now includes shipping fee, from/to address, buyer name/phone, and tracking history. `weight` and `dimensions` are present but nullable until carrier/package integration exists.

Resolved in BE:

- Customer payment proof upload/manual `recordTransaction` now has customer endpoints:
  - `POST /api/v1/payments/{id}/proof`
  - `GET /api/v1/payments/{id}/proofs`
  - Proofs are stored in `payment_proofs` with `PENDING_REVIEW`; admin still confirms real payment via `PATCH /admin/payments/{id}/mark-paid`.

## Buyer After-Sales

Status: sufficient for FE integration and default demo data.

Implemented and verified:

- `GET /api/v1/returns`
- `GET /api/v1/returns/{id}`
- `POST /api/v1/returns`
- `GET /api/v1/warranty`
- `GET /api/v1/warranty/{id}`
- `GET /api/v1/warranty-claims`
- `GET /api/v1/warranty-claims/{id}`
- `POST /api/v1/warranty-claims`
- `GET /api/v1/trade-in/estimate`
- `POST /api/v1/trade-in`
- `GET /api/v1/trade-in`
- `GET /api/v1/trade-in/{id}`

Resolved in BE:

- Flyway `V23__buyer_demo_gap_data.sql` adds 10 return records for default demo customer `00000000-0000-4000-8000-000000000199`, covering `PENDING`, `APPROVED`, `PROCESSING`, `REFUNDED`, `CLOSED`, and `REJECTED`.
- Flyway `V23__buyer_demo_gap_data.sql` adds 10 warranty items for default demo customer, covering `ACTIVE`, `EXPIRED`, and `VOIDED`.
- Flyway `V23__buyer_demo_gap_data.sql` adds 10 warranty claims for default demo customer, covering `NEW`, `PROCESSING`, `RESOLVED`, and `REJECTED`.
- Flyway `V23__buyer_demo_gap_data.sql` adds 10 trade-in requests for default demo customer, covering `AWAITING_VALUATION`, `VALUED`, `ACCEPTED`, `REJECTED`, and `COMPLETED`.

Resolved in BE:

- Customer return DTO now includes customer-facing `orderNumber`, `refundMethod`, and `items[]` with product image/name/variant/price snapshot.
- Customer warranty claim DTO now includes product snapshot from warranty item: `productName`, `productImage`, `brand`, `serialNumber`, and `warrantyStatus`.

## Buyer Loyalty And Notifications

Status: sufficient for FE integration and default demo data.

Implemented and verified:

- `GET /api/v1/loyalty/me`
- `GET /api/v1/loyalty/me/transactions`
- `GET /api/v1/loyalty/me/stats`
- `GET /api/v1/loyalty/rewards`
- `POST /api/v1/loyalty/rewards/{id}/redeem` adapter implemented, not executed against default user because default user has 0 points.
- Notification FE adapters implemented for list, unread count, mark read, mark all read, and delete.

Resolved in BE:

- `GET /api/v1/notifications?page=1&pageSize=5` and `GET /api/v1/notifications/unread-count` are implemented by `NotificationController`; prior 500 was tied to old local DB/app state before notification migrations.
- Flyway `V23__buyer_demo_gap_data.sql` adds 10 notification records for default demo customer `00000000-0000-4000-8000-000000000199`, covering `ORDER`, `PAYMENT`, `PROMOTION`, `LOYALTY`, `SYSTEM`, and `REVIEW`, with read/unread mix.
- Flyway `V23__buyer_demo_gap_data.sql` adds loyalty program + 10 loyalty transaction rows for default demo customer, covering `EARN`, `REDEEM`, `EXPIRE`, and `BONUS`.
- Default demo user now has at least 3200 points for reward redemption QA.

Verification note:

- `mvn package -DskipTests`: passed after V23.
- Full `mvn test` could not complete in this local run because the forked JVM crashed due low Windows paging/native memory after previous Java processes; no Java compile errors.
- FE re-test after the BE update is still pending: local `localhost:8080` was down, direct jar startup failed on PostgreSQL connection timeout, and Docker PostgreSQL startup timed out in the FE environment.

## Buyer Wishlist And Profile Addresses

Status: completed for demo integration.

FE implemented:

- `/dashboard` and `/wishlist` now call `wishlistApi.get/getByUser/add/remove/removeByProduct/clear`.
- `/profile` now calls `addressApi.getByUser/create/update/delete/setDefault`.
- FE tries the production route shape from `BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md` first, then falls back to legacy mock/local behavior when production endpoints are unavailable.
- FE local fallback includes 10 default demo shipping addresses for profile QA.

Production endpoints FE expects:

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `POST /api/v1/users/me/avatar`
- `GET /api/v1/users/me/stats`
- `GET /api/v1/users/me/wishlist`
- `POST /api/v1/users/me/wishlist`
- `DELETE /api/v1/users/me/wishlist/{productId}`
- `DELETE /api/v1/users/me/wishlist`
- `GET /api/v1/users/me/addresses`
- `POST /api/v1/users/me/addresses`
- `PATCH /api/v1/users/me/addresses/{id}`
- `DELETE /api/v1/users/me/addresses/{id}`
- `PATCH /api/v1/users/me/addresses/{id}/set-default`

Completed in BE:

- Added DB-backed current-user profile endpoints with `customer_profiles`.
- Seeded default profile for demo customer `00000000-0000-4000-8000-000000000199`.
- Profile stats are calculated from `orders` and `loyalty_programs`.
- Added `BuyerPublicController` production route shape for wishlist and profile addresses.
- Wishlist uses dev-header customer ownership instead of path `userId`.
- Wishlist is now persisted in PostgreSQL table `customer_wishlist` using UUID product ids from production catalog.
- `POST /api/v1/users/me/wishlist` is idempotent per BA: existing product returns the current item instead of creating duplicates.
- `PATCH /api/v1/users/me/wishlist/{productId}/price-alert` validates positive `priceAlert`.
- Added `DELETE /api/v1/users/me/wishlist/items/{id}` for FE wishlist page removal by wishlist item id.
- Address create/update/delete/set-default is persisted in PostgreSQL table `customer_addresses` with default-address exclusivity.
- `POST /api/v1/orders` supports saved address checkout via `shippingAddressId`.
- Seeded 10 wishlist rows and 10 PostgreSQL address rows for default demo customer `00000000-0000-4000-8000-000000000199`.
- Local verification passed:
  - `GET /api/v1/users/me`: profile row from PostgreSQL.
  - `PATCH /api/v1/users/me`: updates profile fields.
  - `GET /api/v1/users/me/stats`: order/spend/loyalty totals.
  - `GET /api/v1/users/me/wishlist`: 10 PostgreSQL rows.
  - `GET /api/v1/users/me/addresses`: 10 rows.
  - `POST /api/v1/orders` with `shippingAddressId`: HTTP 201.
  - `DELETE /api/v1/users/me/wishlist/items/{id}`: HTTP 204, count changed 10 to 9.

Latest BE update:

- Flyway `V28__customer_wishlist.sql` adds DB-backed wishlist table + 10 UUID catalog wishlist rows.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"` passed on 2026-05-24.
- `mvn test` was blocked on 2026-05-24 because local PostgreSQL was down (`localhost:5432 refused`) and Docker Desktop was not running; compile/package passed.

## Buyer Reviews

Status: completed for demo integration.

FE implemented:

- `/reviews` consumes `reviewApi.getByUser`, edit/delete/helpful.
- `/products/:id` consumes product review list, star distribution, create/update/delete/helpful.
- `/orders/:id` consumes `reviewApi.getByOrder` for already-reviewed order items.
- FE tries the production route shape from `BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md` first, then falls back to legacy mock/local behavior when production endpoints are unavailable.

Production endpoints FE expects:

- `GET /api/v1/products/{productId}/reviews?page=&pageSize=&rating=&verifiedOnly=&hasImages=&sortBy=&sortDirection=`
- `GET /api/v1/products/{productId}/reviews/stats`
- `POST /api/v1/products/{productId}/reviews`
- `PATCH /api/v1/reviews/{id}`
- `DELETE /api/v1/reviews/{id}`
- `PATCH /api/v1/reviews/{id}/helpful`
- `GET /api/v1/users/me/reviews`
- Optional for order detail: `GET /api/v1/reviews?orderId=...`

Completed in BE:

- Added `BuyerPublicController` production route shape for buyer/product reviews.
- Buyer/product review endpoints are now DB-backed by `product_reviews` instead of in-memory demo reviews.
- Flyway `V29__buyer_product_reviews.sql` adds `helpful_count`, `is_verified_purchase`, persistent helpful votes, and 10 demo buyer reviews using UUID catalog product ids.
- Added product review stats endpoint with average rating, count, and star distribution.
- Added helpful endpoint. `PATCH /api/v1/reviews/{id}/helpful` is now idempotent per `X-User-Id + reviewId`; repeated calls from the same user return `helpful=true` without increasing `helpfulCount` again.
- New/updated reviews start as `PENDING` for admin moderation; product detail lists return `APPROVED` rows.
- Seeded 10 default-customer reviews against real UUID catalog products.
- Local verification passed:
  - `GET /api/v1/users/me/reviews`: 10 rows.
  - `GET /api/v1/products/{uuid}/reviews?page=1&pageSize=20`: DB rows.
  - `GET /api/v1/products/{uuid}/reviews/stats`: HTTP 200.
  - repeated `PATCH /api/v1/reviews/{uuid}/helpful` with same `X-User-Id`: count unchanged on retry.

Latest BE update:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"` passed on 2026-05-24 after DB-backed review code.
- `mvn test` still requires local PostgreSQL; previous attempt was blocked by `localhost:5432 refused`.

## Buyer Public Utilities

Status: completed for demo integration.

FE implemented:

- `/blog` and home latest-blog section consume `blogApi.getPaginated/getBySlug/getLatest`.
- `/stores` consumes `storeApi.getAll/checkAvailability`.
- `/imei-check` consumes `imeiApi.check`.
- FE tries production route shape from `BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md` first, then falls back to legacy mock/local behavior when production endpoints are unavailable.

Production endpoints FE expects:

- `GET /api/v1/blog?page=&pageSize=&category=&search=&isPublished=`
- `GET /api/v1/blog/{slug}`
- `GET /api/v1/blog/categories`
- `GET /api/v1/stores`
- `GET /api/v1/stores/{id}`
- `GET /api/v1/stores/{id}/availability?productId=...`
- `POST /api/v1/imei/check`

Completed in BE:

- Added `BuyerPublicController` production route shape for blog, stores, store availability, and IMEI check.
- Store list/detail is now DB-backed by active `branches`.
- Store availability is now DB-backed by `branch_product_inventory` and accepts UUID catalog `productId`.
- Store availability returns both `stock` and `availableQuantity`.
- Seeded 10 published blog posts and 10 active stores.
- Local verification passed:
  - `GET /api/v1/blog?page=1&pageSize=20&isPublished=true`: 10 rows.
  - `GET /api/v1/stores`: 10 rows.
  - `GET /api/v1/stores/{uuid}/availability?productId={uuid}`: HTTP 200.
  - `POST /api/v1/imei/check`: HTTP 200.

Latest BE update:

- Flyway `V30__public_store_inventory.sql` adds `branch_product_inventory` and seeds active branch/product stock.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"` passed on 2026-05-24.
- `mvn test` still requires local PostgreSQL; previous attempt was blocked by `localhost:5432 refused`.

## Buyer Product And Cart Runtime Contract

Status: FE safe fallback completed, BE data coverage still needed for full production flow.

FE implemented:

- `/products`, `/products/:id`, and `/products/compare` no longer require legacy B2B product fields: `supplierId`, `supplierName`, `minOrderQty`, and `unit`.
- FE maps catalog products to retail defaults when those fields are absent:
  - `storeId`: `cellphones`
  - `storeName`: `CELLPHONES`
  - `minQty`: `1`
  - `unit`: `sp`
- Add-to-cart from product list/detail/compare uses those defaults and remains compatible with the existing cart adapter.
- Product screen wording was adjusted from B2B labels (`NCC`, `Nhà cung cấp`, `MOQ`) to B2C labels (`Thương hiệu`, `Đơn vị bán`, `Số lượng mua`).

BE still needed:

- Expand catalog seed data to at least 10 active products with usable variants/images/categories for buyer QA.
- Align cart contract with catalog IDs:
  - Current production cart validates `productId` as UUID.
  - Current buyer demo catalog can still expose ids like `prod-001`.
- FE uses local cart fallback for non-UUID demo ids so the UI remains usable, but production cart QA requires UUID product ids from the real catalog.

Verification:

- FE `npm.cmd run build`: passed after product runtime cleanup.

Additional FE cleanup:

- `/cart` no longer has customer-facing B2B labels (`NCC`, `nhà cung cấp`, `MOQ`) and no longer enforces hard-coded demo MOQ values.
- Cart still keeps internal grouping by `supplierId` because the current FE order adapter and existing DTO shape use that field. This is display-safe for B2C because FE maps the visible name to `CELLPHONES`/store copy.
- `/orders` and `/orders/:id` no longer show customer-facing `NCC/Nhà cung cấp/Template` wording. FE still passes `supplierId/supplierName` internally where current order, chat, return, reorder, and saved-list adapters require that DTO shape.
- `/payments` and `/payments/:id` no longer show customer-facing `NCC/Nhà cung cấp/Công nợ` wording. FE still reads `supplierName` from the current payment DTO and displays it as `Cửa hàng`, with `CELLPHONES` fallback.
- `/invoices` and `/invoices/:id` no longer show customer-facing `NCC/Nhà cung cấp/B2B Marketplace` wording. FE still reads invoice seller fields (`supplierName`, `supplierCompany`, tax code) for legal invoice display and maps visible labels to `Cửa hàng`/`Bên bán`, with `CELLPHONES` fallback.
- `/returns` and `/returns/:id` no longer show customer-facing `NCC/Nhà cung cấp` wording. FE still preserves `supplierId/supplierName` internally because return DTOs and create/detail adapters use them, but visible labels map to `Cửa hàng`, with `CELLPHONES` fallback.
- `/warranty` no longer shows customer-facing `NCC/Nhà cung cấp` wording. FE still preserves `sellerId/sellerCompany` internally because warranty DTOs and claim-create adapters use them, but visible labels map to `Cửa hàng`/`trung tâm bảo hành`, with `CELLPHONES` fallback.
- `/order-confirmation`, `/reviews`, `/profile`, `/shipments/:id`, auth, command palette, search suggestions, shared review components, document center, and report builder visible labels were cleaned up to B2C wording. FE still keeps legacy names such as `supplierApi`, `supplierName`, `supplierId`, `sellerCompany`, and role `Nhà cung cấp` internally where current DTOs/routes depend on them.

## Local Mock Fallback Lockdown - 2026-05-28

Status: FE runtime fallback disabled by default; remaining auth hardening is a BE follow-up.

FE implemented:

- FE service adapters now disable mock/local fallback by default. A developer must explicitly set `VITE_USE_MOCK_FALLBACKS=true` to allow old mock fallback branches.
- FE auth now calls `POST /api/v1/auth/login` and `POST /api/v1/auth/register`; it no longer validates users against FE `mockUsers`.
- Mock-only buyer/admin routes were removed from runtime registration:
  - `/chat`
  - `/admin/documents`
  - `/admin/report-builder`
- Mock-only buyer UI entry points were removed:
  - AI chatbot floating widget
  - Buyer profile chat button
  - Buyer order detail saved-list action
- Admin customer detail activity logs now use `GET /api/v1/admin/activity-logs` through `adminActivityLogApi`.

BE follow-up required:

- Current `AuthService` is still in-memory and returns demo `mock-token-*` values.
- For production-like demo hardening, replace it with DB-backed users and real session/JWT handling, or clearly present it as a local-dev auth shim.

Verification:

- FE `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.
- BE `mvn package -DskipTests`: passed.
- BE `mvn test`: blocked by local PostgreSQL connection refused on `localhost:5432`; rerun after DB is running.

## Auth Registration Persistence - 2026-05-29

Status: `POST /api/v1/auth/register` and `POST /api/v1/auth/login` are now DB-backed for the demo scope.

Implemented:

- Added `auth_credentials` migration table for email/password credentials.
- Register creates a real `customer_profiles` row, a matching `auth_credentials` row, and an initial `loyalty_programs` row with BRONZE defaults.
- Login validates password against `auth_credentials` instead of accepting any password from an in-memory map.
- Existing demo accounts remain usable with password `123456`:
  - `admin@cellphones.vn`
  - `khachhang@gmail.com`
  - `lehoanhduc@gmail.com`
  - seeded local `admin_users` / `customer_profiles` emails.
- FE register forwards phone, companyName, taxCode, address, and city to BE; BE persists phone/address for customer profile.

BE fix 2026-06-09:

- Fixed admin login 500 caused by `AuthService` querying non-existent `admin_users.company_name`.
- Added Flyway `V37__auth_admin_login_fix.sql` to ensure `admin@cellphones.vn` exists in `admin_users` and `auth_credentials`.
- Auth response role is now FE-friendly:
  - buyer: `CUSTOMER`
  - admin: `ADMIN`
- Verified demo credentials:
  - buyer `khachhang@gmail.com` / `123456`
  - admin `admin@cellphones.vn` / `123456`
- `mvn test`: passed, 30 tests, 0 failures, 0 errors.

FE contract fix 2026-06-09:

- FE now normalizes auth roles through `src/app/utils/roles.ts`.
- `ADMIN` is accepted for admin login redirect, `AuthLayout`, `AdminGuard`, `ProtectedRoute`, and the buyer header avatar menu.
- Avatar menu now shows `Admin Panel` when `user.role` is `ADMIN` or legacy `Quản trị viên`.
- FE build check: `npx.cmd vite build --outDir dist-codex-admin-role-check --emptyOutDir` passed.

FE order list/time fix 2026-06-09:

- FE now formats order `createdAt` with timezone `Asia/Ho_Chi_Minh` instead of rendering raw UTC/ISO text.
- Buyer order list sorts mapped order data by `createdAt DESC` by default so newest orders stay on top.
- Updated order list table date column and order detail created/shipment dates.
- FE build check: `npx.cmd vite build --outDir dist-codex-order-time-check --emptyOutDir` passed.

FE/BE FREESHIP fix 2026-06-09:

- Root cause: `FREE_SHIPPING` validates successfully with `discount = 0`, but FE treated `0` as invalid because it checked `result.valid && result.promotion && result.discount`.
- FE now accepts valid promotions with `discount = 0`.
- FE cart preview sets shipping to `0` for `Miễn phí vận chuyển`/`FREESHIP` and shows `Đã áp dụng` instead of an invalid message.
- BE order creation now sets `shipping_fee = 0` when validated promotion type is `FREE_SHIPPING`.
- Verify: FE `npx.cmd vite build --outDir dist-codex-freeship-check --emptyOutDir` passed; BE `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"` passed.

FE notification popup fix 2026-06-09:

- Fixed dropdown layout overflow where the footer/action area overlapped notification items.
- Notification popup now uses a fixed flex column layout: header/filter/footer stay fixed and only the notification list scrolls.
- Notification rows now use a three-column grid and truncate/wrap text safely.
- Notification timestamps now use the shared Vietnam timezone formatter.
- Verify: FE `npx.cmd vite build --outDir dist-codex-notification-popup-check --emptyOutDir` passed.

Still deferred:

- Access/refresh JWT, token persistence, `/auth/refresh`, change password, forgot/reset password, email verification, and rate limiting remain future security hardening from `ba-docs/03-api-auth-users.md`.
- Existing local-dev ownership headers (`X-User-Id`, `X-Admin-Id`) are still used by other modules until full JWT/RBAC is implemented.

## Testcase Compatibility Pass - 2026-05-29

Implemented:

- `POST /api/v1/promotions/validate` now accepts both current payload (`code`, `cartTotal`, `cartItems`) and legacy testcase/cart payloads (`couponCode`, `subtotal`, `orderTotal`, missing `cartItems`).
- FE route aliases added for old testcase URLs:
  - `/search?q=...`
  - `/category/:slug`
  - `/account/orders`
  - `/check-imei`
  - `/admin/dashboard`
- `POST /api/v1/imei/check` now returns 404 when `warranty_items.serial_number` is not found instead of fabricating a successful IMEI result.
- Buyer return creation now enforces the 7-day return window from shipment `actual_delivery`/order `updated_at`.

Still deferred:

- Excel `.xlsx` export still needs a real workbook implementation, preferably Apache POI in BE, replacing the current CSV-style report export.
- Loyalty settings screen/API still needs persistent configuration for earning rate, tier rules, expiry, and audit trail.
- MOMO real gateway credentials/signature verification are still deferred.

## VNPay Sandbox Gateway - 2026-05-29

Status: completed for BE/FE sandbox integration.

Implemented:

- `POST /api/v1/payments/{id}/gateway-session` with `provider = VNPAY` now returns a real VNPay sandbox redirect URL:
  - `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...&vnp_SecureHash=...`
- Backend signs VNPay request params with HMAC-SHA512.
- Backend verifies VNPay return params on:
  - `GET /api/v1/payments/gateway/return?vnp_*`
- Successful VNPay return syncs:
  - `payment_gateway_sessions.status = PAID`
  - `payments.status = PAID`
  - `payments.paid_amount = amount`
  - `payments.remaining_amount = 0`
  - `payments.transaction_ref = vnp_TransactionNo`
  - `orders.payment_status = PAID`
  - pending/overdue invoice status to `PAID` when invoice exists.
- Failed/cancelled VNPay return updates gateway session only; payment remains unpaid/overdue.
- Invalid VNPay signature returns `PAYMENT_GATEWAY_SIGNATURE_INVALID`.
- After verification, if the gateway session has `returnUrl`, BE now returns HTTP `302` to the FE payment result URL.

Config for real sandbox QA:

- `VNPAY_PAY_URL`, default `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- `VNPAY_TMN_CODE`, configured sandbox default `VZ5ZPNQT`
- `VNPAY_HASH_SECRET`, configured sandbox default `ZGAWKRS0JM60P0HQALQU9Q5M2FQDYA4T`
- `VNPAY_RETURN_URL`, default `http://localhost:8080/api/v1/payments/gateway/return`
- `VNPAY_EXPIRE_MINUTES`, default `15`
- `DEMOV210` and `VNPAY_SANDBOX_HASH_SECRET_CHANGE_ME` are placeholders only. BE now returns `SERVICE_UNAVAILABLE` instead of generating a bad VNPay redirect while these defaults are still active.
- For browser QA, BE can use the configured sandbox defaults above, or override with env `VNPAY_TMN_CODE` + `VNPAY_HASH_SECRET` before starting BE.

FE flow:

1. Create order with `paymentMethod = VNPAY`.
2. Call `POST /api/v1/payments/{paymentId}/gateway-session`.
3. FE sends `returnUrl = http://localhost:5173/payment-result?paymentId={paymentId}&provider=VNPAY`.
4. Redirect browser to `data.paymentUrl`.
5. VNPay returns to `VNPAY_RETURN_URL`; BE verifies signature and updates payment/order.
6. If the stored gateway session has `returnUrl`, BE `302` redirects the browser to:
   - `/payment-result?requestId={requestId}&paymentId={paymentId}&orderId={orderId}&status={PAID|FAILED|CANCELLED}`
7. FE `/payment-result` reads query params, then refreshes `GET /api/v1/payments/{paymentId}` and/or `GET /api/v1/orders/{orderId}` to show the BE verified state.

Backward-compatible API test flow:

1. If `returnUrl` is missing on the session, `GET /api/v1/payments/gateway/return` keeps returning JSON.

Previous flow note:

1. Direct JSON from BE is still useful for API tests, but browser UX should use the 302 redirect above.

Verification:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn test`: passed, 29 tests, 0 failures, 0 errors.
