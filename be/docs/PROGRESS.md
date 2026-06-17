# Backend Progress

Source of truth: `B2B eCommerce Platform Plan/ba-docs`

Focus hien tai: B2C core flow, uu tien storefront -> cart -> checkout -> order operations.

## 2026-06-11 Buyer Menu Filter Sync

Sua loi chon loai tren menu buyer khong loc dung:

- Nguyen nhan: `ProductListPage` chi doc `categoryId/categorySlug/brand/price` tu URL query luc mount lan dau. Khi user dang o `/products` va click menu khac, route khong remount nen filter state noi bo van giu gia tri cu.
- FE `ProductListPage` nay sync lai filters moi khi `searchParams` thay doi.
- Ho tro dong bo tu URL cho `categoryId`, `categorySlug`, `brand`, `status`, `minPrice`, `maxPrice`, `isNew`, `isHot`, `isFeatured`.
- Them dependency `categorySlug` cho fetch flow de route slug doi se fetch lai dung.

Verify:

- FE `npm.cmd run build -- --outDir dist-codex-menu-filter-check`: passed.

## 2026-06-11 Buyer Header Menu Real Data

Gan menu buyer header voi du lieu catalog that:

- FE `BuyerLayout` khong render menu bang `cat-01..cat-06` nua.
- Menu load `GET /api/v1/categories` va `GET /api/v1/products`, sau do map category theo slug: `dien-thoai`, `phu-kien`, `tai-nghe`, `dong-ho-thong-minh`, `sac-pin`, `thiet-bi-cong-nghe`.
- Dropdown brand duoc gom tu product brand that trong category dang hover va cac category con.
- Link category/brand/price dung `categoryId` UUID that de FE product list loc dung voi backend.
- Them Flyway `V42__buyer_menu_real_catalog_data.sql` de bo sung category/product that cho Realme, Dong ho thong minh, Sac & Pin, Tai nghe, Thiet bi cong nghe.
- Them Flyway `V43__buyer_menu_variant_backfill.sql` de dam bao cac product menu moi co du 3 variants va variant images.

Verify:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed, Flyway applied `V42` va `V43`.
- DB check: menu categories co product_count: Dien thoai `53`, Phu kien `37`, Tai nghe `13`, Sac & Pin `14`, Dong ho thong minh `5`, Thiet bi cong nghe `3`, Realme `3`.
- DB check: `seeded_products_under_3_variants = 0`, `variants_without_images = 0`.
- FE `npm.cmd run build -- --outDir dist-codex-real-menu-check`: passed.

## 2026-06-11 Catalog Variant Specific Images

Sua loi chon bien the tren man chi tiet san pham nhung anh khong doi:

- Nguyen nhan: FE da filter gallery theo `imageDetails[].variantId`, nhung seed data chi co `11` anh gan `variant_id`, con `241` bien the khong co anh rieng nen FE fallback ve anh chung cua san pham.
- Them Flyway `V41__catalog_variant_specific_images.sql`.
- Moi `product_variants` row nay co it nhat `1` row trong `product_images` voi `variant_id` tuong ung.
- FE `ProductDetailPage` uu tien anh bien the len dau gallery, sau do noi them anh chung cua san pham de van giu du thumbnail.
- API contract khong doi: FE tiep tuc dung `GET /api/v1/products/{id}` va doc `imageDetails[].variantId`.

Verify:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed, Flyway applied `V41` to local PostgreSQL.
- DB check: `variant_images = 252`, `variants_without_images = 0`, `total_product_images = 495`.
- FE `npm.cmd run build -- --outDir dist-codex-variant-gallery-check`: passed.

## 2026-06-11 Catalog Minimum Variants And Images

Dam bao moi san pham co du bien the va anh that cho FE:

- Them Flyway `V40__catalog_min_three_variants_images.sql`.
- Bo sung bien the con thieu de moi product co it nhat `3` rows trong `product_variants`.
- Bo sung anh con thieu de moi product co it nhat `3` rows trong `product_images`.
- Anh bo sung dung URL san pham that theo nhom brand/category, khong dung placeholder.
- SKU auto sinh co gan slug/product id de tranh trung lap.

Verify:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed, Flyway applied `V40` to local PostgreSQL.
- DB check: `products_under_3_variants = 0`, `min_variants = 3`, `total_products = 84`.
- DB check: `products_under_3_images = 0`, `min_images = 3`, `total_product_images = 254`.
- DB check: `product_images` con `0` URL `placehold.co`, `0` URL `cdn.cellphones.vn/products`.

## 2026-06-11 Catalog Real Product Names

Cap nhat toan bo ten san pham catalog thanh model san pham co that:

