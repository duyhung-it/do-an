// ============================================================
// API Biên bản nhận hàng & QC — GRN (Nhóm 31)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  GoodsReceivedNote, GRNStatus, GRNItem, GRNStats,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock Data ---
const mockGRNs: GoodsReceivedNote[] = [
  {
    id: 'grn-01',
    grnNumber: 'GRN-2025-001',
    orderId: 'order-001',
    orderNumber: 'DH-2025-00001',
    buyerId: 'user-001',
    buyerName: 'Lê Hoàng Anh',
    supplierId: 'sup-01',
    supplierName: 'Công ty TNHH Điện tử Phương Nam',
    items: [
      { productId: 'prod-001', productName: 'Bo mạch Arduino Mega 2560', orderedQty: 100, receivedQty: 100, acceptedQty: 98, defectQty: 2, defectReason: 'Hàng hư hỏng', defectNote: 'Chân hàn bị gãy', unit: 'Cái' },
      { productId: 'prod-002', productName: 'Cảm biến nhiệt độ DS18B20', orderedQty: 200, receivedQty: 200, acceptedQty: 200, defectQty: 0, unit: 'Cái' },
    ],
    qualityScore: 4,
    overallNote: 'Hàng đóng gói cẩn thận, giao đúng hẹn. 2 board bị lỗi chân hàn.',
    imageUrls: [],
    status: 'Đã xác nhận',
    receivedAt: '2025-03-10T09:00:00Z',
    confirmedAt: '2025-03-10T10:30:00Z',
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-03-10T10:30:00Z',
  },
  {
    id: 'grn-02',
    grnNumber: 'GRN-2025-002',
    orderId: 'order-002',
    orderNumber: 'DH-2025-00002',
    buyerId: 'user-001',
    buyerName: 'Lê Hoàng Anh',
    supplierId: 'sup-02',
    supplierName: 'Tập đoàn Thép Hoà Phát',
    items: [
      { productId: 'prod-005', productName: 'Thép hình H200x200 Q235', orderedQty: 50, receivedQty: 48, acceptedQty: 48, defectQty: 0, unit: 'Cây', defectReason: 'Thiếu số lượng', defectNote: 'Thiếu 2 cây, NCC hẹn giao bù' },
    ],
    qualityScore: 3,
    overallNote: 'Giao thiếu 2 cây, chất lượng thép đạt tiêu chuẩn. Chờ NCC giao bù.',
    imageUrls: [],
    status: 'Có vấn đề',
    receivedAt: '2025-03-08T14:00:00Z',
    linkedReturnId: 'ret-05',
    createdAt: '2025-03-08T14:00:00Z',
    updatedAt: '2025-03-09T08:00:00Z',
  },
  {
    id: 'grn-03',
    grnNumber: 'GRN-2025-003',
    orderId: 'order-003',
    orderNumber: 'DH-2025-00003',
    buyerId: 'user-001',
    buyerName: 'Lê Hoàng Anh',
    supplierId: 'sup-03',
    supplierName: 'Công ty CP Nông sản Việt',
    items: [
      { productId: 'prod-010', productName: 'Gạo ST25 xuất khẩu', orderedQty: 500, receivedQty: 500, acceptedQty: 500, defectQty: 0, unit: 'Bao' },
      { productId: 'prod-011', productName: 'Cà phê Robusta rang xay', orderedQty: 100, receivedQty: 100, acceptedQty: 100, defectQty: 0, unit: 'Gói' },
    ],
    qualityScore: 5,
    overallNote: 'Hàng đạt chất lượng xuất khẩu, đóng gói rất tốt. Giao đúng hẹn.',
    imageUrls: [],
    status: 'Đã xác nhận',
    receivedAt: '2025-03-12T08:30:00Z',
    confirmedAt: '2025-03-12T09:00:00Z',
    createdAt: '2025-03-12T08:30:00Z',
    updatedAt: '2025-03-12T09:00:00Z',
  },
  {
    id: 'grn-04',
    grnNumber: 'GRN-2025-004',
    orderId: 'order-004',
    orderNumber: 'DH-2025-00004',
    buyerId: 'user-001',
    buyerName: 'Lê Hoàng Anh',
    supplierId: 'sup-04',
    supplierName: 'Tập đoàn Dệt may Thành Công',
    items: [
      { productId: 'prod-004', productName: 'Vải cotton 100% tự nhiên', orderedQty: 1000, receivedQty: 1000, acceptedQty: 980, defectQty: 20, defectReason: 'Sai quy cách', defectNote: 'Màu sắc lệch so với mẫu đã duyệt', unit: 'Mét' },
    ],
    qualityScore: 2,
    overallNote: '20 mét vải bị lệch màu, cần đổi trả. Đã gửi ảnh minh chứng.',
    imageUrls: [],
    status: 'Có vấn đề',
    receivedAt: '2025-03-13T10:00:00Z',
    linkedReturnId: 'ret-06',
    createdAt: '2025-03-13T10:00:00Z',
    updatedAt: '2025-03-14T08:00:00Z',
  },
  {
    id: 'grn-05',
    grnNumber: 'GRN-2025-005',
    orderId: 'order-005',
    orderNumber: 'DH-2025-00005',
    buyerId: 'user-001',
    buyerName: 'Lê Hoàng Anh',
    supplierId: 'sup-01',
    supplierName: 'Công ty TNHH Điện tử Phương Nam',
    items: [
      { productId: 'prod-003', productName: 'Module WiFi ESP32-WROOM', orderedQty: 150, receivedQty: 150, acceptedQty: 150, defectQty: 0, unit: 'Cái' },
    ],
    qualityScore: 5,
    overallNote: 'Hoàn hảo, không có lỗi. Đóng gói chống tĩnh điện tốt.',
    imageUrls: [],
    status: 'Chờ xác nhận',
    receivedAt: '2025-03-14T11:00:00Z',
    createdAt: '2025-03-14T11:00:00Z',
    updatedAt: '2025-03-14T11:00:00Z',
  },
  {
    id: 'grn-06',
    grnNumber: 'GRN-2025-006',
    orderId: 'order-006',
    orderNumber: 'DH-2025-00006',
    buyerId: 'user-001',
    buyerName: 'Lê Hoàng Anh',
    supplierId: 'sup-05',
    supplierName: 'Công ty TNHH Bao bì Toàn Cầu',
    items: [
      { productId: 'prod-020', productName: 'Thùng carton 5 lớp', orderedQty: 2000, receivedQty: 2000, acceptedQty: 1950, defectQty: 50, defectReason: 'Hàng hư hỏng', defectNote: '50 thùng bị ẩm mốc do vận chuyển', unit: 'Cái' },
      { productId: 'prod-021', productName: 'Băng keo đóng hàng', orderedQty: 500, receivedQty: 500, acceptedQty: 500, defectQty: 0, unit: 'Cuộn' },
    ],
    qualityScore: 3,
    overallNote: '50 thùng carton bị ẩm mốc, có thể do xe vận chuyển không che bạt.',
    imageUrls: [],
    status: 'Đã đóng',
    receivedAt: '2025-02-28T09:00:00Z',
    confirmedAt: '2025-03-01T10:00:00Z',
    createdAt: '2025-02-28T09:00:00Z',
    updatedAt: '2025-03-05T14:00:00Z',
  },
];

