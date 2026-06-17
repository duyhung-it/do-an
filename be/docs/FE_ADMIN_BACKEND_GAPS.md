dev
# FE Admin Backend Gaps

Source of truth:

- `B2B eCommerce Platform Plan/ba-docs/09-api-admin.md`
- `B2B eCommerce Platform Plan/ba-docs/06-api-payments-invoices.md`
- `B2B eCommerce Platform Plan/ba-docs/07-api-after-sales.md`
- `B2B eCommerce Platform Plan/ba-docs/10-business-rules.md`
- Current implemented contracts in `be/docs/FE_*_CONTRACT.md`

This document lists only the backend gaps blocking real FE admin screens. Do not add FE-only mock APIs for these items.

Latest review: 2026-06-09. No open P0/P1 admin backend blockers remain in this file. Buyer/default demo data gaps were handled separately in `be/docs/FE_BUYER_BACKEND_GAPS.md` by Flyway `V23__buyer_demo_gap_data.sql`.

## Catalog Real Image URLs

Status: DONE on 2026-06-11.

- Added Flyway `V38__catalog_real_image_urls.sql` to replace old placeholder/demo image URLs in catalog seed data.
- Updated product images, variant/demo images, category images, and banner images to real product image URLs for phone/accessory retail demo.
- FE/admin API contract is unchanged:
  - `GET /api/v1/products/{productId}/images`
  - `POST /api/v1/admin/products/{productId}/images`
  - `PATCH /api/v1/admin/products/{productId}/images/{id}`
  - `DELETE /api/v1/admin/products/{productId}/images/{id}`
- Admin can still add/edit/delete product images manually; this change only improves seeded/default data.

Verification:

- Main external image URLs were checked with `curl.exe -L -I` and returned `200 OK`.

## Catalog Real Product Names

Status: DONE on 2026-06-11.

- Added Flyway `V39__catalog_real_product_names.sql` to replace catalog placeholder product names such as `iPhone Demo 01`, `Samsung Demo 01`, and accessory demo names with real product model names.
- Updated product `slug`, `brand`, short description, description, tags, specifications, variant name/SKU, and product image alt text for those seeded rows.
- Synced display snapshots in `cart_items`, `order_items`, and `warranty_items` where the row references an updated catalog product.
- FE/admin API contract is unchanged; admin product list/detail should continue reading the same fields.

Verification:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed.
- Local DB check: `products` has `0` rows with `name` or `slug` containing `demo`.

## Catalog Minimum Variants And Images

Status: DONE on 2026-06-11.

- Added Flyway `V40__catalog_min_three_variants_images.sql`.
- Every product now has at least 3 `product_variants` rows.
- Every product now has at least 3 `product_images` rows using real image URLs, with no `placehold.co` or old `cdn.cellphones.vn/products` URLs.
- Admin product detail/image management contract is unchanged; FE can rely on product galleries and variant selectors having multiple entries.

Verification:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed.
- Local DB check: `products_under_3_variants = 0`, `products_under_3_images = 0`.

## Catalog Variant Specific Images

Status: DONE on 2026-06-11.

- Added Flyway `V41__catalog_variant_specific_images.sql`.
- Every product variant now has at least one linked image through `product_images.variant_id`.
- This fixes buyer product detail behavior where selecting a variant did not visibly change the gallery because most variants only had shared product-level images.
- Admin image management contract is unchanged; variant-specific images still use the existing `variantId` field in product image create/update payloads.

Verification:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed.
- Local DB check: `variant_images = 252`, `variants_without_images = 0`.

## Buyer Header Menu Catalog Data

Status: DONE on 2026-06-11.

- Added Flyway `V42__buyer_menu_real_catalog_data.sql` to normalize buyer-facing category names and add real catalog data for Realme, smart watches, charging/power, headphones, and tech devices.
- Added Flyway `V43__buyer_menu_variant_backfill.sql` to backfill missing variants/images for menu products after the data migration.
- FE buyer header menu now loads real category/product data instead of hardcoded `cat-01..cat-06` ids.
- Admin category/product management contract is unchanged; this is seed/default catalog data for the B2C storefront.

Verification:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed.
- Local DB check: `seeded_products_under_3_variants = 0`, `variants_without_images = 0`.

## FE Admin Promotion Target Combobox

Status: DONE on 2026-06-09.

- Admin promotion create/edit form replaced raw `Product ids CSV`, `Category ids CSV`, and `Brands CSV` inputs with multi-select autocomplete controls.
- Product options are loaded from `adminProductApi.getPaginated({ page: 1, pageSize: 1000 })`.
- Category options are loaded from `adminCategoryApi.getAll()` and flattened for selection.
- Brand options are auto-filled from product brands plus existing promotion scopes.
- Selected values render as removable chips.
- Admin can still paste comma-separated IDs/brands for quick input.
- API contract unchanged: payload still sends `applicableProducts`, `applicableCategories`, and `applicableBrands` as arrays to `POST /api/v1/admin/promotions` and `PATCH /api/v1/admin/promotions/{id}`.

Verification:

- FE `npm.cmd run build -- --outDir dist-codex-promotion-combobox-check`: passed.

## Admin Promotion Create 500 Fix

Status: DONE on 2026-06-09.

