CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE product_status AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'COMING_SOON');
CREATE TYPE product_condition AS ENUM ('NEW', 'LIKE_NEW', 'USED');

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon VARCHAR(100) NOT NULL DEFAULT '',
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  level INT NOT NULL DEFAULT 0,
  path VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  product_count INT NOT NULL DEFAULT 0,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  short_description VARCHAR(1000) NOT NULL DEFAULT '',
  category_id UUID NOT NULL REFERENCES categories(id),
  category_name VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price BIGINT NOT NULL CHECK (price > 0),
  original_price BIGINT,
  discount_percent INT NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  status product_status NOT NULL DEFAULT 'ACTIVE',
  condition product_condition NOT NULL DEFAULT 'NEW',
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  review_count INT NOT NULL DEFAULT 0,
  sold_count INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  warranty INT NOT NULL DEFAULT 12,
  tags TEXT[] NOT NULL DEFAULT '{}',
  specifications JSONB NOT NULL DEFAULT '{}',
  color VARCHAR(100),
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_hot BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_product_original_price CHECK (original_price IS NULL OR original_price >= price)
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_hot ON products(is_hot);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_fts ON products USING GIN(to_tsvector('simple', name || ' ' || brand));

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(300) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price BIGINT NOT NULL CHECK (price > 0),
  original_price BIGINT,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  color VARCHAR(100),
  storage VARCHAR(50),
  ram VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_variant_original_price CHECK (original_price IS NULL OR original_price >= price)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(300),
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE UNIQUE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = TRUE;

CREATE TABLE phone_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  chip VARCHAR(200) NOT NULL,
  ram VARCHAR(50) NOT NULL,
  storage VARCHAR(50) NOT NULL,
  battery VARCHAR(100) NOT NULL,
  camera VARCHAR(300) NOT NULL,
  front_camera VARCHAR(100) NOT NULL,
  screen VARCHAR(300) NOT NULL,
  os VARCHAR(100) NOT NULL,
  connectivity VARCHAR(300) NOT NULL,
  weight VARCHAR(50),
  dimensions VARCHAR(100),
  water_resistance VARCHAR(50),
  sim_type VARCHAR(100),
  charging_speed VARCHAR(200),
  gpu VARCHAR(200)
);

INSERT INTO categories (id, name, slug, description, icon, image_url, parent_id, level, path, is_active, sort_order, product_count, meta_title, meta_description)
VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Dien thoai', 'dien-thoai', 'Dien thoai smartphone chinh hang', 'smartphone', 'https://cdn.cellphones.vn/categories/dien-thoai.jpg', NULL, 0, '/dien-thoai', TRUE, 1, 3, 'Dien thoai chinh hang gia tot | CellPhones', 'Mua dien thoai iPhone, Samsung, Xiaomi chinh hang'),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Samsung', 'dien-thoai-samsung', 'Dien thoai Samsung Galaxy', 'samsung', 'https://cdn.cellphones.vn/categories/samsung.jpg', 'a1b2c3d4-0001-0001-0001-000000000001', 1, '/dien-thoai/dien-thoai-samsung', TRUE, 1, 1, NULL, NULL),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'iPhone', 'iphone', 'Dien thoai iPhone chinh hang Apple', 'apple', 'https://cdn.cellphones.vn/categories/iphone.jpg', 'a1b2c3d4-0001-0001-0001-000000000001', 1, '/dien-thoai/iphone', TRUE, 2, 1, 'iPhone chinh hang | CellPhones', 'Mua iPhone chinh hang gia tot'),
  ('a1b2c3d4-0001-0001-0001-000000000004', 'Phu kien', 'phu-kien', 'Phu kien dien thoai va thiet bi cong nghe', 'headphones', 'https://cdn.cellphones.vn/categories/phu-kien.jpg', NULL, 0, '/phu-kien', TRUE, 2, 1, NULL, NULL);

