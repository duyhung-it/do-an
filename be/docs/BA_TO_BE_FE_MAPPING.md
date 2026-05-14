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
| Product list/detail/search | `04-api-catalog.md` | `GET /products`, `GET /products/{id}`, `GET /products/{slug}/by-slug` | Done | `be/docs/FE_CATALOG_CONTRACT.md` |
| Home product groups | `04-api-catalog.md` | `/products/featured`, `/hot`, `/new`, `/brands` | Done | `be/docs/FE_CATALOG_CONTRACT.md` |
| Product variants/images | `04-api-catalog.md` | `/products/{productId}/variants`, `/images` | Done | `be/docs/FE_CATALOG_CONTRACT.md` |
| Admin catalog CRUD | `04-api-catalog.md`, `09-api-admin.md` | `/admin/categories`, `/admin/products`, variants/images admin routes | Done, auth deferred | `be/docs/FE_CATALOG_CONTRACT.md` |

## Cart

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Get cart | `05-api-orders.md`, section `1.1 GET /cart` | `GET /cart` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Add item | `05-api-orders.md`, section `1.2 POST /cart/items` | `POST /cart/items` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Update item | `05-api-orders.md`, section `1.3 PATCH /cart/items/:id` | `PATCH /cart/items/{id}` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Delete/clear cart | `05-api-orders.md`, sections `1.4`, `1.5` | `DELETE /cart/items/{id}`, `DELETE /cart` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Validate cart | `05-api-orders.md`, section `1.6 POST /cart/validate` | `POST /cart/validate` | Done | `be/docs/FE_CART_CONTRACT.md` |
| Merge duplicate item | `10-business-rules.md`, section `2.2.1` | Implemented | Done | `be/docs/FE_CART_CONTRACT.md` |

## Promotions

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| List active promotions | `05-api-orders.md`, section `2.1 GET /promotions` | `GET /promotions` | Done | `be/docs/FE_PROMOTION_CONTRACT.md` |
| Validate coupon | `05-api-orders.md`, section `2.2 POST /promotions/validate` | `POST /promotions/validate` | Done | `be/docs/FE_PROMOTION_CONTRACT.md` |
| Promotion business rules | `10-business-rules.md`, section `2.3` | Implemented for percentage/fixed amount | Done | `be/docs/FE_PROMOTION_CONTRACT.md` |

## Orders

| BA area | BA source | BE endpoints | Status | FE doc |
| --- | --- | --- | --- | --- |
| Create order | `05-api-orders.md`, section `3.1 POST /orders` | `POST /orders` | Done for first transaction | `be/docs/FE_ORDER_CONTRACT.md` |
| Order number | `10-business-rules.md`, order number rule | Daily sequence table | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Payment placeholder | `05-api-orders.md`, payment object and order create step 6 | `payments` row created | Done for placeholder | `be/docs/FE_ORDER_CONTRACT.md` |
| Status history | `05-api-orders.md`, order create step 7 | first `PENDING` history row | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Clear cart after order | `05-api-orders.md`, order create step 8 | `cart_items` cleared by user | Done | `be/docs/FE_ORDER_CONTRACT.md` |
| Get order list/detail | `05-api-orders.md`, sections `3.2`, `3.3` | `GET /orders`, `GET /orders/{id}` | Done |
| Cancel order | `05-api-orders.md`, section `3.4` | Not yet | Later |
| Admin status update | `05-api-orders.md`, admin order sections | Not yet | Next after list/detail |

## Known Dev Bridges

| Area | BA requirement | Current bridge | Reason |
| --- | --- | --- | --- |
| Auth/current user | JWT customer identity | `X-User-Id` header | Security deferred by request |
| Customer snapshot | Read from users table | `X-User-Name`, `X-User-Email`, `X-User-Phone` headers | User module not implemented yet |
| Shipping address | `shippingAddressId` owned by user | inline `shippingAddress` object | Address module not implemented yet |
| Inventory reservation | reserve on `CONFIRMED` | create order validates stock only | Order status flow/admin confirm not implemented yet |
| Payment gateway | online payment URL/callback | payment row placeholder | Gateway deferred |

## Current Main Flow For FE

1. Load catalog from `FE_CATALOG_CONTRACT.md`.
2. Add/update cart from `FE_CART_CONTRACT.md`.
3. Validate cart with `POST /cart/validate`.
4. List/validate coupon from `FE_PROMOTION_CONTRACT.md`.
5. Create order with `POST /orders` from `FE_ORDER_CONTRACT.md`.
6. Clear FE local cart after order success.
