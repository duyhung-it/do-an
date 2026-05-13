# 08 - API Specification: Loyalty Program & Notifications

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
| **Content-Type** | `application/json` |
| **Authentication** | JWT Bearer Token trong header `Authorization: Bearer <token>` |
| **Ký hiệu field** | `*` = bắt buộc (required), `?` = tuỳ chọn (optional) |
| **Múi giờ** | UTC+7 (Việt Nam), datetime format: `ISO 8601` |
| **Tiền tệ** | VND (số nguyên, không thập phân) |
| **UUID** | `java.util.UUID` format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### HTTP Status Codes

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

```json
{
  "success": false,
  "errorCode": "LOYALTY_INSUFFICIENT_POINTS",
  "message": "Điểm tích luỹ không đủ để đổi thưởng",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/loyalty/rewards/abc/redeem"
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
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## Shared Schemas

### LoyaltyProgram Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `customerId` | `UUID` | ID khách hàng |
| `customerName` | `string` | Họ tên khách hàng |
| `customerEmail` | `string` | Email khách hàng |
| `tier` | `enum` | `BRONZE` \| `SILVER` \| `GOLD` \| `DIAMOND` |
| `tierLabel` | `string` | Nhãn tiếng Việt: Đồng / Bạc / Vàng / Kim Cương |
| `points` | `int` | Điểm hiện tại (điểm có thể sử dụng) |
| `totalEarnedPoints` | `int` | Tổng điểm đã tích luỹ từ trước đến nay (dùng tính hạng) |
| `totalSpend` | `long` | Tổng chi tiêu tích luỹ (VND) |
| `joinedAt` | `datetime` | Ngày tham gia chương trình |
| `pointsExpiry` | `date` | Ngày hết hạn điểm (YYYY-MM-DD) |
| `nextTierThreshold` | `int` | Tổng điểm tích luỹ cần để lên hạng tiếp theo |
| `nextTierName` | `string?` | Tên hạng tiếp theo (null nếu đã DIAMOND) |
| `nextTierLabel` | `string?` | Nhãn hạng tiếp theo tiếng Việt |
| `pointsToNextTier` | `int` | Điểm còn thiếu để lên hạng (0 nếu đã DIAMOND) |
| `tierBenefits` | `object` | Quyền lợi hạng hiện tại và hạng tiếp theo |

### LoyaltyTransaction Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `loyaltyProgramId` | `UUID` | ID chương trình khách hàng |
| `type` | `enum` | `EARN` \| `REDEEM` \| `EXPIRE` \| `BONUS` |
| `points` | `int` | Số điểm thay đổi (dương = cộng, âm = trừ) |
| `balanceAfter` | `int` | Số dư điểm sau giao dịch |
| `description` | `string` | Mô tả giao dịch |
| `orderId` | `UUID?` | ID đơn hàng liên quan (nếu có) |
| `createdAt` | `datetime` | Thời điểm phát sinh giao dịch |

### LoyaltyReward Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `name` | `string` | Tên phần thưởng |
| `description` | `string` | Mô tả chi tiết |
| `pointsCost` | `int` | Số điểm cần để đổi |
| `category` | `string` | Danh mục: `VOUCHER` \| `GIFT` \| `SERVICE` \| `UPGRADE` |
| `available` | `boolean` | Còn hiển thị để đổi không |
| `stock` | `int` | Số lượng còn lại (-1 = không giới hạn) |
| `imageUrl` | `string?` | Ảnh minh hoạ phần thưởng |
| `createdAt` | `datetime` | Ngày tạo |
| `updatedAt` | `datetime` | Ngày cập nhật cuối |

### AppNotification Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `userId` | `UUID` | ID người nhận |
| `type` | `enum` | `ORDER` \| `PAYMENT` \| `PROMOTION` \| `LOYALTY` \| `SYSTEM` \| `REVIEW` |
| `title` | `string` | Tiêu đề thông báo |
| `message` | `string` | Nội dung chi tiết |
| `isRead` | `boolean` | Đã đọc chưa |
| `priority` | `enum` | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `category` | `string` | Phân loại hiển thị UI |
| `entityType` | `string?` | Loại đối tượng liên quan: `ORDER`, `PRODUCT`, v.v. |
| `entityId` | `UUID?` | ID đối tượng liên quan |
| `actionUrl` | `string?` | Đường dẫn khi nhấn thông báo |
| `actionLabel` | `string?` | Nhãn nút hành động |
| `isActionable` | `boolean` | Có hiển thị nút hành động không |
| `createdAt` | `datetime` | Thời điểm tạo |

### NotificationPreference Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `userId` | `UUID` | ID người dùng |
| `type` | `enum` | Loại thông báo: `ORDER`, `PAYMENT`, `PROMOTION`, `LOYALTY`, `SYSTEM` |
| `label` | `string` | Nhãn hiển thị tiếng Việt |
| `enabled` | `boolean` | Bật/tắt nhận thông báo loại này |
| `channel` | `enum` | `inApp` \| `email` \| `sms` \| `push` |

### InternalSupplier Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `name` | `string` | Tên nhà cung cấp |
| `contactPerson` | `string` | Người đại diện liên hệ |
| `phone` | `string` | Số điện thoại |
| `email` | `string` | Email |
| `address` | `string` | Địa chỉ |
| `categories` | `string[]` | Danh mục sản phẩm cung cấp |
| `paymentTerms` | `string` | Điều khoản thanh toán |
| `isActive` | `boolean` | Đang hợp tác hay không |
| `createdAt` | `datetime` | Ngày tạo |
| `updatedAt` | `datetime` | Ngày cập nhật |

### InstallmentPlan Object

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | Primary key |
| `bankName` | `string` | Tên ngân hàng / tổ chức tài chính |
| `logoUrl` | `string?` | URL logo ngân hàng |
| `months` | `int` | Số tháng trả góp |
| `interestRate` | `decimal` | Lãi suất (%/tháng, 0 = 0%) |
| `minAmount` | `long` | Giá trị đơn hàng tối thiểu (VND) |
| `maxAmount` | `long?` | Giá trị đơn hàng tối đa (VND, null = không giới hạn) |
| `isActive` | `boolean` | Đang áp dụng không |
| `createdAt` | `datetime` | Ngày tạo |

---

## Quy tắc Hạng Thành Viên (Tier Rules)

Hạng được tính dựa trên **tổng điểm đã tích luỹ** (`totalEarnedPoints`), không phải điểm hiện tại:

| Hạng | Tên tiếng Việt | Ngưỡng điểm tích luỹ | Tỉ lệ tích điểm |
|------|----------------|----------------------|-----------------|
| `BRONZE` | Đồng | 0 – 999 | 1 điểm / 100.000 VND |
| `SILVER` | Bạc | 1.000 – 4.999 | 1 điểm / 100.000 VND |
| `GOLD` | Vàng | 5.000 – 19.999 | 1,5 điểm / 100.000 VND |
| `DIAMOND` | Kim Cương | 20.000+ | 2 điểm / 100.000 VND |

**Hạng không bao giờ bị giảm** dù khách hàng dùng điểm. Hạng chỉ tăng theo tổng điểm lịch sử tích luỹ.

---

# PHẦN 1: LOYALTY PROGRAM (CUSTOMER)

---

## 1.1 GET /loyalty/me

**Mô tả:** Lấy thông tin chương trình khách hàng thân thiết của người dùng hiện tại.

**Phân quyền:** `CUSTOMER` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/loyalty/me
Authorization: Bearer <customer_token>
```

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "nguyenvanan@email.com",
    "tier": "SILVER",
    "tierLabel": "Bạc",
    "points": 1250,
    "totalEarnedPoints": 2450,
    "totalSpend": 45000000,
    "joinedAt": "2023-01-15T08:00:00+07:00",
    "pointsExpiry": "2025-01-15",
    "nextTierThreshold": 5000,
    "nextTierName": "GOLD",
    "nextTierLabel": "Vàng",
    "pointsToNextTier": 2550,
    "tierBenefits": {
      "current": [
        "Tích 1 điểm / 100.000 VND",
        "Ưu tiên hỗ trợ khách hàng",
        "Sinh nhật giảm 5%"
      ],
      "next": [
        "Tích 1,5 điểm / 100.000 VND",
        "Miễn phí vận chuyển toàn bộ đơn hàng",
        "Quà sinh nhật trị giá 200.000 VND",
        "Truy cập Flash Sale sớm 1 giờ"
      ]
    }
  }
}
```

**Response 401 — Chưa xác thực:**
```json
{
  "success": false,
  "errorCode": "AUTH_TOKEN_MISSING",
  "message": "Vui lòng đăng nhập để tiếp tục",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/loyalty/me"
}
```

**Response 404 — Chưa có chương trình tích điểm:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_PROGRAM_NOT_FOUND",
  "message": "Chương trình tích điểm chưa được khởi tạo cho tài khoản này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/loyalty/me"
}
```

