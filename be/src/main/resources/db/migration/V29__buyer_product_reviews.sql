ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS helpful_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS product_review_helpful_votes (
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_product_reviews_customer_product
  ON product_reviews(customer_id, product_id)
  WHERE customer_id IS NOT NULL AND product_id IS NOT NULL;

INSERT INTO product_reviews (
  id, product_id, order_id, customer_id, customer_name, rating, title, content,
  status, helpful_count, is_verified_purchase, created_at, updated_at
)
SELECT ('dd000002-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       p.id,
       NULL,
       '00000000-0000-4000-8000-000000000199'::uuid,
       'Demo Buyer',
       CASE WHEN n IN (3, 7) THEN 4 ELSE 5 END,
       'Danh gia demo ' || n,
       'San pham dung tot, phu hop nhu cau B2C demo ' || n,
       'APPROVED'::review_status,
       n * 2,
       TRUE,
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM (
  SELECT ROW_NUMBER() OVER (ORDER BY p.created_at DESC, p.id) AS n, p.id
  FROM products p
  WHERE p.status = 'ACTIVE'
  ORDER BY p.created_at DESC, p.id
  LIMIT 10
) p
WHERE NOT EXISTS (
  SELECT 1
  FROM product_reviews pr
  WHERE pr.customer_id = '00000000-0000-4000-8000-000000000199'::uuid
    AND pr.product_id = p.id
);