- Fixed `POST /api/v1/admin/promotions` returning `500 INTERNAL_ERROR` for FE payloads that send array scopes.
- Root cause: duplicate-code validation used `(? IS NULL OR id <> ?)` with `currentId = null`; PostgreSQL could not infer the parameter type and raised `could not determine data type of parameter $2`.
- Create and update now use separate duplicate-code queries, so create no longer passes a null UUID parameter.
- Added validation for promotion `type`, `applicableProducts` UUIDs, and `applicableCategories` UUIDs so malformed scope data returns `VALIDATION_ERROR` instead of a generic 500.
- Regression test added with FE-style payload containing `applicableProducts`, `applicableCategories`, and `applicableBrands` arrays.

Verification:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#adminPromotionCreateAcceptsArrayScopes`: passed.
- BE `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## FE Admin Product Specifications UX

Status: DONE on 2026-06-09.

- FE admin product form no longer uses a free-text specifications textarea.
- Each product specification is edited as one row with `key` and `value` inputs.
- Admin can add, edit, and delete specification rows per product before saving.
- Product detail modal shows specifications as rows and has a direct `Sửa thông số` action that opens the product edit form.
- API contract unchanged: FE still saves through `POST /api/v1/admin/products` and `PATCH /api/v1/admin/products/{id}` with `specifications` as an object, for example `{ "Chip": "A17 Pro", "RAM": "8GB" }`.

Verification:

- FE `npm.cmd run build -- --outDir dist-codex-product-specs-check`: passed.

## FE Admin Product Updated Sort And Edit Flow

Status: DONE on 2026-06-09.

- Admin product list now defaults to `sortBy=updatedAt&sortDir=desc`, so newly created and recently edited products appear first.
- Backend catalog sort whitelist now accepts `updatedAt`.
- Product creation already sets `createdAt` and `updatedAt` to current time via entity `@PrePersist`; product update sets `updatedAt` via `@PreUpdate`.
- Clicking edit on a product opens the product popup in read-only mode first.
- The popup footer has a `Sửa` action; clicking it enables the form.
- Saving an existing product updates the data, refreshes the list, keeps the popup open, and returns the popup to read-only mode.
- Creating a new product still closes the popup after successful create.

Verification:

- FE `npm.cmd run build -- --outDir dist-codex-product-updated-sort-check`: passed.
- BE `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## Already wired by FE

The FE admin now consumes these implemented backend contracts through `adminBackendApi.ts`:

- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/orders/{id}`
- `PATCH /api/v1/admin/orders/{id}/status`
- `PATCH /api/v1/admin/orders/{id}/notes`
- `GET /api/v1/admin/payments`
- `GET /api/v1/admin/payments/{id}`
- `PATCH /api/v1/admin/payments/{id}/mark-paid`
- `PATCH /api/v1/admin/payments/{id}/mark-overdue`
- `POST /api/v1/admin/payments/{id}/refund`
- `GET /api/v1/admin/invoices`
- `GET /api/v1/admin/invoices/{id}`
- `GET /api/v1/admin/invoices/{id}/download`
- `PATCH /api/v1/admin/invoices/{id}/status`
- `GET /api/v1/admin/shipments`
- `GET /api/v1/admin/shipments/{id}`
- `POST /api/v1/admin/shipments`
- `PATCH /api/v1/admin/shipments/{id}`
- `PATCH /api/v1/admin/shipments/{id}/status`
- `GET /api/v1/orders/{id}/invoice`
- `GET /api/v1/orders/{id}/shipment`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `POST /api/v1/admin/products`
- `PATCH /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`
- `GET /api/v1/products/{productId}/variants`
- `POST /api/v1/admin/products/{productId}/variants`
- `PATCH /api/v1/admin/products/{productId}/variants/{id}`
- `DELETE /api/v1/admin/products/{productId}/variants/{id}`
- `GET /api/v1/products/{productId}/images`
- `POST /api/v1/admin/products/{productId}/images`
- `PATCH /api/v1/admin/products/{productId}/images/{id}`
- `DELETE /api/v1/admin/products/{productId}/images/{id}`

Update 2026-05-27:

- Product image request/response now supports optional `variantId`.
- `variantId = null` means shared product image; non-null means the image belongs to one product variant.
- One variant can have many images.
- FE admin image dialog now allows selecting "Ảnh chung sản phẩm" or a concrete variant.
- `GET /api/v1/promotions`
- `GET /api/v1/admin/promotions`
- `POST /api/v1/admin/promotions`
- `GET /api/v1/admin/promotions/{id}`
- `PATCH /api/v1/admin/promotions/{id}`
- `PATCH /api/v1/admin/promotions/{id}/toggle`
- `DELETE /api/v1/admin/promotions/{id}`
- `GET /api/v1/admin/inventory`
- `GET /api/v1/admin/inventory/{id}`
- `PATCH /api/v1/admin/inventory/{id}/adjust`
- `GET /api/v1/admin/inventory/low-stock`
- `GET /api/v1/admin/inventory/{productId}/movements`
- `GET /api/v1/admin/returns`
- `GET /api/v1/admin/returns/{id}`
- `PATCH /api/v1/admin/returns/{id}/status`
- `POST /api/v1/admin/returns/{id}/dispute-resolution`
- `GET /api/v1/admin/warranty-claims`
- `GET /api/v1/admin/warranty-claims/{id}`
- `PATCH /api/v1/admin/warranty-claims/{id}/status`
- `GET /api/v1/admin/reviews`
- `PATCH /api/v1/admin/reviews/{id}/approve`
- `PATCH /api/v1/admin/reviews/{id}/hide`
- `DELETE /api/v1/admin/reviews/{id}`
- `GET /api/v1/admin/trade-in`
- `GET /api/v1/admin/trade-in/{id}`
- `PATCH /api/v1/admin/trade-in/{id}/valuate`
- `PATCH /api/v1/admin/trade-in/{id}/complete`
- `PATCH /api/v1/admin/trade-in/{id}/status`
- `GET /api/v1/admin/reports/revenue`
- `GET /api/v1/admin/reports/products`
- `GET /api/v1/admin/reports/customers`
- `GET /api/v1/admin/reports/inventory`
- `GET /api/v1/admin/reports/returns`
- `GET /api/v1/admin/reports/export`

## Full BA admin completion

Status: DONE on 2026-05-17 for backend contract coverage from `ba-docs/09-api-admin.md` that was still missing.

New/normalized endpoints ready for FE:

- Admin users: `GET /api/v1/admin/users`, `GET /api/v1/admin/users/{id}`, `PATCH /api/v1/admin/users/{id}`, `PATCH /api/v1/admin/users/{id}/status`, `DELETE /api/v1/admin/users/{id}`.
- Notifications: `POST /api/v1/admin/notifications/broadcast`, `POST /api/v1/admin/notifications/send-to-user`.
- Suppliers: `GET /api/v1/admin/suppliers`, `POST /api/v1/admin/suppliers`, `PATCH /api/v1/admin/suppliers/{id}`.
- Installments: `GET /api/v1/admin/installment-plans`, `POST /api/v1/admin/installment-plans`, `PATCH /api/v1/admin/installment-plans/{id}`, `DELETE /api/v1/admin/installment-plans/{id}`.
- Invoice manual ops: `POST /api/v1/admin/invoices`, `DELETE /api/v1/admin/invoices/{id}`.
- Warranty master: `GET /api/v1/admin/warranty`, `POST /api/v1/admin/warranty`.
- Catalog extras: `PATCH /api/v1/admin/products/{productId}/images/reorder`, `POST/PATCH/DELETE /api/v1/admin/combos`, `POST/PATCH/DELETE /api/v1/admin/blog`.
- Review extras: `PATCH /api/v1/admin/reviews/{id}/status`, `POST /api/v1/admin/reviews/{id}/reply`.
- BA path aliases: `PATCH /api/v1/admin/shipments/{id}/tracking`, `/api/v1/admin/settings/banners`, `/api/v1/admin/settings/email-templates`, `/api/v1/admin/settings/seo`, `PATCH /api/v1/admin/branches/{id}/toggle`, `GET /api/v1/admin/staff/{id}`.

Verification:

- Flyway `V17__admin_remaining_modules.sql`: admin users, notifications, suppliers, installment plans, combos, blog, review replies.
- Flyway `V18__admin_banner_qa_data.sql`: 10 admin banner QA rows.
- `mvn test`: passed, 18 tests.
- `GET /api/v1/admin/banners`
- `POST /api/v1/admin/banners`
- `PATCH /api/v1/admin/banners/{id}`
- `DELETE /api/v1/admin/banners/{id}`

## Catalog contract cleanup needed

Status: DONE on 2026-05-16.

This does not block the current admin product screen because FE maps the values conservatively, but BE docs and DB enum should be aligned:

- `product_status` now supports `INACTIVE` and still keeps `COMING_SOON` for backward compatibility.
- `product_condition` now supports `REFURBISHED`.

## P0 gaps for admin operations

Status: DONE on 2026-05-15.

Implemented endpoints:

- `GET /api/v1/admin/invoices?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/invoices/{id}`
- `GET /api/v1/admin/invoices/{id}/download`
- `PATCH /api/v1/admin/invoices/{id}/status`
- `GET /api/v1/admin/shipments?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/shipments/{id}`
- `POST /api/v1/admin/shipments`
- `PATCH /api/v1/admin/shipments/{id}`
- `PATCH /api/v1/admin/shipments/{id}/status`

Verification:

- `mvn test`: passed.
- FE wired on 2026-05-16:
  - `/admin/returns` consumes `GET /api/v1/admin/returns`, `GET /api/v1/admin/returns/{id}`, `PATCH /api/v1/admin/returns/{id}/status`, and `POST /api/v1/admin/returns/{id}/dispute-resolution`.
  - `/admin/warranty` consumes `GET /api/v1/admin/warranty-claims`, `GET /api/v1/admin/warranty-claims/{id}`, and `PATCH /api/v1/admin/warranty-claims/{id}/status`.
  - `/admin/reviews` consumes `GET /api/v1/admin/reviews`, `PATCH /api/v1/admin/reviews/{id}/approve`, `PATCH /api/v1/admin/reviews/{id}/hide`, and `DELETE /api/v1/admin/reviews/{id}`.
  - Latest local totals: returns `10`, warranty claims `11`, reviews `10`.
  - `/admin/returns`, `/admin/warranty`, `/admin/reviews`: HTTP 200.
  - `npm.cmd run build`: passed.

QA data status:

- DONE on 2026-05-16 via Flyway `V14__admin_qa_data_trade_in.sql`.
- Seed has at least 10 return rows, 10 warranty claim rows, and 10 review rows so FE admin QA can exercise pagination, filters, status transitions, and moderation actions.

Admin trade-in status:

- DONE on 2026-05-16.
- FE wired `/admin/trade-in` on 2026-05-17 to real backend endpoints:
  - `GET /api/v1/admin/trade-in?page=&pageSize=&status=&search=`
  - `GET /api/v1/admin/trade-in/{id}`
  - `PATCH /api/v1/admin/trade-in/{id}/valuate`
  - `PATCH /api/v1/admin/trade-in/{id}/complete`
  - `PATCH /api/v1/admin/trade-in/{id}/status`
- Latest FE verification:
  - `GET /api/v1/admin/trade-in?page=1&pageSize=100`: `pagination.total = 10`.
  - `npm.cmd run build`: passed.
  - `http://localhost:5173/admin/trade-in`: not reachable from shell during verification, so browser-level route check still needs FE dev server on port 5173.
