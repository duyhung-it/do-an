# 06 — Database Schema (Part 3): Kho hàng, Vận chuyển, Thanh toán, Hoá đơn

> Schema chi tiết các domain Kho/Logistics/Finance — mapping 1:1 giữa TypeScript types và PostgreSQL tables.
> Quy ước chung xem [04-database-schema-part1.md](./04-database-schema-part1.md#quy-ước-chung).

---

## 1. Bảng `warehouses`

> TypeScript: `Warehouse` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE warehouses (
  id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id     UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50)  NULL UNIQUE,        -- Mã kho ngắn, VD: 'WH-HN-01'
  address         TEXT         NOT NULL,
  city            VARCHAR(100) NOT NULL,
  district        VARCHAR(100) NULL,
  ward            VARCHAR(100) NULL,
  manager         VARCHAR(255) NULL,               -- Tên người quản lý kho
  phone           VARCHAR(20)  NULL,
  capacity        INTEGER      NULL,               -- Sức chứa (m² hoặc pallet)
  current_stock   INTEGER      NOT NULL DEFAULT 0, -- Denormalized: số lượng tồn kho
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  notes           TEXT         NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_warehouses_supplier ON warehouses(supplier_id);
CREATE INDEX idx_warehouses_city     ON warehouses(city);
CREATE INDEX idx_warehouses_active   ON warehouses(is_active) WHERE is_active = true;
```

---

## 2. Bảng `inventory_items`

> TypeScript: `InventoryItem` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE inventory_items (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     UUID          NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id       UUID          NOT NULL REFERENCES products(id),
  variant_id       UUID          NULL REFERENCES product_variants(id),
  supplier_id      UUID          NOT NULL REFERENCES suppliers(id),
  -- Denormalized (tránh JOIN khi hiển thị danh sách)
  product_name     VARCHAR(500)  NULL,
  product_image    TEXT          NULL,
  category_id      UUID          NULL REFERENCES categories(id),
  category_name    VARCHAR(255)  NULL,
  sku              VARCHAR(100)  NULL,
  -- Tồn kho
  quantity         INTEGER       NOT NULL DEFAULT 0,
  min_stock        INTEGER       NOT NULL DEFAULT 0,   -- Ngưỡng cảnh báo thấp
  max_stock        INTEGER       NULL,                  -- Ngưỡng tối đa (để tính % fill)
  reserved_qty     INTEGER       NOT NULL DEFAULT 0,   -- Đã đặt trước, chưa xuất
  available_qty    INTEGER       GENERATED ALWAYS AS (quantity - reserved_qty) STORED,
  -- Giá & thông tin lô
  cost_price       NUMERIC(18,2) NULL,                 -- Giá nhập
  batch_number     VARCHAR(100)  NULL,
  expiry_date      DATE          NULL,
  location         VARCHAR(255)  NULL,                 -- Ví trí trong kho: 'A-01-03'
  -- Meta
  last_restocked   TIMESTAMPTZ   NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_inventory_warehouse_product
  ON inventory_items(warehouse_id, product_id, variant_id)
  NULLS NOT DISTINCT;                                   -- Cho phép NULL variant_id unique
CREATE INDEX idx_inventory_warehouse  ON inventory_items(warehouse_id);
CREATE INDEX idx_inventory_product    ON inventory_items(product_id);
CREATE INDEX idx_inventory_supplier   ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_low_stock  ON inventory_items(quantity, min_stock)
  WHERE quantity <= min_stock;
CREATE INDEX idx_inventory_expiry     ON inventory_items(expiry_date)
  WHERE expiry_date IS NOT NULL;
```

---

## 3. Bảng `stock_movements`

> TypeScript: `StockMovement` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE stock_movements (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     UUID          NOT NULL REFERENCES warehouses(id),
  product_id       UUID          NOT NULL REFERENCES products(id),
  variant_id       UUID          NULL REFERENCES product_variants(id),
  -- Denormalized
  product_name     VARCHAR(500)  NULL,
  sku              VARCHAR(100)  NULL,
  -- Loại di chuyển
  type             VARCHAR(50)   NOT NULL
                   CHECK (type IN ('Nhập kho', 'Xuất kho', 'Chuyển kho', 'Điều chỉnh', 'Huỷ')),
  quantity         INTEGER       NOT NULL,   -- Dương=nhập, Âm=xuất/điều chỉnh giảm
  quantity_before  INTEGER       NOT NULL DEFAULT 0,
  quantity_after   INTEGER       NOT NULL DEFAULT 0,
  cost_price       NUMERIC(18,2) NULL,
  reference_type   VARCHAR(50)   NULL,       -- 'Order', 'GRN', 'Transfer', 'Manual'
  reference_id     UUID          NULL,       -- FK mềm đến entity liên quan
  reference_number VARCHAR(100)  NULL,       -- VD: 'ORD-20260315-001'
  note             TEXT          NULL,
  performed_by     UUID          NOT NULL REFERENCES users(id),
  performed_by_name VARCHAR(255) NULL,       -- Denormalized
  batch_number     VARCHAR(100)  NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Append-only, không UPDATE
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_product   ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type      ON stock_movements(type);
CREATE INDEX idx_stock_movements_ref       ON stock_movements(reference_type, reference_id)
  WHERE reference_id IS NOT NULL;
CREATE INDEX idx_stock_movements_date      ON stock_movements(created_at DESC);
```

---

## 4. Bảng `stock_alerts`

> TypeScript: `StockAlert` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE stock_alerts (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id      UUID          NOT NULL REFERENCES warehouses(id),
  product_id        UUID          NOT NULL REFERENCES products(id),
  variant_id        UUID          NULL REFERENCES product_variants(id),
  supplier_id       UUID          NOT NULL REFERENCES suppliers(id),
  -- Denormalized
  product_name      VARCHAR(500)  NULL,
  -- Loại & mức độ
  alert_type        VARCHAR(50)   NOT NULL
                    CHECK (alert_type IN ('Sắp hết hàng', 'Hết hàng', 'Sắp hết hạn', 'Hết hạn')),
  severity          VARCHAR(20)   NOT NULL DEFAULT 'Cảnh báo'
                    CHECK (severity IN ('Thông tin', 'Cảnh báo', 'Nghiêm trọng')),
  current_stock     INTEGER       NOT NULL DEFAULT 0,
  min_stock         INTEGER       NOT NULL DEFAULT 0,
  -- Trạng thái xử lý
  status            VARCHAR(50)   NOT NULL DEFAULT 'Chưa xử lý'
                    CHECK (status IN ('Chưa xử lý', 'Đang xử lý', 'Đã xử lý', 'Bỏ qua')),
  acknowledged_by   UUID          NULL REFERENCES users(id),
  acknowledged_at   TIMESTAMPTZ   NULL,
  resolved_by       UUID          NULL REFERENCES users(id),
  resolved_at       TIMESTAMPTZ   NULL,
  resolve_note      TEXT          NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_alerts_warehouse ON stock_alerts(warehouse_id);
CREATE INDEX idx_stock_alerts_product   ON stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_supplier  ON stock_alerts(supplier_id);
CREATE INDEX idx_stock_alerts_status    ON stock_alerts(status)
  WHERE status IN ('Chưa xử lý', 'Đang xử lý');
CREATE INDEX idx_stock_alerts_date      ON stock_alerts(created_at DESC);
```

---

## 5. Bảng `warehouse_transfers` + `warehouse_transfer_items`

> TypeScript: `WarehouseTransfer`, `WarehouseTransferItem` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE warehouse_transfers (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number   VARCHAR(50)  NOT NULL UNIQUE,    -- VD: 'TRF-20260315-001'
  supplier_id       UUID         NOT NULL REFERENCES suppliers(id),
  from_warehouse_id UUID         NOT NULL REFERENCES warehouses(id),
  to_warehouse_id   UUID         NOT NULL REFERENCES warehouses(id),
  from_warehouse    VARCHAR(255) NULL,               -- Denormalized
  to_warehouse      VARCHAR(255) NULL,               -- Denormalized
  status            VARCHAR(50)  NOT NULL DEFAULT 'Chờ duyệt'
                    CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Đang vận chuyển',
                                      'Đã nhận', 'Huỷ')),
  total_items       INTEGER      NOT NULL DEFAULT 0,
  notes             TEXT         NULL,
  reason            VARCHAR(255) NULL,               -- Lý do chuyển kho
  -- Approval
  requested_by      UUID         NOT NULL REFERENCES users(id),
  requested_by_name VARCHAR(255) NULL,
  approved_by       UUID         NULL REFERENCES users(id),
  approved_at       TIMESTAMPTZ  NULL,
  -- Vận chuyển
  shipped_at        TIMESTAMPTZ  NULL,
  received_at       TIMESTAMPTZ  NULL,
  expected_date     TIMESTAMPTZ  NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CHECK (from_warehouse_id <> to_warehouse_id)      -- Không chuyển kho cho chính nó
);

