# 08 — Entity Relationship Diagrams (ERD)

> Sơ đồ quan hệ thực thể cho toàn bộ hệ thống B2B eCommerce.
> Chia theo domain để dễ đọc; ERD tổng thể ở phần cuối.

---

## 1. Domain: Người dùng (User)

```mermaid
erDiagram
  users {
    uuid id PK
    varchar email UK
    varchar role
    uuid company_id FK
    uuid supplier_id FK
    varchar status
    timestamptz created_at
  }
  shipping_addresses {
    uuid id PK
    uuid user_id FK
    varchar label
    boolean is_default
  }
  notification_preferences {
    uuid id PK
    uuid user_id FK
    varchar type
    varchar channel
    boolean enabled
  }
  buyer_companies {
    uuid id PK
    uuid owner_id FK
    varchar company_name
    boolean is_verified
  }
  buyer_team_members {
    uuid id PK
    uuid company_id FK
    uuid user_id FK
    varchar role
  }

  users ||--o{ shipping_addresses : "có"
  users ||--o{ notification_preferences : "cấu hình"
  users ||--o| buyer_companies : "sở hữu"
  buyer_companies ||--o{ buyer_team_members : "có thành viên"
  users ||--o{ buyer_team_members : "tham gia"
```

---

## 2. Domain: Sản phẩm & Danh mục

```mermaid
erDiagram
  categories {
    uuid id PK
    uuid parent_id FK
    varchar name
    varchar slug UK
    smallint level
  }
  products {
    uuid id PK
    uuid category_id FK
    uuid supplier_id FK
    varchar name
    varchar slug UK
    numeric price
    integer stock
    varchar status
  }
  product_variants {
    uuid id PK
    uuid product_id FK
    varchar sku UK
    numeric price
    integer stock
  }
  product_images {
    uuid id PK
    uuid product_id FK
    text url
    boolean is_primary
  }
  suppliers {
    uuid id PK
    varchar company_name
    boolean is_verified
    numeric rating
  }
  supplier_categories {
    uuid supplier_id FK
    uuid category_id FK
  }

  categories ||--o{ categories : "con của"
  categories ||--o{ products : "chứa"
  suppliers ||--o{ products : "cung cấp"
  products ||--o{ product_variants : "có biến thể"
  products ||--o{ product_images : "có ảnh"
  suppliers }o--o{ categories : "supplier_categories"
```

---

## 3. Domain: Đơn hàng

```mermaid
erDiagram
  orders {
    uuid id PK
    varchar order_number UK
    uuid buyer_id FK
    uuid supplier_id FK
    varchar status
    numeric total_amount
    uuid rfq_id FK
    uuid contract_id FK
    uuid template_id FK
  }
  order_items {
    uuid id PK
    uuid order_id FK
    uuid product_id FK
    integer quantity
    numeric unit_price
  }
  order_status_history {
    uuid id PK
    uuid order_id FK
    varchar from_status
    varchar to_status
    uuid changed_by FK
  }
  order_templates {
    uuid id PK
    uuid user_id FK
    uuid supplier_id FK
    varchar name
    boolean is_default
  }
  order_template_items {
    uuid id PK
    uuid template_id FK
    uuid product_id FK
    integer quantity
  }
  cart_items {
    uuid id PK
    uuid user_id FK
    uuid product_id FK
    integer quantity
    boolean saved_for_later
  }
  wishlist_folders {
    uuid id PK
    uuid user_id FK
    varchar name
  }
  wishlist_items {
    uuid id PK
    uuid user_id FK
    uuid folder_id FK
    uuid product_id FK
  }

  orders ||--o{ order_items : "chứa"
  orders ||--o{ order_status_history : "lịch sử"
  order_templates ||--o{ order_template_items : "chứa"
  users ||--o{ cart_items : "giỏ hàng"
  users ||--o{ wishlist_folders : "yêu thích"
  wishlist_folders ||--o{ wishlist_items : "chứa"
```

---

## 4. Domain: Mua sắm (Sourcing)

