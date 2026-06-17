import type { ActiveFilter, PaginationParams, PaginatedResponse, Product, SortParams, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
};

type QueryValue = string | number | boolean | null | undefined;

const DEFAULT_ADMIN_HEADERS = {
  'X-Admin-Id': '00000000-0000-4000-8000-000000000001',
  'X-Admin-Name': 'Admin FE',
  'X-User-Id': '00000000-0000-4000-8000-000000000199',
};

function toQuery(params: Record<string, QueryValue>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  Object.entries(DEFAULT_ADMIN_HEADERS).forEach(([key, value]) => {
    if (!headers.has(key)) headers.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;

  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message ?? payload.message ?? `API error ${response.status}`);
  }
  return payload.data;
}

async function requestPage<T>(path: string): Promise<PaginatedResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: DEFAULT_ADMIN_HEADERS });
  const payload = await response.json() as ApiEnvelope<T[]>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message ?? payload.message ?? `API error ${response.status}`);
  }

  const pagination = payload.pagination ?? {
    page: 1,
    pageSize: payload.data.length,
    total: payload.data.length,
    totalPages: 1,
  };

  return {
    data: payload.data,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };
}

function getFilter(filters: ActiveFilter[] | undefined, key: string) {
  const value = filters?.find(filter => filter.key === key)?.value;
  return Array.isArray(value) ? value[0] : value;
}

const orderStatusToBe: Record<string, string> = {
  'Cho xac nhan': 'PENDING',
  'Da xac nhan': 'CONFIRMED',
  'Dang giao hang': 'SHIPPING',
  'Da giao': 'DELIVERED',
  'Da huy': 'CANCELLED',
  'Hoan tra': 'RETURNED',
  'Chờ xác nhận': 'PENDING',
  'Đã xác nhận': 'CONFIRMED',
  'Đang giao hàng': 'SHIPPING',
  'Đã giao': 'DELIVERED',
  'Đã huỷ': 'CANCELLED',
  'Hoàn trả': 'RETURNED',
};

const paymentStatusToBe: Record<string, string> = {
  'Cho thanh toan': 'UNPAID',
  'Chua thanh toan': 'UNPAID',
  'Da thanh toan': 'PAID',
  'Qua han': 'OVERDUE',
  'Hoan tien': 'REFUNDED',
  'Chờ thanh toán': 'UNPAID',
  'Chưa thanh toán': 'UNPAID',
  'Đã thanh toán': 'PAID',
  'Quá hạn': 'OVERDUE',
  'Hoàn tiền': 'REFUNDED',
};

const paymentMethodToBe: Record<string, string> = {
  'Tien mat': 'CASH',
  'Chuyen khoan': 'BANK_TRANSFER',
  'Vi dien tu': 'MOMO',
  'Tiền mặt': 'CASH',
  'Chuyển khoản': 'BANK_TRANSFER',
  'Ví điện tử': 'MOMO',
};

function toBeStatus(value: unknown, map: Record<string, string>) {
  const text = String(value ?? '');
  return map[text] ?? text;
}

function paymentMethodLabel(method?: string) {
  switch (method) {
    case 'CASH': return 'Tien mat';
    case 'BANK_TRANSFER': return 'Chuyen khoan';
    case 'MOMO': return 'MOMO';
    case 'VNPAY': return 'VNPAY';
    case 'COD': return 'COD';
    default: return method ?? '';
  }
}

