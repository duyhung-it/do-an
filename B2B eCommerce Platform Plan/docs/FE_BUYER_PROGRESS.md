# FE Buyer Progress

## Done - Buyer Delete Pending Return Request - 2026-05-28

Scope:

- Buyer return list `/returns`.
- Buyer return API adapter.

Files changed:

- `src/app/components/buyer/BuyerReturnListPage.tsx`
- `src/app/services/api.ts`

Implemented behavior:

- `returnApi.delete(id)` now calls backend `DELETE /api/v1/returns/{id}` with buyer dev ownership headers.
- Desktop table keeps the delete action for `Chờ duyệt` rows.
- Mobile return cards now also show `Huỷ yêu cầu` for `Chờ duyệt` rows.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required.

Next action:

- Manual smoke in browser: create a return request, open `/returns`, click `Huỷ yêu cầu`, verify it disappears from the list and the delivered order can create a return again.

## Done - Buyer Return Detail Missing Array Guard - 2026-05-28

Scope:

- Buyer return detail `/returns/:id`.

Files changed:

- `src/app/components/buyer/BuyerReturnDetail.tsx`

Implemented behavior:

- Return detail no longer crashes when BE response omits `items` or `images`.
- Missing `items` and `images` are treated as empty arrays.
- Missing `refundAmount` is treated as `0`; missing `refundMethod` falls back to `ORIGINAL_PAYMENT`.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required.

Next action:

- Manual smoke in browser: refresh `/returns/cc000006-0199-4000-8000-000000000003` and verify the page renders, then check whether BE should backfill `items[]` for this seeded return detail.

## Done - Buyer Delivered Order Return Button Visibility - 2026-05-28

Scope:

- Buyer order detail `/orders/:id`.

Files changed:

- `src/app/components/buyer/OrderDetailPage.tsx`

Implemented behavior:

- Delivered orders now always show a return/refund-related action.
- If the delivered order has no return request, the action is `Trả hàng & hoàn tiền` and opens the create-return dialog.
- If the delivered order already has a return request, the action is `Xem yêu cầu hoàn trả` and navigates to `/returns/{id}`.
- Existing return requests are stored as full return DTOs instead of only ids so FE can navigate to the correct detail page.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required. The QA order case can reuse existing delivered orders and seeded return requests.

Next action:

- Manual smoke in browser: refresh delivered order detail, verify either `Trả hàng & hoàn tiền` or `Xem yêu cầu hoàn trả` appears next to order actions.

## Done - Buyer Cancel And Return Entry Points - 2026-05-28

Scope:

- Buyer order list `/orders`.
- Buyer account menu in shared buyer layout.

Files changed:

- `src/app/components/buyer/OrderListPage.tsx`
- `src/app/components/buyer/BuyerLayout.tsx`

Implemented behavior:

- `/orders` now has a visible `Trả hàng & hoàn tiền` shortcut to `/returns`.
- Account dropdown now includes `Trả hàng & hoàn tiền`.
- Customer cancellation remains in order detail `/orders/:id` and is visible only for cancellable order statuses.
- Customer return request remains in order detail `/orders/:id` and is visible only for delivered orders with no active return request.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required. Feature reuses existing order and return data.

Next action:

- Manual smoke in browser: open `/orders`, click a pending/confirmed order and verify `Huỷ đơn` appears; open a delivered order and verify `Trả hàng` appears; open `/returns` from the new shortcut and account menu.

## Done - Buyer Current Rank CTA - 2026-05-28

Scope:

- Buyer dashboard `/dashboard`.
- Buyer account menu in shared buyer layout.

Files changed:

- `src/app/components/buyer/BuyerDashboardPage.tsx`
- `src/app/components/buyer/BuyerLayout.tsx`

Implemented behavior:

- Dashboard welcome banner now has a visible `Xem hạng hiện tại` button when loyalty data is available.
- Loyalty widget now has a full-width `Xem hạng hiện tại` action that navigates to `/loyalty`.
- Quick action label changed from `Điểm thưởng` to `Hạng thành viên` to better match the rank use case.
- Account dropdown now includes `Hạng thành viên` so buyer can open current tier/rank from the header.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required. Feature reuses existing loyalty API data.

Next action:

- Manual smoke in browser: login as buyer, open dashboard, click `Xem hạng hiện tại`, confirm `/loyalty` shows current tier, points, total spend, and next tier progress.

## Done - Buyer Notification Priority Normalization - 2026-05-28

Scope:

- `/notifications`
- Notification data adapter and card rendering.

Files changed:

- `src/app/services/api.ts`
- `src/app/components/shared/NotificationCenterPage.tsx`

Implemented behavior:

- Backend notification priority is normalized to FE keys: `low`, `medium`, `high`, `urgent`.
- Uppercase or unexpected priority values no longer crash notification cards.
- Notification card priority badge/dot now falls back to `medium` config if runtime data is invalid.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new seed data required.

Next action:

- Manual smoke in browser: refresh `/notifications`, verify list renders, mark read/delete still work, and action links navigate correctly.

## Done - Buyer Category Count Demo Data Alignment - 2026-05-28

Scope:

- Buyer product listing category sidebar.
- Backend catalog seed data and category `productCount` values.

Files changed:

- `be/src/main/resources/db/migration/V34__catalog_leaf_demo_products.sql`
- `be/src/test/java/com/b2b/ecommerce/B2bEcommerceApiApplicationTests.java`
- `be/docs/FE_CATALOG_CONTRACT.md`
- `be/docs/DATABASE_SCHEMA_CURRENT.md`
- `be/docs/PROGRESS.md`

Implemented behavior:

- Each visible leaf category now has 10 active products for demo browsing: iPhone, Samsung, Xiaomi, OPPO, Vivo, Tai nghe, Sac cap, Op lung.
- Parent category counts now represent active products in the full subtree.
- Existing charger product was moved from parent `Phu kien` to child `Sac cap` so the category tree does not show a direct parent-only product.
- Demo products include one active variant, one primary image, and phone specs for phone categories.

Verification:

- `mvn test`: passed, 26 tests, 0 failures, 0 errors.
- DB smoke query confirmed: leaf categories = 10 each, `Dien thoai` = 50, `Phu kien` = 30.

Data:

