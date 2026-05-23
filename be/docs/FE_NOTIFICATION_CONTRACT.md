# FE Notification Contract

Source: `B2B eCommerce Platform Plan/ba-docs/08-api-loyalty-notifications.md`

Status: DONE on 2026-05-20. All endpoints use standard `ApiResponse`. During security-deferred phase, customer ownership is scoped by `X-User-Id`.

## Customer Notifications

- `GET /api/v1/notifications?page=&pageSize=&isRead=&type=&category=`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}/read`
- `PATCH /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/{id}`
- `DELETE /api/v1/notifications`

List filters:

- `isRead`: `true` or `false`
- `type`: `ORDER`, `PAYMENT`, `PROMOTION`, `LOYALTY`, `SYSTEM`, `REVIEW`
- `category`: free text category

Notification fields: `id`, `userId`, `type`, `title`, `message`, `isRead`, `priority`, `category`, `entityType`, `entityId`, `actionUrl`, `actionLabel`, `isActionable`, `createdAt`, `readAt`.

List response includes `pagination` and `meta.unreadCount`:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "unreadCount": 1
  }
}
```

`GET /notifications/unread-count` response:

```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

`PATCH /notifications/{id}/read` response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isRead": true,
    "readAt": "2026-05-19T22:59:00+07:00"
  }
}
```

`PATCH /notifications/read-all` response:

```json
{
  "success": true,
  "data": {
    "updated": 12
  }
}
```

`DELETE /notifications` deletes read notifications only and returns:

```json
{
  "success": true,
  "data": {
    "deleted": 8
  }
}
```

## Notification Preferences

- `GET /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/preferences`

Preference fields: `id`, `userId`, `type`, `label`, `enabled`, `channel`.

Default preferences are auto-created on first `GET /notifications/preferences`:

- Types: `ORDER`, `PAYMENT`, `PROMOTION`, `LOYALTY`, `SYSTEM`, `REVIEW`
- Channels: `inApp`, `email`

Update request:

```json
{
  "preferences": [
    {
      "type": "LOYALTY",
      "enabled": false,
      "channel": "inApp"
    },
    {
      "type": "PROMOTION",
      "enabled": false,
      "channel": "email"
    }
  ]
}
```

Rules:

- `ORDER`, `PAYMENT`, `SYSTEM` cannot be disabled on `inApp`.
- Invalid mandatory disable returns `NOTIFICATION_PREFERENCE_REQUIRED`.
- Response returns only preferences included in the update request.

## Admin Link

Admin already creates notifications through:

- `POST /api/v1/admin/notifications/send-to-user`
- `POST /api/v1/admin/notifications/broadcast`

FE can use admin send-to-user to seed/test customer inbox locally.

## Automatic Notifications

Backend now creates in-app notifications during core B2C side effects. FE only needs to refresh:

- `GET /api/v1/notifications/unread-count`
- `GET /api/v1/notifications?page=1&pageSize=20`

Generated events:

| Flow | Type | Category | Entity |
| --- | --- | --- | --- |
| Order created | `ORDER` | `order_created` | `entityType=ORDER`, `entityId=orderId` |
| Customer/admin order cancelled | `ORDER` | `order_cancelled` or `order_status` | `ORDER` |
| Admin order status update | `ORDER` | `order_status` | `ORDER` |
| Shipment delivered updates order | `ORDER` | `order_delivered` | `ORDER` |
| COD/admin/gateway payment paid | `PAYMENT` | `payment` | `ORDER` |
| Gateway payment failed/cancelled | `PAYMENT` | `payment` | `ORDER` |
| Payment refunded | `PAYMENT` | `payment` | `ORDER` |
| Loyalty points awarded on delivered order | `LOYALTY` | `loyalty` | `ORDER` |
| Customer return created / admin return status update | `SYSTEM` | `returns` | `RETURN` |
| Customer warranty claim created / admin warranty status update | `SYSTEM` | `warranty` | `WARRANTY_CLAIM` |
| Customer accepts/rejects trade-in valuation | `SYSTEM` | `trade_in` | `TRADE_IN` |

Action URLs are FE-facing paths such as `/orders/{orderId}`, `/returns/{id}`, `/warranty-claims/{id}`, `/trade-in/{id}`, `/loyalty`.

## Verification

- `mvn test`: passed, 20 tests.
- Flyway current version: `22`.
