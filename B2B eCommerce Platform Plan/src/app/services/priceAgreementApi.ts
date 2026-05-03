// ============================================================
// API Thoả thuận giá & HĐ khung — Price Agreement (Nhóm 35)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  PriceAgreement, PriceAgreementItem, AgreementOrder, AgreementStatus, AgreementType,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock Items ---
const mkItem = (
  id: string, agId: string, pId: string, pName: string,
  orig: number, agreed: number, minQ: number, maxQ: number, unit: string,
  from: string, to: string,
): PriceAgreementItem => ({
  id, agreementId: agId, productId: pId, productName: pName,
  originalPrice: orig, agreedPrice: agreed,
  discountPercent: Math.round(((orig - agreed) / orig) * 100),
  minQuantity: minQ, maxQuantity: maxQ, unit,
  validFrom: from, validTo: to,
});

const items1: PriceAgreementItem[] = [
  mkItem('pai-01', 'pa-01', 'prod-001', 'Arduino Mega 2560', 480000, 420000, 50, 500, 'Cái', '2025-01-01', '2025-06-30'),
  mkItem('pai-02', 'pa-01', 'prod-002', 'ESP32 DevKit V1', 160000, 140000, 100, 1000, 'Cái', '2025-01-01', '2025-06-30'),
  mkItem('pai-03', 'pa-01', 'prod-003', 'Cảm biến nhiệt DS18B20', 28000, 22000, 200, 2000, 'Cái', '2025-01-01', '2025-06-30'),
  mkItem('pai-04', 'pa-01', 'prod-004', 'Module Relay 4 kênh', 95000, 82000, 50, 300, 'Cái', '2025-01-01', '2025-06-30'),
];

const items2: PriceAgreementItem[] = [
  mkItem('pai-05', 'pa-02', 'prod-101', 'Thép hình H200x200', 2000000, 1850000, 20, 200, 'Cây', '2025-01-01', '2025-12-31'),
  mkItem('pai-06', 'pa-02', 'prod-102', 'Thép ống D114x5', 1500000, 1350000, 10, 100, 'Cây', '2025-01-01', '2025-12-31'),
  mkItem('pai-07', 'pa-02', 'prod-103', 'Thép tấm 6mm', 950000, 880000, 30, 500, 'Tấm', '2025-01-01', '2025-12-31'),
  mkItem('pai-08', 'pa-02', 'prod-104', 'Inox SUS304 ống D48', 320000, 290000, 50, 500, 'Mét', '2025-01-01', '2025-12-31'),
];

const items3: PriceAgreementItem[] = [
  mkItem('pai-09', 'pa-03', 'prod-201', 'Vải cotton CK 100%', 85000, 78000, 500, 10000, 'Mét', '2025-04-01', '2025-09-30'),
  mkItem('pai-10', 'pa-03', 'prod-202', 'Vải polyester TC', 65000, 58000, 500, 8000, 'Mét', '2025-04-01', '2025-09-30'),
  mkItem('pai-11', 'pa-03', 'prod-203', 'Vải thun cá sấu', 72000, 65000, 300, 5000, 'Mét', '2025-04-01', '2025-09-30'),
  mkItem('pai-12', 'pa-03', 'prod-204', 'Vải kaki K65', 90000, 82000, 200, 3000, 'Mét', '2025-04-01', '2025-09-30'),
];

const items4: PriceAgreementItem[] = [
  mkItem('pai-13', 'pa-04', 'prod-301', 'Thùng carton 3 lớp 40x30x25', 12500, 11500, 1000, 20000, 'Cái', '2025-01-01', '2025-12-31'),
  mkItem('pai-14', 'pa-04', 'prod-302', 'Túi PE 30x40cm 50mic', 1100, 950, 5000, 100000, 'Cái', '2025-01-01', '2025-12-31'),
  mkItem('pai-15', 'pa-04', 'prod-303', 'Băng keo OPP 48mm', 15000, 13000, 500, 10000, 'Cuộn', '2025-01-01', '2025-12-31'),
  mkItem('pai-16', 'pa-04', 'prod-304', 'Xốp PE foam 5mm', 8500, 7500, 200, 5000, 'Tấm', '2025-01-01', '2025-12-31'),
];

const items5: PriceAgreementItem[] = [
  mkItem('pai-17', 'pa-05', 'prod-401', 'Gạo ST25 Sóc Trăng', 22000, 19500, 1000, 50000, 'Kg', '2025-03-01', '2025-08-31'),
  mkItem('pai-18', 'pa-05', 'prod-402', 'Cà phê Robusta rang', 180000, 160000, 100, 5000, 'Kg', '2025-03-01', '2025-08-31'),
  mkItem('pai-19', 'pa-05', 'prod-403', 'Hạt điều W320', 280000, 250000, 200, 3000, 'Kg', '2025-03-01', '2025-08-31'),
  mkItem('pai-20', 'pa-05', 'prod-404', 'Tiêu đen Phú Quốc', 200000, 175000, 100, 2000, 'Kg', '2025-03-01', '2025-08-31'),
];

