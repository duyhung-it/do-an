# FE Admin Progress

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

Next action:

- Continue with `/admin/settings` or `/admin/email-templates`; both have implemented BE endpoints, but each still needs FE mock removal and data-count verification.

## Backend gaps currently blocking FE admin

Tracked in `be/docs/FE_ADMIN_BACKEND_GAPS.md`.

Known gaps:

- Admin activity logs endpoint is implemented but local seed currently has 0 rows; add at least 10 rows before wiring `/admin/activity-logs` as done.
- Admin banners are wired, but running localhost has not applied `V18__admin_banner_qa_data.sql` yet; apply migration to reach 10 banner rows.

## Remaining admin work

Priority order, based on implemented BE contracts:

1. `/admin/activity-logs`
   - BE endpoints exist: `GET /api/v1/admin/activity-logs` and `GET /api/v1/admin/activity-logs/stats`.
   - Blocker: local BE currently returns `pagination.total = 0`.
   - Next action: BE should seed at least 10 `admin_activity_logs` rows, then FE can replace mock `activityApi` with real BE data.

2. `/admin/settings`
   - BE endpoints exist: `GET /api/v1/admin/settings` and `PATCH /api/v1/admin/settings`.
   - Current FE still uses local/mock `configApi`.
   - Next action: map settings JSON by key, expose editable form only for keys returned by BE, and document any missing setting keys required by BA.

3. `/admin/email-templates`
   - BE endpoints exist: `GET/POST/PATCH/DELETE /api/v1/admin/email-templates` and `POST /api/v1/admin/email-templates/{id}/preview`.
   - Current FE still uses mock template data.
   - Next action: wire template list/create/update/delete/preview to BE, verify at least 10 templates or request BE seed if below 10.

4. `/admin/stores`
   - BE branch endpoints exist: `GET/POST/PATCH/DELETE /api/v1/admin/branches`.
   - Current FE store page still uses mock store data.
   - Next action: align FE store screen to BE branch fields: `name`, `phone`, `address`, `isActive`; note missing lat/lng/opening hours if BA still requires map/store-locator detail.

5. `/admin/staff`
   - BE endpoints exist: `GET/POST/PATCH /api/v1/admin/staff` and `PATCH /api/v1/admin/staff/{id}/deactivate`.
   - Current FE staff page still uses mock staff data and branch-specific fields not returned by BE.
   - Next action: wire staff CRUD/deactivate to BE fields: `fullName`, `email`, `role`, `isActive`; note missing branch assignment/permissions if required.

Out of current BE admin contract:

- `/admin/users`, `/admin/analytics`, `/admin/blogs`, `/admin/combos`, `/admin/installments`, `/admin/loyalty`, `/admin/internal-suppliers`, `/admin/warehouses`.
- These pages should not be expanded with fake operating behavior unless BE adds contracts or BA confirms they are out of scope for the normal sales website admin.

## Rule going forward

After each completed module:

- Update this file.
- Update `be/docs/FE_ADMIN_BACKEND_GAPS.md` when BE is missing endpoints.
- Ensure at least 10 demo records exist.
- Run `npm.cmd run build`.
- Add a short "Next action" note describing what should be implemented immediately after that completed feature.