- Them Flyway `V39__catalog_real_product_names.sql`.
- Doi cac san pham seed dang co ten `iPhone Demo xx`, `Samsung Demo xx`, `Xiaomi Demo xx`, `OPPO Demo xx`, `Vivo Demo xx`, `Tai nghe Demo xx`, `Sac cap Demo xx`, `Op lung Demo xx` thanh ten model that.
- Cap nhat kem `slug`, `brand`, `shortDescription`, `description`, `tags`, `specifications`, variant name/SKU va image `altText`.
- Dong bo snapshot hien thi ten san pham trong `cart_items`, `order_items`, `warranty_items`.
- Cap nhat FE mock/fallback tu `AirPods Pro 3` sang `AirPods Pro 2 USB-C` de tranh ten san pham khong chac chan.

Verify:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed, Flyway applied `V39` to local PostgreSQL.
- DB check: `products` con `0` row co `name/slug` chua `demo`, tong `84` san pham.
- DB check: `cart_items`, `order_items`, `warranty_items` con `0` row co `product_name` chua `demo`.
- FE `npm.cmd run build -- --outDir dist-codex-real-product-names-check`: passed.

## 2026-06-11 Buyer Featured Brand Icons

Sua section `Thuong hieu noi bat` tren home buyer:

- Bo phu thuoc logo SVG ngoai cho brand card vi mot so URL Wikimedia tra `404/429`, lam FE chi hien text.
- Doi sang brand icon mark noi bo cho Apple, Samsung, Xiaomi, OPPO, Vivo, Realme.
- Card brand co kich thuoc icon on dinh, hover scale nhe, khong bi mat icon khi CDN ngoai loi.

Verify:

- FE `npm.cmd run build -- --outDir dist-codex-brand-icons-check`: passed.

## 2026-06-11 Catalog Real Image URLs

Cap nhat du lieu anh that cho catalog demo:

- Them Flyway `V38__catalog_real_image_urls.sql` de thay cac URL placeholder/`cdn.cellphones.vn` demo cu bang URL anh san pham that da check song.
- Map anh chinh theo san pham/brand/category: iPhone, Samsung, Xiaomi, OPPO, Vivo, AirPods, sac/cap, op lung.
- Cap nhat `categories.image_url` va `banners.image_url` de man buyer/admin khong con anh placeholder.
- Cap nhat FE mock/fallback `mockData.ts` de cac man con dung fallback cung hien anh san pham that.
- Contract API khong doi: FE van doc `images[]`, `imageDetails[]`, `primaryImage`, `category.imageUrl`, `banner.imageUrl` nhu hien tai.

Verify:

- URL anh chinh da kiem tra `200 OK` bang `curl.exe -L -I`.
- FE `npm.cmd run build -- --outDir dist-codex-real-images-check`: passed.
- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#contextLoads`: passed, Flyway applied `V38` to local PostgreSQL.
- DB check: `product_images` con `0` URL `placehold.co`, `0` URL `cdn.cellphones.vn/products`, tong `100` anh.

## 2026-06-09 FE Buyer Mega Menu One Column

Sua dropdown menu desktop buyer:

- Doi mega dropdown category tu 2 cot ngang sang 1 cot doc.
- Nhom `Thuong hieu` nam tren, nhom `Theo muc gia` nam duoi.
- Giam width dropdown tu `500px` xuong `260px` de phu hop menu doc.

Verify:

- FE `npm.cmd run build -- --outDir dist-codex-buyer-menu-column-check`: passed.

## 2026-06-09 Admin Promotion Create 500 Fix

Sua loi `POST /api/v1/admin/promotions` khong tao duoc khuyen mai voi payload FE:

- Nguyen nhan: query check trung code dung `(? IS NULL OR id <> ?)` khi tao moi truyen `currentId = null`, PostgreSQL khong suy ra duoc type cua parameter `$2`.
- Tach query check trung code cho create va update.
- Them validate `type`, `applicableProducts`, `applicableCategories` de UUID/type sai tra `VALIDATION_ERROR`, khong roi vao `500`.
- Them regression test voi payload co `applicableProducts`, `applicableCategories`, `applicableBrands` la array nhu FE dang gui.
- Da don du lieu debug/test promotion trong DB local.

Verify:

- BE `mvn test -Dtest=B2bEcommerceApiApplicationTests#adminPromotionCreateAcceptsArrayScopes`: passed.
- BE `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-06-09 FE Admin Promotion Target Combobox

Hoan thanh yeu cau form khoi tao/cap nhat khuyen mai:

- Doi 3 o `Product ids CSV`, `Category ids CSV`, `Brands CSV` thanh multi-select autocomplete.
- San pham lay option tu BE product list, hien ten san pham va luu product id.
- Danh muc lay option tu BE category tree, flatten de chon va luu category id.
- Brand tu dong autofill tu danh sach san pham va promotion scope hien co.
- Cac gia tri da chon hien thanh chip co nut xoa.
- Van cho paste CSV de nhap nhanh khi can.
- Contract API khong doi: FE van gui `applicableProducts`, `applicableCategories`, `applicableBrands` thanh array khi save promotion.

Verify:

- FE `npm.cmd run build -- --outDir dist-codex-promotion-combobox-check`: passed.

## 2026-06-09 FE Admin Product Updated Sort And Edit Flow

Hoan thanh yeu cau admin product list va edit popup:

- Danh sach san pham mac dinh sort theo `updatedAt DESC`.
- BE catalog sort support them `updatedAt` de FE sort dung tu server.
- Tao moi san pham da co `updatedAt = now` qua `@PrePersist`; cap nhat san pham co `updatedAt = now` qua `@PreUpdate`.
- Bam edit san pham mo popup dang readonly truoc.
- Bam nut `Sua` trong popup moi enable form.
- Bam luu cap nhat san pham khong dong popup; popup refresh du lieu vua luu va quay ve readonly.

Verify:

- FE `npm.cmd run build -- --outDir dist-codex-product-updated-sort-check`: passed.
- BE `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-06-09 FE Admin Product Specifications Rows

