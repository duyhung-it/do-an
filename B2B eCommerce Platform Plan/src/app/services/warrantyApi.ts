// ============================================================
// Service API — Bảo hành & Dịch vụ hậu mãi (Nhóm 40)
// ============================================================

import type {
  Warranty, WarrantyStatus, WarrantyClaim, ClaimStatus, ClaimType,
  PaginationParams, SortParams, ActiveFilter, PaginatedResponse,
} from '../types';

function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function daysRemaining(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
}

function computeStatus(endDate: string): WarrantyStatus {
  const days = daysRemaining(endDate);
  if (days <= 0) return 'Hết hạn';
  if (days <= 30) return 'Sắp hết';
  return 'Còn hạn';
}

// --- Mock Warranties (8 bản ghi) ---
let mockWarranties: Warranty[] = [
  {
    id: 'wrt-001', warrantyNumber: 'BH-2026-001',
    productId: 'p1', productName: 'Thép hình H200',
    orderId: 'ord-001', orderNumber: 'DH-2026-001',
    sellerId: 'sup-001', sellerCompany: 'NCC Thép Miền Nam',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2025-06-01', endDate: '2027-06-01',
    terms: 'Bảo hành chất lượng thép 24 tháng. Áp dụng cho lỗi sản xuất, không bao gồm hư hỏng do thi công sai quy cách.',
    status: 'Còn hạn', createdAt: '2025-06-01',
  },
  {
    id: 'wrt-002', warrantyNumber: 'BH-2026-002',
    productId: 'p2', productName: 'Máy bơm nước Pentax',
    orderId: 'ord-002', orderNumber: 'DH-2026-002',
    sellerId: 'sup-002', sellerCompany: 'NCC Điện Công Nghiệp',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2025-09-15', endDate: '2027-09-15',
    terms: 'Bảo hành 24 tháng. Sửa chữa miễn phí hoặc thay thế nếu lỗi nhà sản xuất.',
    status: 'Còn hạn', createdAt: '2025-09-15',
  },
  {
    id: 'wrt-003', warrantyNumber: 'BH-2026-003',
    productId: 'p3', productName: 'Aptomat Schneider 3P 63A',
    orderId: 'ord-003', orderNumber: 'DH-2026-003',
    sellerId: 'sup-002', sellerCompany: 'NCC Điện Công Nghiệp',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2025-12-01', endDate: '2027-12-01',
    terms: 'Bảo hành 24 tháng theo chính sách Schneider. Đổi mới nếu lỗi nhà SX.',
    status: 'Còn hạn', createdAt: '2025-12-01',
  },
  {
    id: 'wrt-004', warrantyNumber: 'BH-2026-004',
    productId: 'p4', productName: 'Sơn chống rỉ Dulux 5L',
    orderId: 'ord-004', orderNumber: 'DH-2025-010',
    sellerId: 'sup-003', sellerCompany: 'NCC Sơn Dulux',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2025-08-01', endDate: '2026-04-01',
    terms: 'Bảo hành chất lượng sơn 8 tháng. Hoàn tiền nếu không đạt tiêu chuẩn.',
    status: 'Sắp hết', createdAt: '2025-08-01',
  },
  {
    id: 'wrt-005', warrantyNumber: 'BH-2026-005',
    productId: 'p5', productName: 'Gạch men Viglacera 60x60',
    orderId: 'ord-005', orderNumber: 'DH-2025-012',
    sellerId: 'sup-004', sellerCompany: 'VLXD Phú Thọ',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2025-03-01', endDate: '2026-03-25',
    terms: 'Bảo hành 12 tháng. Thay thế gạch bị nứt/vỡ do lỗi sản xuất.',
    status: 'Sắp hết', createdAt: '2025-03-01',
  },
  {
    id: 'wrt-006', warrantyNumber: 'BH-2025-006',
    productId: 'p6', productName: 'Ống nhựa PVC D90',
    orderId: 'ord-006', orderNumber: 'DH-2024-020',
    sellerId: 'sup-005', sellerCompany: 'Đại lý Ống Nước Tiền Phong',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2024-06-01', endDate: '2025-06-01',
    terms: 'Bảo hành 12 tháng chống rò rỉ.',
    status: 'Hết hạn', createdAt: '2024-06-01',
  },
  {
    id: 'wrt-007', warrantyNumber: 'BH-2024-007',
    productId: 'p7', productName: 'Dây điện Cadivi 2.5mm',
    orderId: 'ord-007', orderNumber: 'DH-2024-025',
    sellerId: 'sup-002', sellerCompany: 'NCC Điện Công Nghiệp',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2024-01-15', endDate: '2025-01-15',
    terms: 'Bảo hành 12 tháng. Đổi mới nếu bị đứt/cháy do lỗi SX.',
    status: 'Hết hạn', createdAt: '2024-01-15',
  },
  {
    id: 'wrt-008', warrantyNumber: 'BH-2025-008',
    productId: 'p8', productName: 'Xi măng Hà Tiên PC50',
    orderId: 'ord-008', orderNumber: 'DH-2025-030',
    sellerId: 'sup-006', sellerCompany: 'NCC Xi Măng Hà Tiên',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    startDate: '2025-05-01', endDate: '2025-11-01',
    terms: 'Bảo hành đã bị huỷ do vi phạm điều khoản bảo quản.',
    status: 'Bị huỷ', createdAt: '2025-05-01',
  },
];