- Added enough demo products to bring every current leaf category to 10 active products.

Next action:

- Restart BE if the running API process was started before V34, then refresh `/products` to see the updated sidebar counts.

## Done - Variant-Specific Product Gallery - 2026-05-27

Routes:

- `/products/:id`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/ProductDetailPage.tsx`

BE contract used:

- `be/docs/FE_CATALOG_CONTRACT.md`

Implemented behavior:

- FE preserves BE product image metadata through `imageDetails`.
- When buyer selects a variant, product gallery uses images matching that variant's `variantId`.
- If the selected variant has no dedicated images, gallery falls back to shared product-level images.
- BE seeds 10 variant-specific demo images for visible gallery switching QA.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Next action:

- Manually replace placeholder variant image URLs with real product/color photos for a polished final demo.

Source of truth:

- BA docs: `B2B eCommerce Platform Plan/ba-docs`
- BE contracts: `be/docs/FE_*_CONTRACT.md`
- FE process: `B2B eCommerce Platform Plan/docs/FE_BUYER_PROCESS.md`
- BE gap tracker: `be/docs/FE_BUYER_BACKEND_GAPS.md`

## Current status

### Done - Catalog

Routes:

- `/`
- `/products`
- `/products/:id`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/ProductListPage.tsx`

BE contract used:

- `be/docs/FE_CATALOG_CONTRACT.md`

Implemented behavior:

- Category tree reads from `GET /api/v1/categories`.
- Product list reads from `GET /api/v1/products`.
- Product featured/hot/new groups read from:
  - `GET /api/v1/products/featured`
  - `GET /api/v1/products/hot`
  - `GET /api/v1/products/new`
- Product detail reads from `GET /api/v1/products/{id}`.
- Similar products read from `GET /api/v1/products/{id}/similar`.
- Brands read from `GET /api/v1/products/brands`.
- FE maps BE product image objects to the existing buyer UI image URL array.
- FE maps BE enum values into current UI labels for product status and condition.
- Product list category filter now uses `categoryId`, matching BE contract.
- Product list shows root and child categories so leaf category filters can return real products.
- Product list price range now sends `minPrice` and `maxPrice` to BE.
- Mock fallback remains for catalog only when BE is unavailable.

Verification:

- `GET /api/v1/products?page=1&pageSize=5`: passed locally, returned 6 total products.
- `GET /api/v1/categories`: passed locally, returned root and child category tree.
- `GET /api/v1/products/featured?limit=8`: passed locally.
- `GET /api/v1/products/brands`: passed locally.
- `GET /api/v1/products?page=1&pageSize=12&categoryId=a1b2c3d4-0001-0001-0001-000000000003`: passed locally, returned 2 iPhone products.
- `/products`: passed locally with HTTP 200.
- `/products?categoryId=a1b2c3d4-0001-0001-0001-000000000003`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

Data:

- BE currently has 6 products.
- BE currently has 2 root categories and multiple child categories.
- Admin process required at least 10 records per completed module; buyer catalog still needs BE seed expansion to at least 10 active products.

Next action:

- Implement cart and checkout wiring from `be/docs/FE_CART_CONTRACT.md`, then create or verify at least 10 cart/order-ready data scenarios.

### Done - Product Detail Combo Cleanup - 2026-05-24

Routes:

- `/products/:id`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/ProductDetailPage.tsx`

BE contract used:

- `be/docs/FE_CATALOG_CONTRACT.md`

Implemented behavior:

- Product combo adapter now reads public BE endpoints:
  - `GET /api/v1/combos`
  - `GET /api/v1/combos/{id}`
  - `GET /api/v1/products/{productId}/combos`
- Product detail no longer calls legacy B2B `supplierApi` or mock chat conversation creation.
- Store information is shown as CELLPHONES retail copy, matching the BE buyer gap note that supplier extras are not required for B2C display.
- Combo purchase button now adds each combo item to the cart instead of only showing a local success toast.
- Combo fallback is empty when BE is unavailable, so FE does not invent buyer combo deals.

Verification:

- `GET /api/v1/products?page=1&pageSize=1`: passed locally.
- `GET /api/v1/products/{productId}/combos`: passed locally, returned 1 combo for the sampled product.
- `/products/{productId}`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

Data:

- BE combo data exists via `V25__buyer_public_combos.sql`.
- Non-blocking BE data QA: review demo combo names/composition if seeded combo copy must match every contained product exactly.

Next action:

- Continue buyer-facing audit for profile, wishlist, reviews, warranty, returns, trade-in, and loyalty pages; remove or document any remaining mock-only behavior against the matching BE contracts.

### Done - Cart And Checkout Create

Routes:

- `/cart`
- `/order-confirmation`

Files changed:

- `src/app/services/api.ts`
- `src/app/context/CartContext.tsx`
- `src/app/components/buyer/CartPage.tsx`

BE contracts used:

- `be/docs/FE_CART_CONTRACT.md`
- `be/docs/FE_ORDER_CONTRACT.md`

Implemented behavior:

- Cart reads from `GET /api/v1/cart` with dev `X-User-Id`.
- Add item uses `POST /api/v1/cart/items`.
- Update quantity uses `PATCH /api/v1/cart/items/{id}`.
- Delete item uses `DELETE /api/v1/cart/items/{id}`.
- Clear cart uses `DELETE /api/v1/cart`.
- Checkout calls `POST /api/v1/cart/validate` before order creation.
- Checkout creates one customer order with `POST /api/v1/orders`, sending only product/variant/quantity, inline shipping address, payment method, promotion code, and notes.
- FE no longer sends item prices to BE during order creation; BE recalculates prices according to contract.
- Payment method options now use BE values: `COD`, `BANK_TRANSFER`, `MOMO`, `VNPAY`, `INSTALLMENT`.
- Order confirmation receives the BE-created order and links to `/orders/{id}`.
- Mock fallback remains only when local BE is unavailable.

Verification:

- `GET /api/v1/cart`: passed locally.
- `POST /api/v1/cart/validate`: passed locally.
- `POST /api/v1/cart/items`: passed locally with iPhone 15 128GB test item.
- `GET /api/v1/cart` after add: passed locally, item count became 1.
- `DELETE /api/v1/cart/items/{id}`: passed locally, test item removed.
- `/cart`: passed locally with HTTP 200.
- `npm.cmd run build`: passed.

Data:

- BE currently has enough active product/variant data to add cart items and validate checkout.
- Order create was wired but not executed in verification to avoid creating a real local order and clearing the user's working cart unexpectedly.

Next action:

- Wire buyer order list/detail/cancel from `be/docs/FE_ORDER_CONTRACT.md`, then verify with existing local orders or a controlled test order if needed.

### Done - Buyer Orders

Routes:

- `/orders`
- `/orders/:id`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/OrderDetailPage.tsx`

