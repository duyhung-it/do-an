// ============================================================
// API Yêu cầu mua hàng nội bộ — Purchase Requisition (Nhóm 30)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  PurchaseRequisition, PRStatus, PRPriority, PRItem, PRStats,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock Data ---
const mockPurchaseRequisitions: PurchaseRequisition[] = [
  {
    id: 'pr-01', prNumber: 'PR-2025-001', companyId: 'comp-01',
    requesterId: 'user-buyer-01', requesterName: 'Nguyễn Văn An',
    department: 'Phòng Kỹ thuật',
    items: [
      { productId: 'prod-01', productName: 'Cáp quang công nghiệp 100m', quantity: 50, estimatedPrice: 450000, unit: 'Cuộn', specification: 'Single-mode, 9/125μm', note: '' },
      { productId: 'prod-02', productName: 'Bộ chuyển đổi quang điện', quantity: 20, estimatedPrice: 1200000, unit: 'Cái', specification: '10/100/1000Mbps', note: 'Cần hàng chính hãng' },
    ],
    totalEstimate: 46500000, priority: 'Cao', status: 'Chờ duyệt',
    justification: 'Bổ sung thiết bị mạng cho dự án mở rộng nhà máy giai đoạn 2',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    createdAt: '2025-03-10T08:00:00Z', updatedAt: '2025-03-10T08:00:00Z',
  },
  {
    id: 'pr-02', prNumber: 'PR-2025-002', companyId: 'comp-01',
    requesterId: 'user-buyer-03', requesterName: 'Lê Hoàng Dũng',
    department: 'Phòng Sản xuất',
    items: [
      { productId: 'prod-03', productName: 'Thép tấm SS400 10mm', quantity: 100, estimatedPrice: 18500000, unit: 'Tấm', specification: '1220x2440mm', note: '' },
      { productId: 'prod-04', productName: 'Ống thép mạ kẽm D60', quantity: 200, estimatedPrice: 285000, unit: 'Cây', specification: 'Dài 6m, dày 2.5mm', note: '' },
    ],
    totalEstimate: 1907000000, priority: 'Khẩn cấp', status: 'Đã duyệt',
    justification: 'Nguyên vật liệu cho đơn hàng XK Nhật Bản — deadline 25/03',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    approvedAt: '2025-03-08T14:30:00Z',
    createdAt: '2025-03-07T09:00:00Z', updatedAt: '2025-03-08T14:30:00Z',
  },
  {
    id: 'pr-03', prNumber: 'PR-2025-003', companyId: 'comp-01',
    requesterId: 'user-buyer-01', requesterName: 'Nguyễn Văn An',
    department: 'Phòng Hành chính',
    items: [
      { productId: 'prod-05', productName: 'Giấy A4 Double A 80gsm', quantity: 100, estimatedPrice: 85000, unit: 'Ram', specification: '', note: '' },
      { productId: 'prod-06', productName: 'Mực in HP 26A', quantity: 30, estimatedPrice: 950000, unit: 'Hộp', specification: 'Chính hãng', note: '' },
      { productId: 'prod-07', productName: 'Bút bi Thiên Long TL-023', quantity: 200, estimatedPrice: 3500, unit: 'Cây', specification: '', note: '' },
    ],
    totalEstimate: 37700000, priority: 'Thấp', status: 'Đã duyệt',
    justification: 'Bổ sung văn phòng phẩm quý II/2025',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    approvedAt: '2025-03-06T10:00:00Z',
    linkedOrderId: 'ord-15',
    createdAt: '2025-03-05T07:30:00Z', updatedAt: '2025-03-06T10:00:00Z',
  },
  {
    id: 'pr-04', prNumber: 'PR-2025-004', companyId: 'comp-01',
    requesterId: 'user-buyer-04', requesterName: 'Phạm Minh Tuấn',
    department: 'Phòng Kỹ thuật',
    items: [
      { productId: 'prod-08', productName: 'Máy khoan Bosch GSB 550', quantity: 5, estimatedPrice: 1450000, unit: 'Cái', specification: 'Công suất 550W', note: '' },
    ],
    totalEstimate: 7250000, priority: 'Trung bình', status: 'Từ chối',
    justification: 'Thay thế máy khoan cũ cho xưởng cơ khí',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    rejectionNote: 'Cần kiểm tra lại kho hiện có, có thể dùng máy từ xưởng 2 chuyển sang',
    createdAt: '2025-03-09T11:00:00Z', updatedAt: '2025-03-10T09:00:00Z',
  },
  {
    id: 'pr-05', prNumber: 'PR-2025-005', companyId: 'comp-01',
    requesterId: 'user-buyer-03', requesterName: 'Lê Hoàng Dũng',
    department: 'Phòng Sản xuất',
    items: [
      { productId: 'prod-09', productName: 'Hóa chất tẩy rửa CN', quantity: 50, estimatedPrice: 320000, unit: 'Can', specification: '25 lít/can', note: 'Cần MSDS đi kèm' },
      { productId: 'prod-10', productName: 'Găng tay cao su CN', quantity: 500, estimatedPrice: 15000, unit: 'Đôi', specification: 'Size L', note: '' },
    ],
    totalEstimate: 23500000, priority: 'Trung bình', status: 'Bản nháp',
    justification: 'Bổ sung hóa chất và bảo hộ cho quý II',
    createdAt: '2025-03-12T14:00:00Z', updatedAt: '2025-03-12T14:00:00Z',
  },
  {
    id: 'pr-06', prNumber: 'PR-2025-006', companyId: 'comp-01',
    requesterId: 'user-buyer-04', requesterName: 'Phạm Minh Tuấn',
    department: 'Phòng Kỹ thuật',
    items: [
      { productId: 'prod-11', productName: 'PLC Siemens S7-1200', quantity: 3, estimatedPrice: 8500000, unit: 'Bộ', specification: 'CPU 1214C DC/DC/DC', note: 'Giao hàng tận xưởng' },
      { productId: 'prod-12', productName: 'Module mở rộng SM 1231', quantity: 6, estimatedPrice: 3200000, unit: 'Cái', specification: 'AI 4x13 Bit', note: '' },
    ],
    totalEstimate: 44700000, priority: 'Cao', status: 'Chờ duyệt',
    justification: 'Nâng cấp hệ thống tự động hóa dây chuyền sản xuất',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    createdAt: '2025-03-13T08:30:00Z', updatedAt: '2025-03-13T08:30:00Z',
  },
  {
    id: 'pr-07', prNumber: 'PR-2025-007', companyId: 'comp-01',
    requesterId: 'user-buyer-01', requesterName: 'Nguyễn Văn An',
    department: 'Phòng Kế toán',
    items: [
      { productId: 'prod-13', productName: 'Máy in laser HP M404dn', quantity: 2, estimatedPrice: 8900000, unit: 'Cái', specification: 'In 2 mặt tự động', note: '' },
    ],
    totalEstimate: 17800000, priority: 'Thấp', status: 'Đã tạo đơn',
    justification: 'Thay máy in cũ cho phòng kế toán',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    approvedAt: '2025-03-04T16:00:00Z',
    linkedOrderId: 'ord-20',
    createdAt: '2025-03-03T10:00:00Z', updatedAt: '2025-03-05T08:00:00Z',
  },
  {
    id: 'pr-08', prNumber: 'PR-2025-008', companyId: 'comp-01',
    requesterId: 'user-buyer-03', requesterName: 'Lê Hoàng Dũng',
    department: 'Phòng Sản xuất',
    items: [
      { productId: 'prod-14', productName: 'Dầu bôi trơn Shell Rimula R4', quantity: 20, estimatedPrice: 520000, unit: 'Thùng', specification: '15W-40, 18L', note: '' },
      { productId: 'prod-15', productName: 'Lọc dầu máy nén khí Atlas', quantity: 10, estimatedPrice: 750000, unit: 'Cái', specification: '1202-8040-00', note: 'Hàng chính hãng' },
    ],
    totalEstimate: 17900000, priority: 'Trung bình', status: 'Đóng',
    justification: 'Bảo trì định kỳ thiết bị Q1/2025 — đã hoàn tất',
    approverId: 'user-buyer-02', approverName: 'Trần Thị Bình',
    approvedAt: '2025-02-20T09:00:00Z',
    createdAt: '2025-02-18T08:00:00Z', updatedAt: '2025-03-01T10:00:00Z',
  },
];

