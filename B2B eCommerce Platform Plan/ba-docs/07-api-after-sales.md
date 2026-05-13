# 07 - API Đặc Tả: After-Sales (Hậu Mãi)

> **Nền tảng:** CELLPHONES eCommerce Platform  
> **Base URL:** `/api/v1`  
> **Phiên bản tài liệu:** 1.0  
> **Cập nhật lần cuối:** 2026-05-12

---

## Mục Lục

1. [Tổng quan](#tổng-quan)
2. [Returns - Đổi/Trả Hàng (Customer)](#section-1-returns---đổitrả-hàng-customer)
3. [Returns - Admin](#section-2-admin---returns)
4. [Warranty - Bảo Hành (Customer)](#section-3-warranty---bảo-hành-customer)
5. [Warranty - Admin](#section-4-admin---warranty)
6. [Trade-in (Customer)](#section-5-trade-in-customer)
7. [Trade-in - Admin](#section-6-admin---trade-in)
8. [IMEI Check](#section-7-imei-check)
9. [Danh Sách Error Codes](#danh-sách-error-codes)

---

## Tổng Quan

Module After-Sales quản lý toàn bộ các nghiệp vụ hậu mãi của nền tảng, bao gồm:

| Module | Mô tả | Đối tượng sử dụng |
|--------|-------|-------------------|
| **Returns** | Yêu cầu đổi/trả hàng và hoàn tiền | Customer, Admin |
| **Warranty** | Quản lý bảo hành thiết bị | Customer, Admin |
| **Trade-in** | Thu mua thiết bị cũ để đổi lấy sản phẩm mới | Customer, Admin |
| **IMEI Check** | Kiểm tra thông tin thiết bị qua số IMEI | Public |

### Quy Ước Chung

- Tất cả request body sử dụng `Content-Type: application/json`
- Token xác thực truyền qua header: `Authorization: Bearer <token>`
- Ngày giờ sử dụng định dạng ISO 8601: `yyyy-MM-ddTHH:mm:ssZ`
- Số tiền đơn vị VND, kiểu `long`
- UUID dùng cho tất cả các trường `id`
- Phân trang mặc định: `page=0`, `pageSize=20`

### Cấu Trúc Response Chung

**Thành công:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công"
}
```

**Lỗi:**
```json
{
  "success": false,
  "errorCode": "ERROR_CODE",
  "message": "Mô tả lỗi bằng tiếng Việt",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Phân trang:**
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8,
    "isFirst": true,
    "isLast": false
  }
}
```

---

## Section 1: Returns - Đổi/Trả Hàng (Customer)

### 1.1 POST /returns

**Mục đích:** Khách hàng gửi yêu cầu đổi/trả hàng cho một đơn hàng đã giao

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
POST /api/v1/returns
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
Content-Type: application/json
```

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `orderId` | `string (UUID)` | Có | ID đơn hàng cần trả |
| `items` | `array` | Có | Danh sách sản phẩm cần trả (tối thiểu 1 phần tử) |
| `items[].productId` | `string (UUID)` | Có | ID sản phẩm trong đơn hàng |
| `items[].quantity` | `integer` | Có | Số lượng trả (> 0, không vượt quá số lượng đã mua) |
| `items[].reason` | `string (enum)` | Có | Lý do trả: `DEFECTIVE`, `WRONG_ITEM`, `NOT_AS_DESCRIBED`, `CHANGED_MIND`, `OTHER` |
| `items[].note` | `string` | Không | Ghi chú bổ sung cho sản phẩm (tối đa 500 ký tự) |
| `images` | `array<string>` | Không | Danh sách URL ảnh minh chứng (tối đa 5 ảnh) |
| `refundMethod` | `string (enum)` | Có | Phương thức hoàn tiền: `ORIGINAL_PAYMENT`, `STORE_CREDIT`, `BANK_TRANSFER` |

**Ví dụ Request Body:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "quantity": 1,
      "reason": "DEFECTIVE",
      "note": "Màn hình có sọc ngang xuất hiện sau 2 ngày sử dụng, không do va đập"
    }
  ],
  "images": [
    "https://storage.cellphones.vn/returns/img_001.jpg",
    "https://storage.cellphones.vn/returns/img_002.jpg"
  ],
  "refundMethod": "ORIGINAL_PAYMENT"
}
```

**Business Rules:**

1. `orderId` phải thuộc về user đang đăng nhập (xác minh qua `order.customerId == currentUser.id`)
2. `order.status` phải là `DELIVERED` (đơn hàng đã giao thành công)
3. Số ngày từ `order.actualDeliveryDate` đến hiện tại phải `<= return_window_days` (lấy từ `system_config`, mặc định 7 ngày)
4. Không được có yêu cầu trả hàng đang hoạt động (status `PENDING`, `APPROVED`, `PROCESSING`) cho cùng `orderId`
5. `refundAmount` được tính tự động = `SUM(items[i].quantity × orderItem.unitPrice)` từ bảng `OrderItem`
6. Status ban đầu của `ReturnRequest` = `PENDING`

**Tính toán refundAmount (Java service):**
```
refundAmount = 0
for each item in requestItems:
    orderItem = findOrderItem(orderId, item.productId)
    refundAmount += item.quantity × orderItem.unitPrice
```

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-2024-001234",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "reason": "DEFECTIVE",
    "status": "PENDING",
    "refundAmount": 29990000,
    "refundMethod": "ORIGINAL_PAYMENT",
    "images": [
      "https://storage.cellphones.vn/returns/img_001.jpg",
      "https://storage.cellphones.vn/returns/img_002.jpg"
    ],
    "adminNote": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": "item-uuid-001",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "quantity": 1,
        "unitPrice": 29990000,
        "subtotal": 29990000,
        "reason": "DEFECTIVE",
        "note": "Màn hình có sọc ngang xuất hiện sau 2 ngày sử dụng, không do va đập"
      }
    ]
  },
  "message": "Yêu cầu trả hàng đã được gửi thành công. Chúng tôi sẽ xem xét trong vòng 1-2 ngày làm việc."
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `RETURN_ORDER_NOT_DELIVERED` | Đơn hàng chưa được giao (status không phải DELIVERED) |
| `400` | `RETURN_WINDOW_EXPIRED` | Đã quá thời hạn đổi trả (vượt quá `return_window_days`) |
| `400` | `RETURN_ALREADY_REQUESTED` | Đã có yêu cầu trả hàng đang xử lý cho đơn hàng này |
| `400` | `RETURN_QUANTITY_EXCEEDED` | Số lượng trả vượt quá số lượng đã mua |
| `400` | `RETURN_ITEM_NOT_IN_ORDER` | Sản phẩm không thuộc đơn hàng này |
| `403` | `ACCESS_DENIED` | Đơn hàng không thuộc về người dùng hiện tại |
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `422` | `VALIDATION_ERROR` | Dữ liệu đầu vào không hợp lệ |

---

### 1.2 GET /returns

**Mục đích:** Lấy danh sách yêu cầu đổi/trả hàng của người dùng hiện tại

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
GET /api/v1/returns
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang (bắt đầu từ 0) |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang (tối đa 100) |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSING`, `REFUNDED`, `CLOSED` |

**Ví dụ Request:**
```
GET /api/v1/returns?page=0&pageSize=10&status=PENDING
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": "ORD-2024-001234",
        "reason": "DEFECTIVE",
        "status": "PENDING",
        "refundAmount": 29990000,
        "refundMethod": "ORIGINAL_PAYMENT",
        "images": [
          "https://storage.cellphones.vn/returns/img_001.jpg"
        ],
        "adminNote": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "items": [
          {
            "id": "item-uuid-001",
            "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
            "quantity": 1,
            "unitPrice": 29990000,
            "subtotal": 29990000,
            "reason": "DEFECTIVE",
            "note": "Màn hình có sọc ngang"
          }
        ]
      }
    ],
    "page": 0,
    "pageSize": 10,
    "totalElements": 3,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

**Mô tả các trường ReturnRequest:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trả hàng |
| `orderId` | `string (UUID)` | ID đơn hàng gốc |
| `orderNumber` | `string` | Mã đơn hàng (hiển thị) |
| `reason` | `string (enum)` | Lý do trả hàng |
| `status` | `string (enum)` | Trạng thái yêu cầu |
| `refundAmount` | `long` | Số tiền hoàn trả (VND) |
| `refundMethod` | `string (enum)` | Phương thức hoàn tiền |
| `images` | `array<string>` | Danh sách URL ảnh minh chứng |
| `adminNote` | `string \| null` | Ghi chú từ admin |
| `createdAt` | `string (ISO 8601)` | Thời gian tạo yêu cầu |
| `updatedAt` | `string (ISO 8601)` | Thời gian cập nhật gần nhất |
| `items` | `array<ReturnItem>` | Danh sách sản phẩm trả |

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `401` | `UNAUTHORIZED` | Chưa xác thực |
| `400` | `INVALID_PAGE_PARAMS` | Tham số phân trang không hợp lệ |

---

### 1.3 GET /returns/:id

**Mục đích:** Lấy chi tiết một yêu cầu đổi/trả hàng

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`) - chỉ xem được yêu cầu của chính mình

**Method & URL:**
```
GET /api/v1/returns/{id}
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trả hàng |

**Ví dụ Request:**
```
GET /api/v1/returns/7c9e6679-7425-40de-944b-e07fc1f90ae7
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-2024-001234",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "nguyenvanan@email.com",
    "customerPhone": "0901234567",
    "reason": "DEFECTIVE",
    "status": "APPROVED",
    "refundAmount": 29990000,
    "refundMethod": "ORIGINAL_PAYMENT",
    "images": [
      "https://storage.cellphones.vn/returns/img_001.jpg",
      "https://storage.cellphones.vn/returns/img_002.jpg"
    ],
    "adminNote": "Đã kiểm tra, xác nhận lỗi phần cứng. Chấp thuận hoàn tiền.",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T09:00:00Z",
    "items": [
      {
        "id": "item-uuid-001",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "productSku": "IP15PM-256-TN",
        "productImage": "https://storage.cellphones.vn/products/ip15pm-256-tn.jpg",
        "quantity": 1,
        "unitPrice": 29990000,
        "subtotal": 29990000,
        "reason": "DEFECTIVE",
        "note": "Màn hình có sọc ngang xuất hiện sau 2 ngày sử dụng, không do va đập"
      }
    ]
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `403` | `ACCESS_DENIED` | Yêu cầu trả hàng không thuộc về người dùng hiện tại |
| `404` | `RETURN_NOT_FOUND` | Không tìm thấy yêu cầu trả hàng |

---

## Section 2: Admin - Returns

### 2.1 GET /admin/returns

**Mục đích:** Lấy danh sách tất cả yêu cầu đổi/trả hàng (dành cho Admin)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
GET /api/v1/admin/returns
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `sortBy` | `string` | Không | `createdAt` | Trường sắp xếp: `createdAt`, `updatedAt`, `refundAmount`, `status` |
| `sortDir` | `string` | Không | `DESC` | Chiều sắp xếp: `ASC`, `DESC` |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `PENDING`, `APPROVED`, `REJECTED`, `PROCESSING`, `REFUNDED`, `CLOSED` |
| `search` | `string` | Không | | Tìm kiếm theo mã đơn hàng (orderNumber) hoặc tên khách hàng |
| `dateFrom` | `string (date)` | Không | | Lọc từ ngày tạo (format: `yyyy-MM-dd`) |
| `dateTo` | `string (date)` | Không | | Lọc đến ngày tạo (format: `yyyy-MM-dd`) |

**Ví dụ Request:**
```
GET /api/v1/admin/returns?page=0&pageSize=20&status=PENDING&sortBy=createdAt&sortDir=DESC
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": "ORD-2024-001234",
        "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "customerName": "Nguyễn Văn An",
        "customerEmail": "nguyenvanan@email.com",
        "customerPhone": "0901234567",
        "reason": "DEFECTIVE",
        "status": "PENDING",
        "refundAmount": 29990000,
        "refundMethod": "ORIGINAL_PAYMENT",
        "adminNote": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "itemCount": 1
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 45,
    "totalPages": 3,
    "isFirst": true,
    "isLast": false
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `401` | `UNAUTHORIZED` | Chưa xác thực |
| `403` | `FORBIDDEN` | Không có quyền Admin |

---

### 2.2 GET /admin/returns/:id

**Mục đích:** Lấy chi tiết đầy đủ một yêu cầu trả hàng (dành cho Admin)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
GET /api/v1/admin/returns/{id}
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trả hàng |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-2024-001234",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "nguyenvanan@email.com",
    "customerPhone": "0901234567",
    "reason": "DEFECTIVE",
    "status": "PENDING",
    "refundAmount": 29990000,
    "refundMethod": "ORIGINAL_PAYMENT",
    "images": [
      "https://storage.cellphones.vn/returns/img_001.jpg",
      "https://storage.cellphones.vn/returns/img_002.jpg"
    ],
    "adminNote": null,
    "processedBy": null,
    "processedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": "item-uuid-001",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "productSku": "IP15PM-256-TN",
        "productImage": "https://storage.cellphones.vn/products/ip15pm-256-tn.jpg",
        "quantity": 1,
        "unitPrice": 29990000,
        "subtotal": 29990000,
        "reason": "DEFECTIVE",
        "note": "Màn hình có sọc ngang xuất hiện sau 2 ngày sử dụng"
      }
    ],
    "orderDetails": {
      "orderTotal": 29990000,
      "actualDeliveryDate": "2024-01-13T14:00:00Z",
      "paymentMethod": "CREDIT_CARD",
      "shippingAddress": "123 Lê Lợi, Quận 1, TP.HCM"
    }
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `403` | `FORBIDDEN` | Không có quyền Admin |
| `404` | `RETURN_NOT_FOUND` | Không tìm thấy yêu cầu trả hàng |

---

### 2.3 PATCH /admin/returns/:id/status

**Mục đích:** Admin cập nhật trạng thái yêu cầu trả hàng

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
PATCH /api/v1/admin/returns/{id}/status
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trả hàng |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `status` | `string (enum)` | Có | Trạng thái mới: `APPROVED`, `REJECTED`, `PROCESSING`, `REFUNDED`, `CLOSED` |
| `adminNote` | `string` | Không | Ghi chú từ admin (bắt buộc khi `status = REJECTED`) |

**Ví dụ Request Body - Chấp thuận yêu cầu:**
```json
{
  "status": "APPROVED",
  "adminNote": "Đã kiểm tra, xác nhận lỗi phần cứng màn hình. Chấp thuận hoàn tiền 100%."
}
```

**Ví dụ Request Body - Từ chối yêu cầu:**
```json
{
  "status": "REJECTED",
  "adminNote": "Sản phẩm có dấu hiệu va đập vật lý, không thuộc trường hợp lỗi nhà sản xuất. Không đủ điều kiện đổi trả."
}
```

**Ví dụ Request Body - Đã nhận hàng trả về:**
```json
{
  "status": "PROCESSING",
  "adminNote": "Đã nhận sản phẩm trả về ngày 17/01/2024. Đang tiến hành kiểm tra và xử lý hoàn tiền."
}
```

**Ví dụ Request Body - Đã hoàn tiền:**
```json
{
  "status": "REFUNDED",
  "adminNote": "Đã hoàn tiền 29,990,000đ vào thẻ tín dụng gốc ngày 18/01/2024."
}
```

**Luồng chuyển đổi trạng thái hợp lệ:**

```
PENDING ──► APPROVED   (kiểm tra và chấp nhận yêu cầu)
PENDING ──► REJECTED   (từ chối, bắt buộc có adminNote)
APPROVED ──► PROCESSING (đã nhận được hàng trả về từ khách)
PROCESSING ──► REFUNDED (đã thực hiện hoàn tiền)
REFUNDED ──► CLOSED    (hoàn tất quy trình)
* ──► CLOSED           (admin có thể force close từ bất kỳ status nào)
```

**Side Effects khi status = REFUNDED:**

1. **Khôi phục tồn kho:** Cộng lại số lượng đã trả cho từng sản phẩm trong `Inventory`
2. **Tạo/cập nhật Payment:** Tạo bản ghi `Payment` với `type=REFUND`, `status=COMPLETED`, `amount=refundAmount`
3. **Gửi thông báo:** Push notification + email đến khách hàng với nội dung hoàn tiền thành công
4. **Cập nhật đơn hàng:** Đặt `order.status = RETURNED`
5. **Trừ điểm thưởng:** Nếu khách hàng đã nhận loyalty points từ đơn hàng này, trừ lại số điểm tương ứng với sản phẩm đã trả

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-2024-001234",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "status": "APPROVED",
    "refundAmount": 29990000,
    "refundMethod": "ORIGINAL_PAYMENT",
    "adminNote": "Đã kiểm tra, xác nhận lỗi phần cứng màn hình. Chấp thuận hoàn tiền 100%.",
    "processedBy": "admin-uuid-001",
    "processedByName": "Trần Thị Bình",
    "processedAt": "2024-01-16T09:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T09:00:00Z",
    "items": [ { "..." : "..." } ]
  },
  "message": "Cập nhật trạng thái thành công"
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `INVALID_STATUS_TRANSITION` | Chuyển đổi trạng thái không hợp lệ (ví dụ: REFUNDED → PENDING) |
| `400` | `ADMIN_NOTE_REQUIRED` | Thiếu adminNote khi từ chối (status = REJECTED) |
| `403` | `FORBIDDEN` | Không có quyền Admin |
| `404` | `RETURN_NOT_FOUND` | Không tìm thấy yêu cầu trả hàng |

---

## Section 3: Warranty - Bảo Hành (Customer)

### 3.1 GET /warranty

**Mục đích:** Lấy danh sách các sản phẩm đang trong bảo hành của người dùng hiện tại

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
GET /api/v1/warranty
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `VALID`, `EXPIRED`, `PROCESSING`, `REJECTED` |

**Ví dụ Request:**
```
GET /api/v1/warranty?page=0&pageSize=10&status=VALID
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "wrt-uuid-001",
        "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": "ORD-2024-001234",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "productImage": "https://storage.cellphones.vn/products/ip15pm-256-tn.jpg",
        "brand": "Apple",
        "imei": "357839403258702",
        "serialNumber": "SN-ABC123456",
        "purchaseDate": "2024-01-13",
        "warrantyExpiry": "2025-01-13",
        "warrantyMonths": 12,
        "status": "VALID"
      }
    ],
    "page": 0,
    "pageSize": 10,
    "totalElements": 5,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

**Mô tả các trường WarrantyItem:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `string (UUID)` | ID bảo hành |
| `customerId` | `string (UUID)` | ID khách hàng |
| `orderId` | `string (UUID)` | ID đơn hàng mua |
| `orderNumber` | `string` | Mã đơn hàng |
| `productId` | `string (UUID)` | ID sản phẩm |
| `productName` | `string` | Tên sản phẩm |
| `productImage` | `string` | URL ảnh sản phẩm |
| `brand` | `string` | Thương hiệu |
| `imei` | `string \| null` | Số IMEI (cho điện thoại) |
| `serialNumber` | `string \| null` | Số serial (cho các thiết bị khác) |
| `purchaseDate` | `string (date)` | Ngày mua |
| `warrantyExpiry` | `string (date)` | Ngày hết hạn bảo hành |
| `warrantyMonths` | `integer` | Số tháng bảo hành |
| `status` | `string (enum)` | Trạng thái: `VALID`, `EXPIRED`, `PROCESSING`, `REJECTED` |

---

### 3.2 GET /warranty/:id

**Mục đích:** Lấy chi tiết một bảo hành

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`) - chỉ xem bảo hành của mình

**Method & URL:**
```
GET /api/v1/warranty/{id}
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID bảo hành |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "wrt-uuid-001",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-2024-001234",
    "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    "productImage": "https://storage.cellphones.vn/products/ip15pm-256-tn.jpg",
    "brand": "Apple",
    "imei": "357839403258702",
    "serialNumber": "SN-ABC123456",
    "purchaseDate": "2024-01-13",
    "warrantyExpiry": "2025-01-13",
    "warrantyMonths": 12,
    "status": "VALID",
    "activeClaims": 0,
    "totalClaims": 0
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `403` | `ACCESS_DENIED` | Bảo hành không thuộc về người dùng hiện tại |
| `404` | `WARRANTY_NOT_FOUND` | Không tìm thấy bảo hành |

---

### 3.3 GET /warranty-claims

**Mục đích:** Lấy danh sách yêu cầu bảo hành của người dùng hiện tại

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
GET /api/v1/warranty-claims
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `NEW`, `PROCESSING`, `RESOLVED`, `REJECTED` |
| `claimType` | `string` | Không | (tất cả) | Lọc theo loại: `REPAIR`, `REPLACEMENT`, `REFUND` |

**Ví dụ Request:**
```
GET /api/v1/warranty-claims?page=0&pageSize=10&status=NEW
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "claim-uuid-001",
        "warrantyId": "wrt-uuid-001",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "claimType": "REPAIR",
        "description": "Pin chai nhanh, dung lượng còn 70% sau 6 tháng sử dụng",
        "status": "NEW",
        "resolution": null,
        "resolvedAt": null,
        "createdAt": "2024-07-15T09:00:00Z"
      }
    ],
    "page": 0,
    "pageSize": 10,
    "totalElements": 2,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

**Mô tả các trường WarrantyClaim:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu bảo hành |
| `warrantyId` | `string (UUID)` | ID bảo hành liên quan |
| `productId` | `string (UUID)` | ID sản phẩm |
| `productName` | `string` | Tên sản phẩm |
| `claimType` | `string (enum)` | Loại yêu cầu: `REPAIR`, `REPLACEMENT`, `REFUND` |
| `description` | `string` | Mô tả vấn đề |
| `status` | `string (enum)` | Trạng thái: `NEW`, `PROCESSING`, `RESOLVED`, `REJECTED` |
| `resolution` | `string \| null` | Kết quả xử lý (từ admin) |
| `resolvedAt` | `string \| null` | Thời gian hoàn tất xử lý |
| `createdAt` | `string (ISO 8601)` | Thời gian tạo yêu cầu |

---

### 3.4 POST /warranty-claims

**Mục đích:** Khách hàng gửi yêu cầu bảo hành

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
POST /api/v1/warranty-claims
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
Content-Type: application/json
```

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `warrantyId` | `string (UUID)` | Có | ID bảo hành cần yêu cầu |
| `claimType` | `string (enum)` | Có | Loại yêu cầu: `REPAIR` (sửa chữa), `REPLACEMENT` (đổi máy), `REFUND` (hoàn tiền) |
| `description` | `string` | Có | Mô tả chi tiết vấn đề gặp phải (10-1000 ký tự) |

**Ví dụ Request Body:**
```json
{
  "warrantyId": "wrt-uuid-001",
  "claimType": "REPAIR",
  "description": "Pin chai nhanh bất thường. Sau 6 tháng sử dụng, dung lượng pin chỉ còn 70% dù không sạc qua đêm. Máy tắt đột ngột khi pin còn 15-20%."
}
```

**Business Rules:**

1. `warrantyId` phải thuộc về user đang đăng nhập
2. `warranty.status` phải là `VALID` (không phải `EXPIRED` hay `REJECTED`)
3. `warranty.warrantyExpiry >= TODAY` (bảo hành chưa hết hạn)
4. Không được có yêu cầu đang hoạt động (status = `NEW` hoặc `PROCESSING`) cho cùng `warrantyId`

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "claim-uuid-002",
    "warrantyId": "wrt-uuid-001",
    "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    "claimType": "REPAIR",
    "description": "Pin chai nhanh bất thường. Sau 6 tháng sử dụng, dung lượng pin chỉ còn 70% dù không sạc qua đêm. Máy tắt đột ngột khi pin còn 15-20%.",
    "status": "NEW",
    "resolution": null,
    "resolvedAt": null,
    "createdAt": "2024-07-15T09:00:00Z"
  },
  "message": "Yêu cầu bảo hành đã được gửi. Chúng tôi sẽ liên hệ trong 24 giờ làm việc."
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `WARRANTY_EXPIRED` | Bảo hành đã hết hạn |
| `400` | `WARRANTY_NOT_VALID` | Bảo hành không ở trạng thái VALID |
| `400` | `WARRANTY_CLAIM_ALREADY_ACTIVE` | Đã có yêu cầu bảo hành đang xử lý cho thiết bị này |
| `403` | `ACCESS_DENIED` | Bảo hành không thuộc về người dùng hiện tại |
| `404` | `WARRANTY_NOT_FOUND` | Không tìm thấy bảo hành |

