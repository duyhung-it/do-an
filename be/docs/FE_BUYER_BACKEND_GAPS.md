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
- `categoryId` filter now includes the selected category and all descendant categories, so FE can pass a root category id directly.
- Product detail combo section now has typed public endpoints:
  - `GET /api/v1/combos`
  - `GET /api/v1/combos/{id}`
  - `GET /api/v1/products/{productId}/combos`
- Flyway `V25__buyer_public_combos.sql` seeds active buyer combos using real UUID catalog products.
- Product detail supplier extras are not needed for B2C display; FE should keep visible seller/store copy as `CELLPHONES`.

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
- Added `DELETE /api/v1/users/me/wishlist/items/{id}` for FE wishlist page removal by wishlist item id.
- Address create/update/delete/set-default is persisted in PostgreSQL table `customer_addresses` with default-address exclusivity.
- `POST /api/v1/orders` supports saved address checkout via `shippingAddressId`.
- Seeded 10 wishlist rows and 10 PostgreSQL address rows for default demo customer `00000000-0000-4000-8000-000000000199`.
- Local verification passed:
  - `GET /api/v1/users/me`: profile row from PostgreSQL.
  - `PATCH /api/v1/users/me`: updates profile fields.
  - `GET /api/v1/users/me/stats`: order/spend/loyalty totals.
  - `GET /api/v1/users/me/wishlist`: 10 rows.
  - `GET /api/v1/users/me/addresses`: 10 rows.
  - `POST /api/v1/orders` with `shippingAddressId`: HTTP 201.
  - `DELETE /api/v1/users/me/wishlist/items/{id}`: HTTP 204, count changed 10 to 9.

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
- Added product review stats endpoint with average rating, count, and star distribution.
- Added helpful endpoint. `PATCH /api/v1/reviews/{id}/helpful` is now idempotent per `X-User-Id + reviewId`; repeated calls from the same user return `helpful=true` without increasing `helpfulCount` again.
- Seeded 10 default-customer reviews and 10 additional `prod-001` product detail reviews.
- Local verification passed:
  - `GET /api/v1/users/me/reviews`: 10 rows.
  - `GET /api/v1/products/prod-001/reviews?page=1&pageSize=20`: 13 rows.
  - `GET /api/v1/products/prod-001/reviews/stats`: HTTP 200.
  - repeated `PATCH /api/v1/reviews/rev-demo-1/helpful` with same `X-User-Id`: count unchanged on retry.

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
- Store availability returns both `stock` and `availableQuantity`.
- Seeded 10 published blog posts and 10 active stores.
- Local verification passed:
  - `GET /api/v1/blog?page=1&pageSize=20&isPublished=true`: 10 rows.
  - `GET /api/v1/stores`: 10 rows.
  - `GET /api/v1/stores/store-001/availability?productId=prod-001`: HTTP 200.
  - `POST /api/v1/imei/check`: HTTP 200.

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
