-- V19: QA seed data for admin_activity_logs, branches, staff_members, email_templates, admin_settings
-- Required to unblock: /admin/activity-logs, /admin/stores, /admin/staff, /admin/email-templates, /admin/settings
--
-- Schema reference (from V13):
--   email_templates : id, template_key, subject, body, is_active, updated_at        (NO created_at)
--   branches        : id, name, phone, address, is_active, created_at, updated_at   (HAS created_at)
--   staff_members   : id, full_name, email, role, is_active, created_at, updated_at (HAS created_at)
--   admin_activity_logs : id, actor_id, actor_name, action, entity_type, entity_id, note, created_at

-- ============================================================
-- admin_activity_logs (>= 10 rows)
-- ============================================================
INSERT INTO admin_activity_logs (id, actor_id, actor_name, action, entity_type, entity_id, note, created_at)
VALUES
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'CREATE', 'product', gen_random_uuid(), 'Tao san pham iPhone 16 Pro Max', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'UPDATE', 'product', gen_random_uuid(), 'Cap nhat gia ban Samsung S24', NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'APPROVE', 'review', gen_random_uuid(), 'Duyet review san pham iPhone', NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'UPDATE', 'order', gen_random_uuid(), 'Cap nhat trang thai don hang sang DELIVERED', NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'CREATE', 'promotion', gen_random_uuid(), 'Tao ma khuyen mai SALE2026', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'DELETE', 'review', gen_random_uuid(), 'Xoa review vi pham', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'UPDATE', 'setting', gen_random_uuid(), 'Cap nhat cau hinh he thong', NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'APPROVE', 'return_request', gen_random_uuid(), 'Duyet yeu cau hoan tra #RET-001', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'CREATE', 'category', gen_random_uuid(), 'Tao danh muc Phu kien moi', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'UPDATE', 'inventory', gen_random_uuid(), 'Dieu chinh ton kho iPhone 15: 50 -> 45', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'HIDE', 'review', gen_random_uuid(), 'An review khong hop le', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'UPDATE', 'banner', gen_random_uuid(), 'Cap nhat banner trang chu', NOW() - INTERVAL '4 days' + INTERVAL '1 hour'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'APPROVE', 'warranty_claim', gen_random_uuid(), 'Xu ly bao hanh cho khach #WC-005', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'CREATE', 'staff', gen_random_uuid(), 'Them nhan vien moi Nguyen Van A', NOW() - INTERVAL '5 days' + INTERVAL '1 hour'),
  (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Admin FE', 'UPDATE', 'promotion', gen_random_uuid(), 'Tat khuyen mai BLACKFRIDAY2025', NOW() - INTERVAL '6 days');

-- ============================================================
-- branches (>= 10 rows) — has created_at, updated_at
-- ============================================================
INSERT INTO branches (id, name, phone, address, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'CELLPHONES Nguyen Dinh Chieu', '1800 2097', '200 Nguyen Dinh Chieu, P.6, Q.3, TP.HCM', true, NOW() - INTERVAL '2 years', NOW()),
  (gen_random_uuid(), 'CELLPHONES Hoang Van Thu', '1800 2097', '349 Hoang Van Thu, P.4, Q.Tan Binh, TP.HCM', true, NOW() - INTERVAL '2 years', NOW()),
  (gen_random_uuid(), 'CELLPHONES Quang Trung', '1800 2097', '218 Quang Trung, P.10, Q.Go Vap, TP.HCM', true, NOW() - INTERVAL '18 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Ly Thuong Kiet', '1800 2097', '111 Ly Thuong Kiet, P.7, Q.10, TP.HCM', false, NOW() - INTERVAL '18 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Nguyen Trai', '1800 2097', '52 Nguyen Trai, P.3, Q.5, TP.HCM', true, NOW() - INTERVAL '12 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Cau Giay', '1800 2097', '152 Cau Giay, P. Dich Vong Hau, Q. Cau Giay, HN', true, NOW() - INTERVAL '12 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Kim Ma', '1800 2097', '41 Kim Ma, P. Kim Ma, Q. Ba Dinh, HN', true, NOW() - INTERVAL '10 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Giai Phong', '1800 2097', '321 Giai Phong, P. Phuong Mai, Q. Dong Da, HN', true, NOW() - INTERVAL '8 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Hai Chau', '1800 2097', '36 Hai Phong, P. Hai Chau 1, Q. Hai Chau, Da Nang', true, NOW() - INTERVAL '6 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Ninh Kieu', '1800 2097', '68 Tran Hung Dao, P. An Phu, Q. Ninh Kieu, Can Tho', true, NOW() - INTERVAL '4 months', NOW()),
  (gen_random_uuid(), 'CELLPHONES Le Loi', '1800 2097', '12 Le Loi, P. Ben Nghe, Q.1, TP.HCM', false, NOW() - INTERVAL '2 months', NOW());

-- ============================================================
-- staff_members (>= 10 rows) — has created_at, updated_at
-- ============================================================
INSERT INTO staff_members (id, full_name, email, role, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Nguyen Hoang Long', 'long.nh@cellphones.vn', 'STORE_MANAGER', true, NOW() - INTERVAL '2 years', NOW()),
  (gen_random_uuid(), 'Tran Thi Mai', 'mai.tt@cellphones.vn', 'SALES_ADVISOR', true, NOW() - INTERVAL '18 months', NOW()),
  (gen_random_uuid(), 'Le Van Tuan', 'tuan.lv@cellphones.vn', 'TECHNICIAN', true, NOW() - INTERVAL '16 months', NOW()),
  (gen_random_uuid(), 'Pham Duc Anh', 'anh.pd@cellphones.vn', 'WAREHOUSE_STAFF', true, NOW() - INTERVAL '12 months', NOW()),
  (gen_random_uuid(), 'Hoang Thi Lan', 'lan.ht@cellphones.vn', 'CASHIER', true, NOW() - INTERVAL '10 months', NOW()),
  (gen_random_uuid(), 'Vu Quang Huy', 'huy.vq@cellphones.vn', 'STORE_MANAGER', true, NOW() - INTERVAL '8 months', NOW()),
  (gen_random_uuid(), 'Do Minh Khoa', 'khoa.dm@cellphones.vn', 'SALES_ADVISOR', false, NOW() - INTERVAL '6 months', NOW()),
  (gen_random_uuid(), 'Bui Thanh Hang', 'hang.bt@cellphones.vn', 'SALES_ADVISOR', true, NOW() - INTERVAL '5 months', NOW()),
  (gen_random_uuid(), 'Ngo Van Duc', 'duc.nv@cellphones.vn', 'TECHNICIAN', true, NOW() - INTERVAL '4 months', NOW()),
  (gen_random_uuid(), 'Dinh Thi Thu', 'thu.dt@cellphones.vn', 'CASHIER', true, NOW() - INTERVAL '3 months', NOW()),
  (gen_random_uuid(), 'Tong Quoc Viet', 'viet.tq@cellphones.vn', 'WAREHOUSE_STAFF', true, NOW() - INTERVAL '2 months', NOW()),
  (gen_random_uuid(), 'Ly Minh Thanh', 'thanh.lm@cellphones.vn', 'STORE_MANAGER', true, NOW() - INTERVAL '1 month', NOW());

-- ============================================================
-- email_templates (>= 10 rows)
-- IMPORTANT: table has NO created_at column — only (id, template_key, subject, body, is_active, updated_at)
-- ============================================================
INSERT INTO email_templates (id, template_key, subject, body, is_active)
VALUES
  (gen_random_uuid(), 'order_confirmed',
   'Don hang #{{orderNumber}} da duoc xac nhan',
   'Chao {{buyerName}}, don hang #{{orderNumber}} cua ban da duoc xac nhan thanh cong! Tong tien: {{totalAmount}}. Du kien giao: {{expectedDate}}. Cam on ban da mua sam tai CELLPHONES!',
   true),
  (gen_random_uuid(), 'order_shipped',
   'Don hang #{{orderNumber}} dang tren duong den ban',
   'Chao {{buyerName}}, don hang #{{orderNumber}} dang duoc van chuyen. Ma theo doi: {{trackingCode}}. Don vi VC: {{carrier}}. Du kien nhan: {{expectedDate}}.',
   true),
  (gen_random_uuid(), 'order_delivered',
   'Don hang #{{orderNumber}} da giao thanh cong',
   'Chao {{buyerName}}, don hang #{{orderNumber}} da duoc giao thanh cong vao {{deliveredAt}}. Cam on ban da tin tuong CELLPHONES!',
   true),
  (gen_random_uuid(), 'order_cancelled',
   'Don hang #{{orderNumber}} da bi huy',
   'Chao {{buyerName}}, don hang #{{orderNumber}} da duoc huy theo yeu cau. Ly do: {{reason}}. Lien he 1800 2097 neu can ho tro.',
   true),
  (gen_random_uuid(), 'payment_due',
   'Nhac nho: Thanh toan hoa don #{{invoiceNumber}} den han',
   'Chao {{buyerName}}, hoa don #{{invoiceNumber}} tri gia {{amount}} da den han vao ngay {{dueDate}}. Vui long thanh toan de tranh phat sinh phi tre han. Link thanh toan: {{paymentLink}}.',
   true),
  (gen_random_uuid(), 'payment_received',
   'Da nhan thanh toan don hang #{{orderNumber}}',
   'Chao {{buyerName}}, chung toi da nhan duoc thanh toan {{amount}} cho don hang #{{orderNumber}}. Cam on ban!',
   true),
  (gen_random_uuid(), 'welcome',
   'Chao mung den voi CELLPHONES!',
   'Chao {{fullName}}, chuc mung ban da dang ky tai khoan CELLPHONES! Username: {{email}}. Verify email: {{verifyLink}}. Bat dau mua sam tai: {{shopLink}}.',
   true),
  (gen_random_uuid(), 'return_approved',
   'Yeu cau hoan tra #{{returnId}} da duoc duyet',
   'Chao {{buyerName}}, yeu cau hoan tra cua ban da duoc duyet. So tien hoan: {{refundAmount}}. Du kien hoan tien: {{refundDate}}. Lien he 1800 2097 neu can ho tro.',
   true),
  (gen_random_uuid(), 'warranty_update',
   'Cap nhat bao hanh #{{claimId}}',
   'Chao {{buyerName}}, yeu cau bao hanh #{{claimId}} da duoc cap nhat trang thai: {{status}}. Ghi chu: {{note}}. Lien he ky thuat vien: 1800 2097.',
   true),
  (gen_random_uuid(), 'trade_in_valued',
   'Ket qua dinh gia may cu #{{tradeInId}}',
   'Chao {{buyerName}}, may {{deviceModel}} cua ban da duoc dinh gia: {{valuationAmount}} VND. De chap nhan hoac tu choi, vui long truy cap: {{link}}.',
   true),
  (gen_random_uuid(), 'maintenance',
   'Thong bao bao tri he thong CELLPHONES',
   'Kinh gui {{name}}, he thong CELLPHONES se bao tri tu {{startTime}} den {{endTime}} vao ngay {{date}}. Xin loi vi su bat tien nay.',
   false)
ON CONFLICT (template_key) DO NOTHING;

-- ============================================================
-- admin_settings (upsert key-value pairs)
-- ============================================================
INSERT INTO admin_settings (setting_key, setting_value, updated_at)
VALUES
  ('siteName',           '"CELLPHONES"'::jsonb,                                        NOW()),
  ('siteDescription',    '"He thong ban le dien thoai va phu kien hang dau Viet Nam"'::jsonb, NOW()),
  ('currency',           '"VND"'::jsonb,                                               NOW()),
  ('taxRate',            '10'::jsonb,                                                  NOW()),
  ('minOrderValue',      '0'::jsonb,                                                   NOW()),
  ('defaultPageSize',    '20'::jsonb,                                                  NOW()),
  ('maintenanceMode',    'false'::jsonb,                                               NOW()),
  ('emailNotifications', 'true'::jsonb,                                                NOW()),
  ('autoApproveProducts','false'::jsonb,                                               NOW()),
  ('maxUploadSize',      '20'::jsonb,                                                  NOW())
ON CONFLICT (setting_key) DO UPDATE
  SET setting_value = EXCLUDED.setting_value,
      updated_at    = NOW();
