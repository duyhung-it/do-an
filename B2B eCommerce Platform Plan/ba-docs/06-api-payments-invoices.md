# 06 - API Specification: Payments, Invoices & Shipments

> **Phiên bản tài liệu:** 1.0
> **Ngày tạo:** 2026-05-12
> **Người soạn:** BA Team
> **Dành cho:** Backend Developer (Java Spring Boot)
> **Platform:** CELLPHONES B2C eCommerce

---

## Quy ước chung

| Mục | Quy ước |
|-----|---------|
| **Base URL** | `/api/v1` |
| **Content-Type** | `application/json` (trừ khi ghi chú riêng) |
| **Authentication** | JWT Bearer Token trong header `Authorization: Bearer <token>` |
| **Ký hiệu field** | `*` = bắt buộc (required), `?` = tuỳ chọn (optional) |
| **Múi giờ** | UTC+7 (Việt Nam), datetime format: `ISO 8601` |
| **Tiền tệ** | VND (số nguyên, không thập phân) |
| **UUID** | `java.util.UUID` format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### HTTP Status Codes sử dụng

| Code | Ý nghĩa |
|------|---------|
| `200 OK` | Thành công, trả về dữ liệu |
| `201 Created` | Tạo mới thành công |
| `204 No Content` | Thành công, không có dữ liệu trả về |
| `400 Bad Request` | Dữ liệu đầu vào không hợp lệ |
| `401 Unauthorized` | Chưa xác thực hoặc token không hợp lệ |
| `403 Forbidden` | Không có quyền truy cập |
| `404 Not Found` | Không tìm thấy resource |
| `409 Conflict` | Xung đột dữ liệu |
| `422 Unprocessable Entity` | Validation thất bại |
| `500 Internal Server Error` | Lỗi server |

### Cấu trúc Response lỗi chuẩn

Mọi lỗi đều trả về theo cấu trúc sau. Tham chiếu mã lỗi đầy đủ tại `12-error-codes.md`.

```json
{
  "success": false,
  "errorCode": "PAYMENT_NOT_FOUND",
  "message": "Không tìm thấy thông tin thanh toán",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/payments/abc-123"
}
```

### Cấu trúc Response thành công chuẩn

```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}
```

### Cấu trúc PaginatedResponse

