# 05 - API Specification: Cart, Orders & Promotions

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
  "errorCode": "ORDER_NOT_FOUND",
  "message": "Không tìm thấy đơn hàng",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/orders/abc123"
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

### Cấu trúc PaginatedResponse chuẩn

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Shared Schemas (Dùng lại trong nhiều endpoint)

### CartItem Object

Đại diện cho một sản phẩm trong giỏ hàng.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID item trong giỏ hàng |
| `productId` | `UUID` | ID sản phẩm |
| `variantId` | `UUID?` | ID biến thể sản phẩm (màu sắc, dung lượng, ...) |
| `productName` | `string` | Tên sản phẩm |
| `productImage` | `string` | URL ảnh đại diện sản phẩm |
| `brand` | `string` | Thương hiệu sản phẩm |
| `variantName` | `string?` | Tên biến thể (vd: "Đen / 256GB") |
| `color` | `string?` | Màu sắc biến thể |
| `storage` | `string?` | Dung lượng lưu trữ biến thể |
| `quantity` | `int` | Số lượng trong giỏ hàng (>= 1) |
| `unitPrice` | `long` | Đơn giá tại thời điểm thêm vào giỏ (VND) |
| `totalPrice` | `long` | Thành tiền = `quantity × unitPrice` |
| `note` | `string?` | Ghi chú của khách cho sản phẩm này |
| `addedAt` | `datetime` | Thời điểm thêm vào giỏ hàng (ISO 8601) |

### Order Object (Full)

Đại diện cho một đơn hàng đầy đủ.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID đơn hàng |
| `orderNumber` | `string` | Mã đơn hàng (vd: "CP2026051200001") |
| `customerId` | `UUID` | ID khách hàng |
| `customerName` | `string` | Tên khách hàng |
| `customerPhone` | `string` | SĐT khách hàng |
| `customerEmail` | `string` | Email khách hàng |
| `status` | `enum` | Trạng thái đơn hàng (xem bảng OrderStatus) |
| `paymentStatus` | `enum` | Trạng thái thanh toán (xem bảng PaymentStatus) |
| `paymentMethod` | `enum` | Phương thức thanh toán (COD, BANK_TRANSFER, MOMO, VNPAY, INSTALLMENT) |
| `shippingAddress` | `ShippingAddress` | Địa chỉ giao hàng (snapshot) |
| `items` | `OrderItem[]` | Danh sách sản phẩm trong đơn |
| `subtotal` | `long` | Tổng tiền hàng trước giảm giá (VND) |
| `discount` | `long` | Số tiền được giảm (VND) |
| `shippingFee` | `long` | Phí vận chuyển (VND) |
| `totalAmount` | `long` | Tổng thanh toán = subtotal - discount + shippingFee |
| `promotionCode` | `string?` | Mã khuyến mãi đã áp dụng |
| `promotionId` | `UUID?` | ID promotion đã áp dụng |
| `notes` | `string?` | Ghi chú đơn hàng của khách |
| `internalNotes` | `string?` | Ghi chú nội bộ (chỉ ADMIN thấy) |
| `cancelReason` | `string?` | Lý do huỷ đơn |
| `cancelledAt` | `datetime?` | Thời điểm huỷ đơn |
| `statusHistory` | `OrderStatusHistory[]` | Lịch sử thay đổi trạng thái |
| `createdAt` | `datetime` | Thời điểm tạo đơn hàng |
| `updatedAt` | `datetime` | Thời điểm cập nhật gần nhất |

### OrderItem Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID item trong đơn hàng |
| `productId` | `UUID` | ID sản phẩm |
| `variantId` | `UUID?` | ID biến thể |
| `productName` | `string` | Tên sản phẩm (snapshot tại thời điểm đặt hàng) |
| `productImage` | `string` | Ảnh sản phẩm (snapshot) |
| `variantName` | `string?` | Tên biến thể (snapshot) |
| `color` | `string?` | Màu sắc (snapshot) |
| `storage` | `string?` | Dung lượng (snapshot) |
| `quantity` | `int` | Số lượng |
| `unitPrice` | `long` | Đơn giá tại thời điểm đặt hàng |
| `totalPrice` | `long` | Thành tiền = `quantity × unitPrice` |

### ShippingAddress Object (Snapshot)

| Field | Type | Mô tả |
|-------|------|-------|
| `recipientName` | `string` | Tên người nhận |
| `phone` | `string` | SĐT người nhận |
| `province` | `string` | Tỉnh / Thành phố |
| `district` | `string` | Quận / Huyện |
| `ward` | `string` | Phường / Xã |
| `addressLine` | `string` | Địa chỉ chi tiết (số nhà, tên đường) |
| `fullAddress` | `string` | Địa chỉ đầy đủ (đã ghép) |

### OrderStatusHistory Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID lịch sử |
| `fromStatus` | `enum?` | Trạng thái trước (null nếu là trạng thái đầu tiên) |
| `toStatus` | `enum` | Trạng thái mới |
| `note` | `string?` | Ghi chú khi chuyển trạng thái |
| `changedBy` | `UUID` | ID người thực hiện chuyển trạng thái |
| `changedByName` | `string` | Tên người thực hiện |
| `changedAt` | `datetime` | Thời điểm chuyển trạng thái |

### Promotion Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID promotion |
| `code` | `string` | Mã khuyến mãi (unique, uppercase) |
| `name` | `string` | Tên chương trình khuyến mãi |
| `description` | `string?` | Mô tả chi tiết |
| `type` | `enum` | Loại giảm giá: `PERCENTAGE` (theo %) hoặc `FIXED_AMOUNT` (theo số tiền) |
| `value` | `decimal` | Giá trị giảm (% hoặc VND tuỳ `type`) |
| `minOrderValue` | `long` | Giá trị đơn hàng tối thiểu để áp dụng (VND) |
| `maxDiscount` | `long?` | Số tiền giảm tối đa (áp dụng khi type = PERCENTAGE) |
| `startDate` | `datetime` | Thời điểm bắt đầu hiệu lực |
| `endDate` | `datetime` | Thời điểm kết thúc hiệu lực |
| `usageLimit` | `int` | Số lần sử dụng tối đa (0 = không giới hạn) |
| `usedCount` | `int` | Số lần đã sử dụng |
| `applicableProducts` | `UUID[]` | Danh sách productId áp dụng (rỗng = tất cả) |
| `applicableCategories` | `UUID[]` | Danh sách categoryId áp dụng (rỗng = tất cả) |
| `applicableBrands` | `UUID[]` | Danh sách brandId áp dụng (rỗng = tất cả) |
| `isActive` | `boolean` | Trạng thái kích hoạt |

### Payment Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID thanh toán |
| `orderId` | `UUID` | ID đơn hàng liên quan |
| `orderNumber` | `string` | Mã đơn hàng |
| `method` | `enum` | Phương thức: `COD`, `BANK_TRANSFER`, `MOMO`, `VNPAY`, `INSTALLMENT` |
| `status` | `enum` | Trạng thái: `UNPAID`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED` |
| `amount` | `long` | Số tiền cần thanh toán (VND) |
| `paidAmount` | `long` | Số tiền đã thanh toán (VND) |
| `transactionId` | `string?` | Mã giao dịch từ cổng thanh toán |
| `paymentUrl` | `string?` | URL redirect đến cổng thanh toán (cho MOMO, VNPAY) |
| `paidAt` | `datetime?` | Thời điểm thanh toán thành công |
| `createdAt` | `datetime` | Thời điểm tạo bản ghi thanh toán |

### InstallmentPlan Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID gói trả góp |
| `bankName` | `string` | Tên ngân hàng / tổ chức tài chính |
| `logoUrl` | `string` | URL logo ngân hàng |
| `months` | `int[]` | Các kỳ hạn hỗ trợ (vd: [3, 6, 12, 24]) |
| `interestRate` | `decimal` | Lãi suất tháng (%) |
| `minAmount` | `long` | Giá trị tối thiểu để trả góp (VND) |
| `maxAmount` | `long` | Giá trị tối đa cho phép trả góp (VND) |
| `isActive` | `boolean` | Gói đang hoạt động hay không |

### Enum Definitions

**OrderStatus**

| Giá trị | Mô tả |
|---------|-------|
| `PENDING` | Chờ xác nhận |
| `CONFIRMED` | Đã xác nhận |
| `SHIPPING` | Đang giao hàng |
| `DELIVERED` | Đã giao hàng thành công |
| `CANCELLED` | Đã huỷ |
| `RETURNED` | Đang xử lý hoàn trả |

**PaymentStatus**

| Giá trị | Mô tả |
|---------|-------|
| `UNPAID` | Chưa thanh toán |
| `PAID` | Đã thanh toán |
| `FAILED` | Thanh toán thất bại |
| `REFUNDED` | Đã hoàn tiền |
| `PARTIALLY_REFUNDED` | Hoàn tiền một phần |

---

## Phần 1: Giỏ hàng (Cart)

Tất cả endpoint cart yêu cầu role **CUSTOMER** với JWT Bearer Token hợp lệ.

---

### 1.1 GET /cart

**Lấy giỏ hàng hiện tại của người dùng đang đăng nhập.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/cart` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |
| **Content-Type** | Không yêu cầu request body |

