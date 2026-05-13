# 02 - Database Design (PostgreSQL)

> DDL cho PostgreSQL 15+. Tất cả `id` dùng `UUID` với default `gen_random_uuid()`.  
> Convention: bảng dùng `snake_case`, số nhiều.

---

## Enums

```sql
-- User
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'STAFF');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'LOCKED', 'PENDING_VERIFY');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE address_type AS ENUM ('HOME', 'OFFICE', 'OTHER');

-- Product
CREATE TYPE product_status AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'COMING_SOON');
CREATE TYPE product_condition AS ENUM ('NEW', 'LIKE_NEW', 'USED');

-- Order
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET', 'COD');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

-- Payment & Invoice
CREATE TYPE invoice_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE shipment_status AS ENUM ('AWAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

-- After-sales
CREATE TYPE return_reason AS ENUM ('DEFECTIVE', 'NOT_AS_DESCRIBED', 'WRONG_ITEM', 'DAMAGED_IN_TRANSIT', 'CHANGED_MIND', 'OTHER');
CREATE TYPE return_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'REFUNDED', 'CLOSED');
CREATE TYPE warranty_status AS ENUM ('VALID', 'EXPIRED', 'PROCESSING', 'REJECTED');
CREATE TYPE claim_type AS ENUM ('REPAIR', 'REPLACEMENT', 'REFUND');
CREATE TYPE claim_status AS ENUM ('NEW', 'PROCESSING', 'RESOLVED', 'REJECTED');
CREATE TYPE trade_in_condition AS ENUM ('GOOD', 'FAIR', 'AVERAGE', 'POOR');
CREATE TYPE trade_in_status AS ENUM ('AWAITING_VALUATION', 'VALUED', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- Promotion
CREATE TYPE discount_type AS ENUM ('PERCENT', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING');

-- Review
CREATE TYPE review_status AS ENUM ('PENDING', 'VISIBLE', 'HIDDEN');

-- Loyalty
CREATE TYPE loyalty_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND');
CREATE TYPE loyalty_txn_type AS ENUM ('EARN', 'REDEEM', 'EXPIRE', 'BONUS');

-- Notification
CREATE TYPE notification_type AS ENUM ('ORDER', 'PRODUCT', 'SYSTEM', 'PROMOTION', 'WARRANTY', 'PRICE_DROP', 'REVIEW');
CREATE TYPE notification_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE notification_category AS ENUM ('TRANSACTION', 'SYSTEM', 'INTERACTION', 'ALERT');

-- Activity
CREATE TYPE activity_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'CHANGE_PASSWORD', 'UPDATE_PERMISSION');

-- Inventory
CREATE TYPE inventory_status AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK');

-- Staff
CREATE TYPE staff_position AS ENUM ('STORE_MANAGER', 'CONSULTANT', 'WAREHOUSE', 'TECHNICIAN', 'CASHIER');

-- Banner
CREATE TYPE banner_type AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR');
```

---

## Tables

### users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(15) NOT NULL,
    role            user_role NOT NULL DEFAULT 'CUSTOMER',
    status          user_status NOT NULL DEFAULT 'PENDING_VERIFY',
    avatar_url      TEXT,
    address         TEXT,
    date_of_birth   DATE,
    gender          gender_type,
    loyalty_points  INT NOT NULL DEFAULT 0,
    total_orders    INT NOT NULL DEFAULT 0,
    total_spent     BIGINT NOT NULL DEFAULT 0,
    last_login_at   TIMESTAMPTZ,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### shipping_addresses
```sql
CREATE TABLE shipping_addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       VARCHAR(100) NOT NULL,
    full_name   VARCHAR(200) NOT NULL,
    phone       VARCHAR(15) NOT NULL,
    address     TEXT NOT NULL,
    ward        VARCHAR(100) NOT NULL,
    district    VARCHAR(100) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL DEFAULT 'Việt Nam',
    postal_code VARCHAR(10),
    type        address_type DEFAULT 'HOME',
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);
```