function mapOrder(raw: any) {
  const shippingAddress = raw.shippingAddress
    ? [raw.shippingAddress.recipientName, raw.shippingAddress.phone, raw.shippingAddress.addressLine, raw.shippingAddress.ward, raw.shippingAddress.district, raw.shippingAddress.province]
        .filter(Boolean)
        .join(', ')
    : '';
  const items = Array.isArray(raw.items)
    ? raw.items
    : raw.items?.firstItem
      ? [{
          ...raw.items.firstItem,
          id: raw.items.firstItem.productId,
          quantity: raw.items.count ?? 1,
          unitPrice: raw.subtotal ?? raw.totalAmount ?? 0,
          totalPrice: raw.subtotal ?? raw.totalAmount ?? 0,
        }]
      : [];

  return {
    ...raw,
    buyerName: raw.customerName,
    supplierName: 'CELLPHONES',
    shippingAddress,
    notes: raw.internalNotes ?? raw.notes ?? '',
    promotionCode: raw.promotionCode ?? '',
    discountAmount: Number(raw.discountAmount ?? raw.discount ?? 0),
    discount: Number(raw.discount ?? raw.discountAmount ?? 0),
    paymentMethod: paymentMethodLabel(raw.paymentMethod),
    itemCount: raw.items?.count ?? items.length,
    items: items.map((item: any) => ({
      ...item,
      productImage: item.productImage ?? '',
      totalPrice: item.totalPrice ?? item.lineTotal ?? (item.unitPrice ?? 0) * (item.quantity ?? 1),
    })),
    tax: raw.tax ?? 0,
  };
}

function mapPayment(raw: any) {
  return {
    ...raw,
    paymentNumber: raw.paymentNumber ?? raw.id,
    invoiceNumber: raw.invoiceNumber ?? '-',
    buyerName: raw.customerName ?? raw.customerId,
    supplierName: 'CELLPHONES',
    paidAmount: raw.paidAmount ?? 0,
    remainingAmount: raw.remainingAmount ?? Math.max((raw.amount ?? 0) - (raw.paidAmount ?? 0), 0),
    method: paymentMethodLabel(raw.method),
    transactions: raw.transactionRef
      ? [{
          id: raw.transactionRef,
          amount: raw.paidAmount ?? raw.amount,
          method: paymentMethodLabel(raw.method),
          transactionRef: raw.transactionRef,
          paidAt: raw.paidAt,
        }]
      : [],
  };
}

function mapInvoice(raw: any) {
  const totalAmount = Number(raw.totalAmount ?? 0);
  const taxAmount = Number(raw.taxAmount ?? 0);
  const discountAmount = Number(raw.discountAmount ?? 0);
  return {
    ...raw,
    issueDate: raw.issueDate,
    issuedDate: raw.issueDate,
    buyerName: raw.customerName,
    supplierName: 'CELLPHONES',
    supplierCompany: 'CELLPHONES',
    buyerCompany: raw.customerName,
    buyerTaxCode: '',
    supplierTaxCode: '',
    type: 'Ban hang',
    totalAmount,
    taxAmount,
    discountAmount,
    subtotal: Math.max(0, totalAmount + discountAmount - taxAmount),
    taxRate: 0,
    items: [],
  };
}

function mapShipment(raw: any) {
  return {
    ...raw,
    carrier: raw.carrierName,
    estimatedDate: raw.estimatedDelivery,
    actualDate: raw.actualDelivery,
  };
}

const adminUserRoleToFe: Record<string, string> = {
  CUSTOMER: 'Khách hàng',
  STAFF: 'Nhà cung cấp',
  ADMIN: 'Quản trị viên',
};

const adminUserRoleToBe: Record<string, string> = {
  'Khách hàng': 'CUSTOMER',
  'Người mua': 'CUSTOMER',
  'Nhà cung cấp': 'STAFF',
  'Đối tác': 'STAFF',
  'Quản trị viên': 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

const adminUserStatusToFe: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Chờ xác minh',
  LOCKED: 'Bị khoá',
};

const adminUserStatusToBe: Record<string, string> = {
  'Hoạt động': 'ACTIVE',
  'Chờ xác minh': 'INACTIVE',
  'Bị khoá': 'LOCKED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
};

function mapAdminUser(raw: any): User & { companyName?: string; address?: string } {
  return {
    ...raw,
    role: (adminUserRoleToFe[raw.role] ?? raw.role ?? 'Khách hàng') as User['role'],
    status: (adminUserStatusToFe[raw.status] ?? raw.status ?? 'Hoạt động') as User['status'],
    avatarUrl: raw.avatarUrl ?? '',
    companyName: raw.role === 'STAFF' ? 'Đối tác vận hành' : '',
    address: raw.address ?? '',
  };
}

