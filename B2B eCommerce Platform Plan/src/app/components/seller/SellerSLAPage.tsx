// ============================================================
// Quản lý SLA — Seller (Nhóm 36C)
// DataTable, FormDialog, Chi tiết + biểu đồ
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck, Plus, Eye, AlertTriangle, CheckCircle2, XCircle,
  BarChart3, Target,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { slaApi } from '../../services/slaApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  SLADefinition, SLAReport, SLAMetric, SLAMetricDef, SLAStatus,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const ALL_METRICS: SLAMetric[] = [
  'Tỷ lệ giao đúng hạn', 'Tỷ lệ hàng đạt chất lượng', 'Thời gian phản hồi',
  'Tỷ lệ đơn hoàn thành', 'Tỷ lệ trả hàng', 'Thời gian xử lý khiếu nại',
];
const ALL_STATUSES: SLAStatus[] = ['Bản nháp', 'Hiệu lực', 'Đã hết hạn', 'Đã huỷ'];
const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const emptyMetric = (): SLAMetricDef => ({
  id: `m-new-${Date.now()}-${Math.random()}`, metric: ALL_METRICS[0], target: 90, unit: '%', weight: 20,
});

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-100 text-green-700' :
    score >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return <Badge className={`${color} gap-1`}><Target className="h-3 w-3" />{score}</Badge>;
}

