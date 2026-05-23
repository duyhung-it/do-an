CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  avatar_url TEXT,
  address TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO customer_profiles (
  id, full_name, email, phone, role, status, avatar_url, address,
  email_verified, phone_verified, created_at, updated_at
)
VALUES
  (
    '00000000-0000-4000-8000-000000000199',
    'Demo Buyer',
    'buyer.demo@cellphones.local',
    '0900000199',
    'CUSTOMER',
    'ACTIVE',
    'https://cdn.cellphones.vn/users/demo-buyer.png',
    '1 Demo Street, TP. Ho Chi Minh',
    TRUE,
    TRUE,
    NOW() - INTERVAL '30 days',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  address = EXCLUDED.address,
  email_verified = EXCLUDED.email_verified,
  phone_verified = EXCLUDED.phone_verified,
  updated_at = NOW();