const departments = ['Phòng Kỹ thuật', 'Phòng Sản xuất', 'Phòng Hành chính', 'Phòng Kế toán', 'Phòng Kinh doanh', 'Phòng QA/QC'];

// --- Helpers ---
function paginatePR<T>(
  data: T[],
  { page, pageSize }: PaginationParams,
): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortPR<T>(data: T[], sort?: SortParams): T[] {
  if (!sort?.field) return data;
  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sort.field];
    const bVal = (b as Record<string, unknown>)[sort.field];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });
}

function filterPR(data: PurchaseRequisition[], filters: ActiveFilter[], search: string): PurchaseRequisition[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string') {
      result = result.filter(item => item.status === f.value);
    } else if (f.key === 'department' && typeof f.value === 'string') {
      result = result.filter(item => item.department === f.value);
    } else if (f.key === 'priority' && typeof f.value === 'string') {
      result = result.filter(item => item.priority === f.value);
    }
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(item =>
      item.prNumber.toLowerCase().includes(s) ||
      item.requesterName.toLowerCase().includes(s) ||
      item.department.toLowerCase().includes(s) ||
      item.justification.toLowerCase().includes(s) ||
      item.items.some(i => i.productName.toLowerCase().includes(s))
    );
  }
  return result;
}

// --- API ---
export const prApi = {
  async getByCompany(
    _companyId: string,
    pagination: PaginationParams,
    sort?: SortParams,
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<PurchaseRequisition>> {
    await delay();
    let data = filterPR(mockPurchaseRequisitions, filters, search);
    data = sortPR(data, sort) as PurchaseRequisition[];
    return paginatePR(data, pagination);
  },

  async getById(id: string): Promise<PurchaseRequisition | null> {
    await delay();
    return mockPurchaseRequisitions.find(p => p.id === id) ?? null;
  },

  async create(data: Partial<PurchaseRequisition>): Promise<PurchaseRequisition> {
    await delay(300);
    const newPR: PurchaseRequisition = {
      id: `pr-${Date.now()}`,
      prNumber: `PR-2025-${String(mockPurchaseRequisitions.length + 1).padStart(3, '0')}`,
      companyId: data.companyId ?? 'comp-01',
      requesterId: data.requesterId ?? 'user-buyer-01',
      requesterName: data.requesterName ?? 'Nguyễn Văn An',
      department: data.department ?? '',
      items: data.items ?? [],
      totalEstimate: data.totalEstimate ?? 0,
      priority: data.priority ?? 'Trung bình',
      status: data.status ?? 'Bản nháp',
      justification: data.justification ?? '',
      approverId: data.approverId,
      approverName: data.approverName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPurchaseRequisitions.unshift(newPR);
    return newPR;
  },

  async update(id: string, data: Partial<PurchaseRequisition>): Promise<PurchaseRequisition | null> {
    await delay(300);
    const idx = mockPurchaseRequisitions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    mockPurchaseRequisitions[idx] = {
      ...mockPurchaseRequisitions[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockPurchaseRequisitions[idx];
  },

  async delete(id: string): Promise<boolean> {
    await delay(300);
    const idx = mockPurchaseRequisitions.findIndex(p => p.id === id);
    if (idx === -1) return false;
    mockPurchaseRequisitions.splice(idx, 1);
    return true;
  },

  async approve(id: string, note?: string): Promise<PurchaseRequisition | null> {
    await delay(300);
    const idx = mockPurchaseRequisitions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    mockPurchaseRequisitions[idx] = {
      ...mockPurchaseRequisitions[idx],
      status: 'Đã duyệt',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (note) mockPurchaseRequisitions[idx].rejectionNote = undefined;
    return mockPurchaseRequisitions[idx];
  },

  async reject(id: string, rejectionNote: string): Promise<PurchaseRequisition | null> {
    await delay(300);
    const idx = mockPurchaseRequisitions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    mockPurchaseRequisitions[idx] = {
      ...mockPurchaseRequisitions[idx],
      status: 'Từ chối',
      rejectionNote,
      updatedAt: new Date().toISOString(),
    };
    return mockPurchaseRequisitions[idx];
  },

  async submitForApproval(id: string, approverId: string, approverName: string): Promise<PurchaseRequisition | null> {
    await delay(300);
    const idx = mockPurchaseRequisitions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    mockPurchaseRequisitions[idx] = {
      ...mockPurchaseRequisitions[idx],
      status: 'Chờ duyệt',
      approverId,
      approverName,
      updatedAt: new Date().toISOString(),
    };
    return mockPurchaseRequisitions[idx];
  },

  async createOrderFromPR(id: string): Promise<PurchaseRequisition | null> {
    await delay(300);
    const idx = mockPurchaseRequisitions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    mockPurchaseRequisitions[idx] = {
      ...mockPurchaseRequisitions[idx],
      status: 'Đã tạo đơn',
      linkedOrderId: `ord-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    return mockPurchaseRequisitions[idx];
  },

  async getStats(_companyId: string): Promise<PRStats> {
    await delay();
    const all = mockPurchaseRequisitions;
    return {
      total: all.length,
      draft: all.filter(p => p.status === 'Bản nháp').length,
      pending: all.filter(p => p.status === 'Chờ duyệt').length,
      approved: all.filter(p => p.status === 'Đã duyệt').length,
      rejected: all.filter(p => p.status === 'Từ chối').length,
      ordered: all.filter(p => p.status === 'Đã tạo đơn').length,
    };
  },

  getDepartments(): string[] {
    return departments;
  },

  getApprovers(): { id: string; name: string }[] {
    return [
      { id: 'user-buyer-02', name: 'Trần Thị Bình' },
      { id: 'user-buyer-05', name: 'Nguyễn Hoàng Long' },
      { id: 'user-buyer-06', name: 'Vũ Thị Mai' },
    ];
  },
};
