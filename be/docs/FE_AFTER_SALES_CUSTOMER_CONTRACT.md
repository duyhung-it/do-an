# FE Customer After-Sales Contract

Source: `B2B eCommerce Platform Plan/ba-docs/07-api-after-sales.md`

Status: DONE on 2026-05-20. All endpoints use standard `ApiResponse`. During security-deferred phase, customer ownership is scoped by `X-User-Id`.

## Returns

- `POST /api/v1/returns`
- `GET /api/v1/returns?page=&pageSize=&status=`
- `GET /api/v1/returns/{id}`

Create request:

```json
{
  "orderId": "bb000000-0001-4000-8000-000000000003",
  "reason": "San pham loi ngoai quan",
  "refundAmount": 8030000
}
```

Rules:

- Order must belong to `X-User-Id`.
- Order status must be `DELIVERED`.
- Backend blocks duplicate active return for the same order.
- Customer can only read own returns.

Return fields: `id`, `returnNumber`, `orderId`, `customerId`, `customerName`, `customerPhone`, `reason`, `status`, `refundAmount`, `disputeResolution`, `createdAt`, `updatedAt`, `orderNumber`, `refundMethod`, `items`.

Return `items[]` fields: `orderItemId`, `productId`, `variantId`, `productName`, `productImage`, `variantName`, `sku`, `quantity`, `unitPrice`, `totalPrice`.

Current `refundMethod` value is `ORIGINAL_PAYMENT`.

Statuses: `PENDING`, `APPROVED`, `PROCESSING`, `REFUNDED`, `CLOSED`, `REJECTED`.

Return refund side effect:

- When admin moves a return request to `REFUNDED`, backend reverses loyalty points previously earned from that order.
- Reverse appears in `GET /api/v1/loyalty/me/transactions?type=EXPIRE`.
- Reverse is idempotent per order and never makes current points negative.

## Warranty

- `GET /api/v1/warranty?page=&pageSize=&status=`
- `GET /api/v1/warranty/{id}`
- `POST /api/v1/warranty-claims`
- `GET /api/v1/warranty-claims?page=&pageSize=&status=`
- `GET /api/v1/warranty-claims/{id}`

Warranty item fields: `id`, `orderId`, `orderItemId`, `productId`, `customerId`, `productName`, `productImage`, `brand`, `serialNumber`, `warrantyMonths`, `warrantyStart`, `warrantyExpiry`, `status`, `createdAt`, `updatedAt`.

Warranty item statuses: `ACTIVE`, `EXPIRED`, `VOIDED`.

Warranty creation side effect:

- Backend auto-creates warranty items when an order transitions to `DELIVERED`.
- Triggered by both admin order status `SHIPPING -> DELIVERED` and admin shipment status `IN_TRANSIT -> DELIVERED` when it also closes the order.
- One warranty item is created per purchased unit.
- `warrantyMonths` uses `products.warranty`; fallback is `12`.
- `warrantyStart = current date`; `warrantyExpiry = warrantyStart + warrantyMonths`.
- `serialNumber` is generated as `WR-{orderNumber}-{sku-or-productId}-{unit}` for dev/local flow.
- The operation is idempotent per `orderItemId`; repeated delivered side effects do not create duplicates.

FE flow: after order detail shows `status=DELIVERED`, call `GET /api/v1/warranty?status=ACTIVE` with the same `X-User-Id` to show warranty cards.

Create claim request:

```json
{
  "warrantyId": "aa000000-0010-4000-8000-000000000001",
  "issueDescription": "May bi loi loa"
}
```

Claim fields: `id`, `claimNumber`, `warrantyId`, `orderId`, `productId`, `customerId`, `customerName`, `customerPhone`, `issueDescription`, `status`, `resolutionNote`, `createdAt`, `updatedAt`, `productName`, `productImage`, `brand`, `serialNumber`, `warrantyStatus`.

Claim statuses: `NEW`, `PROCESSING`, `RESOLVED`, `REJECTED`.

## Trade-In

- `GET /api/v1/trade-in/estimate?brand=&model=&condition=`
- `POST /api/v1/trade-in`
- `GET /api/v1/trade-in?page=&pageSize=&status=`
- `GET /api/v1/trade-in/{id}`
- `PATCH /api/v1/trade-in/{id}/accept`
- `PATCH /api/v1/trade-in/{id}/reject`

Estimate conditions: `GOOD`, `FAIR`, `AVERAGE`, `POOR`.

Create request:

```json
{
  "deviceName": "iPhone 13 Pro 128GB",
  "brand": "Apple",
  "model": "iPhone 13 Pro",
  "condition": "GOOD",
  "targetProductId": "b1b2c3d4-0001-0001-0001-000000000001",
  "images": ["https://storage.cellphones.vn/trade-in/front.jpg"]
}
```

Trade-in fields: `id`, `requestNumber`, `customerId`, `customerName`, `customerPhone`, `deviceName`, `brand`, `model`, `condition`, `estimatedValue`, `finalValuation`, `targetProductId`, `status`, `images`, `adminNote`, `createdAt`, `updatedAt`.

Trade-in statuses: `AWAITING_VALUATION`, `VALUED`, `ACCEPTED`, `REJECTED`, `COMPLETED`.

Customer can only accept/reject after admin valuation sets status to `VALUED`.

## QA Seeds

- Customer returns: `X-User-Id = bc000000-0001-4000-8000-000000000003` has return `aa000000-0001-4000-8000-000000000003`.
- Warranty: `X-User-Id = bc000000-0001-4000-8000-000000000001` has warranty item `aa000000-0010-4000-8000-000000000001`.
- Admin trade-in QA remains available through `FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`.