#### Parameters

Không có query parameter hay path variable.

#### Response 200 - Thành công

Trả về nội dung giỏ hàng hiện tại. Nếu chưa có item nào thì `items` là mảng rỗng.

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "productId": "11111111-1111-1111-1111-111111111111",
        "variantId": "22222222-2222-2222-2222-222222222222",
        "productName": "iPhone 15 Pro Max",
        "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
        "brand": "Apple",
        "variantName": "Titan Đen / 256GB",
        "color": "Titan Đen",
        "storage": "256GB",
        "quantity": 1,
        "unitPrice": 34990000,
        "totalPrice": 34990000,
        "note": null,
        "addedAt": "2026-05-12T09:00:00+07:00"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "productId": "33333333-3333-3333-3333-333333333333",
        "variantId": "44444444-4444-4444-4444-444444444444",
        "productName": "Samsung Galaxy S24 Ultra",
        "productImage": "https://cdn.cellphones.com.vn/s24ultra.jpg",
        "brand": "Samsung",
        "variantName": "Titanium Black / 512GB",
        "color": "Titanium Black",
        "storage": "512GB",
        "quantity": 1,
        "unitPrice": 31990000,
        "totalPrice": 31990000,
        "note": "Giao hàng giờ hành chính",
        "addedAt": "2026-05-12T09:15:00+07:00"
      }
    ],
    "itemCount": 2,
    "subtotal": 66980000,
    "estimatedShipping": 0
  },
  "message": "Lấy giỏ hàng thành công"
}
```

| Field response | Type | Mô tả |
|----------------|------|-------|
| `items` | `CartItem[]` | Danh sách sản phẩm trong giỏ hàng |
| `itemCount` | `int` | Tổng số loại sản phẩm khác nhau (không phải tổng số lượng) |
| `subtotal` | `long` | Tổng tiền hàng = sum của tất cả `items[].totalPrice` |
| `estimatedShipping` | `long` | Phí vận chuyển ước tính (0 nếu miễn phí hoặc chưa tính được) |

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `403` | `AUTH_FORBIDDEN` | Token không phải role CUSTOMER |

#### Ghi chú nghiệp vụ

- Giỏ hàng được lưu theo `customerId`, mỗi user chỉ có 1 giỏ hàng.
- `unitPrice` phản ánh giá tại thời điểm thêm vào giỏ, KHÔNG cập nhật theo giá hiện tại của sản phẩm.
- `estimatedShipping` = 0 nếu đơn hàng đủ điều kiện miễn phí vận chuyển, hoặc khi chưa có địa chỉ giao hàng.

---

### 1.2 POST /cart/items

**Thêm sản phẩm vào giỏ hàng.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `POST` |
| **URL** | `/api/v1/cart/items` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Request Body

```json
{
  "productId": "11111111-1111-1111-1111-111111111111",
  "variantId": "22222222-2222-2222-2222-222222222222",
  "quantity": 2,
  "note": "Giao trước 18h"
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `productId` | `UUID` | * | ID sản phẩm muốn thêm |
| `variantId` | `UUID` | ? | ID biến thể (bắt buộc nếu sản phẩm có nhiều variant) |
| `quantity` | `int` | * | Số lượng muốn thêm (>= 1) |
| `note` | `string` | ? | Ghi chú riêng cho sản phẩm này (tối đa 255 ký tự) |

#### Response 201 - Thêm mới thành công

Trả về CartItem vừa được tạo khi sản phẩm chưa có trong giỏ.

```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "productId": "11111111-1111-1111-1111-111111111111",
    "variantId": "22222222-2222-2222-2222-222222222222",
    "productName": "iPhone 15 Pro Max",
    "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
    "brand": "Apple",
    "variantName": "Titan Đen / 256GB",
    "color": "Titan Đen",
    "storage": "256GB",
    "quantity": 2,
    "unitPrice": 34990000,
    "totalPrice": 69980000,
    "note": "Giao trước 18h",
    "addedAt": "2026-05-12T10:00:00+07:00"
  },
  "message": "Thêm sản phẩm vào giỏ hàng thành công"
}
```

#### Response 200 - Merge quantity thành công

Trả về CartItem đã được cập nhật số lượng khi sản phẩm (productId + variantId) đã tồn tại trong giỏ.

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "productId": "11111111-1111-1111-1111-111111111111",
    "variantId": "22222222-2222-2222-2222-222222222222",
    "productName": "iPhone 15 Pro Max",
    "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
    "brand": "Apple",
    "variantName": "Titan Đen / 256GB",
    "color": "Titan Đen",
    "storage": "256GB",
    "quantity": 3,
    "unitPrice": 34990000,
    "totalPrice": 104970000,
    "note": "Giao trước 18h",
    "addedAt": "2026-05-12T09:00:00+07:00"
  },
  "message": "Đã cập nhật số lượng sản phẩm trong giỏ hàng"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `CART_QUANTITY_INVALID` | `quantity` < 1 hoặc không phải số nguyên |
| `400` | `CART_VARIANT_REQUIRED` | Sản phẩm có variants nhưng không truyền `variantId` |
| `400` | `CART_MAX_ITEMS_EXCEEDED` | Giỏ hàng đã có 50 loại sản phẩm khác nhau |
| `404` | `PRODUCT_NOT_FOUND` | Không tìm thấy sản phẩm theo `productId` |
| `404` | `VARIANT_NOT_FOUND` | Không tìm thấy variant theo `variantId` |
| `422` | `PRODUCT_INACTIVE` | Sản phẩm đang ở trạng thái không hoạt động (INACTIVE/DISCONTINUED) |
| `422` | `CART_INSUFFICIENT_STOCK` | Số lượng vượt quá tồn kho hiện có |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |

#### Ghi chú nghiệp vụ

1. **Validate sản phẩm:** Kiểm tra `product.status = ACTIVE`. Nếu sản phẩm INACTIVE hoặc DISCONTINUED thì từ chối.
2. **Validate variant:** Nếu sản phẩm có variants (hasVariants = true) thì `variantId` là bắt buộc và phải thuộc sản phẩm đó.
3. **Validate tồn kho:** `quantity` mới <= stock hiện có (với merge: tổng quantity sau merge <= stock).
4. **Merge logic:** Nếu cùng `(productId, variantId)` đã có trong giỏ → cộng thêm `quantity`, KHÔNG tạo item mới. `unitPrice` giữ nguyên theo giá đã lưu lúc thêm lần đầu.
5. **Giới hạn số loại sản phẩm:** Tối đa 50 item khác nhau trong 1 giỏ hàng (đếm số dòng, không đếm tổng số lượng).
6. **unitPrice:** Snapshot từ `variant.price` hoặc `product.price` tại thời điểm thêm vào giỏ. Giá này KHÔNG thay đổi nếu giá sản phẩm được cập nhật sau đó.

---

### 1.3 PATCH /cart/items/:id

**Cập nhật số lượng một sản phẩm trong giỏ hàng.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/cart/items/:id` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID của CartItem cần cập nhật |

#### Request Body

```json
{
  "quantity": 3
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `quantity` | `int` | * | Số lượng mới (>= 1). Để xoá item dùng DELETE /cart/items/:id |

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "productId": "11111111-1111-1111-1111-111111111111",
    "variantId": "22222222-2222-2222-2222-222222222222",
    "productName": "iPhone 15 Pro Max",
    "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
    "brand": "Apple",
    "variantName": "Titan Đen / 256GB",
    "color": "Titan Đen",
    "storage": "256GB",
    "quantity": 3,
    "unitPrice": 34990000,
    "totalPrice": 104970000,
    "note": "Giao trước 18h",
    "addedAt": "2026-05-12T09:00:00+07:00"
  },
  "message": "Cập nhật giỏ hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `CART_QUANTITY_INVALID` | `quantity` < 1 |
| `404` | `CART_ITEM_NOT_FOUND` | Không tìm thấy CartItem theo `id` |
| `403` | `CART_ACCESS_DENIED` | CartItem không thuộc giỏ hàng của user đang đăng nhập |
| `422` | `CART_INSUFFICIENT_STOCK` | Số lượng mới vượt quá tồn kho |
| `422` | `PRODUCT_INACTIVE` | Sản phẩm đã bị tắt kể từ khi thêm vào giỏ |

#### Ghi chú nghiệp vụ

- Chỉ cho phép thay đổi `quantity`. Để thay đổi variant cần xoá item cũ và thêm lại.
- `totalPrice` được tính lại tự động = `quantity mới × unitPrice` (unitPrice không đổi).
- Validate tồn kho theo `quantity` mới (không cộng thêm với số hiện tại).

---

### 1.4 DELETE /cart/items/:id