INSERT INTO products (id, name, slug, description, short_description, category_id, category_name, brand, price, original_price, discount_percent, status, condition, rating, review_count, sold_count, view_count, warranty, tags, specifications, color, is_new, is_featured, is_hot)
VALUES
  ('b1b2c3d4-0001-0001-0001-000000000001', 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', '<p>iPhone 15 Pro Max voi chip A17 Pro manh me.</p>', 'Chip A17 Pro, Titanium, Camera 48MP ProRAW', 'a1b2c3d4-0001-0001-0001-000000000003', 'iPhone', 'Apple', 33990000, 37990000, 11, 'ACTIVE', 'NEW', 4.8, 256, 1200, 45000, 12, ARRAY['flagship','5g','promax'], '{"Chip":"A17 Pro","RAM":"8GB","Bo nho trong":"256GB","Man hinh":"6.7 inch Super Retina XDR OLED"}', 'Titan Tu Nhien', FALSE, TRUE, TRUE),
  ('b1b2c3d4-0001-0001-0001-000000000002', 'Samsung Galaxy S24 Ultra 256GB', 'samsung-galaxy-s24-ultra-256gb', '<p>Samsung Galaxy S24 Ultra voi S Pen va camera 200MP.</p>', 'S Pen, Camera 200MP, Snapdragon 8 Gen 3', 'a1b2c3d4-0001-0001-0001-000000000002', 'Samsung', 'Samsung', 29990000, 35990000, 17, 'ACTIVE', 'NEW', 4.7, 180, 860, 32000, 12, ARRAY['flagship','s-pen','5g'], '{"Chip":"Snapdragon 8 Gen 3","RAM":"12GB","Bo nho trong":"256GB"}', 'Titanium Black', TRUE, TRUE, FALSE),
  ('b1b2c3d4-0001-0001-0001-000000000003', 'Sac nhanh Apple USB-C 20W', 'sac-nhanh-apple-usb-c-20w', '<p>Cu sac nhanh Apple USB-C 20W chinh hang.</p>', 'Sac nhanh USB-C 20W cho iPhone, iPad', 'a1b2c3d4-0001-0001-0001-000000000004', 'Phu kien', 'Apple', 490000, 690000, 29, 'ACTIVE', 'NEW', 4.5, 42, 2200, 18000, 12, ARRAY['sac','usb-c','phu-kien'], '{"Cong suat":"20W","Cong ket noi":"USB-C"}', 'Trang', FALSE, FALSE, TRUE);

INSERT INTO product_variants (id, product_id, name, sku, price, original_price, stock, color, storage, ram, is_active)
VALUES
  ('c1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', '256GB - Titan Tu Nhien', 'IPH15PM-256-TN', 33990000, 37990000, 45, 'Titan Tu Nhien', '256GB', '8GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000002', 'b1b2c3d4-0001-0001-0001-000000000001', '512GB - Titan Den', 'IPH15PM-512-TB', 38990000, 43990000, 20, 'Titan Den', '512GB', '8GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000003', 'b1b2c3d4-0001-0001-0001-000000000002', '256GB - Titanium Black', 'SGS24U-256-BLK', 29990000, 35990000, 36, 'Titanium Black', '256GB', '12GB', TRUE),
  ('c1b2c3d4-0001-0001-0001-000000000004', 'b1b2c3d4-0001-0001-0001-000000000003', '20W - Trang', 'APPLE-20W-WHT', 490000, 690000, 120, 'Trang', NULL, NULL, TRUE);

INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
VALUES
  ('d1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', 'https://cdn.cellphones.vn/products/iphone15promax-1.jpg', 'iPhone 15 Pro Max mau Titan Tu Nhien', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000002', 'b1b2c3d4-0001-0001-0001-000000000001', 'https://cdn.cellphones.vn/products/iphone15promax-2.jpg', 'iPhone 15 Pro Max mat sau', 1, FALSE),
  ('d1b2c3d4-0001-0001-0001-000000000003', 'b1b2c3d4-0001-0001-0001-000000000002', 'https://cdn.cellphones.vn/products/s24-ultra-1.jpg', 'Samsung Galaxy S24 Ultra', 0, TRUE),
  ('d1b2c3d4-0001-0001-0001-000000000004', 'b1b2c3d4-0001-0001-0001-000000000003', 'https://cdn.cellphones.vn/products/apple-20w.jpg', 'Sac nhanh Apple USB-C 20W', 0, TRUE);

INSERT INTO phone_specs (id, product_id, chip, ram, storage, battery, camera, front_camera, screen, os, connectivity, weight, dimensions, water_resistance, sim_type, charging_speed, gpu)
VALUES
  ('e1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', 'Apple A17 Pro', '8GB', '256GB', '4422mAh', '48MP main + 12MP ultrawide + 12MP telephoto', '12MP TrueDepth', '6.7 inch Super Retina XDR OLED', 'iOS 17', '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C', '221g', '159.9 x 76.7 x 8.25 mm', 'IP68', 'Nano SIM + eSIM', 'USB-C, MagSafe 15W', 'Apple GPU 6-core'),
  ('e1b2c3d4-0001-0001-0001-000000000002', 'b1b2c3d4-0001-0001-0001-000000000002', 'Snapdragon 8 Gen 3', '12GB', '256GB', '5000mAh', '200MP main + 12MP ultrawide + 50MP telephoto', '12MP', '6.8 inch Dynamic AMOLED 2X', 'Android 14', '5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB-C', '232g', '162.3 x 79.0 x 8.6 mm', 'IP68', 'Nano SIM + eSIM', '45W wired', 'Adreno 750');
