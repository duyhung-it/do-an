CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name VARCHAR(500) NOT NULL,
  product_image TEXT NOT NULL,
  brand VARCHAR(100) NOT NULL,
  variant_name VARCHAR(300),
  color VARCHAR(100),
  storage VARCHAR(50),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price BIGINT NOT NULL,
  total_price BIGINT GENERATED ALWAYS AS (quantity * unit_price) STORED,
  note TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uk_cart_items_user_product_variant
  ON cart_items(user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
