CREATE TABLE IF NOT EXISTS customer_wishlist (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_price BIGINT NOT NULL DEFAULT 0,
  price_alert BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_wishlist_user_id ON customer_wishlist(user_id, created_at DESC);

INSERT INTO customer_wishlist (id, user_id, product_id, added_price, price_alert, created_at, updated_at)
SELECT ('dd000001-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       '00000000-0000-4000-8000-000000000199'::uuid,
       product_id,
       p.price,
       p.price - (n * 100000),
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM (
  SELECT ROW_NUMBER() OVER (ORDER BY p.created_at DESC, p.id) AS n, p.id AS product_id
  FROM products p
  WHERE p.status = 'ACTIVE'
  ORDER BY p.created_at DESC, p.id
  LIMIT 10
) seeded
JOIN products p ON p.id = seeded.product_id
ON CONFLICT (user_id, product_id) DO NOTHING;
