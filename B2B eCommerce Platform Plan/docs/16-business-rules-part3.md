# 16 — Business Rules (Part 3): Platform & System

> Quy tắc nghiệp vụ cho các domain: Khuyến mãi, Đánh giá, Loyalty, Tài liệu, Tích hợp, Thông báo, Nhật ký, Báo cáo, Phí nền tảng, Cấu hình hệ thống.

---

## 1. Quy tắc "Khuyến mãi" (Promotion)

### Validation đầy đủ

```javascript
function validatePromotion(code, cartItems, supplierId) {
  const promo = promotions.find(p => p.code === code);

  // Kiểm tra tồn tại
  if (!promo) throw new Error('PROMOTION_NOT_FOUND');

  // Kiểm tra trạng thái
  if (!promo.isActive) throw new Error('PROMOTION_INACTIVE');

  // Kiểm tra thời gian
  if (NOW() < promo.startDate || NOW() > promo.endDate) {
    throw new Error('PROMOTION_EXPIRED');
  }

  // Kiểm tra số lần dùng
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    throw new Error('PROMOTION_USAGE_LIMIT_EXCEEDED');
  }

  // Kiểm tra NCC (nếu promo chỉ dành cho 1 NCC)
  if (promo.supplierId && promo.supplierId !== supplierId) {
    throw new Error('PROMOTION_SUPPLIER_MISMATCH');
  }

  // Kiểm tra đơn hàng tối thiểu
  const subtotal = sum(cartItems.map(i => i.quantity * i.unitPrice));
  if (subtotal < promo.minOrderValue) {
    throw new Error('PROMOTION_MIN_VALUE_NOT_MET');
  }

  // Kiểm tra scope
  if (promo.scope === 'specificProducts') {
    const hasMatch = cartItems.some(i => promotionProducts.includes(i.productId));
    if (!hasMatch) throw new Error('PROMOTION_SCOPE_MISMATCH');
  }

  return { valid: true, discountAmount: calculateDiscount(promo, subtotal) };
}
```

### Không stack promotion

```
- 1 đơn hàng CHỈ được áp dụng 1 promotion code
- Nếu buyer nhập code mới → override code cũ
- Volume discount + Promotion có thể stack (không phải promotion code)
```

### Tính discount

```javascript
function calculateDiscount(promo, subtotal) {
  switch (promo.type) {
    case 'Phần trăm':
      const rawDiscount = subtotal * promo.value / 100;
      return promo.maxDiscount ? min(rawDiscount, promo.maxDiscount) : rawDiscount;

    case 'Số tiền':
      return min(promo.value, subtotal);  // Không trả tiền thừa

    case 'Mua X tặng Y':
      // Future: xử lý riêng theo từng line item
      return 0;
  }
}
```

---

## 2. Quy tắc "Đánh giá" (Review)

### Điều kiện được đánh giá

```
✓ Order.status = 'Đã giao' hoặc 'Hoàn trả'
✓ Chưa có review cho order_item này từ buyer này (UNIQUE constraint)
✓ Buyer là owner của Order
✓ Không giới hạn thời gian đánh giá (có thể cấu hình future)
```

### Moderation (tùy chọn)

```
Mặc định: review.status = 'Đã duyệt' ngay khi tạo (auto-approve)
Admin có thể bật: system_config['review_moderation'] = 'true'
  → review.status = 'Chờ duyệt' khi tạo
  → Admin duyệt → 'Đã duyệt' | Admin ẩn → 'Bị ẩn'
```

### Review Rating Average

```javascript
// Cập nhật sau mỗi review mới (trigger hoặc service):
product.rating = avg(reviews.rating WHERE productId = product.id AND status = 'Đã duyệt');
product.reviewCount = count(reviews WHERE productId = product.id AND status = 'Đã duyệt');
supplier.rating = avg(supplierReviews.overallRating WHERE supplierId = supplier.id);
```

### Seller Reply

```
- Chỉ 1 reply duy nhất per review
- Không thể edit reply sau khi gửi
- Buyer nhận notification khi seller reply
```

---

## 3. Quy tắc "Khách hàng thân thiết" (Loyalty)

### Tier System

```
Đồng:     0 - 999 points
Bạc:      1,000 - 4,999 points
Vàng:     5,000 - 19,999 points
Kim Cương: 20,000+ points
```

### Tích điểm (Earn)

```javascript
// Sau khi Order.status = 'Đã giao':
const pointsEarned = Math.floor(order.totalAmount / 1000 * loyaltyProgram.earnRate);
// VD: earnRate = 1 → 1 point / 1,000 VND → đơn 5,000,000 = 5,000 points

createLoyaltyTransaction({
  type: 'Tích điểm',
  points: +pointsEarned,
  referenceType: 'Order',
  referenceId: order.id
});
buyer.loyaltyPoints += pointsEarned;
```

