# Backend Progress

Source of truth: `B2B eCommerce Platform Plan/ba-docs`

Focus hien tai: B2C core flow, uu tien storefront -> cart -> checkout -> order operations.

## Current Status - 2026-05-17

Admin BA completion theo `ba-docs/09-api-admin.md` da xong cho FE ghep.

Da implement:

- Flyway migration `V17__admin_remaining_modules.sql`.
- Flyway migration `V18__admin_banner_qa_data.sql`.
- Admin users:
  - `GET /api/v1/admin/users`
  - `GET /api/v1/admin/users/{id}`
  - `PATCH /api/v1/admin/users/{id}`
  - `PATCH /api/v1/admin/users/{id}/status`
  - `DELETE /api/v1/admin/users/{id}`
- Admin notifications:
  - `POST /api/v1/admin/notifications/broadcast`
  - `POST /api/v1/admin/notifications/send-to-user`
- Suppliers/installment plans:
  - `GET/POST/PATCH /api/v1/admin/suppliers`
  - `GET/POST/PATCH/DELETE /api/v1/admin/installment-plans`
- Admin invoice manual ops:
  - `POST /api/v1/admin/invoices`
  - `DELETE /api/v1/admin/invoices/{id}`
- Warranty master:
  - `GET /api/v1/admin/warranty`
  - `POST /api/v1/admin/warranty`
- Catalog/admin content extras:
  - `PATCH /api/v1/admin/products/{productId}/images/reorder`
  - `POST/PATCH/DELETE /api/v1/admin/combos`
  - `POST/PATCH/DELETE /api/v1/admin/blog`
  - `PATCH /api/v1/admin/reviews/{id}/status`
  - `POST /api/v1/admin/reviews/{id}/reply`
- BA path aliases:
  - `PATCH /api/v1/admin/shipments/{id}/tracking`
  - `/api/v1/admin/settings/banners`
  - `/api/v1/admin/settings/email-templates`
  - `/api/v1/admin/settings/seo`
  - `PATCH /api/v1/admin/branches/{id}/toggle`
  - `GET /api/v1/admin/staff/{id}`
- Cap nhat docs:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`
  - `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite: 18 tests, 0 failures, 0 errors.
- Flyway da apply version `18 - admin banner qa data`.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Customer notification inbox/preferences trong `08-api-loyalty-notifications.md`.
2. Payment gateway callback cho MOMO/VNPAY.
3. Security/RBAC/ownership that khi khong con defer.

## Current Status - 2026-05-17

Loyalty flow theo `ba-docs/08-api-loyalty-notifications.md` da xong cho FE ghep.

Da implement:

- Flyway migration `V16__loyalty_program.sql`.
- Loyalty tables: `loyalty_programs`, `loyalty_transactions`, `loyalty_rewards`, `loyalty_reward_redemptions`.
- Customer loyalty:
  - `GET /api/v1/loyalty/me`
  - `GET /api/v1/loyalty/me/transactions`
  - `GET /api/v1/loyalty/me/stats`
  - `GET /api/v1/loyalty/rewards`
  - `POST /api/v1/loyalty/rewards/{id}/redeem`
- Admin loyalty:
  - `GET /api/v1/admin/loyalty`
  - `GET /api/v1/admin/loyalty/{customerId}`
  - `POST /api/v1/admin/loyalty/bonus-points`
  - `GET /api/v1/admin/loyalty/rewards`
  - `POST /api/v1/admin/loyalty/rewards`
  - `PATCH /api/v1/admin/loyalty/rewards/{id}`
  - `DELETE /api/v1/admin/loyalty/rewards/{id}`
- Delivered order side effect:
  - `SHIPPING -> DELIVERED` awards `EARN` points once per order.
