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

- `npm.cmd run build`: passed.

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