---

### 3.5 GET /warranty-claims/:id

**Mục đích:** Lấy chi tiết một yêu cầu bảo hành

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`) - chỉ xem yêu cầu của mình

**Method & URL:**
```
GET /api/v1/warranty-claims/{id}
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu bảo hành |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "claim-uuid-001",
    "warrantyId": "wrt-uuid-001",
    "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    "productImage": "https://storage.cellphones.vn/products/ip15pm-256-tn.jpg",
    "imei": "357839403258702",
    "claimType": "REPAIR",
    "description": "Pin chai nhanh bất thường. Sau 6 tháng sử dụng, dung lượng pin chỉ còn 70%.",
    "status": "PROCESSING",
    "resolution": null,
    "resolvedAt": null,
    "adminNote": "Đã tiếp nhận máy. Đang kiểm tra pin tại trung tâm bảo hành.",
    "createdAt": "2024-07-15T09:00:00Z",
    "updatedAt": "2024-07-16T14:00:00Z"
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `403` | `ACCESS_DENIED` | Yêu cầu bảo hành không thuộc về người dùng hiện tại |
| `404` | `WARRANTY_CLAIM_NOT_FOUND` | Không tìm thấy yêu cầu bảo hành |

---

## Section 4: Admin - Warranty

### 4.1 GET /admin/warranty

