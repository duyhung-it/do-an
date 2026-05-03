// ============================================================
// Service API — Chuyển kho & Multi-Warehouse (Nhóm 38)
// ============================================================

import type { WarehouseTransfer, WarehouseTransferStatus } from '../types';

// --- Mock data: 5 lệnh chuyển kho ---
let mockTransfers: WarehouseTransfer[] = [
  {
    id: 'wt-001', transferNumber: 'CK-2026-001',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Tân Bình',
    toWarehouseId: 'wh-002', toWarehouseName: 'Kho Bình Dương',
    items: [
      { productId: 'p1', productName: 'Thép hình H200', quantity: 500, actualReceived: 500 },
      { productId: 'p2', productName: 'Thép ống D60', quantity: 300, actualReceived: 295 },
    ],
    status: 'Đã nhận', requestedBy: 'Trần Thị Seller', approvedBy: 'Nguyễn Quản Lý',
    shippedAt: '2026-02-10T08:00:00Z', receivedAt: '2026-02-12T14:00:00Z',
    note: 'Chuyển bổ sung cho đơn hàng lớn', createdAt: '2026-02-09T10:00:00Z',
  },
  {
    id: 'wt-002', transferNumber: 'CK-2026-002',
    fromWarehouseId: 'wh-002', fromWarehouseName: 'Kho Bình Dương',
    toWarehouseId: 'wh-003', toWarehouseName: 'Kho Hà Nội',
    items: [
      { productId: 'p3', productName: 'Xi măng PC50', quantity: 1000, actualReceived: 1000 },
    ],
    status: 'Đang chuyển', requestedBy: 'Lê Văn NCC', approvedBy: 'Trần Thị Seller',
    shippedAt: '2026-03-10T06:00:00Z',
    note: 'Điều phối cho khu vực phía Bắc', createdAt: '2026-03-08T09:00:00Z',
  },
  {
    id: 'wt-003', transferNumber: 'CK-2026-003',
    fromWarehouseId: 'wh-001', fromWarehouseName: 'Kho Tân Bình',
    toWarehouseId: 'wh-003', toWarehouseName: 'Kho Hà Nội',
    items: [
      { productId: 'p4', productName: 'Sơn chống rỉ 5L', quantity: 200 },
      { productId: 'p5', productName: 'Bu-lông M12x100', quantity: 5000 },
    ],
    status: 'Chờ duyệt', requestedBy: 'Trần Thị Seller',
    note: 'Chuẩn bị cho dự án Q2', createdAt: '2026-03-12T08:00:00Z',
  },
  {
    id: 'wt-004', transferNumber: 'CK-2026-004',
    fromWarehouseId: 'wh-003', fromWarehouseName: 'Kho Hà Nội',
    toWarehouseId: 'wh-001', toWarehouseName: 'Kho Tân Bình',
    items: [
      { productId: 'p6', productName: 'Gạch men 60x60', quantity: 800 },
    ],
    status: 'Bản nháp', requestedBy: 'Lê Văn NCC',
    note: 'Trả lại hàng tồn', createdAt: '2026-03-14T10:00:00Z',
  },
  {
    id: 'wt-005', transferNumber: 'CK-2026-005',
    fromWarehouseId: 'wh-002', fromWarehouseName: 'Kho Bình Dương',
    toWarehouseId: 'wh-001', toWarehouseName: 'Kho Tân Bình',
    items: [
      { productId: 'p1', productName: 'Thép hình H200', quantity: 100, actualReceived: 100 },
    ],
    status: 'Đã huỷ', requestedBy: 'Trần Thị Seller',
    note: 'Huỷ do thay đổi kế hoạch', createdAt: '2026-01-20T07:00:00Z',
  },
];

