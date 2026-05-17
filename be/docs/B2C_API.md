# B2C API Contract

Base URL local: `http://localhost:8080/api/v1`

Source of truth: `B2B eCommerce Platform Plan/ba-docs`.

Trang thai hien tai:

- PostgreSQL + Flyway da duoc dung cho backend.
- Security/RBAC dang tam bo qua theo yeu cau hien tai.
- Catalog la module that dau tien da implement bang JPA.
- Mock API cu duoc doi sang prefix `/api/v1/mock/*`, khong nen dung cho man hinh FE moi.

## Response Shape

Success:

```json
{
  "data": {},
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Paginated:

```json
{
  "data": [],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "error": null
}
```

Error shape da implement theo BA docs:

```json
{
  "data": null,
  "success": false,
  "message": null,
  "pagination": null,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Khong tim thay san pham",
    "details": {}
  }
}
```

## Implemented Contracts

- Current progress: `be/docs/PROGRESS.md`
- Catalog FE contract: `be/docs/FE_CATALOG_CONTRACT.md`
- Cart FE contract: `be/docs/FE_CART_CONTRACT.md`
- Promotion FE contract: `be/docs/FE_PROMOTION_CONTRACT.md`
- Order FE contract: `be/docs/FE_ORDER_CONTRACT.md`
- Admin order FE contract: `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
- Payment/invoice FE contract: `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- Shipment FE contract: `be/docs/FE_SHIPMENT_CONTRACT.md`
- BA to BE/FE mapping: `be/docs/BA_TO_BE_FE_MAPPING.md`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## Main B2C Flow Priority

Thu tu backend se tap trung de FE co luong mua hang chinh:

1. Catalog storefront: category, listing, search/filter, product detail.
2. Cart + promotion validation.
3. Checkout/order creation.
4. User order history/cancel and admin order status operation.
5. Payment/invoice/shipment side effects.
6. After-sales basic and admin inventory.

## Legacy Mock

Legacy mock endpoints chi dung de tham chieu tam thoi:

- Prefix: `/api/v1/mock/*`
- Khong build FE moi dua tren mock response.
- Khi module nao da co API that, FE chuyen sang endpoint that trong contract module do.
