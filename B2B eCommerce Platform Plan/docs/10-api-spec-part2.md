# 10 — API Specification (Part 2): Đơn hàng, Giỏ hàng, RFQ, Hợp đồng

> Tiếp theo từ [09-api-spec-part1.md](./09-api-spec-part1.md).
> Conventions và format response xem file Part 1.

---

## 1. `orderApi` — Đơn hàng

> Mock: `orderApi` trong `/src/app/services/api.ts`

### GET `/orders`

Lấy danh sách đơn hàng phân trang. Tự động filter theo role:
- **Buyer**: chỉ thấy đơn của mình (`buyerId = auth.user.id`)
- **Seller**: chỉ thấy đơn gửi cho mình (`supplierId = auth.user.supplierId`)
- **Admin**: thấy tất cả

**Query params:**
```
?page&pageSize&search
&status=Chờ xác nhận           — Filter theo OrderStatus
&supplierId=uuid                — Admin: lọc theo NCC
&buyerId=uuid                   — Admin: lọc theo buyer
&orderType=Thường               — Thường | RFQ | Hợp đồng | Mẫu đơn
&dateFrom=2026-01-01
&dateTo=2026-12-31
&isUrgent=true
&sortField=createdAt&sortOrder=desc
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "ord-001",
      "orderNumber": "ORD-20260315-001",
      "buyerId": "user-001",
      "buyerName": "Nguyễn Văn A",
      "buyerCompany": "Công ty TNHH ABC",
      "supplierId": "sup-001",
      "supplierName": "Công ty TNHH Dell VN",
      "totalAmount": 35000000,
      "status": "Chờ xác nhận",
      "orderType": "Thường",
      "isUrgent": false,
      "itemCount": 2,
      "createdAt": "2026-03-15T08:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

**OrderStatus values:**
```typescript
type OrderStatus =
  | 'Chờ xác nhận'
  | 'Đã xác nhận'
  | 'Đang xử lý'
  | 'Đang giao hàng'
  | 'Đã giao'
  | 'Đã huỷ'
  | 'Hoàn trả';