```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

---

## Shared Schemas

### Payment Object

Đối tượng thanh toán dùng chung trong các API trả về thông tin payment.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID bản ghi thanh toán |
| `orderId` | `UUID` | ID đơn hàng liên kết |
| `orderNumber` | `string` | Mã đơn hàng hiển thị (vd: `ORD-20240115-001`) |
| `customerId` | `UUID` | ID khách hàng |
| `amount` | `long` | Tổng số tiền cần thanh toán (VND) |
| `paidAmount` | `long` | Số tiền đã thanh toán (VND) |
| `remainingAmount` | `long` | Số tiền còn lại chưa thanh toán (VND) |
| `dueDate` | `string` | Hạn thanh toán, ISO 8601 |
| `status` | `enum` | `UNPAID` \| `PAID` \| `OVERDUE` \| `REFUNDED` |
| `method` | `enum?` | `CASH` \| `BANK_TRANSFER` \| `MOMO` \| `VNPAY` \| `COD` |
| `transactionRef` | `string?` | Mã tham chiếu giao dịch từ bên thứ ba |
| `paidAt` | `string?` | Thời điểm thanh toán hoàn tất, ISO 8601 |
| `createdAt` | `string` | Thời điểm tạo bản ghi, ISO 8601 |

### Invoice Object

Đối tượng hoá đơn dùng chung.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID hoá đơn |
| `invoiceNumber` | `string` | Số hoá đơn (vd: `INV-20240115-001`) |
| `orderId` | `UUID` | ID đơn hàng |
| `orderNumber` | `string` | Mã đơn hàng |
| `customerId` | `UUID` | ID khách hàng |
| `customerName` | `string` | Họ tên khách hàng |
| `totalAmount` | `long` | Tổng tiền trước thuế (VND) |
| `taxAmount` | `long` | Tiền thuế VAT (VND) |
| `status` | `enum` | `PENDING` \| `PAID` \| `OVERDUE` \| `CANCELLED` |
| `issueDate` | `string` | Ngày phát hành hoá đơn, ISO 8601 |
| `dueDate` | `string` | Hạn thanh toán, ISO 8601 |
| `paidAt` | `string?` | Thời điểm thanh toán, ISO 8601 |
| `createdAt` | `string` | Thời điểm tạo, ISO 8601 |

### Shipment Object

Đối tượng vận chuyển dùng chung.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID vận đơn |
| `orderId` | `UUID` | ID đơn hàng |
| `orderNumber` | `string` | Mã đơn hàng |
| `trackingNumber` | `string` | Mã vận đơn của đơn vị vận chuyển |
| `carrierName` | `string` | Tên đơn vị vận chuyển (vd: `Giao Hàng Tiết Kiệm`) |
| `status` | `enum` | `AWAITING_PICKUP` \| `IN_TRANSIT` \| `DELIVERED` \| `FAILED` |
| `estimatedDelivery` | `string?` | Ngày giao dự kiến, ISO 8601 date |
| `actualDelivery` | `string?` | Ngày giao thực tế, ISO 8601 datetime |
| `createdAt` | `string` | Thời điểm tạo vận đơn |
| `updatedAt` | `string` | Lần cập nhật gần nhất |

### InventoryItem Object

Đối tượng tồn kho dùng chung.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID bản ghi tồn kho |
| `productId` | `UUID` | ID sản phẩm |
| `variantId` | `UUID?` | ID variant (màu sắc, bộ nhớ...) |
| `productName` | `string` | Tên sản phẩm |
| `brand` | `string` | Thương hiệu |
| `sku` | `string` | Mã SKU |
| `currentStock` | `int` | Số lượng tồn kho hiện tại |
| `minStock` | `int` | Ngưỡng tồn kho tối thiểu (cảnh báo) |
| `costPrice` | `long` | Giá nhập (VND) |
| `sellingPrice` | `long` | Giá bán (VND) |
| `status` | `enum` | `IN_STOCK` \| `LOW_STOCK` \| `OUT_OF_STOCK` |
| `lastUpdated` | `string` | Lần cập nhật tồn kho gần nhất, ISO 8601 |

### StockMovement Object

Đối tượng lịch sử biến động tồn kho.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID bản ghi biến động |
| `productId` | `UUID` | ID sản phẩm |
| `variantId` | `UUID?` | ID variant |
| `productName` | `string` | Tên sản phẩm |
| `type` | `enum` | `IMPORT` \| `EXPORT` \| `ADJUST` \| `RETURN` |
| `quantity` | `int` | Số lượng thay đổi (dương = nhập, âm = xuất) |
| `previousStock` | `int` | Tồn kho trước khi thay đổi |
| `newStock` | `int` | Tồn kho sau khi thay đổi |
| `reason` | `string` | Lý do thay đổi |
| `orderId` | `UUID?` | ID đơn hàng liên quan (nếu có) |
| `performedBy` | `UUID` | ID admin/staff thực hiện |
| `createdAt` | `string` | Thời điểm ghi nhận biến động |

---

## Section 1: Payments (Customer)

Nhóm API cho phép khách hàng tra cứu lịch sử và thông tin thanh toán đơn hàng của mình.

---

### `GET /payments`

**Mô tả:** Lấy danh sách bản ghi thanh toán của khách hàng đang đăng nhập (có phân trang, lọc theo trạng thái).

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `status` | `enum` | Không | Lọc theo trạng thái: `UNPAID` \| `PAID` \| `OVERDUE` \| `REFUNDED` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "a1b2c3d4-0001-0000-0000-000000000001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
        "orderNumber": "ORD-20240115-001",
        "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
        "amount": 15990000,
        "paidAmount": 0,
        "remainingAmount": 15990000,
        "dueDate": "2024-01-22T23:59:59+07:00",
        "status": "UNPAID",
        "method": null,
        "transactionRef": null,
        "paidAt": null,
        "createdAt": "2024-01-15T10:30:00+07:00"
      },
      {
        "id": "a1b2c3d4-0001-0000-0000-000000000002",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
        "orderNumber": "ORD-20240110-002",
        "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
        "amount": 23990000,
        "paidAmount": 23990000,
        "remainingAmount": 0,
        "dueDate": "2024-01-17T23:59:59+07:00",
        "status": "PAID",
        "method": "BANK_TRANSFER",
        "transactionRef": "TXN-VCB-20240112-88821",
        "paidAt": "2024-01-12T14:22:00+07:00",
        "createdAt": "2024-01-10T09:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `400` | `VALIDATION_ERROR` | Query parameter không hợp lệ |

**Ghi chú nghiệp vụ:**
- API chỉ trả về payment của chính khách hàng đang đăng nhập, được lọc bởi `customerId` lấy từ JWT claims.
- Kết quả được sắp xếp mặc định theo `createdAt` giảm dần (mới nhất trước).

---

### `GET /payments/{id}`

**Mô tả:** Lấy chi tiết một bản ghi thanh toán theo ID. Khách hàng chỉ có thể xem payment của chính mình.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi thanh toán |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
    "orderNumber": "ORD-20240110-002",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "amount": 23990000,
    "paidAmount": 23990000,
    "remainingAmount": 0,
    "dueDate": "2024-01-17T23:59:59+07:00",
    "status": "PAID",
    "method": "BANK_TRANSFER",
    "transactionRef": "TXN-VCB-20240112-88821",
    "paidAt": "2024-01-12T14:22:00+07:00",
    "createdAt": "2024-01-10T09:00:00+07:00"
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Payment không thuộc về khách hàng này |
| `404` | `PAYMENT_NOT_FOUND` | Không tìm thấy bản ghi thanh toán với ID đã cho |

**Ghi chú nghiệp vụ:**
- Server phải so sánh `payment.customerId` với `customerId` trong JWT. Nếu không khớp, trả về `403 ACCESS_DENIED` (không phải `404`) để tránh lộ thông tin tồn tại của resource.

---

## Section 2: Invoices (Customer)

Nhóm API cho phép khách hàng xem và tải xuống hoá đơn của mình.

---

### `GET /invoices`

**Mô tả:** Lấy danh sách hoá đơn của khách hàng đang đăng nhập.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `status` | `enum` | Không | Lọc theo trạng thái: `PENDING` \| `PAID` \| `OVERDUE` \| `CANCELLED` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "c3d4e5f6-0001-0000-0000-000000000001",
        "invoiceNumber": "INV-20240115-001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
        "orderNumber": "ORD-20240110-002",
        "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
        "customerName": "Nguyễn Văn An",
        "totalAmount": 23990000,
        "taxAmount": 2399000,
        "status": "PAID",
        "issueDate": "2024-01-12T00:00:00+07:00",
        "dueDate": "2024-01-17T23:59:59+07:00",
        "paidAt": "2024-01-12T14:22:00+07:00",
        "createdAt": "2024-01-12T10:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |

**Ghi chú nghiệp vụ:**
- Chỉ trả về hoá đơn thuộc `customerId` lấy từ JWT.
- Sắp xếp mặc định: `issueDate` giảm dần.

---

### `GET /invoices/{id}`

**Mô tả:** Lấy chi tiết một hoá đơn, bao gồm danh sách sản phẩm trong đơn hàng liên kết.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID hoá đơn |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-0001-0000-0000-000000000001",
    "invoiceNumber": "INV-20240115-001",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
    "orderNumber": "ORD-20240110-002",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "an.nguyen@email.com",
    "customerPhone": "0901234567",
    "shippingAddress": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "totalAmount": 23990000,
    "taxAmount": 2399000,
    "grandTotal": 26389000,
    "status": "PAID",
    "issueDate": "2024-01-12T00:00:00+07:00",
    "dueDate": "2024-01-17T23:59:59+07:00",
    "paidAt": "2024-01-12T14:22:00+07:00",
    "createdAt": "2024-01-12T10:00:00+07:00",
    "items": [
      {
        "productId": "d4e5f6a7-0001-0000-0000-000000000001",
        "productName": "iPhone 15 Pro Max 256GB Titan Đen",
        "sku": "IPH15PM-256-BLK",
        "quantity": 1,
        "unitPrice": 23990000,
        "subtotal": 23990000
      }
    ]
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Hoá đơn không thuộc về khách hàng này |
| `404` | `INVOICE_NOT_FOUND` | Không tìm thấy hoá đơn với ID đã cho |

**Ghi chú nghiệp vụ:**
- Field `items` được join từ bảng `order_items` qua `orderId`.
- `grandTotal = totalAmount + taxAmount`.

---

### `GET /invoices/{id}/download`

**Mô tả:** Tải xuống hoá đơn dưới dạng file PDF. Response trả về binary stream, không phải JSON.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID hoá đơn |

**Request:** Không có body.

**Response `200 OK`:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-20240115-001.pdf"
Content-Length: 45123

<binary PDF data>
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Hoá đơn không thuộc về khách hàng này |
| `404` | `INVOICE_NOT_FOUND` | Không tìm thấy hoá đơn với ID đã cho |
| `500` | `PDF_GENERATION_FAILED` | Lỗi khi sinh file PDF |

**Ghi chú nghiệp vụ:**
- Server sử dụng thư viện PDF (vd: iText, JasperReports) để render hoá đơn từ template.
- Tên file trong `Content-Disposition` được lấy từ `invoiceNumber`.
- Hoá đơn bị `CANCELLED` vẫn có thể tải về nhưng sẽ có watermark "ĐÃ HUỶ".

---

## Section 3: Shipments (Customer)

Nhóm API cho phép khách hàng theo dõi trạng thái vận chuyển đơn hàng.

---

### `GET /shipments`

**Mô tả:** Lấy danh sách vận đơn của các đơn hàng thuộc khách hàng đang đăng nhập.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `status` | `enum` | Không | Lọc trạng thái: `AWAITING_PICKUP` \| `IN_TRANSIT` \| `DELIVERED` \| `FAILED` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "e5f6a7b8-0001-0000-0000-000000000001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
        "orderNumber": "ORD-20240110-002",
        "trackingNumber": "GHTK-20240113-99001",
        "carrierName": "Giao Hàng Tiết Kiệm",
        "status": "DELIVERED",
        "estimatedDelivery": "2024-01-16",
        "actualDelivery": "2024-01-15T15:40:00+07:00",
        "createdAt": "2024-01-13T08:00:00+07:00",
        "updatedAt": "2024-01-15T15:40:00+07:00"
      },
      {
        "id": "e5f6a7b8-0001-0000-0000-000000000002",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
        "orderNumber": "ORD-20240115-001",
        "trackingNumber": "GHTK-20240116-99002",
        "carrierName": "Giao Hàng Tiết Kiệm",
        "status": "IN_TRANSIT",
        "estimatedDelivery": "2024-01-18",
        "actualDelivery": null,
        "createdAt": "2024-01-16T09:00:00+07:00",
        "updatedAt": "2024-01-17T11:20:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |

**Ghi chú nghiệp vụ:**
- Query join từ bảng `shipments` với bảng `orders` theo điều kiện `orders.customerId = :currentUserId`.
- Sắp xếp mặc định: `createdAt` giảm dần.

---

### `GET /shipments/{id}`

**Mô tả:** Lấy chi tiết một vận đơn theo ID. Khách hàng chỉ xem được vận đơn của đơn hàng thuộc mình.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID vận đơn |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "trackingNumber": "GHTK-20240116-99002",
    "carrierName": "Giao Hàng Tiết Kiệm",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2024-01-18",
    "actualDelivery": null,
    "createdAt": "2024-01-16T09:00:00+07:00",
    "updatedAt": "2024-01-17T11:20:00+07:00"
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Vận đơn không thuộc đơn hàng của khách hàng này |
| `404` | `SHIPMENT_NOT_FOUND` | Không tìm thấy vận đơn với ID đã cho |

---

### `GET /orders/{orderId}/shipment`

**Mô tả:** Lấy thông tin vận đơn theo ID đơn hàng. Tiện lợi khi khách hàng đang ở trang chi tiết đơn hàng và muốn xem thông tin vận chuyển.

**Yêu cầu xác thực:** Bearer Token — Role `CUSTOMER`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `orderId` | `UUID` | ID đơn hàng |

**Request:** Không có body.

**Response `200 OK`:** Trả về Shipment Object như `GET /shipments/{id}`.

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "trackingNumber": "GHTK-20240116-99002",
    "carrierName": "Giao Hàng Tiết Kiệm",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2024-01-18",
    "actualDelivery": null,
    "createdAt": "2024-01-16T09:00:00+07:00",
    "updatedAt": "2024-01-17T11:20:00+07:00"
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Đơn hàng không thuộc về khách hàng này |
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng với ID đã cho |
| `404` | `SHIPMENT_NOT_FOUND` | Đơn hàng tồn tại nhưng chưa có vận đơn (chưa được giao cho đơn vị vận chuyển) |

**Ghi chú nghiệp vụ:**
- Nếu đơn hàng tồn tại và thuộc về khách hàng nhưng chưa có shipment (đơn hàng còn ở trạng thái `PENDING` hoặc `CONFIRMED`), trả về `404 SHIPMENT_NOT_FOUND`.
- Frontend nên kiểm tra order status trước khi gọi endpoint này.

---

## Section 4: Admin - Payments

Nhóm API quản lý thanh toán dành cho ADMIN. Cho phép xem toàn bộ thanh toán hệ thống và thực hiện các thao tác nghiệp vụ.

---

### `GET /admin/payments`

**Mô tả:** Lấy danh sách tất cả bản ghi thanh toán trong hệ thống, hỗ trợ tìm kiếm, lọc và sắp xếp.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `sortBy` | `string` | Không | Field sắp xếp: `createdAt` (mặc định), `amount`, `dueDate`, `paidAt` |
| `sortDir` | `enum` | Không | Chiều sắp xếp: `ASC` \| `DESC` (mặc định `DESC`) |
| `status` | `enum` | Không | Lọc trạng thái: `UNPAID` \| `PAID` \| `OVERDUE` \| `REFUNDED` |
| `search` | `string` | Không | Tìm kiếm theo mã đơn hàng (`orderNumber`) hoặc tên khách hàng (`customerName`) |
| `dateFrom` | `date` | Không | Lọc từ ngày (tính theo `createdAt`), format `YYYY-MM-DD` |
| `dateTo` | `date` | Không | Lọc đến ngày (tính theo `createdAt`), format `YYYY-MM-DD` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "a1b2c3d4-0001-0000-0000-000000000001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
        "orderNumber": "ORD-20240115-001",
        "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
        "customerName": "Nguyễn Văn An",
        "amount": 15990000,
        "paidAmount": 0,
        "remainingAmount": 15990000,
        "dueDate": "2024-01-22T23:59:59+07:00",
        "status": "OVERDUE",
        "method": null,
        "transactionRef": null,
        "paidAt": null,
        "createdAt": "2024-01-15T10:30:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 87,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

> **Lưu ý:** Response admin bao gồm thêm field `customerName` so với response customer.

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |

---

### `GET /admin/payments/{id}`

**Mô tả:** Lấy chi tiết đầy đủ một bản ghi thanh toán theo ID, không giới hạn theo khách hàng.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi thanh toán |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-0001-0000-0000-000000000001",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "an.nguyen@email.com",
    "customerPhone": "0901234567",
    "amount": 15990000,
    "paidAmount": 0,
    "remainingAmount": 15990000,
    "dueDate": "2024-01-22T23:59:59+07:00",
    "status": "OVERDUE",
    "method": null,
    "transactionRef": null,
    "paidAt": null,
    "createdAt": "2024-01-15T10:30:00+07:00"
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `PAYMENT_NOT_FOUND` | Không tìm thấy bản ghi thanh toán |

---

### `PATCH /admin/payments/{id}/mark-paid`

**Mô tả:** Admin ghi nhận khoản thanh toán đã nhận được từ khách hàng (xác nhận thủ công sau khi kiểm tra chuyển khoản).

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi thanh toán |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `paidAmount` | `long` | Có | Số tiền thanh toán lần này (VND, > 0) |
| `transactionRef` | `string` | Có | Mã tham chiếu giao dịch (mã chuyển khoản, mã MOMO...) |
| `method` | `enum` | Có | Phương thức: `CASH` \| `BANK_TRANSFER` \| `MOMO` \| `VNPAY` \| `COD` |

```json
{
  "paidAmount": 15990000,
  "transactionRef": "TXN-VCB-20240123-55599",
  "method": "BANK_TRANSFER"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-0001-0000-0000-000000000001",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "amount": 15990000,
    "paidAmount": 15990000,
    "remainingAmount": 0,
    "dueDate": "2024-01-22T23:59:59+07:00",
    "status": "PAID",
    "method": "BANK_TRANSFER",
    "transactionRef": "TXN-VCB-20240123-55599",
    "paidAt": "2024-01-23T09:15:00+07:00",
    "createdAt": "2024-01-15T10:30:00+07:00"
  },
  "message": "Xác nhận thanh toán thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `PAYMENT_NOT_FOUND` | Không tìm thấy bản ghi thanh toán |
