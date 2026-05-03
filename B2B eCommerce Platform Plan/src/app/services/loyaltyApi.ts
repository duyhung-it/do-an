// ============================================================
// Service API — Khách hàng thân thiết / Loyalty (Nhóm 41)
// ============================================================

import type {
  LoyaltyProgram, LoyaltyTransaction, LoyaltyReward, LoyaltyTxnType,
  PaginationParams, PaginatedResponse,
} from '../types';

function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// --- Mock Programs (4 buyer) ---
let mockPrograms: LoyaltyProgram[] = [
  {
    id: 'lp-001', buyerId: 'buyer-001', buyerCompany: 'Công ty XD Phú Thọ',
    tier: 'Vàng', currentPoints: 8200, lifetimePoints: 15600, lifetimeSpend: 5_200_000_000,
    tierStartDate: '2025-06-01', nextTierThreshold: 20000, nextTierName: 'Kim cương',
  },
  {
    id: 'lp-002', buyerId: 'buyer-002', buyerCompany: 'Công ty CP Đại Phát',
    tier: 'Kim cương', currentPoints: 25400, lifetimePoints: 52000, lifetimeSpend: 18_000_000_000,
    tierStartDate: '2024-01-15',
  },
  {
    id: 'lp-003', buyerId: 'buyer-003', buyerCompany: 'TNHH Xây Dựng An Lộc',
    tier: 'Bạc', currentPoints: 2500, lifetimePoints: 4200, lifetimeSpend: 1_400_000_000,
    tierStartDate: '2025-09-01', nextTierThreshold: 5000, nextTierName: 'Vàng',
  },
  {
    id: 'lp-004', buyerId: 'buyer-004', buyerCompany: 'DNTN Vật Liệu Minh Anh',
    tier: 'Đồng', currentPoints: 500, lifetimePoints: 800, lifetimeSpend: 260_000_000,
    tierStartDate: '2026-01-10', nextTierThreshold: 2000, nextTierName: 'Bạc',
  },
];

// --- Mock Transactions (20 giao dịch) ---
let mockTransactions: LoyaltyTransaction[] = [
  { id: 'lt-01', programId: 'lp-001', type: 'Tích', points: 1200, description: 'Đơn hàng DH-2026-015 — Thép hình H200', orderId: 'ord-015', createdAt: '2026-03-12' },
  { id: 'lt-02', programId: 'lp-001', type: 'Tích', points: 800, description: 'Đơn hàng DH-2026-012 — Xi măng Hà Tiên', orderId: 'ord-012', createdAt: '2026-03-05' },
  { id: 'lt-03', programId: 'lp-001', type: 'Tiêu', points: -500, description: 'Đổi voucher giảm 50.000₫', createdAt: '2026-02-28' },
  { id: 'lt-04', programId: 'lp-001', type: 'Tích', points: 600, description: 'Đơn hàng DH-2026-008 — Gạch men Viglacera', orderId: 'ord-008', createdAt: '2026-02-20' },
  { id: 'lt-05', programId: 'lp-001', type: 'Tích', points: 1500, description: 'Đơn hàng DH-2026-005 — Dây điện Cadivi', orderId: 'ord-005', createdAt: '2026-02-10' },
  { id: 'lt-06', programId: 'lp-001', type: 'Thưởng', points: 500, description: 'Thưởng lên hạng Vàng', createdAt: '2026-02-01' },
  { id: 'lt-07', programId: 'lp-001', type: 'Tích', points: 900, description: 'Đơn hàng DH-2026-003 — Sơn Dulux', orderId: 'ord-003', createdAt: '2026-01-25' },
  { id: 'lt-08', programId: 'lp-001', type: 'Tiêu', points: -1000, description: 'Đổi voucher giảm 100.000₫', createdAt: '2026-01-15' },
  { id: 'lt-09', programId: 'lp-001', type: 'Tích', points: 700, description: 'Đơn hàng DH-2025-050 — Ống nhựa PVC', orderId: 'ord-050', createdAt: '2025-12-20' },
  { id: 'lt-10', programId: 'lp-001', type: 'Tích', points: 1100, description: 'Đơn hàng DH-2025-045 — Aptomat Schneider', orderId: 'ord-045', createdAt: '2025-12-05' },
  { id: 'lt-11', programId: 'lp-001', type: 'Hết hạn', points: -300, description: 'Điểm hết hạn cuối quý 3/2025', createdAt: '2025-10-01' },
  { id: 'lt-12', programId: 'lp-001', type: 'Tích', points: 450, description: 'Đơn hàng DH-2025-035 — Bu-lông M12', orderId: 'ord-035', createdAt: '2025-09-15' },
  { id: 'lt-13', programId: 'lp-002', type: 'Tích', points: 3500, description: 'Đơn hàng lớn DH-2026-020', orderId: 'ord-020', createdAt: '2026-03-10' },
  { id: 'lt-14', programId: 'lp-002', type: 'Tiêu', points: -2000, description: 'Đổi quà tặng VIP', createdAt: '2026-02-15' },
  { id: 'lt-15', programId: 'lp-003', type: 'Tích', points: 400, description: 'Đơn hàng DH-2026-018', orderId: 'ord-018', createdAt: '2026-03-08' },
  { id: 'lt-16', programId: 'lp-003', type: 'Tích', points: 350, description: 'Đơn hàng DH-2026-010', orderId: 'ord-010', createdAt: '2026-02-22' },
  { id: 'lt-17', programId: 'lp-003', type: 'Tiêu', points: -200, description: 'Đổi mã giảm giá vận chuyển', createdAt: '2026-02-01' },
  { id: 'lt-18', programId: 'lp-004', type: 'Tích', points: 200, description: 'Đơn hàng DH-2026-025', orderId: 'ord-025', createdAt: '2026-03-01' },
  { id: 'lt-19', programId: 'lp-004', type: 'Thưởng', points: 100, description: 'Thưởng đăng ký chương trình KHTT', createdAt: '2026-01-10' },
  { id: 'lt-20', programId: 'lp-001', type: 'Hết hạn', points: -250, description: 'Điểm hết hạn cuối quý 4/2025', createdAt: '2026-01-01' },
];

