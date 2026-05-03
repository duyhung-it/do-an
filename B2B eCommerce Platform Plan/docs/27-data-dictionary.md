# 27 — Data Dictionary

> Từ điển dữ liệu: định nghĩa chính xác từng field quan trọng, constraint, và business meaning.
> Bổ sung cho schema SQL tại [04-07-database-schema.md].

---

## 1. Shared Fields (Xuất hiện ở nhiều bảng)

| Field | Type | Constraint | Meaning |
|-------|------|------------|---------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier dùng UUID v4 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | UTC timestamp khi record tạo |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | UTC timestamp khi record cập nhật lần cuối |
| `is_active` | BOOLEAN | DEFAULT true | Soft enable/disable (không xóa record) |
| `notes` | TEXT | NULL | Ghi chú tự do, không có cấu trúc |
| `status` | VARCHAR | NOT NULL CHECK (…) | Trạng thái workflow — xem state machine |

### Denormalized fields (pattern nhất quán)

| Pattern | Ví dụ | Mục đích |
|---------|-------|---------|
| `*_name` | `buyer_name`, `supplier_name` | Snapshot tên tại thời điểm tạo record |
| `*_number` | `order_number`, `rfq_number` | Human-readable ID, unique, formatted |
| `*_id` FK + `*_name` | `product_id` + `product_name` | FK cho join, name cho display |

---

## 2. User & Auth Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `email` | `users` | VARCHAR(255) UNIQUE | Email dùng để đăng nhập, phải unique |
| `role` | `users` | VARCHAR(50) CHECK (IN 'Buyer','Seller','Admin') | Role chính, immutable sau khi set (Admin có thể đổi) |
| `company_id` | `users` | UUID NULL FK→buyer_companies | Buyer company mà user thuộc về |
| `supplier_id` | `users` | UUID NULL FK→suppliers | Supplier mà Seller user thuộc về |
| `status` | `users` | VARCHAR CHECK (Hoạt động, Tạm khóa, Chờ xác minh) | Hoạt động=có thể login |
| `avatar` | `users` | TEXT NULL | URL ảnh đại diện |
| `full_name` | `users` | VARCHAR(255) NOT NULL | Tên hiển thị (không phải legal name) |

---

## 3. Product Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `slug` | `products` | VARCHAR(255) UNIQUE | URL-friendly identifier, lowercase-dash |
| `price` | `products` | NUMERIC(18,2) | Giá bán hiện tại (VND, không có dấu phẩy) |
| `original_price` | `products` | NUMERIC(18,2) NULL | Giá gốc (để tính % giảm giá, strikethrough) |
| `stock` | `products` | INTEGER DEFAULT 0 | Tổng tồn kho (denormalized từ warehouse) |
| `min_order_qty` | `products` | INTEGER DEFAULT 1 | Số lượng tối thiểu phải mua |
| `unit` | `products` | VARCHAR(50) DEFAULT 'Cái' | Đơn vị tính: Cái, Hộp, Kg, Lít, Thùng... |
| `status` | `products` | VARCHAR CHECK (active, inactive, pending) | active=hiển thị trên catalog |
| `featured` | `products` | BOOLEAN DEFAULT false | Nổi bật trên trang chủ |
| `view_count` | `products` | INTEGER DEFAULT 0 | Số lần xem (atomic counter) |
| `sold_count` | `products` | INTEGER DEFAULT 0 | Số đã bán (cộng dồn từ orders) |
| `specifications` | `products` | JSONB NULL | `{"RAM": "16GB", "CPU": "Intel i7"}` |
| `warranty_months` | `products` | SMALLINT DEFAULT 0 | Tháng bảo hành; 0=không có |

---

