// ============================================================
// Mock Data — CELLPHONES Store
// ============================================================
import type { Category, Product, Order, User, Review, Promotion, BlogPost, TradeInRequest, WishlistItem, CartItem, WarrantyItem, StoreLocation, ProductCombo } from '../types';

// === IMAGES ===
export const IMG = {
  iphone16pm: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
  samsung_s25: 'https://images.unsplash.com/photo-1610945264803-c22b62831622?w=600',
  xiaomi15: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600',
  oppo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
  accessory: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
  smartwatch: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600',
  charger: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',
  case: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600',
  banner1: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200',
  banner2: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
};

// === CATEGORIES ===
export const mockCategories: Category[] = [
  { id: 'cat-01', name: 'Điện thoại', parentId: null, slug: 'dien-thoai', description: 'Điện thoại thông minh các hãng', icon: 'Smartphone', isActive: true, productCount: 120, imageUrl: IMG.iphone16pm, sortOrder: 1, level: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-02', name: 'Phụ kiện', parentId: null, slug: 'phu-kien', description: 'Ốp lưng, kính cường lực, sạc...', icon: 'Package', isActive: true, productCount: 85, imageUrl: IMG.case, sortOrder: 2, level: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-03', name: 'Tai nghe', parentId: null, slug: 'tai-nghe', description: 'Tai nghe có dây và không dây', icon: 'Headphones', isActive: true, productCount: 45, imageUrl: IMG.earbuds, sortOrder: 3, level: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-04', name: 'Đồng hồ thông minh', parentId: null, slug: 'dong-ho-thong-minh', description: 'Smartwatch & fitness band', icon: 'Watch', isActive: true, productCount: 30, imageUrl: IMG.smartwatch, sortOrder: 4, level: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-05', name: 'Sạc & Pin dự phòng', parentId: null, slug: 'sac-pin-du-phong', description: 'Sạc nhanh, sạc không dây, pin dự phòng', icon: 'Battery', isActive: true, productCount: 40, imageUrl: IMG.charger, sortOrder: 5, level: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-06', name: 'Thiết bị công nghệ', parentId: null, slug: 'thiet-bi-cong-nghe', description: 'Router, loa, màn hình...', icon: 'Cpu', isActive: true, productCount: 25, imageUrl: IMG.accessory, sortOrder: 6, level: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

// === PRODUCTS ===
export const mockProducts: Product[] = [
  {
    id: 'prod-001', name: 'iPhone 16 Pro Max 256GB', slug: 'iphone-16-pro-max-256gb',
    description: 'iPhone 16 Pro Max với chip A18 Pro mạnh mẽ nhất từ trước đến nay, camera 48MP thế hệ mới, màn hình 6.9" Super Retina XDR ProMotion 120Hz. Hỗ trợ Apple Intelligence, Action Button và Camera Control.',
    shortDescription: 'Chip A18 Pro | 6.9" 120Hz | Camera 48MP | Pin 4685mAh',
    categoryId: 'cat-01', categoryName: 'Điện thoại', brand: 'Apple',
    images: [IMG.iphone16pm, IMG.banner1, IMG.banner2],
    price: 34990000, originalPrice: 37990000, discountPercent: 8,
    status: 'Đang bán', condition: 'Mới', rating: 4.9, reviewCount: 1250, soldCount: 3200, viewCount: 15000,
    variants: [
      { id: 'v-001a', name: '256GB Titan Đen', sku: 'IP16PM-256-BK', price: 34990000, originalPrice: 37990000, stock: 15, color: 'Titan Đen', storage: '256GB', isActive: true },
      { id: 'v-001b', name: '512GB Titan Đen', sku: 'IP16PM-512-BK', price: 39990000, originalPrice: 43990000, stock: 8, color: 'Titan Đen', storage: '512GB', isActive: true },
      { id: 'v-001c', name: '256GB Titan Trắng', sku: 'IP16PM-256-WH', price: 34990000, originalPrice: 37990000, stock: 12, color: 'Titan Trắng', storage: '256GB', isActive: true },
      { id: 'v-001d', name: '1TB Titan Sa mạc', sku: 'IP16PM-1T-DS', price: 52990000, originalPrice: 56990000, stock: 3, color: 'Titan Sa mạc', storage: '1TB', isActive: true },
    ],
    tags: ['iPhone', 'Apple', 'Pro Max', 'Flagship', 'AI'],
    specifications: { 'Chip': 'Apple A18 Pro', 'RAM': '8GB', 'Bộ nhớ': '256GB', 'Camera sau': '48MP + 48MP + 12MP', 'Camera trước': '12MP', 'Màn hình': '6.9" Super Retina XDR 120Hz', 'Pin': '4685mAh', 'Hệ điều hành': 'iOS 18', 'Kết nối': '5G, WiFi 7, Bluetooth 5.3' },
    phoneSpecs: { chip: 'Apple A18 Pro', ram: '8GB', storage: '256GB', battery: '4685mAh', camera: '48MP + 48MP + 12MP', frontCamera: '12MP', screen: '6.9" Super Retina XDR 120Hz', os: 'iOS 18', connectivity: '5G, WiFi 7, NFC, Bluetooth 5.3', weight: '227g', dimensions: '163 x 77.6 x 8.25mm', waterResistance: 'IP68', simType: 'Nano SIM + eSIM', chargingSpeed: '27W có dây, 25W MagSafe' },
    warranty: 12, color: 'Titan Đen', isNew: true, isFeatured: true, isHot: true,
    compatibleAccessories: ['prod-007', 'prod-009', 'prod-010'],
    priceHistory: [{ date: '2024-10-01', price: 37990000 }, { date: '2024-11-01', price: 36990000 }, { date: '2025-01-01', price: 34990000 }],
    cameraShots: [
      { condition: 'Ban ngày', label: 'Ngoài trời | Góc rộng', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
      { condition: 'Ban đêm', label: 'Chụp đêm | Night Mode', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600' },
      { condition: 'Chân dung', label: 'Portrait | Bokeh AI', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600' },
      { condition: 'Góc siêu rộng', label: 'Ultra-wide | 0.5× lens', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600' },
    ],
    createdAt: '2024-10-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'prod-002', name: 'Samsung Galaxy S25 Ultra 256GB', slug: 'samsung-galaxy-s25-ultra-256gb',
    description: 'Samsung Galaxy S25 Ultra với Snapdragon 8 Elite, camera 200MP hàng đầu thị trường, bút S Pen tích hợp AI, màn hình 6.9" Dynamic AMOLED 2X 120Hz chống lóa siêu đỉnh.',
    shortDescription: 'Snapdragon 8 Elite | 6.9" 120Hz | 200MP | S Pen tích hợp',
    categoryId: 'cat-01', categoryName: 'Điện thoại', brand: 'Samsung',
    images: [IMG.samsung_s25, IMG.banner2],
    price: 31990000, originalPrice: 35990000, discountPercent: 11,
    status: 'Đang bán', condition: 'Mới', rating: 4.8, reviewCount: 986, soldCount: 2100, viewCount: 12000,
    variants: [
      { id: 'v-002a', name: '12GB/256GB Titan Đen', sku: 'S25U-256-BK', price: 31990000, originalPrice: 35990000, stock: 20, color: 'Titan Đen', storage: '256GB', ram: '12GB', isActive: true },
      { id: 'v-002b', name: '12GB/512GB Titan Bạc', sku: 'S25U-512-TI', price: 36990000, originalPrice: 40990000, stock: 10, color: 'Titan Bạc', storage: '512GB', ram: '12GB', isActive: true },
    ],
    tags: ['Samsung', 'Galaxy', 'Ultra', 'S Pen', 'Flagship'],
    specifications: { 'Chip': 'Snapdragon 8 Elite', 'RAM': '12GB', 'Bộ nhớ': '256GB', 'Camera sau': '200MP + 50MP + 10MP + 10MP', 'Camera trước': '12MP', 'Màn hình': '6.9" Dynamic AMOLED 2X 120Hz', 'Pin': '5000mAh', 'Sạc': '45W có dây', 'Hệ điều hành': 'Android 15 (One UI 7)' },
    phoneSpecs: { chip: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', battery: '5000mAh', camera: '200MP + 50MP + 10MP + 10MP', frontCamera: '12MP', screen: '6.9" Dynamic AMOLED 2X 120Hz', os: 'Android 15', connectivity: '5G, WiFi 7, NFC, Bluetooth 5.4', weight: '218g', waterResistance: 'IP68', chargingSpeed: '45W có dây, 15W không dây' },
    warranty: 12, color: 'Titan Đen', isNew: true, isFeatured: true, isHot: true,
    compatibleAccessories: ['prod-008', 'prod-009'],
    priceHistory: [{ date: '2025-01-01', price: 35990000 }, { date: '2025-02-01', price: 33990000 }, { date: '2025-03-01', price: 31990000 }],
    cameraShots: [
      { condition: 'Ban ngày', label: 'Ngoài trời | 200MP zoom', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600' },
      { condition: 'Ban đêm', label: 'Chụp đêm | Nightography', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600' },
      { condition: 'Chân dung', label: 'Portrait | AI Studio', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' },
      { condition: 'Góc siêu rộng', label: 'Ultra-wide | 12MP', image: 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=600' },
    ],
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'prod-003', name: 'Xiaomi 15 Ultra 16GB/512GB', slug: 'xiaomi-15-ultra-16gb-512gb',
    description: 'Xiaomi 15 Ultra với hệ thống camera Leica 4 ống kính hàng đầu, chip Snapdragon 8 Elite, sạc nhanh 90W, màn hình LTPO AMOLED 6.73".',
    shortDescription: 'Snapdragon 8 Elite | Camera Leica 50MP | Sạc 90W | 6.73" LTPO',
    categoryId: 'cat-01', categoryName: 'Điện thoại', brand: 'Xiaomi',
    images: [IMG.xiaomi15],
    price: 28990000, originalPrice: 31990000, discountPercent: 9,
    status: 'Đang bán', condition: 'Mới', rating: 4.7, reviewCount: 432, soldCount: 890, viewCount: 7500,
    variants: [
      { id: 'v-003a', name: '16GB/512GB Đen', sku: 'XM15U-512-BK', price: 28990000, stock: 18, color: 'Đen', storage: '512GB', ram: '16GB', isActive: true },
    ],
    tags: ['Xiaomi', 'Ultra', 'Leica', 'Camera', 'Flagship'],
    specifications: { 'Chip': 'Snapdragon 8 Elite', 'RAM': '16GB', 'Bộ nhớ': '512GB', 'Camera sau': '50MP Leica + 200MP + 50MP + 50MP', 'Camera trước': '32MP', 'Màn hình': '6.73" LTPO AMOLED 1-120Hz', 'Pin': '5500mAh', 'Sạc': '90W có dây, 80W không dây' },
    phoneSpecs: { chip: 'Snapdragon 8 Elite', ram: '16GB', storage: '512GB', battery: '5500mAh', camera: '50MP + 200MP + 50MP + 50MP', frontCamera: '32MP', screen: '6.73" LTPO AMOLED 120Hz', os: 'Android 15 (HyperOS 2)', connectivity: '5G, WiFi 7, Bluetooth 5.4', waterResistance: 'IP68', chargingSpeed: '90W có dây, 80W không dây' },
    warranty: 18, color: 'Đen', isFeatured: true,
    compatibleAccessories: ['prod-009'],
    cameraShots: [
      { condition: 'Ban ngày', label: 'Ngoài trời | Leica 50MP', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
      { condition: 'Ban đêm', label: 'Chụp đêm | HyperOS Night', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600' },
      { condition: 'Chân dung', label: 'Portrait | Leica Vibrant', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600' },
    ],
    createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'prod-004', name: 'OPPO Find X8 Pro 12GB/256GB', slug: 'oppo-find-x8-pro-12gb-256gb',
    description: 'OPPO Find X8 Pro với camera Hasselblad 50MP, chip Dimensity 9400, màn hình AMOLED 6.78" tần số quét 120Hz, pin 5910mAh sạc siêu nhanh 80W.',
    shortDescription: 'Dimensity 9400 | Camera Hasselblad | 80W SuperVOOC | Pin 5910mAh',
    categoryId: 'cat-01', categoryName: 'Điện thoại', brand: 'OPPO',
    images: [IMG.oppo],
    price: 22990000, originalPrice: 25990000, discountPercent: 12,
    status: 'Đang bán', condition: 'Mới', rating: 4.6, reviewCount: 287, soldCount: 650, viewCount: 5200,
    variants: [
      { id: 'v-004a', name: '12GB/256GB Xanh lam', sku: 'OFX8P-256-BL', price: 22990000, stock: 25, color: 'Xanh lam', storage: '256GB', ram: '12GB', isActive: true },
      { id: 'v-004b', name: '16GB/512GB Đen', sku: 'OFX8P-512-BK', price: 26990000, stock: 10, color: 'Đen', storage: '512GB', ram: '16GB', isActive: true },
    ],
    tags: ['OPPO', 'Find X', 'Hasselblad', 'Flagship'],
    specifications: { 'Chip': 'Dimensity 9400', 'RAM': '12GB', 'Bộ nhớ': '256GB', 'Camera sau': '50MP + 50MP + 50MP', 'Màn hình': '6.78" AMOLED 120Hz', 'Pin': '5910mAh', 'Sạc': '80W SuperVOOC' },
    phoneSpecs: { chip: 'Dimensity 9400', ram: '12GB', storage: '256GB', battery: '5910mAh', camera: '50MP + 50MP + 50MP Hasselblad', frontCamera: '32MP', screen: '6.78" AMOLED 120Hz', os: 'Android 15 (ColorOS 15)', connectivity: '5G, WiFi 7, Bluetooth 5.4', waterResistance: 'IP69', chargingSpeed: '80W SuperVOOC, 50W không dây' },
    warranty: 12, color: 'Xanh lam', isFeatured: true,
    compatibleAccessories: ['prod-009'],
    createdAt: '2024-12-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'prod-005', name: 'Samsung Galaxy A56 5G 8GB/128GB', slug: 'samsung-galaxy-a56-5g',
    description: 'Samsung Galaxy A56 5G với thiết kế premium, chip Exynos 1580, camera 50MP OIS, pin 5000mAh sạc 45W. Lựa chọn tầm trung tốt nhất 2025.',
    shortDescription: 'Exynos 1580 | Camera 50MP OIS | 5G | Pin 5000mAh',
    categoryId: 'cat-01', categoryName: 'Điện thoại', brand: 'Samsung',
    images: [IMG.samsung_s25],
    price: 10490000, originalPrice: 11990000, discountPercent: 13,
    status: 'Đang bán', condition: 'Mới', rating: 4.5, reviewCount: 523, soldCount: 1800, viewCount: 9800,
    variants: [
      { id: 'v-005a', name: '8GB/128GB Xanh lá', sku: 'A56-128-GR', price: 10490000, stock: 50, color: 'Xanh lá', storage: '128GB', ram: '8GB', isActive: true },
      { id: 'v-005b', name: '8GB/256GB Tím', sku: 'A56-256-PU', price: 11990000, stock: 35, color: 'Tím', storage: '256GB', ram: '8GB', isActive: true },
    ],
    tags: ['Samsung', 'Galaxy A', 'Tầm trung', '5G'],
    specifications: { 'Chip': 'Exynos 1580', 'RAM': '8GB', 'Bộ nhớ': '128GB', 'Camera sau': '50MP OIS + 12MP + 5MP', 'Camera trước': '12MP', 'Màn hình': '6.7" Super AMOLED 120Hz', 'Pin': '5000mAh', 'Sạc': '45W' },
    phoneSpecs: { chip: 'Exynos 1580', ram: '8GB', storage: '128GB', battery: '5000mAh', camera: '50MP OIS + 12MP + 5MP', frontCamera: '12MP', screen: '6.7" Super AMOLED 120Hz', os: 'Android 15 (One UI 7)', connectivity: '5G, WiFi 6, Bluetooth 5.3', waterResistance: 'IP67', chargingSpeed: '45W' },
    warranty: 12, color: 'Xanh lá', isFeatured: true,
    compatibleAccessories: ['prod-009'],
    createdAt: '2025-02-10T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'prod-006', name: 'Xiaomi Redmi Note 14 Pro 8GB/256GB', slug: 'xiaomi-redmi-note-14-pro',
    description: 'Redmi Note 14 Pro với camera 200MP, chip Snapdragon 7s Gen 3, màn hình AMOLED 6.67" 120Hz, pin 5110mAh sạc nhanh 45W.',
    shortDescription: 'Camera 200MP | Snapdragon 7s Gen 3 | 120Hz AMOLED | 45W',
    categoryId: 'cat-01', categoryName: 'Điện thoại', brand: 'Xiaomi',
    images: [IMG.xiaomi15],
    price: 7490000, originalPrice: 8490000, discountPercent: 12,
    status: 'Đang bán', condition: 'Mới', rating: 4.4, reviewCount: 712, soldCount: 2500, viewCount: 14000,
    variants: [
      { id: 'v-006a', name: '8GB/256GB Đen', sku: 'RN14P-256-BK', price: 7490000, stock: 60, color: 'Đen', storage: '256GB', ram: '8GB', isActive: true },
    ],
    tags: ['Xiaomi', 'Redmi Note', 'Camera 200MP', 'Tầm trung'],
    specifications: { 'Chip': 'Snapdragon 7s Gen 3', 'RAM': '8GB', 'Bộ nhớ': '256GB', 'Camera sau': '200MP + 8MP + 2MP', 'Camera trước': '20MP', 'Màn hình': '6.67" AMOLED 120Hz', 'Pin': '5110mAh', 'Sạc': '45W' },
    phoneSpecs: { chip: 'Snapdragon 7s Gen 3', ram: '8GB', storage: '256GB', battery: '5110mAh', camera: '200MP + 8MP + 2MP', frontCamera: '20MP', screen: '6.67" AMOLED 120Hz', os: 'Android 15 (HyperOS 2)', connectivity: '4G, WiFi 6, Bluetooth 5.3', chargingSpeed: '45W' },
    warranty: 18, color: 'Đen',
    createdAt: '2024-11-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'prod-007', name: 'AirPods Pro 3 (USB-C)', slug: 'airpods-pro-3-usb-c',
    description: 'AirPods Pro 3 với chip H2, chống ồn ANC chủ động thế hệ 3, âm thanh Spatial Audio, pin 6h nghe nhạc + 30h với hộp sạc, kháng nước IPX4.',
    shortDescription: 'Chip H2 | ANC thế hệ 3 | Spatial Audio | Pin 30h | IPX4',
    categoryId: 'cat-03', categoryName: 'Tai nghe', brand: 'Apple',
    images: [IMG.earbuds],
    price: 6490000, originalPrice: 7190000, discountPercent: 10,
    status: 'Đang bán', condition: 'Mới', rating: 4.8, reviewCount: 345, soldCount: 1200,
    variants: [{ id: 'v-007a', name: 'Trắng', sku: 'APP3-WHT', price: 6490000, stock: 40, color: 'Trắng', isActive: true }],
    tags: ['Apple', 'AirPods', 'ANC', 'Tai nghe không dây'],
    specifications: { 'Chip': 'Apple H2', 'Chống ồn': 'ANC chủ động thế hệ 3', 'Pin tai nghe': '6 giờ', 'Pin với hộp': '30 giờ', 'Kết nối': 'Bluetooth 5.3', 'Kháng nước': 'IPX4', 'Sạc': 'USB-C / MagSafe' },
    phoneSpecs: undefined, warranty: 12, color: 'Trắng', isFeatured: true,
    createdAt: '2024-10-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'prod-008', name: 'Samsung Galaxy Watch Ultra 47mm', slug: 'samsung-galaxy-watch-ultra-47mm',
    description: 'Samsung Galaxy Watch Ultra với khung titanium cao cấp, màn hình AMOLED sáng nhất, GPS đa băng tần, theo dõi sức khỏe nâng cao, kháng nước 10ATM.',
    shortDescription: 'Titanium | AMOLED sáng nhất | GPS đa băng | 10ATM',
    categoryId: 'cat-04', categoryName: 'Đồng hồ thông minh', brand: 'Samsung',
    images: [IMG.smartwatch],
    price: 11990000, originalPrice: 13990000, discountPercent: 14,
    status: 'Đang bán', condition: 'Mới', rating: 4.7, reviewCount: 189, soldCount: 420,
    variants: [
      { id: 'v-008a', name: '47mm Trắng', sku: 'GWU-WHT', price: 11990000, stock: 20, color: 'Trắng', isActive: true },
      { id: 'v-008b', name: '47mm Đen', sku: 'GWU-BLK', price: 11990000, stock: 15, color: 'Đen', isActive: true },
    ],
    tags: ['Samsung', 'Galaxy Watch', 'Smartwatch', 'Theo dõi sức khỏe'],
    specifications: { 'Màn hình': '1.47" AMOLED', 'Khung': 'Titanium', 'Kháng nước': '10ATM / MIL-STD-810H', 'GPS': 'Đa băng tần', 'Pin': 'Đến 60 giờ', 'Kết nối': 'Bluetooth 5.3, WiFi, NFC', 'Hệ điều hành': 'Wear OS 5' },
    phoneSpecs: undefined, warranty: 12, color: 'Trắng',
    createdAt: '2024-07-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'prod-009', name: 'Sạc nhanh Anker 65W GaN USB-C', slug: 'sac-nhanh-anker-65w-gan-usb-c',
    description: 'Sạc Anker 735 GaN Prime 65W với công nghệ GaN thế hệ 3, tích hợp 2 cổng USB-C và 1 USB-A, tương thích với MacBook, iPhone, Android. Nhỏ gọn hơn sạc 20W Apple.',
    shortDescription: '65W GaN | 2x USB-C + 1x USB-A | Tương thích đa thiết bị | Nhỏ gọn',
    categoryId: 'cat-05', categoryName: 'Sạc & Pin dự phòng', brand: 'Anker',
    images: [IMG.charger],
    price: 890000, originalPrice: 1090000, discountPercent: 18,
    status: 'Đang bán', condition: 'Mới', rating: 4.8, reviewCount: 621, soldCount: 3500,
    variants: [{ id: 'v-009a', name: 'Đen', sku: 'AK-65W-BK', price: 890000, stock: 100, color: 'Đen', isActive: true }],
    tags: ['Anker', 'Sạc nhanh', 'GaN', '65W'],
    specifications: { 'Công suất': '65W', 'Cổng': '2x USB-C + 1x USB-A', 'Công nghệ': 'GaN III', 'Tương thích': 'PD 3.0, PPS, QC', 'Kích thước': '65 x 34 x 34mm', 'Trọng lượng': '109g' },
    phoneSpecs: undefined, warranty: 18, color: 'Đen', isFeatured: true,
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'prod-010', name: 'Ốp lưng iPhone 16 Pro Max Spigen Ultra Hybrid', slug: 'op-lung-iphone-16-pro-max-spigen-ultra-hybrid',
    description: 'Ốp lưng Spigen Ultra Hybrid cho iPhone 16 Pro Max, chất liệu PC trong suốt + viền TPU, bảo vệ tốt khỏi va đập, hiển thị màu máy gốc.',
    shortDescription: 'PC trong suốt | Viền TPU chống sốc | Tương thích MagSafe',
    categoryId: 'cat-02', categoryName: 'Phụ kiện', brand: 'Spigen',
    images: [IMG.case],
    price: 390000, originalPrice: 490000, discountPercent: 20,
    status: 'Đang bán', condition: 'Mới', rating: 4.7, reviewCount: 892, soldCount: 5600,
    variants: [
      { id: 'v-010a', name: 'Trong suốt', sku: 'SP-IP16PM-CL', price: 390000, stock: 200, color: 'Trong suốt', isActive: true },
      { id: 'v-010b', name: 'Đen mờ', sku: 'SP-IP16PM-MT', price: 390000, stock: 150, color: 'Đen mờ', isActive: true },
    ],
    tags: ['Spigen', 'Ốp lưng', 'iPhone 16 Pro Max', 'Phụ kiện'],
    specifications: { 'Chất liệu': 'PC + TPU', 'Tương thích': 'iPhone 16 Pro Max', 'MagSafe': 'Có', 'Màu sắc': 'Trong suốt / Đen mờ' },
    phoneSpecs: undefined, warranty: 6, color: 'Trong suốt',
    compatibleWith: ['prod-001'],
    createdAt: '2024-10-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
];

// === USERS (mock) ===
export const mockUsers: User[] = [
  { id: 'user-001', fullName: 'Nguyễn Văn An', email: 'admin@cellphones.vn', phone: '0901234567', role: 'Quản trị viên', status: 'Hoạt động', avatarUrl: IMG.avatar, loyaltyPoints: 0, totalOrders: 0, totalSpent: 0, emailVerified: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'user-002', fullName: 'Trần Thị Minh', email: 'khachhang@gmail.com', phone: '0912345678', role: 'Khách hàng', status: 'Hoạt động', avatarUrl: IMG.avatar, loyaltyPoints: 2500, totalOrders: 8, totalSpent: 85000000, emailVerified: true, createdAt: '2024-03-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 'user-003', fullName: 'Lê Hoàng Đức', email: 'lehoanhduc@gmail.com', phone: '0923456789', role: 'Khách hàng', status: 'Hoạt động', avatarUrl: IMG.avatar, loyaltyPoints: 1200, totalOrders: 4, totalSpent: 42000000, emailVerified: true, createdAt: '2024-05-20T00:00:00Z', updatedAt: '2025-02-10T00:00:00Z' },
  { id: 'user-004', fullName: 'Phương Nam Tech', email: 'ncc@cellphones.vn', phone: '0934567890', role: 'Nhà cung cấp', status: 'Hoạt động', avatarUrl: IMG.avatar, loyaltyPoints: 0, totalOrders: 0, totalSpent: 0, emailVerified: true, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

// === ORDERS ===
export const mockOrders: Order[] = [
  {
    id: 'ord-001', orderNumber: 'CP2025031501', customerId: 'user-002',
    customerName: 'Trần Thị Minh', customerEmail: 'khachhang@gmail.com', customerPhone: '0912345678',
    items: [{ id: 'oi-001', productId: 'prod-001', productName: 'iPhone 16 Pro Max 256GB', productImage: IMG.iphone16pm, brand: 'Apple', quantity: 1, unitPrice: 34990000, totalPrice: 34990000, variantName: '256GB Titan Đen', sku: 'IP16PM-256-BK' }],
    subtotal: 34990000, shippingFee: 0, discount: 1500000, totalAmount: 33490000,
    status: 'Đã giao', shippingAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    paymentMethod: 'Chuyển khoản', paymentStatus: 'Đã thanh toán',
    notes: '', promotionCode: 'NEWPHONE', discountAmount: 1500000,
    expectedDeliveryDate: '2025-03-17T00:00:00Z', actualDeliveryDate: '2025-03-16T00:00:00Z',
    createdAt: '2025-03-15T10:30:00Z', updatedAt: '2025-03-16T15:00:00Z',
  },
  {
    id: 'ord-002', orderNumber: 'CP2025031801', customerId: 'user-003',
    customerName: 'Lê Hoàng Đức', customerEmail: 'lehoanhduc@gmail.com', customerPhone: '0923456789',
    items: [{ id: 'oi-002', productId: 'prod-002', productName: 'Samsung Galaxy S25 Ultra 256GB', productImage: IMG.samsung_s25, brand: 'Samsung', quantity: 1, unitPrice: 31990000, totalPrice: 31990000, variantName: '12GB/256GB Titan Đen', sku: 'S25U-256-BK' }],
    subtotal: 31990000, shippingFee: 0, discount: 0, totalAmount: 31990000,
    status: 'Đang giao hàng', shippingAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    paymentMethod: 'COD', paymentStatus: 'Chưa thanh toán',
    notes: 'Giao giờ hành chính',
    createdAt: '2025-03-18T09:00:00Z', updatedAt: '2025-03-19T08:00:00Z',
  },
  {
    id: 'ord-003', orderNumber: 'CP2025032001', customerId: 'user-002',
    customerName: 'Trần Thị Minh', customerEmail: 'khachhang@gmail.com', customerPhone: '0912345678',
    items: [
      { id: 'oi-003', productId: 'prod-007', productName: 'AirPods Pro 3 (USB-C)', productImage: IMG.earbuds, brand: 'Apple', quantity: 1, unitPrice: 6490000, totalPrice: 6490000, variantName: 'Trắng', sku: 'APP3-WHT' },
      { id: 'oi-004', productId: 'prod-010', productName: 'Ốp lưng iPhone 16 Pro Max Spigen', productImage: IMG.case, brand: 'Spigen', quantity: 1, unitPrice: 390000, totalPrice: 390000, variantName: 'Trong suốt', sku: 'SP-IP16PM-CL' },
    ],
    subtotal: 6880000, shippingFee: 30000, discount: 0, totalAmount: 6910000,
    status: 'Chờ xác nhận', shippingAddress: '789 Võ Văn Tần, Quận 3, TP.HCM',
    paymentMethod: 'Ví điện tử', paymentStatus: 'Đã thanh toán',
    notes: '',
    createdAt: '2025-03-20T14:30:00Z', updatedAt: '2025-03-20T14:30:00Z',
  },
];

// === REVIEWS ===
export const mockReviews: Review[] = [
  { id: 'rev-001', productId: 'prod-001', productName: 'iPhone 16 Pro Max 256GB', userId: 'user-002', userName: 'Trần Thị Minh', rating: 5, title: 'Máy quá đỉnh!', comment: 'Camera chụp đêm cực kỳ sắc nét, chip A18 Pro mạnh hơn hẳn, pin cũng cải thiện rõ rệt. Rất hài lòng!', status: 'Hiển thị', isVerifiedPurchase: true, helpfulCount: 48, images: [IMG.iphone16pm], tags: ['Chất lượng', 'Camera'], createdAt: '2025-03-16T10:00:00Z' },
  { id: 'rev-002', productId: 'prod-001', productName: 'iPhone 16 Pro Max 256GB', userId: 'user-003', userName: 'Lê Hoàng Đức', rating: 4, title: 'Tốt nhưng giá hơi cao', comment: 'Hiệu năng xuất sắc, màn hình đẹp. Camera Control khá hay. Nhưng giá cao quá so với Android cùng tầm.', status: 'Hiển thị', isVerifiedPurchase: true, helpfulCount: 21, images: [], tags: ['Chất lượng'], createdAt: '2025-03-18T14:00:00Z' },
  { id: 'rev-003', productId: 'prod-002', productName: 'Samsung Galaxy S25 Ultra 256GB', userId: 'user-002', userName: 'Trần Thị Minh', rating: 5, title: 'Camera 200MP thực sự ấn tượng', comment: 'S Pen giờ thông minh hơn nhiều, tích hợp AI rất hữu ích. Camera 200MP chi tiết cực kỳ.', status: 'Hiển thị', isVerifiedPurchase: false, helpfulCount: 35, images: [IMG.samsung_s25], tags: ['Chất lượng', 'Giá cả'], createdAt: '2025-03-10T11:00:00Z' },
];

// === PROMOTIONS ===
export const mockPromotions: Promotion[] = [
  { id: 'promo-001', code: 'NEWPHONE', name: 'Giảm 1.5 triệu điện thoại mới', description: 'Giảm 1,500,000đ cho đơn hàng điện thoại từ 15 triệu', type: 'Số tiền', value: 1500000, minOrderValue: 15000000, maxDiscount: 1500000, startDate: '2025-03-01T00:00:00Z', endDate: '2025-04-30T23:59:59Z', usageLimit: 500, usedCount: 127, applicableProducts: [], applicableCategories: ['cat-01'], applicableBrands: [], isActive: true, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'promo-002', code: 'SUMMER10', name: 'Hè rực rỡ giảm 10%', description: 'Giảm 10% tất cả sản phẩm, tối đa 2 triệu', type: 'Phần trăm', value: 10, minOrderValue: 5000000, maxDiscount: 2000000, startDate: '2025-06-01T00:00:00Z', endDate: '2025-08-31T23:59:59Z', usageLimit: 1000, usedCount: 0, applicableProducts: [], applicableCategories: [], applicableBrands: [], isActive: false, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'promo-003', code: 'FREESHIP', name: 'Miễn phí vận chuyển', description: 'Miễn phí vận chuyển cho mọi đơn hàng', type: 'Miễn phí vận chuyển', value: 0, minOrderValue: 500000, maxDiscount: 50000, startDate: '2025-01-01T00:00:00Z', endDate: '2025-12-31T23:59:59Z', usageLimit: 9999, usedCount: 1240, applicableProducts: [], applicableCategories: [], applicableBrands: [], isActive: true, createdAt: '2025-01-01T00:00:00Z' },
];

// === BLOGS ===
export const mockBlogPosts: BlogPost[] = [
  { id: 'blog-001', title: 'iPhone 16 Pro Max vs Samsung Galaxy S25 Ultra: Đâu là vua điện thoại 2025?', slug: 'iphone-16-pro-max-vs-samsung-s25-ultra', excerpt: 'Cuộc đối đầu đỉnh cao giữa hai flagship hàng đầu 2025. Chúng tôi đã test kỹ camera, hiệu năng, pin để cho bạn cái nhìn toàn diện nhất.', content: '...', coverImage: IMG.iphone16pm, category: 'So sánh', tags: ['iPhone', 'Samsung', 'Flagship', 'So sánh'], author: 'Biên tập CELLPHONES', publishedAt: '2025-03-15T08:00:00Z', viewCount: 45200, isPublished: true, relatedProducts: ['prod-001', 'prod-002'] },
  { id: 'blog-002', title: 'Top 5 điện thoại pin trâu nhất 2025 — Cả ngày không lo hết pin', slug: 'top-5-dien-thoai-pin-trau-nhat-2025', excerpt: 'Bạn cần điện thoại pin bền không lo sạc suốt ngày? Đây là 5 lựa chọn tốt nhất hiện tại từ 5 triệu đến 25 triệu đồng.', content: '...', coverImage: IMG.samsung_s25, category: 'Review', tags: ['Pin trâu', 'Top 5', '2025'], author: 'Đội Review CELLPHONES', publishedAt: '2025-03-10T09:00:00Z', viewCount: 32100, isPublished: true },
  { id: 'blog-003', title: 'Cách chụp ảnh đêm đẹp với iPhone 16 Pro Max — 10 mẹo hay', slug: 'meo-chup-anh-dem-iphone-16-pro-max', excerpt: 'Chế độ Night Mode của iPhone 16 Pro Max cực kỳ mạnh, nhưng bạn đã biết cách khai thác tối đa chưa? Xem ngay 10 mẹo chụp ảnh đêm.', content: '...', coverImage: IMG.iphone16pm, category: 'Mẹo sử dụng', tags: ['iPhone', 'Chụp ảnh', 'Mẹo'], author: 'Biên tập CELLPHONES', publishedAt: '2025-03-05T10:00:00Z', viewCount: 28500, isPublished: true, relatedProducts: ['prod-001'] },
];

// === TRADE-IN ===
export const mockTradeIns: TradeInRequest[] = [
  { id: 'ti-001', customerId: 'user-002', customerName: 'Trần Thị Minh', customerPhone: '0912345678', brand: 'Apple', model: 'iPhone 14 Pro Max', storage: '256GB', condition: 'Tốt', estimatedValue: 18500000, finalValue: 18000000, status: 'Đã định giá', targetProductId: 'prod-001', targetProductName: 'iPhone 16 Pro Max', createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-03-11T10:00:00Z' },
  { id: 'ti-002', customerId: 'user-003', customerName: 'Lê Hoàng Đức', customerPhone: '0923456789', brand: 'Samsung', model: 'Galaxy S23 Ultra', storage: '512GB', condition: 'Khá', estimatedValue: 14000000, status: 'Chờ định giá', createdAt: '2025-03-19T11:00:00Z', updatedAt: '2025-03-19T11:00:00Z' },
];

// === WARRANTY ===
export const mockWarrantyItems: WarrantyItem[] = [
  { id: 'war-001', customerId: 'user-002', customerName: 'Trần Thị Minh', orderId: 'ord-001', orderNumber: 'CP2025031501', productId: 'prod-001', productName: 'iPhone 16 Pro Max 256GB', productImage: IMG.iphone16pm, brand: 'Apple', imei: '352099001761481', purchaseDate: '2025-03-15T00:00:00Z', warrantyExpiry: '2026-03-15T00:00:00Z', warrantyMonths: 12, status: 'Còn bảo hành', createdAt: '2025-03-15T00:00:00Z' },
];

// === STORE LOCATIONS ===
export const mockStoreLocations: StoreLocation[] = [
  { id: 'store-001', name: 'CELLPHONES Nguyễn Đình Chiểu', address: '200 Nguyễn Đình Chiểu', district: 'Quận 3', city: 'TP.HCM', phone: '1800.2097', workingHours: '8:00 - 21:30', isActive: true, mapUrl: 'https://maps.google.com' },
  { id: 'store-002', name: 'CELLPHONES Hoàng Văn Thụ', address: '168 Hoàng Văn Thụ', district: 'Quận Phú Nhuận', city: 'TP.HCM', phone: '1800.2097', workingHours: '8:00 - 21:30', isActive: true, mapUrl: 'https://maps.google.com' },
  { id: 'store-003', name: 'CELLPHONES Cầu Giấy', address: '79 Cầu Giấy', district: 'Quận Cầu Giấy', city: 'Hà Nội', phone: '1800.2097', workingHours: '8:00 - 21:30', isActive: true, mapUrl: 'https://maps.google.com' },
];

// === COMBOS ===
export const mockCombos: ProductCombo[] = [
  {
    id: 'combo-001', name: 'Combo iPhone 16 Pro Max + AirPods Pro 3 + Ốp lưng Spigen', description: 'Bộ 3 sản phẩm Apple + phụ kiện cao cấp, tiết kiệm hơn mua lẻ.',
    products: [
      { productId: 'prod-001', productName: 'iPhone 16 Pro Max 256GB', productImage: IMG.iphone16pm, originalPrice: 34990000, comboPrice: 33490000, quantity: 1 },
      { productId: 'prod-007', productName: 'AirPods Pro 3', productImage: IMG.earbuds, originalPrice: 6490000, comboPrice: 5990000, quantity: 1 },
      { productId: 'prod-010', productName: 'Ốp Spigen Ultra Hybrid', productImage: IMG.case, originalPrice: 390000, comboPrice: 290000, quantity: 1 },
    ],
    totalOriginalPrice: 41870000, comboPrice: 39770000, savings: 2100000, savingsPercent: 5,
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
];

// === WISHLIST ITEMS ===
export const mockWishlistItems: WishlistItem[] = [
  { id: 'wl-001', userId: 'user-002', productId: 'prod-002', productName: 'Samsung Galaxy S25 Ultra 256GB', productImage: IMG.samsung_s25, brand: 'Samsung', categoryName: 'Điện thoại', price: 31990000, originalPrice: 35990000, stock: 20, addedAt: '2025-03-01T00:00:00Z', priceAlert: 29000000 },
];

// === CART ITEMS ===
export const mockCartItems: CartItem[] = [];

// === WISHLIST FOLDERS (B2B feature: organize wishlists into groups) ===
export const mockWishlistFolders: { id: string; userId: string; name: string; description: string; itemCount: number; createdAt: string }[] = [
  { id: 'wf-001', userId: 'user-002', name: 'Điện thoại yêu thích', description: 'Các model đang cân nhắc mua', itemCount: 1, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'wf-002', userId: 'user-002', name: 'Phụ kiện cần mua', description: 'Phụ kiện cho iPhone mới', itemCount: 0, createdAt: '2025-03-05T00:00:00Z' },
];

// === B2B MOCK DATA (for backward compatibility with legacy B2B API files) ===
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockShipments: any[] = [
  { id: 'shp-001', buyerId: 'user-002', supplierId: 's1', orderId: 'ord-001', orderNumber: 'CP2025031501', trackingCode: 'GHN12345678', carrier: 'GHN', status: 'Đã giao', estimatedDate: '2025-03-17T00:00:00Z', actualDate: '2025-03-16T00:00:00Z', createdAt: '2025-03-15T10:30:00Z' },
  { id: 'shp-002', buyerId: 'user-003', supplierId: 's2', orderId: 'ord-002', orderNumber: 'CP2025031801', trackingCode: 'GHN99998888', carrier: 'GHN', status: 'Đang vận chuyển', estimatedDate: '2025-03-20T00:00:00Z', createdAt: '2025-03-18T09:00:00Z' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockPayments: any[] = [
  { id: 'pay-001', buyerId: 'user-002', supplierId: 's1', orderId: 'ord-001', orderNumber: 'CP2025031501', amount: 33490000, status: 'Đã thanh toán', dueDate: '2025-03-22T00:00:00Z', paidDate: '2025-03-15T00:00:00Z', method: 'Chuyển khoản', createdAt: '2025-03-15T00:00:00Z' },
  { id: 'pay-002', buyerId: 'user-003', supplierId: 's2', orderId: 'ord-002', orderNumber: 'CP2025031801', amount: 31990000, status: 'Chờ thanh toán', dueDate: '2025-03-25T00:00:00Z', method: 'COD', createdAt: '2025-03-18T00:00:00Z' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockOrderTemplates: any[] = [
  { id: 'tpl-001', userId: 'user-002', name: 'Mua điện thoại hàng tháng', description: 'Template đặt hàng định kỳ', usageCount: 12, items: [], createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-002', userId: 'user-002', name: 'Phụ kiện văn phòng', description: 'Phụ kiện cần thiết', usageCount: 5, items: [], createdAt: '2025-02-01T00:00:00Z' },
];