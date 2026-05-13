# 01 - Domain Entities (Mô hình dữ liệu)

> Tài liệu này mô tả tất cả entities trong hệ thống CELLPHONES.  
> Ký hiệu: `*` = bắt buộc (NOT NULL), `?` = tuỳ chọn (nullable)

---

## 1. Pagination & Response Wrappers

### PaginationRequest
```
page        int    * default=1   Số trang (bắt đầu từ 1)
pageSize    int    * default=20  Số bản ghi/trang (max 100)
sortBy      string ? default="createdAt"
sortDir     string ? default="desc"  (asc | desc)
```

### PaginatedResponse\<T\>
```
data        T[]    * Danh sách bản ghi
page        int    * Trang hiện tại
pageSize    int    * Số bản ghi/trang
total       int    * Tổng số bản ghi
totalPages  int    * Tổng số trang
```

---

## 2. USER & AUTH

### User
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | Primary key |
| fullName | string | * | Họ và tên đầy đủ |
| email | string | * | Email (unique) |
| passwordHash | string | * | Bcrypt hash của mật khẩu |
| phone | string | * | Số điện thoại |
| role | enum | * | `CUSTOMER` \| `ADMIN` \| `STAFF` |
| status | enum | * | `ACTIVE` \| `LOCKED` \| `PENDING_VERIFY` |
| avatarUrl | string | ? | URL ảnh đại diện |
| address | string | ? | Địa chỉ thường trú |
| dateOfBirth | date | ? | Ngày sinh (YYYY-MM-DD) |
| gender | enum | ? | `MALE` \| `FEMALE` \| `OTHER` |
| loyaltyPoints | int | ? | Số điểm tích luỹ hiện tại (default=0) |
| totalOrders | int | ? | Tổng số đơn đã đặt (denorm) |
| totalSpent | long | ? | Tổng tiền đã chi (VND, denorm) |
| lastLoginAt | datetime | ? | Thời điểm đăng nhập cuối |
| emailVerified | boolean | * | Đã xác minh email (default=false) |
| phoneVerified | boolean | * | Đã xác minh phone (default=false) |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

**Enums:**
- `UserRole`: CUSTOMER, ADMIN, STAFF
- `UserStatus`: ACTIVE, LOCKED, PENDING_VERIFY

**Constraints:**
- `email` UNIQUE
- `phone` format: 10-11 chữ số Việt Nam

---

### ShippingAddress
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| userId | UUID | * | FK → users.id |
| label | string | * | Nhãn địa chỉ (vd: "Nhà", "Văn phòng") |
| fullName | string | * | Tên người nhận |
| phone | string | * | SĐT người nhận |
| address | string | * | Số nhà, tên đường |
| ward | string | * | Phường/Xã |
| district | string | * | Quận/Huyện |
| city | string | * | Tỉnh/Thành phố |
| country | string | * | Quốc gia (default: "Việt Nam") |
| postalCode | string | ? | Mã bưu chính |
| type | enum | ? | `HOME` \| `OFFICE` \| `OTHER` |
| isDefault | boolean | * | Địa chỉ mặc định (default=false) |
| notes | string | ? | Ghi chú giao hàng |
| createdAt | datetime | * | |

---

## 3. PRODUCT CATALOG

### Category
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên danh mục |
| slug | string | * | URL slug (unique) |
| description | string | * | Mô tả |
| icon | string | * | Icon class / URL |
| imageUrl | string | ? | Ảnh danh mục |
| parentId | UUID | ? | FK → categories.id (null nếu là root) |
| level | int | * | Cấp độ trong cây (0=root) |
| path | string | ? | Full path (vd: "Điện thoại/Apple") |
| isActive | boolean | * | Đang hoạt động (default=true) |
| sortOrder | int | ? | Thứ tự hiển thị |
| productCount | int | * | Số sản phẩm (denorm, default=0) |
| metaTitle | string | ? | SEO title |
| metaDescription | string | ? | SEO description |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