## 4. Order Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `order_number` | `orders` | VARCHAR(50) UNIQUE | Format: `ORD-YYYYMMDD-NNN` (sequential per day) |
| `order_type` | `orders` | VARCHAR CHECK (Thường, RFQ, Hợp đồng, Mẫu đơn) | Nguồn tạo đơn hàng |
| `is_urgent` | `orders` | BOOLEAN DEFAULT false | Cờ ưu tiên xử lý — hiện badge đỏ |
| `subtotal` | `orders` | NUMERIC(18,2) | Sum(items.totalPrice) trước thuế và phí |
| `shipping_fee` | `orders` | NUMERIC(18,2) DEFAULT 0 | Phí vận chuyển |
| `tax` | `orders` | NUMERIC(18,2) DEFAULT 0 | Thuế VAT = subtotal × taxRate |
| `tax_rate` | `orders` | NUMERIC(5,2) DEFAULT 10 | % thuế áp dụng (lưu tại thời điểm đặt hàng) |
| `discount_amount` | `orders` | NUMERIC(18,2) DEFAULT 0 | Tổng giảm giá từ promotion code |
| `total_amount` | `orders` | NUMERIC(18,2) | = subtotal - discount + shipping + tax |
| `payment_method` | `orders` | VARCHAR NULL | Phương thức: Chuyển khoản, Tiền mặt, Tín dụng |
| `payment_status` | `orders` | VARCHAR | Denormalized từ payments.status |
| `shipping_address` | `orders` | JSONB | Snapshot địa chỉ giao hàng khi đặt |
| `billing_address` | `orders` | JSONB NULL | Địa chỉ hoá đơn (nếu khác) |
| `order_items` | (trong JSONB snapshot) | JSONB NULL | Không dùng; dùng bảng `order_items` riêng |

### order_items Fields

| Field | Type | Meaning |
|-------|------|---------|
| `quantity` | INTEGER CHECK (>0) | SL tại thời điểm đặt hàng |
| `unit_price` | NUMERIC(18,2) | Giá tại thời điểm đặt (snapshot) |
| `total_price` | GENERATED | `quantity × unit_price` (stored) |
| `discount_amount` | NUMERIC DEFAULT 0 | Giảm giá áp dụng cho dòng này |
| `source` | VARCHAR NULL | 'catalog', 'PriceAgreement', 'VolumeDiscount' |

---

## 5. Payment & Invoice Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `payment_number` | `payments` | VARCHAR UNIQUE | Format: `PAY-YYYYMMDD-NNN` |
| `amount` | `payments` | NUMERIC(18,2) | Tổng cần thanh toán |
| `paid_amount` | `payments` | NUMERIC(18,2) DEFAULT 0 | Đã thanh toán (tích lũy từ transactions) |
| `remaining_amount` | `payments` | GENERATED | `amount - paid_amount` |
| `due_date` | `payments` | DATE NULL | Hạn thanh toán |
| `is_overdue` | `payments` | BOOLEAN DEFAULT false | Set bởi cron job khi dueDate < TODAY |
| `late_fee` | `payments` | NUMERIC(18,2) DEFAULT 0 | Phí phát sinh khi trễ hạn |
| `late_fee_rate` | `payments` | NUMERIC(5,2) DEFAULT 1.5 | %/tháng phí trễ hạn |
| `reminder_count` | `payments` | INTEGER DEFAULT 0 | Số lần đã nhắc nhở |
| `invoice_number` | `invoices` | VARCHAR UNIQUE | Format: `INV-YYYYMMDD-NNN` |
| `tax_rate` | `invoices` | NUMERIC(5,2) DEFAULT 10 | % VAT |
| `tax_amount` | `invoices` | NUMERIC(18,2) | = subtotal × taxRate |
| `issue_date` | `invoices` | DATE DEFAULT TODAY | Ngày xuất hoá đơn |

---

