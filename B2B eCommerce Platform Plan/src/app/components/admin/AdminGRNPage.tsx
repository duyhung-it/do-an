// ============================================================
// AdminGRNPage — Quản lý Biên bản nhận hàng (Admin)
// Admin xem tất cả GRN, theo dõi chất lượng, xử lý vấn đề
// ============================================================

import { useState, useEffect } from 'react';
import {
  PackageCheck, Search, Eye, AlertTriangle, CheckCircle,
  Clock, Star, Download, RefreshCw, X, Package, TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { EmptyState } from '../shared/EmptyState';
import { grnApi } from '../../services/grnApi';
import { toast } from 'sonner';
import type { GoodsReceivedNote } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const STATUSES = ['Tất cả', 'Chờ xác nhận', 'Hoàn thành', 'Có vấn đề', 'Đã khiếu nại'];

function QualityStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(score) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

function DetailDialog({ grn, onClose }: { grn: GoodsReceivedNote; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">GRN — {grn.grnNumber}</h3>
            <p className="text-sm text-muted-foreground">Đơn hàng {grn.orderNumber} · {grn.supplierName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tổng SP', value: grn.items.length + '' },
              { label: 'SL nhận', value: grn.items.reduce((s, i) => s + i.receivedQty, 0) + '' },
              { label: 'SL chấp nhận', value: grn.items.reduce((s, i) => s + i.acceptedQty, 0) + '' },
              { label: 'SL lỗi', value: grn.items.reduce((s, i) => s + i.rejectedQty, 0) + '' },
            ].map(s => (
              <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Quality score */}
          <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{grn.qualityScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Điểm CL</p>
            </div>
            <div>
              <QualityStars score={grn.qualityScore} />
              <p className="text-sm text-muted-foreground mt-1">{grn.notes}</p>
            </div>
          </div>

          {/* Items table */}
          <div>
            <p className="text-sm font-medium mb-2">Chi tiết từng mặt hàng</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 text-xs text-muted-foreground">Sản phẩm</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">Đặt</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">Nhận</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">Chấp nhận</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">Lỗi</th>
                    <th className="text-left p-2 text-xs text-muted-foreground">Lý do lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items.map((item, i) => (
                    <tr key={i} className={`border-t ${item.rejectedQty > 0 ? 'bg-red-50/30' : ''}`}>
                      <td className="p-2 font-medium">{item.productName}</td>
                      <td className="p-2 text-right">{item.orderedQty}</td>
                      <td className="p-2 text-right">{item.receivedQty}</td>
                      <td className="p-2 text-right text-green-700">{item.acceptedQty}</td>
                      <td className="p-2 text-right text-red-600">{item.rejectedQty || '—'}</td>
                      <td className="p-2 text-xs text-muted-foreground">{item.defectReason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Images (simulated) */}
          {grn.photoUrls && grn.photoUrls.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Ảnh biên bản</p>
              <div className="flex gap-2 flex-wrap">
                {grn.photoUrls.map((url, i) => (
                  <div key={i} className="h-20 w-28 rounded-lg overflow-hidden bg-muted border">
                    <img src={url} alt={`GRN photo ${i + 1}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {grn.status === 'Có vấn đề' && (
            <Button onClick={() => { toast.success('Đã tạo phiếu khiếu nại với NCC'); onClose(); }}>
              <AlertTriangle className="h-4 w-4 mr-1" /> Tạo khiếu nại với NCC
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminGRNPage() {
  const [grns, setGRNs] = useState<GoodsReceivedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GoodsReceivedNote | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  const load = async () => {
    setLoading(true);
    try {
      const res = await grnApi.getByBuyer('all', { page: 1, pageSize: 100 }, { field: 'createdAt', direction: 'desc' });
      setGRNs(res.data);
    } catch {
      setGRNs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = grns.filter(g => {
    const matchSearch = !search || g.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
      g.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      g.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const issueGRNs = grns.filter(g => g.status === 'Có vấn đề');
  const avgQuality = grns.length > 0 ? (grns.reduce((s, g) => s + g.qualityScore, 0) / grns.length) : 0;
  const totalRejected = grns.reduce((s, g) => s + g.items.reduce((si, i) => si + i.rejectedQty, 0), 0);

  // Chart: quality trend per supplier
  const supplierQuality = Object.entries(
    grns.reduce((acc, g) => {
      if (!acc[g.supplierName]) acc[g.supplierName] = { total: 0, count: 0 };
      acc[g.supplierName].total += g.qualityScore;
      acc[g.supplierName].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([name, d]) => ({ name: name.replace('NCC ', ''), avg: parseFloat((d.total / d.count).toFixed(2)) }))
   .sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Biên bản nhận hàng (GRN)' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PackageCheck className="h-6 w-6 text-primary" />
          Quản lý biên bản nhận hàng
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Xuất Excel</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Tổng GRN" value={grns.length} icon={PackageCheck} variant="primary" />
        <StatsCard title="Có vấn đề" value={issueGRNs.length} icon={AlertTriangle} variant="warning" />
        <StatsCard title="Điểm CL TB" value={avgQuality} format={v => v.toFixed(2) + ' ★'} icon={Star} variant="success" />
        <StatsCard title="Tổng SP lỗi" value={totalRejected} icon={TrendingDown} variant="danger" />
      </div>

      {/* Issue alert */}
      {issueGRNs.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">{issueGRNs.length} GRN có vấn đề cần xử lý — tạo khiếu nại với NCC</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quality by supplier chart */}
        {supplierQuality.length > 0 && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Điểm CL theo NCC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={supplierQuality} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [v + ' ★', 'TB Điểm CL']} />
                    <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                      {supplierQuality.map((d, i) => (
                        <Cell key={i} fill={d.avg >= 4 ? '#22c55e' : d.avg >= 3 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GRN Table */}
        <div className={`space-y-3 ${supplierQuality.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Tìm mã GRN, NCC, đơn hàng..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<PackageCheck className="h-10 w-10" />} title="Không có GRN" description="Chưa có biên bản nhận hàng nào" />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-xs text-muted-foreground">Mã GRN</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Đơn hàng</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">NCC</th>
                      <th className="text-center p-3 text-xs text-muted-foreground">Điểm CL</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Trạng thái</th>
                      <th className="text-left p-3 text-xs text-muted-foreground">Ngày nhận</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(g => (
                      <tr key={g.id} className={`border-b hover:bg-muted/20 transition-colors ${g.status === 'Có vấn đề' ? 'bg-red-50/20' : ''}`}>
                        <td className="p-3 font-mono text-xs font-medium">{g.grnNumber}</td>
                        <td className="p-3 text-muted-foreground">{g.orderNumber}</td>
                        <td className="p-3">{g.supplierName}</td>
                        <td className="p-3 text-center"><QualityStars score={g.qualityScore} /></td>
                        <td className="p-3"><StatusBadge status={g.status} /></td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(g.receivedAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3">
                          <Button size="sm" variant="ghost" onClick={() => setSelected(g)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {selected && <DetailDialog grn={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