**Xoá một sản phẩm khỏi giỏ hàng.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/cart/items/:id` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID của CartItem cần xoá |

#### Request Body

Không có.

#### Response 204 - Thành công

Không có body trả về.

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `CART_ITEM_NOT_FOUND` | Không tìm thấy CartItem theo `id` |
| `403` | `CART_ACCESS_DENIED` | CartItem không thuộc giỏ hàng của user đang đăng nhập |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ

- Xoá vĩnh viễn item khỏi giỏ hàng. Không thể undo.
- Không ảnh hưởng đến tồn kho (tồn kho chỉ bị giữ khi tạo đơn hàng).

---

### 1.5 DELETE /cart

**Xoá toàn bộ giỏ hàng.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/cart` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Request Body

Không có.

#### Response 204 - Thành công

Không có body trả về.

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |

#### Ghi chú nghiệp vụ

- Xoá tất cả CartItem thuộc giỏ hàng của user hiện tại.
- Nếu giỏ hàng đã rỗng, vẫn trả về 204 (idempotent).
- Không ảnh hưởng đến tồn kho.

---

### 1.6 POST /cart/validate

**Kiểm tra tính hợp lệ của giỏ hàng trước khi tiến hành thanh toán (checkout).**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `POST` |
| **URL** | `/api/v1/cart/validate` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Request Body

Không có (server tự lấy giỏ hàng của user đang đăng nhập).

#### Response 200 - Giỏ hàng hợp lệ

```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": []
  },
  "message": "Giỏ hàng hợp lệ, có thể tiến hành thanh toán"
}
```

#### Response 200 - Giỏ hàng có vấn đề

Vẫn trả về HTTP 200, nhưng `valid = false` và `issues` chứa danh sách lỗi từng item.

```json
{
  "success": true,
  "data": {
    "valid": false,
    "issues": [
      {
        "cartItemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "productId": "11111111-1111-1111-1111-111111111111",
        "productName": "iPhone 15 Pro Max",
        "issue": "OUT_OF_STOCK"
      },
      {
        "cartItemId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "productId": "33333333-3333-3333-3333-333333333333",
        "productName": "Samsung Galaxy S24 Ultra",
        "issue": "PRICE_CHANGED",
        "oldPrice": 31990000,
        "newPrice": 29990000
      },
      {
        "cartItemId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "productId": "55555555-5555-5555-5555-555555555555",
        "productName": "OPPO Find X7 Ultra",
        "issue": "PRODUCT_INACTIVE"
      },
      {
        "cartItemId": "d4e5f6a7-b8c9-0123-defa-234567890123",
        "productId": "66666666-6666-6666-6666-666666666666",
        "productName": "Xiaomi 14 Ultra",
        "issue": "INSUFFICIENT_QUANTITY",
        "requestedQuantity": 5,
        "availableQuantity": 2
      }
    ]
  },
  "message": "Giỏ hàng có một số vấn đề cần xử lý trước khi thanh toán"
}
```

**Các loại issue:**

| issue | Mô tả |
|-------|-------|
| `OUT_OF_STOCK` | Sản phẩm hết hàng (stock = 0) |
| `INSUFFICIENT_QUANTITY` | Tồn kho không đủ số lượng yêu cầu |
| `PRICE_CHANGED` | Giá sản phẩm đã thay đổi kể từ khi thêm vào giỏ |
| `PRODUCT_INACTIVE` | Sản phẩm đã bị ẩn / ngừng kinh doanh |

**Fields trong issue object:**

| Field | Type | Có khi nào |
|-------|------|-----------|
| `cartItemId` | `UUID` | Luôn có |
| `productId` | `UUID` | Luôn có |
| `productName` | `string` | Luôn có |
| `issue` | `string` | Luôn có (enum trên) |
| `oldPrice` | `long` | Chỉ khi `PRICE_CHANGED` |
| `newPrice` | `long` | Chỉ khi `PRICE_CHANGED` |
| `requestedQuantity` | `int` | Chỉ khi `INSUFFICIENT_QUANTITY` |
| `availableQuantity` | `int` | Chỉ khi `INSUFFICIENT_QUANTITY` |

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `CART_EMPTY` | Giỏ hàng rỗng, không có gì để validate |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ

- Endpoint này KHÔNG thay đổi dữ liệu, chỉ đọc và kiểm tra.
- Frontend nên gọi endpoint này trước khi hiển thị trang thanh toán để thông báo cho user về các vấn đề.
- Khi `valid = false`, frontend nên hiển thị các `issues` và yêu cầu user tự xử lý (xoá item lỗi, cập nhật số lượng...) trước khi cho phép tiếp tục checkout.
- Với issue `PRICE_CHANGED`: frontend có thể hiển thị popup xác nhận "Giá sản phẩm đã thay đổi, bạn có muốn tiếp tục?" và cho phép user chấp nhận giá mới.

---

## Phần 2: Khuyến mãi (Promotions / Coupon)

---

### 2.1 GET /promotions

