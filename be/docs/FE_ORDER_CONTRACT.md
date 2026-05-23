# FE Order Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for first checkout transaction, customer list/detail, and customer cancel flow.

BA source:

- `B2B eCommerce Platform Plan/ba-docs/05-api-orders.md`
- `B2B eCommerce Platform Plan/ba-docs/10-business-rules.md`
- `B2B eCommerce Platform Plan/ba-docs/02-database-design.md`

Security note: auth/RBAC dang tam bo qua. Trong local dev, order dung header `X-User-Id` de gan customer id. FE co the gui them `X-User-Name`, `X-User-Email`, `X-User-Phone` de backend snapshot thong tin customer. Khi bat security/users, cac header dev nay se duoc thay bang JWT + users table.

Address note: BA yeu cau `shippingAddressId`. Backend da ho tro saved address bang `GET/POST/PATCH/DELETE /users/me/addresses` trong `FE_BUYER_PROFILE_CONTRACT.md`. `POST /orders` uu tien `shippingAddressId`, validate ownership theo `X-User-Id`, snapshot vao `orders.shipping_address`, va luu `orders.shipping_address_id`. Inline `shippingAddress` van duoc giu de FE tuong thich.

## Create Order

`POST /orders`

Optional dev headers:

| Header | Type | Note |
| --- | --- | --- |
| `X-User-Id` | UUID string | Dev-only customer id |
| `X-User-Name` | string | Dev-only customer name snapshot |
| `X-User-Email` | string | Dev-only customer email snapshot |
| `X-User-Phone` | string | Dev-only customer phone snapshot |

Request:

```json
{
  "items": [
    {
      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
      "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
      "quantity": 1
    }
  ],
  "shippingAddressId": "dd000000-0199-4000-8000-000000000001",
  "shippingAddress": {
    "recipientName": "Nguyen Van A",
    "phone": "0901234567",
    "province": "TP. Ho Chi Minh",
    "district": "Quan 1",
    "ward": "Ben Nghe",
    "addressLine": "123 Ly Tu Trong"
  },
  "paymentMethod": "COD",
  "promotionCode": "WELCOME10",
  "notes": "Giao hang gio hanh chinh"
}
```

FE co the gui chi `shippingAddressId` khi user chon dia chi da luu:

```json
{
  "items": [
    {
      "productId": "b1b2c3d4-0001-0001-0001-000000000002",
      "variantId": "c1b2c3d4-0001-0001-0001-000000000003",
      "quantity": 1
    }
  ],
  "shippingAddressId": "dd000000-0199-4000-8000-000000000001",
  "paymentMethod": "COD"
}
```

Response:

```json
{
  "data": {
    "order": {
      "id": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
      "orderNumber": "CP2026051400001",
      "customerId": "00000000-0000-4000-8000-000000000199",
      "customerName": "Nguyen Van A",
      "customerPhone": "0901234567",
      "customerEmail": "nguyenvana@gmail.com",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "paymentMethod": "COD",
      "shippingAddress": {
        "recipientName": "Nguyen Van A",
        "phone": "0901234567",
        "province": "TP. Ho Chi Minh",
        "district": "Quan 1",
        "ward": "Ben Nghe",
        "addressLine": "123 Ly Tu Trong",
        "fullAddress": "123 Ly Tu Trong, Ben Nghe, Quan 1, TP. Ho Chi Minh"
      },
      "items": [
        {
          "id": "2b71a49f-f456-4f30-a7f2-c166f1eaa4f1",
          "productId": "b1b2c3d4-0001-0001-0001-000000000001",
          "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
          "productName": "iPhone 15 Pro Max 256GB",
          "productImage": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
          "brand": "Apple",
          "variantName": "256GB - Titan Tu Nhien",
          "color": "Titan Tu Nhien",
          "storage": "256GB",
          "quantity": 1,
          "unitPrice": 33990000,
          "totalPrice": 33990000
        }
      ],
      "subtotal": 33990000,
      "discount": 500000,
      "shippingFee": 0,
      "totalAmount": 33490000,
      "promotionCode": "WELCOME10",
      "promotionId": "f1b2c3d4-0001-0001-0001-000000000001",
      "notes": "Giao hang gio hanh chinh",
      "internalNotes": null,
      "cancelReason": null,
      "cancelledAt": null,
      "statusHistory": [
        {
          "id": "20e27e54-7ec1-4f3b-8f25-4e8200ca0810",
          "fromStatus": null,
          "toStatus": "PENDING",
          "note": "Don hang duoc tao",
          "changedBy": "00000000-0000-4000-8000-000000000199",
          "changedByName": "Nguyen Van A",
          "changedAt": "2026-05-14T02:21:00+07:00"
        }
      ],
      "createdAt": "2026-05-14T02:21:00+07:00",
      "updatedAt": "2026-05-14T02:21:00+07:00"
    },
    "payment": {
      "id": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
      "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
      "orderNumber": "CP2026051400001",
      "method": "COD",
      "status": "UNPAID",
      "amount": 33490000,
      "paidAmount": 0,
      "transactionId": null,
      "paymentUrl": null,
      "paidAt": null,
      "createdAt": "2026-05-14T02:21:00+07:00"
    }
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

## Transaction Rules Implemented

All steps run in one database transaction:

1. Validate items exist.
2. Validate product status is `ACTIVE`.
3. Validate selected variant exists, active, and enough stock.
4. Recalculate unit price from DB, not from client/cart.
5. Validate promotion code if provided.
6. Calculate `subtotal`, `discount`, `shippingFee`, `totalAmount`.
7. Generate `orderNumber = CP + yyyyMMdd + 5-digit daily sequence`.
8. If `shippingAddressId` is provided, validate saved address ownership and snapshot it.
9. Insert `orders` with `shipping_address` and optional `shipping_address_id`.
10. Insert `order_items`.
11. Insert first `order_status_history` row with `toStatus = PENDING`.
12. Insert `payments` placeholder with `status = UNPAID`.
13. Increment promotion `usedCount` if promotion is used.
14. Clear current user's cart.

## Payment Methods

Accepted now:

- `COD`
- `BANK_TRANSFER`
- `MOMO`
- `VNPAY`
- `INSTALLMENT`

Current payment implementation is placeholder only:

- Creates payment record.
- `status = UNPAID`.
- `paymentUrl = null`.
- Gateway callback is not implemented yet.

## Shipping Fee

Current temporary rule:

- `subtotal >= 3000000`: `shippingFee = 0`
- otherwise: `shippingFee = 30000`

## Error Codes

- `ORDER_EMPTY_ITEMS`
- `ORDER_ADDRESS_REQUIRED`
- `ORDER_INSUFFICIENT_STOCK`
- `ORDER_NOT_FOUND`
- `ORDER_CANNOT_CANCEL`
- `PRODUCT_NOT_FOUND`
- `PRODUCT_VARIANT_NOT_FOUND`
- `PRODUCT_INACTIVE`
- `PROMOTION_NOT_FOUND`
- `PROMOTION_EXPIRED`
- `PROMOTION_USAGE_EXCEEDED`
- `PROMOTION_MIN_ORDER_NOT_MET`
- `PROMOTION_NOT_APPLICABLE`
- `VALIDATION_ERROR`

## BA Mapping

| BE behavior | BA source |
| --- | --- |
| `POST /api/v1/orders` | `05-api-orders.md`, section `3.1 POST /orders` |
| Order starts as `PENDING` | `05-api-orders.md`, order create rules step 5 |
| Payment starts as `UNPAID` | `05-api-orders.md`, order create rules step 5-6 |
| Initial status history row | `05-api-orders.md`, order create rules step 7 |
| Clear cart after success | `05-api-orders.md`, order create rules step 8 |
| Increment promotion usage | `05-api-orders.md`, order create rules step 10 and `10-business-rules.md`, section `2.3.4` |
| Transaction rollback | `05-api-orders.md`, order create rules step 11 |
| Saved address checkout | `03-api-auth-users.md` ShippingAddress, `05-api-orders.md` `shippingAddressId` |
| Order number format | `10-business-rules.md`, order number rule |
| `GET /api/v1/orders` | `05-api-orders.md`, section `3.2 GET /orders` |
| `GET /api/v1/orders/{id}` | `05-api-orders.md`, section `3.3 GET /orders/:id` |
| `DELETE /api/v1/orders/{id}/cancel` | `05-api-orders.md`, section `3.4 DELETE /orders/:id/cancel` |

## FE Checklist

- Call `/cart/validate` before order creation.
- Call `/promotions/validate` before displaying final discount.
- Send the same `promotionCode` in `POST /orders`.
- Do not send prices from FE; backend recalculates prices from DB.
- After `POST /orders` success, clear local cart state because backend has cleared server cart.

## List Orders

`GET /orders?page=1&pageSize=10&status=PENDING&search=CP20260514`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `10` | max 50 |
| `status` | string | | `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `RETURNED` |
| `search` | string | | search by `orderNumber` |

Response:

```json
{
  "data": [
    {
      "id": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
      "orderNumber": "CP2026051400001",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "totalAmount": 33490000,
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
      "createdAt": "2026-05-14T02:28:03+07:00"
    }
  ],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "error": null
}
```

## Get Order Detail

`GET /orders/{id}`

Response: full `OrderDto` like `data.order` in create response.

Customer endpoint behavior:

- Only returns order when `customerId` matches current dev `X-User-Id`.
- `internalNotes` is not exposed to customer; field is always omitted/null.
- `statusHistory` is sorted by `changedAt ASC`.

Error when order does not belong to current user:

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Khong tim thay don hang",
    "details": {}
  }
}
```

## Cancel Order

`DELETE /orders/{id}/cancel`

Request:

```json
{
  "reason": "Khach hang doi y"
}
```

## Get Order Invoice

`GET /orders/{id}/invoice`

Returns invoice JSON after admin moves the order to `SHIPPING`. For full response shape and side effects, see `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`.

Current behavior:

- Only current customer can access invoice for their own order.
- Before order reaches `SHIPPING`, backend returns `INVOICE_NOT_AVAILABLE`.
- This endpoint returns JSON invoice metadata, not a PDF file yet.

Response: full `OrderDto` like `data.order` in create response, with:

- `status = CANCELLED`
- `cancelReason` set from request.
- `cancelledAt` set by backend.
- new status history row from previous status to `CANCELLED`.

Rules:

- Only current customer can cancel their own order.
- Only `PENDING` and `CONFIRMED` orders can be cancelled.
- Promotion `usedCount` is decremented when the cancelled order used a promotion.
- If the order was already `CONFIRMED`, backend releases reserved stock by increasing `product_variants.stock` and marking `order_stock_reservations.releasedAt`.
- If the order is still `PENDING`, no stock release is needed because stock is reserved only when admin confirms the order.

Error example:

```json
{
  "success": false,
  "error": {
    "code": "ORDER_CANNOT_CANCEL",
    "message": "Don hang khong the huy o trang thai hien tai",
    "details": {}
  }
}
```