- FE wired on 2026-05-16:
  - `/admin/inventory` consumes `GET /api/v1/admin/inventory`.
  - Adjust dialog calls `PATCH /api/v1/admin/inventory/{id}/adjust`.
  - Movement dialog calls `GET /api/v1/admin/inventory/{productId}/movements`.
  - Local `GET /api/v1/admin/inventory?page=1&pageSize=100` returned `pagination.total = 15`.
  - `npm.cmd run build`: passed.
- FE wired `/admin/payments`, `/admin/invoices`, and `/admin/shipments` to real backend endpoints.
- Latest FE verification:
  - `GET /api/v1/admin/payments?page=1&pageSize=100`: `pagination.total = 34`.
  - `GET /api/v1/admin/invoices?page=1&pageSize=100`: `pagination.total = 14`.
  - `GET /api/v1/admin/shipments?page=1&pageSize=100`: `pagination.total = 14`.
  - `/admin/payments`, `/admin/invoices`, `/admin/shipments`: HTTP 200.
  - `npm.cmd run build`: passed.

QA data status:

- DONE on 2026-05-16 via Flyway `V14__admin_qa_data_trade_in.sql`.
- Seed has at least 10 admin payment rows, 10 invoice rows, and 10 shipment rows so FE admin QA can exercise pagination, filters, mark-overdue/refund, invoice status, and shipment status transitions.

### Admin invoices

Status: DONE.

Needed because FE has `/admin/invoices` as an independent admin page. Current `FE_PAYMENT_INVOICE_CONTRACT.md` explicitly defers admin invoice list/detail/status endpoints.

Required endpoints:

- `GET /api/v1/admin/invoices?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/invoices/{id}`
- `GET /api/v1/admin/invoices/{id}/download`

Optional endpoint only if BA requires manual invoice state control:

- `PATCH /api/v1/admin/invoices/{id}/status`

Implemented note:

- `PATCH /api/v1/admin/invoices/{id}/status` is implemented.
- `GET /api/v1/admin/invoices/{id}/download` returns binary `application/pdf`, not `ApiResponse`.

Expected filters:

- `status`: `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`
- `search`: invoice number, order number, customer name, customer phone

### Admin shipments

Status: DONE.

Needed because FE has `/admin/shipments` as an independent admin page. Current `FE_SHIPMENT_CONTRACT.md` explicitly defers admin shipment list/detail/create/update.

Required endpoints:

- `GET /api/v1/admin/shipments?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/shipments/{id}`
- `PATCH /api/v1/admin/shipments/{id}/status`

Expected statuses:

- `AWAITING_PICKUP`
- `IN_TRANSIT`
- `DELIVERED`
- `FAILED`

Expected state rule:

- `AWAITING_PICKUP -> IN_TRANSIT`
- `IN_TRANSIT -> DELIVERED`
- `IN_TRANSIT -> FAILED`

Order status remains the source of truth for `SHIPPING -> DELIVERED`. If shipment status update can mark delivery, BE must document the side effects on order, payment, and invoice.

Implemented note:

- `PATCH /api/v1/admin/shipments/{id}/status` supports the documented state rule.
- `POST /api/v1/admin/shipments` creates a manual shipment for `CONFIRMED` or `SHIPPING` orders.
- `PATCH /api/v1/admin/shipments/{id}` updates `trackingNumber`, `carrierName`, and optional `estimatedDelivery`.
- If shipment is changed `IN_TRANSIT -> DELIVERED` and the linked order is `SHIPPING`, BE also marks the order `DELIVERED`, sets `actual_delivery_date`, applies COD payment paid side effects, and marks pending invoice paid.

Create request:

```json
{
  "orderId": "uuid",
  "trackingNumber": "GHTK-CP2026051600001",
  "carrierName": "Giao Hang Tiet Kiem",
  "status": "AWAITING_PICKUP",
  "estimatedDelivery": "2026-05-20"
}
```

Tracking update request:

```json
{
  "trackingNumber": "GHTK-UPDATED",
  "carrierName": "Giao Hang Nhanh",
  "estimatedDelivery": "2026-05-21"
}
```

## P1 gaps for admin dashboard

Status: DONE on 2026-05-15 for the minimum useful dashboard contract.

Implemented endpoints:

- `GET /api/v1/admin/dashboard/stats`
- `GET /api/v1/admin/dashboard/revenue-chart?period=day|week|month&from=&to=`
- `GET /api/v1/admin/dashboard/recent-orders?limit=`
- `GET /api/v1/admin/dashboard/recent-activity?limit=`

