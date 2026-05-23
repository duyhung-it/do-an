# Backend Implementation Plan From BA Docs

Nguon phan tich:

- `B2B eCommerce Platform Plan/ba-docs/00-tong-quan.md`
- `B2B eCommerce Platform Plan/ba-docs/01-domain-entities.md`
- `B2B eCommerce Platform Plan/ba-docs/02-database-design.md`
- `B2B eCommerce Platform Plan/ba-docs/03-api-auth-users.md`
- `B2B eCommerce Platform Plan/ba-docs/04-api-catalog.md`
- `B2B eCommerce Platform Plan/ba-docs/05-api-orders.md`
- `B2B eCommerce Platform Plan/ba-docs/06-api-payments-invoices.md`
- `B2B eCommerce Platform Plan/ba-docs/07-api-after-sales.md`
- `B2B eCommerce Platform Plan/ba-docs/08-api-loyalty-notifications.md`
- `B2B eCommerce Platform Plan/ba-docs/09-api-admin.md`
- `B2B eCommerce Platform Plan/ba-docs/10-business-rules.md`
- `B2B eCommerce Platform Plan/ba-docs/11-rbac-security.md`
- `B2B eCommerce Platform Plan/ba-docs/12-error-codes.md`
- `B2B eCommerce Platform Plan/ba-docs/refactor-plan-b2b-to-phone-store.md`

## 1. Ket luan chinh

Cap nhat 2026-05-20:

- Core B2C flow, cac gap FE admin trong `be/docs/FE_ADMIN_BACKEND_GAPS.md`, customer after-sales flow trong `07-api-after-sales.md`, loyalty/notifications flow trong `08-api-loyalty-notifications.md`, admin BA completion, va local payment gateway bridge da duoc implement den Flyway target version `22`.
- Customer notifications da bo sung: inbox, unread count, mark read/read-all, delete, notification preferences.
- Payment gateway bridge da bo sung cho `MOMO`/`VNPAY`: tao session, local return URL, callback idempotent, dong bo payment/order/invoice paid side effects.
- Automatic notification side effects da bo sung cho order/payment/loyalty/return/warranty/trade-in core events.
- Automatic warranty item creation da bo sung khi order delivered, tao warranty item theo tung purchased unit.
- Loyalty reverse points da bo sung cho payment refund va return refunded, dung transaction `EXPIRE` am diem va idempotent theo order.
- Admin BA completion trong `09-api-admin.md` da duoc bo sung: admin users, notifications send/broadcast, suppliers, installment plans, warranty master, invoice manual ops, combos, blog, review reply/status, settings path aliases, shipment tracking alias.
- FE nen ghep admin theo:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`
  - `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
- FE nen ghep after-sales customer theo:
  - `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`
- FE nen ghep loyalty theo:
  - `be/docs/FE_LOYALTY_CONTRACT.md`
- FE nen ghep payment/invoice/gateway theo:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- Con deferred that su: Security/RBAC, real MOMO/VNPAY credentials/signature hardening.

Backend can refactor theo huong **CELLPHONES B2C phone-store**, khong tiep tuc B2B marketplace/supplier portal. He thong co 3 vai tro chinh: `CUSTOMER`, `ADMIN`, `STAFF`.

Quyet dinh chot:

- **Chi lay `B2B eCommerce Platform Plan/ba-docs` lam source of truth.**
- Khong can doi chieu hoac follow cac tai lieu legacy trong `B2B eCommerce Platform Plan/docs`.
- Khong follow cac contract B2B/Seller/RFQ/Contract/Supplier Portal cu neu trai voi `ba-docs`.
- Backend uu tien dung URL, DTO, response shape, error code, RBAC, database design va business rules trong `ba-docs`.
- Neu FE hien tai con service/mock cu, FE phai dieu chinh theo BA docs; BE khong thiet ke nguoc theo mock cu.

Trang thai hien tai cua `be`:

- Spring Boot scaffold dang dung Java 21, Spring Web, Validation, JPA, Flyway.
- Dang cau hinh MySQL va migration `V1__init_core_schema.sql` van mang dau vet B2B supplier.
- `StoreApiController` tra ve `Map<String,Object>` tu in-memory `StoreDataService`, phu hop demo FE tam thoi nhung chua dat yeu cau BA.
- Chua co Spring Security/JWT/refresh token/RBAC.
- Response hien tai dat pagination fields ngang hang voi `data`, trong khi BA yeu cau `pagination` object rieng.
- Route admin hien tai nhieu endpoint chua co prefix `/admin/*`, vi du `POST /categories` thay vi `POST /admin/categories`.

Muc tieu BE dung theo BA:

- Base URL: `/api/v1`.
- Success response:

```json
{
  "success": true,
  "data": {},
  "message": "Thao tac thanh cong"
}
```

- Paginated response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

- Error response:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Khong tim thay san pham",
    "details": {}
  }
}
```

## 2. Kien truc backend can chot

De dam bao dung BA va ket noi FE on dinh, nen chuyen sang kien truc module ro rang:

```text
com.b2b.ecommerce
  common
    api, error, pagination, audit
  security
    jwt, filter, rbac, rate-limit
  auth
  users
  catalog
  cart
  orders
  payments
  invoices
  shipments
  promotions
  reviews
  wishlist
  aftersales
    returns, warranty, tradein, imei
  loyalty
  notifications
  admin
    dashboard, reports, staff, branches, settings, activity
  content
    blog, banners, email-templates
  inventory
  files
