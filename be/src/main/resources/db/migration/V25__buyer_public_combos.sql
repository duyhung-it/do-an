INSERT INTO product_combos (id, name, description, product_ids, price, status)
VALUES
  (
    'ee000000-0017-4000-8000-000000000001',
    'Combo iPhone 15 Pro Max + AirPods Pro',
    'Bo doi Apple cho nhu cau lam viec, giai tri va nghe goi chat luong cao.',
    ARRAY[
      'b1b2c3d4-0001-0001-0001-000000000001'::uuid,
      'b1b2c3d4-0001-0001-0001-000000000007'::uuid
    ],
    38990000,
    'ACTIVE'
  ),
  (
    'ee000000-0017-4000-8000-000000000002',
    'Combo Samsung S24 Ultra + Galaxy Watch',
    'Combo dien thoai va dong ho thong minh cho he sinh thai Samsung.',
    ARRAY[
      'b1b2c3d4-0001-0001-0001-000000000002'::uuid,
      'b1b2c3d4-0001-0001-0001-000000000008'::uuid
    ],
    32990000,
    'ACTIVE'
  )
ON CONFLICT (id) DO NOTHING;