**Ghi chú nghiệp vụ:**
- Chương trình tích điểm được tự động khởi tạo với hạng `BRONZE` khi khách hàng đăng ký tài khoản thành công.
- `points` là điểm hiện tại có thể dùng đổi thưởng.
- `totalEarnedPoints` là tổng điểm lịch sử dùng để xác định hạng, không bị giảm khi đổi thưởng.
- `pointsExpiry` được reset về 12 tháng kể từ lần cuối có giao dịch `EARN`.
- Backend cần tự động tính `pointsToNextTier = nextTierThreshold - totalEarnedPoints`.

---

## 1.2 GET /loyalty/me/transactions

**Mô tả:** Lấy lịch sử giao dịch điểm tích luỹ của người dùng hiện tại, có phân trang và lọc theo loại giao dịch.

**Phân quyền:** `CUSTOMER` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/loyalty/me/transactions?page=1&pageSize=20&type=EARN
Authorization: Bearer <customer_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không (default: 1) | Số trang |
| `pageSize` | `int` | Không (default: 20, max: 100) | Số bản ghi mỗi trang |
| `type` | `enum` | Không | Lọc theo loại: `EARN` \| `REDEEM` \| `EXPIRE` \| `BONUS` |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "loyaltyProgramId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "EARN",
      "points": 150,
      "balanceAfter": 1250,
      "description": "Tích điểm từ đơn hàng #DH-20240215-001",
      "orderId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "createdAt": "2024-02-15T14:30:00+07:00"
    },
    {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "loyaltyProgramId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "REDEEM",
      "points": -400,
      "balanceAfter": 1100,
      "description": "Đổi thưởng: Voucher giảm 100.000 VND",
      "orderId": null,
      "createdAt": "2024-01-20T10:15:00+07:00"
    },
    {
      "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "loyaltyProgramId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "BONUS",
      "points": 100,
      "balanceAfter": 1500,
      "description": "Thưởng điểm nhân dịp sinh nhật",
      "orderId": null,
      "createdAt": "2024-01-01T00:00:00+07:00"
    },
    {
      "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
      "loyaltyProgramId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "EXPIRE",
      "points": -200,
      "balanceAfter": 850,
      "description": "Điểm hết hạn sử dụng",
      "orderId": null,
      "createdAt": "2023-12-31T23:59:59+07:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Ghi chú nghiệp vụ:**
- `points` mang giá trị âm khi là `REDEEM` hoặc `EXPIRE`.
- `balanceAfter` là số dư điểm **có thể sử dụng** sau giao dịch đó — dùng để hiển thị biểu đồ lịch sử.
- Kết quả sắp xếp mặc định theo `createdAt DESC` (mới nhất lên trước).
- `orderId` chỉ có giá trị khi `type = EARN` và điểm được tích từ đơn hàng.

---

## 1.3 GET /loyalty/me/stats

**Mô tả:** Lấy thống kê tổng quan điểm tích luỹ của người dùng, bao gồm điểm sắp hết hạn và lịch sử tích điểm theo tháng (12 tháng gần nhất).

**Phân quyền:** `CUSTOMER` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/loyalty/me/stats
Authorization: Bearer <customer_token>
```

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "currentPoints": 1250,
    "expiringPoints": 200,
    "expiryDate": "2025-01-15",
    "totalEarned": 2450,
    "totalRedeemed": 1200,
    "totalBonusReceived": 300,
    "totalExpired": 200,
    "monthlyEarned": [
      { "month": "2023-02", "points": 50 },
      { "month": "2023-03", "points": 80 },
      { "month": "2023-04", "points": 0 },
      { "month": "2023-05", "points": 120 },
      { "month": "2023-06", "points": 200 },
      { "month": "2023-07", "points": 90 },
      { "month": "2023-08", "points": 150 },
      { "month": "2023-09", "points": 310 },
      { "month": "2023-10", "points": 420 },
      { "month": "2023-11", "points": 580 },
      { "month": "2023-12", "points": 250 },
      { "month": "2024-01", "points": 200 }
    ]
  }
}
```

**Mô tả các trường response:**

| Field | Type | Mô tả |
|-------|------|-------|
| `currentPoints` | `int` | Điểm hiện tại có thể sử dụng |
| `expiringPoints` | `int` | Số điểm sắp hết hạn (trong 30 ngày tới) |
| `expiryDate` | `date` | Ngày hết hạn của batch điểm sắp hết hạn |
| `totalEarned` | `int` | Tổng điểm đã tích từ đơn hàng (loại EARN) |
| `totalRedeemed` | `int` | Tổng điểm đã đổi thưởng (giá trị tuyệt đối) |
| `totalBonusReceived` | `int` | Tổng điểm bonus nhận được |
| `totalExpired` | `int` | Tổng điểm đã hết hạn |
| `monthlyEarned` | `array` | Mảng 12 tháng gần nhất, mỗi phần tử gồm `month` (YYYY-MM) và `points` (int) |

**Ghi chú nghiệp vụ:**
- `monthlyEarned` chỉ tính loại giao dịch `EARN` (tích từ mua hàng), không bao gồm `BONUS`.
- Tháng không có giao dịch vẫn trả về với `points: 0` để frontend vẽ biểu đồ đầy đủ.
- `expiringPoints` = tổng điểm sẽ `EXPIRE` trong 30 ngày tới tính từ ngày hôm nay.

---

## 1.4 GET /loyalty/rewards

**Mô tả:** Lấy danh sách phần thưởng có thể đổi điểm. Chỉ trả về phần thưởng đang `available = true`.

**Phân quyền:** `CUSTOMER` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/loyalty/rewards?page=1&pageSize=12&category=VOUCHER
Authorization: Bearer <customer_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không (default: 1) | Số trang |
| `pageSize` | `int` | Không (default: 12, max: 50) | Số bản ghi mỗi trang |
| `category` | `string` | Không | Lọc theo danh mục: `VOUCHER` \| `GIFT` \| `SERVICE` \| `UPGRADE` |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "g7h8i9j0-k1l2-3456-ghij-567890123456",
      "name": "Voucher giảm 100.000 VND",
      "description": "Áp dụng cho đơn hàng từ 500.000 VND trở lên. Không áp dụng đồng thời với khuyến mãi khác.",
      "pointsCost": 400,
      "category": "VOUCHER",
      "available": true,
      "stock": 50,
      "imageUrl": "https://cdn.cellphones.com.vn/rewards/voucher-100k.jpg",
      "createdAt": "2024-01-01T00:00:00+07:00",
      "updatedAt": "2024-02-01T09:00:00+07:00"
    },
    {
      "id": "h8i9j0k1-l2m3-4567-hijk-678901234567",
      "name": "Ốp lưng silicon iPhone miễn phí",
      "description": "Nhận tại cửa hàng hoặc giao hàng miễn phí. Áp dụng cho iPhone 14 series trở lên.",
      "pointsCost": 800,
      "category": "GIFT",
      "available": true,
      "stock": 20,
      "imageUrl": "https://cdn.cellphones.com.vn/rewards/iphone-case.jpg",
      "createdAt": "2024-01-15T00:00:00+07:00",
      "updatedAt": "2024-01-15T00:00:00+07:00"
    },
    {
      "id": "i9j0k1l2-m3n4-5678-ijkl-789012345678",
      "name": "Nâng cấp bảo hành thêm 6 tháng",
      "description": "Gia hạn bảo hành thêm 6 tháng cho 1 sản phẩm bất kỳ đang trong thời hạn bảo hành.",
      "pointsCost": 1200,
      "category": "SERVICE",
      "available": true,
      "stock": -1,
      "imageUrl": "https://cdn.cellphones.com.vn/rewards/warranty-extend.jpg",
      "createdAt": "2024-01-01T00:00:00+07:00",
      "updatedAt": "2024-01-01T00:00:00+07:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 12,
    "totalItems": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Ghi chú nghiệp vụ:**
- `stock = -1` nghĩa là không giới hạn số lượng.
- Backend **không** trả về phần thưởng có `available = false` qua endpoint này. Phần thưởng ẩn chỉ ADMIN mới thấy.
- Frontend nên hiển thị badge "Gần hết" khi `stock > 0 && stock <= 5`.
- Frontend hiển thị badge "Không giới hạn" khi `stock = -1`.

---

## 1.5 POST /loyalty/rewards/:id/redeem

**Mô tả:** Đổi điểm lấy phần thưởng. Hệ thống tự động trừ điểm, giảm tồn kho, tạo giao dịch và gửi thông báo kèm mã thưởng.

**Phân quyền:** `CUSTOMER` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID của phần thưởng muốn đổi |

**Request:**
```
POST /api/v1/loyalty/rewards/g7h8i9j0-k1l2-3456-ghij-567890123456/redeem
Authorization: Bearer <customer_token>
Content-Type: application/json
```
*(Không có request body)*

**Luồng xử lý (Business Logic):**

```
1. Xác thực token → lấy customerId
2. Load LoyaltyReward theo :id → 404 nếu không tìm thấy
3. Kiểm tra reward.available == true → 422 LOYALTY_REWARD_UNAVAILABLE
4. Kiểm tra reward.stock != 0 (stock > 0 hoặc stock == -1) → 422 LOYALTY_REWARD_OUT_OF_STOCK
5. Load LoyaltyProgram của customer → load points hiện tại
6. Kiểm tra loyaltyProgram.points >= reward.pointsCost → 422 LOYALTY_INSUFFICIENT_POINTS
7. [Transaction DB]:
   a. loyaltyProgram.points -= reward.pointsCost
   b. Nếu reward.stock != -1: reward.stock -= 1
   c. Tạo LoyaltyTransaction { type=REDEEM, points=-pointsCost, balanceAfter=newPoints }
   d. Tạo RewardRedemption { rewardCode="RW-" + timestamp }
8. Gửi AppNotification tới customer với rewardCode
9. Trả về response 200
```

**Response 200 — Đổi thưởng thành công:**
```json
{
  "success": true,
  "data": {
    "rewardCode": "RW-1705312345",
    "reward": {
      "id": "g7h8i9j0-k1l2-3456-ghij-567890123456",
      "name": "Voucher giảm 100.000 VND",
      "description": "Áp dụng cho đơn hàng từ 500.000 VND trở lên.",
      "pointsCost": 400,
      "category": "VOUCHER",
      "available": true,
      "stock": 49,
      "imageUrl": "https://cdn.cellphones.com.vn/rewards/voucher-100k.jpg",
      "createdAt": "2024-01-01T00:00:00+07:00",
      "updatedAt": "2026-05-12T08:30:00+07:00"
    },
    "newPoints": 850,
    "transaction": {
      "id": "j0k1l2m3-n4o5-6789-jklm-890123456789",
      "type": "REDEEM",
      "points": -400,
      "balanceAfter": 850,
      "description": "Đổi thưởng: Voucher giảm 100.000 VND",
      "createdAt": "2026-05-12T08:30:00+07:00"
    }
  },
  "message": "Đổi thưởng thành công! Mã của bạn: RW-1705312345"
}
```

**Response 404 — Không tìm thấy phần thưởng:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_REWARD_NOT_FOUND",
  "message": "Không tìm thấy phần thưởng này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/loyalty/rewards/invalid-id/redeem"
}
```

**Response 422 — Điểm không đủ:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_INSUFFICIENT_POINTS",
  "message": "Điểm tích luỹ không đủ. Bạn cần 400 điểm nhưng chỉ có 250 điểm.",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/loyalty/rewards/g7h8i9j0-k1l2-3456-ghij-567890123456/redeem"
}
```