**Constraints:**
- `slug` UNIQUE
- `parentId` NULL nếu là danh mục gốc

---

### Product
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên sản phẩm |
| slug | string | * | URL slug (unique) |
| description | text | * | Mô tả chi tiết (HTML) |
| shortDescription | string | * | Mô tả ngắn |
| categoryId | UUID | * | FK → categories.id |
| categoryName | string | * | Tên danh mục (denorm) |
| brand | string | * | Thương hiệu (Apple, Samsung, ...) |
| price | long | * | Giá bán hiện tại (VND) |
| originalPrice | long | ? | Giá gốc trước khuyến mãi (VND) |
| discountPercent | int | ? | % giảm giá (0-100) |
| status | enum | * | `ACTIVE` \| `OUT_OF_STOCK` \| `DISCONTINUED` \| `COMING_SOON` |
| condition | enum | * | `NEW` \| `LIKE_NEW` \| `USED` |
| rating | decimal(3,2) | * | Điểm đánh giá trung bình (0.00-5.00, default=0) |
| reviewCount | int | * | Số lượt đánh giá (default=0) |
| soldCount | int | ? | Số đã bán (default=0) |
| viewCount | int | ? | Số lượt xem (default=0) |
| warranty | int | * | Thời gian bảo hành (tháng) |
| tags | string[] | * | Mảng tags (stored as JSON array) |
| specifications | jsonb | * | Thông số kỹ thuật dạng key-value |
| color | string | ? | Màu chính |
| isNew | boolean | * | Sản phẩm mới (default=false) |
| isFeatured | boolean | * | Sản phẩm nổi bật (default=false) |
| isHot | boolean | * | Sản phẩm hot (default=false) |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

**Enums:**
- `ProductStatus`: ACTIVE, OUT_OF_STOCK, DISCONTINUED, COMING_SOON
- `ProductCondition`: NEW, LIKE_NEW, USED

---

### ProductVariant
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| productId | UUID | * | FK → products.id |
| name | string | * | Tên variant (vd: "8GB/128GB Đen") |
| sku | string | * | Mã SKU (unique) |
| price | long | * | Giá bán (VND) |
| originalPrice | long | ? | Giá gốc (VND) |
| stock | int | * | Tồn kho (default=0) |
| color | string | ? | Màu sắc |
| storage | string | ? | Dung lượng lưu trữ |
| ram | string | ? | RAM |
| isActive | boolean | * | (default=true) |
| createdAt | datetime | * | |

**Constraints:**
- `sku` UNIQUE

---

### ProductImage
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| productId | UUID | * | FK → products.id |
| url | string | * | URL ảnh |
| altText | string | ? | Alt text (SEO) |
| sortOrder | int | * | Thứ tự hiển thị (default=0) |
| isPrimary | boolean | * | Ảnh đại diện (default=false) |
| createdAt | datetime | * | |

**Constraints:**
- Mỗi product chỉ có 1 ảnh với isPrimary=true

---

### PhoneSpecs (1-1 với Product, chỉ dùng cho điện thoại)
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| productId | UUID | * | FK → products.id (unique) |
| chip | string | * | Tên chip (vd: "Apple A18 Pro") |
| ram | string | * | RAM (vd: "8GB") |
| storage | string | * | Bộ nhớ (vd: "256GB") |
| battery | string | * | Pin (vd: "4685mAh") |
| camera | string | * | Camera sau |
| frontCamera | string | * | Camera trước |
| screen | string | * | Màn hình |
| os | string | * | Hệ điều hành |
| connectivity | string | * | Kết nối (5G, WiFi, NFC...) |
| weight | string | ? | Khối lượng |
| dimensions | string | ? | Kích thước |
| waterResistance | string | ? | Chống nước (vd: "IP68") |
| simType | string | ? | Loại SIM |
| chargingSpeed | string | ? | Tốc độ sạc |
| gpu | string | ? | GPU |

---

