# FE Installment Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for public buyer installment list and calculation.

BA source:

- `B2B eCommerce Platform Plan/ba-docs/05-api-orders.md`, section `5.1 GET /installment-plans`
- `B2B eCommerce Platform Plan/ba-docs/05-api-orders.md`, section `5.2 POST /installment-plans/calculate`

## List Active Plans

`GET /installment-plans`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "ee000000-0003-4000-8000-000000000002",
      "bankName": "FE Credit",
      "logoUrl": "https://cdn.cellphones.vn/installments/fe-credit.png",
      "months": [12],
      "interestRate": 1.80,
      "minAmount": 5000000,
      "maxAmount": 80000000,
      "isActive": true
    }
  ],
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Note: current DB stores one `months` value per plan row. Public response keeps BA-compatible `months: number[]`; FE should read `months[0]` or render all entries in the array.

## Calculate Installment

`POST /installment-plans/calculate`

Request:

```json
{
  "amount": 10000000,
  "planId": "ee000000-0003-4000-8000-000000000002",
  "months": 12
}
```

Response:

```json
{
  "success": true,
  "data": {
    "principal": 10000000,
    "interestRate": 1.80,
    "months": 12,
    "monthlyPayment": 936000,
    "totalInterest": 1232000,
    "totalPayment": 11232000
  },
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

Rules implemented:

- Plan must exist and `isActive = true`.
- `amount >= minAmount`.
- `amount <= maxAmount` when `maxAmount` exists.
- `months` must match the plan row.
- Monthly payment uses BA amortization formula and rounds up to nearest 1,000 VND.

Error codes:

- `INSTALLMENT_PLAN_NOT_FOUND`
- `INSTALLMENT_AMOUNT_TOO_LOW`
- `INSTALLMENT_AMOUNT_TOO_HIGH`
- `INSTALLMENT_MONTHS_INVALID`
- `VALIDATION_ERROR`
