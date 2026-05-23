# FE Buyer Profile Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for saved shipping addresses. Auth/RBAC is still deferred; use `X-User-Id` during local integration.

BA source:

- `B2B eCommerce Platform Plan/ba-docs/03-api-auth-users.md`
- `B2B eCommerce Platform Plan/ba-docs/05-api-orders.md`

## Current User Profile

All endpoints are customer-scoped by `X-User-Id`.

Implemented endpoints:

- `GET /users/me`
- `PATCH /users/me`
- `POST /users/me/avatar`
- `GET /users/me/stats`

`GET /users/me` response:

```json
{
  "id": "00000000-0000-4000-8000-000000000199",
  "fullName": "Demo Buyer",
  "email": "buyer.demo@cellphones.local",
  "phone": "0900000199",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "avatarUrl": "https://cdn.cellphones.vn/users/demo-buyer.png",
  "address": "1 Demo Street, TP. Ho Chi Minh",
  "dateOfBirth": null,
  "gender": null,
  "emailVerified": true,
  "phoneVerified": true,
  "loyaltyPoints": 3200,
  "totalOrders": 10,
  "totalSpent": 38990000,
  "lastLoginAt": null,
  "createdAt": "2026-05-23T22:19:37.000+07:00",
  "updatedAt": "2026-05-23T22:19:37.000+07:00"
}
```

`PATCH /users/me` request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@gmail.com",
  "phone": "0901234567",
  "avatarUrl": "https://cdn.cellphones.vn/users/a.png",
  "address": "123 Ly Tu Trong",
  "dateOfBirth": "1998-01-20",
  "gender": "OTHER"
}
```

`POST /users/me/avatar` request:

```json
{
  "avatarUrl": "https://cdn.cellphones.vn/users/a.png"
}
```

`GET /users/me/stats` response:

```json
{
  "totalOrders": 10,
  "totalSpent": 38990000,
  "loyaltyPoints": 3200
}
```

Rules implemented:

- Profile data is persisted in PostgreSQL table `customer_profiles`.
- Demo customer `00000000-0000-4000-8000-000000000199` is seeded by Flyway `V27__customer_profiles.sql`.
- Stats are calculated from `orders` and `loyalty_programs`.
- Security is still deferred; `X-User-Id` remains the temporary identity bridge.

## Saved Shipping Addresses

All endpoints are customer-scoped by `X-User-Id`.

Implemented endpoints:

- `GET /users/me/addresses`
- `POST /users/me/addresses`
- `PATCH /users/me/addresses/{id}`
- `DELETE /users/me/addresses/{id}`
- `PATCH /users/me/addresses/{id}/set-default`

Response item:

```json
{
  "id": "dd000000-0199-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000199",
  "label": "Nha rieng",
  "fullName": "Demo Buyer",
  "recipientName": "Demo Buyer",
  "phone": "0900000199",
  "address": "1 Demo Street",
  "addressLine": "1 Demo Street",
  "ward": "Phuong 1",
  "district": "Quan 1",
  "city": "TP. Ho Chi Minh",
  "province": "TP. Ho Chi Minh",
  "country": "Viet Nam",
  "postalCode": null,
  "type": "HOME",
  "isDefault": true,
  "notes": "Buyer demo saved address 1",
  "createdAt": "2026-05-23T21:53:35.000+07:00",
  "updatedAt": "2026-05-23T21:53:35.000+07:00"
}
```

Create/update request:

```json
{
  "label": "Nha rieng",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "address": "123 Ly Tu Trong",
  "ward": "Ben Nghe",
  "district": "Quan 1",
  "city": "TP. Ho Chi Minh",
  "country": "Viet Nam",
  "type": "HOME",
  "isDefault": true,
  "notes": "Giao gio hanh chinh"
}
```

Rules implemented:

- Data is persisted in PostgreSQL table `customer_addresses`.
- Only one default address per user is allowed.
- If the first address is created without `isDefault`, backend makes it default.
- Demo customer `00000000-0000-4000-8000-000000000199` has 10 seeded addresses from Flyway `V26__customer_addresses.sql`.

## Checkout With Saved Address

`POST /orders` now accepts BA field `shippingAddressId`.

Request:

```json
{
  "items": [
    {
      "productId": "b1b2c3d4-0001-0001-0001-000000000002",
      "variantId": "c1b2c3d4-0001-0001-0001-000000000003",
      "quantity": 1
    }
  ],
  "shippingAddressId": "dd000000-0199-4000-8000-000000000001",
  "paymentMethod": "COD"
}
```

Backend validates address ownership by `X-User-Id`, snapshots it into `orders.shipping_address`, and stores `orders.shipping_address_id`.

Inline `shippingAddress` remains supported for FE compatibility.