### ProductCombo
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên combo |
| description | string | * | Mô tả |
| image | string | ? | Ảnh combo |
| comboPrice | long | * | Giá combo (VND) |
| totalOriginalPrice | long | * | Tổng giá gốc (VND) |
| savings | long | * | Tiết kiệm (VND) |
| savingsPercent | int | * | % tiết kiệm |
| isActive | boolean | * | (default=true) |
| startDate | date | ? | Ngày bắt đầu |
| endDate | date | ? | Ngày kết thúc |
| createdAt | datetime | * | |

### ComboItem (bảng junction)
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| comboId | UUID | * | FK → product_combos.id |
| productId | UUID | * | FK → products.id |
| productName | string | * | (denorm) |
| productImage | string | * | (denorm) |
| originalPrice | long | * | Giá lẻ (VND) |
| comboPrice | long | * | Giá trong combo (VND) |
| quantity | int | * | Số lượng |

---

## 4. CART

### CartItem
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| userId | UUID | * | FK → users.id |
| productId | UUID | * | FK → products.id |
| variantId | UUID | ? | FK → product_variants.id |
| productName | string | * | (denorm) |
| productImage | string | * | (denorm) |
| brand | string | * | (denorm) |
| variantName | string | ? | (denorm) |
| color | string | ? | Màu đã chọn |
| storage | string | ? | Bộ nhớ đã chọn |
| quantity | int | * | Số lượng (min=1) |
| unitPrice | long | * | Giá/đơn vị tại thời điểm thêm (VND) |
| totalPrice | long | * | = quantity × unitPrice |
| note | string | ? | Ghi chú |
| addedAt | datetime | * | |

**Business rules:**
- Khi cùng userId + productId + variantId đã tồn tại → cộng dồn quantity
- totalPrice tự tính = quantity × unitPrice

---

## 5. ORDER

### Order
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| orderNumber | string | * | Mã đơn hiển thị (vd: CP20240115001), UNIQUE |
| customerId | UUID | * | FK → users.id |
| customerName | string | * | (denorm) |
| customerEmail | string | * | (denorm) |
| customerPhone | string | * | (denorm) |
| subtotal | long | * | Tổng tiền hàng (VND) |
| shippingFee | long | * | Phí vận chuyển (VND, default=0) |
| discount | long | * | Số tiền giảm giá (VND, default=0) |
| totalAmount | long | * | = subtotal + shippingFee - discount |
| status | enum | * | `PENDING` \| `CONFIRMED` \| `SHIPPING` \| `DELIVERED` \| `CANCELLED` \| `RETURNED` |
| shippingAddress | string | * | Địa chỉ giao hàng (formatted string) |
| shippingAddressId | UUID | ? | FK → shipping_addresses.id |
| paymentMethod | enum | * | `CASH` \| `BANK_TRANSFER` \| `CREDIT_CARD` \| `E_WALLET` \| `COD` |
| paymentStatus | enum | * | `UNPAID` \| `PAID` \| `REFUNDED` |
| promotionCode | string | ? | Mã khuyến mãi đã áp dụng |
| promotionId | UUID | ? | FK → promotions.id |
| discountAmount | long | ? | Số tiền giảm từ promo (VND) |
| notes | string | ? | Ghi chú đơn hàng |
| expectedDeliveryDate | date | ? | Ngày giao dự kiến |
| actualDeliveryDate | date | ? | Ngày giao thực tế |
| cancelReason | string | ? | Lý do huỷ |
| cancelledAt | datetime | ? | Thời điểm huỷ |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

**Enums:**
- `OrderStatus`: PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED, RETURNED
- `PaymentMethod`: CASH, BANK_TRANSFER, CREDIT_CARD, E_WALLET, COD
- `PaymentStatus`: UNPAID, PAID, REFUNDED

---

