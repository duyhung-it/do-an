CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING');

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(300) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type discount_type NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  min_order_value BIGINT NOT NULL DEFAULT 0,
  max_discount BIGINT NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0,
  applicable_products UUID[] NOT NULL DEFAULT '{}',
  applicable_categories UUID[] NOT NULL DEFAULT '{}',
  applicable_brands TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

INSERT INTO promotions (
  id, code, name, description, type, value, min_order_value, max_discount,
  start_date, end_date, usage_limit, used_count, applicable_products,
  applicable_categories, applicable_brands, is_active
)
VALUES
  (
    'f1b2c3d4-0001-0001-0001-000000000001',
    'WELCOME10',
    'Giam 10% cho don hang dau',
    'Giam 10% toi da 500000 VND cho don hang tu 2000000 VND',
    'PERCENTAGE',
    10,
    2000000,
    500000,
    '2026-01-01T00:00:00+07:00',
    '2026-12-31T23:59:59+07:00',
    1000,
    0,
    '{}',
    '{}',
    '{}',
    TRUE
  ),
  (
    'f1b2c3d4-0001-0001-0001-000000000002',
    'APPLE500K',
    'Giam 500K cho Apple',
    'Giam truc tiep 500000 VND cho san pham Apple tu 10000000 VND',
    'FIXED_AMOUNT',
    500000,
    10000000,
    0,
    '2026-01-01T00:00:00+07:00',
    '2026-12-31T23:59:59+07:00',
    0,
    0,
    '{}',
    '{}',
    ARRAY['Apple'],
    TRUE
  );
