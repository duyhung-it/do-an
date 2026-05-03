// ============================================================
// API Ngân sách mua hàng — Budget (Nhóm 33)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  BudgetPlan, BudgetAllocation, BudgetTransaction, BudgetStatus,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock Allocations ---
const mkAlloc = (
  id: string, budgetId: string, dept: string, catName: string | undefined,
  allocated: number, used: number, threshold = 80,
): BudgetAllocation => ({
  id, budgetId, department: dept,
  categoryName: catName, allocatedAmount: allocated,
  usedAmount: used, remainingAmount: allocated - used,
  warningThreshold: threshold,
});

const allocsQ1: BudgetAllocation[] = [
  mkAlloc('alloc-01', 'budget-01', 'Sản xuất', 'Linh kiện điện tử', 500000000, 420000000),
  mkAlloc('alloc-02', 'budget-01', 'Sản xuất', 'Thép & Kim loại', 300000000, 180000000),
  mkAlloc('alloc-03', 'budget-01', 'Kinh doanh', 'Bao bì & Đóng gói', 150000000, 95000000),
  mkAlloc('alloc-04', 'budget-01', 'Hành chính', 'Văn phòng phẩm', 50000000, 32000000),
];

const allocsQ2: BudgetAllocation[] = [
  mkAlloc('alloc-05', 'budget-02', 'Sản xuất', 'Linh kiện điện tử', 600000000, 150000000),
  mkAlloc('alloc-06', 'budget-02', 'Sản xuất', 'Nguyên liệu dệt may', 400000000, 80000000),
  mkAlloc('alloc-07', 'budget-02', 'Kinh doanh', 'Nông sản', 200000000, 45000000),
];

const allocsQ3: BudgetAllocation[] = [
  mkAlloc('alloc-08', 'budget-03', 'Sản xuất', 'Linh kiện điện tử', 550000000, 0),
  mkAlloc('alloc-09', 'budget-03', 'Sản xuất', 'Thép & Kim loại', 350000000, 0),
];

const allocsYear: BudgetAllocation[] = [
  mkAlloc('alloc-10', 'budget-04', 'Sản xuất', undefined, 2000000000, 650000000),
  mkAlloc('alloc-11', 'budget-04', 'Kinh doanh', undefined, 800000000, 140000000),
  mkAlloc('alloc-12', 'budget-04', 'Hành chính', undefined, 200000000, 32000000),
];

// --- Mock Budget Plans ---
const mockBudgets: BudgetPlan[] = [
  {
    id: 'budget-01', companyId: 'comp-001', name: 'Ngân sách Quý I 2025',
    period: 'Quý', startDate: '2025-01-01', endDate: '2025-03-31',
    totalBudget: 1000000000, totalUsed: 727000000,
    allocations: allocsQ1, status: 'Đang thực hiện',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2024-12-20T10:00:00Z',
    createdBy: 'Lê Hoàng Anh', createdAt: '2024-12-15T08:00:00Z', updatedAt: '2025-03-10T14:00:00Z',
  },
  {
    id: 'budget-02', companyId: 'comp-001', name: 'Ngân sách Quý II 2025',
    period: 'Quý', startDate: '2025-04-01', endDate: '2025-06-30',
    totalBudget: 1200000000, totalUsed: 275000000,
    allocations: allocsQ2, status: 'Đã duyệt',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2025-03-10T09:00:00Z',
    createdBy: 'Lê Hoàng Anh', createdAt: '2025-02-28T10:00:00Z', updatedAt: '2025-03-10T09:00:00Z',
  },
  {
    id: 'budget-03', companyId: 'comp-001', name: 'Ngân sách Quý III 2025',
    period: 'Quý', startDate: '2025-07-01', endDate: '2025-09-30',
    totalBudget: 900000000, totalUsed: 0,
    allocations: allocsQ3, status: 'Bản nháp',
    createdBy: 'Lê Hoàng Anh', createdAt: '2025-03-14T10:00:00Z', updatedAt: '2025-03-14T10:00:00Z',
  },
  {
    id: 'budget-04', companyId: 'comp-001', name: 'Ngân sách Năm 2025',
    period: 'Năm', startDate: '2025-01-01', endDate: '2025-12-31',
    totalBudget: 3000000000, totalUsed: 822000000,
    allocations: allocsYear, status: 'Đang thực hiện',
    approvedBy: 'Nguyễn Thị Lan', approvedAt: '2024-12-15T14:00:00Z',
    createdBy: 'Lê Hoàng Anh', createdAt: '2024-12-10T08:00:00Z', updatedAt: '2025-03-12T16:00:00Z',
  },
];