export function SellerSLAPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sellerId = user?.supplierId ?? 'sup-01';

  const [slas, setSlas] = useState<SLADefinition[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; active: number; avgScore: number; violationCount: number } | null>(null);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<SLADefinition | null>(null);
  const [reports, setReports] = useState<SLAReport[]>([]);
  const [detailTab, setDetailTab] = useState('metrics');

  // Form
  const [formName, setFormName] = useState('');
  const [formBuyer, setFormBuyer] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formPenalty, setFormPenalty] = useState(1.0);
  const [formBonus, setFormBonus] = useState(0.5);
  const [formNote, setFormNote] = useState('');
  const [formMetrics, setFormMetrics] = useState<SLAMetricDef[]>([emptyMetric()]);

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        slaApi.getBySeller(sellerId, pagination, sort, filters, search),
        slaApi.getStats(sellerId),
      ]);
      setSlas(res.data);
      setTotal(res.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [sellerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (sla: SLADefinition) => {
    setSelected(sla);
    setDetailTab('metrics');
    const rpts = await slaApi.getReports(sla.id);
    setReports(rpts);
    setShowDetail(true);
  };

  // Form
  const resetForm = () => {
    setFormName(''); setFormBuyer(''); setFormStartDate(''); setFormEndDate('');
    setFormPenalty(1.0); setFormBonus(0.5); setFormNote('');
    setFormMetrics([emptyMetric()]);
  };

  const handleCreate = async () => {
    if (!formName || !formStartDate || !formEndDate || formMetrics.some(m => !m.metric)) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    await slaApi.create({
      name: formName, sellerId, sellerName: user?.fullName ?? '', sellerCompany: user?.companyName ?? '',
      buyerCompany: formBuyer || undefined,
      metrics: formMetrics, penaltyRate: formPenalty, bonusRate: formBonus,
      startDate: formStartDate, endDate: formEndDate, note: formNote,
    });
    toast.success('Đã tạo cam kết dịch vụ (SLA)');
    setShowForm(false); resetForm(); fetchData();
  };

  // Columns
  const columns: (ColumnConfig & { render?: (item: SLADefinition) => React.ReactNode })[] = [
    { key: 'slaNumber', label: 'Mã SLA', visible: true, sortable: true },
    { key: 'name', label: 'Tên SLA', visible: true, sortable: true,
      render: (s) => <span className="line-clamp-1 max-w-[200px]">{s.name}</span>,
    },
    { key: 'buyerCompany', label: 'Người mua', visible: true, sortable: true,
      render: (s) => <span>{s.buyerCompany ?? 'Tất cả'}</span>,
    },
    { key: 'metricCount', label: 'Chỉ tiêu', visible: true, sortable: false,
      render: (s) => <span>{s.metrics.length}</span>,
    },
    { key: 'currentScore', label: 'Điểm TB', visible: true, sortable: true,
      render: (s) => s.currentScore > 0 ? <ScoreBadge score={s.currentScore} /> : <span className="text-muted-foreground">—</span>,
    },
    { key: 'endDate', label: 'Hiệu lực', visible: true, sortable: true,
      render: (s) => <span className="text-sm">{formatDate(s.startDate)} — {formatDate(s.endDate)}</span>,
    },
    { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  const statsCards = stats ? [
    { label: 'Tổng SLA', value: stats.total, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Hiệu lực', value: stats.active, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Điểm TB', value: stats.avgScore, icon: Target, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Vi phạm', value: stats.violationCount, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ] : [];

  // --- Chart data ---
  const trendData = reports.map(r => ({
    period: r.period.replace('2025-', 'T'),
    score: r.overallScore,
  }));

  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;
  const barData = latestReport ? latestReport.metrics.map(m => ({
    name: m.metric.replace('Tỷ lệ ', '').replace('Thời gian ', 'TG '),
    score: m.score, target: 100,
    fill: m.status === 'Đạt' ? '#22c55e' : m.status === 'Cảnh báo' ? '#f59e0b' : '#ef4444',
  })) : [];

  const radarData = latestReport ? latestReport.metrics.map(m => ({
    metric: m.metric.replace('Tỷ lệ ', '').replace('Thời gian ', 'TG '),
    actual: m.score,
    target: 100,
  })) : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Cam kết DV' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Cam kết dịch vụ (SLA)</h1>
          <p className="text-muted-foreground">Quản lý cam kết chất lượng dịch vụ với người mua</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo SLA
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsCards.map(card => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-semibold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã SLA, tên, buyer..."
      />

      <div className="mt-4">
        <DataTable
          data={slas}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={s => s.id}
          loading={loading}
          renderActions={(sla) => (
            <Button size="sm" variant="ghost" onClick={() => navigate(`/seller/sla/${sla.id}`)}><Eye className="h-4 w-4" /></Button>
          )}
        />
      </div>

      {/* ==================== DIALOG: Tạo SLA ==================== */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo cam kết dịch vụ (SLA)</DialogTitle>
            <DialogDescription>Thiết lập chỉ tiêu và cam kết chất lượng dịch vụ</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div><Label>Tên SLA <span className="text-red-500">*</span></Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="VD: SLA Linh kiện — ABC Corp" /></div>
            <div><Label>Người mua (để trống = áp dụng tất cả)</Label><Input value={formBuyer} onChange={e => setFormBuyer(e.target.value)} placeholder="Tên công ty" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Bắt đầu <span className="text-red-500">*</span></Label><Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} /></div>
              <div><Label>Kết thúc <span className="text-red-500">*</span></Label><Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phạt vi phạm (%)</Label><Input type="number" min={0} step={0.1} value={formPenalty} onChange={e => setFormPenalty(Number(e.target.value))} /></div>
              <div><Label>Thưởng đạt (%)</Label><Input type="number" min={0} step={0.1} value={formBonus} onChange={e => setFormBonus(Number(e.target.value))} /></div>
            </div>
            <div><Label>Ghi chú</Label><Textarea value={formNote} onChange={e => setFormNote(e.target.value)} rows={2} /></div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Chỉ tiêu (Metrics)</Label>
                <Button size="sm" variant="outline" onClick={() => setFormMetrics(p => [...p, emptyMetric()])}>
                  <Plus className="h-3 w-3 mr-1" /> Thêm
                </Button>
              </div>
              <div className="space-y-2">
                {formMetrics.map((m, idx) => (
                  <div key={m.id} className="grid grid-cols-12 gap-2 items-end p-2 border rounded">
                    <div className="col-span-4">
                      <Select value={m.metric} onValueChange={v => setFormMetrics(p => p.map((x, i) => i === idx ? { ...x, metric: v as SLAMetric } : x))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{ALL_METRICS.map(met => <SelectItem key={met} value={met}>{met}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} value={m.target} onChange={e => setFormMetrics(p => p.map((x, i) => i === idx ? { ...x, target: Number(e.target.value) } : x))} placeholder="Mục tiêu" />
                    </div>
                    <div className="col-span-2">
                      <Select value={m.unit} onValueChange={v => setFormMetrics(p => p.map((x, i) => i === idx ? { ...x, unit: v } : x))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{['%', 'giờ', 'ngày', 'điểm'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={1} max={100} value={m.weight} onChange={e => setFormMetrics(p => p.map((x, i) => i === idx ? { ...x, weight: Number(e.target.value) } : x))} placeholder="Trọng số %" />
                    </div>
                    <div className="col-span-2">
                      <Button size="sm" variant="ghost" className="text-red-500" disabled={formMetrics.length <= 1}
                        onClick={() => setFormMetrics(p => p.filter((_, i) => i !== idx))}>✕</Button>
                    </div>
                  </div>
                ))}
                <p className="text-right text-sm text-muted-foreground">
                  Tổng trọng số: {formMetrics.reduce((s, m) => s + m.weight, 0)}%
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Huỷ</Button>
            <Button onClick={handleCreate} className="gap-2"><ShieldCheck className="h-4 w-4" /> Tạo SLA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Chi tiết ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Mã:</span><p className="font-medium">{selected.slaNumber}</p></div>
                <div><span className="text-muted-foreground">Người mua:</span><p className="font-medium">{selected.buyerCompany ?? 'Tất cả'}</p></div>
                <div><span className="text-muted-foreground">Điểm hiện tại:</span><div className="mt-0.5">{selected.currentScore > 0 ? <ScoreBadge score={selected.currentScore} /> : '—'}</div></div>
                <div><span className="text-muted-foreground">Hiệu lực:</span><p>{formatDate(selected.startDate)} — {formatDate(selected.endDate)}</p></div>
                <div><span className="text-muted-foreground">Phạt/Thưởng:</span><p>{selected.penaltyRate}% / {selected.bonusRate}%</p></div>
                <div><span className="text-muted-foreground">Trạng thái:</span><div className="mt-0.5"><StatusBadge status={selected.status} /></div></div>
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList>
                  <TabsTrigger value="metrics">Chỉ tiêu ({selected.metrics.length})</TabsTrigger>
                  <TabsTrigger value="reports">Báo cáo ({reports.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-3 mt-3">
                  {selected.metrics.map(m => {
                    const latestM = latestReport?.metrics.find(rm => rm.metricId === m.id);
                    return (
                      <div key={m.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">{m.metric}</p>
                          <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                            <span>Mục tiêu: <strong>{m.target}{m.unit}</strong></span>
                            <span>Trọng số: {m.weight}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {latestM ? (
                            <div>
                              <span className="text-lg font-semibold">{latestM.actual}{m.unit}</span>
                              <Badge className={`ml-2 ${
                                latestM.status === 'Đạt' ? 'bg-green-100 text-green-700' :
                                latestM.status === 'Cảnh báo' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {latestM.status === 'Vi phạm' && <XCircle className="h-3 w-3 mr-1" />}
                                {latestM.status === 'Cảnh báo' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {latestM.status === 'Đạt' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {latestM.status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Chưa có dữ liệu</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="reports" className="mt-3 space-y-4">
                  {reports.length > 0 ? (
                    <>
                      {/* Line chart: điểm SLA theo tháng */}
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Xu hướng điểm SLA</CardTitle></CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="period" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Điểm SLA" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Bar chart: chi tiết chỉ tiêu mới nhất */}
                      {barData.length > 0 && (
                        <Card>
                          <CardHeader className="pb-2"><CardTitle className="text-sm">Chi tiết chỉ tiêu (kỳ gần nhất)</CardTitle></CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="score" name="Điểm">
                                  {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Radar chart */}
                      {radarData.length > 0 && (
                        <Card>
                          <CardHeader className="pb-2"><CardTitle className="text-sm">Biểu đồ radar</CardTitle></CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                              <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis domain={[0, 100]} />
                                <Radar name="Thực tế" dataKey="actual" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                <Radar name="Mục tiêu" dataKey="target" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.1} />
                                <Legend />
                              </RadarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Chưa có báo cáo SLA</p>
                  )}
                </TabsContent>
              </Tabs>

              {selected.note && <p className="text-sm text-muted-foreground">{selected.note}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}