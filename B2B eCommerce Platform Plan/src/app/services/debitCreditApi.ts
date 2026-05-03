// ============================================================
// API Ghi nợ / Ghi có & Đối soát (Nhóm 32)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  DebitCreditNote, NoteType, NoteStatus, DebitCreditStats,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock Data ---
const mockNotes: DebitCreditNote[] = [
  {
    id: 'dcn-01', noteNumber: 'DN-2025-001', type: 'Ghi nợ', reason: 'Phí phát sinh',
    invoiceId: 'inv-01', invoiceNumber: 'HD-2025-00001',
    orderId: 'order-001', orderNumber: 'DH-2025-00001',
    sellerId: 'sup-01', sellerName: 'Công ty TNHH Điện tử Phương Nam',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Phí đóng gói đặc biệt (chống tĩnh điện)', quantity: 1, unitPrice: 2500000, amount: 2500000 },
    ],
    amount: 2500000, tax: 250000, totalAmount: 2750000,
    status: 'Chờ đối soát', description: 'Phí đóng gói chống tĩnh điện cho lô hàng Arduino/ESP32',
    createdAt: '2025-03-10T08:00:00Z', updatedAt: '2025-03-10T08:00:00Z',
  },
  {
    id: 'dcn-02', noteNumber: 'CN-2025-001', type: 'Ghi có', reason: 'Trả hàng',
    invoiceId: 'inv-01', invoiceNumber: 'HD-2025-00001',
    orderId: 'order-001', orderNumber: 'DH-2025-00001',
    sellerId: 'sup-01', sellerName: 'Công ty TNHH Điện tử Phương Nam',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Hoàn trả 2 bo mạch Arduino Mega lỗi chân hàn', quantity: 2, unitPrice: 450000, amount: 900000 },
    ],
    amount: 900000, tax: 90000, totalAmount: 990000,
    status: 'Đã đối soát', description: 'Ghi có do 2 board Arduino bị lỗi (GRN-2025-001)',
    sellerConfirmedAt: '2025-03-11T09:00:00Z', buyerConfirmedAt: '2025-03-11T10:00:00Z',
    createdAt: '2025-03-10T14:00:00Z', updatedAt: '2025-03-11T10:00:00Z',
  },
  {
    id: 'dcn-03', noteNumber: 'DN-2025-002', type: 'Ghi nợ', reason: 'Điều chỉnh giá',
    invoiceId: 'inv-02', invoiceNumber: 'HD-2025-00002',
    orderId: 'order-002', orderNumber: 'DH-2025-00002',
    sellerId: 'sup-02', sellerName: 'Tập đoàn Thép Hoà Phát',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Chênh lệch giá thép H200 (tăng 5% theo thị trường)', quantity: 48, unitPrice: 92500, amount: 4440000 },
    ],
    amount: 4440000, tax: 444000, totalAmount: 4884000,
    status: 'Chờ đối soát', description: 'Điều chỉnh giá thép theo biến động thị trường tháng 3/2025',
    createdAt: '2025-03-09T10:00:00Z', updatedAt: '2025-03-09T10:00:00Z',
  },
  {
    id: 'dcn-04', noteNumber: 'CN-2025-002', type: 'Ghi có', reason: 'Giảm giá',
    invoiceId: 'inv-03', invoiceNumber: 'HD-2025-00003',
    orderId: 'order-003', orderNumber: 'DH-2025-00003',
    sellerId: 'sup-03', sellerName: 'Công ty CP Nông sản Việt',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Chiết khấu mua hàng số lượng lớn (>400 bao gạo)', quantity: 1, unitPrice: 5000000, amount: 5000000 },
    ],
    amount: 5000000, tax: 500000, totalAmount: 5500000,
    status: 'Đã đối soát', description: 'Chiết khấu thương mại cho đơn hàng gạo ST25 số lượng lớn',
    sellerConfirmedAt: '2025-03-13T08:00:00Z', buyerConfirmedAt: '2025-03-13T09:30:00Z',
    createdAt: '2025-03-12T14:00:00Z', updatedAt: '2025-03-13T09:30:00Z',
  },
  {
    id: 'dcn-05', noteNumber: 'CN-2025-003', type: 'Ghi có', reason: 'Trả hàng',
    invoiceId: 'inv-04', invoiceNumber: 'HD-2025-00004',
    orderId: 'order-004', orderNumber: 'DH-2025-00004',
    sellerId: 'sup-04', sellerName: 'Tập đoàn Dệt may Thành Công',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Hoàn trả 20m vải cotton lệch màu', quantity: 20, unitPrice: 85000, amount: 1700000 },
    ],
    amount: 1700000, tax: 170000, totalAmount: 1870000,
    status: 'Chờ đối soát', description: 'Ghi có do 20 mét vải cotton lệch màu (GRN-2025-004)',
    createdAt: '2025-03-14T08:00:00Z', updatedAt: '2025-03-14T08:00:00Z',
  },
  {
    id: 'dcn-06', noteNumber: 'DN-2025-003', type: 'Ghi nợ', reason: 'Phí phát sinh',
    invoiceId: 'inv-05', invoiceNumber: 'HD-2025-00005',
    orderId: 'order-005', orderNumber: 'DH-2025-00005',
    sellerId: 'sup-01', sellerName: 'Công ty TNHH Điện tử Phương Nam',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Phí vận chuyển gấp (giao trong 24h)', quantity: 1, unitPrice: 1500000, amount: 1500000 },
    ],
    amount: 1500000, tax: 150000, totalAmount: 1650000,
    status: 'Bản nháp', description: 'Phụ phí vận chuyển nhanh cho lô ESP32',
    createdAt: '2025-03-14T15:00:00Z', updatedAt: '2025-03-14T15:00:00Z',
  },
  {
    id: 'dcn-07', noteNumber: 'CN-2025-004', type: 'Ghi có', reason: 'Chênh lệch',
    invoiceId: 'inv-06', invoiceNumber: 'HD-2025-00006',
    orderId: 'order-006', orderNumber: 'DH-2025-00006',
    sellerId: 'sup-05', sellerName: 'Công ty TNHH Bao bì Toàn Cầu',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Bồi thường 50 thùng carton bị ẩm mốc', quantity: 50, unitPrice: 12000, amount: 600000 },
    ],
    amount: 600000, tax: 60000, totalAmount: 660000,
    status: 'Đã đối soát', description: 'Bồi thường hàng hư hỏng do vận chuyển (GRN-2025-006)',
    sellerConfirmedAt: '2025-03-03T10:00:00Z', buyerConfirmedAt: '2025-03-03T14:00:00Z',
    createdAt: '2025-03-02T09:00:00Z', updatedAt: '2025-03-03T14:00:00Z',
  },
  {
    id: 'dcn-08', noteNumber: 'DN-2025-004', type: 'Ghi nợ', reason: 'Khác',
    invoiceId: 'inv-02', invoiceNumber: 'HD-2025-00002',
    sellerId: 'sup-02', sellerName: 'Tập đoàn Thép Hoà Phát',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    items: [
      { description: 'Phí lưu kho 5 ngày (2 cây thép giao bù)', quantity: 1, unitPrice: 800000, amount: 800000 },
    ],
    amount: 800000, tax: 80000, totalAmount: 880000,
    status: 'Từ chối', description: 'Buyer từ chối phí lưu kho vì lỗi giao thiếu từ NCC',
    createdAt: '2025-03-09T16:00:00Z', updatedAt: '2025-03-10T11:00:00Z',
  },
];