**Lấy danh sách chương trình khuyến mãi đang hoạt động.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/promotions` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Query Parameters

| Parameter | Type | Bắt buộc | Mô tả |
|-----------|------|----------|-------|
| `page` | `int` | ? | Trang hiện tại (default: 1) |
| `pageSize` | `int` | ? | Số item mỗi trang (default: 20, max: 100) |
| `search` | `string` | ? | Tìm kiếm theo mã khuyến mãi hoặc tên (case-insensitive) |

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "aaaa1111-bbbb-2222-cccc-333344445555",
        "code": "SUMMER50",
        "name": "Khuyến mãi hè 2026",
        "description": "Giảm 50% tối đa 500,000 VND cho đơn hàng từ 2,000,000 VND",
        "type": "PERCENTAGE",
        "value": 50,
        "minOrderValue": 2000000,
        "maxDiscount": 500000,
        "startDate": "2026-06-01T00:00:00+07:00",
        "endDate": "2026-08-31T23:59:59+07:00",
        "usageLimit": 1000,
        "usedCount": 247,
        "applicableProducts": [],
        "applicableCategories": [],
        "applicableBrands": [],
        "isActive": true
      },
      {
        "id": "bbbb2222-cccc-3333-dddd-444455556666",
        "code": "NEWUSER200",
        "name": "Ưu đãi khách hàng mới",
        "description": "Giảm 200,000 VND cho đơn hàng đầu tiên từ 5,000,000 VND",
        "type": "FIXED_AMOUNT",
        "value": 200000,
        "minOrderValue": 5000000,
        "maxDiscount": null,
        "startDate": "2026-01-01T00:00:00+07:00",
        "endDate": "2026-12-31T23:59:59+07:00",
        "usageLimit": 0,
        "usedCount": 1523,
        "applicableProducts": [],
        "applicableCategories": ["cccc3333-dddd-4444-eeee-555566667777"],
        "applicableBrands": [],
        "isActive": true
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "message": "Lấy danh sách khuyến mãi thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `400` | `PAGINATION_INVALID` | Tham số page hoặc pageSize không hợp lệ |

#### Ghi chú nghiệp vụ

- Chỉ trả về các promotion có `isActive = true` VÀ `startDate <= now <= endDate`.
- Không trả về promotion đã hết lượt dùng (`usedCount >= usageLimit` với `usageLimit > 0`).
- `usageLimit = 0` nghĩa là không giới hạn lượt dùng.
- Sắp xếp mặc định: `endDate ASC` (sắp hết hạn hiện trước).

---

### 2.2 POST /promotions/validate

**Kiểm tra tính hợp lệ của một mã khuyến mãi và tính số tiền được giảm.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `POST` |
| **URL** | `/api/v1/promotions/validate` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Request Body

```json
{
  "code": "SUMMER50",
  "cartTotal": 5000000,
  "cartItems": [
    {
      "productId": "11111111-1111-1111-1111-111111111111",
      "categoryId": "cccc3333-dddd-4444-eeee-555566667777",
      "brandId": "dddd4444-eeee-5555-ffff-666677778888"
    },
    {
      "productId": "33333333-3333-3333-3333-333333333333",
      "categoryId": "cccc3333-dddd-4444-eeee-555566667777",
      "brandId": "eeee5555-ffff-6666-0000-777788889999"
    }
  ]
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `code` | `string` | * | Mã khuyến mãi cần kiểm tra |
| `cartTotal` | `long` | * | Tổng giá trị giỏ hàng hiện tại (VND) |
| `cartItems` | `array` | * | Danh sách sản phẩm trong giỏ (để kiểm tra phạm vi áp dụng) |
| `cartItems[].productId` | `UUID` | * | ID sản phẩm |
| `cartItems[].categoryId` | `UUID` | ? | ID danh mục của sản phẩm |
| `cartItems[].brandId` | `UUID` | ? | ID thương hiệu của sản phẩm |

#### Response 200 - Mã hợp lệ

```json
{
  "success": true,
  "data": {
    "valid": true,
    "promotion": {
      "id": "aaaa1111-bbbb-2222-cccc-333344445555",
      "code": "SUMMER50",
      "name": "Khuyến mãi hè 2026",
      "description": "Giảm 50% tối đa 500,000 VND cho đơn hàng từ 2,000,000 VND",
      "type": "PERCENTAGE",
      "value": 50,
      "minOrderValue": 2000000,
      "maxDiscount": 500000,
      "startDate": "2026-06-01T00:00:00+07:00",
      "endDate": "2026-08-31T23:59:59+07:00",
      "usageLimit": 1000,
      "usedCount": 247,
      "applicableProducts": [],
      "applicableCategories": [],
      "applicableBrands": [],
      "isActive": true
    },
    "discount": 500000,
    "message": "Giảm 500,000 VND"
  },
  "message": "Mã khuyến mãi hợp lệ"
}
```

| Field | Type | Mô tả |
|-------|------|-------|
| `valid` | `boolean` | `true` nếu mã hợp lệ và áp dụng được |
| `promotion` | `Promotion` | Thông tin đầy đủ của promotion |
| `discount` | `long` | Số tiền được giảm (đã tính `maxDiscount`) |
| `message` | `string` | Mô tả ngắn gọn số tiền giảm (hiển thị cho user) |

**Logic tính `discount`:**
- Nếu `type = PERCENTAGE`: `discount = min(cartTotal × value / 100, maxDiscount)` (nếu `maxDiscount` có giá trị)
- Nếu `type = FIXED_AMOUNT`: `discount = value`

#### Response 200 - Mã không hợp lệ

```json
{
  "success": true,
  "data": {
    "valid": false,
    "promotion": null,
    "discount": 0,
    "message": "Mã khuyến mãi đã hết hạn sử dụng"
  },
  "message": "Mã khuyến mãi không hợp lệ"
}
```

#### Error Codes (HTTP 4xx — lỗi nghiêm trọng, không phải invalid coupon)

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `PROMOTION_NOT_FOUND` | Mã khuyến mãi không tồn tại trong hệ thống |
| `400` | `PROMOTION_INACTIVE` | Promotion bị tắt thủ công (`isActive = false`) |
| `400` | `PROMOTION_EXPIRED` | Ngoài khoảng `[startDate, endDate]` |
| `400` | `PROMOTION_USAGE_EXCEEDED` | `usedCount >= usageLimit` (và `usageLimit > 0`) |
| `400` | `PROMOTION_MIN_ORDER_NOT_MET` | `cartTotal < minOrderValue` |
| `400` | `PROMOTION_NOT_APPLICABLE` | Không có item nào trong giỏ thuộc phạm vi áp dụng |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ — Thứ tự kiểm tra (quan trọng, phải theo đúng thứ tự)

1. **Tồn tại:** Tìm promotion theo `code` (case-insensitive). Nếu không có → `PROMOTION_NOT_FOUND`.
2. **isActive:** Kiểm tra `promotion.isActive = true`. Nếu không → `PROMOTION_INACTIVE`.
3. **Thời hạn:** Kiểm tra `startDate <= now <= endDate`. Nếu không → `PROMOTION_EXPIRED`.
4. **Lượt dùng:** Nếu `usageLimit > 0`, kiểm tra `usedCount < usageLimit`. Nếu không → `PROMOTION_USAGE_EXCEEDED`.
5. **Giá trị tối thiểu:** Kiểm tra `cartTotal >= minOrderValue`. Nếu không → `PROMOTION_MIN_ORDER_NOT_MET`.
6. **Phạm vi áp dụng:**
   - Nếu cả `applicableProducts`, `applicableCategories`, `applicableBrands` đều rỗng → áp dụng cho tất cả, bỏ qua bước này.
   - Ngược lại: kiểm tra xem có ít nhất 1 item trong `cartItems` thoả mãn 1 trong 3 điều kiện:
     - `cartItems[].productId` nằm trong `applicableProducts`, HOẶC
     - `cartItems[].categoryId` nằm trong `applicableCategories`, HOẶC
     - `cartItems[].brandId` nằm trong `applicableBrands`.
   - Nếu không có item nào thoả → `PROMOTION_NOT_APPLICABLE`.

---

## Phần 3: Đơn hàng (Orders)

---

### 3.1 POST /orders

**Tạo đơn hàng mới (quy trình checkout).**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `POST` |
| **URL** | `/api/v1/orders` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Request Body

```json
{
  "items": [
    {
      "productId": "11111111-1111-1111-1111-111111111111",
      "variantId": "22222222-2222-2222-2222-222222222222",
      "quantity": 1
    },
    {
      "productId": "33333333-3333-3333-3333-333333333333",
      "variantId": "44444444-4444-4444-4444-444444444444",
      "quantity": 2
    }
  ],
  "shippingAddressId": "55555555-5555-5555-5555-555555555555",
  "paymentMethod": "COD",
  "promotionCode": "SUMMER50",
  "notes": "Giao hàng giờ hành chính, gọi trước khi giao"
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `items` | `array` | * | Danh sách sản phẩm đặt hàng (ít nhất 1 item) |
| `items[].productId` | `UUID` | * | ID sản phẩm |
| `items[].variantId` | `UUID` | ? | ID biến thể (bắt buộc nếu sản phẩm có variants) |
| `items[].quantity` | `int` | * | Số lượng (>= 1) |
| `shippingAddressId` | `UUID` | * | ID địa chỉ giao hàng của user |
| `paymentMethod` | `enum` | * | `COD` \| `BANK_TRANSFER` \| `MOMO` \| `VNPAY` \| `INSTALLMENT` |
| `promotionCode` | `string` | ? | Mã khuyến mãi muốn áp dụng |
| `notes` | `string` | ? | Ghi chú đơn hàng (tối đa 500 ký tự) |

#### Response 201 - Thành công

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord-aaaa-1111-bbbb-2222cccc3333",
      "orderNumber": "CP2026051200001",
      "customerId": "user-1234-5678-abcd-efgh12345678",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "customerEmail": "nguyenvana@gmail.com",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "paymentMethod": "COD",
      "shippingAddress": {
        "recipientName": "Nguyễn Văn A",
        "phone": "0901234567",
        "province": "TP. Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Phường Bến Nghé",
        "addressLine": "123 Lý Tự Trọng",
        "fullAddress": "123 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
      },
      "items": [
        {
          "id": "oi-1111-aaaa-2222-bbbb3333cccc",
          "productId": "11111111-1111-1111-1111-111111111111",
          "variantId": "22222222-2222-2222-2222-222222222222",
          "productName": "iPhone 15 Pro Max",
          "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
          "variantName": "Titan Đen / 256GB",
          "color": "Titan Đen",
          "storage": "256GB",
          "quantity": 1,
          "unitPrice": 34990000,
          "totalPrice": 34990000
        },
        {
          "id": "oi-2222-bbbb-3333-cccc4444dddd",
          "productId": "33333333-3333-3333-3333-333333333333",
          "variantId": "44444444-4444-4444-4444-444444444444",
          "productName": "Samsung Galaxy S24 Ultra",
          "productImage": "https://cdn.cellphones.com.vn/s24ultra.jpg",
          "variantName": "Titanium Black / 512GB",
          "color": "Titanium Black",
          "storage": "512GB",
          "quantity": 2,
          "unitPrice": 31990000,
          "totalPrice": 63980000
        }
      ],
      "subtotal": 98970000,
      "discount": 500000,
      "shippingFee": 0,
      "totalAmount": 98470000,
      "promotionCode": "SUMMER50",
      "promotionId": "aaaa1111-bbbb-2222-cccc-333344445555",
      "notes": "Giao hàng giờ hành chính, gọi trước khi giao",
      "internalNotes": null,
      "cancelReason": null,
      "cancelledAt": null,
      "statusHistory": [
        {
          "id": "sh-1111-aaaa-2222-bbbb3333cccc",
          "fromStatus": null,
          "toStatus": "PENDING",
          "note": "Đơn hàng được tạo",
          "changedBy": "user-1234-5678-abcd-efgh12345678",
          "changedByName": "Nguyễn Văn A",
          "changedAt": "2026-05-12T10:30:00+07:00"
        }
      ],
      "createdAt": "2026-05-12T10:30:00+07:00",
      "updatedAt": "2026-05-12T10:30:00+07:00"
    },
    "payment": {
      "id": "pay-aaaa-1111-bbbb-2222cccc3333",
      "orderId": "ord-aaaa-1111-bbbb-2222cccc3333",
      "orderNumber": "CP2026051200001",
      "method": "COD",
      "status": "UNPAID",
      "amount": 98470000,
      "paidAmount": 0,
      "transactionId": null,
      "paymentUrl": null,
      "paidAt": null,
      "createdAt": "2026-05-12T10:30:00+07:00"
    }
  },
  "message": "Tạo đơn hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `ORDER_EMPTY_ITEMS` | Không có sản phẩm nào trong request |
| `400` | `ORDER_ADDRESS_REQUIRED` | Thiếu `shippingAddressId` |
| `404` | `ADDRESS_NOT_FOUND` | Địa chỉ giao hàng không tồn tại hoặc không thuộc user |
| `404` | `PRODUCT_NOT_FOUND` | Sản phẩm không tồn tại |
| `422` | `PRODUCT_INACTIVE` | Sản phẩm không còn hoạt động |
| `422` | `ORDER_INSUFFICIENT_STOCK` | Tồn kho không đủ cho một hoặc nhiều sản phẩm |
| `400` | `PROMOTION_NOT_FOUND` | Mã khuyến mãi không tồn tại |
| `400` | `PROMOTION_EXPIRED` | Mã khuyến mãi hết hạn |
| `400` | `PROMOTION_USAGE_EXCEEDED` | Mã khuyến mãi hết lượt dùng |
| `400` | `PROMOTION_MIN_ORDER_NOT_MET` | Giá trị đơn hàng chưa đạt tối thiểu để dùng mã |
| `400` | `PROMOTION_NOT_APPLICABLE` | Mã không áp dụng cho sản phẩm trong đơn hàng |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ (thực hiện theo đúng thứ tự)

1. **Validate tất cả items:** Kiểm tra từng `(productId, variantId)` tồn tại, ACTIVE và đủ tồn kho. Nếu bất kỳ item nào lỗi → reject toàn bộ đơn hàng (không partial).
2. **Validate promotionCode:** Nếu có `promotionCode`, chạy toàn bộ logic validate promotion (xem mục 2.2).
3. **Tính toán giá:**
   - Lấy `unitPrice` từ `variant.price` hoặc `product.price` tại thời điểm đặt hàng (không lấy từ giỏ hàng).
   - `subtotal = Σ(items[i].quantity × items[i].unitPrice)`
   - `discount` = tính từ promotion (nếu có), ngược lại = 0.
   - `shippingFee` = tính theo rule vận chuyển (ví dụ: miễn phí nếu `subtotal >= 3,000,000`).
   - `totalAmount = subtotal - discount + shippingFee`
4. **Tạo orderNumber:** Format `"CP" + YYYYMMDD + 5 chữ số sequential` (ví dụ: `CP2026051200001`). Dùng database sequence hoặc pessimistic lock để tránh duplicate.
5. **Tạo Order:** `status = PENDING`, `paymentStatus = UNPAID`.
6. **Tạo Payment record:** Liên kết với Order.
7. **Tạo OrderStatusHistory:** Entry đầu tiên `fromStatus = null`, `toStatus = PENDING`.
8. **Xoá giỏ hàng:** Sau khi tạo đơn thành công → clear cart của user.
9. **Gửi notification:** Tạo thông báo trong hệ thống và gửi email xác nhận đơn hàng cho customer.
10. **Tăng usedCount:** Nếu có promotion → tăng `promotion.usedCount += 1` (dùng atomic update để tránh race condition).
11. **Toàn bộ trong 1 database transaction:** Nếu bất kỳ bước nào thất bại → rollback toàn bộ.

---

### 3.2 GET /orders

**Lấy danh sách đơn hàng của customer đang đăng nhập.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/orders` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Query Parameters

| Parameter | Type | Bắt buộc | Mô tả |
|-----------|------|----------|-------|
| `page` | `int` | ? | Trang hiện tại (default: 1) |
| `pageSize` | `int` | ? | Số item mỗi trang (default: 10, max: 50) |
| `status` | `enum` | ? | Lọc theo trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED, RETURNED) |
| `search` | `string` | ? | Tìm kiếm theo `orderNumber` |

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ord-aaaa-1111-bbbb-2222cccc3333",
        "orderNumber": "CP2026051200001",
        "status": "SHIPPING",
        "paymentStatus": "PAID",
        "totalAmount": 98470000,
        "items": {
          "count": 2,
          "firstItem": {
            "productName": "iPhone 15 Pro Max",
            "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
            "variantName": "Titan Đen / 256GB"
          }
        },
        "createdAt": "2026-05-12T10:30:00+07:00"
      },
      {
        "id": "ord-bbbb-2222-cccc-3333dddd4444",
        "orderNumber": "CP2026050800042",
        "status": "DELIVERED",
        "paymentStatus": "PAID",
        "totalAmount": 25990000,
        "items": {
          "count": 1,
          "firstItem": {
            "productName": "OPPO Find X7 Ultra",
            "productImage": "https://cdn.cellphones.com.vn/findx7ultra.jpg",
            "variantName": "Đen / 512GB"
          }
        },
        "createdAt": "2026-05-08T14:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "message": "Lấy danh sách đơn hàng thành công"
}
```

**Order Summary Object (trong danh sách):**

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID đơn hàng |
| `orderNumber` | `string` | Mã đơn hàng |
| `status` | `enum` | Trạng thái hiện tại |
| `paymentStatus` | `enum` | Trạng thái thanh toán |
| `totalAmount` | `long` | Tổng tiền thanh toán |
| `items.count` | `int` | Tổng số loại sản phẩm trong đơn |
| `items.firstItem` | `object` | Thông tin preview sản phẩm đầu tiên |
| `createdAt` | `datetime` | Thời điểm tạo đơn |

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `PAGINATION_INVALID` | Tham số phân trang không hợp lệ |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ

- Chỉ trả về đơn hàng của `customerId` từ token hiện tại. Customer không thấy đơn của người khác.
- Sắp xếp mặc định: `createdAt DESC` (mới nhất lên đầu).

---

### 3.3 GET /orders/:id

**Lấy chi tiết một đơn hàng cụ thể.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/orders/:id` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID đơn hàng |