function toAdminUserRequest(user: Partial<User> & { companyName?: string }) {
  return {
    fullName: user.fullName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: adminUserRoleToBe[String(user.role ?? 'Khách hàng')] ?? String(user.role ?? 'CUSTOMER'),
    status: adminUserStatusToBe[String(user.status ?? 'Hoạt động')] ?? String(user.status ?? 'ACTIVE'),
    avatarUrl: user.avatarUrl ?? '',
  };
}

function flattenCategories(categories: any[]): any[] {
  return categories.flatMap(category => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}

function mapCategory(raw: any) {
  return {
    ...raw,
    description: raw.description ?? '',
    icon: raw.icon ?? 'Tag',
    productCount: raw.productCount ?? 0,
    children: (raw.children ?? []).map(mapCategory),
  };
}

const productStatusToFe: Record<string, string> = {
  ACTIVE: 'Đang bán',
  OUT_OF_STOCK: 'Hết hàng',
  DISCONTINUED: 'Ngừng kinh doanh',
  COMING_SOON: 'Sắp ra mắt',
  INACTIVE: 'Ngừng kinh doanh',
};

const productStatusToBe: Record<string, string> = {
  'Đang bán': 'ACTIVE',
  'Hết hàng': 'OUT_OF_STOCK',
  'Ngừng kinh doanh': 'DISCONTINUED',
  'Sắp ra mắt': 'COMING_SOON',
  'Dang ban': 'ACTIVE',
  'Het hang': 'OUT_OF_STOCK',
  'Ngung kinh doanh': 'DISCONTINUED',
  'Sap ra mat': 'COMING_SOON',
  'Äang bÃ¡n': 'ACTIVE',
  'Háº¿t hÃ ng': 'OUT_OF_STOCK',
  'Ngá»«ng kinh doanh': 'DISCONTINUED',
  'Sáº¯p ra máº¯t': 'COMING_SOON',
};

const productConditionToFe: Record<string, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Like New',
  USED: 'Qua sử dụng',
  REFURBISHED: 'Like New',
};

const productConditionToBe: Record<string, string> = {
  'Mới': 'NEW',
  'Qua sử dụng': 'USED',
  Moi: 'NEW',
  'Like New': 'LIKE_NEW',
  'Qua su dung': 'USED',
  'Má»›i': 'NEW',
  'Qua sá»­ dá»¥ng': 'USED',
};

function normalizeProductPayload(data: Record<string, unknown>) {
  const payload = { ...data };
  if ('status' in payload) payload.status = toBeStatus(payload.status, productStatusToBe);
  if ('condition' in payload) payload.condition = toBeStatus(payload.condition, productConditionToBe);
  if ('tags' in payload && typeof payload.tags === 'string') {
    payload.tags = String(payload.tags).split(',').map(tag => tag.trim()).filter(Boolean);
  }
  if ('specifications' in payload && typeof payload.specifications === 'string') {
    try {
      payload.specifications = JSON.parse(String(payload.specifications));
    } catch {
      payload.specifications = {};
    }
  }
  return payload;
}

function mapProduct(raw: any): Product & { stock: number; imageCount: number; variantCount: number; primaryImage?: string } {
  const images = (raw.images ?? []).map((image: any) => typeof image === 'string' ? image : image.url).filter(Boolean);
  const variants = raw.variants ?? [];
  return {
    ...raw,
    categoryName: raw.category?.name ?? raw.categoryName ?? '',
    images,
    primaryImage: images[0],
    status: (productStatusToFe[raw.status] ?? raw.status) as Product['status'],
    condition: (productConditionToFe[raw.condition] ?? raw.condition) as Product['condition'],
    variants,
    variantCount: variants.length,
    imageCount: images.length,
    stock: variants.reduce((sum: number, variant: any) => sum + (Number(variant.stock) || 0), 0),
    tags: raw.tags ?? [],
    specifications: raw.specifications ?? {},
    rating: Number(raw.rating ?? 0),
    reviewCount: raw.reviewCount ?? 0,
    soldCount: raw.soldCount ?? 0,
    viewCount: raw.viewCount ?? 0,
  };
}

