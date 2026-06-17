INSERT INTO admin_users (id, full_name, email, phone, role, status, avatar_url, created_at, updated_at)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Admin CELLPHONES',
  'admin@cellphones.vn',
  '0901234567',
  'ADMIN',
  'ACTIVE',
  'https://cdn.cellphones.vn/users/admin.png',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

INSERT INTO auth_credentials (user_id, email, password_hash, role, created_at, updated_at)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'admin@cellphones.vn',
  'plain:123456',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = NOW();