// --- Mock Agreements ---
const mockAgreements: PriceAgreement[] = [
  {
    id: 'pa-01', agreementNumber: 'TT-2025-001', type: 'Thoả thuận giá',
    title: 'TT giá linh kiện điện tử H1/2025',
    sellerId: 'sup-01', sellerName: 'Nguyễn Văn Hải', sellerCompany: 'Công ty TNHH Điện tử Phương Nam',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: items1, totalContractValue: 500000000, usedValue: 176000000,
    startDate: '2025-01-01', endDate: '2025-06-30', status: 'Hiệu lực',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2024-12-28T10:00:00Z',
    note: 'Giá ưu đãi cho đơn SL lớn, áp dụng 6 tháng', createdAt: '2024-12-20T08:00:00Z', updatedAt: '2025-03-10T14:00:00Z',
  },
  {
    id: 'pa-02', agreementNumber: 'TT-2025-002', type: 'HĐ khung',
    title: 'HĐ khung thép xây dựng năm 2025',
    sellerId: 'sup-02', sellerName: 'Lê Văn Thành', sellerCompany: 'Tập đoàn Thép Hoà Phát',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: items2, totalContractValue: 2000000000, usedValue: 252500000,
    startDate: '2025-01-01', endDate: '2025-12-31', status: 'Hiệu lực',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2024-12-25T09:00:00Z',
    note: 'HĐ khung cả năm, giá cố định theo quý. Giao hàng trong 2 tuần.', createdAt: '2024-12-18T10:00:00Z', updatedAt: '2025-03-13T10:00:00Z',
  },
  {
    id: 'pa-03', agreementNumber: 'TT-2025-003', type: 'Thoả thuận giá',
    title: 'TT giá vải cotton Q2-Q3/2025',
    sellerId: 'sup-04', sellerName: 'Trương Thị Hoa', sellerCompany: 'Tập đoàn Dệt may Thành Công',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: items3, totalContractValue: 800000000, usedValue: 0,
    startDate: '2025-04-01', endDate: '2025-09-30', status: 'Chờ duyệt',
    note: 'Vải đạt chuẩn Oeko-Tex. Giao theo đợt 2 tuần/lần.', createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-03-10T09:00:00Z',
  },
  {
    id: 'pa-04', agreementNumber: 'TT-2025-004', type: 'HĐ khung',
    title: 'HĐ khung bao bì đóng gói 2025',
    sellerId: 'sup-05', sellerName: 'Võ Văn Hùng', sellerCompany: 'Công ty TNHH Bao bì Toàn Cầu',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: items4, totalContractValue: 600000000, usedValue: 162500000,
    startDate: '2025-01-01', endDate: '2025-12-31', status: 'Hiệu lực',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2024-12-30T14:00:00Z',
    note: 'In logo miễn phí, giao theo đợt hàng tháng', createdAt: '2024-12-22T08:00:00Z', updatedAt: '2025-03-08T09:00:00Z',
  },
  {
    id: 'pa-05', agreementNumber: 'TT-2025-005', type: 'Đơn hàng mở',
    title: 'Đơn hàng mở nông sản 2025',
    sellerId: 'sup-03', sellerName: 'Phạm Minh Tuấn', sellerCompany: 'HTX Nông sản Đồng Tháp',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: items5, totalContractValue: 400000000, usedValue: 45000000,
    startDate: '2025-03-01', endDate: '2025-08-31', status: 'Sắp hết hạn',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2025-02-25T10:00:00Z',
    note: 'Giá linh hoạt theo mùa, ưu tiên hàng organic', createdAt: '2025-02-20T08:00:00Z', updatedAt: '2025-03-14T09:00:00Z',
  },
];

// --- Mock Agreement Orders ---
const mockAgOrders: AgreementOrder[] = [
  { id: 'ao-01', agreementId: 'pa-01', orderId: 'order-001', orderNumber: 'DH-2025-00001', amount: 95000000, date: '2025-01-15' },
  { id: 'ao-02', agreementId: 'pa-01', orderId: 'order-005', orderNumber: 'DH-2025-00005', amount: 81000000, date: '2025-02-20' },
  { id: 'ao-03', agreementId: 'pa-02', orderId: 'order-002', orderNumber: 'DH-2025-00002', amount: 252500000, date: '2025-02-05' },
  { id: 'ao-04', agreementId: 'pa-04', orderId: 'order-006', orderNumber: 'DH-2025-00006', amount: 115000000, date: '2025-02-10' },
  { id: 'ao-05', agreementId: 'pa-04', orderId: 'order-010', orderNumber: 'DH-2025-00010', amount: 47500000, date: '2025-03-08' },
  { id: 'ao-06', agreementId: 'pa-05', orderId: 'order-008', orderNumber: 'DH-2025-00008', amount: 45000000, date: '2025-03-12' },
  { id: 'ao-07', agreementId: 'pa-01', orderId: 'order-012', orderNumber: 'DH-2025-00012', amount: 0, date: '2025-03-01' },
  { id: 'ao-08', agreementId: 'pa-02', orderId: 'order-015', orderNumber: 'DH-2025-00015', amount: 0, date: '2025-03-05' },
  { id: 'ao-09', agreementId: 'pa-04', orderId: 'order-018', orderNumber: 'DH-2025-00018', amount: 0, date: '2025-03-10' },
  { id: 'ao-10', agreementId: 'pa-05', orderId: 'order-020', orderNumber: 'DH-2025-00020', amount: 0, date: '2025-03-14' },
];

