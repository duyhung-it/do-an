CREATE TYPE warranty_item_status AS ENUM ('ACTIVE', 'EXPIRED', 'VOIDED');

CREATE TABLE warranty_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  product_name VARCHAR(300) NOT NULL,
  product_image TEXT,
  brand VARCHAR(100),
  serial_number VARCHAR(100),
  warranty_months INT NOT NULL DEFAULT 12 CHECK (warranty_months > 0),
  warranty_start DATE NOT NULL DEFAULT CURRENT_DATE,
  warranty_expiry DATE NOT NULL,
  status warranty_item_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warranty_items_customer_id ON warranty_items(customer_id, created_at DESC);
CREATE INDEX idx_warranty_items_order_id ON warranty_items(order_id);
CREATE INDEX idx_return_requests_customer_id ON return_requests(customer_id, created_at DESC);
CREATE INDEX idx_warranty_claims_customer_id ON warranty_claims(customer_id, created_at DESC);

INSERT INTO warranty_items (
  id, order_id, order_item_id, product_id, customer_id, customer_name, customer_phone,
  product_name, product_image, brand, serial_number, warranty_months, warranty_start, warranty_expiry, status
)
SELECT ('aa000000-0010-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       o.id,
       oi.id,
       oi.product_id,
       o.customer_id,
       o.customer_name,
       o.customer_phone,
       oi.product_name,
       oi.product_image,
       oi.brand,
       'QA-IMEI-' || LPAD(n::text, 6, '0'),
       COALESCE(p.warranty, 12),
       COALESCE(s.actual_delivery::date, CURRENT_DATE - n),
       (COALESCE(s.actual_delivery::date, CURRENT_DATE - n) + (COALESCE(p.warranty, 12) || ' months')::interval)::date,
       'ACTIVE'::warranty_item_status
FROM generate_series(1, 10) AS n
JOIN orders o ON o.id = ('bb000000-0001-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
LEFT JOIN shipments s ON s.order_id = o.id
ON CONFLICT (id) DO NOTHING;

UPDATE return_requests r
SET order_id = o.id,
    customer_id = o.customer_id,
    customer_name = o.customer_name,
    customer_phone = o.customer_phone,
    updated_at = NOW()
FROM orders o
WHERE r.id IN (
  'aa000000-0001-4000-8000-000000000003',
  'aa000000-0001-4000-8000-000000000008'
)
  AND o.id = CASE r.id
    WHEN 'aa000000-0001-4000-8000-000000000003' THEN 'bb000000-0001-4000-8000-000000000003'::uuid
    ELSE 'bb000000-0001-4000-8000-000000000008'::uuid
  END;

UPDATE warranty_claims c
SET order_id = w.order_id,
    product_id = w.product_id,
    customer_id = w.customer_id,
    customer_name = w.customer_name,
    customer_phone = w.customer_phone,
    updated_at = NOW()
FROM warranty_items w
WHERE c.id IN (
  'aa000000-0002-4000-8000-000000000003',
  'aa000000-0002-4000-8000-000000000008'
)
  AND w.id = CASE c.id
    WHEN 'aa000000-0002-4000-8000-000000000003' THEN 'aa000000-0010-4000-8000-000000000003'::uuid
    ELSE 'aa000000-0010-4000-8000-000000000008'::uuid
  END;
