UPDATE categories
SET name = 'Điện thoại',
    description = 'Điện thoại smartphone chính hãng',
    icon = 'smartphone',
    path = '/dien-thoai',
    updated_at = NOW()
WHERE id = 'a1b2c3d4-0001-0001-0001-000000000001';

UPDATE categories
SET name = 'Phụ kiện',
    description = 'Phụ kiện điện thoại và thiết bị công nghệ',
    icon = 'tag',
    path = '/phu-kien',
    updated_at = NOW()
WHERE id = 'a1b2c3d4-0001-0001-0001-000000000004';

UPDATE categories
SET name = 'Sạc & Pin',
    slug = 'sac-pin',
    description = 'Sạc nhanh, cáp sạc và pin dự phòng chính hãng',
    icon = 'battery',
    path = '/phu-kien/sac-pin',
    updated_at = NOW()
WHERE id = 'a1b2c3d4-0001-0001-0001-000000000009';

UPDATE products
SET category_name = 'Sạc & Pin',
    updated_at = NOW()
WHERE category_id = 'a1b2c3d4-0001-0001-0001-000000000009';

INSERT INTO categories (id, name, slug, description, icon, image_url, parent_id, level, path, is_active, sort_order, product_count, meta_title, meta_description)
VALUES
  ('a1b2c3d4-0001-0001-0001-000000000011', 'Realme', 'dien-thoai-realme', 'Điện thoại Realme chính hãng', 'smartphone', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt7-pro-1.jpg', 'a1b2c3d4-0001-0001-0001-000000000001', 1, '/dien-thoai/dien-thoai-realme', TRUE, 6, 0, 'Realme chính hãng | CellPhones', 'Mua điện thoại Realme chính hãng giá tốt'),
  ('a1b2c3d4-0001-0001-0001-000000000012', 'Đồng hồ thông minh', 'dong-ho-thong-minh', 'Smartwatch và vòng đeo tay thông minh', 'watch', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-watch-ultra2-1.jpg', NULL, 0, '/dong-ho-thong-minh', TRUE, 4, 0, 'Đồng hồ thông minh chính hãng | CellPhones', 'Mua Apple Watch, Galaxy Watch, Garmin, Amazfit chính hãng'),
  ('a1b2c3d4-0001-0001-0001-000000000013', 'Thiết bị công nghệ', 'thiet-bi-cong-nghe', 'Loa, router, bàn phím, chuột và thiết bị thông minh', 'cpu', 'https://m.media-amazon.com/images/I/71S4mjiit3L._AC_SL1500_.jpg', NULL, 0, '/thiet-bi-cong-nghe', TRUE, 6, 0, 'Thiết bị công nghệ chính hãng | CellPhones', 'Mua thiết bị công nghệ chính hãng')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    image_url = EXCLUDED.image_url,
    parent_id = EXCLUDED.parent_id,
    level = EXCLUDED.level,
    path = EXCLUDED.path,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();

CREATE TEMP TABLE buyer_menu_product_seed (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  category_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price BIGINT NOT NULL,
  original_price BIGINT NOT NULL,
  image_1 TEXT NOT NULL,
  image_2 TEXT NOT NULL,
  image_3 TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO buyer_menu_product_seed (
  slug, name, short_description, category_id, category_name, brand, price, original_price, image_1, image_2, image_3
)
VALUES
    ('realme-gt-7-pro-12gb-256gb', 'Realme GT 7 Pro 12GB 256GB', 'Realme GT 7 Pro dùng Snapdragon 8 Elite, màn AMOLED 120Hz và pin lớn.', 'a1b2c3d4-0001-0001-0001-000000000011'::uuid, 'Realme', 'Realme', 18990000, 20990000, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt7-pro-1.jpg', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt7-pro-2.jpg', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt7-pro-3.jpg'),
    ('realme-13-plus-5g-12gb-256gb', 'Realme 13+ 5G 12GB 256GB', 'Realme 13+ 5G cân bằng hiệu năng, pin và sạc nhanh cho nhu cầu hằng ngày.', 'a1b2c3d4-0001-0001-0001-000000000011'::uuid, 'Realme', 'Realme', 8990000, 9990000, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-13-plus-1.jpg', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-13-plus-2.jpg', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-13-plus-3.jpg'),
    ('realme-c75-8gb-256gb', 'Realme C75 8GB 256GB', 'Realme C75 pin bền, bộ nhớ lớn, phù hợp người dùng phổ thông.', 'a1b2c3d4-0001-0001-0001-000000000011'::uuid, 'Realme', 'Realme', 5690000, 6490000, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c75-1.jpg', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c75-2.jpg', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c75-3.jpg'),
    ('apple-watch-series-10-gps-42mm', 'Apple Watch Series 10 GPS 42mm', 'Apple Watch Series 10 mỏng nhẹ, màn hình lớn và theo dõi sức khỏe toàn diện.', 'a1b2c3d4-0001-0001-0001-000000000012'::uuid, 'Đồng hồ thông minh', 'Apple', 10990000, 11990000, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-watch-series-10-1.jpg', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-watch-series-10-2.jpg', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-watch-series-10-3.jpg'),
    ('samsung-galaxy-watch-ultra-lte', 'Samsung Galaxy Watch Ultra LTE', 'Galaxy Watch Ultra LTE thiết kế bền bỉ, định vị chính xác và pin dài.', 'a1b2c3d4-0001-0001-0001-000000000012'::uuid, 'Đồng hồ thông minh', 'Samsung', 12990000, 13990000, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-watch-ultra-1.jpg', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-watch-ultra-2.jpg', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-watch-ultra-3.jpg'),
    ('garmin-forerunner-265', 'Garmin Forerunner 265', 'Garmin Forerunner 265 dành cho chạy bộ với GPS đa băng tần và AMOLED.', 'a1b2c3d4-0001-0001-0001-000000000012'::uuid, 'Đồng hồ thông minh', 'Garmin', 10490000, 11990000, 'https://m.media-amazon.com/images/I/61Q8gKZUzBL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61uzchShKgL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61paJq7uXkL._AC_SL1500_.jpg'),
    ('amazfit-balance', 'Amazfit Balance', 'Amazfit Balance có màn AMOLED, pin dài và nhiều chế độ luyện tập.', 'a1b2c3d4-0001-0001-0001-000000000012'::uuid, 'Đồng hồ thông minh', 'Amazfit', 4990000, 5990000, 'https://m.media-amazon.com/images/I/61rJcq2e+UL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61bYsjJjX3L._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61qPr8VYeWL._AC_SL1500_.jpg'),
    ('huawei-watch-gt-5-46mm', 'Huawei Watch GT 5 46mm', 'Huawei Watch GT 5 thiết kế cổ điển, pin dài và theo dõi sức khỏe chính xác.', 'a1b2c3d4-0001-0001-0001-000000000012'::uuid, 'Đồng hồ thông minh', 'Huawei', 5490000, 6490000, 'https://fdn2.gsmarena.com/vv/pics/huawei/huawei-watch-gt-5-1.jpg', 'https://fdn2.gsmarena.com/vv/pics/huawei/huawei-watch-gt-5-2.jpg', 'https://fdn2.gsmarena.com/vv/pics/huawei/huawei-watch-gt-5-3.jpg'),
    ('baseus-adaman-power-bank-20000mah-65w', 'Baseus Adaman 20000mAh 65W', 'Pin dự phòng Baseus Adaman 20000mAh hỗ trợ sạc nhanh 65W.', 'a1b2c3d4-0001-0001-0001-000000000009'::uuid, 'Sạc & Pin', 'Baseus', 1090000, 1290000, 'https://m.media-amazon.com/images/I/61nDWmkwxHL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61CeO0nfUEL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/71GmccwDXFL._AC_SL1500_.jpg'),
    ('ugreen-nexode-gan-65w', 'UGREEN Nexode GaN 65W', 'Củ sạc UGREEN Nexode GaN 65W nhỏ gọn, nhiều cổng USB-C.', 'a1b2c3d4-0001-0001-0001-000000000009'::uuid, 'Sạc & Pin', 'UGREEN', 790000, 990000, 'https://m.media-amazon.com/images/I/51Qc8D9QKDL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61cqcNlgFdL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61lzNb1gViL._AC_SL1500_.jpg'),
    ('belkin-boostcharge-pro-3-in-1-magsafe', 'Belkin BoostCharge Pro 3-in-1 MagSafe', 'Đế sạc Belkin 3 trong 1 cho iPhone, Apple Watch và AirPods.', 'a1b2c3d4-0001-0001-0001-000000000009'::uuid, 'Sạc & Pin', 'Belkin', 3490000, 3990000, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/HPU82?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1664490869630', 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/HPU82_AV1?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1664490869434', 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/HPU82_AV2?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1664490869609'),
    ('pisen-power-bank-10000mah-22-5w', 'Pisen Power Bank 10000mAh 22.5W', 'Pin dự phòng Pisen 10000mAh hỗ trợ sạc nhanh cho điện thoại.', 'a1b2c3d4-0001-0001-0001-000000000009'::uuid, 'Sạc & Pin', 'Pisen', 490000, 590000, 'https://m.media-amazon.com/images/I/61Qb5PNXFRL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61wgfbjDRPL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61kLM7PAMCL._AC_SL1500_.jpg'),
    ('jbl-tune-770nc', 'JBL Tune 770NC', 'Tai nghe JBL Tune 770NC chống ồn chủ động, pin dài và âm bass mạnh.', 'a1b2c3d4-0001-0001-0001-000000000008'::uuid, 'Tai nghe', 'JBL', 2490000, 2990000, 'https://m.media-amazon.com/images/I/61u1VALn6JL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61JZm2xF7HL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61aBDeE9oQL._AC_SL1500_.jpg'),
    ('marshall-major-v', 'Marshall Major V', 'Marshall Major V có chất âm đặc trưng, thời lượng pin rất dài và thiết kế cổ điển.', 'a1b2c3d4-0001-0001-0001-000000000008'::uuid, 'Tai nghe', 'Marshall', 3990000, 4490000, 'https://m.media-amazon.com/images/I/71Q+Nw4J0xL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/71TsV1Kx7HL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/71RjT6CMhRL._AC_SL1500_.jpg'),
    ('sennheiser-momentum-4-wireless', 'Sennheiser Momentum 4 Wireless', 'Sennheiser Momentum 4 Wireless có âm thanh chi tiết và chống ồn cao cấp.', 'a1b2c3d4-0001-0001-0001-000000000008'::uuid, 'Tai nghe', 'Sennheiser', 7490000, 8990000, 'https://m.media-amazon.com/images/I/61Y84wDc1fL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61Z6FTWQ9OL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61TFWY+qRBL._AC_SL1500_.jpg'),
    ('tplink-archer-ax55-wifi-6', 'TP-Link Archer AX55 Wi-Fi 6', 'Router TP-Link Archer AX55 Wi-Fi 6 tốc độ cao cho gia đình và văn phòng nhỏ.', 'a1b2c3d4-0001-0001-0001-000000000013'::uuid, 'Thiết bị công nghệ', 'TP-Link', 1790000, 2190000, 'https://m.media-amazon.com/images/I/51R4FJdgbMS._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61CbAKk2g+L._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/51V+J2hIuDL._AC_SL1500_.jpg'),
    ('logitech-mx-keys-s', 'Logitech MX Keys S', 'Bàn phím Logitech MX Keys S gõ êm, đèn nền thông minh và kết nối đa thiết bị.', 'a1b2c3d4-0001-0001-0001-000000000013'::uuid, 'Thiết bị công nghệ', 'Logitech', 2690000, 2990000, 'https://m.media-amazon.com/images/I/61gj1B4xNHL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61ZXB2fP1fL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/61FJ3uP3lHL._AC_SL1500_.jpg'),
    ('sony-srs-xb100', 'Sony SRS-XB100', 'Loa Bluetooth Sony SRS-XB100 nhỏ gọn, chống nước và âm trầm tốt.', 'a1b2c3d4-0001-0001-0001-000000000013'::uuid, 'Thiết bị công nghệ', 'Sony', 1190000, 1490000, 'https://m.media-amazon.com/images/I/71S4mjiit3L._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/71+enJ7fIBL._AC_SL1500_.jpg', 'https://m.media-amazon.com/images/I/71UWtwY6P7L._AC_SL1500_.jpg')
;

WITH inserted_products AS (
  INSERT INTO products (
    id, name, slug, description, short_description, category_id, category_name,
    brand, price, original_price, discount_percent, status, condition, rating,
    review_count, sold_count, view_count, warranty, tags, specifications, color,
    is_new, is_featured, is_hot, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    name,
    slug,
    '<p>' || short_description || '</p>',
    short_description,
    category_id,
    category_name,
    brand,
    price,
    original_price,
    8,
    'ACTIVE',
    'NEW',
    4.6,
    24,
    120,
    1800,
    CASE WHEN category_name = 'Đồng hồ thông minh' THEN 12 ELSE 6 END,
    ARRAY[brand, category_name, 'chinh-hang']::text[],
    jsonb_build_object('Thương hiệu', brand, 'Bảo hành', CASE WHEN category_name = 'Đồng hồ thông minh' THEN '12 tháng' ELSE '6 tháng' END, 'Tình trạng', 'Mới'),
    'Black',
    TRUE,
    TRUE,
    FALSE,
    NOW(),
    NOW()
  FROM buyer_menu_product_seed
  ON CONFLICT (slug) DO NOTHING
  RETURNING id, slug, name, category_name, brand, price, original_price
),
target_products AS (
  SELECT p.id, p.slug, p.name, p.category_name, p.brand, p.price, p.original_price, ps.image_1, ps.image_2, ps.image_3
  FROM products p
  JOIN buyer_menu_product_seed ps ON ps.slug = p.slug
),
variant_seed AS (
  SELECT *
  FROM (VALUES
    (1, 'Standard - Black', 0, 'Black', NULL, NULL),
    (2, 'Standard - White', 100000, 'White', NULL, NULL),
    (3, 'Premium - Blue', 250000, 'Blue', NULL, NULL)
  ) AS v(rn, variant_name, price_delta, color, storage, ram)
),
image_seed AS (
  SELECT *
  FROM (VALUES
    (1, 'image_1'),
    (2, 'image_2'),
    (3, 'image_3')
  ) AS i(rn, image_key)
)
INSERT INTO product_variants (id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active, min_stock, imei_serials)
SELECT
  gen_random_uuid(),
  tp.id,
  vs.variant_name,
  LEFT(UPPER(regexp_replace(tp.slug, '[^a-zA-Z0-9]+', '_', 'g')), 70) || '_MENU_' || vs.rn,
  tp.price + vs.price_delta,
  tp.original_price + vs.price_delta,
  25 + vs.rn * 5,
  vs.color,
  vs.storage,
  vs.ram,
  TRUE,
  5,
  '{}'
FROM target_products tp
CROSS JOIN variant_seed vs
WHERE NOT EXISTS (
  SELECT 1
  FROM product_variants pv
  WHERE pv.product_id = tp.id
    AND pv.sku = LEFT(UPPER(regexp_replace(tp.slug, '[^a-zA-Z0-9]+', '_', 'g')), 70) || '_MENU_' || vs.rn
)
ON CONFLICT (sku) DO NOTHING;

WITH target_products AS (
  SELECT p.id, p.slug, p.name, ps.image_1, ps.image_2, ps.image_3
  FROM products p
  JOIN (
    SELECT slug, image_1, image_2, image_3
    FROM buyer_menu_product_seed
  ) ps ON ps.slug = p.slug
),
image_rows AS (
  SELECT id, name, 1 AS rn, image_1 AS url FROM target_products
  UNION ALL SELECT id, name, 2, image_2 FROM target_products
  UNION ALL SELECT id, name, 3, image_3 FROM target_products
)
INSERT INTO product_images (id, product_id, variant_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), id, NULL, url, name, rn, rn = 1
FROM image_rows ir
WHERE NOT EXISTS (
  SELECT 1
  FROM product_images pi
  WHERE pi.product_id = ir.id
    AND pi.variant_id IS NULL
    AND pi.url = ir.url
);

WITH target_products AS (
  SELECT p.id, p.slug, p.name, ps.image_1, ps.image_2, ps.image_3
  FROM products p
  JOIN (
    SELECT slug, image_1, image_2, image_3
    FROM buyer_menu_product_seed
  ) ps ON ps.slug = p.slug
),
ranked_variants AS (
  SELECT
    pv.id AS variant_id,
    pv.product_id,
    pv.name AS variant_name,
    ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at, pv.id) AS rn
  FROM product_variants pv
  JOIN target_products tp ON tp.id = pv.product_id
),
variant_images AS (
  SELECT
    rv.variant_id,
    rv.product_id,
    rv.variant_name,
    rv.rn,
    CASE rv.rn WHEN 1 THEN tp.image_1 WHEN 2 THEN tp.image_2 ELSE tp.image_3 END AS url
  FROM ranked_variants rv
  JOIN target_products tp ON tp.id = rv.product_id
  WHERE rv.rn <= 3
)
INSERT INTO product_images (id, product_id, variant_id, url, alt_text, sort_order, is_primary)
SELECT gen_random_uuid(), product_id, variant_id, url, variant_name || ' - variant image', 500 + rn, FALSE
FROM variant_images vi
WHERE NOT EXISTS (
  SELECT 1
  FROM product_images pi
  WHERE pi.variant_id = vi.variant_id
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
