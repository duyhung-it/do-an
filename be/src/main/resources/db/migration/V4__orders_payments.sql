CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE payment_method AS ENUM ('COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'INSTALLMENT');

CREATE TABLE order_daily_sequences (
  order_date DATE PRIMARY KEY,
  next_value INT NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  subtotal BIGINT NOT NULL,
  shipping_fee BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  shipping_address JSONB NOT NULL,
  shipping_address_id UUID,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'UNPAID',
  promotion_code VARCHAR(100),
  promotion_id UUID REFERENCES promotions(id),
  discount_amount BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  internal_notes TEXT,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name VARCHAR(500) NOT NULL,
  product_image TEXT NOT NULL,
  brand VARCHAR(100) NOT NULL,
  variant_name VARCHAR(300),
  sku VARCHAR(100),
  color VARCHAR(100),
  storage VARCHAR(50),
  quantity INT NOT NULL CHECK (quantity >= 1),
  unit_price BIGINT NOT NULL,
  original_price BIGINT,
  discount BIGINT NOT NULL DEFAULT 0,
  total_price BIGINT NOT NULL,
  note TEXT
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by UUID NOT NULL,
  changed_by_name VARCHAR(200) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL,
  amount BIGINT NOT NULL,
  paid_amount BIGINT NOT NULL DEFAULT 0,
  remaining_amount BIGINT NOT NULL,
  due_date DATE NOT NULL,
  status payment_status NOT NULL DEFAULT 'UNPAID',
  method VARCHAR(100) NOT NULL,
  transaction_ref VARCHAR(200),
  payment_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
