CREATE TABLE IF NOT EXISTS branch_product_inventory (
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (branch_id, product_id)
);

INSERT INTO branch_product_inventory (branch_id, product_id, stock, updated_at)
SELECT b.id,
       p.id,
       ((ABS(('x' || SUBSTRING(MD5(b.id::text || p.id::text), 1, 8))::bit(32)::int) % 8) + 1),
       NOW()
FROM branches b
CROSS JOIN (
  SELECT id
  FROM products
  WHERE status = 'ACTIVE'
  ORDER BY created_at DESC, id
  LIMIT 20
) p
WHERE b.is_active = TRUE
ON CONFLICT (branch_id, product_id) DO NOTHING;