Hoan thanh yeu cau man admin quan ly san pham, cau hinh thong so moi dong la mot thong so:

- Doi product form tu textarea parse `key: value` sang danh sach row co `key` va `value` rieng.
- Admin co the them, sua, xoa tung thong so cho moi san pham truoc khi luu.
- Modal chi tiet san pham hien thong so theo row va co nut `Sua thong so` mo form edit san pham.
- Contract FE-BE giu nguyen: `specifications` gui len `POST /api/v1/admin/products` va `PATCH /api/v1/admin/products/{id}` la JSON object.

Verify:

- FE `npm.cmd run build -- --outDir dist-codex-product-specs-check`: passed.

## 2026-06-09 Auth Admin Login Fix

Sua loi khong dang nhap duoc admin:

- Nguyen nhan: `AuthService.findAdminUser()` query cot `admin_users.company_name` nhung schema `admin_users` khong co cot nay, lam `admin@cellphones.vn` bi HTTP 500.
- Sua query tra company name hang so `CELLPHONES`.
- Auth DTO tra role may-doc-duoc `ADMIN`/`CUSTOMER` thay vi chuoi tieng Viet de FE routing on dinh hon.
- Them Flyway `V37__auth_admin_login_fix.sql` de upsert:
  - `admin_users`: `admin@cellphones.vn`
  - `auth_credentials`: `admin@cellphones.vn` / `123456`
- Them test `demoAuthLoginWorksForBuyerAndAdmin`.

Verify:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn package -DskipTests`: passed va tao boot jar.
- `mvn test`: passed, 30 tests, 0 failures, 0 errors.

FE follow-up 2026-06-09:

- Sua FE routing/menu theo auth role moi tu BE.
- Them `src/app/utils/roles.ts` de normalize `ADMIN`/`CUSTOMER` va role legacy tieng Viet.
- Login admin se redirect `/admin`, `AdminGuard` chap nhan `ADMIN`, avatar menu hien `Admin Panel`.
- FE build check qua `npx.cmd vite build --outDir dist-codex-admin-role-check --emptyOutDir`.

## 2026-06-09 FE Buyer Order Sort And Time Display

Sua hai loi FE buyer order:

- Danh sach don hang sap xep mapped data theo `createdAt DESC` mac dinh, giu don moi nhat len dau.
- Them `src/app/utils/dateTime.ts` de format timestamp theo `Asia/Ho_Chi_Minh`.
- Cot `Ngay tao` trong `/orders` va ngay tao trong `/orders/:id` khong con hien raw UTC bi lech -7 gio.
- Shipment createdAt trong chi tiet don hang cung dung format gio Viet Nam.

Verify:

- `npx.cmd vite build --outDir dist-codex-order-time-check --emptyOutDir`: passed.

## 2026-06-09 FREESHIP Promotion Checkout Fix

Sua loi ma `FREESHIP` validate thanh cong nhung FE van bao khong hop le:

- Nguyen nhan: BE tra `valid=true`, `discount=0` cho promotion type `FREE_SHIPPING`; FE lai check `result.discount` nhu boolean nen `0` bi coi la false.
- FE cart chap nhan promotion hop le du `discount=0`.
- FE preview dat phi van chuyen ve `0` khi promotion la `FREE_SHIPPING`/`FREESHIP`.
- BE tao don dat `shipping_fee = 0` khi promotion validated co type `FREE_SHIPPING`.

Verify:

- `npx.cmd vite build --outDir dist-codex-freeship-check --emptyOutDir`: passed.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-06-09 FE Notification Popup Layout Fix

Sua popup thong bao bi chong noi dung:

- Doi dropdown sang layout flex column co `max-height` theo viewport.
- Header/filter/footer co `shrink-0`; vung list dung `overflow-y-auto`.
- Notification row dung grid 3 cot de icon, noi dung va action khong de len nhau.
- Timestamp thong bao dung `formatVietnamDateTime`.

Verify:

- `npx.cmd vite build --outDir dist-codex-notification-popup-check --emptyOutDir`: passed.

## 2026-05-29 VNPay Sandbox Gateway

Hoan thanh gap VNPay sandbox trong `FE_BUYER_BACKEND_GAPS.md`:

- Them `VnpayGatewayService` de build signed VNPay sandbox payment URL theo HMAC-SHA512.
- `POST /api/v1/payments/{id}/gateway-session` voi `provider = VNPAY` tra `paymentUrl` that toi `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`.
- `GET /api/v1/payments/gateway/return` nhan bo tham so `vnp_*`, verify `vnp_SecureHash`, map `vnp_TxnRef` ve `payment_gateway_sessions.request_id`.
- VNPay success (`vnp_ResponseCode=00`, `vnp_TransactionStatus=00`) dong bo gateway session, payment, order payment status, va invoice pending/overdue sang `PAID` neu da co.
- VNPay cancelled/failed chi cap nhat gateway session, khong mark payment paid.
- Sau khi verify VNPay return, neu session co `returnUrl` tu FE thi BE tra HTTP `302` ve man FE payment result kem `requestId`, `paymentId`, `orderId`, `provider`, `status`.
- Them error `PAYMENT_GATEWAY_SIGNATURE_INVALID`.
- Config qua env: `VNPAY_PAY_URL`, `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_RETURN_URL`, `VNPAY_EXPIRE_MINUTES`.
- BE chan tao VNPay session neu van dung placeholder `DEMOV210` hoac `VNPAY_SANDBOX_HASH_SECRET_CHANGE_ME`, tranh redirect sang trang loi chung cua VNPay.
- Da cau hinh sandbox default: `VNPAY_TMN_CODE=VZ5ZPNQT`, `VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`.

Docs da cap nhat:

- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`

