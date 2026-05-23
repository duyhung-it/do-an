# FE Shipment Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented shipment table, customer order shipment endpoint, and order status side effects.

BA source:

- `B2B eCommerce Platform Plan/ba-docs/06-api-payments-invoices.md`, shipment object and shipment endpoints
- `B2B eCommerce Platform Plan/ba-docs/10-business-rules.md`, section `5.3`

Security note: auth/RBAC dang tam bo qua. Customer endpoint dung dev header `X-User-Id` de scope order ownership.

## Get Order Shipment

`GET /orders/{id}/shipment`

Available after admin updates order from `CONFIRMED` to `SHIPPING`.

Response:

```json
{
  "data": {
    "id": "c84f629d-5a1a-4da7-99ee-1c84c634ec45",
    "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
    "orderNumber": "CP2026051400001",
    "trackingNumber": "GHTK-CP2026051400001",
    "carrierName": "Giao Hang Tiet Kiem",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2026-05-17",
    "actualDelivery": null,
    "createdAt": "2026-05-14T19:08:00+07:00",
    "updatedAt": "2026-05-14T19:08:00+07:00",
    "customerName": "Nguyen Van A",
    "customerPhone": "0901234567",
    "shippingFee": 0,
    "fromAddress": "CELLPHONES Warehouse, TP. Ho Chi Minh",
    "toAddress": "123 Ly Tu Trong, Ben Nghe, Quan 1, TP. Ho Chi Minh",
    "weight": null,
    "dimensions": null,
    "trackingHistory": [
      {
        "status": "AWAITING_PICKUP",
        "title": "Dang cho lay hang",
        "description": "Don hang CP2026051400001 da tao thong tin van chuyen.",
        "occurredAt": "2026-05-14T19:08:00+07:00"
      },
      {
        "status": "IN_TRANSIT",
        "title": "Dang van chuyen",
        "description": "Don vi van chuyen da nhan hang.",
        "occurredAt": "2026-05-14T19:08:00+07:00"
      }
    ]
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

If shipment has not been created yet:

```json
{
  "success": false,
  "error": {
    "code": "SHIPMENT_NOT_FOUND",
    "message": "Khong tim thay thong tin giao hang",
    "details": {}
  }
}
```

## Shipment Status

| Status | Meaning |
| --- | --- |
| `AWAITING_PICKUP` | Reserved for future carrier pickup flow |
| `IN_TRANSIT` | Created when order moves to `SHIPPING` |
| `DELIVERED` | Set when order moves to `DELIVERED` |
| `FAILED` | Reserved for future failed delivery flow |

## List My Shipments

`GET /shipments?page=1&pageSize=20&status=IN_TRANSIT&search=GHTK`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 100 |
| `status` | string | | `AWAITING_PICKUP`, `IN_TRANSIT`, `DELIVERED`, `FAILED` |
| `search` | string | | search by `orderNumber` or `trackingNumber` |

Response: paginated list of `ShipmentDto`.

## Get My Shipment Detail

`GET /shipments/{id}`

Response: `ShipmentDto`.

`ShipmentDto` includes route/timeline fields for FE shipment detail:

- `customerName`, `customerPhone`
- `shippingFee`
- `fromAddress`, `toAddress`
- `weight`, `dimensions` are present and nullable until carrier/package integration exists
- `trackingHistory[]`: `status`, `title`, `description`, `occurredAt`

Ownership:

- Backend reads current dev user from `X-User-Id`.
- If shipment exists but belongs to another user, backend returns `403 SHIPMENT_ACCESS_DENIED`.

## List Admin Shipments

`GET /admin/shipments?page=1&pageSize=20&status=IN_TRANSIT&search=Nguyen`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 100 |
| `status` | string | | `AWAITING_PICKUP`, `IN_TRANSIT`, `DELIVERED`, `FAILED` |
| `search` | string | | search by `orderNumber`, `trackingNumber`, `customerName`, `customerPhone` |

Response: paginated list of `ShipmentDto`.

## Get Admin Shipment Detail

`GET /admin/shipments/{id}`

Response: `ShipmentDto`.

## Create Admin Shipment

`POST /admin/shipments`

Creates a manual shipment for an order in `CONFIRMED` or `SHIPPING`.

Request:

```json
{
  "orderId": "uuid",
  "trackingNumber": "GHTK-CP2026051600001",
  "carrierName": "Giao Hang Tiet Kiem",
  "status": "AWAITING_PICKUP",
  "estimatedDelivery": "2026-05-20"
}
```

Rules:

- `orderId` is required.
- `trackingNumber`, `carrierName`, `status`, and `estimatedDelivery` are optional.
- Default `trackingNumber` is `GHTK-{orderNumber}`.
- Default `carrierName` is `Giao Hang Tiet Kiem`.
- Default `status` is `AWAITING_PICKUP` for `CONFIRMED` orders and `IN_TRANSIT` for `SHIPPING` orders.
- New shipments can only be created as `AWAITING_PICKUP` or `IN_TRANSIT`.
- `estimatedDelivery` must be `YYYY-MM-DD`; default is current date + 3 days.

Response: `ShipmentDto`.

## Update Admin Shipment Tracking

`PATCH /admin/shipments/{id}`

Request:

```json
{
  "trackingNumber": "GHTK-UPDATED",
  "carrierName": "Giao Hang Nhanh",
  "estimatedDelivery": "2026-05-21"
}
```

Response: `ShipmentDto`.

## Update Admin Shipment Status

`PATCH /admin/shipments/{id}/status`

Request:

```json
{
  "status": "DELIVERED"
}
```

Allowed transitions:

| From | Allowed next |
| --- | --- |
| `AWAITING_PICKUP` | `IN_TRANSIT` |
| `IN_TRANSIT` | `DELIVERED`, `FAILED` |

Side effects:

- If shipment changes `IN_TRANSIT -> DELIVERED` and linked order is `SHIPPING`, backend also marks order `DELIVERED`.
- For COD orders, backend marks payment and invoice paid using the same side effects as admin order `SHIPPING -> DELIVERED`.

## Implemented Side Effects

Admin status `CONFIRMED -> SHIPPING`:

- Creates shipment if missing.
- `trackingNumber = GHTK-{orderNumber}`.
- `carrierName = Giao Hang Tiet Kiem`.
- `status = IN_TRANSIT`.
- `estimatedDelivery = current date + 3 days`.

Admin status `SHIPPING -> DELIVERED`:

- Sets shipment `status = DELIVERED`.
- Sets `actualDelivery = now`.
- Sets `orders.actual_delivery_date = current date`.

## Deferred

- Carrier API integration.
- Real carrier package weight/dimensions integration.

## BA Mapping

| BE behavior | BA source |
| --- | --- |
| Shipment object fields | `06-api-payments-invoices.md`, shared `Shipment Object` |
| `GET /api/v1/orders/{id}/shipment` | `06-api-payments-invoices.md`, section `GET /orders/{orderId}/shipment` |
| `GET /api/v1/shipments` | `06-api-payments-invoices.md`, section `GET /shipments` |
| `GET /api/v1/shipments/{id}` | `06-api-payments-invoices.md`, section `GET /shipments/{id}` |
| `GET /api/v1/admin/shipments` | `06-api-payments-invoices.md`, section `GET /admin/shipments` |
| `GET /api/v1/admin/shipments/{id}` | `06-api-payments-invoices.md`, section `GET /admin/shipments/{id}` |
| `POST /api/v1/admin/shipments` | `06-api-payments-invoices.md`, admin shipment create |
| `PATCH /api/v1/admin/shipments/{id}` | `06-api-payments-invoices.md`, admin shipment tracking edit |
| `PATCH /api/v1/admin/shipments/{id}/status` | `06-api-payments-invoices.md`, section `PATCH /admin/shipments/{id}/status` |
| Create/update shipment on shipping | `10-business-rules.md`, section `5.3` |