CREATE UNIQUE INDEX idx_transfers_number   ON warehouse_transfers(transfer_number);
CREATE INDEX idx_transfers_supplier        ON warehouse_transfers(supplier_id);
CREATE INDEX idx_transfers_from_warehouse  ON warehouse_transfers(from_warehouse_id);
CREATE INDEX idx_transfers_to_warehouse    ON warehouse_transfers(to_warehouse_id);
CREATE INDEX idx_transfers_status          ON warehouse_transfers(status);
CREATE INDEX idx_transfers_date            ON warehouse_transfers(created_at DESC);

CREATE TABLE warehouse_transfer_items (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id      UUID          NOT NULL REFERENCES warehouse_transfers(id) ON DELETE CASCADE,
  product_id       UUID          NOT NULL REFERENCES products(id),
  variant_id       UUID          NULL REFERENCES product_variants(id),
  product_name     VARCHAR(500)  NOT NULL,    -- Denormalized
  sku              VARCHAR(100)  NULL,
  quantity         INTEGER       NOT NULL CHECK (quantity > 0),
  received_qty     INTEGER       NOT NULL DEFAULT 0,
  unit             VARCHAR(50)   NULL DEFAULT 'Cái',
  note             TEXT          NULL
);

CREATE INDEX idx_transfer_items_transfer ON warehouse_transfer_items(transfer_id);
CREATE INDEX idx_transfer_items_product  ON warehouse_transfer_items(product_id);
```

---

## 6. Bảng `shipments` + `shipment_events`

> TypeScript: `Shipment`, `ShipmentEvent` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE shipments (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number   VARCHAR(100) NOT NULL UNIQUE,    -- Mã vận đơn
  order_id          UUID         NOT NULL REFERENCES orders(id),
  order_number      VARCHAR(50)  NULL,               -- Denormalized
  supplier_id       UUID         NOT NULL REFERENCES suppliers(id),
  carrier           VARCHAR(255) NOT NULL,            -- 'GHTK', 'GHN', 'VietelPost'…
  status            VARCHAR(50)  NOT NULL DEFAULT 'Chờ lấy hàng'
                    CHECK (status IN ('Chờ lấy hàng', 'Đã lấy hàng', 'Đang vận chuyển',
                                      'Đang giao', 'Đã giao', 'Giao thất bại', 'Đã trả về')),
  -- Địa chỉ
  from_address      TEXT         NOT NULL,
  to_address        TEXT         NOT NULL,
  -- Thời gian
  pickup_date       TIMESTAMPTZ  NULL,
  estimated_date    TIMESTAMPTZ  NULL,               -- Ngày giao dự kiến
  actual_date       TIMESTAMPTZ  NULL,               -- Ngày giao thực tế
  -- Gói hàng
  weight            NUMERIC(10,3) NULL,              -- kg
  dimensions        VARCHAR(100) NULL,               -- VD: '30x20x15 cm'
  package_count     INTEGER      NOT NULL DEFAULT 1,
  -- Chi phí
  shipping_cost     NUMERIC(18,2) NOT NULL DEFAULT 0,
  cod_amount        NUMERIC(18,2) NOT NULL DEFAULT 0, -- Tiền thu hộ (COD)
  insurance_amount  NUMERIC(18,2) NOT NULL DEFAULT 0,
  notes             TEXT         NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_shipments_tracking  ON shipments(tracking_number);
CREATE INDEX idx_shipments_order            ON shipments(order_id);
CREATE INDEX idx_shipments_supplier         ON shipments(supplier_id);
CREATE INDEX idx_shipments_status           ON shipments(status);
CREATE INDEX idx_shipments_carrier          ON shipments(carrier);
CREATE INDEX idx_shipments_estimated        ON shipments(estimated_date);
CREATE INDEX idx_shipments_date             ON shipments(created_at DESC);

-- Events (append-only tracking log)
CREATE TABLE shipment_events (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id  UUID         NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status       VARCHAR(100) NOT NULL,               -- Mô tả sự kiện
  location     VARCHAR(255) NULL,                   -- Vị trí vật lý
  description  TEXT         NULL,
  source       VARCHAR(50)  NOT NULL DEFAULT 'System'
               CHECK (source IN ('System', 'Carrier', 'Manual')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_date     ON shipment_events(created_at DESC);
```

