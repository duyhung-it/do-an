# FE Admin Backend Gaps

Source of truth:

- `B2B eCommerce Platform Plan/ba-docs/09-api-admin.md`
- `B2B eCommerce Platform Plan/ba-docs/06-api-payments-invoices.md`
- `B2B eCommerce Platform Plan/ba-docs/07-api-after-sales.md`
- `B2B eCommerce Platform Plan/ba-docs/10-business-rules.md`
- Current implemented contracts in `be/docs/FE_*_CONTRACT.md`

This document lists only the backend gaps blocking real FE admin screens. Do not add FE-only mock APIs for these items.

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

Open BE QA-data note:

- Revenue report currently has only 1 date point because local paid order seed data is concentrated on one date. Add multi-day paid order seed data if FE QA needs a meaningful line chart over a date range.
- Activity logs are implemented but local `GET /api/v1/admin/activity-logs?page=1&pageSize=100` currently returns `pagination.total = 0`. Add at least 10 `admin_activity_logs` rows before FE marks `/admin/activity-logs` complete.
- Banners are wired by FE on 2026-05-17. Running localhost currently returns 1 banner, but BE migration `V18__admin_banner_qa_data.sql` adds 10 QA banner rows; restart/apply Flyway migration before QA data verification.

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
