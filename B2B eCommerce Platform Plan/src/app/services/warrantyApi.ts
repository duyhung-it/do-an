// ============================================================
// Warranty API — CELLPHONES Store (B2C)
// Quản lý bảo hành & claim của khách hàng
// ============================================================

import type {
  WarrantyItem, WarrantyClaim, WarrantyStatus, ClaimStatus, ClaimType,
  PaginationParams, PaginatedResponse,
} from '../types';

const delay = (ms = 200) => new Promise<void>(r => setTimeout(r, ms));

// ─── Mock Warranties ───────────────────────────────────────
const mockWarranties: WarrantyItem[] = [
  {
    id: 'wrt-001', customerId: 'user-001', customerName: 'Nguyễn Văn A',
    orderId: 'ord-001', orderNumber: 'CP-2026-001',
    productId: 'p1', productName: 'iPhone 16 Pro Max 256GB',
    productImage: '', brand: 'Apple',
    imei: '356789012345671', serialNumber: 'SN-IP16PM-001',
    purchaseDate: '2026-01-15', warrantyExpiry: '2027-01-15', warrantyMonths: 12,
    status: 'Còn bảo hành', createdAt: '2026-01-15',
  },
  {
    id: 'wrt-002', customerId: 'user-001', customerName: 'Nguyễn Văn A',
    orderId: 'ord-002', orderNumber: 'CP-2026-008',
    productId: 'p2', productName: 'Samsung Galaxy S25 Ultra',
    productImage: '', brand: 'Samsung',
    imei: '356789012345672', serialNumber: 'SN-S25U-002',
    purchaseDate: '2026-02-20', warrantyExpiry: '2027-02-20', warrantyMonths: 12,
    status: 'Còn bảo hành', createdAt: '2026-02-20',
  },
  {
    id: 'wrt-003', customerId: 'user-002', customerName: 'Trần Thị B',
    orderId: 'ord-003', orderNumber: 'CP-2025-150',
    productId: 'p3', productName: 'Xiaomi 15 Ultra',
    productImage: '', brand: 'Xiaomi',
    imei: '356789012345673', purchaseDate: '2025-08-01',
    warrantyExpiry: '2026-08-01', warrantyMonths: 12,
    status: 'Còn bảo hành', createdAt: '2025-08-01',
  },
  {
    id: 'wrt-004', customerId: 'user-001', customerName: 'Nguyễn Văn A',
    orderId: 'ord-004', orderNumber: 'CP-2024-098',
    productId: 'p4', productName: 'AirPods Pro 2',
    productImage: '', brand: 'Apple', serialNumber: 'AP-2024-098',
    purchaseDate: '2024-12-01', warrantyExpiry: '2025-12-01', warrantyMonths: 12,
    status: 'Hết bảo hành', createdAt: '2024-12-01',
  },
];

// ─── Mock Claims ───────────────────────────────────────────
const mockClaims: WarrantyClaim[] = [
  {
    id: 'wc-001', warrantyId: 'wrt-001',
    customerId: 'user-001', customerName: 'Nguyễn Văn A',
    productId: 'p1', productName: 'iPhone 16 Pro Max 256GB',
    claimType: 'Sửa chữa',
    description: 'Màn hình bị sọc nhẹ sau 2 tháng sử dụng',
    status: 'Đang xử lý', createdAt: '2026-03-15',
  },
  {
    id: 'wc-002', warrantyId: 'wrt-002',
    customerId: 'user-001', customerName: 'Nguyễn Văn A',
    productId: 'p2', productName: 'Samsung Galaxy S25 Ultra',
    claimType: 'Thay thế',
    description: 'Pin không sạc được',
    status: 'Đã giải quyết',
    resolution: 'Đã đổi máy mới cùng model',
    resolvedAt: '2026-03-25', createdAt: '2026-03-20',
  },
];

// ─── Public API ────────────────────────────────────────────
export const warrantyApi = {
  async getByCustomer(customerId: string): Promise<WarrantyItem[]> {
    await delay();
    return mockWarranties.filter(w => w.customerId === customerId);
  },

  async getById(id: string): Promise<WarrantyItem | null> {
    await delay();
    return mockWarranties.find(w => w.id === id) ?? null;
  },

  async getPaginated(
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    filters?: { customerId?: string; status?: WarrantyStatus; search?: string },
  ): Promise<PaginatedResponse<WarrantyItem>> {
    await delay();
    let items = [...mockWarranties];
    if (filters?.customerId) items = items.filter(w => w.customerId === filters.customerId);
    if (filters?.status) items = items.filter(w => w.status === filters.status);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(w => w.productName.toLowerCase().includes(s) || w.imei?.includes(s));
    }
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: items.slice(start, start + pagination.pageSize),
      total, page: pagination.page, pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  },

  async getStats(customerId: string) {
    await delay();
    const items = mockWarranties.filter(w => w.customerId === customerId);
    return {
      total: items.length,
      active: items.filter(w => w.status === 'Còn bảo hành').length,
      expired: items.filter(w => w.status === 'Hết bảo hành').length,
      processing: items.filter(w => w.status === 'Đang xử lý').length,
    };
  },
};

export const warrantyClaimApi = {
  async getByCustomer(customerId: string): Promise<WarrantyClaim[]> {
    await delay();
    return mockClaims.filter(c => c.customerId === customerId);
  },

  async getById(id: string): Promise<WarrantyClaim | null> {
    await delay();
    return mockClaims.find(c => c.id === id) ?? null;
  },

  async getAll(): Promise<WarrantyClaim[]> {
    await delay();
    return [...mockClaims];
  },

  async getPaginated(
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    filters?: { customerId?: string; status?: ClaimStatus; type?: ClaimType },
  ): Promise<PaginatedResponse<WarrantyClaim>> {
    await delay();
    let items = [...mockClaims];
    if (filters?.customerId) items = items.filter(c => c.customerId === filters.customerId);
    if (filters?.status) items = items.filter(c => c.status === filters.status);
    if (filters?.type) items = items.filter(c => c.claimType === filters.type);
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: items.slice(start, start + pagination.pageSize),
      total, page: pagination.page, pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  },

  async create(data: Omit<WarrantyClaim, 'id' | 'createdAt' | 'status'>): Promise<WarrantyClaim> {
    await delay(300);
    const claim: WarrantyClaim = {
      ...data,
      id: `wc-${Date.now()}`,
      status: 'Mới',
      createdAt: new Date().toISOString(),
    };
    mockClaims.unshift(claim);
    return claim;
  },

  async updateStatus(id: string, status: ClaimStatus, resolution?: string): Promise<WarrantyClaim | null> {
    await delay(300);
    const claim = mockClaims.find(c => c.id === id);
    if (!claim) return null;
    claim.status = status;
    if (resolution) claim.resolution = resolution;
    if (status === 'Đã giải quyết' || status === 'Từ chối') {
      claim.resolvedAt = new Date().toISOString();
    }
    return claim;
  },
};
