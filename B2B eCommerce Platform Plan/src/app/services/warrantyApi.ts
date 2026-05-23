// ============================================================
// Warranty API — CELLPHONES Store (B2C)
// Quản lý bảo hành & claim của khách hàng
// ============================================================

import type {
  WarrantyItem, WarrantyClaim, WarrantyStatus, ClaimStatus, ClaimType,
  PaginationParams, PaginatedResponse, ActiveFilter, SortParams,
} from '../types';

const delay = (ms = 200) => new Promise<void>(r => setTimeout(r, ms));
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const DEFAULT_DEV_USER_ID = '00000000-0000-4000-8000-000000000199';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  } | null;
  error?: { code: string; message: string } | null;
};

function toQuery(params: Record<string, string | number | boolean | null | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

function getDevUserHeaders() {
  return { 'X-User-Id': DEFAULT_DEV_USER_ID };
}

async function backendRequest<T>(path: string, init?: RequestInit): Promise<{ data: T; pagination?: ApiEnvelope<T>['pagination'] }> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message ?? payload.message ?? `API error ${response.status}`);
  }
  return { data: payload.data, pagination: payload.pagination };
}

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

type BackendWarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'VOIDED';
type BackendWarrantyItem = {
  id: string;
  orderId: string;
  orderNumber?: string;
  productId: string;
  customerId: string;
  customerName?: string;
  productName: string;
  productImage?: string;
  brand?: string;
  serialNumber?: string;
  warrantyMonths: number;
  warrantyStart: string;
  warrantyExpiry: string;
  status: BackendWarrantyStatus;
  createdAt: string;
  updatedAt?: string;
};

type BackendClaimStatus = 'NEW' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
type BackendWarrantyClaim = {
  id: string;
  claimNumber: string;
  warrantyId: string;
  orderId: string;
  productId: string;
  customerId: string;
  customerName?: string;
  issueDescription: string;
  status: BackendClaimStatus;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt?: string;
};

function filtersToRecord(filters?: ActiveFilter[] | Record<string, unknown>) {
  if (Array.isArray(filters)) return Object.fromEntries(filters.map(filter => [filter.key, filter.value]));
  return filters ?? {};
}

function mapWarrantyStatus(status: BackendWarrantyStatus): WarrantyStatus {
  if (status === 'EXPIRED') return 'Hết bảo hành';
  if (status === 'VOIDED') return 'Đã từ chối';
  return 'Còn bảo hành';
}

function toBackendWarrantyStatus(status?: unknown): BackendWarrantyStatus | undefined {
  const map: Record<string, BackendWarrantyStatus> = {
    'Còn bảo hành': 'ACTIVE',
    'Hết bảo hành': 'EXPIRED',
    'Đã từ chối': 'VOIDED',
  };
  return typeof status === 'string' ? (map[status] ?? status as BackendWarrantyStatus) : undefined;
}

function mapBackendWarranty(item: BackendWarrantyItem): WarrantyItem {
  return {
    id: item.id,
    customerId: item.customerId,
    customerName: item.customerName ?? 'Khách hàng',
    orderId: item.orderId,
    orderNumber: item.orderNumber ?? item.orderId,
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage ?? '',
    brand: item.brand ?? '',
    serialNumber: item.serialNumber,
    imei: item.serialNumber,
    purchaseDate: item.warrantyStart,
    warrantyExpiry: item.warrantyExpiry,
    warrantyMonths: item.warrantyMonths,
    status: mapWarrantyStatus(item.status),
    createdAt: item.createdAt,
  };
}

function mapClaimStatus(status: BackendClaimStatus): ClaimStatus {
  if (status === 'PROCESSING') return 'Đang xử lý';
  if (status === 'RESOLVED') return 'Đã giải quyết';
  if (status === 'REJECTED') return 'Từ chối';
  return 'Mới';
}

function toBackendClaimStatus(status?: unknown): BackendClaimStatus | undefined {
  const map: Record<string, BackendClaimStatus> = {
    'Mới': 'NEW',
    'Đang xử lý': 'PROCESSING',
    'Đã giải quyết': 'RESOLVED',
    'Từ chối': 'REJECTED',
  };
  return typeof status === 'string' ? (map[status] ?? status as BackendClaimStatus) : undefined;
}

function mapBackendClaim(item: BackendWarrantyClaim): WarrantyClaim {
  return {
    id: item.id,
    warrantyId: item.warrantyId,
    customerId: item.customerId,
    customerName: item.customerName ?? 'Khách hàng',
    productId: item.productId,
    productName: item.claimNumber,
    claimType: 'Sửa chữa',
    description: item.issueDescription,
    status: mapClaimStatus(item.status),
    resolution: item.resolutionNote ?? undefined,
    resolvedAt: item.status === 'RESOLVED' ? item.updatedAt : undefined,
    createdAt: item.createdAt,
  };
}

