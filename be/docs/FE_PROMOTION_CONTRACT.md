# FE Promotion Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for checkout coupon validation.

Security note: auth/RBAC dang tam bo qua. Khi bat security, `/promotions` va `/promotions/validate` se gan voi customer token.

## Endpoints

### List Active Promotions

`GET /promotions?page=1&pageSize=20`

Only returns promotions that are:

- `isActive = true`
- `startDate <= now <= endDate`
- `usageLimit = 0` or `usedCount < usageLimit`

Response:

```json
{
  "data": [
    {
      "id": "f1b2c3d4-0001-0001-0001-000000000001",
      "code": "WELCOME10",
      "name": "Giam 10% cho don hang dau",
      "description": "Giam 10% toi da 500000 VND cho don hang tu 2000000 VND",
      "type": "PERCENTAGE",
      "value": 10,
      "minOrderValue": 2000000,
      "maxDiscount": 500000,
      "startDate": "2026-01-01T00:00:00+07:00",
      "endDate": "2026-12-31T23:59:59+07:00",
      "usageLimit": 1000,
      "usedCount": 0,
      "applicableProducts": [],
      "applicableCategories": [],
      "applicableBrands": [],
      "isActive": true
    }
  ],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "error": null
}
```

### Validate Promotion

`POST /promotions/validate`

Request:

```json
{
  "code": "WELCOME10",
  "cartTotal": 33990000,
  "cartItems": [
    {
      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
      "categoryId": "a1b2c3d4-0001-0001-0001-000000000003",
      "brand": "Apple"
    }
  ]
}
```

Notes:

- `code` is case-insensitive.
- `brand` is the product brand string used by current catalog.
- `brandId` is also accepted as a fallback field for older FE shape, but new FE should send `brand`.
- `cartTotal` must be calculated from current cart subtotal.
- Call `/cart/validate` before applying promotion during checkout.

Valid response:

```json
{
  "data": {
    "valid": true,
    "promotion": {
      "id": "f1b2c3d4-0001-0001-0001-000000000001",
      "code": "WELCOME10",
      "name": "Giam 10% cho don hang dau",
      "description": "Giam 10% toi da 500000 VND cho don hang tu 2000000 VND",
      "type": "PERCENTAGE",
      "value": 10,
      "minOrderValue": 2000000,
      "maxDiscount": 500000,
      "startDate": "2026-01-01T00:00:00+07:00",
      "endDate": "2026-12-31T23:59:59+07:00",
      "usageLimit": 1000,
      "usedCount": 0,
      "applicableProducts": [],
      "applicableCategories": [],
      "applicableBrands": [],
      "isActive": true
    },
    "discount": 500000,
    "message": "Giam 500000 VND"
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Invalid/error response:

```json
{
  "success": false,
  "error": {
    "code": "PROMOTION_MIN_ORDER_NOT_MET",
    "message": "Don hang chua dat gia tri toi thieu",
    "details": {
      "minOrderValue": 2000000,
      "cartTotal": 100000
    }
  }
}
```

## Seed Promotions

- `WELCOME10`: discount 10%, max 500000 VND, min order 2000000 VND.
- `APPLE500K`: fixed discount 500000 VND, min order 10000000 VND, applies to brand `Apple`.

## Discount Rules

- `PERCENTAGE`: `min(cartTotal * value / 100, maxDiscount)` when `maxDiscount > 0`.
- `FIXED_AMOUNT`: `value`.
- Discount never exceeds `cartTotal`.
- `BUY_X_GET_Y` and `FREE_SHIPPING` are reserved in DB enum but not active in current checkout flow.

## Error Codes

- `PROMOTION_NOT_FOUND`
- `PROMOTION_INACTIVE`
- `PROMOTION_EXPIRED`
- `PROMOTION_USAGE_EXCEEDED`
- `PROMOTION_MIN_ORDER_NOT_MET`
- `PROMOTION_NOT_APPLICABLE`
- `VALIDATION_ERROR`

## FE Checklist

- Fetch active promotions from `GET /promotions` for coupon suggestions.
- On user coupon input, call `POST /promotions/validate`.
- If success, subtract `data.discount` from cart subtotal in checkout preview.
- Keep `promotion.code` for the later order creation request.
- Do not increment promotion usage on validate; usage will be incremented during order creation.