| `400` | `PAYMENT_ALREADY_PAID` | Thanh toán đã ở trạng thái PAID, không thể cập nhật |
| `400` | `PAYMENT_REFUNDED` | Thanh toán đã bị hoàn trả, không thể cập nhật |
| `422` | `VALIDATION_ERROR` | `paidAmount` <= 0 hoặc thiếu field bắt buộc |

**Side Effects (Tác động nghiệp vụ):**

1. Cập nhật `payment.paidAmount += paidAmount` và tính lại `payment.remainingAmount = payment.amount - payment.paidAmount`.
2. Nếu `paidAmount >= amount` (thanh toán đủ hoặc dư): set `payment.status = PAID`, ghi `payment.paidAt = NOW()`.
3. Cập nhật `order.paymentStatus = PAID` trong bảng orders.
4. Gửi notification xác nhận thanh toán cho khách hàng qua email/in-app.

**Ghi chú nghiệp vụ:**
- Hỗ trợ thanh toán từng phần: nếu `paidAmount < amount`, status vẫn là `UNPAID` nhưng `paidAmount` và `remainingAmount` được cập nhật.
- `transactionRef` phải unique trong hệ thống để tránh ghi nhận trùng.

---

### `PATCH /admin/payments/{id}/mark-overdue`

**Mô tả:** Admin đánh dấu thanh toán quá hạn thủ công. Thông thường tác vụ này được thực hiện tự động bởi Scheduled Job, nhưng admin có thể trigger thủ công.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi thanh toán |

