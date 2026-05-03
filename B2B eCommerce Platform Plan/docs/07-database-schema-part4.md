# 07 — Database Schema (Part 4): Trả hàng, Đánh giá, Khuyến mãi, Phê duyệt & Hệ thống

> Schema các domain phụ trợ & hệ thống — mapping với TypeScript types.
> Quy ước chung xem [04-database-schema-part1.md](./04-database-schema-part1.md#quy-ước-chung).

---

## 1. Bảng `return_requests` + `return_items` + `return_images`

> TypeScript: `ReturnRequest`, `ReturnItem` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE return_requests (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number    VARCHAR(50)  NOT NULL UNIQUE,    -- VD: 'RET-20260315-001'
  order_id         UUID         NOT NULL REFERENCES orders(id),
  order_number     VARCHAR(50)  NULL,               -- Denormalized
  buyer_id         UUID         NOT NULL REFERENCES users(id),
  buyer_name       VARCHAR(255) NULL,               -- Denormalized
  supplier_id      UUID         NOT NULL REFERENCES suppliers(id),
  supplier_name    VARCHAR(255) NULL,               -- Denormalized
  reason           TEXT         NOT NULL,           -- Lý do trả hàng
  status           VARCHAR(50)  NOT NULL DEFAULT 'Chờ xử lý'
                   CHECK (status IN (
                     'Chờ xử lý', 'Đã nhận', 'Đang kiểm tra',
                     'Chấp nhận', 'Từ chối', 'Đã hoàn tiền'
                   )),
  total_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,-- Tổng giá trị trả hàng
  refund_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,-- Đã hoàn lại
  inspect_note     TEXT          NULL,              -- Ghi chú kiểm tra
  inspect_by       UUID          NULL REFERENCES users(id),
  inspect_at       TIMESTAMPTZ   NULL,
  refund_at        TIMESTAMPTZ   NULL,
  notes            TEXT          NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_returns_number   ON return_requests(return_number);
CREATE INDEX idx_returns_order           ON return_requests(order_id);
CREATE INDEX idx_returns_buyer           ON return_requests(buyer_id);
CREATE INDEX idx_returns_supplier        ON return_requests(supplier_id);
CREATE INDEX idx_returns_status          ON return_requests(status);
CREATE INDEX idx_returns_date            ON return_requests(created_at DESC);

CREATE TABLE return_items (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id     UUID          NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id UUID          NULL REFERENCES order_items(id),
  product_id    UUID          NOT NULL REFERENCES products(id),
  product_name  VARCHAR(500)  NOT NULL,             -- Denormalized
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(18,2) NOT NULL,
  reason        TEXT          NULL,
  condition     VARCHAR(100)  NULL                  -- 'Nguyên vẹn', 'Hỏng hóc', 'Thiếu phụ kiện'
);

CREATE INDEX idx_return_items_return  ON return_items(return_id);
CREATE INDEX idx_return_items_product ON return_items(product_id);

CREATE TABLE return_images (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id   UUID         NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  url         TEXT         NOT NULL,
  alt_text    VARCHAR(255) NULL,
  uploaded_by UUID         NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_return_images_return ON return_images(return_id);
```

---

## 2. Bảng `product_reviews` + `review_images` + `review_tags`

> TypeScript: `ProductReview` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE product_reviews (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id        UUID          NOT NULL REFERENCES products(id),
  order_id          UUID          NULL REFERENCES orders(id) ON DELETE SET NULL,
  order_item_id     UUID          NULL REFERENCES order_items(id),
  buyer_id          UUID          NOT NULL REFERENCES users(id),
  buyer_name        VARCHAR(255)  NULL,             -- Denormalized
  buyer_company     VARCHAR(255)  NULL,             -- Denormalized
  supplier_id       UUID          NOT NULL REFERENCES suppliers(id),
  rating            SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             VARCHAR(255)  NULL,
  content           TEXT          NULL,
  pros              TEXT          NULL,
  cons              TEXT          NULL,
  is_verified       BOOLEAN       NOT NULL DEFAULT false, -- Đã mua hàng
  is_anonymous      BOOLEAN       NOT NULL DEFAULT false,
  helpful_count     INTEGER       NOT NULL DEFAULT 0,
  report_count      INTEGER       NOT NULL DEFAULT 0,
  status            VARCHAR(50)   NOT NULL DEFAULT 'Đã duyệt'
                    CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Bị ẩn', 'Bị xoá')),
  seller_reply      TEXT          NULL,
  seller_reply_at   TIMESTAMPTZ   NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (order_item_id, buyer_id)                  -- 1 review/order item
);

CREATE INDEX idx_reviews_product   ON product_reviews(product_id);
CREATE INDEX idx_reviews_buyer     ON product_reviews(buyer_id);
CREATE INDEX idx_reviews_supplier  ON product_reviews(supplier_id);
CREATE INDEX idx_reviews_rating    ON product_reviews(rating);
CREATE INDEX idx_reviews_status    ON product_reviews(status);
CREATE INDEX idx_reviews_date      ON product_reviews(created_at DESC);

CREATE TABLE review_images (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id  UUID         NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  url        TEXT         NOT NULL,
  sort_order SMALLINT     NOT NULL DEFAULT 0
);
CREATE INDEX idx_review_images_review ON review_images(review_id);

CREATE TABLE review_tags (
  id        UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID         NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  tag       VARCHAR(100) NOT NULL
);
CREATE INDEX idx_review_tags_review ON review_tags(review_id);
```

---

## 3. Bảng `supplier_reviews` + `supplier_review_tags`

> TypeScript: `SupplierReview` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE supplier_reviews (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id     UUID          NOT NULL REFERENCES suppliers(id),
  buyer_id        UUID          NOT NULL REFERENCES users(id),
  buyer_name      VARCHAR(255)  NULL,               -- Denormalized
  buyer_company   VARCHAR(255)  NULL,               -- Denormalized
  order_id        UUID          NULL REFERENCES orders(id) ON DELETE SET NULL,
  -- Đánh giá đa chiều
  overall_rating      SMALLINT  NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating      SMALLINT  NULL CHECK (quality_rating BETWEEN 1 AND 5),
  delivery_rating     SMALLINT  NULL CHECK (delivery_rating BETWEEN 1 AND 5),
  communication_rating SMALLINT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  title           VARCHAR(255)  NULL,
  content         TEXT          NULL,
  helpful_count   INTEGER       NOT NULL DEFAULT 0,
  status          VARCHAR(50)   NOT NULL DEFAULT 'Đã duyệt'
                  CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Bị ẩn')),
  seller_reply    TEXT          NULL,
  seller_reply_at TIMESTAMPTZ   NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (supplier_id, buyer_id, order_id)          -- 1 review/cặp supplier-buyer-order
);

CREATE INDEX idx_supplier_reviews_supplier ON supplier_reviews(supplier_id);
CREATE INDEX idx_supplier_reviews_buyer    ON supplier_reviews(buyer_id);
CREATE INDEX idx_supplier_reviews_rating   ON supplier_reviews(overall_rating);

CREATE TABLE supplier_review_tags (
  id        UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID         NOT NULL REFERENCES supplier_reviews(id) ON DELETE CASCADE,
  tag       VARCHAR(100) NOT NULL
);
CREATE INDEX idx_supplier_review_tags ON supplier_review_tags(review_id);
```

---

## 4. Bảng `promotions` + `promotion_products` + `promotion_categories` + `volume_discounts`

> TypeScript: `Promotion`, `VolumeDiscount` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE promotions (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  code            VARCHAR(50)   NOT NULL UNIQUE,
  name            VARCHAR(255)  NOT NULL,
  description     TEXT          NULL,
  type            VARCHAR(50)   NOT NULL
                  CHECK (type IN ('Phần trăm', 'Số tiền', 'Mua X tặng Y')),
  value           NUMERIC(10,2) NOT NULL,           -- % hoặc số tiền giảm
  min_order_value NUMERIC(18,2) NOT NULL DEFAULT 0, -- Đơn hàng tối thiểu
  max_discount    NUMERIC(18,2) NULL,               -- Giảm tối đa (cho loại %)
  usage_limit     INTEGER       NULL,               -- NULL = không giới hạn
  used_count      INTEGER       NOT NULL DEFAULT 0,
  scope           VARCHAR(50)   NOT NULL DEFAULT 'all'
                  CHECK (scope IN ('all', 'specificProducts', 'specificCategories')),
  supplier_id     UUID          NULL REFERENCES suppliers(id), -- NULL = platform-wide
  start_date      TIMESTAMPTZ   NOT NULL,
  end_date        TIMESTAMPTZ   NOT NULL,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CHECK (start_date < end_date),
  CHECK (used_count >= 0)
);

CREATE UNIQUE INDEX idx_promotions_code      ON promotions(code);
CREATE INDEX idx_promotions_supplier         ON promotions(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX idx_promotions_dates            ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_active           ON promotions(is_active) WHERE is_active = true;

CREATE TABLE promotion_products (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id),
  UNIQUE (promotion_id, product_id)
);
CREATE INDEX idx_promo_products_promo   ON promotion_products(promotion_id);
CREATE INDEX idx_promo_products_product ON promotion_products(product_id);

CREATE TABLE promotion_categories (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id),
  UNIQUE (promotion_id, category_id)
);
CREATE INDEX idx_promo_categories_promo ON promotion_categories(promotion_id);

CREATE TABLE volume_discounts (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id UUID          NOT NULL REFERENCES suppliers(id),
  min_qty     INTEGER       NOT NULL CHECK (min_qty > 0),
  max_qty     INTEGER       NULL,                   -- NULL = không giới hạn
  discount    NUMERIC(5,2)  NOT NULL,               -- % giảm
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_vol_discounts_product  ON volume_discounts(product_id);
CREATE INDEX idx_vol_discounts_supplier ON volume_discounts(supplier_id);
```

---

## 5. Bảng `approval_requests` + `approval_rules` + `approval_steps`

> TypeScript: `ApprovalRequest`, `ApprovalRule`, `ApprovalStep` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE approval_rules (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id     UUID          NULL REFERENCES suppliers(id), -- NULL = buyer-side rule
  buyer_id        UUID          NULL REFERENCES users(id),
  rule_type       VARCHAR(50)   NOT NULL
                  CHECK (rule_type IN ('Order', 'PR', 'Contract', 'Budget')),
  threshold_min   NUMERIC(18,2) NOT NULL DEFAULT 0,
  threshold_max   NUMERIC(18,2) NULL,
  approver_role   VARCHAR(100)  NOT NULL,           -- 'Manager', 'Director', 'CEO'
  approver_id     UUID          NULL REFERENCES users(id),
  level           SMALLINT      NOT NULL DEFAULT 1, -- Cấp phê duyệt
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_rules_supplier ON approval_rules(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX idx_approval_rules_buyer    ON approval_rules(buyer_id)    WHERE buyer_id    IS NOT NULL;
CREATE INDEX idx_approval_rules_type     ON approval_rules(rule_type);

CREATE TABLE approval_requests (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number   VARCHAR(50)   NOT NULL UNIQUE,
  rule_id          UUID          NULL REFERENCES approval_rules(id),
  entity_type      VARCHAR(50)   NOT NULL
                   CHECK (entity_type IN ('Order', 'PR', 'Contract', 'Budget', 'Quotation')),
  entity_id        UUID          NOT NULL,
  entity_number    VARCHAR(100)  NULL,              -- Denormalized
  amount           NUMERIC(18,2) NULL,
  requested_by     UUID          NOT NULL REFERENCES users(id),
  requested_by_name VARCHAR(255) NULL,              -- Denormalized
  status           VARCHAR(50)   NOT NULL DEFAULT 'Chờ duyệt'
                   CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã huỷ')),
  due_date         TIMESTAMPTZ   NULL,
  notes            TEXT          NULL,
  reject_reason    TEXT          NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_approval_req_number ON approval_requests(request_number);
CREATE INDEX idx_approval_req_entity        ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_approval_req_status        ON approval_requests(status);
CREATE INDEX idx_approval_req_requester     ON approval_requests(requested_by);

CREATE TABLE approval_steps (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id      UUID          NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  step_order      SMALLINT      NOT NULL DEFAULT 1,
  approver_id     UUID          NOT NULL REFERENCES users(id),
  approver_name   VARCHAR(255)  NULL,               -- Denormalized
  approver_role   VARCHAR(100)  NULL,
  status          VARCHAR(50)   NOT NULL DEFAULT 'Chờ duyệt'
                  CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Bỏ qua')),
  response_note   TEXT          NULL,
  responded_at    TIMESTAMPTZ   NULL,
  escalated_at    TIMESTAMPTZ   NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_steps_request  ON approval_steps(request_id);
CREATE INDEX idx_approval_steps_approver ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_status   ON approval_steps(status);
```

---

## 6. Bảng `purchase_requisitions` + `pr_items`

> TypeScript: `PurchaseRequisition`, `PRItem` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE purchase_requisitions (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  pr_number        VARCHAR(50)   NOT NULL UNIQUE,
  buyer_id         UUID          NOT NULL REFERENCES users(id),
  buyer_name       VARCHAR(255)  NULL,
  department       VARCHAR(255)  NULL,
  title            VARCHAR(255)  NOT NULL,
  description      TEXT          NULL,
  total_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
  status           VARCHAR(50)   NOT NULL DEFAULT 'Bản nháp'
                   CHECK (status IN (
                     'Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Từ chối',
                     'Đã tạo RFQ', 'Đã đặt hàng', 'Hoàn thành', 'Đã huỷ'
                   )),
  priority         VARCHAR(50)   NULL CHECK (priority IN ('Thường', 'Gấp', 'Rất gấp')),
  required_date    TIMESTAMPTZ   NULL,              -- Ngày cần hàng
  budget_id        UUID          NULL,              -- FK mềm đến budget_allocations
  rfq_id           UUID          NULL REFERENCES rfqs(id) ON DELETE SET NULL,
  order_id         UUID          NULL REFERENCES orders(id) ON DELETE SET NULL,
  approval_id      UUID          NULL REFERENCES approval_requests(id),
  notes            TEXT          NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_pr_number  ON purchase_requisitions(pr_number);
CREATE INDEX idx_pr_buyer          ON purchase_requisitions(buyer_id);
CREATE INDEX idx_pr_status         ON purchase_requisitions(status);
CREATE INDEX idx_pr_date           ON purchase_requisitions(created_at DESC);

CREATE TABLE pr_items (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  pr_id         UUID          NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
  product_id    UUID          NULL REFERENCES products(id),
  product_name  VARCHAR(500)  NOT NULL,
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  unit          VARCHAR(50)   NULL DEFAULT 'Cái',
  estimated_price NUMERIC(18,2) NULL,
  category_id   UUID          NULL REFERENCES categories(id),
  specifications TEXT         NULL,
  note          TEXT          NULL
);

CREATE INDEX idx_pr_items_pr      ON pr_items(pr_id);
CREATE INDEX idx_pr_items_product ON pr_items(product_id) WHERE product_id IS NOT NULL;
```

---

## 7. Bảng `goods_received_notes` + `grn_items` + `grn_images`

> TypeScript: `GoodsReceivedNote`, `GRNItem` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE goods_received_notes (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_number      VARCHAR(50)   NOT NULL UNIQUE,
  order_id        UUID          NOT NULL REFERENCES orders(id),
  order_number    VARCHAR(50)   NULL,               -- Denormalized
  supplier_id     UUID          NOT NULL REFERENCES suppliers(id),
  supplier_name   VARCHAR(255)  NULL,
  warehouse_id    UUID          NULL REFERENCES warehouses(id),
  received_by     UUID          NOT NULL REFERENCES users(id),
  received_by_name VARCHAR(255) NULL,
  status          VARCHAR(50)   NOT NULL DEFAULT 'Chờ kiểm tra'
                  CHECK (status IN ('Chờ kiểm tra', 'Đang kiểm tra', 'Hoàn thành', 'Có sự cố')),
  total_ordered   INTEGER       NOT NULL DEFAULT 0,
  total_received  INTEGER       NOT NULL DEFAULT 0,
  total_rejected  INTEGER       NOT NULL DEFAULT 0,
  has_discrepancy BOOLEAN       NOT NULL DEFAULT false,
  notes           TEXT          NULL,
  confirmed_at    TIMESTAMPTZ   NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_grn_number    ON goods_received_notes(grn_number);
CREATE INDEX idx_grn_order            ON goods_received_notes(order_id);
CREATE INDEX idx_grn_supplier         ON goods_received_notes(supplier_id);
CREATE INDEX idx_grn_warehouse        ON goods_received_notes(warehouse_id) WHERE warehouse_id IS NOT NULL;
CREATE INDEX idx_grn_status           ON goods_received_notes(status);

CREATE TABLE grn_items (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_id          UUID          NOT NULL REFERENCES goods_received_notes(id) ON DELETE CASCADE,
  order_item_id   UUID          NULL REFERENCES order_items(id),
  product_id      UUID          NOT NULL REFERENCES products(id),
  product_name    VARCHAR(500)  NOT NULL,
  ordered_qty     INTEGER       NOT NULL CHECK (ordered_qty > 0),
  received_qty    INTEGER       NOT NULL DEFAULT 0,
  rejected_qty    INTEGER       NOT NULL DEFAULT 0,
  unit            VARCHAR(50)   NULL DEFAULT 'Cái',
  condition       VARCHAR(100)  NULL,               -- 'Tốt', 'Hỏng', 'Thiếu'
  note            TEXT          NULL
);

CREATE INDEX idx_grn_items_grn     ON grn_items(grn_id);
CREATE INDEX idx_grn_items_product ON grn_items(product_id);

CREATE TABLE grn_images (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_id      UUID         NOT NULL REFERENCES goods_received_notes(id) ON DELETE CASCADE,
  url         TEXT         NOT NULL,
  description VARCHAR(255) NULL,
  uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_grn_images_grn ON grn_images(grn_id);
```

---

## 8. Bảng `budget_plans` + `budget_allocations` + `budget_transactions`

> TypeScript: `BudgetPlan`, `BudgetAllocation`, `BudgetTransaction` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE budget_plans (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id      UUID          NOT NULL REFERENCES users(id),
  name          VARCHAR(255)  NOT NULL,
  fiscal_year   SMALLINT      NOT NULL,             -- VD: 2026
  period        VARCHAR(20)   NOT NULL CHECK (period IN ('Năm', 'Quý', 'Tháng')),
  total_amount  NUMERIC(18,2) NOT NULL DEFAULT 0,
  used_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
  status        VARCHAR(50)   NOT NULL DEFAULT 'Bản nháp'
                CHECK (status IN ('Bản nháp', 'Đã duyệt', 'Đang thực hiện', 'Đã khoá')),
  start_date    DATE          NOT NULL,
  end_date      DATE          NOT NULL,
  notes         TEXT          NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_plans_buyer ON budget_plans(buyer_id);
CREATE INDEX idx_budget_plans_year  ON budget_plans(fiscal_year);

CREATE TABLE budget_allocations (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id         UUID          NOT NULL REFERENCES budget_plans(id) ON DELETE CASCADE,
  department      VARCHAR(255)  NULL,
  category_id     UUID          NULL REFERENCES categories(id),
  category_name   VARCHAR(255)  NULL,               -- Denormalized
  allocated_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  used_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(18,2) GENERATED ALWAYS AS (allocated_amount - used_amount) STORED,
  alert_threshold NUMERIC(5,2)  NOT NULL DEFAULT 80, -- Cảnh báo khi dùng > 80%
  notes           TEXT          NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_alloc_plan     ON budget_allocations(plan_id);
CREATE INDEX idx_budget_alloc_category ON budget_allocations(category_id) WHERE category_id IS NOT NULL;

CREATE TABLE budget_transactions (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id   UUID          NOT NULL REFERENCES budget_allocations(id) ON DELETE CASCADE,
  amount          NUMERIC(18,2) NOT NULL,
  type            VARCHAR(50)   NOT NULL CHECK (type IN ('Chi tiêu', 'Hoàn trả', 'Điều chỉnh')),
  reference_type  VARCHAR(50)   NULL,               -- 'Order', 'Invoice', 'PR'
  reference_id    UUID          NULL,
  reference_number VARCHAR(100) NULL,
  note            TEXT          NULL,
  performed_by    UUID          NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_txn_allocation ON budget_transactions(allocation_id);
CREATE INDEX idx_budget_txn_ref        ON budget_transactions(reference_type, reference_id)
  WHERE reference_id IS NOT NULL;
```

---

## 9. Bảng `notifications`

> TypeScript: `Notification` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE notifications (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(100)  NOT NULL,             -- 'order_status', 'rfq_response', 'payment_due'…
  title         VARCHAR(255)  NOT NULL,
  message       TEXT          NOT NULL,
  entity_type   VARCHAR(50)   NULL,                 -- 'Order', 'RFQ', 'Contract'…
  entity_id     UUID          NULL,                 -- FK mềm
  entity_number VARCHAR(100)  NULL,                 -- Denormalized
  is_read       BOOLEAN       NOT NULL DEFAULT false,
  read_at       TIMESTAMPTZ   NULL,
  priority      VARCHAR(20)   NOT NULL DEFAULT 'normal'
                CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  action_url    TEXT          NULL,                 -- Deep link đến trang liên quan
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user     ON notifications(user_id);
CREATE INDEX idx_notifications_unread   ON notifications(user_id, is_read)
  WHERE is_read = false;
CREATE INDEX idx_notifications_entity   ON notifications(entity_type, entity_id)
  WHERE entity_id IS NOT NULL;
CREATE INDEX idx_notifications_date     ON notifications(created_at DESC);
```

---

## 10. Bảng `activity_logs`

> TypeScript: `ActivityLog` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE activity_logs (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id),
  user_name     VARCHAR(255)  NULL,                 -- Denormalized
  user_role     VARCHAR(50)   NULL,                 -- Denormalized
  action        VARCHAR(100)  NOT NULL,             -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'…
  entity_type   VARCHAR(50)   NOT NULL,             -- 'Order', 'Product', 'User'…
  entity_id     UUID          NOT NULL,
  entity_label  VARCHAR(255)  NULL,                 -- Denormalized hiển thị
  changes       JSONB         NULL,                 -- {field: [before, after]}
  ip_address    INET          NULL,
  user_agent    TEXT          NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Append-only, không UPDATE/DELETE (retention policy xóa sau 90 ngày)
CREATE INDEX idx_activity_user       ON activity_logs(user_id);
CREATE INDEX idx_activity_entity     ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_action     ON activity_logs(action);
CREATE INDEX idx_activity_date       ON activity_logs(created_at DESC);
```

**Retention**: Xóa records cũ hơn 90 ngày bằng cron job hoặc Supabase Edge Function.

---

## 11. Bảng hệ thống (System Config)

> TypeScript: `SystemConfig`, `TaxConfig`, `PlatformFee`, `BannerConfig`, `EmailTemplate`

```sql
-- Cấu hình chung hệ thống (key-value store)
CREATE TABLE system_configs (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  key         VARCHAR(100) NOT NULL UNIQUE,
  value       TEXT         NOT NULL,
  type        VARCHAR(20)  NOT NULL DEFAULT 'string'
              CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description VARCHAR(500) NULL,
  updated_by  UUID         NULL REFERENCES users(id),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Ví dụ keys: 'site_name', 'site_logo', 'contact_email', 'maintenance_mode', 'default_tax_rate'

CREATE TABLE platform_fees (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  type        VARCHAR(50)   NOT NULL CHECK (type IN ('Giao dịch', 'Đăng ký', 'Niêm yết')),
  rate        NUMERIC(5,2)  NULL,                   -- % phí
  flat_fee    NUMERIC(18,2) NULL,                   -- Phí cố định
  min_fee     NUMERIC(18,2) NULL,
  max_fee     NUMERIC(18,2) NULL,
  applies_to  VARCHAR(50)   NULL,                   -- 'all', 'supplier', 'buyer'
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE banner_configs (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  image_url   TEXT         NOT NULL,
  link_url    TEXT         NULL,
  target_page VARCHAR(100) NULL,                    -- 'home', 'buyer', 'seller'…
  target_role VARCHAR(50)  NULL,                    -- 'Buyer', 'Seller', 'all'
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  start_date  TIMESTAMPTZ  NULL,
  end_date    TIMESTAMPTZ  NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_banner_configs_active ON banner_configs(is_active, target_role);

CREATE TABLE email_templates (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  key         VARCHAR(100) NOT NULL UNIQUE,         -- 'order_confirmed', 'payment_due'…
  name        VARCHAR(255) NOT NULL,
  subject     VARCHAR(500) NOT NULL,
  body_html   TEXT         NOT NULL,
  variables   JSONB        NOT NULL DEFAULT '[]',   -- Danh sách biến: ['orderId', 'buyerName'…]
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  updated_by  UUID         NULL REFERENCES users(id),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

## 12. Bảng `buyer_companies` + `buyer_team_members`

> TypeScript: `BuyerCompany`, `BuyerTeamMember` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE buyer_companies (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id         UUID         NOT NULL REFERENCES users(id) UNIQUE,
  company_name     VARCHAR(255) NOT NULL,
  tax_id           VARCHAR(50)  NULL,
  industry         VARCHAR(100) NULL,
  employee_count   INTEGER      NULL,
  website          VARCHAR(500) NULL,
  address          TEXT         NULL,
  logo_url         TEXT         NULL,
  is_verified      BOOLEAN      NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE buyer_team_members (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id   UUID         NOT NULL REFERENCES buyer_companies(id) ON DELETE CASCADE,
  user_id      UUID         NOT NULL REFERENCES users(id),
  role         VARCHAR(50)  NOT NULL DEFAULT 'Viewer'
               CHECK (role IN ('Owner', 'Manager', 'Viewer')),
  permissions  JSONB        NOT NULL DEFAULT '[]',  -- string[] quyền cụ thể
  joined_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  is_active    BOOLEAN      NOT NULL DEFAULT true,

  UNIQUE (company_id, user_id)
);

CREATE INDEX idx_buyer_team_company ON buyer_team_members(company_id);
CREATE INDEX idx_buyer_team_user    ON buyer_team_members(user_id);
```

---

## 13. Bảng `payment_reminders`

> TypeScript: `PaymentReminder` | Source: `/src/app/types/index.ts`

```sql
CREATE TABLE payment_reminders (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id  UUID         NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  buyer_id    UUID         NOT NULL REFERENCES users(id),
  sent_by     UUID         NOT NULL REFERENCES users(id),
  sent_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  channel     VARCHAR(50)  NOT NULL DEFAULT 'inApp'
              CHECK (channel IN ('inApp', 'email', 'sms')),
  message     TEXT         NULL,
  status      VARCHAR(50)  NOT NULL DEFAULT 'Đã gửi'
              CHECK (status IN ('Đã gửi', 'Thất bại'))
);

CREATE INDEX idx_reminders_payment ON payment_reminders(payment_id);
CREATE INDEX idx_reminders_buyer   ON payment_reminders(buyer_id);
```

---

## Relationships Summary

```
orders
  └──► return_requests ──► return_items, return_images
       └──► product_reviews (sau khi hoàn thành)
            └──► review_images, review_tags

suppliers
  └──► supplier_reviews ──► supplier_review_tags
  └──► promotions ──► promotion_products, promotion_categories
  └──► volume_discounts (per product)

users (buyer)
  └──► purchase_requisitions ──► pr_items
       └──► approval_requests ──► approval_steps
       └──► goods_received_notes ──► grn_items, grn_images
  └──► budget_plans ──► budget_allocations ──► budget_transactions
  └──► notifications
  └──► buyer_companies ──► buyer_team_members

System (admin-managed)
  └──► system_configs (key-value)
  └──► platform_fees
  └──► banner_configs
  └──► email_templates
  └──► activity_logs (append-only, 90 ngày)
```

---

## Tài liệu liên quan

- [05-database-schema-part2.md](./05-database-schema-part2.md) — Schema: Đơn hàng, RFQ, Hợp đồng
- [06-database-schema-part3.md](./06-database-schema-part3.md) — Schema: Kho, Vận chuyển, Thanh toán
- [08-erd.md](./08-erd.md) — ERD tổng thể hệ thống
- [15-business-rules-part2.md](./15-business-rules-part2.md) — Business rules: Sourcing & Procurement
- [16-business-rules-part3.md](./16-business-rules-part3.md) — Business rules: Platform & System
