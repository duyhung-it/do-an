# 11 — API Specification (Part 3): Kho hàng, Vận chuyển, Thanh toán, Hoá đơn

> Tiếp theo từ [10-api-spec-part2.md](./10-api-spec-part2.md).
> Conventions và format response xem [09-api-spec-part1.md](./09-api-spec-part1.md).

---

## 1. `warehouseApi` — Kho hàng

> Mock: `warehouseApi` trong `/src/app/services/api.ts`

### GET `/warehouses`

*Seller only.* Lấy danh sách kho của supplier.

**Query params:** `?search&city&isActive&page&pageSize`

**Warehouse type:**
```typescript
interface Warehouse {
  id: string;
  supplierId: string;
  name: string;
  code?: string;
  address: string;
  city: string;
  manager?: string;
  phone?: string;
  capacity?: number;
  currentStock: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}
```

### GET `/warehouses/:id`

Chi tiết kho kèm tổng tồn kho.

### POST `/warehouses`

*Seller only.* Tạo kho mới.

**Request Body:**
```json
{
  "name": "Kho Bình Dương",
  "code": "WH-BD-01",
  "address": "456 Đường số 8, KCN VSIP",
  "city": "Bình Dương",
  "manager": "Trần Văn Kho",
  "phone": "0987654321",
  "capacity": 5000
}
```

### PUT `/warehouses/:id`

Cập nhật thông tin kho.

### DELETE `/warehouses/:id`

Xóa kho (chỉ được khi không có tồn kho).

### GET `/warehouses/:id/inventory`

Lấy tồn kho của 1 kho cụ thể (phân trang).

**Query params:** `?search&categoryId&lowStock=true&page&pageSize`

---

## 2. `inventoryApi` — Tồn kho

> Mock: `inventoryApi` trong `/src/app/services/api.ts`

### GET `/inventory`

Lấy tổng hợp tồn kho toàn bộ kho của supplier.

**Query params:**
```
?warehouseId=uuid
&search=laptop
&categoryId=uuid
&lowStock=true      — Chỉ hiện hàng sắp hết
&expiryBefore=2026-06-30
&page&pageSize
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "inv-001",
      "warehouseId": "wh-001",
      "warehouseName": "Kho Hà Nội",
      "productId": "prod-001",
      "productName": "Laptop Dell XPS 15",
      "productImage": "https://...",
      "categoryName": "Laptop",
      "sku": "DELL-XPS15-001",
      "quantity": 25,
      "minStock": 10,
      "maxStock": 100,
      "reservedQty": 3,
      "availableQty": 22,
      "costPrice": 30000000,
      "location": "A-01-03",
      "batchNumber": "BATCH-2026Q1",
      "expiryDate": null,
      "lastRestocked": "2026-03-01T00:00:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20
}
```

### GET `/inventory/summary`

Tổng hợp thống kê tồn kho.

**Response 200:**
```json
{
  "data": {
    "totalProducts": 156,
    "totalValue": 850000000,
    "lowStockCount": 12,
    "outOfStockCount": 3,
    "expiringSoonCount": 5,
    "warehouses": [
      { "id": "wh-001", "name": "Kho HN", "itemCount": 80 }
    ]
  }
}
```

### PATCH `/inventory/:id/adjust`

Điều chỉnh tồn kho thủ công.

**Request Body:**
```json
{
  "quantity": 30,
  "reason": "Kiểm kê thực tế",
  "note": "Đếm lại sau kiểm kê Q1"
}
```

---

## 3. `stockMovementApi` — Lịch sử xuất nhập kho

> Mock: `stockMovementApi` trong `/src/app/services/api.ts`

### GET `/stock-movements`

Lấy lịch sử xuất nhập kho.

**Query params:**
```
?warehouseId&productId&type&dateFrom&dateTo
&referenceType=Order
&page&pageSize
```

**StockMovement type:**
```typescript
interface StockMovement {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  productId: string;
  productName: string;
  sku?: string;
  type: 'Nhập kho' | 'Xuất kho' | 'Chuyển kho' | 'Điều chỉnh' | 'Huỷ';
  quantity: number;          // Dương=nhập, Âm=xuất
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: string;    // 'Order', 'GRN', 'Transfer', 'Manual'
  referenceId?: string;
  referenceNumber?: string;
  note?: string;
  performedBy: string;
  performedByName?: string;
  createdAt: string;
}
```

