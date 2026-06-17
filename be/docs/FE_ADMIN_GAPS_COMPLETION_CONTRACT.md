# FE Admin Gaps Completion Contract

Source: `B2B eCommerce Platform Plan/ba-docs`, especially `09-api-admin.md`, `07-api-after-sales.md`, `10-business-rules.md`.

Status: DONE on 2026-05-17. All endpoints below use the standard `ApiResponse` shape unless explicitly noted as binary.

## Admin Users

- `GET /api/v1/admin/users?page=&pageSize=&role=&status=&search=`
- `GET /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/status`
- `DELETE /api/v1/admin/users/{id}`

User statuses: `ACTIVE`, `INACTIVE`, `LOCKED`.

Update request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "admin@example.com",
  "phone": "0900000000",
  "role": "STAFF",
  "status": "ACTIVE",
  "avatarUrl": "https://cdn.cellphones.vn/admin/avatar.jpg"
}
```

## Admin Notifications

- `POST /api/v1/admin/notifications/broadcast`
- `POST /api/v1/admin/notifications/send-to-user`

Request fields: `type`, `title`, `message`, optional `priority`, `category`, `actionUrl`, `actionLabel`.

Types: `ORDER`, `PAYMENT`, `PROMOTION`, `LOYALTY`, `SYSTEM`, `REVIEW`.
Priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

## Suppliers And Installments

Suppliers:

- `GET /api/v1/admin/suppliers?page=&pageSize=&search=&isActive=`
- `POST /api/v1/admin/suppliers`
- `PATCH /api/v1/admin/suppliers/{id}`

Installment plans:

- `GET /api/v1/admin/installment-plans`
- `POST /api/v1/admin/installment-plans`
- `PATCH /api/v1/admin/installment-plans/{id}`
- `DELETE /api/v1/admin/installment-plans/{id}`

## Admin Catalog Extras

- `PATCH /api/v1/admin/products/{productId}/images/reorder`
- `POST /api/v1/admin/combos`
- `PATCH /api/v1/admin/combos/{id}`
- `DELETE /api/v1/admin/combos/{id}`
- `POST /api/v1/admin/blog`
- `PATCH /api/v1/admin/blog/{id}`
- `DELETE /api/v1/admin/blog/{id}`

Image reorder request:

```json
{
  "imageIds": ["uuid-1", "uuid-2"]
}
```

Combo request:

```json
{
  "name": "Combo iPhone + AirPods",
  "description": "Bundle khuyen mai",
  "productIds": ["uuid-1", "uuid-2"],
  "price": 39990000,
  "status": "ACTIVE"
}
```

Blog request:

```json
{
  "title": "Huong dan mua iPhone",
  "slug": "huong-dan-mua-iphone",
  "content": "Noi dung bai viet",
  "excerpt": "Tom tat",
  "status": "DRAFT",
  "coverImage": "https://cdn.cellphones.vn/blog/iphone.jpg"
}
```

## Inventory

- `GET /api/v1/admin/inventory?page=&pageSize=&status=&brand=&search=`
- `GET /api/v1/admin/inventory/{id}`
- `PATCH /api/v1/admin/inventory/{id}/adjust`
- `GET /api/v1/admin/inventory/low-stock`
- `GET /api/v1/admin/inventory/{productId}/movements`

`status`: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`.

Adjust request:

```json
{
  "stock": 18,
  "minStock": 5,
  "reason": "Manual warehouse recount"
}
```

Main row fields: `id`, `productId`, `productName`, `brand`, `categoryName`, `sku`, `variantName`, `price`, `stock`, `minStock`, `status`, `lowStock`, `imeiSerials`, `updatedAt`.

## Admin Promotions

- `GET /api/v1/admin/promotions?page=&pageSize=&status=&search=`
- `POST /api/v1/admin/promotions`
- `GET /api/v1/admin/promotions/{id}`
- `PATCH /api/v1/admin/promotions/{id}`
- `PATCH /api/v1/admin/promotions/{id}/toggle`
- `DELETE /api/v1/admin/promotions/{id}`

`status`: `ACTIVE`, `INACTIVE`, `SCHEDULED`, `EXPIRED`.

Create/update request accepts `code`, `name`, `description`, `type`, `value`, `minOrderValue`, `maxDiscount`, `startDate`, `endDate`, `usageLimit`, `applicableProducts`, `applicableCategories`, `applicableBrands`, `isActive`. `usedCount` is backend-owned.

## After-Sales

Returns:

- `GET /api/v1/admin/returns?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/returns/{id}`
- `PATCH /api/v1/admin/returns/{id}/status`
- `POST /api/v1/admin/returns/{id}/dispute-resolution`

Return transitions: `PENDING -> APPROVED -> PROCESSING -> REFUNDED -> CLOSED`, and `PENDING -> REJECTED`.

Return `REFUNDED` side effects:

- Updates linked original order from `DELIVERED` to `RETURNED`.
- Inserts `order_status_history` with `to_status = RETURNED`.
- Reverses earned loyalty points for the linked order, idempotently.

Warranty:

- `GET /api/v1/admin/warranty-claims?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/warranty-claims/{id}`
- `PATCH /api/v1/admin/warranty-claims/{id}/status`

Warranty transitions: `NEW -> PROCESSING -> RESOLVED`, and `NEW -> REJECTED`.

Reviews:

- `GET /api/v1/admin/reviews?page=&pageSize=&status=&rating=&search=`
- `PATCH /api/v1/admin/reviews/{id}/approve`
- `PATCH /api/v1/admin/reviews/{id}/hide`
- `PATCH /api/v1/admin/reviews/{id}/status`
- `POST /api/v1/admin/reviews/{id}/reply`
- `DELETE /api/v1/admin/reviews/{id}`

Review statuses: `PENDING`, `APPROVED`, `HIDDEN`.

Trade-in:

- `GET /api/v1/admin/trade-in?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/trade-in/{id}`
- `PATCH /api/v1/admin/trade-in/{id}/valuate`
- `PATCH /api/v1/admin/trade-in/{id}/complete`
- `PATCH /api/v1/admin/trade-in/{id}/status`

Trade-in statuses: `AWAITING_VALUATION`, `VALUED`, `ACCEPTED`, `REJECTED`, `COMPLETED`.

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

## Admin Shipments

- `GET /api/v1/admin/shipments?page=&pageSize=&status=&search=`
- `GET /api/v1/admin/shipments/{id}`
- `POST /api/v1/admin/shipments`
- `PATCH /api/v1/admin/shipments/{id}`
- `PATCH /api/v1/admin/shipments/{id}/tracking`
- `PATCH /api/v1/admin/shipments/{id}/status`

Create request accepts `orderId`, optional `trackingNumber`, optional `carrierName`, optional `status`, optional `estimatedDelivery`.

Tracking update request accepts `trackingNumber`, `carrierName`, optional `estimatedDelivery`.

## Reports, Settings, Content

Reports:

- `GET /api/v1/admin/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/v1/admin/reports/products`
- `GET /api/v1/admin/reports/customers`
- `GET /api/v1/admin/reports/inventory`
- `GET /api/v1/admin/reports/returns`
- `GET /api/v1/admin/reports/export?type=revenue`

`/reports/export` returns `text/csv` binary.

Settings/content:

- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings`
- `GET/POST/PATCH/DELETE /api/v1/admin/banners`
- `GET/POST/PATCH/DELETE /api/v1/admin/settings/banners`
- `GET/POST/PATCH/DELETE /api/v1/admin/email-templates`
- `POST /api/v1/admin/email-templates/{id}/preview`
- `GET/POST/PATCH/DELETE /api/v1/admin/settings/email-templates`
- `POST /api/v1/admin/settings/email-templates/{id}/preview`
- `GET /api/v1/admin/seo`
- `PATCH /api/v1/admin/seo/{pageKey}`
- `GET /api/v1/admin/settings/seo`
- `PATCH /api/v1/admin/settings/seo/{pageKey}`
- `GET/POST/PATCH/DELETE /api/v1/admin/branches`
- `PATCH /api/v1/admin/branches/{id}/toggle`
- `GET/POST/PATCH /api/v1/admin/staff`
- `GET /api/v1/admin/staff/{id}`
- `PATCH /api/v1/admin/staff/{id}/deactivate`
- `GET /api/v1/admin/activity-logs?page=&pageSize=`
- `GET /api/v1/admin/activity-logs/stats`

## Admin Invoice Extras

- `POST /api/v1/admin/invoices`
- `DELETE /api/v1/admin/invoices/{id}`

Manual invoice request:

```json
{
  "orderId": "uuid",
  "taxAmount": 0,
  "dueDate": "2026-05-30"
}
```

## Admin Warranty Master

- `GET /api/v1/admin/warranty?page=&pageSize=&status=&search=`
- `POST /api/v1/admin/warranty`

## Verification

- `mvn test`: passed, 18 tests.
- Flyway current version after migration: `18`.