Verify:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn test`: passed, 29 tests, 0 failures, 0 errors.

## 2026-05-28 Buyer Delete Pending Return

Hoan thanh flow buyer huy/xoa yeu cau hoan tra tao moi:

- Them `DELETE /api/v1/returns/{id}`.
- Chi owner cua return request moi duoc xoa.
- Chi cho xoa return dang `PENDING`; cac trang thai khac tra `RETURN_INVALID_STATUS`.
- Xoa thanh cong tra HTTP `204`.
- Bo sung test tao don da giao, tao return `PENDING`, xoa return va verify detail tra `RETURN_NOT_FOUND`.
- Test fixture reset stock cua cac variant dung trong order tests de tranh fail do DB local bi chay lap nhieu lan.

Docs da cap nhat:

- `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`

Verify:

- `mvn test`: passed, 28 tests, 0 failures, 0 errors.
- `mvn package -DskipTests`: passed.

## 2026-05-28 Return Refund Updates Original Order

Hoan thanh side effect cho flow hoan tra:

- `PATCH /api/v1/admin/returns/{id}/status` khi chuyen `PROCESSING -> REFUNDED` se cap nhat don goc tu `DELIVERED` sang `RETURNED`.
- Ghi them `order_status_history` voi `to_status = RETURNED`.
- Giu nguyen side effect dao diem loyalty da co.
- Neu return da linked voi order khong o trang thai `DELIVERED`, backend tra `ORDER_INVALID_STATUS_TRANSITION`.

Docs da cap nhat:

- `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`
- `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md`
- `be/docs/FE_ADMIN_BACKEND_GAPS.md`

Verify:

- `mvn test`: passed, 27 tests, 0 failures, 0 errors.

## 2026-05-24 Admin Payment Partial Refund

Hoan thanh gap refund semantics trong `FE_ADMIN_BACKEND_GAPS.md`:

- `POST /api/v1/admin/payments/{id}/refund` ho tro partial refund.
- Neu cumulative refund `< paidAmount`: set `payments.status = PARTIALLY_REFUNDED`, `orders.payment_status = PARTIALLY_REFUNDED`.
- Cho phep refund tiep khi payment dang `PARTIALLY_REFUNDED`.
- Neu cumulative refund `= paidAmount`: set `REFUNDED`.
- `AdminPaymentDto.refundAmount` la tong so tien da refund luy ke.
- `refundAmount + existingRefundAmount > paidAmount` tra `REFUND_AMOUNT_EXCEEDS_PAID`.
- Loyalty reverse chi chay khi payment full `REFUNDED`, tranh dao diem khi moi partial.

Docs da cap nhat:

- `be/docs/FE_ADMIN_BACKEND_GAPS.md`
- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`

Verify:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn test`: passed, 26 tests, 0 failures, 0 errors.
- Test fixture update: profile/wishlist buyer tests now reset/seed their own demo rows so repeated local runs do not fail from prior manual app state.

## 2026-05-24 Public Stores DB Availability

Hoan thanh chuyen public stores/availability tu in-memory/hash sang DB theo BA:

- Them Flyway `V30__public_store_inventory.sql`.
- Them bang `branch_product_inventory` de luu ton kho theo branch/product.
- Seed stock cho active branches va active products.
- `GET /api/v1/stores` doc active `branches`, ho tro filter `city`.
- `GET /api/v1/stores/{id}` doc active branch detail.
- `GET /api/v1/stores/{id}/availability?productId={uuid}` doc `branch_product_inventory`, tra `stock` va `availableQuantity`.
- FE khong can dung demo `store-001`/`prod-001` cho availability nua; dung UUID branch/product that.

Docs da cap nhat:

- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn test`: blocked vi local PostgreSQL `localhost:5432` refused connection va Docker Desktop khong chay duoc PostgreSQL container.

