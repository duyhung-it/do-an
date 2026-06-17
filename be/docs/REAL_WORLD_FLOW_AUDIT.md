# Real World Flow Audit

Ngay danh gia: 2026-06-11

Pham vi: doi chieu BE hien tai voi `B2B eCommerce Platform Plan/ba-docs` va cac contract FE trong `be/docs`.

## Ket Luan Nhanh

BE hien tai da du de demo va ghep FE cho luong B2C chinh: xem catalog -> gio hang -> checkout -> thanh toan -> admin xu ly don -> giao hang -> hoa don -> hau mai -> loyalty/notification.

Neu danh gia theo muc "ung dung that co the van hanh noi bo co kiem soat", muc dap ung khoang 75-80%.

Neu danh gia theo muc "production public internet", muc dap ung khoang 55-60%, vi cac phan security/RBAC, provider shipping/payment that, audit/compliance va hardening van con thieu.

## Da Dap Ung Tot Cho Thuc Te

### Catalog va merchandising

- PostgreSQL/Flyway da thay MySQL/mock.
- Category tree, product list/detail/search/filter/sort, variants, images, featured/hot/new, brands da co endpoint rieng.
- Product images, category images, banner images da co du lieu anh that qua `V38__catalog_real_image_urls.sql`.
- Admin catalog CRUD da co product/category/variant/image/spec row, image reorder, combo, blog.

Muc do thuc te: tot cho ban hang/demonstration. Thieu CDN/upload file that va moderation noi dung neu production.

### Cart va checkout

- Cart CRUD, merge duplicate, validate cart, stock guard khi add/update da co.
- Order creation chay trong transaction, backend tinh lai gia tu DB, validate promotion, tao payment placeholder, clear cart.
- Shipping address da co saved address va validate ownership bang dev header.

Muc do thuc te: tot cho luong mua hang co ban. Thieu auth that, idempotency key, retry-safe checkout, va checkout concurrency hardening cap cao.

### Order operations

- Buyer list/detail/cancel.
- Admin list/detail/status update/internal notes.
- Status history co luu.
- Confirm/shipping/delivered co side effect toi stock/shipment/payment/invoice/loyalty.

Muc do thuc te: du demo va van hanh noi bo. Can bo sung state-machine chat hon, audit actor that, va permission theo vai tro.

### Payment va invoice

- COD, bank transfer proof, admin mark-paid, overdue, refund.
- VNPay sandbox co signed payment URL va return verification.
- Invoice list/detail/download minimal PDF, admin invoice operations.

Muc do thuc te: tot cho demo thanh toan va doi soat thu cong. Production can real callback/IPN hardening, webhook retry, reconciliation, payment idempotency, logging bao mat.

### Shipment

- Shipment list/detail cho buyer/admin.
- Auto tao shipment khi order sang shipping.
- Tracking timeline co du field cho FE.
- Delivered side effect cap nhat order/payment/invoice cho COD.

Muc do thuc te: du mo phong/van hanh noi bo. Chua tich hop carrier API that, chua co label, phi ship dong, weight/dimensions that.

### Inventory

- Stock theo variant.
- Reservation/release co bang `order_stock_reservations`.
- Admin inventory list/detail/adjust/low-stock/movements.

Muc do thuc te: on cho ton kho don gian. Chua co warehouse da diem day du, batch/serial/IMEI lifecycle chat, purchase receiving, stock count/cycle count.

### Promotion

- Public promotion list/validate.
- Admin promotion CRUD/toggle.
- Scope theo product/category/brand, usage limit, min order, max discount.
- `FREE_SHIPPING` da duoc xu ly trong validate/order flow.

Muc do thuc te: on cho campaign co ban. Can them per-user limit, stacking rule, budget cap, coupon ownership, scheduled job het han.

### After-sales, loyalty, notifications

- Returns, warranty claims, trade-in buyer/admin da co.
- Loyalty earn/reverse khi delivered/refund.
- Notifications va preferences co endpoint.

Muc do thuc te: du demo end-to-end. Production can workflow chi tiet hon: RMA labels, refund partial theo item, warranty serial validation, notification delivery provider.

### Admin reports/settings

- Dashboard, revenue chart, reports, banners, SEO, email template, staff, branches, activity logs.

Muc do thuc te: du quan tri va bao cao do an. Production can realtime metrics, export async, role-based visibility, immutable audit log.

## Cac Diem Dang La Dev Bridge

- Auth/current user dang dua vao `X-User-Id`, `X-User-Name`, `X-User-Email`, `X-User-Phone`.
- Admin endpoints da hoan thien contract nhung RBAC/security deferred.
- VNPay la sandbox; MOMO con local/dev bridge.
- Shipment/carrier la mo phong noi bo.
- File upload/avatar/payment proof/product image hien dang la URL string, chua co storage service.
- Mot so module admin/settings/reports du cho FE, nhung chua phai hardening production.

## Thieu Sot Lon Neu Dua Ra Thuc Te

### P0 - Can lam truoc production

1. Security/RBAC that: JWT/session, password hashing/refresh token, ownership tu token, role admin/staff/customer.
2. Bo dev headers khoi luong customer/admin va thay bang principal tu auth context.
3. State machine cho order/payment/shipment/return, chan transition sai bang rule tap trung.
4. Payment hardening: idempotency, webhook signature/IPN, retry, reconciliation, duplicate transaction guard.
5. Checkout/idempotency: `Idempotency-Key` de tranh tao nhieu don khi FE retry/double click.
6. Upload/storage: avatar, product image, proof image, return/trade-in image qua local/S3/Cloudinary thay vi URL tuy y.

### P1 - Can lam de van hanh tot

1. Inventory nang cao: warehouse/branch stock tach ro, receiving, transfer, stock count, IMEI/serial lifecycle.
2. Shipping provider: carrier quote, label, tracking webhook, weight/dimensions/package.
3. Promotion nang cao: per-user usage, coupon assignment, campaign budget, stacking/exclusion.
4. Refund/return partial theo item va payment method, khop voi loyalty reverse theo so tien/item.
5. Admin audit log bat buoc cho hanh dong quan trong: mark-paid, refund, adjust stock, status update, user/staff changes.
6. Email/SMS/push delivery provider thay vi chi notification inbox.

### P2 - Nang chat luong/khả nang mo rong

1. Search nang cao: full-text ranking, suggest, typo tolerance, price facet.
2. Observability: structured logs, metrics, tracing, alerting.
3. Rate limit, CORS hardening, validation message consistency.
4. Background jobs: expire payment/order, expire promotion, sync shipment, send email.
5. Admin export async cho report lon.

## Thu Tu Lam Tiep De Toi Uu

1. Chot security/RBAC va ownership that.
2. Them checkout/payment idempotency.
3. Lam file upload/storage cho product/proof/return/trade-in.
4. Lam order/payment/shipment state machine tap trung.
5. Nang inventory branch/warehouse/IMEI.
6. Nang refund/return partial va reconciliation thanh toan.

