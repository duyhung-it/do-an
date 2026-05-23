CREATE TABLE payment_gateway_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('MOMO', 'VNPAY')),
  request_id VARCHAR(100) NOT NULL UNIQUE,
  transaction_ref VARCHAR(200) UNIQUE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
  payment_url TEXT NOT NULL,
  return_url TEXT,
  callback_url TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_gateway_sessions_payment_id ON payment_gateway_sessions(payment_id);
CREATE INDEX idx_payment_gateway_sessions_request_id ON payment_gateway_sessions(request_id);
CREATE INDEX idx_payment_gateway_sessions_transaction_ref ON payment_gateway_sessions(transaction_ref);
CREATE INDEX idx_payment_gateway_sessions_status ON payment_gateway_sessions(status);
