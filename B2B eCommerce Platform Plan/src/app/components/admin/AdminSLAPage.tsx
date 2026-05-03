// ============================================================
// AdminSLAPage — Giám sát SLA toàn hệ thống (D7)
// Stats, DataTable NCC vi phạm, Biểu đồ ranking, Banner cảnh báo
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, RefreshCw, Eye, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import type { SLADefinition } from '../../types';

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

const mockSLAs: (SLADefinition & { sellerName: string; score: number; violation: boolean })[] = [
  {
    id: 'SLA-001', sellerId: 'S01', sellerName: 'Tech Solutions VN',
    name: 'Cam kết giao hàng Q2/2026', status: 'Hiệu lực',
    metrics: [
      { metric: 'Tỷ lệ giao đúng hạn', target: 95, unit: '%', weight: 30 },
      { metric: 'Tỷ lệ hàng đúng chất lượng', target: 98, unit: '%', weight: 40 },
      { metric: 'Thời gian xử lý khiếu nại (ngày)', target: 3, unit: 'ngày', weight: 30 },
    ],
    penalties: '2% giá trị đơn/tháng vi phạm',
    bonuses: '1% nếu vượt tất cả KPI',
    buyerId: undefined, buyerName: undefined,
    startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2025-12-15T00:00:00',
    score: 91, violation: false,
  },
  {
    id: 'SLA-002', sellerId: 'S02', sellerName: 'Digital World',
    name: 'Cam kết DV Q1/2026', status: 'Hiệu lực',
    metrics: [
      { metric: 'Tỷ lệ giao đúng hạn', target: 90, unit: '%', weight: 40 },
      { metric: 'Hỗ trợ phản hồi < 24h', target: 95, unit: '%', weight: 30 },
      { metric: 'Tỷ lệ đơn hoàn thành', target: 99, unit: '%', weight: 30 },
    ],
    penalties: '1.5% giá trị đơn',
    bonuses: 'Bonus ưu tiên RFQ',
    buyerId: undefined, buyerName: undefined,
    startDate: '2026-01-01', endDate: '2026-06-30', createdAt: '2025-12-20T00:00:00',
    score: 72, violation: true,
  },
  {
    id: 'SLA-003', sellerId: 'S03', sellerName: 'Network Pro',
    name: 'SLA thiết bị mạng 2026', status: 'Hiệu lực',
    metrics: [
      { metric: 'Uptime thiết bị', target: 99.9, unit: '%', weight: 50 },
      { metric: 'Thời gian warranty response', target: 4, unit: 'giờ', weight: 50 },
    ],
    penalties: '5% giá trị hợp đồng',
    bonuses: 'Gia hạn hợp đồng ưu tiên',
    buyerId: undefined, buyerName: undefined,
    startDate: '2026-02-01', endDate: '2026-12-31', createdAt: '2026-01-15T00:00:00',
    score: 88, violation: false,
  },
  {
    id: 'SLA-004', sellerId: 'S04', sellerName: 'Office World',
    name: 'Cam kết văn phòng phẩm', status: 'Hiệu lực',
    metrics: [
      { metric: 'Tỷ lệ giao đúng hạn', target: 92, unit: '%', weight: 50 },
      { metric: 'Độ chính xác đơn hàng', target: 99, unit: '%', weight: 50 },
    ],
    penalties: '1% giá trị đơn',
    bonuses: 'Không có',
    buyerId: undefined, buyerName: undefined,
    startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2025-12-10T00:00:00',
    score: 65, violation: true,
  },
  {
    id: 'SLA-005', sellerId: 'S05', sellerName: 'Smart Devices Co',
    name: 'SLA thiết bị di động Q2', status: 'Hết hạn',
    metrics: [
      { metric: 'Tỷ lệ giao đúng hạn', target: 95, unit: '%', weight: 60 },
      { metric: 'Hỗ trợ kỹ thuật 24/7', target: 99, unit: '%', weight: 40 },
    ],
    penalties: '3% giá trị hợp đồng',
    bonuses: '2% nếu vượt KPI',
    buyerId: undefined, buyerName: undefined,
    startDate: '2025-01-01', endDate: '2025-12-31', createdAt: '2024-12-15T00:00:00',
    score: 94, violation: false,
  },
];

const trendData = [
  { month: 'T10/25', avg: 82 }, { month: 'T11/25', avg: 84 }, { month: 'T12/25', avg: 86 },
  { month: 'T1/26', avg: 83 }, { month: 'T2/26', avg: 85 }, { month: 'T3/26', avg: 79 },
];

const statusOptions = ['Tất cả', 'Hiệu lực', 'Hết hạn', 'Tạm ngừng'];

