// ============================================================
// API Đấu giá ngược — Reverse Auction (Nhóm 34)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  ReverseAuction, AuctionBid, AuctionStats, AuctionStatus,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock Data ---
const mockAuctions: ReverseAuction[] = [
  {
    id: 'auction-01', auctionNumber: 'DG-2025-001',
    title: 'Mua linh kiện điện tử lô lớn Q2/2025',
    description: 'Tìm NCC cung cấp Arduino, ESP32, cảm biến nhiệt độ với giá cạnh tranh nhất cho Q2/2025. Ưu tiên NCC có chứng nhận ISO.',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: [
      { id: 'ai-01', productName: 'Arduino Mega 2560', quantity: 200, unit: 'Cái', specification: 'Chính hãng, hộp đầy đủ', maxBudget: 90000000 },
      { id: 'ai-02', productName: 'ESP32 DevKit V1', quantity: 500, unit: 'Cái', specification: 'Module WiFi+BLE, WROOM-32', maxBudget: 75000000 },
      { id: 'ai-03', productName: 'Cảm biến nhiệt độ DS18B20', quantity: 1000, unit: 'Cái', specification: 'Chống nước, dây 1m', maxBudget: 25000000 },
    ],
    startTime: '2025-03-10T08:00:00Z', endTime: '2025-03-20T17:00:00Z',
    maxBudget: 190000000,
    invitedSupplierIds: ['sup-01', 'sup-06', 'sup-07'],
    invitedSupplierNames: ['Công ty TNHH Điện tử Phương Nam', 'Điện tử Sài Gòn', 'IC Center Việt Nam'],
    status: 'Đang mở', totalBids: 3,
    createdAt: '2025-03-08T10:00:00Z', updatedAt: '2025-03-15T09:00:00Z',
  },
  {
    id: 'auction-02', auctionNumber: 'DG-2025-002',
    title: 'Thép xây dựng công trình Nhà máy B',
    description: 'Mua thép hình và thép ống cho dự án xây dựng nhà máy B. Giao hàng trong 2 tuần.',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: [
      { id: 'ai-04', productName: 'Thép hình H200x200', quantity: 100, unit: 'Cây (6m)', specification: 'SS400, dày ≥8mm', maxBudget: 200000000 },
      { id: 'ai-05', productName: 'Thép ống D114x5', quantity: 50, unit: 'Cây (6m)', specification: 'CT3, mạ kẽm', maxBudget: 75000000 },
    ],
    startTime: '2025-03-05T08:00:00Z', endTime: '2025-03-12T17:00:00Z',
    maxBudget: 275000000,
    invitedSupplierIds: ['sup-02', 'sup-08'],
    invitedSupplierNames: ['Tập đoàn Thép Hoà Phát', 'Thép Miền Nam JSC'],
    status: 'Đã chọn NCC', totalBids: 2,
    winnerId: 'sup-02', winnerName: 'Tập đoàn Thép Hoà Phát', winnerBidId: 'bid-03',
    createdAt: '2025-03-03T09:00:00Z', updatedAt: '2025-03-13T10:00:00Z',
  },
  {
    id: 'auction-03', auctionNumber: 'DG-2025-003',
    title: 'Vải cotton CK cho đơn hàng nội địa',
    description: 'Cần 5000m vải cotton CK chất lượng cao cho sản xuất áo polo nội địa Q3.',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: [
      { id: 'ai-06', productName: 'Vải cotton CK 100%', quantity: 5000, unit: 'Mét', specification: '180gsm, khổ 1.6m, 15 màu', maxBudget: 425000000 },
    ],
    startTime: '2025-03-15T08:00:00Z', endTime: '2025-03-25T17:00:00Z',
    maxBudget: 425000000,
    invitedSupplierIds: ['sup-04', 'sup-09'],
    invitedSupplierNames: ['Tập đoàn Dệt may Thành Công', 'Vải Phong Phú'],
    status: 'Đang mở', totalBids: 1,
    createdAt: '2025-03-13T11:00:00Z', updatedAt: '2025-03-15T08:00:00Z',
  },
  {
    id: 'auction-04', auctionNumber: 'DG-2025-004',
    title: 'Bao bì đóng gói sản phẩm 2025',
    description: 'Đấu giá tìm NCC bao bì carton + túi PE cho cả năm 2025.',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    items: [
      { id: 'ai-07', productName: 'Thùng carton 3 lớp', quantity: 10000, unit: 'Cái', specification: '40x30x25cm, sóng B', maxBudget: 120000000 },
      { id: 'ai-08', productName: 'Túi PE co giãn', quantity: 50000, unit: 'Cái', specification: '30x40cm, 50 micron', maxBudget: 50000000 },
    ],
    startTime: '2025-02-20T08:00:00Z', endTime: '2025-03-05T17:00:00Z',
    maxBudget: 170000000,
    invitedSupplierIds: ['sup-05'],
    invitedSupplierNames: ['Công ty TNHH Bao bì Toàn Cầu'],
    status: 'Đã đóng', totalBids: 1,
    createdAt: '2025-02-18T09:00:00Z', updatedAt: '2025-03-05T17:00:00Z',
  },
];