// --- Mock Rewards (10 phần thưởng) ---
let mockRewards: LoyaltyReward[] = [
  { id: 'rw-01', name: 'Voucher giảm 50.000₫', description: 'Áp dụng cho đơn hàng từ 500.000₫', pointsCost: 500, category: 'Voucher', available: true, stock: 50 },
  { id: 'rw-02', name: 'Voucher giảm 100.000₫', description: 'Áp dụng cho đơn hàng từ 1.000.000₫', pointsCost: 1000, category: 'Voucher', available: true, stock: 30 },
  { id: 'rw-03', name: 'Voucher giảm 500.000₫', description: 'Áp dụng cho đơn hàng từ 5.000.000₫', pointsCost: 4500, category: 'Voucher', available: true, stock: 10 },
  { id: 'rw-04', name: 'Giảm 5% đơn hàng', description: 'Mã giảm 5% cho 1 đơn hàng bất kỳ', pointsCost: 2000, category: 'Giảm giá', available: true, stock: 25 },
  { id: 'rw-05', name: 'Giảm 10% đơn hàng', description: 'Mã giảm 10% cho 1 đơn hàng, tối đa 2.000.000₫', pointsCost: 5000, category: 'Giảm giá', available: true, stock: 8 },
  { id: 'rw-06', name: 'Miễn phí vận chuyển', description: 'Miễn phí ship cho 1 đơn hàng', pointsCost: 800, category: 'Ưu đãi giao hàng', available: true, stock: 40 },
  { id: 'rw-07', name: 'Ưu tiên giao hàng nhanh', description: 'Giao hàng nhanh 24h cho 1 đơn', pointsCost: 1500, category: 'Ưu đãi giao hàng', available: true, stock: 15 },
  { id: 'rw-08', name: 'Bộ quà tặng văn phòng', description: 'Bộ bút + sổ tay cao cấp', pointsCost: 3000, category: 'Quà tặng', available: true, stock: 12 },
  { id: 'rw-09', name: 'Thẻ quà tặng 1.000.000₫', description: 'Thẻ mua hàng trị giá 1 triệu', pointsCost: 8000, category: 'Quà tặng', available: true, stock: 5 },
  { id: 'rw-10', name: 'Gói tư vấn kỹ thuật VIP', description: 'Tư vấn kỹ thuật 1-1 với chuyên gia trong 2 giờ', pointsCost: 15000, category: 'Quà tặng', available: true, stock: 3 },
];

// --- Public API ---
export const loyaltyApi = {
  async getProgram(buyerId: string): Promise<LoyaltyProgram | null> {
    await delay();
    return mockPrograms.find(p => p.buyerId === buyerId) || mockPrograms[0] || null;
  },

  async getTransactions(
    buyerId: string,
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    filterType?: LoyaltyTxnType,
  ): Promise<PaginatedResponse<LoyaltyTransaction>> {
    await delay();
    const program = mockPrograms.find(p => p.buyerId === buyerId) || mockPrograms[0];
    let items = mockTransactions.filter(t => t.programId === program?.id);
    if (filterType) {
      items = items.filter(t => t.type === filterType);
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const data = items.slice(start, start + pagination.pageSize);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
  },

  async getRewards(
    pagination: PaginationParams = { page: 1, pageSize: 10 },
  ): Promise<PaginatedResponse<LoyaltyReward>> {
    await delay();
    const items = mockRewards.filter(r => r.available);
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const data = items.slice(start, start + pagination.pageSize);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
  },

  async redeemReward(rewardId: string, programId: string): Promise<{ success: boolean; code: string; newPoints: number }> {
    await delay(400);
    const reward = mockRewards.find(r => r.id === rewardId);
    const program = mockPrograms.find(p => p.id === programId);
    if (!reward || !program || program.currentPoints < reward.pointsCost || reward.stock <= 0) {
      return { success: false, code: '', newPoints: program?.currentPoints ?? 0 };
    }

    // Trừ điểm
    program.currentPoints -= reward.pointsCost;
    reward.stock -= 1;

    // Thêm transaction
    const txn: LoyaltyTransaction = {
      id: `lt-${Date.now()}`,
      programId: program.id,
      type: 'Tiêu',
      points: -reward.pointsCost,
      description: `Đổi ${reward.name}`,
      createdAt: new Date().toISOString(),
    };
    mockTransactions = [txn, ...mockTransactions];

    const code = `RW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    return { success: true, code, newPoints: program.currentPoints };
  },

  async getStats(buyerId: string): Promise<{
    currentPoints: number;
    expiringPoints: number;
    expiryDate: string;
    monthlyEarned: { month: string; earned: number; spent: number }[];
  }> {
    await delay();
    const program = mockPrograms.find(p => p.buyerId === buyerId) || mockPrograms[0];
    return {
      currentPoints: program?.currentPoints ?? 0,
      expiringPoints: 300,
      expiryDate: '2026-06-30',
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
