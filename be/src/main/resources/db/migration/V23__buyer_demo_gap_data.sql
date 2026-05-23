DO $$
DECLARE
  demo_user UUID := '00000000-0000-4000-8000-000000000199';
  product_ids UUID[] := ARRAY[
    'b1b2c3d4-0001-0001-0001-000000000001'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000002'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000003'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000004'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000005'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000006'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000007'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000008'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000009'::uuid,
    'b1b2c3d4-0001-0001-0001-000000000011'::uuid
  ];
  variant_ids UUID[] := ARRAY[
    'c1b2c3d4-0001-0001-0001-000000000001'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000003'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000004'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000005'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000007'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000008'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000009'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000010'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000011'::uuid,
    'c1b2c3d4-0001-0001-0001-000000000015'::uuid
  ];
  n INT;
  order_id UUID;
  item_id UUID;
  selected_product_id UUID;
  selected_variant_id UUID;
  product_name TEXT;
  product_image TEXT;
  brand_name TEXT;
  variant_name TEXT;
  sku_value TEXT;
  price_value BIGINT;
  order_status_value order_status;
  payment_status_value payment_status;
  payment_method_value payment_method;
BEGIN
  FOR n IN 1..10 LOOP
    order_id := ('cc000000-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid;
    item_id := ('cc000001-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid;
    selected_product_id := product_ids[n];
    selected_variant_id := variant_ids[n];

    SELECT p.name, COALESCE(pi.url, ''), p.brand, COALESCE(v.name, ''), COALESCE(v.sku, ''), COALESCE(v.price, p.price)
    INTO product_name, product_image, brand_name, variant_name, sku_value, price_value
    FROM products p
    LEFT JOIN product_variants v ON v.id = selected_variant_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
    WHERE p.id = selected_product_id;

    order_status_value := CASE n
      WHEN 1 THEN 'PENDING'::order_status
      WHEN 2 THEN 'CONFIRMED'::order_status
      WHEN 3 THEN 'SHIPPING'::order_status
      WHEN 4 THEN 'DELIVERED'::order_status
      WHEN 5 THEN 'CANCELLED'::order_status
      WHEN 6 THEN 'RETURNED'::order_status
      WHEN 7 THEN 'DELIVERED'::order_status
      WHEN 8 THEN 'SHIPPING'::order_status
      WHEN 9 THEN 'CONFIRMED'::order_status
      ELSE 'PENDING'::order_status
    END;
    payment_status_value := CASE n
      WHEN 1 THEN 'UNPAID'::payment_status
      WHEN 2 THEN 'UNPAID'::payment_status
      WHEN 3 THEN 'PAID'::payment_status
      WHEN 4 THEN 'PAID'::payment_status
      WHEN 5 THEN 'FAILED'::payment_status
      WHEN 6 THEN 'REFUNDED'::payment_status
      WHEN 7 THEN 'PARTIALLY_REFUNDED'::payment_status
      WHEN 8 THEN 'OVERDUE'::payment_status
      WHEN 9 THEN 'PAID'::payment_status
      ELSE 'UNPAID'::payment_status
    END;
    payment_method_value := CASE n
      WHEN 1 THEN 'COD'::payment_method
      WHEN 2 THEN 'BANK_TRANSFER'::payment_method
      WHEN 3 THEN 'MOMO'::payment_method
      WHEN 4 THEN 'VNPAY'::payment_method
      WHEN 5 THEN 'MOMO'::payment_method
      WHEN 6 THEN 'BANK_TRANSFER'::payment_method
      WHEN 7 THEN 'COD'::payment_method
      WHEN 8 THEN 'BANK_TRANSFER'::payment_method
      WHEN 9 THEN 'INSTALLMENT'::payment_method
      ELSE 'VNPAY'::payment_method
    END;

    INSERT INTO orders (
      id, order_number, customer_id, customer_name, customer_email, customer_phone,
      subtotal, shipping_fee, discount, total_amount, status, shipping_address,
      payment_method, payment_status, notes, created_at, updated_at
    )
    VALUES (
      order_id, 'QA-BUYER-' || LPAD(n::text, 4, '0'), demo_user, 'Demo Buyer', 'buyer.demo@cellphones.local',
      '0900000199', price_value, CASE WHEN price_value >= 3000000 THEN 0 ELSE 30000 END, 0,
      price_value + CASE WHEN price_value >= 3000000 THEN 0 ELSE 30000 END, order_status_value,
      ('{"recipientName":"Demo Buyer","phone":"0900000199","province":"TP. Ho Chi Minh","district":"Quan ' || n || '","ward":"Phuong ' || n || '","addressLine":"' || n || ' Demo Street","fullAddress":"' || n || ' Demo Street, TP. Ho Chi Minh"}')::jsonb,
      payment_method_value, payment_status_value, 'Buyer FE demo seed', NOW() - (n || ' days')::interval,
      NOW() - (n || ' days')::interval
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO order_items (
      id, order_id, product_id, variant_id, product_name, product_image, brand,
      variant_name, sku, color, storage, quantity, unit_price, original_price, total_price
    )
    VALUES (
      item_id, order_id, selected_product_id, selected_variant_id, product_name, product_image, brand_name,
      variant_name, sku_value, '', '', 1, price_value, price_value, price_value
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, changed_by_name, note, created_at)
    VALUES (('cc000002-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid, order_id, NULL, order_status_value,
            demo_user, 'Demo Buyer', 'Buyer demo seed', NOW() - (n || ' days')::interval)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO payments (
      id, order_id, order_number, customer_id, amount, paid_amount, remaining_amount, due_date,
      status, method, transaction_ref, paid_at, refund_amount, refund_reason, refund_method, refunded_at
    )
    VALUES (
      ('cc000003-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid, order_id, 'QA-BUYER-' || LPAD(n::text, 4, '0'),
      demo_user, price_value + CASE WHEN price_value >= 3000000 THEN 0 ELSE 30000 END,
      CASE WHEN payment_status_value IN ('PAID','REFUNDED','PARTIALLY_REFUNDED') THEN price_value + CASE WHEN price_value >= 3000000 THEN 0 ELSE 30000 END ELSE 0 END,
      CASE WHEN payment_status_value IN ('PAID','REFUNDED','PARTIALLY_REFUNDED') THEN 0 ELSE price_value + CASE WHEN price_value >= 3000000 THEN 0 ELSE 30000 END END,
      CURRENT_DATE + 3 - n, payment_status_value, payment_method_value::text,
      CASE WHEN payment_status_value IN ('PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED') THEN 'DEMO-BUYER-TXN-' || LPAD(n::text, 4, '0') ELSE NULL END,
      CASE WHEN payment_status_value IN ('PAID','REFUNDED','PARTIALLY_REFUNDED') THEN NOW() - (n || ' days')::interval ELSE NULL END,
      CASE WHEN payment_status_value = 'REFUNDED' THEN price_value WHEN payment_status_value = 'PARTIALLY_REFUNDED' THEN price_value / 2 ELSE NULL END,
      CASE WHEN payment_status_value IN ('REFUNDED','PARTIALLY_REFUNDED') THEN 'Buyer demo refund' ELSE NULL END,
      CASE WHEN payment_status_value IN ('REFUNDED','PARTIALLY_REFUNDED') THEN 'BANK_TRANSFER' ELSE NULL END,
      CASE WHEN payment_status_value IN ('REFUNDED','PARTIALLY_REFUNDED') THEN NOW() - (n || ' days')::interval ELSE NULL END
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO invoices (
      id, invoice_number, order_id, order_number, customer_id, customer_name, total_amount, tax_amount,
      status, issue_date, due_date, paid_at, created_at
    )
    VALUES (
      ('cc000004-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid, 'INV-BUYER-' || LPAD(n::text, 4, '0'),
      order_id, 'QA-BUYER-' || LPAD(n::text, 4, '0'), demo_user, 'Demo Buyer',
      price_value + CASE WHEN price_value >= 3000000 THEN 0 ELSE 30000 END, 0,
      CASE WHEN n IN (3,4,9) THEN 'PAID'::invoice_status WHEN n = 8 THEN 'OVERDUE'::invoice_status WHEN n IN (5,6) THEN 'CANCELLED'::invoice_status ELSE 'PENDING'::invoice_status END,
      CURRENT_DATE - n, CURRENT_DATE + 3 - n,
      CASE WHEN n IN (3,4,9) THEN NOW() - (n || ' days')::interval ELSE NULL END,
      NOW() - (n || ' days')::interval
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO shipments (id, order_id, order_number, tracking_number, carrier_name, status, estimated_delivery, actual_delivery, created_at, updated_at)
    VALUES (
      ('cc000005-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid, order_id, 'QA-BUYER-' || LPAD(n::text, 4, '0'),
      'DEMO-BUYER-GHTK-' || LPAD(n::text, 4, '0'), CASE WHEN n % 2 = 0 THEN 'Giao Hang Nhanh' ELSE 'Giao Hang Tiet Kiem' END,
      CASE WHEN n IN (1,2,10) THEN 'AWAITING_PICKUP'::shipment_status WHEN n IN (3,8,9) THEN 'IN_TRANSIT'::shipment_status WHEN n IN (4,7) THEN 'DELIVERED'::shipment_status ELSE 'FAILED'::shipment_status END,
      CURRENT_DATE + n, CASE WHEN n IN (4,7) THEN NOW() - (n || ' days')::interval ELSE NULL END,
      NOW() - (n || ' days')::interval, NOW() - (n || ' days')::interval
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

INSERT INTO return_requests (
  id, return_number, order_id, customer_id, customer_name, customer_phone, reason, status, refund_amount, dispute_resolution, created_at, updated_at
)
SELECT ('cc000006-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       'RTN-BUYER-' || LPAD(n::text, 4, '0'),
       ('cc000000-0199-4000-8000-' || LPAD(((n % 10) + 1)::text, 12, '0'))::uuid,
       '00000000-0000-4000-8000-000000000199'::uuid,
       'Demo Buyer',
       '0900000199',
       'Buyer demo return reason ' || n,
       CASE WHEN n IN (1,7) THEN 'PENDING'::return_request_status WHEN n IN (2,8) THEN 'APPROVED'::return_request_status WHEN n IN (3,9) THEN 'PROCESSING'::return_request_status WHEN n = 4 THEN 'REFUNDED'::return_request_status WHEN n = 5 THEN 'CLOSED'::return_request_status ELSE 'REJECTED'::return_request_status END,
       300000 + n * 10000,
       CASE WHEN n IN (5,6,10) THEN 'Buyer demo resolution' ELSE NULL END,
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM generate_series(1, 10) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO warranty_items (
  id, order_id, order_item_id, product_id, customer_id, customer_name, customer_phone,
  product_name, product_image, brand, serial_number, warranty_months, warranty_start, warranty_expiry, status, created_at, updated_at
)
SELECT ('cc000007-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       o.id, oi.id, oi.product_id, o.customer_id, o.customer_name, o.customer_phone,
       oi.product_name, oi.product_image, oi.brand, 'DEMO-WR-BUYER-' || LPAD(n::text, 4, '0'),
       COALESCE(p.warranty, 12),
       CURRENT_DATE - (n * 10),
       CASE WHEN n IN (3,6,9) THEN CURRENT_DATE - n ELSE (CURRENT_DATE - (n * 10) + (COALESCE(p.warranty, 12) || ' months')::interval)::date END,
       CASE WHEN n IN (3,6,9) THEN 'EXPIRED'::warranty_item_status WHEN n IN (5,10) THEN 'VOIDED'::warranty_item_status ELSE 'ACTIVE'::warranty_item_status END,
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM generate_series(1, 10) AS n
JOIN orders o ON o.id = ('cc000000-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO warranty_claims (
  id, claim_number, order_id, product_id, customer_id, customer_name, customer_phone, issue_description, status, resolution_note, created_at, updated_at
)
SELECT ('cc000008-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       'WRN-BUYER-' || LPAD(n::text, 4, '0'),
       ('cc000000-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       wi.product_id,
       '00000000-0000-4000-8000-000000000199'::uuid,
       'Demo Buyer',
       '0900000199',
       'Buyer demo warranty issue ' || n,
       CASE WHEN n IN (1,5,9) THEN 'NEW'::warranty_claim_status WHEN n IN (2,6,10) THEN 'PROCESSING'::warranty_claim_status WHEN n IN (3,7) THEN 'RESOLVED'::warranty_claim_status ELSE 'REJECTED'::warranty_claim_status END,
       CASE WHEN n IN (3,4,7,8) THEN 'Buyer demo warranty resolution' ELSE NULL END,
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM (
  SELECT wi.*, ROW_NUMBER() OVER (ORDER BY wi.created_at DESC, wi.id) AS n
  FROM warranty_items wi
  WHERE wi.customer_id = '00000000-0000-4000-8000-000000000199'
  LIMIT 10
) wi
ON CONFLICT (id) DO NOTHING;

INSERT INTO trade_in_requests (
  id, request_number, customer_id, customer_name, customer_phone, device_name, brand, model, condition,
  estimated_value, final_valuation, target_product_id, status, images, admin_note, created_at, updated_at
)
SELECT ('cc000009-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       'TIN-BUYER-' || LPAD(n::text, 4, '0'),
       '00000000-0000-4000-8000-000000000199'::uuid,
       'Demo Buyer',
       '0900000199',
       CASE WHEN n % 2 = 0 THEN 'iPhone 13 Pro 128GB' ELSE 'Samsung Galaxy S22 Ultra' END,
       CASE WHEN n % 2 = 0 THEN 'Apple' ELSE 'Samsung' END,
       CASE WHEN n % 2 = 0 THEN 'iPhone 13 Pro' ELSE 'Galaxy S22 Ultra' END,
       CASE WHEN n IN (1,5,9) THEN 'GOOD'::trade_in_condition WHEN n IN (2,6,10) THEN 'FAIR'::trade_in_condition WHEN n IN (3,7) THEN 'AVERAGE'::trade_in_condition ELSE 'POOR'::trade_in_condition END,
       2500000 + n * 300000,
       CASE WHEN n IN (2,3,4,5,8,9) THEN 2800000 + n * 300000 ELSE NULL END,
       'b1b2c3d4-0001-0001-0001-000000000001',
       CASE WHEN n IN (1,6) THEN 'AWAITING_VALUATION'::trade_in_status WHEN n IN (2,7) THEN 'VALUED'::trade_in_status WHEN n IN (3,8) THEN 'ACCEPTED'::trade_in_status WHEN n IN (4,9) THEN 'COMPLETED'::trade_in_status ELSE 'REJECTED'::trade_in_status END,
       ARRAY['https://storage.cellphones.vn/trade-in/buyer_' || n || '_front.jpg'],
       'Buyer demo trade-in seed',
       NOW() - (n || ' days')::interval,
       NOW() - (n || ' days')::interval
FROM generate_series(1, 10) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_notifications (
  id, user_id, type, title, message, is_read, read_at, priority, category, entity_type, entity_id,
  action_url, action_label, is_actionable, created_at
)
SELECT ('cc000010-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       '00000000-0000-4000-8000-000000000199'::uuid,
       CASE n WHEN 1 THEN 'ORDER'::app_notification_type WHEN 2 THEN 'PAYMENT'::app_notification_type WHEN 3 THEN 'PROMOTION'::app_notification_type WHEN 4 THEN 'LOYALTY'::app_notification_type WHEN 5 THEN 'SYSTEM'::app_notification_type WHEN 6 THEN 'REVIEW'::app_notification_type WHEN 7 THEN 'ORDER'::app_notification_type WHEN 8 THEN 'PAYMENT'::app_notification_type WHEN 9 THEN 'LOYALTY'::app_notification_type ELSE 'SYSTEM'::app_notification_type END,
       'Buyer demo notification ' || n,
       'Noi dung thong bao demo buyer ' || n,
       n % 2 = 0,
       CASE WHEN n % 2 = 0 THEN NOW() - (n || ' hours')::interval ELSE NULL END,
       CASE WHEN n IN (2,7) THEN 'HIGH'::app_notification_priority ELSE 'MEDIUM'::app_notification_priority END,
       CASE n WHEN 1 THEN 'order' WHEN 2 THEN 'payment' WHEN 3 THEN 'promotion' WHEN 4 THEN 'loyalty' WHEN 5 THEN 'system' WHEN 6 THEN 'review' WHEN 7 THEN 'order' WHEN 8 THEN 'payment' WHEN 9 THEN 'loyalty' ELSE 'system' END,
       'ORDER',
       ('cc000000-0199-4000-8000-' || LPAD(((n % 10) + 1)::text, 12, '0'))::uuid,
       CASE WHEN n IN (4,9) THEN '/loyalty' ELSE '/orders/' || ('cc000000-0199-4000-8000-' || LPAD(((n % 10) + 1)::text, 12, '0')) END,
       CASE WHEN n IN (4,9) THEN 'Xem diem' ELSE 'Xem don hang' END,
       TRUE,
       NOW() - (n || ' hours')::interval
FROM generate_series(1, 10) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO loyalty_programs (
  id, customer_id, customer_name, customer_email, tier, points, total_earned_points, total_spend, points_expiry, joined_at, updated_at
)
VALUES (
  'cc000011-0199-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000199',
  'Demo Buyer',
  'buyer.demo@cellphones.local',
  'SILVER',
  3200,
  5200,
  78000000,
  CURRENT_DATE + 365,
  NOW() - INTERVAL '120 days',
  NOW()
)
ON CONFLICT (customer_id) DO UPDATE
SET customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    points = GREATEST(loyalty_programs.points, EXCLUDED.points),
    total_earned_points = GREATEST(loyalty_programs.total_earned_points, EXCLUDED.total_earned_points),
    total_spend = GREATEST(loyalty_programs.total_spend, EXCLUDED.total_spend),
    updated_at = NOW();

INSERT INTO loyalty_transactions (
  id, loyalty_program_id, customer_id, type, points, balance_after, description, order_id, reward_id, created_at
)
SELECT ('cc000012-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid,
       lp.id,
       lp.customer_id,
       CASE WHEN n IN (1,2,7,8) THEN 'EARN'::loyalty_transaction_type WHEN n IN (3,9) THEN 'REDEEM'::loyalty_transaction_type WHEN n IN (4,10) THEN 'EXPIRE'::loyalty_transaction_type ELSE 'BONUS'::loyalty_transaction_type END,
       CASE WHEN n IN (1,2,7,8) THEN 150 + n * 10 WHEN n IN (3,9) THEN -(200 + n * 10) WHEN n IN (4,10) THEN -(80 + n * 5) ELSE 300 END,
       CASE n WHEN 1 THEN 1200 WHEN 2 THEN 1380 WHEN 3 THEN 1150 WHEN 4 THEN 1050 WHEN 5 THEN 1350 WHEN 6 THEN 1650 WHEN 7 THEN 1870 WHEN 8 THEN 2100 WHEN 9 THEN 1810 ELSE 1720 END,
       CASE WHEN n IN (1,2,7,8) THEN 'Tich diem demo buyer ' || n WHEN n IN (3,9) THEN 'Doi thuong demo buyer ' || n WHEN n IN (4,10) THEN 'Dao diem demo buyer ' || n ELSE 'Thuong diem demo buyer ' || n END,
       CASE WHEN n IN (1,2,7,8) THEN ('cc000000-0199-4000-8000-' || LPAD(n::text, 12, '0'))::uuid ELSE NULL END,
       NULL,
       NOW() - (n || ' days')::interval
FROM generate_series(1, 10) AS n
JOIN loyalty_programs lp ON lp.customer_id = '00000000-0000-4000-8000-000000000199'
ON CONFLICT (id) DO NOTHING;