**Request Body:** Không có body (hoặc body rỗng `{}`).

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-0001-0000-0000-000000000001",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "amount": 15990000,
    "paidAmount": 0,
    "remainingAmount": 15990000,
    "dueDate": "2024-01-22T23:59:59+07:00",
    "status": "OVERDUE",
    "method": null,
    "transactionRef": null,
    "paidAt": null,
    "createdAt": "2024-01-15T10:30:00+07:00"
  },
  "message": "Đã đánh dấu thanh toán quá hạn"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `PAYMENT_NOT_FOUND` | Không tìm thấy bản ghi thanh toán |
| `400` | `PAYMENT_ALREADY_PAID` | Không thể đánh dấu quá hạn cho payment đã thanh toán |
| `400` | `PAYMENT_REFUNDED` | Không thể đánh dấu quá hạn cho payment đã hoàn trả |

**Ghi chú nghiệp vụ:**
- Scheduled Job nên kiểm tra `dueDate < NOW() AND status = UNPAID` mỗi ngày lúc 00:05 để tự động set `OVERDUE`.
- Admin dùng endpoint này để override thủ công trong các trường hợp đặc biệt.

---

### `POST /admin/payments/{id}/refund`

**Mô tả:** Admin xử lý hoàn tiền cho khách hàng sau khi đơn hàng bị hủy hoặc sản phẩm bị lỗi.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi thanh toán |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `refundAmount` | `long` | Có | Số tiền hoàn trả (VND, > 0, <= paidAmount) |
| `reason` | `string` | Có | Lý do hoàn tiền (tối đa 500 ký tự) |
| `method` | `enum` | Có | Phương thức hoàn tiền: `BANK_TRANSFER` \| `MOMO` \| `VNPAY` \| `CASH` |

```json
{
  "refundAmount": 15990000,
  "reason": "Khách hàng hủy đơn hàng trong thời hạn cho phép",
  "method": "BANK_TRANSFER"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
    "orderNumber": "ORD-20240110-002",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "amount": 23990000,
    "paidAmount": 23990000,
    "remainingAmount": 0,
    "dueDate": "2024-01-17T23:59:59+07:00",
    "status": "REFUNDED",
    "method": "BANK_TRANSFER",
    "transactionRef": "TXN-VCB-20240112-88821",
    "paidAt": "2024-01-12T14:22:00+07:00",
    "refundAmount": 23990000,
    "refundReason": "Khách hàng hủy đơn hàng trong thời hạn cho phép",
    "refundMethod": "BANK_TRANSFER",
    "refundedAt": "2024-01-23T10:00:00+07:00",
    "createdAt": "2024-01-10T09:00:00+07:00"
  },
  "message": "Xử lý hoàn tiền thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `PAYMENT_NOT_FOUND` | Không tìm thấy bản ghi thanh toán |
| `400` | `PAYMENT_NOT_PAID` | Chỉ có thể hoàn tiền cho payment đã được thanh toán (status = PAID) |
| `400` | `PAYMENT_ALREADY_REFUNDED` | Thanh toán đã được hoàn trả rồi |
| `422` | `REFUND_AMOUNT_EXCEEDS_PAID` | `refundAmount` lớn hơn `paidAmount` |

**Side Effects (Tác động nghiệp vụ):**

1. Set `payment.status = REFUNDED`, ghi nhận `refundAmount`, `refundReason`, `refundMethod`, `refundedAt`.
2. Cập nhật `order.paymentStatus = REFUNDED`.
3. Gửi email + in-app notification thông báo hoàn tiền cho khách hàng, bao gồm số tiền và phương thức hoàn trả.

---

## Section 5: Admin - Invoices

Nhóm API quản lý hoá đơn dành cho ADMIN.

---

### `GET /admin/invoices`

**Mô tả:** Lấy danh sách tất cả hoá đơn trong hệ thống, hỗ trợ tìm kiếm và lọc.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `status` | `enum` | Không | `PENDING` \| `PAID` \| `OVERDUE` \| `CANCELLED` |
| `search` | `string` | Không | Tìm kiếm theo `invoiceNumber`, `orderNumber`, hoặc `customerName` |
| `dateFrom` | `date` | Không | Lọc từ ngày phát hành (`issueDate`), format `YYYY-MM-DD` |
| `dateTo` | `date` | Không | Lọc đến ngày phát hành (`issueDate`), format `YYYY-MM-DD` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "c3d4e5f6-0001-0000-0000-000000000001",
        "invoiceNumber": "INV-20240115-001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
        "orderNumber": "ORD-20240110-002",
        "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
        "customerName": "Nguyễn Văn An",
        "totalAmount": 23990000,
        "taxAmount": 2399000,
        "status": "PAID",
        "issueDate": "2024-01-12T00:00:00+07:00",
        "dueDate": "2024-01-17T23:59:59+07:00",
        "paidAt": "2024-01-12T14:22:00+07:00",
        "createdAt": "2024-01-12T10:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 143,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |

---

### `GET /admin/invoices/{id}`

**Mô tả:** Lấy chi tiết đầy đủ một hoá đơn bao gồm danh sách sản phẩm.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID hoá đơn |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-0001-0000-0000-000000000001",
    "invoiceNumber": "INV-20240115-001",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
    "orderNumber": "ORD-20240110-002",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "an.nguyen@email.com",
    "customerPhone": "0901234567",
    "shippingAddress": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "totalAmount": 23990000,
    "taxAmount": 2399000,
    "grandTotal": 26389000,
    "status": "PAID",
    "issueDate": "2024-01-12T00:00:00+07:00",
    "dueDate": "2024-01-17T23:59:59+07:00",
    "paidAt": "2024-01-12T14:22:00+07:00",
    "createdAt": "2024-01-12T10:00:00+07:00",
    "items": [
      {
        "productId": "d4e5f6a7-0001-0000-0000-000000000001",
        "productName": "iPhone 15 Pro Max 256GB Titan Đen",
        "sku": "IPH15PM-256-BLK",
        "quantity": 1,
        "unitPrice": 23990000,
        "subtotal": 23990000
      }
    ]
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `INVOICE_NOT_FOUND` | Không tìm thấy hoá đơn |

---

### `POST /admin/invoices`

**Mô tả:** Admin tạo hoá đơn thủ công cho một đơn hàng (trường hợp hoá đơn chưa được tạo tự động, hoặc cần tạo hoá đơn điều chỉnh).

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `orderId` | `UUID` | Có | ID đơn hàng cần phát hoá đơn |
| `issueDate` | `date` | Có | Ngày phát hành hoá đơn, format `YYYY-MM-DD` |
| `dueDate` | `date` | Có | Hạn thanh toán hoá đơn, format `YYYY-MM-DD` (phải >= issueDate) |

```json
{
  "orderId": "f1e2d3c4-0001-0000-0000-000000000003",
  "issueDate": "2024-01-20",
  "dueDate": "2024-01-27"
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-0001-0000-0000-000000000002",
    "invoiceNumber": "INV-20240120-002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000003",
    "orderNumber": "ORD-20240118-003",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000002",
    "customerName": "Trần Thị Bình",
    "customerEmail": "binh.tran@email.com",
    "customerPhone": "0912345678",
    "shippingAddress": "456 Lê Lợi, Quận 3, TP.HCM",
    "totalAmount": 8990000,
    "taxAmount": 899000,
    "grandTotal": 9889000,
    "status": "PENDING",
    "issueDate": "2024-01-20T00:00:00+07:00",
    "dueDate": "2024-01-27T23:59:59+07:00",
    "paidAt": null,
    "createdAt": "2024-01-20T14:00:00+07:00",
    "items": [
      {
        "productId": "d4e5f6a7-0001-0000-0000-000000000002",
        "productName": "Samsung Galaxy S24 128GB",
        "sku": "SS-GS24-128",
        "quantity": 1,
        "unitPrice": 8990000,
        "subtotal": 8990000
      }
    ]
  },
  "message": "Tạo hoá đơn thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `409` | `INVOICE_ALREADY_EXISTS` | Đơn hàng này đã có hoá đơn rồi |
