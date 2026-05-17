ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'OVERDUE';

ALTER TABLE payments
    ADD COLUMN refund_amount BIGINT,
    ADD COLUMN refund_reason TEXT,
    ADD COLUMN refund_method VARCHAR(100),
    ADD COLUMN refunded_at TIMESTAMPTZ;
