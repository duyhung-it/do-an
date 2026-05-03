// ============================================================
// Kiểu dữ liệu — CELLPHONES Store (B2C)
// ============================================================

// --- Phân trang & Sắp xếp ---
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Danh mục ---
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  productCount: number;
  children?: Category[];
  imageUrl?: string;
  sortOrder?: number;
  level?: number;
  path?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Cấu hình chi tiết điện thoại ---
export interface PhoneSpecs {
  chip: string;               // Snapdragon 8 Gen 3 / Apple A18 Pro
  ram: string;                // 8GB / 12GB / 16GB
  storage: string;            // 128GB / 256GB / 512GB
  battery: string;            // 5000mAh
  camera: string;             // '200MP + 10MP + 12MP'
  frontCamera: string;        // 12MP
  screen: string;             // 6.7" Dynamic AMOLED 2X 120Hz
  os: string;                 // Android 15 / iOS 18
  connectivity: string;       // 5G, WiFi 6E, NFC, Bluetooth 5.3
  weight?: string;            // 195g
  dimensions?: string;        // 162.3 x 79.3 x 8.9 mm
  waterResistance?: string;   // IP68
  simType?: string;           // Nano SIM + eSIM
  chargingSpeed?: string;     // 45W có dây, 25W không dây
  gpu?: string;               // Adreno 750
}

// --- Lịch sử giá ---
export interface PricePoint {
  date: string;
  price: number;
}

// --- Sản phẩm ---
export type ProductStatus = 'Đang bán' | 'Hết hàng' | 'Ngừng kinh doanh' | 'Sắp ra mắt';
export type ProductCondition = 'Mới' | 'Like New' | 'Qua sử dụng';

export interface ProductVariant {
  id: string;
  name: string;             // '8GB/128GB Đen Titan'
  sku: string;
  price: number;
  originalPrice?: number;   // Giá gốc (để tính % giảm)
  stock: number;
  color?: string;
  storage?: string;
  ram?: string;
  images?: string[];
  isActive?: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  brand: string;                  // Apple, Samsung, Xiaomi...
  images: string[];
  price: number;
  originalPrice?: number;         // Giá gốc trước khuyến mãi
  discountPercent?: number;       // % giảm giá
  status: ProductStatus;
  condition: ProductCondition;
  rating: number;
  reviewCount: number;
  soldCount?: number;
  viewCount?: number;
  variants: ProductVariant[];
  tags: string[];
  specifications: Record<string, string>;  // Hiển thị chung
  phoneSpecs?: PhoneSpecs;                 // Cho sản phẩm điện thoại
  warranty: number;               // Số tháng bảo hành
  color?: string;                 // Màu sắc chính
  compatibleWith?: string[];      // IDs sản phẩm tương thích (phụ kiện)
  compatibleAccessories?: string[]; // IDs phụ kiện gợi ý
  priceHistory?: PricePoint[];    // Lịch sử giá
  isNew?: boolean;                // Sản phẩm mới ra
  isFeatured?: boolean;           // Nổi bật
  isHot?: boolean;                // Đang hot
  createdAt: string;
  updatedAt: string;
}

// --- Đơn hàng ---
export type OrderStatus =
  | 'Chờ xác nhận'
  | 'Đã xác nhận'
  | 'Đang giao hàng'
  | 'Đã giao'
  | 'Đã huỷ'
  | 'Hoàn trả';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  totalPrice: number;
  variantName?: string;
  sku?: string;
  color?: string;
  discount?: number;
  note?: string;
  variantId?: string;
}

export interface TradeInInfo {
  model: string;
  storage: string;
  condition: 'Tốt' | 'Khá' | 'Trung bình' | 'Kém';
  estimatedValue: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  shippingAddressDetail?: ShippingAddress;
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản' | 'Thẻ tín dụng/ghi nợ' | 'Ví điện tử' | 'COD';
  paymentStatus: 'Chưa thanh toán' | 'Đã thanh toán' | 'Hoàn tiền';
  notes: string;
  promotionCode?: string;
  promotionId?: string;
  discountAmount?: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  tradeIn?: TradeInInfo;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string;
  changedByName: string;
  note?: string;
  createdAt: string;
}