**Response 422 — Hết hàng:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_REWARD_OUT_OF_STOCK",
  "message": "Phần thưởng này đã hết. Vui lòng chọn phần thưởng khác.",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/loyalty/rewards/g7h8i9j0-k1l2-3456-ghij-567890123456/redeem"
}
```

**Mã lỗi có thể xảy ra:**

| Error Code | HTTP | Mô tả |
|------------|------|-------|
| `LOYALTY_REWARD_NOT_FOUND` | 404 | ID phần thưởng không tồn tại |
| `LOYALTY_REWARD_UNAVAILABLE` | 422 | Phần thưởng đã bị ẩn/ngừng đổi |
| `LOYALTY_REWARD_OUT_OF_STOCK` | 422 | Hết số lượng tồn kho |
| `LOYALTY_INSUFFICIENT_POINTS` | 422 | Điểm hiện tại không đủ |
| `LOYALTY_PROGRAM_NOT_FOUND` | 404 | Chương trình tích điểm chưa khởi tạo |

**Ghi chú nghiệp vụ:**
- Toàn bộ bước 7 trong luồng xử lý phải nằm trong một **database transaction**. Nếu bất kỳ bước nào thất bại thì rollback toàn bộ.
- Format mã thưởng: `RW-` + Unix timestamp (milliseconds) để đảm bảo unique.
- Sau khi đổi thành công, hệ thống tự động gửi `AppNotification` với `type=LOYALTY` và `title="Đổi thưởng thành công"`, kèm `message` có chứa `rewardCode`.

---

# PHẦN 2: ADMIN — LOYALTY MANAGEMENT

---

## 2.1 GET /admin/loyalty

**Mô tả:** Lấy danh sách tất cả chương trình tích điểm của toàn bộ khách hàng, có phân trang và bộ lọc.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/admin/loyalty?page=1&pageSize=20&tier=GOLD&search=nguyenvanan
Authorization: Bearer <admin_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không (default: 1) | Số trang |
| `pageSize` | `int` | Không (default: 20, max: 100) | Số bản ghi mỗi trang |
| `tier` | `enum` | Không | Lọc theo hạng: `BRONZE` \| `SILVER` \| `GOLD` \| `DIAMOND` |
| `search` | `string` | Không | Tìm theo tên khách hàng hoặc email (LIKE %search%) |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "customerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "customerName": "Nguyễn Văn An",
      "customerEmail": "nguyenvanan@email.com",
      "tier": "GOLD",
      "tierLabel": "Vàng",
      "points": 3200,
      "totalEarnedPoints": 6500,
      "totalSpend": 120000000,
      "joinedAt": "2022-06-01T00:00:00+07:00",
      "pointsExpiry": "2025-06-01",
      "nextTierThreshold": 20000,
      "nextTierName": "DIAMOND",
      "nextTierLabel": "Kim Cương",
      "pointsToNextTier": 13500,
      "tierBenefits": {
        "current": ["Tích 1,5 điểm / 100.000 VND", "Miễn phí vận chuyển", "Quà sinh nhật"],
        "next": ["Tích 2 điểm / 100.000 VND", "Ưu tiên hàng đầu CSKH", "Quà sinh nhật VIP"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 2.2 GET /admin/loyalty/:customerId

**Mô tả:** Lấy chi tiết chương trình tích điểm của một khách hàng cụ thể, kèm 10 giao dịch gần nhất.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `customerId` | `UUID` | ID khách hàng |

**Request:**
```
GET /api/v1/admin/loyalty/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer <admin_token>
```

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "customerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "customerName": "Nguyễn Văn An",
    "customerEmail": "nguyenvanan@email.com",
    "tier": "SILVER",
    "tierLabel": "Bạc",
    "points": 1250,
    "totalEarnedPoints": 2450,
    "totalSpend": 45000000,
    "joinedAt": "2023-01-15T08:00:00+07:00",
    "pointsExpiry": "2025-01-15",
    "nextTierThreshold": 5000,
    "nextTierName": "GOLD",
    "nextTierLabel": "Vàng",
    "pointsToNextTier": 2550,
    "tierBenefits": {
      "current": ["Tích 1 điểm / 100.000 VND", "Ưu tiên hỗ trợ khách hàng"],
      "next": ["Tích 1,5 điểm / 100.000 VND", "Miễn phí vận chuyển toàn bộ đơn hàng"]
    },
    "recentTransactions": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "type": "EARN",
        "points": 150,
        "balanceAfter": 1250,
        "description": "Tích điểm từ đơn hàng #DH-20240215-001",
        "orderId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "createdAt": "2024-02-15T14:30:00+07:00"
      }
    ]
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_PROGRAM_NOT_FOUND",
  "message": "Không tìm thấy chương trình tích điểm cho khách hàng này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/loyalty/f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

---

## 2.3 POST /admin/loyalty/bonus-points

**Mô tả:** Admin cấp điểm thưởng (bonus) cho một hoặc nhiều khách hàng cùng lúc. Mỗi khách hàng nhận được một giao dịch `BONUS` riêng và một thông báo.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
POST /api/v1/admin/loyalty/bonus-points
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerIds": [
    "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  ],
  "points": 100,
  "reason": "Nhân dịp sinh nhật công ty CELLPHONES tháng 5"
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `customerIds` | `UUID[]` | * | Danh sách ID khách hàng (tối đa 500 ID mỗi lần) |
| `points` | `int` | * | Số điểm thưởng (> 0) |
| `reason` | `string` | * | Lý do cấp thưởng (lưu vào description của transaction) |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "processed": 2,
    "failed": 0,
    "failedCustomerIds": []
  },
  "message": "Đã cấp 100 điểm thưởng cho 2 khách hàng thành công"
}
```