```

Moi module nen co:

- `controller`: chi nhan request, map response, auth annotation.
- `service`: business rules, state machine, side effects.
- `repository`: Spring Data JPA.
- `entity`: JPA entity.
- `dto/request/response`: contract voi FE, khong tra entity truc tiep.
- `mapper`: map entity <-> DTO.

## 3. Database plan

BA docs yeu cau PostgreSQL 15+. Can quyet dinh 1 trong 2 huong:

1. Khuyen nghi: doi `docker-compose.yml`, `pom.xml`, `application.properties`, Flyway sang PostgreSQL de khop `02-database-design.md`.
2. Neu bat buoc giu MySQL: phai convert toan bo enum, JSONB, trigger/sequence va kieu du lieu tu PostgreSQL sang MySQL, chap nhan lech voi BA.

Khuyen nghi dung PostgreSQL de tranh sai spec.

Migration can lam theo thu tu:

1. Drop/replace schema B2B cu trong migration moi neu moi truong dev cho phep rebuild DB.
2. Tao enums:
   `user_role`, `user_status`, `gender_type`, `address_type`, `product_status`, `product_condition`, `order_status`, `payment_method`, `payment_status`, `invoice_status`, `shipment_status`, `return_status`, `warranty_status`, `claim_status`, `trade_in_status`, `discount_type`, `review_status`, `loyalty_tier`, `notification_type`, `activity_action`, `inventory_status`, `staff_position`, `banner_type`.
3. Tao tables cot loi:
   `users`, `shipping_addresses`, `categories`, `products`, `product_variants`, `product_images`, `phone_specs`, `cart_items`, `orders`, `order_items`, `order_status_history`.
4. Tao commerce tables:
   `promotions`, `payments`, `invoices`, `shipments`, `inventory_items`, `reviews`, `wishlist_items`.
5. Tao after-sales:
   `return_requests`, `return_items`, `warranty_items`, `warranty_claims`, `trade_in_requests`.
6. Tao value-add/admin:
   `loyalty_programs`, `loyalty_transactions`, `loyalty_rewards`, `app_notifications`, `activity_logs`, `branches`, `staff_members`, `blog_posts`, `installment_plans`, `system_config`, `banner_configs`, `email_templates`.
7. Them sequence/generator cho:
   `orderNumber = CP + yyyyMMdd + 5-digit daily sequence`, `invoiceNumber = INV-yyyy-6-digit sequence`.
8. Seed data toi thieu de FE co the chay:
   admin account, staff account, customer demo, category phone/accessory, products, variants, inventory, promotions, settings.

## 4. Cross-cutting tasks bat buoc

### 4.1 API response va error

Lam truoc vi FE se phu thuoc vao shape nay.

- Sua `ApiResponse` thanh co `message` va `pagination` object.
- Tao `PaginationResponse`.
- Tao `ErrorCode enum` theo `12-error-codes.md`.
- Tao `AppException`.
- Sua `GlobalExceptionHandler` map dung HTTP status:
  `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`.
- Validation error phai tra field errors trong `details`.

### 4.2 Security/RBAC

- Them `spring-boot-starter-security`, OAuth2 resource server hoac jose JWT.
- Password hash bang BCrypt.
- JWT access token RS256, payload co `userId`, `email`, `role`.
- Access token 1h, refresh token 7d.
- Luu refresh token hash/rotation de logout va revoke duoc.
- Public endpoints: auth register/login/refresh, catalog public, blog public, stores public, IMEI check neu BA cho phep public.
- Customer chi duoc xem/sua tai nguyen cua chinh minh.
- Admin full management.
- Staff theo permission matrix trong `11-rbac-security.md`.
- CORS cho FE dev origin.
- Rate limit cac nhom endpoint auth/public/customer/admin.

### 4.3 Transaction va side effects

Tat ca flow order/payment/return/warranty/loyalty/inventory phai chay trong transaction service layer:

- Tao order: validate cart, tinh total server-side, tao payment, ghi status history, notification, activity log.
- Confirm order: check stock, reserve stock, notification warehouse/customer.
- Shipping: tao invoice, shipment, tracking notification.
- Delivered: set delivery date, mark COD payment paid, mark invoice paid, cong loyalty, tao warranty item.
- Cancelled: release stock neu da confirm, refund neu da paid, cancel invoice, notification.
- Return refunded: restore stock, refund payment, tru loyalty, order status returned.

## 5. API backlog theo module

### Phase 1 - Contract foundation va auth

Muc tieu: FE co login/register/me/profile/address va co response/error chuan.

Endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /users/me`
- `PATCH /users/me`
- `POST /users/me/avatar`
- `GET /users/me/addresses`
- `POST /users/me/addresses`
- `GET /users/me/addresses/:id`
- `PATCH /users/me/addresses/:id`
- `DELETE /users/me/addresses/:id`
- `PATCH /users/me/addresses/:id/set-default`
- `GET /users/me/stats`
- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `PATCH /admin/users/:id/status`
- `DELETE /admin/users/:id`

BE tasks:

- Implement `User`, `ShippingAddress`, auth DTOs.
- Unique email, password policy, Vietnamese phone validation.
- Row-level ownership for `/users/me/*`.
- Admin soft delete/lock user.

### Phase 2 - Catalog storefront va admin product

Muc tieu: FE co home/category/product detail/search/filter de bo mock data.

Endpoints:

- `GET /categories`
- `GET /categories/:id`
- `GET /categories/:slug/by-slug`
- `POST /admin/categories`
- `PATCH /admin/categories/:id`
- `DELETE /admin/categories/:id`
- `GET /products`
- `GET /products/:id`
- `GET /products/:slug/by-slug`
- `GET /products/:id/similar`
- `GET /products/:id/accessories`
- `GET /products/featured`
- `GET /products/hot`
- `GET /products/new`
- `GET /products/brands`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `DELETE /admin/products/:id`
- `GET /products/:productId/variants`
- `POST /admin/products/:productId/variants`
- `PATCH /admin/products/:productId/variants/:id`
- `DELETE /admin/products/:productId/variants/:id`
- `GET /products/:productId/images`
- `POST /admin/products/:productId/images`
- `PATCH /admin/products/:productId/images/:id`
- `DELETE /admin/products/:productId/images/:id`
- `PATCH /admin/products/:productId/images/reorder`
- `GET /combos`
- `GET /combos/:id`
- `GET /products/:productId/combos`
- `POST /admin/combos`
- `PATCH /admin/combos/:id`
- `DELETE /admin/combos/:id`
- `GET /blog`
- `GET /blog/:slug`
- `GET /blog/categories`
- `POST /admin/blog`
- `PATCH /admin/blog/:id`
- `DELETE /admin/blog/:id`
- `GET /stores`
- `GET /stores/:id`
- `GET /stores/:id/availability`

BE tasks:

- Product search/filter/sort: category, brand, price, ram, storage, condition, flags.
- Product detail include variants, images, specs, rating, stock status.
- Slug unique.
- Product validation: name 10-500 chars, price > 0, originalPrice >= price, warrantyMonths 1-120, at least 1 variant.
- Admin routes phai dung `/admin/*`.

### Phase 3 - Cart, promotion, order, installment

Muc tieu: FE checkout hoat dong thuc te.