const mockBids: AuctionBid[] = [
  {
    id: 'bid-01', auctionId: 'auction-01', sellerId: 'sup-01',
    sellerName: 'Nguyễn Văn Hải', sellerCompany: 'Công ty TNHH Điện tử Phương Nam',
    items: [
      { auctionItemId: 'ai-01', productName: 'Arduino Mega 2560', unitPrice: 420000, quantity: 200, amount: 84000000 },
      { auctionItemId: 'ai-02', productName: 'ESP32 DevKit V1', unitPrice: 140000, quantity: 500, amount: 70000000 },
      { auctionItemId: 'ai-03', productName: 'Cảm biến DS18B20', unitPrice: 22000, quantity: 1000, amount: 22000000 },
    ],
    totalPrice: 176000000, deliveryDays: 10, paymentTerms: 'Net 30',
    note: 'Hàng chính hãng, bảo hành 12 tháng', rank: 1, isWinner: false,
    createdAt: '2025-03-11T14:00:00Z', updatedAt: '2025-03-11T14:00:00Z',
  },
  {
    id: 'bid-02', auctionId: 'auction-01', sellerId: 'sup-06',
    sellerName: 'Trần Quang Minh', sellerCompany: 'Điện tử Sài Gòn',
    items: [
      { auctionItemId: 'ai-01', productName: 'Arduino Mega 2560', unitPrice: 435000, quantity: 200, amount: 87000000 },
      { auctionItemId: 'ai-02', productName: 'ESP32 DevKit V1', unitPrice: 145000, quantity: 500, amount: 72500000 },
      { auctionItemId: 'ai-03', productName: 'Cảm biến DS18B20', unitPrice: 24000, quantity: 1000, amount: 24000000 },
    ],
    totalPrice: 183500000, deliveryDays: 7, paymentTerms: 'Net 15',
    note: 'Giao nhanh 7 ngày, đã có hàng sẵn kho', rank: 2, isWinner: false,
    createdAt: '2025-03-12T09:00:00Z', updatedAt: '2025-03-12T09:00:00Z',
  },
  {
    id: 'bid-06', auctionId: 'auction-01', sellerId: 'sup-07',
    sellerName: 'Phạm Thị Lan', sellerCompany: 'IC Center Việt Nam',
    items: [
      { auctionItemId: 'ai-01', productName: 'Arduino Mega 2560', unitPrice: 410000, quantity: 200, amount: 82000000 },
      { auctionItemId: 'ai-02', productName: 'ESP32 DevKit V1', unitPrice: 148000, quantity: 500, amount: 74000000 },
      { auctionItemId: 'ai-03', productName: 'Cảm biến DS18B20', unitPrice: 20000, quantity: 1000, amount: 20000000 },
    ],
    totalPrice: 176000000, deliveryDays: 14, paymentTerms: 'Net 30',
    note: 'Giá tốt nhất, giao 2 tuần, có CO/CQ', rank: 3, isWinner: false,
    createdAt: '2025-03-13T11:00:00Z', updatedAt: '2025-03-13T11:00:00Z',
  },
  {
    id: 'bid-03', auctionId: 'auction-02', sellerId: 'sup-02',
    sellerName: 'Lê Văn Thành', sellerCompany: 'Tập đoàn Thép Hoà Phát',
    items: [
      { auctionItemId: 'ai-04', productName: 'Thép hình H200x200', unitPrice: 1850000, quantity: 100, amount: 185000000 },
      { auctionItemId: 'ai-05', productName: 'Thép ống D114x5', unitPrice: 1350000, quantity: 50, amount: 67500000 },
    ],
    totalPrice: 252500000, deliveryDays: 12, paymentTerms: 'Net 45',
    note: 'Thép đạt chuẩn TCVN, có chứng chỉ', rank: 1, isWinner: true,
    createdAt: '2025-03-07T08:00:00Z', updatedAt: '2025-03-13T10:00:00Z',
  },
  {
    id: 'bid-04', auctionId: 'auction-02', sellerId: 'sup-08',
    sellerName: 'Hoàng Minh Tuấn', sellerCompany: 'Thép Miền Nam JSC',
    items: [
      { auctionItemId: 'ai-04', productName: 'Thép hình H200x200', unitPrice: 1920000, quantity: 100, amount: 192000000 },
      { auctionItemId: 'ai-05', productName: 'Thép ống D114x5', unitPrice: 1400000, quantity: 50, amount: 70000000 },
    ],
    totalPrice: 262000000, deliveryDays: 10, paymentTerms: 'Net 30',
    note: 'Giao nhanh 10 ngày, xe tải chuyên dụng', rank: 2, isWinner: false,
    createdAt: '2025-03-08T14:00:00Z', updatedAt: '2025-03-08T14:00:00Z',
  },
  {
    id: 'bid-05', auctionId: 'auction-03', sellerId: 'sup-04',
    sellerName: 'Trương Thị Hoa', sellerCompany: 'Tập đoàn Dệt may Thành Công',
    items: [
      { auctionItemId: 'ai-06', productName: 'Vải cotton CK 100%', unitPrice: 78000, quantity: 5000, amount: 390000000 },
    ],
    totalPrice: 390000000, deliveryDays: 21, paymentTerms: 'Net 60',
    note: 'Vải đã qua kiểm tra Oeko-Tex, bảng màu sẵn', rank: 1, isWinner: false,
    createdAt: '2025-03-15T15:00:00Z', updatedAt: '2025-03-15T15:00:00Z',
  },
  {
    id: 'bid-07', auctionId: 'auction-04', sellerId: 'sup-05',
    sellerName: 'Võ Văn Hùng', sellerCompany: 'Công ty TNHH Bao bì Toàn Cầu',
    items: [
      { auctionItemId: 'ai-07', productName: 'Thùng carton 3 lớp', unitPrice: 11500, quantity: 10000, amount: 115000000 },
      { auctionItemId: 'ai-08', productName: 'Túi PE co giãn', unitPrice: 950, quantity: 50000, amount: 47500000 },
    ],
    totalPrice: 162500000, deliveryDays: 14, paymentTerms: 'Net 30',
    note: 'In logo miễn phí, giao theo đợt', rank: 1, isWinner: false,
    createdAt: '2025-02-25T09:00:00Z', updatedAt: '2025-02-25T09:00:00Z',
  },
];

