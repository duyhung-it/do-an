# FE Cart Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for core B2C cart flow.

Security note: auth/RBAC dang tam bo qua. Trong local dev, cart dung header `X-User-Id` de tach gio hang theo user. Neu FE khong gui header nay, backend dung demo user mac dinh. Khi bat security, backend se lay user tu JWT.

## Endpoints

### Get Cart

`GET /cart`

Optional header:

| Header | Type | Note |
| --- | --- | --- |
| `X-User-Id` | UUID string | Dev-only user id |

Response:

```json
{
  "data": {
    "items": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "productId": "b1b2c3d4-0001-0001-0001-000000000001",
        "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
        "productName": "iPhone 15 Pro Max 256GB",
        "productImage": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
        "brand": "Apple",
        "variantName": "256GB - Titan Tu Nhien",
        "color": "Titan Tu Nhien",
        "storage": "256GB",
        "quantity": 2,
        "unitPrice": 33990000,
        "totalPrice": 67980000,
        "note": null,
        "addedAt": "2026-05-14T01:03:17+07:00"
      }
    ],
    "itemCount": 1,
    "subtotal": 67980000,
    "estimatedShipping": 0
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

### Add Item

`POST /cart/items`

Request:

```json
{
  "productId": "b1b2c3d4-0001-0001-0001-000000000001",
  "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
  "quantity": 1,
  "note": null
}
```

Rules:

- Neu cung `userId + productId + variantId` da co trong cart, backend merge quantity.
- `unitPrice` duoc snapshot tu variant price neu co variant, nguoc lai lay product price.
- Toi da 50 dong item trong cart.
- Check product active, variant active va stock khi add.

Response: `201 Created`, body la `CartItem`.

### Update Item

`PATCH /cart/items/{id}`

Request:

```json
{
  "quantity": 2,
  "note": "Giao gio hanh chinh"
}
```

Response: `200 OK`, body la `CartItem`.

### Delete Item

`DELETE /cart/items/{id}`

Response: `204 No Content`.

### Clear Cart

`DELETE /cart`

Response: `204 No Content`.

### Validate Cart

`POST /cart/validate`

Response:

```json
{
  "data": {
    "valid": true,
    "issues": []
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Issue object khi co loi:

```json
{
  "cartItemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "productId": "b1b2c3d4-0001-0001-0001-000000000001",
  "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
  "type": "PRICE_CHANGED",
  "message": "Gia san pham da thay doi",
  "cartUnitPrice": 33990000,
  "currentUnitPrice": 32990000,
  "requestedQuantity": 2,
  "availableStock": 45
}
```

Current issue types:

- `PRODUCT_INACTIVE`
- `VARIANT_INACTIVE`
- `INSUFFICIENT_STOCK`
- `PRICE_CHANGED`

## Error Codes

- `CART_ITEM_NOT_FOUND`
- `CART_LIMIT_EXCEEDED`
- `PRODUCT_NOT_FOUND`
- `PRODUCT_VARIANT_NOT_FOUND`
- `PRODUCT_INACTIVE`
- `PRODUCT_OUT_OF_STOCK`
- `VALIDATION_ERROR`

## FE Checklist

- Use `/cart/items`, not old `/cart`.
- Store cart state from `response.data`.
- Use `itemCount` for number of product lines, not total quantity.
- Format `subtotal`, `unitPrice`, `totalPrice` as VND client-side.
- Call `/cart/validate` before checkout.
- During dev, send `X-User-Id` if testing multiple user carts.
