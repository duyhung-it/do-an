CREATE TYPE trade_in_condition AS ENUM ('GOOD', 'FAIR', 'AVERAGE', 'POOR');
CREATE TYPE trade_in_status AS ENUM ('AWAITING_VALUATION', 'VALUED', 'ACCEPTED', 'REJECTED', 'COMPLETED');

CREATE TABLE trade_in_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  device_name VARCHAR(300) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  condition trade_in_condition NOT NULL,
  estimated_value BIGINT NOT NULL DEFAULT 0,
  final_valuation BIGINT,
  target_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  status trade_in_status NOT NULL DEFAULT 'AWAITING_VALUATION',
  images TEXT[] NOT NULL DEFAULT '{}',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trade_in_requests_status ON trade_in_requests(status);
CREATE INDEX idx_trade_in_requests_customer_id ON trade_in_requests(customer_id);

INSERT INTO orders (
  id, order_number, customer_id, customer_name, customer_email, customer_phone,
  subtotal, shipping_fee, discount, total_amount, status, shipping_address,
  payment_method, payment_status, notes
)
VALUES
  ('bb000000-0001-4000-8000-000000000001', 'QA-ADMIN-0001', 'bc000000-0001-4000-8000-000000000001', 'QA Customer 01', 'qa01@cellphones.local', '0900000001', 12000000, 0, 0, 12000000, 'CONFIRMED', '{"recipientName":"QA Customer 01","phone":"0900000001","province":"TP.HCM","district":"Quan 1","ward":"Ben Nghe","addressLine":"1 QA Street","fullAddress":"1 QA Street, Ben Nghe, Quan 1, TP.HCM"}', 'BANK_TRANSFER', 'UNPAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000002', 'QA-ADMIN-0002', 'bc000000-0001-4000-8000-000000000002', 'QA Customer 02', 'qa02@cellphones.local', '0900000002', 15000000, 0, 500000, 14500000, 'SHIPPING', '{"recipientName":"QA Customer 02","phone":"0900000002","province":"Ha Noi","district":"Cau Giay","ward":"Dich Vong","addressLine":"2 QA Street","fullAddress":"2 QA Street, Dich Vong, Cau Giay, Ha Noi"}', 'COD', 'UNPAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000003', 'QA-ADMIN-0003', 'bc000000-0001-4000-8000-000000000003', 'QA Customer 03', 'qa03@cellphones.local', '0900000003', 8000000, 30000, 0, 8030000, 'DELIVERED', '{"recipientName":"QA Customer 03","phone":"0900000003","province":"Da Nang","district":"Hai Chau","ward":"Thach Thang","addressLine":"3 QA Street","fullAddress":"3 QA Street, Thach Thang, Hai Chau, Da Nang"}', 'COD', 'PAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000004', 'QA-ADMIN-0004', 'bc000000-0001-4000-8000-000000000004', 'QA Customer 04', 'qa04@cellphones.local', '0900000004', 22000000, 0, 1000000, 21000000, 'SHIPPING', '{"recipientName":"QA Customer 04","phone":"0900000004","province":"TP.HCM","district":"Quan 3","ward":"Vo Thi Sau","addressLine":"4 QA Street","fullAddress":"4 QA Street, Vo Thi Sau, Quan 3, TP.HCM"}', 'BANK_TRANSFER', 'PAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000005', 'QA-ADMIN-0005', 'bc000000-0001-4000-8000-000000000005', 'QA Customer 05', 'qa05@cellphones.local', '0900000005', 6000000, 30000, 0, 6030000, 'CONFIRMED', '{"recipientName":"QA Customer 05","phone":"0900000005","province":"Can Tho","district":"Ninh Kieu","ward":"An Khanh","addressLine":"5 QA Street","fullAddress":"5 QA Street, An Khanh, Ninh Kieu, Can Tho"}', 'MOMO', 'FAILED', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000006', 'QA-ADMIN-0006', 'bc000000-0001-4000-8000-000000000006', 'QA Customer 06', 'qa06@cellphones.local', '0900000006', 18000000, 0, 0, 18000000, 'CANCELLED', '{"recipientName":"QA Customer 06","phone":"0900000006","province":"Hai Phong","district":"Le Chan","ward":"Kenh Duong","addressLine":"6 QA Street","fullAddress":"6 QA Street, Kenh Duong, Le Chan, Hai Phong"}', 'BANK_TRANSFER', 'REFUNDED', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000007', 'QA-ADMIN-0007', 'bc000000-0001-4000-8000-000000000007', 'QA Customer 07', 'qa07@cellphones.local', '0900000007', 4500000, 30000, 0, 4530000, 'PENDING', '{"recipientName":"QA Customer 07","phone":"0900000007","province":"Hue","district":"Phu Nhuan","ward":"Phu Hoi","addressLine":"7 QA Street","fullAddress":"7 QA Street, Phu Hoi, Hue"}', 'VNPAY', 'UNPAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000008', 'QA-ADMIN-0008', 'bc000000-0001-4000-8000-000000000008', 'QA Customer 08', 'qa08@cellphones.local', '0900000008', 30000000, 0, 1500000, 28500000, 'DELIVERED', '{"recipientName":"QA Customer 08","phone":"0900000008","province":"TP.HCM","district":"Binh Thanh","ward":"25","addressLine":"8 QA Street","fullAddress":"8 QA Street, Ward 25, Binh Thanh, TP.HCM"}', 'COD', 'PAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000009', 'QA-ADMIN-0009', 'bc000000-0001-4000-8000-000000000009', 'QA Customer 09', 'qa09@cellphones.local', '0900000009', 10000000, 0, 0, 10000000, 'SHIPPING', '{"recipientName":"QA Customer 09","phone":"0900000009","province":"Dong Nai","district":"Bien Hoa","ward":"Thong Nhat","addressLine":"9 QA Street","fullAddress":"9 QA Street, Thong Nhat, Bien Hoa, Dong Nai"}', 'INSTALLMENT', 'PAID', 'QA admin seed'),
  ('bb000000-0001-4000-8000-000000000010', 'QA-ADMIN-0010', 'bc000000-0001-4000-8000-000000000010', 'QA Customer 10', 'qa10@cellphones.local', '0900000010', 7000000, 30000, 0, 7030000, 'CONFIRMED', '{"recipientName":"QA Customer 10","phone":"0900000010","province":"Binh Duong","district":"Thu Dau Mot","ward":"Phu Cuong","addressLine":"10 QA Street","fullAddress":"10 QA Street, Phu Cuong, Thu Dau Mot, Binh Duong"}', 'BANK_TRANSFER', 'OVERDUE', 'QA admin seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, product_image, brand, variant_name, sku, color, storage, quantity, unit_price, original_price, total_price)
SELECT gen_random_uuid(), o.id, 'b1b2c3d4-0001-0001-0001-000000000001', 'c1b2c3d4-0001-0001-0001-000000000001',
       'iPhone 15 Pro Max 256GB', 'https://cdn.cellphones.vn/products/iphone15promax-1.jpg', 'Apple',
       '256GB - Titan Tu Nhien', 'IPH15PM-256-TN', 'Titan Tu Nhien', '256GB', 1, o.total_amount, o.total_amount, o.total_amount
FROM orders o
WHERE o.order_number LIKE 'QA-ADMIN-%'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

INSERT INTO payments (id, order_id, order_number, customer_id, amount, paid_amount, remaining_amount, due_date, status, method, transaction_ref, paid_at, refund_amount, refund_reason, refund_method, refunded_at)
VALUES
  ('bb000000-0002-4000-8000-000000000001', 'bb000000-0001-4000-8000-000000000001', 'QA-ADMIN-0001', 'bc000000-0001-4000-8000-000000000001', 12000000, 0, 12000000, CURRENT_DATE + 2, 'UNPAID', 'BANK_TRANSFER', NULL, NULL, NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000002', 'bb000000-0001-4000-8000-000000000002', 'QA-ADMIN-0002', 'bc000000-0001-4000-8000-000000000002', 14500000, 0, 14500000, CURRENT_DATE + 2, 'UNPAID', 'COD', NULL, NULL, NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000003', 'bb000000-0001-4000-8000-000000000003', 'QA-ADMIN-0003', 'bc000000-0001-4000-8000-000000000003', 8030000, 8030000, 0, CURRENT_DATE - 5, 'PAID', 'COD', 'QA-TXN-0003', NOW() - INTERVAL '5 days', NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000004', 'bb000000-0001-4000-8000-000000000004', 'QA-ADMIN-0004', 'bc000000-0001-4000-8000-000000000004', 21000000, 21000000, 0, CURRENT_DATE - 2, 'PAID', 'BANK_TRANSFER', 'QA-TXN-0004', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000005', 'bb000000-0001-4000-8000-000000000005', 'QA-ADMIN-0005', 'bc000000-0001-4000-8000-000000000005', 6030000, 0, 6030000, CURRENT_DATE + 1, 'FAILED', 'MOMO', 'QA-TXN-0005', NULL, NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000006', 'bb000000-0001-4000-8000-000000000006', 'QA-ADMIN-0006', 'bc000000-0001-4000-8000-000000000006', 18000000, 18000000, 0, CURRENT_DATE - 10, 'REFUNDED', 'BANK_TRANSFER', 'QA-TXN-0006', NOW() - INTERVAL '10 days', 18000000, 'QA refund', 'BANK_TRANSFER', NOW() - INTERVAL '8 days'),
  ('bb000000-0002-4000-8000-000000000007', 'bb000000-0001-4000-8000-000000000007', 'QA-ADMIN-0007', 'bc000000-0001-4000-8000-000000000007', 4530000, 0, 4530000, CURRENT_DATE + 3, 'UNPAID', 'VNPAY', NULL, NULL, NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000008', 'bb000000-0001-4000-8000-000000000008', 'QA-ADMIN-0008', 'bc000000-0001-4000-8000-000000000008', 28500000, 28500000, 0, CURRENT_DATE - 4, 'PAID', 'COD', 'QA-TXN-0008', NOW() - INTERVAL '4 days', NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000009', 'bb000000-0001-4000-8000-000000000009', 'QA-ADMIN-0009', 'bc000000-0001-4000-8000-000000000009', 10000000, 10000000, 0, CURRENT_DATE - 1, 'PAID', 'INSTALLMENT', 'QA-TXN-0009', NOW() - INTERVAL '1 day', NULL, NULL, NULL, NULL),
  ('bb000000-0002-4000-8000-000000000010', 'bb000000-0001-4000-8000-000000000010', 'QA-ADMIN-0010', 'bc000000-0001-4000-8000-000000000010', 7030000, 0, 7030000, CURRENT_DATE - 1, 'OVERDUE', 'BANK_TRANSFER', NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, order_id, order_number, customer_id, customer_name, total_amount, tax_amount, status, issue_date, due_date, paid_at)
SELECT ('bb000000-0003-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'QA-INV-000' || n,
       ('bb000000-0001-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'QA-ADMIN-000' || n,
       ('bc000000-0001-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'QA Customer 0' || n,
       CASE n WHEN 1 THEN 12000000 WHEN 2 THEN 14500000 WHEN 3 THEN 8030000 WHEN 4 THEN 21000000 WHEN 5 THEN 6030000 WHEN 6 THEN 18000000 WHEN 7 THEN 4530000 WHEN 8 THEN 28500000 WHEN 9 THEN 10000000 ELSE 7030000 END,
       0,
       CASE WHEN n IN (3,4,8,9) THEN 'PAID'::invoice_status WHEN n = 10 THEN 'OVERDUE'::invoice_status ELSE 'PENDING'::invoice_status END,
       CURRENT_DATE - n,
       CURRENT_DATE + 3 - n,
       CASE WHEN n IN (3,4,8,9) THEN NOW() - (n || ' days')::interval ELSE NULL END
FROM generate_series(1, 9) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, order_id, order_number, customer_id, customer_name, total_amount, tax_amount, status, issue_date, due_date, paid_at)
VALUES ('bb000000-0003-4000-8000-000000000010', 'QA-INV-0010', 'bb000000-0001-4000-8000-000000000010', 'QA-ADMIN-0010', 'bc000000-0001-4000-8000-000000000010', 'QA Customer 10', 7030000, 0, 'OVERDUE', CURRENT_DATE - 10, CURRENT_DATE - 7, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, order_id, order_number, tracking_number, carrier_name, status, estimated_delivery, actual_delivery)
SELECT ('bb000000-0004-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       ('bb000000-0001-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'QA-ADMIN-000' || n,
       'QA-GHTK-000' || n,
       CASE WHEN n % 2 = 0 THEN 'Giao Hang Nhanh' ELSE 'Giao Hang Tiet Kiem' END,
       CASE WHEN n IN (1,5,7,10) THEN 'AWAITING_PICKUP'::shipment_status WHEN n IN (2,4,9) THEN 'IN_TRANSIT'::shipment_status WHEN n IN (3,8) THEN 'DELIVERED'::shipment_status ELSE 'FAILED'::shipment_status END,
       CURRENT_DATE + 3 + n,
       CASE WHEN n IN (3,8) THEN NOW() - (n || ' days')::interval ELSE NULL END
FROM generate_series(1, 9) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, order_id, order_number, tracking_number, carrier_name, status, estimated_delivery, actual_delivery)
VALUES ('bb000000-0004-4000-8000-000000000010', 'bb000000-0001-4000-8000-000000000010', 'QA-ADMIN-0010', 'QA-GHTK-0010', 'Giao Hang Tiet Kiem', 'AWAITING_PICKUP', CURRENT_DATE + 13, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO return_requests (id, return_number, customer_name, customer_phone, reason, status, refund_amount)
SELECT ('aa000000-0001-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'RTN-202605-00' || LPAD(n::text, 2, '0'),
       'Return Customer ' || LPAD(n::text, 2, '0'),
       '09100000' || LPAD(n::text, 2, '0'),
       'QA return reason ' || n,
       CASE WHEN n IN (1,7,8) THEN 'PENDING'::return_request_status WHEN n IN (2,9) THEN 'APPROVED'::return_request_status WHEN n = 3 THEN 'PROCESSING'::return_request_status WHEN n = 4 THEN 'REFUNDED'::return_request_status WHEN n = 5 THEN 'CLOSED'::return_request_status ELSE 'REJECTED'::return_request_status END,
       400000 + n * 10000
FROM generate_series(3, 10) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO warranty_claims (id, claim_number, product_id, customer_name, customer_phone, issue_description, status)
SELECT ('aa000000-0002-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'WRN-202605-00' || LPAD(n::text, 2, '0'),
       'b1b2c3d4-0001-0001-0001-000000000001',
       'Warranty Customer ' || LPAD(n::text, 2, '0'),
       '09200000' || LPAD(n::text, 2, '0'),
       'QA warranty issue ' || n,
       CASE WHEN n IN (1,7,8,9) THEN 'NEW'::warranty_claim_status WHEN n IN (2,3,10) THEN 'PROCESSING'::warranty_claim_status WHEN n IN (4,5) THEN 'RESOLVED'::warranty_claim_status ELSE 'REJECTED'::warranty_claim_status END
FROM generate_series(3, 10) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_reviews (id, product_id, customer_name, rating, title, content, status)
SELECT ('aa000000-0003-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'b1b2c3d4-0001-0001-0001-000000000001',
       'Review Customer ' || LPAD(n::text, 2, '0'),
       LEAST(5, GREATEST(1, (n % 5) + 1)),
       'QA review ' || n,
       'QA review content ' || n,
       CASE WHEN n IN (1,7,8) THEN 'PENDING'::review_status WHEN n IN (2,3,9,10) THEN 'APPROVED'::review_status ELSE 'HIDDEN'::review_status END
FROM generate_series(3, 10) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO trade_in_requests (id, request_number, customer_id, customer_name, customer_phone, device_name, brand, model, condition, estimated_value, final_valuation, target_product_id, status, images, admin_note)
SELECT ('aa000000-0009-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'TIN-202605-00' || LPAD(n::text, 2, '0'),
       ('bc000000-0009-4000-8000-0000000000' || LPAD(n::text, 2, '0'))::uuid,
       'Trade Customer ' || LPAD(n::text, 2, '0'),
       '09300000' || LPAD(n::text, 2, '0'),
       CASE WHEN n % 2 = 0 THEN 'iPhone 13 Pro 128GB' ELSE 'Samsung Galaxy S22 Ultra' END,
       CASE WHEN n % 2 = 0 THEN 'Apple' ELSE 'Samsung' END,
       CASE WHEN n % 2 = 0 THEN 'iPhone 13 Pro' ELSE 'Galaxy S22 Ultra' END,
       CASE WHEN n IN (1,5,9) THEN 'GOOD'::trade_in_condition WHEN n IN (2,6,10) THEN 'FAIR'::trade_in_condition WHEN n IN (3,7) THEN 'AVERAGE'::trade_in_condition ELSE 'POOR'::trade_in_condition END,
       3000000 + n * 250000,
       CASE WHEN n IN (2,3,4,5,8,9) THEN 3200000 + n * 250000 ELSE NULL END,
       'b1b2c3d4-0001-0001-0001-000000000001',
       CASE WHEN n IN (1,6,10) THEN 'AWAITING_VALUATION'::trade_in_status WHEN n IN (2,7) THEN 'VALUED'::trade_in_status WHEN n IN (3,8) THEN 'ACCEPTED'::trade_in_status WHEN n = 4 THEN 'COMPLETED'::trade_in_status ELSE 'REJECTED'::trade_in_status END,
       ARRAY['https://storage.cellphones.vn/trade-in/qa_' || n || '_front.jpg'],
       'QA trade-in seed'
FROM generate_series(1, 10) AS n
ON CONFLICT (id) DO NOTHING;
