// ============================================================
// API Quản lý SLA — Service Level Agreement (Nhóm 36)
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  SLADefinition, SLAReport, SLAReportMetric, SLAMetric, SLAStatus, SLAMetricDef,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// --- Mock SLA Definitions ---
const ALL_METRICS: SLAMetric[] = [
  'Tỷ lệ giao đúng hạn', 'Tỷ lệ hàng đạt chất lượng', 'Thời gian phản hồi',
  'Tỷ lệ đơn hoàn thành', 'Tỷ lệ trả hàng', 'Thời gian xử lý khiếu nại',
];

const mkMetric = (id: string, metric: SLAMetric, target: number, unit: string, weight: number): SLAMetricDef => ({
  id, metric, target, unit, weight,
});

const mockSLAs: SLADefinition[] = [
  {
    id: 'sla-01', slaNumber: 'SLA-2025-001', name: 'SLA Linh kiện điện tử — ABC Corp',
    sellerId: 'sup-01', sellerName: 'Nguyễn Văn Hải', sellerCompany: 'Công ty TNHH Điện tử Phương Nam',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    metrics: [
      mkMetric('m-01', 'Tỷ lệ giao đúng hạn', 95, '%', 30),
      mkMetric('m-02', 'Tỷ lệ hàng đạt chất lượng', 98, '%', 25),
      mkMetric('m-03', 'Thời gian phản hồi', 4, 'giờ', 15),
      mkMetric('m-04', 'Tỷ lệ đơn hoàn thành', 97, '%', 20),
      mkMetric('m-05', 'Tỷ lệ trả hàng', 2, '%', 10),
    ],
    penaltyRate: 1.5, bonusRate: 0.5,
    startDate: '2025-01-01', endDate: '2025-12-31', status: 'Hiệu lực',
    currentScore: 92, note: 'SLA hàng năm, đánh giá hàng tháng',
    createdAt: '2024-12-15T10:00:00Z', updatedAt: '2025-03-10T14:00:00Z',
  },
  {
    id: 'sla-02', slaNumber: 'SLA-2025-002', name: 'SLA Thép xây dựng — Chung cho tất cả Buyer',
    sellerId: 'sup-02', sellerName: 'Lê Văn Thành', sellerCompany: 'Tập đoàn Thép Hoà Phát',
    metrics: [
      mkMetric('m-06', 'Tỷ lệ giao đúng hạn', 90, '%', 35),
      mkMetric('m-07', 'Tỷ lệ hàng đạt chất lượng', 99, '%', 30),
      mkMetric('m-08', 'Thời gian xử lý khiếu nại', 48, 'giờ', 15),
      mkMetric('m-09', 'Tỷ lệ đơn hoàn thành', 95, '%', 20),
    ],
    penaltyRate: 2.0, bonusRate: 1.0,
    startDate: '2025-01-01', endDate: '2025-12-31', status: 'Hiệu lực',
    currentScore: 88, note: 'SLA chung cho tất cả buyer thép xây dựng',
    createdAt: '2024-12-20T08:00:00Z', updatedAt: '2025-03-12T09:00:00Z',
  },
  {
    id: 'sla-03', slaNumber: 'SLA-2025-003', name: 'SLA Dệt may — ABC Corp',
    sellerId: 'sup-04', sellerName: 'Trương Thị Hoa', sellerCompany: 'Tập đoàn Dệt may Thành Công',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    metrics: [
      mkMetric('m-10', 'Tỷ lệ giao đúng hạn', 92, '%', 25),
      mkMetric('m-11', 'Tỷ lệ hàng đạt chất lượng', 96, '%', 30),
      mkMetric('m-12', 'Thời gian phản hồi', 8, 'giờ', 15),
      mkMetric('m-13', 'Tỷ lệ trả hàng', 3, '%', 15),
      mkMetric('m-14', 'Thời gian xử lý khiếu nại', 72, 'giờ', 15),
    ],
    penaltyRate: 1.0, bonusRate: 0.5,
    startDate: '2025-04-01', endDate: '2025-09-30', status: 'Bản nháp',
    currentScore: 0, note: 'SLA Q2-Q3/2025 cho đơn hàng vải cotton',
    createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-03-10T09:00:00Z',
  },
  {
    id: 'sla-04', slaNumber: 'SLA-2025-004', name: 'SLA Bao bì — Toàn Cầu',
    sellerId: 'sup-05', sellerName: 'Võ Văn Hùng', sellerCompany: 'Công ty TNHH Bao bì Toàn Cầu',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    metrics: [
      mkMetric('m-15', 'Tỷ lệ giao đúng hạn', 93, '%', 30),
      mkMetric('m-16', 'Tỷ lệ hàng đạt chất lượng', 97, '%', 30),
      mkMetric('m-17', 'Tỷ lệ đơn hoàn thành', 96, '%', 20),
      mkMetric('m-18', 'Thời gian phản hồi', 6, 'giờ', 20),
    ],
    penaltyRate: 1.0, bonusRate: 0.5,
    startDate: '2025-01-01', endDate: '2025-12-31', status: 'Hiệu lực',
    currentScore: 95, note: 'SLA bao bì đóng gói, giao hàng hàng tháng',
    createdAt: '2024-12-22T08:00:00Z', updatedAt: '2025-03-08T09:00:00Z',
  },
  {
    id: 'sla-05', slaNumber: 'SLA-2024-010', name: 'SLA Nông sản 2024 (hết hạn)',
    sellerId: 'sup-03', sellerName: 'Phạm Minh Tuấn', sellerCompany: 'HTX Nông sản Đồng Tháp',
    buyerId: 'user-001', buyerName: 'Lê Hoàng Anh', buyerCompany: 'Công ty CP Công nghệ ABC',
    metrics: [
      mkMetric('m-19', 'Tỷ lệ giao đúng hạn', 88, '%', 35),
      mkMetric('m-20', 'Tỷ lệ hàng đạt chất lượng', 90, '%', 35),
      mkMetric('m-21', 'Tỷ lệ trả hàng', 5, '%', 30),
    ],
    penaltyRate: 2.0, bonusRate: 1.0,
    startDate: '2024-01-01', endDate: '2024-12-31', status: 'Đã hết hạn',
    currentScore: 78, note: 'SLA đã hết hạn cuối 2024',
    createdAt: '2023-12-10T08:00:00Z', updatedAt: '2024-12-31T23:59:00Z',
  },
];

