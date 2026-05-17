CREATE TYPE shipment_status AS ENUM ('AWAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    order_number VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(200) NOT NULL UNIQUE,
    carrier_name VARCHAR(200) NOT NULL,
    status shipment_status NOT NULL DEFAULT 'AWAITING_PICKUP',
    estimated_delivery DATE NOT NULL,
    actual_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_status ON shipments(status);