function mapPromotion(raw: any) {
  return {
    ...raw,
    type: raw.type === 'PERCENTAGE'
      ? 'Phan tram'
      : raw.type === 'FIXED_AMOUNT'
        ? 'So tien'
        : raw.type ?? '',
    startDate: raw.startDate ?? '',
    endDate: raw.endDate ?? '',
    usedCount: raw.usedCount ?? 0,
    usageLimit: raw.usageLimit ?? 0,
    applicableProducts: raw.applicableProducts ?? [],
    applicableCategories: raw.applicableCategories ?? [],
    applicableBrands: raw.applicableBrands ?? [],
  };
}

function mapInventory(raw: any) {
  return {
    ...raw,
    currentStock: raw.stock ?? 0,
    minStock: raw.minStock ?? 0,
    sellingPrice: raw.price ?? 0,
    totalValue: Number(raw.price ?? 0) * Number(raw.stock ?? 0),
    variantId: raw.id,
    updatedAt: raw.updatedAt ?? '',
    imeiSerials: raw.imeiSerials ?? [],
  };
}

function sortClient<T extends Record<string, any>>(data: T[], sort?: SortParams) {
  if (!sort?.field) return data;
  return [...data].sort((a, b) => {
    const left = a[sort.field];
    const right = b[sort.field];
    if (typeof left === 'number' && typeof right === 'number') {
      return sort.direction === 'asc' ? left - right : right - left;
    }
    return sort.direction === 'asc'
      ? String(left ?? '').localeCompare(String(right ?? ''))
      : String(right ?? '').localeCompare(String(left ?? ''));
  });
}

export const adminCategoryApi = {
  async getAll() {
    const categories = await request<any[]>('/categories?includeInactive=true');
    return categories.map(mapCategory);
  },

  async getPaginated(pagination: PaginationParams, sort?: SortParams): Promise<PaginatedResponse<any>> {
    const tree = await this.getAll();
    const all = sortClient(flattenCategories(tree), sort);
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: all.slice(start, start + pagination.pageSize),
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: all.length,
      totalPages: Math.ceil(all.length / pagination.pageSize),
    };
  },

  async create(data: Record<string, unknown>) {
    return mapCategory(await request<any>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }));
  },

  async update(id: string, data: Record<string, unknown>) {
    return mapCategory(await request<any>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }));
  },

  async delete(id: string) {
    await request<void>(`/admin/categories/${id}`, { method: 'DELETE' });
  },
};