// --- Helpers ---
function paginateGRN<T>(data: T[], { page, pageSize }: PaginationParams): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortGRN<T>(data: T[], sort?: SortParams): T[] {
  if (!sort?.field) return data;
  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sort.field];
    const bVal = (b as Record<string, unknown>)[sort.field];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number')
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    return 0;
  });
}

function filterGRN(data: GoodsReceivedNote[], filters: ActiveFilter[], search: string): GoodsReceivedNote[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string')
      result = result.filter(g => g.status === f.value);
    if (f.key === 'supplierId' && typeof f.value === 'string')
      result = result.filter(g => g.supplierId === f.value);
    if (f.key === 'qualityScore' && typeof f.value === 'string')
      result = result.filter(g => String(g.qualityScore) === f.value);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(g =>
      g.grnNumber.toLowerCase().includes(s) ||
      g.orderNumber.toLowerCase().includes(s) ||
      g.supplierName.toLowerCase().includes(s) ||
      g.items.some(i => i.productName.toLowerCase().includes(s))
    );
  }
  return result;
}

// --- API ---
export const grnApi = {
  async getByBuyer(
    buyerId: string,
    pagination: PaginationParams,
    sort?: SortParams,
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<GoodsReceivedNote>> {
    await delay();
    let data = mockGRNs.filter(g => g.buyerId === buyerId || buyerId === 'all');
    data = filterGRN(data, filters, search);
    data = sortGRN(data, sort) as GoodsReceivedNote[];
    return paginateGRN(data, pagination);
  },

  async getBySeller(
    supplierId: string,
    pagination: PaginationParams,
    sort?: SortParams,
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<GoodsReceivedNote>> {
    await delay();
    let data = mockGRNs.filter(g => g.supplierId === supplierId || supplierId === 'all');
    data = filterGRN(data, filters, search);
    data = sortGRN(data, sort) as GoodsReceivedNote[];
    return paginateGRN(data, pagination);
  },

  async getByOrderId(orderId: string): Promise<GoodsReceivedNote | null> {
    await delay();
    return mockGRNs.find(g => g.orderId === orderId) ?? null;
  },

  async getById(id: string): Promise<GoodsReceivedNote | null> {
    await delay();
    return mockGRNs.find(g => g.id === id) ?? null;
  },

  async create(data: Partial<GoodsReceivedNote>): Promise<GoodsReceivedNote> {
    await delay(300);
    const grn: GoodsReceivedNote = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-2025-${String(mockGRNs.length + 1).padStart(3, '0')}`,
      orderId: data.orderId ?? '',
      orderNumber: data.orderNumber ?? '',
      buyerId: data.buyerId ?? '',
      buyerName: data.buyerName ?? '',
      supplierId: data.supplierId ?? '',
      supplierName: data.supplierName ?? '',
      items: data.items ?? [],
      qualityScore: data.qualityScore ?? 3,
      overallNote: data.overallNote ?? '',
      imageUrls: data.imageUrls ?? [],
      status: 'Chờ xác nhận',
      receivedAt: data.receivedAt ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGRNs.unshift(grn);
    return grn;
  },

  async confirm(id: string): Promise<GoodsReceivedNote | null> {
    await delay(300);
    const idx = mockGRNs.findIndex(g => g.id === id);
    if (idx === -1) return null;
    mockGRNs[idx] = {
      ...mockGRNs[idx],
      status: 'Đã xác nhận',
      confirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockGRNs[idx];
  },

  async flagIssue(id: string, returnId?: string): Promise<GoodsReceivedNote | null> {
    await delay(300);
    const idx = mockGRNs.findIndex(g => g.id === id);
    if (idx === -1) return null;
    mockGRNs[idx] = {
      ...mockGRNs[idx],
      status: 'Có vấn đề',
      linkedReturnId: returnId,
      updatedAt: new Date().toISOString(),
    };
    return mockGRNs[idx];
  },

  async update(id: string, data: Partial<GoodsReceivedNote>): Promise<GoodsReceivedNote | null> {
    await delay(300);
    const idx = mockGRNs.findIndex(g => g.id === id);
    if (idx === -1) return null;
    mockGRNs[idx] = { ...mockGRNs[idx], ...data, updatedAt: new Date().toISOString() };
    return mockGRNs[idx];
  },

  async getStats(buyerId: string): Promise<GRNStats> {
    await delay();
    const data = mockGRNs.filter(g => g.buyerId === buyerId || buyerId === 'all');
    const avg = data.length > 0 ? data.reduce((s, g) => s + g.qualityScore, 0) / data.length : 0;
    return {
      total: data.length,
      pending: data.filter(g => g.status === 'Chờ xác nhận').length,
      confirmed: data.filter(g => g.status === 'Đã xác nhận').length,
      issues: data.filter(g => g.status === 'Có vấn đề').length,
      avgQuality: Math.round(avg * 10) / 10,
    };
  },

  async getSellerStats(supplierId: string): Promise<GRNStats> {
    await delay();
    const data = mockGRNs.filter(g => g.supplierId === supplierId || supplierId === 'all');
    const avg = data.length > 0 ? data.reduce((s, g) => s + g.qualityScore, 0) / data.length : 0;
    return {
      total: data.length,
      pending: data.filter(g => g.status === 'Chờ xác nhận').length,
      confirmed: data.filter(g => g.status === 'Đã xác nhận').length,
      issues: data.filter(g => g.status === 'Có vấn đề').length,
      avgQuality: Math.round(avg * 10) / 10,
    };
  },
};