- FE contract moi: `be/docs/FE_LOYALTY_CONTRACT.md`.
- Mapping BA -> BE/FE da cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 17 tests, 0 failures, 0 errors.
- Flyway da apply version `16 - loyalty program`.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Notifications customer/admin trong `08-api-loyalty-notifications.md`.
2. Payment gateway callback cho MOMO/VNPAY.
3. Security/RBAC/ownership that khi khong con defer.

## Current Status - 2026-05-17

Customer after-sales flow theo `ba-docs/07-api-after-sales.md` da xong cho FE ghep.

Da implement:

- Flyway migration `V15__customer_after_sales_flow.sql`.
- Them `warranty_items` va seed 10 warranty item cho QA/customer flow.
- Customer returns:
  - `POST /api/v1/returns`
  - `GET /api/v1/returns`
  - `GET /api/v1/returns/{id}`
- Customer warranty:
  - `GET /api/v1/warranty`
  - `GET /api/v1/warranty/{id}`
  - `POST /api/v1/warranty-claims`
  - `GET /api/v1/warranty-claims`
  - `GET /api/v1/warranty-claims/{id}`
- Customer trade-in:
  - `GET /api/v1/trade-in/estimate`
  - `POST /api/v1/trade-in`
  - `GET /api/v1/trade-in`
  - `GET /api/v1/trade-in/{id}`
  - `PATCH /api/v1/trade-in/{id}/accept`
  - `PATCH /api/v1/trade-in/{id}/reject`
- Ownership tam thoi bang `X-User-Id` cho returns/warranty/trade-in.
- FE contract moi: `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`.
- Mapping BA -> BE/FE da cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 16 tests, 0 failures, 0 errors.
- Flyway da apply version `15 - customer after sales flow`.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Loyalty customer/admin va points side effects.
2. Payment gateway callback cho MOMO/VNPAY.
3. Security/RBAC/ownership that khi khong con defer.

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

### Done - 2026-05-14

Customer order cancel flow da xong.

Da implement:

- Endpoint:
  - `DELETE /api/v1/orders/{id}/cancel`
- Cancel rules theo BA:
  - Chi current customer duoc huy order cua chinh minh.
  - Chi cho huy khi order dang `PENDING` hoac `CONFIRMED`.
  - Cap nhat order sang `CANCELLED`.
  - Luu `cancelReason` va `cancelledAt`.
  - Ghi them `order_status_history` tu status cu sang `CANCELLED`.
  - Giam `promotions.used_count` neu order co dung promotion.
- Cap nhat FE order contract va BA mapping docs.

Ghi chu hien tai:

- Sau module stock reservation, cancel tu `CONFIRMED` da release reserved stock. Cancel tu `PENDING` khong doi stock vi chua reserve.

Verify:

- `mvn test`: passed.
- Test suite hien co: 10 tests, 0 failures, 0 errors.

### Done - 2026-05-14

Admin order operations toi thieu da xong.

Da implement:

- Endpoints:
  - `GET /api/v1/admin/orders`
  - `GET /api/v1/admin/orders/{id}`
  - `PATCH /api/v1/admin/orders/{id}/status`
- Admin list:
  - pagination `page/pageSize`, max page size 50.
  - filter `status`.
  - filter `paymentStatus`.
  - search by `orderNumber`, `customerName`, `customerPhone`.
  - filter `dateFrom/dateTo` theo `createdAt`.
- Admin detail:
  - xem order bat ky, khong scope theo customer.
  - include `internalNotes` cho admin.
  - include items va status history.
- Admin status update:
  - state machine theo BA:
    - `PENDING -> CONFIRMED/CANCELLED`
    - `CONFIRMED -> SHIPPING/CANCELLED`
    - `SHIPPING -> DELIVERED`
    - `DELIVERED -> RETURNED`
  - ghi `order_status_history` bang dev admin header `X-Admin-Id`, `X-Admin-Name`.
  - neu chuyen sang `CANCELLED`, set `cancelReason`, `cancelledAt` va giam promotion usage neu co.