**Mục đích:** Lấy danh sách tất cả bảo hành (dành cho Admin)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
GET /api/v1/admin/warranty
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `VALID`, `EXPIRED`, `PROCESSING`, `REJECTED` |
| `search` | `string` | Không | | Tìm kiếm theo tên khách hàng, tên sản phẩm, hoặc số IMEI |
| `dateFrom` | `string (date)` | Không | | Lọc từ ngày hết hạn bảo hành |
| `dateTo` | `string (date)` | Không | | Lọc đến ngày hết hạn bảo hành |

**Ví dụ Request:**
```
GET /api/v1/admin/warranty?page=0&pageSize=20&status=VALID&dateFrom=2024-01-01&dateTo=2024-12-31
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "wrt-uuid-001",
        "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "customerName": "Nguyễn Văn An",
        "customerEmail": "nguyenvanan@email.com",
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": "ORD-2024-001234",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "productImage": "https://storage.cellphones.vn/products/ip15pm-256-tn.jpg",
        "brand": "Apple",
        "imei": "357839403258702",
        "serialNumber": "SN-ABC123456",
        "purchaseDate": "2024-01-13",
        "warrantyExpiry": "2025-01-13",
        "warrantyMonths": 12,
        "status": "VALID"
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 230,
    "totalPages": 12,
    "isFirst": true,
    "isLast": false
  }
}
```

