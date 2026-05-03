# 04 — Database Schema (Part 1): Người dùng, Sản phẩm, Danh mục, Nhà cung cấp

> Schema chi tiết các bảng core — mapping 1:1 giữa TypeScript types và PostgreSQL tables.
> Dùng cho Supabase migration & AI vibe coding context.

---

## Quy ước chung

| Quy ước | Mô tả |
|---------|-------|
| **PK** | `id UUID DEFAULT gen_random_uuid() PRIMARY KEY` |
| **FK** | `xxx_id UUID REFERENCES xxx(id)` — ON DELETE SET NULL hoặc CASCADE tùy context |
| **Naming cột** | `snake_case` (TypeScript `camelCase` → DB `snake_case`) |
| **Timestamps** | `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()` |
| **Soft delete** | `is_active BOOLEAN DEFAULT true` (không dùng `deleted_at`) |
| **NOT NULL** | Cột bắt buộc ghi `NOT NULL`, optional ghi `NULL` |
| **DEFAULT** | Ghi rõ `DEFAULT` nếu có |
| **INDEX** | Ghi cuối mỗi bảng |
| **Data types** | `UUID`, `VARCHAR(n)`, `TEXT`, `INTEGER`, `NUMERIC(p,s)`, `BOOLEAN`, `TIMESTAMPTZ`, `JSONB` |

> **Mapping TypeScript → SQL**: `string` → `VARCHAR`/`TEXT`/`UUID`, `number` → `INTEGER`/`NUMERIC`, `boolean` → `BOOLEAN`, `string (ISO)` → `TIMESTAMPTZ`, `T[]`/`Record<>` → `JSONB`, `union type` → `VARCHAR` + CHECK.

---

## 1. Bảng `users`

> TypeScript: `User`, `AuthUser` | Source: `/src/app/types/index.ts` dòng 244, 383

```sql
CREATE TABLE users (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(50)  NOT NULL CHECK (role IN ('Người mua', 'Nhà cung cấp', 'Quản trị viên')),
  status          VARCHAR(50)  NOT NULL DEFAULT 'Chờ xác minh'
                               CHECK (status IN ('Hoạt động', 'Bị khoá', 'Chờ xác minh')),
  avatar_url      TEXT         NULL,
  phone           VARCHAR(20)  NULL,
  company_name    VARCHAR(255) NULL,        -- Tên công ty (denormalized, hiển thị nhanh)
  company_id      UUID         NULL,        -- FK buyer_companies (nếu Người mua)
  supplier_id     UUID         NULL,        -- FK suppliers (nếu NCC)
  address         TEXT         NULL,
  email_verified  BOOLEAN      NOT NULL DEFAULT false,
  phone_verified  BOOLEAN      NOT NULL DEFAULT false,
  language        VARCHAR(10)  NOT NULL DEFAULT 'vi',
  timezone        VARCHAR(50)  NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  last_login_at   TIMESTAMPTZ  NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_status   ON users(status);
CREATE INDEX idx_users_company  ON users(company_id);
CREATE INDEX idx_users_supplier ON users(supplier_id);
```

**Lưu ý quan trọng**:
- `AuthUser` type dùng `companyName` (KHÔNG phải `company`) — mapping → `company_name`.
- `company_id` chỉ có giá trị khi `role = 'Người mua'`.
- `supplier_id` chỉ có giá trị khi `role = 'Nhà cung cấp'`.
- `password_hash` KHÔNG có trong TypeScript (chỉ backend).

---

## 2. Bảng `shipping_addresses`

> TypeScript: `ShippingAddress` | Source: dòng 934

```sql
CREATE TABLE shipping_addresses (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,          -- VD: 'Văn phòng HCM', 'Kho Bình Dương'
  full_name   VARCHAR(255) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  address     TEXT         NOT NULL,          -- Số nhà, đường
  ward        VARCHAR(100) NULL,              -- Phường/Xã
  district    VARCHAR(100) NULL,              -- Quận/Huyện
  city        VARCHAR(100) NOT NULL,          -- Tỉnh/TP
  country     VARCHAR(100) NOT NULL DEFAULT 'Việt Nam',
  postal_code VARCHAR(20)  NULL,
  latitude    NUMERIC(10,7) NULL,             -- GPS
  longitude   NUMERIC(10,7) NULL,
  type        VARCHAR(50)  NULL CHECK (type IN ('Văn phòng', 'Kho', 'Nhà riêng')),
  is_default  BOOLEAN      NOT NULL DEFAULT false,
  notes       TEXT         NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shipping_addr_user ON shipping_addresses(user_id);
```