| `422` | `VALIDATION_ERROR` | `dueDate` trước `issueDate`, hoặc thiếu field bắt buộc |

**Ghi chú nghiệp vụ:**
- Hệ thống tự động populate `customerName`, `customerEmail`, `customerPhone`, `shippingAddress`, `totalAmount`, `taxAmount`, `items` từ dữ liệu đơn hàng — admin chỉ cần cung cấp 3 field trên.
- `invoiceNumber` được sinh tự động theo format `INV-YYYYMMDD-NNN`.
- `taxAmount` mặc định = 10% `totalAmount` (VAT).

---

### `PATCH /admin/invoices/{id}/status`

**Mô tả:** Admin cập nhật trạng thái hoá đơn. Dùng khi cần đánh dấu paid, overdue, hoặc cancelled thủ công.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID hoá đơn |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `status` | `enum` | Có | Trạng thái mới: `PAID` \| `OVERDUE` \| `CANCELLED` |

```json
{
  "status": "PAID"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-0001-0000-0000-000000000002",
    "invoiceNumber": "INV-20240120-002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000003",
    "orderNumber": "ORD-20240118-003",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000002",
    "customerName": "Trần Thị Bình",
    "totalAmount": 8990000,
    "taxAmount": 899000,
    "status": "PAID",
    "issueDate": "2024-01-20T00:00:00+07:00",
    "dueDate": "2024-01-27T23:59:59+07:00",
    "paidAt": "2024-01-23T10:00:00+07:00",
    "createdAt": "2024-01-20T14:00:00+07:00"
  },
  "message": "Cập nhật trạng thái hoá đơn thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `INVOICE_NOT_FOUND` | Không tìm thấy hoá đơn |
| `400` | `INVOICE_ALREADY_CANCELLED` | Hoá đơn đã bị hủy, không thể thay đổi trạng thái |
| `422` | `VALIDATION_ERROR` | Giá trị `status` không hợp lệ |

**Ghi chú nghiệp vụ:**
- Nếu `status = PAID`: tự động set `paidAt = NOW()`.
- Không cho phép chuyển từ `CANCELLED` sang bất kỳ trạng thái nào khác.
- Transition hợp lệ: `PENDING -> PAID`, `PENDING -> OVERDUE`, `PENDING -> CANCELLED`, `OVERDUE -> PAID`, `OVERDUE -> CANCELLED`.

---

### `DELETE /admin/invoices/{id}`

**Mô tả:** Admin hủy (soft delete) một hoá đơn. Chỉ hoạt động khi hoá đơn đang ở trạng thái `PENDING`.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID hoá đơn |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `reason` | `string` | Có | Lý do hủy hoá đơn (tối đa 500 ký tự) |

```json
{
  "reason": "Đơn hàng bị hủy theo yêu cầu của khách hàng"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-0001-0000-0000-000000000002",
    "invoiceNumber": "INV-20240120-002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000003",
    "orderNumber": "ORD-20240118-003",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000002",
    "customerName": "Trần Thị Bình",
    "totalAmount": 8990000,
    "taxAmount": 899000,
    "status": "CANCELLED",
    "cancellationReason": "Đơn hàng bị hủy theo yêu cầu của khách hàng",
    "issueDate": "2024-01-20T00:00:00+07:00",
    "dueDate": "2024-01-27T23:59:59+07:00",
    "paidAt": null,
    "createdAt": "2024-01-20T14:00:00+07:00"
  },
  "message": "Hủy hoá đơn thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `INVOICE_NOT_FOUND` | Không tìm thấy hoá đơn |
| `400` | `INVOICE_CANNOT_CANCEL` | Chỉ có thể hủy hoá đơn có status = PENDING. Hoá đơn đã PAID hoặc đã CANCELLED không thể hủy |

**Ghi chú nghiệp vụ:**
- Đây là soft delete — bản ghi vẫn còn trong database với `status = CANCELLED` và lưu lý do hủy vào field `cancellationReason`.
- Không hỗ trợ hard delete để đảm bảo tính toàn vẹn của audit log.

---

## Section 6: Admin - Shipments

Nhóm API quản lý vận chuyển dành cho ADMIN.

---

### `GET /admin/shipments`

**Mô tả:** Lấy danh sách tất cả vận đơn trong hệ thống.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `status` | `enum` | Không | `AWAITING_PICKUP` \| `IN_TRANSIT` \| `DELIVERED` \| `FAILED` |
| `search` | `string` | Không | Tìm kiếm theo `trackingNumber` hoặc `orderNumber` |
| `dateFrom` | `date` | Không | Lọc từ ngày tạo vận đơn (`createdAt`), format `YYYY-MM-DD` |
| `dateTo` | `date` | Không | Lọc đến ngày tạo vận đơn (`createdAt`), format `YYYY-MM-DD` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "e5f6a7b8-0001-0000-0000-000000000001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
        "orderNumber": "ORD-20240110-002",
        "customerName": "Nguyễn Văn An",
        "trackingNumber": "GHTK-20240113-99001",
        "carrierName": "Giao Hàng Tiết Kiệm",
        "status": "DELIVERED",
        "estimatedDelivery": "2024-01-16",
        "actualDelivery": "2024-01-15T15:40:00+07:00",
        "createdAt": "2024-01-13T08:00:00+07:00",
        "updatedAt": "2024-01-15T15:40:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 95,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |

---

### `GET /admin/shipments/{id}`

**Mô tả:** Lấy chi tiết đầy đủ một vận đơn.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID vận đơn |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-0001-0000-0000-000000000001",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000002",
    "orderNumber": "ORD-20240110-002",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "customerPhone": "0901234567",
    "shippingAddress": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "trackingNumber": "GHTK-20240113-99001",
    "carrierName": "Giao Hàng Tiết Kiệm",
    "status": "DELIVERED",
    "estimatedDelivery": "2024-01-16",
    "actualDelivery": "2024-01-15T15:40:00+07:00",
    "createdAt": "2024-01-13T08:00:00+07:00",
    "updatedAt": "2024-01-15T15:40:00+07:00"
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `SHIPMENT_NOT_FOUND` | Không tìm thấy vận đơn |

---

### `POST /admin/shipments`