---

### 4.2 POST /admin/warranty

**Mục đích:** Admin tạo bản ghi bảo hành mới (thường được gọi tự động khi đơn hàng chuyển sang DELIVERED)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
POST /api/v1/admin/warranty
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `customerId` | `string (UUID)` | Có | ID khách hàng |
| `orderId` | `string (UUID)` | Có | ID đơn hàng |
| `productId` | `string (UUID)` | Có | ID sản phẩm |
| `imei` | `string` | Không | Số IMEI (bắt buộc với điện thoại, đúng 15 chữ số) |
| `serialNumber` | `string` | Không | Số serial (dành cho thiết bị không có IMEI) |
| `purchaseDate` | `string (date)` | Có | Ngày mua hàng (format: `yyyy-MM-dd`) |
| `warrantyMonths` | `integer` | Có | Số tháng bảo hành (ví dụ: 12, 24) |

**Tự động tính toán:**
- `warrantyExpiry = purchaseDate + warrantyMonths tháng`
- `status = VALID` (mặc định khi tạo)

**Ví dụ Request Body:**
```json
{
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "imei": "357839403258702",
  "serialNumber": "SN-ABC123456",
  "purchaseDate": "2024-01-13",
  "warrantyMonths": 12
}
```

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "wrt-uuid-002",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "imei": "357839403258702",
    "serialNumber": "SN-ABC123456",
    "purchaseDate": "2024-01-13",
    "warrantyExpiry": "2025-01-13",
    "warrantyMonths": 12,
    "status": "VALID",
    "createdAt": "2024-01-13T16:00:00Z"
  },
  "message": "Tạo bảo hành thành công"
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `WARRANTY_ALREADY_EXISTS` | Đã tồn tại bảo hành cho sản phẩm này trong đơn hàng này |
| `400` | `INVALID_IMEI_FORMAT` | Số IMEI không hợp lệ (không đúng 15 chữ số) |
| `404` | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng |
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `404` | `PRODUCT_NOT_FOUND` | Không tìm thấy sản phẩm |

---

### 4.3 GET /admin/warranty-claims

**Mục đích:** Lấy danh sách tất cả yêu cầu bảo hành (dành cho Admin)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
GET /api/v1/admin/warranty-claims
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `NEW`, `PROCESSING`, `RESOLVED`, `REJECTED` |
| `claimType` | `string` | Không | (tất cả) | Lọc theo loại: `REPAIR`, `REPLACEMENT`, `REFUND` |
| `search` | `string` | Không | | Tìm theo tên khách hàng, tên sản phẩm, số IMEI |
| `dateFrom` | `string (date)` | Không | | Lọc từ ngày tạo yêu cầu |
| `dateTo` | `string (date)` | Không | | Lọc đến ngày tạo yêu cầu |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "claim-uuid-001",
        "warrantyId": "wrt-uuid-001",
        "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "customerName": "Nguyễn Văn An",
        "customerPhone": "0901234567",
        "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
        "imei": "357839403258702",
        "claimType": "REPAIR",
        "description": "Pin chai nhanh, dung lượng còn 70% sau 6 tháng",
        "status": "NEW",
        "resolution": null,
        "resolvedAt": null,
        "createdAt": "2024-07-15T09:00:00Z"
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 18,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

---

### 4.4 PATCH /admin/warranty-claims/:id/status

**Mục đích:** Admin cập nhật trạng thái xử lý yêu cầu bảo hành

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
PATCH /api/v1/admin/warranty-claims/{id}/status
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu bảo hành |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `status` | `string (enum)` | Có | Trạng thái mới: `PROCESSING`, `RESOLVED`, `REJECTED` |
| `resolution` | `string` | Không | Kết quả xử lý (bắt buộc khi status = `RESOLVED` hoặc `REJECTED`) |

**Luồng chuyển đổi trạng thái hợp lệ:**
```
NEW ──► PROCESSING  (bắt đầu xử lý)
PROCESSING ──► RESOLVED  (xử lý xong, có kết quả)
PROCESSING ──► REJECTED  (từ chối sau khi kiểm tra)
NEW ──► REJECTED    (từ chối ngay, không đủ điều kiện)
```

**Ví dụ Request Body - Bắt đầu xử lý:**
```json
{
  "status": "PROCESSING",
  "resolution": "Đã tiếp nhận thiết bị. Đang kiểm tra pin tại trung tâm kỹ thuật."
}
```

**Ví dụ Request Body - Hoàn tất xử lý:**
```json
{
  "status": "RESOLVED",
  "resolution": "Đã thay pin mới Apple OEM. Dung lượng pin đạt 100%. Máy hoạt động bình thường. Thiết bị đã được gửi trả khách hàng qua GHTK ngày 20/07/2024."
}
```

**Ví dụ Request Body - Từ chối:**
```json
{
  "status": "REJECTED",
  "resolution": "Sau khi kiểm tra, pin chai do sạc không đúng cách (sử dụng bộ sạc không chính hãng). Trường hợp này không thuộc phạm vi bảo hành. Khách hàng có thể liên hệ để sửa chữa có tính phí."
}
```