```

### GET `/orders/:id`

Lấy chi tiết đơn hàng đầy đủ kèm items, lịch sử trạng thái.

**Response 200 (full Order object):**
```json
{
  "data": {
    "id": "ord-001",
    "orderNumber": "ORD-20260315-001",
    "items": [
      {
        "id": "item-001",
        "productId": "prod-001",
        "productName": "Laptop Dell XPS 15",
        "productImage": "https://...",
        "quantity": 2,
        "unitPrice": 35000000,
        "totalPrice": 70000000,
        "unit": "Cái"
      }
    ],
    "shippingAddress": {
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "address": "123 Nguyễn Huệ",
      "city": "Hồ Chí Minh"
    },
    "statusHistory": [...],
    "subtotal": 70000000,
    "shippingFee": 0,
    "tax": 7000000,
    "discountAmount": 0,
    "totalAmount": 77000000
  }
}
```

### POST `/orders`

Tạo đơn hàng mới (từ giỏ hàng hoặc direct).

**Request Body:**
```json
{
  "supplierId": "sup-001",
  "items": [
    {
      "productId": "prod-001",
      "variantId": null,
      "quantity": 2,
      "unitPrice": 35000000
    }
  ],
  "shippingAddressId": "addr-001",
  "paymentMethod": "Chuyển khoản",
  "notes": "Giao giờ hành chính",
  "isUrgent": false,
  "orderType": "Thường",
  "promotionCode": "SUMMER20"
}
```

**Response 201:** Full Order object.

### PUT `/orders/:id`

Cập nhật đơn hàng (chỉ khi status = 'Chờ xác nhận').

### PATCH `/orders/:id/status`

Thay đổi trạng thái đơn hàng.

**Request Body:** `{ "status": "Đã xác nhận", "note": "Xác nhận đơn" }`

**Validation:** Chỉ cho phép transitions hợp lệ theo state machine.

### PATCH `/orders/:id/cancel`

Hủy đơn hàng.

**Request Body:** `{ "reason": "Lý do hủy" }`

### GET `/orders/:id/status-history`

Lấy lịch sử thay đổi trạng thái.

### POST `/orders/:id/status-history`

Thêm ghi chú vào lịch sử trạng thái (manual).

---

## 2. `orderApi` — Buyer-specific endpoints

### GET `/buyer/dashboard/stats`

Thống kê tổng quan cho Buyer Dashboard.

**Response 200:**
```json
{
  "data": {
    "totalOrders": 45,
    "pendingOrders": 8,
    "totalSpent": 285000000,
    "activeContracts": 3,
    "pendingRFQs": 2,
    "activePRs": 1,
    "recentOrders": [...],
    "monthlySpend": [...]
  }
}
```

### POST `/orders/from-template`

Tạo đơn hàng nhanh từ mẫu.

**Request Body:** `{ "templateId": "tpl-001", "shippingAddressId": "addr-001" }`

---

## 3. `cartApi` — Giỏ hàng

> Mock: `cartApi` trong `/src/app/services/api.ts`
> State lưu trong `CartContext` (localStorage + memory)

### GET `/cart`

Lấy toàn bộ giỏ hàng của user đang đăng nhập.

**Response 200:**
```json
{
  "data": {
    "items": [
      {
        "id": "cart-001",
        "productId": "prod-001",
        "productName": "Laptop Dell XPS 15",
        "productImage": "https://...",
        "supplierName": "Công ty TNHH Dell VN",
        "quantity": 2,
        "unitPrice": 35000000,
        "totalPrice": 70000000,
        "savedForLater": false,
        "stock": 50,
        "minOrderQty": 1
      }
    ],
    "itemCount": 2,
    "subtotal": 70000000
  }
}
```

### GET `/cart/count`

Lấy số lượng items trong giỏ (kể cả saved for later).

**Response:** `{ "data": { "activeCount": 2, "savedCount": 1 } }`

### POST `/cart/items`

Thêm sản phẩm vào giỏ hàng.

**Request Body:**
```json
{
  "productId": "prod-001",
  "variantId": null,
  "quantity": 2,
  "supplierId": "sup-001"
}
```

**Validation:**
- `quantity >= product.minOrderQty`
- `quantity <= product.stock`
- Nếu đã có product trong giỏ → cộng dồn quantity

### PUT `/cart/items/:id`

Cập nhật số lượng.

**Request Body:** `{ "quantity": 3 }`

### DELETE `/cart/items/:id`

Xóa 1 item khỏi giỏ.

### PATCH `/cart/items/:id/save-for-later`

Chuyển item sang "Lưu để sau".

**Request Body:** `{ "savedForLater": true }`

### DELETE `/cart/clear`

Xóa toàn bộ giỏ hàng (sau khi đặt hàng).

---

## 4. `wishlistApi` — Danh sách yêu thích

> Mock: `wishlistApi` trong `/src/app/services/api.ts`
> State quản lý qua `WishlistContext`

### GET `/wishlist/folders`

Lấy tất cả folder và items.

**Response 200:** `WishlistFolder[]` với `items` lồng trong mỗi folder.

### POST `/wishlist/folders`

Tạo folder mới.

**Request Body:** `{ "name": "Thiết bị văn phòng", "description": "..." }`

### POST `/wishlist/items`

Thêm sản phẩm vào wishlist.

**Request Body:**
```json
{
  "productId": "prod-001",
  "folderId": "folder-001"   // Optional, null = thêm vào folder mặc định
}
```

### DELETE `/wishlist/items/:id`

Xóa item khỏi wishlist.

### PATCH `/wishlist/items/:id/move`

Chuyển item sang folder khác.

**Request Body:** `{ "folderId": "folder-002" }`

---

## 5. `orderTemplateApi` — Mẫu đơn hàng

> Mock: `orderTemplateApi` trong `/src/app/services/api.ts`

### GET `/order-templates`

Lấy danh sách mẫu đơn của user.

**Query params:** `?supplierId&category&search`

### POST `/order-templates`

Tạo mẫu đơn mới.

**Request Body:**
```json
{
  "name": "Đơn văn phòng phẩm tháng",
  "supplierId": "sup-001",
  "category": "Văn phòng phẩm",
  "items": [
    { "productId": "prod-010", "quantity": 10, "unitPrice": 50000 }
  ],
  "isDefault": false
}
```

### PUT `/order-templates/:id`

Cập nhật mẫu đơn.

### DELETE `/order-templates/:id`

Xóa mẫu đơn.

### POST `/order-templates/from-order`

Tạo mẫu từ đơn hàng đã đặt.

**Request Body:** `{ "orderId": "ord-001", "name": "Mẫu từ đơn 001" }`

### POST `/order-templates/:id/duplicate`

Nhân bản mẫu đơn.

---

## 6. `rfqApi` — Yêu cầu báo giá (RFQ)

> Mock: `rfqApi` trong `/src/app/services/api.ts`

### GET `/rfqs`

Danh sách RFQ phân trang. Filter theo role.

**Query params:** `?status&search&categoryId&priority&dateFrom&dateTo&page&pageSize`

**RFQStatus values:**
```typescript
type RFQStatus =
  | 'Bản nháp'
  | 'Đã gửi'
  | 'Đang báo giá'
  | 'Đã báo giá'
  | 'Chấp nhận'
  | 'Từ chối'
  | 'Hết hạn';