### Đổi điểm (Redeem)

```javascript
// Buyer chọn phần thưởng:
if (buyer.loyaltyPoints < reward.pointsRequired) {
  throw new Error('INSUFFICIENT_POINTS');
}
createLoyaltyTransaction({
  type: 'Đổi điểm',
  points: -reward.pointsRequired
});
buyer.loyaltyPoints -= reward.pointsRequired;
// Xử lý phần thưởng (voucher, sản phẩm, cash back...)
```

### Điểm hết hạn

```
- Points hết hạn sau 12 tháng kể từ ngày tích
- Cron job hàng ngày: tìm transactions.createdAt < 12_MONTHS_AGO
  → Tạo LoyaltyTransaction (type: 'Hết hạn', points: -expiredPoints)
```

---

## 4. Quy tắc "Tài liệu" (Document)

### Access Levels

| level | Ai được xem |
|-------|------------|
| `Công khai` | Tất cả user đã đăng nhập |
| `Nội bộ` | User cùng company (buyer) hoặc cùng supplier (seller) |
| `Mật` | Chỉ owner và Admin |

### Liên kết Entity

```
document.entityType = 'Contract' → document.entityId = contract.id
document.entityType = 'Order'    → document.entityId = order.id
document.entityType = 'Product'  → document.entityId = product.id
// FK mềm (soft reference) — không có FK thực trong DB
```

### Version Control (Basic)

```
- Upload file mới cho entity → document.version++
- File cũ bị archive (tạo document mới, giữ cũ trong DB)
- Không có full version diff
```

---

## 5. Quy tắc "Tích hợp" (Integration)

### Webhook Delivery

```javascript
// Khi xảy ra event (VD: order created):
webhookEndpoints
  .filter(we => we.events.includes('order.created') && we.isActive)
  .forEach(endpoint => {
    try {
      await fetch(endpoint.url, {
        method: 'POST',
        body: JSON.stringify(eventPayload),
        headers: { 'X-Webhook-Secret': endpoint.secret }
      });
      log({ status: 'success' });
    } catch (err) {
      endpoint.failureCount++;
      log({ status: 'failed', error: err.message });
      // Retry sau 5 phút, tối đa 3 lần
      scheduleRetry(endpoint, eventPayload, retryCount + 1);
    }
  });
```

### API Key Rate Limiting

```
- Default: 1000 requests / hour per API key
- IP Whitelist: nếu có list, chỉ cho phép IP trong list
- Environments: 'production' / 'sandbox' (sandbox không ảnh hưởng dữ liệu thật)
```

---

## 6. Quy tắc "Thông báo" (Notification)

### Auto-trigger Events

```typescript
const NOTIFICATION_TRIGGERS = {
  'order.created':          { buyer: true,  seller: true,  admin: false },
  'order.status_changed':   { buyer: true,  seller: true,  admin: false },
  'rfq.submitted':          { buyer: false, seller: true,  admin: false },
  'quotation.received':     { buyer: true,  seller: false, admin: false },
  'contract.signed':        { buyer: true,  seller: true,  admin: false },
  'payment.due_reminder':   { buyer: true,  seller: false, admin: false },
  'stock.low_alert':        { buyer: false, seller: true,  admin: false },
  'return.status_changed':  { buyer: true,  seller: true,  admin: false },
  'review.received':        { buyer: false, seller: true,  admin: false },
  'approval.required':      { buyer: true,  seller: false, admin: false },
  'certificate.approved':   { buyer: false, seller: true,  admin: false },
};
```

### Channels

| Channel | Default | Điều kiện |
|---------|---------|-----------|
| `inApp` | Luôn bật | Hiển thị trong NotificationDropdown |
| `email` | Tùy user | user.notificationPreferences.email = true |
| `push` | Tùy user | Future feature |
| `sms` | Tắt | Future feature |

### NotificationContext

```typescript
// NotificationContext state:
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  // Actions:
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;  // For real-time
}
```

---

## 7. Quy tắc "Nhật ký" (Activity Log)

### Tự động ghi log

```javascript
// Wrapper cho tất cả service mutations:
async function withActivityLog(action, entity, perform) {
  const before = getEntitySnapshot(entity);
  const result = await perform();
  const after = getEntitySnapshot(entity);

  createActivityLog({
    userId: currentUser.id,
    action,
    entityType: entity.type,
    entityId: entity.id,
    changes: diffObjects(before, after)
  });

  return result;
}
```

