# FE Admin Progress

## Done - Admin Orders Explicit Detail Entry - 2026-05-28

Scope:

- `/admin/orders`
- Order list table/list views.

Files changed:

- `src/app/components/admin/OrderOverview.tsx`

Implemented behavior:

- Added a visible `Chi tiết` action button in the order table action column.
- Added a visible `Chi tiết` button in list-card mode.
- Existing row-click detail behavior is preserved, but users no longer need to discover it.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required.

Next action:

- Manual smoke in browser: open `/admin/orders`, click `Chi tiết`, then use `Xác nhận đơn` / `Chuyển giao hàng` actions inside the popup.

## Done - Admin Order Status Action Buttons - 2026-05-28

Scope:

- `/admin/orders`
- Order detail popup status workflow.

Files changed:

- `src/app/components/admin/OrderOverview.tsx`

Implemented behavior:

- Order detail popup now exposes direct action buttons by current status:
  - `PENDING` -> `Xác nhận đơn`
  - `CONFIRMED` -> `Chuyển giao hàng`
  - `SHIPPING` -> `Đã giao`
  - cancellable non-final orders -> `Huỷ đơn`
- Each action calls `PATCH /api/v1/admin/orders/{id}/status` with an admin note.
- Local table/detail state is updated after status change.
- Side data for payment, invoice, and shipment is reloaded after status transition, so invoice/shipment side effects from BE are visible after `CONFIRMED -> SHIPPING`.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required.

Next action:

- Manual smoke in browser: create a buyer order, open `/admin/orders`, confirm it, move to shipping, then verify buyer order detail timeline and admin shipment/invoice tabs update from BE.

## Done - Product Variant Images - 2026-05-27

Routes:

- `/admin/products`

Files changed:

- `src/app/components/admin/ProductApproval.tsx`
- `src/app/components/buyer/ProductDetailPage.tsx`
- `src/app/services/api.ts`
- `be/src/main/resources/db/migration/V32__product_images_variant_link.sql`
- `be/src/main/resources/db/migration/V33__product_variant_images_demo_data.sql`
- `be/src/main/java/com/b2b/ecommerce/catalog/ProductImageEntity.java`
- `be/src/main/java/com/b2b/ecommerce/catalog/ProductImageDto.java`
- `be/src/main/java/com/b2b/ecommerce/catalog/ProductImageRequest.java`
- `be/src/main/java/com/b2b/ecommerce/catalog/CatalogService.java`

Implemented behavior:

- `product_images` now has nullable `variant_id`.
- Admin can add/edit image as shared product image or image for a specific variant.
- Product detail popup displays whether each image is shared or belongs to a variant.
- Buyer product detail gallery prioritizes images of the selected variant and falls back to shared product images.
- BE seeds 10 variant-specific demo images for QA/demo.

Verification:

- `mvn test`: passed, 26 tests.
- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Next action:

- Manually review the real image URLs later if demo must show actual product/color photos instead of placeholder variant images.

## Done - Admin Orders List Restore - 2026-05-28

Routes:

- `/admin/orders`

Files changed:

- `src/app/services/adminBackendApi.ts`

Issue:

- BE `GET /api/v1/admin/orders` returned data, but FE adapter assumed `items` was always an array.
- Admin order list endpoint returns `items` as summary object `{ count, firstItem }`, while detail returns full item arrays.
- The `.map()` call on summary object caused FE fetch/render failure and the page looked empty.

Implemented behavior:

- `mapOrder` now supports both admin list summary shape and detail item array shape.
- Summary `firstItem` is normalized to a one-item array for existing UI/detail code.
- `itemCount` is preserved from BE summary count.

Verification:

- `GET /api/v1/admin/orders?page=1&pageSize=5`: passed locally, returned 277 total orders.
- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Next action:

- Reload `/admin/orders`; then validate detail popup actions for status update, invoice, payment, and shipment against one real order.

Source of truth:

- BA docs: `B2B eCommerce Platform Plan/ba-docs`
- BE contracts: `be/docs/FE_*_CONTRACT.md`
- FE process: `B2B eCommerce Platform Plan/docs/FE_ADMIN_PROCESS.md`

## Current status

### Done - Categories

Files changed:

- `src/app/services/adminBackendApi.ts`
- `src/app/components/admin/CategoryManagement.tsx`
- `src/app/components/shared/CategoryCombobox.tsx`

BE contract used:

- `be/docs/FE_CATALOG_CONTRACT.md`

Implemented behavior:

- Category tree reads from `GET /api/v1/categories?includeInactive=true`.
- Create category uses `POST /api/v1/admin/categories`.
- Update category uses `PATCH /api/v1/admin/categories/{id}`.
- Delete category uses `DELETE /api/v1/admin/categories/{id}`.
- FE flattens BE tree for table pagination and parent lookup.
- Tree view displays parent/child structure.
- Expand/collapse arrow no longer opens edit dialog.
- Parent category combobox supports root option and full tree selection.
- Current category is excluded when choosing parent during edit.

Verification:

- `GET /api/v1/categories?includeInactive=true`: passed locally.
- `/admin/categories`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

Data:

- Existing BE seed had 4 categories.
- FE requirement is minimum 10 records per completed module.
- Added BE seed requirement/implementation: `V10__seed_more_categories.sql`.

### Done - Products

Route:

- `/admin/products`

Files changed:

- `src/app/services/adminBackendApi.ts`
- `src/app/components/admin/ProductApproval.tsx`
- `be/src/main/resources/db/migration/V11__seed_more_products.sql`
- `be/src/main/resources/db/migration/V12__seed_product_minimum_active.sql`
- `be/src/test/java/com/b2b/ecommerce/B2bEcommerceApiApplicationTests.java`

BE contract used:

- `be/docs/FE_CATALOG_CONTRACT.md`

Implemented behavior:

- Product list from `GET /api/v1/products`.
- Product create/update/delete from `/api/v1/admin/products`.
- Product detail loads `GET /api/v1/products/{id}` plus variant/image lists.
- Admin table shows category, brand, status, price, stock summary, flags, and created date.
- Create/edit dialog includes category, brand, price, status, condition, warranty, tags, flags, and basic specifications.
- Delete uses BE soft delete contract through `DELETE /api/v1/admin/products/{id}`.
- Variant CRUD uses:
  - `POST /api/v1/admin/products/{productId}/variants`
  - `PATCH /api/v1/admin/products/{productId}/variants/{id}`
  - `DELETE /api/v1/admin/products/{productId}/variants/{id}`
- Image CRUD uses:
  - `POST /api/v1/admin/products/{productId}/images`
  - `PATCH /api/v1/admin/products/{productId}/images/{id}`
  - `DELETE /api/v1/admin/products/{productId}/images/{id}`
- After variant/image mutation FE reloads product detail and product list counts.

Data requirement:

- Minimum 10 active products in default `/products` list: satisfied.
- Minimum 10 variants: satisfied.
- Minimum 10 product images: satisfied.

Verification:

- `GET /api/v1/products?page=1&pageSize=20`: passed locally, `pagination.total = 10`.
- `/admin/products`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.
- `mvn test`: passed, 13 tests.

### Done - Inventory / stock

Route:

- `/admin/inventory`

Files changed:

- `src/app/components/admin/AdminInventoryPage.tsx`
- `be/docs/FE_ADMIN_BACKEND_GAPS.md`

BE contract used:

- `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminInventoryController.java`

Implemented behavior:

- Inventory list uses `GET /api/v1/admin/inventory?page=&pageSize=&status=&brand=&search=`.
- Stock adjustment uses `PATCH /api/v1/admin/inventory/{id}/adjust` with `stock`, `minStock`, and `reason`.
- Stock movement history uses `GET /api/v1/admin/inventory/{productId}/movements`.
- Stats show total SKU, enough stock, low stock, out of stock, and inventory value.
- Search supports product name, variant name, and SKU through BE search.
- Filters support BE status values `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` and brand.
- IMEI/serial count is displayed from `imeiSerials`; manual IMEI editing is not exposed because the BE adjust contract only supports stock/minStock/reason.

