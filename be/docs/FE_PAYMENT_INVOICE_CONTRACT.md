# FE Payment & Invoice Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented payment side effects, customer payment list/detail, invoice metadata, admin manual mark-paid, local `MOMO` gateway bridge, and signed VNPay sandbox payment URL/return verification.

BA source:

- `B2B eCommerce Platform Plan/ba-docs/06-api-payments-invoices.md`
- `B2B eCommerce Platform Plan/ba-docs/10-business-rules.md`, sections `5.3`, `5.4`, `5.5`

Security note: auth/RBAC dang tam bo qua. Customer invoice endpoint dung dev header `X-User-Id` de scope order ownership.

## List My Payments

`GET /payments?page=1&pageSize=20&status=UNPAID&search=CP20260514`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 100 |
| `status` | string | | `UNPAID`, `PAID`, `OVERDUE`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED` |
| `search` | string | | case-insensitive search by `orderNumber` |

Response uses global pagination shape:

```json
{
  "data": [
    {
      "id": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
      "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
      "orderNumber": "CP2026051400001",
      "customerId": "00000000-0000-4000-8000-000000000199",
      "amount": 520000,
      "paidAmount": 0,
      "remainingAmount": 520000,
      "dueDate": "2026-05-17",
      "status": "UNPAID",
      "method": "BANK_TRANSFER",
      "transactionRef": null,
      "paidAt": null,
      "createdAt": "2026-05-14T19:12:00+07:00"
    }
  ],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "error": null
}
```

## Get My Payment Detail

`GET /payments/{id}`

Response: same `CustomerPaymentDto` object as list item.

Ownership:

- Backend reads current dev user from `X-User-Id`.
- If payment exists but belongs to another user, backend returns `403 PAYMENT_ACCESS_DENIED`.

## Submit Customer Payment Proof

`POST /payments/{id}/proof`

Use this when buyer uploads/submits a bank-transfer proof URL. This does not mark the payment as paid; admin still confirms via `PATCH /admin/payments/{id}/mark-paid`.

Request:

```json
{
  "proofUrl": "https://cdn.cellphones.vn/payment-proofs/proof-001.jpg",
  "note": "Khach da chuyen khoan, cho admin xac nhan",
  "amount": 520000,
  "method": "BANK_TRANSFER",
  "transactionRef": "PROOF-20260523-001"
}
```

Response `PaymentProofDto`:

```json
{
  "id": "9b2d4c6e-2ef9-4fd9-9a0b-caf0ad541001",
  "paymentId": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
  "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
  "customerId": "00000000-0000-4000-8000-000000000199",
  "proofUrl": "https://cdn.cellphones.vn/payment-proofs/proof-001.jpg",
  "note": "Khach da chuyen khoan, cho admin xac nhan",
  "amount": 520000,
  "method": "BANK_TRANSFER",
  "transactionRef": "PROOF-20260523-001",
  "status": "PENDING_REVIEW",
  "createdAt": "2026-05-23T14:12:00+07:00"
}
```

Rules:

- Backend validates ownership with `X-User-Id`.
- `PAID` payments return `PAYMENT_ALREADY_PAID`.
- `REFUNDED` and `PARTIALLY_REFUNDED` payments return `PAYMENT_REFUNDED`.
- `transactionRef` is unique when provided.
- If `amount` is missing or `<= 0`, backend stores current `remainingAmount`.

## List Customer Payment Proofs

`GET /payments/{id}/proofs`

Response: array of `PaymentProofDto`, newest first.

## Create Online Payment Session

`POST /payments/{id}/gateway-session`

Use this after `POST /orders` when `data.payment.method` is `MOMO` or `VNPAY`.

Headers:

| Header | Note |
| --- | --- |
| `X-User-Id` | dev ownership bridge, must match payment owner |

Request:

```json
{
  "provider": "VNPAY",
  "returnUrl": "http://localhost:5173/payment-result?paymentId=97500820-9f45-4c9b-afaf-fbb52c9709f5&provider=VNPAY",
  "callbackUrl": "http://localhost:8080/api/v1/payments/gateway/callback",
  "ipAddress": "127.0.0.1",
  "locale": "vn",
  "bankCode": "VNBANK",
  "orderType": "other"
}
```

Optional VNPay fields:

| Field | Note |
| --- | --- |
| `ipAddress` | Customer IP sent as `vnp_IpAddr`; defaults to `127.0.0.1` if omitted. |
| `locale` | `vn` or `en`; defaults to `vn`. |
| `bankCode` | Optional VNPay bank/payment method code such as `VNPAYQR`, `VNBANK`, `INTCARD`. |
| `orderType` | VNPay order category; defaults to `other`. |

Response:

```json
{
  "data": {
    "id": "b2ad8cb5-6cfb-49d6-a09e-f88b5d1b4ed1",
    "paymentId": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
    "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
    "provider": "VNPAY",
    "requestId": "VNPAY20260529f2a9d1b364624b0b8e2c",
    "transactionRef": null,
    "amount": 33490000,
    "status": "PENDING",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=3349000000&...&vnp_SecureHash=...",
    "returnUrl": "http://localhost:5173/payment-result?paymentId=97500820-9f45-4c9b-afaf-fbb52c9709f5&provider=VNPAY",
    "callbackUrl": "http://localhost:8080/api/v1/payments/gateway/callback",
    "paidAt": null,
    "createdAt": "2026-05-20T00:26:08+07:00"
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Rules:

- `provider` must be `MOMO` or `VNPAY`.
- `provider` must match `payment.method`.
- Payment owner only; other `X-User-Id` returns `403 PAYMENT_ACCESS_DENIED`.
- If a pending session already exists for the same payment/provider, backend returns it instead of creating a duplicate.
- For `VNPAY`, `paymentUrl` is a signed sandbox redirect URL using HMAC-SHA512 over sorted `vnp_*` params.
- FE sends `returnUrl` as `/payment-result?paymentId={paymentId}&provider=VNPAY`; backend persists this URL on the gateway session.
- For `MOMO`, `paymentUrl` remains the local dev return bridge until real MOMO credentials are configured later.
- VNPay config is read from env/properties:
  - `VNPAY_PAY_URL`, default `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
  - `VNPAY_TMN_CODE`, configured sandbox default `VZ5ZPNQT`
  - `VNPAY_HASH_SECRET`, configured sandbox default `ZGAWKRS0JM60P0HQALQU9Q5M2FQDYA4T`
  - `VNPAY_RETURN_URL`, default `http://localhost:8080/api/v1/payments/gateway/return`
  - `VNPAY_EXPIRE_MINUTES`, default `15`
- Override `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET` by env if switching to another VNPay sandbox merchant.
- BE intentionally rejects VNPay session creation with `SERVICE_UNAVAILABLE` while `VNPAY_TMN_CODE=DEMOV210` or `VNPAY_HASH_SECRET=VNPAY_SANDBOX_HASH_SECRET_CHANGE_ME`, because those are documentation placeholders and VNPay will show a generic error page if FE redirects users with them.

## Gateway Callback / Return

`POST /payments/gateway/callback`

Request:

```json
{
  "provider": "MOMO",
  "requestId": "MOMO-20260520-4a844a3d-2f8b-4f8a-9f62-33cc6bb9b64a",
  "transactionRef": "MOMO-TEST-001",
  "status": "SUCCESS",
  "amount": 33490000,
  "signature": "optional-for-dev"
}
```

`GET /payments/gateway/return?provider=MOMO&requestId={requestId}&status=SUCCESS&transactionRef=MOMO-TEST-001&amount=33490000`

VNPay sandbox redirects back to the same return endpoint with official `vnp_*` query params, for example:

`GET /payments/gateway/return?vnp_TmnCode=...&vnp_TxnRef={requestId}&vnp_Amount={amount*100}&vnp_ResponseCode=00&vnp_TransactionStatus=00&vnp_TransactionNo=...&vnp_SecureHash=...`

Response for both callback and return:

```json
{
  "data": {
    "requestId": "MOMO-20260520-4a844a3d-2f8b-4f8a-9f62-33cc6bb9b64a",
    "provider": "MOMO",
    "status": "PAID",
    "transactionRef": "MOMO-TEST-001",
    "amount": 33490000,
    "paymentId": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
    "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
    "payment": {
      "id": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
      "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
      "orderNumber": "CP2026052000001",
      "customerId": "00000000-0000-4000-8000-000000000199",
      "amount": 33490000,
      "paidAmount": 33490000,
      "remainingAmount": 0,
      "dueDate": "2026-05-23",
      "status": "PAID",
      "method": "MOMO",
      "transactionRef": "MOMO-TEST-001",
      "paidAt": "2026-05-20T00:26:20+07:00",
      "createdAt": "2026-05-20T00:25:55+07:00"
    }
  }
}
```

Callback status mapping:

| Input status | Session status | Payment side effect |
| --- | --- | --- |
| `SUCCESS`, `PAID` | `PAID` | `payments.status = PAID`, `orders.payment_status = PAID`, invoice becomes `PAID` if already created |
| `FAILED` | `FAILED` | payment remains unpaid/overdue |
| `CANCELLED`, `CANCELED` | `CANCELLED` | payment remains unpaid/overdue |

Callback is idempotent: repeated callback for the same `requestId` returns the already-paid payment and does not double count.

VNPay return verification:

- Backend verifies `vnp_SecureHash` with configured `VNPAY_HASH_SECRET`.
- `vnp_TxnRef` maps to `payment_gateway_sessions.request_id`.
- `vnp_Amount` must equal `session.amount * 100`.
- `vnp_ResponseCode=00` and `vnp_TransactionStatus=00` mark the session/payment/order as `PAID`.
- `vnp_ResponseCode=24` maps to `CANCELLED`; other non-success codes map to `FAILED`.
- Invalid signature returns `PAYMENT_GATEWAY_SIGNATURE_INVALID`.
- After VNPay return is verified and payment/order are synced, `GET /payments/gateway/return` redirects with HTTP `302` to the session `returnUrl` when it exists.
- Redirect target includes final identifiers/status, for example: `http://localhost:5173/payment-result?paymentId={paymentId}&provider=VNPAY&requestId={requestId}&orderId={orderId}&status={PAID|FAILED|CANCELLED}`.
- If `returnUrl` is missing, keep the JSON response above for API testing.
- FE route `/payment-result` treats query params as hints only, then calls `GET /payments/{paymentId}` and/or `GET /orders/{orderId}` to display the backend verified state.

## List My Invoices

`GET /invoices?page=1&pageSize=20&status=PENDING&search=CP20260514`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 100 |
| `status` | string | | `PENDING`, `PAID`, `OVERDUE`, `CANCELLED` |
| `search` | string | | search by `orderNumber` or `invoiceNumber` |

Response: paginated list of `InvoiceDto`.

## Get My Invoice Detail

`GET /invoices/{id}`

Response: `InvoiceDto`.

`InvoiceDto` now includes print/detail fields so FE does not need display fallbacks for invoice detail:

- `customerEmail`, `customerPhone`
- `discountAmount`: tiền khuyến mãi snapshot từ order; `totalAmount` là số phải thu sau khuyến mãi.
- `invoiceType`: currently `ORDER`
- `sellerName`, `sellerTaxCode`, `sellerAddress`
- `notes`
- `lines[]`: `productId`, `variantId`, `productName`, `productImage`, `variantName`, `sku`, `quantity`, `unitPrice`, `originalPrice`, `discount`, `totalPrice`

Ownership:

- Backend reads current dev user from `X-User-Id`.
- If invoice exists but belongs to another user, backend returns `403 INVOICE_ACCESS_DENIED`.

## Download My Invoice PDF

`GET /invoices/{id}/download`

Response is binary, not `ApiResponse`.

Headers:

| Header | Value |
| --- | --- |
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename="{invoiceNumber}.pdf"` |

Current implementation generates a minimal PDF directly from invoice metadata. Template-based rendering can replace this later without changing the endpoint contract.

## List Admin Invoices

`GET /admin/invoices?page=1&pageSize=20&status=PENDING&search=Nguyen`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 100 |
| `status` | string | | `PENDING`, `PAID`, `OVERDUE`, `CANCELLED` |
| `search` | string | | search by `invoiceNumber`, `orderNumber`, `customerName`, `customerPhone` |

Response: paginated list of `InvoiceDto`.

## Get Admin Invoice Detail

`GET /admin/invoices/{id}`

Response: `InvoiceDto`.

## Download Admin Invoice PDF

`GET /admin/invoices/{id}/download`

Response is binary `application/pdf`, same filename rule as customer invoice download.

## Update Admin Invoice Status

`PATCH /admin/invoices/{id}/status`

Request:

```json
{
  "status": "PAID"
}
```

Supported status: `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`.

If status is `PAID`, backend sets `paidAt` when it is still null.

## Get Order Invoice

`GET /orders/{id}/invoice`

Available after admin updates order from `CONFIRMED` to `SHIPPING`.

Response:

```json
{
  "data": {
    "id": "4b32cc6a-d7fd-43f1-9d8f-931e84262f33",
    "invoiceNumber": "INV-20260514-001",
    "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
    "orderNumber": "CP2026051400001",
    "customerId": "00000000-0000-4000-8000-000000000199",
    "customerName": "Nguyen Van A",
    "totalAmount": 33490000,
    "taxAmount": 0,
    "status": "PENDING",
    "issueDate": "2026-05-14",
    "dueDate": "2026-05-17",
    "paidAt": null,
    "createdAt": "2026-05-14T08:28:11+07:00",
    "customerEmail": "nguyenvana@gmail.com",
    "customerPhone": "0901234567",
    "invoiceType": "ORDER",
    "sellerName": "CELLPHONES",
    "sellerTaxCode": "0310000000",
    "sellerAddress": "350-352 Vo Van Kiet, Quan 1, TP. Ho Chi Minh",
    "notes": "Giao hang gio hanh chinh",
    "lines": [
      {
        "productId": "b1b2c3d4-0001-0001-0001-000000000001",
        "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
        "productName": "iPhone 15 Pro Max 256GB",
        "productImage": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
        "variantName": "256GB - Titan Tu Nhien",
        "sku": "IP15PM-256-TN",
        "quantity": 1,
        "unitPrice": 33990000,
        "originalPrice": 36990000,
        "discount": 0,
        "totalPrice": 33990000
      }
    ]
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

If invoice has not been created yet:

```json
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_AVAILABLE",
    "message": "Hoa don chua kha dung",
    "details": {}
  }
}
```

## Implemented Side Effects

Order create:

- Creates `payments` row.
- `payments.status = UNPAID`.
- `orders.paymentStatus = UNPAID`.

Admin status `CONFIRMED -> SHIPPING`:

- Creates `invoices` row if it does not exist.
- `invoiceNumber = INV-yyyyMMdd-3-digit daily sequence`.
- `invoices.status = PENDING`.
- `issueDate = current date`.
- `dueDate = current date + 3 days`.

Admin status `SHIPPING -> DELIVERED`:

- If `paymentMethod = COD`:
  - `payments.status = PAID`
  - `payments.paidAmount = amount`
  - `payments.remainingAmount = 0`
  - `payments.paidAt = now`
  - `orders.paymentStatus = PAID`
  - `invoices.status = PAID`
  - `invoices.paidAt = now`
- If payment method is `MOMO` or `VNPAY`, FE can use gateway session/callback endpoints above.
- If payment method is `BANK_TRANSFER`, admin/manual mark-paid flow is available.

Order cancel:

- Existing invoice is set to `CANCELLED`.
- Payment refund flow is not implemented yet.

## Admin Mark Payment Paid

`PATCH /admin/payments/{id}/mark-paid`

Request:

```json
{
  "paidAmount": 520000,
  "transactionRef": "TXN-VCB-TEST-001",
  "method": "BANK_TRANSFER"
}
```

Response:

```json
{
  "data": {
    "id": "97500820-9f45-4c9b-afaf-fbb52c9709f5",
    "orderId": "8c2f5d3b-5a3d-4a0d-a7cc-568f0b0ddcc1",
    "orderNumber": "CP2026051400001",
    "customerId": "00000000-0000-4000-8000-000000000199",
    "customerName": "Nguyen Van A",
    "customerPhone": "0901234567",
    "amount": 520000,
    "paidAmount": 520000,
    "remainingAmount": 0,
    "dueDate": "2026-05-17",
    "status": "PAID",
    "method": "BANK_TRANSFER",
    "transactionRef": "TXN-VCB-TEST-001",
    "paidAt": "2026-05-14T08:35:00+07:00",
    "createdAt": "2026-05-14T08:30:00+07:00"
  },
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Rules:

- `paidAmount` must be greater than 0.
- Supported `method`: `CASH`, `BANK_TRANSFER`, `MOMO`, `VNPAY`, `COD`.
- Backend adds `paidAmount` to existing `payments.paidAmount`.
- `transactionRef` is unique in `payments`; duplicate refs return a conflict error.
- If total paid reaches `payments.amount`, backend sets:
  - `payments.status = PAID`
  - `payments.remainingAmount = 0`
  - `payments.paidAt = now`
  - `orders.paymentStatus = PAID`
  - `invoices.status = PAID` and `invoices.paidAt = now` if invoice already exists and is pending.
- If payment is already `PAID`, backend returns `PAYMENT_ALREADY_PAID`.

## List Admin Payments

`GET /admin/payments?page=1&pageSize=20&status=UNPAID&method=BANK_TRANSFER&search=Nguyen`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | max 100 |
| `status` | string | | `UNPAID`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED` |
| `method` | string | | `CASH`, `BANK_TRANSFER`, `MOMO`, `VNPAY`, `COD`, `INSTALLMENT` |
| `search` | string | | search by `orderNumber`, `customerName`, `customerPhone` |

Response: paginated list of `AdminPaymentDto`.

## Get Admin Payment Detail

`GET /admin/payments/{id}`

Response: `AdminPaymentDto`.

## Mark Admin Payment Overdue

`PATCH /admin/payments/{id}/mark-overdue`

Rules:

- `PAID` payments return `PAYMENT_ALREADY_PAID`.
- `REFUNDED` or `PARTIALLY_REFUNDED` payments return `PAYMENT_REFUNDED`.
- Other payments are set to `OVERDUE`.

Response: `AdminPaymentDto` with `status = OVERDUE`.

## Refund Admin Payment

`POST /admin/payments/{id}/refund`

Request:

```json
{
  "refundAmount": 520000,
  "reason": "Khach huy don sau khi da thanh toan",
  "method": "BANK_TRANSFER"
}
```

Rules:

- Payment must be `PAID`, otherwise backend returns `PAYMENT_NOT_PAID`.
- `refundAmount > 0`.
- `refundAmount + existing refundAmount <= paidAmount`, otherwise backend returns `REFUND_AMOUNT_EXCEEDS_PAID`.
- Supported `method`: `BANK_TRANSFER`, `MOMO`, `VNPAY`, `CASH`.
- Partial refund is supported:
  - if cumulative refund amount is lower than `paidAmount`, backend sets `payments.status = PARTIALLY_REFUNDED` and `orders.paymentStatus = PARTIALLY_REFUNDED`.
  - if cumulative refund amount equals `paidAmount`, backend sets `payments.status = REFUNDED` and `orders.paymentStatus = REFUNDED`.
- Backend stores cumulative `payments.refundAmount`.
- If the order previously awarded loyalty points, backend creates one `EXPIRE` loyalty transaction only when payment reaches full `REFUNDED`.

Response: `AdminPaymentDto` with refund fields:

```json
{
  "status": "REFUNDED",
  "refundAmount": 520000,
  "refundReason": "Khach huy don sau khi da thanh toan",
  "refundMethod": "BANK_TRANSFER",
  "refundedAt": "2026-05-14T22:07:00+07:00"
}
```

## Deferred

- Real external MOMO credentials/signature verification.
- Production VNPay credential rotation/IPN hardening beyond sandbox return verification.
- Security/RBAC is still deferred by request; customer ownership currently uses `X-User-Id`.

## BA Mapping

| BE behavior | BA source |
| --- | --- |
| Payment row on order create | `05-api-orders.md`, order create step 6 |
| Invoice object fields | `06-api-payments-invoices.md`, shared `Invoice Object` |
| `GET /api/v1/orders/{id}/invoice` | `05-api-orders.md`, endpoint summary row 13 |
| Invoice creation on shipping | `10-business-rules.md`, section `5.3` |
| COD paid on delivered | `05-api-orders.md`, section `4.3`, delivered side effects |
| `GET /api/v1/payments` | `06-api-payments-invoices.md`, section `GET /payments` |
| `GET /api/v1/payments/{id}` | `06-api-payments-invoices.md`, section `GET /payments/{id}` |
| `POST /api/v1/payments/{id}/proof` | Customer bank transfer proof bridge for FE buyer payment detail |
| `GET /api/v1/payments/{id}/proofs` | Customer proof history for payment detail |
| `GET /api/v1/invoices` | `06-api-payments-invoices.md`, section `GET /invoices` |
| `GET /api/v1/invoices/{id}` | `06-api-payments-invoices.md`, section `GET /invoices/{id}` |
| `GET /api/v1/invoices/{id}/download` | `06-api-payments-invoices.md`, section `GET /invoices/{id}/download` |
| `GET /api/v1/admin/invoices` | `06-api-payments-invoices.md`, section `GET /admin/invoices` |
| `GET /api/v1/admin/invoices/{id}` | `06-api-payments-invoices.md`, section `GET /admin/invoices/{id}` |
| `GET /api/v1/admin/invoices/{id}/download` | `06-api-payments-invoices.md`, section `GET /invoices/{id}/download`, admin scoped |
| `PATCH /api/v1/admin/invoices/{id}/status` | `06-api-payments-invoices.md`, admin invoice status control |
| `GET /api/v1/admin/payments` | `06-api-payments-invoices.md`, section `GET /admin/payments` |
| `GET /api/v1/admin/payments/{id}` | `06-api-payments-invoices.md`, section `GET /admin/payments/{id}` |
| `PATCH /api/v1/admin/payments/{id}/mark-paid` | `06-api-payments-invoices.md`, section `PATCH /admin/payments/{id}/mark-paid` |
| `PATCH /api/v1/admin/payments/{id}/mark-overdue` | `06-api-payments-invoices.md`, section `PATCH /admin/payments/{id}/mark-overdue` |
| `POST /api/v1/admin/payments/{id}/refund` | `06-api-payments-invoices.md`, section `POST /admin/payments/{id}/refund` |
| Loyalty reverse on refund | `10-business-rules.md`, refund/return side effects |
| `POST /api/v1/payments/{id}/gateway-session` | BA online payment URL expectation from order/payment object |
| `POST /api/v1/payments/gateway/callback` | BA payment status synchronization/business side effect |
| `GET /api/v1/payments/gateway/return` | FE/dev return bridge for online payment flow |
