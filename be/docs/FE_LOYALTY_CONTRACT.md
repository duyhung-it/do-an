# FE Loyalty Contract

Source: `B2B eCommerce Platform Plan/ba-docs/08-api-loyalty-notifications.md`

Status: DONE on 2026-05-17. All endpoints use standard `ApiResponse`. During security-deferred phase, customer ownership is scoped by `X-User-Id`; customer name/email can be passed with `X-User-Name`, `X-User-Email`.

## Customer Loyalty

- `GET /api/v1/loyalty/me`
- `GET /api/v1/loyalty/me/transactions?page=&pageSize=&type=`
- `GET /api/v1/loyalty/me/stats`
- `GET /api/v1/loyalty/rewards?page=&pageSize=&category=`
- `POST /api/v1/loyalty/rewards/{id}/redeem`

Transaction `type`: `EARN`, `REDEEM`, `EXPIRE`, `BONUS`.

Reward `category`: `VOUCHER`, `GIFT`, `SERVICE`, `UPGRADE`.

Program fields: `id`, `customerId`, `customerName`, `customerEmail`, `tier`, `tierLabel`, `points`, `totalEarnedPoints`, `totalSpend`, `joinedAt`, `pointsExpiry`, `nextTierThreshold`, `nextTierName`, `nextTierLabel`, `pointsToNextTier`, `tierBenefits`.

Reward fields: `id`, `name`, `description`, `pointsCost`, `category`, `available`, `stock`, `imageUrl`, `createdAt`, `updatedAt`.

Redeem response fields: `rewardCode`, `reward`, `newPoints`, `transaction`.

Rules:

- Backend auto-creates a loyalty program when `/loyalty/me` is called for a customer without one.
- `points` is current usable balance.
- `totalEarnedPoints` is historical earned/bonus total for tier calculation and is not reduced by redeem.
- Redeem is transactional: subtract points, decrement finite stock, create transaction, create redemption code.
- Delivered orders award `EARN` points once per order.

Tier thresholds:

- `BRONZE`: `0-999`
- `SILVER`: `1000-4999`
- `GOLD`: `5000-19999`
- `DIAMOND`: `20000+`

## Admin Loyalty

- `GET /api/v1/admin/loyalty?page=&pageSize=&tier=&search=`
- `GET /api/v1/admin/loyalty/{customerId}`
- `POST /api/v1/admin/loyalty/bonus-points`
- `GET /api/v1/admin/loyalty/rewards?page=&pageSize=`
- `POST /api/v1/admin/loyalty/rewards`
- `PATCH /api/v1/admin/loyalty/rewards/{id}`
- `DELETE /api/v1/admin/loyalty/rewards/{id}`

Bonus request:

```json
{
  "customerIds": ["bc000000-0001-4000-8000-000000000003"],
  "points": 500,
  "description": "Thuong diem sinh nhat"
}
```

Reward create/update request:

```json
{
  "name": "Voucher giam 100.000 VND",
  "description": "Ap dung cho don hang tu 500.000 VND tro len.",
  "pointsCost": 400,
  "category": "VOUCHER",
  "available": true,
  "stock": 50,
  "imageUrl": "https://cdn.cellphones.vn/rewards/voucher-100k.jpg"
}
```

Admin detail returns: `program`, `recentTransactions`, `redemptions`.

## QA Seeds

- Customer with loyalty data: `X-User-Id = bc000000-0001-4000-8000-000000000003`.
- Reward for redeem QA: `dd000000-0003-4000-8000-000000000001`.
- Admin reward list includes hidden reward `dd000000-0003-4000-8000-000000000004`; customer reward list does not show hidden rewards.
