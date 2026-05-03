// ============================================================
// Service API — Báo cáo tuỳ chỉnh / Report Builder (Nhóm 42)
// ============================================================

import type {
  ReportDefinition, ReportDataSource, ReportColumn, ReportBuilderFilter,
  ReportChartType, PaginationParams, PaginatedResponse,
} from '../types';

function delay(ms = 250): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export interface FieldDef {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'enum';
  options?: string[];
}

export interface ExecuteResult {
  columns: { field: string; label: string; format?: string }[];
  rows: Record<string, unknown>[];
  chartData: Record<string, unknown>[];
}

// --- Danh sách field khả dụng theo nguồn ---
const FIELD_MAP: Record<ReportDataSource, FieldDef[]> = {
  'Đơn hàng': [
    { field: 'orderNumber', label: 'Mã đơn', type: 'string' },
    { field: 'buyerName', label: 'Khách hàng', type: 'string' },
    { field: 'supplierName', label: 'NCC', type: 'string' },
    { field: 'totalAmount', label: 'Tổng tiền', type: 'number' },
    { field: 'status', label: 'Trạng thái', type: 'enum', options: ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao', 'Đã huỷ'] },
    { field: 'createdAt', label: 'Ngày tạo', type: 'date' },
    { field: 'itemCount', label: 'Số SP', type: 'number' },
  ],
  'Sản phẩm': [
    { field: 'name', label: 'Tên SP', type: 'string' },
    { field: 'categoryName', label: 'Danh mục', type: 'string' },
    { field: 'supplierName', label: 'NCC', type: 'string' },
    { field: 'price', label: 'Giá', type: 'number' },
    { field: 'stock', label: 'Tồn kho', type: 'number' },
    { field: 'rating', label: 'Đánh giá', type: 'number' },
    { field: 'status', label: 'Trạng thái', type: 'enum', options: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Hết hàng', 'Ẩn'] },
  ],
  'NCC': [
    { field: 'companyName', label: 'Tên NCC', type: 'string' },
    { field: 'city', label: 'Thành phố', type: 'string' },
    { field: 'rating', label: 'Đánh giá', type: 'number' },
    { field: 'productCount', label: 'Số SP', type: 'number' },
    { field: 'orderCount', label: 'Số đơn', type: 'number' },
    { field: 'totalRevenue', label: 'Doanh thu', type: 'number' },
  ],
  'Tồn kho': [
    { field: 'productName', label: 'Sản phẩm', type: 'string' },
    { field: 'warehouseName', label: 'Kho', type: 'string' },
    { field: 'currentStock', label: 'Tồn kho', type: 'number' },
    { field: 'minStock', label: 'Tồn tối thiểu', type: 'number' },
    { field: 'totalValue', label: 'Giá trị', type: 'number' },
    { field: 'status', label: 'Trạng thái', type: 'enum', options: ['Đủ hàng', 'Sắp hết', 'Hết hàng'] },
  ],
  'Doanh thu': [
    { field: 'period', label: 'Kỳ', type: 'string' },
    { field: 'revenue', label: 'Doanh thu', type: 'number' },
    { field: 'orders', label: 'Số đơn', type: 'number' },
    { field: 'avgOrderValue', label: 'TB/đơn', type: 'number' },
    { field: 'growth', label: 'Tăng trưởng %', type: 'number' },
  ],
  'Công nợ': [
    { field: 'buyerName', label: 'Khách hàng', type: 'string' },
    { field: 'amount', label: 'Số tiền', type: 'number' },
    { field: 'dueDate', label: 'Hạn TT', type: 'date' },
    { field: 'status', label: 'Trạng thái', type: 'enum', options: ['Chờ thanh toán', 'Quá hạn', 'Đã thanh toán'] },
    { field: 'daysOverdue', label: 'Ngày quá hạn', type: 'number' },
  ],
  'Hoá đơn': [
    { field: 'invoiceNumber', label: 'Mã HĐ', type: 'string' },
    { field: 'buyerCompany', label: 'Khách hàng', type: 'string' },
    { field: 'totalAmount', label: 'Tổng tiền', type: 'number' },
    { field: 'status', label: 'Trạng thái', type: 'enum', options: ['Bản nháp', 'Đã xuất', 'Đã gửi', 'Đã thanh toán', 'Quá hạn'] },
    { field: 'issuedDate', label: 'Ngày xuất', type: 'date' },
  ],
  'Trả hàng': [
    { field: 'orderNumber', label: 'Mã đơn', type: 'string' },
    { field: 'buyerName', label: 'Khách hàng', type: 'string' },
    { field: 'reason', label: 'Lý do', type: 'string' },
    { field: 'refundAmount', label: 'Hoàn tiền', type: 'number' },
    { field: 'status', label: 'Trạng thái', type: 'enum', options: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hoàn tiền'] },
    { field: 'createdAt', label: 'Ngày tạo', type: 'date' },
  ],
  'RFQ': [
    { field: 'rfqNumber', label: 'Mã RFQ', type: 'string' },
    { field: 'buyerCompany', label: 'Công ty', type: 'string' },
    { field: 'itemCount', label: 'Số SP', type: 'number' },
    { field: 'status', label: 'Trạng thái', type: 'string' },
    { field: 'createdAt', label: 'Ngày tạo', type: 'date' },
  ],
  'Ngân sách': [
    { field: 'department', label: 'Phòng ban', type: 'string' },
    { field: 'allocated', label: 'Phân bổ', type: 'number' },
    { field: 'used', label: 'Đã dùng', type: 'number' },
    { field: 'remaining', label: 'Còn lại', type: 'number' },
    { field: 'usagePercent', label: 'Sử dụng %', type: 'number' },
  ],
};

// --- Mock Report Definitions (5 báo cáo mẫu) ---
let mockReports: ReportDefinition[] = [
  {
    id: 'rpt-001', name: 'Doanh thu theo tháng', description: 'Biểu đồ doanh thu 12 tháng gần nhất',
    dataSource: 'Doanh thu',
    columns: [
      { field: 'period', label: 'Kỳ', visible: true },
      { field: 'revenue', label: 'Doanh thu', visible: true, format: 'currency' },
      { field: 'orders', label: 'Số đơn', visible: true, format: 'number' },
      { field: 'growth', label: 'Tăng trưởng', visible: true, format: 'percent' },
    ],
    filters: [], chartType: 'Bar',
    chartConfig: { xAxis: 'period', yAxis: 'revenue' },
    isTemplate: true, createdBy: 'admin', createdAt: '2026-01-01', updatedAt: '2026-03-01',
  },
  {
    id: 'rpt-002', name: 'Top NCC theo doanh thu', description: 'Phân bổ doanh thu theo nhà cung cấp',
    dataSource: 'NCC',
    columns: [
      { field: 'companyName', label: 'NCC', visible: true },
      { field: 'totalRevenue', label: 'Doanh thu', visible: true, format: 'currency' },
      { field: 'orderCount', label: 'Đơn hàng', visible: true, format: 'number' },
    ],
    filters: [], chartType: 'Pie',
    chartConfig: { nameKey: 'companyName', dataKey: 'totalRevenue' },
    isTemplate: true, createdBy: 'admin', createdAt: '2026-01-05', updatedAt: '2026-03-01',
  },
  {
    id: 'rpt-003', name: 'Tồn kho hiện tại', description: 'Bảng tồn kho theo sản phẩm và kho',
    dataSource: 'Tồn kho',
    columns: [
      { field: 'productName', label: 'Sản phẩm', visible: true },
      { field: 'warehouseName', label: 'Kho', visible: true },
      { field: 'currentStock', label: 'Tồn kho', visible: true, format: 'number' },
      { field: 'totalValue', label: 'Giá trị', visible: true, format: 'currency' },
      { field: 'status', label: 'Trạng thái', visible: true },
    ],
    filters: [], chartType: 'Table',
    isTemplate: true, createdBy: 'admin', createdAt: '2026-01-10', updatedAt: '2026-03-01',
  },
  {
    id: 'rpt-004', name: 'Công nợ quá hạn', description: 'Các khoản thanh toán quá hạn cần xử lý',
    dataSource: 'Công nợ',
    columns: [
      { field: 'buyerName', label: 'Khách hàng', visible: true },
      { field: 'amount', label: 'Số tiền', visible: true, format: 'currency' },
      { field: 'dueDate', label: 'Hạn TT', visible: true, format: 'date' },
      { field: 'daysOverdue', label: 'Quá hạn (ngày)', visible: true, format: 'number' },
    ],
    filters: [{ field: 'status', operator: '=', value: 'Quá hạn' }],
    chartType: 'Bar', chartConfig: { xAxis: 'buyerName', yAxis: 'amount' },
    isTemplate: true, createdBy: 'admin', createdAt: '2026-02-01', updatedAt: '2026-03-01',
  },
  {
    id: 'rpt-005', name: 'Đơn hàng theo trạng thái', description: 'Phân bố đơn hàng theo trạng thái',
    dataSource: 'Đơn hàng',
    columns: [
      { field: 'status', label: 'Trạng thái', visible: true },
      { field: 'count', label: 'Số lượng', visible: true, format: 'number' },
      { field: 'totalAmount', label: 'Tổng tiền', visible: true, format: 'currency' },
    ],
    filters: [], groupBy: 'status', chartType: 'Pie',
    chartConfig: { nameKey: 'status', dataKey: 'count' },
    isTemplate: false, createdBy: 'buyer-001', createdAt: '2026-03-05', updatedAt: '2026-03-05',
  },
];

// --- Mock execute data ---
function generateExecuteData(report: ReportDefinition): ExecuteResult {
  const cols = report.columns.filter(c => c.visible !== false).map(c => ({
    field: c.field, label: c.label, format: c.format,
  }));

  let rows: Record<string, unknown>[] = [];

  switch (report.dataSource) {
    case 'Doanh thu':
      rows = [
        { period: 'T10/25', revenue: 1_250_000_000, orders: 45, avgOrderValue: 27_777_778, growth: 5.2 },
        { period: 'T11/25', revenue: 1_480_000_000, orders: 52, avgOrderValue: 28_461_538, growth: 18.4 },
        { period: 'T12/25', revenue: 1_820_000_000, orders: 68, avgOrderValue: 26_764_706, growth: 23.0 },
        { period: 'T1/26', revenue: 1_100_000_000, orders: 38, avgOrderValue: 28_947_368, growth: -39.6 },
        { period: 'T2/26', revenue: 1_350_000_000, orders: 48, avgOrderValue: 28_125_000, growth: 22.7 },
        { period: 'T3/26', revenue: 1_600_000_000, orders: 55, avgOrderValue: 29_090_909, growth: 18.5 },
      ];
      break;
    case 'NCC':
      rows = [
        { companyName: 'NCC Thép Miền Nam', totalRevenue: 3_200_000_000, orderCount: 120, rating: 4.5 },
        { companyName: 'NCC Điện CN', totalRevenue: 2_100_000_000, orderCount: 85, rating: 4.2 },
        { companyName: 'NCC Sơn Dulux', totalRevenue: 980_000_000, orderCount: 42, rating: 4.8 },
        { companyName: 'VLXD Phú Thọ', totalRevenue: 750_000_000, orderCount: 35, rating: 4.0 },
        { companyName: 'Xi Măng Hà Tiên', totalRevenue: 620_000_000, orderCount: 28, rating: 3.9 },
      ];
      break;
    case 'Tồn kho':
      rows = [
        { productName: 'Thép hình H200', warehouseName: 'Kho HCM', currentStock: 500, minStock: 100, totalValue: 1_250_000_000, status: 'Đủ hàng' },
        { productName: 'Xi măng PC50', warehouseName: 'Kho HN', currentStock: 200, minStock: 50, totalValue: 340_000_000, status: 'Đủ hàng' },
        { productName: 'Sơn Dulux 5L', warehouseName: 'Kho HCM', currentStock: 15, minStock: 20, totalValue: 22_500_000, status: 'Sắp hết' },
        { productName: 'Gạch Viglacera', warehouseName: 'Kho DN', currentStock: 0, minStock: 100, totalValue: 0, status: 'Hết hàng' },
        { productName: 'Ống PVC D90', warehouseName: 'Kho HCM', currentStock: 800, minStock: 200, totalValue: 120_000_000, status: 'Đủ hàng' },
      ];
      break;
    case 'Công nợ':
      rows = [
        { buyerName: 'Công ty XD Phú Thọ', amount: 450_000_000, dueDate: '2026-02-15', status: 'Quá hạn', daysOverdue: 28 },
        { buyerName: 'TNHH An Lộc', amount: 280_000_000, dueDate: '2026-03-01', status: 'Quá hạn', daysOverdue: 14 },
        { buyerName: 'Đại Phát Corp', amount: 180_000_000, dueDate: '2026-03-10', status: 'Quá hạn', daysOverdue: 5 },
        { buyerName: 'Minh Anh DNTN', amount: 95_000_000, dueDate: '2026-03-20', status: 'Chờ thanh toán', daysOverdue: 0 },
      ];
      break;
    case 'Đơn hàng':
      rows = [
        { status: 'Chờ xác nhận', count: 12, totalAmount: 350_000_000 },
        { status: 'Đã xác nhận', count: 8, totalAmount: 280_000_000 },
        { status: 'Đang xử lý', count: 15, totalAmount: 520_000_000 },
        { status: 'Đang giao hàng', count: 10, totalAmount: 380_000_000 },
        { status: 'Đã giao', count: 95, totalAmount: 4_200_000_000 },
        { status: 'Đã huỷ', count: 5, totalAmount: 120_000_000 },
      ];
      break;
    default:
      rows = [
        { label: 'Mục 1', value: 100 },
        { label: 'Mục 2', value: 200 },
        { label: 'Mục 3', value: 150 },
      ];
  }

  return { columns: cols, rows, chartData: rows };
}

// --- Public API ---
export const reportBuilderApi = {
  async getAll(
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResponse<ReportDefinition>> {
    await delay();
    const items = [...mockReports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const total = items.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const data = items.slice(start, start + pagination.pageSize);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
  },

  async getById(id: string): Promise<ReportDefinition | null> {
    await delay(100);
    return mockReports.find(r => r.id === id) || null;
  },

  async create(data: Partial<ReportDefinition>): Promise<ReportDefinition> {
    await delay(300);
    const rpt: ReportDefinition = {
      id: `rpt-${Date.now()}`,
      name: data.name || 'Báo cáo mới',
      description: data.description || '',
      dataSource: data.dataSource || 'Đơn hàng',
      columns: data.columns || [],
      filters: data.filters || [],
      groupBy: data.groupBy,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
      chartType: data.chartType || 'Table',
      chartConfig: data.chartConfig,
      isTemplate: data.isTemplate || false,
      createdBy: data.createdBy || 'buyer-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReports = [rpt, ...mockReports];
    return rpt;
  },

  async update(id: string, data: Partial<ReportDefinition>): Promise<ReportDefinition | null> {
    await delay(200);
    const idx = mockReports.findIndex(r => r.id === id);
    if (idx === -1) return null;
    mockReports[idx] = { ...mockReports[idx], ...data, updatedAt: new Date().toISOString() };
    return mockReports[idx];
  },

  async delete(id: string): Promise<boolean> {
    await delay(200);
    const len = mockReports.length;
    mockReports = mockReports.filter(r => r.id !== id);
    return mockReports.length < len;
  },

  async clone(id: string): Promise<ReportDefinition | null> {
    await delay(300);
    const src = mockReports.find(r => r.id === id);
    if (!src) return null;
    const copy: ReportDefinition = {
      ...src,
      id: `rpt-${Date.now()}`,
      name: `${src.name} (Bản sao)`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReports = [copy, ...mockReports];
    return copy;
  },

  async execute(reportDef: ReportDefinition): Promise<ExecuteResult> {
    await delay(400);
    return generateExecuteData(reportDef);
  },

  async getAvailableFields(dataSource: ReportDataSource): Promise<FieldDef[]> {
    await delay(100);
    return FIELD_MAP[dataSource] || [];
  },
};