### OrderItem
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| orderId | UUID | * | FK → orders.id |
| productId | UUID | * | FK → products.id |
| variantId | UUID | ? | FK → product_variants.id |
| productName | string | * | (denorm, giá trị tại thời điểm đặt) |
| productImage | string | * | (denorm) |
| brand | string | * | (denorm) |
| variantName | string | ? | (denorm) |
| sku | string | ? | (denorm) |
| color | string | ? | (denorm) |
| quantity | int | * | Số lượng (min=1) |
| unitPrice | long | * | Giá/đơn vị TẠI THỜI ĐIỂM ĐẶT (VND) |
| originalPrice | long | ? | Giá gốc TẠI THỜI ĐIỂM ĐẶT (VND) |
| discount | long | ? | Giảm giá cấp item (VND, default=0) |
| totalPrice | long | * | = quantity × unitPrice - discount |
| note | string | ? | Ghi chú cho item |

**Lưu ý quan trọng:** `unitPrice` lưu giá TẠI THỜI ĐIỂM ĐẶT HÀNG, không thay đổi theo biến động giá sau này.

---

### OrderStatusHistory
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| orderId | UUID | * | FK → orders.id |
| fromStatus | enum | ? | Trạng thái trước (null nếu là trạng thái đầu) |
| toStatus | enum | * | Trạng thái mới |
| changedBy | UUID | * | FK → users.id |
| changedByName | string | * | (denorm) |
| note | string | ? | Lý do / ghi chú |
| createdAt | datetime | * | |

---

## 6. PAYMENT & INVOICE

### Payment
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| orderId | UUID | * | FK → orders.id |
| orderNumber | string | * | (denorm) |
| customerId | UUID | * | FK → users.id |
| amount | long | * | Tổng tiền cần thanh toán (VND) |
| paidAmount | long | * | Đã thanh toán (VND, default=0) |
| remainingAmount | long | * | = amount - paidAmount |
| dueDate | date | * | Hạn thanh toán |
| status | enum | * | `UNPAID` \| `PAID` \| `OVERDUE` \| `REFUNDED` |
| method | string | * | Phương thức thanh toán |
| transactionRef | string | ? | Mã tham chiếu giao dịch |
| paidAt | datetime | ? | Thời điểm thanh toán |
| createdAt | datetime | * | |

**Enums:** `PaymentStatus`: UNPAID, PAID, OVERDUE, REFUNDED

---

### Invoice
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| invoiceNumber | string | * | Mã hoá đơn (UNIQUE, vd: INV-20240115-001) |
| orderId | UUID | * | FK → orders.id |
| orderNumber | string | * | (denorm) |
| customerId | UUID | * | FK → users.id |
| customerName | string | * | (denorm) |
| totalAmount | long | * | Tổng tiền (VND) |
| taxAmount | long | ? | Thuế VAT (VND) |
| status | enum | * | `PENDING` \| `PAID` \| `OVERDUE` \| `CANCELLED` |
| issueDate | date | * | Ngày phát hành |
| dueDate | date | * | Hạn thanh toán |
| paidAt | datetime | ? | Ngày thanh toán |
| createdAt | datetime | * | |

---

### Shipment
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| orderId | UUID | * | FK → orders.id |
| orderNumber | string | * | (denorm) |
| trackingNumber | string | * | Mã vận đơn |
| carrierName | string | * | Tên đơn vị vận chuyển |
| status | enum | * | `AWAITING_PICKUP` \| `IN_TRANSIT` \| `DELIVERED` \| `FAILED` |
| estimatedDelivery | date | * | Ngày giao dự kiến |
| actualDelivery | date | ? | Ngày giao thực tế |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

---

## 7. PROMOTION

