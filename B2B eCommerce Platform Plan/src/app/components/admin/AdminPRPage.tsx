// ============================================================
// AdminPRPage — Quản lý Purchase Requisitions (Admin)
// Admin xem và xử lý tất cả PR từ các buyer
// ============================================================

import { useState, useEffect } from 'react';
import {
  ClipboardList, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertTriangle, TrendingUp, Users, DollarSign,
  ChevronDown, X, Download, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { EmptyState } from '../shared/EmptyState';
import { prApi } from '../../services/prApi';
import { toast } from 'sonner';
import type { PurchaseRequisition } from '../../types';

const STATUSES = ['Tất cả', 'Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã tạo đơn'];
const PRIORITIES = ['Tất cả', 'Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];

const PRIORITY_COLORS: Record<string, string> = {
  'Thấp': 'bg-blue-100 text-blue-700',
  'Trung bình': 'bg-yellow-100 text-yellow-700',
  'Cao': 'bg-orange-100 text-orange-700',
  'Khẩn cấp': 'bg-red-100 text-red-700',
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

function DetailDialog({ pr, onClose, onAction }: {
  pr: PurchaseRequisition;
  onClose: () => void;
  onAction: (id: string, action: 'approve' | 'reject', note: string) => void;
}) {
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState<'approve' | 'reject' | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">Chi tiết PR — {pr.prNumber}</h3>
            <p className="text-sm text-muted-foreground">{pr.requesterName} · {pr.department}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Trạng thái', value: <StatusBadge status={pr.status} /> },
              { label: 'Ưu tiên', value: <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[pr.priority] ?? 'bg-gray-100'}`}>{pr.priority}</span> },
              { label: 'Bộ phận', value: pr.department },
              { label: 'Ngày tạo', value: new Date(pr.createdAt).toLocaleDateString('vi-VN') },
              { label: 'Tổng ước tính', value: <span className="font-bold text-primary">{fmt(pr.estimatedTotal)}</span> },
              { label: 'Số sản phẩm', value: `${pr.items.length} mặt hàng` },
            ].map(item => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <div className="text-sm font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Reason */}
          {pr.reason && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Lý do mua hàng</p>
              <p className="text-sm">{pr.reason}</p>
            </div>
          )}

          {/* Items table */}
          <div>
            <p className="text-sm font-medium mb-2">Danh sách hàng cần mua</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 text-xs text-muted-foreground">Sản phẩm</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">SL</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">Đơn giá DK</th>
                    <th className="text-right p-2 text-xs text-muted-foreground">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {pr.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <p className="font-medium">{item.productName}</p>
                        {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                      </td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right text-muted-foreground">{fmt(item.estimatedPrice)}</td>
                      <td className="p-2 text-right font-medium">{fmt(item.quantity * item.estimatedPrice)}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30">
                    <td colSpan={3} className="p-2 text-right font-medium">Tổng cộng:</td>
                    <td className="p-2 text-right font-bold text-primary">{fmt(pr.estimatedTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval timeline */}
          {pr.approvals && pr.approvals.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Lịch sử phê duyệt</p>
              <div className="space-y-2">
                {pr.approvals.map((ap, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${ap.action === 'approve' ? 'bg-green-100' : ap.action === 'reject' ? 'bg-red-100' : 'bg-gray-100'}`}>
                      {ap.action === 'approve' ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> :
                       ap.action === 'reject' ? <XCircle className="h-3.5 w-3.5 text-red-500" /> :
                       <Clock className="h-3.5 w-3.5 text-gray-500" />}
                    </div>
                    <div>
                      <p className="font-medium">{ap.approverName}</p>
                      <p className="text-xs text-muted-foreground">{ap.note} · {new Date(ap.actedAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action note */}
          {pr.status === 'Chờ duyệt' && (
            <div>
              <label className="text-sm font-medium mb-1 block">Ghi chú phê duyệt</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                rows={2}
                placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {pr.status === 'Chờ duyệt' && (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => { onAction(pr.id, 'reject', note); onClose(); }}
              >
                <XCircle className="h-4 w-4 mr-1" /> Từ chối
              </Button>
              <Button onClick={() => { onAction(pr.id, 'approve', note); onClose(); }}>
                <CheckCircle className="h-4 w-4 mr-1" /> Duyệt PR
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminPRPage() {
  const [prs, setPRs] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PurchaseRequisition | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [priorityFilter, setPriorityFilter] = useState('Tất cả');

  const load = async () => {
    setLoading(true);
    try {
      const res = await prApi.getByCompany('all', { page: 1, pageSize: 100 }, { field: 'createdAt', direction: 'desc' });
      setPRs(res.data);
    } catch {
      // fallback mock
      setPRs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject', note: string) => {
    try {
      if (action === 'approve') {
        await prApi.approve(id, { approverId: 'admin', approverName: 'Quản trị viên', note });
        toast.success('Đã duyệt PR thành công');
      } else {
        await prApi.reject(id, 'admin', note || 'Không phù hợp quy định');
        toast.success('Đã từ chối PR');
      }
      load();
    } catch {
      toast.error('Lỗi xử lý PR');
    }
  };

  const filtered = prs.filter(pr => {
    const matchSearch = !search || pr.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      pr.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      pr.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || pr.status === statusFilter;
    const matchPriority = priorityFilter === 'Tất cả' || pr.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  // Stats
  const total = prs.length;
  const pending = prs.filter(p => p.status === 'Chờ duyệt').length;
  const approved = prs.filter(p => p.status === 'Đã duyệt').length;
  const totalValue = prs.filter(p => p.status !== 'Từ chối').reduce((s, p) => s + p.estimatedTotal, 0);

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Yêu cầu mua hàng (PR)' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Quản lý yêu cầu mua hàng
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Làm mới
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Tổng PR" value={total} icon={ClipboardList} variant="primary" />
        <StatsCard title="Chờ duyệt" value={pending} icon={Clock} variant="warning" />
        <StatsCard title="Đã duyệt" value={approved} icon={CheckCircle} variant="success" />
        <StatsCard title="Tổng giá trị" value={totalValue} format={v => fmt(v)} icon={DollarSign} variant="purple" />
      </div>

      {/* Alert for pending */}
      {pending > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm font-medium text-amber-700">{pending} PR đang chờ phê duyệt từ Admin</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm mã PR, người yêu cầu, bộ phận..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="Không có PR nào" description="Chưa có yêu cầu mua hàng nào phù hợp bộ lọc" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Mã PR</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Người yêu cầu</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Bộ phận</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Ưu tiên</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">SP</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Tổng DK</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Trạng thái</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Ngày tạo</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(pr => (
                  <tr key={pr.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-xs font-medium">{pr.prNumber}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {pr.requesterName.charAt(0)}
                        </div>
                        <span>{pr.requesterName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{pr.department}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[pr.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="p-3 text-center">{pr.items.length}</td>
                    <td className="p-3 text-right font-medium">{fmt(pr.estimatedTotal)}</td>
                    <td className="p-3"><StatusBadge status={pr.status} /></td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(pr.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(pr)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {pr.status === 'Chờ duyệt' && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleAction(pr.id, 'approve', '')}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(pr.id, 'reject', 'Từ chối bởi Admin')}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && <DetailDialog pr={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
    </div>
  );
}
