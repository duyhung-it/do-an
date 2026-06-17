# BA To BE/FE Mapping

Source of truth: `B2B eCommerce Platform Plan/ba-docs`

Purpose: map BA docs to implemented backend contracts so FE can wire screens without reading every BA file.

## Global Contract

| Topic | BA source | BE status | FE doc |
| --- | --- | --- | --- |
| Success response shape | `12-error-codes.md`, error/response sections | Done | `be/docs/B2C_API.md` |
| Error response shape | `12-error-codes.md` | Done | `be/docs/B2C_API.md` |
| Pagination object | `04-api-catalog.md`, `05-api-orders.md` patterns | Done | `be/docs/B2C_API.md` |
| Security/RBAC | `11-rbac-security.md` | Deferred by request | Later security contract |
| PostgreSQL | `02-database-design.md` | Done | `be/docs/PROGRESS.md` |

## Catalog

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Category tree/detail | `04-api-catalog.md` | `GET /categories`, `GET /categories/{id}`, `GET /categories/{slug}/by-slug` | Done | `be/docs/FE_CATALOG_CONTRACT.md` |
| Product list/detail/search | `04-api-catalog.md` | `GET /products`, `GET /products/{id}`, `GET /products/{slug}/by-slug` | Done; `categoryId` includes descendants | `be/docs/FE_CATALOG_CONTRACT.md` |
| Home product groups | `04-api-catalog.md` | `/products/featured`, `/hot`, `/new`, `/brands` | Done | `be/docs/FE_CATALOG_CONTRACT.md` |
| Product variants/images | `04-api-catalog.md` | `/products/{productId}/variants`, `/images` | Done | `be/docs/FE_CATALOG_CONTRACT.md` |
| Buyer product combos | `04-api-catalog.md`, product detail upsell | `/combos`, `/combos/{id}`, `/products/{productId}/combos` | Done with typed DTO and seed data | `be/docs/FE_CATALOG_CONTRACT.md` |
| Public stores/availability | `04-api-catalog.md`, stores section | `GET /stores`, `GET /stores/{id}`, `GET /stores/{id}/availability?productId=` | Done with DB-backed branches and branch product inventory | `be/docs/FE_BUYER_BACKEND_GAPS.md` |
| Admin catalog CRUD | `04-api-catalog.md`, `09-api-admin.md` | `/admin/categories`, `/admin/products`, variants/images admin routes, `/admin/products/{productId}/images/reorder`, `/admin/combos`, `/admin/blog` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |

## Cart

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Get cart | `05-api-orders.md`, section `1.1 GET /cart` | `GET /cart` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Add item | `05-api-orders.md`, section `1.2 POST /cart/items` | `POST /cart/items` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Update item | `05-api-orders.md`, section `1.3 PATCH /cart/items/:id` | `PATCH /cart/items/{id}` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Delete/clear cart | `05-api-orders.md`, sections `1.4`, `1.5` | `DELETE /cart/items/{id}`, `DELETE /cart` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Validate cart | `05-api-orders.md`, section `1.6 POST /cart/validate` | `POST /cart/validate` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Merge duplicate item | `10-business-rules.md`, section `2.2.1` | Implemented | Done | `be/docs/FE_CART_CONTRACT.md` |

## Buyer Profile

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Current user profile | `03-api-auth-users.md` User Object, profile endpoints | `GET /users/me`, `PATCH /users/me`, `POST /users/me/avatar`, `GET /users/me/stats` | Done, dev ownership header | `be/docs/FE_BUYER_PROFILE_CONTRACT.md` |
| Saved shipping addresses | `03-api-auth-users.md` ShippingAddress, `05-api-orders.md` `shippingAddressId` | `GET/POST/PATCH/DELETE /users/me/addresses`, `PATCH /users/me/addresses/{id}/set-default`, `POST /orders` with `shippingAddressId` | Done, dev ownership header | `be/docs/FE_BUYER_PROFILE_CONTRACT.md` |
| Wishlist | `04-api-catalog.md`, section `6 Wishlist` | `GET/POST/DELETE /users/me/wishlist`, `DELETE /users/me/wishlist/items/{id}`, `PATCH /users/me/wishlist/{productId}/price-alert` | Done with PostgreSQL table and UUID catalog ids | `be/docs/FE_BUYER_PROFILE_CONTRACT.md` |