**Mô tả:** Admin tạo vận đơn cho một đơn hàng sau khi đã xác nhận và chuẩn bị hàng xong.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `orderId` | `UUID` | Có | ID đơn hàng cần tạo vận đơn |
| `trackingNumber` | `string` | Có | Mã vận đơn do đơn vị vận chuyển cung cấp |
| `carrierName` | `string` | Có | Tên đơn vị vận chuyển |
| `estimatedDelivery` | `date` | Có | Ngày giao hàng dự kiến, format `YYYY-MM-DD` |

```json
{
  "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
  "trackingNumber": "GHTK-20240116-99002",
  "carrierName": "Giao Hàng Tiết Kiệm",
  "estimatedDelivery": "2024-01-18"
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "customerPhone": "0901234567",
    "shippingAddress": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "trackingNumber": "GHTK-20240116-99002",
    "carrierName": "Giao Hàng Tiết Kiệm",
    "status": "AWAITING_PICKUP",
    "estimatedDelivery": "2024-01-18",
    "actualDelivery": null,
    "createdAt": "2024-01-16T09:00:00+07:00",
    "updatedAt": "2024-01-16T09:00:00+07:00"
  },
  "message": "Tạo vận đơn thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `400` | `ORDER_INVALID_STATUS` | Đơn hàng phải ở trạng thái `CONFIRMED` hoặc `SHIPPING` để tạo vận đơn |
| `409` | `SHIPMENT_ALREADY_EXISTS` | Đơn hàng này đã có vận đơn rồi |
| `422` | `VALIDATION_ERROR` | Thiếu field bắt buộc hoặc `estimatedDelivery` là ngày trong quá khứ |

**Side Effects (Tác động nghiệp vụ):**

1. Tạo bản ghi mới trong bảng `shipments` với `status = AWAITING_PICKUP`.
2. Cập nhật `order.status = SHIPPING`.
3. Nếu hoá đơn cho đơn hàng này chưa tồn tại: tự động tạo hoá đơn (`POST /admin/invoices` logic nội bộ).
4. Gửi notification cho khách hàng kèm `trackingNumber` và `carrierName` để theo dõi đơn hàng.

**Ghi chú nghiệp vụ:**
- `trackingNumber` phải unique trong hệ thống.
- Carrier hỗ trợ phổ biến: `Giao Hàng Tiết Kiệm`, `Giao Hàng Nhanh`, `J&T Express`, `ViettelPost`, `VNPost`.

---

### `PATCH /admin/shipments/{id}/status`

**Mô tả:** Admin cập nhật trạng thái vận chuyển theo từng mốc tiến trình.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID vận đơn |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `status` | `enum` | Có | Trạng thái mới: `AWAITING_PICKUP` \| `IN_TRANSIT` \| `DELIVERED` \| `FAILED` |
| `actualDelivery` | `datetime` | Có khi status=DELIVERED | Thời điểm giao hàng thực tế, ISO 8601 |

```json
{
  "status": "DELIVERED",
  "actualDelivery": "2024-01-17T14:30:00+07:00"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "customerId": "b2c3d4e5-0001-0000-0000-000000000001",
    "customerName": "Nguyễn Văn An",
    "trackingNumber": "GHTK-20240116-99002",
    "carrierName": "Giao Hàng Tiết Kiệm",
    "status": "DELIVERED",
    "estimatedDelivery": "2024-01-18",
    "actualDelivery": "2024-01-17T14:30:00+07:00",
    "createdAt": "2024-01-16T09:00:00+07:00",
    "updatedAt": "2024-01-17T14:30:00+07:00"
  },
  "message": "Cập nhật trạng thái vận đơn thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `SHIPMENT_NOT_FOUND` | Không tìm thấy vận đơn |
| `400` | `SHIPMENT_ALREADY_DELIVERED` | Vận đơn đã DELIVERED, không thể thay đổi trạng thái |
| `422` | `VALIDATION_ERROR` | `actualDelivery` bắt buộc khi status = DELIVERED |

**Side Effects khi `status = DELIVERED`:**

1. Set `shipment.actualDelivery` theo giá trị trong request body.
2. Cập nhật `order.status = DELIVERED` và `order.actualDeliveryDate = actualDelivery`.
3. Cộng điểm tích luỹ (loyalty points) cho khách hàng theo giá trị đơn hàng (quy tắc: 1 điểm / 10.000 VND).
4. Gửi notification "Đơn hàng đã được giao thành công" cho khách hàng.

**Side Effects khi `status = FAILED`:**

1. Gửi notification thông báo giao hàng thất bại, hướng dẫn khách hàng liên hệ bộ phận hỗ trợ.
2. Order status giữ nguyên `SHIPPING` — admin sẽ xử lý thủ công (giao lại hoặc hủy đơn).

**Ghi chú nghiệp vụ:**
- Transition hợp lệ: `AWAITING_PICKUP -> IN_TRANSIT -> DELIVERED` hoặc `IN_TRANSIT -> FAILED`.
- Không cho phép rollback trạng thái (vd: từ `IN_TRANSIT` về `AWAITING_PICKUP`).

---

### `PATCH /admin/shipments/{id}/tracking`

**Mô tả:** Admin cập nhật mã vận đơn khi có sự thay đổi (vd: in lại vận đơn, đổi đơn vị vận chuyển).

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID vận đơn |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `trackingNumber` | `string` | Có | Mã vận đơn mới |
| `carrierName` | `string` | Không | Tên đơn vị vận chuyển mới (nếu thay đổi) |