export const adminProductApi = {
  async getPaginated(
    pagination: PaginationParams,
    sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ): Promise<PaginatedResponse<ReturnType<typeof mapProduct>>> {
    const page = await requestPage<any>(`/products${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: sort?.field || 'updatedAt',
      sortDir: sort?.direction || 'desc',
      search,
      status: toBeStatus(getFilter(filters, 'status'), productStatusToBe),
      categoryId: getFilter(filters, 'categoryId'),
      brand: getFilter(filters, 'brand'),
      condition: toBeStatus(getFilter(filters, 'condition'), productConditionToBe),
    })}`);
    return { ...page, data: page.data.map(mapProduct) };
  },

  async getById(id: string) {
    return mapProduct(await request<any>(`/products/${id}`));
  },

  async getBySlug(slug: string) {
    return mapProduct(await request<any>(`/products/${encodeURIComponent(slug)}/by-slug`));
  },

  async create(data: Record<string, unknown>) {
    return mapProduct(await request<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(normalizeProductPayload(data)),
    }));
  },

  async update(id: string, data: Record<string, unknown>) {
    return mapProduct(await request<any>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(normalizeProductPayload(data)),
    }));
  },

  async delete(id: string) {
    await request<void>(`/admin/products/${id}`, { method: 'DELETE' });
  },

  async getVariants(productId: string) {
    return request<any[]>(`/products/${productId}/variants`);
  },

  async createVariant(productId: string, data: Record<string, unknown>) {
    return request<any>(`/admin/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVariant(productId: string, id: string, data: Record<string, unknown>) {
    return request<any>(`/admin/products/${productId}/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteVariant(productId: string, id: string) {
    await request<void>(`/admin/products/${productId}/variants/${id}`, { method: 'DELETE' });
  },

  async getImages(productId: string) {
    return request<any[]>(`/products/${productId}/images`);
  },

  async createImage(productId: string, data: Record<string, unknown>) {
    return request<any>(`/admin/products/${productId}/images`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateImage(productId: string, id: string, data: Record<string, unknown>) {
    return request<any>(`/admin/products/${productId}/images/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteImage(productId: string, id: string) {
    await request<void>(`/admin/products/${productId}/images/${id}`, { method: 'DELETE' });
  },
};

export const adminPromotionReadApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    _filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/promotions${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search,
    })}`);
    return { ...page, data: page.data.map(mapPromotion) };
  },
};

export const adminPromotionApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/admin/promotions${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      search,
    })}`);
    return { ...page, data: page.data.map(mapPromotion) };
  },

  async getById(id: string) {
    return mapPromotion(await request<any>(`/admin/promotions/${id}`));
  },

  async create(data: Record<string, unknown>) {
    return mapPromotion(await request<any>('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }));
  },

  async update(id: string, data: Record<string, unknown>) {
    return mapPromotion(await request<any>(`/admin/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }));
  },

  async toggle(id: string) {
    return mapPromotion(await request<any>(`/admin/promotions/${id}/toggle`, { method: 'PATCH' }));
  },

  async delete(id: string) {
    await request<void>(`/admin/promotions/${id}`, { method: 'DELETE' });
  },
};

export const adminInventoryApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/admin/inventory${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      brand: getFilter(filters, 'brand'),
      search,
    })}`);
    return { ...page, data: page.data.map(mapInventory) };
  },

  async getById(id: string) {
    return mapInventory(await request<any>(`/admin/inventory/${id}`));
  },

  async lowStock(limit = 20) {
    const data = await request<any[]>(`/admin/inventory/low-stock${toQuery({ limit })}`);
    return data.map(mapInventory);
  },

  async adjust(id: string, data: { stock: number; minStock?: number; reason?: string }) {
    return mapInventory(await request<any>(`/admin/inventory/${id}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }));
  },

  async movements(productId: string, pagination: PaginationParams) {
    return requestPage<any>(`/admin/inventory/${productId}/movements${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
    })}`);
  },
};

export const adminReturnApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    return requestPage<any>(`/admin/returns${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      search,
    })}`);
  },

  async getById(id: string) {
    return request<any>(`/admin/returns/${id}`);
  },

  async updateStatus(id: string, status: string, note?: string) {
    return request<any>(`/admin/returns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  async resolveDispute(id: string, resolution: string) {
    return request<any>(`/admin/returns/${id}/dispute-resolution`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  },
};

export const adminWarrantyApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    return requestPage<any>(`/admin/warranty-claims${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      search,
    })}`);
  },

  async getById(id: string) {
    return request<any>(`/admin/warranty-claims/${id}`);
  },

  async updateStatus(id: string, status: string, note?: string) {
    return request<any>(`/admin/warranty-claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },
};

export const adminReviewApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    return requestPage<any>(`/admin/reviews${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      rating: getFilter(filters, 'rating'),
      search,
    })}`);
  },

  async approve(id: string) {
    return request<any>(`/admin/reviews/${id}/approve`, { method: 'PATCH' });
  },

  async hide(id: string) {
    return request<any>(`/admin/reviews/${id}/hide`, { method: 'PATCH' });
  },

  async delete(id: string) {
    await request<void>(`/admin/reviews/${id}`, { method: 'DELETE' });
  },
};