```mermaid
erDiagram
  rfqs {
    uuid id PK
    varchar rfq_number UK
    uuid buyer_id FK
    uuid supplier_id FK
    varchar status
    timestamptz expires_at
  }
  rfq_items {
    uuid id PK
    uuid rfq_id FK
    varchar product_name
    integer quantity
  }
  rfq_attachments {
    uuid id PK
    uuid rfq_id FK
    varchar file_name
    text file_url
  }
  quotations {
    uuid id PK
    uuid rfq_id FK
    uuid supplier_id FK
    varchar status
    numeric total_amount
  }
  quotation_items {
    uuid id PK
    uuid quotation_id FK
    uuid product_id FK
    numeric unit_price
  }
  contracts {
    uuid id PK
    varchar contract_number UK
    uuid rfq_id FK
    uuid quotation_id FK
    uuid buyer_id FK
    uuid supplier_id FK
    varchar status
    date end_date
  }
  contract_items {
    uuid id PK
    uuid contract_id FK
    uuid product_id FK
    integer quantity
  }
  contract_milestones {
    uuid id PK
    uuid contract_id FK
    varchar status
    date due_date
  }
  contract_history {
    uuid id PK
    uuid contract_id FK
    varchar action
    uuid changed_by FK
  }

  rfqs ||--o{ rfq_items : "chứa"
  rfqs ||--o{ rfq_attachments : "đính kèm"
  rfqs ||--o{ quotations : "nhận báo giá"
  quotations ||--o{ quotation_items : "chứa"
  quotations ||--o| contracts : "tạo hợp đồng"
  contracts ||--o{ contract_items : "chứa"
  contracts ||--o{ contract_milestones : "theo dõi"
  contracts ||--o{ contract_history : "lịch sử"
```

---

## 5. Domain: Kho hàng

```mermaid
erDiagram
  warehouses {
    uuid id PK
    uuid supplier_id FK
    varchar name
    varchar city
    boolean is_active
  }
  inventory_items {
    uuid id PK
    uuid warehouse_id FK
    uuid product_id FK
    uuid variant_id FK
    integer quantity
    integer min_stock
    integer reserved_qty
  }
  stock_movements {
    uuid id PK
    uuid warehouse_id FK
    uuid product_id FK
    varchar type
    integer quantity
    uuid performed_by FK
  }
  stock_alerts {
    uuid id PK
    uuid warehouse_id FK
    uuid product_id FK
    varchar alert_type
    varchar status
  }
  warehouse_transfers {
    uuid id PK
    varchar transfer_number UK
    uuid from_warehouse_id FK
    uuid to_warehouse_id FK
    varchar status
  }
  warehouse_transfer_items {
    uuid id PK
    uuid transfer_id FK
    uuid product_id FK
    integer quantity
    integer received_qty
  }

  suppliers ||--o{ warehouses : "quản lý"
  warehouses ||--o{ inventory_items : "lưu trữ"
  warehouses ||--o{ stock_movements : "ghi nhận"
  warehouses ||--o{ stock_alerts : "cảnh báo"
  warehouses ||--o{ warehouse_transfers : "xuất từ"
  warehouses ||--o{ warehouse_transfers : "nhập vào"
  warehouse_transfers ||--o{ warehouse_transfer_items : "chứa"
```

---

## 6. Domain: Vận chuyển

```mermaid
erDiagram
  shipments {
    uuid id PK
    varchar tracking_number UK
    uuid order_id FK
    uuid supplier_id FK
    varchar carrier
    varchar status
    timestamptz estimated_date
  }
  shipment_events {
    uuid id PK
    uuid shipment_id FK
    varchar status
    varchar location
    varchar source
    timestamptz created_at
  }
  shipping_rates {
    uuid id PK
    uuid supplier_id FK
    varchar carrier
    varchar origin_city
    varchar dest_city
    numeric base_rate
    boolean is_active
  }

  orders ||--o{ shipments : "giao hàng"
  shipments ||--o{ shipment_events : "theo dõi"
  suppliers ||--o{ shipping_rates : "định giá"
```

---

## 7. Domain: Tài chính

```mermaid
erDiagram
  payments {
    uuid id PK
    varchar payment_number UK
    uuid order_id FK
    uuid buyer_id FK
    uuid supplier_id FK
    varchar status
    numeric amount
    boolean is_overdue
  }
  payment_transactions {
    uuid id PK
    uuid payment_id FK
    varchar type
    numeric amount
    varchar status
  }
  invoices {
    uuid id PK
    varchar invoice_number UK
    uuid order_id FK
    uuid seller_id FK
    uuid buyer_id FK
    varchar status
    numeric total_amount
  }
  invoice_items {
    uuid id PK
    uuid invoice_id FK
    uuid product_id FK
    numeric unit_price
  }
  credit_limits {
    uuid id PK
    uuid buyer_id FK
    uuid supplier_id FK
    numeric credit_limit
    numeric used_amount
    varchar status
  }
  credit_transactions {
    uuid id PK
    uuid credit_limit_id FK
    varchar type
    numeric amount
  }
  debit_credit_notes {
    uuid id PK
    varchar note_number UK
    uuid buyer_id FK
    uuid seller_id FK
    varchar type
    varchar status
  }
  debit_credit_items {
    uuid id PK
    uuid note_id FK
    uuid product_id FK
  }

  orders ||--o| payments : "thanh toán"
  payments ||--o{ payment_transactions : "giao dịch"
  orders ||--o{ invoices : "xuất hóa đơn"
  invoices ||--o{ invoice_items : "chứa"
  credit_limits ||--o{ credit_transactions : "lịch sử"
  debit_credit_notes ||--o{ debit_credit_items : "chứa"
  payments }o--|| invoices : "liên kết"
```