**Response 207 — Xử lý một phần (Multi-Status):**
```json
{
  "success": true,
  "data": {
    "processed": 1,
    "failed": 1,
    "failedCustomerIds": [
      {
        "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "reason": "Khách hàng không tồn tại hoặc chưa có chương trình tích điểm"
      }
    ]
  },
  "message": "Xử lý hoàn tất: 1 thành công, 1 thất bại"
}
```

**Ghi chú nghiệp vụ:**
- `points` phải là số nguyên dương.
- Nếu một `customerId` không tồn tại hoặc không có `LoyaltyProgram`, bỏ qua và ghi vào `failedCustomerIds`, **không** rollback toàn bộ.
- Điểm bonus **không** tính vào `totalEarnedPoints` (không ảnh hưởng hạng), chỉ cộng vào `points` hiện tại.
- Sau khi cấp điểm, tự động gửi `AppNotification` với `type=LOYALTY` tới từng khách hàng được cấp thành công.

---

## 2.4 GET /admin/loyalty/rewards

**Mô tả:** Lấy danh sách tất cả phần thưởng (bao gồm cả phần thưởng đã ẩn `available=false`). Dành cho Admin quản lý.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/admin/loyalty/rewards?page=1&pageSize=20
Authorization: Bearer <admin_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không (default: 1) | Số trang |
| `pageSize` | `int` | Không (default: 20, max: 100) | Số bản ghi mỗi trang |
| `category` | `string` | Không | Lọc theo danh mục |
| `available` | `boolean` | Không | Lọc theo trạng thái |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "g7h8i9j0-k1l2-3456-ghij-567890123456",
      "name": "Voucher giảm 100.000 VND",
      "description": "Áp dụng cho đơn hàng từ 500.000 VND trở lên.",
      "pointsCost": 400,
      "category": "VOUCHER",
      "available": true,
      "stock": 49,
      "imageUrl": "https://cdn.cellphones.com.vn/rewards/voucher-100k.jpg",
      "createdAt": "2024-01-01T00:00:00+07:00",
      "updatedAt": "2026-05-12T08:30:00+07:00"
    },
    {
      "id": "k1l2m3n4-o5p6-7890-klmn-012345678901",
      "name": "Voucher giảm 500.000 VND (Đã ngừng)",
      "description": "Chương trình đã kết thúc.",
      "pointsCost": 2000,
      "category": "VOUCHER",
      "available": false,
      "stock": 0,
      "imageUrl": null,
      "createdAt": "2023-01-01T00:00:00+07:00",
      "updatedAt": "2024-01-01T00:00:00+07:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 2.5 POST /admin/loyalty/rewards

**Mô tả:** Tạo mới một phần thưởng trong chương trình tích điểm.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
POST /api/v1/admin/loyalty/rewards
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Voucher giảm 200.000 VND",
  "description": "Áp dụng cho đơn hàng từ 1.000.000 VND. Không áp dụng đồng thời với khuyến mãi khác.",
  "pointsCost": 800,
  "category": "VOUCHER",
  "stock": 100,
  "available": true,
  "imageUrl": "https://cdn.cellphones.com.vn/rewards/voucher-200k.jpg"
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `name` | `string` | * | Tên phần thưởng (max 200 ký tự) |
| `description` | `string` | * | Mô tả chi tiết (max 1000 ký tự) |
| `pointsCost` | `int` | * | Số điểm cần đổi (> 0) |
| `category` | `string` | * | `VOUCHER` \| `GIFT` \| `SERVICE` \| `UPGRADE` |
| `stock` | `int` | * | Số lượng tồn kho (>= -1, dùng -1 cho không giới hạn) |
| `available` | `boolean` | Không (default: true) | Hiển thị cho khách hàng không |
| `imageUrl` | `string` | Không | URL ảnh phần thưởng |

**Response 201 — Tạo thành công:**
```json
{
  "success": true,
  "data": {
    "id": "l2m3n4o5-p6q7-8901-lmno-123456789012",
    "name": "Voucher giảm 200.000 VND",
    "description": "Áp dụng cho đơn hàng từ 1.000.000 VND. Không áp dụng đồng thời với khuyến mãi khác.",
    "pointsCost": 800,
    "category": "VOUCHER",
    "available": true,
    "stock": 100,
    "imageUrl": "https://cdn.cellphones.com.vn/rewards/voucher-200k.jpg",
    "createdAt": "2026-05-12T08:30:00+07:00",
    "updatedAt": "2026-05-12T08:30:00+07:00"
  },
  "message": "Tạo phần thưởng thành công"
}
```

---

## 2.6 PATCH /admin/loyalty/rewards/:id

**Mô tả:** Cập nhật thông tin một phần thưởng. Tất cả các trường đều là tuỳ chọn — chỉ trường nào được gửi mới được cập nhật (PATCH semantics).

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID phần thưởng cần cập nhật |

**Request:**
```
PATCH /api/v1/admin/loyalty/rewards/l2m3n4o5-p6q7-8901-lmno-123456789012
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (ví dụ: chỉ cập nhật stock và available):**
```json
{
  "stock": 200,
  "available": true
}
```

**Request Body (ví dụ: cập nhật nhiều trường):**
```json
{
  "name": "Voucher giảm 200.000 VND - Cập nhật",
  "description": "Mô tả mới sau chỉnh sửa",
  "pointsCost": 750,
  "stock": 50,
  "available": false
}
```

**Response 200 — Cập nhật thành công:**
```json
{
  "success": true,
  "data": {
    "id": "l2m3n4o5-p6q7-8901-lmno-123456789012",
    "name": "Voucher giảm 200.000 VND - Cập nhật",
    "description": "Mô tả mới sau chỉnh sửa",
    "pointsCost": 750,
    "category": "VOUCHER",
    "available": false,
    "stock": 50,
    "imageUrl": "https://cdn.cellphones.com.vn/rewards/voucher-200k.jpg",
    "createdAt": "2026-05-12T08:30:00+07:00",
    "updatedAt": "2026-05-12T09:00:00+07:00"
  },
  "message": "Cập nhật phần thưởng thành công"
}
```

**Response 404:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_REWARD_NOT_FOUND",
  "message": "Không tìm thấy phần thưởng này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/loyalty/rewards/invalid-id"
}
```

---

## 2.7 DELETE /admin/loyalty/rewards/:id

**Mô tả:** Xoá vĩnh viễn một phần thưởng. Nên ưu tiên dùng `PATCH` để set `available=false` thay vì xoá để giữ lịch sử đổi thưởng.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID phần thưởng cần xoá |

**Request:**
```
DELETE /api/v1/admin/loyalty/rewards/l2m3n4o5-p6q7-8901-lmno-123456789012
Authorization: Bearer <admin_token>
```

**Response 204 — Xoá thành công:**
```
HTTP/1.1 204 No Content
```
*(Không có response body)*

**Response 404:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_REWARD_NOT_FOUND",
  "message": "Không tìm thấy phần thưởng này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/loyalty/rewards/invalid-id"
}
```

**Response 409 — Phần thưởng đã được đổi:**
```json
{
  "success": false,
  "errorCode": "LOYALTY_REWARD_HAS_REDEMPTIONS",
  "message": "Không thể xoá phần thưởng đã có lịch sử đổi. Hãy dùng tính năng ẩn (available=false) thay thế.",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/loyalty/rewards/l2m3n4o5-p6q7-8901-lmno-123456789012"
}
```

**Ghi chú nghiệp vụ:**
- Backend kiểm tra nếu phần thưởng đã có bản ghi `LoyaltyTransaction` loại `REDEEM` tham chiếu đến nó thì trả về `409`. Không cho phép xoá để bảo toàn tính toàn vẹn dữ liệu lịch sử.

---

# PHẦN 3: NOTIFICATIONS (CUSTOMER)

---

## 3.1 GET /notifications

**Mô tả:** Lấy danh sách thông báo của người dùng hiện tại, có phân trang và bộ lọc. Response bao gồm `unreadCount` trong phần `meta`.

**Phân quyền:** Bearer token bắt buộc (mọi role).

**Request:**
```
GET /api/v1/notifications?page=1&pageSize=20&isRead=false&type=ORDER
Authorization: Bearer <token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không (default: 1) | Số trang |
| `pageSize` | `int` | Không (default: 20, max: 50) | Số bản ghi mỗi trang |
| `isRead` | `boolean` | Không | `true` = chỉ đã đọc, `false` = chỉ chưa đọc |
| `type` | `enum` | Không | Lọc theo loại: `ORDER` \| `PAYMENT` \| `PROMOTION` \| `LOYALTY` \| `SYSTEM` \| `REVIEW` |
| `category` | `string` | Không | Lọc theo category tuỳ chỉnh |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "m3n4o5p6-q7r8-9012-mnop-234567890123",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "ORDER",
      "title": "Đơn hàng đã được xác nhận",
      "message": "Đơn hàng #DH-20240215-001 của bạn đã được xác nhận và đang được chuẩn bị.",
      "isRead": false,
      "priority": "MEDIUM",
      "category": "order_update",
      "entityType": "ORDER",
      "entityId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "actionUrl": "/orders/c3d4e5f6-a7b8-9012-cdef-123456789012",
      "actionLabel": "Xem đơn hàng",
      "isActionable": true,
      "createdAt": "2024-02-15T14:30:00+07:00"
    },
    {
      "id": "n4o5p6q7-r8s9-0123-nopq-345678901234",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "LOYALTY",
      "title": "Đổi thưởng thành công",
      "message": "Bạn đã đổi thành công 400 điểm lấy Voucher giảm 100.000 VND. Mã của bạn: RW-1705312345",
      "isRead": true,
      "priority": "HIGH",
      "category": "loyalty",
      "entityType": null,
      "entityId": null,
      "actionUrl": "/loyalty/rewards",
      "actionLabel": "Xem phần thưởng",
      "isActionable": true,
      "createdAt": "2026-05-12T08:30:00+07:00"
    },
    {
      "id": "o5p6q7r8-s9t0-1234-opqr-456789012345",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "PROMOTION",
      "title": "Flash Sale 12/12 - Giảm đến 50%!",
      "message": "Hôm nay duy nhất! Giảm đến 50% tất cả điện thoại flagship. Số lượng có hạn!",
      "isRead": false,
      "priority": "HIGH",
      "category": "marketing",
      "entityType": null,
      "entityId": null,
      "actionUrl": "/products?isFeatured=true",
      "actionLabel": "Mua ngay",
      "isActionable": true,
      "createdAt": "2026-05-12T06:00:00+07:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  },
  "meta": {
    "unreadCount": 12
  }
}
```

**Ghi chú nghiệp vụ:**
- Kết quả sắp xếp theo `createdAt DESC` (mới nhất lên trước).
- `unreadCount` trong `meta` luôn trả về tổng số thông báo chưa đọc của user, **bất kể** filter `isRead` hiện tại.
- Frontend dùng `unreadCount` để hiển thị badge trên icon chuông.

---

## 3.2 GET /notifications/unread-count

**Mô tả:** Lấy số lượng thông báo chưa đọc của người dùng hiện tại. Endpoint nhẹ, thiết kế cho frontend polling định kỳ.

**Phân quyền:** Bearer token bắt buộc (mọi role).

**Request:**
```
GET /api/v1/notifications/unread-count
Authorization: Bearer <token>
```

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

**Ghi chú nghiệp vụ:**
- Frontend gọi endpoint này **mỗi 30 giây** để cập nhật badge thông báo.
- Endpoint được tối ưu — chỉ chạy query `SELECT COUNT(*) FROM notifications WHERE userId = ? AND isRead = false`, không load dữ liệu thông báo.
- Nên được cache ở application layer (TTL 15 giây) nếu lượng user đồng thời cao.

---

## 3.3 PATCH /notifications/:id/read

**Mô tả:** Đánh dấu một thông báo là đã đọc.

**Phân quyền:** Bearer token bắt buộc. User chỉ được đánh dấu thông báo của chính mình.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID thông báo |

**Request:**
```
PATCH /api/v1/notifications/m3n4o5p6-q7r8-9012-mnop-234567890123/read
Authorization: Bearer <token>
```
*(Không có request body)*

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "id": "m3n4o5p6-q7r8-9012-mnop-234567890123",
    "isRead": true,
    "readAt": "2026-05-12T08:35:00+07:00"
  },
  "message": "Đã đánh dấu thông báo là đã đọc"
}
```

