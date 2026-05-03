# 05 — Database Schema (Part 2): Đơn hàng, Giỏ hàng, RFQ, Báo giá, Hợp đồng

> Schema chi tiết các bảng giao dịch — mapping 1:1 giữa TypeScript types và PostgreSQL tables.
> Quy ước chung xem [04-database-schema-part1.md](./04-database-schema-part1.md#quy-ước-chung).

---

## 1. Bảng `orders`

> TypeScript: `Order` | Source: `/src/app/types/index.ts` dòng 190

```sql
CREATE TABLE orders (
  id                     UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number           VARCHAR(50)   NOT NULL UNIQUE,  -- VD: 'ORD-20260315-001'
  buyer_id               UUID          NOT NULL REFERENCES users(id),
  buyer_name             VARCHAR(255)  NOT NULL,         -- Denormalized
  buyer_email            VARCHAR(255)  NULL,             -- Denormalized
  buyer_company          VARCHAR(255)  NULL,             -- Denormalized (buyerCompany)
  supplier_id            UUID          NOT NULL REFERENCES suppliers(id),
  supplier_name          VARCHAR(255)  NOT NULL,         -- Denormalized
  items                  JSONB         NOT NULL DEFAULT '[]',  -- OrderItem[] (denormalized snapshot)
  subtotal               NUMERIC(18,2) NOT NULL DEFAULT 0,
  shipping_fee           NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax                    NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount           NUMERIC(18,2) NOT NULL DEFAULT 0,
  status                 VARCHAR(50)   NOT NULL DEFAULT 'Chờ xác nhận'
                         CHECK (status IN (
                           'Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý',
                           'Đang giao hàng', 'Đã giao', 'Đã huỷ', 'Hoàn trả'
                         )),
  shipping_address       JSONB         NULL,              -- Snapshot địa chỉ giao hàng
  payment_method         VARCHAR(100)  NULL,
  notes                  TEXT          NULL,
  -- Loại đơn hàng & nguồn gốc
  order_type             VARCHAR(50)   NOT NULL DEFAULT 'Thường'
                         CHECK (order_type IN ('Thường', 'RFQ', 'Hợp đồng', 'Mẫu đơn')),
  rfq_id                 UUID          NULL REFERENCES rfqs(id) ON DELETE SET NULL,
  contract_id            UUID          NULL REFERENCES contracts(id) ON DELETE SET NULL,
  template_id            UUID          NULL REFERENCES order_templates(id) ON DELETE SET NULL,
  -- Huỷ đơn
  cancel_reason          TEXT          NULL,
  cancelled_at           TIMESTAMPTZ   NULL,
  cancelled_by           UUID          NULL REFERENCES users(id),
  -- Giảm giá & khuyến mãi
  discount_amount        NUMERIC(18,2) NOT NULL DEFAULT 0,
  promotion_code         VARCHAR(100)  NULL,
  promotion_id           UUID          NULL REFERENCES promotions(id) ON DELETE SET NULL,
  -- Giao hàng
  expected_delivery_date TIMESTAMPTZ   NULL,
  actual_delivery_date   TIMESTAMPTZ   NULL,
  is_urgent              BOOLEAN       NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_orders_number     ON orders(order_number);
CREATE INDEX idx_orders_buyer             ON orders(buyer_id);
CREATE INDEX idx_orders_supplier          ON orders(supplier_id);
CREATE INDEX idx_orders_status            ON orders(status);
CREATE INDEX idx_orders_type              ON orders(order_type);
CREATE INDEX idx_orders_created           ON orders(created_at DESC);
CREATE INDEX idx_orders_rfq               ON orders(rfq_id)   WHERE rfq_id IS NOT NULL;
CREATE INDEX idx_orders_contract          ON orders(contract_id) WHERE contract_id IS NOT NULL;
CREATE INDEX idx_orders_urgent            ON orders(is_urgent) WHERE is_urgent = true;
```

**~35 cột**. `items` JSONB là snapshot tại thời điểm đặt hàng; chi tiết CRUD dùng `order_items`.

**Lưu ý**:
- `shipping_address` lưu dạng JSONB (snapshot) — không FK đến `shipping_addresses` vì địa chỉ có thể thay đổi sau khi đặt.
- `buyer_company` mapping từ TypeScript `buyerCompany` (KHÔNG phải `buyerCompanyName`).

---

## 2. Bảng `order_items`

> TypeScript: `OrderItem` | Source: dòng 173

```sql
CREATE TABLE order_items (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID          NOT NULL REFERENCES products(id),
  variant_id    UUID          NULL REFERENCES product_variants(id),
  product_name  VARCHAR(500)  NOT NULL,        -- Denormalized snapshot
  product_image TEXT          NULL,             -- Denormalized snapshot
  variant_name  VARCHAR(255)  NULL,
  sku           VARCHAR(100)  NULL,
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(18,2) NOT NULL,
  total_price   NUMERIC(18,2) NOT NULL,
  unit          VARCHAR(50)   NULL DEFAULT 'Cái',
  discount      NUMERIC(18,2) NOT NULL DEFAULT 0,  -- Giảm giá trên dòng
  note          TEXT          NULL
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

---

## 3. Bảng `order_status_history`

> TypeScript: `OrderStatusHistory` | Source: dòng 229

```sql
CREATE TABLE order_status_history (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status     VARCHAR(50)  NULL,            -- NULL khi tạo đơn mới
  to_status       VARCHAR(50)  NOT NULL,
  changed_by      UUID         NOT NULL REFERENCES users(id),
  changed_by_name VARCHAR(255) NULL,            -- Denormalized
  note            TEXT         NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_history_date  ON order_status_history(created_at DESC);
```

---

## 4. Bảng `order_templates` + `order_template_items`

> TypeScript: `OrderTemplate`, `OrderTemplateItem` | Source: dòng 1090, 1102

```sql
CREATE TABLE order_templates (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT         NULL,
  items         JSONB        NOT NULL DEFAULT '[]',   -- Denormalized snapshot
  supplier_id   UUID         NOT NULL REFERENCES suppliers(id),
  supplier_name VARCHAR(255) NULL,              -- Denormalized
  is_default    BOOLEAN      NOT NULL DEFAULT false,
  category      VARCHAR(100) NULL,              -- Nhóm mẫu: 'Văn phòng phẩm', 'Nguyên liệu'…
  last_used     TIMESTAMPTZ  NULL,
  usage_count   INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_tpl_user     ON order_templates(user_id);
CREATE INDEX idx_order_tpl_supplier ON order_templates(supplier_id);

CREATE TABLE order_template_items (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id   UUID          NOT NULL REFERENCES order_templates(id) ON DELETE CASCADE,
  product_id    UUID          NOT NULL REFERENCES products(id),
  product_name  VARCHAR(500)  NOT NULL,        -- Denormalized
  product_image TEXT          NULL,
  quantity      INTEGER       NOT NULL DEFAULT 1,
  unit_price    NUMERIC(18,2) NOT NULL,
  unit          VARCHAR(50)   NULL DEFAULT 'Cái'
);

CREATE INDEX idx_order_tpl_items_tpl ON order_template_items(template_id);
```

---

## 5. Bảng `cart_items`

> TypeScript: `CartItem` | Source: dòng 267

```sql
CREATE TABLE cart_items (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id      UUID          NOT NULL REFERENCES products(id),
  variant_id      UUID          NULL REFERENCES product_variants(id),
  supplier_id     UUID          NOT NULL REFERENCES suppliers(id),
  -- Denormalized (hiển thị nhanh, không JOIN)
  product_name    VARCHAR(500)  NULL,
  product_image   TEXT          NULL,
  supplier_name   VARCHAR(255)  NULL,
  variant_name    VARCHAR(255)  NULL,
  quantity        INTEGER       NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price      NUMERIC(18,2) NOT NULL,
  total_price     NUMERIC(18,2) NOT NULL,       -- quantity * unit_price
  saved_for_later BOOLEAN       NOT NULL DEFAULT false,
  note            TEXT          NULL,
  added_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_user       ON cart_items(user_id);
CREATE INDEX idx_cart_product    ON cart_items(product_id);
CREATE INDEX idx_cart_supplier   ON cart_items(supplier_id);
CREATE INDEX idx_cart_saved      ON cart_items(saved_for_later) WHERE saved_for_later = true;
```

---

## 6. Bảng `wishlist_folders` + `wishlist_items`

> TypeScript: `WishlistFolder`, `WishlistItem` | Source: dòng 1060, 1077

```sql
CREATE TABLE wishlist_folders (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  cover_image TEXT         NULL,
  is_default  BOOLEAN      NOT NULL DEFAULT false,
  item_count  INTEGER      NOT NULL DEFAULT 0,    -- Denormalized counter
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_wishlist_folders_user ON wishlist_folders(user_id);

CREATE TABLE wishlist_items (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id      UUID          NULL REFERENCES wishlist_folders(id) ON DELETE SET NULL,
  product_id     UUID          NOT NULL REFERENCES products(id),
  -- Denormalized
  product_name   VARCHAR(500)  NULL,
  product_image  TEXT          NULL,
  supplier_id    UUID          NULL REFERENCES suppliers(id),
  supplier_name  VARCHAR(255)  NULL,
  category_name  VARCHAR(255)  NULL,
  price          NUMERIC(18,2) NULL,
  min_order_qty  INTEGER       NULL,
  unit           VARCHAR(50)   NULL,
  added_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (user_id, product_id)                    -- Mỗi user chỉ wishlist 1 lần/product
);

CREATE INDEX idx_wishlist_items_user    ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_folder  ON wishlist_items(folder_id);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);
```

---

## 7. Bảng `rfqs`

> TypeScript: `RFQ` | Source: dòng 473

```sql
CREATE TABLE rfqs (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_number      VARCHAR(50)  NOT NULL UNIQUE,   -- VD: 'RFQ-20260315-001'
  buyer_id        UUID         NOT NULL REFERENCES users(id),
  buyer_name      VARCHAR(255) NOT NULL,           -- Denormalized
  buyer_company   VARCHAR(255) NULL,               -- Denormalized
  supplier_id     UUID         NULL REFERENCES suppliers(id),  -- NCC chỉ định (optional)
  supplier_name   VARCHAR(255) NULL,
  items           JSONB        NOT NULL DEFAULT '[]',  -- RFQItem[] snapshot
  status          VARCHAR(50)  NOT NULL DEFAULT 'Bản nháp'
                  CHECK (status IN (
                    'Bản nháp', 'Đã gửi', 'Đang báo giá',
                    'Đã báo giá', 'Chấp nhận', 'Từ chối', 'Hết hạn'
                  )),
  delivery_date   TIMESTAMPTZ  NULL,               -- Ngày giao hàng yêu cầu
  payment_terms   VARCHAR(255) NULL,
  shipping_terms  VARCHAR(255) NULL,
  notes           TEXT         NULL,
  attachments     JSONB        NOT NULL DEFAULT '[]',  -- URL list (denormalized)
  expires_at      TIMESTAMPTZ  NULL,               -- Hạn nhận báo giá
  category_id     UUID         NULL REFERENCES categories(id),
  priority        VARCHAR(50)  NULL CHECK (priority IN ('Thường', 'Gấp', 'Rất gấp')),
  response_count  INTEGER      NOT NULL DEFAULT 0, -- Denormalized counter
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_rfqs_number   ON rfqs(rfq_number);
CREATE INDEX idx_rfqs_buyer           ON rfqs(buyer_id);
CREATE INDEX idx_rfqs_supplier        ON rfqs(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX idx_rfqs_status          ON rfqs(status);
CREATE INDEX idx_rfqs_category        ON rfqs(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_rfqs_expires         ON rfqs(expires_at);
CREATE INDEX idx_rfqs_created         ON rfqs(created_at DESC);
```

---

## 8. Bảng `rfq_items` + `rfq_attachments`

> TypeScript: `RFQItem`, `RFQAttachment` | Source: dòng 458, 498

```sql
CREATE TABLE rfq_items (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id          UUID          NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  product_id      UUID          NULL REFERENCES products(id),
  product_name    VARCHAR(500)  NOT NULL,
  quantity        INTEGER       NOT NULL CHECK (quantity > 0),
  unit            VARCHAR(50)   NOT NULL DEFAULT 'Cái',
  target_price    NUMERIC(18,2) NULL,            -- Giá mục tiêu
  specifications  TEXT          NULL,
  notes           TEXT          NULL,
  category_id     UUID          NULL REFERENCES categories(id),
  sample_required BOOLEAN       NOT NULL DEFAULT false
);

CREATE INDEX idx_rfq_items_rfq ON rfq_items(rfq_id);

CREATE TABLE rfq_attachments (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id      UUID         NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  file_name   VARCHAR(255) NOT NULL,
  file_url    TEXT         NOT NULL,
  file_size   INTEGER      NOT NULL DEFAULT 0,   -- Bytes
  file_type   VARCHAR(100) NULL,                  -- MIME type
  uploaded_by UUID         NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_rfq_attachments_rfq ON rfq_attachments(rfq_id);
```

---

## 9. Bảng `quotations` + `quotation_items`

> TypeScript: `Quotation`, `QuotationItem` | Source: dòng 525, 511

```sql
CREATE TABLE quotations (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id         UUID          NOT NULL REFERENCES rfqs(id),
  rfq_number     VARCHAR(50)   NULL,              -- Denormalized
  supplier_id    UUID          NOT NULL REFERENCES suppliers(id),
  supplier_name  VARCHAR(255)  NULL,              -- Denormalized
  items          JSONB         NOT NULL DEFAULT '[]',  -- QuotationItem[] snapshot
  total_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
  valid_until    TIMESTAMPTZ   NULL,
  payment_terms  VARCHAR(255)  NULL,
  delivery_days  INTEGER       NULL,
  notes          TEXT          NULL,
  status         VARCHAR(50)   NOT NULL DEFAULT 'Chờ phản hồi'
                 CHECK (status IN ('Chờ phản hồi', 'Chấp nhận', 'Từ chối')),
  warranty       TEXT          NULL,               -- Điều khoản bảo hành
  attachments    JSONB         NOT NULL DEFAULT '[]',
  expires_at     TIMESTAMPTZ   NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotations_rfq      ON quotations(rfq_id);
CREATE INDEX idx_quotations_supplier ON quotations(supplier_id);
CREATE INDEX idx_quotations_status   ON quotations(status);

CREATE TABLE quotation_items (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id  UUID          NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id    UUID          NULL REFERENCES products(id),
  product_name  VARCHAR(500)  NOT NULL,
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(18,2) NOT NULL,
  total_price   NUMERIC(18,2) NOT NULL,
  unit          VARCHAR(50)   NULL DEFAULT 'Cái',
  discount      NUMERIC(5,2)  NOT NULL DEFAULT 0,  -- Giảm giá (%)
  notes         TEXT          NULL
);

CREATE INDEX idx_quotation_items_quot ON quotation_items(quotation_id);
```

---

## 10. Bảng `contracts`

> TypeScript: `Contract` | Source: dòng 593

```sql
CREATE TABLE contracts (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number   VARCHAR(50)   NOT NULL UNIQUE,  -- VD: 'CTR-20260315-001'
  rfq_id            UUID          NULL REFERENCES rfqs(id) ON DELETE SET NULL,
  quotation_id      UUID          NULL REFERENCES quotations(id) ON DELETE SET NULL,
  buyer_id          UUID          NOT NULL REFERENCES users(id),
  buyer_name        VARCHAR(255)  NOT NULL,
  buyer_company     VARCHAR(255)  NULL,
  supplier_id       UUID          NOT NULL REFERENCES suppliers(id),
  supplier_name     VARCHAR(255)  NOT NULL,
  items             JSONB         NOT NULL DEFAULT '[]',  -- ContractItem[] snapshot
  total_amount      NUMERIC(18,2) NOT NULL DEFAULT 0,
  status            VARCHAR(50)   NOT NULL DEFAULT 'Bản nháp'
                    CHECK (status IN (
                      'Bản nháp', 'Chờ ký', 'Đang thực hiện',
                      'Hoàn thành', 'Đã huỷ', 'Hết hạn', 'Tranh chấp'
                    )),
  contract_type     VARCHAR(50)   NULL CHECK (contract_type IN ('Mua bán', 'Khung', 'Dịch vụ')),
  payment_terms     VARCHAR(255)  NULL,
  shipping_terms    VARCHAR(255)  NULL,
  delivery_date     TIMESTAMPTZ   NULL,
  start_date        TIMESTAMPTZ   NOT NULL,
  end_date          TIMESTAMPTZ   NOT NULL,
  milestones        JSONB         NOT NULL DEFAULT '[]',  -- Denormalized snapshot
  notes             TEXT          NULL,
  signed_by_buyer   BOOLEAN       NOT NULL DEFAULT false,
  signed_by_seller  BOOLEAN       NOT NULL DEFAULT false,
  signed_at         TIMESTAMPTZ   NULL,
  approved_by       UUID          NULL REFERENCES users(id),
  approved_at       TIMESTAMPTZ   NULL,
  renewal_date      TIMESTAMPTZ   NULL,
  auto_renew        BOOLEAN       NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_contracts_number   ON contracts(contract_number);
CREATE INDEX idx_contracts_buyer           ON contracts(buyer_id);
CREATE INDEX idx_contracts_supplier        ON contracts(supplier_id);
CREATE INDEX idx_contracts_status          ON contracts(status);
CREATE INDEX idx_contracts_rfq             ON contracts(rfq_id)       WHERE rfq_id IS NOT NULL;
CREATE INDEX idx_contracts_quotation       ON contracts(quotation_id) WHERE quotation_id IS NOT NULL;
CREATE INDEX idx_contracts_end_date        ON contracts(end_date);
CREATE INDEX idx_contracts_renewal         ON contracts(renewal_date) WHERE auto_renew = true;
```

**~30 cột**. `items` và `milestones` JSONB là snapshot; chi tiết CRUD dùng các bảng phụ bên dưới.

---

## 11. Bảng `contract_items`

> TypeScript: `ContractItem` | Source: dòng 555

```sql
CREATE TABLE contract_items (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id    UUID          NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  product_id     UUID          NULL REFERENCES products(id),
  product_name   VARCHAR(500)  NOT NULL,
  quantity       INTEGER       NOT NULL CHECK (quantity > 0),
  unit           VARCHAR(50)   NOT NULL DEFAULT 'Cái',
  unit_price     NUMERIC(18,2) NOT NULL,
  total_price    NUMERIC(18,2) NOT NULL,
  sku            VARCHAR(100)  NULL,
  delivered_qty  INTEGER       NOT NULL DEFAULT 0,  -- Số lượng đã giao
  remaining_qty  INTEGER       NOT NULL DEFAULT 0   -- Số lượng còn lại (computed hoặc trigger)
);

CREATE INDEX idx_contract_items_contract ON contract_items(contract_id);
```

---

## 12. Bảng `contract_milestones`

> TypeScript: `ContractMilestone` | Source: dòng 570

```sql
CREATE TABLE contract_milestones (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id   UUID          NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  title         VARCHAR(255)  NOT NULL,
  due_date      TIMESTAMPTZ   NOT NULL,
  amount        NUMERIC(18,2) NOT NULL DEFAULT 0,
  status        VARCHAR(50)   NOT NULL DEFAULT 'Chưa đến hạn'
                CHECK (status IN ('Chưa đến hạn', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn')),
  completed_at  TIMESTAMPTZ   NULL,
  completed_by  UUID          NULL REFERENCES users(id),
  paid_amount   NUMERIC(18,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_contract_ms_contract ON contract_milestones(contract_id);
CREATE INDEX idx_contract_ms_due      ON contract_milestones(due_date);
CREATE INDEX idx_contract_ms_status   ON contract_milestones(status);
```

---

## 13. Bảng `contract_history`

> TypeScript: `ContractHistory` | Source: dòng 583

```sql
CREATE TABLE contract_history (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id     UUID         NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action          VARCHAR(100) NOT NULL,        -- 'Tạo mới', 'Ký', 'Sửa đổi', 'Gia hạn', 'Huỷ'
  changed_by      UUID         NOT NULL REFERENCES users(id),
  changed_by_name VARCHAR(255) NULL,            -- Denormalized
  details         TEXT         NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_contract_hist_contract ON contract_history(contract_id);
CREATE INDEX idx_contract_hist_date     ON contract_history(created_at DESC);
```

---

## Relationships (ER Diagram)

```
                    ┌──────────────┐
                    │    users     │
                    └──────┬───────┘
           ┌───────────────┼────────────────┐
           │               │                │
           ▼               ▼                ▼
    ┌─────────────┐ ┌────────────┐  ┌──────────────────┐
    │  cart_items  │ │    rfqs    │  │  order_templates  │
    └─────────────┘ └──────┬─────┘  └────────┬─────────┘
                           │                 │
                    ┌──────┴──────┐          │
                    │             │          │
                    ▼             ▼          │
            ┌─────────────┐ ┌───────────┐   │
            │ rfq_items   │ │quotations │   │
            │ rfq_attach. │ └─────┬─────┘   │
            └─────────────┘       │         │
                                  ▼         │
                           ┌───────────┐    │
                           │ contracts │    │
                           └─────┬─────┘    │
                    ┌────────────┼────────┐ │
                    │            │        │ │
                    ▼            ▼        ▼ │
            ┌────────────┐┌──────────┐┌─────────┐
            │contract_   ││contract_ ││contract_│
            │items       ││milestones││history  │
            └────────────┘└──────────┘└─────────┘
                                  │
                                  ▼
                           ┌───────────┐
                           │  orders   │◄───── order_templates
                           └─────┬─────┘
                      ┌──────────┼──────────┐
                      │          │          │
                      ▼          ▼          ▼
              ┌────────────┐┌──────────┐┌──────────┐
              │order_items ││order_    ││wishlist_ │
              └────────────┘│status_   ││items/    │
                            │history   ││folders   │
                            └──────────┘└──────────┘
```

### Luồng giao dịch chính (RFQ → Order)

```
User tạo RFQ
  → RFQ Items (sản phẩm yêu cầu)
  → Supplier gửi Quotation
    → Quotation Items (giá + SL)
    → Buyer chấp nhận → tạo Contract
      → Contract Items, Milestones
      → Tạo Orders từ Contract
        → Order Items, Status History
```

### FK Cross-references (giữa các bảng)

| Bảng nguồn | Cột FK | Bảng đích | Quan hệ |
|-------------|--------|-----------|---------|
| `orders.rfq_id` | FK | `rfqs` | N:1 — Đơn hàng sinh từ RFQ |
| `orders.contract_id` | FK | `contracts` | N:1 — Đơn hàng thuộc hợp đồng |
| `orders.template_id` | FK | `order_templates` | N:1 — Đơn hàng tạo từ mẫu |
| `orders.promotion_id` | FK | `promotions` (Part 3) | N:1 — Đơn áp dụng khuyến mãi |
| `contracts.rfq_id` | FK | `rfqs` | N:1 — Hợp đồng sinh từ RFQ |
| `contracts.quotation_id` | FK | `quotations` | N:1 — Hợp đồng dựa trên báo giá |
| `quotations.rfq_id` | FK | `rfqs` | N:1 — Báo giá cho RFQ |
| `wishlist_items.folder_id` | FK | `wishlist_folders` | N:1 — Item thuộc folder |

---

## Tài liệu liên quan

- [04-database-schema-part1.md](./04-database-schema-part1.md) — Schema: Người dùng, Sản phẩm, Danh mục, NCC
- [06-database-schema-part3.md](./06-database-schema-part3.md) — Schema: Kho, Vận chuyển, Thanh toán, Hoá đơn
- [07-database-schema-part4.md](./07-database-schema-part4.md) — Schema: Khuyến mãi, Đánh giá, Thông báo, Nhật ký
- [01-system-overview.md](./01-system-overview.md) — Tổng quan hệ thống
