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
    { name: 'Thép xây dựng', amount: 2_850_000_000, percent: 35.6, trend: 8.2 },
    { name: 'Xi măng', amount: 1_600_000_000, percent: 20.0, trend: -3.1 },
    { name: 'Vật liệu hoàn thiện', amount: 1_200_000_000, percent: 15.0, trend: 12.5 },
    { name: 'Thiết bị điện', amount: 960_000_000, percent: 12.0, trend: 5.7 },
    { name: 'Ống nước', amount: 640_000_000, percent: 8.0, trend: -1.2 },
    { name: 'Phụ kiện', amount: 480_000_000, percent: 6.0, trend: 15.3 },
    { name: 'Khác', amount: 270_000_000, percent: 3.4, trend: 2.0 },
  ];

  const suppliers = [
    { name: 'NCC Thép Miền Nam', amount: 2_100_000_000, percent: 26.3, orderCount: 45 },
    { name: 'NCC Vật Liệu Bắc', amount: 1_500_000_000, percent: 18.8, orderCount: 38 },
    { name: 'Công ty VLXD Sài Gòn', amount: 1_200_000_000, percent: 15.0, orderCount: 32 },
    { name: 'NCC Điện Công Nghiệp', amount: 960_000_000, percent: 12.0, orderCount: 25 },
    { name: 'Đại lý Ống Nước Tiền Phong', amount: 640_000_000, percent: 8.0, orderCount: 20 },
    { name: 'Phụ kiện Kim Phát', amount: 480_000_000, percent: 6.0, orderCount: 18 },
    { name: 'NCC Xi Măng Hà Tiên', amount: 420_000_000, percent: 5.3, orderCount: 15 },
    { name: 'VLXD Phú Thọ', amount: 350_000_000, percent: 4.4, orderCount: 12 },
    { name: 'NCC Sơn Dulux', amount: 200_000_000, percent: 2.5, orderCount: 8 },
    { name: 'Khác', amount: 150_000_000, percent: 1.9, orderCount: 10 },
  ];

  const departments = [
    { name: 'Công trình A', amount: 3_200_000_000, budget: 3_500_000_000, percent: 91.4 },
    { name: 'Công trình B', amount: 2_100_000_000, budget: 2_500_000_000, percent: 84.0 },
    { name: 'Bảo trì', amount: 800_000_000, budget: 1_000_000_000, percent: 80.0 },
    { name: 'Văn phòng', amount: 350_000_000, budget: 400_000_000, percent: 87.5 },
    { name: 'Kho / Logistics', amount: 550_000_000, budget: 600_000_000, percent: 91.7 },
  ];

  const topProducts = [
    { name: 'Thép hình H200', qty: 12000, amount: 1_080_000_000, supplier: 'NCC Thép Miền Nam', trend: 12 },
    { name: 'Xi măng PC50 Hà Tiên', qty: 8000, amount: 640_000_000, supplier: 'NCC Xi Măng Hà Tiên', trend: -5 },
    { name: 'Thép ống D60', qty: 5000, amount: 450_000_000, supplier: 'NCC Thép Miền Nam', trend: 8 },
    { name: 'Gạch men 60x60', qty: 15000, amount: 375_000_000, supplier: 'VLXD Phú Thọ', trend: 15 },
    { name: 'Sơn chống rỉ 5L', qty: 3000, amount: 300_000_000, supplier: 'NCC Sơn Dulux', trend: 3 },
    { name: 'Dây điện Cu 2.5mm', qty: 20000, amount: 280_000_000, supplier: 'NCC Điện Công Nghiệp', trend: 7 },
    { name: 'Ống nhựa PVC D90', qty: 4000, amount: 240_000_000, supplier: 'Đại lý Ống Nước Tiền Phong', trend: -2 },
    { name: 'Bu-lông M12x100', qty: 50000, amount: 200_000_000, supplier: 'Phụ kiện Kim Phát', trend: 20 },
    { name: 'Thép tấm 5mm', qty: 2000, amount: 180_000_000, supplier: 'NCC Thép Miền Nam', trend: 10 },
    { name: 'Cát xây dựng', qty: 500, amount: 150_000_000, supplier: 'NCC Vật Liệu Bắc', trend: -8 },
    { name: 'Keo dán gạch Mapei', qty: 6000, amount: 120_000_000, supplier: 'Công ty VLXD Sài Gòn', trend: 25 },
    { name: 'Aptomat 3P 63A', qty: 200, amount: 100_000_000, supplier: 'NCC Điện Công Nghiệp', trend: 5 },
    { name: 'Vữa bê tông M250', qty: 300, amount: 90_000_000, supplier: 'NCC Vật Liệu Bắc', trend: 2 },
    { name: 'Tôn mạ kẽm 0.45mm', qty: 3000, amount: 85_000_000, supplier: 'Công ty VLXD Sài Gòn', trend: -3 },
    { name: 'Đá granite', qty: 800, amount: 80_000_000, supplier: 'VLXD Phú Thọ', trend: 18 },
    { name: 'Thanh nhôm Profile', qty: 1500, amount: 75_000_000, supplier: 'Phụ kiện Kim Phát', trend: 10 },
    { name: 'Bồn nước Inox 2000L', qty: 50, amount: 65_000_000, supplier: 'Công ty VLXD Sài Gòn', trend: 0 },
    { name: 'Cáp điện CV 4mm', qty: 10000, amount: 60_000_000, supplier: 'NCC Điện Công Nghiệp', trend: 12 },
    { name: 'Cửa nhôm kính', qty: 100, amount: 55_000_000, supplier: 'Phụ kiện Kim Phát', trend: 8 },
    { name: 'Chống thấm Sika', qty: 2000, amount: 50_000_000, supplier: 'Công ty VLXD Sài Gòn', trend: 15 },
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
      { method: 'Đấu giá', amount: 150_000_000, percent: 20.8 },
      { method: 'Khuyến mãi', amount: 120_000_000, percent: 16.7 },
      { method: 'HĐ khung', amount: 100_000_000, percent: 13.9 },
      { method: 'Mua số lượng', amount: 70_000_000, percent: 9.7 },
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
    { id: 's1', name: 'NCC Thép Miền Nam', orderCount: 45, totalAmount: 2_100_000_000, onTimeRate: 94.2, qualityScore: 91, responseTime: 1.5, overallScore: 92 },
    { id: 's2', name: 'NCC Vật Liệu Bắc', orderCount: 38, totalAmount: 1_500_000_000, onTimeRate: 87.5, qualityScore: 88, responseTime: 2.0, overallScore: 87 },
    { id: 's3', name: 'Công ty VLXD Sài Gòn', orderCount: 32, totalAmount: 1_200_000_000, onTimeRate: 91.0, qualityScore: 85, responseTime: 2.5, overallScore: 86 },
    { id: 's4', name: 'NCC Điện Công Nghiệp', orderCount: 25, totalAmount: 960_000_000, onTimeRate: 96.0, qualityScore: 93, responseTime: 1.2, overallScore: 94 },
    { id: 's5', name: 'Đại lý Ống Nước Tiền Phong', orderCount: 20, totalAmount: 640_000_000, onTimeRate: 82.0, qualityScore: 80, responseTime: 3.0, overallScore: 80 },
    { id: 's6', name: 'Phụ kiện Kim Phát', orderCount: 18, totalAmount: 480_000_000, onTimeRate: 90.5, qualityScore: 87, responseTime: 1.8, overallScore: 88 },
    { id: 's7', name: 'NCC Xi Măng Hà Tiên', orderCount: 15, totalAmount: 420_000_000, onTimeRate: 88.0, qualityScore: 90, responseTime: 2.2, overallScore: 89 },
    { id: 's8', name: 'VLXD Phú Thọ', orderCount: 12, totalAmount: 350_000_000, onTimeRate: 85.0, qualityScore: 82, responseTime: 3.5, overallScore: 83 },
    { id: 's9', name: 'NCC Sơn Dulux', orderCount: 8, totalAmount: 200_000_000, onTimeRate: 97.0, qualityScore: 95, responseTime: 1.0, overallScore: 96 },
    { id: 's10', name: 'Vật liệu Hoà Phát', orderCount: 6, totalAmount: 150_000_000, onTimeRate: 78.0, qualityScore: 75, responseTime: 4.0, overallScore: 76 },
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
      { metric: 'HĐ tuân thủ', current: 94, previous: 90 },
      { metric: 'Tỷ lệ hoàn', current: 72, previous: 70 },
    ];
  },

  formatCurrency: fmtCur,
};