### POST `/stock-movements`

Tạo movement thủ công (nhập kho, điều chỉnh).

**Request Body:**
```json
{
  "warehouseId": "wh-001",
  "productId": "prod-001",
  "type": "Nhập kho",
  "quantity": 50,
  "costPrice": 30000000,
  "batchNumber": "BATCH-2026Q2",
  "note": "Nhập hàng từ nhà sản xuất"
}
```

---

## 4. `stockAlertApi` — Cảnh báo tồn kho

> Mock: `stockAlertApi` trong `/src/app/services/api.ts`

### GET `/stock-alerts`

Danh sách cảnh báo tồn kho.

**Query params:** `?status&alertType&supplierId&warehouseId&page&pageSize`

**StockAlert type:**
```typescript
interface StockAlert {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  productId: string;
  productName?: string;
  alertType: 'Sắp hết hàng' | 'Hết hàng' | 'Sắp hết hạn' | 'Hết hạn';
  severity: 'Thông tin' | 'Cảnh báo' | 'Nghiêm trọng';
  currentStock: number;
  minStock: number;
  status: 'Chưa xử lý' | 'Đang xử lý' | 'Đã xử lý' | 'Bỏ qua';
  createdAt: string;
}
```

### PATCH `/stock-alerts/:id/acknowledge`

Xác nhận đã biết cảnh báo.

### PATCH `/stock-alerts/:id/resolve`

Đánh dấu đã xử lý cảnh báo.

**Request Body:** `{ "note": "Đã nhập thêm 50 đơn vị" }`

---

## 5. `warehouseTransferApi` — Chuyển kho

> Mock: `warehouseTransferApi` trong `/src/app/services/warehouseTransferApi.ts`

### GET `/warehouse-transfers`

Danh sách yêu cầu chuyển kho.

**Query params:** `?status&fromWarehouseId&toWarehouseId&page&pageSize`

**WarehouseTransfer type:**
```typescript
interface WarehouseTransfer {
  id: string;
  transferNumber: string;
  supplierId: string;
  fromWarehouseId: string;
  fromWarehouse?: string;
  toWarehouseId: string;
  toWarehouse?: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Đang vận chuyển' | 'Đã nhận' | 'Huỷ';
  totalItems: number;
  items: WarehouseTransferItem[];
  requestedBy: string;
  approvedBy?: string;
  reason?: string;
  expectedDate?: string;
  shippedAt?: string;
  receivedAt?: string;
  createdAt: string;
}
```

### GET `/warehouse-transfers/:id`

Chi tiết yêu cầu chuyển kho.

### POST `/warehouse-transfers`

Tạo yêu cầu chuyển kho mới.

### PATCH `/warehouse-transfers/:id/approve`

*Manager only.* Duyệt yêu cầu.

### PATCH `/warehouse-transfers/:id/ship`

Xác nhận đã giao hàng vận chuyển.

### PATCH `/warehouse-transfers/:id/receive`

Xác nhận đã nhận hàng (tự động tạo StockMovement).

### GET `/warehouse-transfers/:id/items`

Danh sách items trong transfer.

### POST `/warehouse-transfers/:id/items`

Thêm item vào transfer.

---

## 6. `shipmentApi` — Vận chuyển

> Mock: `shipmentApi` trong `/src/app/services/api.ts`

### GET `/shipments`

Danh sách shipments phân trang.

**Query params:** `?status&carrierId&orderId&supplierId&dateFrom&dateTo&page&pageSize`

**Shipment type:**
```typescript
interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  orderNumber?: string;
  supplierId: string;
  carrier: string;
  status: 'Chờ lấy hàng' | 'Đã lấy hàng' | 'Đang vận chuyển' |
          'Đang giao' | 'Đã giao' | 'Giao thất bại' | 'Đã trả về';
  fromAddress: string;
  toAddress: string;
  pickupDate?: string;
  estimatedDate?: string;
  actualDate?: string;
  weight?: number;
  shippingCost: number;
  codAmount: number;
  events?: ShipmentEvent[];
  createdAt: string;
}

interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: string;
  location?: string;
  description?: string;
  source: 'System' | 'Carrier' | 'Manual';
  createdAt: string;
}
```

### GET `/shipments/:id`

