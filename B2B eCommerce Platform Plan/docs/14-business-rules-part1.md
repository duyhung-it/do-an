# 14 — Business Rules (Part 1): Core Commerce

> Quy tắc nghiệp vụ cho các domain cốt lõi: Đơn hàng, Giá, Giỏ hàng, Thanh toán, Hoá đơn, Trả hàng, Công nợ, Vận chuyển, Kho hàng.

---

## 1. Quy tắc Domain "Đơn hàng" (Order)

### Trạng thái hợp lệ

```typescript
type OrderStatus =
  | 'Chờ xác nhận'   // Buyer vừa tạo, chờ Seller xác nhận
  | 'Đã xác nhận'    // Seller đã xác nhận đơn
  | 'Đang xử lý'     // Seller đang chuẩn bị hàng
  | 'Đang giao hàng' // Đã tạo shipment, đang giao
  | 'Đã giao'        // Giao thành công
  | 'Đã huỷ'         // Buyer hoặc Seller huỷ
  | 'Hoàn trả';      // Đang trong quá trình trả hàng
```

### State Machine — Transitions hợp lệ

```
Chờ xác nhận
  ├──[Seller xác nhận]──► Đã xác nhận
  └──[Buyer/Seller huỷ]──► Đã huỷ

Đã xác nhận
  ├──[Seller bắt đầu xử lý]──► Đang xử lý
  └──[Seller/Buyer huỷ]──► Đã huỷ

Đang xử lý
  ├──[Tạo shipment]──► Đang giao hàng
  └──[Seller huỷ - trước khi giao]──► Đã huỷ

Đang giao hàng
  ├──[Shipment delivered]──► Đã giao
  └──[Shipment failed]──► Đang xử lý (retry)

Đã giao
  └──[Buyer yêu cầu trả hàng trong 7 ngày]──► Hoàn trả

Đã huỷ và Hoàn trả: TERMINAL states (không transition tiếp)
```

### Nguồn tạo đơn hàng

| `orderType` | Nguồn tạo | Đặc điểm |
|-------------|-----------|----------|
| `Thường` | Cart → Checkout | Tạo trực tiếp từ giỏ hàng |
| `RFQ` | RFQ → Quotation accepted | Giá từ báo giá, có `rfqId` |
| `Hợp đồng` | Contract → Order | Giá từ hợp đồng, có `contractId` |
| `Mẫu đơn` | Order Template | Giá và item từ mẫu, có `templateId` |

### Validation khi tạo đơn hàng

```
✓ Tất cả items phải có product.isActive = true
✓ quantity >= product.minOrderQty
✓ quantity <= product.stock (sau khi reserve)
✓ Buyer phải có shipping address
✓ Nếu có credit limit: orderTotal <= creditLimit.available
✓ Nếu có promotion: validate promotion code (trạng thái, hạn dùng, scope)
```

---

## 2. Quy tắc "Giá & Giảm giá"

### Thứ tự áp dụng

```
1. Kiểm tra Price Agreement (buyer-seller pair, per product)
   → Nếu có: dùng agreementPrice thay vì product.price

2. Áp dụng Volume Discount (nếu quantity đủ ngưỡng)
   → discount % trên unit_price

3. Áp dụng Promotion Code (nếu buyer nhập)
   → Chỉ 1 mã / đơn hàng (KHÔNG stack)
   → discount theo type: % hoặc số tiền cố định

4. Tính total = unitPrice × quantity - discountAmount
```

### Validation Promotion Code

```
✓ promotion.isActive = true
✓ NOW() BETWEEN promotion.startDate AND promotion.endDate
✓ promotion.usedCount < promotion.usageLimit (hoặc usageLimit IS NULL)
✓ orderSubtotal >= promotion.minOrderValue
✓ scope = 'all' OR (scope = 'specificProducts' AND at least 1 item in promotionProducts)
   OR (scope = 'specificCategories' AND category matches)
✓ Nếu có supplierId: chỉ áp dụng cho đơn hàng của NCC đó
```

### Công thức tính giảm giá

```javascript
// Phần trăm
discountAmount = min(subtotal × value / 100, maxDiscount ?? Infinity)

// Số tiền cố định
discountAmount = value   // không vượt quá subtotal

// Volume discount (per line item)
lineTotal = quantity × unitPrice × (1 - discountRate / 100)
```

---

## 3. Quy tắc "Giỏ hàng" (Cart)

### Nguyên tắc

- **1 user 1 giỏ hàng** (không phân chia theo supplier)
- Giỏ hàng có thể chứa items của **nhiều supplier** khác nhau
- Khi checkout: groupBy supplierId → tạo N đơn hàng riêng biệt

### Validation khi thêm vào giỏ

```
✓ product.isActive = true AND product.status = 'active'
✓ quantity >= product.minOrderQty
✓ quantity <= product.stock
✓ Nếu đã có product trong giỏ → cộng dồn: newQty = existingQty + addQty
  → validate lại: newQty <= product.stock
```

