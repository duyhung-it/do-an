// ============================================================
// API Services — CELLPHONES Store (mock)
// ============================================================
import type {
  AuthUser, LoginCredentials, RegisterData,
  Category, Product, Order, OrderStatus, User, UserStatus,
  Review, Promotion, CartItem, WishlistItem,
  WarrantyItem, TradeInRequest, BlogPost, ProductCombo,
  StoreLocation, IMEICheckResult, StockMovement,
  PaginatedResponse, PaginationParams, SortParams, ReturnRequest,
  ActivityLog, AppNotification, ShippingAddress,
} from '../types';
import {
  mockCategories, mockProducts, mockOrders, mockUsers, mockReviews,
  mockPromotions, mockCartItems, mockWishlistItems, mockWarrantyItems,
  mockTradeIns, mockBlogPosts, mockStoreLocations, mockCombos,
} from '../data/mockData';

// ---- Utilities ----
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
let cartStore: CartItem[] = [...mockCartItems];
let wishStore: WishlistItem[] = [...mockWishlistItems];
let productStore: Product[] = [...mockProducts];
let orderStore: Order[] = [...mockOrders];
let userStore: User[] = [...mockUsers];
let reviewStore: Review[] = [...mockReviews];
let tradeInStore: TradeInRequest[] = [...mockTradeIns];
let blogStore: BlogPost[] = [...mockBlogPosts];
let notifStore: AppNotification[] = [
  { id: 'n1', type: 'order', title: 'Đơn hàng đang giao', message: 'Đơn hàng CP2025031801 đang được giao đến bạn', isRead: false, createdAt: new Date().toISOString(), priority: 'high', category: 'giao_dich', isActionable: true, actionLabel: 'Theo dõi', actionUrl: '/orders/ord-002', entityType: 'order', entityId: 'ord-002', link: '/orders/ord-002' },
  { id: 'n2', type: 'promotion', title: 'Flash Sale 24h — Giảm đến 30%', message: 'Hàng trăm sản phẩm công nghệ giảm giá sốc chỉ trong hôm nay!', isRead: false, createdAt: new Date().toISOString(), priority: 'medium', category: 'tuong_tac', isActionable: true, actionLabel: 'Mua ngay', actionUrl: '/products', link: '/products' },
];
const idCounter = { v: 1000 };
const nextId = (prefix = 'id') => `${prefix}-${++idCounter.v}`;