// --- Mock Transactions ---
const mockTransactions: BudgetTransaction[] = [
  { id: 'bt-01', budgetId: 'budget-01', allocationId: 'alloc-01', allocationName: 'Sản xuất / Linh kiện điện tử', orderId: 'order-001', orderNumber: 'DH-2025-00001', amount: 95000000, type: 'Chi tiêu', note: 'Đơn Arduino + cảm biến', createdBy: 'Lê Hoàng Anh', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'bt-02', budgetId: 'budget-01', allocationId: 'alloc-01', allocationName: 'Sản xuất / Linh kiện điện tử', orderId: 'order-005', orderNumber: 'DH-2025-00005', amount: 67500000, type: 'Chi tiêu', note: 'Module WiFi ESP32', createdBy: 'Lê Hoàng Anh', createdAt: '2025-01-22T09:00:00Z' },
  { id: 'bt-03', budgetId: 'budget-01', allocationId: 'alloc-01', allocationName: 'Sản xuất / Linh kiện điện tử', amount: 900000, type: 'Hoàn trả', note: 'Hoàn trả 2 Arduino lỗi (GRN-001)', createdBy: 'Hệ thống', createdAt: '2025-01-28T14:00:00Z' },
  { id: 'bt-04', budgetId: 'budget-01', allocationId: 'alloc-02', allocationName: 'Sản xuất / Thép & Kim loại', orderId: 'order-002', orderNumber: 'DH-2025-00002', amount: 180000000, type: 'Chi tiêu', note: 'Thép hình H200x200', createdBy: 'Trần Văn Minh', createdAt: '2025-02-05T08:00:00Z' },
  { id: 'bt-05', budgetId: 'budget-01', allocationId: 'alloc-03', allocationName: 'Kinh doanh / Bao bì', orderId: 'order-006', orderNumber: 'DH-2025-00006', amount: 48000000, type: 'Chi tiêu', note: 'Thùng carton + băng keo', createdBy: 'Lê Hoàng Anh', createdAt: '2025-02-10T11:00:00Z' },
  { id: 'bt-06', budgetId: 'budget-01', allocationId: 'alloc-03', allocationName: 'Kinh doanh / Bao bì', amount: 660000, type: 'Hoàn trả', note: 'Bồi thường thùng carton ẩm (GRN-006)', createdBy: 'Hệ thống', createdAt: '2025-02-20T09:00:00Z' },
  { id: 'bt-07', budgetId: 'budget-01', allocationId: 'alloc-04', allocationName: 'Hành chính / VPP', amount: 12000000, type: 'Chi tiêu', note: 'Văn phòng phẩm tháng 1', createdBy: 'Nguyễn Thị Hương', createdAt: '2025-01-10T08:00:00Z' },
  { id: 'bt-08', budgetId: 'budget-01', allocationId: 'alloc-04', allocationName: 'Hành chính / VPP', amount: 11000000, type: 'Chi tiêu', note: 'Văn phòng phẩm tháng 2', createdBy: 'Nguyễn Thị Hương', createdAt: '2025-02-08T08:00:00Z' },
  { id: 'bt-09', budgetId: 'budget-01', allocationId: 'alloc-04', allocationName: 'Hành chính / VPP', amount: 9000000, type: 'Chi tiêu', note: 'Văn phòng phẩm tháng 3', createdBy: 'Nguyễn Thị Hương', createdAt: '2025-03-05T08:00:00Z' },
  { id: 'bt-10', budgetId: 'budget-01', allocationId: 'alloc-01', allocationName: 'Sản xuất / Linh kiện điện tử', amount: 120000000, type: 'Chi tiêu', note: 'IC + linh kiện SMD lô 2', createdBy: 'Lê Hoàng Anh', createdAt: '2025-02-18T10:00:00Z' },
  { id: 'bt-11', budgetId: 'budget-01', allocationId: 'alloc-01', allocationName: 'Sản xuất / Linh kiện điện tử', amount: 138500000, type: 'Chi tiêu', note: 'Mạch in PCB + linh kiện lô 3', createdBy: 'Trần Văn Minh', createdAt: '2025-03-02T09:00:00Z' },
  { id: 'bt-12', budgetId: 'budget-01', allocationId: 'alloc-03', allocationName: 'Kinh doanh / Bao bì', amount: 47660000, type: 'Chi tiêu', note: 'Túi PE + nhãn dán lô mới', createdBy: 'Lê Hoàng Anh', createdAt: '2025-03-08T14:00:00Z' },
  { id: 'bt-13', budgetId: 'budget-02', allocationId: 'alloc-05', allocationName: 'Sản xuất / Linh kiện điện tử', amount: 150000000, type: 'Chi tiêu', note: 'Pre-order Q2 linh kiện', createdBy: 'Lê Hoàng Anh', createdAt: '2025-03-12T10:00:00Z' },
  { id: 'bt-14', budgetId: 'budget-02', allocationId: 'alloc-06', allocationName: 'Sản xuất / Nguyên liệu dệt may', amount: 80000000, type: 'Chi tiêu', note: 'Vải cotton đợt Q2', createdBy: 'Trần Văn Minh', createdAt: '2025-03-14T08:00:00Z' },
  { id: 'bt-15', budgetId: 'budget-02', allocationId: 'alloc-07', allocationName: 'Kinh doanh / Nông sản', amount: 45000000, type: 'Chi tiêu', note: 'Gạo ST25 đợt Q2', createdBy: 'Lê Hoàng Anh', createdAt: '2025-03-14T09:00:00Z' },
  { id: 'bt-16', budgetId: 'budget-04', allocationId: 'alloc-10', allocationName: 'Sản xuất', amount: 350000000, type: 'Chi tiêu', note: 'Tổng chi SX Q1', createdBy: 'Hệ thống', createdAt: '2025-03-31T23:59:00Z' },
  { id: 'bt-17', budgetId: 'budget-04', allocationId: 'alloc-10', allocationName: 'Sản xuất', amount: 300000000, type: 'Chi tiêu', note: 'Pre-commit SX Q2', createdBy: 'Hệ thống', createdAt: '2025-03-14T10:00:00Z' },
  { id: 'bt-18', budgetId: 'budget-04', allocationId: 'alloc-11', allocationName: 'Kinh doanh', amount: 140000000, type: 'Chi tiêu', note: 'Tổng chi KD Q1+Q2', createdBy: 'Hệ thống', createdAt: '2025-03-14T10:00:00Z' },
  { id: 'bt-19', budgetId: 'budget-04', allocationId: 'alloc-12', allocationName: 'Hành chính', amount: 32000000, type: 'Chi tiêu', note: 'Tổng chi HC Q1', createdBy: 'Hệ thống', createdAt: '2025-03-14T10:00:00Z' },
  { id: 'bt-20', budgetId: 'budget-01', allocationId: 'alloc-01', allocationName: 'Sản xuất / Linh kiện điện tử', amount: 5000000, type: 'Điều chỉnh', note: 'Điều chỉnh tăng do tỉ giá USD', createdBy: 'Nguyễn Thị Lan', createdAt: '2025-03-10T16:00:00Z' },
];