---

## 8. Domain: Phê duyệt & Mua hàng nội bộ

```mermaid
erDiagram
  purchase_requisitions {
    uuid id PK
    varchar pr_number UK
    uuid buyer_id FK
    varchar status
    uuid approval_id FK
    uuid rfq_id FK
    uuid order_id FK
  }
  pr_items {
    uuid id PK
    uuid pr_id FK
    uuid product_id FK
    integer quantity
  }
  approval_requests {
    uuid id PK
    varchar request_number UK
    varchar entity_type
    uuid entity_id
    uuid requested_by FK
    varchar status
  }
  approval_steps {
    uuid id PK
    uuid request_id FK
    uuid approver_id FK
    smallint step_order
    varchar status
  }
  goods_received_notes {
    uuid id PK
    varchar grn_number UK
    uuid order_id FK
    uuid supplier_id FK
    uuid warehouse_id FK
    varchar status
  }
  grn_items {
    uuid id PK
    uuid grn_id FK
    uuid product_id FK
    integer ordered_qty
    integer received_qty
  }
  budget_plans {
    uuid id PK
    uuid buyer_id FK
    smallint fiscal_year
    numeric total_amount
  }
  budget_allocations {
    uuid id PK
    uuid plan_id FK
    uuid category_id FK
    numeric allocated_amount
    numeric used_amount
  }
  budget_transactions {
    uuid id PK
    uuid allocation_id FK
    varchar type
    numeric amount
  }

  purchase_requisitions ||--o{ pr_items : "yêu cầu"
  purchase_requisitions ||--o| approval_requests : "gửi duyệt"
  approval_requests ||--o{ approval_steps : "các bước"
  purchase_requisitions ||--o| goods_received_notes : "nhận hàng"
  goods_received_notes ||--o{ grn_items : "chứa"
  budget_plans ||--o{ budget_allocations : "phân bổ"
  budget_allocations ||--o{ budget_transactions : "chi tiêu"
```

---

## 9. Domain: Trả hàng, Đánh giá, Khuyến mãi

```mermaid
erDiagram
  return_requests {
    uuid id PK
    varchar return_number UK
    uuid order_id FK
    uuid buyer_id FK
    uuid supplier_id FK
    varchar status
  }
  return_items {
    uuid id PK
    uuid return_id FK
    uuid product_id FK
    integer quantity
  }
  product_reviews {
    uuid id PK
    uuid product_id FK
    uuid buyer_id FK
    uuid order_id FK
    smallint rating
    varchar status
  }
  supplier_reviews {
    uuid id PK
    uuid supplier_id FK
    uuid buyer_id FK
    smallint overall_rating
  }
  promotions {
    uuid id PK
    varchar code UK
    varchar type
    numeric value
    boolean is_active
  }
  volume_discounts {
    uuid id PK
    uuid product_id FK
    uuid supplier_id FK
    integer min_qty
    numeric discount
  }

  orders ||--o{ return_requests : "trả hàng"
  return_requests ||--o{ return_items : "chứa"
  orders ||--o{ product_reviews : "đánh giá"
  suppliers ||--o{ supplier_reviews : "nhận đánh giá"
  promotions }o--o{ products : "áp dụng"
  products ||--o{ volume_discounts : "giảm giá số lượng"
```

---

## 10. ERD TỔNG THỂ — Sơ đồ FK chính giữa tất cả domains