## Promotions

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| List active promotions | `05-api-orders.md`, section `2.1 GET /promotions` | `GET /promotions` | Done | `be/docs/FE_PROMOTION_CONTRACT.md` |
| Validate coupon | `05-api-orders.md`, section `2.2 POST /promotions/validate` | `POST /promotions/validate` | Done | `be/docs/FE_PROMOTION_CONTRACT.md` |
| Promotion business rules | `10-business-rules.md`, section `2.3` | Implemented for percentage/fixed amount | Done | `be/docs/FE_PROMOTION_CONTRACT.md` |
| Admin promotion CRUD | `09-api-admin.md` | `GET/POST/PATCH/DELETE /admin/promotions`, `PATCH /admin/promotions/{id}/toggle` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |

## Installments

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Public installment plans | `05-api-orders.md`, sections `5.1`, `5.2` | `GET /installment-plans`, `POST /installment-plans/calculate` | Done | `be/docs/FE_INSTALLMENT_CONTRACT.md` |

## Orders

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Create order | `05-api-orders.md`, section `3.1 POST /orders` | `POST /orders` | Done for first transaction | `be/docs/FE_ORDER_CONTRACT.md` |
| Order number | `10-business-rules.md`, order number rule | Daily sequence table | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Payment placeholder | `05-api-orders.md`, payment object and order create step 6 | `payments` row created | Done for placeholder | `be/docs/FE_ORDER_CONTRACT.md` |
| Status history | `05-api-orders.md`, order create step 7 | first `PENDING` history row | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Clear cart after order | `05-api-orders.md`, order create step 8 | `cart_items` cleared by user | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Get order list/detail | `05-api-orders.md`, sections `3.2`, `3.3` | `GET /orders`, `GET /orders/{id}` | Done; list first item includes product/variant ids | `be/docs/FE_ORDER_CONTRACT.md` |
| Cancel order | `05-api-orders.md`, section `3.4` | `DELETE /orders/{id}/cancel` | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Admin order list/detail | `05-api-orders.md`, sections `4.1`, `4.2` | `GET /admin/orders`, `GET /admin/orders/{id}` | Done, auth deferred | `be/docs/FE_ADMIN_ORDER_CONTRACT.md` |
| Admin status update | `05-api-orders.md`, section `4.3` | `PATCH /admin/orders/{id}/status` | Done, auth deferred | `be/docs/FE_ADMIN_ORDER_CONTRACT.md` |
| Stock reserve/release | `10-business-rules.md`, sections `2.6.1`, `5.2`, `5.5` | `order_stock_reservations`, `product_variants.stock` update | Done minimal | `be/docs/FE_ADMIN_ORDER_CONTRACT.md` |
| Customer order invoice | `05-api-orders.md`, endpoint summary row 13 | `GET /orders/{id}/invoice` | Done with line items and seller/customer metadata | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Invoice creation | `10-business-rules.md`, section `5.3` | create `invoices` row on `CONFIRMED -> SHIPPING` | Done minimal | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Customer payment list/detail | `06-api-payments-invoices.md`, sections `GET /payments`, `GET /payments/{id}` | `GET /payments`, `GET /payments/{id}` | Done, dev ownership header | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Customer payment proof | Buyer bank transfer proof bridge for FE payment detail | `POST /payments/{id}/proof`, `GET /payments/{id}/proofs` | Done, pending admin review | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Customer order shipment | `06-api-payments-invoices.md`, section `GET /orders/{orderId}/shipment` | `GET /orders/{id}/shipment` | Done with route fields and generated tracking timeline | `be/docs/FE_SHIPMENT_CONTRACT.md` |
| Shipment lifecycle | `10-business-rules.md`, section `5.3` | create `shipments` row on `CONFIRMED -> SHIPPING`; mark delivered on `SHIPPING -> DELIVERED` | Done placeholder | `be/docs/FE_SHIPMENT_CONTRACT.md` |
| COD payment paid | `05-api-orders.md`, delivered side effects | mark order/payment/invoice paid on `SHIPPING -> DELIVERED` when `paymentMethod = COD` | Done minimal | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Admin manual mark-paid | `06-api-payments-invoices.md`, section `PATCH /admin/payments/{id}/mark-paid` | `PATCH /admin/payments/{id}/mark-paid` | Done, auth deferred | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Admin mark overdue/refund | `06-api-payments-invoices.md`, sections `PATCH /admin/payments/{id}/mark-overdue`, `POST /admin/payments/{id}/refund` | `PATCH /admin/payments/{id}/mark-overdue`, `POST /admin/payments/{id}/refund` | Done, auth deferred | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Admin order internal notes | `05-api-orders.md`, section `4.4` | `PATCH /admin/orders/{id}/notes` | Done, auth deferred | `be/docs/FE_ADMIN_ORDER_CONTRACT.md` |
| Customer invoice list/detail | `06-api-payments-invoices.md`, sections `GET /invoices`, `GET /invoices/{id}` | `GET /invoices`, `GET /invoices/{id}` | Done with line items, dev ownership header | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Customer invoice PDF download | `06-api-payments-invoices.md`, section `GET /invoices/{id}/download` | `GET /invoices/{id}/download` | Done minimal PDF | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Online payment session/callback | `05-api-orders.md` payment object, `06-api-payments-invoices.md`, `10-business-rules.md` payment side effects | `POST /payments/{id}/gateway-session`, `POST /payments/gateway/callback`, `GET /payments/gateway/return` | Done local MOMO/VNPAY bridge, external provider signing deferred | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Admin invoice operations | `06-api-payments-invoices.md`, admin invoices | `GET/POST /admin/invoices`, `GET /admin/invoices/{id}`, `GET /admin/invoices/{id}/download`, `PATCH /admin/invoices/{id}/status`, `DELETE /admin/invoices/{id}` | Done, auth deferred | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Admin payment list/detail | `06-api-payments-invoices.md`, sections `GET /admin/payments`, `GET /admin/payments/{id}` | `GET /admin/payments`, `GET /admin/payments/{id}` | Done, auth deferred | `be/docs/FE_PAYMENT_INVOICE_CONTRACT.md` |
| Customer shipment list/detail | `06-api-payments-invoices.md`, sections `GET /shipments`, `GET /shipments/{id}` | `GET /shipments`, `GET /shipments/{id}` | Done with route/timeline fields, dev ownership header | `be/docs/FE_SHIPMENT_CONTRACT.md` |
| Admin shipment operations | `06-api-payments-invoices.md`, admin shipments | `GET /admin/shipments`, `GET /admin/shipments/{id}`, `POST /admin/shipments`, `PATCH /admin/shipments/{id}`, `PATCH /admin/shipments/{id}/tracking`, `PATCH /admin/shipments/{id}/status` | Done, auth deferred | `be/docs/FE_SHIPMENT_CONTRACT.md` |

