CREATE TABLE order_stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

CREATE INDEX idx_order_stock_reservations_order_id ON order_stock_reservations(order_id);
CREATE INDEX idx_order_stock_reservations_variant_id ON order_stock_reservations(variant_id);
CREATE INDEX idx_order_stock_reservations_released_at ON order_stock_reservations(released_at);