## 2026-05-24 Buyer Reviews DB Bridge

Hoan thanh chuyen buyer/product reviews tu in-memory demo sang PostgreSQL:

- Them Flyway `V29__buyer_product_reviews.sql`.
- Bo sung `product_reviews.helpful_count`, `product_reviews.is_verified_purchase`.
- Them bang `product_review_helpful_votes` de helpful idempotent theo DB.
- Seed 10 approved reviews cho demo customer bang UUID product ids that tu catalog.
- Buyer endpoints doc DB:
  - `GET /api/v1/products/{productId}/reviews`
  - `GET /api/v1/products/{productId}/reviews/stats`
  - `POST /api/v1/products/{productId}/reviews`
  - `PATCH /api/v1/reviews/{id}`
  - `DELETE /api/v1/reviews/{id}`
  - `PATCH /api/v1/reviews/{id}/helpful`
  - `GET /api/v1/users/me/reviews`
- New/update review de `PENDING` cho admin moderation; product detail chi list `APPROVED`.

Docs da cap nhat:

- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn test`: blocked vi local PostgreSQL `localhost:5432` refused connection va Docker Desktop khong chay duoc PostgreSQL container.

## 2026-05-24 Buyer Wishlist DB Bridge

Hoan thanh chuyen wishlist buyer tu in-memory demo sang PostgreSQL theo BA:

- Them Flyway `V28__customer_wishlist.sql`.
- Them bang `customer_wishlist` voi unique `(user_id, product_id)`.
- Seed 10 wishlist rows cho demo customer `00000000-0000-4000-8000-000000000199` bang UUID product ids that tu catalog.
- `GET /api/v1/users/me/wishlist` doc tu PostgreSQL.
- `POST /api/v1/users/me/wishlist` idempotent theo BA: san pham da co thi tra item hien tai, khong tao duplicate.
- `DELETE /api/v1/users/me/wishlist/{productId}`, `DELETE /api/v1/users/me/wishlist/items/{id}`, `DELETE /api/v1/users/me/wishlist`.
- `PATCH /api/v1/users/me/wishlist/{productId}/price-alert` validate `priceAlert > 0`.

Docs da cap nhat:

- `be/docs/FE_BUYER_PROFILE_CONTRACT.md`
- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.
- `mvn test`: blocked vi local PostgreSQL `localhost:5432` refused connection va Docker Desktop khong chay duoc PostgreSQL container. Day la loi moi truong DB, khong phai compile error.

## 2026-05-23 Buyer Profile DB Bridge

Hoan thanh current-user profile bridge theo BA trong luc security/JWT van deferred:

- Them Flyway `V27__customer_profiles.sql`.
- Them bang PostgreSQL `customer_profiles`.
- Seed profile cho demo customer `00000000-0000-4000-8000-000000000199`.
- Them endpoint:
  - `GET /api/v1/users/me`
  - `PATCH /api/v1/users/me`
  - `POST /api/v1/users/me/avatar`
  - `GET /api/v1/users/me/stats`
- Stats tinh tu `orders` va `loyalty_programs`.
- `X-User-Id` van la identity bridge tam thoi cho toi khi bat security.

Docs da cap nhat:

- `be/docs/FE_BUYER_PROFILE_CONTRACT.md`
- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 24 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-23 Buyer Review Helpful Idempotency

Hoan thanh gap review helpful cho FE buyer:

- `PATCH /api/v1/reviews/{id}/helpful` idempotent theo `X-User-Id + reviewId`.
- Lan dau cua user tang `helpfulCount` va tra `helpful=true`.
- Retry/double-click cung user khong tang count lan nua, van tra `helpful=true`.

Docs da cap nhat:

- `be/docs/FE_BUYER_BACKEND_GAPS.md`

Verify:

- `mvn test`: passed, 23 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-23 Buyer Public Installments

Hoan thanh public installment endpoints theo BA cho product detail/checkout:

- Them `InstallmentPlanController`.
- Them `GET /api/v1/installment-plans` doc BA section 5.1.
- Them `POST /api/v1/installment-plans/calculate` doc BA section 5.2.
- Tinh monthly payment theo cong thuc amortization va round up den 1,000 VND.
- Them error codes:
  - `INSTALLMENT_PLAN_NOT_FOUND`
  - `INSTALLMENT_AMOUNT_TOO_LOW`
  - `INSTALLMENT_AMOUNT_TOO_HIGH`
  - `INSTALLMENT_MONTHS_INVALID`
- Current DB luu 1 `months` value per plan row, public response tra `months: number[]` de FE/BA compatible.

Docs da cap nhat:

- `be/docs/FE_INSTALLMENT_CONTRACT.md`
- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 22 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-23 Buyer Saved Addresses Checkout

Hoan thanh saved address production bridge theo BA cho checkout:

- Them Flyway `V26__customer_addresses.sql`.
- Them bang PostgreSQL `customer_addresses` va seed 10 dia chi cho demo customer `00000000-0000-4000-8000-000000000199`.
- Chuyen `GET/POST/PATCH/DELETE /api/v1/users/me/addresses` sang DB-backed thay vi in-memory.
- Giu rule moi user chi co 1 default address.
- `POST /api/v1/orders` bay gio nhan `shippingAddressId`, validate ownership bang `X-User-Id`, snapshot dia chi vao `orders.shipping_address`, va luu `orders.shipping_address_id`.
- Inline `shippingAddress` van duoc giu de FE tuong thich.

Docs da cap nhat:

- `be/docs/FE_BUYER_PROFILE_CONTRACT.md`
- `be/docs/FE_ORDER_CONTRACT.md`
- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 21 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## Current Status - 2026-05-20

FE buyer/admin gap review da duoc xu ly de FE ghep demo data day du hon.

Da implement:

- Flyway migration `V23__buyer_demo_gap_data.sql`.
- Default buyer demo user `00000000-0000-4000-8000-000000000199` co them:
  - 10 orders `QA-BUYER-0001..0010` phu cac status `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `RETURNED`.
  - 10 payments phu `UNPAID`, `PAID`, `OVERDUE`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`.
  - 10 invoices phu `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`.
  - 10 shipments phu `AWAITING_PICKUP`, `IN_TRANSIT`, `DELIVERED`, `FAILED`.
  - 10 returns, 10 warranty items, 10 warranty claims, 10 trade-in requests.
  - 10 notifications phu `ORDER`, `PAYMENT`, `PROMOTION`, `LOYALTY`, `SYSTEM`, `REVIEW`.
  - Loyalty program co diem de FE test redeem va 10 transactions phu `EARN`, `REDEEM`, `EXPIRE`, `BONUS`.
- Gap docs da cap nhat:
  - `be/docs/FE_BUYER_BACKEND_GAPS.md`
  - `be/docs/FE_ADMIN_BACKEND_GAPS.md`

Verify:

- `mvn package -DskipTests`: passed.
- `mvn test`: blocked by local Windows native memory/paging crash trong forked JVM sau khi them V23, khong phai compile error. Can chay lai khi may giai phong RAM/paging file hoac tren CI.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Security/RBAC/ownership that khi khong con defer.
2. Real external MOMO/VNPAY credentials/signature hardening neu can production gateway.

## Current Status - 2026-05-20

Loyalty reverse points on refund/return theo BA da xong.

Da implement:

- Them `LoyaltyEventService.reverseEarnedPoints(orderId, reason)`.
- Admin payment refund `POST /api/v1/admin/payments/{id}/refund` se dao diem da earn tu order neu co.
- Admin return status `PROCESSING -> REFUNDED` se dao diem da earn tu order neu co.
- Idempotent theo order: neu da co transaction `EXPIRE` mo ta `Dao diem...` thi khong tao trung.
- Khong lam balance am: so diem dao = `min(currentPoints, earnedPointsFromOrder)`.
- Giu `totalEarnedPoints` de khong ha hang thanh vien; tru `totalSpend` voi floor `0`.
- Tao notification `LOYALTY` khi diem bi dao.
- FE contracts cap nhat:
  - `be/docs/FE_LOYALTY_CONTRACT.md`
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`
- Mapping BA -> BE/FE cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 20 tests, 0 failures, 0 errors.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Security/RBAC/ownership that khi khong con defer.
2. Real external MOMO/VNPAY credentials/signature hardening neu can production gateway.