// --- Helpers ---
function paginateBudget<T>(data: T[], { page, pageSize }: PaginationParams): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortBudget<T>(data: T[], sort?: SortParams): T[] {
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

function filterBudget(data: BudgetPlan[], filters: ActiveFilter[], search: string): BudgetPlan[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string')
      result = result.filter(b => b.status === f.value);
    if (f.key === 'period' && typeof f.value === 'string')
      result = result.filter(b => b.period === f.value);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(b =>
      b.name.toLowerCase().includes(s) ||
      b.createdBy.toLowerCase().includes(s)
    );
  }
  return result;
}

// --- API ---
export const budgetApi = {
  async getByCompany(
    companyId: string,
    pagination: PaginationParams,
    sort?: SortParams,
    filters: ActiveFilter[] = [],
    search = '',
  ): Promise<PaginatedResponse<BudgetPlan>> {
    await delay();
    let data = mockBudgets.filter(b => b.companyId === companyId || companyId === 'all');
    data = filterBudget(data, filters, search);
    data = sortBudget(data, sort) as BudgetPlan[];
    return paginateBudget(data, pagination);
  },

  async getById(id: string): Promise<BudgetPlan | null> {
    await delay();
    return mockBudgets.find(b => b.id === id) ?? null;
  },

  async create(data: Partial<BudgetPlan>): Promise<BudgetPlan> {
    await delay(300);
    const plan: BudgetPlan = {
      id: `budget-${Date.now()}`,
      companyId: data.companyId ?? 'comp-001',
      name: data.name ?? '',
      period: data.period ?? 'Quý',
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      totalBudget: data.totalBudget ?? 0,
      totalUsed: 0,
      allocations: data.allocations ?? [],
      status: 'Bản nháp',
      createdBy: data.createdBy ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBudgets.unshift(plan);
    return plan;
  },

  async update(id: string, data: Partial<BudgetPlan>): Promise<BudgetPlan | null> {
    await delay(300);
    const idx = mockBudgets.findIndex(b => b.id === id);
    if (idx === -1) return null;
    mockBudgets[idx] = { ...mockBudgets[idx], ...data, updatedAt: new Date().toISOString() };
    return mockBudgets[idx];
  },

  async approve(id: string, approver: string): Promise<BudgetPlan | null> {
    await delay(300);
    const idx = mockBudgets.findIndex(b => b.id === id);
    if (idx === -1) return null;
    mockBudgets[idx] = {
      ...mockBudgets[idx],
      status: 'Đã duyệt',
      approvedBy: approver,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockBudgets[idx];
  },

  async updateStatus(id: string, status: BudgetStatus): Promise<BudgetPlan | null> {
    await delay(300);
    const idx = mockBudgets.findIndex(b => b.id === id);
    if (idx === -1) return null;
    mockBudgets[idx] = { ...mockBudgets[idx], status, updatedAt: new Date().toISOString() };
    return mockBudgets[idx];
  },

  async getAllocations(budgetId: string): Promise<BudgetAllocation[]> {
    await delay();
    const plan = mockBudgets.find(b => b.id === budgetId);
    return plan?.allocations ?? [];
  },

  async getTransactions(budgetId: string): Promise<BudgetTransaction[]> {
    await delay();
    return mockTransactions.filter(t => t.budgetId === budgetId);
  },

  async getAllTransactions(companyId: string): Promise<BudgetTransaction[]> {
    await delay();
    const budgetIds = mockBudgets
      .filter(b => b.companyId === companyId || companyId === 'all')
      .map(b => b.id);
    return mockTransactions.filter(t => budgetIds.includes(t.budgetId));
  },

  async checkBudget(allocationId: string, amount: number): Promise<{
    allowed: boolean;
    remaining: number;
    overBy: number;
    warningReached: boolean;
  }> {
    await delay();
    const allAllocs = mockBudgets.flatMap(b => b.allocations);
    const alloc = allAllocs.find(a => a.id === allocationId);
    if (!alloc) return { allowed: false, remaining: 0, overBy: amount, warningReached: false };
    const remaining = alloc.remainingAmount;
    const afterSpend = remaining - amount;
    const usedPercent = ((alloc.usedAmount + amount) / alloc.allocatedAmount) * 100;
    return {
      allowed: afterSpend >= 0,
      remaining,
      overBy: afterSpend < 0 ? Math.abs(afterSpend) : 0,
      warningReached: usedPercent >= alloc.warningThreshold,
    };
  },

  async getOverview(companyId: string): Promise<{
    totalBudgetYear: number;
    totalUsedYear: number;
    remainingYear: number;
    usagePercent: number;
    byDepartment: { department: string; allocated: number; used: number }[];
    monthlyActual: { month: string; actual: number; planned: number }[];
  }> {
    await delay();
    const yearPlan = mockBudgets.find(b => b.companyId === companyId && b.period === 'Năm')
      ?? mockBudgets.find(b => b.companyId === 'comp-001' && b.period === 'Năm');

    if (!yearPlan) {
      return { totalBudgetYear: 0, totalUsedYear: 0, remainingYear: 0, usagePercent: 0, byDepartment: [], monthlyActual: [] };
    }

    const byDept = yearPlan.allocations.map(a => ({
      department: a.department,
      allocated: a.allocatedAmount,
      used: a.usedAmount,
    }));

    const monthlyActual = [
      { month: 'T1', actual: 280000000, planned: 250000000 },
      { month: 'T2', actual: 310000000, planned: 250000000 },
      { month: 'T3', actual: 232000000, planned: 250000000 },
      { month: 'T4', actual: 0, planned: 250000000 },
      { month: 'T5', actual: 0, planned: 250000000 },
      { month: 'T6', actual: 0, planned: 250000000 },
    ];

    return {
      totalBudgetYear: yearPlan.totalBudget,
      totalUsedYear: yearPlan.totalUsed,
      remainingYear: yearPlan.totalBudget - yearPlan.totalUsed,
      usagePercent: Math.round((yearPlan.totalUsed / yearPlan.totalBudget) * 100),
      byDepartment: byDept,
      monthlyActual,
    };
  },
};
