UPDATE products
SET category_id = 'a1b2c3d4-0001-0001-0001-000000000009',
    category_name = 'Sac cap',
    status = 'ACTIVE',
    updated_at = NOW()
WHERE id = 'b1b2c3d4-0001-0001-0001-000000000003';

UPDATE products
SET status = 'ACTIVE',
    updated_at = NOW()
WHERE id = 'b1b2c3d4-0001-0001-0001-000000000010';

WITH leaf_categories AS (
  SELECT *
  FROM (VALUES
    ('a1b2c3d4-0001-0001-0001-000000000003'::uuid, 'iPhone', 'iphone', 'Apple', 17990000, 22990000, ARRAY['iphone','apple','5g']::text[], 'iOS', 'A series', 'Super Retina XDR'),
    ('a1b2c3d4-0001-0001-0001-000000000002'::uuid, 'Samsung', 'samsung', 'Samsung', 7990000, 9990000, ARRAY['samsung','galaxy','android']::text[], 'Android', 'Snapdragon/Exynos', 'Dynamic AMOLED'),
    ('a1b2c3d4-0001-0001-0001-000000000005'::uuid, 'Xiaomi', 'xiaomi', 'Xiaomi', 5990000, 7990000, ARRAY['xiaomi','android','sac-nhanh']::text[], 'Android', 'Snapdragon', 'AMOLED'),
    ('a1b2c3d4-0001-0001-0001-000000000006'::uuid, 'OPPO', 'oppo', 'OPPO', 6490000, 8490000, ARRAY['oppo','camera','android']::text[], 'Android', 'Dimensity', 'AMOLED'),
    ('a1b2c3d4-0001-0001-0001-000000000007'::uuid, 'Vivo', 'vivo', 'Vivo', 6290000, 8290000, ARRAY['vivo','camera','android']::text[], 'Android', 'Snapdragon', 'AMOLED'),
    ('a1b2c3d4-0001-0001-0001-000000000008'::uuid, 'Tai nghe', 'tai-nghe', 'Apple', 590000, 890000, ARRAY['tai-nghe','bluetooth','phu-kien']::text[], NULL, NULL, NULL),
    ('a1b2c3d4-0001-0001-0001-000000000009'::uuid, 'Sac cap', 'sac-cap', 'Anker', 290000, 490000, ARRAY['sac-cap','usb-c','phu-kien']::text[], NULL, NULL, NULL),
    ('a1b2c3d4-0001-0001-0001-000000000010'::uuid, 'Op lung', 'op-lung', 'Uniq', 190000, 290000, ARRAY['op-lung','bao-ve','phu-kien']::text[], NULL, NULL, NULL)
  ) AS c(category_id, category_name, slug_prefix, brand, base_price, base_original_price, tags, os, chip, screen)
),
missing_products AS (
  SELECT
    c.*,
    gs.n
  FROM leaf_categories c
  CROSS JOIN LATERAL generate_series(
    1,
    GREATEST(0, 10 - (
      SELECT COUNT(*)
      FROM products p
      WHERE p.category_id = c.category_id
        AND p.status = 'ACTIVE'
    ))::int
  ) AS gs(n)
),
inserted_products AS (
  INSERT INTO products (
    id, name, slug, description, short_description, category_id, category_name,
    brand, price, original_price, discount_percent, status, condition, rating,
    review_count, sold_count, view_count, warranty, tags, specifications, color,
    is_new, is_featured, is_hot, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    category_name || ' Demo ' || LPAD(n::text, 2, '0'),
    slug_prefix || '-demo-' || LPAD(n::text, 2, '0'),
    '<p>San pham demo ' || category_name || ' phuc vu man hinh danh sach va loc danh muc.</p>',
    CASE
      WHEN os IS NULL THEN 'Phu kien demo, co san hang, bao hanh ro rang'
      ELSE 'Dien thoai demo, cau hinh tot, co san hang'
    END,
    category_id,
    category_name,
    brand,
    base_price + (n * 100000),
    base_original_price + (n * 100000),
    10 + (n % 8),
    'ACTIVE',
    'NEW',
    4.0 + ((n % 8)::numeric / 10),
    8 + n,
    20 + n * 3,
    500 + n * 120,
    CASE WHEN os IS NULL THEN 6 ELSE 12 END,
    tags,
    CASE
      WHEN os IS NULL THEN jsonb_build_object('Bao hanh', '6 thang', 'Tinh trang', 'Moi')
      ELSE jsonb_build_object('Chip', chip, 'RAM', '8GB', 'Bo nho trong', '128GB', 'Man hinh', screen, 'He dieu hanh', os)
    END,
    CASE n % 4 WHEN 0 THEN 'Den' WHEN 1 THEN 'Trang' WHEN 2 THEN 'Xanh' ELSE 'Bac' END,
    n <= 3,
    n IN (1, 4, 7),
    n IN (2, 5, 8),
    NOW() - (n || ' days')::interval,
    NOW()
  FROM missing_products
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, name, slug, category_name, brand, price, original_price, color
)
INSERT INTO product_variants (id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active)
SELECT
  gen_random_uuid(),
  id,
  CASE
    WHEN category_name IN ('Tai nghe', 'Sac cap', 'Op lung') THEN 'Tieu chuan - ' || color
    ELSE '128GB - ' || color
  END,
  upper(replace(slug, '-', '_')),
  price,
  original_price,
  20 + (ROW_NUMBER() OVER (ORDER BY slug) * 3),
  color,
  CASE WHEN category_name IN ('Tai nghe', 'Sac cap', 'Op lung') THEN NULL ELSE '128GB' END,
  CASE WHEN category_name IN ('Tai nghe', 'Sac cap', 'Op lung') THEN NULL ELSE '8GB' END,
  TRUE
FROM inserted_products
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
SELECT
  gen_random_uuid(),
  p.id,
  'https://placehold.co/900x900/f8fafc/334155?text=' || replace(p.name, ' ', '+'),
  p.name,
  0,
  TRUE
FROM products p
WHERE p.slug LIKE '%-demo-%'
  AND NOT EXISTS (
    SELECT 1
    FROM product_images pi
    WHERE pi.product_id = p.id
      AND pi.is_primary = TRUE
  );

INSERT INTO phone_specs (
  id, product_id, chip, ram, storage, battery, camera, front_camera, screen, os,
  connectivity, weight, dimensions, water_resistance, sim_type, charging_speed, gpu
)
SELECT
  gen_random_uuid(),
  p.id,
  COALESCE(p.specifications ->> 'Chip', 'Snapdragon 7 Gen 3'),
  COALESCE(p.specifications ->> 'RAM', '8GB'),
  COALESCE(p.specifications ->> 'Bo nho trong', '128GB'),
  '5000mAh',
  '50MP main + 8MP ultrawide',
  '16MP',
  COALESCE(p.specifications ->> 'Man hinh', 'AMOLED 120Hz'),
  COALESCE(p.specifications ->> 'He dieu hanh', 'Android'),
  '5G, Wi-Fi, Bluetooth, USB-C',
  '190g',
  '160 x 75 x 8 mm',
  'IP54',
  'Nano SIM + eSIM',
  'USB-C fast charging',
  'Integrated GPU'
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.parent_id = 'a1b2c3d4-0001-0001-0001-000000000001'
  AND p.slug LIKE '%-demo-%'
  AND NOT EXISTS (
    SELECT 1
    FROM phone_specs ps
    WHERE ps.product_id = p.id
  );

UPDATE categories c
SET product_count = counts.active_product_count,
    updated_at = NOW()
FROM (
  SELECT
    c.id,
    COUNT(p.id)::int AS active_product_count
  FROM categories c
  LEFT JOIN categories leaf
    ON leaf.id = c.id
    OR leaf.path LIKE c.path || '/%'
  LEFT JOIN products p
    ON p.category_id = leaf.id
    AND p.status = 'ACTIVE'
  GROUP BY c.id
) counts
WHERE counts.id = c.id;
