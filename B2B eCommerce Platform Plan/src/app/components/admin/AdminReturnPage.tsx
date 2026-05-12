// ============================================================
// AdminReturnPage — Quản lý trả hàng toàn hệ thống (D15)
// Stats, DataTable, Timeline, Can thiệp, Cưỡng chế hoàn tiền
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Clock, CheckCircle, XCircle, DollarSign, RefreshCw, Eye, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

interface ReturnRequest {
  id: string;
  buyerName: string;
  sellerName: string;
  orderNumber: string;
  reason: string;
  amount: number;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
  timeline: { date: string; event: string; actor: string }[];
}

const mockReturns: ReturnRequest[] = [
  {
    id: 'RET-001', buyerName: 'Công ty ABC', sellerName: 'Tech Solutions VN',
    orderNumber: 'ORD-2026-0085', reason: 'Sản phẩm không đúng mô tả, màu sắc khác catalog',
    amount: 12500000, status: 'Chờ xử lý', createdAt: '2026-04-05T10:00:00',
    timeline: [
      { date: '2026-04-05T10:00:00', event: 'Buyer tạo yêu cầu trả hàng', actor: 'Công ty ABC' },
      { date: '2026-04-05T14:00:00', event: 'Hệ thống gửi notification cho NCC', actor: 'Hệ thống' },
    ],
  },
  {
    id: 'RET-002', buyerName: 'Tập đoàn XYZ', sellerName: 'Digital World',
    orderNumber: 'ORD-2026-0072', reason: 'Hàng bị vỡ khi vận chuyển, cần đổi hàng mới',
    amount: 34000000, status: 'Đang tranh chấp', createdAt: '2026-04-01T09:00:00',
    adminNote: 'NCC từ chối nhưng có ảnh minh chứng hàng vỡ',
    timeline: [
      { date: '2026-04-01T09:00:00', event: 'Buyer tạo yêu cầu', actor: 'Tập đoàn XYZ' },
      { date: '2026-04-02T11:00:00', event: 'NCC từ chối: "Hàng nguyên vẹn khi xuất kho"', actor: 'Digital World' },
      { date: '2026-04-03T15:00:00', event: 'Buyer leo thang tranh chấp', actor: 'Tập đoàn XYZ' },
    ],
  },
  {
    id: 'RET-003', buyerName: 'Ngân hàng DEF', sellerName: 'Network Pro',
    orderNumber: 'ORD-2026-0058', reason: 'Thiết bị bị lỗi ngay khi mở hộp (DOA)',
    amount: 8900000, status: 'Đã hoàn tiền', createdAt: '2026-03-25T08:00:00', resolvedAt: '2026-03-29T16:00:00',
    timeline: [
      { date: '2026-03-25T08:00:00', event: 'Buyer báo lỗi DOA', actor: 'Ngân hàng DEF' },
      { date: '2026-03-26T10:00:00', event: 'NCC xác nhận thiết bị lỗi', actor: 'Network Pro' },
      { date: '2026-03-29T16:00:00', event: 'Đã hoàn tiền 100%', actor: 'Hệ thống' },
    ],
  },
  {
    id: 'RET-004', buyerName: 'Công ty GHI', sellerName: 'Office World',
    orderNumber: 'ORD-2026-0041', reason: 'Đặt nhầm model, muốn đổi sang model khác',
    amount: 3200000, status: 'Từ chối', createdAt: '2026-03-18T14:00:00', resolvedAt: '2026-03-20T09:00:00',
    timeline: [
      { date: '2026-03-18T14:00:00', event: 'Buyer yêu cầu đổi model', actor: 'Công ty GHI' },
      { date: '2026-03-20T09:00:00', event: 'NCC từ chối: Lỗi từ phía buyer (đặt sai)', actor: 'Office World' },
    ],
  },
  {
    id: 'RET-005', buyerName: 'Công ty JKL', sellerName: 'Smart Devices Co',
    orderNumber: 'ORD-2026-0095', reason: 'Nhận thiếu hàng, còn thiếu 5 bộ trong danh sách',
    amount: 15600000, status: 'Đang xử lý', createdAt: '2026-04-06T11:00:00',
    timeline: [
      { date: '2026-04-06T11:00:00', event: 'Buyer thông báo thiếu hàng', actor: 'Công ty JKL' },
      { date: '2026-04-06T15:00:00', event: 'NCC đang kiểm tra kho', actor: 'Smart Devices Co' },
    ],
  },
];