// --- Helpers ---
function paginateDC<T>(data: T[], { page, pageSize }: PaginationParams): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortDC<T>(data: T[], sort?: SortParams): T[] {
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

function filterDC(data: DebitCreditNote[], filters: ActiveFilter[], search: string): DebitCreditNote[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string')
      result = result.filter(n => n.status === f.value);
    if (f.key === 'type' && typeof f.value === 'string')
      result = result.filter(n => n.type === f.value);
    if (f.key === 'reason' && typeof f.value === 'string')
      result = result.filter(n => n.reason === f.value);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(n =>
      n.noteNumber.toLowerCase().includes(s) ||
      n.invoiceNumber.toLowerCase().includes(s) ||
      n.buyerName.toLowerCase().includes(s) ||
      n.sellerName.toLowerCase().includes(s) ||
      n.description.toLowerCase().includes(s)
    );
  }
  return result;
}

// --- API ---
export const debitCreditApi = {
  async getBySeller(
    sellerId: string,
    pagination: PaginationParams,
    sort?: SortParams,
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<DebitCreditNote>> {
    await delay();
    let data = mockNotes.filter(n => n.sellerId === sellerId || sellerId === 'all');
    data = filterDC(data, filters, search);
    data = sortDC(data, sort) as DebitCreditNote[];
    return paginateDC(data, pagination);
  },

  async getByBuyer(
    buyerId: string,
    pagination: PaginationParams,
    sort?: SortParams,
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<DebitCreditNote>> {
    await delay();
    let data = mockNotes.filter(n => n.buyerId === buyerId || buyerId === 'all');
    data = filterDC(data, filters, search);
    data = sortDC(data, sort) as DebitCreditNote[];
    return paginateDC(data, pagination);
  },

  async getByInvoice(invoiceId: string): Promise<DebitCreditNote[]> {
    await delay();
    return mockNotes.filter(n => n.invoiceId === invoiceId);
  },

  async getById(id: string): Promise<DebitCreditNote | null> {
    await delay();
    return mockNotes.find(n => n.id === id) ?? null;
  },

  async create(data: Partial<DebitCreditNote>): Promise<DebitCreditNote> {
    await delay(300);
    const prefix = data.type === 'Ghi nợ' ? 'DN' : 'CN';
    const count = mockNotes.filter(n => n.type === data.type).length + 1;
    const note: DebitCreditNote = {
      id: `dcn-${Date.now()}`,
      noteNumber: `${prefix}-2025-${String(count).padStart(3, '0')}`,
      type: data.type ?? 'Ghi nợ',
      reason: data.reason ?? 'Khác',
      invoiceId: data.invoiceId ?? '',
      invoiceNumber: data.invoiceNumber ?? '',
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      sellerId: data.sellerId ?? '',
      sellerName: data.sellerName ?? '',
      buyerId: data.buyerId ?? '',
      buyerName: data.buyerName ?? '',
      items: data.items ?? [],
      amount: data.amount ?? 0,
      tax: data.tax ?? 0,
      totalAmount: data.totalAmount ?? 0,
      status: data.status ?? 'Bản nháp',
      description: data.description ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockNotes.unshift(note);
    return note;
  },

  async updateStatus(id: string, status: NoteStatus): Promise<DebitCreditNote | null> {
    await delay(300);
    const idx = mockNotes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    mockNotes[idx] = {
      ...mockNotes[idx],
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'Đã đối soát' ? {
        sellerConfirmedAt: mockNotes[idx].sellerConfirmedAt ?? new Date().toISOString(),
        buyerConfirmedAt: new Date().toISOString(),
      } : {}),
    };
    return mockNotes[idx];
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    const idx = mockNotes.findIndex(n => n.id === id);
    if (idx === -1) return false;
    mockNotes.splice(idx, 1);
    return true;
  },

  async getStats(entityId: string, role: 'seller' | 'buyer'): Promise<DebitCreditStats> {
    await delay();
    const data = role === 'seller'
      ? mockNotes.filter(n => n.sellerId === entityId || entityId === 'all')
      : mockNotes.filter(n => n.buyerId === entityId || entityId === 'all');
    const debits = data.filter(n => n.type === 'Ghi nợ');
    const credits = data.filter(n => n.type === 'Ghi có');
    return {
      total: data.length,
      debitCount: debits.length,
      creditCount: credits.length,
      debitAmount: debits.reduce((s, n) => s + n.totalAmount, 0),
      creditAmount: credits.reduce((s, n) => s + n.totalAmount, 0),
      netAmount: debits.reduce((s, n) => s + n.totalAmount, 0) - credits.reduce((s, n) => s + n.totalAmount, 0),
      pendingCount: data.filter(n => n.status === 'Chờ đối soát').length,
    };
  },
};