Chi tiết shipment kèm events (tracking log).

### POST `/shipments`

Tạo shipment mới cho đơn hàng.

**Request Body:**
```json
{
  "orderId": "ord-001",
  "carrier": "GHTK",
  "fromAddress": "456 Đường số 8, KCN VSIP, Bình Dương",
  "toAddress": "123 Nguyễn Huệ, Q.1, TP.HCM",
  "weight": 2.5,
  "estimatedDate": "2026-03-20",
  "shippingCost": 35000,
  "codAmount": 0
}
```

### PATCH `/shipments/:id/status`

Cập nhật trạng thái shipment (tự động tạo event).

**Request Body:**
```json
{
  "status": "Đang vận chuyển",
  "location": "Bưu cục Bình Dương",
  "description": "Kiện hàng đã được nhận bởi GHTK"
}
```

### GET `/shipments/:id/events`

Lấy danh sách tracking events.

### GET `/shipments/by-order/:orderId`

Lấy tất cả shipments của 1 đơn hàng.

---

## 7. `shippingRateApi` — Bảng giá vận chuyển

> Mock: `shippingRateApi` trong `/src/app/services/api.ts`

### GET `/shipping-rates`

Lấy bảng giá vận chuyển của supplier.

### POST `/shipping-rates`

Tạo bảng giá mới.

### PUT `/shipping-rates/:id`

Cập nhật bảng giá.

### POST `/shipping-rates/calculate`

Tính phí vận chuyển cho 1 đơn hàng.

**Request Body:**
```json
{
  "supplierId": "sup-001",
  "originCity": "Bình Dương",
  "destCity": "Hà Nội",
  "weight": 5.2,
  "carrier": "GHTK"
}
```

**Response:** `{ "data": { "shippingFee": 75000, "estimatedDays": 3 } }`

---

## 8. `paymentApi` — Thanh toán

> Mock: `paymentApi` trong `/src/app/services/api.ts`

### GET `/payments`

Danh sách thanh toán phân trang. Filter theo role.

**Query params:** `?status&buyerId&supplierId&isOverdue&dateFrom&dateTo&page&pageSize`

**PaymentStatus values:**
```typescript
type PaymentStatus =
  | 'Chờ thanh toán'
  | 'Thanh toán một phần'
  | 'Đã thanh toán'
  | 'Quá hạn'
  | 'Hoàn tiền'
  | 'Đã huỷ';
```

**Payment type:**
```typescript
interface Payment {
  id: string;
  paymentNumber: string;
  orderId: string;
  orderNumber?: string;
  buyerId: string;
  buyerName?: string;
  supplierId: string;
  supplierName?: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentTerms?: string;
  dueDate?: string;
  invoiceId?: string;
  lateFee: number;
  lateFeeRate: number;
  isOverdue: boolean;
  reminderCount: number;
  notes?: string;
  createdAt: string;
}
```

### GET `/payments/:id`

Chi tiết thanh toán kèm transactions.

### POST `/payments`

Tạo payment record cho đơn hàng.

### POST `/payments/:id/transactions`

Ghi nhận giao dịch thanh toán mới.

**Request Body:**
```json
{
  "amount": 35000000,
  "type": "Thanh toán",
  "method": "Chuyển khoản",
  "referenceCode": "CK2026031500001",
  "note": "Chuyển khoản qua VCB"
}
```

### POST `/payments/:id/reminder`

Gửi nhắc nhở thanh toán cho buyer.

**Request Body:** `{ "channel": "email", "message": "..." }`

### GET `/payments/:id/late-fee`

Tính phí trễ hạn hiện tại.

**Response:** `{ "data": { "daysOverdue": 5, "lateFee": 175000 } }`

---

## 9. `invoiceApi` — Hoá đơn

> Mock: `invoiceSellerApi` và `invoiceBuyerApi` trong `/src/app/services/api.ts`

### GET `/invoices`

Danh sách hoá đơn. Filter theo role (seller xem hoá đơn mình xuất, buyer xem hoá đơn nhận).

**Query params:** `?status&invoiceType&buyerId&sellerId&dateFrom&dateTo&isOverdue&page&pageSize`

**InvoiceStatus values:**
```typescript
type InvoiceStatus = 'Bản nháp' | 'Đã gửi' | 'Đã thanh toán' | 'Quá hạn' | 'Đã huỷ';
```

