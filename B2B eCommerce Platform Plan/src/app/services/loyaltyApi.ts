// ============================================================
// Loyalty API — CELLPHONES Store (B2C)
// Khách hàng thân thiết: tier, điểm, voucher đổi quà
// ============================================================

import type {
  LoyaltyProgram, LoyaltyTransaction, LoyaltyReward, LoyaltyTxnType,
  PaginationParams, PaginatedResponse,
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

async function backendRequest<T>(path: string, init?: RequestInit): Promise<{ data: T; pagination?: ApiEnvelope<T>['pagination'] }> {
  const headers = new Headers(init?.headers);
  headers.set('X-User-Id', DEFAULT_DEV_USER_ID);
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const payload = await response.json() as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message ?? payload.message ?? `API error ${response.status}`);
  }
  return { data: payload.data, pagination: payload.pagination };
}

// ─── Mock Programs (4 khách hàng tiêu biểu) ────────────────
const mockPrograms: LoyaltyProgram[] = [
  {
    id: 'lp-001', customerId: 'user-001', customerName: 'Nguyễn Văn A',
    tier: 'Vàng', points: 8200, totalSpend: 52000000,
    joinedAt: '2025-06-01', pointsExpiry: '2026-12-31',
    nextTierThreshold: 20000, nextTierName: 'Kim cương',
  },
  {
    id: 'lp-002', customerId: 'user-002', customerName: 'Trần Thị B',
    tier: 'Kim cương', points: 25400, totalSpend: 180000000,
    joinedAt: '2024-01-15', pointsExpiry: '2026-12-31',
  },
  {
    id: 'lp-003', customerId: 'user-003', customerName: 'Lê Văn C',
    tier: 'Bạc', points: 2500, totalSpend: 14000000,
    joinedAt: '2025-09-01', pointsExpiry: '2026-09-01',
    nextTierThreshold: 5000, nextTierName: 'Vàng',
  },
  {
    id: 'lp-004', customerId: 'user-004', customerName: 'Phạm Thị D',
    tier: 'Đồng', points: 500, totalSpend: 2600000,
    joinedAt: '2026-01-10', pointsExpiry: '2026-07-10',
    nextTierThreshold: 2000, nextTierName: 'Bạc',
  },
];

// ─── Mock Transactions ─────────────────────────────────────
const mockTransactions: LoyaltyTransaction[] = [
  { id: 'lt-01', programId: 'lp-001', type: 'Tích', points: 1200, description: 'Đơn hàng CP-2026-015 — iPhone 16 Pro Max', orderId: 'ord-015', createdAt: '2026-03-12' },
  { id: 'lt-02', programId: 'lp-001', type: 'Tích', points: 800, description: 'Đơn hàng CP-2026-012 — AirPods Pro 2', orderId: 'ord-012', createdAt: '2026-03-05' },
  { id: 'lt-03', programId: 'lp-001', type: 'Tiêu', points: -500, description: 'Đổi voucher giảm 50.000₫', createdAt: '2026-02-28' },
  { id: 'lt-04', programId: 'lp-001', type: 'Tích', points: 600, description: 'Đơn hàng CP-2026-008 — Ốp lưng iPhone', orderId: 'ord-008', createdAt: '2026-02-20' },
  { id: 'lt-05', programId: 'lp-001', type: 'Tích', points: 1500, description: 'Đơn hàng CP-2026-005 — Samsung Galaxy S25', orderId: 'ord-005', createdAt: '2026-02-10' },
  { id: 'lt-06', programId: 'lp-001', type: 'Thưởng', points: 500, description: 'Thưởng lên hạng Vàng', createdAt: '2026-02-01' },
  { id: 'lt-07', programId: 'lp-001', type: 'Tích', points: 900, description: 'Đơn hàng CP-2026-003 — Apple Watch S10', orderId: 'ord-003', createdAt: '2026-01-25' },
  { id: 'lt-08', programId: 'lp-002', type: 'Tích', points: 3500, description: 'Đơn hàng VIP CP-2026-020', orderId: 'ord-020', createdAt: '2026-03-10' },
  { id: 'lt-09', programId: 'lp-002', type: 'Tiêu', points: -2000, description: 'Đổi quà tặng VIP', createdAt: '2026-02-15' },
  { id: 'lt-10', programId: 'lp-003', type: 'Tích', points: 400, description: 'Đơn hàng CP-2026-018', orderId: 'ord-018', createdAt: '2026-03-08' },
];

