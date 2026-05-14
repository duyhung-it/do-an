# Backend Progress

Source of truth: `B2B eCommerce Platform Plan/ba-docs`

Focus hien tai: B2C core flow, uu tien storefront -> cart -> checkout -> order operations.

## Current Status

### Done - 2026-05-14

Catalog foundation da xong.

Da implement:

- PostgreSQL runtime thay cho MySQL.
- Flyway migration catalog B2C.
- Catalog tables: `categories`, `products`, `product_variants`, `product_images`, `phone_specs`.
- PostgreSQL enums: `product_status`, `product_condition`.
- Seed data cho FE:
  - 4 categories.
  - 3 products.
  - 4 variants.
  - 4 product images.
  - 2 phone specs.
- Catalog JPA entity/repository/service.
- Public catalog endpoints:
  - `GET /api/v1/categories`
  - `GET /api/v1/categories/{id}`
  - `GET /api/v1/categories/{slug}/by-slug`
  - `GET /api/v1/products`
  - `GET /api/v1/products/{id}`
  - `GET /api/v1/products/{slug}/by-slug`
  - `GET /api/v1/products/{id}/similar`
  - `GET /api/v1/products/{id}/accessories`
  - `GET /api/v1/products/featured`
  - `GET /api/v1/products/hot`
  - `GET /api/v1/products/new`
  - `GET /api/v1/products/brands`
  - `GET /api/v1/products/{productId}/variants`
  - `GET /api/v1/products/{productId}/images`
- Admin catalog endpoints open tam thoi:
  - `POST /api/v1/admin/categories`
  - `PATCH /api/v1/admin/categories/{id}`
  - `DELETE /api/v1/admin/categories/{id}`
  - `POST /api/v1/admin/products`
  - `PATCH /api/v1/admin/products/{id}`
  - `DELETE /api/v1/admin/products/{id}`
  - `POST /api/v1/admin/products/{productId}/variants`
  - `PATCH /api/v1/admin/products/{productId}/variants/{id}`
  - `DELETE /api/v1/admin/products/{productId}/variants/{id}`
  - `POST /api/v1/admin/products/{productId}/images`
  - `PATCH /api/v1/admin/products/{productId}/images/{id}`
  - `DELETE /api/v1/admin/products/{productId}/images/{id}`
- Response shape chuan hoa:
  - `data`
  - `success`
  - `message`
  - `pagination`
  - `error`
- Legacy mock API doi sang `/api/v1/mock/*`.
- Integration test MockMvc cho catalog.

Verify:

- `docker compose up -d postgres`: passed.
- PostgreSQL seed check: passed.
- Flyway `V1`: success.
- `mvn test`: passed.

FE docs:

- `be/docs/B2C_API.md`
- `be/docs/FE_CATALOG_CONTRACT.md`

### Done - 2026-05-14

Foundation error handling + OpenAPI da xong.

Da implement:

- `ErrorCode` enum theo nhom code trong `12-error-codes.md`.
- `AppException` dung chung cho service layer.
- Global exception handler cho:
  - `AppException`
  - `NoSuchElementException`
  - `IllegalArgumentException`
  - Bean validation request body
  - Constraint validation
  - Query/path param type mismatch
  - Invalid JSON body
  - Data integrity conflict
  - Unexpected server error
- Validation error tra ve `error.details` theo field.
- Catalog product not found tra `PRODUCT_NOT_FOUND`.
- Product variant not found tra `PRODUCT_VARIANT_NOT_FOUND`.
- OpenAPI/Swagger:
  - JSON: `GET /v3/api-docs`
  - UI: `GET /swagger-ui.html`

Verify:

- `mvn test`: passed.
- Test suite hien co: 5 tests, 0 failures, 0 errors.

### Done - 2026-05-14

Cart module da xong cho core B2C flow.

Da implement:

- Flyway migration `V2__cart_items.sql`.
- Table `cart_items` voi unique theo `user_id + product_id + variant_id`.
- Cart JPA entity/repository/service/controller.
- Dev-only user ownership bang header `X-User-Id` trong khi security dang deferred.
- Endpoints:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `PATCH /api/v1/cart/items/{id}`
  - `DELETE /api/v1/cart/items/{id}`
  - `DELETE /api/v1/cart`
  - `POST /api/v1/cart/validate`
