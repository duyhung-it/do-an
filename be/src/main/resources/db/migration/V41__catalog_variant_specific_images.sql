WITH variant_targets AS (
  SELECT
    pv.id AS variant_id,
    pv.product_id,
    pv.name AS variant_name,
    ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at, pv.id) AS variant_rn
  FROM product_variants pv
  WHERE NOT EXISTS (
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
    vt.variant_id,
    vt.product_id,
    vt.variant_name,
    vt.variant_rn,
    pip.url
  FROM variant_targets vt
  JOIN product_image_pool pip
    ON pip.product_id = vt.product_id
   AND pip.image_rn = ((vt.variant_rn - 1) % pip.image_count) + 1
)
INSERT INTO product_images (
  id, product_id, variant_id, url, alt_text, sort_order, is_primary
)
SELECT
  gen_random_uuid(),
  product_id,
  variant_id,
  url,
  variant_name || ' - variant image',
  500 + variant_rn,
  FALSE
FROM chosen_images
ORDER BY product_id, variant_rn;
