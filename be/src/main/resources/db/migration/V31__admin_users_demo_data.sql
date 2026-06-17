INSERT INTO admin_users (id, full_name, email, phone, role, status, avatar_url, created_at, updated_at)
VALUES
  ('ee000000-0001-4000-8000-000000000004', 'Nguyen Minh Anh', 'minhanh@cellphones.local', '0901000004', 'CUSTOMER', 'ACTIVE', 'https://cdn.cellphones.vn/users/minh-anh.png', NOW() - INTERVAL '24 days', NOW() - INTERVAL '2 days'),
  ('ee000000-0001-4000-8000-000000000005', 'Tran Quoc Bao', 'quocbao@cellphones.local', '0901000005', 'CUSTOMER', 'ACTIVE', 'https://cdn.cellphones.vn/users/quoc-bao.png', NOW() - INTERVAL '21 days', NOW() - INTERVAL '3 days'),
  ('ee000000-0001-4000-8000-000000000006', 'Le Hoang Linh', 'hoanglinh@cellphones.local', '0901000006', 'CUSTOMER', 'LOCKED', 'https://cdn.cellphones.vn/users/hoang-linh.png', NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day'),
  ('ee000000-0001-4000-8000-000000000007', 'Pham Gia Han', 'giahan@cellphones.local', '0901000007', 'CUSTOMER', 'INACTIVE', 'https://cdn.cellphones.vn/users/gia-han.png', NOW() - INTERVAL '16 days', NOW() - INTERVAL '4 days'),
  ('ee000000-0001-4000-8000-000000000008', 'Do Tuan Kiet', 'tuankiet@cellphones.local', '0901000008', 'CUSTOMER', 'ACTIVE', 'https://cdn.cellphones.vn/users/tuan-kiet.png', NOW() - INTERVAL '13 days', NOW() - INTERVAL '5 days'),
  ('ee000000-0001-4000-8000-000000000009', 'Vu Ngoc Mai', 'ngocmai@cellphones.local', '0901000009', 'CUSTOMER', 'ACTIVE', 'https://cdn.cellphones.vn/users/ngoc-mai.png', NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days'),
  ('ee000000-0001-4000-8000-000000000010', 'Hoang Duc Phat', 'ducphat@cellphones.local', '0901000010', 'CUSTOMER', 'ACTIVE', 'https://cdn.cellphones.vn/users/duc-phat.png', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
  ('ee000000-0001-4000-8000-000000000011', 'Dang Thanh Tam', 'thanhtam.staff@cellphones.local', '0901000011', 'STAFF', 'ACTIVE', 'https://cdn.cellphones.vn/users/thanh-tam.png', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('ee000000-0001-4000-8000-000000000012', 'Bui Nhat Nam', 'nhatnam.staff@cellphones.local', '0901000012', 'STAFF', 'ACTIVE', 'https://cdn.cellphones.vn/users/nhat-nam.png', NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day'),
  ('ee000000-0001-4000-8000-000000000013', 'Admin Van Hanh', 'ops.admin@cellphones.local', '0901000013', 'ADMIN', 'ACTIVE', 'https://cdn.cellphones.vn/users/admin-ops.png', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = EXCLUDED.updated_at;