// ─── Mock Rewards ──────────────────────────────────────────
const mockRewards: LoyaltyReward[] = [
  { id: 'rw-01', name: 'Voucher giảm 50.000₫', description: 'Áp dụng cho đơn từ 500.000₫', pointsCost: 500, category: 'Voucher', available: true, stock: 50 },
  { id: 'rw-02', name: 'Voucher giảm 200.000₫', description: 'Áp dụng cho đơn từ 2.000.000₫', pointsCost: 2000, category: 'Voucher', available: true, stock: 30 },
  { id: 'rw-03', name: 'Voucher giảm 1.000.000₫', description: 'Áp dụng cho đơn từ 10.000.000₫', pointsCost: 9000, category: 'Voucher', available: true, stock: 10 },
  { id: 'rw-04', name: 'Giảm 5% phụ kiện', description: 'Mã giảm 5% cho 1 đơn phụ kiện', pointsCost: 1500, category: 'Giảm giá', available: true, stock: 25 },
  { id: 'rw-05', name: 'Miễn phí vận chuyển', description: 'Free ship cho 1 đơn hàng', pointsCost: 800, category: 'Vận chuyển', available: true, stock: 40 },
  { id: 'rw-06', name: 'Bảo hành mở rộng 6 tháng', description: 'Tặng thêm 6 tháng bảo hành', pointsCost: 3000, category: 'Dịch vụ', available: true, stock: 15 },
  { id: 'rw-07', name: 'Ưu tiên trade-in +10%', description: 'Tăng giá trị thu cũ thêm 10%', pointsCost: 5000, category: 'Dịch vụ', available: true, stock: 12 },
  { id: 'rw-08', name: 'Tai nghe AirPods 4', description: 'Tặng AirPods 4 chính hãng', pointsCost: 25000, category: 'Quà tặng', available: true, stock: 5 },
];

// ─── Public API ────────────────────────────────────────────
export const loyaltyApi = {
  async getProgram(customerId: string): Promise<LoyaltyProgram | null> {
    await delay();
    return mockPrograms.find(p => p.customerId === customerId) ?? mockPrograms[0] ?? null;
  },

  async getTransactions(
    customerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    filterType?: LoyaltyTxnType,
  ): Promise<PaginatedResponse<LoyaltyTransaction>> {
    await delay();
    const program = mockPrograms.find(p => p.customerId === customerId) ?? mockPrograms[0];
    let items = mockTransactions.filter(t => t.programId === program?.id);
    if (filterType) items = items.filter(t => t.type === filterType);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: items.slice(start, start + pagination.pageSize),
      total, page: pagination.page, pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  },

  async getRewards(
    pagination: PaginationParams = { page: 1, pageSize: 10 },
  ): Promise<PaginatedResponse<LoyaltyReward>> {
    await delay();
    const items = mockRewards.filter(r => r.available);
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: items.slice(start, start + pagination.pageSize),
      total, page: pagination.page, pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  },

  async redeemReward(rewardId: string, programId: string): Promise<{ success: boolean; code: string; newPoints: number }> {
    await delay(400);
    const reward = mockRewards.find(r => r.id === rewardId);
    const program = mockPrograms.find(p => p.id === programId);
    if (!reward || !program || program.points < reward.pointsCost || reward.stock <= 0) {
      return { success: false, code: '', newPoints: program?.points ?? 0 };
    }
    program.points -= reward.pointsCost;
    reward.stock -= 1;
    const code = `RW-${Date.now().toString(36).toUpperCase()}`;
    return { success: true, code, newPoints: program.points };
  },

  async getAllPrograms(): Promise<LoyaltyProgram[]> {
    await delay();
    return [...mockPrograms];
  },

  async getStats(customerId: string) {
    await delay();
    const program = mockPrograms.find(p => p.customerId === customerId) ?? mockPrograms[0];
    return {
      currentPoints: program?.points ?? 0,
      expiringPoints: 300,
      expiryDate: program?.pointsExpiry ?? '',
      monthlyEarned: [
        { month: 'T10', earned: 450, spent: 0 },
        { month: 'T11', earned: 700, spent: 0 },
        { month: 'T12', earned: 1800, spent: 1000 },
        { month: 'T1', earned: 900, spent: 0 },
        { month: 'T2', earned: 2900, spent: 500 },
        { month: 'T3', earned: 2000, spent: 0 },
      ],
    };
  },

  /** Tính điểm nhận được cho đơn hàng (1 điểm / 100.000₫) */
  calcPointsForOrder(totalAmount: number): number {
    return Math.floor(totalAmount / 100000);
  },

  /** Tính giá trị giảm (1 điểm = 100₫) */
  calcPointValue(points: number): number {
    return points * 100;
  },
};

type BackendTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
type BackendTxnType = 'EARN' | 'REDEEM' | 'EXPIRE' | 'BONUS';
type BackendRewardCategory = 'VOUCHER' | 'GIFT' | 'SERVICE' | 'UPGRADE';

type BackendProgram = {
  id: string;
  customerId: string;
  customerName: string;
  tier: BackendTier;
  tierLabel?: string;
  points: number;
  totalSpend: number;
  joinedAt: string;
  pointsExpiry?: string;
  nextTierThreshold?: number;
  nextTierName?: BackendTier;
  nextTierLabel?: string;
};

type BackendTransaction = {
  id: string;
  programId: string;
  type: BackendTxnType;
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
};

type BackendReward = {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: BackendRewardCategory;
  available: boolean;
  stock: number;
  imageUrl?: string;
};

function mapTier(tier: BackendTier, label?: string): LoyaltyProgram['tier'] {
  if (label === 'Đồng' || label === 'Bạc' || label === 'Vàng' || label === 'Kim cương') return label;
  if (tier === 'SILVER') return 'Bạc';
  if (tier === 'GOLD') return 'Vàng';
  if (tier === 'DIAMOND') return 'Kim cương';
  return 'Đồng';
}

function mapBackendProgram(program: BackendProgram): LoyaltyProgram {
  return {
    id: program.id,
    customerId: program.customerId,
    customerName: program.customerName,
    tier: mapTier(program.tier, program.tierLabel),
    points: program.points,
    totalSpend: program.totalSpend,
    joinedAt: program.joinedAt,
    pointsExpiry: program.pointsExpiry,
    nextTierThreshold: program.nextTierThreshold,
    nextTierName: program.nextTierName ? mapTier(program.nextTierName, program.nextTierLabel) : undefined,
  };
}

function mapTxnType(type: BackendTxnType): LoyaltyTxnType {
  if (type === 'REDEEM') return 'Tiêu';
  if (type === 'EXPIRE') return 'Hết hạn';
  if (type === 'BONUS') return 'Thưởng';
  return 'Tích';
}

function toBackendTxnType(type?: LoyaltyTxnType): BackendTxnType | undefined {
  if (type === 'Tiêu') return 'REDEEM';
  if (type === 'Hết hạn') return 'EXPIRE';
  if (type === 'Thưởng') return 'BONUS';
  if (type === 'Tích') return 'EARN';
  return undefined;
}

function mapBackendTransaction(txn: BackendTransaction): LoyaltyTransaction {
  return {
    id: txn.id,
    programId: txn.programId,
    type: mapTxnType(txn.type),
    points: txn.points,
    description: txn.description,
    orderId: txn.orderId,
    createdAt: txn.createdAt,
  };
}

function mapRewardCategory(category: BackendRewardCategory): string {
  if (category === 'GIFT') return 'Quà tặng';
  if (category === 'SERVICE') return 'Dịch vụ';
  if (category === 'UPGRADE') return 'Ưu đãi nâng hạng';
  return 'Voucher';
}

function mapBackendReward(reward: BackendReward): LoyaltyReward {
  return {
    id: reward.id,
    name: reward.name,
    description: reward.description,
    pointsCost: reward.pointsCost,
    category: mapRewardCategory(reward.category),
    available: reward.available,
    stock: reward.stock,
  };
}