```json
{
  "trackingNumber": "GHN-20240116-12345",
  "carrierName": "Giao Hàng Nhanh"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "e5f6a7b8-0001-0000-0000-000000000002",
    "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
    "orderNumber": "ORD-20240115-001",
    "trackingNumber": "GHN-20240116-12345",
    "carrierName": "Giao Hàng Nhanh",
    "status": "AWAITING_PICKUP",
    "estimatedDelivery": "2024-01-18",
    "actualDelivery": null,
    "createdAt": "2024-01-16T09:00:00+07:00",
    "updatedAt": "2024-01-16T11:00:00+07:00"
  },
  "message": "Cập nhật mã vận đơn thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `SHIPMENT_NOT_FOUND` | Không tìm thấy vận đơn |
| `400` | `SHIPMENT_ALREADY_DELIVERED` | Không thể thay đổi tracking của vận đơn đã DELIVERED |
| `409` | `TRACKING_NUMBER_DUPLICATE` | `trackingNumber` mới đã tồn tại trong hệ thống |

**Ghi chú nghiệp vụ:**
- Chỉ được cập nhật tracking khi status là `AWAITING_PICKUP` hoặc `IN_TRANSIT`.
- Sau khi cập nhật, hệ thống nên gửi notification cho khách hàng về mã vận đơn mới.

---

## Section 7: Admin - Inventory Management

Nhóm API quản lý tồn kho dành cho ADMIN. Cho phép theo dõi số lượng hàng hoá, điều chỉnh tồn kho và xem lịch sử biến động.

---

### `GET /admin/inventory`

**Mô tả:** Lấy danh sách toàn bộ tồn kho của tất cả sản phẩm/variant, hỗ trợ lọc theo trạng thái tồn kho và tìm kiếm.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `status` | `enum` | Không | Lọc trạng thái: `IN_STOCK` \| `LOW_STOCK` \| `OUT_OF_STOCK` |
| `search` | `string` | Không | Tìm kiếm theo `productName` hoặc `sku` |
| `sortBy` | `string` | Không | Field sắp xếp: `productName` (mặc định), `currentStock`, `lastUpdated` |
| `sortDir` | `enum` | Không | `ASC` \| `DESC` (mặc định `ASC`) |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "f6a7b8c9-0001-0000-0000-000000000001",
        "productId": "d4e5f6a7-0001-0000-0000-000000000001",
        "variantId": "a1b2c3d4-0002-0000-0000-000000000001",
        "productName": "iPhone 15 Pro Max 256GB Titan Đen",
        "brand": "Apple",
        "sku": "IPH15PM-256-BLK",
        "currentStock": 15,
        "minStock": 5,
        "costPrice": 21000000,
        "sellingPrice": 23990000,
        "status": "IN_STOCK",
        "lastUpdated": "2024-01-15T10:30:00+07:00"
      },
      {
        "id": "f6a7b8c9-0001-0000-0000-000000000002",
        "productId": "d4e5f6a7-0001-0000-0000-000000000002",
        "variantId": null,
        "productName": "Samsung Galaxy S24 128GB",
        "brand": "Samsung",
        "sku": "SS-GS24-128",
        "currentStock": 3,
        "minStock": 5,
        "costPrice": 7500000,
        "sellingPrice": 8990000,
        "status": "LOW_STOCK",
        "lastUpdated": "2024-01-14T08:00:00+07:00"
      },
      {
        "id": "f6a7b8c9-0001-0000-0000-000000000003",
        "productId": "d4e5f6a7-0001-0000-0000-000000000003",
        "variantId": "a1b2c3d4-0002-0000-0000-000000000002",
        "productName": "Xiaomi 14 Ultra 512GB Trắng",
        "brand": "Xiaomi",
        "sku": "XM14U-512-WHT",
        "currentStock": 0,
        "minStock": 3,
        "costPrice": 18000000,
        "sellingPrice": 21990000,
        "status": "OUT_OF_STOCK",
        "lastUpdated": "2024-01-10T16:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 320,
    "totalPages": 16,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |

**Ghi chú nghiệp vụ:**
- `status` được tính tự động: `OUT_OF_STOCK` nếu `currentStock = 0`, `LOW_STOCK` nếu `0 < currentStock <= minStock`, `IN_STOCK` nếu `currentStock > minStock`.

---

### `GET /admin/inventory/{id}`

**Mô tả:** Lấy chi tiết thông tin tồn kho của một sản phẩm/variant theo ID inventory.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi inventory |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "f6a7b8c9-0001-0000-0000-000000000001",
    "productId": "d4e5f6a7-0001-0000-0000-000000000001",
    "variantId": "a1b2c3d4-0002-0000-0000-000000000001",
    "productName": "iPhone 15 Pro Max 256GB Titan Đen",
    "brand": "Apple",
    "sku": "IPH15PM-256-BLK",
    "currentStock": 15,
    "minStock": 5,
    "costPrice": 21000000,
    "sellingPrice": 23990000,
    "status": "IN_STOCK",
    "lastUpdated": "2024-01-15T10:30:00+07:00"
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `INVENTORY_NOT_FOUND` | Không tìm thấy bản ghi tồn kho |

---

### `PATCH /admin/inventory/{id}/adjust`

**Mô tả:** Admin điều chỉnh số lượng tồn kho thủ công (nhập hàng, xuất hàng, điều chỉnh sau kiểm kê).

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID bản ghi inventory |

**Request Body:**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `quantity` | `int` | Có | Số lượng điều chỉnh (> 0) |
| `type` | `enum` | Có | Loại điều chỉnh: `ADD` (cộng thêm) \| `SUBTRACT` (trừ đi) \| `SET` (đặt trực tiếp) |
| `reason` | `string` | Có | Lý do điều chỉnh, tối đa 500 ký tự |

```json
{
  "quantity": 20,
  "type": "ADD",
  "reason": "Nhập hàng đợt tháng 1/2024 từ nhà cung cấp Apple VN"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "f6a7b8c9-0001-0000-0000-000000000001",
    "productId": "d4e5f6a7-0001-0000-0000-000000000001",
    "variantId": "a1b2c3d4-0002-0000-0000-000000000001",
    "productName": "iPhone 15 Pro Max 256GB Titan Đen",
    "brand": "Apple",
    "sku": "IPH15PM-256-BLK",
    "currentStock": 35,
    "minStock": 5,
    "costPrice": 21000000,
    "sellingPrice": 23990000,
    "status": "IN_STOCK",
    "lastUpdated": "2024-01-20T09:00:00+07:00"
  },
  "message": "Điều chỉnh tồn kho thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `INVENTORY_NOT_FOUND` | Không tìm thấy bản ghi tồn kho |
| `400` | `INVENTORY_STOCK_NEGATIVE` | Kết quả tồn kho sau điều chỉnh < 0 (không hợp lệ) |
| `422` | `VALIDATION_ERROR` | `quantity` <= 0 hoặc thiếu field bắt buộc |

**Ghi chú nghiệp vụ:**
- Loại điều chỉnh `ADD`: `newStock = currentStock + quantity`.
- Loại điều chỉnh `SUBTRACT`: `newStock = currentStock - quantity` (validate >= 0).
- Loại điều chỉnh `SET`: `newStock = quantity` (dùng khi kiểm kê thực tế và cần reset về con số chính xác).
- Sau mỗi điều chỉnh: tự động tính lại `status` (`IN_STOCK` / `LOW_STOCK` / `OUT_OF_STOCK`) và cập nhật `lastUpdated`.
- Mỗi lần điều chỉnh tạo một bản ghi trong bảng `stock_movements` với `type = ADJUST` để theo dõi audit trail.

---

### `GET /admin/inventory/low-stock`