**Side Effects:**
- Khi status = `RESOLVED` hoặc `REJECTED`: set `resolvedAt = NOW()`, lưu `resolution`
- Gửi notification (push + email) đến khách hàng kèm nội dung `resolution`

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "claim-uuid-001",
    "warrantyId": "wrt-uuid-001",
    "productName": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    "claimType": "REPAIR",
    "description": "Pin chai nhanh, dung lượng còn 70% sau 6 tháng",
    "status": "RESOLVED",
    "resolution": "Đã thay pin mới Apple OEM. Dung lượng pin đạt 100%.",
    "resolvedAt": "2024-07-20T15:00:00Z",
    "processedBy": "admin-uuid-001",
    "processedByName": "Trần Thị Bình",
    "createdAt": "2024-07-15T09:00:00Z",
    "updatedAt": "2024-07-20T15:00:00Z"
  },
  "message": "Cập nhật trạng thái bảo hành thành công"
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `INVALID_STATUS_TRANSITION` | Chuyển đổi trạng thái không hợp lệ |
| `400` | `RESOLUTION_REQUIRED` | Thiếu nội dung kết quả khi RESOLVED/REJECTED |
| `403` | `FORBIDDEN` | Không có quyền Admin |
| `404` | `WARRANTY_CLAIM_NOT_FOUND` | Không tìm thấy yêu cầu bảo hành |

---

## Section 5: Trade-in (Customer)

### 5.1 GET /trade-in/estimate

**Mục đích:** Ước tính giá thu mua thiết bị cũ (không cần đăng nhập)

**Authentication:** Không yêu cầu (Public)

**Method & URL:**
```
GET /api/v1/trade-in/estimate
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|-----------|-------|
| `brand` | `string` | Có | Thương hiệu thiết bị (ví dụ: `Apple`, `Samsung`) |
| `model` | `string` | Có | Model thiết bị (ví dụ: `iPhone 16 Pro Max`) |
| `storage` | `string` | Có | Dung lượng lưu trữ: `128GB`, `256GB`, `512GB`, `1TB` |
| `condition` | `string` | Có | Tình trạng máy: `GOOD`, `FAIR`, `AVERAGE`, `POOR` |

**Ví dụ Request:**
```
GET /api/v1/trade-in/estimate?brand=Apple&model=iPhone%2015%20Pro%20Max&storage=256GB&condition=GOOD
```

**Công Thức Tính Giá Ước Tính:**

```
estimatedValue = baseValue × storageMultiplier × conditionMultiplier
                 (làm tròn đến 500,000 VND gần nhất)
```

**Bảng Base Value (VND) - Ví dụ:**

| Model | Base Value |
|-------|------------|
| iPhone 16 Pro Max | 29,000,000 |
| iPhone 16 Pro | 24,000,000 |
| iPhone 15 Pro Max | 22,000,000 |
| iPhone 15 Pro | 18,000,000 |
| Samsung Galaxy S24 Ultra | 20,000,000 |
| Samsung Galaxy S24+ | 16,000,000 |

**Storage Multiplier:**

| Dung lượng | Hệ số |
|------------|-------|
| 128GB | 0.9 |
| 256GB | 1.0 |
| 512GB | 1.1 |
| 1TB | 1.2 |

**Condition Multiplier:**

| Tình trạng | Hệ số | Mô tả |
|-----------|-------|-------|
| `GOOD` | 1.0 | Máy mới 95-100%, không trầy xước, đủ phụ kiện |
| `FAIR` | 0.85 | Trầy xước nhỏ, pin > 85%, hoạt động tốt |
| `AVERAGE` | 0.7 | Trầy xước rõ, pin 70-85%, đã qua sửa chữa nhỏ |
| `POOR` | 0.5 | Hư hỏng nặng, vỡ màn hình, pin < 70% |

**Ví dụ tính:**
```
iPhone 15 Pro Max 256GB GOOD:
  = 22,000,000 × 1.0 × 1.0
  = 22,000,000 VND

iPhone 15 Pro Max 512GB FAIR:
  = 22,000,000 × 1.1 × 0.85
  = 20,570,000 → làm tròn → 20,500,000 VND
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "conditionLabel": "Tốt",
    "estimatedValue": 22000000,
    "estimatedValueFormatted": "22.000.000 đ",
    "note": "Đây là mức giá ước tính. Giá chính thức sẽ được xác nhận sau khi kiểm tra thực tế tại cửa hàng hoặc qua hình ảnh.",
    "validUntil": "2024-01-22T23:59:59Z"
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `TRADE_IN_MODEL_NOT_SUPPORTED` | Model thiết bị không được hỗ trợ thu mua |
| `400` | `TRADE_IN_INVALID_STORAGE` | Dung lượng không hợp lệ cho model này |
| `422` | `VALIDATION_ERROR` | Thiếu tham số bắt buộc |

---

### 5.2 POST /trade-in

**Mục đích:** Khách hàng gửi yêu cầu trade-in thiết bị cũ

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
POST /api/v1/trade-in
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
Content-Type: application/json
```

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `brand` | `string` | Có | Thương hiệu thiết bị |
| `model` | `string` | Có | Model thiết bị |
| `storage` | `string` | Có | Dung lượng lưu trữ |
| `condition` | `string (enum)` | Có | Tình trạng: `GOOD`, `FAIR`, `AVERAGE`, `POOR` |
| `images` | `array<string>` | Có | Danh sách URL ảnh thiết bị (tối thiểu 2 ảnh, tối đa 8 ảnh) |
| `note` | `string` | Không | Ghi chú thêm về thiết bị (tối đa 500 ký tự) |
| `targetProductId` | `string (UUID)` | Không | ID sản phẩm mới muốn mua kèm với trade-in |

**Ví dụ Request Body:**
```json
{
  "brand": "Apple",
  "model": "iPhone 15 Pro Max",
  "storage": "256GB",
  "condition": "GOOD",
  "images": [
    "https://storage.cellphones.vn/trade-in/ti_001_front.jpg",
    "https://storage.cellphones.vn/trade-in/ti_001_back.jpg",
    "https://storage.cellphones.vn/trade-in/ti_001_screen.jpg",
    "https://storage.cellphones.vn/trade-in/ti_001_box.jpg"
  ],
  "note": "Máy mua tháng 3/2023 tại Apple Store, còn bảo hành đến tháng 3/2025. Máy chưa bao giờ sửa chữa.",
  "targetProductId": "new-product-uuid-001"
}
```

**Business Rules:**
- `estimatedValue` được tính tự động bằng công thức (xem mục 5.1)
- Status ban đầu = `AWAITING_VALUATION`
- Hệ thống gửi notification đến admin về yêu cầu mới

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "conditionLabel": "Tốt",
    "estimatedValue": 22000000,
    "finalValue": null,
    "status": "AWAITING_VALUATION",
    "images": [
      "https://storage.cellphones.vn/trade-in/ti_001_front.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_back.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_screen.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_box.jpg"
    ],
    "note": "Máy mua tháng 3/2023 tại Apple Store, còn bảo hành đến tháng 3/2025.",
    "targetProductId": "new-product-uuid-001",
    "targetProductName": "iPhone 16 Pro Max 256GB Titan Đen",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Yêu cầu trade-in đã được gửi. Chúng tôi sẽ định giá trong vòng 24-48 giờ làm việc."
}
```

