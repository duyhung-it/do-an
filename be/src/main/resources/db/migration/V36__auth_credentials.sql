CREATE TABLE IF NOT EXISTS auth_credentials (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_credentials_email_lower
  ON auth_credentials (lower(email));

INSERT INTO customer_profiles (
  id, full_name, email, phone, role, status, avatar_url, address,
  email_verified, phone_verified, created_at, updated_at
)
VALUES
  (
    '00000000-0000-4000-8000-000000000198',
    'Tran Thi Minh',
    'khachhang@gmail.com',
    '0900000198',
    'CUSTOMER',
    'ACTIVE',
    NULL,
    'TP. Ho Chi Minh',
    TRUE,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000197',
    'Le Hoang Duc',
    'lehoanhduc@gmail.com',
    '0900000197',
    'CUSTOMER',
    'ACTIVE',
    NULL,
    'Ha Noi',
    TRUE,
    TRUE,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth_credentials (user_id, email, password_hash, role, created_at, updated_at)
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'admin@cellphones.vn',
    'plain:123456',
    'ADMIN',
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO auth_credentials (user_id, email, password_hash, role, created_at, updated_at)
SELECT id, lower(email), 'plain:123456', COALESCE(role, 'CUSTOMER'), NOW(), NOW()
FROM customer_profiles
ON CONFLICT (email) DO NOTHING;

INSERT INTO auth_credentials (user_id, email, password_hash, role, created_at, updated_at)
SELECT id, lower(email), 'plain:123456', COALESCE(role::text, 'ADMIN'), NOW(), NOW()
FROM admin_users
ON CONFLICT (email) DO NOTHING;

INSERT INTO loyalty_programs (customer_id, customer_name, customer_email)
SELECT cp.id, cp.full_name, cp.email
FROM customer_profiles cp
WHERE lower(cp.email) IN ('khachhang@gmail.com', 'lehoanhduc@gmail.com')
ON CONFLICT (customer_id) DO NOTHING;