**Response 404:**
```json
{
  "success": false,
  "errorCode": "NOTIFICATION_NOT_FOUND",
  "message": "Không tìm thấy thông báo này",
  "timestamp": "2026-05-12T08:35:00+07:00",
  "path": "/api/v1/notifications/invalid-id/read"
}
```

**Response 403:**
```json
{
  "success": false,
  "errorCode": "AUTH_FORBIDDEN",
  "message": "Bạn không có quyền thao tác trên thông báo này",
  "timestamp": "2026-05-12T08:35:00+07:00",
  "path": "/api/v1/notifications/m3n4o5p6-q7r8-9012-mnop-234567890123/read"
}
```

---

## 3.4 PATCH /notifications/read-all

**Mô tả:** Đánh dấu tất cả thông báo chưa đọc của người dùng hiện tại là đã đọc.

**Phân quyền:** Bearer token bắt buộc.

**Request:**
```
PATCH /api/v1/notifications/read-all
Authorization: Bearer <token>
```
*(Không có request body)*

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "updated": 12
  },
  "message": "Đã đánh dấu 12 thông báo là đã đọc"
}
```

**Ghi chú nghiệp vụ:**
- `updated` là số lượng thông báo đã được cập nhật từ `isRead=false` sang `isRead=true`.
- Nếu không có thông báo chưa đọc, trả về `updated: 0` — không phải lỗi.
- Query thực thi: `UPDATE notifications SET isRead=true WHERE userId=? AND isRead=false`.

---

## 3.5 DELETE /notifications/:id

**Mô tả:** Xoá vĩnh viễn một thông báo cụ thể.

**Phân quyền:** Bearer token bắt buộc. User chỉ được xoá thông báo của chính mình.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID thông báo cần xoá |

**Request:**
```
DELETE /api/v1/notifications/m3n4o5p6-q7r8-9012-mnop-234567890123
Authorization: Bearer <token>
```

**Response 204 — Xoá thành công:**
```
HTTP/1.1 204 No Content
```
*(Không có response body)*

**Response 404:**
```json
{
  "success": false,
  "errorCode": "NOTIFICATION_NOT_FOUND",
  "message": "Không tìm thấy thông báo này",
  "timestamp": "2026-05-12T08:35:00+07:00",
  "path": "/api/v1/notifications/invalid-id"
}
```

---

## 3.6 DELETE /notifications

**Mô tả:** Xoá toàn bộ thông báo đã đọc (`isRead=true`) của người dùng hiện tại. Thông báo chưa đọc không bị ảnh hưởng.

**Phân quyền:** Bearer token bắt buộc.

**Request:**
```
DELETE /api/v1/notifications
Authorization: Bearer <token>
```
*(Không có request body)*

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "deleted": 8
  },
  "message": "Đã xoá 8 thông báo đã đọc"
}
```

**Ghi chú nghiệp vụ:**
- Chỉ xoá thông báo có `isRead=true`. Thông báo chưa đọc được giữ nguyên.
- Nếu không có thông báo đã đọc, trả về `deleted: 0`.
- Query: `DELETE FROM notifications WHERE userId=? AND isRead=true`.

---

# PHẦN 4: NOTIFICATION PREFERENCES

---

## 4.1 GET /notifications/preferences

**Mô tả:** Lấy danh sách cấu hình nhận thông báo của người dùng hiện tại theo từng loại và kênh nhận.

**Phân quyền:** Bearer token bắt buộc.