**Mô tả:** Lấy danh sách cảnh báo sản phẩm sắp hết hàng, để admin có thể chủ động nhập hàng kịp thời.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `threshold` | `int` | Không | Ngưỡng cảnh báo tùy chỉnh. Mặc định: dùng `minStock` của từng sản phẩm. Nếu truyền vào, lọc tất cả sản phẩm có `currentStock <= threshold` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "f6a7b8c9-0001-0000-0000-000000000002",
      "productId": "d4e5f6a7-0001-0000-0000-000000000002",
      "variantId": null,
      "productName": "Samsung Galaxy S24 128GB",
      "brand": "Samsung",
      "sku": "SS-GS24-128",
      "currentStock": 3,
      "minStock": 5,
      "costPrice": 7500000,
      "sellingPrice": 8990000,
      "status": "LOW_STOCK",
      "lastUpdated": "2024-01-14T08:00:00+07:00"
    },
    {
      "id": "f6a7b8c9-0001-0000-0000-000000000003",
      "productId": "d4e5f6a7-0001-0000-0000-000000000003",
      "variantId": "a1b2c3d4-0002-0000-0000-000000000002",
      "productName": "Xiaomi 14 Ultra 512GB Trắng",
      "brand": "Xiaomi",
      "sku": "XM14U-512-WHT",
      "currentStock": 0,
      "minStock": 3,
      "costPrice": 18000000,
      "sellingPrice": 21990000,
      "status": "OUT_OF_STOCK",
      "lastUpdated": "2024-01-10T16:00:00+07:00"
    }
  ],
  "message": "Thành công"
}
```

> **Lưu ý:** Endpoint này trả về `array` thẳng trong `data` (không phân trang) vì đây là danh sách cảnh báo khẩn cấp.

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |

**Ghi chú nghiệp vụ:**
- Khi không truyền `threshold`: query `WHERE currentStock <= minStock`.
- Khi truyền `threshold`: query `WHERE currentStock <= :threshold`.
- Kết quả sắp xếp theo `currentStock` tăng dần (hết hàng trước, ít hàng sau).
- Endpoint này được Dashboard admin gọi để hiển thị widget cảnh báo tồn kho.

---

### `GET /admin/inventory/{productId}/movements`

**Mô tả:** Lấy lịch sử biến động tồn kho của một sản phẩm (theo `productId`), bao gồm tất cả các lần nhập/xuất/điều chỉnh/trả hàng.

**Yêu cầu xác thực:** Bearer Token — Role `ADMIN`

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `productId` | `UUID` | ID sản phẩm cần xem lịch sử tồn kho |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không | Số trang, mặc định `1` |
| `pageSize` | `int` | Không | Kích thước trang, mặc định `20`, tối đa `100` |
| `dateFrom` | `date` | Không | Lọc từ ngày, format `YYYY-MM-DD` |
| `dateTo` | `date` | Không | Lọc đến ngày, format `YYYY-MM-DD` |

**Request:** Không có body.

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "g7h8i9j0-0001-0000-0000-000000000001",
        "productId": "d4e5f6a7-0001-0000-0000-000000000001",
        "variantId": "a1b2c3d4-0002-0000-0000-000000000001",
        "productName": "iPhone 15 Pro Max 256GB Titan Đen",
        "type": "ADJUST",
        "quantity": 20,
        "previousStock": 15,
        "newStock": 35,
        "reason": "Nhập hàng đợt tháng 1/2024 từ nhà cung cấp Apple VN",
        "orderId": null,
        "performedBy": "admin-uuid-0001-0000-0000-000000000001",
        "createdAt": "2024-01-20T09:00:00+07:00"
      },
      {
        "id": "g7h8i9j0-0001-0000-0000-000000000002",
        "productId": "d4e5f6a7-0001-0000-0000-000000000001",
        "variantId": "a1b2c3d4-0002-0000-0000-000000000001",
        "productName": "iPhone 15 Pro Max 256GB Titan Đen",
        "type": "EXPORT",
        "quantity": -1,
        "previousStock": 16,
        "newStock": 15,
        "reason": "Xuất hàng theo đơn ORD-20240115-001",
        "orderId": "f1e2d3c4-0001-0000-0000-000000000001",
        "performedBy": "admin-uuid-0001-0000-0000-000000000001",
        "createdAt": "2024-01-15T10:35:00+07:00"
      },
      {
        "id": "g7h8i9j0-0001-0000-0000-000000000003",
        "productId": "d4e5f6a7-0001-0000-0000-000000000001",
        "variantId": "a1b2c3d4-0002-0000-0000-000000000001",
        "productName": "iPhone 15 Pro Max 256GB Titan Đen",
        "type": "IMPORT",
        "quantity": 10,
        "previousStock": 6,
        "newStock": 16,
        "reason": "Nhập hàng bổ sung đợt cuối năm 2023",
        "orderId": null,
        "performedBy": "admin-uuid-0001-0000-0000-000000000001",
        "createdAt": "2023-12-28T14:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalElements": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "message": "Thành công"
}
```

**Error Codes:**

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Thiếu Bearer token |
| `403` | `ACCESS_DENIED` | Không có quyền ADMIN |
| `404` | `PRODUCT_NOT_FOUND` | Không tìm thấy sản phẩm với `productId` đã cho |

**Ghi chú nghiệp vụ:**
- `type = IMPORT`: nhập hàng từ nhà cung cấp, `quantity` dương.
- `type = EXPORT`: xuất hàng theo đơn bán, `quantity` âm, có `orderId`.
- `type = ADJUST`: điều chỉnh thủ công bởi admin (kiểm kê, hàng hỏng...), `quantity` có thể dương hoặc âm.
- `type = RETURN`: hàng trả về từ đơn hủy, `quantity` dương, có `orderId`.
- Kết quả sắp xếp theo `createdAt` giảm dần (gần nhất trước).
- Endpoint hỗ trợ lọc theo khoảng thời gian để audit tồn kho theo tháng.

---

## Tổng hợp Endpoints

| Method | Endpoint | Vai trò | Mô tả ngắn |
|--------|----------|---------|------------|
| `GET` | `/payments` | CUSTOMER | Danh sách thanh toán của tôi |
| `GET` | `/payments/{id}` | CUSTOMER | Chi tiết thanh toán |
| `GET` | `/invoices` | CUSTOMER | Danh sách hoá đơn của tôi |
| `GET` | `/invoices/{id}` | CUSTOMER | Chi tiết hoá đơn |
| `GET` | `/invoices/{id}/download` | CUSTOMER | Tải PDF hoá đơn |
| `GET` | `/shipments` | CUSTOMER | Danh sách vận đơn của tôi |
| `GET` | `/shipments/{id}` | CUSTOMER | Chi tiết vận đơn |
| `GET` | `/orders/{orderId}/shipment` | CUSTOMER | Vận đơn theo đơn hàng |
| `GET` | `/admin/payments` | ADMIN | Danh sách tất cả thanh toán |
| `GET` | `/admin/payments/{id}` | ADMIN | Chi tiết thanh toán |
| `PATCH` | `/admin/payments/{id}/mark-paid` | ADMIN | Xác nhận thanh toán |
| `PATCH` | `/admin/payments/{id}/mark-overdue` | ADMIN | Đánh dấu quá hạn |
| `POST` | `/admin/payments/{id}/refund` | ADMIN | Hoàn tiền |
| `GET` | `/admin/invoices` | ADMIN | Danh sách tất cả hoá đơn |
| `GET` | `/admin/invoices/{id}` | ADMIN | Chi tiết hoá đơn |
| `POST` | `/admin/invoices` | ADMIN | Tạo hoá đơn thủ công |
| `PATCH` | `/admin/invoices/{id}/status` | ADMIN | Cập nhật trạng thái hoá đơn |
| `DELETE` | `/admin/invoices/{id}` | ADMIN | Hủy hoá đơn |
| `GET` | `/admin/shipments` | ADMIN | Danh sách tất cả vận đơn |
| `GET` | `/admin/shipments/{id}` | ADMIN | Chi tiết vận đơn |
| `POST` | `/admin/shipments` | ADMIN | Tạo vận đơn |
| `PATCH` | `/admin/shipments/{id}/status` | ADMIN | Cập nhật trạng thái vận đơn |
| `PATCH` | `/admin/shipments/{id}/tracking` | ADMIN | Cập nhật mã vận đơn |
| `GET` | `/admin/inventory` | ADMIN | Danh sách tồn kho |
| `GET` | `/admin/inventory/{id}` | ADMIN | Chi tiết tồn kho |
| `PATCH` | `/admin/inventory/{id}/adjust` | ADMIN | Điều chỉnh tồn kho |
| `GET` | `/admin/inventory/low-stock` | ADMIN | Cảnh báo sắp hết hàng |
| `GET` | `/admin/inventory/{productId}/movements` | ADMIN | Lịch sử biến động tồn kho |

---

*Tài liệu này là một phần của bộ BA Specification cho dự án CELLPHONES eCommerce Platform. Tham khảo thêm tại `03-api-auth-users.md`, `12-error-codes.md`, và `10-business-rules.md`.*