## Customer After-Sales

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Customer returns | `07-api-after-sales.md` | `POST /returns`, `GET /returns`, `GET /returns/{id}` | Done with order/item snapshot, dev ownership header | `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md` |
| Customer warranty items | `07-api-after-sales.md` | `GET /warranty`, `GET /warranty/{id}` | Done, dev ownership header | `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md` |
| Customer warranty claims | `07-api-after-sales.md` | `POST /warranty-claims`, `GET /warranty-claims`, `GET /warranty-claims/{id}` | Done with product snapshot, dev ownership header | `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md` |
| Customer trade-in | `07-api-after-sales.md` | `GET /trade-in/estimate`, `POST /trade-in`, `GET /trade-in`, `GET /trade-in/{id}`, `PATCH /trade-in/{id}/accept`, `PATCH /trade-in/{id}/reject` | Done, dev ownership header | `be/docs/FE_AFTER_SALES_CUSTOMER_CONTRACT.md` |

## Loyalty

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Customer loyalty program | `08-api-loyalty-notifications.md` | `GET /loyalty/me`, `GET /loyalty/me/transactions`, `GET /loyalty/me/stats` | Done, dev ownership header | `be/docs/FE_LOYALTY_CONTRACT.md` |
| Customer loyalty rewards | `08-api-loyalty-notifications.md` | `GET /loyalty/rewards`, `POST /loyalty/rewards/{id}/redeem` | Done, dev ownership header | `be/docs/FE_LOYALTY_CONTRACT.md` |
| Admin loyalty management | `08-api-loyalty-notifications.md` | `GET /admin/loyalty`, `GET /admin/loyalty/{customerId}`, `POST /admin/loyalty/bonus-points` | Done, auth deferred | `be/docs/FE_LOYALTY_CONTRACT.md` |
| Admin loyalty reward CRUD | `08-api-loyalty-notifications.md` | `GET/POST/PATCH/DELETE /admin/loyalty/rewards` | Done, auth deferred | `be/docs/FE_LOYALTY_CONTRACT.md` |
| Delivered order loyalty side effect | `10-business-rules.md`, delivered side effects | `SHIPPING -> DELIVERED` awards `EARN` points once per order | Done minimal | `be/docs/FE_LOYALTY_CONTRACT.md` |
| Loyalty reverse on refund/return | `10-business-rules.md`, refund/return side effects | payment refund or return `REFUNDED` creates one negative `EXPIRE` transaction per order | Done core flow | `be/docs/FE_LOYALTY_CONTRACT.md` |
| Customer notifications | `08-api-loyalty-notifications.md` | `GET /notifications`, `/unread-count`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`, `DELETE /notifications/{id}`, `DELETE /notifications` | Done, dev ownership header | `be/docs/FE_NOTIFICATION_CONTRACT.md` |
| Notification preferences | `08-api-loyalty-notifications.md` | `GET/PATCH /notifications/preferences` | Done, dev ownership header | `be/docs/FE_NOTIFICATION_CONTRACT.md` |
| Automatic notification side effects | `08-api-loyalty-notifications.md`, `10-business-rules.md` | order/payment/loyalty/return/warranty/trade-in side effects insert `app_notifications` | Done core B2C events | `be/docs/FE_NOTIFICATION_CONTRACT.md` |

## Admin Back Office

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Admin dashboard | `09-api-admin.md` | `/admin/dashboard/stats`, `/revenue-chart`, `/recent-orders`, `/recent-activity` | Done, auth deferred | `be/docs/FE_ADMIN_BACKEND_GAPS.md` |
| Inventory management | `09-api-admin.md`, inventory plan | `/admin/inventory`, `/admin/inventory/{id}`, `/adjust`, `/low-stock`, `/movements` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Returns admin | `07-api-after-sales.md` | `/admin/returns`, `/admin/returns/{id}`, `/status`, `/dispute-resolution` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Warranty admin | `07-api-after-sales.md` | `/admin/warranty-claims`, `/admin/warranty-claims/{id}`, `/status` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Review moderation | `07-api-after-sales.md`, `04-api-catalog.md` reviews | `/products/{productId}/reviews`, `/products/{productId}/reviews/stats`, `/users/me/reviews`, `/reviews/{id}/helpful`, `/admin/reviews`, `/approve`, `/hide`, `/status`, `/reply`, delete review | Done with DB-backed buyer reviews, auth deferred | `be/docs/FE_BUYER_BACKEND_GAPS.md`, `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Trade-in admin | `07-api-after-sales.md` | `/admin/trade-in`, `/admin/trade-in/{id}`, `/valuate`, `/complete`, `/status` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Admin reports | `09-api-admin.md` | `/admin/reports/revenue`, `/products`, `/customers`, `/inventory`, `/returns`, `/export` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Admin settings/content | `09-api-admin.md` | `/admin/settings`, `/admin/settings/banners`, `/admin/settings/email-templates`, `/admin/settings/seo`, `/branches`, `/branches/{id}/toggle`, `/staff`, `/staff/{id}`, `/activity-logs` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Admin users | `09-api-admin.md`, `03-api-auth-users.md` | `/admin/users`, `/admin/users/{id}`, `/admin/users/{id}/status` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Admin notifications | `08-api-loyalty-notifications.md`, `09-api-admin.md` | `/admin/notifications/broadcast`, `/admin/notifications/send-to-user` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Suppliers/installments | `09-api-admin.md` | `/admin/suppliers`, `/admin/installment-plans` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |
| Warranty master | `07-api-after-sales.md`, `09-api-admin.md` | `GET/POST /admin/warranty` | Done, auth deferred | `be/docs/FE_ADMIN_GAPS_COMPLETION_CONTRACT.md` |