// --- Người dùng ---
export type UserRole = 'Khách hàng' | 'Quản trị viên' | 'Nhà cung cấp';
export type UserStatus = 'Hoạt động' | 'Bị khoá' | 'Chờ xác minh';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  loyaltyPoints?: number;
  totalOrders?: number;
  totalSpent?: number;
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Giỏ hàng ---
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  totalPrice: number;
  variantName?: string;
  variantId?: string;
  color?: string;
  storage?: string;
  addedAt?: string;
  note?: string;
}

// --- Đánh giá ---
export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'Hiển thị' | 'Ẩn' | 'Chờ duyệt';
  createdAt: string;
  orderId?: string;
  orderNumber?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount: number;
  images: string[];
  tags: string[];
  sellerReply?: string;
  sellerReplyAt?: string;
}

export type ReviewTag = 'Chất lượng' | 'Giao hàng' | 'Đóng gói' | 'Giá cả' | 'Dịch vụ';

// --- Thông báo ---
export type NotificationType = 'order' | 'product' | 'system' | 'promotion' | 'warranty' | 'price_drop' | 'review';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationCategory = 'giao_dich' | 'he_thong' | 'tuong_tac' | 'canh_bao';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  isActionable: boolean;
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationPreference {
  id?: string;
  userId?: string;
  type: NotificationType;
  label: string;
  enabled: boolean;
  channel?: 'email' | 'push' | 'sms' | 'inApp';
  createdAt?: string;
  updatedAt?: string;
}

// --- Breadcrumb ---
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// --- Thực thống Dashboard Admin ---
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; brand: string; sales: number; revenue: number }[];
  topCategories: { name: string; count: number; revenue: number }[];
  lowStockProducts: { id: string; name: string; stock: number }[];
  pendingOrders: number;
  todayRevenue: number;
  todayOrders: number;
}

// --- Customer Dashboard ---
export interface CustomerDashboardStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  pendingOrders: number;
  completedOrders: number;
  warrantyItems: number;
}

// --- Cấu hình hệ thống ---
export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  currency: string;
  taxRate: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  defaultPageSize: number;
  hotline: string;
  address: string;
  workingHours: string;
}

// --- View mode ---
export type ViewMode = 'table' | 'grid' | 'list';

// --- Column config ---
export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  editable?: boolean;
  type?: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  width?: string;
}

// --- Filter config ---
export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiSelect' | 'range' | 'date';
  options?: { label: string; value: string }[];
}

export interface ActiveFilter {
  key: string;
  value: string | string[] | [number, number];
}

// --- Xác thực ---
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  status?: UserStatus;
  loyaltyPoints?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role?: 'Khách hàng';
  address?: string;
}

// --- Khuyến mãi ---
export type DiscountType = 'Phần trăm' | 'Số tiền' | 'Mua X tặng Y' | 'Miễn phí vận chuyển';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  applicableProducts: string[];
  applicableCategories: string[];
  applicableBrands: string[];
  isActive: boolean;
  createdAt: string;
}

// --- Combo sản phẩm ---
export interface ComboProduct {
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  comboPrice: number;
  quantity: number;
}

export interface ProductCombo {
  id: string;
  name: string;
  description: string;
  products: ComboProduct[];
  totalOriginalPrice: number;
  comboPrice: number;
  savings: number;
  savingsPercent: number;
  isActive: boolean;
  image?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// --- Bảo hành ---
export type WarrantyStatus = 'Còn bảo hành' | 'Hết bảo hành' | 'Đang xử lý' | 'Đã từ chối';

export interface WarrantyItem {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  imei?: string;
  serialNumber?: string;
  purchaseDate: string;
  warrantyExpiry: string;
  warrantyMonths: number;
  status: WarrantyStatus;
  notes?: string;
  createdAt: string;
}

// --- Trade-in (Thu cũ đổi mới) ---
export type TradeInCondition = 'Tốt' | 'Khá' | 'Trung bình' | 'Kém';
export type TradeInStatus = 'Chờ định giá' | 'Đã định giá' | 'Chấp nhận' | 'Từ chối' | 'Đã hoàn thành';

export interface TradeInRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  brand: string;
  model: string;
  storage: string;
  condition: TradeInCondition;
  estimatedValue: number;
  finalValue?: number;
  status: TradeInStatus;
  images?: string[];
  note?: string;
  targetProductId?: string;   // Muốn đổi sang máy nào
  targetProductName?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Blog bài viết ---
export type BlogCategory = 'Review' | 'So sánh' | 'Tin tức' | 'Mẹo sử dụng';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  viewCount: number;
  isPublished: boolean;
  relatedProducts?: string[];  // Product IDs đề cập
  metaTitle?: string;
  metaDescription?: string;
}

