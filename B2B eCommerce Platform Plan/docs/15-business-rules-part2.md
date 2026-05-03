# 15 — Business Rules (Part 2): Sourcing & Procurement

> Quy tắc nghiệp vụ cho các domain RFQ, Báo giá, Hợp đồng, Phê duyệt nội bộ, PR, GRN, Ngân sách, Đấu giá ngược, Thỏa thuận giá, SLA & Bảo hành.

---

## 1. Quy tắc "RFQ" (Request for Quotation)

### State Machine

```
Bản nháp → Đã gửi → Đang báo giá → Đã báo giá → Chấp nhận → Hoàn thành
                                ↓
                         Hết hạn (khi expires_at < NOW())
                                ↓
                         Từ chối / Đã huỷ
```

**Chi tiết transitions:**

| Từ | Đến | Điều kiện | Ai thực hiện |
|----|-----|-----------|--------------|
| Bản nháp | Đã gửi | Phải có ít nhất 1 item | Buyer |
| Đã gửi | Đang báo giá | Seller bắt đầu tạo Quotation | System auto |
| Đang báo giá | Đã báo giá | Seller submit Quotation | System auto |
| Đã báo giá | Chấp nhận | Buyer accept 1 Quotation | Buyer |
| Chấp nhận | Hoàn thành | Contract được ký | System auto |
| Any | Hết hạn | expires_at < NOW() (cron job) | System auto |
| Bản nháp/Đã gửi | Đã huỷ | Buyer huỷ | Buyer |

### Quy tắc Priority

```
priority = 'Rất gấp'  → Hiển thị đầu danh sách + badge đỏ + notification urgent
priority = 'Gấp'      → Badge vàng + sort ưu tiên
priority = 'Thường'   → Mặc định
```

### Target Suppliers

```
- supplierId = null (default): RFQ public trên marketplace, tất cả supplier thấy
- supplierId = specific: RFQ chỉ gửi đến 1 supplier cụ thể
- targetSuppliers JSON []: Gửi đến nhóm supplier (future feature)
```

---

## 2. Quy tắc "Báo giá" (Quotation)

### State Machine

```
Chờ phản hồi → Chấp nhận (buyer accept)
             → Từ chối  (buyer reject)
```

### 1 RFQ → N Quotations

```
- Nhiều Seller có thể gửi Quotation cho 1 RFQ
- Buyer có thể so sánh qua compareQuotations endpoint
- Buyer chọn 1 Quotation → Accept → tạo Contract
- Các Quotation còn lại tự động chuyển → 'Từ chối'
```

### Comparison Logic

```javascript
// quotationApi.compareQuotations(rfqId)
const comparison = rfq.items.map(item => ({
  productName: item.productName,
  suppliers: quotations.map(q => ({
    supplierId: q.supplierId,
    supplierName: q.supplierName,
    unitPrice: q.items.find(i => i.productName === item.productName)?.unitPrice,
    deliveryDays: q.deliveryDays,
    totalAmount: q.totalAmount,
    rating: supplier.rating
  }))
}));
```

### Expiry

```
- validUntil: Ngày hết hạn báo giá (seller set)
- Sau validUntil: status tự động → 'Hết hạn' (cron job)
- Buyer không thể accept expired quotation
```

---

## 3. Quy tắc "Hợp đồng" (Contract)

### State Machine

```
Bản nháp → Chờ ký → Đang thực hiện → Hoàn thành
         ↓                         ↓
       Đã huỷ                   Tranh chấp
                        ↓
                     Hết hạn (endDate < NOW())
```

**Chi tiết:**

| Từ | Đến | Điều kiện |
|----|-----|-----------|
| Bản nháp | Chờ ký | Tất cả thông tin đầy đủ |
| Chờ ký | Đang thực hiện | signedByBuyer=true AND signedBySeller=true |
| Đang thực hiện | Hoàn thành | Tất cả milestones hoàn thành |
| Đang thực hiện | Tranh chấp | Báo cáo lên Admin |
| Any | Đã huỷ | Một bên huỷ (trước khi ký) |
| Any | Hết hạn | endDate < NOW() (cron job) |

### Contract Types

| type | Đặc điểm |
|------|----------|
| `Mua bán` | 1 lần, fixed quantity, fixed amount |
| `Khung` | Dài hạn, xác định giá, order nhiều lần trong kỳ |
| `Dịch vụ` | SLA-based, payment theo kỳ |

### Auto Renew

```javascript
// Cron job hàng ngày:
if (contract.autoRenew && contract.endDate <= 30_DAYS_FROM_NOW) {
  createNotification({
    type: 'contract_renewal_reminder',
    message: `Hợp đồng ${contract.contractNumber} sắp hết hạn. Gia hạn?`
  });
  contract.renewalDate = TODAY;
}
```