```

### GET `/rfqs/:id`

Chi tiết RFQ kèm items, attachments, quotations.

**RFQ type:**
```typescript
interface RFQ {
  id: string;
  rfqNumber: string;
  buyerId: string;
  buyerName: string;
  buyerCompany?: string;
  supplierId?: string;
  supplierName?: string;
  items: RFQItem[];
  status: RFQStatus;
  deliveryDate?: string;
  paymentTerms?: string;
  shippingTerms?: string;
  notes?: string;
  attachments?: RFQAttachment[];
  expiresAt?: string;
  categoryId?: string;
  priority?: 'Thường' | 'Gấp' | 'Rất gấp';
  responseCount: number;
  createdAt: string;
}
```

### POST `/rfqs`

Tạo RFQ mới (trạng thái 'Bản nháp').

**Request Body:**
```json
{
  "title": "Cần báo giá thiết bị văn phòng",
  "supplierId": "sup-001",        // Optional, null = gửi marketplace
  "categoryId": "cat-003",
  "items": [
    {
      "productName": "Bàn ghế văn phòng",
      "quantity": 50,
      "unit": "Bộ",
      "specifications": "Chất liệu gỗ MDF, màu trắng"
    }
  ],
  "deadline": "2026-04-15",
  "paymentTerms": "30 ngày",
  "notes": "Cần giao trước tháng 5"
}
```

### PUT `/rfqs/:id`

Cập nhật RFQ (chỉ khi status = 'Bản nháp').

### PATCH `/rfqs/:id/submit`

Gửi RFQ (Bản nháp → Đã gửi).

### POST `/rfqs/:id/items`

Thêm item vào RFQ.

### DELETE `/rfqs/:id/items/:itemId`

Xóa item khỏi RFQ.

---

## 7. `rfqAttachmentApi` — Đính kèm RFQ

> Mock: `rfqAttachmentApi` trong `/src/app/services/rfqAttachmentApi.ts`

### GET `/rfqs/:id/attachments`

Danh sách file đính kèm.

### POST `/rfqs/:id/attachments`

Upload file mới.

**Request Body:** `{ "fileName": "spec.pdf", "fileUrl": "https://...", "fileSize": 102400 }`

### DELETE `/rfq-attachments/:id`

Xóa file đính kèm.

---

## 8. `quotationApi` — Báo giá

> Mock: `quotationApi` trong `/src/app/services/api.ts`

### GET `/quotations?rfqId=:id`

Lấy tất cả báo giá cho 1 RFQ.

**QuotationStatus values:**
```typescript
type QuotationStatus = 'Chờ phản hồi' | 'Chấp nhận' | 'Từ chối';
```

### GET `/quotations/:id`

Chi tiết 1 báo giá.

**Quotation type:**
```typescript
interface Quotation {
  id: string;
  rfqId: string;
  rfqNumber?: string;
  supplierId: string;
  supplierName: string;
  items: QuotationItem[];
  totalAmount: number;
  validUntil?: string;
  paymentTerms?: string;
  deliveryDays?: number;
  notes?: string;
  status: QuotationStatus;
  warranty?: string;
  attachments?: string[];
  expiresAt?: string;
  createdAt: string;
}
```

### POST `/quotations`

*Seller only.* Tạo báo giá cho RFQ.

**Request Body:**
```json
{
  "rfqId": "rfq-001",
  "items": [
    {
      "productId": "prod-001",
      "productName": "Laptop Dell XPS 15",
      "quantity": 10,
      "unitPrice": 33000000,
      "unit": "Cái"
    }
  ],
  "validUntil": "2026-04-30",
  "paymentTerms": "30 ngày",
  "deliveryDays": 7,
  "notes": "Có sẵn hàng, giao trong 7 ngày"
}
```

### PATCH `/quotations/:id/submit`

Gửi báo giá (Seller action).

### PATCH `/quotations/:id/accept`

*Buyer only.* Chấp nhận báo giá → tự động tạo Contract.

### PATCH `/quotations/:id/reject`

*Buyer only.* Từ chối báo giá.

**Request Body:** `{ "reason": "Giá quá cao" }`

### GET `/quotations/compare?rfqId=:id`

So sánh nhiều báo giá cùng RFQ.

**Response 200:**
```json
{
  "data": {
    "rfqId": "rfq-001",
    "products": ["Laptop Dell XPS 15"],
    "comparison": [
      {
        "supplierId": "sup-001",
        "supplierName": "Dell VN",
        "totalAmount": 330000000,
        "deliveryDays": 7,
        "pricePerProduct": { "prod-001": 33000000 }
      }
    ]
  }
}
```

---

## 9. `contractApi` — Hợp đồng

> Mock: `contractApi` trong `/src/app/services/api.ts`

### GET `/contracts`

Danh sách hợp đồng phân trang. Filter theo role.

**Query params:** `?status&search&supplierId&buyerId&contractType&dateFrom&dateTo`

**ContractStatus values:**
```typescript
type ContractStatus =
  | 'Bản nháp'
  | 'Chờ ký'
  | 'Đang thực hiện'
  | 'Hoàn thành'
  | 'Đã huỷ'
  | 'Hết hạn'
  | 'Tranh chấp';