---

## 7. Bảng `shipping_rates`

> TypeScript: `ShippingRate` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE shipping_rates (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id    UUID          NOT NULL REFERENCES suppliers(id),
  carrier        VARCHAR(255)  NOT NULL,
  origin_city    VARCHAR(100)  NOT NULL,
  dest_city      VARCHAR(100)  NOT NULL,
  weight_from    NUMERIC(10,3) NOT NULL DEFAULT 0,  -- kg
  weight_to      NUMERIC(10,3) NULL,                -- NULL = không giới hạn
  base_rate      NUMERIC(18,2) NOT NULL,            -- Giá cơ bản
  per_kg_rate    NUMERIC(18,2) NOT NULL DEFAULT 0,  -- Giá thêm mỗi kg vượt mức
  estimated_days INTEGER       NOT NULL DEFAULT 1,   -- Số ngày giao hàng dự kiến
  service_type   VARCHAR(50)   NULL,                 -- 'Tiêu chuẩn', 'Nhanh', 'Hỏa tốc'
  is_active      BOOLEAN       NOT NULL DEFAULT true,
  notes          TEXT          NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipping_rates_supplier ON shipping_rates(supplier_id);
CREATE INDEX idx_shipping_rates_route    ON shipping_rates(origin_city, dest_city);
CREATE INDEX idx_shipping_rates_active   ON shipping_rates(is_active) WHERE is_active = true;
```

---

## 8. Bảng `payments`

> TypeScript: `Payment` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE payments (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number    VARCHAR(50)   NOT NULL UNIQUE,   -- VD: 'PAY-20260315-001'
  order_id          UUID          NOT NULL REFERENCES orders(id),
  order_number      VARCHAR(50)   NULL,              -- Denormalized
  buyer_id          UUID          NOT NULL REFERENCES users(id),
  buyer_name        VARCHAR(255)  NULL,              -- Denormalized
  supplier_id       UUID          NOT NULL REFERENCES suppliers(id),
  supplier_name     VARCHAR(255)  NULL,              -- Denormalized
  amount            NUMERIC(18,2) NOT NULL,          -- Tổng số tiền phải thanh toán
  paid_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,-- Đã thanh toán
  remaining_amount  NUMERIC(18,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  currency          VARCHAR(10)   NOT NULL DEFAULT 'VND',
  status            VARCHAR(50)   NOT NULL DEFAULT 'Chờ thanh toán'
                    CHECK (status IN (
                      'Chờ thanh toán', 'Thanh toán một phần', 'Đã thanh toán',
                      'Quá hạn', 'Hoàn tiền', 'Đã huỷ'
                    )),
  payment_method    VARCHAR(100)  NULL,              -- 'Chuyển khoản', 'COD', 'Ví điện tử'…
  payment_terms     VARCHAR(255)  NULL,              -- '30 ngày', 'Ngay khi nhận'…
  due_date          TIMESTAMPTZ   NULL,
  invoice_id        UUID          NULL REFERENCES invoices(id) ON DELETE SET NULL,
  -- Phí trễ hạn
  late_fee          NUMERIC(18,2) NOT NULL DEFAULT 0,
  late_fee_rate     NUMERIC(5,2)  NOT NULL DEFAULT 0, -- % phí trễ/tháng
  is_overdue        BOOLEAN       NOT NULL DEFAULT false,
  -- Nhắc nhở
  reminder_count    INTEGER       NOT NULL DEFAULT 0,
  last_reminder_at  TIMESTAMPTZ   NULL,
  notes             TEXT          NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_payments_number     ON payments(payment_number);
CREATE INDEX idx_payments_order             ON payments(order_id);
CREATE INDEX idx_payments_buyer             ON payments(buyer_id);
CREATE INDEX idx_payments_supplier          ON payments(supplier_id);
CREATE INDEX idx_payments_status            ON payments(status);
CREATE INDEX idx_payments_due_date          ON payments(due_date);
CREATE INDEX idx_payments_overdue           ON payments(is_overdue) WHERE is_overdue = true;
CREATE INDEX idx_payments_date              ON payments(created_at DESC);
```

---

## 9. Bảng `payment_transactions`

> TypeScript: `PaymentTransaction` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE payment_transactions (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id      UUID          NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount          NUMERIC(18,2) NOT NULL,
  type            VARCHAR(50)   NOT NULL
                  CHECK (type IN ('Thanh toán', 'Hoàn tiền', 'Phí', 'Điều chỉnh')),
  method          VARCHAR(100)  NOT NULL,            -- 'Chuyển khoản', 'Tiền mặt'…
  status          VARCHAR(50)   NOT NULL DEFAULT 'Thành công'
                  CHECK (status IN ('Thành công', 'Thất bại', 'Đang xử lý', 'Đã huỷ')),
  reference_code  VARCHAR(255)  NULL,                -- Mã giao dịch ngân hàng
  gateway_ref     VARCHAR(255)  NULL,                -- Mã tham chiếu cổng TT
  note            TEXT          NULL,
  performed_by    UUID          NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_txn_payment ON payment_transactions(payment_id);
CREATE INDEX idx_payment_txn_status  ON payment_transactions(status);
CREATE INDEX idx_payment_txn_date    ON payment_transactions(created_at DESC);
```

---

## 10. Bảng `invoices` + `invoice_items`

> TypeScript: `Invoice`, `InvoiceItem` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE invoices (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number  VARCHAR(50)   NOT NULL UNIQUE,     -- VD: 'INV-20260315-001'
  order_id        UUID          NULL REFERENCES orders(id) ON DELETE SET NULL,
  order_number    VARCHAR(50)   NULL,                -- Denormalized
  seller_id       UUID          NOT NULL REFERENCES suppliers(id),
  seller_name     VARCHAR(255)  NOT NULL,
  seller_tax_id   VARCHAR(50)   NULL,                -- Mã số thuế NCC
  seller_address  TEXT          NULL,
  buyer_id        UUID          NOT NULL REFERENCES users(id),
  buyer_name      VARCHAR(255)  NOT NULL,
  buyer_company   VARCHAR(255)  NULL,
  buyer_tax_id    VARCHAR(50)   NULL,
  buyer_address   TEXT          NULL,
  -- Số tiền
  subtotal        NUMERIC(18,2) NOT NULL,
  tax_rate        NUMERIC(5,2)  NOT NULL DEFAULT 10, -- % VAT
  tax_amount      NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(18,2) NOT NULL,
  -- Trạng thái & loại
  status          VARCHAR(50)   NOT NULL DEFAULT 'Bản nháp'
                  CHECK (status IN ('Bản nháp', 'Đã gửi', 'Đã thanh toán', 'Quá hạn', 'Đã huỷ')),
  invoice_type    VARCHAR(50)   NOT NULL DEFAULT 'Ban_hang'
                  CHECK (invoice_type IN ('Ban_hang', 'Tra_hang', 'Dieu_chinh')),
  -- Thời hạn
  issue_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE          NULL,
  paid_date       DATE          NULL,
  -- Nhắc nhở
  reminder_count  INTEGER       NOT NULL DEFAULT 0,
  last_reminder_at TIMESTAMPTZ  NULL,
  notes           TEXT          NULL,
  payment_terms   VARCHAR(255)  NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_invoices_number   ON invoices(invoice_number);
CREATE INDEX idx_invoices_order           ON invoices(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_invoices_seller          ON invoices(seller_id);
CREATE INDEX idx_invoices_buyer           ON invoices(buyer_id);
CREATE INDEX idx_invoices_status          ON invoices(status);
CREATE INDEX idx_invoices_due_date        ON invoices(due_date);
CREATE INDEX idx_invoices_date            ON invoices(created_at DESC);

CREATE TABLE invoice_items (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id     UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id     UUID          NULL REFERENCES products(id),
  product_name   VARCHAR(500)  NOT NULL,
  sku            VARCHAR(100)  NULL,
  quantity       INTEGER       NOT NULL CHECK (quantity > 0),
  unit           VARCHAR(50)   NULL DEFAULT 'Cái',
  unit_price     NUMERIC(18,2) NOT NULL,
  tax_rate       NUMERIC(5,2)  NOT NULL DEFAULT 10,
  total_price    NUMERIC(18,2) NOT NULL,
  discount       NUMERIC(18,2) NOT NULL DEFAULT 0,
  note           TEXT          NULL
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
```

---

## 11. Bảng `credit_limits` + `credit_transactions`

> TypeScript: `CreditLimit`, `CreditTransaction` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE credit_limits (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id          UUID          NOT NULL REFERENCES users(id),
  buyer_name        VARCHAR(255)  NULL,              -- Denormalized
  supplier_id       UUID          NOT NULL REFERENCES suppliers(id),
  supplier_name     VARCHAR(255)  NULL,              -- Denormalized
  credit_limit      NUMERIC(18,2) NOT NULL DEFAULT 0,-- Hạn mức tín dụng
  used_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,-- Đã sử dụng
  available_amount  NUMERIC(18,2) GENERATED ALWAYS AS (credit_limit - used_amount) STORED,
  currency          VARCHAR(10)   NOT NULL DEFAULT 'VND',
  status            VARCHAR(50)   NOT NULL DEFAULT 'Hoạt động'
                    CHECK (status IN ('Hoạt động', 'Tạm khóa', 'Đã huỷ')),
  due_days          INTEGER       NOT NULL DEFAULT 30,-- Số ngày được nợ
  notes             TEXT          NULL,
  valid_until       TIMESTAMPTZ   NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (buyer_id, supplier_id)                     -- 1 hạn mức/cặp buyer-supplier
);

CREATE INDEX idx_credit_limits_buyer    ON credit_limits(buyer_id);
CREATE INDEX idx_credit_limits_supplier ON credit_limits(supplier_id);
CREATE INDEX idx_credit_limits_status   ON credit_limits(status);

CREATE TABLE credit_transactions (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_limit_id  UUID          NOT NULL REFERENCES credit_limits(id) ON DELETE CASCADE,
  type             VARCHAR(50)   NOT NULL
                   CHECK (type IN ('Tăng nợ', 'Giảm nợ', 'Điều chỉnh', 'Hủy')),
  amount           NUMERIC(18,2) NOT NULL,
  balance_before   NUMERIC(18,2) NOT NULL DEFAULT 0,
  balance_after    NUMERIC(18,2) NOT NULL DEFAULT 0,
  reference_type   VARCHAR(50)   NULL,               -- 'Order', 'Payment', 'Manual'
  reference_id     UUID          NULL,
  reference_number VARCHAR(100)  NULL,
  note             TEXT          NULL,
  performed_by     UUID          NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_txn_limit ON credit_transactions(credit_limit_id);
CREATE INDEX idx_credit_txn_date  ON credit_transactions(created_at DESC);
```

---

## 12. Bảng `debit_credit_notes` + `debit_credit_items`

> TypeScript: `DebitCreditNote`, `DebitCreditItem` | Source: `/src/app/types/index.ts`
> **Lưu ý**: `seller_id` = `supplier_id` trong context này

```sql
CREATE TABLE debit_credit_notes (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  note_number       VARCHAR(50)   NOT NULL UNIQUE,   -- VD: 'DCN-20260315-001'
  type              VARCHAR(20)   NOT NULL
                    CHECK (type IN ('Debit', 'Credit')),
  -- Debit Note = buyer ghi nợ seller (seller phải trả)
  -- Credit Note = seller ghi có buyer (buyer được hoàn)
  buyer_id          UUID          NOT NULL REFERENCES users(id),
  buyer_name        VARCHAR(255)  NULL,              -- Denormalized
  seller_id         UUID          NOT NULL REFERENCES suppliers(id), -- = supplier_id
  seller_name       VARCHAR(255)  NULL,              -- Denormalized
  order_id          UUID          NULL REFERENCES orders(id) ON DELETE SET NULL,
  order_number      VARCHAR(50)   NULL,
  invoice_id        UUID          NULL REFERENCES invoices(id) ON DELETE SET NULL,
  invoice_number    VARCHAR(50)   NULL,
  amount            NUMERIC(18,2) NOT NULL,
  reason            VARCHAR(255)  NOT NULL,          -- 'Trả hàng', 'Điều chỉnh', 'Thiếu hàng'
  status            VARCHAR(50)   NOT NULL DEFAULT 'Chờ xác nhận'
                    CHECK (status IN ('Chờ xác nhận', 'Đã xác nhận (Buyer)', 'Đã xác nhận',
                                      'Từ chối', 'Đã huỷ')),
  confirmed_by_buyer   BOOLEAN    NOT NULL DEFAULT false,
  confirmed_by_seller  BOOLEAN    NOT NULL DEFAULT false,
  confirmed_buyer_at   TIMESTAMPTZ NULL,
  confirmed_seller_at  TIMESTAMPTZ NULL,
  notes             TEXT          NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_dcn_number    ON debit_credit_notes(note_number);
CREATE INDEX idx_dcn_buyer            ON debit_credit_notes(buyer_id);
CREATE INDEX idx_dcn_seller           ON debit_credit_notes(seller_id);
CREATE INDEX idx_dcn_order            ON debit_credit_notes(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_dcn_status           ON debit_credit_notes(status);
CREATE INDEX idx_dcn_date             ON debit_credit_notes(created_at DESC);

CREATE TABLE debit_credit_items (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id       UUID          NOT NULL REFERENCES debit_credit_notes(id) ON DELETE CASCADE,
  product_id    UUID          NULL REFERENCES products(id),
  product_name  VARCHAR(500)  NOT NULL,
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(18,2) NOT NULL,
  total_price   NUMERIC(18,2) NOT NULL,
  unit          VARCHAR(50)   NULL DEFAULT 'Cái',
  reason        TEXT          NULL
);

CREATE INDEX idx_dci_note    ON debit_credit_items(note_id);
CREATE INDEX idx_dci_product ON debit_credit_items(product_id);
```

---

## Relationships (ER Diagram)

### Domain Kho hàng

```
suppliers
   └──► warehouses
            └──► inventory_items ◄── products
            └──► stock_movements ◄── users (performed_by)
            └──► stock_alerts    ◄── users (acknowledged_by, resolved_by)
   └──► warehouse_transfers
            ├──► warehouses (from)
            ├──► warehouses (to)
            └──► warehouse_transfer_items ◄── products
```

### Domain Vận chuyển

```
orders
   └──► shipments (1 order → N shipments)
            └──► shipment_events (append-only tracking log)
suppliers
   └──► shipping_rates (carrier pricing)
```

### Domain Tài chính

```
orders
   └──► payments (1 order → 1 payment)
            └──► payment_transactions (N giao dịch/payment)
   └──► invoices (1 order → N invoices)
            └──► invoice_items
payments ◄──► invoices (payment.invoice_id)

buyers ←→ suppliers
   └──► credit_limits (1 cặp buyer-supplier → 1 hạn mức)
            └──► credit_transactions (lịch sử tín dụng)
   └──► debit_credit_notes (ghi nợ/ghi có)
            └──► debit_credit_items
```

---

## Domain Indexes & Performance Notes

### Warehouse Domain

| Bảng | Index quan trọng | Mục đích |
|------|-----------------|----------|
| `inventory_items` | `(warehouse_id, product_id, variant_id)` | Unique check khi nhập/xuất |
| `inventory_items` | partial `quantity <= min_stock` | Tìm hàng sắp hết nhanh |
| `stock_movements` | `(reference_type, reference_id)` | Tìm lịch sử theo đơn hàng |
| `warehouse_transfers` | `(from_warehouse_id, status)` | Filter theo kho và trạng thái |

### Finance Domain

| Bảng | Index quan trọng | Mục đích |
|------|-----------------|----------|
| `payments` | `(status)` partial `overdue` | Dashboard tài chính |
| `payments` | `(due_date)` | Tìm hóa đơn quá hạn |
| `invoices` | `(seller_id, status)` | Report doanh thu seller |
| `credit_limits` | `UNIQUE (buyer_id, supplier_id)` | Đảm bảo chỉ 1 hạn mức/cặp |

### Composite Indexes (Recommended)

```sql
-- Tìm hóa đơn quá hạn của supplier
CREATE INDEX idx_invoices_seller_overdue
  ON invoices(seller_id, due_date)
  WHERE status = 'Quá hạn';

-- Dashboard: shipments đang giao của supplier
CREATE INDEX idx_shipments_supplier_active
  ON shipments(supplier_id, status)
  WHERE status IN ('Đang vận chuyển', 'Đang giao');

-- Tìm tồn kho sắp hết theo supplier
CREATE INDEX idx_inventory_supplier_low
  ON inventory_items(supplier_id, quantity, min_stock)
  WHERE quantity <= min_stock;
```

---

## Tài liệu liên quan

- [04-database-schema-part1.md](./04-database-schema-part1.md) — Schema: Người dùng, Sản phẩm, Nhà cung cấp
- [05-database-schema-part2.md](./05-database-schema-part2.md) — Schema: Đơn hàng, Giỏ hàng, RFQ, Hợp đồng
- [07-database-schema-part4.md](./07-database-schema-part4.md) — Schema: Trả hàng, Đánh giá, Khuyến mãi, Phê duyệt
- [08-erd.md](./08-erd.md) — ERD tổng thể hệ thống
- [14-business-rules-part1.md](./14-business-rules-part1.md) — Business rules: Core Commerce
