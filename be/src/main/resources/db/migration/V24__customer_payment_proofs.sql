CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  proof_url TEXT NOT NULL,
  note TEXT,
  amount BIGINT NOT NULL DEFAULT 0,
  method VARCHAR(100) NOT NULL DEFAULT 'BANK_TRANSFER',
  transaction_ref VARCHAR(200),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_proofs_payment_id ON payment_proofs(payment_id, created_at DESC);
CREATE INDEX idx_payment_proofs_customer_id ON payment_proofs(customer_id, created_at DESC);
CREATE UNIQUE INDEX idx_payment_proofs_transaction_ref_unique
  ON payment_proofs(transaction_ref)
  WHERE transaction_ref IS NOT NULL;