Object.assign(loyaltyApi, {
  getProgram: async (_customerId: string): Promise<LoyaltyProgram | null> => {
    try {
      const { data } = await backendRequest<BackendProgram>('/loyalty/me');
      return mapBackendProgram(data);
    } catch {
      await delay();
      return mockPrograms.find(p => p.customerId === _customerId) ?? mockPrograms[0] ?? null;
    }
  },
  getTransactions: async (
    customerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    filterType?: LoyaltyTxnType,
  ): Promise<PaginatedResponse<LoyaltyTransaction>> => {
    try {
      const query = toQuery({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: toBackendTxnType(filterType),
      });
      const { data, pagination: meta } = await backendRequest<BackendTransaction[]>(`/loyalty/me/transactions${query}`);
      return {
        data: data.map(mapBackendTransaction),
        total: meta?.total ?? data.length,
        page: meta?.page ?? pagination.page,
        pageSize: meta?.pageSize ?? pagination.pageSize,
        totalPages: meta?.totalPages ?? Math.ceil(data.length / pagination.pageSize),
      };
    } catch {
      await delay();
      const program = mockPrograms.find(p => p.customerId === customerId) ?? mockPrograms[0];
      let items = mockTransactions.filter(t => t.programId === program?.id);
      if (filterType) items = items.filter(t => t.type === filterType);
      const total = items.length;
      const start = (pagination.page - 1) * pagination.pageSize;
      return { data: items.slice(start, start + pagination.pageSize), total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
    }
  },
  getRewards: async (
    pagination: PaginationParams = { page: 1, pageSize: 10 },
  ): Promise<PaginatedResponse<LoyaltyReward>> => {
    try {
      const query = toQuery({ page: pagination.page, pageSize: pagination.pageSize });
      const { data, pagination: meta } = await backendRequest<BackendReward[]>(`/loyalty/rewards${query}`);
      return {
        data: data.map(mapBackendReward),
        total: meta?.total ?? data.length,
        page: meta?.page ?? pagination.page,
        pageSize: meta?.pageSize ?? pagination.pageSize,
        totalPages: meta?.totalPages ?? Math.ceil(data.length / pagination.pageSize),
      };
    } catch {
      await delay();
      const items = mockRewards.filter(r => r.available);
      const total = items.length;
      const start = (pagination.page - 1) * pagination.pageSize;
      return { data: items.slice(start, start + pagination.pageSize), total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
    }
  },
  redeemReward: async (rewardId: string, programId: string): Promise<{ success: boolean; code: string; newPoints: number }> => {
    try {
      const { data } = await backendRequest<{ rewardCode: string; newPoints: number }>(`/loyalty/rewards/${rewardId}/redeem`, {
        method: 'POST',
      });
      return { success: true, code: data.rewardCode, newPoints: data.newPoints };
    } catch {
      await delay(400);
      const reward = mockRewards.find(r => r.id === rewardId);
      const program = mockPrograms.find(p => p.id === programId);
      if (!reward || !program || program.points < reward.pointsCost || reward.stock <= 0) {
        return { success: false, code: '', newPoints: program?.points ?? 0 };
      }
      program.points -= reward.pointsCost;
      reward.stock -= 1;
      return { success: true, code: `RW-${Date.now().toString(36).toUpperCase()}`, newPoints: program.points };
    }
  },
  getStats: async (customerId: string) => {
    try {
      const { data } = await backendRequest<Record<string, unknown>>('/loyalty/me/stats');
      return {
        currentPoints: Number(data.currentPoints ?? data.points ?? 0),
        expiringPoints: Number(data.expiringPoints ?? 0),
        expiryDate: String(data.expiryDate ?? ''),
        monthlyEarned: Array.isArray(data.monthlyEarned)
          ? data.monthlyEarned.map(item => {
            const row = item as { month?: string; points?: number; earned?: number; spent?: number };
            return { month: row.month ?? '', earned: Number(row.earned ?? row.points ?? 0), spent: Number(row.spent ?? 0) };
          })
          : [],
      };
    } catch {
      await delay();
      const program = mockPrograms.find(p => p.customerId === customerId) ?? mockPrograms[0];
      return {
        currentPoints: program?.points ?? 0,
        expiringPoints: 300,
        expiryDate: program?.pointsExpiry ?? '',
        monthlyEarned: [
          { month: 'T10', earned: 450, spent: 0 },
          { month: 'T11', earned: 700, spent: 0 },
          { month: 'T12', earned: 1800, spent: 1000 },
          { month: 'T1', earned: 900, spent: 0 },
          { month: 'T2', earned: 2900, spent: 500 },
          { month: 'T3', earned: 2000, spent: 0 },
        ],
      };
    }
  },
});
