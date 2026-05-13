# Tài liệu Business Rules - CELLPHONES eCommerce Platform

**Phiên bản:** 1.0  
**Ngày tạo:** 2026-05-12  
**Dành cho:** Java Backend Developer  
**Nền tảng:** CELLPHONES B2B/B2C eCommerce Platform

---

## Mục lục

1. [State Machines (Sơ đồ trạng thái)](#1-state-machines)
2. [Business Rules (Quy tắc nghiệp vụ)](#2-business-rules)
3. [Validation Rules (Quy tắc kiểm tra dữ liệu)](#3-validation-rules)
4. [Auto-generated Fields (Trường tự động sinh)](#4-auto-generated-fields)
5. [Side Effects Table (Sự kiện & Tác động)](#5-side-effects-table)

---

## 1. State Machines

State machine (máy trạng thái) mô tả các trạng thái hợp lệ của một entity và các chuyển đổi (transition) được phép giữa chúng. Developer cần implement các kiểm tra trạng thái này trong tầng Service trước khi thực hiện bất kỳ thay đổi nào.

---

### 1.1 Order Status Machine (Trạng thái đơn hàng)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `PENDING` | Chờ xác nhận | Đơn hàng vừa được tạo, chờ nhân viên xác nhận |
| `CONFIRMED` | Đã xác nhận | Nhân viên đã xác nhận, chuẩn bị giao hàng |
| `SHIPPING` | Đang giao hàng | Đơn hàng đang trên đường giao đến khách |
| `DELIVERED` | Đã giao | Khách hàng đã nhận được hàng thành công |
| `CANCELLED` | Đã huỷ | Đơn hàng bị huỷ (bởi khách hoặc hệ thống) |
| `RETURNED` | Hoàn trả | Khách hàng đã gửi yêu cầu trả hàng thành công |

#### Sơ đồ chuyển đổi trạng thái

```
PENDING ──────────► CONFIRMED ──────────► SHIPPING ──────────► DELIVERED
   │                    │                                           │
   │                    │                                           │
   ▼                    ▼                                           ▼
CANCELLED            CANCELLED                                   RETURNED
```

#### Ma trận chuyển đổi hợp lệ (Transition Matrix)

| Từ trạng thái \ Sang trạng thái | PENDING | CONFIRMED | SHIPPING | DELIVERED | CANCELLED | RETURNED |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **PENDING** | - | ✅ | ❌ | ❌ | ✅ | ❌ |
| **CONFIRMED** | ❌ | - | ✅ | ❌ | ✅ | ❌ |
| **SHIPPING** | ❌ | ❌ | - | ✅ | ❌ | ❌ |
| **DELIVERED** | ❌ | ❌ | ❌ | - | ❌ | ✅ |
| **CANCELLED** | ❌ | ❌ | ❌ | ❌ | - | ❌ |
| **RETURNED** | ❌ | ❌ | ❌ | ❌ | ❌ | - |

#### Chi tiết từng chuyển đổi

**PENDING → CONFIRMED**
- Ai trigger: Nhân viên bán hàng (ROLE: STAFF, ADMIN)
- Điều kiện:
  - Tất cả sản phẩm trong đơn còn tồn kho đủ số lượng
  - Thông tin địa chỉ giao hàng hợp lệ
  - Thông tin thanh toán hợp lệ (hoặc hình thức COD)
- Side effects:
  - Reserve stock (giảm `available_quantity` trong `inventory_items`)
  - Gửi thông báo cho khách hàng: "Đơn hàng đã được xác nhận"
  - Ghi `activity_log`

**PENDING → CANCELLED**
- Ai trigger: Khách hàng, Nhân viên, Hệ thống (sau timeout)
- Điều kiện:
  - Đơn hàng đang ở trạng thái PENDING
- Side effects:
  - Không cần release stock (chưa reserve)
  - Gửi thông báo huỷ đơn
  - Ghi `activity_log` với lý do huỷ

**CONFIRMED → SHIPPING**
- Ai trigger: Nhân viên kho, ADMIN
- Điều kiện:
  - Đã tạo shipment record
  - Đã có mã vận đơn (tracking number) từ đơn vị vận chuyển
- Side effects:
  - Tạo invoice (nếu chưa tồn tại)
  - Cập nhật shipment status → `IN_TRANSIT`
  - Gửi thông báo cho khách kèm tracking number

**CONFIRMED → CANCELLED**
- Ai trigger: Nhân viên, ADMIN
- Điều kiện:
  - Đơn hàng chưa được giao cho đơn vị vận chuyển
- Side effects:
  - Release reserved stock (tăng lại `available_quantity`)
  - Nếu đã thanh toán → trigger refund flow
  - Gửi thông báo huỷ đơn
  - Ghi `activity_log`

**SHIPPING → DELIVERED**
- Ai trigger: Hệ thống (webhook từ đơn vị vận chuyển), Nhân viên
- Điều kiện:
  - Đơn vị vận chuyển xác nhận đã giao thành công
- Side effects:
  - Set `actualDeliveryDate = NOW()`
  - Cộng loyalty points cho khách hàng
  - Tạo `loyalty_transaction` type = `EARN`
  - Mở cửa sổ trả hàng 7 ngày
  - Cho phép khách submit review
  - Cập nhật payment status → `PAID` (nếu COD)
  - Gửi thông báo: "Đơn hàng đã được giao thành công"

**DELIVERED → RETURNED**
- Ai trigger: Khách hàng tạo return request, sau đó hệ thống tự cập nhật khi return được APPROVED
- Điều kiện:
  - Trong vòng 7 ngày kể từ `actualDeliveryDate` (configurable: `system_config['return_window_days']`)
  - Sản phẩm chưa được trả trước đó
- Side effects:
  - Cập nhật trạng thái return request
  - Gửi thông báo xử lý trả hàng

---

### 1.2 Payment Status Machine (Trạng thái thanh toán)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `UNPAID` | Chưa thanh toán | Chờ khách thanh toán |
| `PAID` | Đã thanh toán | Thanh toán thành công |
| `OVERDUE` | Quá hạn | Quá thời gian thanh toán (dueDate) |
| `REFUNDED` | Đã hoàn tiền | Tiền đã được hoàn lại cho khách |

#### Sơ đồ chuyển đổi

```
UNPAID ──────────► PAID ──────────► REFUNDED
  │
  │
  ▼
OVERDUE
```

#### Chi tiết chuyển đổi

**UNPAID → PAID**
- Trigger: Callback từ payment gateway (VNPay, Momo, ZaloPay...) hoặc xác nhận COD khi giao hàng
- Điều kiện: `paymentAmount == order.totalAmount`
- Side effects:
  - Set `paidAt = NOW()`
  - Cập nhật `invoice.status → PAID`

**UNPAID → OVERDUE**
- Trigger: Scheduled job chạy hàng ngày kiểm tra `dueDate < NOW()`
- Điều kiện: `dueDate < NOW()` AND payment vẫn ở `UNPAID`
- Side effects:
  - Gửi thông báo nhắc nhở khách
  - Có thể tự động huỷ đơn sau N ngày (configurable)

**PAID → REFUNDED**
- Trigger: Return request được APPROVED và xử lý xong
- Điều kiện: Order phải ở trạng thái `RETURNED` hoặc `CANCELLED`
- Side effects:
  - Set `refundedAt = NOW()`
  - Cập nhật `invoice.status → CANCELLED` (nếu hoàn toàn)
  - Ghi `loyalty_transaction` type = `REDEEM` để trừ điểm nếu có

---

### 1.3 Return Request Status Machine (Trạng thái yêu cầu trả hàng)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `PENDING` | Chờ duyệt | Khách vừa gửi yêu cầu, chờ nhân viên xem xét |
| `APPROVED` | Đã duyệt | Nhân viên chấp thuận yêu cầu trả hàng |
| `PROCESSING` | Đang xử lý | Đang nhận hàng về và kiểm tra |
| `REFUNDED` | Đã hoàn tiền | Hoàn tiền thành công cho khách |
| `REJECTED` | Từ chối | Yêu cầu bị từ chối (không đủ điều kiện) |
| `CLOSED` | Đã đóng | Yêu cầu đã hoàn tất (hoặc đóng thủ công) |

#### Sơ đồ chuyển đổi

```
PENDING ──────────► APPROVED ──────────► PROCESSING ──────────► REFUNDED
   │                                                                  │
   │                                                                  ▼
   ▼                                                               CLOSED
REJECTED
```

#### Chi tiết chuyển đổi

**PENDING → APPROVED**
- Trigger: Nhân viên CS (Customer Service) / ADMIN
- Điều kiện:
  - Còn trong thời hạn trả hàng (`return_window_days`)
  - Sản phẩm đáp ứng điều kiện trả (nguyên hộp, đầy đủ phụ kiện...)
  - Lý do trả hợp lệ
- Side effects:
  - Gửi thông báo cho khách: "Yêu cầu trả hàng đã được chấp thuận"
  - Hướng dẫn khách gửi hàng về

**PENDING → REJECTED**
- Trigger: Nhân viên CS / ADMIN
- Điều kiện: Không đáp ứng điều kiện trả hàng
- Side effects:
  - Ghi lý do từ chối
  - Gửi thông báo cho khách với lý do cụ thể

**APPROVED → PROCESSING**
- Trigger: Hệ thống (khi nhận được hàng trả về) / Nhân viên kho
- Side effects: Bắt đầu quy trình kiểm tra hàng trả

**PROCESSING → REFUNDED**
- Trigger: Nhân viên kho sau khi kiểm tra hàng đạt yêu cầu
- Side effects:
  - Trigger refund qua payment gateway
  - Restore stock cho sản phẩm trả lại
  - Trừ loyalty points đã được cộng từ đơn hàng gốc
  - Set `payment.status → REFUNDED`
  - Gửi thông báo hoàn tiền cho khách

**REFUNDED → CLOSED**
- Trigger: Tự động sau khi refund xác nhận, hoặc nhân viên đóng thủ công

---

### 1.4 Warranty Claim Status Machine (Trạng thái yêu cầu bảo hành)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `NEW` | Mới | Yêu cầu bảo hành vừa được tạo |
| `PROCESSING` | Đang xử lý | Đang kiểm tra và sửa chữa |
| `RESOLVED` | Đã giải quyết | Bảo hành thành công, trả máy cho khách |
| `REJECTED` | Từ chối | Không đáp ứng điều kiện bảo hành |

#### Sơ đồ chuyển đổi

```
NEW ──────────► PROCESSING ──────────► RESOLVED
                                 │
                                 ▼
                              REJECTED
```

#### Chi tiết chuyển đổi

**NEW → PROCESSING**
- Trigger: Nhân viên kỹ thuật nhận máy
- Điều kiện:
  - `warranty.status == VALID` (chưa hết hạn)
  - `TODAY <= warrantyExpiry`
- Side effects:
  - Ghi ngày nhận máy
  - Gửi thông báo cho khách: "Máy của bạn đang được kiểm tra"

**PROCESSING → RESOLVED**
- Trigger: Nhân viên kỹ thuật sau khi sửa chữa xong
- Side effects:
  - Ghi ngày giải quyết (`resolvedDate = NOW()`)
  - Ghi mô tả kết quả sửa chữa
  - Gửi thông báo cho khách đến nhận máy

**PROCESSING → REJECTED**
- Trigger: Nhân viên kỹ thuật / ADMIN
- Điều kiện: Hư hỏng do lỗi người dùng, không thuộc diện bảo hành
- Side effects:
  - Ghi lý do từ chối cụ thể
  - Gửi thông báo cho khách với lý do

---

### 1.5 Trade-in Status Machine (Trạng thái định giá thu cũ)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `AWAITING_VALUATION` | Chờ định giá | Yêu cầu thu cũ đã gửi, chờ nhân viên định giá |
| `VALUED` | Đã định giá | Hệ thống/nhân viên đã đưa ra giá thu |
| `ACCEPTED` | Chấp nhận | Khách đồng ý với giá đề xuất |
| `REJECTED` | Từ chối | Khách không đồng ý với giá đề xuất |
| `COMPLETED` | Hoàn tất | Giao dịch thu cũ hoàn tất, tiền đã được khấu trừ |

#### Sơ đồ chuyển đổi

```
AWAITING_VALUATION ──────────► VALUED ──────────► ACCEPTED ──────────► COMPLETED
                                  │
                                  ▼
                               REJECTED
```

#### Chi tiết chuyển đổi

**AWAITING_VALUATION → VALUED**
- Trigger: Hệ thống tự động (áp dụng công thức định giá) hoặc nhân viên định giá thủ công
- Side effects:
  - Set `estimatedValue` theo công thức (xem mục 2.5)
  - Gửi thông báo cho khách xem giá đề xuất
  - Set `valuedAt = NOW()`

**VALUED → ACCEPTED**
- Trigger: Khách hàng xác nhận đồng ý
- Điều kiện: Trong thời gian hiệu lực của giá (thường 24-48 giờ)
- Side effects:
  - Áp dụng `estimatedValue` làm khoản khấu trừ vào đơn hàng mới
  - Khoá giá, không thay đổi được

**VALUED → REJECTED**
- Trigger: Khách hàng từ chối giá
- Side effects: Ghi nhận, có thể cho phép định giá lại

**ACCEPTED → COMPLETED**
- Trigger: Nhân viên sau khi kiểm tra máy thực tế và xác nhận giá trị thực tế khớp
- Điều kiện: `finalValue` đã được xác nhận
- Side effects:
  - Khấu trừ `finalValue` vào hóa đơn mua hàng
  - Ghi nhận thiết bị thu cũ vào kho

---

### 1.6 Shipment Status Machine (Trạng thái vận chuyển)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `AWAITING_PICKUP` | Chờ lấy hàng | Đơn vị vận chuyển chưa đến lấy hàng |
| `IN_TRANSIT` | Đang vận chuyển | Hàng đang trên đường giao |
| `DELIVERED` | Đã giao | Giao hàng thành công |
| `FAILED` | Giao thất bại | Giao hàng không thành công (không có người nhận...) |

#### Sơ đồ chuyển đổi

```
AWAITING_PICKUP ──────────► IN_TRANSIT ──────────► DELIVERED
                                  │
                                  ▼
                               FAILED
```

#### Chi tiết chuyển đổi

**AWAITING_PICKUP → IN_TRANSIT**
- Trigger: Webhook từ đơn vị vận chuyển (GHN, GHTK, VNPost...) khi nhận hàng
- Side effects:
  - Cập nhật `order.status → SHIPPING`
  - Ghi tracking history

**IN_TRANSIT → DELIVERED**
- Trigger: Webhook xác nhận giao thành công
- Side effects:
  - Set `actualDeliveryDate = NOW()`
  - Trigger `order.status → DELIVERED` (với tất cả side effects tương ứng)

**IN_TRANSIT → FAILED**
- Trigger: Webhook từ đơn vị vận chuyển (giao thất bại sau N lần thử)
- Side effects:
  - Gửi thông báo cho khách và nhân viên
  - Cho phép đặt lịch giao lại hoặc huỷ đơn

---

### 1.7 Invoice Status Machine (Trạng thái hóa đơn)

#### Danh sách trạng thái

| Enum Value | Tên tiếng Việt | Mô tả |
|---|---|---|
| `PENDING` | Chờ thanh toán | Hóa đơn đã tạo, chờ thanh toán |
| `PAID` | Đã thanh toán | Hóa đơn đã được thanh toán đầy đủ |
| `OVERDUE` | Quá hạn | Đã quá ngày thanh toán |
| `CANCELLED` | Đã hủy | Hóa đơn bị hủy (do hoàn trả hoặc hủy đơn) |

#### Sơ đồ chuyển đổi

```
PENDING ──────────► PAID
   │
   ▼
OVERDUE
   
PENDING ──────────► CANCELLED
```

#### Chi tiết chuyển đổi

**PENDING → PAID**: Khi payment.status chuyển sang PAID  
**PENDING → OVERDUE**: Scheduled job phát hiện `dueDate < NOW()`  
**PENDING → CANCELLED**: Khi order bị huỷ hoặc return được chấp thuận hoàn toàn

---

## 2. Business Rules

### 2.1 Order Rules (Quy tắc đơn hàng)

#### 2.1.1 Định dạng mã đơn hàng

```
Format: CP + YYYYMMDD + 5-digit sequence (zero-padded)
Ví dụ: CP2024011500001

Trong đó:
- CP:        Prefix cố định (CellPhones)
- YYYYMMDD:  Ngày tạo đơn (20240115 = 15/01/2024)
- 00001:     Số thứ tự trong ngày, tự tăng, reset về 00001 mỗi ngày
```

**Java implementation gợi ý:**
```java
// Sử dụng database sequence hoặc distributed lock để đảm bảo unique
String orderNumber = "CP" 
    + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
    + String.format("%05d", getNextDailySequence());
```

#### 2.1.2 Quy tắc huỷ đơn

- Chỉ được huỷ khi `order.status` là `PENDING` hoặc `CONFIRMED`
- Không thể huỷ đơn đang `SHIPPING`, `DELIVERED`, hoặc đã `CANCELLED`
- Khi huỷ từ `CONFIRMED`: bắt buộc release reserved stock

#### 2.1.3 Cửa sổ trả hàng

```
Thời hạn trả hàng = actualDeliveryDate + return_window_days
return_window_days được lấy từ: system_config WHERE config_key = 'return_window_days'
Giá trị mặc định: 7 (ngày)
```

#### 2.1.4 Công thức tính tổng tiền

```
totalAmount = subtotal + shippingFee - discount

Trong đó:
- subtotal    = SUM(item.quantity × item.unitPrice) cho tất cả order items
- shippingFee = phí vận chuyển (theo đơn vị vận chuyển + khoảng cách)
- discount    = giá trị giảm giá từ promotion/coupon (>= 0)

Ràng buộc: totalAmount >= 0 (không âm)
```

#### 2.1.5 Kiểm tra tồn kho trước khi xác nhận

Trước khi chuyển `PENDING → CONFIRMED`, hệ thống phải kiểm tra:
```
FOR EACH item IN order.items:
    inventoryItem = findByProductVariantId(item.variantId)
    IF inventoryItem.availableQuantity < item.quantity:
        THROW InsufficientStockException
```

---

### 2.2 Cart Rules (Quy tắc giỏ hàng)

#### 2.2.1 Merge items trùng lặp

Khi thêm sản phẩm vào giỏ, kiểm tra:
```
IF EXISTS cart_item WHERE userId = :userId 
                      AND productId = :productId 
                      AND variantId = :variantId:
    UPDATE cart_item SET quantity = quantity + :addedQuantity
ELSE:
    INSERT new cart_item
```
Không tạo duplicate cart_item có cùng `(userId, productId, variantId)`.

#### 2.2.2 Tính giá tự động

```
cartItem.totalPrice = cartItem.quantity × cartItem.unitPrice

Lưu ý:
- unitPrice được lấy từ product_variant.price tại thời điểm thêm vào giỏ
- unitPrice KHÔNG tự động cập nhật khi giá sản phẩm thay đổi
- Tuy nhiên, khi checkout: validate lại giá thực tế hiện tại
```

#### 2.2.3 Giới hạn số lượng items trong giỏ

```
MAX_CART_ITEMS = 50 (items, không phải quantity)

Nếu vượt quá: THROW CartLimitExceededException với message
"Giỏ hàng tối đa 50 sản phẩm"
```

#### 2.2.4 Validate khi checkout

Trước khi tạo order từ cart, kiểm tra từng item:
```
FOR EACH item IN cart:
    1. Sản phẩm còn active (product.isActive = true)
    2. Variant còn active (variant.isActive = true)
    3. Tồn kho đủ: inventory.availableQuantity >= item.quantity
    4. Giá hiện tại có thay đổi không → cảnh báo user nếu có
```

---

### 2.3 Promotion / Coupon Rules (Quy tắc khuyến mãi)

#### 2.3.1 Giới hạn áp dụng

- **Chỉ 1 promotion per order** — không được stack (cộng dồn) nhiều coupon
- Nếu user nhập coupon thứ 2: THROW `PromotionAlreadyAppliedException`

#### 2.3.2 Điều kiện hợp lệ của promotion (kiểm tra theo thứ tự)

```
1. promotion.isActive == true
2. promotion.startDate <= NOW() <= promotion.endDate
3. IF promotion.usageLimit > 0: promotion.usedCount < promotion.usageLimit
   IF promotion.usageLimit == 0: unlimited (bỏ qua kiểm tra)
4. order.subtotal >= promotion.minOrderValue
5. IF promotion.applicableProducts IS NOT EMPTY:
       AT LEAST 1 cart item's productId IN promotion.applicableProducts
```

#### 2.3.3 Công thức tính giảm giá theo loại

| Loại (`discountType`) | Công thức | Ghi chú |
|---|---|---|
| `PERCENT` | `discount = MIN(subtotal × value / 100, maxDiscount)` | `maxDiscount` giới hạn trần giảm giá |
| `FIXED_AMOUNT` | `discount = MIN(value, subtotal)` | Không được giảm nhiều hơn subtotal |
| `FREE_SHIPPING` | `shippingFee = 0` | Miễn phí vận chuyển |
| `BUY_X_GET_Y` | Xem quy tắc riêng bên dưới | Mua X tặng Y |

**BUY_X_GET_Y Logic:**
```
buyQuantity  = promotion.buyQuantity   // Mua X
getQuantity  = promotion.getQuantity   // Tặng Y

FOR EACH applicable item IN cart:
    freeItems = FLOOR(item.quantity / buyQuantity) × getQuantity
    discount += freeItems × item.unitPrice
```

#### 2.3.4 Sau khi áp dụng promotion thành công

```sql
UPDATE promotions SET used_count = used_count + 1 WHERE id = :promotionId;
-- Lưu ý: Sử dụng optimistic locking hoặc database-level lock để tránh race condition
```

---

### 2.4 Loyalty Points Rules (Quy tắc điểm thưởng)

#### 2.4.1 Công thức tích điểm

```
pointsEarned = FLOOR(orderTotalAmount / 100000) × pointsPerUnit

Trong đó:
- pointsPerUnit = system_config['loyalty_points_per_100k'] (default: 1)
- FLOOR: làm tròn xuống (phần lẻ < 100,000 VND không tính)

Ví dụ:
- Đơn 250,000 VND → FLOOR(250000/100000) × 1 = 2 điểm
- Đơn 99,999 VND  → FLOOR(99999/100000) × 1  = 0 điểm
- Đơn 500,000 VND → FLOOR(500000/100000) × 1  = 5 điểm
```

#### 2.4.2 Thời điểm cộng điểm

- **Chỉ cộng điểm khi order.status chuyển sang `DELIVERED`**
- Không cộng điểm cho đơn hàng `CANCELLED` hoặc `RETURNED`
- Nếu đơn hàng bị `RETURNED` sau khi đã cộng điểm → trừ điểm tương ứng

#### 2.4.3 Quy đổi khi dùng điểm

```
1 điểm = 100 VND khi quy đổi thành giảm giá
```

#### 2.4.4 Bảng hạng thành viên

| Hạng | Enum | Tổng điểm tích lũy (lifetime) | Đặc quyền |
|---|---|---|---|
| Đồng | `BRONZE` | 0 – 999 điểm | Cơ bản |
| Bạc | `SILVER` | 1,000 – 4,999 điểm | Ưu tiên hỗ trợ |
| Vàng | `GOLD` | 5,000 – 19,999 điểm | Ưu tiên + quà sinh nhật |
| Kim Cương | `DIAMOND` | 20,000+ điểm | VIP + giá đặc biệt |

**Quan trọng:** Hạng dựa trên **tổng điểm TỪNG TÍCH LŨY** (lifetime earned), KHÔNG phải số dư điểm hiện tại.

```java
// Sau mỗi giao dịch điểm, recalculate tier:
long lifetimeEarned = loyaltyTransactionRepo
    .sumEarnedPointsByUserId(userId); // chỉ type=EARN

LoyaltyTier tier = calculateTier(lifetimeEarned);
loyaltyAccount.setTier(tier);
```

#### 2.4.5 Thời hạn điểm

```
Điểm hết hạn sau 1 năm kể từ lần tích điểm cuối cùng.
expiryDate = MAX(earnedDate) + 365 days
Nếu có giao dịch EARN mới → gia hạn thêm 1 năm từ ngày đó
```

---

### 2.5 Trade-in Valuation Formula (Công thức định giá thu cũ)

#### 2.5.1 Công thức tổng quát

```
estimatedValue = baseValue × storageMultiplier × conditionMultiplier

Kết quả làm tròn đến 500,000 VND gần nhất:
roundedValue = ROUND(estimatedValue / 500000) × 500000
```

#### 2.5.2 Bảng Base Values (Giá cơ sở)

| Model | Base Value (VND) |
|---|---:|
| iPhone 16 Pro Max | 29,000,000 |
| iPhone 15 Pro Max | 24,000,000 |
| iPhone 14 Pro Max | 18,000,000 |
| Samsung Galaxy S25 Ultra | 26,000,000 |
| Samsung Galaxy S24 Ultra | 21,000,000 |
| Các model khác (default) | 5,000,000 |

#### 2.5.3 Bảng Storage Multipliers (Hệ số dung lượng)

| Dung lượng | Multiplier |
|---|:---:|
| 128GB | 0.9 |
| 256GB | 1.0 |
| 512GB | 1.1 |
| 1TB | 1.2 |

#### 2.5.4 Bảng Condition Multipliers (Hệ số tình trạng máy)

| Tình trạng | Enum | Multiplier | Mô tả |
|---|---|:---:|---|
| Tốt | `GOOD` | 1.0 | Không trầy xước, đầy đủ phụ kiện |
| Khá | `FAIR` | 0.85 | Trầy xước nhẹ, pin còn tốt |
| Trung bình | `AVERAGE` | 0.7 | Trầy xước rõ, pin 70-80% |
| Kém | `POOR` | 0.5 | Hư hỏng nhìn thấy, pin kém |

#### 2.5.5 Ví dụ tính toán

```
iPhone 15 Pro Max, 256GB, FAIR condition:
- baseValue         = 24,000,000
- storageMultiplier = 1.0 (256GB)
- conditionMultiplier = 0.85 (FAIR)
- rawValue          = 24,000,000 × 1.0 × 0.85 = 20,400,000
- roundedValue      = ROUND(20,400,000 / 500,000) × 500,000
                    = ROUND(40.8) × 500,000
                    = 41 × 500,000 = 20,500,000 VND
```

---

### 2.6 Inventory Rules (Quy tắc tồn kho)

#### 2.6.1 Các thao tác tồn kho theo trạng thái đơn hàng

| Sự kiện | Thao tác | SQL tương đương |
|---|---|---|
| Order CONFIRMED | Reserve stock | `available_quantity -= orderQuantity` |
| Order CANCELLED (from CONFIRMED) | Release reserved stock | `available_quantity += orderQuantity` |
| Order DELIVERED | Finalize (đã reserve rồi, xác nhận bán) | Không thay đổi `available_quantity` (đã trừ khi CONFIRM) |
| Return REFUNDED | Hoàn trả tồn kho | `available_quantity += returnQuantity` |

**Lưu ý về công thức tồn kho:**
```
totalQuantity     = Tổng số lượng trong kho (nhập + tồn)
reservedQuantity  = Số lượng đã reserve cho các đơn CONFIRMED nhưng chưa DELIVERED
availableQuantity = totalQuantity - reservedQuantity - soldQuantity

Khi confirm đơn:
  reservedQuantity += orderQuantity
  availableQuantity -= orderQuantity  ← khách hàng không thể mua được nữa

Khi delivered:
  soldQuantity += orderQuantity
  reservedQuantity -= orderQuantity   ← giải phóng reserve, nhưng totalQuantity cũng giảm
```

#### 2.6.2 Cảnh báo tồn kho thấp

```
IF inventory.currentStock <= inventory.minStock:
    TRIGGER low_stock_alert
    Gửi thông báo cho admin/warehouse manager
    Ghi log vào inventory_alerts table
```

#### 2.6.3 Hết hàng

```
IF inventory.currentStock == 0:
    product_variant.isActive = false (hoặc thêm flag outOfStock = true)
    Ẩn nút "Thêm vào giỏ" trên frontend
```

---

### 2.7 Warranty Rules (Quy tắc bảo hành)

#### 2.7.1 Tính ngày hết hạn bảo hành

```
purchaseDate   = order.actualDeliveryDate (ngày giao hàng thực tế)
warrantyMonths = product.warrantyMonths

warrantyExpiry = purchaseDate + warrantyMonths (tháng)

Ví dụ:
- Mua ngày 15/01/2024, bảo hành 12 tháng
- warrantyExpiry = 15/01/2025
```

#### 2.7.2 Tự động cập nhật trạng thái hết hạn

```java
// Chạy scheduled job hàng ngày (cron: 0 0 1 * * *)
@Scheduled(cron = "0 0 1 * * *")
public void updateExpiredWarranties() {
    LocalDate today = LocalDate.now();
    warrantyRepo.findByStatusAndWarrantyExpiryBefore(WarrantyStatus.VALID, today)
                .forEach(w -> {
                    w.setStatus(WarrantyStatus.EXPIRED);
                    warrantyRepo.save(w);
                });
}
```

#### 2.7.3 Điều kiện nộp yêu cầu bảo hành

```
warranty.status MUST BE == VALID (không phải EXPIRED)
Nếu status == EXPIRED: THROW WarrantyExpiredException
    Message: "Sản phẩm đã hết thời hạn bảo hành"
```

---

### 2.8 Return Rules (Quy tắc trả hàng)

#### 2.8.1 Điều kiện được phép trả hàng

```
1. order.status IN (DELIVERED, RETURNED)
2. TODAY <= order.actualDeliveryDate + return_window_days
3. Không có return request nào đã ở trạng thái REFUNDED cho cùng items
4. Số lượng trả <= số lượng đã mua (item by item)
```

#### 2.8.2 Công thức tính tiền hoàn trả

```
refundAmount = SUM(returnItem.quantity × returnItem.unitPrice)

Trong đó:
- returnItem.unitPrice = giá tại thời điểm mua (lấy từ order_item.unitPrice)
- KHÔNG dùng giá hiện tại của sản phẩm
- shippingFee: hoàn lại nếu trả toàn bộ đơn, KHÔNG hoàn nếu trả một phần
```

#### 2.8.3 Tự động tạo thông báo khi duyệt trả hàng

```
Khi return request.status chuyển APPROVED:
→ Tự động tạo notification:
    recipient: order.customerId
    type: RETURN_APPROVED
    message: "Yêu cầu trả hàng đơn #{orderNumber} đã được chấp thuận. 
              Vui lòng gửi hàng về địa chỉ: {warehouseAddress}"
    channel: [EMAIL, IN_APP]
```

---

### 2.9 Review Rules (Quy tắc đánh giá sản phẩm)

#### 2.9.1 Điều kiện được phép review

```
1. order.status == DELIVERED
2. order.items CONTAINS productId (đã mua sản phẩm đó)
3. NOT EXISTS review WHERE userId = :userId 
                       AND productId = :productId 
                       AND orderId = :orderId
```
→ Nếu vi phạm: `THROW ReviewNotAllowedException`

#### 2.9.2 Quy trình duyệt review

```
Mới tạo → status = PENDING (ẩn với public)
Admin duyệt → status = VISIBLE (hiển thị)
Admin ẩn  → status = HIDDEN (ẩn lại)

Chỉ review có status = VISIBLE mới được tính vào rating
```

#### 2.9.3 Tính lại rating sản phẩm

```java
// Gọi mỗi khi review.status thay đổi sang VISIBLE hoặc HIDDEN
void recalculateProductRating(Long productId) {
    Double avgRating = reviewRepo.avgRatingByProductIdAndStatus(
        productId, ReviewStatus.VISIBLE
    );
    Long reviewCount = reviewRepo.countByProductIdAndStatus(
        productId, ReviewStatus.VISIBLE
    );
    
    Product product = productRepo.findById(productId);
    product.setRating(avgRating != null ? avgRating : 0.0);
    product.setReviewCount(reviewCount);
    productRepo.save(product);
}
```

---

### 2.10 Price History / Discount Rules (Quy tắc giá và giảm giá)

#### 2.10.1 Ghi lịch sử giá

```
Khi product.price thay đổi:
→ INSERT vào bảng price_history:
    productId, variantId, oldPrice, newPrice, changedAt, changedBy
```

#### 2.10.2 Ràng buộc giá

```
originalPrice >= price (giá gốc phải >= giá bán)
Nếu vi phạm: THROW InvalidPriceException

Nếu không truyền originalPrice:
    originalPrice = price (không có giảm giá)
```

#### 2.10.3 Tính phần trăm giảm giá

```java
int discountPercent = (int) Math.round(
    (originalPrice - price) / (double) originalPrice * 100
);
// Lưu vào product.discountPercent để hiển thị nhanh (denormalized)
```

---

## 3. Validation Rules

### 3.1 User Registration (Đăng ký người dùng)

| Field | Quy tắc | Message lỗi |
|---|---|---|
| `email` | Format hợp lệ (RFC 5322), unique trong hệ thống | "Email đã được sử dụng" / "Email không hợp lệ" |
| `password` | Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ số | "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số" |
| `phone` | 10-11 chữ số, format Việt Nam: `0xxxxxxxxx` hoặc `+84xxxxxxxxx` | "Số điện thoại không hợp lệ" |
| `fullName` | 2-200 ký tự, không chứa ký tự đặc biệt (`[^a-zA-ZÀ-ỹ\s]`) | "Họ tên không hợp lệ (2-200 ký tự)" |

**Regex patterns:**
```java
// Email
String EMAIL_PATTERN = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$";

// Password: min 8 chars, 1 uppercase, 1 digit
String PASSWORD_PATTERN = "^(?=.*[A-Z])(?=.*\\d).{8,}$";

// Vietnamese phone
String PHONE_PATTERN = "^(0|\\+84)(3[2-9]|5[6-9]|7[06-9]|8[1-9]|9[0-9])\\d{7}$";

// FullName: chữ cái, khoảng trắng, dấu tiếng Việt
String FULLNAME_PATTERN = "^[\\p{L}\\s]{2,200}$";
```

---

### 3.2 Product (Sản phẩm)

| Field | Quy tắc | Ghi chú |
|---|---|---|
| `name` | 10 – 500 ký tự | Không được để trống |
| `price` | > 0 (dương) | Kiểu BigDecimal |
| `originalPrice` | >= `price` (nếu được truyền) | Optional field |
| `warrantyMonths` | 1 – 120 tháng | Số nguyên dương |
| `variants` | Mảng không rỗng, tối thiểu 1 variant | Phải có ít nhất 1 SKU |
| `categoryId` | Tồn tại trong DB | FK validation |
| `brandId` | Tồn tại trong DB | FK validation |

---

### 3.3 Order (Đơn hàng)

| Field | Quy tắc | Ghi chú |
|---|---|---|
| `items` | Mảng không rỗng, tối thiểu 1 phần tử | |
| `items[].quantity` | >= 1 (số nguyên dương) | |
| `shippingAddress` | Bắt buộc, không null | Phải có đủ: street, ward, district, city |
| `totalAmount` | Phải khớp với kết quả tính toán | Server-side validation, không trust client |
| `paymentMethod` | Nằm trong enum PaymentMethod | COD, VNPAY, MOMO, ZALOPAY, BANK_TRANSFER |

**Server-side totalAmount validation:**
```java
BigDecimal calculatedTotal = calculateTotal(order.getItems(), order.getShippingFee(), 
                                            order.getDiscount());
if (calculatedTotal.compareTo(order.getTotalAmount()) != 0) {
    throw new InvalidOrderAmountException(
        "Tổng tiền không khớp. Giá trị đúng: " + calculatedTotal
    );
}
```

---

### 3.4 Promotion Code (Mã khuyến mãi)

| Field | Quy tắc | Ghi chú |
|---|---|---|
| `code` | Chữ hoa + số, 4-20 ký tự, regex: `^[A-Z0-9]{4,20}$` | Không chứa ký tự đặc biệt |
| `value` | > 0 | Giá trị giảm |
| `endDate` | > `startDate` | Ngày kết thúc phải sau ngày bắt đầu |
| `minOrderValue` | >= 0 | 0 = không có giá trị đơn tối thiểu |
| `usageLimit` | >= 0 | 0 = unlimited |
| `discountType` | Enum: PERCENT, FIXED_AMOUNT, FREE_SHIPPING, BUY_X_GET_Y | |
| PERCENT: `value` | 0 < value <= 100 | Phần trăm không được > 100% |

---

## 4. Auto-generated Fields

Các trường này được hệ thống tự động sinh, developer KHÔNG để client truyền vào.

| Entity | Field | Quy tắc sinh | Trigger |
|---|---|---|---|
| `Order` | `orderNumber` | `"CP"` + `yyyyMMdd` + 5-digit daily sequence | Khi tạo order |
| `Invoice` | `invoiceNumber` | `"INV-"` + `yyyy` + `"-"` + 6-digit global sequence (ví dụ: `INV-2024-000001`) | Khi order chuyển sang `SHIPPING` |
| `Payment` | `dueDate` | `order.createdAt` + `payment_due_days` ngày (default: 3, configurable) | Khi tạo payment record |
| `Invoice` | `issueDate` | `NOW()` tại thời điểm order.status → `SHIPPING` | Trigger từ order status change |
| `LoyaltyAccount` | `tier` | Tính lại theo `lifetimeEarnedPoints` sau mỗi giao dịch EARN/REDEEM | Sau mỗi `loyalty_transaction` |
| `Product` | `rating` | `AVG` rating của tất cả review có `status = VISIBLE` | Sau khi review được VISIBLE hoặc HIDDEN |
| `Product` | `reviewCount` | `COUNT` review có `status = VISIBLE` | Sau khi review thay đổi status |
| `Warranty` | `warrantyExpiry` | `actualDeliveryDate` + `warrantyMonths` tháng | Khi order → DELIVERED |
| `TradeIn` | `estimatedValue` | Công thức định giá (xem mục 2.5) | Khi status → VALUED |

**Lưu ý triển khai:**
```java
// Sử dụng @PrePersist để set auto-generated fields
@PrePersist
public void prePersist() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
    if (this.orderNumber == null) {
        this.orderNumber = orderNumberGenerator.generate();
    }
}

// Sử dụng database sequence cho invoice number (thread-safe)
// CREATE SEQUENCE invoice_seq START 1 INCREMENT 1;
// nextval('invoice_seq') trong SQL
```

---

## 5. Side Effects Table

Bảng này liệt kê tất cả các tác động phụ (cascading effects) khi một sự kiện quan trọng xảy ra. Developer phải implement đầy đủ tất cả side effects trong service layer.

---

### 5.1 Khi Order được TẠO (Order Created)

| # | Tác động | Service / Method | Mô tả |
|---|---|---|---|
| 1 | **Không** deduct stock ngay | `InventoryService` | Stock chỉ bị deduct khi CONFIRM, không phải khi tạo |
| 2 | Tạo `payment` record | `PaymentService.createForOrder()` | `status=UNPAID`, `dueDate = createdAt + 3 ngày` |
| 3 | Gửi thông báo cho khách | `NotificationService.send()` | Message: "Đặt hàng thành công. Mã đơn: #{orderNumber}" |
| 4 | Ghi `activity_log` | `ActivityLogService.log()` | `entityType=ORDER`, `action=CREATED`, `actorId=userId` |

---

### 5.2 Khi Order chuyển sang CONFIRMED

| # | Tác động | Service / Method | Mô tả |
|---|---|---|---|
| 1 | **Reserve stock** | `InventoryService.reserve()` | `available_quantity -= quantity` cho mỗi item |
| 2 | Gửi thông báo cho khách | `NotificationService.send()` | Message: "Đơn hàng #{orderNumber} đã được xác nhận và đang được chuẩn bị" |
| 3 | Thông báo nhân viên kho | `NotificationService.sendToRole(WAREHOUSE)` | Nhân viên kho biết để đóng gói |
| 4 | Ghi `activity_log` | `ActivityLogService.log()` | `action=STATUS_CHANGED`, `from=PENDING`, `to=CONFIRMED` |

---

### 5.3 Khi Order chuyển sang SHIPPING

| # | Tác động | Service / Method | Mô tả |
|---|---|---|---|
| 1 | Tạo `invoice` nếu chưa có | `InvoiceService.createForOrder()` | `invoiceNumber`, `issueDate=NOW()`, `status=PENDING` |
| 2 | Cập nhật shipment status | `ShipmentService.updateStatus(IN_TRANSIT)` | Gọi API đơn vị vận chuyển nếu cần |
| 3 | Gửi thông báo khách kèm tracking | `NotificationService.send()` | Message: "Đơn hàng đang được giao. Tracking: #{trackingNumber}" |
| 4 | Ghi `activity_log` | `ActivityLogService.log()` | `action=STATUS_CHANGED`, `from=CONFIRMED`, `to=SHIPPING` |

---

### 5.4 Khi Order chuyển sang DELIVERED

| # | Tác động | Service / Method | Mô tả |
|---|---|---|---|
| 1 | Set `actualDeliveryDate = NOW()` | `OrderService` | Trực tiếp trên entity |
| 2 | **Cộng loyalty points** | `LoyaltyService.earnPoints()` | `FLOOR(totalAmount / 100000) × pointsPerUnit` điểm |
| 3 | Tạo `loyalty_transaction` | `LoyaltyTransactionRepo.save()` | `type=EARN`, `points=earnedPoints`, `orderId=orderId` |
| 4 | Recalculate loyalty tier | `LoyaltyService.recalculateTier()` | Cập nhật tier theo lifetime earned points |
| 5 | Cập nhật payment status | `PaymentService.markAsPaid()` | Chỉ áp dụng với COD; online payment đã PAID trước đó |
| 6 | Cập nhật invoice status | `InvoiceService.markAsPaid()` | `invoice.status = PAID` |
| 7 | Mở cửa sổ trả hàng | `OrderService` | Tính `returnWindowEnd = deliveredAt + return_window_days` |
| 8 | Cho phép viết review | Logic check | Bây giờ query `canReview` sẽ trả về `true` |
| 9 | Gửi thông báo khách | `NotificationService.send()` | Message: "Đơn hàng đã giao thành công. Đánh giá sản phẩm để nhận thêm điểm thưởng!" |
| 10 | Ghi `activity_log` | `ActivityLogService.log()` | `action=STATUS_CHANGED`, `from=SHIPPING`, `to=DELIVERED` |

---

### 5.5 Khi Order chuyển sang CANCELLED

| # | Tác động | Service / Method | Điều kiện | Mô tả |
|---|---|---|---|---|
| 1 | **Release reserved stock** | `InventoryService.release()` | Chỉ nếu order từng ở CONFIRMED | `available_quantity += quantity` |
| 2 | Trigger refund flow | `PaymentService.triggerRefund()` | Chỉ nếu `payment.status == PAID` | Gọi API hoàn tiền qua payment gateway |
| 3 | Cập nhật invoice | `InvoiceService.cancel()` | Nếu invoice đã tạo | `invoice.status = CANCELLED` |
| 4 | Gửi thông báo khách | `NotificationService.send()` | Luôn luôn | Message: "Đơn hàng #{orderNumber} đã bị huỷ. Lý do: #{cancelReason}" |
| 5 | Ghi `activity_log` | `ActivityLogService.log()` | Luôn luôn | `action=CANCELLED`, `cancelReason=reason` |

---

### 5.6 Khi Return Request chuyển sang REFUNDED

| # | Tác động | Service / Method | Mô tả |
|---|---|---|---|
| 1 | **Restore stock** cho items trả về | `InventoryService.addStock()` | `available_quantity += returnItem.quantity` cho mỗi returned item |
| 2 | Trừ loyalty points đã cộng | `LoyaltyService.reclaimPoints()` | Tạo `loyalty_transaction type=REDEEM` với số điểm = điểm đã cộng từ order gốc |
| 3 | Recalculate loyalty tier | `LoyaltyService.recalculateTier()` | Tier có thể giảm nếu điểm giảm |
| 4 | Cập nhật payment status | `PaymentService.markAsRefunded()` | `payment.status = REFUNDED`, set `refundedAt = NOW()` |
| 5 | Cập nhật invoice status | `InvoiceService.cancel()` | `invoice.status = CANCELLED` (nếu hoàn toàn) |
| 6 | Cập nhật order status | `OrderService.updateStatus(RETURNED)` | `order.status = RETURNED` |
| 7 | Gửi thông báo khách | `NotificationService.send()` | Message: "Hoàn tiền #{refundAmount} VND đã được xử lý. Dự kiến nhận trong 3-5 ngày làm việc." |
| 8 | Ghi `activity_log` | `ActivityLogService.log()` | `action=RETURN_REFUNDED`, `refundAmount=amount` |

---

## Phụ lục: Danh sách Exception Classes gợi ý

```java
// Order exceptions
OrderNotFoundException
InvalidOrderStatusTransitionException  // from → to không hợp lệ
InsufficientStockException
OrderCancellationNotAllowedException

// Cart exceptions
CartLimitExceededException             // > 50 items
CartItemNotFoundException

// Promotion exceptions
PromotionNotFoundException
PromotionExpiredException
PromotionUsageLimitExceededException
PromotionMinOrderValueNotMetException
PromotionAlreadyAppliedException       // đã có 1 coupon rồi
InvalidPromotionScopeException         // sản phẩm không thuộc promotion

// Loyalty exceptions
InsufficientPointsException            // không đủ điểm để dùng

// Return exceptions
ReturnWindowExpiredException           // quá 7 ngày
ReturnNotAllowedException

// Warranty exceptions
WarrantyExpiredException
WarrantyClaimNotAllowedException

// Review exceptions
ReviewNotAllowedException              // chưa mua hoặc chưa DELIVERED
DuplicateReviewException               // đã review rồi

// Validation exceptions
InvalidPriceException                  // originalPrice < price
InvalidOrderAmountException            // totalAmount không khớp
```

---

*Tài liệu này được tạo cho CELLPHONES eCommerce Platform - Phiên bản 1.0*  
*Liên hệ BA team để cập nhật khi có thay đổi nghiệp vụ.*