---

## 3. Bảng `notification_preferences`

> TypeScript: `NotificationPreference` | Source: dòng 438

```sql
CREATE TABLE notification_preferences (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50)  NOT NULL,           -- 'order', 'product', 'system', ...
  label      VARCHAR(255) NOT NULL,           -- Tên hiển thị
  channel    VARCHAR(20)  NOT NULL DEFAULT 'inApp'
                          CHECK (channel IN ('email', 'push', 'sms', 'inApp')),
  enabled    BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

  UNIQUE (user_id, type, channel)
);

-- Indexes
CREATE INDEX idx_notif_pref_user ON notification_preferences(user_id);
```

---

## 4. Bảng `categories`

> TypeScript: `Category` | Source: dòng 25

```sql
CREATE TABLE categories (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  parent_id        UUID         NULL REFERENCES categories(id) ON DELETE SET NULL,  -- Self-ref
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT         NULL,
  icon             VARCHAR(100) NULL,        -- Tên icon (lucide-react)
  image_url        TEXT         NULL,
  is_active        BOOLEAN      NOT NULL DEFAULT true,
  sort_order       INTEGER      NOT NULL DEFAULT 0,
  level            INTEGER      NOT NULL DEFAULT 0,    -- 0 = root, 1 = child, ...
  path             VARCHAR(500) NULL,        -- Materialized path: 'dien-tu/bo-mach/ic'
  meta_title       VARCHAR(255) NULL,        -- SEO
  meta_description TEXT         NULL,        -- SEO
  product_count    INTEGER      NOT NULL DEFAULT 0,    -- Denormalized counter
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_path   ON categories(path);
CREATE INDEX idx_categories_active ON categories(is_active);
```

**Tree structure**:
- `parent_id = NULL` → danh mục gốc (level 0).
- `children` trong TypeScript là **computed** từ query, không lưu DB.
- `path` dùng cho **Materialized Path** pattern: filter tất cả con bằng `WHERE path LIKE 'dien-tu/%'`.

---

## 5. Bảng `products`

> TypeScript: `Product` | Source: dòng 125

```sql
CREATE TABLE products (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name              VARCHAR(500) NOT NULL,
  slug              VARCHAR(500) NOT NULL UNIQUE,
  description       TEXT         NULL,
  short_description VARCHAR(500) NULL,
  category_id       UUID         NOT NULL REFERENCES categories(id),
  category_name     VARCHAR(255) NULL,        -- Denormalized
  supplier_id       UUID         NOT NULL REFERENCES suppliers(id),
  supplier_name     VARCHAR(255) NULL,        -- Denormalized
  price             NUMERIC(18,2) NOT NULL DEFAULT 0,
  original_price    NUMERIC(18,2) NULL,       -- Giá gốc (trước giảm)
  min_order_qty     INTEGER       NOT NULL DEFAULT 1,
  unit              VARCHAR(50)   NOT NULL DEFAULT 'Cái',
  status            VARCHAR(50)   NOT NULL DEFAULT 'Chờ duyệt'
                    CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Hết hàng', 'Ẩn')),
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  rating            NUMERIC(3,2)  NOT NULL DEFAULT 0,
  review_count      INTEGER       NOT NULL DEFAULT 0,
  images            JSONB         NOT NULL DEFAULT '[]',  -- URL list
  tags              JSONB         NOT NULL DEFAULT '[]',
  specifications    JSONB         NOT NULL DEFAULT '{}',  -- key-value pairs
  brand_name        VARCHAR(255)  NULL,
  origin            VARCHAR(255)  NULL,        -- Xuất xứ
  weight            INTEGER       NULL,        -- Gram
  dimensions        VARCHAR(100)  NULL,        -- '30x20x10 cm'
  warranty_months   INTEGER       NULL,
  view_count        INTEGER       NOT NULL DEFAULT 0,
  sold_count        INTEGER       NOT NULL DEFAULT 0,
  featured          BOOLEAN       NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_products_category        ON products(category_id);
CREATE INDEX idx_products_supplier        ON products(supplier_id);
CREATE INDEX idx_products_status          ON products(status);
CREATE INDEX idx_products_active          ON products(is_active);
CREATE INDEX idx_products_featured        ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_price           ON products(price);
CREATE INDEX idx_products_rating          ON products(rating DESC);
CREATE INDEX idx_products_name_search     ON products USING gin(to_tsvector('simple', name));
```