## Current Status - 2026-05-20

Automatic warranty item creation theo BA delivered side effect da xong.

Da implement:

- Tu dong tao `warranty_items` khi order chuyen `SHIPPING -> DELIVERED`.
- Ho tro ca 2 duong delivered:
  - `PATCH /api/v1/admin/orders/{id}/status`
  - `PATCH /api/v1/admin/shipments/{id}/status` khi shipment delivered dong thoi close order.
- Tao 1 warranty item cho moi purchased unit.
- Lay `warrantyMonths` tu `products.warranty`, fallback `12`.
- Sinh `serialNumber` local dang `WR-{orderNumber}-{sku-or-productId}-{unit}`.
- Idempotent theo `order_item_id`: side effect lap lai khong tao trung.
- FE contract cap nhat: `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`.
- Mapping BA -> BE/FE cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 20 tests, 0 failures, 0 errors.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Security/RBAC/ownership that khi khong con defer.

## Current Status - 2026-05-20

Automatic notification side effects theo BA da xong cho cac flow B2C chinh.

Da implement:

- Them public `NotificationEventService` de cac module order/after-sales phat sinh notification transaction-safe.
- Tu dong tao notification cho:
  - Order created/cancelled/status updated/delivered.
  - Payment paid by COD/admin/gateway, payment failed/cancelled, payment refunded.
  - Loyalty points awarded on delivered order.
  - Customer return created va admin return status update.
  - Customer warranty claim created va admin warranty status update.
  - Customer trade-in accept/reject valuation.
