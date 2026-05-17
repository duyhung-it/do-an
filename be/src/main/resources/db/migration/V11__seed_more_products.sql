INSERT INTO products (id, name, slug, description, short_description, category_id, category_name, brand, price, original_price, discount_percent, status, condition, rating, review_count, sold_count, view_count, warranty, tags, specifications, color, is_new, is_featured, is_hot)
VALUES
  ('b1b2c3d4-0001-0001-0001-000000000004', 'iPhone 15 128GB', 'iphone-15-128gb', '<p>iPhone 15 chinh hang VN/A voi Dynamic Island.</p>', 'Dynamic Island, camera 48MP, USB-C', 'a1b2c3d4-0001-0001-0001-000000000003', 'iPhone', 'Apple', 18990000, 22990000, 17, 'ACTIVE', 'NEW', 4.6, 98, 540, 21000, 12, ARRAY['iphone','apple','usb-c'], '{"Chip":"A16 Bionic","RAM":"6GB","Bo nho trong":"128GB","Man hinh":"6.1 inch Super Retina XDR"}', 'Xanh', TRUE, TRUE, FALSE),
  ('b1b2c3d4-0001-0001-0001-000000000005', 'Samsung Galaxy A55 5G 256GB', 'samsung-galaxy-a55-5g-256gb', '<p>Galaxy A55 5G thiet ke kim loai, pin lon.</p>', 'Exynos 1480, man hinh AMOLED 120Hz', 'a1b2c3d4-0001-0001-0001-000000000002', 'Samsung', 'Samsung', 9490000, 10990000, 14, 'ACTIVE', 'NEW', 4.4, 75, 410, 16500, 12, ARRAY['samsung','5g','tam-trung'], '{"Chip":"Exynos 1480","RAM":"8GB","Bo nho trong":"256GB","Pin":"5000mAh"}', 'Navy', TRUE, FALSE, TRUE),
  ('b1b2c3d4-0001-0001-0001-000000000006', 'Xiaomi 14 512GB', 'xiaomi-14-512gb', '<p>Xiaomi 14 camera Leica, hieu nang cao.</p>', 'Snapdragon 8 Gen 3, Leica, sac nhanh 90W', 'a1b2c3d4-0001-0001-0001-000000000005', 'Xiaomi', 'Xiaomi', 19990000, 22990000, 13, 'ACTIVE', 'NEW', 4.5, 60, 260, 12200, 12, ARRAY['xiaomi','leica','flagship'], '{"Chip":"Snapdragon 8 Gen 3","RAM":"12GB","Bo nho trong":"512GB","Sac nhanh":"90W"}', 'Den', FALSE, TRUE, TRUE),
  ('b1b2c3d4-0001-0001-0001-000000000007', 'OPPO Reno12 5G 256GB', 'oppo-reno12-5g-256gb', '<p>OPPO Reno12 5G voi camera chan dung AI.</p>', 'Camera AI, thiet ke mong nhe', 'a1b2c3d4-0001-0001-0001-000000000006', 'OPPO', 'OPPO', 11990000, 13990000, 14, 'ACTIVE', 'NEW', 4.3, 45, 190, 9300, 12, ARRAY['oppo','reno','5g'], '{"Chip":"Dimensity 7300","RAM":"12GB","Bo nho trong":"256GB","Man hinh":"AMOLED 120Hz"}', 'Bac', TRUE, FALSE, FALSE),
  ('b1b2c3d4-0001-0001-0001-000000000008', 'Vivo V30 5G 256GB', 'vivo-v30-5g-256gb', '<p>Vivo V30 5G camera Aura Light, pin 5000mAh.</p>', 'Camera chan dung, sac nhanh 80W', 'a1b2c3d4-0001-0001-0001-000000000007', 'Vivo', 'Vivo', 10990000, 12990000, 15, 'ACTIVE', 'NEW', 4.2, 38, 155, 8200, 12, ARRAY['vivo','camera','5g'], '{"Chip":"Snapdragon 7 Gen 3","RAM":"12GB","Bo nho trong":"256GB","Pin":"5000mAh"}', 'Xanh ngoc', FALSE, FALSE, FALSE),
  ('b1b2c3d4-0001-0001-0001-000000000009', 'AirPods Pro 2 USB-C', 'airpods-pro-2-usb-c', '<p>AirPods Pro 2 USB-C chong on chu dong.</p>', 'ANC, USB-C, Spatial Audio', 'a1b2c3d4-0001-0001-0001-000000000008', 'Tai nghe', 'Apple', 5490000, 6490000, 15, 'ACTIVE', 'NEW', 4.7, 120, 980, 24000, 12, ARRAY['airpods','tai-nghe','anc'], '{"Ket noi":"Bluetooth 5.3","Chong on":"ANC","Cong sac":"USB-C"}', 'Trang', FALSE, TRUE, TRUE),
  ('b1b2c3d4-0001-0001-0001-000000000010', 'Cap USB-C to USB-C 1m Apple', 'cap-usb-c-to-usb-c-1m-apple', '<p>Cap sac USB-C to USB-C Apple dai 1m.</p>', 'Cap sac USB-C chinh hang Apple', 'a1b2c3d4-0001-0001-0001-000000000009', 'Sac cap', 'Apple', 490000, 590000, 17, 'COMING_SOON', 'NEW', 0.0, 0, 0, 1500, 12, ARRAY['cap-sac','usb-c','apple'], '{"Chieu dai":"1m","Cong ket noi":"USB-C to USB-C"}', 'Trang', TRUE, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_variants (id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active)
VALUES
  ('c1b2c3d4-0001-0001-0001-000000000005', 'b1b2c3d4-0001-0001-0001-000000000004', '128GB - Xanh', 'IPH15-128-BLU', 18990000, 22990000, 32, 'Xanh', '128GB', '6GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000006', 'b1b2c3d4-0001-0001-0001-000000000004', '256GB - Den', 'IPH15-256-BLK', 21990000, 25990000, 18, 'Den', '256GB', '6GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000007', 'b1b2c3d4-0001-0001-0001-000000000005', '256GB - Navy', 'SGA55-256-NAVY', 9490000, 10990000, 40, 'Navy', '256GB', '8GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000008', 'b1b2c3d4-0001-0001-0001-000000000006', '512GB - Den', 'XIAOMI14-512-BLK', 19990000, 22990000, 22, 'Den', '512GB', '12GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000009', 'b1b2c3d4-0001-0001-0001-000000000007', '256GB - Bac', 'OPPORENO12-256-SLV', 11990000, 13990000, 25, 'Bac', '256GB', '12GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000010', 'b1b2c3d4-0001-0001-0001-000000000008', '256GB - Xanh ngoc', 'VIVOV30-256-GRN', 10990000, 12990000, 24, 'Xanh ngoc', '256GB', '12GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000011', 'b1b2c3d4-0001-0001-0001-000000000009', 'USB-C - Trang', 'AIRPODSPRO2-USBC-WHT', 5490000, 6490000, 55, 'Trang', NULL, NULL, TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000012', 'b1b2c3d4-0001-0001-0001-000000000010', '1m - Trang', 'APPLE-C2C-1M-WHT', 490000, 590000, 0, 'Trang', NULL, NULL, TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000013', 'b1b2c3d4-0001-0001-0001-000000000006', '512GB - Xanh', 'XIAOMI14-512-GRN', 19990000, 22990000, 12, 'Xanh', '512GB', '12GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000014', 'b1b2c3d4-0001-0001-0001-000000000005', '128GB - Tim', 'SGA55-128-VIO', 8490000, 9990000, 16, 'Tim', '128GB', '8GB', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
VALUES
  ('d1b2c3d4-0001-0001-0001-000000000005', 'b1b2c3d4-0001-0001-0001-000000000004', 'https://cdn.cellphones.vn/products/iphone15-128-blue.jpg', 'iPhone 15 128GB mau xanh', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000006', 'b1b2c3d4-0001-0001-0001-000000000004', 'https://cdn.cellphones.vn/products/iphone15-128-black.jpg', 'iPhone 15 mau den', 1, FALSE),
  ('d1b2c3d4-0001-0001-0001-000000000007', 'b1b2c3d4-0001-0001-0001-000000000005', 'https://cdn.cellphones.vn/products/galaxy-a55-navy.jpg', 'Samsung Galaxy A55 Navy', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000008', 'b1b2c3d4-0001-0001-0001-000000000006', 'https://cdn.cellphones.vn/products/xiaomi-14-black.jpg', 'Xiaomi 14 mau den', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000009', 'b1b2c3d4-0001-0001-0001-000000000007', 'https://cdn.cellphones.vn/products/oppo-reno12-silver.jpg', 'OPPO Reno12 mau bac', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000010', 'b1b2c3d4-0001-0001-0001-000000000008', 'https://cdn.cellphones.vn/products/vivo-v30-green.jpg', 'Vivo V30 xanh ngoc', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000011', 'b1b2c3d4-0001-0001-0001-000000000009', 'https://cdn.cellphones.vn/products/airpods-pro-2-usbc.jpg', 'AirPods Pro 2 USB-C', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000012', 'b1b2c3d4-0001-0001-0001-000000000010', 'https://cdn.cellphones.vn/products/apple-usbc-cable-1m.jpg', 'Cap USB-C Apple 1m', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000013', 'b1b2c3d4-0001-0001-0001-000000000006', 'https://cdn.cellphones.vn/products/xiaomi-14-green.jpg', 'Xiaomi 14 mau xanh', 1, FALSE),
  ('d1b2c3d4-0001-0001-0001-000000000014', 'b1b2c3d4-0001-0001-0001-000000000009', 'https://cdn.cellphones.vn/products/airpods-pro-2-case.jpg', 'AirPods Pro 2 hop sac', 1, FALSE)
ON CONFLICT (id) DO NOTHING;