**~27 cột**. `images`, `tags`, `specifications` dùng JSONB cho display; chi tiết CRUD dùng các bảng phụ bên dưới.

---

## 6. Bảng `product_variants`

> TypeScript: `ProductVariant` | Source: dòng 91

```sql
CREATE TABLE product_variants (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,          -- VD: 'Đỏ - Size L'
  sku         VARCHAR(100) NOT NULL UNIQUE,
  price       NUMERIC(18,2) NOT NULL,
  stock       INTEGER       NOT NULL DEFAULT 0,
  barcode     VARCHAR(100)  NULL,
  weight      INTEGER       NULL,             -- Gram
  dimensions  VARCHAR(100)  NULL,
  images      JSONB         NOT NULL DEFAULT '[]',
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  cost_price  NUMERIC(18,2) NULL,             -- Giá vốn
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE UNIQUE INDEX idx_product_variants_sku ON product_variants(sku);
```

---

## 7. Bảng `product_images`

> TypeScript: `ProductImage` | Source: dòng 107

```sql
CREATE TABLE product_images (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT         NOT NULL,
  alt_text    VARCHAR(255) NULL,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_primary  BOOLEAN      NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
```

## Bảng `product_specifications`

> TypeScript: `ProductSpecification` | Source: dòng 117

```sql
CREATE TABLE product_specifications (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key         VARCHAR(255) NOT NULL,          -- 'Điện áp', 'Công suất', ...
  value       TEXT         NOT NULL,
  sort_order  INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON product_specifications(product_id);
```

## Bảng `product_tags`

```sql
CREATE TABLE product_tags (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag         VARCHAR(100) NOT NULL
);

CREATE INDEX idx_product_tags_product ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag     ON product_tags(tag);
```

---

## 8. Bảng `suppliers`

> TypeScript: `Supplier` | Source: dòng 47

```sql
CREATE TABLE suppliers (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name        VARCHAR(255) NOT NULL,
  contact_person      VARCHAR(255) NOT NULL,
  email               VARCHAR(255) NOT NULL,
  phone               VARCHAR(20)  NOT NULL,
  address             TEXT         NULL,
  city                VARCHAR(100) NULL,
  country             VARCHAR(100) NOT NULL DEFAULT 'Việt Nam',
  logo_url            TEXT         NULL,
  cover_url           TEXT         NULL,
  description         TEXT         NULL,
  rating              NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count        INTEGER      NOT NULL DEFAULT 0,
  product_count       INTEGER      NOT NULL DEFAULT 0,
  year_established    INTEGER      NULL,
  is_verified         BOOLEAN      NOT NULL DEFAULT false,
  is_active           BOOLEAN      NOT NULL DEFAULT true,
  category_ids        JSONB        NOT NULL DEFAULT '[]',  -- Denormalized
  min_order_value     NUMERIC(18,2) NULL,
  avg_delivery_days   INTEGER       NULL,
  on_time_rate        NUMERIC(5,2)  NULL,     -- %
  employees           INTEGER       NULL,
  production_capacity VARCHAR(255)  NULL,
  website             VARCHAR(255)  NULL,
  years_experience    INTEGER       NULL,
  registration_number VARCHAR(100)  NULL,     -- Số ĐKKD
  tax_id              VARCHAR(50)   NULL,     -- Mã số thuế
  bank_name           VARCHAR(255)  NULL,
  bank_account        VARCHAR(100)  NULL,
  representative      VARCHAR(255)  NULL,     -- Người đại diện pháp luật
  joined_date         TIMESTAMPTZ   NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_suppliers_verified ON suppliers(is_verified);
CREATE INDEX idx_suppliers_active   ON suppliers(is_active);
CREATE INDEX idx_suppliers_rating   ON suppliers(rating DESC);
CREATE INDEX idx_suppliers_city     ON suppliers(city);
CREATE INDEX idx_suppliers_name     ON suppliers USING gin(to_tsvector('simple', company_name));
```

**~30 cột**. `category_ids` JSONB là denormalized; quan hệ N-N thật nằm ở `supplier_categories`.

---

## 9. Bảng `supplier_categories` (N-N)

> TypeScript: `SupplierCategory` | Source: dòng 82

```sql
CREATE TABLE supplier_categories (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id  UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  UNIQUE (supplier_id, category_id)
);

CREATE INDEX idx_supp_cat_supplier ON supplier_categories(supplier_id);
CREATE INDEX idx_supp_cat_category ON supplier_categories(category_id);
```

---

## 10. Bảng `staff_members`