// --- Địa chỉ giao hàng ---
export interface ShippingAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  isDefault: boolean;
  notes?: string;
  postalCode?: string;
  type?: 'Nhà riêng' | 'Văn phòng' | 'Khác';
}

// --- Wishlist ---
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  brand: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  stock: number;
  addedAt: string;
  priceAlert?: number;         // Theo dõi giá - thông báo khi xuống dưới mức này
}

// --- Kiểm tra IMEI ---
export interface IMEICheckResult {
  imei: string;
  brand: string;
  model: string;
  isLocked: boolean;          // Máy lock hay unlock
  lockType?: string;          // VD: 'Verizon', 'AT&T'
  warrantyStatus: string;
  warrantyExpiry?: string;
  purchaseCountry?: string;
  isBlacklisted: boolean;     // Máy báo mất/trộm
  activationStatus: string;
  checkedAt: string;
}

// --- Cửa hàng (Chi nhánh) ---
export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  workingHours: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
  mapUrl?: string;
}

// --- Nhật ký hoạt động ---
export type ActivityAction =
  | 'Tạo' | 'Sửa' | 'Xoá' | 'Duyệt' | 'Từ chối'
  | 'Đăng nhập' | 'Đăng xuất' | 'Xuất dữ liệu'
  | 'Nhập dữ liệu' | 'Đổi mật khẩu' | 'Cập nhật quyền';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  entity: string;
  entityId: string;
  entityName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// --- Báo cáo ---
export interface ReportFilter {
  dateRange: [string, string];
  groupBy: 'day' | 'week' | 'month' | 'quarter';
  categoryId?: string;
  brandId?: string;
}

export interface RevenueReport {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  growth: number;
}

export interface ProductReport {
  productId: string;
  name: string;
  brand: string;
  unitsSold: number;
  revenue: number;
  returnRate: number;
  avgRating: number;
}

export interface CustomerReport {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
}

// --- Trả hàng ---
export type ReturnStatus = 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đang xử lý' | 'Đã hoàn tiền' | 'Đã đóng';
export type ReturnReason = 'Lỗi sản phẩm' | 'Không đúng mô tả' | 'Giao nhầm' | 'Hư hỏng khi vận chuyển' | 'Đổi ý' | 'Khác';

export interface ReturnItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  reason: ReturnReason;
  note: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: ReturnItem[];
  reason: ReturnReason;
  status: ReturnStatus;
  refundAmount: number;
  refundMethod?: string;
  images?: string[];
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Kho hàng ---
export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  sku: string;
  variantName?: string;
  currentStock: number;
  minStock: number;           // Cảnh báo hết hàng khi <= minStock
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  status: 'Đủ hàng' | 'Sắp hết' | 'Hết hàng';
  lastUpdated: string;
  imeis?: string[];           // Danh sách IMEI (cho điện thoại)
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  type: 'Nhập kho' | 'Xuất kho' | 'Điều chỉnh' | 'Trả hàng';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  orderId?: string;
  performedBy: string;
  createdAt: string;
}

// --- SEO Config ---
export interface SEOConfig {
  siteTitle: string;
  siteDescription: string;
  metaKeywords: string;
  ogImage: string;
  robots: string;
}

// --- Email Template ---
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

// --- Banner ---
export interface BannerConfig {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}