export const adminTradeInApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    return requestPage<any>(`/admin/trade-in${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      search,
    })}`);
  },

  async getById(id: string) {
    return request<any>(`/admin/trade-in/${id}`);
  },

  async valuate(id: string, finalValuation: number, adminNote?: string) {
    return request<any>(`/admin/trade-in/${id}/valuate`, {
      method: 'PATCH',
      body: JSON.stringify({ finalValuation, adminNote }),
    });
  },

  async complete(id: string) {
    return request<any>(`/admin/trade-in/${id}/complete`, { method: 'PATCH' });
  },

  async updateStatus(id: string, status: string, adminNote?: string) {
    return request<any>(`/admin/trade-in/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNote }),
    });
  },
};

export const adminOrderApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/admin/orders${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: toBeStatus(getFilter(filters, 'status'), orderStatusToBe),
      paymentStatus: toBeStatus(getFilter(filters, 'paymentStatus'), paymentStatusToBe),
      search,
    })}`);
    return { ...page, data: page.data.map(mapOrder) };
  },

  async getById(id: string) {
    return mapOrder(await request<any>(`/admin/orders/${id}`));
  },

  async updateStatus(id: string, status: string, note?: string) {
    return mapOrder(await request<any>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: toBeStatus(status, orderStatusToBe), note }),
    }));
  },

  async updateNotes(id: string, notes: string) {
    return mapOrder(await request<any>(`/admin/orders/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }));
  },
};

export const adminPaymentApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/admin/payments${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: toBeStatus(getFilter(filters, 'status'), paymentStatusToBe),
      method: toBeStatus(getFilter(filters, 'method'), paymentMethodToBe),
      search,
    })}`);
    return { ...page, data: page.data.map(mapPayment) };
  },

  async getById(id: string) {
    return mapPayment(await request<any>(`/admin/payments/${id}`));
  },

  async getByOrder(orderId: string, orderNumber?: string) {
    const page = await this.getPaginated({ page: 1, pageSize: 1 }, undefined, undefined, orderNumber ?? orderId);
    return page.data[0] ?? null;
  },

  async recordTransaction(id: string, data: { amount: number; method: string; transactionRef: string }) {
    return mapPayment(await request<any>(`/admin/payments/${id}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify({
        paidAmount: data.amount,
        method: toBeStatus(data.method, paymentMethodToBe),
        transactionRef: data.transactionRef,
      }),
    }));
  },

  async markOverdue(id: string) {
    return mapPayment(await request<any>(`/admin/payments/${id}/mark-overdue`, { method: 'PATCH' }));
  },

  async refund(id: string, data: { refundAmount: number; reason: string; method: string }) {
    return mapPayment(await request<any>(`/admin/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({
        refundAmount: data.refundAmount,
        reason: data.reason,
        method: toBeStatus(data.method, paymentMethodToBe),
      }),
    }));
  },
};

export const orderInvoiceApi = {
  async getByOrder(orderId: string) {
    return mapInvoice(await request<any>(`/orders/${orderId}/invoice`));
  },
};

export const adminInvoiceApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/admin/invoices${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      search,
    })}`);
    return { ...page, data: page.data.map(mapInvoice) };
  },

  async getById(id: string) {
    return mapInvoice(await request<any>(`/admin/invoices/${id}`));
  },

  async updateStatus(id: string, status: string) {
    return mapInvoice(await request<any>(`/admin/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }));
  },

  async download(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/invoices/${id}/download`, {
      headers: DEFAULT_ADMIN_HEADERS,
    });
    if (!response.ok) throw new Error(`Download failed ${response.status}`);
    return response.blob();
  },
};

export const customerShipmentApi = {
  async getByOrder(orderId: string) {
    return mapShipment(await request<any>(`/orders/${orderId}/shipment`));
  },
};

export const adminShipmentApi = {
  async getPaginated(
    pagination: PaginationParams,
    _sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ) {
    const page = await requestPage<any>(`/admin/shipments${toQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: getFilter(filters, 'status'),
      search,
    })}`);
    return { ...page, data: page.data.map(mapShipment) };
  },

  async getById(id: string) {
    return mapShipment(await request<any>(`/admin/shipments/${id}`));
  },

  async updateStatus(id: string, status: string) {
    return mapShipment(await request<any>(`/admin/shipments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }));
  },
};

