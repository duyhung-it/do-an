# 12 — API Specification (Part 4): Trả hàng, Đánh giá, Khuyến mãi, Phê duyệt, PR, GRN, Budget

> Tiếp theo từ [11-api-spec-part3.md](./11-api-spec-part3.md).
> Conventions và format response xem [09-api-spec-part1.md](./09-api-spec-part1.md).

---

## 1. `returnApi` — Trả hàng

> Mock: `returnApi` trong `/src/app/services/api.ts`

### GET `/returns`

Danh sách yêu cầu trả hàng. Filter theo role.

**Query params:** `?status&buyerId&supplierId&orderId&dateFrom&dateTo&page&pageSize`

**ReturnStatus values:**
```typescript
type ReturnStatus =
  | 'Chờ xử lý'
  | 'Đã nhận'
  | 'Đang kiểm tra'
  | 'Chấp nhận'
  | 'Từ chối'
  | 'Đã hoàn tiền';
```

**ReturnRequest type:**
```typescript
interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber?: string;
  buyerId: string;
  buyerName?: string;
  supplierId: string;
  supplierName?: string;
  reason: string;
  status: ReturnStatus;
  totalAmount: number;
  refundAmount: number;
  items: ReturnItem[];
  images?: ReturnImage[];
  inspectNote?: string;
  inspectBy?: string;
  inspectAt?: string;
  refundAt?: string;
  createdAt: string;
}

interface ReturnItem {
  id: string;
  returnId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  reason?: string;
  condition?: string;   // 'Nguyên vẹn', 'Hỏng hóc', 'Thiếu phụ kiện'
}
```

### GET `/returns/:id`

Chi tiết yêu cầu trả hàng kèm items và images.

### POST `/returns`

*Buyer only.* Tạo yêu cầu trả hàng.

**Request Body:**
```json
{
  "orderId": "ord-001",
  "reason": "Sản phẩm bị lỗi khi nhận",
  "items": [
    {
      "orderItemId": "item-001",
      "productId": "prod-001",
      "productName": "Laptop Dell XPS 15",
      "quantity": 1,
      "unitPrice": 35000000,
      "condition": "Hỏng hóc"
    }
  ]
}
```

### PATCH `/returns/:id/accept`

*Seller only.* Chấp nhận trả hàng.

**Request Body:** `{ "refundAmount": 35000000, "note": "Hàng lỗi từ sản xuất, chấp nhận hoàn tiền" }`

### PATCH `/returns/:id/reject`

*Seller only.* Từ chối trả hàng.

**Request Body:** `{ "reason": "Hàng không có dấu hiệu lỗi do sản xuất" }`

### PATCH `/returns/:id/refund`

*Seller only.* Xác nhận đã hoàn tiền.

### PATCH `/returns/:id/inspect`

*Seller only.* Cập nhật kết quả kiểm tra.

**Request Body:** `{ "note": "Đã kiểm tra, xác nhận lỗi LCD" }`

### POST `/returns/:id/upload-image`

Upload ảnh minh chứng.

**Request Body:** `{ "url": "https://...", "altText": "Ảnh lỗi màn hình" }`

### GET `/returns/by-order/:orderId`

Lấy tất cả returns của 1 đơn hàng.

### GET `/returns/stats`

Thống kê trả hàng.

---

## 2. `reviewApi` — Đánh giá sản phẩm

> Mock: `reviewApi` trong `/src/app/services/api.ts`

### GET `/reviews`

Danh sách đánh giá. Public endpoint.

**Query params:** `?productId&buyerId&rating&status&page&pageSize`

**ProductReview type:**
```typescript
interface ProductReview {
  id: string;
  productId: string;
  orderId?: string;
  buyerId: string;
  buyerName?: string;
  buyerCompany?: string;
  supplierId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  isVerified: boolean;
  isAnonymous: boolean;
  helpfulCount: number;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Bị ẩn' | 'Bị xoá';
  sellerReply?: string;
  sellerReplyAt?: string;
  images?: string[];
  tags?: string[];
  createdAt: string;
}
```

### GET `/reviews/:id`

Chi tiết 1 đánh giá.

### POST `/reviews`

*Buyer only.* Tạo đánh giá (chỉ sau khi order = 'Hoàn thành').

**Request Body:**
```json
{
  "productId": "prod-001",
  "orderId": "ord-001",
  "rating": 5,
  "title": "Sản phẩm tuyệt vời",
  "content": "Dell XPS 15 rất mượt mà, pin trâu...",
  "pros": "Hiệu năng mạnh, màn hình đẹp",
  "cons": "Hơi nặng",
  "isAnonymous": false,
  "images": ["https://..."]
}
```

### PUT `/reviews/:id`

*Buyer only (owner).* Cập nhật đánh giá.

### DELETE `/reviews/:id`

*Buyer (owner)* hoặc *Admin.*

### POST `/reviews/:id/seller-reply`

*Seller only.* Phản hồi đánh giá.

**Request Body:** `{ "reply": "Cảm ơn quý khách đã ủng hộ..." }`