> TypeScript: `StaffMember` | Source: dòng 815

```sql
CREATE TABLE staff_members (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id  UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  phone        VARCHAR(20)  NULL,
  role         VARCHAR(50)  NOT NULL CHECK (role IN (
                 'Quản lý', 'Nhân viên bán hàng', 'Kế toán',
                 'Nhân viên kho', 'Nhân viên hỗ trợ', 'Quản trị viên'
               )),
  permissions  JSONB        NOT NULL DEFAULT '[]',   -- ['manage_orders', 'view_reports', ...]
  is_active    BOOLEAN      NOT NULL DEFAULT true,
  last_login   TIMESTAMPTZ  NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_supplier ON staff_members(supplier_id);
CREATE INDEX idx_staff_active   ON staff_members(is_active);
```

---

## 11. Bảng `business_certificates`

> TypeScript: `BusinessCertificate` | Source: dòng 895

```sql
CREATE TABLE business_certificates (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id   UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  supplier_name VARCHAR(255) NULL,             -- Denormalized
  type          VARCHAR(50)  NOT NULL CHECK (type IN (
                  'Giấy ĐKKD', 'Giấy phép XNK', 'ISO 9001', 'ISO 14001',
                  'CE', 'FDA', 'HACCP', 'Giấy chứng nhận nguồn gốc', 'Khác'
                )),
  name          VARCHAR(255) NOT NULL,
  issued_by     VARCHAR(255) NOT NULL,
  issued_date   TIMESTAMPTZ  NOT NULL,
  expiry_date   TIMESTAMPTZ  NOT NULL,
  document_url  TEXT         NOT NULL,
  status        VARCHAR(50)  NOT NULL DEFAULT 'Chưa xác minh'
                CHECK (status IN ('Chưa xác minh', 'Đang xem xét', 'Đã xác minh', 'Từ chối', 'Hết hạn')),
  review_note   TEXT         NULL,
  reviewed_by   UUID         NULL REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ  NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_certs_supplier ON business_certificates(supplier_id);
CREATE INDEX idx_certs_status   ON business_certificates(status);
CREATE INDEX idx_certs_expiry   ON business_certificates(expiry_date);
```

---

## 12. Bảng `supplier_scorecards`

> TypeScript: `SupplierScorecard` | Source: dòng 1320

```sql
CREATE TABLE supplier_scorecards (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id           UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE UNIQUE,
  supplier_name         VARCHAR(255) NULL,           -- Denormalized
  quality_score         NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0–100
  delivery_score        NUMERIC(5,2) NOT NULL DEFAULT 0,
  price_score           NUMERIC(5,2) NOT NULL DEFAULT 0,
  communication_score   NUMERIC(5,2) NOT NULL DEFAULT 0,
  overall_score         NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_orders          INTEGER      NOT NULL DEFAULT 0,
  on_time_delivery_rate NUMERIC(5,2) NOT NULL DEFAULT 0,   -- %
  defect_rate           NUMERIC(5,2) NOT NULL DEFAULT 0,   -- %
  avg_response_time     VARCHAR(50)  NULL,           -- '2.5 giờ'
  cert_count            INTEGER      NOT NULL DEFAULT 0,
  last_updated          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_scorecards_supplier ON supplier_scorecards(supplier_id);
```

---

## ER Diagram (phần này)

```
users 1──N shipping_addresses
users 1──N notification_preferences

suppliers 1──N staff_members
suppliers 1──N business_certificates
suppliers 1──1 supplier_scorecards
suppliers N──N categories  (via supplier_categories)

categories 1──N categories (self-ref: parent_id)
categories 1──N products

suppliers 1──N products
products  1──N product_variants
products  1──N product_images
products  1──N product_specifications
products  1──N product_tags

users.company_id   → buyer_companies.id  (Part 2)
users.supplier_id  → suppliers.id
products.category_id → categories.id
```

---

## Tài liệu liên quan

- [05-database-schema-part2.md](./05-database-schema-part2.md) — Schema: Đơn hàng, Giỏ hàng, RFQ, Báo giá
- [06-database-schema-part3.md](./06-database-schema-part3.md) — Schema: Hợp đồng, Thanh toán, Vận chuyển
- [07-database-schema-part4.md](./07-database-schema-part4.md) — Schema: Kho, Khuyến mãi, Đánh giá, Thông báo
- [01-system-overview.md](./01-system-overview.md) — Tổng quan hệ thống
- [02-architecture.md](./02-architecture.md) — Kiến trúc & migration strategy
