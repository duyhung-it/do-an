WITH selected_variants AS (
  SELECT
    pv.id AS variant_id,
    pv.product_id,
    p.name AS product_name,
    pv.name AS variant_name,
    ROW_NUMBER() OVER (ORDER BY p.created_at, pv.created_at, pv.id) AS rn
  FROM product_variants pv
  JOIN products p ON p.id = pv.product_id
  WHERE pv.is_active = TRUE
  ORDER BY p.created_at, pv.created_at, pv.id
  LIMIT 10
)
INSERT INTO product_images (id, product_id, variant_id, url, alt_text, sort_order, is_primary)
SELECT
  gen_random_uuid(),
  product_id,
  variant_id,
  'https://placehold.co/900x900/f8fafc/334155?text=' || replace(product_name || ' ' || variant_name, ' ', '+'),
  product_name || ' - ' || variant_name,
  100 + rn,
  FALSE
FROM selected_variants;