- Tao FE contract: `be/docs/FE_ADMIN_ORDER_CONTRACT.md`.
- Cap nhat BA mapping.

Ghi chu hien tai:

- Security/RBAC admin dang open theo yeu cau tam bo qua security.
- Payment refund/mark-paid, invoice/shipment, notification/loyalty chua lam trong status update.

Verify:

- `mvn test`: passed.
- Test suite hien co: 11 tests, 0 failures, 0 errors.

### Done - 2026-05-14

Stock reservation side effect cho order status da xong.

Da implement:

- Flyway migration `V5__order_stock_reservations.sql`.
- Table `order_stock_reservations` de track stock da reserve theo `order_item_id`.
- Khi admin update `PENDING -> CONFIRMED`:
  - Check va tru `product_variants.stock` atomically voi dieu kien `stock >= quantity`.
  - Insert reservation rows cho tung item.
  - Neu bat ky item khong du stock, transaction rollback va tra `ORDER_INSUFFICIENT_STOCK`.
- Khi cancel order tu `CONFIRMED`:
  - Release reservation bang cach cong lai `product_variants.stock`.
  - Set `order_stock_reservations.released_at`.
  - Ap dung cho ca customer cancel va admin cancel.
- Khi cancel tu `PENDING`:
  - Khong doi stock vi chua reserve.
- Updated docs:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_ORDER_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 11 tests, 0 failures, 0 errors.
- Test da assert stock giam sau confirm va tro lai sau cancel tu confirmed.
- Flyway da apply version `5 - order stock reservations`.

### Done - 2026-05-14

Payment/invoice side effects toi thieu da xong.

Da implement:

- Flyway migration `V6__invoices.sql`.
- Tables/enums:
  - `invoice_status`
  - `invoice_daily_sequences`
  - `invoices`
- Customer endpoint:
  - `GET /api/v1/orders/{id}/invoice`
- Order create:
  - tao `payments` row `UNPAID` nhu truoc.
- Admin update `CONFIRMED -> SHIPPING`:
  - tao invoice neu chua co.
  - `invoiceNumber = INV-yyyyMMdd-xxx`.
  - `invoice.status = PENDING`.
- Admin update `SHIPPING -> DELIVERED` voi `paymentMethod = COD`:
  - update `payments.status = PAID`.
  - set `paidAmount = amount`, `remainingAmount = 0`, `paidAt = now`.
  - update `orders.payment_status = PAID`.
  - update `invoices.status = PAID`, `paidAt = now`.
- Cancel order:
  - invoice neu da tao se sang `CANCELLED`.
- Tao FE contract:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- Cap nhat:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_ORDER_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Ghi chu hien tai:

- Payment gateway/MOMO/VNPAY callback chua lam.
- Invoice PDF download chua lam, endpoint hien tra JSON metadata.
- Shipment chua lam.

Verify:

- `mvn test`: passed.
- Test suite hien co: 12 tests, 0 failures, 0 errors.
- Flyway da apply version `6 - invoices`.

### Done - 2026-05-14

Admin manual mark-paid cho payment da xong.

Da implement:

- Endpoint:
  - `PATCH /api/v1/admin/payments/{id}/mark-paid`
- Request fields:
  - `paidAmount`
  - `transactionRef`
  - `method`
- Payment rules theo BA:
  - `paidAmount > 0`.
  - Cong don vao `payments.paid_amount`.
  - Tinh lai `payments.remaining_amount`.
  - `transactionRef` unique bang Flyway migration `V7__payment_transaction_ref_unique.sql`.
  - Khi da thanh toan du, set `payments.status = PAID`, `paid_at = now`.
  - Dong bo `orders.payment_status = PAID`.
  - Neu invoice da tao va dang `PENDING`, set `invoices.status = PAID`, `paid_at = now`.
  - Payment da `PAID` thi tra `PAYMENT_ALREADY_PAID`.
