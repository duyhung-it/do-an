CREATE TYPE invoice_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

CREATE TABLE invoice_daily_sequences (
  invoice_date DATE PRIMARY KEY,
  next_value INT NOT NULL
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  order_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  total_amount BIGINT NOT NULL,
  tax_amount BIGINT NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'PENDING',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
