CREATE TEMP TABLE catalog_real_image_pool (
  pool_key TEXT NOT NULL,
  sort_order INT NOT NULL,
  url TEXT NOT NULL,
  alt_suffix TEXT NOT NULL,
  PRIMARY KEY (pool_key, sort_order)
) ON COMMIT DROP;

INSERT INTO catalog_real_image_pool (pool_key, sort_order, url, alt_suffix)
VALUES
  ('ApplePhone', 1, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg', 'front'),
  ('ApplePhone', 2, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-2.jpg', 'back'),
  ('ApplePhone', 3, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg', 'color view'),
  ('SamsungPhone', 1, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-1.jpg', 'front'),
  ('SamsungPhone', 2, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-2.jpg', 'back'),
  ('SamsungPhone', 3, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg', 'color view'),
  ('XiaomiPhone', 1, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg', 'front'),
  ('XiaomiPhone', 2, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-2.jpg', 'back'),
  ('XiaomiPhone', 3, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg', 'color view'),
  ('OPPOPhone', 1, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg', 'front'),
  ('OPPOPhone', 2, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg', 'back'),
  ('OPPOPhone', 3, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno12-1.jpg', 'color view'),
  ('VivoPhone', 1, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg', 'front'),
  ('VivoPhone', 2, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg', 'back'),
  ('VivoPhone', 3, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg', 'color view'),
  ('Headphone', 1, 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg', 'front'),
  ('Headphone', 2, 'https://www.apple.com/newsroom/images/product/airpods/standard/Apple-AirPods-Pro-2nd-gen-hero-220907_big.jpg.large.jpg', 'case'),
  ('Headphone', 3, 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg', 'color view'),
  ('Charger', 1, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MHJA3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1602179319000', 'front'),
  ('Charger', 2, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU7V2?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1542406417329', 'cable'),
  ('Charger', 3, 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg', 'box'),
  ('Case', 1, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1692730462265', 'front'),
  ('Case', 2, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MW493?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707856719583', 'back'),
  ('Case', 3, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1692730462265', 'color view');

CREATE TEMP TABLE catalog_variant_templates (
  template_key TEXT NOT NULL,
  rn INT NOT NULL,
  suffix TEXT NOT NULL,
  price_delta BIGINT NOT NULL,
  stock_delta INT NOT NULL,
  color TEXT,
  storage TEXT,
  ram TEXT,
  PRIMARY KEY (template_key, rn)
) ON COMMIT DROP;

INSERT INTO catalog_variant_templates (
  template_key, rn, suffix, price_delta, stock_delta, color, storage, ram
)
VALUES
  ('Phone', 1, '128GB - Black', 0, 0, 'Black', '128GB', '8GB'),
  ('Phone', 2, '256GB - Blue', 1200000, 8, 'Blue', '256GB', '8GB'),
  ('Phone', 3, '512GB - Silver', 3000000, 4, 'Silver', '512GB', '12GB'),
  ('Accessory', 1, 'Standard - White', 0, 0, 'White', NULL, NULL),
  ('Accessory', 2, 'Standard - Black', 50000, 12, 'Black', NULL, NULL),
  ('Accessory', 3, 'Premium - Blue', 120000, 6, 'Blue', NULL, NULL);

WITH product_counts AS (
  SELECT
    p.id,
    p.slug,
    p.name,
    p.price,
    p.original_price,
    COALESCE(MAX(pv.stock), 20) AS base_stock,
    COUNT(pv.id) AS variant_count,
    CASE WHEN p.category_name IN ('Tai nghe', 'Sac cap', 'Op lung') THEN 'Accessory' ELSE 'Phone' END AS template_key
  FROM products p
  LEFT JOIN product_variants pv ON pv.product_id = p.id
  GROUP BY p.id, p.slug, p.name, p.price, p.original_price, p.category_name
),
missing_variants AS (
  SELECT
    pc.*,
    vt.rn,
    vt.suffix,
    vt.price_delta,
    vt.stock_delta,
    vt.color,
    vt.storage,
    vt.ram,
    ROW_NUMBER() OVER (PARTITION BY pc.id ORDER BY vt.rn) AS insert_order
  FROM product_counts pc
  JOIN catalog_variant_templates vt ON vt.template_key = pc.template_key
  WHERE vt.rn > pc.variant_count
    AND pc.variant_count < 3
)
INSERT INTO product_variants (
  id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active, min_stock, imei_serials
)
SELECT
  gen_random_uuid(),
  id,
  suffix,
  LEFT(UPPER(regexp_replace(slug, '[^a-zA-Z0-9]+', '_', 'g')), 70) || '_AUTO_' || rn || '_' || SUBSTRING(id::text, 1, 8),
  price + price_delta,
  CASE WHEN original_price IS NULL THEN NULL ELSE original_price + price_delta END,
  GREATEST(0, base_stock + stock_delta),
  color,
  storage,
  ram,
  TRUE,
  5,
  '{}'
FROM missing_variants
ORDER BY slug, rn
ON CONFLICT (sku) DO NOTHING;

WITH product_image_counts AS (
  SELECT
    p.id,
    p.name,
    p.brand,
    p.category_name,
    COUNT(pi.id) AS image_count,
    CASE
      WHEN p.category_name = 'iPhone' THEN 'ApplePhone'
      WHEN p.category_name = 'Samsung' THEN 'SamsungPhone'
      WHEN p.category_name = 'Xiaomi' THEN 'XiaomiPhone'
      WHEN p.category_name = 'OPPO' THEN 'OPPOPhone'
      WHEN p.category_name = 'Vivo' THEN 'VivoPhone'
      WHEN p.category_name = 'Tai nghe' THEN 'Headphone'
      WHEN p.category_name = 'Sac cap' THEN 'Charger'
      WHEN p.category_name = 'Op lung' THEN 'Case'
      WHEN p.brand = 'Apple' THEN 'ApplePhone'
      WHEN p.brand = 'Samsung' THEN 'SamsungPhone'
      WHEN p.brand = 'Xiaomi' THEN 'XiaomiPhone'
      WHEN p.brand = 'OPPO' THEN 'OPPOPhone'
      WHEN p.brand = 'Vivo' THEN 'VivoPhone'
      ELSE 'ApplePhone'
    END AS pool_key
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.id
  GROUP BY p.id, p.name, p.brand, p.category_name
),
missing_images AS (
  SELECT
    pic.*,
    pool.sort_order,
    pool.url,
    pool.alt_suffix
  FROM product_image_counts pic
  JOIN catalog_real_image_pool pool ON pool.pool_key = pic.pool_key
  WHERE pool.sort_order > pic.image_count
    AND pic.image_count < 3
)
INSERT INTO product_images (
  id, product_id, variant_id, url, alt_text, sort_order, is_primary
)
SELECT
  gen_random_uuid(),
  id,
  NULL,
  url,
  name || ' - ' || alt_suffix,
  200 + sort_order,
  FALSE
FROM missing_images
ORDER BY name, sort_order;
