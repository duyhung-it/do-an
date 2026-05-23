// ============================================================
// Service API — Phân tích mua hàng & BI (Nhóm 39)
// ============================================================

import type {
  SpendAnalysis, SavingsReport, ProcurementKPI,
  TrendDataPoint, SupplierPerformance,
} from '../types';

function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

const fmtCur = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

// --- Mock generators ---
function genSpendAnalysis(period: string): SpendAnalysis {
  const categories = [
    { name: 'Điện thoại', amount: 2_850_000_000, percent: 35.6, trend: 8.2 },
    { name: 'Laptop', amount: 1_600_000_000, percent: 20.0, trend: -3.1 },
    { name: 'Máy tính bảng', amount: 1_200_000_000, percent: 15.0, trend: 12.5 },
    { name: 'Tai nghe', amount: 960_000_000, percent: 12.0, trend: 5.7 },
    { name: 'Thiết bị đeo', amount: 640_000_000, percent: 8.0, trend: -1.2 },
    { name: 'Phụ kiện', amount: 480_000_000, percent: 6.0, trend: 15.3 },
    { name: 'Khác', amount: 270_000_000, percent: 3.4, trend: 2.0 },
  ];

  const suppliers = [
    { name: 'CELLPHONES Quận 1', amount: 2_100_000_000, percent: 26.3, orderCount: 45 },
    { name: 'CELLPHONES Cầu Giấy', amount: 1_500_000_000, percent: 18.8, orderCount: 38 },
    { name: 'CELLPHONES Đà Nẵng', amount: 1_200_000_000, percent: 15.0, orderCount: 32 },
    { name: 'Apple Việt Nam', amount: 960_000_000, percent: 12.0, orderCount: 25 },
    { name: 'Samsung Vina', amount: 640_000_000, percent: 8.0, orderCount: 20 },
    { name: 'Xiaomi Việt Nam', amount: 480_000_000, percent: 6.0, orderCount: 18 },
    { name: 'Anker Việt Nam', amount: 420_000_000, percent: 5.3, orderCount: 15 },
    { name: 'Sony Center', amount: 350_000_000, percent: 4.4, orderCount: 12 },
    { name: 'Garmin Việt Nam', amount: 200_000_000, percent: 2.5, orderCount: 8 },
    { name: 'Khác', amount: 150_000_000, percent: 1.9, orderCount: 10 },
  ];

  const departments = [
    { name: 'Marketing', amount: 3_200_000_000, budget: 3_500_000_000, percent: 91.4 },
    { name: 'Bán hàng online', amount: 2_100_000_000, budget: 2_500_000_000, percent: 84.0 },
    { name: 'Bảo hành', amount: 800_000_000, budget: 1_000_000_000, percent: 80.0 },
    { name: 'Vận hành cửa hàng', amount: 350_000_000, budget: 400_000_000, percent: 87.5 },
    { name: 'Kho / Logistics', amount: 550_000_000, budget: 600_000_000, percent: 91.7 },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro Max', qty: 12000, amount: 1_080_000_000, supplier: 'CELLPHONES Quận 1', trend: 12 },
    { name: 'Samsung Galaxy S24 Ultra', qty: 8000, amount: 640_000_000, supplier: 'Samsung Vina', trend: -5 },
    { name: 'MacBook Air M2', qty: 5000, amount: 450_000_000, supplier: 'Apple Việt Nam', trend: 8 },
    { name: 'iPad Air M2', qty: 15000, amount: 375_000_000, supplier: 'Apple Việt Nam', trend: 15 },
    { name: 'AirPods Pro 2', qty: 3000, amount: 300_000_000, supplier: 'CELLPHONES Cầu Giấy', trend: 3 },
    { name: 'Apple Watch Series 9', qty: 20000, amount: 280_000_000, supplier: 'Apple Việt Nam', trend: 7 },
    { name: 'Sony WH-1000XM5', qty: 4000, amount: 240_000_000, supplier: 'Sony Center', trend: -2 },
    { name: 'Sạc nhanh Anker 67W', qty: 50000, amount: 200_000_000, supplier: 'Anker Việt Nam', trend: 20 },
    { name: 'Samsung Galaxy A55', qty: 2000, amount: 180_000_000, supplier: 'Samsung Vina', trend: 10 },
    { name: 'Xiaomi Redmi Note 13', qty: 500, amount: 150_000_000, supplier: 'Xiaomi Việt Nam', trend: -8 },
    { name: 'Ốp lưng MagSafe', qty: 6000, amount: 120_000_000, supplier: 'CELLPHONES Đà Nẵng', trend: 25 },
    { name: 'Pin dự phòng Anker', qty: 200, amount: 100_000_000, supplier: 'Anker Việt Nam', trend: 5 },
    { name: 'Garmin Venu 3', qty: 300, amount: 90_000_000, supplier: 'Garmin Việt Nam', trend: 2 },
    { name: 'Kính cường lực iPhone', qty: 3000, amount: 85_000_000, supplier: 'CELLPHONES Quận 1', trend: -3 },
    { name: 'Cáp USB-C', qty: 800, amount: 80_000_000, supplier: 'Anker Việt Nam', trend: 18 },
    { name: 'Loa Bluetooth Sony', qty: 1500, amount: 75_000_000, supplier: 'Sony Center', trend: 10 },
    { name: 'Ốp lưng Galaxy S24', qty: 50, amount: 65_000_000, supplier: 'Samsung Vina', trend: 0 },
    { name: 'Chuột Logitech MX Master', qty: 10000, amount: 60_000_000, supplier: 'CELLPHONES Cầu Giấy', trend: 12 },
    { name: 'Bàn phím Logitech Keys', qty: 100, amount: 55_000_000, supplier: 'CELLPHONES Thủ Đức', trend: 8 },
    { name: 'Mi Band 8', qty: 2000, amount: 50_000_000, supplier: 'Xiaomi Việt Nam', trend: 15 },
  ];

  return {
    period,
    totalSpend: 8_000_000_000,
    byCategory: categories,
    bySupplier: suppliers,
    byDepartment: departments,
    topProducts,
  };
}

