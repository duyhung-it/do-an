INSERT INTO products (id, name, slug, description, short_description, category_id, category_name, brand, price, original_price, discount_percent, status, condition, rating, review_count, sold_count, view_count, warranty, tags, specifications, color, is_new, is_featured, is_hot)
VALUES
  ('b1b2c3d4-0001-0001-0001-000000000011', 'Op lung iPhone 15 Pro Max Clear Case', 'op-lung-iphone-15-pro-max-clear-case', '<p>Op lung trong suot cho iPhone 15 Pro Max.</p>', 'Op lung clear case chong soc co MagSafe', 'a1b2c3d4-0001-0001-0001-000000000010', 'Op lung', 'Apple', 1290000, 1490000, 13, 'ACTIVE', 'NEW', 4.4, 32, 310, 6200, 6, ARRAY['op-lung','iphone','magsafe'], '{"Chat lieu":"Polycarbonate","Tuong thich":"iPhone 15 Pro Max","MagSafe":"Co"}', 'Trong suot', FALSE, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_variants (id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active)
VALUES
  ('c1b2c3d4-0001-0001-0001-000000000015', 'b1b2c3d4-0001-0001-0001-000000000011', 'Clear Case - Trong suot', 'APPLE-CASE-IP15PM-CLR', 1290000, 1490000, 48, 'Trong suot', NULL, NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
VALUES
  ('d1b2c3d4-0001-0001-0001-000000000015', 'b1b2c3d4-0001-0001-0001-000000000011', 'https://cdn.cellphones.vn/products/iphone15pm-clear-case.jpg', 'Op lung iPhone 15 Pro Max Clear Case', 0, TRUE)
ON CONFLICT (id) DO NOTHING;