export const adminReportApi = {
  async revenue(from?: string, to?: string) {
    return request<any[]>(`/admin/reports/revenue${toQuery({ from, to })}`);
  },

  async products() {
    return request<any[]>('/admin/reports/products');
  },

  async customers() {
    return request<any[]>('/admin/reports/customers');
  },

  async inventory() {
    return request<any[]>('/admin/reports/inventory');
  },

  async returns() {
    return request<any[]>('/admin/reports/returns');
  },

  async export(type: string) {
    const response = await fetch(`${API_BASE_URL}/admin/reports/export${toQuery({ type })}`, {
      headers: DEFAULT_ADMIN_HEADERS,
    });
    if (!response.ok) throw new Error(`Export failed ${response.status}`);
    return response.blob();
  },
};

export const adminBannerApi = {
  async getAll() {
    return request<any[]>('/admin/banners');
  },

  async create(data: Record<string, unknown>) {
    return request<any>('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    return request<any>(`/admin/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    await request<void>(`/admin/banners/${id}`, { method: 'DELETE' });
  },
};

export const adminUserApi = {
  async getPaginated(
    pagination: PaginationParams,
    sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ): Promise<PaginatedResponse<User & { companyName?: string; address?: string }>> {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...(search ? { search } : {}),
    };
    const role = getFilter(filters, 'role');
    const status = getFilter(filters, 'status');
    if (role) params.role = adminUserRoleToBe[String(role)] ?? String(role);
    if (status) params.status = adminUserStatusToBe[String(status)] ?? String(status);

    const page = await requestPage<any>(`/admin/users${toQuery(params)}`);
    let data = page.data.map(mapAdminUser);
    if (sort?.field) {
      data = [...data].sort((a: any, b: any) => {
        const left = String(a[sort.field] ?? '');
        const right = String(b[sort.field] ?? '');
        return sort.direction === 'desc' ? right.localeCompare(left) : left.localeCompare(right);
      });
    }
    return { ...page, data };
  },

  async getById(id: string): Promise<User & { companyName?: string; address?: string }> {
    return mapAdminUser(await request<any>(`/admin/users/${id}`));
  },

  async update(id: string, current: User, patch: Partial<User>): Promise<User & { companyName?: string; address?: string }> {
    return mapAdminUser(await request<any>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(toAdminUserRequest({ ...current, ...patch })),
    }));
  },

  async updateStatus(id: string, status: User['status'] | string): Promise<User & { companyName?: string; address?: string }> {
    return mapAdminUser(await request<any>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: adminUserStatusToBe[String(status)] ?? String(status) }),
    }));
  },

  async delete(id: string): Promise<void> {
    await request<void>(`/admin/users/${id}`, { method: 'DELETE' });
  },
};

// -------------------------------------------------------
// Settings: GET /api/v1/admin/settings, PATCH /api/v1/admin/settings
// BE returns array of { key, value (JsonNode), updatedAt }
// -------------------------------------------------------
export const adminSettingsApi = {
  /** Returns settings as a plain key→value record (value may be string, number, boolean). */
  async getAll(): Promise<Record<string, unknown>> {
    const rows = await request<{ key: string; value: unknown; updatedAt?: string }[]>('/admin/settings');
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },

  /** Sends a partial patch of settings. Each value is serialized as JSON. */
  async patch(updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    // BE expects { settings: { key: JsonNode } }
    const rows = await request<{ key: string; value: unknown; updatedAt?: string }[]>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ settings: updates }),
    });
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },
};