Data requirement:

- Minimum 10 inventory rows/SKUs: satisfied with 15 variants from BE seed.

Verification:

- `GET /api/v1/admin/inventory?page=1&pageSize=100`: passed locally, `pagination.total = 15`.
- `/admin/inventory`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

BE gap noted:

- No blocker for current FE inventory page. Future IMEI/serial edit UI needs a BE write contract if admin must manage serials from this screen.

### Done - Dashboard

Route:

- `/admin`

Files changed:

- `src/app/components/admin/AdminDashboard.tsx`
- `src/app/services/adminBackendApi.ts`

BE contracts used:

- `be/docs/FE_CATALOG_CONTRACT.md`
- `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- `be/docs/FE_PROMOTION_CONTRACT.md`

Implemented behavior:

- Dashboard no longer reads mock dashboard/supplier/admin services.
- Summary stats are derived from implemented BE endpoints:
  - `GET /api/v1/products`
  - `GET /api/v1/categories?includeInactive=true`
  - `GET /api/v1/admin/orders`
  - `GET /api/v1/admin/payments`
- Revenue is derived from paid payment data.
- Low stock is derived from product variants.
- Recent orders use admin order data.
- Charts use order status and product brand distribution from real BE responses.

Verification:

- `npm.cmd run build`: passed.

BE gap still open:

- Dedicated dashboard endpoints remain needed for production performance and historical chart accuracy.

### Done - Promotions

Route:

- `/admin/promotions`

Files changed:

- `src/app/components/admin/AdminPromotionPage.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/docs/FE_ADMIN_BACKEND_GAPS.md`

BE contract used:

- `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`

Implemented behavior:

- Promotion table reads real data from `GET /api/v1/admin/promotions`.
- Create promotion uses `POST /api/v1/admin/promotions`.
- Update promotion uses `PATCH /api/v1/admin/promotions/{id}`.
- Toggle active uses `PATCH /api/v1/admin/promotions/{id}/toggle`.
- Delete uses `DELETE /api/v1/admin/promotions/{id}`.
- Detail popup, search, status filter, pagination, and CSV export are retained.
- Create/edit form follows BE request shape and sends ISO offset date strings.

Data requirement:

- Minimum 10 promotions: satisfied with 10 records from local BE.

Verification:

- `GET /api/v1/admin/promotions?page=1&pageSize=100`: passed locally, `pagination.total = 10`.
- `/admin/promotions`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Orders

Route:

- `/admin/orders`

Files changed:

- `src/app/components/admin/OrderOverview.tsx`
- `src/app/components/shared/StatusBadge.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- `be/docs/FE_SHIPMENT_CONTRACT.md`

Implemented behavior:

- Order list reads real data from `GET /api/v1/admin/orders`.
- Detail popup loads order shipment, payment, and invoice from implemented BE endpoints.
- Status inline edit uses BE enum values: `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `RETURNED`.
- Status filter and payment status filter now match BE query contract.
- Dashboard stats and timeline now compare BE enum values instead of old FE Vietnamese labels.
- Fake dispute and fake refund actions were removed from the order screen.
- Cancel order uses `PATCH /api/v1/admin/orders/{id}/status` with `CANCELLED` and note.

Data requirement:

- Minimum 10 admin orders: satisfied with 18 records from local BE.

Verification:

- `GET /api/v1/admin/orders?page=1&pageSize=100`: passed locally, `pagination.total = 18`.
- `/admin/orders`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

BE gap noted:

- Dispute handling belongs to after-sales/admin returns and still needs BE endpoints before FE can operate it.
- Refund handling is available from the admin payment screen, not as a fake order action.

### Done - Payments

Route:

- `/admin/payments`

Files changed:

- `src/app/components/admin/AdminPaymentPage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`

Implemented behavior:

- Payment list reads real data from `GET /api/v1/admin/payments`.
- Search, pagination, detail popup, transaction history display, and CSV export remain available.
- Manual mark-paid uses `PATCH /api/v1/admin/payments/{id}/mark-paid`.
- Mark overdue uses `PATCH /api/v1/admin/payments/{id}/mark-overdue`, is exposed from row actions and detail, and is hidden for `PAID`, `REFUNDED`, `PARTIALLY_REFUNDED`.
- Refund uses `POST /api/v1/admin/payments/{id}/refund`, is exposed from row actions and detail only for `PAID`, validates amount against `paidAmount`, and displays returned refund metadata.
- After mark-overdue/refund, FE reloads the list so active filters and stats stay consistent with BE state.
- Status and method filters now use BE enum values instead of old FE labels:
  - status: `UNPAID`, `PAID`, `OVERDUE`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`
  - method: `CASH`, `BANK_TRANSFER`, `MOMO`, `VNPAY`, `COD`
- Stats now compare BE enum statuses.

Data requirement:

- Minimum 10 admin payments: satisfied with 34 records from local BE.

Verification:

- `GET /api/v1/admin/payments?page=1&pageSize=100`: endpoint passed locally, latest `pagination.total = 34`.
- `/admin/payments`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Invoices

Route:

- `/admin/invoices`

Files changed:

- `src/app/components/admin/AdminInvoicePage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`

Implemented behavior:

- Invoice list reads real data from `GET /api/v1/admin/invoices`.
- Detail popup opens with the selected row and refreshes from `GET /api/v1/admin/invoices/{id}`.
- Status update uses `PATCH /api/v1/admin/invoices/{id}/status`.
- After status update, FE reloads the list so filters and stats stay consistent with BE state.
- PDF download uses binary `GET /api/v1/admin/invoices/{id}/download`.
- CSV export is client-side from returned invoice data.
- Removed mock `invoiceApi` and removed UI fields/actions not returned by BE (`supplierTaxCode`, line items, fake resend/print invoice body).

Data requirement:

- Minimum 10 admin invoices: satisfied with 14 records from local BE.

Verification:

- `GET /api/v1/admin/invoices?page=1&pageSize=100`: endpoint passed locally, latest `pagination.total = 14`.
- `/admin/invoices`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Shipments

Route:

- `/admin/shipments`

Files changed:

- `src/app/components/admin/AdminShipmentPage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_SHIPMENT_CONTRACT.md`

Implemented behavior:

- Shipment list reads real data from `GET /api/v1/admin/shipments`.
- Detail popup opens with the selected row and refreshes from `GET /api/v1/admin/shipments/{id}`.
- Status update uses `PATCH /api/v1/admin/shipments/{id}/status`.
- FE only offers documented BE transitions: `AWAITING_PICKUP -> IN_TRANSIT`, `IN_TRANSIT -> DELIVERED/FAILED`.
- After status update, FE reloads the list so filters and stats stay consistent with BE state.
- CSV export is client-side from returned shipment data.
- Removed mock `shipmentApi` and removed UI fields/actions not returned by BE (`buyerName`, `supplierName`, fee/weight/dimensions/events/address timeline).

Data requirement:

- Minimum 10 admin shipments: satisfied with 14 records from local BE.

Verification:

- `GET /api/v1/admin/shipments?page=1&pageSize=100`: endpoint passed locally, latest `pagination.total = 14`.
- `/admin/shipments`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Returns

Route:

- `/admin/returns`

Files changed:

- `src/app/components/admin/AdminReturnPage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminAfterSalesController.java`

Implemented behavior:

- Return list reads real data from `GET /api/v1/admin/returns`.
- Detail popup refreshes from `GET /api/v1/admin/returns/{id}`.
- Status update uses `PATCH /api/v1/admin/returns/{id}/status`.
- FE only offers documented BE transitions: `PENDING -> APPROVED/REJECTED`, `APPROVED -> PROCESSING`, `PROCESSING -> REFUNDED`, `REFUNDED -> CLOSED`.
- Dispute resolution uses `POST /api/v1/admin/returns/{id}/dispute-resolution`.
- Removed mock returns and fake force-refund/intervention behavior from the operating path.