### PATCH `/reviews/:id/helpful`

Đánh dấu hữu ích (toggle).

### POST `/reviews/:id/report`

Báo cáo đánh giá vi phạm.

### GET `/reviews/by-product/:productId`

Tất cả đánh giá của 1 sản phẩm (có phân trang).

### GET `/reviews/by-buyer/:buyerId`

Tất cả đánh giá của 1 buyer.

---

## 3. `supplierReviewApi` — Đánh giá nhà cung cấp

> Mock: `supplierReviewApi` trong `/src/app/services/api.ts`

### GET `/supplier-reviews/by-supplier/:supplierId`

Tất cả đánh giá NCC.

**SupplierReview type:**
```typescript
interface SupplierReview {
  id: string;
  supplierId: string;
  buyerId: string;
  buyerName?: string;
  buyerCompany?: string;
  orderId?: string;
  overallRating: number;
  qualityRating?: number;
  deliveryRating?: number;
  communicationRating?: number;
  title?: string;
  content?: string;
  helpfulCount: number;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Bị ẩn';
  sellerReply?: string;
  sellerReplyAt?: string;
  tags?: string[];
  createdAt: string;
}
```

### POST `/supplier-reviews`

Tạo đánh giá NCC.

### POST `/supplier-reviews/:id/seller-reply`

NCC phản hồi đánh giá.

---

## 4. `promotionApi` — Khuyến mãi

> Mock: `promotionApi` trong `/src/app/services/api.ts`

### GET `/promotions`

Danh sách khuyến mãi.

**Query params:** `?supplierId&status&isActive&type&page&pageSize`

**Promotion type:**
```typescript
interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'Phần trăm' | 'Số tiền' | 'Mua X tặng Y';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  scope: 'all' | 'specificProducts' | 'specificCategories';
  supplierId?: string;
  productIds?: string[];
  categoryIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}
```

### POST `/promotions`

*Seller/Admin only.* Tạo khuyến mãi.

### PUT `/promotions/:id`

Cập nhật khuyến mãi.

### DELETE `/promotions/:id`

Xóa khuyến mãi.

### POST `/promotions/validate`

Kiểm tra mã khuyến mãi hợp lệ.

**Request Body:**
```json
{
  "code": "SUMMER20",
  "supplierId": "sup-001",
  "cartItems": [
    { "productId": "prod-001", "quantity": 2, "unitPrice": 35000000 }
  ],
  "subtotal": 70000000
}
```

**Response 200:**
```json
{
  "data": {
    "valid": true,
    "discountAmount": 14000000,
    "message": "Áp dụng mã giảm 20% thành công"
  }
}
```

### GET `/promotions/active-for-product/:productId`

Lấy khuyến mãi đang active cho 1 sản phẩm.

### `volumeDiscountApi`:

```
GET    /volume-discounts?productId=:id    — Danh sách giảm giá theo SL của sản phẩm
POST   /volume-discounts                  — Tạo mới
PUT    /volume-discounts/:id              — Cập nhật
DELETE /volume-discounts/:id              — Xóa
```

---

## 5. `approvalApi` — Phê duyệt nội bộ

> Mock: `approvalApi` trong `/src/app/services/api.ts`

### GET `/approvals`

Danh sách yêu cầu phê duyệt.

**Query params:** `?status&entityType&requestedBy&page&pageSize`

**ApprovalRequest type:**
```typescript
interface ApprovalRequest {
  id: string;
  requestNumber: string;
  entityType: 'Order' | 'PR' | 'Contract' | 'Budget' | 'Quotation';
  entityId: string;
  entityNumber?: string;
  amount?: number;
  requestedBy: string;
  requestedByName?: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã huỷ';
  dueDate?: string;
  steps: ApprovalStep[];
  notes?: string;
  rejectReason?: string;
  createdAt: string;
}
```

### GET `/approvals/:id`

Chi tiết yêu cầu phê duyệt kèm steps.

### POST `/approvals`

Tạo yêu cầu phê duyệt mới.

### PATCH `/approvals/:id/approve`

*Approver only.* Phê duyệt.

**Request Body:** `{ "note": "Đồng ý, ngân sách trong kế hoạch" }`

### PATCH `/approvals/:id/reject`

*Approver only.* Từ chối.

**Request Body:** `{ "reason": "Vượt ngân sách được phê duyệt" }`

### PATCH `/approvals/:id/escalate`

Chuyển lên cấp trên xử lý.

### GET `/approvals/by-approver/:userId`

Danh sách yêu cầu đang chờ user này duyệt.

### GET `/approvals/pending`

Tổng số yêu cầu đang chờ duyệt của current user.

### GET `/approvals/:id/history`

Lịch sử các bước phê duyệt.

---

## 6. `prApi` — Yêu cầu mua hàng (Purchase Requisition)

> Mock: `prApi` trong `/src/app/services/prApi.ts`

### GET `/purchase-requisitions`

Danh sách PR. Buyer thấy PR của mình, Admin thấy tất cả.

**Query params:** `?status&priority&buyerId&dateFrom&dateTo&page&pageSize`