Implemented response coverage:

- total revenue
- total orders
- pending orders
- delivered orders
- cancelled orders
- unpaid/overdue payment count
- low-stock variant count using `stock <= minStock`
- recent order summary list
- recent activity from `order_status_history`

Verification:

- `mvn test`: passed.
- FE can wire `/admin` dashboard to real backend endpoints.

Needed because `/admin` is the first admin screen.

Required endpoints from BA `09-api-admin.md`:

- `GET /api/v1/admin/dashboard/stats`
- `GET /api/v1/admin/dashboard/revenue-chart?period=day|week|month&from=&to=`
- `GET /api/v1/admin/dashboard/recent-orders?limit=`
- `GET /api/v1/admin/dashboard/recent-activity?limit=`

Minimum useful response:

- total revenue
- total orders
- pending orders
- delivered orders
- cancelled orders
- unpaid/overdue payment count
- low-stock product or variant count
- recent order summary list

## P1 gaps for admin inventory

Status: DONE on 2026-05-16.

Required endpoints from BA inventory plan:

- `GET /api/v1/admin/inventory?page=&pageSize=&status=&brand=&search=`
- `GET /api/v1/admin/inventory/{id}`
- `PATCH /api/v1/admin/inventory/{id}/adjust`
- `GET /api/v1/admin/inventory/low-stock`
- `GET /api/v1/admin/inventory/{productId}/movements`

Required behavior:

- Persist per-variant `minStock`.
- Record stock movement/audit when stock is adjusted manually.
- Support IMEI/serial persistence for phone inventory.
- Return low-stock rows when `stock <= minStock`.
- Do not let manual stock adjustment break existing order reservation/release behavior.

Implemented note:

- `product_variants.min_stock` persists per variant.
- `product_variants.imei_serials` persists IMEI/serial values for phone inventory.
- `PATCH /api/v1/admin/inventory/{id}/adjust` writes `stock_movements` audit rows.
- Supported `status` filters: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`.
- Existing order reservation/release still uses `product_variants.stock`; inventory adjust does not modify reservation rows.

FE adjust request:

```json
{
  "stock": 18,
  "minStock": 5,
  "reason": "Manual warehouse recount"
}
```

Verification:

- `mvn test`: passed.

## P1 gaps for admin promotions

Status: DONE on 2026-05-16.

Required endpoints:

- `GET /api/v1/admin/promotions?page=&pageSize=&status=&search=`
- `POST /api/v1/admin/promotions`
- `GET /api/v1/admin/promotions/{id}`
- `PATCH /api/v1/admin/promotions/{id}`
- `PATCH /api/v1/admin/promotions/{id}/toggle`
- `DELETE /api/v1/admin/promotions/{id}`

Important BE rules:

- validate code uniqueness
- validate date range
- validate min order amount
- validate max discount amount
- keep usage count immutable from FE
- seed at least 10 promotions for admin QA data

Implemented note:

- Code uniqueness is validated case-insensitively.
- `startDate < endDate` is validated.
- Percentage value must be `0..100`.
- `usedCount` is not accepted in FE request and remains backend-owned.
- Seed data now has 10 promotions for admin QA, including active, inactive/scheduled, expired samples.
- Supported `status` filters: `ACTIVE`, `INACTIVE`, `SCHEDULED`, `EXPIRED`.

FE create/update request:

```json
{
  "code": "FLASH5",
  "name": "Giam 5% flash sale",
  "description": "Giam 5% toi da 300000 VND",
  "type": "PERCENTAGE",
  "value": 5,
  "minOrderValue": 1000000,
  "maxDiscount": 300000,
  "startDate": "2026-01-01T00:00:00+07:00",
  "endDate": "2026-12-31T23:59:59+07:00",
  "usageLimit": 500,
  "applicableProducts": [],
  "applicableCategories": [],
  "applicableBrands": [],
  "isActive": true
}
```

Verification:

- `mvn test`: passed.

## P2 gaps for after-sales admin

Status: DONE on 2026-05-16.

These screens can now be wired to real API.

### Returns

Status: DONE.

Required endpoints:

- `GET /api/v1/admin/returns?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/returns/{id}`
- `PATCH /api/v1/admin/returns/{id}/status`
- `POST /api/v1/admin/returns/{id}/dispute-resolution`

Required state machine from BA:

- `PENDING -> APPROVED -> PROCESSING -> REFUNDED -> CLOSED`
- `PENDING -> REJECTED`

Implemented note:

- Invalid transitions return BA error shape with `RETURN_INVALID_STATUS`.
- `POST /returns/{id}/dispute-resolution` stores `disputeResolution`.
- As of 2026-05-28, `PROCESSING -> REFUNDED` updates the linked original order from `DELIVERED` to `RETURNED`, writes `order_status_history`, and reverses earned loyalty points idempotently.

### Warranty

Status: DONE.

Required endpoints:

- `GET /api/v1/admin/warranty-claims?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/warranty-claims/{id}`
- `PATCH /api/v1/admin/warranty-claims/{id}/status`

Required state machine:

- `NEW -> PROCESSING -> RESOLVED`
- `NEW -> REJECTED`

Implemented note:

- Status update accepts optional `note`, stored as `resolutionNote`.

### Reviews

Status: DONE.

Required endpoints:

- `GET /api/v1/admin/reviews?page=&pageSize=&status=&rating=&search=`
- `PATCH /api/v1/admin/reviews/{id}/approve`
- `PATCH /api/v1/admin/reviews/{id}/hide`
- `DELETE /api/v1/admin/reviews/{id}`

Implemented note:

- Review statuses: `PENDING`, `APPROVED`, `HIDDEN`.
- `rating` filter supports exact rating `1..5`.

Verification:

- `mvn test`: passed.

### Trade-in

Status: DONE.

Required endpoints from BA `07-api-after-sales.md`:

- `GET /api/v1/admin/trade-in?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/trade-in/{id}`
- `PATCH /api/v1/admin/trade-in/{id}/valuate`
- `PATCH /api/v1/admin/trade-in/{id}/complete`
- `PATCH /api/v1/admin/trade-in/{id}/status`

Implemented state rule:

- `AWAITING_VALUATION -> VALUED`
- `AWAITING_VALUATION -> REJECTED`
- `VALUED -> ACCEPTED`
- `VALUED -> REJECTED`
- `ACCEPTED -> COMPLETED`

Valuate request:

```json
{
  "finalValuation": 4500000,
  "adminNote": "May dep, pin 89%"
}
```

Status update request:

```json
{
  "status": "REJECTED",
  "adminNote": "May vo man hinh"
}
```

QA data:

- Seed has 10 trade-in rows for admin QA pagination/filter/status testing.

## P3 gaps for admin reports and settings

Status: DONE on 2026-05-16 for backend endpoints needed by FE admin screens.

FE wired `/admin/reports` on 2026-05-17:

- Revenue chart consumes `GET /api/v1/admin/reports/revenue?from=&to=`.
- Product chart consumes `GET /api/v1/admin/reports/products`.
- Customer table consumes `GET /api/v1/admin/reports/customers`.
- Inventory table consumes `GET /api/v1/admin/reports/inventory`.
- Return status chart consumes `GET /api/v1/admin/reports/returns`.
- CSV action consumes binary `GET /api/v1/admin/reports/export?type=`.
- Latest local verification:
  - revenue rows = 1.
  - product rows = 11.
  - customer rows = 28.
  - inventory rows = 11.
  - returns total count = 10.
  - `/admin/reports`: HTTP 200.
  - `npm.cmd run build`: passed.

Resolved / non-blocking BE QA-data note:

- Revenue report can use the additional buyer demo orders from Flyway `V23__buyer_demo_gap_data.sql` after migration. If FE needs a larger chart, add a dedicated report seed later; this is no longer a blocker for admin screen wiring.
- Activity logs are wired by FE and local `GET /api/v1/admin/activity-logs?page=1&pageSize=100` now returns `pagination.total = 15`.
- Banners are wired by FE and local `GET /api/v1/admin/banners` now returns 11 rows after QA seed migration.
- Email templates are wired by FE and local `GET /api/v1/admin/email-templates` now returns 12 rows.
- Branches/stores are wired by FE and local `GET /api/v1/admin/branches` now returns 12 rows.
- Staff is wired by FE and local `GET /api/v1/admin/staff` now returns 13 rows.
- FE admin terminology cleanup is display-only: orders/payments/analytics/users/internal suppliers now show retail labels such as `Cửa hàng`, `Thanh toán`, `Đối tác`, and `Nguồn hàng`. BE can keep current DTO fields like `supplierName`, role value `Nhà cung cấp`, and `/api/v1/admin/suppliers` until a formal API rename is scheduled.
- FE shared procurement copy cleanup is display-only: visible labels now map `RFQ` to `Báo giá`, `Hợp đồng` to `Thỏa thuận`/`Tài liệu mua hàng`, and `Công nợ` to `Thanh toán`. BE can keep current enum/entity keys until a formal migration is scheduled.

Required reports from BA:

- `GET /api/v1/admin/reports/revenue`
- `GET /api/v1/admin/reports/products`
- `GET /api/v1/admin/reports/customers`
- `GET /api/v1/admin/reports/inventory`
- `GET /api/v1/admin/reports/returns`
- `GET /api/v1/admin/reports/export`

Implemented note:

- `/reports/export` returns binary `text/csv`, not `ApiResponse`.
- Revenue report supports `from` and `to` as `YYYY-MM-DD`.

Required settings/content endpoints:

- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings`
- banner CRUD: `GET/POST/PATCH/DELETE /api/v1/admin/banners`
- email template CRUD and preview: `GET/POST/PATCH/DELETE /api/v1/admin/email-templates`, `POST /api/v1/admin/email-templates/{id}/preview`
- SEO get/update: `GET /api/v1/admin/seo`, `PATCH /api/v1/admin/seo/{pageKey}`
- branch/store CRUD: `GET/POST/PATCH/DELETE /api/v1/admin/branches`
- staff CRUD/deactivate: `GET/POST/PATCH /api/v1/admin/staff`, `PATCH /api/v1/admin/staff/{id}/deactivate`
- activity logs list/stats: `GET /api/v1/admin/activity-logs`, `GET /api/v1/admin/activity-logs/stats`

Verification:

- `mvn test`: passed.

## Contract requirements for every new BE endpoint

Every endpoint above must follow the current BE response shape:

```json
{
  "success": true,
  "data": {},
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Paginated endpoints must return:

```json
{
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

Admin endpoints may continue using dev headers until security/RBAC is implemented:

- `X-Admin-Id`
- `X-Admin-Name`
- `X-User-Id` only for customer-scoped endpoints

## FE fallback cleanup note - 2026-05-23

FE completed a visible-copy cleanup for runtime fallback/mock data used when BE data is unavailable:

- Document center fallback documents now use retail purchase, invoice, warranty, quote, shipment, and guide examples.
- Admin mock email templates, banners, SEO config, certificates, activity logs, invoices, and tax configs now use phone/accessory retail examples instead of B2B marketplace, RFQ, NCC, công nợ, steel/textile/industrial examples.
- No BE endpoint change is required for this step.

Current BE-compatible constraint:

- FE still preserves legacy field/API names where they are part of the existing contract, for example `supplierName` and `emailOnNewRFQ`.
- If BE decides to formally rename supplier/RFQ concepts to store/quote concepts, BE should provide a DTO migration plan and mark the breaking fields/endpoints clearly.

## FE runtime surface cleanup note - 2026-05-23

FE also cleaned visible runtime copy in auth, command/search suggestions, report builder, analytics fallback data, and admin payment labels.

No BE blocker was found in this step. Remaining legacy keys are compatibility constraints:

- `ReportDataSource` still contains `NCC`, `RFQ`, and `Công nợ`.
- FE maps those to visible `Cửa hàng`, `Báo giá`, and `Thanh toán`.
- A formal BE/type migration can be planned later, but current FE behavior does not require BE changes.

## FE legacy stub cleanup note - 2026-05-24

FE audited `src/app/services/api.ts` and `src/app/data/mockData.ts`:

- Visible fallback values were adjusted from B2B wording to retail/store wording.
- Legacy `rfqNumber` fallback now generates `BG-*` while keeping the field name for compatibility.
- The mock seller-like account now uses `nguonhang@cellphones.vn`; the role value `Nhà cung cấp` is preserved because current FE auth/admin filters still depend on it and map it visibly to `Đối tác`.

No BE change is required now. If BE wants to remove legacy naming completely, plan a coordinated DTO migration for:

- `supplierId`, `supplierName`, `supplierCompany`, `supplierTaxCode`
- `rfqNumber`, `pendingRFQs`
- `activeContracts`
- role value `Nhà cung cấp`

## FE route audit note - 2026-05-24

FE audited registered routes:

- `/seller/*`, `/rfq`, `/contracts`, `/bulk-order`, `/pr-list` are not registered in the active B2C route tree.
- Admin `/rfq` and `/contracts` are not registered either.
- Activity-log links for legacy BE entities were remapped to existing admin pages:
  - `RFQ` -> `/admin/report-builder`
  - `Hợp đồng` -> `/admin/documents`
  - `Chứng chỉ` -> `/admin/documents`
  - `Người dùng` -> `/admin/customers`

No BE change is required. BE may continue emitting legacy activity-log entity values; FE now handles them without dead links.

## FE route consistency note - 2026-05-24

FE completed a visible-link consistency pass:

- `/chat` is now registered as an authenticated customer route because existing product/order/profile actions navigate there.
- Removed command-palette exposure for deleted `/seller/*`, `/templates`, and `/quick-order` routes.
- Footer links were changed away from unregistered `/about`, `/contact`, `/policy`.
- Store search links now point to `/stores` instead of `/stores/{id}` because no store-detail route exists yet.

No BE change is required. If BE later supports store detail pages, FE can restore `/stores/{id}` with a matching route and endpoint.

## FE route smoke note - 2026-05-24

FE ran a Vite route smoke check for:

- `/login`, `/admin`, `/admin/categories`, `/admin/products`, `/admin/orders`
- `/admin/payments`, `/admin/invoices`, `/admin/shipments`, `/admin/activity-logs`
- `/products`, `/cart`, `/orders`, `/chat`, `/stores`

All checked routes returned HTTP 200 and served the app shell. No BE change is required from this smoke pass.

Remaining verification should be manual browser interaction for admin actions that depend on live BE state: category tree/edit, product approval, order status, payment mark-overdue/refund, invoice/detail/export, and shipment status/tracking.

## FE admin action smoke note - 2026-05-24

FE ran live BE smoke checks for the admin actions currently used by:

- `/admin/payments`
- `/admin/invoices`
- `/admin/shipments`

Passed endpoints:

- `PATCH /api/v1/admin/payments/{id}/mark-overdue`
- `POST /api/v1/admin/payments/{id}/refund`
- `GET /api/v1/admin/invoices/{id}`
- `GET /api/v1/admin/invoices/{id}/download`
- `PATCH /api/v1/admin/shipments/{id}/status`

Smoke data touched:

- Payment/order `CP2026052300084`: marked `OVERDUE`.
- Payment/order `CP2026052300082`: refund smoke with amount `1000`, BE returned `REFUNDED`.
- Shipment `DEMO-BUYER-GHTK-0001`: moved `AWAITING_PICKUP -> IN_TRANSIT`.

Backend refund gap resolved on 2026-05-24:

- `POST /api/v1/admin/payments/{id}/refund` now supports partial refund.
- If cumulative refund amount is lower than `paidAmount`, BE returns `PARTIALLY_REFUNDED` and updates `orders.paymentStatus = PARTIALLY_REFUNDED`.
- Follow-up refund is allowed while status is `PARTIALLY_REFUNDED`.
- If cumulative refund amount reaches `paidAmount`, BE returns `REFUNDED` and updates `orders.paymentStatus = REFUNDED`.
- `refundAmount` in `AdminPaymentDto` is cumulative.
- Loyalty reverse side effect runs only when payment reaches full `REFUNDED`.
- `refundAmount + existingRefundAmount > paidAmount` returns `REFUND_AMOUNT_EXCEEDS_PAID`.
- Verification after fix: `mvn test` passed, 26 tests, 0 failures, 0 errors.

No other BE blocker was found for invoice detail/download or shipment status update.

## FE remaining critical smoke note - 2026-05-24

FE ran another live BE smoke pass for remaining critical admin surfaces:

- `GET /api/v1/categories?includeInactive=true`: passed, current tree has `2` roots and the first root has `5` children.
- `GET /api/v1/products/{id}`: passed for product detail with variants/images.
- `PATCH /api/v1/admin/orders/{id}/status`: passed for `PENDING -> CONFIRMED`.
- `GET /api/v1/admin/reports/export?type=revenue`: passed, `text/csv`.
- `GET /api/v1/admin/reports/export?type=products`: passed, `text/csv`.
- `GET /api/v1/admin/reports/export?type=customers`: passed, `text/csv`.
- `GET /api/v1/admin/reports/export?type=inventory`: passed, `text/csv`.
- `GET /api/v1/admin/reports/export?type=returns`: passed, `text/csv`.

Smoke data touched:

- Order `CP2026052300084`: moved `PENDING -> CONFIRMED`.

No new BE blocker was found in this pass. Refund semantics are now resolved as partial-refund capable.

## FE partial refund alignment note - 2026-05-24

FE has been updated to consume the resolved partial refund contract:

- `/admin/payments` now exposes refund for `PAID` and `PARTIALLY_REFUNDED`.
- FE calculates remaining refundable amount as `paidAmount - refundAmount`.
- FE blocks refund requests greater than the remaining refundable amount.
- Payment detail displays cumulative refunded amount and remaining refundable amount.

Live verification after BE fix:

- Payment/order `CP2026052400016`
- Refund request amount: `1000`
- BE response status: `PARTIALLY_REFUNDED`
- BE response cumulative `refundAmount`: `1000`
- Remaining refundable amount calculated by FE: `33989000`

No BE gap remains for admin payment refund at this point.

## FE sidebar scope note - 2026-05-24

FE removed these mock-only / not-yet-wired routes from the primary admin sidebar:

- `/admin/analytics`
- `/admin/report-builder`
- `/admin/warehouses`
- `/admin/combos`
- `/admin/installments`
- `/admin/loyalty`
- `/admin/blog`
- `/admin/suppliers`

No new BE blocker is raised by this change. The routes still exist in FE code for future wiring, but they should not be treated as production-ready admin modules until FE connects them to the agreed BE contract and verifies seed data.

## FE admin customers wiring note - 2026-05-24

FE `/admin/customers` now consumes the existing admin users contract:

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/status`
- `DELETE /api/v1/admin/users/{id}`

FE removed the visible create-user, CSV-import, reset-password, and send-email actions because the current BE contract does not expose those operations.

Optional BE backlog, not blocking the current admin page:

- Add `POST /api/v1/admin/users` if admin-created accounts are required.
- Add reset-password / admin notification endpoints if those actions are required on the customer detail modal.

Data note:

- Added `V31__admin_users_demo_data.sql` with 10 additional admin-user/customer rows so a fresh DB has more than 10 rows for this screen.
- Local verification after Flyway V31: `GET /api/v1/admin/users?page=1&pageSize=20` returned 13 total rows (`ADMIN:2`, `STAFF:3`, `CUSTOMER:8`).

## FE admin documents scope note - 2026-05-24

FE reviewed `/admin/documents` and found it is still backed by local `documentApi.ts` mock data. FE removed `Tài liệu` from the primary admin sidebar so admin users do not operate a fake upload/archive/delete flow.

Route compatibility:

- `/admin/documents` remains registered in FE for old links/activity-log compatibility.

BE backlog if documents are required as a real admin module:

- `GET /api/v1/admin/documents?page=&pageSize=&category=&status=&fileType=&search=`
- `GET /api/v1/admin/documents/{id}`
- `POST /api/v1/admin/documents`
- `PATCH /api/v1/admin/documents/{id}`
- `DELETE /api/v1/admin/documents/{id}`
- `GET /api/v1/admin/documents/{id}/download`
- Optional: `GET /api/v1/admin/documents/{id}/versions`, `GET /api/v1/admin/documents/stats`.

This is not a blocker for the current admin menu because the mock-only route is no longer exposed there.

## FE shared notification/search cleanup note - 2026-05-24

FE removed random/mock notification generation from the shared notification provider. Notification UI now relies on the existing BE-backed adapter for:

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}/read`
- `PATCH /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/{id}`

FE also removed legacy/procurement notification filters from visible shared UI: RFQ, contract, approval, credit, message.

Live verification:

- `GET /api/v1/notifications?page=1&pageSize=5`: returned 5 rows.
- `GET /api/v1/notifications/unread-count`: returned unread count `12`.

No BE blocker remains for shared notification display. Shared search suggestions also stopped calling legacy supplier search; no BE change required.
