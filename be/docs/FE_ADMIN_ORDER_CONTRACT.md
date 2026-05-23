# FE Admin Order Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for admin order list/detail, status update, stock reservation, invoice/payment side effects, and shipment placeholder side effects.

BA source:

- `B2B eCommerce Platform Plan/ba-docs/05-api-orders.md`, sections `4.1`, `4.2`, `4.3`

Security note: auth/RBAC dang tam bo qua. Admin endpoints dang open trong local dev. Status update dung optional headers `X-Admin-Id`, `X-Admin-Name` de ghi `order_status_history`; khi bat security se thay bang JWT role `ADMIN`.

## List Admin Orders

`GET /admin/orders?page=1&pageSize=20&status=PENDING&paymentStatus=UNPAID&search=Nguyen&dateFrom=2026-05-01&dateTo=2026-05-14`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 50 |
| `status` | string | | `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `RETURNED` |
| `paymentStatus` | string | | `UNPAID`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED` |
| `search` | string | | case-insensitive search by `orderNumber`, `customerName`, `customerPhone` |
| `dateFrom` | date | | `YYYY-MM-DD`, filter by `createdAt` |
| `dateTo` | date | | `YYYY-MM-DD`, inclusive day filter |

Response uses global pagination shape:

```json
{
  "data": [
    {
      "id": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
      "orderNumber": "CP2026051400001",
      "customerId": "00000000-0000-4000-8000-000000000199",
      "customerName": "Nguyen Van A",
      "customerPhone": "0901234567",
      "customerEmail": "nguyenvana@gmail.com",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "paymentMethod": "COD",
      "subtotal": 33990000,
      "discount": 500000,
      "shippingFee": 0,
      "totalAmount": 33490000,
      "promotionCode": "WELCOME10",
      "items": {
        "count": 1,
        "firstItem": {
          "productId": "b1b2c3d4-0001-0001-0001-000000000001",
          "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
          "productName": "iPhone 15 Pro Max 256GB",
          "productImage": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
          "variantName": "256GB - Titan Tu Nhien"
        }
      },
      "createdAt": "2026-05-14T08:18:00+07:00",
      "updatedAt": "2026-05-14T08:18:00+07:00"
    }
  ],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "error": null
}
```

## Get Admin Order Detail

`GET /admin/orders/{id}`

Response: full `OrderDto`, same as customer `GET /orders/{id}`, but admin includes `internalNotes`.

## Update Order Status

`PATCH /admin/orders/{id}/status`

Optional dev headers:

| Header | Type | Note |
| --- | --- | --- |
| `X-Admin-Id` | UUID string | Dev-only admin/staff id |
| `X-Admin-Name` | string | Dev-only admin/staff display name |

Request:

```json
{
  "status": "CONFIRMED",
  "note": "Da xac nhan don hang, du hang trong kho"
}
```

Response: full admin `OrderDto` after update.

Implemented state machine:

| From | Allowed next |
| --- | --- |
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `SHIPPING`, `CANCELLED` |
| `SHIPPING` | `DELIVERED` |
| `DELIVERED` | `RETURNED` |
| `CANCELLED` | none |
| `RETURNED` | none |

## Update Internal Notes

`PATCH /admin/orders/{id}/notes`

Request:

```json
{
  "notes": "Khach VIP, uu tien giao truoc. Da goi xac nhan luc 10:30."
}
```

Rules:

- `notes` is required.
- Max length: 1000 characters.
- Backend overwrites the existing `internalNotes`.
- `internalNotes` is returned only by admin order endpoints, not customer order endpoints.

Response: full admin `OrderDto` after update.

Implemented side effects now:

- Update `orders.status`.
- Update `orders.updated_at`.
- Insert `order_status_history` with admin id/name/note.
- When `PENDING -> CONFIRMED`, reserve stock by decreasing `product_variants.stock` for each order item and writing `order_stock_reservations`.
- If new status is `CANCELLED`, set `cancelReason`, `cancelledAt`, decrement promotion usage when applicable, and release reserved stock when cancelling from `CONFIRMED`.
- When `CONFIRMED -> SHIPPING`, create invoice if missing.
- When `CONFIRMED -> SHIPPING`, create shipment if missing and mark it `IN_TRANSIT`.
- When `SHIPPING -> DELIVERED` and `paymentMethod = COD`, mark order/payment/invoice as paid.
- When `SHIPPING -> DELIVERED`, mark shipment `DELIVERED` and set `actualDelivery`.

Deferred side effects:

- Carrier integration/tracking timeline.
- Notification/loyalty.

## Error Codes

- `ORDER_NOT_FOUND`
- `ORDER_INVALID_STATUS_TRANSITION`
- `VALIDATION_ERROR`

## BA Mapping

| BE behavior | BA source |
| --- | --- |
| `GET /api/v1/admin/orders` | `05-api-orders.md`, section `4.1` |
| `GET /api/v1/admin/orders/{id}` | `05-api-orders.md`, section `4.2` |
| `PATCH /api/v1/admin/orders/{id}/status` | `05-api-orders.md`, section `4.3` |
| `PATCH /api/v1/admin/orders/{id}/notes` | `05-api-orders.md`, section `4.4` |
| State machine | `05-api-orders.md`, section `4.3` |
| Stock reserve/release | `10-business-rules.md`, sections `2.6.1`, `5.2`, `5.5` |
| Invoice/payment side effects | `10-business-rules.md`, sections `5.3`, `5.4`, `5.5` |
| Shipment side effects | `10-business-rules.md`, section `5.3` |
