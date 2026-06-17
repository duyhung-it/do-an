CREATE TEMP TABLE catalog_real_product_names (
  old_slug TEXT PRIMARY KEY,
  new_name TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  new_brand TEXT NOT NULL,
  short_description TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_sku TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO catalog_real_product_names (
  old_slug, new_name, new_slug, new_brand, short_description, variant_name, variant_sku
)
VALUES
  ('iphone-demo-01', 'iPhone 14 128GB', 'iphone-14-128gb', 'Apple', 'iPhone 14 chinh hang, chip A15 Bionic, camera kep 12MP', '128GB - Midnight', 'IPH14-128-MID'),
  ('iphone-demo-02', 'iPhone 14 Plus 128GB', 'iphone-14-plus-128gb', 'Apple', 'iPhone 14 Plus man hinh lon 6.7 inch, pin ben bi', '128GB - Blue', 'IPH14PL-128-BLU'),
  ('iphone-demo-03', 'iPhone 14 Pro 128GB', 'iphone-14-pro-128gb', 'Apple', 'iPhone 14 Pro voi Dynamic Island, camera 48MP', '128GB - Deep Purple', 'IPH14P-128-PUR'),
  ('iphone-demo-04', 'iPhone 14 Pro Max 256GB', 'iphone-14-pro-max-256gb', 'Apple', 'iPhone 14 Pro Max man hinh 6.7 inch, ProMotion 120Hz', '256GB - Space Black', 'IPH14PM-256-BLK'),
  ('iphone-demo-05', 'iPhone 13 128GB', 'iphone-13-128gb', 'Apple', 'iPhone 13 chip A15 Bionic, camera kep, ho tro 5G', '128GB - Starlight', 'IPH13-128-STR'),
  ('iphone-demo-06', 'iPhone 13 mini 128GB', 'iphone-13-mini-128gb', 'Apple', 'iPhone 13 mini nho gon, chip A15 Bionic, OLED', '128GB - Pink', 'IPH13M-128-PNK'),
  ('iphone-demo-07', 'iPhone SE 2022 64GB', 'iphone-se-2022-64gb', 'Apple', 'iPhone SE 2022 chip A15 Bionic, Touch ID, 5G', '64GB - Midnight', 'IPHSE22-64-MID'),
  ('iphone-demo-08', 'iPhone 12 128GB', 'iphone-12-128gb', 'Apple', 'iPhone 12 man hinh OLED, chip A14 Bionic, MagSafe', '128GB - Black', 'IPH12-128-BLK'),
  ('samsung-demo-01', 'Samsung Galaxy S23 Ultra 256GB', 'samsung-galaxy-s23-ultra-256gb', 'Samsung', 'Galaxy S23 Ultra voi S Pen, camera 200MP, Snapdragon 8 Gen 2', '12GB/256GB - Phantom Black', 'SGS23U-256-BLK'),
  ('samsung-demo-02', 'Samsung Galaxy S23+ 256GB', 'samsung-galaxy-s23-plus-256gb', 'Samsung', 'Galaxy S23+ man hinh Dynamic AMOLED 2X, sac nhanh 45W', '8GB/256GB - Cream', 'SGS23P-256-CRM'),
  ('samsung-demo-03', 'Samsung Galaxy S23 128GB', 'samsung-galaxy-s23-128gb', 'Samsung', 'Galaxy S23 nho gon, hieu nang flagship, camera 50MP', '8GB/128GB - Green', 'SGS23-128-GRN'),
  ('samsung-demo-04', 'Samsung Galaxy Z Flip5 256GB', 'samsung-galaxy-z-flip5-256gb', 'Samsung', 'Galaxy Z Flip5 gap gon, man hinh phu Flex Window', '8GB/256GB - Mint', 'SGZF5-256-MNT'),
  ('samsung-demo-05', 'Samsung Galaxy Z Fold5 256GB', 'samsung-galaxy-z-fold5-256gb', 'Samsung', 'Galaxy Z Fold5 man hinh gap lon, da nhiem nang cao', '12GB/256GB - Icy Blue', 'SGZFOLD5-256-BLU'),
  ('samsung-demo-06', 'Samsung Galaxy A35 5G 256GB', 'samsung-galaxy-a35-5g-256gb', 'Samsung', 'Galaxy A35 5G man hinh Super AMOLED 120Hz, pin 5000mAh', '8GB/256GB - Navy', 'SGA35-256-NAV'),
  ('samsung-demo-07', 'Samsung Galaxy A25 5G 128GB', 'samsung-galaxy-a25-5g-128gb', 'Samsung', 'Galaxy A25 5G camera OIS, man hinh Super AMOLED 120Hz', '6GB/128GB - Blue Black', 'SGA25-128-BLK'),
  ('samsung-demo-08', 'Samsung Galaxy M55 5G 256GB', 'samsung-galaxy-m55-5g-256gb', 'Samsung', 'Galaxy M55 5G pin lon, sac nhanh, thiet ke mong nhe', '8GB/256GB - Light Green', 'SGM55-256-GRN'),
  ('xiaomi-demo-01', 'Xiaomi 13T Pro 512GB', 'xiaomi-13t-pro-512gb', 'Xiaomi', 'Xiaomi 13T Pro camera Leica, sac nhanh 120W', '12GB/512GB - Black', 'XIAOMI13TP-512-BLK'),
  ('xiaomi-demo-02', 'Xiaomi 13T 256GB', 'xiaomi-13t-256gb', 'Xiaomi', 'Xiaomi 13T camera Leica, man hinh AMOLED 144Hz', '8GB/256GB - Meadow Green', 'XIAOMI13T-256-GRN'),
  ('xiaomi-demo-03', 'Redmi Note 13 Pro+ 5G 256GB', 'redmi-note-13-pro-plus-5g-256gb', 'Xiaomi', 'Redmi Note 13 Pro+ 5G camera 200MP, sac 120W', '8GB/256GB - Midnight Black', 'RN13PP-256-BLK'),
  ('xiaomi-demo-04', 'Redmi Note 13 Pro 5G 256GB', 'redmi-note-13-pro-5g-256gb', 'Xiaomi', 'Redmi Note 13 Pro 5G camera 200MP, AMOLED 120Hz', '8GB/256GB - Ocean Teal', 'RN13P5G-256-TEAL'),
  ('xiaomi-demo-05', 'Redmi Note 13 128GB', 'redmi-note-13-128gb', 'Xiaomi', 'Redmi Note 13 man hinh AMOLED, pin 5000mAh', '6GB/128GB - Ice Blue', 'RN13-128-BLU'),
  ('xiaomi-demo-06', 'POCO X6 Pro 5G 512GB', 'poco-x6-pro-5g-512gb', 'Xiaomi', 'POCO X6 Pro 5G Dimensity 8300 Ultra, hieu nang cao', '12GB/512GB - Black', 'POCOX6P-512-BLK'),
  ('xiaomi-demo-07', 'POCO F6 5G 256GB', 'poco-f6-5g-256gb', 'Xiaomi', 'POCO F6 5G Snapdragon 8s Gen 3, man hinh AMOLED', '12GB/256GB - Green', 'POCOF6-256-GRN'),
  ('xiaomi-demo-08', 'Xiaomi Pad 6 128GB', 'xiaomi-pad-6-128gb', 'Xiaomi', 'Xiaomi Pad 6 man hinh 11 inch 144Hz, Snapdragon 870', '6GB/128GB - Gravity Gray', 'XIAOMIPAD6-128-GRY'),
  ('xiaomi-demo-09', 'Redmi 13C 128GB', 'redmi-13c-128gb', 'Xiaomi', 'Redmi 13C pin 5000mAh, man hinh lon, gia tot', '4GB/128GB - Navy Blue', 'REDMI13C-128-BLU'),
  ('xiaomi-demo-10', 'Xiaomi 14 Ultra 512GB', 'xiaomi-14-ultra-512gb', 'Xiaomi', 'Xiaomi 14 Ultra camera Leica, Snapdragon 8 Gen 3', '16GB/512GB - Black', 'XIAOMI14U-512-BLK'),
  ('oppo-demo-01', 'OPPO Reno11 F 5G 256GB', 'oppo-reno11-f-5g-256gb', 'OPPO', 'OPPO Reno11 F 5G thiet ke mong nhe, camera 64MP', '8GB/256GB - Palm Green', 'OPPORENO11F-256-GRN'),
  ('oppo-demo-02', 'OPPO Reno11 5G 256GB', 'oppo-reno11-5g-256gb', 'OPPO', 'OPPO Reno11 5G camera chan dung, sac nhanh SUPERVOOC', '8GB/256GB - Wave Green', 'OPPORENO11-256-GRN'),
  ('oppo-demo-03', 'OPPO Reno10 Pro+ 5G 256GB', 'oppo-reno10-pro-plus-5g-256gb', 'OPPO', 'OPPO Reno10 Pro+ 5G camera telephoto, Snapdragon 8+ Gen 1', '12GB/256GB - Glossy Purple', 'OPPORENO10PP-256-PUR'),
  ('oppo-demo-04', 'OPPO Find N3 Flip 256GB', 'oppo-find-n3-flip-256gb', 'OPPO', 'OPPO Find N3 Flip dien thoai gap, camera Hasselblad', '12GB/256GB - Cream Gold', 'OPPOFINDN3F-256-GLD'),
  ('oppo-demo-05', 'OPPO A58 128GB', 'oppo-a58-128gb', 'OPPO', 'OPPO A58 loa stereo, sac nhanh 33W, pin 5000mAh', '6GB/128GB - Dazzling Green', 'OPPOA58-128-GRN'),
  ('oppo-demo-06', 'OPPO A78 256GB', 'oppo-a78-256gb', 'OPPO', 'OPPO A78 man hinh AMOLED, sac nhanh 67W', '8GB/256GB - Aqua Green', 'OPPOA78-256-GRN'),
  ('oppo-demo-07', 'OPPO A79 5G 256GB', 'oppo-a79-5g-256gb', 'OPPO', 'OPPO A79 5G man hinh 90Hz, pin 5000mAh', '8GB/256GB - Mystery Black', 'OPPOA79-256-BLK'),
  ('oppo-demo-08', 'OPPO A3 Pro 5G 256GB', 'oppo-a3-pro-5g-256gb', 'OPPO', 'OPPO A3 Pro 5G ben bi, man hinh 120Hz', '8GB/256GB - Moonlight Purple', 'OPPOA3PRO-256-PUR'),
  ('oppo-demo-09', 'OPPO Find X5 Pro 256GB', 'oppo-find-x5-pro-256gb', 'OPPO', 'OPPO Find X5 Pro camera Hasselblad, sac nhanh 80W', '12GB/256GB - Ceramic White', 'OPPOFINDX5P-256-WHT'),
  ('vivo-demo-01', 'Vivo V29 5G 256GB', 'vivo-v29-5g-256gb', 'Vivo', 'Vivo V29 5G camera Aura Light, man hinh AMOLED 120Hz', '12GB/256GB - Starry Purple', 'VIVOV29-256-PUR'),
  ('vivo-demo-02', 'Vivo V29e 5G 256GB', 'vivo-v29e-5g-256gb', 'Vivo', 'Vivo V29e 5G thiet ke mong, camera selfie 50MP', '8GB/256GB - Forest Black', 'VIVOV29E-256-BLK'),
  ('vivo-demo-03', 'Vivo Y36 128GB', 'vivo-y36-128gb', 'Vivo', 'Vivo Y36 pin 5000mAh, sac nhanh 44W', '8GB/128GB - Meteor Black', 'VIVOY36-128-BLK'),
  ('vivo-demo-04', 'Vivo Y17s 128GB', 'vivo-y17s-128gb', 'Vivo', 'Vivo Y17s pin 5000mAh, camera 50MP', '4GB/128GB - Glitter Purple', 'VIVOY17S-128-PUR'),
  ('vivo-demo-05', 'Vivo Y100 5G 256GB', 'vivo-y100-5g-256gb', 'Vivo', 'Vivo Y100 5G AMOLED 120Hz, sac nhanh 80W', '8GB/256GB - Crystal Black', 'VIVOY100-256-BLK'),
  ('vivo-demo-06', 'Vivo V27e 256GB', 'vivo-v27e-256gb', 'Vivo', 'Vivo V27e Aura Light Portrait, sac nhanh 66W', '8GB/256GB - Lavender Purple', 'VIVOV27E-256-PUR'),
  ('vivo-demo-07', 'Vivo V25e 128GB', 'vivo-v25e-128gb', 'Vivo', 'Vivo V25e camera 64MP OIS, thiet ke doi mau', '8GB/128GB - Sunrise Gold', 'VIVOV25E-128-GLD'),
  ('vivo-demo-08', 'Vivo Y27s 128GB', 'vivo-y27s-128gb', 'Vivo', 'Vivo Y27s Snapdragon 680, pin 5000mAh', '8GB/128GB - Burgundy Black', 'VIVOY27S-128-BLK'),
  ('vivo-demo-09', 'Vivo Y22s 128GB', 'vivo-y22s-128gb', 'Vivo', 'Vivo Y22s pin 5000mAh, camera 50MP', '8GB/128GB - Starlit Blue', 'VIVOY22S-128-BLU'),
  ('vivo-demo-10', 'Vivo X100 Pro 512GB', 'vivo-x100-pro-512gb', 'Vivo', 'Vivo X100 Pro camera ZEISS, Dimensity 9300', '16GB/512GB - Asteroid Black', 'VIVOX100P-512-BLK'),
  ('tai-nghe-demo-01', 'Apple EarPods Lightning', 'apple-earpods-lightning', 'Apple', 'Tai nghe Apple EarPods cong Lightning chinh hang', 'Lightning - White', 'EARPODS-LTG-WHT'),
  ('tai-nghe-demo-02', 'Apple EarPods USB-C', 'apple-earpods-usb-c', 'Apple', 'Tai nghe Apple EarPods USB-C chinh hang', 'USB-C - White', 'EARPODS-USBC-WHT'),
  ('tai-nghe-demo-03', 'AirPods 2', 'airpods-2', 'Apple', 'AirPods 2 hop sac Lightning, ket noi nhanh voi iPhone', 'Lightning Case - White', 'AIRPODS2-LTG-WHT'),
  ('tai-nghe-demo-04', 'AirPods 3 Lightning', 'airpods-3-lightning', 'Apple', 'AirPods 3 am thanh khong gian, hop sac Lightning', 'Lightning Case - White', 'AIRPODS3-LTG-WHT'),
  ('tai-nghe-demo-05', 'AirPods 3 MagSafe', 'airpods-3-magsafe', 'Apple', 'AirPods 3 ho tro MagSafe, Spatial Audio', 'MagSafe Case - White', 'AIRPODS3-MAG-WHT'),
  ('tai-nghe-demo-06', 'Beats Flex', 'beats-flex', 'Beats', 'Beats Flex tai nghe bluetooth deo co, chip Apple W1', 'Standard - Black', 'BEATSFLEX-BLK'),
  ('tai-nghe-demo-07', 'Beats Studio Buds', 'beats-studio-buds', 'Beats', 'Beats Studio Buds chong on chu dong, am thanh manh me', 'Standard - Red', 'BEATSSTUDIOBUDS-RED'),
  ('tai-nghe-demo-08', 'Beats Fit Pro', 'beats-fit-pro', 'Beats', 'Beats Fit Pro chong on chu dong, canh tai the thao', 'Standard - Black', 'BEATSFITPRO-BLK'),
  ('tai-nghe-demo-09', 'Sony WH-CH520', 'sony-wh-ch520', 'Sony', 'Sony WH-CH520 tai nghe chup tai bluetooth, pin dai', 'Standard - Blue', 'SONYWHCH520-BLU'),
  ('tai-nghe-demo-10', 'Sony WF-C500', 'sony-wf-c500', 'Sony', 'Sony WF-C500 true wireless, nho gon, pin tot', 'Standard - Black', 'SONYWFC500-BLK'),
  ('sac-cap-demo-01', 'Anker 511 Nano 20W', 'anker-511-nano-20w', 'Anker', 'Cu sac Anker 511 Nano USB-C 20W nho gon', '20W - White', 'ANKER511-20W-WHT'),
  ('sac-cap-demo-02', 'Anker 323 Charger 33W', 'anker-323-charger-33w', 'Anker', 'Cu sac Anker 323 33W hai cong USB-C va USB-A', '33W - White', 'ANKER323-33W-WHT'),
  ('sac-cap-demo-03', 'Anker 735 Charger 65W', 'anker-735-charger-65w', 'Anker', 'Cu sac Anker 735 GaNPrime 65W ba cong sac', '65W - Black', 'ANKER735-65W-BLK'),
  ('sac-cap-demo-04', 'Anker 737 Charger 120W', 'anker-737-charger-120w', 'Anker', 'Cu sac Anker 737 GaNPrime 120W cho laptop va dien thoai', '120W - Black', 'ANKER737-120W-BLK'),
  ('sac-cap-demo-05', 'Anker PowerCore 10000', 'anker-powercore-10000', 'Anker', 'Pin du phong Anker PowerCore 10000mAh nho gon', '10000mAh - Black', 'ANKERPC10000-BLK'),
  ('sac-cap-demo-06', 'Anker 633 Magnetic Battery', 'anker-633-magnetic-battery', 'Anker', 'Pin sac du phong Anker 633 Magnetic Battery MagGo', '10000mAh - White', 'ANKER633MAG-WHT'),
  ('sac-cap-demo-07', 'Anker PowerLine III USB-C to USB-C 1m', 'anker-powerline-iii-usb-c-to-usb-c-1m', 'Anker', 'Cap Anker PowerLine III USB-C to USB-C dai 1m', '1m - White', 'ANKERPL3-C2C-1M-WHT'),
  ('sac-cap-demo-08', 'Anker 544 USB-C to USB-C Cable 1.8m', 'anker-544-usb-c-to-usb-c-cable-18m', 'Anker', 'Cap Anker 544 USB-C to USB-C Bio-Based dai 1.8m', '1.8m - Green', 'ANKER544-C2C-18M-GRN'),
  ('op-lung-demo-01', 'Uniq Hybrid iPhone 15 Pro Max Case', 'uniq-hybrid-iphone-15-pro-max-case', 'Uniq', 'Op lung Uniq Hybrid bao ve iPhone 15 Pro Max', 'iPhone 15 Pro Max - Clear', 'UNIQHYB-IP15PM-CLR'),
  ('op-lung-demo-02', 'Uniq LifePro Xtreme iPhone 15 Pro Case', 'uniq-lifepro-xtreme-iphone-15-pro-case', 'Uniq', 'Op lung Uniq LifePro Xtreme chong soc cho iPhone 15 Pro', 'iPhone 15 Pro - Black', 'UNIQLPX-IP15P-BLK'),
  ('op-lung-demo-03', 'Uniq Combat MagClick iPhone 15 Case', 'uniq-combat-magclick-iphone-15-case', 'Uniq', 'Op lung Uniq Combat MagClick ho tro MagSafe cho iPhone 15', 'iPhone 15 - Clear', 'UNIQCOMBAT-IP15-CLR'),
  ('op-lung-demo-04', 'Uniq Valencia iPhone 14 Pro Max Case', 'uniq-valencia-iphone-14-pro-max-case', 'Uniq', 'Op lung Uniq Valencia da PU cho iPhone 14 Pro Max', 'iPhone 14 Pro Max - Brown', 'UNIQVAL-IP14PM-BRN'),
  ('op-lung-demo-05', 'Uniq Heldro Mount iPhone 14 Case', 'uniq-heldro-mount-iphone-14-case', 'Uniq', 'Op lung Uniq Heldro Mount co vong cam cho iPhone 14', 'iPhone 14 - Black', 'UNIQHELDRO-IP14-BLK'),
  ('op-lung-demo-06', 'Spigen Ultra Hybrid iPhone 15 Case', 'spigen-ultra-hybrid-iphone-15-case', 'Spigen', 'Op lung Spigen Ultra Hybrid trong suot cho iPhone 15', 'iPhone 15 - Clear', 'SPIGENUH-IP15-CLR'),
  ('op-lung-demo-07', 'Spigen Liquid Air iPhone 15 Pro Case', 'spigen-liquid-air-iphone-15-pro-case', 'Spigen', 'Op lung Spigen Liquid Air mong nhe cho iPhone 15 Pro', 'iPhone 15 Pro - Matte Black', 'SPIGENLA-IP15P-BLK'),
  ('op-lung-demo-08', 'UAG Pathfinder iPhone 15 Pro Max Case', 'uag-pathfinder-iphone-15-pro-max-case', 'UAG', 'Op lung UAG Pathfinder chong soc cho iPhone 15 Pro Max', 'iPhone 15 Pro Max - Black', 'UAGPATH-IP15PM-BLK'),
  ('op-lung-demo-09', 'Apple FineWoven Case iPhone 15 Pro', 'apple-finewoven-case-iphone-15-pro', 'Apple', 'Op lung Apple FineWoven ho tro MagSafe cho iPhone 15 Pro', 'iPhone 15 Pro - Taupe', 'APPLEFW-IP15P-TAU'),
  ('op-lung-demo-10', 'Apple Silicone Case iPhone 15', 'apple-silicone-case-iphone-15', 'Apple', 'Op lung Apple Silicone ho tro MagSafe cho iPhone 15', 'iPhone 15 - Black', 'APPLESC-IP15-BLK');

UPDATE product_variants pv
SET name = m.variant_name,
    sku = m.variant_sku,
    color = CASE
      WHEN m.variant_name LIKE '% - %' THEN split_part(m.variant_name, ' - ', 2)
      ELSE pv.color
    END,
    updated_at = NOW()
FROM products p
JOIN catalog_real_product_names m ON m.old_slug = p.slug
WHERE pv.product_id = p.id;

UPDATE product_images pi
SET alt_text = m.new_name
FROM products p
JOIN catalog_real_product_names m ON m.old_slug = p.slug
WHERE pi.product_id = p.id;

UPDATE cart_items ci
SET product_name = m.new_name
FROM products p
JOIN catalog_real_product_names m ON m.old_slug = p.slug
WHERE ci.product_id = p.id;

UPDATE order_items oi
SET product_name = m.new_name
FROM products p
JOIN catalog_real_product_names m ON m.old_slug = p.slug
WHERE oi.product_id = p.id;

UPDATE warranty_items wi
SET product_name = m.new_name
FROM products p
JOIN catalog_real_product_names m ON m.old_slug = p.slug
WHERE wi.product_id = p.id;

UPDATE products p
SET name = m.new_name,
    slug = m.new_slug,
    brand = m.new_brand,
    short_description = m.short_description,
    description = '<p>' || m.short_description || '. San pham chinh hang, bao hanh ro rang, phu hop catalog B2C.</p>',
    tags = ARRAY[lower(m.new_brand), lower(p.category_name), 'real-product'],
    specifications = CASE
      WHEN p.category_name IN ('Tai nghe', 'Sac cap', 'Op lung') THEN
        jsonb_build_object('Thuong hieu', m.new_brand, 'Dong san pham', p.category_name, 'Tinh trang', 'Moi')
      ELSE
        p.specifications || jsonb_build_object('Thuong hieu', m.new_brand, 'Model', m.new_name)
    END,
    updated_at = NOW()
FROM catalog_real_product_names m
WHERE p.slug = m.old_slug;