// -------------------------------------------------------
// Email Templates: GET/POST/PATCH/DELETE /api/v1/admin/email-templates
// BE returns { id, templateKey, subject, body, isActive, updatedAt }
// -------------------------------------------------------
export const adminEmailTemplateApi = {
  async getAll() {
    return request<any[]>('/admin/email-templates');
  },

  async create(data: { templateKey: string; subject: string; body: string; isActive?: boolean }) {
    return request<any>('/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: { templateKey: string; subject: string; body: string; isActive?: boolean }) {
    return request<any>(`/admin/email-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async preview(id: string, variables?: Record<string, string>) {
    return request<{ subject: string; body: string }>(`/admin/email-templates/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify({ variables: variables ?? {} }),
    });
  },

  async delete(id: string) {
    await request<void>(`/admin/email-templates/${id}`, { method: 'DELETE' });
  },
};

// -------------------------------------------------------
// Branches (Stores): GET/POST/PATCH/DELETE /api/v1/admin/branches
// BA-docs: branch has district, city, lat, lng, workingHours
// -------------------------------------------------------
export interface BeBranch {
  id: string;
  name: string;
  phone: string;
  address: string;
  district?: string;
  city?: string;
  workingHours?: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchFormData {
  name: string;
  phone?: string;
  address?: string;
  district?: string;
  city?: string;
  workingHours?: string;
  lat?: number | null;
  lng?: number | null;
  isActive?: boolean;
}

export const adminBranchApi = {
  async getAll() {
    return request<BeBranch[]>('/admin/branches');
  },

  async create(data: BranchFormData) {
    return request<BeBranch>('/admin/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: BranchFormData) {
    return request<BeBranch>(`/admin/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async toggle(id: string) {
    return request<BeBranch>(`/admin/branches/${id}/toggle`, { method: 'PATCH' });
  },

  async delete(id: string) {
    await request<void>(`/admin/branches/${id}`, { method: 'DELETE' });
  },
};

// -------------------------------------------------------
// Staff: GET/POST/PATCH /api/v1/admin/staff + deactivate
// BA-docs: staff has phone, branchId, branchName, joinedAt
// -------------------------------------------------------
export interface BeStaffMember {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  branchId?: string;
  branchName?: string;
  joinedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFormData {
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  branchId?: string;
  joinedAt?: string;
  isActive?: boolean;
}

export const adminStaffApi = {
  async getAll() {
    return request<BeStaffMember[]>('/admin/staff');
  },

  async getById(id: string) {
    return request<BeStaffMember>(`/admin/staff/${id}`);
  },

  async create(data: StaffFormData) {
    return request<BeStaffMember>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: StaffFormData) {
    return request<BeStaffMember>(`/admin/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deactivate(id: string) {
    return request<BeStaffMember>(`/admin/staff/${id}/deactivate`, { method: 'PATCH' });
  },
};

// -------------------------------------------------------
// Activity Logs: GET /api/v1/admin/activity-logs
// Supports filter: action, entity, userId, search
// Stats: GET /api/v1/admin/activity-logs/stats
//   → { todayCount, weekCount, monthCount, byAction: [{status, count}] }
// -------------------------------------------------------
export interface ActivityLogFilter {
  action?: string;
  entity?: string;
  userId?: string;
  search?: string;
}

export interface ActivityLogStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  byAction: { status: string; count: number }[];
}

export const adminActivityLogApi = {
  async getPaginated(
    pagination: PaginationParams,
    filter?: ActivityLogFilter
  ): Promise<PaginatedResponse<any>> {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...(filter?.action ? { action: filter.action } : {}),
      ...(filter?.entity ? { entity: filter.entity } : {}),
      ...(filter?.userId ? { userId: filter.userId } : {}),
      ...(filter?.search ? { search: filter.search } : {}),
    };
    return requestPage<any>(`/admin/activity-logs${toQuery(params)}`);
  },

  async stats(): Promise<ActivityLogStats> {
    return request<ActivityLogStats>('/admin/activity-logs/stats');
  },
};