- Notification ton trong in-app preference cho cac type co the tat; `ORDER`, `PAYMENT`, `SYSTEM` van mandatory theo rule da co.
- FE contract cap nhat: `be/docs/FE_NOTIFICATION_CONTRACT.md`.
- Mapping BA -> BE/FE cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 20 tests, 0 failures, 0 errors.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Security/RBAC/ownership that khi khong con defer.

## Current Status - 2026-05-20

Payment gateway bridge theo BA checkout/payment side effects da xong cho FE ghep local.

Da implement:

- Flyway migration `V22__payment_gateway_sessions.sql`.
- Bang `payment_gateway_sessions` cho request id, provider, transaction ref, amount, status, return/callback URL va raw payload.
- Customer online payment session:
  - `POST /api/v1/payments/{id}/gateway-session`
- Gateway callback/return:
  - `POST /api/v1/payments/gateway/callback`
  - `GET /api/v1/payments/gateway/return`
- Provider supported: `MOMO`, `VNPAY`.
- Callback idempotent, cap nhat cung transaction:
  - `payments.status = PAID`
  - `payments.paid_amount = amount`
  - `payments.remaining_amount = 0`
  - `payments.transaction_ref`
  - `orders.payment_status = PAID`
  - invoice `PENDING/OVERDUE -> PAID` neu invoice da duoc tao
- FE contract cap nhat: `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`.
- Mapping BA -> BE/FE cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 20 tests, 0 failures, 0 errors.
- Flyway da apply version `22 - payment gateway sessions`.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Security/RBAC/ownership that khi khong con defer.
2. Loyalty reverse points on refund/return.

## Current Status - 2026-05-17

Customer notifications theo `ba-docs/08-api-loyalty-notifications.md` da xong cho FE ghep.

Da implement:

- Flyway migration `V21__customer_notifications.sql`.
- Them `app_notifications.read_at`.
- Them bang `notification_preferences`.
- Customer notification endpoints:
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/unread-count`
  - `PATCH /api/v1/notifications/{id}/read`
  - `PATCH /api/v1/notifications/read-all`
  - `DELETE /api/v1/notifications/{id}`
  - `DELETE /api/v1/notifications`
- Notification preferences:
  - `GET /api/v1/notifications/preferences`
  - `PATCH /api/v1/notifications/preferences`
- Rule theo BA:
  - `ORDER`, `PAYMENT`, `SYSTEM` khong the tat qua kenh `inApp`.
  - List notifications tra `meta.unreadCount`.
  - Delete bulk chi xoa notifications da doc.
- FE contract moi: `be/docs/FE_NOTIFICATION_CONTRACT.md`.
- Mapping BA -> BE/FE da cap nhat: `be/docs/BA_TO_BE_FE_MAPPING.md`.

Verify:

- `mvn test`: passed.
- Test suite: 19 tests, 0 failures, 0 errors.
- Flyway da apply version `21 - customer notifications`.

### In Progress / Next

Nen lam tiep theo theo BA:

1. Payment gateway callback cho MOMO/VNPAY.
2. Security/RBAC/ownership that khi khong con defer.
3. Automatic notification side effects theo order/payment/return/warranty.

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

1. Payment gateway callback cho MOMO/VNPAY.
2. Security/RBAC/ownership that khi khong con defer.
3. Automatic notification side effects theo order/payment/return/warranty.

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

## 2026-05-23 Buyer FE Gap Follow-up

Hoan thanh them 2 gap FE buyer dang can de ghep luong B2C chinh:

- Catalog `GET /api/v1/products?categoryId=...` bay gio match category duoc chon va toan bo category con, dung hon flow BA khi FE bam vao category cha.
- Buyer/admin order summary `items.firstItem` bay gio co them `productId` va `variantId`, giup FE dieu huong tu order card ve product detail khong can fallback.

Docs da cap nhat:

- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/FE_CATALOG_CONTRACT.md`
- `be/docs/FE_ORDER_CONTRACT.md`
- `be/docs/FE_ADMIN_ORDER_CONTRACT.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 20 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-28 Catalog Demo Count Alignment

Hoan thanh bo sung du lieu demo cho sidebar danh muc buyer:

- Them Flyway `V34__catalog_leaf_demo_products.sql`.
- Moi danh muc con hien co 10 san pham `ACTIVE`: iPhone, Samsung, Xiaomi, OPPO, Vivo, Tai nghe, Sac cap, Op lung.
- Chuyen san pham sac nhanh Apple cu tu parent `Phu kien` ve leaf `Sac cap` de khong dem sai o parent.
- Cap nhat `categories.product_count`: leaf dem san pham active truc tiep, parent dem tong active trong cay con.
- Seed them variant, primary image va `phone_specs` cho cac san pham demo moi.
- Test wishlist seed duoc lam idempotent hon de khong fail khi DB local da co du lieu wishlist.

Docs da cap nhat:

- `be/docs/FE_CATALOG_CONTRACT.md`
- `be/docs/DATABASE_SCHEMA_CURRENT.md`

Verify:

- `mvn test`: passed, 26 tests, 0 failures, 0 errors.
- DB smoke: leaf categories return 10 active products each; parent `Dien thoai` = 50, `Phu kien` = 30.

Next action:

- Neu FE can hien count theo ket qua filter hien tai thay vi count toan bo category, BE nen bo sung aggregation endpoint rieng cho product listing.

## 2026-05-23 Buyer Product Combos

Hoan thanh product combo public contract cho FE product detail:

- Them Flyway `V25__buyer_public_combos.sql` seed 2 active combos tu UUID catalog products.
- Them typed controller `BuyerComboController`.
- Them endpoint:
  - `GET /api/v1/combos`
  - `GET /api/v1/combos/{id}`
  - `GET /api/v1/products/{productId}/combos`
- Response gom `products[]`, `totalOriginalPrice`, `comboPrice`, `savings`, `savingsPercent`, `image`.

Docs da cap nhat:

- `be/docs/FE_CATALOG_CONTRACT.md`
- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 20 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-23 Buyer Payment Proof

Hoan thanh gap customer payment proof/manual `recordTransaction` cho FE buyer:

- Them Flyway `V24__customer_payment_proofs.sql`.
- Them bang `payment_proofs` de luu chung tu/chuyen khoan cua customer.
- Them endpoint:
  - `POST /api/v1/payments/{id}/proof`
  - `GET /api/v1/payments/{id}/proofs`
- Proof co status `PENDING_REVIEW`; khong tu mark payment paid. Admin van xac nhan bang `PATCH /api/v1/admin/payments/{id}/mark-paid`.
- Ownership theo `X-User-Id`, chan user khac gui proof vao payment khong phai cua minh.

Docs da cap nhat:

- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- `be/docs/FE_BUYER_BACKEND_GAPS.md`
- `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 20 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-23 Buyer After-Sales Detail Cleanup