### Promotion
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| code | string | * | Mã khuyến mãi (UNIQUE, uppercase) |
| name | string | * | Tên chương trình KM |
| description | string | * | Mô tả |
| type | enum | * | `PERCENT` \| `FIXED_AMOUNT` \| `BUY_X_GET_Y` \| `FREE_SHIPPING` |
| value | decimal | * | Giá trị giảm (% hoặc VND) |
| minOrderValue | long | * | Đơn tối thiểu (VND, default=0) |
| maxDiscount | long | * | Giảm tối đa (VND) |
| startDate | datetime | * | Thời điểm bắt đầu |
| endDate | datetime | * | Thời điểm kết thúc |
| usageLimit | int | * | Giới hạn lượt dùng (0=unlimited) |
| usedCount | int | * | Số lần đã dùng (default=0) |
| applicableProducts | UUID[] | * | Danh sách product IDs (rỗng=tất cả) |
| applicableCategories | UUID[] | * | Danh sách category IDs (rỗng=tất cả) |
| applicableBrands | string[] | * | Danh sách brands (rỗng=tất cả) |
| isActive | boolean | * | (default=true) |
| createdAt | datetime | * | |

**Enums:** `DiscountType`: PERCENT, FIXED_AMOUNT, BUY_X_GET_Y, FREE_SHIPPING

---

## 8. REVIEW

### Review
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| productId | UUID | * | FK → products.id |
| userId | UUID | * | FK → users.id |
| orderId | UUID | ? | FK → orders.id (nếu mua xác nhận) |
| userName | string | * | (denorm) |
| productName | string | ? | (denorm) |
| rating | int | * | 1-5 sao |
| title | string | ? | Tiêu đề đánh giá |
| comment | string | * | Nội dung đánh giá |
| status | enum | * | `PENDING` \| `VISIBLE` \| `HIDDEN` |
| isVerifiedPurchase | boolean | * | Đã mua và nhận hàng (default=false) |
| helpfulCount | int | * | Số lượt "hữu ích" (default=0) |
| images | string[] | * | Mảng URL ảnh (JSON) |
| tags | string[] | * | Mảng tags (JSON) |
| sellerReply | string | ? | Phản hồi từ admin/seller |
| sellerReplyAt | datetime | ? | |
| createdAt | datetime | * | |

**Enums:** `ReviewStatus`: PENDING, VISIBLE, HIDDEN

---

## 9. WISHLIST

### WishlistItem
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| userId | UUID | * | FK → users.id |
| productId | UUID | * | FK → products.id |
| productName | string | * | (denorm) |
| productImage | string | * | (denorm) |
| brand | string | * | (denorm) |
| categoryName | string | * | (denorm) |
| price | long | * | Giá tại thời điểm thêm (VND) |
| originalPrice | long | ? | (denorm) |
| stock | int | * | Tồn kho tại thời điểm thêm |
| priceAlert | long | ? | Ngưỡng giá để cảnh báo (VND) |
| addedAt | datetime | * | |

**Constraints:** UNIQUE (userId, productId)

---

## 10. WARRANTY

### WarrantyItem
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| customerId | UUID | * | FK → users.id |
| customerName | string | * | (denorm) |
| orderId | UUID | * | FK → orders.id |
| orderNumber | string | * | (denorm) |
| productId | UUID | * | FK → products.id |
| productName | string | * | (denorm) |
| productImage | string | * | (denorm) |
| brand | string | * | (denorm) |
| imei | string | ? | Số IMEI (unique per device) |
| serialNumber | string | ? | Số serial |
| purchaseDate | date | * | Ngày mua |
| warrantyExpiry | date | * | Ngày hết bảo hành |
| warrantyMonths | int | * | Thời gian bảo hành (tháng) |
| status | enum | * | `VALID` \| `EXPIRED` \| `PROCESSING` \| `REJECTED` |
| notes | string | ? | Ghi chú |
| createdAt | datetime | * | |

**Enums:** `WarrantyStatus`: VALID, EXPIRED, PROCESSING, REJECTED

---