**Mô tả các trường TradeInRequest:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trade-in |
| `customerId` | `string (UUID)` | ID khách hàng |
| `brand` | `string` | Thương hiệu thiết bị |
| `model` | `string` | Model thiết bị |
| `storage` | `string` | Dung lượng lưu trữ |
| `condition` | `string (enum)` | Tình trạng máy |
| `conditionLabel` | `string` | Tình trạng (tiếng Việt) |
| `estimatedValue` | `long` | Giá ước tính (VND) |
| `finalValue` | `long \| null` | Giá chính thức sau định giá |
| `status` | `string (enum)` | Trạng thái: `AWAITING_VALUATION`, `VALUED`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED` |
| `images` | `array<string>` | Danh sách URL ảnh |
| `note` | `string \| null` | Ghi chú từ khách hàng |
| `targetProductId` | `string (UUID) \| null` | ID sản phẩm mới |
| `targetProductName` | `string \| null` | Tên sản phẩm mới |
| `createdAt` | `string (ISO 8601)` | Thời gian tạo |
| `updatedAt` | `string (ISO 8601)` | Thời gian cập nhật |

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `TRADE_IN_MODEL_NOT_SUPPORTED` | Model thiết bị không hỗ trợ |
| `400` | `TRADE_IN_INSUFFICIENT_IMAGES` | Chưa đủ số lượng ảnh (tối thiểu 2) |
| `404` | `PRODUCT_NOT_FOUND` | targetProductId không tồn tại |

---

### 5.3 GET /trade-in

**Mục đích:** Lấy danh sách yêu cầu trade-in của người dùng hiện tại

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
GET /api/v1/trade-in
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `status` | `string` | Không | (tất cả) | Lọc theo status |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "ti-uuid-001",
        "brand": "Apple",
        "model": "iPhone 15 Pro Max",
        "storage": "256GB",
        "condition": "GOOD",
        "conditionLabel": "Tốt",
        "estimatedValue": 22000000,
        "finalValue": null,
        "status": "AWAITING_VALUATION",
        "images": [
          "https://storage.cellphones.vn/trade-in/ti_001_front.jpg"
        ],
        "note": "Máy mua tháng 3/2023",
        "targetProductId": "new-product-uuid-001",
        "targetProductName": "iPhone 16 Pro Max 256GB Titan Đen",
        "createdAt": "2024-01-15T11:00:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 3,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

---

### 5.4 GET /trade-in/:id

**Mục đích:** Lấy chi tiết một yêu cầu trade-in

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`) - chỉ xem yêu cầu của mình

**Method & URL:**
```
GET /api/v1/trade-in/{id}
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trade-in |

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "conditionLabel": "Tốt",
    "estimatedValue": 22000000,
    "finalValue": 21000000,
    "status": "VALUED",
    "images": [
      "https://storage.cellphones.vn/trade-in/ti_001_front.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_back.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_screen.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_box.jpg"
    ],
    "note": "Máy mua tháng 3/2023 tại Apple Store, còn bảo hành đến tháng 3/2025.",
    "adminNote": "Máy đẹp nhưng pin đã xuống 88%, điều chỉnh giá nhẹ so với ước tính.",
    "targetProductId": "new-product-uuid-001",
    "targetProductName": "iPhone 16 Pro Max 256GB Titan Đen",
    "valuatedBy": "admin-uuid-001",
    "valuatedByName": "Lê Văn Cường",
    "valuatedAt": "2024-01-16T10:00:00Z",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-16T10:00:00Z"
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `403` | `ACCESS_DENIED` | Yêu cầu không thuộc về người dùng hiện tại |
| `404` | `TRADE_IN_NOT_FOUND` | Không tìm thấy yêu cầu trade-in |

---

### 5.5 PATCH /trade-in/:id/accept

**Mục đích:** Khách hàng chấp nhận mức giá định giá chính thức từ admin

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
PATCH /api/v1/trade-in/{id}/accept
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trade-in |

**Request Body:** Không cần body

**Business Rules:**
- `trade-in.status` phải là `VALUED` (admin đã định giá)
- Khách hàng phải là chủ sở hữu yêu cầu
- Sau khi accept: status chuyển thành `ACCEPTED`
- Hệ thống gửi notification đến admin về việc khách hàng đã chấp nhận

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "estimatedValue": 22000000,
    "finalValue": 21000000,
    "status": "ACCEPTED",
    "targetProductId": "new-product-uuid-001",
    "targetProductName": "iPhone 16 Pro Max 256GB Titan Đen",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-16T11:30:00Z"
  },
  "message": "Bạn đã chấp nhận mức giá 21.000.000đ. Vui lòng mang thiết bị đến cửa hàng gần nhất để hoàn tất giao dịch."
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `TRADE_IN_NOT_VALUED` | Yêu cầu chưa được định giá (status không phải VALUED) |
| `403` | `ACCESS_DENIED` | Yêu cầu không thuộc về người dùng hiện tại |
| `404` | `TRADE_IN_NOT_FOUND` | Không tìm thấy yêu cầu trade-in |

---

### 5.6 PATCH /trade-in/:id/reject

**Mục đích:** Khách hàng từ chối mức giá định giá chính thức từ admin

**Authentication:** Bắt buộc - Bearer Token (Role: `CUSTOMER`)

**Method & URL:**
```
PATCH /api/v1/trade-in/{id}/reject
```

**Headers:**
```
Authorization: Bearer <customer_access_token>
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trade-in |

**Request Body:** Không cần body

**Business Rules:**
- `trade-in.status` phải là `VALUED`
- Sau khi reject: status chuyển thành `REJECTED`

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "estimatedValue": 22000000,
    "finalValue": 21000000,
    "status": "REJECTED",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-16T12:00:00Z"
  },
  "message": "Bạn đã từ chối mức giá định giá. Yêu cầu trade-in đã bị hủy."
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `TRADE_IN_NOT_VALUED` | Yêu cầu chưa được định giá (status không phải VALUED) |
| `403` | `ACCESS_DENIED` | Yêu cầu không thuộc về người dùng hiện tại |
| `404` | `TRADE_IN_NOT_FOUND` | Không tìm thấy yêu cầu trade-in |

---

## Section 6: Admin - Trade-in

### 6.1 GET /admin/trade-in

**Mục đích:** Lấy danh sách tất cả yêu cầu trade-in (dành cho Admin)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
GET /api/v1/admin/trade-in
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|-----------|----------|-------|
| `page` | `integer` | Không | `0` | Số trang |
| `pageSize` | `integer` | Không | `20` | Số phần tử mỗi trang |
| `status` | `string` | Không | (tất cả) | Lọc theo status: `AWAITING_VALUATION`, `VALUED`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED` |
| `search` | `string` | Không | | Tìm kiếm theo tên khách hàng, tên model, thương hiệu |
| `dateFrom` | `string (date)` | Không | | Lọc từ ngày tạo yêu cầu |
| `dateTo` | `string (date)` | Không | | Lọc đến ngày tạo yêu cầu |

**Ví dụ Request:**
```
GET /api/v1/admin/trade-in?page=0&pageSize=20&status=AWAITING_VALUATION
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "ti-uuid-001",
        "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "customerName": "Nguyễn Văn An",
        "customerPhone": "0901234567",
        "brand": "Apple",
        "model": "iPhone 15 Pro Max",
        "storage": "256GB",
        "condition": "GOOD",
        "conditionLabel": "Tốt",
        "estimatedValue": 22000000,
        "finalValue": null,
        "status": "AWAITING_VALUATION",
        "targetProductName": "iPhone 16 Pro Max 256GB Titan Đen",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 12,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

---

### 6.2 GET /admin/trade-in/:id

**Mục đích:** Lấy chi tiết đầy đủ một yêu cầu trade-in (dành cho Admin)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
GET /api/v1/admin/trade-in/{id}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "nguyenvanan@email.com",
    "customerPhone": "0901234567",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "conditionLabel": "Tốt",
    "estimatedValue": 22000000,
    "finalValue": null,
    "status": "AWAITING_VALUATION",
    "images": [
      "https://storage.cellphones.vn/trade-in/ti_001_front.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_back.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_screen.jpg",
      "https://storage.cellphones.vn/trade-in/ti_001_box.jpg"
    ],
    "note": "Máy mua tháng 3/2023 tại Apple Store, còn bảo hành đến tháng 3/2025.",
    "adminNote": null,
    "targetProductId": "new-product-uuid-001",
    "targetProductName": "iPhone 16 Pro Max 256GB Titan Đen",
    "targetProductPrice": 34990000,
    "valuatedBy": null,
    "valuatedAt": null,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `403` | `FORBIDDEN` | Không có quyền Admin |
| `404` | `TRADE_IN_NOT_FOUND` | Không tìm thấy yêu cầu trade-in |

---

### 6.3 PATCH /admin/trade-in/:id/valuate