Giam fallback cho FE buyer sau mua hang:

- `ReturnDto` them `orderNumber`, `refundMethod`, va `items[]` tu `order_items` gom product/variant/image/price snapshot.
- `WarrantyClaimDto` them `productName`, `productImage`, `brand`, `serialNumber`, va `warrantyStatus` tu `warranty_items`.
- Cap nhat docs:
  - `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`
  - `be/docs/FE_BUYER_BACKEND_GAPS.md`
  - `be/docs/BA_TO_BE_FE_MAPPING.md`

Verify:

- `mvn test`: passed, 20 tests, 0 failures, 0 errors.
- `mvn package -DskipTests`: compile/testCompile passed, failed only at Spring Boot repackage because `target/b2b-ecommerce-api-0.0.1-SNAPSHOT.jar` was locked by another running process.

## 2026-05-23 Buyer Invoice/Shipment Detail Cleanup

Giam fallback cho FE buyer sau mua hang:

- `InvoiceDto` them `customerEmail`, `customerPhone`, `invoiceType`, seller metadata, `notes`, va `lines[]` lay tu `order_items`.
- `ShipmentDto` them `customerName`, `customerPhone`, `shippingFee`, `fromAddress`, `toAddress`, `weight`, `dimensions`, va `trackingHistory[]`.
- Cap nhat docs FE tuong ung:
  - `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
  - `be/docs/FE_SHIPMENT_CONTRACT.md`
  - `be/docs/FE_BUYER_BACKEND_GAPS.md`

Verify:

- `mvn test`: passed, 20 tests, 0 failures, 0 errors.
- `mvn package -DskipTests "-Dspring-boot.repackage.skip=true"`: passed.

## 2026-05-28 Cart Stock Guard Tightening

Dong bo lai contract ton kho cho FE buyer:

- `POST /api/v1/cart/items` bat buoc nhan `variantId` neu product co bien the.
- Add cart check product active, variant active, stock hien tai, va tong quantity sau merge.
- Update cart item check lai stock hien tai theo quantity moi.
- FE phai hien thi loi backend, khong fallback mock khi backend tu choi add/update cart cho UUID item.

Docs da cap nhat:

- `be/docs/FE_CART_CONTRACT.md`

Verify:

- `mvn package -DskipTests`: passed.
- `mvn test`: chua chay duoc do PostgreSQL local `localhost:5432` tu choi ket noi; can bat DB roi rerun.

## 2026-05-28 Invoice Promotion Discount Snapshot

Dong bo tien khuyen mai tu order sang hoa don:

- Them migration `V35__invoice_discount_amount.sql` bo sung `invoices.discount_amount`.
- Backfill invoice cu tu `orders.discount_amount`/`orders.discount`.
- Tao invoice tu order va tao invoice admin deu luu `discount_amount = order.discount`.
- `InvoiceDto` tra them `discountAmount`; invoice PDF hien subtotal, discount, tax, grand total.
- Cap nhat contract FE tai `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`.

Verify can lam:

- `mvn package -DskipTests`: passed.
- FE `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.