// --- Mock SLA Reports ---
function genReport(slaId: string, period: string, metrics: SLAMetricDef[]): SLAReport {
  const rMetrics: SLAReportMetric[] = metrics.map(m => {
    // Generate realistic-ish random actual values
    let actual: number;
    if (m.unit === '%') {
      if (m.metric === 'Tỷ lệ trả hàng') {
        actual = Math.round((m.target + (Math.random() * 4 - 2)) * 10) / 10;
      } else {
        actual = Math.round((m.target + (Math.random() * 10 - 5)) * 10) / 10;
      }
    } else {
      actual = Math.round((m.target + (Math.random() * m.target * 0.4 - m.target * 0.2)) * 10) / 10;
    }

    let score: number;
    let status: 'Đạt' | 'Vi phạm' | 'Cảnh báo';
    if (m.metric === 'Tỷ lệ trả hàng' || m.metric === 'Thời gian phản hồi' || m.metric === 'Thời gian xử lý khiếu nại') {
      // Lower is better
      score = actual <= m.target ? 100 : Math.max(0, Math.round(100 - ((actual - m.target) / m.target) * 100));
      status = actual <= m.target ? 'Đạt' : actual <= m.target * 1.2 ? 'Cảnh báo' : 'Vi phạm';
    } else {
      score = actual >= m.target ? 100 : Math.max(0, Math.round((actual / m.target) * 100));
      status = actual >= m.target ? 'Đạt' : actual >= m.target * 0.9 ? 'Cảnh báo' : 'Vi phạm';
    }

    return { metricId: m.id, metric: m.metric, target: m.target, actual, score, status };
  });

  const totalWeight = metrics.reduce((s, m) => s + m.weight, 0);
  const overallScore = totalWeight > 0
    ? Math.round(rMetrics.reduce((s, rm, i) => s + rm.score * (metrics[i].weight / totalWeight), 0))
    : 0;

  return {
    id: `rpt-${slaId}-${period}`,
    slaId, period, metrics: rMetrics,
    overallScore, note: '',
    createdAt: new Date(`${period}-28T10:00:00Z`).toISOString(),
  };
}

const months = ['2025-01', '2025-02', '2025-03'];
const mockReports: SLAReport[] = [
  // SLA-01 reports
  ...months.map(m => genReport('sla-01', m, mockSLAs[0].metrics)),
  // SLA-02 reports
  ...months.map(m => genReport('sla-02', m, mockSLAs[1].metrics)),
  // SLA-04 reports
  ...months.map(m => genReport('sla-04', m, mockSLAs[3].metrics)),
  // SLA-05 old reports
  genReport('sla-05', '2024-11', mockSLAs[4].metrics),
  genReport('sla-05', '2024-12', mockSLAs[4].metrics),
];