### savdForLater

```
- savedForLater = true: ẩn khỏi giỏ hàng active, KHÔNG tính vào subtotal
- savedForLater = false: hiển thị trong giỏ hàng active
- Khi checkout: chỉ process items với savedForLater = false
```

### CartContext State (localStorage)

```typescript
interface CartState {
  items: CartItem[];
  // Computed values (không lưu)
  activeItems: CartItem[];      // filter savedForLater=false
  savedItems: CartItem[];       // filter savedForLater=true
  subtotal: number;             // sum(activeItems.totalPrice)
  itemCount: number;            // activeItems.length
}
```

---

## 4. Quy tắc "Thanh toán" (Payment)

### State Machine

```
Chờ thanh toán
  ├──[Có partial payment]──► Thanh toán một phần
  └──[Quá dueDate]──► Quá hạn

Thanh toán một phần
  ├──[Đủ 100%]──► Đã thanh toán
  └──[Quá dueDate]──► Quá hạn

Quá hạn
  └──[Buyer thanh toán đủ]──► Đã thanh toán (nhưng có lateFee)

Đã thanh toán: TERMINAL (trừ khi có return → Hoàn tiền)
Hoàn tiền: TERMINAL
Đã huỷ: TERMINAL
```

### Phí trễ hạn (Late Fee)

```javascript
// Tính vào cuối mỗi ngày (cron job)
daysOverdue = max(0, TODAY - payment.dueDate)
lateFee = payment.amount × (lateFeeRate / 100 / 30) × daysOverdue
// lateFeeRate là % tháng (configurable, VD: 1.5%/tháng)
```

### Link Payment ↔ Invoice

```
1 Order → 1 Payment (bắt buộc)
1 Order → N Invoices (tùy loại: ban hàng, trả hàng, điều chỉnh)
Payment.invoiceId → Invoice chính (ban_hang)
```

### Nhắc nhở thanh toán

```
- reminderCount tăng mỗi lần gửi nhắc
- lastReminderAt cập nhật
- Kênh: inApp (mặc định) + email (nếu user bật)
- Auto reminder: T-3 ngày, T+0 (đáo hạn), T+7, T+14
```

---

## 5. Quy tắc "Hoá đơn" (Invoice)

### Loại hoá đơn

| `invoiceType` | Khi nào tạo |
|---------------|-------------|
| `Ban_hang` | Khi order chuyển sang 'Đang giao hàng' (auto) hoặc Seller tạo thủ công |
| `Tra_hang` | Khi return được chấp nhận |
| `Dieu_chinh` | Khi có DebitCreditNote được confirm |

### Quy trình hoá đơn

```
Seller tạo Invoice (status: 'Bản nháp')
  → Seller gửi → status: 'Đã gửi' → Buyer nhận notification
    → Buyer thanh toán → Payment.paidAmount = Invoice.totalAmount
      → Invoice status: 'Đã thanh toán'
    → Sau dueDate → status: 'Quá hạn' (cron job)
```

### Theo dõi quá hạn

```
- reminderCount tăng mỗi lần Seller gửi nhắc nợ
- lastReminderAt cập nhật
- isOverdue flag (set bởi cron job)
- Bulk reminder: Admin/Seller gửi cho tất cả overdue invoices cùng lúc
```

---

## 6. Quy tắc "Trả hàng" (Return)

### Cửa sổ trả hàng

```
- Deadline trả hàng: 7 ngày sau khi order.status = 'Đã giao'
- Admin có thể điều chỉnh qua system_config['return_window_days']
- Nếu quá deadline: buyer không thể tạo return mới
```

### State Machine

```
Chờ xử lý     → Đã nhận (Seller confirm nhận hàng về)
               → Từ chối (Seller từ chối ngay)

Đã nhận        → Đang kiểm tra (bắt đầu kiểm tra hàng)
Đang kiểm tra  → Chấp nhận (hàng lỗi/đúng lý do)
               → Từ chối (hàng không lỗi)

Chấp nhận      → Đã hoàn tiền (Seller xác nhận hoàn tiền)
Từ chối: TERMINAL
Đã hoàn tiền: TERMINAL
```

### Quy trình liên kết

```
Return accepted → tạo DebitCreditNote (type: Credit, amount = returnTotal)
               → DebitCreditNote confirmed → tạo Invoice (type: Tra_hang)
               → Payment.status thành 'Hoàn tiền'
```

---

## 7. Quy tắc "Công nợ" (Credit Limit)

### Kiểm tra hạn mức

```javascript
// Trước khi tạo Order:
const creditLimit = creditLimits.find(
  cl => cl.buyerId === order.buyerId && cl.supplierId === order.supplierId
);

if (creditLimit) {
  if (order.totalAmount > creditLimit.availableAmount) {
    throw new Error('INSUFFICIENT_CREDIT');
  }
  // Sau khi tạo Order thành công:
  creditLimit.usedAmount += order.totalAmount;
}
```

### CreditTransaction lifecycle