**Request:**
```
GET /api/v1/notifications/preferences
Authorization: Bearer <token>
```

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "p6q7r8s9-t0u1-2345-pqrs-567890123456",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "ORDER",
      "label": "Cập nhật đơn hàng",
      "enabled": true,
      "channel": "inApp"
    },
    {
      "id": "q7r8s9t0-u1v2-3456-qrst-678901234567",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "ORDER",
      "label": "Cập nhật đơn hàng (Email)",
      "enabled": true,
      "channel": "email"
    },
    {
      "id": "r8s9t0u1-v2w3-4567-rstu-789012345678",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "PAYMENT",
      "label": "Thông báo thanh toán",
      "enabled": true,
      "channel": "inApp"
    },
    {
      "id": "s9t0u1v2-w3x4-5678-stuv-890123456789",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "PROMOTION",
      "label": "Khuyến mãi & Ưu đãi",
      "enabled": false,
      "channel": "email"
    },
    {
      "id": "t0u1v2w3-x4y5-6789-tuvw-901234567890",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "LOYALTY",
      "label": "Điểm thưởng & Hạng thành viên",
      "enabled": true,
      "channel": "inApp"
    },
    {
      "id": "u1v2w3x4-y5z6-7890-uvwx-012345678901",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "SYSTEM",
      "label": "Thông báo hệ thống",
      "enabled": true,
      "channel": "inApp"
    }
  ]
}
```

**Ghi chú nghiệp vụ:**
- Khi tài khoản mới tạo, hệ thống tự động khởi tạo đầy đủ các bản ghi preference với `enabled=true` theo cấu hình mặc định.
- Kênh `inApp` không thể tắt hoàn toàn cho các loại `ORDER`, `PAYMENT`, `SYSTEM` — đây là thông báo bắt buộc vì liên quan đến giao dịch tài chính.

---

## 4.2 PATCH /notifications/preferences

**Mô tả:** Cập nhật hàng loạt cấu hình nhận thông báo của người dùng hiện tại.

**Phân quyền:** Bearer token bắt buộc.

**Request:**
```
PATCH /api/v1/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "preferences": [
    {
      "type": "ORDER",
      "enabled": true,
      "channel": "inApp"
    },
    {
      "type": "PROMOTION",
      "enabled": false,
      "channel": "email"
    },
    {
      "type": "LOYALTY",
      "enabled": true,
      "channel": "inApp"
    }
  ]
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `preferences` | `array` | * | Mảng các preference cần cập nhật |
| `preferences[].type` | `enum` | * | Loại thông báo |
| `preferences[].enabled` | `boolean` | * | Bật hay tắt |
| `preferences[].channel` | `enum` | Không | `inApp` \| `email` \| `sms` \| `push` |

**Response 200 — Cập nhật thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "p6q7r8s9-t0u1-2345-pqrs-567890123456",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "ORDER",
      "label": "Cập nhật đơn hàng",
      "enabled": true,
      "channel": "inApp"
    },
    {
      "id": "s9t0u1v2-w3x4-5678-stuv-890123456789",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "PROMOTION",
      "label": "Khuyến mãi & Ưu đãi",
      "enabled": false,
      "channel": "email"
    },
    {
      "id": "t0u1v2w3-x4y5-6789-tuvw-901234567890",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "LOYALTY",
      "label": "Điểm thưởng & Hạng thành viên",
      "enabled": true,
      "channel": "inApp"
    }
  ],
  "message": "Cập nhật cài đặt thông báo thành công"
}
```

**Response 422 — Cố tắt thông báo bắt buộc:**
```json
{
  "success": false,
  "errorCode": "NOTIFICATION_PREFERENCE_REQUIRED",
  "message": "Không thể tắt thông báo ORDER qua kênh inApp vì đây là thông báo bắt buộc liên quan đến giao dịch.",
  "timestamp": "2026-05-12T08:35:00+07:00",
  "path": "/api/v1/notifications/preferences"
}
```

**Ghi chú nghiệp vụ:**
- Response trả về **chỉ** những preference được gửi lên, không phải toàn bộ danh sách.
- Nếu `type` không tồn tại trong database, tạo mới bản ghi preference cho user đó.
- Các loại thông báo bắt buộc không thể tắt qua `inApp`: `ORDER`, `PAYMENT`, `SYSTEM`.

---

# PHẦN 5: ADMIN — NOTIFICATIONS

---

## 5.1 POST /admin/notifications/broadcast

**Mô tả:** Admin gửi thông báo hàng loạt tới tất cả người dùng hoặc một nhóm role cụ thể.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
POST /api/v1/admin/notifications/broadcast
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetRole": "CUSTOMER",
  "type": "PROMOTION",
  "title": "Flash Sale 12/12 - Giảm đến 50%!",
  "message": "Hôm nay duy nhất! Giảm đến 50% tất cả điện thoại flagship. Nhanh tay kẻo lỡ!",
  "priority": "HIGH",
  "category": "marketing",
  "actionUrl": "/products?isFeatured=true",
  "actionLabel": "Mua ngay",
  "isActionable": true
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `targetRole` | `enum` | * | `CUSTOMER` \| `ADMIN` \| `ALL` |
| `type` | `enum` | * | `ORDER` \| `PAYMENT` \| `PROMOTION` \| `LOYALTY` \| `SYSTEM` \| `REVIEW` |
| `title` | `string` | * | Tiêu đề thông báo (max 200 ký tự) |
| `message` | `string` | * | Nội dung thông báo (max 1000 ký tự) |
| `priority` | `enum` | Không (default: MEDIUM) | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `category` | `string` | Không | Phân loại tuỳ chỉnh cho UI |
| `actionUrl` | `string` | Không | URL khi nhấn thông báo |
| `actionLabel` | `string` | Không | Nhãn nút hành động |
| `isActionable` | `boolean` | Không (default: false) | Có hiển thị nút hành động không |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": {
    "sent": 1250,
    "failed": 0,
    "targetRole": "CUSTOMER",
    "broadcastId": "v2w3x4y5-z6a7-8901-vwxy-123456789012"
  },
  "message": "Đã gửi thông báo thành công tới 1250 khách hàng"
}
```

**Ghi chú nghiệp vụ:**
- Broadcast là thao tác **bất đồng bộ (async)**. Hệ thống tạo job trong queue và trả về `broadcastId` ngay lập tức. `sent` là số ước tính dựa trên query count trước khi thực thi.
- Với hệ thống có nhiều user (>1000), nên dùng batch insert (mỗi batch 500 bản ghi) để tránh timeout.
- Thông báo chỉ được gửi tới user có `status=ACTIVE`.
- Preferences người dùng được tôn trọng: nếu user tắt nhận `PROMOTION`, thông báo loại PROMOTION sẽ không tạo cho họ.

---

## 5.2 POST /admin/notifications/send-to-user

**Mô tả:** Admin gửi thông báo tới một người dùng cụ thể.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
POST /api/v1/admin/notifications/send-to-user
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "type": "SYSTEM",
  "title": "Tài khoản đã được mở khoá",
  "message": "Tài khoản của bạn đã được quản trị viên mở khoá. Bạn có thể đăng nhập bình thường.",
  "priority": "HIGH",
  "category": "account",
  "actionUrl": "/login",
  "actionLabel": "Đăng nhập ngay",
  "isActionable": true
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `userId` | `UUID` | * | ID người dùng nhận thông báo |
| `type` | `enum` | * | Loại thông báo |
| `title` | `string` | * | Tiêu đề (max 200 ký tự) |
| `message` | `string` | * | Nội dung (max 1000 ký tự) |
| `priority` | `enum` | Không (default: MEDIUM) | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `category` | `string` | Không | Phân loại UI |
| `actionUrl` | `string` | Không | URL hành động |
| `actionLabel` | `string` | Không | Nhãn nút |
| `isActionable` | `boolean` | Không (default: false) | Hiển thị nút hành động |

**Response 201 — Gửi thành công:**
```json
{
  "success": true,
  "data": {
    "id": "w3x4y5z6-a7b8-9012-wxyz-234567890123",
    "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "type": "SYSTEM",
    "title": "Tài khoản đã được mở khoá",
    "message": "Tài khoản của bạn đã được quản trị viên mở khoá. Bạn có thể đăng nhập bình thường.",
    "isRead": false,
    "priority": "HIGH",
    "category": "account",
    "entityType": null,
    "entityId": null,
    "actionUrl": "/login",
    "actionLabel": "Đăng nhập ngay",
    "isActionable": true,
    "createdAt": "2026-05-12T08:30:00+07:00"
  },
  "message": "Đã gửi thông báo tới người dùng thành công"
}
```

**Response 404 — User không tồn tại:**
```json
{
  "success": false,
  "errorCode": "USER_NOT_FOUND",
  "message": "Không tìm thấy người dùng với ID này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/notifications/send-to-user"
}
```

---

# PHẦN 6: ADMIN — INTERNAL SUPPLIERS & INSTALLMENT PLANS

---

## 6.1 GET /admin/suppliers

