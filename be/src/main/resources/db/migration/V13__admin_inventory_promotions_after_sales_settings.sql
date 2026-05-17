ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'INACTIVE';
ALTER TYPE product_condition ADD VALUE IF NOT EXISTS 'REFURBISHED';

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS min_stock INT NOT NULL DEFAULT 5 CHECK (min_stock >= 0);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS imei_serials TEXT[] NOT NULL DEFAULT '{}';

CREATE TYPE stock_movement_type AS ENUM ('MANUAL_ADJUSTMENT', 'ORDER_RESERVATION', 'ORDER_RELEASE', 'SALE', 'RETURN');

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type stock_movement_type NOT NULL,
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  delta INT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference_type VARCHAR(50),
  reference_id UUID,
  created_by UUID,
  created_by_name VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_variant ON stock_movements(variant_id, created_at DESC);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);

ALTER TABLE promotions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

INSERT INTO promotions (
  id, code, name, description, type, value, min_order_value, max_discount,
  start_date, end_date, usage_limit, used_count, applicable_products,
  applicable_categories, applicable_brands, is_active
)
VALUES
  ('f1b2c3d4-0001-0001-0001-000000000003', 'FLASH5', 'Giam 5% flash sale', 'Giam 5% toi da 300000 VND', 'PERCENTAGE', 5, 1000000, 300000, '2026-01-01T00:00:00+07:00', '2026-12-31T23:59:59+07:00', 500, 0, '{}', '{}', '{}', TRUE),
  ('f1b2c3d4-0001-0001-0001-000000000004', 'SAMSUNG300K', 'Giam 300K Samsung', 'Giam truc tiep cho san pham Samsung', 'FIXED_AMOUNT', 300000, 8000000, 0, '2026-01-01T00:00:00+07:00', '2026-12-31T23:59:59+07:00', 300, 0, '{}', '{}', ARRAY['Samsung'], TRUE),
  ('f1b2c3d4-0001-0001-0001-000000000005', 'ACCESSORY20', 'Giam 20% phu kien', 'Giam 20% toi da 150000 VND cho phu kien', 'PERCENTAGE', 20, 300000, 150000, '2026-01-01T00:00:00+07:00', '2026-12-31T23:59:59+07:00', 800, 0, '{}', ARRAY['a1b2c3d4-0001-0001-0001-000000000004'::uuid], '{}', TRUE),
  ('f1b2c3d4-0001-0001-0001-000000000006', 'VIP1M', 'Giam 1 trieu VIP', 'Giam 1000000 VND cho don tu 30000000 VND', 'FIXED_AMOUNT', 1000000, 30000000, 0, '2026-01-01T00:00:00+07:00', '2026-12-31T23:59:59+07:00', 100, 0, '{}', '{}', '{}', TRUE),
  ('f1b2c3d4-0001-0001-0001-000000000007', 'FREESHIP', 'Mien phi van chuyen', 'Mien phi van chuyen cho don tu 500000 VND', 'FREE_SHIPPING', 0, 500000, 0, '2026-01-01T00:00:00+07:00', '2026-12-31T23:59:59+07:00', 1000, 0, '{}', '{}', '{}', TRUE),
  ('f1b2c3d4-0001-0001-0001-000000000008', 'FUTURE15', 'Khuyen mai sap dien ra', 'Giam 15% cho chien dich sap toi', 'PERCENTAGE', 15, 2000000, 700000, '2026-07-01T00:00:00+07:00', '2026-07-31T23:59:59+07:00', 300, 0, '{}', '{}', '{}', FALSE),
  ('f1b2c3d4-0001-0001-0001-000000000009', 'EXPIRED10', 'Khuyen mai da het han', 'Du lieu QA cho man hinh admin', 'PERCENTAGE', 10, 1000000, 200000, '2025-01-01T00:00:00+07:00', '2025-12-31T23:59:59+07:00', 100, 0, '{}', '{}', '{}', FALSE),
  ('f1b2c3d4-0001-0001-0001-000000000010', 'XIAOMI250K', 'Giam 250K Xiaomi', 'Giam truc tiep cho san pham Xiaomi', 'FIXED_AMOUNT', 250000, 7000000, 0, '2026-01-01T00:00:00+07:00', '2026-12-31T23:59:59+07:00', 250, 0, '{}', '{}', ARRAY['Xiaomi'], TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE TYPE return_request_status AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'REFUNDED', 'CLOSED', 'REJECTED');
