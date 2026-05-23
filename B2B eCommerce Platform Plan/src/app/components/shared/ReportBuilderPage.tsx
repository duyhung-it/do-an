// ============================================================
// Report Builder — Báo cáo tuỳ chỉnh (Nhóm 42C–D)
// ============================================================

import { useState, useEffect, useCallback, useMemo, useId } from 'react';
import {
  FileBarChart, Plus, Copy, Trash2, Play, Download, Printer,
  Link2, BarChart3, TrendingUp, PieChart as PieChartIcon,
  AreaChart as AreaChartIcon, Radar, TreePine, Table2,
  ChevronRight, ChevronLeft, GripVertical, X, Save,
  ShoppingCart, Package, Users, Warehouse as WarehouseIcon,
  DollarSign, CreditCard, FileText, RotateCcw, ClipboardList, Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { copyToClipboard } from '../ui/utils';
import { AppBreadcrumb } from './AppBreadcrumb';
import { toast } from 'sonner';
import { reportBuilderApi, type FieldDef, type ExecuteResult } from '../../services/reportBuilderApi';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarShape,
  Treemap, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';
import type {
  ReportDefinition, ReportDataSource, ReportChartType,
  ReportColumn, ReportBuilderFilter,
} from '../../types';

const CHART_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#ca8a04', '#6366f1'];

const DATA_SOURCES: { key: ReportDataSource; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'Đơn hàng', label: 'Đơn hàng', desc: 'Phân tích đơn hàng', icon: <ShoppingCart className="h-6 w-6" /> },
  { key: 'Sản phẩm', label: 'Sản phẩm', desc: 'Danh mục & giá', icon: <Package className="h-6 w-6" /> },
  { key: 'NCC', label: 'Cửa hàng', desc: 'Doanh thu & đánh giá', icon: <Users className="h-6 w-6" /> },
  { key: 'Tồn kho', label: 'Tồn kho', desc: 'Số lượng & giá trị', icon: <WarehouseIcon className="h-6 w-6" /> },
  { key: 'Doanh thu', label: 'Doanh thu', desc: 'Theo kỳ & tăng trưởng', icon: <DollarSign className="h-6 w-6" /> },
  { key: 'Công nợ', label: 'Thanh toán', desc: 'Thanh toán & quá hạn', icon: <CreditCard className="h-6 w-6" /> },
  { key: 'Hoá đơn', label: 'Hoá đơn', desc: 'Xuất & trạng thái', icon: <FileText className="h-6 w-6" /> },
  { key: 'Trả hàng', label: 'Trả hàng', desc: 'Lý do & hoàn tiền', icon: <RotateCcw className="h-6 w-6" /> },
  { key: 'RFQ', label: 'Báo giá', desc: 'Yêu cầu báo giá', icon: <ClipboardList className="h-6 w-6" /> },
  { key: 'Ngân sách', label: 'Ngân sách', desc: 'Phân bổ & sử dụng', icon: <Wallet className="h-6 w-6" /> },
];

const CHART_TYPES: { key: ReportChartType; label: string; icon: React.ReactNode }[] = [
  { key: 'Bar', label: 'Cột', icon: <BarChart3 className="h-5 w-5" /> },
  { key: 'Line', label: 'Đường', icon: <TrendingUp className="h-5 w-5" /> },
  { key: 'Pie', label: 'Tròn', icon: <PieChartIcon className="h-5 w-5" /> },
  { key: 'Area', label: 'Vùng', icon: <AreaChartIcon className="h-5 w-5" /> },
  { key: 'Radar', label: 'Radar', icon: <Radar className="h-5 w-5" /> },
  { key: 'Treemap', label: 'Treemap', icon: <TreePine className="h-5 w-5" /> },
  { key: 'Table', label: 'Bảng', icon: <Table2 className="h-5 w-5" /> },
];

const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