### WarrantyClaim
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| warrantyId | UUID | * | FK → warranty_items.id |
| customerId | UUID | * | FK → users.id |
| customerName | string | * | (denorm) |
| productId | UUID | * | FK → products.id |
| productName | string | * | (denorm) |
| claimType | enum | * | `REPAIR` \| `REPLACEMENT` \| `REFUND` |
| description | string | * | Mô tả lỗi / vấn đề |
| status | enum | * | `NEW` \| `PROCESSING` \| `RESOLVED` \| `REJECTED` |
| resolution | string | ? | Kết quả xử lý |
| resolvedAt | datetime | ? | |
| createdAt | datetime | * | |

---

## 11. RETURN

### ReturnRequest
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| orderId | UUID | * | FK → orders.id |
| orderNumber | string | * | (denorm) |
| customerId | UUID | * | FK → users.id |
| customerName | string | * | (denorm) |
| reason | enum | * | `DEFECTIVE` \| `NOT_AS_DESCRIBED` \| `WRONG_ITEM` \| `DAMAGED_IN_TRANSIT` \| `CHANGED_MIND` \| `OTHER` |
| status | enum | * | `PENDING` \| `APPROVED` \| `REJECTED` \| `PROCESSING` \| `REFUNDED` \| `CLOSED` |
| refundAmount | long | * | Số tiền hoàn (VND) |
| refundMethod | string | ? | Phương thức hoàn tiền |
| images | string[] | * | Ảnh minh chứng (JSON array) |
| adminNote | string | ? | Ghi chú của admin |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

### ReturnItem (bảng junction)
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| returnId | UUID | * | FK → return_requests.id |
| productId | UUID | * | FK → products.id |
| productName | string | * | (denorm) |
| productImage | string | * | (denorm) |
| quantity | int | * | Số lượng trả |
| unitPrice | long | * | Giá/đơn vị (VND) |
| reason | enum | * | Lý do trả item này |
| note | string | * | Ghi chú chi tiết |

---

## 12. TRADE-IN

### TradeInRequest
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| customerId | UUID | * | FK → users.id |
| customerName | string | * | (denorm) |
| customerPhone | string | * | (denorm) |
| brand | string | * | Hãng thiết bị cũ |
| model | string | * | Model thiết bị cũ |
| storage | string | * | Dung lượng |
| condition | enum | * | `GOOD` \| `FAIR` \| `AVERAGE` \| `POOR` |
| estimatedValue | long | * | Giá ước tính (VND) |
| finalValue | long | ? | Giá định giá chính thức (VND) |
| status | enum | * | `AWAITING_VALUATION` \| `VALUED` \| `ACCEPTED` \| `REJECTED` \| `COMPLETED` |
| images | string[] | ? | Ảnh thiết bị cũ (JSON) |
| note | string | ? | Ghi chú |
| targetProductId | UUID | ? | FK → products.id (sản phẩm muốn đổi sang) |
| targetProductName | string | ? | (denorm) |
| createdAt | datetime | * | |
| updatedAt | datetime | * | |

---

## 13. LOYALTY

### LoyaltyProgram
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| customerId | UUID | * | FK → users.id (UNIQUE) |
| customerName | string | * | (denorm) |
| tier | enum | * | `BRONZE` \| `SILVER` \| `GOLD` \| `DIAMOND` |
| points | int | * | Điểm hiện có (default=0) |
| totalSpend | long | * | Tổng chi tiêu tích luỹ (VND, default=0) |
| joinedAt | datetime | * | |
| pointsExpiry | date | ? | Ngày hết hạn điểm |
| nextTierThreshold | int | ? | Điểm cần để lên tier tiếp theo |

### LoyaltyTransaction
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| programId | UUID | * | FK → loyalty_programs.id |
| type | enum | * | `EARN` \| `REDEEM` \| `EXPIRE` \| `BONUS` |
| points | int | * | Số điểm (dương=tích, âm=tiêu) |
| description | string | * | Mô tả giao dịch |
| orderId | UUID | ? | FK → orders.id |
| createdAt | datetime | * | |