Object.assign(warrantyApi, {
  getByCustomer: async (_customerId: string): Promise<WarrantyItem[]> => {
    const page = await warrantyApi.getByBuyer(_customerId, { page: 1, pageSize: 100 });
    return page.data;
  },
  getByBuyer: async (
    _buyerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    _sort?: SortParams,
    filters?: ActiveFilter[] | Record<string, unknown>,
    search?: string,
  ): Promise<PaginatedResponse<WarrantyItem>> => {
    const rawFilters = filtersToRecord(filters);
    try {
      const query = toQuery({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: toBackendWarrantyStatus(rawFilters.status),
        search,
      });
      const { data, pagination: meta } = await backendRequest<BackendWarrantyItem[]>(`/warranty${query}`, {
        headers: getDevUserHeaders(),
      });
      return {
        data: data.map(mapBackendWarranty),
        total: meta?.total ?? data.length,
        page: meta?.page ?? pagination.page,
        pageSize: meta?.pageSize ?? pagination.pageSize,
        totalPages: meta?.totalPages ?? Math.ceil(data.length / pagination.pageSize),
      };
    } catch {
      return warrantyApi.getPaginated(pagination, { customerId: _buyerId, status: rawFilters.status as WarrantyStatus, search });
    }
  },
  getById: async (id: string): Promise<WarrantyItem | null> => {
    try {
      const { data } = await backendRequest<BackendWarrantyItem>(`/warranty/${id}`, {
        headers: getDevUserHeaders(),
      });
      return mapBackendWarranty(data);
    } catch {
      await delay();
      return mockWarranties.find(w => w.id === id) ?? null;
    }
  },
  getStats: async (customerId: string) => {
    const page = await warrantyApi.getByBuyer(customerId, { page: 1, pageSize: 100 });
    return {
      total: page.data.length,
      active: page.data.filter(w => w.status === 'Còn bảo hành').length,
      expired: page.data.filter(w => w.status === 'Hết bảo hành').length,
      processing: page.data.filter(w => w.status === 'Đang xử lý').length,
    };
  },
});

Object.assign(warrantyClaimApi, {
  getByBuyer: async (
    _buyerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    _sort?: SortParams,
    filters?: ActiveFilter[] | Record<string, unknown>,
    _search?: string,
  ): Promise<PaginatedResponse<WarrantyClaim>> => {
    const rawFilters = filtersToRecord(filters);
    try {
      const query = toQuery({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: toBackendClaimStatus(rawFilters.status),
      });
      const { data, pagination: meta } = await backendRequest<BackendWarrantyClaim[]>(`/warranty-claims${query}`, {
        headers: getDevUserHeaders(),
      });
      return {
        data: data.map(mapBackendClaim),
        total: meta?.total ?? data.length,
        page: meta?.page ?? pagination.page,
        pageSize: meta?.pageSize ?? pagination.pageSize,
        totalPages: meta?.totalPages ?? Math.ceil(data.length / pagination.pageSize),
      };
    } catch {
      return warrantyClaimApi.getPaginated(pagination, { customerId: _buyerId, status: rawFilters.status as ClaimStatus });
    }
  },
  getById: async (id: string): Promise<WarrantyClaim | null> => {
    try {
      const { data } = await backendRequest<BackendWarrantyClaim>(`/warranty-claims/${id}`, {
        headers: getDevUserHeaders(),
      });
      return mapBackendClaim(data);
    } catch {
      await delay();
      return mockClaims.find(c => c.id === id) ?? null;
    }
  },
  create: async (data: Omit<WarrantyClaim, 'id' | 'createdAt' | 'status'>): Promise<WarrantyClaim> => {
    try {
      const { data: created } = await backendRequest<BackendWarrantyClaim>('/warranty-claims', {
        method: 'POST',
        headers: getDevUserHeaders(),
        body: JSON.stringify({
          warrantyId: data.warrantyId,
          issueDescription: data.description,
        }),
      });
      return mapBackendClaim(created);
    } catch {
      await delay(300);
      const claim: WarrantyClaim = {
        ...data,
        id: `wc-${Date.now()}`,
        status: 'Mới',
        createdAt: new Date().toISOString(),
      };
      mockClaims.unshift(claim);
      return claim;
    }
  },
  getStats: async (customerId: string) => {
    const page = await warrantyClaimApi.getByBuyer(customerId, { page: 1, pageSize: 100 });
    return {
      total: page.data.length,
      new: page.data.filter(c => c.status === 'Mới').length,
      processing: page.data.filter(c => c.status === 'Đang xử lý').length,
      resolved: page.data.filter(c => c.status === 'Đã giải quyết').length,
      rejected: page.data.filter(c => c.status === 'Từ chối').length,
    };
  },
});
