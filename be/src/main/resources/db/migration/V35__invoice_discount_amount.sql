ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS discount_amount BIGINT NOT NULL DEFAULT 0;

UPDATE invoices i
SET discount_amount = COALESCE(o.discount_amount, o.discount, 0)
FROM orders o
WHERE i.order_id = o.id;