## 6. Inventory & Warehouse Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `quantity` | `inventory_items` | INTEGER DEFAULT 0 | Tổng tồn kho (nhập - xuất - reserve) |
| `reserved_qty` | `inventory_items` | INTEGER DEFAULT 0 | Đã reserve cho đơn hàng chưa giao |
| `available_qty` | `inventory_items` | GENERATED | `quantity - reserved_qty` |
| `min_stock` | `inventory_items` | INTEGER DEFAULT 0 | Ngưỡng tối thiểu → trigger StockAlert |
| `max_stock` | `inventory_items` | INTEGER NULL | Ngưỡng tối đa (capacity) |
| `cost_price` | `inventory_items` | NUMERIC NULL | Giá nhập kho (internal, Seller only) |
| `batch_number` | `inventory_items` | VARCHAR NULL | Số lô hàng (traceability) |
| `expiry_date` | `inventory_items` | DATE NULL | Hạn sử dụng (thực phẩm, dược phẩm) |
| `location` | `inventory_items` | VARCHAR NULL | Vị trí kệ trong kho: "A-01-03" |

### StockMovement Fields

| Field | Type | Meaning |
|-------|------|---------|
| `type` | VARCHAR CHECK | Nhập kho / Xuất kho / Chuyển kho / Điều chỉnh / Huỷ |
| `quantity` | INTEGER NOT NULL | Số lượng tuyệt đối (luôn dương) |
| `quantity_before` | INTEGER | Tồn kho trước khi movement |
| `quantity_after` | INTEGER | Tồn kho sau khi movement |
| `reference_type` | VARCHAR NULL | 'Order', 'GRN', 'Transfer', 'Manual' |

---

## 7. Shipment Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `tracking_number` | `shipments` | VARCHAR UNIQUE | Mã vận đơn của carrier |
| `carrier` | `shipments` | VARCHAR | GHTK / GHN / Vietnam Post / Viettel Post |
| `status` | `shipments` | VARCHAR | Chờ lấy hàng → Đã giao (xem state machine) |
| `estimated_date` | `shipments` | TIMESTAMPTZ NULL | Dự kiến giao hàng (seller set) |
| `actual_date` | `shipments` | TIMESTAMPTZ NULL | Ngày giao thực tế |
| `cod_amount` | `shipments` | NUMERIC DEFAULT 0 | Tiền thu hộ (COD = 0 nếu đã trả trước) |
| `weight` | `shipments` | NUMERIC NULL | kg, dùng tính phí vận chuyển |

---

## 8. Contract & RFQ Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `rfq_number` | `rfqs` | VARCHAR UNIQUE | Format: `RFQ-YYYYMMDD-NNN` |
| `expires_at` | `rfqs` | TIMESTAMPTZ NULL | Hạn nhận báo giá |
| `priority` | `rfqs` | VARCHAR CHECK (Thường, Gấp, Rất gấp) | Màu badge và sort order |
| `contract_number` | `contracts` | VARCHAR UNIQUE | Format: `CON-YYYYMMDD-NNN` |
| `signed_by_buyer` | `contracts` | BOOLEAN DEFAULT false | Buyer đã ký |
| `signed_by_seller` | `contracts` | BOOLEAN DEFAULT false | Seller đã ký |
| `auto_renew` | `contracts` | BOOLEAN DEFAULT false | Tự động gia hạn trước 30 ngày |
| `renewal_date` | `contracts` | DATE NULL | Ngày gia hạn gần nhất |

---

## 9. Review & Promotion Fields

| Field | Table | Type | Meaning |
|-------|-------|------|---------|
| `rating` | `product_reviews` | SMALLINT CHECK (1..5) | Số sao (1=tệ, 5=xuất sắc) |
| `is_verified` | `product_reviews` | BOOLEAN DEFAULT false | Buyer đã mua sản phẩm này |
| `is_anonymous` | `product_reviews` | BOOLEAN DEFAULT false | Ẩn tên buyer |
| `helpful_count` | `product_reviews` | INTEGER DEFAULT 0 | Số người thấy hữu ích |
| `report_count` | `product_reviews` | INTEGER DEFAULT 0 | Số lần bị báo cáo vi phạm |
| `code` | `promotions` | VARCHAR(50) UNIQUE | Mã khuyến mãi (không phân biệt hoa thường) |
| `scope` | `promotions` | VARCHAR CHECK (all, specificProducts, specificCategories) | Phạm vi áp dụng |
| `usage_limit` | `promotions` | INTEGER NULL | NULL = không giới hạn số lần dùng |
| `used_count` | `promotions` | INTEGER DEFAULT 0 | Atomic counter, tăng khi order confirmed |
| `max_discount` | `promotions` | NUMERIC NULL | Cap cho promotion type "Phần trăm" |