### LoyaltyReward
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên phần thưởng |
| description | string | * | Mô tả |
| pointsCost | int | * | Số điểm cần đổi |
| category | string | * | Loại quà (Voucher, Discount, Shipping, ...) |
| available | boolean | * | Đang có sẵn (default=true) |
| stock | int | * | Số lượng còn lại |
| createdAt | datetime | * | |

---

## 14. NOTIFICATION

### AppNotification
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| userId | UUID | * | FK → users.id |
| type | enum | * | `ORDER` \| `PRODUCT` \| `SYSTEM` \| `PROMOTION` \| `WARRANTY` \| `PRICE_DROP` \| `REVIEW` |
| title | string | * | Tiêu đề |
| message | string | * | Nội dung |
| isRead | boolean | * | Đã đọc (default=false) |
| priority | enum | * | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| category | enum | * | `TRANSACTION` \| `SYSTEM` \| `INTERACTION` \| `ALERT` |
| entityType | string | ? | Loại entity liên quan (vd: "ORDER") |
| entityId | UUID | ? | ID entity liên quan |
| actionUrl | string | ? | URL hành động |
| actionLabel | string | ? | Nhãn nút hành động |
| isActionable | boolean | * | Có hành động (default=false) |
| createdAt | datetime | * | |

---

## 15. ADMIN & OPERATIONS

### StaffMember
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| fullName | string | * | |
| email | string | * | UNIQUE |
| phone | string | * | |
| position | enum | * | `STORE_MANAGER` \| `CONSULTANT` \| `WAREHOUSE` \| `TECHNICIAN` \| `CASHIER` |
| branchId | UUID | * | FK → branches.id |
| branchName | string | * | (denorm) |
| isActive | boolean | * | (default=true) |
| joinedAt | date | * | |

### InternalSupplier
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên nhà cung cấp |
| contactPerson | string | * | Người liên hệ |
| phone | string | * | |
| email | string | * | |
| address | string | * | |
| categories | string[] | * | Danh mục cung cấp (JSON) |
| paymentTerms | string | * | Điều khoản thanh toán |
| isActive | boolean | * | (default=true) |
| createdAt | datetime | * | |

### Branch (Cửa hàng)
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên cửa hàng |
| address | string | * | Địa chỉ |
| district | string | * | Quận |
| city | string | * | Thành phố |
| phone | string | * | |
| workingHours | string | * | Giờ làm việc |
| lat | decimal | ? | Vĩ độ |
| lng | decimal | ? | Kinh độ |
| isActive | boolean | * | (default=true) |

### InventoryItem
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| productId | UUID | * | FK → products.id |
| variantId | UUID | ? | FK → product_variants.id |
| productName | string | * | (denorm) |
| brand | string | * | (denorm) |
| sku | string | * | (denorm) |
| currentStock | int | * | Tồn kho hiện tại |
| minStock | int | * | Ngưỡng cảnh báo tồn thấp |
| costPrice | long | * | Giá nhập (VND) |
| sellingPrice | long | * | Giá bán (VND) |
| status | enum | * | `IN_STOCK` \| `LOW_STOCK` \| `OUT_OF_STOCK` |
| lastUpdated | datetime | * | |

### ActivityLog
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| userId | UUID | * | FK → users.id |
| userName | string | * | (denorm) |
| userRole | string | * | (denorm) |
| action | enum | * | `CREATE` \| `UPDATE` \| `DELETE` \| `APPROVE` \| `REJECT` \| `LOGIN` \| `LOGOUT` \| `EXPORT` \| `IMPORT` \| `CHANGE_PASSWORD` \| `UPDATE_PERMISSION` |
| entity | string | * | Tên entity (vd: "Product") |
| entityId | string | * | ID của entity |
| entityName | string | * | Tên entity (denorm) |
| details | text | * | Chi tiết hành động |
| ipAddress | string | * | IP |
| userAgent | string | * | Browser/Device |
| createdAt | datetime | * | |

---

## 16. CONTENT & CONFIG