// --- Mock Claims (5 bản ghi) ---
let mockClaims: WarrantyClaim[] = [
  {
    id: 'clm-001', claimNumber: 'KN-2026-001',
    warrantyId: 'wrt-001', productId: 'p1', productName: 'Thép hình H200',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    sellerId: 'sup-001', sellerCompany: 'NCC Thép Miền Nam',
    issueDescription: 'Phát hiện thép bị gỉ sét bất thường sau 6 tháng sử dụng, nghi lỗi mạ.',
    claimType: 'Thay thế', imageUrls: [],
    status: 'Đã giải quyết', resolution: 'Đã thay thế 200 cây thép mới. Giao ngày 10/02/2026.',
    resolvedAt: '2026-02-10', note: '', createdAt: '2026-01-20', updatedAt: '2026-02-10',
  },
  {
    id: 'clm-002', claimNumber: 'KN-2026-002',
    warrantyId: 'wrt-002', productId: 'p2', productName: 'Máy bơm nước Pentax',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    sellerId: 'sup-002', sellerCompany: 'NCC Điện Công Nghiệp',
    issueDescription: 'Máy bơm phát tiếng ồn lớn bất thường, áp lực nước giảm 30%.',
    claimType: 'Sửa chữa', imageUrls: [],
    status: 'Đang sửa chữa', note: 'Đã gửi máy bơm đến trung tâm bảo hành ngày 05/03.', createdAt: '2026-03-01', updatedAt: '2026-03-05',
  },
  {
    id: 'clm-003', claimNumber: 'KN-2026-003',
    warrantyId: 'wrt-003', productId: 'p3', productName: 'Aptomat Schneider 3P 63A',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    sellerId: 'sup-002', sellerCompany: 'NCC Điện Công Nghiệp',
    issueDescription: 'Aptomat bị nhảy liên tục dù tải không vượt 50A.',
    claimType: 'Thay thế', imageUrls: [],
    status: 'Đang xem xét', note: '', createdAt: '2026-03-10', updatedAt: '2026-03-10',
  },
  {
    id: 'clm-004', claimNumber: 'KN-2026-004',
    warrantyId: 'wrt-004', productId: 'p4', productName: 'Sơn chống rỉ Dulux 5L',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    sellerId: 'sup-003', sellerCompany: 'NCC Sơn Dulux',
    issueDescription: 'Sơn bong tróc sau 2 tháng thi công, bề mặt đã được xử lý đúng kỹ thuật.',
    claimType: 'Hoàn tiền', imageUrls: [],
    status: 'Từ chối', resolution: 'Sau kiểm tra, xác định bề mặt không đạt yêu cầu trước khi sơn.',
    note: '', createdAt: '2026-02-15', updatedAt: '2026-02-25',
  },
  {
    id: 'clm-005', claimNumber: 'KN-2026-005',
    warrantyId: 'wrt-001', productId: 'p1', productName: 'Thép hình H200',
    buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    sellerId: 'sup-001', sellerCompany: 'NCC Thép Miền Nam',
    issueDescription: 'Lô thép mới cũng phát hiện dấu hiệu gỉ sét nhẹ ở mặt cắt.',
    claimType: 'Sửa chữa', imageUrls: [],
    status: 'Mới tạo', note: 'Chờ NCC phản hồi', createdAt: '2026-03-14', updatedAt: '2026-03-14',
  },
];