```
Order created → CreditTransaction (type: 'Tăng nợ', amount: +orderTotal)
Order cancelled → CreditTransaction (type: 'Giảm nợ', amount: -orderTotal)
Payment confirmed → CreditTransaction (type: 'Giảm nợ', amount: -paymentAmount)
```

---

## 8. Quy tắc "Ghi nợ / Ghi có" (Debit/Credit Note)

### Khi nào tạo

| Tình huống | Note type | Ai tạo |
|-----------|-----------|--------|
| Buyer trả hàng (accepted) | Credit Note | System auto |
| Giao thiếu hàng (GRN discrepancy) | Credit Note | Buyer tạo |
| Điều chỉnh giá sau đơn hàng | Debit/Credit | Thỏa thuận |

### Flow xác nhận 2 bên

```
Tạo Note (status: 'Chờ xác nhận')
  → Bên 1 xác nhận → status: 'Đã xác nhận (Buyer/Seller)'
  → Bên 2 xác nhận → status: 'Đã xác nhận' → FINAL
  → Bên từ chối → status: 'Từ chối' → TERMINAL
```

### Sau khi confirmed

```
→ Tạo Invoice (type: Dieu_chinh) với amount = note.amount
→ Cập nhật creditLimit (nếu Credit Note)
```

---

## 9. Quy tắc "Vận chuyển" (Shipment)

### State Machine

```
Chờ lấy hàng
  └──[Carrier lấy hàng]──► Đã lấy hàng

Đã lấy hàng
  └──[Đang vận chuyển]──► Đang vận chuyển

Đang vận chuyển
  ├──[Đến nơi giao]──► Đang giao
  └──[Sự cố]──► Đang vận chuyển (retry)

Đang giao
  ├──[Giao thành công]──► Đã giao → Order.status = 'Đã giao'
  └──[Không giao được]──► Giao thất bại

Giao thất bại
  └──[Trả về kho]──► Đã trả về
```

### 1 Order → N Shipments

```
- Seller có thể giao nhiều đợt (partial shipments)
- Khi TẤT CẢ shipments.status = 'Đã giao' → cập nhật Order.status = 'Đã giao'
- shipment_events: append-only (không update/delete)
```

### Tính phí vận chuyển

```javascript
// Tìm matching rate
const rate = shippingRates.find(r =>
  r.supplierId === order.supplierId &&
  r.originCity === warehouse.city &&
  r.destCity === shippingAddress.city &&
  r.weightFrom <= order.weight &&
  (r.weightTo === null || r.weightTo >= order.weight)
);

if (rate) {
  shippingFee = rate.baseRate + max(0, order.weight - rate.weightFrom) * rate.perKgRate;
}
```

---

## 10. Quy tắc "Kho hàng" (Inventory)

### Stock Movement — Tự động tạo khi

| Trigger | Movement Type | quantity |
|---------|--------------|---------|
| GRN confirmed | Nhập kho | +receivedQty |
| Order shipped | Xuất kho | -orderedQty |
| Return received | Nhập kho | +returnQty |
| Transfer approved + shipped | Xuất kho | -transferQty |
| Transfer received | Nhập kho | +receivedQty |
| Manual adjustment | Điều chỉnh | ±delta |

### Stock Alert — Tự động tạo khi

```javascript
// Sau mỗi StockMovement tạo/cập nhật:
if (inventoryItem.quantity <= inventoryItem.minStock) {
  if (inventoryItem.quantity === 0) {
    createAlert('Hết hàng', 'Nghiêm trọng');
  } else {
    createAlert('Sắp hết hàng', 'Cảnh báo');
  }
}

// Hàng sắp hết hạn (cron job hàng ngày):
if (item.expiryDate && item.expiryDate <= 30_DAYS_FROM_NOW) {
  createAlert('Sắp hết hạn', 'Cảnh báo');
}
```

### Warehouse Transfer Rules

```
1. from_warehouse ≠ to_warehouse (DB constraint)
2. Cần duyệt trước khi chuyển (status: Chờ duyệt → Đã duyệt)
3. Khi ship: tạo StockMovement (Xuất kho) ở kho gửi
4. Khi receive: tạo StockMovement (Nhập kho) ở kho nhận
5. received_qty có thể < quantity (thiếu hàng trong vận chuyển)
```

### Batch Tracking

```
- batchNumber: dùng để traceability
- expiryDate: hàng có hạn sử dụng (thực phẩm, dược phẩm)
- FIFO (First In First Out): xuất batch có expiry gần nhất trước
```

---

## Tài liệu liên quan

- [05-database-schema-part2.md](./05-database-schema-part2.md) — Schema: Đơn hàng, Thanh toán
- [06-database-schema-part3.md](./06-database-schema-part3.md) — Schema: Kho, Vận chuyển, Tài chính
- [17-state-machines.md](./17-state-machines.md) — State Machine Diagrams chi tiết
- [15-business-rules-part2.md](./15-business-rules-part2.md) — Rules: Sourcing & Procurement
