// ============================================================
// Buyer Dashboard API — Giả lập dữ liệu tổng quan buyer (Nhóm 23)
// 23A.03-04: getStats, getSpendingTrend, getSupplierSpend, getOrderTrend
// ============================================================

import type {
  BuyerDashboardStats,
  BuyerSpendingTrend,
  BuyerSupplierSpend,
  BuyerOrderTrend,
  Order,
  Shipment,
  Payment,
  WishlistItem,
  OrderTemplate,
} from '../types';
import {
  mockOrders,
  mockShipments,
  mockPayments,
  mockWishlistItems,
  mockOrderTemplates,
} from '../data/mockData';

// --- Helpers ---
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

function getOrdersForBuyer(userId: string): Order[] {
  return mockOrders.filter(o => o.buyerId === userId);
}

function getShipmentsForBuyer(userId: string): Shipment[] {
  return mockShipments.filter(s => s.buyerId === userId);
}

function getPaymentsForBuyer(userId: string): Payment[] {
  return mockPayments.filter(p => p.buyerId === userId);
}

// --- API ---
export const buyerDashboardApi = {
  /** Lấy tổng thống kê dashboard (23A.03) */
  async getStats(userId: string): Promise<BuyerDashboardStats> {
    await delay();
    const orders = getOrdersForBuyer(userId);
    const totalSpent = orders
      .filter(o => o.status !== 'Đã huỷ')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const payments = getPaymentsForBuyer(userId);
    const shipments = getShipmentsForBuyer(userId);

    return {
      totalOrders: orders.length,
      totalSpent,
      activeRFQs: 3,
      activeContracts: 2,
      pendingPayments: payments.filter(p => p.status === 'Chờ thanh toán' || p.status === 'Quá hạn').length || 4,
      pendingShipments: shipments.filter(s => s.status === 'Đang vận chuyển' || s.status === 'Đang giao').length || 3,
      avgOrderValue: orders.length > 0 ? Math.round(totalSpent / orders.length) : 0,
      savingsFromPromotions: 12_500_000,
    };
  },

  /** Lấy xu hướng chi tiêu 12 tháng (23A.04) */
  async getSpendingTrend(userId: string, months = 12): Promise<BuyerSpendingTrend[]> {
    await delay();
    const trends: BuyerSpendingTrend[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
      trends.push({
        month: label,
        amount: Math.floor(Math.random() * 80_000_000) + 20_000_000,
      });
    }
    return trends;
  },

  /** Phân bổ chi tiêu theo NCC (PieChart) */
  async getSupplierSpend(userId: string): Promise<BuyerSupplierSpend[]> {
    await delay();
    const orders = getOrdersForBuyer(userId);
    const map = new Map<string, BuyerSupplierSpend>();
    for (const o of orders) {
      if (o.status === 'Đã huỷ') continue;
      const existing = map.get(o.supplierId);
      if (existing) {
        existing.amount += o.totalAmount;
      } else {
        map.set(o.supplierId, {
          supplierId: o.supplierId,
          supplierName: o.supplierName,
          amount: o.totalAmount,
        });
      }
    }
    // Đảm bảo luôn có ít nhất 4 NCC
    if (map.size < 4) {
      const fallback: BuyerSupplierSpend[] = [
        { supplierId: 's1', supplierName: 'Thép Hòa Phát', amount: 125_000_000 },
        { supplierId: 's2', supplierName: 'Xi măng Holcim', amount: 89_000_000 },
        { supplierId: 's3', supplierName: 'Sơn Dulux', amount: 45_000_000 },
        { supplierId: 's4', supplierName: 'Phụ kiện Minh Long', amount: 32_000_000 },
        { supplierId: 's5', supplierName: 'Gỗ Trường Thành', amount: 28_000_000 },
      ];
      return fallback;
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount).slice(0, 8);
  },

  /** Số đơn hàng theo tháng (BarChart) */
  async getOrderTrend(userId: string, months = 12): Promise<BuyerOrderTrend[]> {
    await delay();
    const trends: BuyerOrderTrend[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
      trends.push({
        month: label,
        count: Math.floor(Math.random() * 15) + 2,
      });
    }
    return trends;
  },

  /** Đơn hàng gần đây (5 đơn mới nhất) */
  async getRecentOrders(userId: string): Promise<Order[]> {
    await delay();
    const orders = getOrdersForBuyer(userId);
    // Nếu không có đơn nào -> lấy 5 đơn đầu mock
    const list = orders.length > 0 ? orders : mockOrders.slice(0, 5);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  },

  /** Vận chuyển đang trên đường */
  async getActiveShipments(userId: string): Promise<Shipment[]> {
    await delay();
    const active = getShipmentsForBuyer(userId)
      .filter(s => s.status === 'Đang vận chuyển' || s.status === 'Đang giao');
    return active.length > 0 ? active.slice(0, 5) : mockShipments.filter(s => s.status === 'Đang vận chuyển').slice(0, 3);
  },

  /** Thanh toán sắp đến hạn (< 7 ngày) */
  async getPendingPayments(userId: string): Promise<Payment[]> {
    await delay();
    const pending = getPaymentsForBuyer(userId)
      .filter(p => p.status === 'Chờ thanh toán' || p.status === 'Quá hạn');
    return pending.length > 0 ? pending.slice(0, 5) : mockPayments.filter(p => p.status === 'Chờ thanh toán').slice(0, 3);
  },

  /** Sản phẩm yêu thích (5 SP) */
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    await delay();
    const items = mockWishlistItems.filter(w => w.userId === userId);
    return items.length > 0 ? items.slice(0, 5) : mockWishlistItems.slice(0, 5);
  },

  /** Template hay dùng (3 template) */
  async getFrequentTemplates(userId: string): Promise<OrderTemplate[]> {
    await delay();
    const items = mockOrderTemplates.filter(t => t.userId === userId);
    const list = items.length > 0 ? items : mockOrderTemplates.slice(0, 3);
    return [...list].sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);
  },
};