Data requirement:

- Minimum 10 admin returns: satisfied with 10 records from local BE.

Verification:

- `GET /api/v1/admin/returns?page=1&pageSize=100`: endpoint passed locally, latest `pagination.total = 10`.
- `/admin/returns`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Warranty

Route:

- `/admin/warranty`

Files changed:

- `src/app/components/admin/AdminWarrantyPage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminAfterSalesController.java`

Implemented behavior:

- Warranty claim list reads real data from `GET /api/v1/admin/warranty-claims`.
- Detail popup refreshes from `GET /api/v1/admin/warranty-claims/{id}`.
- Status update uses `PATCH /api/v1/admin/warranty-claims/{id}/status` with optional `note`.
- FE only offers documented BE transitions: `NEW -> PROCESSING/REJECTED`, `PROCESSING -> RESOLVED`.
- Removed mock warranty claims and fake local intervention/close behavior from the operating path.

Data requirement:

- Minimum 10 warranty claims: satisfied with 11 records from local BE.

Verification:

- `GET /api/v1/admin/warranty-claims?page=1&pageSize=100`: endpoint passed locally, latest `pagination.total = 11`.
- `/admin/warranty`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Reviews

Route:

- `/admin/reviews`

Files changed:

- `src/app/components/admin/ReviewManagement.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminAfterSalesController.java`

Implemented behavior:

- Review list reads real data from `GET /api/v1/admin/reviews`.
- Filters use BE enum/status contract: `PENDING`, `APPROVED`, `HIDDEN`, and exact `rating` from `1..5`.
- Approve uses `PATCH /api/v1/admin/reviews/{id}/approve`.
- Hide uses `PATCH /api/v1/admin/reviews/{id}/hide`.
- Delete uses `DELETE /api/v1/admin/reviews/{id}`.
- Removed mock `reviewApi`, fake admin reply, and bulk fake actions from the operating path because BE only documents moderation actions.

Data requirement:

- Minimum 10 admin reviews: satisfied with 10 records from local BE.

Verification:

- `GET /api/v1/admin/reviews?page=1&pageSize=100`: endpoint passed locally, latest `pagination.total = 10`.
- `/admin/reviews`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

### Done - Trade-in

Route:

- `/admin/trade-in`

Files changed:

- `src/app/components/admin/AdminTradeInPage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminTradeInController.java`

Implemented behavior:

- Trade-in list reads real data from `GET /api/v1/admin/trade-in`.
- Detail popup loads `GET /api/v1/admin/trade-in/{id}`.
- Admin valuation uses `PATCH /api/v1/admin/trade-in/{id}/valuate`.
- Complete accepted request uses `PATCH /api/v1/admin/trade-in/{id}/complete`.
- Reject/accept state changes use `PATCH /api/v1/admin/trade-in/{id}/status`.
- Status filters and actions follow BE states: `AWAITING_VALUATION`, `VALUED`, `ACCEPTED`, `REJECTED`, `COMPLETED`.
- Removed the old local/mock `tradeInApi` path from the admin operating screen.

Data requirement:

- Minimum 10 trade-in rows: satisfied with 10 records from local BE seed.

Verification:

- `GET /api/v1/admin/trade-in?page=1&pageSize=100`: passed locally, `pagination.total = 10`.
- `npm.cmd run build`: passed.
- `http://localhost:5173/admin/trade-in`: not reachable from shell during verification, so browser-level route check still needs the FE dev server on port 5173.

BE gap noted:

- No backend blocker for the current admin trade-in workflow.

### Done - Reports

Route:

- `/admin/reports`

Files changed:

- `src/app/components/admin/AdminReportPage.tsx`
- `src/app/services/adminBackendApi.ts`

BE contract used:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminReportsSettingsController.java`

Implemented behavior:

- Revenue chart reads `GET /api/v1/admin/reports/revenue?from=&to=`.
- Top product chart reads `GET /api/v1/admin/reports/products`.
- Top customer table reads `GET /api/v1/admin/reports/customers`.
- Inventory attention table reads `GET /api/v1/admin/reports/inventory`.
- Return status chart reads `GET /api/v1/admin/reports/returns`.
- CSV export uses binary `GET /api/v1/admin/reports/export?type=`.
- Removed the old mock `reportApi.getSystemOverview()` path from the admin report operating screen.

Data requirement:

- Report source data has at least 10 product rows, 10 customer rows, 10 inventory rows, and 10 return rows represented through current BE report outputs.

Verification:

- `GET /api/v1/admin/reports/revenue`: passed locally, latest data points = 1.
- `GET /api/v1/admin/reports/products`: passed locally, latest rows = 11.
- `GET /api/v1/admin/reports/customers`: passed locally, latest rows = 28.
- `GET /api/v1/admin/reports/inventory`: passed locally, latest rows = 11.
- `GET /api/v1/admin/reports/returns`: passed locally, latest total count = 10.
- `GET /api/v1/admin/reports/export?type=returns`: passed locally, returned CSV.
- `/admin/reports`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

BE gap noted:

- Revenue report currently groups by actual order dates; local seed data only produces 1 date point. This is not a FE blocker, but BE should add multi-day paid order seed data if QA needs a meaningful line chart over time.

Next action:

- Continue with `/admin/banners` because BE has CRUD endpoints and the current FE page still uses mock data.

### Done - Banners

Route:

- `/admin/banners`

Files changed:

- `src/app/components/admin/AdminBannerPage.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/src/main/resources/db/migration/V18__admin_banner_qa_data.sql`

BE contract used:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/src/main/java/com/b2b/ecommerce/admin/AdminReportsSettingsController.java`

Implemented behavior:

- Banner list reads real data from `GET /api/v1/admin/banners`.
- Create banner uses `POST /api/v1/admin/banners`.
- Update banner and active toggle use `PATCH /api/v1/admin/banners/{id}`.
- Delete banner uses `DELETE /api/v1/admin/banners/{id}`.
- FE form only exposes BE-supported fields: `title`, `imageUrl`, `linkUrl`, `position`, `isActive`, `sortOrder`.
- Removed old local/mock banner operating data from the admin banner screen.

Data requirement:

- Running localhost currently returns 1 banner because BE has not applied the new migration yet.
- Added Flyway seed `V18__admin_banner_qa_data.sql` with 10 QA banner rows.

Verification:

- `GET /api/v1/admin/banners`: passed locally, latest rows = 1 before V16 migration is applied.
- `/admin/banners`: passed locally with HTTP 200.
- `npm.cmd run build`: passed after rerun.

BE gap noted:

- Restart/apply Flyway migration so local BE loads `V18__admin_banner_qa_data.sql` and reaches the required 10 banner records.

### Done - Activity Logs

Route:

- `/admin/activity-logs`

Files changed:

- `src/app/components/admin/AdminActivityLog.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/src/main/resources/db/migration/V19__admin_remaining_qa_data.sql`

BE contract used:

- `be/src/main/java/com/b2b/ecommerce/admin/AdminReportsSettingsController.java`

Implemented behavior:

- Activity log list reads real data from `GET /api/v1/admin/activity-logs`.
- Stats read from `GET /api/v1/admin/activity-logs/stats`.
- FE maps BE `ActivityLogDto { id, actorId, actorName, action, entityType, entityId, note, createdAt }` to UI shape.
- Timeline, chart, and stats are derived client-side from real BE data.
- Removed `activityApi` mock import.

Data requirement:

- Minimum 10 activity log rows: satisfied with 15 rows from `V19__admin_remaining_qa_data.sql`.

Verification:

- `npm.cmd run build`: passed.

### Done - Settings

Route:

- `/admin/settings`

Files changed:

- `src/app/components/admin/SystemSettings.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/src/main/resources/db/migration/V19__admin_remaining_qa_data.sql`

BE contract used:

- `GET /api/v1/admin/settings` → `[{ key, value (JsonNode), updatedAt }]`
- `PATCH /api/v1/admin/settings` → `{ settings: { key: JsonNode } }`

Implemented behavior:

- Settings form loads from `GET /api/v1/admin/settings`.
- BE returns key-value array; FE normalizes to flat `SystemConfig` object.
- Save sends `PATCH /api/v1/admin/settings` with all keys as JSON values.
- Fallback to `DEFAULT_CONFIG` if BE call fails.
- Removed `configApi` mock import.

Data requirement:

- 10 setting keys seeded via `V19__admin_remaining_qa_data.sql`.

Verification:

- `npm.cmd run build`: passed.

### Done - Email Templates

Route:

- `/admin/email-templates`

Files changed:

- `src/app/components/admin/AdminEmailTemplatePage.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/src/main/resources/db/migration/V19__admin_remaining_qa_data.sql`

BE contract used:

- `GET /api/v1/admin/email-templates`
- `POST /api/v1/admin/email-templates`
- `PATCH /api/v1/admin/email-templates/{id}`
- `DELETE /api/v1/admin/email-templates/{id}`
- `POST /api/v1/admin/email-templates/{id}/preview`

Implemented behavior:

- Template list reads real data from `GET /api/v1/admin/email-templates`.
- Create uses `POST /api/v1/admin/email-templates`.
- Update uses `PATCH /api/v1/admin/email-templates/{id}`.
- Delete uses `DELETE /api/v1/admin/email-templates/{id}`.
- Preview calls `POST /api/v1/admin/email-templates/{id}/preview` with empty variables.
- Category is derived client-side from `templateKey` prefix.
- Removed `mockTemplates` data.

Data requirement:

- Minimum 10 email templates: satisfied with 11 rows from `V19__admin_remaining_qa_data.sql`.

Verification:

- `npm.cmd run build`: passed.

### Done - Stores / Branches

Route:

- `/admin/stores`

Files changed:

- `src/app/components/admin/AdminStorePage.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/src/main/resources/db/migration/V19__admin_remaining_qa_data.sql`

BE contract used:

- `GET /api/v1/admin/branches`
- `POST /api/v1/admin/branches`
- `PATCH /api/v1/admin/branches/{id}`
- `PATCH /api/v1/admin/branches/{id}/toggle`
- `DELETE /api/v1/admin/branches/{id}`

Implemented behavior:

- Branch list reads real data from `GET /api/v1/admin/branches`.
- Create uses `POST /api/v1/admin/branches`.
- Update uses `PATCH /api/v1/admin/branches/{id}`.
- Toggle active/inactive uses `PATCH /api/v1/admin/branches/{id}/toggle`.
- Delete uses `DELETE /api/v1/admin/branches/{id}`.
- Fields aligned to BE: `name`, `phone`, `address`, `isActive`.
- Removed `storeApi` mock import and FE-only fields (`district`, `city`, `workingHours`, `mapUrl`).

Data requirement:

- Minimum 10 branches: satisfied with 11 rows from `V19__admin_remaining_qa_data.sql`.

Verification:

- `npm.cmd run build`: passed.

### Done - Staff

Route:

- `/admin/staff`

Files changed:

- `src/app/components/admin/AdminStaffPage.tsx`
- `src/app/services/adminBackendApi.ts`
- `be/src/main/resources/db/migration/V19__admin_remaining_qa_data.sql`

BE contract used:

- `GET /api/v1/admin/staff`
- `GET /api/v1/admin/staff/{id}`
- `POST /api/v1/admin/staff`
- `PATCH /api/v1/admin/staff/{id}`
- `PATCH /api/v1/admin/staff/{id}/deactivate`

Implemented behavior:

- Staff list reads real data from `GET /api/v1/admin/staff`.
- Create uses `POST /api/v1/admin/staff`.
- Update uses `PATCH /api/v1/admin/staff/{id}`.
- Deactivate uses `PATCH /api/v1/admin/staff/{id}/deactivate`.
- Re-activate (inactive → active) uses `PATCH /api/v1/admin/staff/{id}` with `isActive: true`.
- Role displayed with Vietnamese labels, stored as BE enum (`STORE_MANAGER`, `SALES_ADVISOR`, etc.).
- Removed `mockStaff` data and FE-only fields (`branchId`, `branchName`, `phone`, `joinedAt`).

Data requirement:

- Minimum 10 staff: satisfied with 12 rows from `V19__admin_remaining_qa_data.sql`.

Verification:

- `npm.cmd run build`: passed after sidebar update and passed again after command palette update.

## Done - Admin B2C Terminology Cleanup

Routes / surfaces:

- `/admin/orders`
- `/admin/payments`
- `/admin/analytics`
- `/admin/users`
- `/admin/suppliers`
- Admin sidebar
- `/admin/activity-logs`

Files changed:

- `src/app/components/admin/OrderOverview.tsx`
- `src/app/components/admin/AdminPaymentPage.tsx`
- `src/app/components/admin/AdminAnalyticsPage.tsx`
- `src/app/components/admin/UserManagement.tsx`
- `src/app/components/admin/AdminLayout.tsx`
- `src/app/components/admin/AdminInternalSupplierPage.tsx`
- `src/app/components/admin/AdminActivityLog.tsx`

Implemented behavior:

- Admin order/payment tables, CSV headers, search placeholders, and detail labels now show `Cửa hàng` instead of customer-facing `NCC/Nhà cung cấp`.
- Payment breadcrumb/detail title now uses `Thanh toán` instead of `Công nợ`.
- Analytics labels now show `Top khách hàng` and `Top cửa hàng`.
- User management visible role labels map legacy `Nhà cung cấp` to `Đối tác`, while preserving the current BE enum/string value internally.
- Internal supplier admin page is now presented as `Nguồn hàng` to fit the retail admin workflow, while preserving existing component/API naming.

Data requirement:

- No new BE seed data required for this terminology cleanup.

Verification:

- `npm.cmd run build`: passed.

Next action:

- Continue auditing remaining admin pages for B2B procurement-only modules (`RFQ`, contracts, supplier-style warehouse/report copy). Keep only what BA/BE docs explicitly require; otherwise document as out-of-scope or BE rename work.

## Done - Shared Procurement Copy Cleanup

Routes / surfaces:

- Shared notification provider/dropdown/center
- Shared command palette
- Shared document center
- Shared report builder
- `/admin/activity-logs`
- `/admin/email-templates`

Files changed:

- `src/app/context/NotificationContext.tsx`
- `src/app/components/shared/CommandPalette.tsx`
- `src/app/components/shared/NotificationCenterPage.tsx`
- `src/app/components/shared/NotificationDropdown.tsx`
- `src/app/components/shared/DocumentCenterPage.tsx`
- `src/app/components/shared/ReportBuilderPage.tsx`
- `src/app/components/admin/AdminActivityLog.tsx`
- `src/app/components/admin/AdminEmailTemplatePage.tsx`

Implemented behavior:

- Buyer command palette no longer exposes procurement-only entries: RFQ, contracts, bulk order, and purchase requisition.
- Seller command palette visible labels now use `Báo giá`, `Thỏa thuận`, and `Thanh toán`.
- Notification sample copy no longer references suppliers/business accounts.
- Notification type labels map contract-style notifications to `Thỏa thuận`.
- Document center displays contract category as `Tài liệu mua hàng` while preserving the current `DocCategory` value.
- Report builder shows `Thanh toán` and `Báo giá` for legacy data source keys.
- Activity-log filters display `Báo giá` / `Thỏa thuận` while preserving BE filter values.
- Email template category label displays `Báo giá` instead of raw `RFQ`.

Data requirement:

- No new BE seed data required for this display cleanup.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- Remaining raw strings such as `RFQ`, `Hợp đồng`, `Công nợ`, `NCC`, and `Nhà cung cấp` are still used as enum keys, route/entity identifiers, DTO fields, or mock-data values. FE maps visible labels where possible. A full rename requires BE/API/type migration, not just FE copy edits.

Next action:

- Review buyer route availability and navigation so hidden B2B/procurement pages cannot be reached accidentally from menus/search if they are no longer in BA scope.

Follow-up completed:

- Buyer route audit confirmed the current B2C route tree does not register `/rfq`, `/contracts`, `/bulk-order`, or `/pr-list`.
- Product detail no longer links to `/suppliers/:id`; store card action now opens `/stores`.
- `npm.cmd run build`: passed after route/link cleanup.

Next action:

- Clean fallback/mock content that can still surface B2B demo wording when BE data is unavailable, starting with notification/banner/document/email-template mock records.

## Done - Runtime Mock B2C Fallback Cleanup

Surfaces:

- Shared document center fallback data
- Admin certificate/activity/invoice fallback data
- Admin email template, banner, and SEO fallback config

Files changed:

- `src/app/services/documentApi.ts`
- `src/app/data/mockAdminData.ts`

Implemented behavior:

- Document center now uses retail purchase, invoice, warranty, quote, shipment, and usage-guide examples instead of steel/construction/B2B marketplace examples.
- Admin email templates no longer expose `NCC`, raw `RFQ`, `Công nợ`, or `B2B Marketplace` wording in visible template names, subjects, and bodies.
- Admin banner fallback copy no longer advertises industrial ordering or `/rfq`; the sample feature banner now points to IMEI checking.
- SEO fallback config now describes CELLPHONES retail electronics instead of a B2B marketplace.
- Admin certificate, activity-log, invoice, and tax fallback samples were shifted to phone/accessory brands and products.
- Legacy field names and flags such as `supplierName` and `emailOnNewRFQ` remain because they are part of the current FE type/API contract.

Data requirement:

- Existing fallback datasets still provide at least 10 records where the screen needs list data: 15 documents, 10 certificates, 28 activity logs, and 10 invoices.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required for this cleanup. If BE later renames RFQ/supplier-style fields, FE should migrate DTO/type names then; for now this is visible-copy and fallback-data alignment only.

Next action:

- Audit service-layer mock APIs (`api.ts`, `reportBuilderApi.ts`, `mockData.ts`) for remaining B2B labels that can still surface in deprecated buyer/seller pages, then decide whether those modules should be disabled or formally migrated.

## Done - Shared Runtime Surface B2C Cleanup

Surfaces:

- Auth/login layout
- Shared command palette and search suggestions
- Shared report builder mock service
- Analytics mock service
- Admin payment visible copy

Files changed:

- `src/app/components/auth/AuthLayout.tsx`
- `src/app/components/shared/CommandPalette.tsx`
- `src/app/components/shared/SearchSuggestions.tsx`
- `src/app/components/admin/AdminPaymentPage.tsx`
- `src/app/components/admin/AdminAnalyticsPage.tsx`
- `src/app/components/admin/AdminInternalSupplierPage.tsx`
- `src/app/components/shared/AvatarGroup.tsx`
- `src/app/components/shared/ChatPage.tsx`
- `src/app/services/reportBuilderApi.ts`
- `src/app/services/analyticsApi.ts`

Implemented behavior:

- Login/auth branding now shows CELLPHONES instead of VietB2B/B2B.
- Command palette and search suggestions now use phone/accessory product examples instead of Arduino, steel, rice, textile, cement examples.
- Admin payment page visible headings, error text, CSV filename, and detail comment now use `Thanh toán` wording instead of `Công nợ`.
- Report builder fallback labels and rows now show stores, retail products, and retail customer names.
- Analytics fallback data now uses retail categories, store/brand names, phone/accessory products, and retail discount methods.
- Comments on shared/admin components were cleaned where old B2B wording created confusion.

Data requirement:

- Report builder and analytics fallback datasets still contain enough sample rows for charts/tables; no BE seed data required.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- Technical keys in `ReportDataSource` remain `NCC`, `RFQ`, and `Công nợ` because FE types and existing report definitions still depend on those values. Visible labels are mapped to `Cửa hàng`, `Báo giá`, and `Thanh toán`.

Next action:

- Continue the remaining audit in `src/app/services/api.ts` and `src/app/data/mockData.ts`; classify legacy seller/procurement APIs as either hidden stubs to keep for imports or formal modules that need BE-backed B2C migration.

## Done - Legacy API Stub Classification Cleanup

Surfaces:

- Shared legacy API stubs used by buyer/seller imports
- Core mock data used by auth/admin/user fallback

Files changed:

- `src/app/services/api.ts`
- `src/app/data/mockData.ts`

Implemented behavior:

- Legacy chat/store/seller API comments now describe store/seller compatibility instead of B2B.
- Supplier scorecard fallback now returns visible `Cửa hàng` instead of `Nhà cung cấp`.
- Legacy quote request stub now returns `BG-*` in the existing `rfqNumber` field, preserving the current contract while avoiding raw `RFQ-*` display.
- Mock seller-like user email/name now uses `nguonhang@cellphones.vn` and `CELLPHONES Partner`; the `Nhà cung cấp` role value remains because auth/admin role filters still depend on that legacy value and map it visibly to `Đối tác`.
- Mock-data comments for wishlist folders and legacy shipments/payments/templates no longer describe these as B2B features.

Data requirement:

- No new rows required; this is compatibility-stub cleanup. Existing product/order/mock datasets remain populated.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required. Remaining legacy names in code such as `supplierId`, `supplierName`, `rfqNumber`, `pendingRFQs`, `activeContracts`, and role value `Nhà cung cấp` are compatibility fields used by FE types/routes/imports. A rename should be handled as a coordinated BE/FE DTO migration.

Next action:

- Audit actual registered routes for deprecated seller/procurement pages and decide whether to keep them hidden as compatibility pages or remove/redirect them from the route tree.

## Done - Route Tree Procurement Audit

Surfaces:

- Registered FE route tree
- Admin activity-log entity links

Files changed:

- `src/app/routes.tsx` (audited, no code change needed)
- `src/app/components/admin/AdminActivityLog.tsx`

Findings:

- Current route tree does not register `/seller/*`, `/rfq`, `/contracts`, `/bulk-order`, `/pr-list`, or old buyer procurement pages.
- Public/customer routes are already B2C/storefront focused: products, stores, cart, orders, payments, invoices, returns, shipments, warranty, loyalty, trade-in, IMEI, phone finder, blog.
- Admin routes are registered only for the current admin scope; no admin `/rfq` or `/contracts` route exists.

Implemented behavior:

- Activity-log deep links no longer point to dead routes:
  - `Người dùng` now links to `/admin/customers`.
  - `RFQ` now links to `/admin/report-builder` as a compatibility landing for quote/report records.
  - `Hợp đồng` and `Chứng chỉ` now link to `/admin/documents`.

Data requirement:

- No data change required.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required. If BE continues to emit activity-log `entityType` values like `RFQ` or `Hợp đồng`, FE now routes them to existing admin pages instead of dead URLs.

Next action:

- Run a final UI-route consistency pass on admin navigation/sidebar and command palette to ensure every visible admin/customer link resolves to a registered route.

## Done - UI Route Consistency Pass

Surfaces:

- Auth redirect
- Buyer footer links
- Buyer support chat route
- Search suggestions
- Command palette

Files changed:

- `src/app/components/auth/AuthLayout.tsx`
- `src/app/components/buyer/BuyerLayout.tsx`
- `src/app/components/shared/CommandPalette.tsx`
- `src/app/components/shared/SearchSuggestions.tsx`
- `src/app/routes.tsx`

Implemented behavior:

- Legacy `Nhà cung cấp` login no longer redirects to removed `/seller`; it now lands on `/dashboard`.
- Footer links no longer point to unregistered `/about`, `/contact`, or `/policy`.
- `/chat` is now registered as an authenticated customer route because product detail, order detail, and profile already navigate there.
- Command palette no longer exposes removed `/seller/*`, `/templates`, or `/quick-order` entries.
- Admin command palette now uses real admin routes instead of buyer/seller route assumptions.
- Store search/command links no longer navigate to unregistered `/stores/:id`; they open `/stores` until a store-detail route exists.

Data requirement:

- No data change required.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required. If a dedicated store-detail endpoint/page is added later, FE can re-enable `/stores/:id` links.

Next action:

- With admin/customer routes now consistent, continue with a visual smoke pass on the most important flows: login, admin dashboard, categories, products, orders, payments, invoices, shipments, and customer cart/order pages.

## Done - Route Smoke Verification

Surfaces:

- Vite dev server route fallback
- Login/auth page
- Admin core pages
- Customer core pages

Verified routes:

- `/login`
- `/admin`
- `/admin/categories`
- `/admin/products`
- `/admin/orders`
- `/admin/payments`
- `/admin/invoices`
- `/admin/shipments`
- `/admin/activity-logs`
- `/products`
- `/cart`
- `/orders`
- `/chat`
- `/stores`

Result:

- All checked routes returned HTTP 200 from Vite.
- All checked responses included the app root and Vite client script.
- `/chat` route is reachable after being registered in the previous pass.

Verification:

- `npm.cmd run build`: passed after route/link fixes.
- Vite route smoke via `http://127.0.0.1:5173`: all checked routes returned 200.

Known limitation:

- This smoke pass verifies route reachability and bundle serving, not browser console/runtime interaction after React mounts. A deeper visual pass should be done in the browser for create/edit actions on admin categories/products/orders/payments/invoices/shipments.

Next action:

- Run manual browser interaction checks for admin CRUD/action flows: categories create/edit/tree, products approve/reject, orders status actions, payments mark-overdue/refund, invoices export/detail, shipments update status/tracking.

## Backend gaps currently blocking FE admin

Tracked in `be/docs/FE_ADMIN_BACKEND_GAPS.md`.

Known gaps (no current blockers):

- Revenue report has only 1 date point because local paid order seed data is concentrated on one date. Add multi-day seed data if QA needs a meaningful revenue chart over a date range.

## Remaining admin work

All modules with implemented BE contracts are now wired to real data:

- ✅ Categories
- ✅ Products
- ✅ Inventory / stock
- ✅ Dashboard
- ✅ Promotions
- ✅ Orders
- ✅ Payments
- ✅ Invoices
- ✅ Shipments
- ✅ Returns
- ✅ Warranty
- ✅ Reviews
- ✅ Trade-in
- ✅ Reports
- ✅ Banners
- ✅ Activity logs (filter params aligned to BE)
- ✅ Settings (snake_case key format aligned to BA-docs)
- ✅ Email templates
- ✅ Stores / branches (district, city, lat, lng, workingHours added)
- ✅ Staff (phone, branchId dropdown, branchName, joinedAt added)

Out of current BE admin contract (still mock-only, not expanded unless BA confirms scope):

- `/admin/users`, `/admin/analytics`, `/admin/blogs`, `/admin/combos`, `/admin/installments`, `/admin/loyalty`, `/admin/internal-suppliers`, `/admin/warehouses`.

## BA Alignment Session — 2026-05-17

Completed gap fixes from BA-docs rà soát (High/Medium gaps only):

### Changes made

**BE — Migration V20** (`V20__schema_fix_ba_alignment.sql`):
- `branches`: thêm cột `district`, `city`, `working_hours`, `lat`, `lng`.
- `staff_members`: thêm cột `phone`, `branch_id` (FK branches), `joined_at`.
- `admin_settings`: migrate keys sang **snake_case** (`site_name`, `tax_rate`, `maintenance_mode`, ...).
- `admin_activity_logs`: tạo indexes `action`, `entity_type`, `actor_id`, `created_at`.
- Backfill dữ liệu existing.

**BE — Controller (`AdminReportsSettingsController.java`)**:
- `BranchDto` / `BranchRequest`: thêm `district`, `city`, `workingHours`, `lat`, `lng`.
- `StaffDto` / `StaffRequest`: thêm `phone`, `branchId`, `branchName`, `joinedAt`.
- `StaffDto` query: JOIN với `branches` để lấy `branch_name`.
- `ActivityLogStatsDto`: trả `{ todayCount, weekCount, monthCount, byAction[] }` thay vì raw list.
- `GET /admin/activity-logs`: thêm filter params `action`, `entity`, `userId`, `search` (dynamic WHERE).
- `GET /admin/activity-logs/stats`: tính `todayCount/weekCount/monthCount` trực tiếp từ DB.

**FE — adminBackendApi.ts**:
- Thêm `BeBranch`, `BranchFormData` typed interfaces.
- Thêm `BeStaffMember`, `StaffFormData` typed interfaces.
- Thêm `ActivityLogFilter`, `ActivityLogStats` typed interfaces.
- `adminBranchApi`: typed, `create/update` nhận `BranchFormData`.
- `adminStaffApi`: typed, `create/update` nhận `StaffFormData`.
- `adminActivityLogApi.getPaginated`: nhận `filter?: ActivityLogFilter`, gửi lên BE.
- `adminActivityLogApi.stats`: trả `ActivityLogStats` object.

**FE — AdminStorePage.tsx**: rewrite với đầy đủ fields + filter thành phố.

**FE — AdminStaffPage.tsx**: rewrite với phone, joinedAt, dropdown branchId, filter chi nhánh.

**FE — SystemSettings.tsx**: fix mapping đọc snake_case keys + ghi lại snake_case khi save.

**FE — AdminActivityLog.tsx**: dùng BE filter params, dùng stats object từ BE.

### Verification
- `npm run build`: **Exit code 0** ✅

## Rule going forward

After each completed module:

- Update this file.
- Update `be/docs/FE_ADMIN_BACKEND_GAPS.md` when BE is missing endpoints.
- Ensure at least 10 demo records exist.
- Run `npm.cmd run build`.
- Add a short "Next action" note describing what should be implemented immediately after that completed feature.

## Done - Admin BE Action Smoke Pass - 2026-05-24

Scope checked against live BE on `localhost:8080`:

- Payments:
  - `PATCH /api/v1/admin/payments/{id}/mark-overdue`: passed.
  - Smoke data touched: order `CP2026052300084` moved to `OVERDUE`.
  - `POST /api/v1/admin/payments/{id}/refund`: endpoint returned success.
  - Smoke data touched: order `CP2026052300082`, refund amount `1000`, BE returned status `REFUNDED`.
- Invoices:
  - `GET /api/v1/admin/invoices/{id}`: passed with `INV-20260523-019`.
  - `GET /api/v1/admin/invoices/{id}/download`: passed by `curl.exe`, returned `200`, `Content-Type: application/pdf`, `Content-Length: 904`.
- Shipments:
  - `PATCH /api/v1/admin/shipments/{id}/status`: passed.
  - Smoke data touched: tracking `DEMO-BUYER-GHTK-0001` moved `AWAITING_PICKUP -> IN_TRANSIT`.

FE impact:

- `/admin/payments` mark-overdue and refund actions are wired to real BE endpoints and can be used from UI.
- `/admin/invoices` detail and PDF download are wired to real BE endpoints.
- `/admin/shipments` status update is wired to real BE endpoint and follows BE transition rule.

BE gap found:

- Refund endpoint accepts a refund amount lower than `paidAmount`, but still returns payment status `REFUNDED` instead of `PARTIALLY_REFUNDED`.
- FE currently allows entering a refund amount. If partial refunds are in scope, BE should return `PARTIALLY_REFUNDED` when `refundAmount < paidAmount`; otherwise FE should be changed to only allow full refunds.

Verification:

- Live BE action smoke via Spring Boot + PostgreSQL: passed for mark-overdue, refund endpoint success, invoice detail/download, shipment status update.
- No FE source code changed in this pass, so `npm.cmd run build` was not rerun.

Next action:

- Continue manual UI interaction pass in browser for admin create/edit flows that do not require destructive seed changes: category tree/edit, product status/detail, order status dialog, and reports export.

## Done - Admin Remaining Critical Smoke Pass - 2026-05-24

Scope checked against live BE on `localhost:8080`:

- Categories:
  - `GET /api/v1/categories?includeInactive=true`: passed.
  - Current tree has `2` root categories; first root `Dien thoai` has `5` children.
- Products:
  - `GET /api/v1/products/{id}`: passed.
  - Smoke product `OPPO Reno12 5G 256GB` returned detail with `1` variant and `1` image.
- Orders:
  - `PATCH /api/v1/admin/orders/{id}/status`: passed.
  - Smoke data touched: order `CP2026052300084` moved `PENDING -> CONFIRMED`.
- Reports:
  - `GET /api/v1/admin/reports/export?type=revenue`: passed, `text/csv`.
  - `GET /api/v1/admin/reports/export?type=products`: passed, `text/csv`.
  - `GET /api/v1/admin/reports/export?type=customers`: passed, `text/csv`.
  - `GET /api/v1/admin/reports/export?type=inventory`: passed, `text/csv`.
  - `GET /api/v1/admin/reports/export?type=returns`: passed, `text/csv`.

FE impact:

- `/admin/categories` tree data contract is valid for structure browsing.
- `/admin/products` detail/edit base data can load from BE.
- `/admin/orders` status dialog/inline update has a working BE transition for `PENDING -> CONFIRMED`.
- `/admin/reports` CSV export buttons have working BE binary responses.

Verification:

- Live BE smoke via Spring Boot + PostgreSQL: passed for all endpoints above.
- No FE source code changed in this pass, so `npm.cmd run build` was not rerun.

Next action:

- Finalize admin by doing a visible copy/UX consistency pass on remaining admin pages and keep only the refund partial/full decision as an open BE contract item.

## Done - Payment Partial Refund Contract Alignment - 2026-05-24

Scope:

- BE refund contract was updated to support cumulative partial refunds.
- FE `/admin/payments` was aligned with the updated contract.

Files changed:

- `src/app/components/admin/AdminPaymentPage.tsx`

Implemented behavior:

- Refund action is now available for both `PAID` and `PARTIALLY_REFUNDED` payments.
- FE calculates refundable amount as `paidAmount - refundAmount`.
- Refund dialog defaults to the remaining refundable amount instead of the full paid amount.
- FE validation blocks refund amounts higher than the remaining refundable amount.
- Payment detail now shows refunded amount and remaining refundable amount.

Verification:

- `npm.cmd run build`: passed.
- Live BE smoke passed:
  - payment/order `CP2026052400016`
  - refund amount `1000`
  - BE returned `PARTIALLY_REFUNDED`
  - cumulative `refundAmount = 1000`
  - remaining refundable amount `33989000`

Backend note:

- Refund semantics are now resolved as partial-refund capable.

Next action:

- Continue the final admin visible copy/UX consistency pass, starting with `/admin/payments` labels and then categories/products/orders.

## Done - Admin Payments Copy/Status Polish - 2026-05-24

Scope:

- `/admin/payments`
- Shared `StatusBadge`

Files changed:

- `src/app/components/admin/AdminPaymentPage.tsx`
- `src/app/components/shared/StatusBadge.tsx`

Implemented behavior:

- Payment status filters now show Vietnamese labels instead of raw BE enum text.
- Payment method filters now show readable labels for cash, bank transfer, MOMO, VNPAY, and COD.
- Payment row action tooltips were changed to Vietnamese.
- Mark-overdue confirmation/toast messages were changed to Vietnamese.
- Refund dialog and refund summary labels were changed to Vietnamese.
- Shared `StatusBadge` now displays user-friendly labels for core BE enums:
  - order statuses: `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `RETURNED`
  - payment statuses: `UNPAID`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `OVERDUE`
  - shipment statuses: `AWAITING_PICKUP`, `IN_TRANSIT`

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required. FE keeps sending/reading BE enum values and only changes display labels.

Next action:

- Continue visible copy/UX pass on `/admin/categories`, `/admin/products`, and `/admin/orders`, then run route smoke again.

## Done - Admin Categories/Products/Orders Copy Polish - 2026-05-24

Scope:

- `/admin/categories`
- `/admin/products`
- `/admin/orders`
- `adminBackendApi` product display mapping

Files changed:

- `src/app/components/admin/CategoryManagement.tsx`
- `src/app/components/admin/ProductApproval.tsx`
- `src/app/components/admin/OrderOverview.tsx`
- `src/app/services/adminBackendApi.ts`

Implemented behavior:

- Category tree accessibility/search placeholders now use Vietnamese labels.
- Product page labels, filters, stats, dialogs, validation errors, confirmations, and toasts now use Vietnamese copy.
- Product status/condition values are displayed with Vietnamese accents while still mapping back to BE enum values.
- Product status mapping in `adminBackendApi.ts` now supports both accented and legacy unaccented FE values.
- Order filters now show Vietnamese status labels instead of raw BE enum values.
- Order timeline now displays human-readable labels instead of `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required. FE still sends BE enum-compatible values through existing mapping.

Next action:

- Run a final admin route smoke after the visible copy pass, then continue polish on invoices/shipments/reports if any visible raw labels remain.

## Done - Admin Invoices/Shipments/Reports Copy Polish - 2026-05-24

Scope:

- `/admin/invoices`
- `/admin/shipments`
- `/admin/reports`

Files changed:

- `src/app/components/admin/AdminInvoicePage.tsx`
- `src/app/components/admin/AdminShipmentPage.tsx`
- `src/app/components/admin/AdminReportPage.tsx`

Implemented behavior:

- Invoice table, stats, filters, detail dialog, CSV export headers, PDF download action, and toast messages now use Vietnamese copy.
- Invoice status filter keeps BE values but shows Vietnamese labels.

## Done - Admin Invoice Promotion Discount - 2026-05-28

- Admin invoice mapper reads BE `discountAmount`.
- Admin invoice table, list item, detail dialog, summary stats, and CSV export include promotion discount amount.
- Invoice subtotal is calculated as `totalAmount + discountAmount - taxAmount` to match BE invoice total after promotion.

## Done - Admin Revenue Page - 2026-05-28

- Added `/admin/revenue` as a dedicated revenue screen.
- The screen uses real BE `GET /api/v1/admin/reports/revenue?from=&to=` through `adminReportApi.revenue`.
- Added revenue KPIs, date filter, revenue/order chart, daily breakdown table, and CSV export through `GET /api/v1/admin/reports/export?type=revenue`.
- Added the page to the Admin finance sidebar.
- Shipment table, stats, filters, detail dialog, CSV export headers, status update action, and toast messages now use Vietnamese copy.
- Shipment status filter and status-update dropdown keep BE values but show Vietnamese labels.
- Report page breadcrumbs, headings, refresh/export controls, cards, charts, table headers, return status legend, loading state, and error messages now use Vietnamese copy.
- Report export values still use BE-supported types: `revenue`, `returns`, `inventory`.

Verification:

- `npm.cmd run build`: passed.

Backend note:

- No BE change required. This pass only changed FE display labels while preserving BE enum/type values.

Next action:

- Run final admin route smoke for the polished admin pages, then review remaining mock-only admin pages for whether they should stay visible in the đồ án scope.

## Done - Admin Sidebar Scope Hardening - 2026-05-24

Scope:

- Admin sidebar navigation

Files changed:

- `src/app/components/admin/AdminLayout.tsx`
- `src/app/components/shared/CommandPalette.tsx`

Implemented behavior:

- Sidebar now prioritizes admin pages that are BE-backed or already aligned to the current operating flow.
- Hidden mock-only / not-yet-wired links from primary sidebar: `/admin/analytics`, `/admin/report-builder`, `/admin/warehouses`, `/admin/combos`, `/admin/installments`, `/admin/loyalty`, `/admin/blog`, `/admin/suppliers`.
- Routes are not deleted, so FE can continue wiring them later if BA/BE confirms they belong in the final admin scope.
- Visible English labels changed: `Dashboard` -> `Tổng quan`, `Email Templates` -> `Mẫu email`.

Backend note:

- No BE blocker for this pass. This is FE navigation hardening only.
- If BA later requires the hidden pages as production admin modules, FE should wire them to the BE contracts first instead of exposing mock/local data in the primary menu.

Verification:

- `npm.cmd run build`: passed.
- Visible admin sidebar route smoke: passed for `/admin`, reports, products, categories, inventory, orders, returns, shipments, promotions, trade-in, banners, customers, reviews, warranty, email templates, documents, stores, staff, payments, invoices, activity logs, and settings.

Next action:

- Continue with FE wiring for `/admin/customers` if the next priority is eliminating the remaining legacy `services/api.ts` dependency from visible admin navigation.

## Done - Admin Customers BE Wiring - 2026-05-24

Scope:

- `/admin/customers`
- Admin user/customer service adapter

Files changed:

- `src/app/components/admin/UserManagement.tsx`
- `src/app/services/adminBackendApi.ts`
- `../be/src/main/resources/db/migration/V31__admin_users_demo_data.sql`

Implemented behavior:

- `/admin/customers` now reads users from `GET /api/v1/admin/users`.
- User detail reads from `GET /api/v1/admin/users/{id}` through the BE-backed adapter.
- Inline edit uses `PATCH /api/v1/admin/users/{id}` and maps FE labels to BE enum values.
- Lock/unlock uses `PATCH /api/v1/admin/users/{id}/status`.
- Delete uses `DELETE /api/v1/admin/users/{id}`.
- Removed visible fake actions from the operating screen: create user, CSV import, reset password, and send email.
- Added `V31__admin_users_demo_data.sql` so fresh BE databases have at least 10 admin-user/customer demo rows.

Verification:

- `npm.cmd run build`: passed.
- `/admin/customers` Vite route smoke: HTTP 200.
- Live BE smoke: `GET /api/v1/admin/users?page=1&pageSize=10` and `GET /api/v1/admin/users/{id}` passed against the currently running BE.
- `mvn test`: passed, 26 tests, 0 failures, 0 errors. Flyway applied `V31`.
- Live BE data after V31: `GET /api/v1/admin/users?page=1&pageSize=20` returned 13 total rows (`ADMIN:2`, `STAFF:3`, `CUSTOMER:8`).

Backend note:

- Current BE contract does not include `POST /api/v1/admin/users`, reset-password, or send-email endpoints. FE intentionally does not expose those actions now.
- Local DB has applied `V31` and now satisfies the minimum 10-row demo data requirement for this screen.

Next action:

- Continue with visible admin pages that still use compatibility services, starting with `/admin/documents` or any remaining sidebar route that imports legacy mock APIs.

## Done - Admin Documents Scope Review - 2026-05-24

Scope:

- `/admin/documents`
- Admin sidebar navigation

Files changed:

- `src/app/components/admin/AdminLayout.tsx`

Decision:

- `/admin/documents` currently uses `src/app/services/documentApi.ts`, which is local/mock-only.
- Upload, archive, delete, version history, stats, and download do not call a BE contract.
- Removed `Tài liệu` from the primary admin sidebar so the operating admin menu does not expose mock/local behavior.
- Route remains registered for compatibility with old links and activity-log mappings.
- Removed hidden/mock admin routes from the admin command palette too: `/admin/analytics`, `/admin/report-builder`, `/admin/suppliers`, `/admin/documents`.
- Command palette label now matches sidebar: `Dashboard` -> `Tổng quan`.

Backend requirement if this module is needed:

- Add BE-backed admin document endpoints, at minimum:
  - `GET /api/v1/admin/documents?page=&pageSize=&category=&status=&fileType=&search=`
  - `GET /api/v1/admin/documents/{id}`
  - `POST /api/v1/admin/documents`
  - `PATCH /api/v1/admin/documents/{id}`
  - `DELETE /api/v1/admin/documents/{id}`
  - `GET /api/v1/admin/documents/{id}/download`
  - Optional: `GET /api/v1/admin/documents/{id}/versions`, `GET /api/v1/admin/documents/stats`.

Verification:

- `npm.cmd run build`: passed.
- `rg` check confirmed command palette/sidebar no longer expose `/admin/analytics`, `/admin/report-builder`, `/admin/suppliers`, or `/admin/documents`.

Next action:

- Continue auditing remaining visible admin sidebar routes for mock/local service usage. Current priority candidates: buyer-facing shared contexts and notification/search surfaces that may still expose hidden mock admin routes.

## Done - Shared Notification/Search Mock Exposure Cleanup - 2026-05-24

Scope:

- Shared notification provider/dropdown/center
- Shared search suggestions
- Notification type mapping

Files changed:

- `src/app/context/NotificationContext.tsx`
- `src/app/components/shared/NotificationDropdown.tsx`
- `src/app/components/shared/NotificationCenterPage.tsx`
- `src/app/components/shared/SearchSuggestions.tsx`
- `src/app/services/api.ts`
- `src/app/types/index.ts`

Implemented behavior:

- Notification provider no longer generates random mock notifications or writes to the mock notification store during polling.
- Notification polling now only refreshes from the existing BE-backed `notificationApi` adapter.
- Removed legacy/procurement notification filter/type exposure from dropdown and notification center: RFQ, contract, approval, credit, message.
- Added explicit FE notification types for current B2C/BE mapping: `payment`, `shipment`, `return`, `loyalty`.
- Backend notification `PAYMENT` now maps to FE `payment`; `LOYALTY` maps to FE `loyalty`.
- Search suggestions no longer call legacy `supplierApi`; suggestions now use product/category data only.

Verification:

- `npm.cmd run build`: passed.
- `rg` check confirmed no `notificationApi.add`, random notification simulation, RFQ/contract/credit/approval notification filters, or `supplierApi` usage remains in these shared surfaces.
- Live BE smoke: `GET /api/v1/notifications?page=1&pageSize=5` returned 5 rows and `GET /api/v1/notifications/unread-count` returned unread count `12`.
- Visible admin component audit found no direct `services/api.ts` imports or obvious mock-only calls in currently exposed admin sidebar routes.
- Final visible admin route smoke passed HTTP 200 for all exposed admin routes.

Backend note:

- No BE blocker. Existing `/api/v1/notifications` contract is sufficient for current shared notification UI.

Next action:

- Continue with buyer-facing pages, because the current exposed admin sidebar routes are now BE-backed at the navigation/component level.

## Done - Admin Mock Route Lockdown - 2026-05-28

Scope:

- Admin route registration
- Admin customer detail activity logs
- Admin activity-log entity links

Files changed:

- `src/app/routes.tsx`
- `src/app/components/admin/UserManagement.tsx`
- `src/app/components/admin/AdminActivityLog.tsx`

Implemented behavior:

- Removed mock-only `/admin/documents` and `/admin/report-builder` from runtime route registration.
- User detail activity log tab now calls BE-backed `adminActivityLogApi.getPaginated` instead of local `activityApi` from `adminApi.ts`.
- Activity log entity path mapping no longer links to removed mock-only document/report-builder routes.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.
- BE `mvn package -DskipTests`: passed.
- BE `mvn test`: blocked by local PostgreSQL connection refused on `localhost:5432`; rerun after DB is running.

Next action:

- If document center or report builder is needed for demo, implement real BE contracts first, then re-enable the routes against those contracts.