function formatCellValue(value: unknown, format?: string): string {
  if (value == null) return '—';
  if (format === 'currency') return formatVND(Number(value));
  if (format === 'percent') return `${Number(value).toFixed(1)}%`;
  if (format === 'number') return Number(value).toLocaleString();
  if (format === 'date') return new Date(String(value)).toLocaleDateString('vi-VN');
  return String(value);
}

// ===== Chart Renderer =====
function ChartRenderer({ type, data, config, columns }: {
  type: ReportChartType; data: Record<string, unknown>[];
  config?: Record<string, string>; columns: { field: string; label: string; format?: string }[];
}) {
  // Use React's useId for stable, unique identifiers
  const uniqueId = useId();
  // Add random component to ensure complete uniqueness
  const randomSuffix = useMemo(() => Math.random().toString(36).substring(7), []);
  
  if (!data.length) return <p className="text-center text-muted-foreground py-8">Không có dữ liệu</p>;

  const xKey = config?.xAxis || config?.nameKey || columns[0]?.field || 'label';
  const yKey = config?.yAxis || config?.dataKey || columns[1]?.field || 'value';

  // Ensure data has unique identifiers by adding index
  const chartData = useMemo(() => 
    data.map((item, idx) => ({ ...item, __uniqueIndex: idx })), 
    [data]
  );
  
  switch (type) {
    case 'Bar':
      return (
        <div key={`${type}-${xKey}-${yKey}-${randomSuffix}`}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid key={`grid-bar-${uniqueId}`} strokeDasharray="3 3" vertical={true} horizontal={true} />
              <XAxis key={`xaxis-bar-${uniqueId}`} dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis key={`yaxis-bar-${uniqueId}`} tick={{ fontSize: 11 }} />
              <Tooltip key={`tooltip-bar-${uniqueId}`} />
              <Legend key={`legend-bar-${uniqueId}`} />
              <Bar key={`bar-${uniqueId}`} dataKey={yKey} fill="#2563eb" radius={[4, 4, 0, 0]} name={columns.find(c => c.field === yKey)?.label || yKey} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'Line':
      return (
        <div key={`${type}-${xKey}-${yKey}-${randomSuffix}`}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid key={`grid-line-${uniqueId}`} strokeDasharray="3 3" vertical={true} horizontal={true} />
              <XAxis key={`xaxis-line-${uniqueId}`} dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis key={`yaxis-line-${uniqueId}`} tick={{ fontSize: 11 }} />
              <Tooltip key={`tooltip-line-${uniqueId}`} />
              <Legend key={`legend-line-${uniqueId}`} />
              <Line key={`line-${uniqueId}`} type="monotone" dataKey={yKey} stroke="#2563eb" dot name={columns.find(c => c.field === yKey)?.label || yKey} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    case 'Area':
      return (
        <div key={`${type}-${xKey}-${yKey}-${randomSuffix}`}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <CartesianGrid key={`grid-area-${uniqueId}`} strokeDasharray="3 3" vertical={true} horizontal={true} />
              <XAxis key={`xaxis-area-${uniqueId}`} dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis key={`yaxis-area-${uniqueId}`} tick={{ fontSize: 11 }} />
              <Tooltip key={`tooltip-area-${uniqueId}`} />
              <Area key={`area-${uniqueId}`} type="monotone" dataKey={yKey} fill="#2563eb" fillOpacity={0.15} stroke="#2563eb" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    case 'Pie':
      return (
        <div key={`${type}-${xKey}-${yKey}-${randomSuffix}`}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie key={`pie-${uniqueId}`} data={chartData} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, i) => <Cell key={`${uniqueId}-cell-${i}-${String(entry[xKey])}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip key={`tooltip-pie-${uniqueId}`} />
              <Legend key={`legend-pie-${uniqueId}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    case 'Radar':
      return (
        <div key={`${type}-${xKey}-${yKey}-${randomSuffix}`}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={chartData}>
              <PolarGrid key={`grid-radar-${uniqueId}`} />
              <PolarAngleAxis key={`angle-radar-${uniqueId}`} dataKey={xKey} tick={{ fontSize: 11 }} />
              <PolarRadiusAxis key={`radius-radar-${uniqueId}`} />
              <RadarShape key={`radar-${uniqueId}`} dataKey={yKey} fill="#2563eb" fillOpacity={0.3} stroke="#2563eb" />
              <Tooltip key={`tooltip-radar-${uniqueId}`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'Treemap':
      return (
        <div key={`${type}-${xKey}-${yKey}-${randomSuffix}`}>
          <ResponsiveContainer width="100%" height={320}>
            <Treemap key={`treemap-${uniqueId}`} data={chartData.map((d, i) => ({ name: String(d[xKey]), size: Number(d[yKey]), fill: CHART_COLORS[i % CHART_COLORS.length] }))} dataKey="size" nameKey="name" stroke="#fff" />
          </ResponsiveContainer>
        </div>
      );
    default:
      return null;
  }
}

// ===== Save Dialog =====
function SaveDialog({ open, onOpenChange, report, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  report: Partial<ReportDefinition>;
  onSave: (name: string, desc: string, isTemplate: boolean) => void;
}) {
  const [name, setName] = useState(report.name || '');
  const [desc, setDesc] = useState(report.description || '');
  const [isTemplate, setIsTemplate] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle><Save className="h-5 w-5 inline mr-2" />Lưu báo cáo</DialogTitle>
          <DialogDescription>Đặt tên và mô tả cho báo cáo của bạn</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Tên báo cáo *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Mô tả</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} /></div>
          <div className="flex items-center gap-2">
            <Checkbox checked={isTemplate} onCheckedChange={v => setIsTemplate(v === true)} id="tpl" />
            <label htmlFor="tpl" className="text-sm">Lưu làm template</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hu</Button>
          <Button onClick={() => { onSave(name, desc, isTemplate); onOpenChange(false); }} disabled={!name.trim()}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Main Page =====
export function ReportBuilderPage() {
  // Sidebar state
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Builder state
  const [step, setStep] = useState(1);
  const [dataSource, setDataSource] = useState<ReportDataSource | ''>('');
  const [availableFields, setAvailableFields] = useState<FieldDef[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ReportColumn[]>([]);
  const [filters, setFilters] = useState<ReportBuilderFilter[]>([]);
  const [groupBy, setGroupBy] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [chartType, setChartType] = useState<ReportChartType>('Bar');
  const [chartXAxis, setChartXAxis] = useState('');
  const [chartYAxis, setChartYAxis] = useState('');

  // Preview & Viewer
  const [executeResult, setExecuteResult] = useState<ExecuteResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportDefinition | null>(null);

  const fetchReports = useCallback(async () => {
    const res = await reportBuilderApi.getAll({ page: 1, pageSize: 50 });
    setReports(res.data);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Load fields when dataSource changes
  useEffect(() => {
    if (!dataSource) return;
    reportBuilderApi.getAvailableFields(dataSource).then(fields => {
      setAvailableFields(fields);
      setSelectedColumns(fields.map(f => ({
        field: f.field, label: f.label, visible: true,
        format: f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : undefined,
      })));
    });
  }, [dataSource]);

  const buildReportDef = (): Partial<ReportDefinition> => ({
    dataSource: dataSource as ReportDataSource,
    columns: selectedColumns,
    filters,
    groupBy: groupBy || undefined,
    sortBy: sortBy || undefined,
    sortDir,
    chartType,
    chartConfig: { xAxis: chartXAxis, yAxis: chartYAxis },
    name: editingReport?.name || '',
    description: editingReport?.description || '',
  });

  const handleExecute = async () => {
    if (!dataSource) { toast.error('Chọn nguồn dữ liệu trước'); return; }
    setExecuting(true);
    try {
      const def = buildReportDef() as ReportDefinition;
      const result = await reportBuilderApi.execute(def);
      setExecuteResult(result);
    } finally {
      setExecuting(false);
    }
  };

  const handleSave = async (name: string, desc: string, isTemplate: boolean) => {
    const def = { ...buildReportDef(), name, description: desc, isTemplate };
    if (editingReport?.id) {
      await reportBuilderApi.update(editingReport.id, def);
      toast.success('Đã cập nhật báo cáo');
    } else {
      const rpt = await reportBuilderApi.create(def);
      setEditingReport(rpt);
      toast.success('Đã lưu báo cáo');
    }
    fetchReports();
  };

  const handleSelectReport = async (id: string) => {
    const rpt = await reportBuilderApi.getById(id);
    if (!rpt) return;
    setSelectedId(id);
    setEditingReport(rpt);
    setDataSource(rpt.dataSource);
    setSelectedColumns(rpt.columns);
    setFilters(rpt.filters);
    setGroupBy(rpt.groupBy || '');
    setSortBy(rpt.sortBy || '');
    setSortDir(rpt.sortDir || 'asc');
    setChartType(rpt.chartType);
    setChartXAxis(rpt.chartConfig?.xAxis || '');
    setChartYAxis(rpt.chartConfig?.yAxis || '');
    // Auto execute
    const result = await reportBuilderApi.execute(rpt);
    setExecuteResult(result);
    setStep(6); // viewer mode
  };

  const handleNew = () => {
    setSelectedId(null);
    setEditingReport(null);
    setDataSource('');
    setSelectedColumns([]);
    setFilters([]);
    setGroupBy('');
    setSortBy('');
    setChartType('Bar');
    setChartXAxis('');
    setChartYAxis('');
    setExecuteResult(null);
    setStep(1);
  };

  const handleDelete = async (id: string) => {
    await reportBuilderApi.delete(id);
    toast.success('Đã xoá báo cáo');
    if (selectedId === id) handleNew();
    fetchReports();
  };

  const handleClone = async (id: string) => {
    await reportBuilderApi.clone(id);
    toast.success('Đã sao chép báo cáo');
    fetchReports();
  };

  const handleExportCSV = () => {
    if (!executeResult) return;
    exportToCSV(
      executeResult.rows as Record<string, unknown>[],
      executeResult.columns.map(c => ({ key: c.field, label: c.label })),
      editingReport?.name || 'bao-cao',
    );
    toast.success('Đã xuất CSV');
  };

  const handlePrint = () => window.print();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/reports/builder?reportId=${selectedId || ''}`;
    copyToClipboard(url);
    toast.success('Đã sao chép link!');
  };

  // Toggle column visibility
  const toggleColumn = (field: string) => {
    setSelectedColumns(cols => cols.map(c => c.field === field ? { ...c, visible: !c.visible } : c));
  };

  const setAggregation = (field: string, agg: string) => {
    setSelectedColumns(cols => cols.map(c =>
      c.field === field ? { ...c, aggregation: agg as ReportColumn['aggregation'] } : c
    ));
  };

  const addFilter = () => {
    if (!availableFields.length) return;
    setFilters(f => [...f, { field: availableFields[0].field, operator: '=', value: '' }]);
  };

  const removeFilter = (idx: number) => {
    setFilters(f => f.filter((_, i) => i !== idx));
  };

  const updateFilter = (idx: number, key: keyof ReportBuilderFilter, val: unknown) => {
    setFilters(f => f.map((fi, i) => i === idx ? { ...fi, [key]: val } : fi));
  };

  const templates = reports.filter(r => r.isTemplate);
  const userReports = reports.filter(r => !r.isTemplate);

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Tạo báo cáo' }]} />

      <div className="flex items-center gap-2 mb-4">
        <FileBarChart className="h-6 w-6 text-primary" />
        <h1>Báo cáo tuỳ chỉnh</h1>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 shrink-0 border rounded-lg p-3 space-y-3 h-fit">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Báo cáo</span>
              <Button size="sm" onClick={handleNew}><Plus className="h-3 w-3 mr-1" /> Tạo mới</Button>
            </div>

            {userReports.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Của tôi</p>
                {userReports.map(r => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-muted ${selectedId === r.id ? 'bg-primary/10' : ''}`}
                    onClick={() => handleSelectReport(r.id)}
                  >
                    <FileBarChart className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{r.name}</span>
                  </div>
                ))}
              </div>
            )}

            {templates.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Template</p>
                {templates.map(r => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-muted ${selectedId === r.id ? 'bg-primary/10' : ''}`}
                    onClick={() => handleSelectReport(r.id)}
                  >
                    <FileBarChart className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="truncate flex-1">{r.name}</span>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full" onClick={() => setSidebarOpen(false)}>
              <ChevronLeft className="h-3 w-3 mr-1" /> Thu gọn
            </Button>
          </div>
        )}

        {!sidebarOpen && (
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSidebarOpen(true)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Builder / Viewer */}
        <div className="flex-1 min-w-0">
          {/* Step indicator for builder mode */}
          {step <= 5 && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {['Nguồn', 'Cột', 'Lọc', 'Nhóm & Sắp xếp', 'Biểu đồ'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setStep(i + 1)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm shrink-0 transition-colors ${
                    step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="font-medium">{i + 1}</span> {label}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Nguồn dữ liệu */}
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>1. Chọn nguồn dữ liệu</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {DATA_SOURCES.map(ds => (
                    <div
                      key={ds.key}
                      onClick={() => { setDataSource(ds.key); setStep(2); }}
                      className={`p-3 border rounded-lg cursor-pointer text-center transition-all hover:shadow-md ${
                        dataSource === ds.key ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                      }`}
                    >
                      <div className="flex justify-center mb-2 text-primary">{ds.icon}</div>
                      <p className="text-sm">{ds.label}</p>
                      <p className="text-xs text-muted-foreground">{ds.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Chọn cột */}
          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>2. Chọn cột hiển thị</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {availableFields.map(f => {
                  const col = selectedColumns.find(c => c.field === f.field);
                  return (
                    <div key={f.field} className="flex items-center gap-3 p-2 border rounded-lg">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Checkbox
                        checked={col?.visible ?? true}
                        onCheckedChange={() => toggleColumn(f.field)}
                      />
                      <span className="flex-1 text-sm">{f.label} <span className="text-xs text-muted-foreground">({f.field})</span></span>
                      {f.type === 'number' && (
                        <Select value={col?.aggregation || '__none__'} onValueChange={v => setAggregation(f.field, v === '__none__' ? '' : v)}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Tổng hợp" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Không</SelectItem>
                            <SelectItem value="sum">Tổng</SelectItem>
                            <SelectItem value="avg">Trung bình</SelectItem>
                            <SelectItem value="count">Đếm</SelectItem>
                            <SelectItem value="min">Nhỏ nhất</SelectItem>
                            <SelectItem value="max">Lớn nhất</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
                  <Button onClick={() => setStep(3)}>Tiếp tục</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Điều kiện lọc */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>3. Điều kiện lọc</CardTitle>
                  <Button size="sm" variant="outline" onClick={addFilter}><Plus className="h-3 w-3 mr-1" /> Thêm</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filters.length === 0 && <p className="text-sm text-muted-foreground">Không có điều kiện lọc (tuỳ chọn)</p>}
                {filters.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <Select value={f.field} onValueChange={v => updateFilter(i, 'field', v)}>
                      <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableFields.map(af => <SelectItem key={af.field} value={af.field}>{af.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={f.operator} onValueChange={v => updateFilter(i, 'operator', v)}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['=', '!=', '>', '<', '>=', '<=', 'contains'].map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-32 h-8 text-xs"
                      value={String(f.value)}
                      onChange={e => updateFilter(i, 'value', e.target.value)}
                      placeholder="Giá trị"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeFilter(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
                  <Button onClick={() => setStep(4)}>Tiếp tục</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Nhóm & Sắp xếp */}
          {step === 4 && (
            <Card>
              <CardHeader><CardTitle>4. Nhóm & Sắp xếp</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nhóm theo</Label>
                  <Select value={groupBy || '__none__'} onValueChange={v => setGroupBy(v === '__none__' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Không nhóm" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Không nhóm</SelectItem>
                      {availableFields.map(f => <SelectItem key={f.field} value={f.field}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Sắp xếp theo</Label>
                    <Select value={sortBy || '__none__'} onValueChange={v => setSortBy(v === '__none__' ? '' : v)}>
                      <SelectTrigger><SelectValue placeholder="Mặc định" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Mặc định</SelectItem>
                        {availableFields.map(f => <SelectItem key={f.field} value={f.field}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28">
                    <Label>Hướng</Label>
                    <Select value={sortDir} onValueChange={v => setSortDir(v as 'asc' | 'desc')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Tăng dần</SelectItem>
                        <SelectItem value="desc">Giảm dần</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>Quay lại</Button>
                  <Button onClick={() => setStep(5)}>Tiếp tục</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Kiểu biểu đồ */}
          {step === 5 && (
            <Card>
              <CardHeader><CardTitle>5. Kiểu biểu đồ</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {CHART_TYPES.map(ct => (
                    <button
                      key={ct.key}
                      onClick={() => setChartType(ct.key)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                        chartType === ct.key ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'
                      }`}
                    >
                      {ct.icon} <span className="text-sm">{ct.label}</span>
                    </button>
                  ))}
                </div>

                {chartType !== 'Table' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Trục X / Nhãn</Label>
                      <Select value={chartXAxis || '__auto__'} onValueChange={v => setChartXAxis(v === '__auto__' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Tự động" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__auto__">Tự động</SelectItem>
                          {selectedColumns.filter(c => c.visible).map(c => <SelectItem key={c.field} value={c.field}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Trục Y / Giá trị</Label>
                      <Select value={chartYAxis || '__auto__'} onValueChange={v => setChartYAxis(v === '__auto__' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Tự động" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__auto__">Tự động</SelectItem>
                          {selectedColumns.filter(c => c.visible).map(c => <SelectItem key={c.field} value={c.field}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(4)}>Quay lại</Button>
                  <Button onClick={handleExecute} disabled={executing}>
                    <Play className="h-4 w-4 mr-1" /> {executing ? 'Đang xem...' : 'Xem trước'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowSave(true)}>
                    <Save className="h-4 w-4 mr-1" /> Lưu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview / Viewer */}
          {(executeResult || step === 6) && executeResult && (
            <Card className="mt-4 print:shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>{editingReport?.name || 'Kết quả xem trước'}</CardTitle>
                  <div className="flex gap-2 print:hidden">
                    <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-3 w-3 mr-1" /> CSV</Button>
                    <Button size="sm" variant="outline" onClick={handlePrint}><Printer className="h-3 w-3 mr-1" /> In</Button>
                    {selectedId && (
                      <>
                        <Button size="sm" variant="outline" onClick={handleCopyLink}><Link2 className="h-3 w-3 mr-1" /> Link</Button>
                        <Button size="sm" variant="outline" onClick={() => handleClone(selectedId)}><Copy className="h-3 w-3 mr-1" /> Sao chép</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedId)}><Trash2 className="h-3 w-3" /></Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chart */}
                {chartType !== 'Table' && (
                  <ChartRenderer
                    type={chartType}
                    data={executeResult.chartData}
                    config={editingReport?.chartConfig || { xAxis: chartXAxis, yAxis: chartYAxis }}
                    columns={executeResult.columns}
                  />
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted/50">
                        {executeResult.columns.map(c => (
                          <th key={c.field} className="text-left p-2 border-b">{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {executeResult.rows.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          {executeResult.columns.map(c => (
                            <td key={c.field} className="p-2">
                              {formatCellValue(row[c.field], c.format)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      <SaveDialog
        open={showSave}
        onOpenChange={setShowSave}
        report={buildReportDef()}
        onSave={handleSave}
      />
    </div>
  );
}