// --- Helpers ---
function paginate<T>(data: T[], { page, pageSize }: PaginationParams): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

function sortData<T>(data: T[], sort?: SortParams): T[] {
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

function filterSLA(data: SLADefinition[], filters: ActiveFilter[], search: string): SLADefinition[] {
  let result = [...data];
  for (const f of filters) {
    if (f.key === 'status' && typeof f.value === 'string')
      result = result.filter(s => s.status === f.value);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(d =>
      d.slaNumber.toLowerCase().includes(s) ||
      d.name.toLowerCase().includes(s) ||
      d.sellerCompany.toLowerCase().includes(s) ||
      (d.buyerCompany ?? '').toLowerCase().includes(s)
    );
  }
  return result;
}

// --- API ---
export const slaApi = {
  async getBySeller(
    sellerId: string, pagination: PaginationParams,
    sort?: SortParams, filters: ActiveFilter[] = [], search = '',
  ): Promise<PaginatedResponse<SLADefinition>> {
    await delay();
    let data = mockSLAs.filter(s => s.sellerId === sellerId || sellerId === 'all');
    data = filterSLA(data, filters, search);
    data = sortData(data, sort) as SLADefinition[];
    return paginate(data, pagination);
  },

  async getByBuyer(
    buyerId: string, pagination: PaginationParams,
    sort?: SortParams, filters: ActiveFilter[] = [], search = '',
  ): Promise<PaginatedResponse<SLADefinition>> {
    await delay();
    let data = mockSLAs.filter(s => s.buyerId === buyerId || !s.buyerId || buyerId === 'all');
    data = filterSLA(data, filters, search);
    data = sortData(data, sort) as SLADefinition[];
    return paginate(data, pagination);
  },

  async getById(id: string): Promise<SLADefinition | null> {
    await delay();
    return mockSLAs.find(s => s.id === id) ?? null;
  },

  async getBySupplier(supplierId: string): Promise<SLADefinition[]> {
    await delay();
    return mockSLAs.filter(s => s.sellerId === supplierId);
  },

  async create(data: Partial<SLADefinition>): Promise<SLADefinition> {
    await delay(300);
    const count = mockSLAs.length + 1;
    const sla: SLADefinition = {
      id: `sla-${Date.now()}`,
      slaNumber: `SLA-2025-${String(count).padStart(3, '0')}`,
      name: data.name ?? '',
      sellerId: data.sellerId ?? '',
      sellerName: data.sellerName ?? '',
      sellerCompany: data.sellerCompany ?? '',
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      buyerCompany: data.buyerCompany,
      metrics: data.metrics ?? [],
      penaltyRate: data.penaltyRate ?? 1.0,
      bonusRate: data.bonusRate ?? 0.5,
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      status: 'Bản nháp',
      currentScore: 0,
      note: data.note ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSLAs.unshift(sla);
    return sla;
  },

  async update(id: string, data: Partial<SLADefinition>): Promise<SLADefinition | null> {
    await delay(300);
    const idx = mockSLAs.findIndex(s => s.id === id);
    if (idx === -1) return null;
    mockSLAs[idx] = { ...mockSLAs[idx], ...data, updatedAt: new Date().toISOString() };
    return mockSLAs[idx];
  },

  async getReports(slaId: string): Promise<SLAReport[]> {
    await delay();
    return mockReports.filter(r => r.slaId === slaId).sort((a, b) => a.period.localeCompare(b.period));
  },

  async calculateScore(slaId: string, period: string): Promise<SLAReport> {
    await delay(300);
    const sla = mockSLAs.find(s => s.id === slaId);
    if (!sla) throw new Error('SLA not found');
    const report = genReport(slaId, period, sla.metrics);
    mockReports.push(report);
    return report;
  },

  async getStats(sellerId: string): Promise<{
    total: number; active: number; avgScore: number; violationCount: number;
  }> {
    await delay();
    const data = mockSLAs.filter(s => s.sellerId === sellerId || sellerId === 'all');
    const active = data.filter(s => s.status === 'Hiệu lực');
    const avgScore = active.length > 0
      ? Math.round(active.reduce((s, d) => s + d.currentScore, 0) / active.length)
      : 0;
    // Count violations from latest reports
    let violationCount = 0;
    for (const sla of active) {
      const reports = mockReports.filter(r => r.slaId === sla.id);
      const latest = reports[reports.length - 1];
      if (latest) violationCount += latest.metrics.filter(m => m.status === 'Vi phạm').length;
    }
    return { total: data.length, active: active.length, avgScore, violationCount };
  },
};