Endpoints:

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`
- `DELETE /cart`
- `POST /cart/validate`
- `GET /promotions`
- `POST /promotions/validate`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `DELETE /orders/:id/cancel`
- `GET /orders/:id/invoice`
- `GET /admin/orders`
- `GET /admin/orders/:id`
- `PATCH /admin/orders/:id/status`
- `PATCH /admin/orders/:id/notes`
- `GET /installment-plans`
- `POST /installment-plans/calculate`

Business rules:

- Cart merge item trung `(userId, productId, variantId)`.
- Gio hang toi da 50 item.
- Checkout validate product/variant active, stock, price current.
- Server tinh `subtotal + shippingFee - discount`, khong trust client total.
- Chi 1 promotion/order.
- Order status flow: `PENDING -> CONFIRMED -> SHIPPING -> DELIVERED`, cancel chi khi `PENDING` hoac `CONFIRMED`.

### Phase 4 - Payments, invoices, shipments, inventory

Muc tieu: Admin van hanh don hang, FE xem thanh toan/hoa don/van chuyen.

Endpoints:

- `GET /payments`
- `GET /payments/{id}`
- `GET /invoices`
- `GET /invoices/{id}`
- `GET /invoices/{id}/download`
- `GET /shipments`
- `GET /shipments/{id}`
- `GET /orders/{orderId}/shipment`
- `GET /admin/payments`
- `GET /admin/payments/{id}`
- `PATCH /admin/payments/{id}/mark-paid`
- `PATCH /admin/payments/{id}/mark-overdue`
- `POST /admin/payments/{id}/refund`
- `GET /admin/invoices`
- `GET /admin/invoices/{id}`
- `POST /admin/invoices`
- `PATCH /admin/invoices/{id}/status`
- `DELETE /admin/invoices/{id}`
- `GET /admin/shipments`
- `GET /admin/shipments/{id}`
- `POST /admin/shipments`
- `PATCH /admin/shipments/{id}/status`
- `PATCH /admin/shipments/{id}/tracking`
- `GET /admin/inventory`
- `GET /admin/inventory/{id}`
- `PATCH /admin/inventory/{id}/adjust`
- `GET /admin/inventory/low-stock`
- `GET /admin/inventory/{productId}/movements`

BE tasks:

- Payment due date = order created + config `payment_due_days`.
- Invoice auto-create khi order sang `SHIPPING`.
- Low-stock alert khi stock <= minStock.
- Stock movement/audit khi dieu chinh inventory.

### Phase 5 - Reviews, wishlist, after-sales

Muc tieu: Hoan thien trai nghiem sau mua.

Endpoints:

- `GET /products/:productId/reviews`
- `GET /products/:productId/reviews/stats`
- `POST /products/:productId/reviews`
- `PATCH /reviews/:id/helpful`
- `GET /users/me/reviews`
- `GET /admin/reviews`
- `PATCH /admin/reviews/:id/status`
- `DELETE /admin/reviews/:id`
- `POST /admin/reviews/:id/reply`
- `GET /users/me/wishlist`
- `POST /users/me/wishlist`
- `DELETE /users/me/wishlist/:productId`
- `DELETE /users/me/wishlist`
- `PATCH /users/me/wishlist/:productId/price-alert`
- `POST /returns`
- `GET /returns`
- `GET /returns/:id`
- `GET /admin/returns`
- `GET /admin/returns/:id`
- `PATCH /admin/returns/:id/status`
- `GET /warranty`
- `GET /warranty/:id`
- `GET /warranty-claims`
- `POST /warranty-claims`
- `GET /warranty-claims/:id`
- `GET /admin/warranty`
- `POST /admin/warranty`
- `GET /admin/warranty-claims`
- `PATCH /admin/warranty-claims/:id/status`
- `GET /trade-in/estimate`
- `POST /trade-in`
- `GET /trade-in`
- `GET /trade-in/:id`
- `PATCH /trade-in/:id/accept`
- `PATCH /trade-in/:id/reject`
- `GET /admin/trade-in`
- `GET /admin/trade-in/:id`
- `PATCH /admin/trade-in/:id/valuate`
- `PATCH /admin/trade-in/:id/complete`
- `POST /imei/check`

Business rules:

- Review chi khi da mua va order `DELIVERED`, moi order/product chi review 1 lan.
- Review moi tao `PENDING`; chi `VISIBLE` moi tinh rating.
- Return window = delivery date + config `return_window_days`, default 7.
- Refund amount dung gia mua trong `order_item`, khong dung gia hien tai.
- Warranty expiry = actual delivery date + product warranty months.
- Trade-in estimate = baseValue * storageMultiplier * conditionMultiplier, round ve 500,000 VND gan nhat.

### Phase 6 - Loyalty, notifications, admin operations

Muc tieu: Hoan thien gia tri cong them va admin portal.

Endpoints:

- `GET /loyalty/me`
- `GET /loyalty/me/transactions`
- `GET /loyalty/me/stats`
- `GET /loyalty/rewards`
- `POST /loyalty/rewards/:id/redeem`
- `GET /admin/loyalty`
- `GET /admin/loyalty/:customerId`
- `POST /admin/loyalty/bonus-points`
- `GET /admin/loyalty/rewards`
- `POST /admin/loyalty/rewards`
- `PATCH /admin/loyalty/rewards/:id`
- `DELETE /admin/loyalty/rewards/:id`
- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `DELETE /notifications/:id`
- `DELETE /notifications`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `POST /admin/notifications/broadcast`
- `POST /admin/notifications/send-to-user`
- `GET /admin/suppliers`
- `POST /admin/suppliers`
- `PATCH /admin/suppliers/:id`
- `GET /admin/installment-plans`
- `POST /admin/installment-plans`
- `PATCH /admin/installment-plans/:id`
- `DELETE /admin/installment-plans/:id`
- `GET /admin/dashboard/stats`
- `GET /admin/dashboard/revenue-chart`
- `GET /admin/dashboard/recent-orders`
- `GET /admin/dashboard/recent-activity`
- `GET /admin/reports/revenue`
- `GET /admin/reports/products`
- `GET /admin/reports/customers`
- `GET /admin/reports/inventory`
- `GET /admin/reports/returns`
- `GET /admin/reports/export`
- `GET /admin/staff`
- `GET /admin/staff/:id`
- `POST /admin/staff`
- `PATCH /admin/staff/:id`
- `PATCH /admin/staff/:id/deactivate`
- `GET /admin/branches`
- `POST /admin/branches`
- `PATCH /admin/branches/:id`
- `PATCH /admin/branches/:id/toggle`
- `GET /admin/settings`
- `PATCH /admin/settings`
- `GET /admin/settings/banners`
- `POST /admin/settings/banners`
- `PATCH /admin/settings/banners/:id`
- `DELETE /admin/settings/banners/:id`
- `GET /admin/settings/email-templates`
- `POST /admin/settings/email-templates`
- `PATCH /admin/settings/email-templates/:id`
- `POST /admin/settings/email-templates/:id/preview`
- `DELETE /admin/settings/email-templates/:id`
- `GET /admin/settings/seo`
- `PATCH /admin/settings/seo`
- `GET /admin/activity-logs`
- `GET /admin/activity-logs/stats`
- `GET /admin/promotions`
- `POST /admin/promotions`
- `PATCH /admin/promotions/:id`
- `PATCH /admin/promotions/:id/toggle`
- `DELETE /admin/promotions/:id`

Business rules:

- Loyalty earn khi order `DELIVERED`: `floor(totalAmount / 100000) * pointsPerUnit`.
- 1 diem = 100 VND khi redeem.
- Tier dua tren lifetime earned, khong dua tren balance hien tai.
- Notifications tao tu side effects cua order/return/warranty/promotion.

## 6. Viec can sua ngay trong code hien tai

1. Doi ten/huong docs va package neu co the: project dang ten `b2b-ecommerce-api` nhung BA da chot B2C Cellphones. Co the giu package tam thoi, nhung API/domain phai theo B2C.
2. Bo dan `StoreDataService` in-memory. Chi giu lai lam seed/reference neu can.
3. Tach `StoreApiController` thanh controllers theo module.
4. Sua route admin:
   - `POST /categories` -> `POST /admin/categories`
   - `PUT /categories/{id}` -> `PATCH /admin/categories/:id`
   - `POST /products` -> `POST /admin/products`
   - `PUT /products/{id}` -> `PATCH /admin/products/:id`
   - `GET /users` -> `GET /admin/users`
5. Sua cart route:
   - `POST /cart` -> `POST /cart/items`
   - `PATCH /cart/{id}` -> `PATCH /cart/items/:id`
   - `DELETE /cart/{id}` -> `DELETE /cart/items/:id`
6. Sua wishlist route:
   - `/wishlist/{userId}` -> `/users/me/wishlist`
7. Them DTO typed thay vi `Map<String,Object>`.
8. Them OpenAPI/Swagger de FE verify contract nhanh.

## 7. Definition of Done cho tung module

Mot module chi xem la xong khi co du:

- Flyway migration/table/index/FK/enum.
- JPA entity va repository.
- Request/response DTO dung field camelCase trong BA docs.
- Controller dung path/method/status code.
- Service enforce business rules.
- RBAC/ownership check.
- Error code dung `12-error-codes.md`.
- Unit test cho service rule quan trong.
- Integration test cho controller happy path va error path.
- Seed data neu FE can hien thi.
- Swagger tag va example response.

## 8. Thu tu trien khai khuyen nghi

1. Foundation: PostgreSQL, response/error, pagination, global exception, OpenAPI.
2. Catalog: categories/products/variants/images/specs + seed data.
3. Cart/order/promotion checkout.
4. Inventory/payment/invoice/shipment side effects.
5. Auth/security/RBAC khi bat dau can user ownership that.
6. Reviews/wishlist.
7. Returns/warranty/trade-in/IMEI.
8. Loyalty/notifications.
9. Admin dashboard/reports/settings/staff/branches/content.
10. Hardening: rate limit, audit logs, file storage, scheduled jobs, integration tests, FE contract test.

Ghi chu uu tien hien tai: theo yeu cau moi, tam thoi bo qua security va tap trung cac luong chinh cua mo hinh B2C. Thu tu tren duoc dieu chinh de FE co the ghep storefront -> cart -> checkout som nhat.

## 9. Rui ro can canh bao

- Neu giu MySQL trong khi BA yeu cau PostgreSQL, migration va query co nguy co lech lon.
- Neu tiep tuc tra `Map<String,Object>`, FE se gap bug runtime va kho maintain.
- Neu order side effects khong transaction, stock/payment/loyalty se de bi sai du lieu.
- Neu khong lam RBAC/ownership tu dau, cac endpoint `/users/me`, `/orders`, `/payments`, `/returns` de lo du lieu user khac.
- Neu response shape khong chot som, FE service layer se phai sua nhieu lan.

## 10. Progress log

### 2026-05-14 - Catalog foundation

Scope da lam:

- Chuyen database runtime tu MySQL sang PostgreSQL 15.
- Cap nhat Flyway migration `V1__init_core_schema.sql` cho catalog B2C: categories, products, product variants, product images, phone specs.
- Them enum PostgreSQL cho `product_status` va `product_condition`.
- Them seed data toi thieu de FE hien thi home/listing/detail: 4 categories, 3 products, 4 variants, 4 images, 2 phone specs.
- Chuyen catalog tu in-memory/mock sang JPA entity/repository/service.
- Them public catalog endpoints:
  - `GET /categories`
  - `GET /categories/{id}`
  - `GET /categories/{slug}/by-slug`
  - `GET /products`
  - `GET /products/{id}`
  - `GET /products/{slug}/by-slug`
  - `GET /products/{id}/similar`
  - `GET /products/{id}/accessories`
  - `GET /products/featured`
  - `GET /products/hot`
  - `GET /products/new`
  - `GET /products/brands`
  - `GET /products/{productId}/variants`
  - `GET /products/{productId}/images`
- Them admin catalog endpoints:
  - `POST /admin/categories`
  - `PATCH /admin/categories/{id}`
  - `DELETE /admin/categories/{id}`
  - `POST /admin/products`
  - `PATCH /admin/products/{id}`
  - `DELETE /admin/products/{id}`
  - `POST /admin/products/{productId}/variants`
  - `PATCH /admin/products/{productId}/variants/{id}`
  - `DELETE /admin/products/{productId}/variants/{id}`
  - `POST /admin/products/{productId}/images`
  - `PATCH /admin/products/{productId}/images/{id}`
  - `DELETE /admin/products/{productId}/images/{id}`
- Chuan hoa response shape co `data`, `success`, `message`, `pagination`, `error`.
- Doi legacy mock route sang `/api/v1/mock/*`.
- Them MockMvc integration test cho categories va products.
- Tao tai lieu FE contract: `be/docs/FE_CATALOG_CONTRACT.md`.

Verify da chay:

- `docker compose up -d postgres`
- `mvn test`
- PostgreSQL query xac nhan seed va Flyway:
  - `categories = 4`
  - `products = 3`
  - `flyway_schema_history.version = 1`

Tam thoi chua lam:

- Security/RBAC/ownership, theo dung yeu cau tam bo qua.
- Product image reorder endpoint.
- Combo/blog/store availability trong catalog expanded scope.

Next recommended step:

1. Lam cart module that: `cart_items`, add/update/delete/validate cart.
2. Lam promotion validation toi thieu de ghep checkout.
3. Lam order creation transaction dau tien, chua can payment gateway that.

### 2026-05-14 - Foundation error handling va OpenAPI

Scope da lam:

- Them `ErrorCode` enum theo nhom code trong `12-error-codes.md`.
- Them `AppException` cho service layer.
- Nang cap `GlobalExceptionHandler` de response loi dung shape BA:
  - `success = false`
  - `error.code`
  - `error.message`
  - `error.details`
- Validation request body tra `400 VALIDATION_ERROR` kem field details.
- Invalid JSON, invalid path/query type, data conflict va unexpected error deu co handler rieng.
- Catalog not found da map sang code cu the:
  - `PRODUCT_NOT_FOUND`
  - `PRODUCT_VARIANT_NOT_FOUND`
- Them Springdoc OpenAPI cho Spring Boot 4:
  - `GET /v3/api-docs`
  - `GET /swagger-ui.html`

Verify da chay:

- `mvn test`
- Test suite: 5 tests, 0 failures, 0 errors.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Customer order list/detail

Scope da lam:

- Them endpoints:
  - `GET /api/v1/orders`
  - `GET /api/v1/orders/{id}`
- Implement list order theo BA:
  - Chi tra order cua current customer.
  - Sort `createdAt DESC`.
  - Pagination.
  - Filter `status`.
  - Search theo `orderNumber`.
  - Summary item count + first item preview.
- Implement detail order theo BA:
  - Chi tra order cua current customer.
  - Tra full items va status history.
  - Status history sort `changedAt ASC`.
  - `internalNotes` khong expose cho customer.
- Cap nhat FE order contract va BA mapping.

Verify da chay:

- `mvn test`
- Test suite: 9 tests, 0 failures, 0 errors.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Customer order cancel flow

Scope da lam:

- Them endpoint:
  - `DELETE /api/v1/orders/{id}/cancel`
- Implement cancel rules theo BA:
  - Chi current customer duoc huy order cua chinh minh.
  - Chi cho huy order o trang thai `PENDING` hoac `CONFIRMED`.
  - Cap nhat order sang `CANCELLED`.
  - Luu `cancelReason` va `cancelledAt`.
  - Ghi them `order_status_history` tu status cu sang `CANCELLED`.
  - Giam `promotions.used_count` neu order co dung promotion.
- Cap nhat FE contract:
  - `be/docs/FE_ORDER_CONTRACT.md`
- Cap nhat BA mapping:
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Ghi chu:

- Sau module stock reservation, cancel tu `CONFIRMED` da release reserved stock. Cancel tu `PENDING` khong doi stock vi chua reserve.

Verify da chay:

- `mvn test`
- Test suite: 10 tests, 0 failures, 0 errors.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Admin order operations toi thieu

Scope da lam:

- Them endpoints:
  - `GET /api/v1/admin/orders`
  - `GET /api/v1/admin/orders/{id}`
  - `PATCH /api/v1/admin/orders/{id}/status`
- Implement admin list theo BA:
  - Pagination.
  - Filter `status`.
  - Filter `paymentStatus`.
  - Search case-insensitive theo `orderNumber`, `customerName`, `customerPhone`.
  - Filter `dateFrom/dateTo` theo `createdAt`.
- Implement admin detail theo BA:
  - Xem order bat ky.
  - Include `internalNotes`.
  - Include items va status history.
- Implement status update state machine:
  - `PENDING -> CONFIRMED/CANCELLED`
  - `CONFIRMED -> SHIPPING/CANCELLED`
  - `SHIPPING -> DELIVERED`
  - `DELIVERED -> RETURNED`
  - `CANCELLED/RETURNED` khong cho chuyen tiep.
- Ghi `order_status_history` khi admin update status.
- Neu admin chuyen sang `CANCELLED`, set `cancelReason`, `cancelledAt` va giam promotion usage neu co.
- Tao FE contract:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
- Cap nhat:
  - `be/docs/B2C_API.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Ghi chu:

- Security/RBAC admin dang open theo yeu cau tam bo qua security.
- Chua payment refund/mark-paid, invoice/shipment, notification/loyalty trong status update.

Verify da chay:

- `mvn test`
- Test suite: 11 tests, 0 failures, 0 errors.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Stock reservation side effect

Scope da lam:

- Them migration:
  - `V5__order_stock_reservations.sql`
- Tao table:
  - `order_stock_reservations`
- Khi admin update `PENDING -> CONFIRMED`:
  - Reserve stock theo BA bang cach tru `product_variants.stock` cho tung order item.
  - Tru stock atomic voi dieu kien `stock >= quantity`.
  - Ghi reservation row theo `order_item_id`.
  - Neu khong du stock, tra `ORDER_INSUFFICIENT_STOCK` va rollback transaction.
- Khi order bi cancel tu `CONFIRMED`:
  - Release stock bang cach cong lai `product_variants.stock`.
  - Set `released_at` tren reservation rows.
  - Ap dung cho ca customer cancel va admin cancel.
- Khi cancel tu `PENDING`:
  - Khong doi stock vi chua reserve.
- Cap nhat docs:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_ORDER_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 11 tests, 0 failures, 0 errors.
- Flyway apply den version 5.
- Test da assert stock giam khi confirm va duoc restore khi cancel tu confirmed.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Payment/invoice side effects toi thieu

Scope da lam:

- Them migration:
  - `V6__invoices.sql`
- Tao:
  - enum `invoice_status`
  - table `invoice_daily_sequences`
  - table `invoices`
- Them customer endpoint:
  - `GET /api/v1/orders/{id}/invoice`
- Side effects:
  - Order create tiep tuc tao `payments` row `UNPAID`.
  - Admin update `CONFIRMED -> SHIPPING` tao invoice neu chua co.
  - Invoice number format: `INV-yyyyMMdd-xxx`.
  - Admin update `SHIPPING -> DELIVERED` voi `paymentMethod = COD` mark order/payment/invoice la `PAID`.
  - Cancel order set invoice da tao sang `CANCELLED`.
- Tao FE contract:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- Cap nhat docs:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_ORDER_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Ghi chu:

- MOMO/VNPAY callback chua lam.
- Invoice PDF download chua lam, endpoint hien tra JSON metadata.
- Shipment chua lam.

Verify da chay:

- `mvn test`
- Test suite: 12 tests, 0 failures, 0 errors.
- Flyway apply den version 6.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Admin manual mark-paid cho payment

Scope da lam:

- Them endpoint:
  - `PATCH /api/v1/admin/payments/{id}/mark-paid`
- Implement request:
  - `paidAmount`
  - `transactionRef`
  - `method`
- Implement rules:
  - `paidAmount > 0`.
  - Cong don vao `payments.paid_amount`.
  - Tinh lai `payments.remaining_amount`.
  - `transactionRef` unique bang migration `V7__payment_transaction_ref_unique.sql`.
  - Khi da tra du, set `payments.status = PAID`, `paid_at = now`.
  - Dong bo `orders.payment_status = PAID`.
  - Neu invoice da tao va dang `PENDING`, set `invoices.status = PAID`, `paid_at = now`.
  - Neu payment da `PAID`, tra `PAYMENT_ALREADY_PAID`.
- Them:
  - `AdminPaymentController`
  - `MarkPaymentPaidRequest`
  - `AdminPaymentDto`
- Cap nhat:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.
- Flyway apply den version 7.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Shipment placeholder cho order shipping flow

Scope da lam:

- Them migration:
  - `V8__shipments.sql`
- Tao enum/table:
  - `shipment_status`
  - `shipments`
- Them customer endpoint:
  - `GET /api/v1/orders/{id}/shipment`
- Implement shipment object theo BA:
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
- Implement side effects:
  - `CONFIRMED -> SHIPPING`: tao shipment neu chua co, set `IN_TRANSIT`, tao tracking placeholder `GHTK-{orderNumber}`.
  - `SHIPPING -> DELIVERED`: set shipment `DELIVERED`, set `actualDelivery`, set `orders.actual_delivery_date`.
- Them error code:
  - `SHIPMENT_NOT_FOUND`
- Tao FE contract:
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
- Cap nhat:
  - `be/docs/B2C_API.md`
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.
- Flyway apply den version 8.

Next recommended step:

1. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
2. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.
3. Shipment list/detail endpoints `GET /shipments`, `GET /shipments/{id}` hoac admin shipment endpoints neu FE can man hinh tracking van hanh.

### 2026-05-14 - Customer payment list/detail

Scope da lam:

- Them:
  - `PaymentController`
  - `CustomerPaymentDto`
- Them endpoints theo BA:
  - `GET /api/v1/payments`
  - `GET /api/v1/payments/{id}`
- Implement list payment:
  - scope theo current dev user `X-User-Id`.
  - pagination.
  - filter `status`.
  - search theo `orderNumber`.
  - sort `createdAt DESC`.
- Implement detail payment:
  - payment ton tai nhung khong thuoc user hien tai se tra `PAYMENT_ACCESS_DENIED`.
- Them error code:
  - `PAYMENT_ACCESS_DENIED`
- Cap nhat:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.

Next recommended step:

1. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.
2. Shipment list/detail endpoints `GET /shipments`, `GET /shipments/{id}` hoac admin shipment endpoints neu FE can man hinh tracking van hanh.
3. Invoice list/detail endpoints `GET /invoices`, `GET /invoices/{id}`.

### 2026-05-14 - Hoan thien read endpoints cho purchase flow

Scope da lam:

- Them admin payment endpoints:
  - `GET /api/v1/admin/payments`
  - `GET /api/v1/admin/payments/{id}`
- Them customer invoice endpoints:
  - `GET /api/v1/invoices`
  - `GET /api/v1/invoices/{id}`
- Them customer shipment endpoints:
  - `GET /api/v1/shipments`
  - `GET /api/v1/shipments/{id}`
- Implement filter/search:
  - payments: `status`, `method`, `search`.
  - invoices: `status`, `search`.
  - shipments: `status`, `search`.
- Implement dev ownership guard bang `X-User-Id` cho invoice/shipment detail.
- Them error codes:
  - `INVOICE_NOT_FOUND`
  - `INVOICE_ACCESS_DENIED`
  - `SHIPMENT_ACCESS_DENIED`
- Cap nhat:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.

Next recommended step:

1. Endpoint admin note cho order: `PATCH /admin/orders/{id}/notes` neu FE admin can ghi chu van hanh.
2. Payment overdue/refund va invoice PDF neu can dong sau thanh toan.
3. Sau mua hang: returns/warranty/review basic.

### 2026-05-14 - Admin notes va payment overdue/refund

Scope da lam:

- Them admin order notes endpoint:
  - `PATCH /api/v1/admin/orders/{id}/notes`
- Implement rule:
  - `notes` required, max 1000 chars.
  - overwrite `orders.internal_notes`.
  - customer order detail khong expose `internalNotes`.
- Them migration:
  - `V9__payment_overdue_refund.sql`
- Schema payment:
  - add enum value `OVERDUE`.
  - add `refund_amount`, `refund_reason`, `refund_method`, `refunded_at`.
- Them admin payment endpoints:
  - `PATCH /api/v1/admin/payments/{id}/mark-overdue`
  - `POST /api/v1/admin/payments/{id}/refund`
- Implement refund side effects:
  - chi refund payment `PAID`.
  - validate `refundAmount <= paidAmount`.
  - set `payments.status = REFUNDED`.
  - set refund metadata.
  - set `orders.payment_status = REFUNDED`.
- Cap nhat:
  - `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.
- Flyway apply den version 9.

Next recommended step:

1. Invoice PDF download placeholder neu FE can nut download.
2. Sau mua hang: returns/warranty/review basic.
3. Loyalty/notification side effects khi order delivered/refunded.

### 2026-05-14 - Invoice PDF download placeholder

Scope da lam:

- Them endpoint:
  - `GET /api/v1/invoices/{id}/download`
- Implement response binary:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="{invoiceNumber}.pdf"`
- Implement ownership bang dev header `X-User-Id`.
- Sinh PDF toi thieu truc tiep tu invoice metadata, chua them thu vien/template PDF.
- Cap nhat:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.

Next recommended step:

1. Sau mua hang: returns basic.
2. Warranty basic tu order delivered.
3. Review basic sau khi order delivered.

### 2026-05-15 - FE admin P0 invoices/shipments

Scope da lam theo `be/docs/FE_ADMIN_BACKEND_GAPS.md`:

- Them admin invoice endpoints:
  - `GET /api/v1/admin/invoices`
  - `GET /api/v1/admin/invoices/{id}`
  - `GET /api/v1/admin/invoices/{id}/download`
  - `PATCH /api/v1/admin/invoices/{id}/status`
- Them admin shipment endpoints:
  - `GET /api/v1/admin/shipments`
  - `GET /api/v1/admin/shipments/{id}`
  - `PATCH /api/v1/admin/shipments/{id}/status`
- Implement filter/search cho admin invoice va shipment.
- Implement shipment status state rule.
- Neu admin update shipment `IN_TRANSIT -> DELIVERED` va order dang `SHIPPING`, backend dong bo order/payment/invoice side effects.
- Cap nhat gaps doc de FE thay P0 da done:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- Cap nhat contracts:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 13 tests, 0 failures, 0 errors.

Next recommended step:

1. P1 admin dashboard endpoints.
2. P1 admin inventory endpoints.
3. P1 admin promotions CRUD.

### 2026-05-15 - FE admin P1 dashboard minimum

Scope da lam theo `be/docs/FE_ADMIN_BACKEND_GAPS.md`:

- Them dashboard endpoints:
  - `GET /api/v1/admin/dashboard/stats`
  - `GET /api/v1/admin/dashboard/revenue-chart?period=day|week|month&from=&to=`
  - `GET /api/v1/admin/dashboard/recent-orders?limit=`
  - `GET /api/v1/admin/dashboard/recent-activity?limit=`
- Stats gom revenue/orders/payment/low-stock metrics.
- Revenue chart aggregate theo `day`, `week`, `month`.
- Recent orders lay tu `orders`.
- Recent activity tam thoi lay tu `order_status_history`.
- Cap nhat:
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`
  - `be/docs/PROGRESS.md`

Verify da chay:

- `mvn test`
- Test suite: 14 tests, 0 failures, 0 errors.

Next recommended step:

1. P1 admin inventory endpoints.
2. P1 admin promotions CRUD.
3. Sau mua hang: returns/warranty/review basic.

### 2026-05-14 - Order creation transaction

Scope da lam:

- Them migration `V4__orders_payments.sql`.
- Tao enum:
  - `order_status`
  - `payment_status`
  - `payment_method`
- Tao tables:
  - `order_daily_sequences`
  - `orders`
  - `order_items`
  - `order_status_history`
  - `payments`
- Them endpoint:
  - `POST /api/v1/orders`
- Implement transaction tao order theo BA:
  - Validate request items.
  - Validate product/variant ton tai, active, du stock.
  - Lay `unitPrice` tu DB tai thoi diem tao order.
  - Validate promotion neu co.
  - Tinh subtotal, discount, shippingFee, totalAmount.
  - Tao `orderNumber = CP + yyyyMMdd + 5-digit daily sequence`.
  - Tao order `PENDING`, payment `UNPAID`.
  - Tao order items snapshot.
  - Tao status history dau tien.
  - Tang promotion `used_count`.
  - Clear cart cua user.
- Tao FE contract: `be/docs/FE_ORDER_CONTRACT.md`.
- Tao mapping BA -> BE -> FE: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Dev bridge do security/user-address dang deferred:

- Dung `X-User-Id`, `X-User-Name`, `X-User-Email`, `X-User-Phone` thay cho JWT/users table.
- Dung inline `shippingAddress` thay cho `shippingAddressId`.
- Khong reserve stock o `PENDING`; stock reservation da lam khi admin status update sang `CONFIRMED`.
- Payment gateway chua co; hien tao payment placeholder.

Verify da chay:

- `mvn test`
- Test suite: 8 tests, 0 failures, 0 errors.
- Flyway apply den version 4.

Next recommended step:

1. Shipment placeholder khi order sang `SHIPPING`.
2. Payment/customer list/detail endpoints `GET /payments`, `GET /payments/{id}`.
3. Admin payment list/detail endpoints `GET /admin/payments`, `GET /admin/payments/{id}`.

### 2026-05-14 - Promotion validation

Scope da lam:

- Them migration `V3__promotions.sql`.
- Tao enum `discount_type` va table `promotions`.
- Seed 2 promotion de FE test checkout:
  - `WELCOME10`
  - `APPLE500K`
- Them endpoints:
  - `GET /api/v1/promotions`
  - `POST /api/v1/promotions/validate`
- Implement promotion rules:
  - Tim code case-insensitive.
  - Check `isActive`.
  - Check thoi han `startDate/endDate`.
  - Check `usageLimit/usedCount`.
  - Check `minOrderValue`.
  - Check scope product/category/brand.
  - Tinh discount cho `PERCENTAGE` va `FIXED_AMOUNT`.
- Tao FE contract: `be/docs/FE_PROMOTION_CONTRACT.md`.

Ghi chu:

- DB/API dung `PERCENTAGE` thay vi `PERCENT` de khop response trong API docs va de FE khong phai map lai.
- Validate promotion chua tang `usedCount`; viec tang usage se lam trong order creation transaction.

Verify da chay:

- `mvn test`
- Test suite: 7 tests, 0 failures, 0 errors.
- Flyway apply den version 3.

Next recommended step:

1. Order creation transaction.
2. Payment placeholder cho COD/BANK_TRANSFER.
3. Admin order status update toi thieu.

### 2026-05-14 - Cart module

Scope da lam:

- Them migration `V2__cart_items.sql`.
- Tao table `cart_items` theo BA docs, rieng `user_id` chua FK `users` vi security/user module dang deferred.
- Them cart entity/repository/service/controller.
- Them dev-only ownership qua header `X-User-Id`; khi bat security se thay bang JWT current user.
- Them endpoints:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `PATCH /api/v1/cart/items/{id}`
  - `DELETE /api/v1/cart/items/{id}`
  - `DELETE /api/v1/cart`
  - `POST /api/v1/cart/validate`
- Implement business rules:
  - Merge item trung `(userId, productId, variantId)`.
  - Snapshot `unitPrice` luc add vao gio.
  - Check product active, variant active, stock.
  - Limit 50 item lines.
  - Validate cart issue list cho checkout.
- Tao FE contract: `be/docs/FE_CART_CONTRACT.md`.

Verify da chay:

- `mvn test`
- Test suite: 6 tests, 0 failures, 0 errors.
- Flyway apply den version 2.

Next recommended step:

1. Promotion validation toi thieu.
2. Order creation transaction.
3. Payment placeholder cho COD/BANK_TRANSFER.