- Them DTO/controller:
  - `AdminPaymentController`
  - `MarkPaymentPaidRequest`
  - `AdminPaymentDto`
- Cap nhat docs:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 13 tests, 0 failures, 0 errors.
- Flyway da apply version `7 - payment transaction ref unique`.

### Done - 2026-05-14

Shipment placeholder cho order shipping flow da xong.

Da implement:

- Flyway migration `V8__shipments.sql`.
- Enum/table:
  - `shipment_status`
  - `shipments`
- Customer endpoint:
  - `GET /api/v1/orders/{id}/shipment`
- Shipment object fields cho FE:
  - `id`
  - `orderId`
  - `orderNumber`
  - `trackingNumber`
  - `carrierName`
  - `status`
  - `estimatedDelivery`
  - `actualDelivery`
  - `createdAt`
  - `updatedAt`
- Admin update `CONFIRMED -> SHIPPING`:
  - tao shipment neu chua co.
  - `trackingNumber = GHTK-{orderNumber}`.
  - `carrierName = Giao Hang Tiet Kiem`.
  - `status = IN_TRANSIT`.
  - `estimatedDelivery = current date + 3 days`.
- Admin update `SHIPPING -> DELIVERED`:
  - shipment sang `DELIVERED`.
  - set `actualDelivery`.
  - set `orders.actual_delivery_date = current date`.
- Them error code:
  - `SHIPMENT_NOT_FOUND`
- Tao FE contract:
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
- Cap nhat docs:
  - `be/docs/B2C_API.md`
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 13 tests, 0 failures, 0 errors.
- Flyway da apply version `8 - shipments`.
- Test da assert shipment `IN_TRANSIT` sau shipping va `DELIVERED` sau delivered.

### Done - 2026-05-14

Customer payment list/detail da xong.

Da implement:

- DTO:
  - `CustomerPaymentDto`
- Controller:
  - `PaymentController`
- Endpoints:
  - `GET /api/v1/payments`
  - `GET /api/v1/payments/{id}`
- List payments:
  - scope theo dev user `X-User-Id`.
  - pagination `page/pageSize`, max 100.
  - filter `status`.
  - search theo `orderNumber`.
  - sort `createdAt DESC`.
- Detail payment:
  - tra payment theo id.
  - neu payment ton tai nhung khong thuoc current user, tra `PAYMENT_ACCESS_DENIED`.
- Them error code:
  - `PAYMENT_ACCESS_DENIED`
- Cap nhat docs:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 13 tests, 0 failures, 0 errors.
- Test da assert list/detail payment va ownership forbidden.

### Done - 2026-05-14

Purchase flow read endpoints da xong cho payment/invoice/shipment.

Da implement:

- Admin payment endpoints:
  - `GET /api/v1/admin/payments`
  - `GET /api/v1/admin/payments/{id}`
- Customer invoice endpoints:
  - `GET /api/v1/invoices`
  - `GET /api/v1/invoices/{id}`
- Customer shipment endpoints:
  - `GET /api/v1/shipments`
  - `GET /api/v1/shipments/{id}`
- Filters:
  - payment status/method/search.
  - invoice status/search.
  - shipment status/search.
- Ownership guard tam thoi bang `X-User-Id`:
  - `INVOICE_ACCESS_DENIED`
  - `SHIPMENT_ACCESS_DENIED`
- Them controllers:
  - `InvoiceController`
  - `ShipmentController`
- Cap nhat docs:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 13 tests, 0 failures, 0 errors.
- Test da assert admin payment list/detail, invoice list/detail, shipment list/detail.

### Done - 2026-05-14

Admin order notes va payment overdue/refund da xong.

Da implement:

- Admin order notes:
  - `PATCH /api/v1/admin/orders/{id}/notes`
  - request `notes`, required, max 1000 chars.
  - overwrite `orders.internal_notes`.
  - customer order detail khong expose `internalNotes`.
