# FE Payment & Invoice Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented payment side effects, customer payment list/detail, invoice metadata, and admin manual mark-paid.

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
    "createdAt": "2026-05-14T08:28:11+07:00"
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
- If payment method is not `COD`, no gateway/manual payment action is implemented yet.

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
- `refundAmount <= paidAmount`, otherwise backend returns `REFUND_AMOUNT_EXCEEDS_PAID`.
- Supported `method`: `BANK_TRANSFER`, `MOMO`, `VNPAY`, `CASH`.
- Backend sets `payments.status = REFUNDED`.
- Backend sets `orders.paymentStatus = REFUNDED`.

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

- Admin shipment create/tracking-edit endpoints. Admin shipment list/detail/status is documented in `be/docs/FE_SHIPMENT_CONTRACT.md`.

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
