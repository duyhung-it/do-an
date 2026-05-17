CREATE TYPE admin_user_role AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');
CREATE TYPE admin_user_status AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');
CREATE TYPE app_notification_type AS ENUM ('ORDER', 'PAYMENT', 'PROMOTION', 'LOYALTY', 'SYSTEM', 'REVIEW');
CREATE TYPE app_notification_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE combo_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE blog_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  role admin_user_role NOT NULL DEFAULT 'CUSTOMER',
  status admin_user_status NOT NULL DEFAULT 'ACTIVE',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type app_notification_type NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  priority app_notification_priority NOT NULL DEFAULT 'MEDIUM',
  category VARCHAR(100) NOT NULL DEFAULT 'system',
  entity_type VARCHAR(100),
  entity_id UUID,
  action_url TEXT,
  action_label VARCHAR(100),
  is_actionable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE internal_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(300) NOT NULL,
  contact_person VARCHAR(200) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  email VARCHAR(200) NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  categories TEXT[] NOT NULL DEFAULT '{}',
  payment_terms TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(200) NOT NULL,
  logo_url TEXT,
  months INT NOT NULL CHECK (months > 0),
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  min_amount BIGINT NOT NULL DEFAULT 0,
  max_amount BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(300) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_ids UUID[] NOT NULL DEFAULT '{}',
  price BIGINT NOT NULL DEFAULT 0,
  status combo_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  status blog_status NOT NULL DEFAULT 'DRAFT',
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  admin_name VARCHAR(200) NOT NULL DEFAULT 'Admin CELLPHONES',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO admin_users (id, full_name, email, phone, role, status)
VALUES
  ('ee000000-0001-4000-8000-000000000001', 'Admin CELLPHONES', 'admin@cellphones.local', '18002097', 'ADMIN', 'ACTIVE'),
  ('ee000000-0001-4000-8000-000000000002', 'Staff Quan 1', 'staff.q1@cellphones.local', '0901000001', 'STAFF', 'ACTIVE'),
  ('ee000000-0001-4000-8000-000000000003', 'QA Customer Admin View', 'qa.customer@cellphones.local', '0901000002', 'CUSTOMER', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO internal_suppliers (id, name, contact_person, phone, email, address, categories, payment_terms, is_active)
VALUES
  ('ee000000-0002-4000-8000-000000000001', 'Apple Viet Nam Distributor', 'Nguyen Supplier', '0902000001', 'apple-supplier@cellphones.local', 'TP.HCM', ARRAY['iPhone','Phu kien'], 'Net 30', TRUE),
  ('ee000000-0002-4000-8000-000000000002', 'Samsung Authorized Partner', 'Tran Supplier', '0902000002', 'samsung-supplier@cellphones.local', 'Ha Noi', ARRAY['Samsung'], 'Net 15', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO installment_plans (id, bank_name, logo_url, months, interest_rate, min_amount, max_amount, is_active)
VALUES
  ('ee000000-0003-4000-8000-000000000001', 'Home Credit', 'https://cdn.cellphones.vn/installments/home-credit.png', 6, 1.50, 3000000, 50000000, TRUE),
  ('ee000000-0003-4000-8000-000000000002', 'FE Credit', 'https://cdn.cellphones.vn/installments/fe-credit.png', 12, 1.80, 5000000, 80000000, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_notifications (id, user_id, type, title, message, priority, category, action_url, action_label, is_actionable)
VALUES
  ('ee000000-0004-4000-8000-000000000001', 'bc000000-0001-4000-8000-000000000003', 'LOYALTY', 'Diem thuong moi', 'Ban vua nhan diem loyalty QA.', 'MEDIUM', 'loyalty', '/loyalty', 'Xem diem', TRUE),
  ('ee000000-0004-4000-8000-000000000002', 'bc000000-0001-4000-8000-000000000008', 'ORDER', 'Don hang da giao', 'Don QA-ADMIN-0008 da duoc giao thanh cong.', 'HIGH', 'order', '/orders', 'Xem don', TRUE)
ON CONFLICT (id) DO NOTHING;