export function AdminSLAPage() {
  const [slas, setSlas] = useState<typeof mockSLAs>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<typeof mockSLAs[0] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setSlas(mockSLAs);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = slas.filter(s => {
    const matchSearch = !search || s.sellerName.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const violations = slas.filter(s => s.violation);
  const stats = {
    total: slas.length,
    active: slas.filter(s => s.status === 'Hiệu lực').length,
    violation: violations.length,
    avgScore: slas.length > 0 ? Math.round(slas.reduce((s, a) => s + a.score, 0) / slas.length) : 0,
  };

  const rankingData = [...slas].sort((a, b) => b.score - a.score).map(s => ({
    name: s.sellerName.split(' ').slice(0, 2).join(' '),
    score: s.score,
  }));

  const columns = [
    { key: 'sellerName', label: 'Nhà cung cấp', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'name', label: 'Tên SLA', render: (v: string) => <span className="text-sm">{v}</span> },
    {
      key: 'metrics', label: 'Số chỉ tiêu',
      render: (v: typeof mockSLAs[0]['metrics']) => <Badge variant="outline">{v.length} KPI</Badge>,
    },
    {
      key: 'score', label: 'Điểm TB',
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <Progress value={v} className="h-1.5 w-16" />
          <span className={`text-sm font-bold ${getScoreColor(v)}`}>{v}</span>
        </div>
      ),
    },
    {
      key: 'violation', label: 'Vi phạm',
      render: (v: boolean) => v
        ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Vi phạm</Badge>
        : <Badge variant="outline" className="text-green-600 border-green-300">Đạt</Badge>,
    },
    { key: 'status', label: 'Trạng thái', render: (v: string) => <Badge variant={v === 'Hiệu lực' ? 'default' : 'outline'}>{v}</Badge> },
    {
      key: 'actions', label: '',
      render: (_: unknown, row: typeof mockSLAs[0]) => (
        <Button size="sm" variant="ghost" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Giám sát SLA' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Giám sát SLA toàn hệ thống</h1>
          <p className="text-muted-foreground">Theo dõi cam kết dịch vụ của tất cả nhà cung cấp</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng SLA" value={stats.total} icon={<ShieldCheck className="h-5 w-5 text-primary" />} />
        <StatsCard title="Đang hiệu lực" value={stats.active} icon={<TrendingUp className="h-5 w-5 text-green-500" />} color="success" />
        <StatsCard title="Đang vi phạm" value={stats.violation} icon={<AlertTriangle className="h-5 w-5 text-red-500" />} color="danger" />
        <StatsCard title="Điểm TB toàn sàn" value={stats.avgScore} icon={<BarChart3 className="h-5 w-5 text-blue-500" />} color="info" />
      </div>

      {/* Violation Banner */}
      {violations.length > 0 && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-red-700">Cảnh báo vi phạm SLA ({violations.length} NCC)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {violations.map(v => (
                <Badge key={v.id} variant="destructive" className="gap-1">
                  {v.sellerName} — Điểm: {v.score}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Điểm SLA theo NCC</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={110} />
                  <Tooltip formatter={(v: number) => [`${v} điểm`, 'Điểm SLA']} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]}
                    label={{ position: 'right', fontSize: 11, fill: '#64748b' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Xu hướng điểm TB toàn sàn</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip formatter={(v: number) => [`${v} điểm`, 'Trung bình']} />
                  <Legend />
                  <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} name="Điểm TB" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Table */}
      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm NCC, tên SLA..."
        filters={[{ key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
      />
      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Không có SLA nào" pagination />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">NCC:</span> <strong>{selected.sellerName}</strong></div>
                <div><span className="text-muted-foreground">Điểm tổng:</span> <strong className={getScoreColor(selected.score)}>{selected.score}/100</strong></div>
                <div><span className="text-muted-foreground">Hiệu lực:</span> {selected.startDate} → {selected.endDate}</div>
                <div><span className="text-muted-foreground">Vi phạm:</span> {selected.violation ? <Badge variant="destructive">Có</Badge> : <Badge className="bg-green-500">Đạt</Badge>}</div>
                <div><span className="text-muted-foreground">Phạt:</span> {selected.penalties}</div>
                <div><span className="text-muted-foreground">Thưởng:</span> {selected.bonuses}</div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Chi tiết chỉ tiêu</h4>
                <div className="space-y-2">
                  {selected.metrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.metric}</p>
                        <p className="text-xs text-muted-foreground">Mục tiêu: {m.target}{m.unit} · Trọng số: {m.weight}%</p>
                      </div>
                      <Progress value={m.weight} className="h-1.5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