const statusOptions = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đang tranh chấp', 'Đã hoàn tiền', 'Từ chối'];

export function AdminReturnPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [interveneNote, setInterveneNote] = useState('');
  const [showIntervene, setShowIntervene] = useState<'intervene' | 'force-refund' | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setReturns(mockReturns);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = returns.filter(r => {
    const matchSearch = !search || r.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      r.sellerName.toLowerCase().includes(search.toLowerCase()) || r.orderNumber.includes(search);
    const matchStatus = statusFilter === 'Tất cả' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: returns.length,
    pending: returns.filter(r => ['Chờ xử lý', 'Đang xử lý'].includes(r.status)).length,
    refunded: returns.filter(r => r.status === 'Đã hoàn tiền').length,
    disputed: returns.filter(r => r.status === 'Đang tranh chấp').length,
    avgDays: 4,
  };

  const columns = [
    { key: 'id', label: 'Mã trả', render: (item: ReturnRequest) => <span className="font-mono text-xs text-muted-foreground">{item.id}</span> },
    {
      key: 'buyerName', label: 'Buyer → NCC',
      render: (item: ReturnRequest) => (
        <div>
          <p className="font-medium text-sm">{item.buyerName}</p>
          <p className="text-xs text-muted-foreground">→ {item.sellerName}</p>
          <p className="text-xs text-blue-600">{item.orderNumber}</p>
        </div>
      ),
    },
    {
      key: 'reason', label: 'Lý do',
      render: (item: ReturnRequest) => <p className="text-sm line-clamp-2 max-w-48">{item.reason}</p>,
    },
    {
      key: 'amount', label: 'Số tiền',
      render: (item: ReturnRequest) => <span className="text-primary font-semibold">{formatCurrency(item.amount)}</span>,
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (item: ReturnRequest) => <span className="text-xs">{formatDate(item.createdAt)}</span> },
    { key: 'status', label: 'Trạng thái', render: (item: ReturnRequest) => <StatusBadge status={item.status} /> },
    {
      key: 'actions', label: '',
      render: (item: ReturnRequest) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(item)}><Eye className="h-4 w-4" /></Button>
          {item.status === 'Đang tranh chấp' && (
            <Button size="sm" variant="ghost" className="text-orange-600" title="Can thiệp"
              onClick={() => { setSelected(item); setShowIntervene('intervene'); }}>
              <Shield className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleAction = (action: 'intervene' | 'force-refund') => {
    if (!selected || !interveneNote.trim()) return;
    setReturns(prev => prev.map(r => r.id === selected.id
      ? {
        ...r,
        status: action === 'force-refund' ? 'Đã hoàn tiền' : 'Đang xử lý',
        adminNote: interveneNote,
        resolvedAt: action === 'force-refund' ? new Date().toISOString() : undefined,
        timeline: [...r.timeline, { date: new Date().toISOString(), event: action === 'force-refund' ? `Admin cưỡng chế hoàn tiền: ${interveneNote}` : `Admin can thiệp: ${interveneNote}`, actor: 'Admin' }],
      }
      : r
    ));
    toast.success(action === 'force-refund' ? 'Đã cưỡng chế hoàn tiền' : 'Đã can thiệp vào tranh chấp');
    setShowIntervene(null);
    setInterveneNote('');
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Quản lý trả hàng' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><RotateCcw className="h-6 w-6 text-primary" /> Quản lý trả hàng</h1>
          <p className="text-muted-foreground">Giám sát và can thiệp yêu cầu trả hàng trên toàn sàn</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatsCard title="Tổng yêu cầu" value={stats.total} icon={RotateCcw} />
        <StatsCard title="Chờ xử lý" value={stats.pending} icon={Clock} variant="warning" />
        <StatsCard title="Tranh chấp" value={stats.disputed} icon={AlertTriangle} variant="danger" />
        <StatsCard title="Đã hoàn tiền" value={stats.refunded} icon={CheckCircle} variant="success" />
        <StatsCard title="TB thời gian xử lý" value={stats.avgDays} format={(n) => `${n} ngày`} icon={Clock} variant="info" />
      </div>

      {/* Alert tranh chấp */}
      {stats.disputed > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span><strong>{stats.disputed} tranh chấp</strong> đang chờ Admin can thiệp</span>
        </div>
      )}

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm buyer, NCC, số đơn..."
        filters={[{ key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
      />

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Không có yêu cầu trả hàng nào" pagination getId={item => item.id} />

      {/* Detail Dialog */}
      <Dialog open={!!selected && !showIntervene} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Buyer:</span> <strong>{selected.buyerName}</strong></div>
                <div><span className="text-muted-foreground">NCC:</span> <strong>{selected.sellerName}</strong></div>
                <div><span className="text-muted-foreground">Đơn hàng:</span> {selected.orderNumber}</div>
                <div><span className="text-muted-foreground">Số tiền:</span> <strong className="text-primary">{formatCurrency(selected.amount)}</strong></div>
                <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge status={selected.status} /></div>
                {selected.resolvedAt && <div><span className="text-muted-foreground">Giải quyết:</span> {formatDate(selected.resolvedAt)}</div>}
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium mb-1">Lý do trả hàng:</p>
                <p className="text-muted-foreground">{selected.reason}</p>
              </div>
              {selected.adminNote && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-700 mb-1">Ghi chú Admin:</p>
                  <p className="text-orange-600">{selected.adminNote}</p>
                </div>
              )}
              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Lịch sử xử lý</h4>
                <div className="space-y-2">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        {i < selected.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-xs text-muted-foreground">{formatDate(t.date)} · {t.actor}</p>
                        <p className="text-sm">{t.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selected?.status === 'Đang tranh chấp' && (
              <>
                <Button variant="outline" className="text-orange-600" onClick={() => setShowIntervene('intervene')}>
                  <Shield className="h-4 w-4 mr-1" /> Can thiệp
                </Button>
                <Button variant="destructive" onClick={() => setShowIntervene('force-refund')}>
                  <DollarSign className="h-4 w-4 mr-1" /> Cưỡng chế HT
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Intervene / Force Refund Dialog */}
      <Dialog open={!!showIntervene} onOpenChange={() => setShowIntervene(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={showIntervene === 'force-refund' ? 'text-destructive' : 'text-orange-600'}>
              {showIntervene === 'force-refund' ? '⚠️ Cưỡng chế hoàn tiền' : '🛡️ Can thiệp Admin'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {showIntervene === 'force-refund'
                ? `Cưỡng chế hoàn tiền ${formatCurrency(selected?.amount || 0)} cho "${selected?.buyerName}". NCC sẽ bị trừ tiền.`
                : `Ghi nhận can thiệp vào tranh chấp ${selected?.id}.`
              }
            </p>
            <div>
              <Label>Ghi chú / Lý do</Label>
              <Textarea placeholder="Nhập ghi chú..." value={interveneNote} onChange={e => setInterveneNote(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntervene(null)}>Hủy</Button>
            <Button
              variant={showIntervene === 'force-refund' ? 'destructive' : 'default'}
              onClick={() => handleAction(showIntervene!)}
              disabled={!interveneNote.trim()}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
