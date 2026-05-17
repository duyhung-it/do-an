CREATE UNIQUE INDEX idx_payments_transaction_ref_unique
  ON payments(transaction_ref)
  WHERE transaction_ref IS NOT NULL;
