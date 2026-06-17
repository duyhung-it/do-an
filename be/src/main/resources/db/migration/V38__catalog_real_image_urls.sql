WITH image_updates (image_id, url, alt_text) AS (
  VALUES
    ('d1b2c3d4-0001-0001-0001-000000000001'::uuid, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg', 'iPhone 15 Pro Max Natural Titanium'),
    ('d1b2c3d4-0001-0001-0001-000000000002'::uuid, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-2.jpg', 'iPhone 15 Pro Max back view'),
    ('d1b2c3d4-0001-0001-0001-000000000003'::uuid, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-1.jpg', 'Samsung Galaxy S24 Ultra'),
    ('d1b2c3d4-0001-0001-0001-000000000004'::uuid, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MHJA3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1602179319000', 'Apple USB-C 20W Power Adapter'),
    ('d1b2c3d4-0001-0001-0001-000000000005'::uuid, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg', 'iPhone 15 blue'),
    ('d1b2c3d4-0001-0001-0001-000000000006'::uuid, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-2.jpg', 'iPhone 15 black'),
    ('d1b2c3d4-0001-0001-0001-000000000007'::uuid, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg', 'Samsung Galaxy A55'),
    ('d1b2c3d4-0001-0001-0001-000000000008'::uuid, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg', 'Xiaomi 14 black'),
    ('d1b2c3d4-0001-0001-0001-000000000009'::uuid, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg', 'OPPO Reno12'),
    ('d1b2c3d4-0001-0001-0001-000000000010'::uuid, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg', 'Vivo V30'),
    ('d1b2c3d4-0001-0001-0001-000000000011'::uuid, 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg', 'AirPods Pro 2 USB-C'),
    ('d1b2c3d4-0001-0001-0001-000000000012'::uuid, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1542406417329', 'Apple USB-C Charge Cable'),
    ('d1b2c3d4-0001-0001-0001-000000000013'::uuid, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-2.jpg', 'Xiaomi 14 green'),
    ('d1b2c3d4-0001-0001-0001-000000000014'::uuid, 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg', 'AirPods Pro 2 charging case'),
    ('d1b2c3d4-0001-0001-0001-000000000015'::uuid, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1692730462265', 'iPhone 15 Pro Max Clear Case')
)
UPDATE product_images pi
SET url = iu.url,
    alt_text = iu.alt_text
FROM image_updates iu
WHERE pi.id = iu.image_id;

UPDATE product_images pi
SET url = CASE
    WHEN p.brand = 'Apple' AND p.category_name = 'iPhone' THEN 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg'
    WHEN p.brand = 'Samsung' THEN 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg'
    WHEN p.brand = 'Xiaomi' THEN 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg'
    WHEN p.brand = 'OPPO' THEN 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg'
    WHEN p.brand = 'Vivo' THEN 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg'
    WHEN p.category_name = 'Tai nghe' THEN 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg'
    WHEN p.category_name = 'Sac cap' THEN 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1542406417329'
    WHEN p.category_name = 'Op lung' THEN 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1692730462265'
    ELSE 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg'
  END,
  alt_text = COALESCE(NULLIF(pi.alt_text, ''), p.name)
FROM products p
WHERE pi.product_id = p.id
  AND (
    pi.url LIKE 'https://placehold.co/%'
    OR pi.url LIKE 'https://cdn.cellphones.vn/products/%'
  );

UPDATE categories
SET image_url = CASE slug
    WHEN 'dien-thoai' THEN 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg'
    WHEN 'dien-thoai-samsung' THEN 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-1.jpg'
    WHEN 'iphone' THEN 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg'
    WHEN 'phu-kien' THEN 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MHJA3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1602179319000'
    WHEN 'xiaomi' THEN 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg'
    WHEN 'oppo' THEN 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg'
    WHEN 'vivo' THEN 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg'
    WHEN 'tai-nghe' THEN 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg'
    WHEN 'sac-cap' THEN 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1542406417329'
    WHEN 'op-lung' THEN 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1692730462265'
    ELSE image_url
  END,
  updated_at = NOW()
WHERE slug IN ('dien-thoai', 'dien-thoai-samsung', 'iphone', 'phu-kien', 'xiaomi', 'oppo', 'vivo', 'tai-nghe', 'sac-cap', 'op-lung');

UPDATE banners
SET image_url = CASE
    WHEN title ILIKE '%iphone%' THEN 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg'
    WHEN title ILIKE '%samsung%' OR title ILIKE '%galaxy%' THEN 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-1.jpg'
    WHEN title ILIKE '%airpods%' THEN 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg'
    WHEN title ILIKE '%xiaomi%' THEN 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg'
    WHEN title ILIKE '%oppo%' THEN 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg'
    WHEN title ILIKE '%vivo%' THEN 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg'
    WHEN title ILIKE '%charger%' OR title ILIKE '%sac%' THEN 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MHJA3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1602179319000'
    ELSE 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg'
  END,
  updated_at = NOW()
WHERE image_url LIKE 'https://cdn.cellphones.vn/banners/%';