```
┌──────────────── USERS ─────────────────────────────────────────────────────┐
│  users (id, role, email, supplier_id FK, company_id FK)                    │
│    ├── buyer_companies (owner_id FK → users)                               │
│    │     └── buyer_team_members (company_id, user_id)                      │
│    ├── shipping_addresses (user_id FK)                                     │
│    └── notification_preferences (user_id FK)                               │
└────────────────────────────────────────────────────────────────────────────┘
              │ buyer                           │ supplier_id
              ▼                                 ▼
┌──────────── SUPPLIERS ──────────────────────────────────────────────────────┐
│  suppliers (id, company_name, rating)                                       │
│    ├── products (supplier_id FK)                                            │
│    │     ├── product_variants (product_id FK)                               │
│    │     ├── product_images (product_id FK)                                 │
│    │     └── volume_discounts (product_id FK)                               │
│    ├── warehouses (supplier_id FK)                                          │
│    │     ├── inventory_items (warehouse_id FK)                              │
│    │     ├── stock_movements (warehouse_id FK)                              │
│    │     └── stock_alerts (warehouse_id FK)                                 │
│    ├── warehouse_transfers (from/to warehouse_id FK)                        │
│    ├── shipping_rates (supplier_id FK)                                      │
│    └── staff_members (supplier_id FK)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
              │                                        │
              ▼ (buyer ↔ supplier transaction)         │
┌──────────── ORDERS ───────────────────────────────── ▼ ────────────────────┐
│  orders (buyer_id FK, supplier_id FK, rfq_id?, contract_id?, template_id?) │
│    ├── order_items (order_id FK, product_id FK)                             │
│    ├── order_status_history (order_id FK)                                   │
│    ├── shipments (order_id FK)                                              │
│    │     └── shipment_events (shipment_id FK)                               │
│    ├── payments (order_id FK)                                               │
│    │     └── payment_transactions (payment_id FK)                           │
│    ├── invoices (order_id FK)                                               │
│    │     └── invoice_items (invoice_id FK)                                  │
│    ├── return_requests (order_id FK)                                        │
│    │     ├── return_items (return_id FK)                                    │
│    │     └── return_images (return_id FK)                                   │
│    ├── product_reviews (order_id FK)                                        │
│    └── goods_received_notes (order_id FK)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
              │ from rfq
              ▼
┌──────────── SOURCING ───────────────────────────────────────────────────────┐
│  rfqs (buyer_id FK, supplier_id FK?)                                        │
│    ├── rfq_items (rfq_id FK)                                                │
│    ├── rfq_attachments (rfq_id FK)                                          │
│    └── quotations (rfq_id FK, supplier_id FK)                               │
│          ├── quotation_items (quotation_id FK)                               │
│          └── contracts (quotation_id FK, rfq_id FK)                         │
│                ├── contract_items (contract_id FK)                           │
│                ├── contract_milestones (contract_id FK)                      │
│                └── contract_history (contract_id FK)                         │
└─────────────────────────────────────────────────────────────────────────────┘
              │ buyer-side procurement
              ▼
┌──────────── PROCUREMENT ───────────────────────────────────────────────────┐
│  purchase_requisitions (buyer_id FK)                                        │
│    ├── pr_items (pr_id FK)                                                  │
│    └── approval_requests (entity_id = pr.id)                                │
│          └── approval_steps (request_id FK, approver_id FK)                 │
│  budget_plans (buyer_id FK)                                                 │
│    └── budget_allocations (plan_id FK)                                      │
│          └── budget_transactions (allocation_id FK)                          │
└─────────────────────────────────────────────────────────────────────────────┘
              │ system
              ▼
┌──────────── SYSTEM ────────────────────────────────────────────────────────┐
│  notifications (user_id FK)                                                 │
│  activity_logs (user_id FK)                                                 │
│  system_configs (key-value)                                                 │
│  platform_fees                                                              │
│  banner_configs                                                             │
│  email_templates                                                            │
│  promotions →  promotion_products, promotion_categories                     │
│  credit_limits (buyer_id FK, supplier_id FK)                                │
│    └── credit_transactions (credit_limit_id FK)                             │
│  debit_credit_notes (buyer_id FK, seller_id FK)                             │
│    └── debit_credit_items (note_id FK)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Bảng tổng hợp FK quan trọng nhất

| Bảng nguồn | Cột FK | Bảng đích | Cascade |
|------------|--------|-----------|---------|
| `products` | `supplier_id` | `suppliers` | SET NULL |
| `products` | `category_id` | `categories` | SET NULL |
| `orders` | `buyer_id` | `users` | RESTRICT |
| `orders` | `supplier_id` | `suppliers` | RESTRICT |
| `orders` | `rfq_id` | `rfqs` | SET NULL |
| `orders` | `contract_id` | `contracts` | SET NULL |
| `rfqs` | `buyer_id` | `users` | RESTRICT |
| `quotations` | `rfq_id` | `rfqs` | RESTRICT |
| `contracts` | `quotation_id` | `quotations` | SET NULL |
| `shipments` | `order_id` | `orders` | RESTRICT |
| `payments` | `order_id` | `orders` | RESTRICT |
| `invoices` | `order_id` | `orders` | SET NULL |
| `inventory_items` | `warehouse_id` | `warehouses` | CASCADE |
| `stock_movements` | `warehouse_id` | `warehouses` | RESTRICT |
| `notifications` | `user_id` | `users` | CASCADE |
| `activity_logs` | `user_id` | `users` | RESTRICT |

---

## Tài liệu liên quan

- [04-database-schema-part1.md](./04-database-schema-part1.md) — Schema: Người dùng, Sản phẩm
- [05-database-schema-part2.md](./05-database-schema-part2.md) — Schema: Đơn hàng, RFQ, Hợp đồng
- [06-database-schema-part3.md](./06-database-schema-part3.md) — Schema: Kho, Vận chuyển, Tài chính
- [07-database-schema-part4.md](./07-database-schema-part4.md) — Schema: Trả hàng, KM, Phê duyệt, System
- [14-business-rules-part1.md](./14-business-rules-part1.md) — Business rules: Core Commerce