CREATE TYPE warranty_claim_status AS ENUM ('NEW', 'PROCESSING', 'RESOLVED', 'REJECTED');
CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

CREATE TABLE return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status return_request_status NOT NULL DEFAULT 'PENDING',
  refund_amount BIGINT NOT NULL DEFAULT 0,
  dispute_resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_id UUID,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  issue_description TEXT NOT NULL DEFAULT '',
  status warranty_claim_status NOT NULL DEFAULT 'NEW',
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID,
  customer_name VARCHAR(200) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(300) NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status review_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_return_requests_status ON return_requests(status);
CREATE INDEX idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);

INSERT INTO return_requests (id, return_number, customer_name, customer_phone, reason, status, refund_amount)
VALUES
  ('aa000000-0001-4000-8000-000000000001', 'RTN-202605-0001', 'Nguyen Van A', '0901234567', 'San pham loi ngoai quan', 'PENDING', 490000),
  ('aa000000-0001-4000-8000-000000000002', 'RTN-202605-0002', 'Le Thi B', '0912345678', 'Khach muon doi mau', 'APPROVED', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO warranty_claims (id, claim_number, product_id, customer_name, customer_phone, issue_description, status)
VALUES
  ('aa000000-0002-4000-8000-000000000001', 'WRN-202605-0001', 'b1b2c3d4-0001-0001-0001-000000000001', 'Tran Van C', '0923456789', 'May nong bat thuong', 'NEW'),
  ('aa000000-0002-4000-8000-000000000002', 'WRN-202605-0002', 'b1b2c3d4-0001-0001-0001-000000000002', 'Pham Thi D', '0934567890', 'Loi man hinh', 'PROCESSING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_reviews (id, product_id, customer_name, rating, title, content, status)
VALUES
  ('aa000000-0003-4000-8000-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', 'Hoang Van E', 5, 'Rat hai long', 'May dep, giao nhanh', 'PENDING'),
  ('aa000000-0003-4000-8000-000000000002', 'b1b2c3d4-0001-0001-0001-000000000002', 'Do Thi F', 4, 'Dung on', 'Hieu nang tot', 'APPROVED')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE admin_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position VARCHAR(100) NOT NULL DEFAULT 'HOME',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(300) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  role VARCHAR(100) NOT NULL DEFAULT 'STAFF',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_name VARCHAR(200),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO admin_settings (setting_key, setting_value)
VALUES
  ('store', '{"name":"CELLPHONES","hotline":"18002097","currency":"VND"}'),
  ('shipping', '{"defaultFee":30000,"freeShipThreshold":5000000}')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO banners (id, title, image_url, link_url, position, is_active, sort_order)
VALUES ('aa000000-0004-4000-8000-000000000001', 'iPhone Sale', 'https://cdn.cellphones.vn/banners/iphone-sale.jpg', '/products?brand=Apple', 'HOME', TRUE, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_templates (id, template_key, subject, body, is_active)
VALUES ('aa000000-0005-4000-8000-000000000001', 'ORDER_CONFIRMED', 'Don hang {{orderNumber}} da duoc xac nhan', 'Xin chao {{customerName}}, don hang {{orderNumber}} da duoc xac nhan.', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO seo_settings (id, page_key, title, description, keywords)
VALUES ('aa000000-0006-4000-8000-000000000001', 'home', 'CELLPHONES - Dien thoai chinh hang', 'Mua dien thoai va phu kien chinh hang', ARRAY['dien thoai','cellphones'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO branches (id, name, phone, address, is_active)
VALUES ('aa000000-0007-4000-8000-000000000001', 'CELLPHONES Quan 1', '18002097', '123 Ly Tu Trong, Quan 1, TP.HCM', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO staff_members (id, full_name, email, role, is_active)
VALUES ('aa000000-0008-4000-8000-000000000001', 'Admin CELLPHONES', 'admin@cellphones.local', 'ADMIN', TRUE)
ON CONFLICT (id) DO NOTHING;