### Milestones

```
- Milestone.status tự động chuyển 'Quá hạn' khi dueDate < TODAY (cron job)
- Khi tất cả milestones = 'Hoàn thành' → Contract.status = 'Hoàn thành'
- milestone.paidAmount: tracker tiền đã trả cho milestone này
```

---

## 4. Quy tắc "Phê duyệt nội bộ" (Approval)

### Rule Engine

```typescript
// Khi tạo Order/PR/Contract, check approval rules:
const matchingRule = approvalRules.find(rule =>
  rule.ruleType === entityType &&
  rule.thresholdMin <= entity.amount &&
  (rule.thresholdMax === null || entity.amount <= rule.thresholdMax) &&
  rule.isActive
);

if (matchingRule) {
  createApprovalRequest({
    entityType,
    entityId: entity.id,
    amount: entity.amount,
    requestedBy: currentUser.id
  });
}
```

### Approval Thresholds (Ví dụ cấu hình)

| Amount | Approver Level |
|--------|---------------|
| < 10,000,000 VND | Staff tự duyệt |
| 10M - 50M VND | Manager |
| 50M - 200M VND | Director |
| > 200M VND | CEO / Chủ doanh nghiệp |

### Multi-level Approval Steps

```
ApprovalStep level 1 → level 2 → level 3
- Xử lý tuần tự (sequential)
- Level N chỉ nhận khi Level N-1 đã duyệt
- Bất kỳ level nào Từ chối → ApprovalRequest.status = 'Từ chối'
```

### Escalation

```
- dueDate field: hạn chót để duyệt
- Nếu step.responded_at > step.dueDate → escalate lên level trên
- escaled_at field ghi lại thời điểm escalate
```

---

## 5. Quy tắc "Yêu cầu mua hàng" (PR)

### State Machine

```
Bản nháp → Chờ duyệt → Đã duyệt → Đã tạo RFQ → Đã đặt hàng → Hoàn thành
         ↓           ↓
       Đã huỷ     Từ chối
```

### Liên kết PR → Order Flow

```
PR.status = 'Bản nháp'
  → Buyer submit → 'Chờ duyệt'
  → ApprovalRequest tạo (nếu amount > threshold)
  → Approved → 'Đã duyệt'

Sau khi duyệt, Buyer có thể:
  Option A: Tạo RFQ từ PR → PR.status = 'Đã tạo RFQ', PR.rfqId = rfq.id
  Option B: Tạo Order trực tiếp → PR.status = 'Đã đặt hàng', PR.orderId = order.id
```

### Budget Check

```javascript
// Trước khi submit PR:
if (pr.budgetAllocationId) {
  const allocation = budgetAllocations.find(a => a.id === pr.budgetAllocationId);
  if (pr.totalAmount > allocation.remainingAmount) {
    throw new Error('BUDGET_EXCEEDED');
  }
}
```

---

## 6. Quy tắc "Biên bản nhận hàng" (GRN)

### Khi nào tạo GRN

```
- Tự động trigger khi Shipment.status = 'Đã giao'
  → System tạo GRN với status 'Chờ kiểm tra'
- Hoặc Buyer tạo thủ công khi nhận hàng
```

### Discrepancy Handling

```javascript
// Sau khi GRN confirm:
grnItems.forEach(item => {
  if (item.receivedQty < item.orderedQty) {
    grn.hasDiscrepancy = true;
    // Option 1: Tạo Return request cho hàng thiếu
    // Option 2: Tạo Credit Note với amount = missingQty × unitPrice
  }
  if (item.rejectedQty > 0) {
    grn.hasDiscrepancy = true;
    grn.status = 'Có sự cố';
    // Tạo Return request cho hàng hỏng
  }
});
```

### Inventory Update khi GRN confirm

```
GRN.status = 'Hoàn thành'
  → Tạo StockMovement (type: 'Nhập kho') cho mỗi GRN item
  → inventory_items.quantity += item.receivedQty
  → inventory_items.last_restocked = NOW()
```

---

## 7. Quy tắc "Ngân sách" (Budget)

### Budget Hierarchy

```
BudgetPlan (Năm/Quý/Tháng)
  └── BudgetAllocation (per Department hoặc Category)
        └── BudgetTransaction (mỗi lần chi tiêu/hoàn trả)
```

### Kiểm tra ngân sách

