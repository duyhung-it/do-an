CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  label VARCHAR(120) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  ward VARCHAR(120) NOT NULL,
  district VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL DEFAULT 'Viet Nam',
  postal_code VARCHAR(30),
  type VARCHAR(30),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_customer_addresses_default
  ON customer_addresses(user_id)
  WHERE is_default = TRUE;

INSERT INTO customer_addresses (
  id, user_id, label, full_name, phone, address, ward, district, city, country,
  postal_code, type, is_default, notes, created_at, updated_at
)
SELECT ('dd000000-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       '00000000-0000-4000-8000-000000000199'::uuid,
       CASE WHEN n = 1 THEN 'Nha rieng' ELSE 'Dia chi ' || n END,
       'Demo Buyer',
       '0900000199',
       n || ' Demo Street',
       'Phuong ' || n,
       'Quan ' || n,
       'TP. Ho Chi Minh',
       'Viet Nam',
       NULL,
       CASE WHEN n = 1 THEN 'HOME' WHEN n = 2 THEN 'OFFICE' ELSE 'OTHER' END,
       n = 1,
       'Buyer demo saved address ' || n,
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM generate_series(1, 10) AS n
ON CONFLICT (id) DO NOTHING;