function paginate<T>(arr: T[], params: PaginationParams): PaginatedResponse<T> {
  const { page, pageSize } = params;
  const start = (page - 1) * pageSize;
  return { data: arr.slice(start, start + pageSize), total: arr.length, page, pageSize, totalPages: Math.ceil(arr.length / pageSize) };
}

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    await delay(200);
    const raw = localStorage.getItem('cellphones_auth_user');
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; } catch { return null; }
  },
  login: async (creds: LoginCredentials): Promise<AuthUser> => {
    await delay(500);
    const found = userStore.find(u => u.email === creds.email);
    if (!found || found.status === 'Bị khoá') throw new Error('Email hoặc mật khẩu không đúng');
    const authUser: AuthUser = { id: found.id, fullName: found.fullName, email: found.email, role: found.role, avatarUrl: found.avatarUrl, phone: found.phone, status: found.status, loyaltyPoints: found.loyaltyPoints };
    localStorage.setItem('cellphones_auth_user', JSON.stringify(authUser));
    return authUser;
  },
  register: async (data: RegisterData): Promise<AuthUser> => {
    await delay(500);
    if (userStore.find(u => u.email === data.email)) throw new Error('Email đã được sử dụng');
    const newUser: User = { id: nextId('user'), fullName: data.fullName, email: data.email, phone: data.phone, role: 'Khách hàng', status: 'Hoạt động', avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`, address: data.address, loyaltyPoints: 0, totalOrders: 0, totalSpent: 0, emailVerified: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    userStore = [newUser, ...userStore];
    const authUser: AuthUser = { id: newUser.id, fullName: newUser.fullName, email: newUser.email, role: newUser.role, avatarUrl: newUser.avatarUrl, phone: newUser.phone, status: newUser.status, loyaltyPoints: 0 };
    return authUser;
  },
  logout: async () => { await delay(100); localStorage.removeItem('cellphones_auth_user'); },
};

// ============================================================
// CATEGORY API
// ============================================================
export const categoryApi = {
  getAll: async () => { await delay(200); return mockCategories; },
  getById: async (id: string) => { await delay(150); return mockCategories.find(c => c.id === id) ?? null; },
  create: async (data: Partial<Category>) => { await delay(300); const c = { ...data, id: nextId('cat'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Category; return c; },
  update: async (id: string, data: Partial<Category>) => { await delay(300); return { ...mockCategories.find(c => c.id === id)!, ...data }; },
  delete: async (_id: string) => { await delay(300); },
};

// ============================================================
// PRODUCT API
// ============================================================
export const productApi = {
  getAll: async () => { await delay(200); return productStore; },
  getPaginated: async (params: PaginationParams, sort?: SortParams, filters?: Record<string, unknown>) => {
    await delay(300);
    let list = [...productStore];
    if (filters) {
      if (filters.search) list = list.filter(p => p.name.toLowerCase().includes(String(filters.search).toLowerCase()) || p.brand.toLowerCase().includes(String(filters.search).toLowerCase()));
      if (filters.categoryId) list = list.filter(p => p.categoryId === filters.categoryId);
      if (filters.categoryName) list = list.filter(p => p.categoryName === filters.categoryName);
      if (filters.brand) list = list.filter(p => p.brand === filters.brand);
      if (filters.status) list = list.filter(p => p.status === filters.status);
      if (filters.condition) list = list.filter(p => p.condition === filters.condition);
      if (filters.minPrice) list = list.filter(p => p.price >= Number(filters.minPrice));
      if (filters.maxPrice) list = list.filter(p => p.price <= Number(filters.maxPrice));
      if (filters.ram) list = list.filter(p => p.phoneSpecs?.ram?.includes(String(filters.ram)));
      if (filters.storage) list = list.filter(p => p.phoneSpecs?.storage?.includes(String(filters.storage)));
      if (filters.isFeatured) list = list.filter(p => p.isFeatured);
      if (filters.isNew) list = list.filter(p => p.isNew);
      if (filters.isHot) list = list.filter(p => p.isHot);
    }
    if (sort) list.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sort.field] ?? 0;
      const bv = (b as unknown as Record<string, unknown>)[sort.field] ?? 0;
      return sort.direction === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return paginate(list, params);
  },
  getById: async (id: string) => { await delay(200); return productStore.find(p => p.id === id) ?? null; },
  getByCategory: async (categoryId: string) => { await delay(200); return productStore.filter(p => p.categoryId === categoryId); },
  getByBrand: async (brand: string) => { await delay(200); return productStore.filter(p => p.brand === brand); },
  getFeatured: async (limit = 8) => { await delay(200); return productStore.filter(p => p.isFeatured).slice(0, limit); },
  getHot: async (limit = 6) => { await delay(200); return productStore.filter(p => p.isHot).slice(0, limit); },
  getNew: async (limit = 6) => { await delay(200); return productStore.filter(p => p.isNew).slice(0, limit); },
  getSimilar: async (productId: string, limit = 4) => { await delay(200); const p = productStore.find(x => x.id === productId); if (!p) return []; return productStore.filter(x => x.id !== productId && (x.categoryId === p.categoryId || x.brand === p.brand)).slice(0, limit); },
  getCompatibleAccessories: async (productId: string) => { await delay(200); const p = productStore.find(x => x.id === productId); if (!p?.compatibleAccessories) return []; return productStore.filter(x => p.compatibleAccessories!.includes(x.id)); },
  create: async (data: Partial<Product>) => { await delay(400); const p = { ...data, id: nextId('prod'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Product; productStore = [p, ...productStore]; return p; },
  update: async (id: string, data: Partial<Product>) => { await delay(400); productStore = productStore.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p); return productStore.find(p => p.id === id)!; },
  delete: async (id: string) => { await delay(300); productStore = productStore.filter(p => p.id !== id); },
  getBrands: async () => { await delay(100); return [...new Set(productStore.map(p => p.brand))].sort(); },
};

// ============================================================
// ORDER API
// ============================================================
export const orderApi = {
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => {
    await delay(300);
    let list = [...orderStore];
    if (filters?.customerId) list = list.filter(o => o.customerId === filters.customerId);
    if (filters?.status) list = list.filter(o => o.status === filters.status);
    if (filters?.search) list = list.filter(o => o.orderNumber.includes(String(filters.search)) || o.customerName.toLowerCase().includes(String(filters.search).toLowerCase()));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginate(list, params);
  },
  getById: async (id: string) => { await delay(200); return orderStore.find(o => o.id === id) ?? null; },
  getByCustomer: async (customerId: string) => { await delay(200); return orderStore.filter(o => o.customerId === customerId); },
  create: async (data: Partial<Order>) => { await delay(500); const o = { ...data, id: nextId('ord'), orderNumber: `CP${Date.now()}`, status: 'Chờ xác nhận', paymentStatus: 'Chưa thanh toán', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Order; orderStore = [o, ...orderStore]; return o; },
  updateStatus: async (id: string, status: OrderStatus, note?: string) => { await delay(300); orderStore = orderStore.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o); return orderStore.find(o => o.id === id)!; },
  cancel: async (id: string, reason: string) => { await delay(300); orderStore = orderStore.map(o => o.id === id ? { ...o, status: 'Đã huỷ' as OrderStatus, cancelReason: reason, cancelledAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : o); return orderStore.find(o => o.id === id)!; },
};

// ============================================================
// REVIEW API
// ============================================================
export const reviewApi = {
  getByProduct: async (productId: string) => { await delay(200); return reviewStore.filter(r => r.productId === productId && r.status === 'Hiển thị'); },
  getByProductPaginated: async (productId: string, params: PaginationParams, sort?: SortParams, starFilter = 0, verifiedOnly = false, hasImages = false) => {
    await delay(250);
    let list = reviewStore.filter(r => r.productId === productId && r.status === 'Hiển thị');
    if (starFilter > 0) list = list.filter(r => r.rating === starFilter);
    if (verifiedOnly) list = list.filter(r => r.isVerifiedPurchase);
    if (hasImages) list = list.filter(r => r.images.length > 0);
    if (sort) list.sort((a, b) => { const av = (a as unknown as Record<string, unknown>)[sort.field] ?? 0; const bv = (b as unknown as Record<string, unknown>)[sort.field] ?? 0; return sort.direction === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); });
    return paginate(list, params);
  },
  getStarDistribution: async (productId: string) => { await delay(150); const list = reviewStore.filter(r => r.productId === productId && r.status === 'Hiển thị'); return [5, 4, 3, 2, 1].map(star => ({ star, count: list.filter(r => r.rating === star).length })); },
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => { await delay(250); let list = [...reviewStore]; if (filters?.status) list = list.filter(r => r.status === filters.status); return paginate(list, params); },
  create: async (data: Partial<Review>): Promise<Review> => { await delay(400); const r = { ...data, id: nextId('rev'), status: 'Chờ duyệt' as const, helpfulCount: 0, images: data.images ?? [], tags: data.tags ?? [], createdAt: new Date().toISOString() } as Review; reviewStore = [r, ...reviewStore]; return r; },
  update: async (id: string, data: Partial<Review>): Promise<Review> => { await delay(300); reviewStore = reviewStore.map(r => r.id === id ? { ...r, ...data } : r); return reviewStore.find(r => r.id === id)!; },
  delete: async (id: string) => { await delay(250); reviewStore = reviewStore.filter(r => r.id !== id); },
  approve: async (id: string) => { await delay(250); reviewStore = reviewStore.map(r => r.id === id ? { ...r, status: 'Hiển thị' as const } : r); return reviewStore.find(r => r.id === id)!; },
  toggleHelpful: async (id: string): Promise<Review> => { await delay(150); reviewStore = reviewStore.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r); return reviewStore.find(r => r.id === id)!; },
};

// ============================================================
// PROMOTION API
// ============================================================
export const promotionApi = {
  getAll: async () => { await delay(200); return mockPromotions; },
  getActive: async () => { await delay(200); const now = new Date().toISOString(); return mockPromotions.filter(p => p.isActive && p.startDate <= now && p.endDate >= now); },
  getActiveForProduct: async (_productId: string) => { await delay(150); const now = new Date().toISOString(); return mockPromotions.filter(p => p.isActive && p.startDate <= now && p.endDate >= now).slice(0, 2); },
  validate: async (code: string) => { await delay(300); const p = mockPromotions.find(x => x.code === code && x.isActive); if (!p) throw new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn'); return p; },
  getPaginated: async (params: PaginationParams) => { await delay(200); return paginate(mockPromotions, params); },
  getActiveAll: async (params: PaginationParams, search?: string) => {
    await delay(200);
    const now = new Date().toISOString();
    let list = mockPromotions.filter(p => p.isActive && p.startDate <= now && p.endDate >= now);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));
    return paginate(list, params);
  },
  create: async (data: Partial<Promotion>) => { await delay(400); return { ...data, id: nextId('promo'), usedCount: 0, createdAt: new Date().toISOString() } as Promotion; },
  update: async (id: string, data: Partial<Promotion>) => { await delay(300); return { ...mockPromotions.find(p => p.id === id)!, ...data }; },
  delete: async (_id: string) => { await delay(300); },
};

// ============================================================
// CART API
// ============================================================
export const cartApi = {
  getItems: async (): Promise<CartItem[]> => { await delay(150); return cartStore; },
  addItem: async (item: Omit<CartItem, 'id' | 'totalPrice'>): Promise<CartItem> => { await delay(200); const newItem: CartItem = { ...item, id: nextId('cart'), totalPrice: item.unitPrice * item.quantity }; cartStore = [...cartStore, newItem]; return newItem; },
  updateQuantity: async (id: string, quantity: number): Promise<CartItem> => { await delay(150); cartStore = cartStore.map(i => i.id === id ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i); return cartStore.find(i => i.id === id)!; },
  removeItem: async (id: string) => { await delay(150); cartStore = cartStore.filter(i => i.id !== id); },
  clear: async () => { await delay(150); cartStore = []; },
};

// ============================================================
// WISHLIST API
// ============================================================
export const wishlistApi = {
  getByUser: async (_userId: string): Promise<WishlistItem[]> => { await delay(200); return wishStore; },
  add: async (userId: string, productId: string): Promise<WishlistItem> => { await delay(250); const p = productStore.find(x => x.id === productId); if (!p) throw new Error('Sản phẩm không tồn tại'); const item: WishlistItem = { id: nextId('wl'), userId, productId, productName: p.name, productImage: p.images[0], brand: p.brand, categoryName: p.categoryName, price: p.price, originalPrice: p.originalPrice, stock: p.variants.reduce((s, v) => s + v.stock, 0), addedAt: new Date().toISOString() }; wishStore = [item, ...wishStore]; return item; },
  remove: async (id: string) => { await delay(150); wishStore = wishStore.filter(i => i.id !== id); },
  removeByProduct: async (_userId: string, productId: string) => { await delay(150); wishStore = wishStore.filter(i => i.productId !== productId); },
  clear: async (_userId: string) => { await delay(150); wishStore = []; },
};

// ============================================================
// USER API
// ============================================================
export const userApi = {
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => { await delay(300); let list = [...userStore]; if (filters?.role) list = list.filter(u => u.role === filters.role); if (filters?.status) list = list.filter(u => u.status === filters.status as UserStatus); if (filters?.search) list = list.filter(u => u.fullName.toLowerCase().includes(String(filters.search).toLowerCase()) || u.email.toLowerCase().includes(String(filters.search).toLowerCase())); return paginate(list, params); },
  getById: async (id: string) => { await delay(200); return userStore.find(u => u.id === id) ?? null; },
  update: async (id: string, data: Partial<User>) => { await delay(300); userStore = userStore.map(u => u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u); return userStore.find(u => u.id === id)!; },
  updateStatus: async (id: string, status: UserStatus) => { await delay(250); userStore = userStore.map(u => u.id === id ? { ...u, status, updatedAt: new Date().toISOString() } : u); return userStore.find(u => u.id === id)!; },
  delete: async (id: string) => { await delay(300); userStore = userStore.filter(u => u.id !== id); },
};

// ============================================================
// WARRANTY API
// ============================================================
export const warrantyApi = {
  getByCustomer: async (customerId: string) => { await delay(200); return mockWarrantyItems.filter(w => w.customerId === customerId); },
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => { await delay(250); let list = [...mockWarrantyItems]; if (filters?.customerId) list = list.filter(w => w.customerId === filters.customerId); if (filters?.status) list = list.filter(w => w.status === filters.status); return paginate(list, params); },
  getById: async (id: string) => { await delay(200); return mockWarrantyItems.find(w => w.id === id) ?? null; },
  create: async (data: Partial<WarrantyItem>) => { await delay(300); return { ...data, id: nextId('war'), createdAt: new Date().toISOString() } as WarrantyItem; },
};

// ============================================================
// TRADE-IN API
// ============================================================
export const tradeInApi = {
  getAll: async () => { await delay(200); return tradeInStore; },
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => { await delay(250); let list = [...tradeInStore]; if (filters?.customerId) list = list.filter(t => t.customerId === filters.customerId); if (filters?.status) list = list.filter(t => t.status === filters.status); return paginate(list, params); },
  getById: async (id: string) => { await delay(200); return tradeInStore.find(t => t.id === id) ?? null; },
  create: async (data: Partial<TradeInRequest>) => { await delay(400); const t = { ...data, id: nextId('ti'), status: 'Chờ định giá' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as TradeInRequest; tradeInStore = [t, ...tradeInStore]; return t; },
  updateStatus: async (id: string, status: TradeInRequest['status'], finalValue?: number) => { await delay(300); tradeInStore = tradeInStore.map(t => t.id === id ? { ...t, status, finalValue, updatedAt: new Date().toISOString() } : t); return tradeInStore.find(t => t.id === id)!; },
  estimateValue: async (brand: string, model: string, storage: string, condition: string): Promise<number> => {
    await delay(600);
    const baseValues: Record<string, number> = { 'iPhone 16 Pro Max': 29000000, 'iPhone 15 Pro Max': 24000000, 'iPhone 14 Pro Max': 18000000, 'Galaxy S25 Ultra': 26000000, 'Galaxy S24 Ultra': 21000000 };
    const storageMultipliers: Record<string, number> = { '128GB': 0.9, '256GB': 1, '512GB': 1.1, '1TB': 1.2 };
    const conditionMultipliers: Record<string, number> = { 'Tốt': 1, 'Khá': 0.85, 'Trung bình': 0.7, 'Kém': 0.5 };
    const base = baseValues[model] ?? 5000000;
    const smul = storageMultipliers[storage] ?? 1;
    const cmul = conditionMultipliers[condition] ?? 0.7;
    return Math.round(base * smul * cmul / 500000) * 500000;
  },
};

// ============================================================
// BLOG API
// ============================================================
export const blogApi = {
  getAll: async () => { await delay(200); return blogStore.filter(b => b.isPublished); },
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => { await delay(250); let list = [...blogStore]; if (filters?.isPublished !== undefined) list = list.filter(b => b.isPublished === filters.isPublished); if (filters?.category) list = list.filter(b => b.category === filters.category); if (filters?.search) list = list.filter(b => b.title.toLowerCase().includes(String(filters.search).toLowerCase())); return paginate(list, params); },
  getBySlug: async (slug: string) => { await delay(200); return blogStore.find(b => b.slug === slug && b.isPublished) ?? null; },
  getById: async (id: string) => { await delay(150); return blogStore.find(b => b.id === id) ?? null; },
  getLatest: async (limit = 3) => { await delay(150); return blogStore.filter(b => b.isPublished).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit); },
  create: async (data: Partial<BlogPost>) => { await delay(400); const b = { ...data, id: nextId('blog'), viewCount: 0, isPublished: false, publishedAt: new Date().toISOString() } as BlogPost; blogStore = [b, ...blogStore]; return b; },
  update: async (id: string, data: Partial<BlogPost>) => { await delay(300); blogStore = blogStore.map(b => b.id === id ? { ...b, ...data } : b); return blogStore.find(b => b.id === id)!; },
  delete: async (id: string) => { await delay(250); blogStore = blogStore.filter(b => b.id !== id); },
};

// ============================================================
// COMBO API
// ============================================================
export const comboApi = {
  getAll: async () => { await delay(200); return mockCombos.filter(c => c.isActive); },
  getPaginated: async (params: PaginationParams) => { await delay(200); return paginate(mockCombos, params); },
  getById: async (id: string) => { await delay(150); return mockCombos.find(c => c.id === id) ?? null; },
  getForProduct: async (productId: string) => {
    await delay(200);
    return mockCombos.filter(c => c.isActive && c.products.some(p => p.productId === productId));
  },
};

// ============================================================
// CHATBOT AI API
// ============================================================
const chatbotResponses: { keywords: string[]; reply: string; products?: string[] }[] = [
  {
    keywords: ['chơi game', 'gaming', 'game', 'fps', 'hiệu năng'],
    reply: '🎮 Để chơi game mượt mà, bạn nên chọn máy có chip mạnh và RAM lớn. Tôi gợi ý:\n\n• **iPhone 16 Pro Max** — Chip A18 Pro, hiệu năng hàng đầu\n• **Samsung Galaxy S25 Ultra** — Snapdragon 8 Elite, màn 120Hz ultra-smooth\n• **Xiaomi 15 Ultra** — Snapdragon 8 Elite + tản nhiệt tốt\n\nNgân sách của bạn là bao nhiêu?',
    products: ['prod-001', 'prod-002', 'prod-003'],
  },
  {
    keywords: ['chụp ảnh', 'camera', 'chụp hình', 'ảnh đẹp', 'selfie'],
    reply: '📸 Mê chụp ảnh thì đây là những lựa chọn đỉnh nhất:\n\n• **Samsung Galaxy S25 Ultra** — Camera 200MP, zoom quang học 100x\n• **iPhone 16 Pro Max** — Camera 48MP, quay ProRes 4K, Night Mode huyền thoại\n• **Xiaomi 15 Ultra** — Camera Leica 4 ống kính, ảnh nghệ thuật\n\nBạn thích chụp ảnh phong cảnh hay chân dung?',
    products: ['prod-001', 'prod-002', 'prod-003'],
  },
  {
    keywords: ['pin', 'trâu', 'bền', 'lâu', 'sạc', 'sạc nhanh'],
    reply: '🔋 Muốn pin trâu không lo hết pin suốt ngày:\n\n• **OPPO Find X8 Pro** — Pin 5910mAh + sạc 80W siêu nhanh\n• **Xiaomi 15 Ultra** — Pin 5500mAh + sạc 90W có dây\n• **Samsung Galaxy S25 Ultra** — Pin 5000mAh + hệ sinh thái tối ưu pin\n\nSạc có dây hay không dây quan trọng với bạn không?',
    products: ['prod-004', 'prod-003', 'prod-002'],
  },
  {
    keywords: ['giá rẻ', 'tầm trung', 'tiết kiệm', 'dưới 10', 'dưới 15', 'sinh viên'],
    reply: '💰 Điện thoại tầm trung giá tốt nhất hiện tại:\n\n• **Samsung Galaxy A56 5G** — ~10.5 triệu, Exynos 1580, 5G\n• **Xiaomi Redmi Note 14 Pro** — ~7.5 triệu, Camera 200MP\n\nCả hai đều có màn AMOLED 120Hz, rất xứng đáng với giá tiền!',
    products: ['prod-005', 'prod-006'],
  },
  {
    keywords: ['apple', 'iphone', 'ios'],
    reply: '🍎 Hệ sinh thái Apple rất mượt mà. Hiện tại có:\n\n• **iPhone 16 Pro Max** — Cao cấp nhất, chip A18 Pro, Camera Control\n• **AirPods Pro 3** — Tai nghe tuyệt vời nếu dùng iPhone\n\nBạn đang xài iPhone đời nào? Tôi có thể gợi ý upgrade phù hợp.',
    products: ['prod-001', 'prod-007'],
  },
  {
    keywords: ['samsung', 'android', 'galaxy'],
    reply: '📱 Samsung có nhiều lựa chọn tốt:\n\n• **Galaxy S25 Ultra** — Flagship đỉnh, có S Pen AI\n• **Galaxy A56 5G** — Tầm trung xuất sắc, giá hợp lý\n• **Galaxy Watch Ultra** — Smartwatch kèm theo rất ngon\n\nBạn muốn flagship hay tầm trung?',
    products: ['prod-002', 'prod-005', 'prod-008'],
  },
  {
    keywords: ['phụ kiện', 'ốp lưng', 'tai nghe', 'đồng hồ', 'sạc'],
    reply: '🎧 Phụ kiện hot nhất hiện tại:\n\n• **AirPods Pro 3** — Chống ồn ANC đỉnh, best cho iPhone\n• **Samsung Galaxy Watch Ultra** — Tracking sức khỏe toàn diện\n• **Anker 65W GaN** — Sạc nhanh nhỏ gọn, đa năng\n• **Ốp Spigen Ultra Hybrid** — Bảo vệ tốt, trong suốt\n\nBạn cần phụ kiện cho máy nào?',
    products: ['prod-007', 'prod-008', 'prod-009', 'prod-010'],
  },
  {
    keywords: ['trade-in', 'thu cũ', 'đổi máy', 'máy cũ', 'bán máy'],
    reply: '🔄 Chương trình **Thu cũ đổi mới** của CELLPHONES:\n\n✅ Định giá máy cũ ngay tại cửa hàng hoặc online\n✅ Giá thu hấp dẫn, tính luôn vào máy mới\n✅ Hỗ trợ hầu hết các thương hiệu\n\nBạn muốn định giá máy nào? Tôi có thể ước tính sơ bộ cho bạn tại trang Trade-In.',
  },
  {
    keywords: ['bảo hành', 'warranty', 'hỏng', 'lỗi', 'sửa'],
    reply: '🛡️ Chính sách bảo hành tại CELLPHONES:\n\n• Bảo hành chính hãng 12-18 tháng\n• Đổi trả trong 7 ngày nếu lỗi sản xuất\n• Tra cứu bảo hành bằng IMEI tại trang Bảo hành\n\nBạn cần kiểm tra bảo hành sản phẩm nào?',
  },
  {
    keywords: ['so sánh', 'compare', 'khác nhau', 'tốt hơn', 'nên mua'],
    reply: '⚖️ Bạn muốn so sánh những dòng máy nào? Hãy cho tôi biết 2-3 sản phẩm bạn đang cân nhắc, tôi sẽ phân tích chi tiết theo:\n\n📊 **Hiệu năng** • 📸 **Camera** • 🔋 **Pin** • 💰 **Giá tiền**\n\nHoặc dùng tính năng **So sánh sản phẩm** trên website để xem bảng so sánh trực quan nhé!',
  },
];

export const chatbotApi = {
  sendMessage: async (message: string): Promise<{ reply: string; products?: string[] }> => {
    await delay(800 + Math.random() * 600);
    const lower = message.toLowerCase();
    const matched = chatbotResponses.find(r => r.keywords.some(k => lower.includes(k)));
    if (matched) return { reply: matched.reply, products: matched.products };
    return {
      reply: `Cảm ơn bạn đã hỏi! 😊 Tôi có thể giúp bạn về:\n\n• 📱 **Tư vấn chọn điện thoại** — theo nhu cầu, ngân sách\n• 📸 **So sánh camera** — chụp ảnh, quay video\n• 🔋 **Tư vấn pin & sạc** — dùng cả ngày không lo\n• 💰 **Tìm máy theo giá** — từ 5 triệu đến 50 triệu\n• 🔄 **Trade-in** — thu cũ đổi mới\n\nBạn cần tư vấn gì cụ thể hơn không?`,
    };
  },
};

// ============================================================
// STORE LOCATION API
// ============================================================
export const storeApi = {
  getAll: async () => { await delay(200); return mockStoreLocations; },
  getById: async (id: string) => { await delay(150); return mockStoreLocations.find(s => s.id === id) ?? null; },
  checkAvailability: async (storeId: string, productId: string): Promise<number> => { await delay(300); const p = productStore.find(x => x.id === productId); return p ? Math.floor(Math.random() * 10) : 0; },
};

// ============================================================
// IMEI CHECK API
// ============================================================
export const imeiApi = {
  check: async (imei: string): Promise<IMEICheckResult> => {
    await delay(1500);
    return { imei, brand: 'Apple', model: 'iPhone 16 Pro Max', isLocked: false, warrantyStatus: 'Còn bảo hành', warrantyExpiry: '2026-10-01', purchaseCountry: 'Việt Nam', isBlacklisted: false, activationStatus: 'Đã kích hoạt', checkedAt: new Date().toISOString() };
  },
};

// ============================================================
// NOTIFICATION API
// ============================================================
export const notificationApi = {
  getAll: async () => { await delay(150); return notifStore; },
  markRead: async (id: string) => { await delay(100); notifStore = notifStore.map(n => n.id === id ? { ...n, isRead: true } : n); },
  markAllRead: async () => { await delay(150); notifStore = notifStore.map(n => ({ ...n, isRead: true })); },
  delete: async (id: string) => { await delay(100); notifStore = notifStore.filter(n => n.id !== id); },
};

// ============================================================
// ADMIN API
// ============================================================
export const adminApi = {
  getDashboardStats: async () => {
    await delay(400);
    return {
      totalRevenue: 4582000000, totalOrders: 1247, totalProducts: productStore.length, totalCustomers: userStore.filter(u => u.role === 'Khách hàng').length,
      revenueGrowth: 18.5, orderGrowth: 12.3, todayRevenue: 125000000, todayOrders: 34,
      pendingOrders: orderStore.filter(o => o.status === 'Chờ xác nhận').length,
      lowStockProducts: productStore.filter(() => Math.random() > 0.8).slice(0, 5).map(p => ({ id: p.id, name: p.name, stock: Math.floor(Math.random() * 5) })),
      revenueByMonth: [{ month: 'T10/24', revenue: 320000000 }, { month: 'T11/24', revenue: 380000000 }, { month: 'T12/24', revenue: 520000000 }, { month: 'T1/25', revenue: 410000000 }, { month: 'T2/25', revenue: 390000000 }, { month: 'T3/25', revenue: 480000000 }],
      ordersByStatus: [{ status: 'Đã giao', count: 980 }, { status: 'Đang giao hàng', count: 156 }, { status: 'Chờ xác nhận', count: 45 }, { status: 'Đã huỷ', count: 66 }],
      topProducts: productStore.slice(0, 5).map(p => ({ name: p.name, brand: p.brand, sales: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 500000000) + 50000000 })),
      topCategories: mockCategories.map(c => ({ name: c.name, count: c.productCount, revenue: Math.floor(Math.random() * 1000000000) + 100000000 })),
    };
  },
};

// ============================================================
// SHIPPING ADDRESS API
// ============================================================
export const addressApi = {
  getByUser: async (_userId: string): Promise<ShippingAddress[]> => { await delay(200); return []; },
  create: async (data: Partial<ShippingAddress>): Promise<ShippingAddress> => { await delay(300); return { ...data, id: nextId('addr') } as ShippingAddress; },
  update: async (id: string, data: Partial<ShippingAddress>): Promise<ShippingAddress> => { await delay(250); return { ...data, id } as ShippingAddress; },
  delete: async (_id: string) => { await delay(200); },
};

// ============================================================
// RETURN API
// ============================================================
export const returnApi = {
  getPaginated: async (params: PaginationParams, filters?: Record<string, unknown>) => { await delay(250); const list: ReturnRequest[] = []; if (filters?.customerId) return paginate(list.filter(r => r.customerId === filters.customerId), params); return paginate(list, params); },
  getById: async (_id: string): Promise<ReturnRequest | null> => { await delay(200); return null; },
  create: async (data: Partial<ReturnRequest>): Promise<ReturnRequest> => { await delay(400); return { ...data, id: nextId('ret'), status: 'Chờ duyệt', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ReturnRequest; },
  update: async (id: string, data: Partial<ReturnRequest>): Promise<ReturnRequest> => { await delay(300); return { ...data, id } as ReturnRequest; },
};

// ============================================================
// ACTIVITY LOG API
// ============================================================
export const activityApi = {
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<ActivityLog>> => { await delay(200); return paginate([], params); },
};

// ============================================================
// STOCK MOVEMENT API
// ============================================================
export const stockApi = {
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<StockMovement>> => { await delay(200); return paginate([], params); },
  create: async (data: Partial<StockMovement>): Promise<StockMovement> => { await delay(300); return { ...data, id: nextId('stk'), createdAt: new Date().toISOString() } as StockMovement; },
};

// ============================================================
// CHAT API (stub — legacy B2B feature, preserved for imports)
// ============================================================
interface ChatConversationStub { id: string; supplierId: string; supplierName: string; customerId: string; customerName: string; lastMessage: string; unreadCount: number; createdAt: string; }
interface ChatMessageStub { id: string; conversationId: string; senderId: string; senderName: string; content: string; createdAt: string; isRead: boolean; }
let chatConvStore: ChatConversationStub[] = [];
let chatMsgStore: ChatMessageStub[] = [];
export const chatApi = {
  getConversations: async (userId: string): Promise<ChatConversationStub[]> => {
    await delay(200);
    return chatConvStore.filter(c => c.customerId === userId || c.supplierId === userId);
  },
  getMessages: async (convId: string): Promise<ChatMessageStub[]> => {
    await delay(200);
    return chatMsgStore.filter(m => m.conversationId === convId);
  },
  createConversation: async (customerId: string, customerName: string, supplierId: string, supplierName: string): Promise<ChatConversationStub> => {
    await delay(300);
    const existing = chatConvStore.find(c => c.customerId === customerId && c.supplierId === supplierId);
    if (existing) return existing;
    const conv: ChatConversationStub = { id: nextId('conv'), customerId, customerName, supplierId, supplierName, lastMessage: '', unreadCount: 0, createdAt: new Date().toISOString() };
    chatConvStore.push(conv);
    return conv;
  },
  sendMessage: async (convId: string, senderId: string, senderName: string, content: string): Promise<ChatMessageStub> => {
    await delay(250);
    const msg: ChatMessageStub = { id: nextId('msg'), conversationId: convId, senderId, senderName, content, createdAt: new Date().toISOString(), isRead: false };
    chatMsgStore.push(msg);
    chatConvStore = chatConvStore.map(c => c.id === convId ? { ...c, lastMessage: content } : c);
    return msg;
  },
  markConversationRead: async (convId: string): Promise<void> => {
    await delay(100);
    chatConvStore = chatConvStore.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c);
    chatMsgStore = chatMsgStore.map(m => m.conversationId === convId ? { ...m, isRead: true } : m);
  },
  simulateReply: async (convId: string): Promise<ChatMessageStub> => {
    await delay(600);
    const reply: ChatMessageStub = { id: nextId('msg'), conversationId: convId, senderId: 'system', senderName: 'CELLPHONES Support', content: 'Cảm ơn bạn đã liên hệ! Nhân viên tư vấn sẽ phản hồi trong thời gian sớm nhất.', createdAt: new Date().toISOString(), isRead: false };
    chatMsgStore.push(reply);
    return reply;
  },
};

// ============================================================
// SUPPLIER API (stub — legacy B2B, ProductDetailPage uses it)
// ============================================================
interface SupplierStub { id: string; companyName: string; contactName: string; email: string; phone: string; address: string; rating: number; verified: boolean; }
export const supplierApi = {
  getById: async (id: string): Promise<SupplierStub | null> => {
    await delay(150);
    if (!id) return null;
    return { id, companyName: 'CELLPHONES Official', contactName: 'CELLPHONES', email: 'partner@cellphones.vn', phone: '1800 2097', address: 'Hà Nội, Việt Nam', rating: 4.8, verified: true };
  },
  getAll: async (): Promise<SupplierStub[]> => { await delay(200); return []; },
  getPaginated: async (params: PaginationParams): Promise<PaginatedResponse<SupplierStub>> => { await delay(200); return paginate([], params); },
};

// ============================================================
// TEMPLATE / INVOICE / SHIPMENT / CERTIFICATE API stubs
// ============================================================
export const templateApi = {
  getAll: async () => { await delay(150); return []; },
  getById: async (_id: string) => { await delay(150); return null; },
};
export const invoiceBuyerApi = {
  getByOrder: async (_orderId: string) => { await delay(200); return null; },
};
export const shipmentApi = {
  getByOrder: async (_orderId: string) => { await delay(200); return null; },
  track: async (_code: string) => { await delay(300); return null; },
};
export const certificateSellerApi = {
  getBySupplier: async (_supplierId: string) => { await delay(200); return []; },
};

// ============================================================
// SUPPLIER SCORECARD API (B2B)
// ============================================================
interface SupplierScorecard {
  supplierId: string;
  supplierName: string;
  overallScore: number;
  deliveryScore: number;
  qualityScore: number;
  responseScore: number;
  priceScore: number;
  totalOrders: number;
  onTimeDeliveryRate: number;
  defectRate: number;
  avgResponseTime: number;
  period: string;
  updatedAt: string;
}
let scorecardStore: SupplierScorecard[] = [];
export const supplierScorecardApi = {
  getBySupplier: async (supplierId: string): Promise<SupplierScorecard | null> => {
    await delay(200);
    const found = scorecardStore.find(s => s.supplierId === supplierId);
    if (found) return found;
    // Generate mock scorecard
    return {
      supplierId,
      supplierName: 'Nhà cung cấp',
      overallScore: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      deliveryScore: Math.round((3 + Math.random() * 2) * 10) / 10,
      qualityScore: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      responseScore: Math.round((3 + Math.random() * 2) * 10) / 10,
      priceScore: Math.round((3 + Math.random() * 2) * 10) / 10,
      totalOrders: Math.floor(Math.random() * 200) + 20,
      onTimeDeliveryRate: Math.round((70 + Math.random() * 30) * 10) / 10,
      defectRate: Math.round(Math.random() * 5 * 10) / 10,
      avgResponseTime: Math.round((1 + Math.random() * 4) * 10) / 10,
      period: 'Q1-2026',
      updatedAt: new Date().toISOString(),
    };
  },
  getAll: async (): Promise<SupplierScorecard[]> => { await delay(200); return scorecardStore; },
  update: async (supplierId: string, data: Partial<SupplierScorecard>): Promise<SupplierScorecard> => {
    await delay(300);
    const base = await supplierScorecardApi.getBySupplier(supplierId);
    const updated = { ...base!, ...data } as SupplierScorecard;
    scorecardStore = scorecardStore.filter(s => s.supplierId !== supplierId);
    scorecardStore.push(updated);
    return updated;
  },
};

// ============================================================
// SUPPLIER REVIEW API
// ============================================================
export const supplierReviewApi = {
  getBySupplier: async (_supplierId: string) => { await delay(200); return []; },
  create: async (data: Record<string, unknown>) => { await delay(300); return { ...data, id: `srev-${Date.now()}`, createdAt: new Date().toISOString() }; },
};

// ============================================================
// B2B CORE APIs (stubs for Buyer/Seller pages)
// ============================================================

// RFQ (Yêu cầu báo giá)
export const rfqApi = {
  getByBuyer: async (_buyerId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getBySeller: async (_supplierId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getById: async (_id: string) => { await delay(200); return null; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `rfq-${Date.now()}`, rfqNumber: `RFQ-${Date.now()}`, status: 'Bản nháp', createdAt: new Date().toISOString() }; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
  submit: async (id: string) => { await delay(300); return { id, status: 'Đã gửi' }; },
  cancel: async (id: string) => { await delay(300); return { id, status: 'Đã huỷ' }; },
  getStats: async (_id: string) => { await delay(200); return { total: 0, pending: 0, quoted: 0 }; },
};

// Quotation (Báo giá)
export const quotationApi = {
  getByRFQ: async (_rfqId: string) => { await delay(200); return []; },
  getById: async (_id: string) => { await delay(200); return null; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `quo-${Date.now()}`, status: 'Chờ phản hồi', createdAt: new Date().toISOString() }; },
  accept: async (id: string) => { await delay(300); return { id, status: 'Chấp nhận' }; },
  reject: async (id: string, reason: string) => { await delay(300); return { id, status: 'Từ chối', rejectReason: reason }; },
};

// Contract (Hợp đồng)
export const contractApi = {
  getByBuyer: async (_buyerId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getBySeller: async (_supplierId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getById: async (_id: string) => { await delay(200); return null; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `con-${Date.now()}`, contractNumber: `CON-${Date.now()}`, status: 'Chờ ký', createdAt: new Date().toISOString() }; },
  sign: async (id: string, role: 'buyer' | 'seller') => { await delay(300); return { id, [`signedBy${role.charAt(0).toUpperCase() + role.slice(1)}`]: true }; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
  cancel: async (id: string, reason: string) => { await delay(300); return { id, status: 'Đã huỷ', cancelReason: reason }; },
  addMilestone: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id: `mil-${Date.now()}`, contractId: id }; },
  getStats: async () => { await delay(200); return { total: 0, active: 0, expiringSoon: 0, expired: 0 }; },
};

// Payment (Thanh toán)
export const paymentApi = {
  getByBuyer: async (_buyerId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getBySeller: async (_supplierId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getById: async (_id: string) => { await delay(200); return null; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `pay-${Date.now()}`, paymentNumber: `PAY-${Date.now()}`, status: 'Chưa thanh toán', createdAt: new Date().toISOString() }; },
  createTransaction: async (paymentId: string, amount: number, method: string) => { await delay(400); return { id: `txn-${Date.now()}`, paymentId, amount, method, createdAt: new Date().toISOString() }; },
  sendReminder: async (paymentId: string) => { await delay(300); return { paymentId, reminderCount: 1, sentAt: new Date().toISOString() }; },
  getStats: async () => { await delay(200); return { totalDue: 0, overdue: 0, paid: 0 }; },
};

// Invoice Seller
export const invoiceSellerApi = {
  getBySeller: async (_supplierId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getById: async (_id: string) => { await delay(200); return null; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `inv-${Date.now()}`, invoiceNumber: `INV-${Date.now()}`, status: 'Bản nháp', createdAt: new Date().toISOString() }; },
  send: async (id: string) => { await delay(300); return { id, status: 'Đã gửi', sentAt: new Date().toISOString() }; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
  cancel: async (id: string) => { await delay(300); return { id, status: 'Đã huỷ' }; },
};

// Credit (Tín dụng)
export const creditApi = {
  getBySeller: async (_supplierId: string) => { await delay(250); return []; },
  getByBuyer: async (_buyerId: string) => { await delay(250); return null; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
  getStats: async (_supplierId: string) => { await delay(200); return { totalLimit: 0, usedAmount: 0, availableAmount: 0 }; },
};

// Approval (Phê duyệt)
export const approvalApi = {
  getByApprover: async (_userId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getAll: async (params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getById: async (_id: string) => { await delay(200); return null; },
  approve: async (id: string, note?: string) => { await delay(300); return { id, status: 'Đã duyệt', note, approvedAt: new Date().toISOString() }; },
  reject: async (id: string, reason: string) => { await delay(300); return { id, status: 'Từ chối', reason, rejectedAt: new Date().toISOString() }; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `apr-${Date.now()}`, status: 'Chờ duyệt', createdAt: new Date().toISOString() }; },
};

// Staff
export const staffApi = {
  getBySeller: async (_supplierId: string) => { await delay(200); return []; },
  invite: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `stf-${Date.now()}`, createdAt: new Date().toISOString() }; },
  updatePermissions: async (id: string, permissions: string[]) => { await delay(300); return { id, permissions }; },
  remove: async (_id: string) => { await delay(300); },
};

// Warehouse
export const warehouseApi = {
  getBySeller: async (_supplierId: string) => { await delay(200); return []; },
  getById: async (_id: string) => { await delay(200); return null; },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `wh-${Date.now()}`, createdAt: new Date().toISOString() }; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
  getInventory: async (_warehouseId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  adjustStock: async (warehouseId: string, productId: string, qty: number, reason: string) => { await delay(300); return { warehouseId, productId, qty, reason }; },
};

// Inventory
export const inventoryApi = {
  getBySupplier: async (_supplierId: string, params?: Record<string, unknown>) => { await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getAlerts: async (_supplierId: string) => { await delay(200); return []; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
};

// Stock Alert
export const stockAlertApi = {
  getBySupplier: async (_supplierId: string) => { await delay(200); return []; },
  resolve: async (id: string) => { await delay(300); return { id, status: 'Đã xử lý' }; },
};

// Stock Movement
export const stockMovementApi = {
  getByProduct: async (_productId: string, params?: Record<string, unknown>) => { await delay(200); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  getByWarehouse: async (_warehouseId: string, params?: Record<string, unknown>) => { await delay(200); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
  create: async (data: Record<string, unknown>) => { await delay(300); return { ...data, id: `smv-${Date.now()}`, createdAt: new Date().toISOString() }; },
};

// Buyer Team (sub-accounts)
export const buyerTeamApi = {
  getByCompany: async (_companyId: string) => { await delay(200); return []; },
  invite: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `tm-${Date.now()}`, createdAt: new Date().toISOString() }; },
  updateRole: async (id: string, role: string, permissions: string[]) => { await delay(300); return { id, role, permissions }; },
  remove: async (_id: string) => { await delay(300); },
};

// Seller Activity Log
export const sellerActivityApi = {
  getBySeller: async (_supplierId: string, params?: Record<string, unknown>) => { await delay(200); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }; },
};

// Report (Seller/Admin)
export const reportApi = {
  getRevenueSummary: async (_supplierId: string, period: string) => { await delay(300); return { period, totalRevenue: 0, orderCount: 0, avgOrderValue: 0 }; },
  getTopProducts: async (_supplierId: string) => { await delay(250); return []; },
  getTopBuyers: async (_supplierId: string) => { await delay(250); return []; },
  export: async (_supplierId: string, _type: string) => { await delay(500); return { url: '', filename: 'report.csv' }; },

  // SellerReports tab methods — returns RevenueReport[] array
  getRevenue: async (_filter: Record<string, unknown>) => {
    await delay(300);
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months.map(period => {
      const revenue = Math.floor(15000000 + Math.random() * 40000000);
      const orders = Math.floor(3 + Math.random() * 10);
      return {
        period,
        revenue,
        orders,
        avgOrderValue: orders > 0 ? Math.round(revenue / orders) : 0,
        growth: Math.round((-10 + Math.random() * 30) * 10) / 10,
        prevRevenue: Math.floor(revenue * (0.75 + Math.random() * 0.4)),
      };
    });
  },

  getProducts: async (_filter: Record<string, unknown>) => {
    await delay(300);
    return productStore.map(p => ({
      productId: p.id,
      name: p.name,
      unitsSold: Math.floor(Math.random() * 50) + 1,
      revenue: Math.floor(Math.random() * 50000000) + 1000000,
      returnRate: Math.round(Math.random() * 5 * 10) / 10,
      avgRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    }));
  },

  getCustomers: async (_filter: Record<string, unknown>) => {
    await delay(300);
    const buyers = userStore.filter(u => u.role === 'Khách hàng').slice(0, 20);
    return buyers.map(u => ({
      buyerId: u.id,
      buyerName: u.fullName,
      totalOrders: Math.floor(Math.random() * 15) + 1,
      totalSpent: Math.floor(Math.random() * 50000000) + 5000000,
      avgOrderValue: Math.floor(Math.random() * 10000000) + 1000000,
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split('T')[0],
    }));
  },

  getOrderStats: async (_filter: Record<string, unknown>) => {
    await delay(300);
    return {
      byStatus: [
        { status: 'Đã giao', count: 22 }, { status: 'Đang giao', count: 12 },
        { status: 'Đang xử lý', count: 8 }, { status: 'Mới', count: 3 }, { status: 'Đã huỷ', count: 3 },
      ],
      byPeriod: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map(m => ({
        period: m, count: Math.floor(6 + Math.random() * 12), cancelled: Math.floor(Math.random() * 2),
      })),
      avgProcessing: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map(m => ({
        period: m, days: Math.round((1.5 + Math.random() * 3) * 10) / 10,
      })),
    };
  },

  getSystemOverview: async () => {
    await delay(400);
    const totalRevenue = orderStore.filter(o => o.paymentStatus === 'Đã thanh toán').reduce((s, o) => s + o.totalAmount, 0);
    return {
      totalRevenue,
      totalOrders: orderStore.length,
      totalSuppliers: userStore.filter(u => u.role === 'Nhà cung cấp').length,
      totalBuyers: userStore.filter(u => u.role === 'Khách hàng').length,
      supplierRanking: [
        { name: 'CELLPHONES HCM', revenue: 285000000, orders: 124 },
        { name: 'Phương Nam Tech', revenue: 198000000, orders: 87 },
        { name: 'Tân Việt Mobile', revenue: 156000000, orders: 63 },
        { name: 'Minh Phút Store', revenue: 112000000, orders: 44 },
        { name: 'Hiểu Mobile', revenue: 89000000, orders: 35 },
      ],
      categoryTrend: [
        { name: 'Điện thoại', orders: 120, growth: 15 },
        { name: 'Tai nghe', orders: 45, growth: 8 },
        { name: 'Đồng hồ', orders: 30, growth: 22 },
        { name: 'Phụ kiện', orders: 85, growth: 5 },
        { name: 'Sạc & Pin', orders: 40, growth: 12 },
      ],
    };
  },
};

// Dashboard
export const dashboardApi = {
  getBuyerStats: async (_buyerId: string) => {
    await delay(300);
    return { totalOrders: 0, pendingOrders: 0, totalSpent: 0, activeContracts: 0, pendingRFQs: 0, unreadNotifications: 0 };
  },
  getSellerStats: async (_supplierId?: string) => {
    await delay(300);
    return {
      totalOrders: 48, pendingOrders: 3, totalRevenue: 285000000, activeProducts: 32,
      lowStockCount: 2, pendingRFQs: 5, activeContracts: 8, avgRating: 4.5,
      revenueGrowth: 12.5, orderGrowth: 8.3,
      ordersByStatus: [
        { status: 'Mới', count: 3 }, { status: 'Đang xử lý', count: 8 },
        { status: 'Đang giao', count: 12 }, { status: 'Đã giao', count: 22 }, { status: 'Đã huỷ', count: 3 },
      ],
      topProducts: [
        { name: 'iPhone 16 Pro Max', sales: 15, revenue: 524850000 },
        { name: 'Samsung Galaxy S25 Ultra', sales: 12, revenue: 383880000 },
        { name: 'AirPods Pro 3', sales: 28, revenue: 181720000 },
      ],
      topCategories: [
        { name: 'Điện thoại', count: 20, revenue: 908730000 },
        { name: 'Tai nghe', count: 8, revenue: 181720000 },
        { name: 'Phụ kiện', count: 4, revenue: 15600000 },
      ],
      revenueByMonth: [
        { month: '10/24', revenue: 45 }, { month: '11/24', revenue: 62 }, { month: '12/24', revenue: 88 },
        { month: '1/25', revenue: 71 }, { month: '2/25', revenue: 55 }, { month: '3/25', revenue: 79 },
      ],
    };
  },
  // Legacy alias (SellerDashboard calls this without args when no supplierId)
  getStats: async (_supplierId?: string) => {
    return dashboardApi.getSellerStats(_supplierId);
  },
};

// Config (System configs)
export const configApi = {
  getAll: async () => { await delay(200); return []; },
  get: async (key: string) => { await delay(150); return { key, value: null }; },
  update: async (key: string, value: unknown) => { await delay(300); return { key, value }; },
};

// ============================================================
// API METHOD EXTENSIONS (adding missing methods post-init)
// ============================================================

// orderApi extensions for Seller
Object.assign(orderApi, {
  getBySeller: async (_supplierId: string) => { await delay(300); return []; },
  getPaginatedBySeller: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(300); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
});

// approvalApi extension
Object.assign(approvalApi, {
  getPendingCount: async (_supplierId: string): Promise<number> => { await delay(200); return 0; },
  getRules: async (_supplierId: string) => { await delay(200); return []; },
  createRule: async (data: Record<string, unknown>) => { await delay(300); return { ...data, id: `rule-${Date.now()}` }; },
});

// rfqApi extension
Object.assign(rfqApi, {
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
  addQuotation: async (rfqId: string, data: Record<string, unknown>) => { await delay(400); return { ...data, rfqId, id: `quo-${Date.now()}` }; },
});

// contractApi extension
Object.assign(contractApi, {
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
  addMilestone: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id: `mil-${Date.now()}`, contractId: id }; },
  getPendingSignatures: async (_supplierId: string) => { await delay(200); return []; },
});

// paymentApi extension
Object.assign(paymentApi, {
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
});

// sellerActivityApi extension
Object.assign(sellerActivityApi, {
  getRecent: async (_n?: number) => { await delay(200); return []; },
  log: async (data: Record<string, unknown>) => { await delay(150); return { ...data, id: `act-${Date.now()}`, createdAt: new Date().toISOString() }; },
});

// certificateSellerApi extension
Object.assign(certificateSellerApi, {
  getStats: async (_supplierId: string) => {
    await delay(200);
    return { total: 3, verified: 2, expiringSoon: 1, expired: 0 };
  },
  create: async (data: Record<string, unknown>) => { await delay(400); return { ...data, id: `cert-${Date.now()}` }; },
  update: async (id: string, data: Record<string, unknown>) => { await delay(300); return { ...data, id }; },
  delete: async (_id: string) => { await delay(300); },
});

// stockAlertApi extension
Object.assign(stockAlertApi, {
  getAll: async (_supplierId?: string) => { await delay(200); return []; },
  create: async (data: Record<string, unknown>) => { await delay(300); return { ...data, id: `sa-${Date.now()}` }; },
});

// invoiceSellerApi extension
Object.assign(invoiceSellerApi, {
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
  getStats: async (_supplierId: string) => {
    await delay(200); return { total: 0, draft: 0, sent: 0, paid: 0, overdue: 0 };
  },
});

// creditApi extension
Object.assign(creditApi, {
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
});

// staffApi extension
Object.assign(staffApi, {
  getAll: async (_supplierId: string) => { await delay(200); return []; },
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
});

// warehouseApi extension
Object.assign(warehouseApi, {
  getPaginated: async (_supplierId: string, params?: Record<string, unknown>) => {
    await delay(250); return { data: [], total: 0, page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
  },
  getStats: async (_supplierId: string) => {
    await delay(200); return { totalWarehouses: 1, totalStock: 150, lowStockCount: 2, outOfStockCount: 0 };
  },
});

// warehouseTransferApi stub (SellerDashboard imports from its own file)
// This must be resolved via the separate warehouseTransferApi.ts file