**Mục đích:** Admin định giá chính thức cho yêu cầu trade-in

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
PATCH /api/v1/admin/trade-in/{id}/valuate
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trade-in |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `finalValue` | `long` | Có | Giá định giá chính thức (VND, > 0) |
| `adminNote` | `string` | Không | Ghi chú giải thích mức giá (tối đa 500 ký tự) |

**Business Rules:**
- `trade-in.status` phải là `AWAITING_VALUATION`
- Sau khi định giá: status chuyển thành `VALUED`
- Gửi notification đến khách hàng kèm `finalValue` và `adminNote`

**Ví dụ Request Body:**
```json
{
  "finalValue": 21000000,
  "adminNote": "Máy đẹp, hoạt động tốt nhưng pin đã xuống 88% (kiểm tra qua Settings > Battery > Battery Health). Điều chỉnh giảm nhẹ so với ước tính ban đầu."
}
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "estimatedValue": 22000000,
    "finalValue": 21000000,
    "status": "VALUED",
    "adminNote": "Máy đẹp, hoạt động tốt nhưng pin đã xuống 88%.",
    "valuatedBy": "admin-uuid-001",
    "valuatedByName": "Lê Văn Cường",
    "valuatedAt": "2024-01-16T10:00:00Z",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-16T10:00:00Z"
  },
  "message": "Định giá thành công. Đã gửi thông báo đến khách hàng."
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `TRADE_IN_INVALID_STATUS` | Status không phải AWAITING_VALUATION |
| `400` | `TRADE_IN_INVALID_FINAL_VALUE` | finalValue phải là số dương |
| `403` | `FORBIDDEN` | Không có quyền Admin |
| `404` | `TRADE_IN_NOT_FOUND` | Không tìm thấy yêu cầu trade-in |

---

### 6.4 PATCH /admin/trade-in/:id/complete

**Mục đích:** Admin hoàn tất giao dịch trade-in (đã nhận thiết bị từ khách)

**Authentication:** Bắt buộc - Bearer Token (Role: `ADMIN`)

**Method & URL:**
```
PATCH /api/v1/admin/trade-in/{id}/complete
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `string (UUID)` | ID yêu cầu trade-in |

**Request Body:** Không cần body