function genSavingsReport(period: string): SavingsReport {
  return {
    period,
    targetSavings: 800_000_000,
    actualSavings: 720_000_000,
    savingsByMethod: [
      { method: 'Đàm phán', amount: 280_000_000, percent: 38.9 },
      { method: 'Flash sale', amount: 150_000_000, percent: 20.8 },
      { method: 'Khuyến mãi', amount: 120_000_000, percent: 16.7 },
      { method: 'Combo sản phẩm', amount: 100_000_000, percent: 13.9 },
      { method: 'Mã giảm giá', amount: 70_000_000, percent: 9.7 },
    ],
  };
}

function genKPIs(): ProcurementKPI {
  return {
    avgOrderCycleTime: 4.8,
    rfqToOrderConversionRate: 67.3,
    supplierOnTimeRate: 89.5,
    invoiceAccuracyRate: 96.2,
    avgPaymentCycleTime: 32.5,
    contractComplianceRate: 93.8,
  };
}

function genTrendData(months: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  for (let i = 0; i < months; i++) {
    data.push({
      month: labels[i % 12],
      current: Math.floor(400 + Math.random() * 800),
      previous: Math.floor(350 + Math.random() * 700),
    });
  }
  return data;
}

function genMonthlySavings(): { month: string; target: number; actual: number; cumulative: number }[] {
  const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  let cum = 0;
  return labels.map(m => {
    const target = Math.floor(50 + Math.random() * 30);
    const actual = Math.floor(40 + Math.random() * 35);
    cum += actual;
    return { month: m, target, actual, cumulative: cum };
  });
}

function genSupplierPerformances(): SupplierPerformance[] {
  return [
    { id: 's1', name: 'CELLPHONES Quận 1', orderCount: 45, totalAmount: 2_100_000_000, onTimeRate: 94.2, qualityScore: 91, responseTime: 1.5, overallScore: 92 },
    { id: 's2', name: 'CELLPHONES Cầu Giấy', orderCount: 38, totalAmount: 1_500_000_000, onTimeRate: 87.5, qualityScore: 88, responseTime: 2.0, overallScore: 87 },
    { id: 's3', name: 'CELLPHONES Đà Nẵng', orderCount: 32, totalAmount: 1_200_000_000, onTimeRate: 91.0, qualityScore: 85, responseTime: 2.5, overallScore: 86 },
    { id: 's4', name: 'Apple Việt Nam', orderCount: 25, totalAmount: 960_000_000, onTimeRate: 96.0, qualityScore: 93, responseTime: 1.2, overallScore: 94 },
    { id: 's5', name: 'Samsung Vina', orderCount: 20, totalAmount: 640_000_000, onTimeRate: 82.0, qualityScore: 80, responseTime: 3.0, overallScore: 80 },
    { id: 's6', name: 'Xiaomi Việt Nam', orderCount: 18, totalAmount: 480_000_000, onTimeRate: 90.5, qualityScore: 87, responseTime: 1.8, overallScore: 88 },
    { id: 's7', name: 'Anker Việt Nam', orderCount: 15, totalAmount: 420_000_000, onTimeRate: 88.0, qualityScore: 90, responseTime: 2.2, overallScore: 89 },
    { id: 's8', name: 'Sony Center', orderCount: 12, totalAmount: 350_000_000, onTimeRate: 85.0, qualityScore: 82, responseTime: 3.5, overallScore: 83 },
    { id: 's9', name: 'Garmin Việt Nam', orderCount: 8, totalAmount: 200_000_000, onTimeRate: 97.0, qualityScore: 95, responseTime: 1.0, overallScore: 96 },
    { id: 's10', name: 'CELLPHONES Thủ Đức', orderCount: 6, totalAmount: 150_000_000, onTimeRate: 78.0, qualityScore: 75, responseTime: 4.0, overallScore: 76 },
  ];
}

// --- Public API ---
export const analyticsApi = {
  async getSpendAnalysis(period: string): Promise<SpendAnalysis> {
    await delay(300);
    return genSpendAnalysis(period);
  },

  async getSavingsReport(period: string): Promise<SavingsReport> {
    await delay(200);
    return genSavingsReport(period);
  },

  async getProcurementKPIs(period?: string): Promise<ProcurementKPI> {
    await delay(200);
    return genKPIs();
  },

  async getTrendData(months = 12): Promise<TrendDataPoint[]> {
    await delay(200);
    return genTrendData(months);
  },

  async getMonthlySavings(): Promise<{ month: string; target: number; actual: number; cumulative: number }[]> {
    await delay(200);
    return genMonthlySavings();
  },

  async getSupplierPerformances(): Promise<SupplierPerformance[]> {
    await delay(200);
    return genSupplierPerformances();
  },

  /** Radar chart: so sánh kỳ này vs kỳ trước */
  async getComparisonRadar(): Promise<{ metric: string; current: number; previous: number }[]> {
    await delay(200);
    return [
      { metric: 'Giao đúng hạn', current: 89, previous: 85 },
      { metric: 'Chất lượng', current: 91, previous: 88 },
      { metric: 'Giá cả', current: 78, previous: 82 },
      { metric: 'Phản hồi', current: 85, previous: 80 },
      { metric: 'Đơn đúng SLA', current: 94, previous: 90 },
      { metric: 'Tỷ lệ hoàn', current: 72, previous: 70 },
    ];
  },

  formatCurrency: fmtCur,
};