### BlogPost
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| title | string | * | Tiêu đề |
| slug | string | * | URL slug (UNIQUE) |
| excerpt | string | * | Tóm tắt |
| content | text | * | Nội dung (HTML/Markdown) |
| coverImage | string | * | Ảnh bìa |
| category | string | * | Danh mục bài viết |
| tags | string[] | * | Tags (JSON) |
| authorId | UUID | * | FK → users.id |
| authorName | string | * | (denorm) |
| isPublished | boolean | * | (default=false) |
| publishedAt | datetime | ? | |
| viewCount | int | * | (default=0) |
| createdAt | datetime | * | |

### InstallmentPlan
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| bankName | string | * | Tên ngân hàng |
| logoUrl | string | ? | Logo |
| months | int[] | * | Kỳ hạn (vd: [3,6,12]) (JSON) |
| interestRate | decimal | * | Lãi suất (%/năm) |
| minAmount | long | * | Số tiền tối thiểu (VND) |
| maxAmount | long | ? | Số tiền tối đa (VND) |
| isActive | boolean | * | (default=true) |

### SystemConfig
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| key | string | * | Khoá cấu hình (PRIMARY KEY) |
| value | text | * | Giá trị |
| description | string | ? | Mô tả |
| updatedAt | datetime | * | |

*Các key tiêu chuẩn:*
- `site_name`, `site_description`, `hotline`, `address`
- `currency`, `tax_rate`, `maintenance_mode`
- `return_window_days`, `loyalty_points_per_100k`
- `email_notifications_enabled`, `default_page_size`

### BannerConfig
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| title | string | * | Tiêu đề banner |
| message | string | * | Nội dung |
| type | enum | * | `INFO` \| `WARNING` \| `SUCCESS` \| `ERROR` |
| link | string | * | Đường dẫn hành động |
| isActive | boolean | * | (default=true) |
| startDate | date | * | |
| endDate | date | * | |

### EmailTemplate
| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| id | UUID | * | |
| name | string | * | Tên template |
| subject | string | * | Tiêu đề email |
| body | text | * | Nội dung HTML |
| variables | string[] | * | Biến (vd: ["{{customerName}}","{{orderNumber}}"]) |
| isActive | boolean | * | (default=true) |
| createdAt | datetime | * | |

---

## 17. IMEI CHECK

### IMEICheckResult (không lưu DB, chỉ response)
| Field | Type | Mô tả |
|-------|------|-------|
| imei | string | Số IMEI |
| brand | string | Hãng |
| model | string | Model |
| isLocked | boolean | Đã khóa mạng |
| lockType | string? | Carrier khóa |
| warrantyStatus | string | Trạng thái bảo hành |
| warrantyExpiry | date? | Ngày hết bảo hành |
| purchaseCountry | string? | Quốc gia mua |
| isBlacklisted | boolean | Trong danh sách đen |
| activationStatus | string | Trạng thái kích hoạt |
| checkedAt | datetime | Thời điểm kiểm tra |

---

## 18. Tổng hợp quan hệ (ERD Summary)

```
users ──┬── shipping_addresses (1:N)
        ├── orders (1:N, customerId)
        ├── cart_items (1:N)
        ├── wishlist_items (1:N)
        ├── reviews (1:N)
        ├── warranty_items (1:N)
        ├── loyalty_programs (1:1)
        ├── app_notifications (1:N)
        └── activity_logs (1:N)

categories ── products (1:N)
           └── categories (self-ref, parentId)

products ──┬── product_variants (1:N)
           ├── product_images (1:N)
           ├── phone_specs (1:1)
           ├── order_items (1:N)
           ├── cart_items (1:N)
           ├── wishlist_items (1:N)
           └── reviews (1:N)

orders ──┬── order_items (1:N)
         ├── order_status_history (1:N)
         ├── payments (1:1)
         ├── invoices (1:1)
         ├── shipments (1:1)
         └── return_requests (1:N)

warranty_items ── warranty_claims (1:N)

loyalty_programs ── loyalty_transactions (1:N)
```