#### Response 200 - Thành công

Trả về full Order object với `items[]` và `statusHistory[]`.

```json
{
  "success": true,
  "data": {
    "id": "ord-aaaa-1111-bbbb-2222cccc3333",
    "orderNumber": "CP2026051200001",
    "customerId": "user-1234-5678-abcd-efgh12345678",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "customerEmail": "nguyenvana@gmail.com",
    "status": "SHIPPING",
    "paymentStatus": "PAID",
    "paymentMethod": "MOMO",
    "shippingAddress": {
      "recipientName": "Nguyễn Văn A",
      "phone": "0901234567",
      "province": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "addressLine": "123 Lý Tự Trọng",
      "fullAddress": "123 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
    },
    "items": [
      {
        "id": "oi-1111-aaaa-2222-bbbb3333cccc",
        "productId": "11111111-1111-1111-1111-111111111111",
        "variantId": "22222222-2222-2222-2222-222222222222",
        "productName": "iPhone 15 Pro Max",
        "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
        "variantName": "Titan Đen / 256GB",
        "color": "Titan Đen",
        "storage": "256GB",
        "quantity": 1,
        "unitPrice": 34990000,
        "totalPrice": 34990000
      }
    ],
    "subtotal": 34990000,
    "discount": 500000,
    "shippingFee": 0,
    "totalAmount": 34490000,
    "promotionCode": "SUMMER50",
    "promotionId": "aaaa1111-bbbb-2222-cccc-333344445555",
    "notes": "Giao hàng giờ hành chính",
    "internalNotes": null,
    "cancelReason": null,
    "cancelledAt": null,
    "statusHistory": [
      {
        "id": "sh-1111-aaaa-2222-bbbb3333cccc",
        "fromStatus": null,
        "toStatus": "PENDING",
        "note": "Đơn hàng được tạo",
        "changedBy": "user-1234-5678-abcd-efgh12345678",
        "changedByName": "Nguyễn Văn A",
        "changedAt": "2026-05-12T10:30:00+07:00"
      },
      {
        "id": "sh-2222-bbbb-3333-cccc4444dddd",
        "fromStatus": "PENDING",
        "toStatus": "CONFIRMED",
        "note": "Đã xác nhận đơn hàng",
        "changedBy": "admin-0001-0000-0000-000000000001",
        "changedByName": "Admin CELLPHONES",
        "changedAt": "2026-05-12T11:00:00+07:00"
      },
      {
        "id": "sh-3333-cccc-4444-dddd5555eeee",
        "fromStatus": "CONFIRMED",
        "toStatus": "SHIPPING",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHTK",
        "changedBy": "admin-0001-0000-0000-000000000001",
        "changedByName": "Admin CELLPHONES",
        "changedAt": "2026-05-12T14:00:00+07:00"
      }
    ],
    "createdAt": "2026-05-12T10:30:00+07:00",
    "updatedAt": "2026-05-12T14:00:00+07:00"
  },
  "message": "Lấy chi tiết đơn hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng theo `id` |
| `403` | `ORDER_ACCESS_DENIED` | Đơn hàng này không thuộc về customer đang đăng nhập |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ

- `internalNotes` KHÔNG trả về cho customer (chỉ ADMIN thấy). Field này nên được loại bỏ khỏi response DTO của endpoint này.
- Thứ tự `statusHistory` trả về: `changedAt ASC` (cũ nhất lên đầu).

---

### 3.4 DELETE /orders/:id/cancel

**Huỷ đơn hàng (chỉ customer chủ sở hữu).**

> **Lưu ý về method:** Sử dụng `DELETE` với sub-resource `/cancel` theo convention. Một số implementation dùng `PATCH /orders/:id/cancel` cũng chấp nhận được — team cần thống nhất.

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/orders/:id/cancel` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID đơn hàng muốn huỷ |