**Mô tả:** Lấy danh sách tất cả nhà cung cấp nội bộ, có phân trang và tìm kiếm.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/admin/suppliers?page=1&pageSize=20&search=Samsung&isActive=true
Authorization: Bearer <admin_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | `int` | Không (default: 1) | Số trang |
| `pageSize` | `int` | Không (default: 20, max: 100) | Số bản ghi mỗi trang |
| `search` | `string` | Không | Tìm theo tên nhà cung cấp hoặc tên liên hệ |
| `isActive` | `boolean` | Không | Lọc theo trạng thái hợp tác |

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "x4y5z6a7-b8c9-0123-xyza-345678901234",
      "name": "Samsung Vina Electronics",
      "contactPerson": "Trần Thị Bích",
      "phone": "028-3822-9999",
      "email": "supply@samsung.com.vn",
      "address": "Tầng 10, tòa nhà Bitexco, 2 Hải Triều, Q.1, TP.HCM",
      "categories": ["Điện thoại Samsung", "Tablet Samsung", "Phụ kiện chính hãng"],
      "paymentTerms": "NET 30 — Thanh toán trong 30 ngày kể từ ngày xuất hoá đơn",
      "isActive": true,
      "createdAt": "2022-01-01T00:00:00+07:00",
      "updatedAt": "2024-03-15T09:00:00+07:00"
    },
    {
      "id": "y5z6a7b8-c9d0-1234-yzab-456789012345",
      "name": "Apple Premium Reseller VN",
      "contactPerson": "Nguyễn Minh Châu",
      "phone": "028-3925-8888",
      "email": "b2b@apple-vn.com",
      "address": "25 Lê Duẩn, Q.1, TP.HCM",
      "categories": ["iPhone", "iPad", "MacBook", "Apple Watch", "AirPods"],
      "paymentTerms": "NET 14 — Thanh toán trong 14 ngày, chiết khấu 2% nếu thanh toán trong 7 ngày",
      "isActive": true,
      "createdAt": "2021-06-01T00:00:00+07:00",
      "updatedAt": "2025-01-10T10:00:00+07:00"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 6.2 POST /admin/suppliers

**Mô tả:** Tạo mới nhà cung cấp nội bộ.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
POST /api/v1/admin/suppliers
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Xiaomi Vietnam Technology",
  "contactPerson": "Lê Hoàng Nam",
  "phone": "028-3833-7777",
  "email": "supply@xiaomi-vn.com",
  "address": "Tầng 5, Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội",
  "categories": ["Điện thoại Xiaomi", "Redmi", "POCO", "Phụ kiện Xiaomi"],
  "paymentTerms": "NET 30 — Thanh toán trong 30 ngày kể từ ngày xuất hoá đơn",
  "isActive": true
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `name` | `string` | * | Tên nhà cung cấp (max 200 ký tự, unique) |
| `contactPerson` | `string` | * | Họ tên người đại diện liên hệ |
| `phone` | `string` | * | Số điện thoại liên hệ |
| `email` | `string` | * | Email liên hệ (unique) |
| `address` | `string` | * | Địa chỉ đầy đủ |
| `categories` | `string[]` | * | Mảng danh mục sản phẩm cung cấp (min 1 phần tử) |
| `paymentTerms` | `string` | * | Điều khoản thanh toán (max 500 ký tự) |
| `isActive` | `boolean` | Không (default: true) | Trạng thái hợp tác |

**Response 201 — Tạo thành công:**
```json
{
  "success": true,
  "data": {
    "id": "z6a7b8c9-d0e1-2345-zabc-567890123456",
    "name": "Xiaomi Vietnam Technology",
    "contactPerson": "Lê Hoàng Nam",
    "phone": "028-3833-7777",
    "email": "supply@xiaomi-vn.com",
    "address": "Tầng 5, Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội",
    "categories": ["Điện thoại Xiaomi", "Redmi", "POCO", "Phụ kiện Xiaomi"],
    "paymentTerms": "NET 30 — Thanh toán trong 30 ngày kể từ ngày xuất hoá đơn",
    "isActive": true,
    "createdAt": "2026-05-12T08:30:00+07:00",
    "updatedAt": "2026-05-12T08:30:00+07:00"
  },
  "message": "Tạo nhà cung cấp thành công"
}
```

**Response 409 — Tên hoặc email đã tồn tại:**
```json
{
  "success": false,
  "errorCode": "SUPPLIER_DUPLICATE",
  "message": "Nhà cung cấp với email này đã tồn tại trong hệ thống",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/suppliers"
}
```

---

## 6.3 PATCH /admin/suppliers/:id

**Mô tả:** Cập nhật thông tin nhà cung cấp. Tất cả trường đều tuỳ chọn (PATCH semantics).

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID nhà cung cấp cần cập nhật |

**Request:**
```
PATCH /api/v1/admin/suppliers/z6a7b8c9-d0e1-2345-zabc-567890123456
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (ví dụ: tạm ngừng hợp tác và cập nhật liên hệ):**
```json
{
  "contactPerson": "Phạm Thị Lan",
  "phone": "028-3833-6666",
  "isActive": false
}
```

**Response 200 — Cập nhật thành công:**
```json
{
  "success": true,
  "data": {
    "id": "z6a7b8c9-d0e1-2345-zabc-567890123456",
    "name": "Xiaomi Vietnam Technology",
    "contactPerson": "Phạm Thị Lan",
    "phone": "028-3833-6666",
    "email": "supply@xiaomi-vn.com",
    "address": "Tầng 5, Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội",
    "categories": ["Điện thoại Xiaomi", "Redmi", "POCO", "Phụ kiện Xiaomi"],
    "paymentTerms": "NET 30 — Thanh toán trong 30 ngày kể từ ngày xuất hoá đơn",
    "isActive": false,
    "createdAt": "2026-05-12T08:30:00+07:00",
    "updatedAt": "2026-05-12T09:15:00+07:00"
  },
  "message": "Cập nhật nhà cung cấp thành công"
}
```

**Response 404:**
```json
{
  "success": false,
  "errorCode": "SUPPLIER_NOT_FOUND",
  "message": "Không tìm thấy nhà cung cấp này",
  "timestamp": "2026-05-12T09:15:00+07:00",
  "path": "/api/v1/admin/suppliers/invalid-id"
}
```

---

## 6.4 GET /admin/installment-plans

**Mô tả:** Lấy danh sách tất cả các gói trả góp (bao gồm cả gói đã ngừng áp dụng).

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
GET /api/v1/admin/installment-plans
Authorization: Bearer <admin_token>
```

**Response 200 — Thành công:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a7b8c9d0-e1f2-3456-abcd-678901234567",
      "bankName": "Ngân hàng Techcombank",
      "logoUrl": "https://cdn.cellphones.com.vn/banks/techcombank.png",
      "months": 6,
      "interestRate": 0.00,
      "minAmount": 3000000,
      "maxAmount": 50000000,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00+07:00"
    },
    {
      "id": "b8c9d0e1-f2a3-4567-bcde-789012345678",
      "bankName": "Ngân hàng Techcombank",
      "logoUrl": "https://cdn.cellphones.com.vn/banks/techcombank.png",
      "months": 12,
      "interestRate": 0.00,
      "minAmount": 5000000,
      "maxAmount": 50000000,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00+07:00"
    },
    {
      "id": "c9d0e1f2-a3b4-5678-cdef-890123456789",
      "bankName": "HD Saison",
      "logoUrl": "https://cdn.cellphones.com.vn/banks/hdsaison.png",
      "months": 24,
      "interestRate": 1.08,
      "minAmount": 2000000,
      "maxAmount": null,
      "isActive": true,
      "createdAt": "2023-06-01T00:00:00+07:00"
    },
    {
      "id": "d0e1f2a3-b4c5-6789-defa-901234567890",
      "bankName": "Ngân hàng Sacombank (Đã ngừng)",
      "logoUrl": null,
      "months": 6,
      "interestRate": 0.50,
      "minAmount": 3000000,
      "maxAmount": 30000000,
      "isActive": false,
      "createdAt": "2022-01-01T00:00:00+07:00"
    }
  ]
}
```

---

## 6.5 POST /admin/installment-plans

**Mô tả:** Tạo mới một gói trả góp.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Request:**
```
POST /api/v1/admin/installment-plans
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bankName": "VPBank",
  "logoUrl": "https://cdn.cellphones.com.vn/banks/vpbank.png",
  "months": 12,
  "interestRate": 0.00,
  "minAmount": 5000000,
  "maxAmount": 100000000,
  "isActive": true
}
```

**Mô tả các trường request:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `bankName` | `string` | * | Tên ngân hàng / tổ chức tài chính (max 200 ký tự) |
| `logoUrl` | `string` | Không | URL logo ngân hàng |
| `months` | `int` | * | Số tháng trả góp (vd: 3, 6, 12, 18, 24) |
| `interestRate` | `decimal` | * | Lãi suất %/tháng (0.00 = 0%, nghĩa là 0% lãi suất) |
| `minAmount` | `long` | * | Giá trị đơn hàng tối thiểu áp dụng (VND, > 0) |
| `maxAmount` | `long` | Không | Giá trị đơn hàng tối đa (VND, null = không giới hạn) |
| `isActive` | `boolean` | Không (default: true) | Đang áp dụng không |

**Response 201 — Tạo thành công:**
```json
{
  "success": true,
  "data": {
    "id": "e1f2a3b4-c5d6-7890-efab-012345678901",
    "bankName": "VPBank",
    "logoUrl": "https://cdn.cellphones.com.vn/banks/vpbank.png",
    "months": 12,
    "interestRate": 0.00,
    "minAmount": 5000000,
    "maxAmount": 100000000,
    "isActive": true,
    "createdAt": "2026-05-12T08:30:00+07:00"
  },
  "message": "Tạo gói trả góp thành công"
}
```

---

## 6.6 PATCH /admin/installment-plans/:id

**Mô tả:** Cập nhật thông tin gói trả góp. Tất cả trường đều tuỳ chọn (PATCH semantics).

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID gói trả góp cần cập nhật |

**Request:**
```
PATCH /api/v1/admin/installment-plans/e1f2a3b4-c5d6-7890-efab-012345678901
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (ví dụ: ngừng áp dụng gói):**
```json
{
  "isActive": false
}
```

