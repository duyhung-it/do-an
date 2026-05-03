// ============================================================
// Service: Order Status History API (DB-C.05/C.07)
// Lịch sử trạng thái đơn hàng — bảng order_status_history
// ============================================================

import type { OrderStatusHistory, OrderStatus } from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const statusFlow: OrderStatus[] = [
  'Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao',
];

// Mock: sinh lịch sử cho 15 đơn hàng
let mockHistory: OrderStatusHistory[] = [];
let nextId = 1;

function initHistory() {
  if (mockHistory.length > 0) return;
  for (let o = 1; o <= 15; o++) {
    const orderId = `ord-${String(o).padStart(3, '0')}`;
    const steps = Math.min(o % 6, statusFlow.length);
    for (let s = 0; s <= steps; s++) {
      mockHistory.push({
        id: `osh-${nextId++}`,
        orderId,
        fromStatus: s === 0 ? null : statusFlow[s - 1],
        toStatus: statusFlow[s],
        changedBy: s === 0 ? 'user-buyer-1' : 'user-seller-1',
        changedByName: s === 0 ? 'Nguyễn Văn Minh' : 'Nguyễn Văn An',
        note: s === 0 ? 'Tạo đơn hàng' : undefined,
        createdAt: new Date(2025, 0, o, 8 + s).toISOString(),
      });
    }
  }
}

export const orderStatusHistoryApi = {
  /** Lấy lịch sử trạng thái theo orderId */
  async getByOrder(orderId: string): Promise<OrderStatusHistory[]> {
    initHistory();
    await delay(80);
    return mockHistory
      .filter(h => h.orderId === orderId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  /** Thêm ghi chú trạng thái */
  async addStatusNote(
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    changedBy: string,
    changedByName: string,
    note?: string,
  ): Promise<OrderStatusHistory> {
    initHistory();
    await delay(100);
    const entry: OrderStatusHistory = {
      id: `osh-${nextId++}`,
      orderId,
      fromStatus,
      toStatus,
      changedBy,
      changedByName,
      note,
      createdAt: new Date().toISOString(),
    };
    mockHistory.push(entry);
    return entry;
  },

  /** Lấy tất cả (admin) */
  async getAll(): Promise<OrderStatusHistory[]> {
    initHistory();
    await delay(100);
    return [...mockHistory].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