### categories
```sql
CREATE TABLE categories (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(200) NOT NULL,
    slug             VARCHAR(200) NOT NULL UNIQUE,
    description      TEXT NOT NULL DEFAULT '',
    icon             VARCHAR(100) NOT NULL DEFAULT '',
    image_url        TEXT,
    parent_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
    level            INT NOT NULL DEFAULT 0,
    path             VARCHAR(500),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order       INT DEFAULT 0,
    product_count    INT NOT NULL DEFAULT 0,
    meta_title       VARCHAR(200),
    meta_description TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

### products
```sql
CREATE TABLE products (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(500) NOT NULL,
    slug              VARCHAR(500) NOT NULL UNIQUE,
    description       TEXT NOT NULL DEFAULT '',
    short_description VARCHAR(1000) NOT NULL DEFAULT '',
    category_id       UUID NOT NULL REFERENCES categories(id),
    category_name     VARCHAR(200) NOT NULL,
    brand             VARCHAR(100) NOT NULL,
    price             BIGINT NOT NULL,
    original_price    BIGINT,
    discount_percent  INT DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    status            product_status NOT NULL DEFAULT 'ACTIVE',
    condition         product_condition NOT NULL DEFAULT 'NEW',
    rating            DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count      INT NOT NULL DEFAULT 0,
    sold_count        INT NOT NULL DEFAULT 0,
    view_count        INT NOT NULL DEFAULT 0,
    warranty          INT NOT NULL DEFAULT 12,  -- months
    tags              TEXT[] NOT NULL DEFAULT '{}',
    specifications    JSONB NOT NULL DEFAULT '{}',
    color             VARCHAR(100),
    is_new            BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
    is_hot            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_hot ON products(is_hot);
CREATE INDEX idx_products_slug ON products(slug);
-- Full-text search
CREATE INDEX idx_products_fts ON products USING GIN(to_tsvector('simple', name || ' ' || brand));
```

### product_variants
```sql
CREATE TABLE product_variants (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name           VARCHAR(300) NOT NULL,
    sku            VARCHAR(100) NOT NULL UNIQUE,
    price          BIGINT NOT NULL,
    original_price BIGINT,
    stock          INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    color          VARCHAR(100),
    storage        VARCHAR(50),
    ram            VARCHAR(50),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
```

### product_images
```sql
CREATE TABLE product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    alt_text    VARCHAR(300),
    sort_order  INT NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
-- Đảm bảo mỗi product chỉ có 1 ảnh primary
CREATE UNIQUE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = TRUE;
```

### phone_specs
```sql
CREATE TABLE phone_specs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    chip            VARCHAR(200) NOT NULL,
    ram             VARCHAR(50) NOT NULL,
    storage         VARCHAR(50) NOT NULL,
    battery         VARCHAR(100) NOT NULL,
    camera          VARCHAR(300) NOT NULL,
    front_camera    VARCHAR(100) NOT NULL,
    screen          VARCHAR(300) NOT NULL,
    os              VARCHAR(100) NOT NULL,
    connectivity    VARCHAR(300) NOT NULL,
    weight          VARCHAR(50),
    dimensions      VARCHAR(100),
    water_resistance VARCHAR(50),
    sim_type        VARCHAR(100),
    charging_speed  VARCHAR(200),
    gpu             VARCHAR(200)
);
```

### product_combos
```sql
CREATE TABLE product_combos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(300) NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    image               TEXT,
    combo_price         BIGINT NOT NULL,
    total_original_price BIGINT NOT NULL,
    savings             BIGINT NOT NULL,
    savings_percent     INT NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    start_date          DATE,
    end_date            DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE combo_items (
    combo_id        UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_name    VARCHAR(500) NOT NULL,
    product_image   TEXT NOT NULL,
    original_price  BIGINT NOT NULL,
    combo_price     BIGINT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    PRIMARY KEY (combo_id, product_id)
);
```

### cart_items
```sql
CREATE TABLE cart_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id    UUID NOT NULL REFERENCES products(id),
    variant_id    UUID REFERENCES product_variants(id),
    product_name  VARCHAR(500) NOT NULL,
    product_image TEXT NOT NULL,
    brand         VARCHAR(100) NOT NULL,
    variant_name  VARCHAR(300),
    color         VARCHAR(100),
    storage       VARCHAR(50),
    quantity      INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price    BIGINT NOT NULL,
    total_price   BIGINT NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    note          TEXT,
    added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

### orders
```sql
CREATE TABLE orders (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number          VARCHAR(50) NOT NULL UNIQUE,
    customer_id           UUID NOT NULL REFERENCES users(id),
    customer_name         VARCHAR(200) NOT NULL,
    customer_email        VARCHAR(200) NOT NULL,
    customer_phone        VARCHAR(15) NOT NULL,
    subtotal              BIGINT NOT NULL,
    shipping_fee          BIGINT NOT NULL DEFAULT 0,
    discount              BIGINT NOT NULL DEFAULT 0,
    total_amount          BIGINT NOT NULL,
    status                order_status NOT NULL DEFAULT 'PENDING',
    shipping_address      TEXT NOT NULL,
    shipping_address_id   UUID REFERENCES shipping_addresses(id),
    payment_method        payment_method NOT NULL,
    payment_status        payment_status NOT NULL DEFAULT 'UNPAID',
    promotion_code        VARCHAR(100),
    promotion_id          UUID REFERENCES promotions(id),
    discount_amount       BIGINT DEFAULT 0,
    notes                 TEXT,
    expected_delivery_date DATE,
    actual_delivery_date   DATE,
    cancel_reason         TEXT,
    cancelled_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

### order_items
```sql
CREATE TABLE order_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products(id),
    variant_id     UUID REFERENCES product_variants(id),
    product_name   VARCHAR(500) NOT NULL,
    product_image  TEXT NOT NULL,
    brand          VARCHAR(100) NOT NULL,
    variant_name   VARCHAR(300),
    sku            VARCHAR(100),
    color          VARCHAR(100),
    quantity       INT NOT NULL CHECK (quantity >= 1),
    unit_price     BIGINT NOT NULL,
    original_price BIGINT,
    discount       BIGINT NOT NULL DEFAULT 0,
    total_price    BIGINT NOT NULL,
    note           TEXT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### order_status_history
```sql
CREATE TABLE order_status_history (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status      order_status,
    to_status        order_status NOT NULL,
    changed_by       UUID NOT NULL REFERENCES users(id),
    changed_by_name  VARCHAR(200) NOT NULL,
    note             TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
```

### promotions
```sql
CREATE TABLE promotions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                  VARCHAR(100) NOT NULL UNIQUE,
    name                  VARCHAR(300) NOT NULL,
    description           TEXT NOT NULL DEFAULT '',
    type                  discount_type NOT NULL,
    value                 DECIMAL(12,2) NOT NULL,
    min_order_value       BIGINT NOT NULL DEFAULT 0,
    max_discount          BIGINT NOT NULL DEFAULT 0,
    start_date            TIMESTAMPTZ NOT NULL,
    end_date              TIMESTAMPTZ NOT NULL,
    usage_limit           INT NOT NULL DEFAULT 0,
    used_count            INT NOT NULL DEFAULT 0,
    applicable_products   UUID[] NOT NULL DEFAULT '{}',
    applicable_categories UUID[] NOT NULL DEFAULT '{}',
    applicable_brands     TEXT[] NOT NULL DEFAULT '{}',
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
```

### reviews
```sql
CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id),
    user_id             UUID NOT NULL REFERENCES users(id),
    order_id            UUID REFERENCES orders(id),
    user_name           VARCHAR(200) NOT NULL,
    product_name        VARCHAR(500),
    rating              INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title               VARCHAR(300),
    comment             TEXT NOT NULL,
    status              review_status NOT NULL DEFAULT 'PENDING',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count       INT NOT NULL DEFAULT 0,
    images              TEXT[] NOT NULL DEFAULT '{}',
    tags                TEXT[] NOT NULL DEFAULT '{}',
    seller_reply        TEXT,
    seller_reply_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

### wishlist_items
```sql
CREATE TABLE wishlist_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name   VARCHAR(500) NOT NULL,
    product_image  TEXT NOT NULL,
    brand          VARCHAR(100) NOT NULL,
    category_name  VARCHAR(200) NOT NULL,
    price          BIGINT NOT NULL,
    original_price BIGINT,
    stock          INT NOT NULL DEFAULT 0,
    price_alert    BIGINT,
    added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
```

### payments
```sql
CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL REFERENCES orders(id),
    order_number     VARCHAR(50) NOT NULL,
    customer_id      UUID NOT NULL REFERENCES users(id),
    amount           BIGINT NOT NULL,
    paid_amount      BIGINT NOT NULL DEFAULT 0,
    remaining_amount BIGINT NOT NULL,
    due_date         DATE NOT NULL,
    status           payment_status NOT NULL DEFAULT 'UNPAID',
    method           VARCHAR(100) NOT NULL,
    transaction_ref  VARCHAR(200),
    paid_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
```

### invoices
```sql
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(100) NOT NULL UNIQUE,
    order_id        UUID NOT NULL REFERENCES orders(id),
    order_number    VARCHAR(50) NOT NULL,
    customer_id     UUID NOT NULL REFERENCES users(id),
    customer_name   VARCHAR(200) NOT NULL,
    total_amount    BIGINT NOT NULL,
    tax_amount      BIGINT DEFAULT 0,
    status          invoice_status NOT NULL DEFAULT 'PENDING',
    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### shipments
```sql
CREATE TABLE shipments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID NOT NULL REFERENCES orders(id),
    order_number       VARCHAR(50) NOT NULL,
    tracking_number    VARCHAR(200) NOT NULL,
    carrier_name       VARCHAR(200) NOT NULL,
    status             shipment_status NOT NULL DEFAULT 'AWAITING_PICKUP',
    estimated_delivery DATE NOT NULL,
    actual_delivery    DATE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
```

### return_requests
```sql
CREATE TABLE return_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    order_number    VARCHAR(50) NOT NULL,
    customer_id     UUID NOT NULL REFERENCES users(id),
    customer_name   VARCHAR(200) NOT NULL,
    reason          return_reason NOT NULL,
    status          return_status NOT NULL DEFAULT 'PENDING',
    refund_amount   BIGINT NOT NULL DEFAULT 0,
    refund_method   VARCHAR(100),
    images          TEXT[] NOT NULL DEFAULT '{}',
    admin_note      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE return_items (
    return_id     UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    product_id    UUID NOT NULL REFERENCES products(id),
    product_name  VARCHAR(500) NOT NULL,
    product_image TEXT NOT NULL,
    quantity      INT NOT NULL CHECK (quantity >= 1),
    unit_price    BIGINT NOT NULL,
    reason        return_reason NOT NULL,
    note          TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (return_id, product_id)
);

CREATE INDEX idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX idx_return_requests_customer_id ON return_requests(customer_id);
CREATE INDEX idx_return_requests_status ON return_requests(status);
```

### warranty_items
```sql
CREATE TABLE warranty_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id      UUID NOT NULL REFERENCES users(id),
    customer_name    VARCHAR(200) NOT NULL,
    order_id         UUID NOT NULL REFERENCES orders(id),
    order_number     VARCHAR(50) NOT NULL,
    product_id       UUID NOT NULL REFERENCES products(id),
    product_name     VARCHAR(500) NOT NULL,
    product_image    TEXT NOT NULL,
    brand            VARCHAR(100) NOT NULL,
    imei             VARCHAR(20),
    serial_number    VARCHAR(100),
    purchase_date    DATE NOT NULL,
    warranty_expiry  DATE NOT NULL,
    warranty_months  INT NOT NULL,
    status           warranty_status NOT NULL DEFAULT 'VALID',
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE warranty_claims (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_id   UUID NOT NULL REFERENCES warranty_items(id),
    customer_id   UUID NOT NULL REFERENCES users(id),
    customer_name VARCHAR(200) NOT NULL,
    product_id    UUID NOT NULL REFERENCES products(id),
    product_name  VARCHAR(500) NOT NULL,
    claim_type    claim_type NOT NULL,
    description   TEXT NOT NULL,
    status        claim_status NOT NULL DEFAULT 'NEW',
    resolution    TEXT,
    resolved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warranty_items_customer_id ON warranty_items(customer_id);
CREATE INDEX idx_warranty_items_order_id ON warranty_items(order_id);
CREATE INDEX idx_warranty_claims_warranty_id ON warranty_claims(warranty_id);
```

### trade_in_requests
```sql
CREATE TABLE trade_in_requests (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       UUID NOT NULL REFERENCES users(id),
    customer_name     VARCHAR(200) NOT NULL,
    customer_phone    VARCHAR(15) NOT NULL,
    brand             VARCHAR(100) NOT NULL,
    model             VARCHAR(200) NOT NULL,
    storage           VARCHAR(50) NOT NULL,
    condition         trade_in_condition NOT NULL,
    estimated_value   BIGINT NOT NULL,
    final_value       BIGINT,
    status            trade_in_status NOT NULL DEFAULT 'AWAITING_VALUATION',
    images            TEXT[] DEFAULT '{}',
    note              TEXT,
    target_product_id UUID REFERENCES products(id),
    target_product_name VARCHAR(500),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trade_in_customer_id ON trade_in_requests(customer_id);
CREATE INDEX idx_trade_in_status ON trade_in_requests(status);
```

### loyalty_programs
```sql
CREATE TABLE loyalty_programs (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id          UUID NOT NULL UNIQUE REFERENCES users(id),
    customer_name        VARCHAR(200) NOT NULL,
    tier                 loyalty_tier NOT NULL DEFAULT 'BRONZE',
    points               INT NOT NULL DEFAULT 0 CHECK (points >= 0),
    total_spend          BIGINT NOT NULL DEFAULT 0,
    joined_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    points_expiry        DATE,
    next_tier_threshold  INT
);

CREATE TABLE loyalty_transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id  UUID NOT NULL REFERENCES loyalty_programs(id),
    type        loyalty_txn_type NOT NULL,
    points      INT NOT NULL,
    description VARCHAR(300) NOT NULL,
    order_id    UUID REFERENCES orders(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_rewards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(300) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    points_cost INT NOT NULL CHECK (points_cost > 0),
    category    VARCHAR(100) NOT NULL,
    available   BOOLEAN NOT NULL DEFAULT TRUE,
    stock       INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_program_id ON loyalty_transactions(program_id);
```

### app_notifications
```sql
CREATE TABLE app_notifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          notification_type NOT NULL,
    title         VARCHAR(300) NOT NULL,
    message       TEXT NOT NULL,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    priority      notification_priority NOT NULL DEFAULT 'MEDIUM',
    category      notification_category NOT NULL,
    entity_type   VARCHAR(100),
    entity_id     UUID,
    action_url    TEXT,
    action_label  VARCHAR(100),
    is_actionable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON app_notifications(user_id);
CREATE INDEX idx_notifications_is_read ON app_notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON app_notifications(created_at DESC);
```

### activity_logs
```sql
CREATE TABLE activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    user_name   VARCHAR(200) NOT NULL,
    user_role   VARCHAR(50) NOT NULL,
    action      activity_action NOT NULL,
    entity      VARCHAR(100) NOT NULL,
    entity_id   VARCHAR(100) NOT NULL,
    entity_name VARCHAR(300) NOT NULL,
    details     TEXT NOT NULL,
    ip_address  VARCHAR(50) NOT NULL,
    user_agent  TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

### branches
```sql
CREATE TABLE branches (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    address      TEXT NOT NULL,
    district     VARCHAR(100) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    phone        VARCHAR(15) NOT NULL,
    working_hours VARCHAR(200) NOT NULL,
    lat          DECIMAL(10,7),
    lng          DECIMAL(10,7),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE
);
```

### staff_members
```sql
CREATE TABLE staff_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   VARCHAR(200) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    phone       VARCHAR(15) NOT NULL,
    position    staff_position NOT NULL,
    branch_id   UUID NOT NULL REFERENCES branches(id),
    branch_name VARCHAR(200) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at   DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### inventory_items
```sql
CREATE TABLE inventory_items (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID NOT NULL REFERENCES products(id),
    variant_id     UUID REFERENCES product_variants(id),
    product_name   VARCHAR(500) NOT NULL,
    brand          VARCHAR(100) NOT NULL,
    sku            VARCHAR(100) NOT NULL,
    current_stock  INT NOT NULL DEFAULT 0,
    min_stock      INT NOT NULL DEFAULT 5,
    cost_price     BIGINT NOT NULL,
    selling_price  BIGINT NOT NULL,
    status         inventory_status NOT NULL DEFAULT 'IN_STOCK',
    last_updated   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, variant_id)
);

CREATE INDEX idx_inventory_product_id ON inventory_items(product_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);
```

### blog_posts
```sql
CREATE TABLE blog_posts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(500) NOT NULL,
    slug         VARCHAR(500) NOT NULL UNIQUE,
    excerpt      TEXT NOT NULL DEFAULT '',
    content      TEXT NOT NULL,
    cover_image  TEXT NOT NULL DEFAULT '',
    category     VARCHAR(100) NOT NULL,
    tags         TEXT[] NOT NULL DEFAULT '{}',
    author_id    UUID NOT NULL REFERENCES users(id),
    author_name  VARCHAR(200) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    view_count   INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
```

### installment_plans
```sql
CREATE TABLE installment_plans (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name     VARCHAR(200) NOT NULL,
    logo_url      TEXT,
    months        INT[] NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    min_amount    BIGINT NOT NULL,
    max_amount    BIGINT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE
);
```

### system_config
```sql
CREATE TABLE system_config (
    key         VARCHAR(200) PRIMARY KEY,
    value       TEXT NOT NULL,
    description VARCHAR(500),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO system_config (key, value, description) VALUES
('site_name', 'CELLPHONES', 'Tên website'),
('currency', 'VND', 'Đơn vị tiền tệ'),
('tax_rate', '10', 'Thuế VAT (%)'),
('maintenance_mode', 'false', 'Chế độ bảo trì'),
('return_window_days', '7', 'Số ngày được trả hàng'),
('loyalty_points_per_100k', '1', 'Điểm tích per 100K VND'),
('default_page_size', '20', 'Số bản ghi mặc định/trang'),
('email_notifications_enabled', 'true', 'Bật email thông báo');
```

### banner_configs
```sql
CREATE TABLE banner_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(300) NOT NULL,
    message     TEXT NOT NULL,
    type        banner_type NOT NULL DEFAULT 'INFO',
    link        TEXT NOT NULL DEFAULT '',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL
);
```

### email_templates
```sql
CREATE TABLE email_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    subject     VARCHAR(500) NOT NULL,
    body        TEXT NOT NULL,
    variables   TEXT[] NOT NULL DEFAULT '{}',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Triggers

```sql
-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_return_requests_updated_at BEFORE UPDATE ON return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_trade_in_requests_updated_at BEFORE UPDATE ON trade_in_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Ghi chú triển khai

1. **UUID**: Dùng `gen_random_uuid()` (PostgreSQL 13+). Nếu dùng Java Spring, `@GeneratedValue(strategy = GenerationType.UUID)` tự generate ở application layer.
2. **BIGINT cho tiền tệ**: Tất cả cột tiền tệ (VND) dùng `BIGINT` (không có phần thập phân). Ví dụ: 1.000.000 VND = 1000000.
3. **JSON arrays**: Các cột `TEXT[]` và `UUID[]` dùng PostgreSQL native arrays. Trong Java, map với `List<String>` / `List<UUID>`.
4. **JSONB**: Cột `specifications` trong `products` dùng JSONB để query flexible.
5. **Soft delete**: Không dùng `deleted_at`. Dùng `status` field với giá trị INACTIVE/CANCELLED.
6. **Partition**: Nếu `activity_logs` và `app_notifications` lớn, xem xét partition by month.