BE contract used:

- `be/docs/FE_ORDER_CONTRACT.md`

Implemented behavior:

- Order list reads from `GET /api/v1/orders`.
- Order list supports BE query status mapping:
  - `Chờ xác nhận` -> `PENDING`
  - `Đã xác nhận` -> `CONFIRMED`
  - `Đang giao hàng` -> `SHIPPING`
  - `Đã giao` -> `DELIVERED`
  - `Đã huỷ` -> `CANCELLED`
  - `Hoàn trả` -> `RETURNED`
- FE adapter supports both BE list shape (`items.count`, `items.firstItem`) and detail shape (`items[]`).
- Order detail reads from `GET /api/v1/orders/{id}`.
- Customer cancel uses `DELETE /api/v1/orders/{id}/cancel` instead of local mock status update.
- FE maps BE order/payment enums into current buyer UI labels.
- Mock fallback remains only when local BE is unavailable.

Verification:

- `GET /api/v1/orders?page=1&pageSize=10&status=PENDING`: passed locally, returned empty page for demo user.
- `npm.cmd run build`: passed.
- `/orders` route check was attempted, but FE dev server on `localhost:5173` was not running. Starting Vite through `Start-Process` failed in this shell because PowerShell reported duplicate `Path/PATH` environment keys.

Data:

- Demo user currently has 0 orders, so list empty state is expected.
- Detail/cancel should be verified with a controlled test order when FE dev server is available, because cancel mutates order state.

Next action:

- Wire buyer payment, invoice, and shipment pages from `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` and `be/docs/FE_SHIPMENT_CONTRACT.md`.

### Done - Buyer Order Detail Legacy Chat Cleanup - 2026-05-24

Routes:

- `/orders/:id`

Files changed:

- `src/app/components/buyer/OrderDetailPage.tsx`

BE contracts used:

- `be/docs/FE_ORDER_CONTRACT.md`
- `be/docs/FE_ORDER_FULFILLMENT_CONTRACT.md`

Implemented behavior:

- Removed buyer order detail `Nhắn tin` action that created a mock/B2B chat conversation.
- Order detail keeps BE-backed actions for cancel, reorder through cart, invoice lookup, shipment lookup, review, and return request.
- Support/contact behavior is not invented in FE until BE defines a customer support conversation contract.

Verification:

- `npm.cmd run build`: passed.

Next action:

- Continue buyer-facing audit for wishlist/profile UI mocks; document BE needs for wishlist folders, price tracking, profile stats, avatar/cover upload, and password change if those should be production features.

### Done - Buyer Payments, Invoices, Shipments

Routes:

- `/payments`
- `/payments/:id`
- `/invoices`
- `/invoices/:id`
- `/shipments`
- `/shipments/:id`

Files changed:

- `src/app/services/api.ts`

BE contracts used:

- `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md`
- `be/docs/FE_SHIPMENT_CONTRACT.md`

Implemented behavior:

- Payment list reads from `GET /api/v1/payments`.
- Payment detail reads from `GET /api/v1/payments/{id}`.
- Online payment session adapter is available for `POST /api/v1/payments/{id}/gateway-session` with `MOMO` and `VNPAY`.
- Invoice list reads from `GET /api/v1/invoices`.
- Invoice detail reads from `GET /api/v1/invoices/{id}`.
- Order detail related invoice reads from `GET /api/v1/orders/{id}/invoice`.
- Shipment list reads from `GET /api/v1/shipments`.
- Shipment detail reads from `GET /api/v1/shipments/{id}`.
- Order detail related shipment reads from `GET /api/v1/orders/{id}/shipment`.
- FE maps BE payment, invoice, and shipment enums into existing buyer UI labels.
- FE adds display fallbacks for older B2B UI fields that BE customer DTOs do not provide yet, such as supplier display, invoice line items, shipment fee, route, and tracking events.
- Mock fallback remains only when local BE is unavailable.

Verification:

- `GET /api/v1/payments?page=1&pageSize=5`: passed locally, returned empty page for demo user.
- `GET /api/v1/invoices?page=1&pageSize=5`: passed locally, returned empty page for demo user.
- `GET /api/v1/shipments?page=1&pageSize=5`: passed locally, returned empty page for demo user.
- `npm.cmd run build`: passed.

Data:

- Demo user currently has 0 payments, 0 invoices, and 0 shipments.
- These modules require seeded buyer orders that have gone through payment/invoice/shipment side effects before the screens can show real records.

Next action:

- Wire buyer profile/address and remaining buyer support pages only where BE contracts exist; otherwise document BE requirements before changing behavior.

### Done - Buyer After-Sales

Routes:

- `/returns`
- `/returns/:id`
- `/warranty`
- `/trade-in`

Files changed:

- `src/app/services/api.ts`
- `src/app/services/warrantyApi.ts`

BE contract used:

- `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md`

Implemented behavior:

- Return list reads from `GET /api/v1/returns`.
- Return detail reads from `GET /api/v1/returns/{id}`.
- Return create from order detail posts to `POST /api/v1/returns`.
- Warranty list reads from `GET /api/v1/warranty`.
- Warranty detail reads from `GET /api/v1/warranty/{id}`.
- Warranty claim list reads from `GET /api/v1/warranty-claims`.
- Warranty claim detail reads from `GET /api/v1/warranty-claims/{id}`.
- Warranty claim create posts to `POST /api/v1/warranty-claims`.
- Trade-in estimate reads from `GET /api/v1/trade-in/estimate`.
- Trade-in create posts to `POST /api/v1/trade-in`.
- FE maps BE after-sales enums into current buyer UI labels.
- Mock fallback remains only when local BE is unavailable.

Verification:

- `GET /api/v1/returns?page=1&pageSize=5`: passed locally, returned empty page for default demo user.
- `GET /api/v1/warranty?page=1&pageSize=5`: passed locally, returned empty page for default demo user.
- `GET /api/v1/warranty-claims?page=1&pageSize=5`: passed locally, returned empty page for default demo user.
- `GET /api/v1/trade-in?page=1&pageSize=5`: passed locally, returned empty page for default demo user.
- `GET /api/v1/returns` with QA user `bc000000-0001-4000-8000-000000000003`: passed locally, returned 1 seeded return.
- `GET /api/v1/warranty` with QA user `bc000000-0001-4000-8000-000000000001`: passed locally, returned 1 seeded warranty item.
- `GET /api/v1/trade-in/estimate?brand=Apple&model=iPhone%2013%20Pro&condition=GOOD`: passed locally.
- `npm.cmd run build`: passed.

Data:

- Default demo user `00000000-0000-4000-8000-000000000199` still has 0 returns, 0 warranty items, 0 warranty claims, and 0 trade-in requests.
- BE QA users in the after-sales contract have limited seed data, but the buyer app's default dev header points to the default demo user.

Next action:

- Wire buyer loyalty and notifications from `be/docs/FE_LOYALTY_CONTRACT.md` and `be/docs/FE_NOTIFICATION_CONTRACT.md`, then revisit wishlist/profile/address because they still need confirmed BE contracts.

### Done - Buyer Loyalty And Notifications

Routes / surfaces:

- `/loyalty`
- Header notification dropdown / notification context

Files changed:

- `src/app/services/loyaltyApi.ts`
- `src/app/services/api.ts`

BE contracts used:

- `be/docs/FE_LOYALTY_CONTRACT.md`
- `be/docs/FE_NOTIFICATION_CONTRACT.md`

Implemented behavior:

- Loyalty program reads from `GET /api/v1/loyalty/me`.
- Loyalty transactions read from `GET /api/v1/loyalty/me/transactions`.
- Loyalty stats read from `GET /api/v1/loyalty/me/stats`.
- Loyalty rewards read from `GET /api/v1/loyalty/rewards`.
- Reward redeem calls `POST /api/v1/loyalty/rewards/{id}/redeem`.
- FE maps BE tier, transaction type, reward category, and monthly stats into existing buyer UI labels/shapes.
- Notification context now has BE adapters for:
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/unread-count`
  - `PATCH /api/v1/notifications/{id}/read`
  - `PATCH /api/v1/notifications/read-all`
  - `DELETE /api/v1/notifications/{id}`
- Mock fallback remains only when local BE is unavailable or an endpoint fails.

Verification:

- `GET /api/v1/loyalty/me`: passed locally for default demo user.
- `GET /api/v1/loyalty/me/transactions?page=1&pageSize=5`: passed locally, returned empty page for default demo user.
- `GET /api/v1/loyalty/me/stats`: passed locally.
- `GET /api/v1/loyalty/rewards?page=1&pageSize=5`: passed locally, returned 3 rewards.
- `GET /api/v1/notifications?page=1&pageSize=5`: failed locally with HTTP 500.
- `GET /api/v1/notifications/unread-count`: failed locally with HTTP 500.
- After BE updated notification migrations/controller, local re-test is blocked because `localhost:8080` is down and direct jar startup fails on PostgreSQL connection timeout. Docker startup also timed out in this environment.
- `npm.cmd run build`: passed.

Data:

- Default demo user now auto-creates a loyalty program with 0 points.
- Default demo user has 0 loyalty transactions.
- Customer reward list has 3 active rewards.
- Notification BE endpoint currently fails before FE can verify real notification data.

### Done - Buyer Wishlist And Profile Addresses

Routes / surfaces:

- `/dashboard` wishlist summary
- `/wishlist`
- `/profile` shipping address management

Files changed:

- `src/app/services/api.ts`

BE contracts used:

- `be/docs/BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md`
  - `/users/me/wishlist`
  - `/users/me/addresses`

Implemented behavior:

- Added missing `wishlistApi.get(userId)` alias used by buyer dashboard.
- Wishlist now attempts production route `GET/POST/DELETE /api/v1/users/me/wishlist` first.
- Wishlist falls back to existing legacy BE mock routes under `/api/v1/mock/wishlist*` when production routes are not available.
- Added missing `addressApi.setDefault(id)` used by profile page.
- Address create/update/delete/set-default now attempts `/api/v1/users/me/addresses` first.
- Address local fallback now persists create/update/delete/set-default in-session.

Data:

- Added 10 local fallback shipping addresses for the default demo buyer so `/profile` can be tested even when BE is unavailable.

Verification:

- `npm.cmd run build`: passed.
- `mvn package -DskipTests`: passed after adding production buyer/public endpoints.
- `GET /api/v1/users/me/wishlist`: passed, returned 10 rows for default demo user.
- `GET /api/v1/users/me/addresses`: passed, returned 10 rows for default demo user.

BE completed:

- Added `BuyerPublicController` for production wishlist/address route shape.
- Added 10 wishlist rows and 10 address rows for default demo user.

Next action:

- Re-test notification, wishlist, and address routes after BE + PostgreSQL are running. Then move to remaining buyer pages with incomplete production contracts: reviews, blog/store, and IMEI.

### Done - Buyer Reviews Runtime Wiring

Routes / surfaces:

- `/reviews`
- `/products/:id`
- `/orders/:id`

Files changed:

- `src/app/services/api.ts`

BE contracts used:

- `be/docs/BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md`
  - `GET /products/:productId/reviews`
  - `GET /products/:productId/reviews/stats`
  - `POST /products/:productId/reviews`
  - `PATCH /reviews/:id/helpful`
  - `GET /users/me/reviews`

Implemented behavior:

- Added missing `reviewApi.getByUser(userId)` used by `/reviews`.
- Added missing `reviewApi.getByOrder(orderId)` used by order detail.
- Product detail review list now attempts production `/api/v1/products/{productId}/reviews` first.
- Buyer review list now attempts production `/api/v1/users/me/reviews` first.
- Create/update/delete/helpful adapters attempt production route shape first, then fallback to legacy mock/local data.
- Review DTO mapping normalizes BE/customer field names into existing FE `Review` shape.

Verification:

- `npm.cmd run build`: passed.
- `mvn package -DskipTests`: passed after adding production buyer/public endpoints.
- `GET /api/v1/users/me/reviews`: passed, returned 10 rows for default demo user.
- `GET /api/v1/products/prod-001/reviews?page=1&pageSize=20`: passed, returned 13 rows.
- `GET /api/v1/products/prod-001/reviews/stats`: passed.

BE completed:

- Added production buyer review route shape in `BuyerPublicController`.
- Seeded 10 buyer reviews for the default demo user and 10 additional product reviews for `prod-001`.

Next action:

- Wire remaining public utility pages to production route shapes where possible: blog, store locator, and IMEI. Keep BE gaps explicit for any endpoint only available under `/api/v1/mock`.

### Done - Buyer Public Utilities

Routes / surfaces:

- `/blog`
- Home latest blog section
- `/stores`
- `/imei-check`

Files changed:

- `src/app/services/api.ts`

BE contracts used:

- `be/docs/BE_IMPLEMENTATION_PLAN_FROM_BA_DOCS.md`
  - `GET /blog`
  - `GET /blog/:slug`
  - `GET /stores`
  - `GET /stores/:id/availability`
  - `POST /imei/check`

Implemented behavior:

- Blog list/detail/latest now attempts production `/api/v1/blog` route shape first.
- Store locator now attempts production `/api/v1/stores`.
- Store product availability now attempts `GET /api/v1/stores/{id}/availability?productId=...`.
- IMEI check now attempts `POST /api/v1/imei/check`.
- All three surfaces fall back to legacy `/api/v1/mock/*` or local mock when production endpoints are unavailable.

Verification:

- `npm.cmd run build`: passed.
- `mvn package -DskipTests`: passed after adding production buyer/public endpoints.
- `GET /api/v1/blog?page=1&pageSize=20&isPublished=true`: passed, returned 10 rows.
- `GET /api/v1/stores`: passed, returned 10 rows.
- `GET /api/v1/stores/store-001/availability?productId=prod-001`: passed.
- `POST /api/v1/imei/check`: passed.

BE completed:

- Added production blog/store/IMEI route shape in `BuyerPublicController`.
- Seeded 10 published blog posts and 10 stores for buyer QA.

Next action:

- Once BE + PostgreSQL are up, run end-to-end API re-test for notification, wishlist/address, reviews, blog/store/IMEI and remove legacy fallback reliance where production endpoints pass.

### Done - Wishlist To Cart Runtime Fix

Routes / surfaces:

- `/wishlist`
- `/cart`

Files changed:

- `src/app/components/buyer/BuyerWishlistPage.tsx`
- `src/app/services/api.ts`
- `be/src/main/java/com/b2b/ecommerce/store/BuyerPublicController.java`

Implemented behavior:

- Wishlist page no longer depends on legacy B2B-only fields (`supplierName`, `minOrderQty`, `unit`) being present in the B2C wishlist DTO.
- Add-to-cart from wishlist now uses safe defaults:
  - `supplierId`: `cellphones`
  - `supplierName`: `CELLPHONES`
  - `quantity`: `1`
  - `unit`: `sp`
- `cartApi` keeps demo/non-UUID product ids in local cart state consistently. This avoids losing cart items when `/api/v1/cart` returns an empty production DB cart while demo products use ids like `prod-001`.
- Added production delete-by-wishlist-item endpoint:
  - `DELETE /api/v1/users/me/wishlist/items/{id}`

Verification:

- `DELETE /api/v1/users/me/wishlist/items/{id}`: passed locally, wishlist count changed from 10 to 9.
- `npm.cmd run build`: passed.
- `mvn package -DskipTests`: passed after stopping the running jar that locked the package file.

Remaining note:

- Production cart service requires UUID product ids from the real catalog database. Current buyer demo products still use `prod-001` style ids, so FE intentionally uses local cart fallback for those demo ids. When product catalog fully returns UUID ids, this fallback can remain harmless or be removed.

### Done - Product B2C Runtime Cleanup

Routes / surfaces:

- `/products`
- `/products/:id`
- `/products/compare`

Files changed:

- `src/app/components/buyer/ProductListPage.tsx`
- `src/app/components/buyer/ProductDetailPage.tsx`
- `src/app/components/buyer/ProductComparePage.tsx`

Implemented behavior:

- Product list, detail, and compare pages no longer depend directly on legacy B2B-only product fields: `supplierId`, `supplierName`, `minOrderQty`, and `unit`.
- Added B2C retail display defaults for catalog products:
  - `storeId`: `cellphones`
  - `storeName`: `CELLPHONES`
  - `minQty`: `1`
  - `unit`: `sp`
- Add-to-cart from product list/detail/compare now uses those retail defaults when BE catalog DTO does not provide legacy B2B fields.
- Buyer list/table labels changed away from B2B wording:
  - `Nhà cung cấp` -> `Thương hiệu` or `Đơn vị bán`
  - `MOQ` -> `Đã bán` or `Số lượng mua`
  - Header copy no longer mentions `NCC`.
- Product detail quantity stepper now clamps to retail minimum quantity instead of `product.minOrderQty`.
- Product compare page now shows `Đơn vị bán` and `Số lượng mua` using the same B2C runtime adapter.

Verification:

- `rg` check passed for the three product screens: no direct usages of `product.supplier*`, `product.minOrderQty`, `product.unit`, `p.supplier*`, `p.minOrderQty`, `p.unit`, `MOQ`, `NCC`, or buyer-facing `Nhà cung cấp`.
- `npm.cmd run build`: passed.

Data:

- Existing BE buyer public demo has 10 wishlist rows, 10 addresses, 10 buyer reviews, 10 extra product reviews, 10 blog posts, and 10 stores.
- Catalog still has fewer than 10 active real product records in the BE seed observed earlier. FE now handles the current DTO safely, but BE should expand catalog seed data to at least 10 active products for complete buyer/admin QA.

Next action:

- Continue buyer cleanup by auditing remaining customer-facing screens for B2B wording/runtime assumptions, then prioritize real BE data coverage for catalog/cart/order flows so checkout can be tested without local cart fallback.

### Done - Cart B2C Copy Cleanup

Routes / surfaces:

- `/cart`

Files changed:

- `src/app/components/buyer/CartPage.tsx`

Implemented behavior:

- Removed the old hard-coded `PRODUCT_MOQ` demo rule from cart UI.
- Cart no longer shows B2B wording such as `NCC`, `nhà cung cấp`, or `MOQ`.
- Cart now displays store-oriented labels:
  - `cửa hàng`
  - `Ghi chú cho cửa hàng`
  - `Vận chuyển: CELLPHONES`
  - multi-store order notice uses `đơn giao hàng riêng`
- Empty cart copy now points to CELLPHONES official retail catalog instead of supplier marketplace copy.
- Internal grouping by `supplierId` is preserved for compatibility with the current FE cart/order adapter and BE order contract, but customer-facing language is B2C.

Verification:

- `rg` check passed for `/cart`: no `PRODUCT_MOQ`, `MOQ`, `NCC`, `nhà cung cấp`, `Nhà cung cấp`, `Đặt tối thiểu`, `Ghi chú cho NCC`, or `theo NCC`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this UI cleanup.
- Checkout still depends on the existing catalog/cart/order data issue already documented: production cart requires UUID product ids, while some demo catalog ids are still `prod-001` style.

Next action:

- Continue cleanup on order/payment/invoice/return/warranty buyer screens where B2B wording remains visible, starting with `/orders` and `/orders/:id` because they are closest to checkout completion.

### Done - Buyer Orders B2C Copy Cleanup

Routes / surfaces:

- `/orders`
- `/orders/:id`

Files changed:

- `src/app/components/buyer/OrderListPage.tsx`
- `src/app/components/buyer/OrderDetailPage.tsx`

Implemented behavior:

- Order list table/card now uses `Cửa hàng` instead of `Nhà cung cấp`.
- Order detail cancelled-state help text now says `Liên hệ cửa hàng`.
- Order detail summary now shows `Cửa hàng` as plain retail text instead of linking to `/suppliers/{id}`.
- Completed-order reuse action now displays `Lưu danh sách` and saves a `Danh sách mua...` name instead of exposing `Template` wording to the buyer.
- Runtime BE payloads still preserve `supplierId/supplierName` where current adapters require them for reorder, chat, return, and saved-list compatibility.

Verification:

- `rg` check passed for `/orders` and `/orders/:id`: no customer-facing `NCC`, `Nhà cung cấp`, `nhà cung cấp`, `Template`, or `/suppliers`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this copy/runtime cleanup.
- Buyer order list may still be empty for the default demo user unless BE has seeded customer orders; this remains a data coverage item for full checkout/order QA.

Next action:

- Continue with buyer payment/invoice/return/warranty screens, starting with `/payments` and `/payments/:id` because they still expose `NCC/Nhà cung cấp` wording and are part of the post-checkout admin/customer flow.

### Done - Buyer Payments B2C Copy Cleanup

Routes / surfaces:

- `/payments`
- `/payments/:id`

Files changed:

- `src/app/components/buyer/BuyerPaymentList.tsx`
- `src/app/components/buyer/BuyerPaymentDetail.tsx`

Implemented behavior:

- Payment list/detail no longer show customer-facing `NCC`, `Nhà cung cấp`, or `Công nợ` wording.
- Payment list table/export/search now uses `Cửa hàng`.
- Payment list title changed from `Thanh toán & Công nợ` to `Thanh toán`.
- Stats/chart wording changed from `Tổng công nợ` / `Công nợ` to `Cần thanh toán`.
- Payment detail header, info row, and QR bank account owner now display the B2C store label via safe `CELLPHONES` fallback.
- Runtime BE field `supplierName` is still preserved internally because the current payment DTO uses it.

Verification:

- `rg` check passed for `/payments` and `/payments/:id`: no `Công nợ`, `công nợ`, `congNo`, `NCC`, `Nhà cung cấp`, or `nhà cung cấp`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this copy cleanup.
- Buyer payment pages still depend on BE seeded customer payments to show non-empty production records.

Next action:

- Continue with `/invoices` and `/invoices/:id` because those screens still expose `NCC`/B2B seller wording and are directly linked from orders/payments.

### Done - Buyer Invoices B2C Copy Cleanup

Routes / surfaces:

- `/invoices`
- `/invoices/:id`
- Invoice print preview

Files changed:

- `src/app/components/buyer/BuyerInvoiceListPage.tsx`
- `src/app/components/buyer/BuyerInvoiceDetail.tsx`

Implemented behavior:

- Invoice list table/filter/mobile cards now use `Cửa hàng` instead of `NCC`.
- Invoice list header copy no longer says invoices are received from suppliers.
- Invoice print preview footer changed from `Hệ thống B2B Marketplace` to `Hệ thống bán hàng CELLPHONES`.
- Invoice list/detail use safe display fallbacks:
  - store/company: `CELLPHONES`
  - buyer/customer: `Khách hàng`
- Invoice detail seller card now shows `Bên bán` and `Cửa hàng` instead of `Bên bán (Nhà cung cấp)` / `Công ty`.
- Debit/credit note display labels now use `Cửa hàng` and `CELLPHONES` fallback.
- Legal invoice terms such as `Bên bán`, `Bên mua`, and `MST` remain because they are invoice-specific, not marketplace-specific.

Verification:

- `rg` check passed for `/invoices` and `/invoices/:id`: no `NCC`, `Nhà cung cấp`, `nhà cung cấp`, `B2B Marketplace`, `Công ty`, or `Doanh nghiệp`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this copy cleanup.
- Buyer invoice pages still need BE seeded customer invoices to show non-empty production records.

Next action:

- Continue with buyer after-sales screens, starting with `/returns` and `/returns/:id`, because they still expose `NCC/Nhà cung cấp` wording and are directly connected to delivered orders.

### Done - Buyer Returns B2C Copy Cleanup

Routes / surfaces:

- `/returns`
- `/returns/:id`
- Return quick-detail dialog
- Return CSV export

Files changed:

- `src/app/components/buyer/BuyerReturnListPage.tsx`
- `src/app/components/buyer/BuyerReturnDetail.tsx`

Implemented behavior:

- Return list table, mobile cards, detail dialog, CSV export, and route detail no longer show customer-facing `NCC` or `Nhà cung cấp`.
- Search placeholder now uses `cửa hàng`.
- Return detail header now displays `Cửa hàng: ...`.
- Seller response/note labels changed to `Phản hồi cửa hàng` and `Ghi chú từ cửa hàng`.
- Added safe `CELLPHONES` fallback for return store display.
- Runtime BE fields `supplierId/supplierName` remain preserved internally because the current return DTO and adapters use them.

Verification:

- `rg` check passed for `/returns` and `/returns/:id`: no `NCC`, `Nhà cung cấp`, `nhà cung cấp`, `Ghi chú từ NCC`, or `Phản hồi NCC`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this copy cleanup.
- Buyer returns pages still need BE seeded return records for non-empty production QA.

Next action:

- Continue with `/warranty` because it still exposes `NCC` wording and is the next after-sales screen tied to buyer product ownership.

### Done - Buyer Warranty B2C Copy Cleanup

Routes / surfaces:

- `/warranty`
- Warranty detail dialog
- Warranty claim detail dialog
- Warranty claim create dialog

Files changed:

- `src/app/components/buyer/BuyerWarrantyPage.tsx`

Implemented behavior:

- Warranty table/card/claim form/detail dialogs no longer show customer-facing `NCC` or `Nhà cung cấp`.
- Warranty ownership display now uses `Cửa hàng`, with `CELLPHONES` fallback through `getWarrantyStoreName`.
- Claim resolution label changed from supplier reply wording to `Phản hồi trung tâm bảo hành`.
- Runtime BE fields `sellerId/sellerCompany` remain preserved internally because the current warranty DTO and claim-create adapter use them.

Verification:

- `rg` check passed for `/warranty`: no `NCC`, `Nhà cung cấp`, `nhà cung cấp`, or `Phản hồi NCC`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this copy cleanup.
- Warranty pages still need seeded warranty/claim records for non-empty production QA.

Next action:

- Continue with buyer checkout/review/profile surfaces because `/order-confirmation`, `/reviews`, and `/profile` still expose B2B wording in customer-facing copy.

### Done - Buyer Shared B2C Copy Cleanup

Routes / surfaces:

- `/order-confirmation`
- `/reviews`
- `/profile`
- `/shipments/:id`
- `/login`
- `/register`
- Shared command palette
- Shared search suggestions
- Shared review components
- Shared document center/report builder visible labels

Files changed:

- `src/app/components/buyer/OrderConfirmationPage.tsx`
- `src/app/components/buyer/BuyerReviewsPage.tsx`
- `src/app/components/buyer/BuyerProfilePage.tsx`
- `src/app/components/buyer/BuyerShipmentDetail.tsx`
- `src/app/components/auth/AuthLayout.tsx`
- `src/app/components/auth/RegisterPage.tsx`
- `src/app/components/shared/CommandPalette.tsx`
- `src/app/components/shared/SearchSuggestions.tsx`
- `src/app/components/shared/ReviewComponents.tsx`
- `src/app/components/shared/DocumentCenterPage.tsx`
- `src/app/components/shared/ReportBuilderPage.tsx`

Implemented behavior:

- Checkout confirmation now says `Chờ cửa hàng xác nhận` and uses `CELLPHONES` fallback for store display.
- Review replies now show `Phản hồi cửa hàng`.
- Profile copy now uses personal/customer wording instead of business/supplier wording.
- Shipment detail origin fallback now uses `CELLPHONES`.
- Login/register brand copy no longer advertises a B2B marketplace.
- Command palette and search suggestions route visible store search to `/stores`.
- Shared review supplier wording was mapped to store wording while keeping existing component/API names.
- Document center/report builder visible labels now use `Đơn vị`/`Cửa hàng`.

Verification:

- Buyer component folder visible wording check passed for `NCC`, `Nhà cung cấp`, `nhà cung cấp`, `Doanh nghiệp`, and `Công ty`.
- `npm.cmd run build`: passed.

Data:

- No new BE data required for this copy cleanup.

Next action:

- Audit remaining admin/shared management pages for B2B terminology and decide whether to rename internal supplier-oriented admin modules or keep them as backend-compatible technical surfaces.

### Done - Buyer Procurement Route Exposure Cleanup

Routes / surfaces:

- Product detail store card
- Shared command palette buyer entries
- Buyer route registration audit

Files changed:

- `src/app/components/buyer/ProductDetailPage.tsx`
- `src/app/components/shared/CommandPalette.tsx`

Implemented behavior:

- Product detail no longer links to the old `/suppliers/:id` route; the store action now opens `/stores`.
- Buyer command palette no longer exposes procurement-only pages that are not registered in the current B2C route tree: RFQ, contracts, bulk order, and purchase requisitions.
- Verified buyer routes currently registered for customer flow are B2C surfaces: products, cart, orders, wishlist, reviews, warranty, profile, notifications, loyalty, payments, invoices, returns, and shipments.

Verification:

- `rg "/suppliers"` in component routes now only finds admin source-route/sidebar usage and comments.
- `npm.cmd run build`: passed.

Data:

- No new BE data required.

Next action:

- Continue with source/mock data cleanup for remaining B2B demo content that can still appear as fallback data, especially banners, notifications, document-center mock documents, and email-template seed copy.

### Done - Buyer Promotion Visibility and Product Application

Routes / surfaces:

- `/promotions`
- `/products`
- `/products/:id`
- `/cart`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/ProductListPage.tsx`
- `src/app/components/buyer/CartPage.tsx`

Implemented behavior:

- Buyer promotion API now reads active promotions from live BE `GET /api/v1/promotions` instead of the old mock-only path.
- BE enum types `PERCENTAGE`, `FIXED_AMOUNT`, `BUY_X_GET_Y`, and `FREE_SHIPPING` are normalized for FE display.
- Product detail promotion section now receives BE-backed promotions filtered by product id, category id, or brand.
- Product listing now shows applicable promotion badges and copyable promotion codes per product.
- Cart coupon validation now sends `cartTotal` and enriched `cartItems` to `POST /api/v1/promotions/validate`, so BE can enforce product/category/brand scope.

Verification:

- Local BE check: `GET http://localhost:8080/api/v1/promotions?page=1&pageSize=20` returned 8 active promotions.
- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- Existing BE seed/admin promotions are enough. Promotion appears only when `isActive=true`, current time is between `startDate` and `endDate`, usage limit is not exhausted, and scope matches product id/category id/brand or scope is empty.

Next action:

- Improve admin promotion form UX by replacing raw product/category UUID CSV inputs with searchable product/category selectors, so admin can configure scopes without manually copying ids.

### Done - Product Detail Single Variant Selector Visibility

Routes / surfaces:

- `/products/:id`

Files changed:

- `src/app/components/buyer/ProductDetailPage.tsx`

Implemented behavior:

- Product detail now displays the variant selector whenever BE returns at least one variant, including single-variant products such as `OPPO Demo 01`.
- Variant option now shows variant name, price, and current stock so the buyer can still confirm the selected version before adding to cart.

Verification:

- Local BE check for `OPPO Demo 01` showed one variant: `128GB - Trang`, stock `77`.
- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new data required. If a product should have multiple selectable variants, admin/BE needs to create additional rows through product variant management.

Next action:

- Review admin product variant creation flow and ensure demo products that need multiple choices have at least 2-3 variants with variant-linked images.

### Done - Checkout Must Create Backend Order

Routes / surfaces:

- `/cart`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/CartPage.tsx`

Implemented behavior:

- Checkout confirmation already calls the backend order flow through `handlePlaceOrderWithBackend`.
- Fixed `orderApi.create` so backend-shaped checkout payloads must succeed on `POST /api/v1/orders`; FE no longer falls back to a local mock order when BE rejects the request.
- Cart checkout now surfaces the backend error message in the toast instead of the generic failure message.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.

Data:

- No new data required.

Next action:

- Add an explicit success check in the demo flow: after buyer checkout, open `/orders` or admin `/admin/orders` and verify the new `PENDING` order number appears.

### Done - Cart And Checkout Stock Guard

Routes / surfaces:

- `/products/:id`
- `/products`
- `/cart`

Files changed:

- `src/app/services/api.ts`
- `src/app/components/buyer/ProductDetailPage.tsx`
- `src/app/components/buyer/ProductListPage.tsx`
- `src/app/components/buyer/CartPage.tsx`

Implemented behavior:

- Product detail clamps quantity by selected variant stock before add-to-cart.
- Product detail disables add-to-cart when selected variant has no stock.
- Product listing quick add now sends the first variant id for products that have variants.
- Cart add/update no longer falls back to local mock data when backend rejects a UUID product/item because of stock or variant validation.
- Cart quantity update now shows backend validation errors in toast instead of silently keeping mock behavior.
- Checkout still calls backend cart validation and backend order creation; backend remains the source of truth for stock.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.
- BE `mvn package -DskipTests`: passed.
- BE `mvn test`: blocked by local PostgreSQL connection refused on `localhost:5432`; rerun after DB is running.
- BE `mvn test`: blocked by local PostgreSQL connection refused on `localhost:5432`; rerun when database service is running.

Data:

- No new data required. Existing product variant stock controls whether buyer can add to cart and checkout.

Next action:

- Restart BE after deploying the latest cart validation change, then test demo flow: choose a product variant, add more than stock, update cart above stock, and create checkout order.

### Done - Local Runtime Mock Fallback Lockdown

Routes / surfaces:

- Buyer public and account routes that use `src/app/services/api.ts`
- `/warranty`
- `/loyalty`
- Buyer layout and command palette
- `/orders/:id`

Files changed:

- `src/app/services/api.ts`
- `src/app/services/warrantyApi.ts`
- `src/app/services/loyaltyApi.ts`
- `src/app/components/buyer/BuyerLayout.tsx`
- `src/app/components/buyer/BuyerProfilePage.tsx`
- `src/app/components/buyer/OrderDetailPage.tsx`
- `src/app/components/shared/CommandPalette.tsx`
- `src/app/routes.tsx`

Implemented behavior:

- Local FE no longer silently falls back to mock/local data after backend API failure. Runtime mock fallback is disabled by default and can only be re-enabled explicitly with `VITE_USE_MOCK_FALLBACKS=true`.
- Auth login/register now call backend `/auth/login` and `/auth/register` instead of checking FE `mockUsers`.
- Removed buyer chat route, buyer profile chat button, and AI chatbot from runtime because they were mock-only.
- Removed the mock-only saved-list action from buyer order detail.
- Removed mock-only admin document center and report builder routes from runtime route registration.

Verification:

- `npx.cmd vite build --outDir dist-codex-check --emptyOutDir`: passed.
- BE `mvn package -DskipTests`: passed.

Residual BE note:

- BE auth service is still in-memory/demo-token based. FE now consumes BE auth endpoints, but production auth still needs DB-backed users and real session/JWT handling if required for final hardening.

Next action:

- Restart FE/BE, keep `VITE_USE_MOCK_FALLBACKS` unset, then smoke test login, product list/detail, cart, checkout, order detail, warranty, loyalty, notifications, and admin pages. Any missing BE endpoint should now fail visibly instead of showing fake data.

## Done - Buyer Invoice Promotion Discount - 2026-05-28

- Buyer invoice mapper reads BE `discountAmount`.
- Invoice subtotal is calculated as `totalAmount + discountAmount - taxAmount`.
- Invoice detail and print preview show the promotion discount line before total.

## Done - Real Buyer Registration Wiring - 2026-05-29

- `/register` now sends the full registration payload to BE, including phone, companyName, taxCode, address, and city.
- `authApi.register` consumes the DB-backed `/api/v1/auth/register` response and stores the returned UUID user id in `cellphones_auth_user`.
- Auth mapper now keeps the returned phone so subsequent buyer API calls can pass the dev customer headers consistently.

Next action:

- Restart BE so Flyway applies `V36__auth_credentials.sql`, then smoke test `/register` with a new email and login again with that same password.

## Done - Testcase Route Alias Compatibility - 2026-05-29

- Added FE aliases for old testcase URLs: `/search`, `/category/:slug`, `/account/orders`, `/check-imei`, and `/admin/dashboard`.
- Product listing now reads `q` on `/search?q=...` and keeps the URL in that shape.
- Category alias `/category/:slug` feeds `categorySlug` into the existing product list API query.

Next action:

- Restart FE and BE, then rerun TC12-TC21 and return-flow checks against the real backend.