---

## 10. Number Formats (human-readable IDs)

| Entity | Format | Example |
|--------|--------|---------|
| Order | `ORD-YYYYMMDD-NNN` | `ORD-20260315-001` |
| RFQ | `RFQ-YYYYMMDD-NNN` | `RFQ-20260315-001` |
| Quotation | `QUO-YYYYMMDD-NNN` | `QUO-20260315-001` |
| Contract | `CON-YYYYMMDD-NNN` | `CON-20260315-001` |
| Payment | `PAY-YYYYMMDD-NNN` | `PAY-20260315-001` |
| Invoice | `INV-YYYYMMDD-NNN` | `INV-20260315-001` |
| Return | `RET-YYYYMMDD-NNN` | `RET-20260315-001` |
| Shipment | Từ carrier | `GHN-123456789VN` |
| GRN | `GRN-YYYYMMDD-NNN` | `GRN-20260315-001` |
| PR | `PR-YYYYMMDD-NNN` | `PR-20260315-001` |
| Approval | `APR-YYYYMMDD-NNN` | `APR-20260315-001` |
| Budget Plan | `BUD-YYYY-NNN` | `BUD-2026-001` |
| DebitCreditNote | `DCN-YYYYMMDD-NNN` | `DCN-20260315-001` |
| Auction | `AUC-YYYYMMDD-NNN` | `AUC-20260315-001` |

### Generation logic

```typescript
// Pattern đơn giản (mock service layer):
function generateNumber(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${prefix}-${date}-${seq}`;
}

// Production (Supabase): dùng sequence hoặc trigger để đảm bảo unique
```

---

## 11. JSONB Field Schemas

### `orders.shipping_address`

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Nguyễn Huệ",
  "city": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "postalCode": "70000"
}
```

### `products.specifications`

```json
{
  "CPU": "Intel Core i7-13700H",
  "RAM": "16GB DDR5",
  "Storage": "512GB NVMe SSD",
  "Display": "15.6 inch OLED 2.8K",
  "Battery": "86Wh",
  "OS": "Windows 11 Home",
  "Weight": "1.86kg"
}
```

### `staff_members.permissions`

```json
["product.view", "order.view", "order.status_change", "inventory.view"]
```

### `activity_logs.changes`

```json
{
  "status": ["Chờ xác nhận", "Đã xác nhận"],
  "total_amount": [70000000, 77000000]
}
```

### `system_configs.value` (khi type='json')

```json
{ "primary": "#2563eb", "secondary": "#64748b" }
```

---

## 12. Conventions cho NULL vs Empty String

| Trường hợp | Dùng |
|-----------|------|
| Trường optional chưa có giá trị | `NULL` (không dùng `""`) |
| Text không áp dụng | `NULL` |
| Số không áp dụng | `NULL` (không dùng `0`) |
| Boolean mặc định | `FALSE` (không dùng `NULL`) |
| Array/JSON empty | `[]` hoặc `{}` (không dùng `NULL`) |
| Ngày không áp dụng | `NULL` |

---

## Tài liệu liên quan

- [04-database-schema-part1.md](./04-database-schema-part1.md) — Schema định nghĩa đầy đủ
- [17-state-machines.md](./17-state-machines.md) — Status values
- [03-coding-conventions.md](./03-coding-conventions.md) — Naming conventions