**PRStatus values:**
```typescript
type PRStatus =
  | 'Bản nháp'
  | 'Chờ duyệt'
  | 'Đã duyệt'
  | 'Từ chối'
  | 'Đã tạo RFQ'
  | 'Đã đặt hàng'
  | 'Hoàn thành'
  | 'Đã huỷ';
```

### GET `/purchase-requisitions/:id`

Chi tiết PR kèm items.

### POST `/purchase-requisitions`

Tạo PR mới.

### PUT `/purchase-requisitions/:id`

Cập nhật PR (chỉ khi status = 'Bản nháp').

### PATCH `/purchase-requisitions/:id/submit`

Gửi PR để phê duyệt.

### PATCH `/purchase-requisitions/:id/approve`

*Approver only.* Phê duyệt PR.

### PATCH `/purchase-requisitions/:id/reject`

*Approver only.* Từ chối PR.

### POST `/purchase-requisitions/:id/link-to-order`

Liên kết PR với đơn hàng đã tạo.

**Request Body:** `{ "orderId": "ord-001" }`

### POST `/purchase-requisitions/:id/items`

Thêm item vào PR.

### DELETE `/purchase-requisitions/:id/items/:itemId`

Xóa item khỏi PR.

---

## 7. `grnApi` — Biên bản nhận hàng (GRN)

> Mock: `grnApi` trong `/src/app/services/grnApi.ts`

### GET `/grns`

Danh sách GRN.

**Query params:** `?status&orderId&supplierId&warehouseId&page&pageSize`

**GRNStatus values:**
```typescript
type GRNStatus = 'Chờ kiểm tra' | 'Đang kiểm tra' | 'Hoàn thành' | 'Có sự cố';
```

**GoodsReceivedNote type:**
```typescript
interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  orderId: string;
  orderNumber?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId?: string;
  receivedBy: string;
  receivedByName?: string;
  status: GRNStatus;
  totalOrdered: number;
  totalReceived: number;
  totalRejected: number;
  hasDiscrepancy: boolean;
  items: GRNItem[];
  images?: string[];
  notes?: string;
  confirmedAt?: string;
  createdAt: string;
}
```

### GET `/grns/:id`

Chi tiết GRN kèm items.

### POST `/grns`

Tạo GRN khi nhận hàng.

### PATCH `/grns/:id/confirm`

Xác nhận đã nhận hàng đầy đủ (tự động tạo StockMovement).

### PATCH `/grns/:id/report-issue`

Báo cáo sự cố nhận hàng.

**Request Body:** `{ "note": "Thiếu 5 đơn vị, 2 cái bị vỡ" }`

### POST `/grns/:id/link-to-return`

Tạo return request từ GRN bị lỗi.

### POST `/grns/:id/upload-image`

Upload ảnh biên bản nhận hàng.

---

## 8. `budgetApi` — Ngân sách

> Mock: `budgetApi` trong `/src/app/services/budgetApi.ts`

### GET `/budget-plans`

Danh sách kế hoạch ngân sách.

**BudgetPlan type:**
```typescript
interface BudgetPlan {
  id: string;
  buyerId: string;
  name: string;
  fiscalYear: number;
  period: 'Năm' | 'Quý' | 'Tháng';
  totalAmount: number;
  usedAmount: number;
  status: 'Bản nháp' | 'Đã duyệt' | 'Đang thực hiện' | 'Đã khoá';
  startDate: string;
  endDate: string;
  allocations?: BudgetAllocation[];
}

interface BudgetAllocation {
  id: string;
  planId: string;
  department?: string;
  categoryId?: string;
  categoryName?: string;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  alertThreshold: number;      // % cảnh báo
}
```

### POST `/budget-plans`

Tạo kế hoạch ngân sách mới.

### PUT `/budget-plans/:id`

Cập nhật kế hoạch.

### POST `/budget-plans/:id/allocations`

Thêm phân bổ ngân sách cho danh mục/phòng ban.

### PUT `/budget-allocations/:id`

Cập nhật phân bổ.

### DELETE `/budget-allocations/:id`

Xóa phân bổ.

### POST `/budget-allocations/:id/transactions`

Ghi nhận giao dịch chi tiêu ngân sách.

### POST `/budget-allocations/:id/check`

Kiểm tra ngân sách trước khi tạo PR/Order.

**Request Body:** `{ "amount": 5000000 }`

**Response:**
```json
{
  "data": {
    "approved": true,
    "remainingAfter": 45000000,
    "message": "Ngân sách đủ"
  }
}
```

---

## Tài liệu liên quan

- [11-api-spec-part3.md](./11-api-spec-part3.md) — API: Kho, Vận chuyển, Thanh toán
- [13-api-spec-part5.md](./13-api-spec-part5.md) — API: System, Loyalty, Integration, Report
- [07-database-schema-part4.md](./07-database-schema-part4.md) — Schema domain phụ trợ
- [15-business-rules-part2.md](./15-business-rules-part2.md) — Business rules: Sourcing & Procurement