#### Request Body

```json
{
  "reason": "Tôi muốn thay đổi địa chỉ giao hàng"
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `reason` | `string` | ? | Lý do huỷ đơn (tối đa 500 ký tự, gợi ý nên có để cải thiện UX) |

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": {
    "id": "ord-aaaa-1111-bbbb-2222cccc3333",
    "orderNumber": "CP2026051200001",
    "customerId": "user-1234-5678-abcd-efgh12345678",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "customerEmail": "nguyenvana@gmail.com",
    "status": "CANCELLED",
    "paymentStatus": "REFUNDED",
    "paymentMethod": "MOMO",
    "shippingAddress": {
      "recipientName": "Nguyễn Văn A",
      "phone": "0901234567",
      "province": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "addressLine": "123 Lý Tự Trọng",
      "fullAddress": "123 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
    },
    "items": [ "...như trên..." ],
    "subtotal": 34990000,
    "discount": 500000,
    "shippingFee": 0,
    "totalAmount": 34490000,
    "promotionCode": "SUMMER50",
    "promotionId": "aaaa1111-bbbb-2222-cccc-333344445555",
    "notes": "Giao hàng giờ hành chính",
    "internalNotes": null,
    "cancelReason": "Tôi muốn thay đổi địa chỉ giao hàng",
    "cancelledAt": "2026-05-12T11:05:00+07:00",
    "statusHistory": [ "...đầy đủ lịch sử..." ],
    "createdAt": "2026-05-12T10:30:00+07:00",
    "updatedAt": "2026-05-12T11:05:00+07:00"
  },
  "message": "Huỷ đơn hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `403` | `ORDER_ACCESS_DENIED` | Đơn hàng không thuộc về user đang đăng nhập |
| `422` | `ORDER_CANNOT_CANCEL` | Không thể huỷ vì đơn đang ở trạng thái SHIPPING, DELIVERED, hoặc đã CANCELLED |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ

- **Chỉ cho phép huỷ khi:** `status = PENDING` hoặc `status = CONFIRMED`.
- **Sau khi huỷ thành công (trong 1 transaction):**
  1. Set `order.status = CANCELLED`, `order.cancelReason = reason`, `order.cancelledAt = now`.
  2. **Hoàn tồn kho:** Với mỗi item trong đơn, tăng `stock` tương ứng.
  3. **Xử lý hoàn tiền:**
     - Nếu `paymentStatus = UNPAID` (COD chưa giao): không cần làm gì thêm.
     - Nếu `paymentStatus = PAID`: tạo refund request, set `paymentStatus = REFUNDED` sau khi hoàn thành.
  4. Thêm `OrderStatusHistory` entry: `fromStatus = status cũ`, `toStatus = CANCELLED`.
  5. Tạo notification thông báo huỷ đơn cho customer.
  6. Giảm `promotion.usedCount -= 1` nếu đơn hàng đã dùng promotion.

---

### 3.5 GET /orders/:id/invoice

**Tải file hoá đơn PDF của đơn hàng.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/orders/:id/invoice` |
| **Auth** | Bearer Token (role: `CUSTOMER`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID đơn hàng |

#### Response 200 - Thành công

| Header | Giá trị |
|--------|---------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename="invoice-CP2026051200001.pdf"` |
| `Content-Length` | Kích thước file PDF (bytes) |

Body là binary stream của file PDF.

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `403` | `ORDER_ACCESS_DENIED` | Đơn hàng không thuộc về user đang đăng nhập |
| `422` | `INVOICE_NOT_AVAILABLE` | Đơn hàng chưa đủ điều kiện xuất hoá đơn (vd: còn PENDING) |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |

#### Ghi chú nghiệp vụ

- Hoá đơn chỉ khả dụng khi `status IN (CONFIRMED, SHIPPING, DELIVERED)`.
- PDF được generate on-demand hoặc lấy từ cache nếu đã tạo trước.
- Nội dung PDF bao gồm: thông tin người mua, địa chỉ giao hàng, danh sách sản phẩm, subtotal, discount, shippingFee, totalAmount, phương thức thanh toán, ngày đặt hàng.

---

## Phần 4: Admin - Quản lý đơn hàng

Tất cả endpoint trong phần này yêu cầu role **ADMIN** hoặc **STAFF** có quyền quản lý đơn hàng.

---

### 4.1 GET /admin/orders

**Lấy danh sách tất cả đơn hàng trong hệ thống (dành cho Admin).**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/admin/orders` |
| **Auth** | Bearer Token (role: `ADMIN` hoặc `STAFF`) |

#### Query Parameters

| Parameter | Type | Bắt buộc | Mô tả |
|-----------|------|----------|-------|
| `page` | `int` | ? | Trang hiện tại (default: 1) |
| `pageSize` | `int` | ? | Số item mỗi trang (default: 20, max: 100) |
| `sortBy` | `string` | ? | Trường sắp xếp: `createdAt` (default), `totalAmount`, `orderNumber` |
| `sortDir` | `string` | ? | Chiều sắp xếp: `asc`, `desc` (default: `desc`) |
| `status` | `enum` | ? | Lọc theo trạng thái đơn hàng |
| `paymentStatus` | `enum` | ? | Lọc theo trạng thái thanh toán |
| `search` | `string` | ? | Tìm kiếm theo `orderNumber`, tên khách hàng, hoặc SĐT khách hàng |
| `dateFrom` | `date` | ? | Lọc đơn hàng từ ngày (YYYY-MM-DD, theo `createdAt`) |
| `dateTo` | `date` | ? | Lọc đơn hàng đến ngày (YYYY-MM-DD, theo `createdAt`) |

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ord-aaaa-1111-bbbb-2222cccc3333",
        "orderNumber": "CP2026051200001",
        "customerId": "user-1234-5678-abcd-efgh12345678",
        "customerName": "Nguyễn Văn A",
        "customerPhone": "0901234567",
        "customerEmail": "nguyenvana@gmail.com",
        "status": "SHIPPING",
        "paymentStatus": "PAID",
        "paymentMethod": "MOMO",
        "subtotal": 34990000,
        "discount": 500000,
        "shippingFee": 0,
        "totalAmount": 34490000,
        "promotionCode": "SUMMER50",
        "items": {
          "count": 1,
          "firstItem": {
            "productName": "iPhone 15 Pro Max",
            "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
            "variantName": "Titan Đen / 256GB"
          }
        },
        "createdAt": "2026-05-12T10:30:00+07:00",
        "updatedAt": "2026-05-12T14:00:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 1250,
    "totalPages": 63,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "message": "Lấy danh sách đơn hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `PAGINATION_INVALID` | Tham số phân trang không hợp lệ |
| `400` | `DATE_RANGE_INVALID` | `dateFrom` > `dateTo` |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN/STAFF |

#### Ghi chú nghiệp vụ

- Endpoint này trả về ĐẦY ĐỦ tất cả đơn hàng của mọi customer.
- `internalNotes` được bao gồm trong response của admin.
- Khi `search` được cung cấp, tìm kiếm full-text (case-insensitive) trên `orderNumber`, `customerName`, `customerPhone`.

---

### 4.2 GET /admin/orders/:id

**Lấy chi tiết đơn hàng bất kỳ (dành cho Admin).**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/admin/orders/:id` |
| **Auth** | Bearer Token (role: `ADMIN` hoặc `STAFF`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID đơn hàng |

#### Response 200 - Thành công

Trả về full Order object (bao gồm cả `internalNotes`) với `items[]` và `statusHistory[]` đầy đủ. Cấu trúc tương tự mục 3.3, nhưng có thêm field `internalNotes`.

```json
{
  "success": true,
  "data": {
    "id": "ord-aaaa-1111-bbbb-2222cccc3333",
    "orderNumber": "CP2026051200001",
    "customerId": "user-1234-5678-abcd-efgh12345678",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "customerEmail": "nguyenvana@gmail.com",
    "status": "SHIPPING",
    "paymentStatus": "PAID",
    "paymentMethod": "MOMO",
    "shippingAddress": {
      "recipientName": "Nguyễn Văn A",
      "phone": "0901234567",
      "province": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "addressLine": "123 Lý Tự Trọng",
      "fullAddress": "123 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
    },
    "items": [
      {
        "id": "oi-1111-aaaa-2222-bbbb3333cccc",
        "productId": "11111111-1111-1111-1111-111111111111",
        "variantId": "22222222-2222-2222-2222-222222222222",
        "productName": "iPhone 15 Pro Max",
        "productImage": "https://cdn.cellphones.com.vn/iphone15promax.jpg",
        "variantName": "Titan Đen / 256GB",
        "color": "Titan Đen",
        "storage": "256GB",
        "quantity": 1,
        "unitPrice": 34990000,
        "totalPrice": 34990000
      }
    ],
    "subtotal": 34990000,
    "discount": 500000,
    "shippingFee": 0,
    "totalAmount": 34490000,
    "promotionCode": "SUMMER50",
    "promotionId": "aaaa1111-bbbb-2222-cccc-333344445555",
    "notes": "Giao hàng giờ hành chính",
    "internalNotes": "Khách VIP, ưu tiên giao trước",
    "cancelReason": null,
    "cancelledAt": null,
    "statusHistory": [
      {
        "id": "sh-1111-aaaa-2222-bbbb3333cccc",
        "fromStatus": null,
        "toStatus": "PENDING",
        "note": "Đơn hàng được tạo",
        "changedBy": "user-1234-5678-abcd-efgh12345678",
        "changedByName": "Nguyễn Văn A",
        "changedAt": "2026-05-12T10:30:00+07:00"
      },
      {
        "id": "sh-2222-bbbb-3333-cccc4444dddd",
        "fromStatus": "PENDING",
        "toStatus": "CONFIRMED",
        "note": "Đã xác nhận đơn hàng",
        "changedBy": "admin-0001-0000-0000-000000000001",
        "changedByName": "Admin CELLPHONES",
        "changedAt": "2026-05-12T11:00:00+07:00"
      }
    ],
    "createdAt": "2026-05-12T10:30:00+07:00",
    "updatedAt": "2026-05-12T14:00:00+07:00"
  },
  "message": "Lấy chi tiết đơn hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN/STAFF |

---

### 4.3 PATCH /admin/orders/:id/status

**Cập nhật trạng thái đơn hàng (dành cho Admin).**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/admin/orders/:id/status` |
| **Auth** | Bearer Token (role: `ADMIN`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID đơn hàng |

#### Request Body

```json
{
  "status": "CONFIRMED",
  "note": "Đã xác nhận đơn hàng, đủ hàng trong kho"
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `status` | `enum` | * | Trạng thái mới muốn chuyển đến |
| `note` | `string` | ? | Ghi chú lý do chuyển trạng thái (tối đa 500 ký tự) |

#### Response 200 - Thành công

Trả về full Order object đã được cập nhật (cấu trúc tương tự mục 4.2).

```json
{
  "success": true,
  "data": {
    "id": "ord-aaaa-1111-bbbb-2222cccc3333",
    "orderNumber": "CP2026051200001",
    "status": "CONFIRMED",
    "paymentStatus": "UNPAID",
    "...": "...các field khác...",
    "statusHistory": [
      {
        "id": "sh-1111-aaaa-2222-bbbb3333cccc",
        "fromStatus": null,
        "toStatus": "PENDING",
        "note": "Đơn hàng được tạo",
        "changedBy": "user-1234-5678-abcd-efgh12345678",
        "changedByName": "Nguyễn Văn A",
        "changedAt": "2026-05-12T10:30:00+07:00"
      },
      {
        "id": "sh-2222-bbbb-3333-cccc4444dddd",
        "fromStatus": "PENDING",
        "toStatus": "CONFIRMED",
        "note": "Đã xác nhận đơn hàng, đủ hàng trong kho",
        "changedBy": "admin-0001-0000-0000-000000000001",
        "changedByName": "Admin CELLPHONES",
        "changedAt": "2026-05-12T11:00:00+07:00"
      }
    ],
    "updatedAt": "2026-05-12T11:00:00+07:00"
  },
  "message": "Cập nhật trạng thái đơn hàng thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `422` | `ORDER_INVALID_STATUS_TRANSITION` | Chuyển trạng thái không hợp lệ (vi phạm state machine) |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `403` | `AUTH_FORBIDDEN` | Chỉ ADMIN mới được thay đổi trạng thái (STAFF chỉ xem) |

#### Các chuyển trạng thái hợp lệ (State Machine)

| Từ trạng thái | Sang trạng thái được phép |
|---------------|--------------------------|
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `SHIPPING`, `CANCELLED` |
| `SHIPPING` | `DELIVERED` |
| `DELIVERED` | `RETURNED` |
| `CANCELLED` | _(không chuyển được nữa)_ |
| `RETURNED` | _(không chuyển được nữa)_ |

#### Side Effects theo trạng thái mới

**Khi chuyển sang `CONFIRMED`:**
- Giữ (reserve) tồn kho cho các item trong đơn hàng.
- Gửi notification "Đơn hàng của bạn đã được xác nhận" cho customer.
- Gửi email xác nhận đơn hàng.

**Khi chuyển sang `SHIPPING`:**
- Tạo hoá đơn (invoice) nếu chưa tồn tại.
- Tạo shipment record liên kết với đơn hàng.
- Gửi notification "Đơn hàng đang được giao" cho customer.

**Khi chuyển sang `DELIVERED`:**
- Tính và cộng điểm tích luỹ (loyalty points) cho customer (tham chiếu `business-rules.md`).
- Mở cửa sổ đổi trả (return window) trong 7 ngày.
- Nếu `paymentMethod = COD`: cập nhật `paymentStatus = PAID`.
- Gửi notification "Giao hàng thành công" cho customer.

**Khi chuyển sang `CANCELLED` (bởi Admin):**
- Hoàn tồn kho cho tất cả items.
- Nếu `paymentStatus = PAID`: tạo refund request, cập nhật `paymentStatus = REFUNDED`.
- Gửi notification "Đơn hàng đã bị huỷ" cho customer.

**Khi chuyển sang `RETURNED`:**
- Tạo return record.
- Gửi notification "Yêu cầu hoàn trả đang được xử lý" cho customer.

---

### 4.4 PATCH /admin/orders/:id/notes

**Cập nhật ghi chú nội bộ của đơn hàng (chỉ Admin thấy).**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/admin/orders/:id/notes` |
| **Auth** | Bearer Token (role: `ADMIN` hoặc `STAFF`) |

#### Path Variable

| Variable | Type | Mô tả |
|----------|------|-------|
| `id` | `UUID` | ID đơn hàng |

#### Request Body

```json
{
  "notes": "Khách VIP, ưu tiên giao trước. Đã liên hệ xác nhận lúc 10:30."
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `notes` | `string` | * | Nội dung ghi chú nội bộ (tối đa 1000 ký tự). Ghi đè nội dung cũ. |

#### Response 200 - Thành công

Trả về full Order object đã được cập nhật `internalNotes`.

```json
{
  "success": true,
  "data": {
    "id": "ord-aaaa-1111-bbbb-2222cccc3333",
    "orderNumber": "CP2026051200001",
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "internalNotes": "Khách VIP, ưu tiên giao trước. Đã liên hệ xác nhận lúc 10:30.",
    "...": "...các field khác...",
    "updatedAt": "2026-05-12T11:30:00+07:00"
  },
  "message": "Cập nhật ghi chú nội bộ thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `404` | `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `400` | `NOTES_TOO_LONG` | Ghi chú vượt quá 1000 ký tự |
| `401` | `AUTH_TOKEN_MISSING` | Không có Bearer token |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN/STAFF |

#### Ghi chú nghiệp vụ

- `internalNotes` chỉ hiển thị trong các endpoint Admin (`/admin/orders/:id`).
- Endpoint này ghi đè (overwrite) toàn bộ `internalNotes`, không append.
- Không ghi log vào `OrderStatusHistory` (chỉ ghi chú, không phải thay đổi trạng thái).

---

## Phần 5: Trả góp (Installment Plans)

---

### 5.1 GET /installment-plans

**Lấy danh sách các gói trả góp đang hoạt động.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `GET` |
| **URL** | `/api/v1/installment-plans` |
| **Auth** | Public (không cần đăng nhập) |

#### Parameters

Không có query parameter. Trả về tất cả gói `isActive = true`.

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": [
    {
      "id": "plan-aaaa-1111-bbbb-2222cccc3333",
      "bankName": "Ngân hàng Techcombank",
      "logoUrl": "https://cdn.cellphones.com.vn/banks/techcombank.png",
      "months": [3, 6, 12, 24],
      "interestRate": 0.0,
      "minAmount": 3000000,
      "maxAmount": 100000000,
      "isActive": true
    },
    {
      "id": "plan-bbbb-2222-cccc-3333dddd4444",
      "bankName": "Ngân hàng Vietcombank",
      "logoUrl": "https://cdn.cellphones.com.vn/banks/vietcombank.png",
      "months": [3, 6, 12],
      "interestRate": 1.5,
      "minAmount": 5000000,
      "maxAmount": 50000000,
      "isActive": true
    },
    {
      "id": "plan-cccc-3333-dddd-4444eeee5555",
      "bankName": "HD Saison",
      "logoUrl": "https://cdn.cellphones.com.vn/banks/hdsaison.png",
      "months": [6, 12, 18, 24, 36],
      "interestRate": 2.0,
      "minAmount": 1000000,
      "maxAmount": 30000000,
      "isActive": true
    }
  ],
  "message": "Lấy danh sách gói trả góp thành công"
}
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi hệ thống |

#### Ghi chú nghiệp vụ

- Endpoint public, không yêu cầu xác thực — frontend có thể gọi ngay khi load trang chi tiết sản phẩm.
- `interestRate = 0.0` nghĩa là trả góp 0% lãi suất.
- Kết quả nên được cache phía server (Redis) với TTL = 1 giờ, vì dữ liệu thay đổi không thường xuyên.

---

### 5.2 POST /installment-plans/calculate

**Tính toán số tiền trả góp hàng tháng theo gói và kỳ hạn.**

#### Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| **Method** | `POST` |
| **URL** | `/api/v1/installment-plans/calculate` |
| **Auth** | Public (không cần đăng nhập) |

#### Request Body

```json
{
  "amount": 10000000,
  "planId": "plan-bbbb-2222-cccc-3333dddd4444",
  "months": 12
}
```

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `amount` | `long` | * | Giá trị sản phẩm / đơn hàng muốn trả góp (VND) |
| `planId` | `UUID` | * | ID gói trả góp (từ endpoint 5.1) |
| `months` | `int` | * | Số kỳ hạn muốn trả (phải nằm trong `plan.months[]`) |

#### Response 200 - Thành công

```json
{
  "success": true,
  "data": {
    "principal": 10000000,
    "interestRate": 1.5,
    "months": 12,
    "monthlyPayment": 913000,
    "totalInterest": 956000,
    "totalPayment": 10956000
  },
  "message": "Tính toán trả góp thành công"
}
```

| Field | Type | Mô tả |
|-------|------|-------|
| `principal` | `long` | Số tiền gốc cần trả góp (= `amount` đầu vào) |
| `interestRate` | `decimal` | Lãi suất tháng (%) theo gói đã chọn |
| `months` | `int` | Số kỳ hạn |
| `monthlyPayment` | `long` | Số tiền trả mỗi tháng (đã làm tròn đến đơn vị 1,000 VND) |
| `totalInterest` | `long` | Tổng tiền lãi phải trả = `totalPayment - principal` |
| `totalPayment` | `long` | Tổng số tiền trả toàn bộ = `monthlyPayment × months` |

**Công thức tính `monthlyPayment`:**

```
Nếu interestRate = 0:
  monthlyPayment = principal / months

Nếu interestRate > 0 (công thức trả góp đều - Amortization):
  r = interestRate / 100   (lãi suất tháng dạng thập phân)
  monthlyPayment = principal × r × (1+r)^months / ((1+r)^months - 1)

Làm tròn monthlyPayment lên đến bội số của 1,000 VND gần nhất.
totalPayment = monthlyPayment × months
totalInterest = totalPayment - principal
```

#### Error Codes

| HTTP | errorCode | Mô tả |
|------|-----------|-------|
| `400` | `INSTALLMENT_AMOUNT_TOO_LOW` | `amount < plan.minAmount` |
| `400` | `INSTALLMENT_AMOUNT_TOO_HIGH` | `amount > plan.maxAmount` |
| `400` | `INSTALLMENT_MONTHS_INVALID` | `months` không nằm trong `plan.months[]` |
| `404` | `INSTALLMENT_PLAN_NOT_FOUND` | Không tìm thấy gói trả góp hoặc gói đã bị tắt |

#### Ghi chú nghiệp vụ

- Validate `amount` nằm trong `[plan.minAmount, plan.maxAmount]`.
- Validate `months` phải là một trong các giá trị trong `plan.months[]`.
- Kết quả tính toán là ước tính, số tiền thực tế có thể khác nhau tuỳ theo chính sách ngân hàng tại thời điểm ký hợp đồng.
- Frontend nên hiển thị disclaimer: "Số tiền trả góp trên là ước tính, vui lòng liên hệ ngân hàng để biết điều khoản chính xác."

---

## Bảng tóm tắt tất cả Endpoints

| # | Method | URL | Auth | Mô tả |
|---|--------|-----|------|-------|
| 1 | `GET` | `/cart` | CUSTOMER | Lấy giỏ hàng hiện tại |
| 2 | `POST` | `/cart/items` | CUSTOMER | Thêm sản phẩm vào giỏ |
| 3 | `PATCH` | `/cart/items/:id` | CUSTOMER | Cập nhật số lượng item |
| 4 | `DELETE` | `/cart/items/:id` | CUSTOMER | Xoá một item khỏi giỏ |
| 5 | `DELETE` | `/cart` | CUSTOMER | Xoá toàn bộ giỏ hàng |
| 6 | `POST` | `/cart/validate` | CUSTOMER | Validate giỏ hàng trước checkout |
| 7 | `GET` | `/promotions` | CUSTOMER | Lấy danh sách khuyến mãi |
| 8 | `POST` | `/promotions/validate` | CUSTOMER | Kiểm tra mã khuyến mãi |
| 9 | `POST` | `/orders` | CUSTOMER | Tạo đơn hàng (checkout) |
| 10 | `GET` | `/orders` | CUSTOMER | Xem danh sách đơn hàng của mình |
| 11 | `GET` | `/orders/:id` | CUSTOMER | Xem chi tiết đơn hàng |
| 12 | `DELETE` | `/orders/:id/cancel` | CUSTOMER | Huỷ đơn hàng |
| 13 | `GET` | `/orders/:id/invoice` | CUSTOMER | Tải hoá đơn PDF |
| 14 | `GET` | `/admin/orders` | ADMIN/STAFF | Xem tất cả đơn hàng |
| 15 | `GET` | `/admin/orders/:id` | ADMIN/STAFF | Xem chi tiết đơn hàng (admin) |
| 16 | `PATCH` | `/admin/orders/:id/status` | ADMIN | Cập nhật trạng thái đơn hàng |
| 17 | `PATCH` | `/admin/orders/:id/notes` | ADMIN/STAFF | Cập nhật ghi chú nội bộ |
| 18 | `GET` | `/installment-plans` | Public | Lấy danh sách gói trả góp |
| 19 | `POST` | `/installment-plans/calculate` | Public | Tính toán trả góp hàng tháng |

---

## Bảng tóm tắt Error Codes trong tài liệu này

| errorCode | HTTP | Mô tả |
|-----------|------|-------|
| `CART_EMPTY` | 400 | Giỏ hàng rỗng |
| `CART_ITEM_NOT_FOUND` | 404 | Không tìm thấy CartItem |
| `CART_ACCESS_DENIED` | 403 | CartItem không thuộc giỏ hàng của user |
| `CART_QUANTITY_INVALID` | 400 | Số lượng không hợp lệ (< 1) |
| `CART_VARIANT_REQUIRED` | 400 | Thiếu variantId khi sản phẩm có variants |
| `CART_MAX_ITEMS_EXCEEDED` | 400 | Vượt quá 50 loại sản phẩm trong giỏ |
| `CART_INSUFFICIENT_STOCK` | 422 | Tồn kho không đủ |
| `PROMOTION_NOT_FOUND` | 400 | Mã khuyến mãi không tồn tại |
| `PROMOTION_INACTIVE` | 400 | Mã khuyến mãi bị tắt |
| `PROMOTION_EXPIRED` | 400 | Mã khuyến mãi hết hạn |
| `PROMOTION_USAGE_EXCEEDED` | 400 | Mã khuyến mãi hết lượt dùng |
| `PROMOTION_MIN_ORDER_NOT_MET` | 400 | Chưa đạt giá trị đơn hàng tối thiểu |
| `PROMOTION_NOT_APPLICABLE` | 400 | Mã không áp dụng cho sản phẩm trong giỏ |
| `ORDER_EMPTY_ITEMS` | 400 | Đơn hàng không có sản phẩm |
| `ORDER_ADDRESS_REQUIRED` | 400 | Thiếu địa chỉ giao hàng |
| `ORDER_INSUFFICIENT_STOCK` | 422 | Tồn kho không đủ khi đặt hàng |
| `ORDER_NOT_FOUND` | 404 | Không tìm thấy đơn hàng |
| `ORDER_ACCESS_DENIED` | 403 | Đơn hàng không thuộc về user |
| `ORDER_CANNOT_CANCEL` | 422 | Không thể huỷ đơn ở trạng thái hiện tại |
| `ORDER_INVALID_STATUS_TRANSITION` | 422 | Chuyển trạng thái đơn hàng không hợp lệ |
| `INVOICE_NOT_AVAILABLE` | 422 | Hoá đơn chưa khả dụng |
| `INSTALLMENT_PLAN_NOT_FOUND` | 404 | Không tìm thấy gói trả góp |
| `INSTALLMENT_AMOUNT_TOO_LOW` | 400 | Giá trị trả góp thấp hơn mức tối thiểu |
| `INSTALLMENT_AMOUNT_TOO_HIGH` | 400 | Giá trị trả góp vượt mức tối đa |
| `INSTALLMENT_MONTHS_INVALID` | 400 | Kỳ hạn không hợp lệ cho gói này |

---

*Tài liệu này là một phần của bộ tài liệu BA CELLPHONES eCommerce Platform. Tham chiếu thêm:*
- *`01-domain-entities.md` — Định nghĩa entities và relationships*
- *`02-database-design.md` — Thiết kế database chi tiết*
- *`10-business-rules.md` — Quy tắc nghiệp vụ tổng thể*
- *`11-rbac-security.md` — Phân quyền và bảo mật*
- *`12-error-codes.md` — Danh sách mã lỗi đầy đủ*