- Cart rules:
  - Merge item trung `userId + productId + variantId`.
  - Snapshot `unitPrice` tai thoi diem add.
  - Gioi han 50 dong item.
  - Check product active, variant active, variant stock.
  - Validate cart truoc checkout voi issue list.
- Them error codes:
  - `CART_ITEM_NOT_FOUND`
  - `CART_ACCESS_DENIED`
  - `CART_LIMIT_EXCEEDED`
- Tao tai lieu FE contract: `be/docs/FE_CART_CONTRACT.md`.

Verify:

- `mvn test`: passed.
- Flyway da apply version `2 - cart items`.
- Test suite hien co: 6 tests, 0 failures, 0 errors.

### Done - 2026-05-14

Promotion validation toi thieu da xong.

Da implement:

- Flyway migration `V3__promotions.sql`.
- Enum `discount_type`.
- Table `promotions`.
- Seed promotions:
  - `WELCOME10`
  - `APPLE500K`
- Promotion service/controller bang JDBC de xu ly PostgreSQL arrays gon hon.
- Endpoints:
  - `GET /api/v1/promotions`
  - `POST /api/v1/promotions/validate`
- Validation rules:
  - code case-insensitive.
  - active status.
  - start/end date.
  - usage limit.
  - min order value.
  - applicable products/categories/brands.
  - percentage/fixed discount.
- Tao tai lieu FE contract: `be/docs/FE_PROMOTION_CONTRACT.md`.

Verify:

- `mvn test`: passed.
- Flyway da apply version `3 - promotions`.
- Test suite hien co: 7 tests, 0 failures, 0 errors.

### Done - 2026-05-14

Order creation transaction dau tien da xong.

Da implement:

- Flyway migration `V4__orders_payments.sql`.
- Enums:
  - `order_status`
  - `payment_status`
  - `payment_method`
- Tables:
  - `order_daily_sequences`
  - `orders`
  - `order_items`
  - `order_status_history`
  - `payments`
- Endpoint:
  - `POST /api/v1/orders`
- Transaction rules:
  - validate items.
  - validate product/variant active.
  - validate stock.
  - recalculate unit price from DB.
  - validate promotion code.
  - calculate subtotal/discount/shipping/total.
  - generate `CPyyyyMMdd00001` style order number.
  - create order.
  - create order items.
  - create first status history `PENDING`.
  - create payment placeholder `UNPAID`.
  - increment promotion `used_count`.
  - clear cart.
- Tao FE contract: `be/docs/FE_ORDER_CONTRACT.md`.
- Tao BA mapping doc: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Flyway da apply version `4 - orders payments`.
- Test suite hien co: 8 tests, 0 failures, 0 errors.

Dev bridges:

- `X-User-Id` va customer headers thay cho JWT/users table.
- Inline `shippingAddress` thay cho `shippingAddressId`.
- Payment gateway chua co, moi tao placeholder record.

### Done - 2026-05-14

Customer order list/detail da xong.

Da implement:

- Endpoints:
  - `GET /api/v1/orders`
  - `GET /api/v1/orders/{id}`
- List orders:
  - filter by current dev user `X-User-Id`.
  - pagination `page/pageSize`, max page size 50.
  - optional `status`.
  - optional `search` by `orderNumber`.
  - summary includes item count and first item preview.
- Detail order:
  - scoped by current dev user.
  - includes items and status history.
  - hides `internalNotes` for customer.
  - returns `ORDER_NOT_FOUND` when user does not own order.
- Updated FE order contract and BA mapping docs.

Verify:

- `mvn test`: passed.
- Test suite hien co: 9 tests, 0 failures, 0 errors.

### In Progress / Next

Nen lam tiep theo de FE ghep luong mua hang chinh:

1. Order cancel flow.
2. Admin order list/detail + status update toi thieu.
3. Stock reservation khi admin confirm order.

### Deferred

- Security/RBAC/ownership: tam bo qua theo yeu cau hien tai.
- Payment gateway that.
- Loyalty.
- Returns/warranty/trade-in.
- Admin dashboard/reports.

## Rule Going Forward

Sau moi lan xong mot module:

- Cap nhat `be/docs/PROGRESS.md`.
- Cap nhat contract FE tuong ung trong `be/docs`.
- Cap nhat plan tong trong `be/docs/BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md`.
- Chi ghi endpoint backend da implement that, khong ghi mock endpoint thanh contract moi.