function paginate<T>(items: T[], pagination: PaginationParams, sort: SortParams, filters?: ActiveFilter[], search?: string, searchFn?: (item: T, q: string) => boolean): PaginatedResponse<T> {
  let result = [...items];

  if (filters) {
    for (const f of filters) {
      result = result.filter(item => {
        const val = (item as Record<string, unknown>)[f.key];
        return String(val) === String(f.value);
      });
    }
  }

  if (search && searchFn) {
    const q = search.toLowerCase();
    result = result.filter(item => searchFn(item, q));
  }

  if (sort.field) {
    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort.field];
      const bVal = (b as Record<string, unknown>)[sort.field];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sort.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  const total = result.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  const data = result.slice(start, start + pagination.pageSize);

  return { data, total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
}

// --- Public API ---
export const warrantyApi = {
  async getByBuyer(
    buyerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    sort: SortParams = { field: 'endDate', direction: 'asc' },
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<Warranty & { daysRemaining: number }>> {
    await delay();
    const items = mockWarranties
      .filter(w => w.buyerId === buyerId || buyerId === 'all')
      .map(w => ({
        ...w,
        status: w.status === 'Bị huỷ' ? w.status : computeStatus(w.endDate),
        daysRemaining: daysRemaining(w.endDate),
      }));
    return paginate(
      items, pagination, sort, filters, search,
      (item, q) => item.productName.toLowerCase().includes(q) || item.warrantyNumber.toLowerCase().includes(q) || item.sellerCompany.toLowerCase().includes(q),
    );
  },

  async getBySeller(
    sellerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    sort: SortParams = { field: 'endDate', direction: 'asc' },
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<Warranty & { daysRemaining: number }>> {
    await delay();
    const items = mockWarranties
      .filter(w => w.sellerId === sellerId || sellerId === 'all')
      .map(w => ({
        ...w,
        status: w.status === 'Bị huỷ' ? w.status : computeStatus(w.endDate),
        daysRemaining: daysRemaining(w.endDate),
      }));
    return paginate(
      items, pagination, sort, filters, search,
      (item, q) => item.productName.toLowerCase().includes(q) || item.warrantyNumber.toLowerCase().includes(q),
    );
  },

  async create(data: Partial<Warranty>): Promise<Warranty> {
    await delay(300);
    const w: Warranty = {
      id: `wrt-${Date.now()}`,
      warrantyNumber: `BH-2026-${String(mockWarranties.length + 1).padStart(3, '0')}`,
      productId: data.productId || '',
      productName: data.productName || '',
      orderId: data.orderId || '',
      orderNumber: data.orderNumber || '',
      sellerId: data.sellerId || '',
      sellerCompany: data.sellerCompany || '',
      buyerId: data.buyerId || '',
      buyerCompany: data.buyerCompany || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '',
      terms: data.terms || '',
      status: 'Còn hạn',
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockWarranties = [w, ...mockWarranties];
    return w;
  },

  async checkWarranty(productId: string, buyerId: string): Promise<{ isValid: boolean; daysRemaining: number; warranty?: Warranty }> {
    await delay();
    const w = mockWarranties.find(ww => ww.productId === productId && ww.buyerId === buyerId && ww.status !== 'Bị huỷ');
    if (!w) return { isValid: false, daysRemaining: 0 };
    const days = daysRemaining(w.endDate);
    return { isValid: days > 0, daysRemaining: days, warranty: w };
  },

  async getStats(userId: string, role: 'buyer' | 'seller' = 'buyer'): Promise<{
    total: number; active: number; expiringSoon: number; expired: number; cancelled: number;
  }> {
    await delay();
    const items = mockWarranties.filter(w => role === 'buyer' ? (w.buyerId === userId || userId === 'all') : (w.sellerId === userId || userId === 'all'));
    const withStatus = items.map(w => ({
      ...w,
      status: w.status === 'Bị huỷ' ? w.status : computeStatus(w.endDate),
    }));
    return {
      total: withStatus.length,
      active: withStatus.filter(w => w.status === 'Còn hạn').length,
      expiringSoon: withStatus.filter(w => w.status === 'Sắp hết').length,
      expired: withStatus.filter(w => w.status === 'Hết hạn').length,
      cancelled: withStatus.filter(w => w.status === 'Bị huỷ').length,
    };
  },
};

export const warrantyClaimApi = {
  async getByBuyer(
    buyerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    sort: SortParams = { field: 'createdAt', direction: 'desc' },
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<WarrantyClaim>> {
    await delay();
    const items = mockClaims.filter(c => c.buyerId === buyerId || buyerId === 'all');
    return paginate(
      items, pagination, sort, filters, search,
      (item, q) => item.productName.toLowerCase().includes(q) || item.claimNumber.toLowerCase().includes(q),
    );
  },

  async getBySeller(
    sellerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    sort: SortParams = { field: 'createdAt', direction: 'desc' },
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<WarrantyClaim>> {
    await delay();
    const items = mockClaims.filter(c => c.sellerId === sellerId || sellerId === 'all');
    return paginate(
      items, pagination, sort, filters, search,
      (item, q) => item.productName.toLowerCase().includes(q) || item.claimNumber.toLowerCase().includes(q) || item.buyerCompany.toLowerCase().includes(q),
    );
  },

  async create(data: Partial<WarrantyClaim>): Promise<WarrantyClaim> {
    await delay(300);
    const c: WarrantyClaim = {
      id: `clm-${Date.now()}`,
      claimNumber: `KN-2026-${String(mockClaims.length + 1).padStart(3, '0')}`,
      warrantyId: data.warrantyId || '',
      productId: data.productId || '',
      productName: data.productName || '',
      buyerId: data.buyerId || '',
      buyerCompany: data.buyerCompany || '',
      sellerId: data.sellerId || '',
      sellerCompany: data.sellerCompany || '',
      issueDescription: data.issueDescription || '',
      claimType: data.claimType || 'Sửa chữa',
      imageUrls: data.imageUrls || [],
      status: 'Mới tạo',
      note: data.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockClaims = [c, ...mockClaims];
    return c;
  },

  async updateStatus(id: string, status: ClaimStatus, resolution?: string): Promise<WarrantyClaim | null> {
    await delay(200);
    const idx = mockClaims.findIndex(c => c.id === id);
    if (idx === -1) return null;
    mockClaims[idx] = {
      ...mockClaims[idx],
      status,
      resolution: resolution || mockClaims[idx].resolution,
      resolvedAt: ['Đã giải quyết', 'Đã đóng'].includes(status) ? new Date().toISOString() : mockClaims[idx].resolvedAt,
      updatedAt: new Date().toISOString(),
    };
    return mockClaims[idx];
  },

  async getStats(userId: string, role: 'buyer' | 'seller' = 'buyer'): Promise<{
    total: number; newCount: number; reviewing: number; accepted: number;
    rejected: number; repairing: number; resolved: number; closed: number;
    avgResolutionDays: number;
  }> {
    await delay();
    const items = mockClaims.filter(c => role === 'buyer' ? (c.buyerId === userId || userId === 'all') : (c.sellerId === userId || userId === 'all'));
    return {
      total: items.length,
      newCount: items.filter(c => c.status === 'Mới tạo').length,
      reviewing: items.filter(c => c.status === 'Đang xem xét').length,
      accepted: items.filter(c => c.status === 'Chấp nhận').length,
      rejected: items.filter(c => c.status === 'Từ chối').length,
      repairing: items.filter(c => c.status === 'Đang sửa chữa').length,
      resolved: items.filter(c => c.status === 'Đã giải quyết').length,
      closed: items.filter(c => c.status === 'Đã đóng').length,
      avgResolutionDays: 5.2,
    };
  },
};
