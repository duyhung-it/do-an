INSERT INTO banners (id, title, image_url, link_url, position, is_active, sort_order)
VALUES
  ('aa000000-0016-4000-8000-000000000001', 'iPhone 15 Pro Max Weekend Sale', 'https://cdn.cellphones.vn/banners/qa-iphone-15-pro-max.jpg', '/products?brand=Apple', 'HOME', TRUE, 1),
  ('aa000000-0016-4000-8000-000000000002', 'Samsung Galaxy S24 Ultra Deal', 'https://cdn.cellphones.vn/banners/qa-galaxy-s24-ultra.jpg', '/products?brand=Samsung', 'HOME', TRUE, 2),
  ('aa000000-0016-4000-8000-000000000003', 'Accessory Combo Discount', 'https://cdn.cellphones.vn/banners/qa-accessory-combo.jpg', '/products?category=accessories', 'CATEGORY', TRUE, 3),
  ('aa000000-0016-4000-8000-000000000004', 'Trade In Old Phone', 'https://cdn.cellphones.vn/banners/qa-trade-in.jpg', '/trade-in', 'HOME', TRUE, 4),
  ('aa000000-0016-4000-8000-000000000005', 'AirPods Pro 2 Promotion', 'https://cdn.cellphones.vn/banners/qa-airpods-pro-2.jpg', '/products?brand=Apple&search=AirPods', 'PRODUCT', TRUE, 5),
  ('aa000000-0016-4000-8000-000000000006', 'Xiaomi Flash Sale', 'https://cdn.cellphones.vn/banners/qa-xiaomi-flash-sale.jpg', '/products?brand=Xiaomi', 'PROMOTION', TRUE, 6),
  ('aa000000-0016-4000-8000-000000000007', 'OPPO Reno Hot Deal', 'https://cdn.cellphones.vn/banners/qa-oppo-reno.jpg', '/products?brand=OPPO', 'HOME', TRUE, 7),
  ('aa000000-0016-4000-8000-000000000008', 'Vivo V Series Offer', 'https://cdn.cellphones.vn/banners/qa-vivo-v-series.jpg', '/products?brand=Vivo', 'CATEGORY', FALSE, 8),
  ('aa000000-0016-4000-8000-000000000009', 'Fast Charger Essentials', 'https://cdn.cellphones.vn/banners/qa-fast-charger.jpg', '/products?search=sac%20nhanh', 'PRODUCT', TRUE, 9),
  ('aa000000-0016-4000-8000-000000000010', 'Member Voucher Popup', 'https://cdn.cellphones.vn/banners/qa-member-voucher.jpg', '/promotions', 'POPUP', FALSE, 10)
ON CONFLICT (id) DO NOTHING;