**Request Body (ví dụ: cập nhật nhiều trường):**
```json
{
  "minAmount": 6000000,
  "maxAmount": 150000000,
  "interestRate": 0.50,
  "isActive": true
}
```

**Response 200 — Cập nhật thành công:**
```json
{
  "success": true,
  "data": {
    "id": "e1f2a3b4-c5d6-7890-efab-012345678901",
    "bankName": "VPBank",
    "logoUrl": "https://cdn.cellphones.com.vn/banks/vpbank.png",
    "months": 12,
    "interestRate": 0.50,
    "minAmount": 6000000,
    "maxAmount": 150000000,
    "isActive": true,
    "createdAt": "2026-05-12T08:30:00+07:00"
  },
  "message": "Cập nhật gói trả góp thành công"
}
```

**Response 404:**
```json
{
  "success": false,
  "errorCode": "INSTALLMENT_PLAN_NOT_FOUND",
  "message": "Không tìm thấy gói trả góp này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/installment-plans/invalid-id"
}
```

---

## 6.7 DELETE /admin/installment-plans/:id

**Mô tả:** Xoá vĩnh viễn một gói trả góp. Khuyến nghị dùng `PATCH isActive=false` thay thế để giữ lịch sử đơn hàng đã dùng gói này.

**Phân quyền:** `ADMIN` — Bearer token bắt buộc.

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | `UUID` | ID gói trả góp cần xoá |

**Request:**
```
DELETE /api/v1/admin/installment-plans/e1f2a3b4-c5d6-7890-efab-012345678901
Authorization: Bearer <admin_token>
```

**Response 204 — Xoá thành công:**
```
HTTP/1.1 204 No Content
```
*(Không có response body)*

**Response 404:**
```json
{
  "success": false,
  "errorCode": "INSTALLMENT_PLAN_NOT_FOUND",
  "message": "Không tìm thấy gói trả góp này",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/installment-plans/invalid-id"
}
```

**Response 409 — Đã có đơn hàng dùng gói này:**
```json
{
  "success": false,
  "errorCode": "INSTALLMENT_PLAN_IN_USE",
  "message": "Không thể xoá gói trả góp đã có đơn hàng sử dụng. Hãy dùng tính năng ngừng áp dụng (isActive=false) thay thế.",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/admin/installment-plans/e1f2a3b4-c5d6-7890-efab-012345678901"
}
```

---

# TỔNG KẾT — DANH SÁCH ENDPOINTS

## Loyalty Program (Customer)

| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| `GET` | `/loyalty/me` | Xem thông tin tích điểm cá nhân | CUSTOMER |
| `GET` | `/loyalty/me/transactions` | Lịch sử giao dịch điểm | CUSTOMER |
| `GET` | `/loyalty/me/stats` | Thống kê điểm tích luỹ | CUSTOMER |
| `GET` | `/loyalty/rewards` | Danh sách phần thưởng có thể đổi | CUSTOMER |
| `POST` | `/loyalty/rewards/:id/redeem` | Đổi điểm lấy phần thưởng | CUSTOMER |

## Admin — Loyalty Management

| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| `GET` | `/admin/loyalty` | Danh sách chương trình tích điểm | ADMIN |
| `GET` | `/admin/loyalty/:customerId` | Chi tiết tích điểm một khách hàng | ADMIN |
| `POST` | `/admin/loyalty/bonus-points` | Cấp điểm thưởng hàng loạt | ADMIN |
| `GET` | `/admin/loyalty/rewards` | Danh sách toàn bộ phần thưởng | ADMIN |
| `POST` | `/admin/loyalty/rewards` | Tạo phần thưởng mới | ADMIN |
| `PATCH` | `/admin/loyalty/rewards/:id` | Cập nhật phần thưởng | ADMIN |
| `DELETE` | `/admin/loyalty/rewards/:id` | Xoá phần thưởng | ADMIN |

## Notifications (Customer)

| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| `GET` | `/notifications` | Danh sách thông báo + unreadCount | Bearer |
| `GET` | `/notifications/unread-count` | Số thông báo chưa đọc (polling) | Bearer |
| `PATCH` | `/notifications/:id/read` | Đánh dấu đã đọc 1 thông báo | Bearer |
| `PATCH` | `/notifications/read-all` | Đánh dấu tất cả đã đọc | Bearer |
| `DELETE` | `/notifications/:id` | Xoá 1 thông báo | Bearer |
| `DELETE` | `/notifications` | Xoá tất cả thông báo đã đọc | Bearer |

## Notification Preferences

| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| `GET` | `/notifications/preferences` | Xem cài đặt nhận thông báo | Bearer |
| `PATCH` | `/notifications/preferences` | Cập nhật cài đặt nhận thông báo | Bearer |

## Admin — Notifications

| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| `POST` | `/admin/notifications/broadcast` | Gửi thông báo hàng loạt | ADMIN |
| `POST` | `/admin/notifications/send-to-user` | Gửi thông báo cho 1 user | ADMIN |

## Admin — Suppliers & Installment Plans

| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| `GET` | `/admin/suppliers` | Danh sách nhà cung cấp | ADMIN |
| `POST` | `/admin/suppliers` | Tạo nhà cung cấp mới | ADMIN |
| `PATCH` | `/admin/suppliers/:id` | Cập nhật nhà cung cấp | ADMIN |
| `GET` | `/admin/installment-plans` | Danh sách gói trả góp | ADMIN |
| `POST` | `/admin/installment-plans` | Tạo gói trả góp mới | ADMIN |
| `PATCH` | `/admin/installment-plans/:id` | Cập nhật gói trả góp | ADMIN |
| `DELETE` | `/admin/installment-plans/:id` | Xoá gói trả góp | ADMIN |

---

## Mã Lỗi Module Này (Error Codes)

| Error Code | HTTP | Mô tả |
|------------|------|-------|
| `LOYALTY_PROGRAM_NOT_FOUND` | 404 | Chương trình tích điểm không tồn tại |
| `LOYALTY_REWARD_NOT_FOUND` | 404 | Phần thưởng không tồn tại |
| `LOYALTY_REWARD_UNAVAILABLE` | 422 | Phần thưởng đã bị ẩn/ngừng đổi |
| `LOYALTY_REWARD_OUT_OF_STOCK` | 422 | Phần thưởng hết số lượng |
| `LOYALTY_INSUFFICIENT_POINTS` | 422 | Không đủ điểm để đổi thưởng |
| `LOYALTY_REWARD_HAS_REDEMPTIONS` | 409 | Không thể xoá phần thưởng đã có lịch sử đổi |
| `NOTIFICATION_NOT_FOUND` | 404 | Thông báo không tồn tại |
| `NOTIFICATION_PREFERENCE_REQUIRED` | 422 | Loại thông báo bắt buộc không thể tắt |
| `SUPPLIER_NOT_FOUND` | 404 | Nhà cung cấp không tồn tại |
| `SUPPLIER_DUPLICATE` | 409 | Nhà cung cấp trùng tên hoặc email |
| `INSTALLMENT_PLAN_NOT_FOUND` | 404 | Gói trả góp không tồn tại |
| `INSTALLMENT_PLAN_IN_USE` | 409 | Không thể xoá gói đã có đơn hàng sử dụng |

---

*Tài liệu này là một phần của bộ tài liệu BA cho CELLPHONES eCommerce Platform. Tham chiếu các module liên quan tại:*
- *`01-domain-entities.md` — Entity models chi tiết*
- *`02-database-design.md` — Database schema*
- *`03-api-auth-users.md` — Authentication & Users API*
- *`12-error-codes.md` — Toàn bộ error codes*