```

### GET `/contracts/:id`

Chi tiết hợp đồng kèm items, milestones, history.

**Contract type (đầy đủ):**
```typescript
interface Contract {
  id: string;
  contractNumber: string;
  rfqId?: string;
  quotationId?: string;
  buyerId: string;
  buyerName: string;
  buyerCompany?: string;
  supplierId: string;
  supplierName: string;
  items: ContractItem[];
  totalAmount: number;
  status: ContractStatus;
  contractType?: 'Mua bán' | 'Khung' | 'Dịch vụ';
  paymentTerms?: string;
  shippingTerms?: string;
  startDate: string;
  endDate: string;
  milestones: ContractMilestone[];
  signedByBuyer: boolean;
  signedBySeller: boolean;
  signedAt?: string;
  autoRenew: boolean;
  renewalDate?: string;
  createdAt: string;
}
```

### POST `/contracts`

Tạo hợp đồng mới (thường từ accepted quotation).

### PATCH `/contracts/:id/status`

Thay đổi trạng thái hợp đồng.

**Request Body:** `{ "status": "Đang thực hiện", "note": "Hai bên đã ký" }`

### POST `/contracts/:id/milestones`

Thêm milestone vào hợp đồng.

**Request Body:**
```json
{
  "title": "Giao lô hàng đầu tiên",
  "dueDate": "2026-04-30",
  "amount": 50000000
}
```

### PATCH `/milestones/:id/complete`

Đánh dấu milestone hoàn thành.

**Request Body:** `{ "note": "Đã nhận hàng và kiểm tra" }`

### POST `/contracts/:id/sign`

Ký hợp đồng (chỉ bên mình).

**Request Body:** `{ "role": "buyer" | "seller" }`

### POST `/contracts/:id/renew`

Gia hạn hợp đồng.

**Request Body:**
```json
{
  "newEndDate": "2027-12-31",
  "note": "Gia hạn thêm 1 năm theo thỏa thuận"
}
```

### GET `/contracts/:id/history`

Lấy lịch sử thay đổi hợp đồng.

---

## JSON Examples — Key Entities

### Order (tạo đơn hàng thành công)

```json
{
  "id": "ord-001",
  "orderNumber": "ORD-20260315-001",
  "buyerId": "user-001",
  "buyerName": "Nguyễn Văn A",
  "buyerCompany": "Công ty TNHH ABC",
  "supplierId": "sup-001",
  "supplierName": "Công ty TNHH Dell VN",
  "items": [
    {
      "id": "item-001",
      "productId": "prod-001",
      "productName": "Laptop Dell XPS 15",
      "quantity": 2,
      "unitPrice": 35000000,
      "totalPrice": 70000000,
      "unit": "Cái"
    }
  ],
  "subtotal": 70000000,
  "shippingFee": 0,
  "tax": 7000000,
  "discountAmount": 0,
  "totalAmount": 77000000,
  "status": "Chờ xác nhận",
  "orderType": "Thường",
  "paymentMethod": "Chuyển khoản",
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "address": "123 Nguyễn Huệ, Q.1, TP.HCM"
  },
  "isUrgent": false,
  "createdAt": "2026-03-15T08:00:00Z"
}
```

### CartItem (state trong CartContext)

```json
{
  "id": "cart-001",
  "productId": "prod-001",
  "productName": "Laptop Dell XPS 15",
  "productImage": "https://...",
  "supplierName": "Công ty TNHH Dell VN",
  "supplierId": "sup-001",
  "quantity": 2,
  "unitPrice": 35000000,
  "totalPrice": 70000000,
  "savedForLater": false,
  "stock": 50,
  "minOrderQty": 1
}
```

---

## Tài liệu liên quan

- [09-api-spec-part1.md](./09-api-spec-part1.md) — API: Auth, User, Product, Category
- [11-api-spec-part3.md](./11-api-spec-part3.md) — API: Kho, Vận chuyển, Thanh toán
- [05-database-schema-part2.md](./05-database-schema-part2.md) — Schema: Đơn hàng, RFQ, Hợp đồng
- [14-business-rules-part1.md](./14-business-rules-part1.md) — Business rules: Core Commerce