```javascript
// Trước khi tạo PR hoặc Order:
if (allocation.remainingAmount < requiredAmount) {
  return { approved: false, message: 'Vượt ngân sách phân bổ' };
}
// Sau khi tạo thành công:
allocation.usedAmount += requiredAmount;
createBudgetTransaction({
  type: 'Chi tiêu',
  amount: requiredAmount,
  referenceType: 'PR',
  referenceId: pr.id
});
```

### Alert ngưỡng ngân sách

```javascript
// Cron job hoặc sau mỗi transaction:
const usedPercent = allocation.usedAmount / allocation.allocatedAmount × 100;
if (usedPercent >= allocation.alertThreshold) {  // default: 80%
  createNotification({
    type: 'budget_threshold_alert',
    message: `Ngân sách ${allocation.department} đã dùng ${usedPercent.toFixed(0)}%`
  });
}
```

---

## 8. Quy tắc "Đấu giá ngược" (Reverse Auction)

### Flow

```
Buyer tạo Auction
  → Mời Suppliers (auction_invited_suppliers)
  → Suppliers đặt giá (auction_bids)
    → Mỗi bid phải thấp hơn bid cao nhất × (1 - minBidDecrement/100)
  → Hết thời gian → Buyer chọn winner
    → Tạo Order hoặc Contract với winner supplier
```

### Auto-extend Rule

```javascript
// Khi có bid trong N phút cuối:
const LAST_MINUTES = auctionConfig.autoExtendMinutes ?? 5;
if (bid.createdAt >= auction.endTime - LAST_MINUTES * 60 * 1000) {
  auction.endTime += LAST_MINUTES * 60 * 1000;  // Gia hạn thêm N phút
}
```

### Bid Validation

```javascript
const currentBestPrice = min(all bids for this auction);
const maxAllowedPrice = currentBestPrice * (1 - auction.minBidDecrement / 100);
if (newBid.totalAmount > maxAllowedPrice) {
  throw new Error('BID_TOO_HIGH');  // Phải giảm ít nhất minBidDecrement%
}
```

---

## 9. Quy tắc "Thỏa thuận giá" (Price Agreement)

### Auto-apply khi đặt hàng

```javascript
// Trong orderApi.create():
const agreement = priceAgreements.find(pa =>
  pa.buyerId === order.buyerId &&
  pa.supplierId === order.supplierId &&
  pa.status === 'Đang hiệu lực' &&
  pa.startDate <= TODAY &&
  pa.endDate >= TODAY
);

if (agreement) {
  order.items.forEach(item => {
    const agreementItem = agreement.items.find(ai => ai.productId === item.productId);
    if (agreementItem) {
      item.unitPrice = agreementItem.agreedPrice;  // Override giá niêm yết
      item.source = 'PriceAgreement';
    }
  });
}
```

### Usage Tracking

```
- currentUsedQty: tổng quantity đã order theo thỏa thuận
- maxQty: giới hạn tổng quantity (nếu có)
- Khi currentUsedQty >= maxQty → agreement.status = 'Hết hạn mức'
```

---

## 10. Quy tắc "SLA & Bảo hành"

### SLA Metrics

```typescript
interface SLADefinition {
  name: string;
  supplierId: string;
  metrics: {
    onTimeDeliveryTarget: number;     // % (VD: 95%)
    defectRateTarget: number;         // % (VD: < 1%)
    responseTimeTarget: number;       // giờ (VD: < 24h)
  };
  reportPeriod: 'Tháng' | 'Quý';
}
```

### SLA Report Calculation

```javascript
// Tính điểm cuối kỳ:
const report = {
  onTimeDeliveryActual: deliveredOnTime / totalDelivered * 100,
  defectRateActual: rejectedItems / totalItems * 100,
  responseTimeActual: avg(rfqResponseTimes_in_hours),
  score: calculateSLAScore(actual, target),   // 0-100
  passed: score >= 70                         // ngưỡng pass
};
```

### Warranty Flow

```
Sản phẩm có warrantyMonths
  → Tạo Warranty khi Order.status = 'Đã giao'
    warranty.startDate = deliveredDate
    warranty.endDate = deliveredDate + warrantyMonths * 30 days

  → Buyer tạo WarrantyClaim
    → status: 'Chờ duyệt'
    → Seller review → 'Đã duyệt' / 'Từ chối'
    → Nếu duyệt → 'Đang xử lý' → 'Đã giải quyết'
```

---

## Tài liệu liên quan

- [14-business-rules-part1.md](./14-business-rules-part1.md) — Rules: Core Commerce
- [16-business-rules-part3.md](./16-business-rules-part3.md) — Rules: Platform & System
- [17-state-machines.md](./17-state-machines.md) — State Machine Diagrams
- [08-erd.md](./08-erd.md) — ERD: Domain Sourcing & Procurement