## Known Dev Bridges

| Area | BA requirement | Current bridge | Reason |
| --- | --- | --- | --- |
| Auth/current user | JWT customer identity | `X-User-Id` header | Security deferred by request |
| Customer snapshot | Read from users table | `customer_profiles` is available for `/users/me`; order create still accepts dev snapshot headers until auth/security is enabled | Partial bridge |
| Shipping address | `shippingAddressId` owned by user | saved `customer_addresses` persisted in PostgreSQL; inline `shippingAddress` remains compatible | Done, dev ownership header |
| Inventory reservation | reserve on `CONFIRMED` | `product_variants.stock` is treated as available stock; reservations tracked in `order_stock_reservations`; admin inventory adjustment writes `stock_movements` | Security/RBAC deferred |
| Payment gateway | online payment URL/callback | local `MOMO`/`VNPAY` session + callback/return bridge; COD paid on delivered; bank transfer manual mark-paid | Real external provider credentials/signature deferred |
| Warranty generation | create warranty item on delivered side effect | auto-create `warranty_items` on `SHIPPING -> DELIVERED`, one item per purchased unit | Done core flow |

## Current Main Flow For FE

1. Load catalog from `FE_CATALOG_CONTRACT.md`.
2. Add/update cart from `FE_CART_CONTRACT.md`.
3. Validate cart with `POST /cart/validate`.
4. List/validate coupon from `FE_PROMOTION_CONTRACT.md`.
5. If user selects installment, load/calculate plans from `FE_INSTALLMENT_CONTRACT.md`.
6. Load profile and saved addresses from `FE_BUYER_PROFILE_CONTRACT.md`, then create order with `POST /orders` using `shippingAddressId` from `FE_ORDER_CONTRACT.md`.
7. Clear FE local cart after order success.
8. Show order history/detail with `GET /orders` and `GET /orders/{id}`.
9. Allow customer cancel with `DELETE /orders/{id}/cancel` while status is `PENDING` or `CONFIRMED`.
10. Admin can operate orders from `FE_ADMIN_ORDER_CONTRACT.md`.
11. Customer can show shipment tracking from `FE_SHIPMENT_CONTRACT.md` after order reaches `SHIPPING`.
12. Customer can request return, view warranty/claims, and submit trade-in from `FE_AFTER_SALES_CUSTOMER_CONTRACT.md`.
13. Customer can view loyalty, redeem rewards, and admin can manage points/rewards from `FE_LOYALTY_CONTRACT.md`.
14. Customer can view notification inbox and preferences from `FE_NOTIFICATION_CONTRACT.md`.
15. For `MOMO`/`VNPAY`, create gateway session from `FE_PAYMENT_INVOICE_CONTRACT.md`, redirect/open `paymentUrl`, then refresh order/payment after return or callback.