- Payment overdue/refund migration:
  - `V9__payment_overdue_refund.sql`
  - add payment status `OVERDUE`.
  - add columns `refund_amount`, `refund_reason`, `refund_method`, `refunded_at`.
- Admin payment endpoints:
  - `PATCH /api/v1/admin/payments/{id}/mark-overdue`
  - `POST /api/v1/admin/payments/{id}/refund`
- Refund side effects:
  - `payments.status = REFUNDED`.
  - set refund metadata.
  - `orders.payment_status = REFUNDED`.
- Them error codes:
  - `PAYMENT_NOT_PAID`
  - `REFUND_AMOUNT_EXCEEDS_PAID`
- Cap nhat docs:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 13 tests, 0 failures, 0 errors.
- Flyway da apply version `9 - payment overdue refund`.
- Test da assert internal notes chi admin thay, mark-overdue, mark-paid tu overdue, refund va order paymentStatus `REFUNDED`.

### In Progress / Next

### Done - 2026-05-14

Invoice PDF download placeholder da xong.

Da implement:

- Endpoint:
  - `GET /api/v1/invoices/{id}/download`
- Response:
  - binary PDF, khong phai `ApiResponse`.
  - `Content-Type: application/pdf`.
  - `Content-Disposition: attachment; filename="{invoiceNumber}.pdf"`.
- Ownership:
  - scope theo dev user `X-User-Id`.
  - neu invoice khong thuoc user hien tai, tra `INVOICE_ACCESS_DENIED`.
- PDF rendering:
  - sinh PDF toi thieu truc tiep tu metadata invoice.
  - sau nay co the thay bang template/iText/Jasper ma khong doi endpoint.
- Cap nhat docs:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 13 tests, 0 failures, 0 errors.
- Test da assert PDF download tra `application/pdf`, filename `.pdf`, va byte dau `%PDF`.

### In Progress / Next

### Done - 2026-05-15

P0 admin invoices va admin shipments trong `FE_ADMIN_BACKEND_GAPS.md` da xong.

Da implement:

- Admin invoice endpoints:
  - `GET /api/v1/admin/invoices`
  - `GET /api/v1/admin/invoices/{id}`
  - `GET /api/v1/admin/invoices/{id}/download`
  - `PATCH /api/v1/admin/invoices/{id}/status`
- Admin shipment endpoints:
  - `GET /api/v1/admin/shipments`
  - `GET /api/v1/admin/shipments/{id}`
  - `POST /api/v1/admin/shipments`
  - `PATCH /api/v1/admin/shipments/{id}`
  - `PATCH /api/v1/admin/shipments/{id}/status`
- Admin invoice filters:
  - `status`
  - `search` by invoice number, order number, customer name, customer phone.
- Admin shipment filters:
  - `status`
  - `search` by order number, tracking number, customer name, customer phone.
- Shipment state rule:
  - `AWAITING_PICKUP -> IN_TRANSIT`
  - `IN_TRANSIT -> DELIVERED`
  - `IN_TRANSIT -> FAILED`
- Manual shipment create/update:
  - Tao shipment thu cong cho order `CONFIRMED` hoac `SHIPPING`.
  - Cap nhat `trackingNumber`, `carrierName`, `estimatedDelivery`.
  - Neu order da `SHIPPING`, shipment tao moi mac dinh `IN_TRANSIT`; neu order `CONFIRMED`, mac dinh `AWAITING_PICKUP`.
- Shipment delivered side effect:
  - neu shipment sang `DELIVERED` va order dang `SHIPPING`, backend set order `DELIVERED`.
  - COD payment/invoice side effects duoc dong bo nhu admin order `SHIPPING -> DELIVERED`.
- Cap nhat:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 15 tests, 0 failures, 0 errors.
- Test da assert admin invoice list/detail/download va admin shipment list/detail/create/tracking/status.

### In Progress / Next

### Done - 2026-05-15

P1 admin dashboard minimum trong `FE_ADMIN_BACKEND_GAPS.md` da xong.