// --- Helpers ---
function paginateAuction<T>(data: T[], { page, pageSize }: PaginationParams): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortAuction<T>(data: T[], sort?: SortParams): T[] {
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

function filterAuction(data: ReverseAuction[], filters: ActiveFilter[], search: string): ReverseAuction[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string')
      result = result.filter(a => a.status === f.value);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(a =>
      a.auctionNumber.toLowerCase().includes(s) ||
      a.title.toLowerCase().includes(s) ||
      a.description.toLowerCase().includes(s)
    );
  }
  return result;
}

// --- API ---
export const auctionApi = {
  async getByBuyer(
    buyerId: string, pagination: PaginationParams,
    sort?: SortParams, filters: ActiveFilter[] = [], search = '',
  ): Promise<PaginatedResponse<ReverseAuction>> {
    await delay();
    let data = mockAuctions.filter(a => a.buyerId === buyerId || buyerId === 'all');
    data = filterAuction(data, filters, search);
    data = sortAuction(data, sort) as ReverseAuction[];
    return paginateAuction(data, pagination);
  },

  async getBySeller(
    sellerId: string, pagination: PaginationParams,
    sort?: SortParams, filters: ActiveFilter[] = [], search = '',
  ): Promise<PaginatedResponse<ReverseAuction>> {
    await delay();
    let data = mockAuctions.filter(a =>
      a.invitedSupplierIds.includes(sellerId) || sellerId === 'all'
    );
    data = filterAuction(data, filters, search);
    data = sortAuction(data, sort) as ReverseAuction[];
    return paginateAuction(data, pagination);
  },

  async getById(id: string): Promise<ReverseAuction | null> {
    await delay();
    return mockAuctions.find(a => a.id === id) ?? null;
  },

  async create(data: Partial<ReverseAuction>): Promise<ReverseAuction> {
    await delay(300);
    const count = mockAuctions.length + 1;
    const auction: ReverseAuction = {
      id: `auction-${Date.now()}`,
      auctionNumber: `DG-2025-${String(count).padStart(3, '0')}`,
      title: data.title ?? '',
      description: data.description ?? '',
      buyerId: data.buyerId ?? '',
      buyerName: data.buyerName ?? '',
      buyerCompany: data.buyerCompany ?? '',
      items: data.items ?? [],
      startTime: data.startTime ?? new Date().toISOString(),
      endTime: data.endTime ?? '',
      maxBudget: data.maxBudget ?? 0,
      invitedSupplierIds: data.invitedSupplierIds ?? [],
      invitedSupplierNames: data.invitedSupplierNames ?? [],
      status: 'Đang mở',
      totalBids: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAuctions.unshift(auction);
    return auction;
  },

  async updateStatus(id: string, status: AuctionStatus): Promise<ReverseAuction | null> {
    await delay(300);
    const idx = mockAuctions.findIndex(a => a.id === id);
    if (idx === -1) return null;
    mockAuctions[idx] = { ...mockAuctions[idx], status, updatedAt: new Date().toISOString() };
    return mockAuctions[idx];
  },

  async cancel(id: string): Promise<boolean> {
    await delay(300);
    const idx = mockAuctions.findIndex(a => a.id === id);
    if (idx === -1) return false;
    mockAuctions[idx] = { ...mockAuctions[idx], status: 'Đã huỷ', updatedAt: new Date().toISOString() };
    return true;
  },

  // --- Bids ---
  async getBids(auctionId: string): Promise<AuctionBid[]> {
    await delay();
    return mockBids.filter(b => b.auctionId === auctionId).sort((a, b) => a.totalPrice - b.totalPrice);
  },

  async getMyBid(auctionId: string, sellerId: string): Promise<AuctionBid | null> {
    await delay();
    return mockBids.find(b => b.auctionId === auctionId && b.sellerId === sellerId) ?? null;
  },

  async submitBid(data: Partial<AuctionBid>): Promise<AuctionBid> {
    await delay(300);
    const bid: AuctionBid = {
      id: `bid-${Date.now()}`,
      auctionId: data.auctionId ?? '',
      sellerId: data.sellerId ?? '',
      sellerName: data.sellerName ?? '',
      sellerCompany: data.sellerCompany ?? '',
      items: data.items ?? [],
      totalPrice: data.totalPrice ?? 0,
      deliveryDays: data.deliveryDays ?? 0,
      paymentTerms: data.paymentTerms ?? '',
      note: data.note ?? '',
      isWinner: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBids.push(bid);
    // Update auction totalBids
    const aIdx = mockAuctions.findIndex(a => a.id === data.auctionId);
    if (aIdx !== -1) mockAuctions[aIdx].totalBids += 1;
    return bid;
  },

  async selectWinner(auctionId: string, bidId: string): Promise<ReverseAuction | null> {
    await delay(300);
    const aIdx = mockAuctions.findIndex(a => a.id === auctionId);
    if (aIdx === -1) return null;
    const bid = mockBids.find(b => b.id === bidId);
    if (!bid) return null;
    // Mark bid as winner
    bid.isWinner = true;
    mockAuctions[aIdx] = {
      ...mockAuctions[aIdx],
      status: 'Đã chọn NCC',
      winnerId: bid.sellerId,
      winnerName: bid.sellerCompany,
      winnerBidId: bidId,
      updatedAt: new Date().toISOString(),
    };
    return mockAuctions[aIdx];
  },

  async getStats(userId: string, role: 'buyer' | 'seller'): Promise<AuctionStats> {
    await delay();
    const data = role === 'buyer'
      ? mockAuctions.filter(a => a.buyerId === userId || userId === 'all')
      : mockAuctions.filter(a => a.invitedSupplierIds.includes(userId) || userId === 'all');
    const open = data.filter(a => a.status === 'Đang mở').length;
    const closed = data.filter(a => a.status === 'Đã đóng').length;
    const selected = data.filter(a => a.status === 'Đã chọn NCC').length;
    const totalBids = data.reduce((s, a) => s + a.totalBids, 0);
    return {
      total: data.length,
      open, closed, selected,
      avgBidsPerAuction: data.length > 0 ? Math.round((totalBids / data.length) * 10) / 10 : 0,
      avgSavingsPercent: 8.5, // mock
    };
  },
};