// --- Helpers ---
function paginate<T>(data: T[], { page, pageSize }: PaginationParams): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortData<T>(data: T[], sort?: SortParams): T[] {
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

function filterAg(data: PriceAgreement[], filters: ActiveFilter[], search: string): PriceAgreement[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string')
      result = result.filter(a => a.status === f.value);
    if (f.key === 'type' && typeof f.value === 'string')
      result = result.filter(a => a.type === f.value);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(a =>
      a.agreementNumber.toLowerCase().includes(s) ||
      a.title.toLowerCase().includes(s) ||
      a.sellerCompany.toLowerCase().includes(s) ||
      a.buyerCompany.toLowerCase().includes(s)
    );
  }
  return result;
}

// --- API ---
export const priceAgreementApi = {
  async getByBuyer(
    buyerId: string, pagination: PaginationParams,
    sort?: SortParams, filters: ActiveFilter[] = [], search = '',
  ): Promise<PaginatedResponse<PriceAgreement>> {
    await delay();
    let data = mockAgreements.filter(a => a.buyerId === buyerId || buyerId === 'all');
    data = filterAg(data, filters, search);
    data = sortData(data, sort) as PriceAgreement[];
    return paginate(data, pagination);
  },

  async getBySeller(
    sellerId: string, pagination: PaginationParams,
    sort?: SortParams, filters: ActiveFilter[] = [], search = '',
  ): Promise<PaginatedResponse<PriceAgreement>> {
    await delay();
    let data = mockAgreements.filter(a => a.sellerId === sellerId || sellerId === 'all');
    data = filterAg(data, filters, search);
    data = sortData(data, sort) as PriceAgreement[];
    return paginate(data, pagination);
  },

  async getById(id: string): Promise<PriceAgreement | null> {
    await delay();
    return mockAgreements.find(a => a.id === id) ?? null;
  },

  async create(data: Partial<PriceAgreement>): Promise<PriceAgreement> {
    await delay(300);
    const count = mockAgreements.length + 1;
    const agreement: PriceAgreement = {
      id: `pa-${Date.now()}`,
      agreementNumber: `TT-2025-${String(count).padStart(3, '0')}`,
      type: data.type ?? 'Thoả thuận giá',
      title: data.title ?? '',
      sellerId: data.sellerId ?? '',
      sellerName: data.sellerName ?? '',
      sellerCompany: data.sellerCompany ?? '',
      buyerId: data.buyerId ?? '',
      buyerName: data.buyerName ?? '',
      buyerCompany: data.buyerCompany ?? '',
      items: data.items ?? [],
      totalContractValue: data.totalContractValue ?? 0,
      usedValue: 0,
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      status: 'Bản nháp',
      note: data.note ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAgreements.unshift(agreement);
    return agreement;
  },

  async update(id: string, data: Partial<PriceAgreement>): Promise<PriceAgreement | null> {
    await delay(300);
    const idx = mockAgreements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    mockAgreements[idx] = { ...mockAgreements[idx], ...data, updatedAt: new Date().toISOString() };
    return mockAgreements[idx];
  },

  async approve(id: string, approver: string): Promise<PriceAgreement | null> {
    await delay(300);
    const idx = mockAgreements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    mockAgreements[idx] = {
      ...mockAgreements[idx], status: 'Hiệu lực',
      approvedBy: approver, approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockAgreements[idx];
  },

  async cancel(id: string): Promise<boolean> {
    await delay(300);
    const idx = mockAgreements.findIndex(a => a.id === id);
    if (idx === -1) return false;
    mockAgreements[idx] = { ...mockAgreements[idx], status: 'Đã huỷ', updatedAt: new Date().toISOString() };
    return true;
  },

  async getOrders(agreementId: string): Promise<AgreementOrder[]> {
    await delay();
    return mockAgOrders.filter(o => o.agreementId === agreementId);
  },

  async getItemPrices(agreementId: string): Promise<PriceAgreementItem[]> {
    await delay();
    const ag = mockAgreements.find(a => a.id === agreementId);
    return ag?.items ?? [];
  },

  async getStats(userId: string, role: 'buyer' | 'seller'): Promise<{
    total: number; active: number; expiringSoon: number; expired: number; avgDiscount: number;
  }> {
    await delay();
    const data = role === 'buyer'
      ? mockAgreements.filter(a => a.buyerId === userId || userId === 'all')
      : mockAgreements.filter(a => a.sellerId === userId || userId === 'all');
    return {
      total: data.length,
      active: data.filter(a => a.status === 'Hiệu lực').length,
      expiringSoon: data.filter(a => a.status === 'Sắp hết hạn').length,
      expired: data.filter(a => a.status === 'Đã hết hạn').length,
      avgDiscount: 12.5,
    };
  },
};