Da implement:

- `GET /api/v1/admin/dashboard/stats`
- `GET /api/v1/admin/dashboard/revenue-chart?period=day|week|month&from=&to=`
- `GET /api/v1/admin/dashboard/recent-orders?limit=`
- `GET /api/v1/admin/dashboard/recent-activity?limit=`
- Response stats gom:
  - total revenue.
  - total orders.
  - pending/delivered/cancelled orders.
  - unpaid/overdue payment count.
  - low-stock variant count theo `stock <= min_stock`.
- Recent activity tam thoi lay tu `order_status_history`.
- Cap nhat:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 15 tests, 0 failures, 0 errors.

### In Progress / Next

### Done - 2026-05-16

Hoan thanh cac gap con lai trong `FE_ADMIN_BACKEND_GAPS.md` de FE admin ghep tiep.

Da implement:

- Flyway migration `V13__admin_inventory_promotions_after_sales_settings.sql`.
- Catalog enum cleanup:
  - `product_status` them `INACTIVE`.
  - `product_condition` them `REFURBISHED`.
- Admin inventory:
  - `GET /api/v1/admin/inventory`
  - `GET /api/v1/admin/inventory/{id}`
  - `PATCH /api/v1/admin/inventory/{id}/adjust`
  - `GET /api/v1/admin/inventory/low-stock`
  - `GET /api/v1/admin/inventory/{productId}/movements`
  - per-variant `min_stock`, `imei_serials`, `stock_movements` audit.
- Admin promotions CRUD:
  - `GET /api/v1/admin/promotions`
  - `POST /api/v1/admin/promotions`
  - `GET /api/v1/admin/promotions/{id}`
  - `PATCH /api/v1/admin/promotions/{id}`
  - `PATCH /api/v1/admin/promotions/{id}/toggle`
  - `DELETE /api/v1/admin/promotions/{id}`
  - seed total 10 promotions for admin QA.
- After-sales admin:
  - returns list/detail/status/dispute resolution.
  - warranty claims list/detail/status.
  - reviews list/approve/hide/delete.
- Admin reports:
  - revenue, products, customers, inventory, returns, CSV export.
- Admin settings/content:
  - settings get/patch.
  - banners CRUD.
  - email templates CRUD/preview.
  - SEO get/update.
  - branches CRUD.
  - staff create/update/deactivate.
  - activity logs list/stats.
- Admin trade-in:
  - `GET /api/v1/admin/trade-in`
  - `GET /api/v1/admin/trade-in/{id}`
  - `PATCH /api/v1/admin/trade-in/{id}/valuate`
  - `PATCH /api/v1/admin/trade-in/{id}/complete`
  - `PATCH /api/v1/admin/trade-in/{id}/status`
- QA seed:
  - Flyway `V14__admin_qa_data_trade_in.sql`.
  - At least 10 admin payments, invoices, shipments, returns, warranty claims, reviews, and trade-in rows.
- Cap nhat docs:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`
  - `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed.
- Test suite hien co: 15 tests, 0 failures, 0 errors.
- Flyway da apply version `14 - admin qa data trade in`.

### In Progress / Next

Nen lam tiep theo sau khi FE ghep admin:

1. Security/RBAC/ownership that cho admin/customer.
2. Payment gateway callback that cho MOMO/VNPAY.
3. Nang reports/settings tu contract toi thieu len production-grade neu FE can them field.

### Deferred

- Security/RBAC/ownership: tam bo qua theo yeu cau hien tai.
- Payment gateway that.
- Loyalty.

## Rule Going Forward

Sau moi lan xong mot module:

- Cap nhat `be/docs/PROGRESS.md`.
- Cap nhat contract FE tuong ung trong `be/docs`.
- Cap nhat plan tong trong `be/docs/BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md`.
- Chi ghi endpoint backend da implement that, khong ghi mock endpoint thanh contract moi.
