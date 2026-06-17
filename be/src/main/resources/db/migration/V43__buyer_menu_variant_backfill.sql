WITH target_products AS (
  SELECT
    p.id,
    p.slug,
    p.name,
    p.price,
    p.original_price,
    COUNT(pv.id) AS variant_count
  FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN product_variants pv ON pv.product_id = p.id
  WHERE c.slug IN ('dien-thoai-realme', 'dong-ho-thong-minh', 'sac-pin', 'tai-nghe', 'thiet-bi-cong-nghe')
  GROUP BY p.id, p.slug, p.name, p.price, p.original_price
),
variant_templates AS (
  SELECT *
  FROM (VALUES
    (1, 'Standard - Black', 0, 'Black'),
    (2, 'Standard - White', 100000, 'White'),
    (3, 'Premium - Blue', 250000, 'Blue')
  ) AS v(rn, variant_name, price_delta, color)
),
missing_variants AS (
  SELECT
    tp.*,
    vt.rn,
    vt.variant_name,
    vt.price_delta,
    vt.color
  FROM target_products tp
  JOIN variant_templates vt ON vt.rn > tp.variant_count
  WHERE tp.variant_count < 3
)
INSERT INTO product_variants (
  id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active, min_stock, imei_serials
)
SELECT
  gen_random_uuid(),
  id,
  variant_name,
  LEFT(UPPER(regexp_replace(slug, '[^a-zA-Z0-9]+', '_', 'g')), 70) || '_MENU_BACKFILL_' || rn,
  price + price_delta,
  CASE WHEN original_price IS NULL THEN NULL ELSE original_price + price_delta END,
  25 + rn * 5,
  color,
  NULL,
  NULL,
  TRUE,
  5,
  '{}'
FROM missing_variants
ON CONFLICT (sku) DO NOTHING;

WITH variants_without_images AS (
  SELECT
    pv.id AS variant_id,
    pv.product_id,
    pv.name AS variant_name,
    ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at, pv.id) AS variant_rn
  FROM product_variants pv
  JOIN products p ON p.id = pv.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE c.slug IN ('dien-thoai-realme', 'dong-ho-thong-minh', 'sac-pin', 'tai-nghe', 'thiet-bi-cong-nghe')
    AND NOT EXISTS (
      SELECT 1
      FROM product_images pi
      WHERE pi.variant_id = pv.id
    )
),
product_image_pool AS (
  SELECT
    pi.product_id,
    pi.url,
    ROW_NUMBER() OVER (
      PARTITION BY pi.product_id
      ORDER BY CASE WHEN pi.is_primary THEN 0 ELSE 1 END, pi.sort_order, pi.id
    ) AS image_rn,
    COUNT(*) OVER (PARTITION BY pi.product_id) AS image_count
  FROM product_images pi
  WHERE pi.variant_id IS NULL
),
chosen_images AS (
  SELECT
    vwi.variant_id,
    vwi.product_id,
    vwi.variant_name,
    vwi.variant_rn,
    pip.url
  FROM variants_without_images vwi
  JOIN product_image_pool pip
    ON pip.product_id = vwi.product_id
   AND pip.image_rn = ((vwi.variant_rn - 1) % pip.image_count) + 1
)
INSERT INTO product_images (id, product_id, variant_id, url, alt_text, sort_order, is_primary)
SELECT
  gen_random_uuid(),
  product_id,
  variant_id,
  url,
  variant_name || ' - variant image',
  500 + variant_rn,
  FALSE
FROM chosen_images;