**Invoice type:**
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  orderNumber?: string;
  sellerId: string;
  sellerName: string;
  sellerTaxId?: string;
  buyerId: string;
  buyerName: string;
  buyerCompany?: string;
  buyerTaxId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: InvoiceStatus;
  invoiceType: 'Ban_hang' | 'Tra_hang' | 'Dieu_chinh';
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  reminderCount: number;
  notes?: string;
  createdAt: string;
}
```

### GET `/invoices/:id`

Chi tiết hoá đơn kèm items.

### POST `/invoices`

*Seller only.* Tạo hoá đơn mới.

**Request Body:**
```json
{
  "orderId": "ord-001",
  "buyerId": "user-001",
  "items": [
    {
      "productName": "Laptop Dell XPS 15",
      "quantity": 2,
      "unitPrice": 35000000,
      "taxRate": 10
    }
  ],
  "taxRate": 10,
  "discount": 0,
  "dueDate": "2026-04-15",
  "notes": "Thanh toán trong 30 ngày"
}
```

### PUT `/invoices/:id`

Cập nhật hoá đơn (chỉ khi status = 'Bản nháp').

### POST `/invoices/:id/send`

Gửi hoá đơn cho buyer (Bản nháp → Đã gửi).

### POST `/invoices/bulk-reminder`

Gửi nhắc nợ cho tất cả hoá đơn quá hạn.

### GET `/invoices/overdue`

Lấy danh sách hoá đơn quá hạn.

---

## 10. `creditApi` — Hạn mức tín dụng

> Mock: `creditApi` trong `/src/app/services/api.ts`

### GET `/credit-limits`

Danh sách hạn mức tín dụng của supplier.

**CreditLimit type:**
```typescript
interface CreditLimit {
  id: string;
  buyerId: string;
  buyerName?: string;
  supplierId: string;
  creditLimit: number;
  usedAmount: number;
  availableAmount: number;
  currency: string;
  status: 'Hoạt động' | 'Tạm khóa' | 'Đã huỷ';
  dueDays: number;
  validUntil?: string;
}
```

### POST `/credit-limits`

Tạo hạn mức tín dụng mới cho 1 buyer.

### PATCH `/credit-limits/:id/adjust`

Điều chỉnh hạn mức tín dụng.

**Request Body:** `{ "creditLimit": 100000000, "reason": "Nâng hạn mức theo yêu cầu" }`

### GET `/credit-limits/:id/transactions`

Lịch sử biến động tín dụng.

---

## 11. `debitCreditApi` — Ghi nợ / Ghi có

> Mock: `debitCreditApi` trong `/src/app/services/debitCreditApi.ts`

### GET `/debit-credit-notes`

Danh sách ghi nợ/ghi có.

**Query params:** `?type=Debit|Credit&status&buyerId&sellerId&page&pageSize`

**DebitCreditNote type:**
```typescript
interface DebitCreditNote {
  id: string;
  noteNumber: string;
  type: 'Debit' | 'Credit';
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  orderId?: string;
  orderNumber?: string;
  invoiceId?: string;
  amount: number;
  reason: string;
  status: 'Chờ xác nhận' | 'Đã xác nhận (Buyer)' | 'Đã xác nhận' | 'Từ chối' | 'Đã huỷ';
  confirmedByBuyer: boolean;
  confirmedBySeller: boolean;
  createdAt: string;
}
```

### GET `/debit-credit-notes/:id`

Chi tiết note kèm items.

### POST `/debit-credit-notes`

Tạo note mới.

### PATCH `/debit-credit-notes/:id/confirm-seller`

*Seller* xác nhận note.

### PATCH `/debit-credit-notes/:id/confirm-buyer`

*Buyer* xác nhận note → status thành 'Đã xác nhận'.

---

## Tài liệu liên quan

- [10-api-spec-part2.md](./10-api-spec-part2.md) — API: Đơn hàng, Giỏ hàng, RFQ, Hợp đồng
- [12-api-spec-part4.md](./12-api-spec-part4.md) — API: Trả hàng, Review, KM, Phê duyệt
- [06-database-schema-part3.md](./06-database-schema-part3.md) — Schema: Kho, Vận chuyển, Tài chính
- [14-business-rules-part1.md](./14-business-rules-part1.md) — Business rules: Core Commerce