### Events bắt buộc phải log (20+ events)

```
user.login, user.logout, user.password_change
product.created, product.updated, product.deleted, product.status_changed
order.created, order.status_changed, order.cancelled
payment.recorded, payment.reminded
contract.signed, contract.status_changed
invoice.sent, invoice.paid
warehouse.stock_adjusted
user.role_changed, supplier.verified
system_config.updated
```

### Retention Policy

```
- Lưu 90 ngày (configurable: system_config['activity_log_retention_days'])
- Cron job hàng ngày: DELETE FROM activity_logs WHERE created_at < NOW() - retention_days
```

---

## 8. Quy tắc "Báo cáo" (Report Builder)

### Allowed Entity Types

```
'Order', 'OrderItem', 'Product', 'Invoice', 'Payment',
'Shipment', 'Return', 'Review', 'RFQ', 'Contract',
'Supplier', 'User', 'InventoryItem', 'StockMovement'
```

### Schedule Logic

```javascript
// Cron job theo frequency:
if (report.isScheduled) {
  const shouldRun = {
    'Hàng ngày': isSameDay(NOW(), report.lastRunAt + 1_DAY),
    'Hàng tuần': isSameWeek(NOW(), report.lastRunAt + 7_DAYS),
    'Hàng tháng': isSameMonth(NOW(), report.lastRunAt + 30_DAYS)
  }[report.scheduleFrequency];

  if (shouldRun) {
    const data = runReport(report);
    sendToRecipients(data, report.sendTo);
    report.lastRunAt = NOW();
  }
}
```

### Export Formats

```
CSV:   Papa.unparse(data)
Excel: xlsxjs library  
PDF:   pdf-lib hoặc puppeteer (future)
```

---

## 9. Quy tắc "Phí nền tảng" (Platform Fee)

### Fee Types

| type | Tính như thế nào |
|------|-----------------|
| `Giao dịch` | % trên mỗi Order.totalAmount |
| `Đăng ký` | Cố định theo tháng (per supplier) |
| `Niêm yết` | Cố định per product listing |

### Áp dụng phí

```javascript
// Khi Order.status = 'Đã giao':
const fees = platformFees.filter(f =>
  f.isActive &&
  (f.appliesTo === 'all' || f.appliesTo === 'supplier')
);

fees.forEach(fee => {
  if (fee.type === 'Giao dịch') {
    const amount = order.totalAmount * fee.rate / 100;
    const capped = Math.min(Math.max(amount, fee.minFee ?? 0), fee.maxFee ?? Infinity);
    createPlatformFeeTransaction(order, capped);
  }
});
```

---

## 10. Quy tắc "Cấu hình hệ thống"

### SystemConfig Keys

| Key | Type | Ý nghĩa |
|-----|------|---------|
| `site_name` | string | Tên hệ thống |
| `site_logo` | string | URL logo |
| `contact_email` | string | Email admin |
| `maintenance_mode` | boolean | Bật/tắt bảo trì |
| `default_tax_rate` | number | % VAT mặc định |
| `return_window_days` | number | Cửa sổ trả hàng (ngày) |
| `low_stock_alert_threshold` | number | % ngưỡng cảnh báo tồn kho |
| `activity_log_retention_days` | number | Lưu log bao nhiêu ngày |
| `review_moderation` | boolean | Bật kiểm duyệt review |
| `max_file_size_mb` | number | Giới hạn upload file |

### Cascade Update

```
Khi admin cập nhật system_config:
  → Ghi ActivityLog (action: 'system_config.updated')
  → Một số config có hiệu lực ngay (maintenance_mode, site_name)
  → Một số cần restart service để áp dụng (future: Supabase env vars)
```

### BannerConfig Priority

```javascript
// Lấy banner cho trang chủ buyer:
const banners = bannerConfigs
  .filter(b =>
    b.isActive &&
    (b.targetPage === 'home' || b.targetPage === null) &&
    (b.targetRole === 'Buyer' || b.targetRole === 'all') &&
    (b.startDate === null || b.startDate <= NOW()) &&
    (b.endDate === null || b.endDate >= NOW())
  )
  .sort((a, b) => a.sortOrder - b.sortOrder);
```

---

## Tài liệu liên quan

- [14-business-rules-part1.md](./14-business-rules-part1.md) — Rules: Core Commerce
- [15-business-rules-part2.md](./15-business-rules-part2.md) — Rules: Sourcing & Procurement
- [17-state-machines.md](./17-state-machines.md) — State Machine Diagrams
- [19-permission-implementation.md](./19-permission-implementation.md) — Permission implementation