**Business Rules:**
- `trade-in.status` phải là `ACCEPTED` (khách đã chấp nhận giá)
- Sau khi complete: status chuyển thành `COMPLETED`
- Thông thường được gọi sau khi khách hàng mang máy đến cửa hàng và hoàn tất chuyển giao

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "ti-uuid-001",
    "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerName": "Nguyễn Văn An",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "condition": "GOOD",
    "estimatedValue": 22000000,
    "finalValue": 21000000,
    "status": "COMPLETED",
    "completedBy": "admin-uuid-001",
    "completedByName": "Lê Văn Cường",
    "completedAt": "2024-01-17T14:30:00Z",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-17T14:30:00Z"
  },
  "message": "Giao dịch trade-in hoàn tất thành công"
}
```

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `TRADE_IN_INVALID_STATUS` | Status không phải ACCEPTED |
| `403` | `FORBIDDEN` | Không có quyền Admin |
| `404` | `TRADE_IN_NOT_FOUND` | Không tìm thấy yêu cầu trade-in |

---

## Section 7: IMEI Check

### 7.1 POST /imei/check

**Mục đích:** Kiểm tra thông tin thiết bị thông qua số IMEI

**Authentication:** Không yêu cầu (Public)

**Method & URL:**
```
POST /api/v1/imei/check
```

**Headers:**
```
Content-Type: application/json
```

**Rate Limiting:**
- Giới hạn: **10 request/giờ/IP**
- Header phản hồi khi bị rate limit:
  ```
  X-RateLimit-Limit: 10
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1705316400
  Retry-After: 3600
  ```

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|-----------|-------|
| `imei` | `string` | Có | Số IMEI cần kiểm tra (đúng 15 chữ số, hợp lệ theo Luhn Algorithm) |

**Ví dụ Request Body:**
```json
{
  "imei": "357839403258702"
}
```

**Validation IMEI:**

1. **Định dạng:** Chính xác 15 ký tự số (0-9), không chứa chữ cái hay ký tự đặc biệt
2. **Luhn Algorithm:** Kiểm tra checksum theo chuẩn Luhn (ISO/IEC 7812)

**Luhn Algorithm (Java implementation):**
```java
public static boolean isValidLuhn(String imei) {
    int sum = 0;
    boolean alternate = false;
    for (int i = imei.length() - 1; i >= 0; i--) {
        int n = Integer.parseInt(String.valueOf(imei.charAt(i)));
        if (alternate) {
            n *= 2;
            if (n > 9) n = (n % 10) + 1;
        }
        sum += n;
        alternate = !alternate;
    }
    return (sum % 10 == 0);
}
```

**Response 200 OK - Thiết bị hợp lệ:**

```json
{
  "success": true,
  "data": {
    "imei": "357839403258702",
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "modelNumber": "A3106",
    "color": "Titan Tự Nhiên",
    "storage": "256GB",
    "isLocked": false,
    "lockType": null,
    "warrantyStatus": "Còn bảo hành",
    "warrantyExpiry": "2025-09-15",
    "purchaseDate": "2023-09-15",
    "purchaseCountry": "Việt Nam",
    "isBlacklisted": false,
    "blacklistReason": null,
    "activationStatus": "Đã kích hoạt",
    "activationDate": "2023-09-16",
    "repairHistory": "Không có lịch sử sửa chữa",
    "checkedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response 200 OK - Thiết bị bị khóa / blacklist:**

```json
{
  "success": true,
  "data": {
    "imei": "123456789012345",
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "modelNumber": "A2890",
    "color": "Đen Không Gian",
    "storage": "128GB",
    "isLocked": true,
    "lockType": "CARRIER_LOCK",
    "warrantyStatus": "Hết bảo hành",
    "warrantyExpiry": "2024-01-10",
    "purchaseDate": "2023-01-10",
    "purchaseCountry": "Hoa Kỳ",
    "isBlacklisted": true,
    "blacklistReason": "Báo cáo bị mất/đánh cắp",
    "activationStatus": "Đã kích hoạt",
    "activationDate": "2023-01-11",
    "repairHistory": "1 lần sửa chữa (thay pin - 2023-08-20)",
    "checkedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Mô tả các trường Response:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `imei` | `string` | Số IMEI đã kiểm tra |
| `brand` | `string` | Thương hiệu thiết bị |
| `model` | `string` | Tên model đầy đủ |
| `modelNumber` | `string` | Mã model kỹ thuật |
| `color` | `string \| null` | Màu sắc thiết bị |
| `storage` | `string \| null` | Dung lượng lưu trữ |
| `isLocked` | `boolean` | Thiết bị có bị khóa carrier không |
| `lockType` | `string \| null` | Loại khóa: `CARRIER_LOCK`, `ICLOUD_LOCK`, `MDM_LOCK`, `null` nếu không bị khóa |
| `warrantyStatus` | `string` | Trạng thái bảo hành: "Còn bảo hành" / "Hết bảo hành" |
| `warrantyExpiry` | `string (date) \| null` | Ngày hết hạn bảo hành nhà sản xuất |
| `purchaseDate` | `string (date) \| null` | Ngày mua (ngày kích hoạt lần đầu) |
| `purchaseCountry` | `string \| null` | Quốc gia mua hàng |
| `isBlacklisted` | `boolean` | Thiết bị có trong danh sách đen không (mất/trộm) |
| `blacklistReason` | `string \| null` | Lý do vào danh sách đen |
| `activationStatus` | `string` | Trạng thái kích hoạt: "Đã kích hoạt" / "Chưa kích hoạt" |
| `activationDate` | `string (date) \| null` | Ngày kích hoạt lần đầu |
| `repairHistory` | `string \| null` | Tóm tắt lịch sử sửa chữa (nếu có) |
| `checkedAt` | `string (ISO 8601)` | Thời điểm thực hiện kiểm tra |

**Ghi chú kỹ thuật:**
> Trong môi trường Production, endpoint này tích hợp với dịch vụ IMEI database bên ngoài (ví dụ: IMEI.info API, GSMA Device Check). Response có thể cần thêm xử lý mapping từ external API sang format chuẩn.

**Mã Lỗi:**

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| `400` | `IMEI_INVALID_FORMAT` | IMEI không đúng 15 chữ số |
| `400` | `IMEI_INVALID_CHECKSUM` | IMEI không hợp lệ theo Luhn Algorithm |
| `429` | `RATE_LIMIT_EXCEEDED` | Vượt quá giới hạn 10 request/giờ/IP |
| `503` | `IMEI_SERVICE_UNAVAILABLE` | Dịch vụ kiểm tra IMEI tạm thời không khả dụng |

---

## Danh Sách Error Codes

### Returns Module

| Error Code | HTTP Status | Mô tả |
|------------|-------------|-------|
| `RETURN_ORDER_NOT_DELIVERED` | 400 | Đơn hàng chưa ở trạng thái DELIVERED |
| `RETURN_WINDOW_EXPIRED` | 400 | Đã quá thời hạn đổi trả cho phép |
| `RETURN_ALREADY_REQUESTED` | 400 | Đã có yêu cầu trả hàng đang xử lý |
| `RETURN_QUANTITY_EXCEEDED` | 400 | Số lượng trả vượt quá số lượng đã mua |
| `RETURN_ITEM_NOT_IN_ORDER` | 400 | Sản phẩm không thuộc đơn hàng |
| `RETURN_NOT_FOUND` | 404 | Không tìm thấy yêu cầu trả hàng |
| `ADMIN_NOTE_REQUIRED` | 400 | Bắt buộc có adminNote khi từ chối |
| `INVALID_STATUS_TRANSITION` | 400 | Chuyển đổi trạng thái không hợp lệ |

### Warranty Module

| Error Code | HTTP Status | Mô tả |
|------------|-------------|-------|
| `WARRANTY_NOT_FOUND` | 404 | Không tìm thấy bảo hành |
| `WARRANTY_EXPIRED` | 400 | Bảo hành đã hết hạn |
| `WARRANTY_NOT_VALID` | 400 | Bảo hành không ở trạng thái VALID |
| `WARRANTY_CLAIM_ALREADY_ACTIVE` | 400 | Đã có yêu cầu bảo hành đang xử lý |
| `WARRANTY_CLAIM_NOT_FOUND` | 404 | Không tìm thấy yêu cầu bảo hành |
| `WARRANTY_ALREADY_EXISTS` | 400 | Bảo hành đã tồn tại cho sản phẩm này |
| `RESOLUTION_REQUIRED` | 400 | Bắt buộc nhập kết quả khi RESOLVED/REJECTED |
| `INVALID_IMEI_FORMAT` | 400 | Số IMEI không hợp lệ |

### Trade-in Module

| Error Code | HTTP Status | Mô tả |
|------------|-------------|-------|
| `TRADE_IN_MODEL_NOT_SUPPORTED` | 400 | Model không được hỗ trợ thu mua |
| `TRADE_IN_INVALID_STORAGE` | 400 | Dung lượng không hợp lệ |
| `TRADE_IN_INSUFFICIENT_IMAGES` | 400 | Chưa đủ số lượng ảnh |
| `TRADE_IN_NOT_FOUND` | 404 | Không tìm thấy yêu cầu trade-in |
| `TRADE_IN_NOT_VALUED` | 400 | Yêu cầu chưa được định giá |
| `TRADE_IN_INVALID_STATUS` | 400 | Status không hợp lệ để thực hiện thao tác |
| `TRADE_IN_INVALID_FINAL_VALUE` | 400 | Giá định giá không hợp lệ |

### IMEI Module

| Error Code | HTTP Status | Mô tả |
|------------|-------------|-------|
| `IMEI_INVALID_FORMAT` | 400 | IMEI không đúng 15 chữ số |
| `IMEI_INVALID_CHECKSUM` | 400 | IMEI không hợp lệ theo Luhn Algorithm |
| `RATE_LIMIT_EXCEEDED` | 429 | Vượt quá giới hạn rate limit |
| `IMEI_SERVICE_UNAVAILABLE` | 503 | Dịch vụ kiểm tra IMEI không khả dụng |

### Common Errors

| Error Code | HTTP Status | Mô tả |
|------------|-------------|-------|
| `UNAUTHORIZED` | 401 | Chưa xác thực (thiếu hoặc token không hợp lệ) |
| `FORBIDDEN` | 403 | Không có quyền thực hiện thao tác |
| `ACCESS_DENIED` | 403 | Không có quyền truy cập tài nguyên này |
| `NOT_FOUND` | 404 | Tài nguyên không tồn tại |
| `VALIDATION_ERROR` | 422 | Dữ liệu đầu vào không hợp lệ |
| `ORDER_NOT_FOUND` | 404 | Không tìm thấy đơn hàng |
| `PRODUCT_NOT_FOUND` | 404 | Không tìm thấy sản phẩm |
| `CUSTOMER_NOT_FOUND` | 404 | Không tìm thấy khách hàng |
| `INTERNAL_SERVER_ERROR` | 500 | Lỗi hệ thống nội bộ |
| `INVALID_PAGE_PARAMS` | 400 | Tham số phân trang không hợp lệ |

---

## Phụ Lục: Enum Values

### ReturnReason
| Giá trị | Mô tả |
|---------|-------|
| `DEFECTIVE` | Sản phẩm bị lỗi (lỗi nhà sản xuất) |
| `WRONG_ITEM` | Giao nhầm sản phẩm |
| `NOT_AS_DESCRIBED` | Sản phẩm không đúng mô tả |
| `CHANGED_MIND` | Thay đổi ý định (đổi ý) |
| `OTHER` | Lý do khác |

### ReturnStatus
| Giá trị | Mô tả |
|---------|-------|
| `PENDING` | Chờ admin xem xét |
| `APPROVED` | Đã chấp thuận |
| `REJECTED` | Đã từ chối |
| `PROCESSING` | Đang xử lý (đã nhận hàng trả về) |
| `REFUNDED` | Đã hoàn tiền |
| `CLOSED` | Đã đóng |

### RefundMethod
| Giá trị | Mô tả |
|---------|-------|
| `ORIGINAL_PAYMENT` | Hoàn về phương thức thanh toán gốc |
| `STORE_CREDIT` | Hoàn vào ví/điểm thưởng tại cửa hàng |
| `BANK_TRANSFER` | Chuyển khoản ngân hàng |

### WarrantyStatus
| Giá trị | Mô tả |
|---------|-------|
| `VALID` | Còn hiệu lực |
| `EXPIRED` | Đã hết hạn |
| `PROCESSING` | Đang xử lý bảo hành |
| `REJECTED` | Bị từ chối bảo hành |

### ClaimType
| Giá trị | Mô tả |
|---------|-------|
| `REPAIR` | Yêu cầu sửa chữa |
| `REPLACEMENT` | Yêu cầu đổi máy mới |
| `REFUND` | Yêu cầu hoàn tiền |

### ClaimStatus
| Giá trị | Mô tả |
|---------|-------|
| `NEW` | Mới tạo, chờ xử lý |
| `PROCESSING` | Đang xử lý |
| `RESOLVED` | Đã xử lý xong |
| `REJECTED` | Từ chối |

### TradeInCondition
| Giá trị | Mô tả | Hệ số |
|---------|-------|-------|
| `GOOD` | Tốt (95-100%, không trầy, đủ phụ kiện) | 1.0 |
| `FAIR` | Khá (trầy nhỏ, pin > 85%) | 0.85 |
| `AVERAGE` | Trung bình (trầy rõ, pin 70-85%) | 0.7 |
| `POOR` | Kém (hư hỏng, vỡ màn, pin < 70%) | 0.5 |

### TradeInStatus
| Giá trị | Mô tả |
|---------|-------|
| `AWAITING_VALUATION` | Chờ định giá từ admin |
| `VALUED` | Admin đã định giá, chờ khách xác nhận |
| `ACCEPTED` | Khách đã chấp nhận giá |
| `REJECTED` | Khách từ chối giá |
| `COMPLETED` | Hoàn tất giao dịch |
| `CANCELLED` | Đã hủy |

---

*Tài liệu này được tạo cho dự án CELLPHONES eCommerce Platform - PTSP-VHV*  
*Developer: Spring Boot Java | Version API: v1*