function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export const warehouseTransferApi = {
  /** Lấy tất cả lệnh chuyển kho */
  async getAll(): Promise<WarehouseTransfer[]> {
    await delay();
    return [...mockTransfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Lấy chi tiết */
  async getById(id: string): Promise<WarehouseTransfer | null> {
    await delay();
    return mockTransfers.find(t => t.id === id) ?? null;
  },

  /** Tạo lệnh chuyển kho */
  async create(data: Partial<WarehouseTransfer>): Promise<WarehouseTransfer> {
    await delay(300);
    const transfer: WarehouseTransfer = {
      id: `wt-${Date.now()}`,
      transferNumber: `CK-2026-${String(mockTransfers.length + 1).padStart(3, '0')}`,
      fromWarehouseId: data.fromWarehouseId || '',
      fromWarehouseName: data.fromWarehouseName || '',
      toWarehouseId: data.toWarehouseId || '',
      toWarehouseName: data.toWarehouseName || '',
      items: data.items || [],
      status: 'Bản nháp',
      requestedBy: data.requestedBy || '',
      note: data.note || '',
      createdAt: new Date().toISOString(),
    };
    mockTransfers = [transfer, ...mockTransfers];
    return transfer;
  },

  /** Duyệt */
  async approve(id: string, approvedBy: string): Promise<WarehouseTransfer | null> {
    await delay(200);
    const idx = mockTransfers.findIndex(t => t.id === id);
    if (idx === -1) return null;
    mockTransfers[idx] = { ...mockTransfers[idx], status: 'Chờ duyệt' === mockTransfers[idx].status ? 'Đang chuyển' : mockTransfers[idx].status, approvedBy };
    // Nếu đang bản nháp → Chờ duyệt, nếu Chờ duyệt → Đang chuyển
    if (mockTransfers[idx].status === 'Bản nháp') {
      mockTransfers[idx] = { ...mockTransfers[idx], status: 'Chờ duyệt' };
    } else {
      mockTransfers[idx] = { ...mockTransfers[idx], status: 'Đang chuyển', approvedBy, shippedAt: new Date().toISOString() };
    }
    return mockTransfers[idx];
  },

  /** Chuyển hàng (shipped) */
  async ship(id: string): Promise<WarehouseTransfer | null> {
    await delay(200);
    const idx = mockTransfers.findIndex(t => t.id === id);
    if (idx === -1) return null;
    mockTransfers[idx] = { ...mockTransfers[idx], status: 'Đang chuyển', shippedAt: new Date().toISOString() };
    return mockTransfers[idx];
  },

  /** Nhận hàng */
  async receive(id: string): Promise<WarehouseTransfer | null> {
    await delay(200);
    const idx = mockTransfers.findIndex(t => t.id === id);
    if (idx === -1) return null;
    mockTransfers[idx] = { ...mockTransfers[idx], status: 'Đã nhận', receivedAt: new Date().toISOString() };
    return mockTransfers[idx];
  },

  /** Huỷ */
  async cancel(id: string): Promise<WarehouseTransfer | null> {
    await delay(200);
    const idx = mockTransfers.findIndex(t => t.id === id);
    if (idx === -1) return null;
    mockTransfers[idx] = { ...mockTransfers[idx], status: 'Đã huỷ' };
    return mockTransfers[idx];
  },

  /** Thống kê */
  async getStats(): Promise<{
    total: number;
    draft: number;
    pending: number;
    shipping: number;
    received: number;
    cancelled: number;
    totalItems: number;
  }> {
    await delay();
    const active = mockTransfers;
    return {
      total: active.length,
      draft: active.filter(t => t.status === 'Bản nháp').length,
      pending: active.filter(t => t.status === 'Chờ duyệt').length,
      shipping: active.filter(t => t.status === 'Đang chuyển').length,
      received: active.filter(t => t.status === 'Đã nhận').length,
      cancelled: active.filter(t => t.status === 'Đã huỷ').length,
      totalItems: active.reduce((s, t) => s + t.items.reduce((ss, it) => ss + it.quantity, 0), 0),
    };
  },
};
