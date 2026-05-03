// ============================================================
// Trả hàng & Hoàn tiền — Buyer (P3 Đợt 8: P3.25–P3.26, P3.30)
// Status tabs, reason pie chart, progress steps cards
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  RotateCcw, Clock, CheckCircle2, XCircle, Banknote,
  Eye, Trash2, Download, Search, Package, ArrowRight,
  AlertTriangle, CircleDot,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { returnApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ReturnRequest, ReturnStats, ReturnStatus, PaginationParams, SortParams, ActiveFilter } from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

const ALL_STATUSES: ReturnStatus[] = ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đang xử lý', 'Đã hoàn tiền', 'Đã đóng'];

// P3.25: Reason colors for pie chart
const REASON_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4'];

// P3.26: Return progress steps
const RETURN_STEPS = ['Gửi yêu cầu', 'Duyệt', 'Nhận hàng', 'Hoàn tiền'];

function getStepIndex(status: ReturnStatus): number {
  switch (status) {
    case 'Chờ duyệt': return 0;
    case 'Đã duyệt': case 'Đang xử lý': return 1;
    case 'Đã hoàn tiền': return 3;
    case 'Đã đóng': return 3;
    case 'Từ chối': return -1;
    default: return 0;
  }
}

// P3.26: Progress Steps Component
function ReturnSteps({ status }: { status: ReturnStatus }) {
  const currentStep = getStepIndex(status);
  const isRejected = status === 'Từ chối';

  if (isRejected) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
          <XCircle className="h-3 w-3" />
        </div>
        <span className="text-red-500 text-[10px]">Từ chối</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {RETURN_STEPS.map((step, i) => {
        const isDone = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step} className="flex items-center gap-0.5">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] ${
              isDone ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}>
              {isDone ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
            </div>
            {i < RETURN_STEPS.length - 1 && (
              <div className={`w-4 sm:w-6 h-0.5 ${isDone ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BuyerReturnListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyerId = user?.id ?? 'user-001';

  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ReturnStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // P3.25: Active status tab
  const [statusTab, setStatusTab] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters: ActiveFilter[] = [...filters];
      if (searchText) activeFilters.push({ key: 'search', value: searchText, label: `Tìm: ${searchText}` });
      if (statusTab !== 'all') activeFilters.push({ key: 'status', value: statusTab, label: statusTab });
      const [res, s] = await Promise.all([
        returnApi.getByBuyer(buyerId, pagination, sort, activeFilters),
        returnApi.getBuyerStats(buyerId),
      ]);
      setReturns(res.data); setTotal(res.total); setStats(s);
    } finally { setLoading(false); }
  }, [buyerId, pagination, sort, filters, searchText, statusTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn huỷ yêu cầu trả hàng này?')) return;
    try { await returnApi.delete(id); toast.success('Đã huỷ'); loadData(); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Lỗi'); }
  };

  const handleExportCSV = () => {
    const headers = ['Mã', 'Đơn hàng', 'NCC', 'Lý do', 'Trạng thái', 'Số tiền', 'Ngày'];
    const rows = returns.map(r => [r.id, r.orderNumber, r.supplierName, r.reason, r.status, r.refundAmount, r.createdAt]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tra-hang.csv'; a.click();
    toast.success('Đã xuất CSV');
  };

  // P3.25: Reason pie data
  const reasonPieData = useMemo(() => {
    const map: Record<string, number> = {};
    returns.forEach(r => { map[r.reason] = (map[r.reason] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [returns]);

  // P3.25: Status tabs
  const statusTabs = [
    { key: 'all', label: 'Tất cả', count: stats?.total ?? 0, icon: RotateCcw },
    { key: 'Chờ duyệt', label: 'Chờ duyệt', count: stats?.pending ?? 0, icon: Clock },
    { key: 'Đang xử lý', label: 'Đang trả', count: 0, icon: RotateCcw },
    { key: 'Đã hoàn tiền', label: 'Hoàn tiền', count: 0, icon: Banknote },
    { key: 'Từ chối', label: 'Từ chối', count: 0, icon: XCircle },
  ];

  const columns = [
    {
      key: 'orderNumber' as const, label: 'Đơn hàng', sortable: true,
      render: (r: ReturnRequest) => (
        <div>
          <Link to={`/orders/${r.orderId}`} className="text-primary hover:underline text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{r.orderNumber}</Link>
          <p className="text-muted-foreground text-[10px]">{r.id}</p>
        </div>
      ),
    },
    { key: 'supplierName' as const, label: 'NCC', sortable: true },
    { key: 'reason' as const, label: 'Lý do', sortable: true },
    {
      key: 'refundAmount' as const, label: 'Hoàn tiền', sortable: true,
      render: (r: ReturnRequest) => <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(r.refundAmount)}</span>,
    },
    {
      key: 'status' as const, label: 'Tiến trình', sortable: true,
      render: (r: ReturnRequest) => <ReturnSteps status={r.status} />,
    },
    { key: 'createdAt' as const, label: 'Ngày', sortable: true },
  ];

  const filterConfigs = [
    { key: 'reason', label: 'Lý do', type: 'select' as const,
      options: ['Lỗi SP', 'Không đúng mô tả', 'Giao nhầm', 'Hư hỏng VC', 'Đổi ý', 'Khác'].map(r => ({ label: r, value: r })),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trả hàng & Hoàn tiền' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <RotateCcw className="h-6 w-6 text-primary" /> Trả hàng & Hoàn tiền
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý các yêu cầu trả hàng</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
          <Download className="h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* Stats + Pie chart */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { label: 'Tổng yêu cầu', value: stats.total, icon: RotateCcw, variant: 'primary' as const },
            { label: 'Chờ duyệt', value: stats.pending, icon: Clock, variant: 'warning' as const },
            { label: 'Đã duyệt', value: stats.approved, icon: CheckCircle2, variant: 'success' as const },
            { label: 'Hoàn tiền', value: formatPrice(stats.totalRefundAmount), icon: Banknote, variant: 'purple' as const },
          ].map(card => (
            <Card key={card.label} className="border-l-4" style={{ borderLeftColor: `var(--color-${card.variant}-500, #6366f1)` }}>
              <CardContent className="p-3 flex items-center gap-2.5">
                <IconWrapper icon={card.icon} variant={card.variant} size="sm" />
                <div>
                  <p className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{card.value}</p>
                  <p className="text-[10px] text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* P3.25: Mini pie chart */}
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              {reasonPieData.length > 0 ? (
                <div className="h-14 w-14 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={reasonPieData} dataKey="value" cx="50%" cy="50%" innerRadius={14} outerRadius={24} strokeWidth={0}>
                        {reasonPieData.map((_, i) => <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val: number, name: string) => [`${val}`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <CircleDot className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Lý do trả</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {reasonPieData.slice(0, 3).map((d, i) => (
                    <span key={d.name} className="text-[9px] flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: REASON_COLORS[i] }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* P3.25: Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {statusTabs.map(t => {
          const Icon = t.icon;
          const isActive = statusTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setStatusTab(t.key); setPagination(p => ({ ...p, page: 1 })); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, NCC..."
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="pl-9"
          />
        </div>
        <FilterBar
          filters={filterConfigs}
          activeFilters={filters}
          onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        />
      </div>

      {/* P3.30: Mobile cards */}
      <div className="sm:hidden space-y-3">
        {returns.map(r => (
          <Card key={r.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelected(r); setShowDetail(true); }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Link to={`/orders/${r.orderId}`} className="text-primary text-sm" style={{ fontFamily: 'var(--font-heading)' }}
                  onClick={e => e.stopPropagation()}>
                  {r.orderNumber}
                </Link>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-muted-foreground">{r.supplierName}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-xs">{r.reason}</Badge>
                <span className="text-primary text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(r.refundAmount)}</span>
              </div>
              {/* P3.26: Progress steps */}
              <div className="mt-3 pt-3 border-t">
                <ReturnSteps status={r.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns} data={returns} loading={loading}
          totalItems={total} pagination={pagination} sort={sort}
          onPaginationChange={setPagination} onSortChange={setSort}
          getId={r => r.id}
          onRowClick={r => navigate(`/returns/${r.id}`)}
          renderActions={r => (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => { setSelected(r); setShowDetail(true); }}>
                <Eye className="h-4 w-4" />
              </Button>
              {r.status === 'Chờ duyệt' && (
                <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          emptyMessage="Chưa có yêu cầu trả hàng"
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" /> Chi tiết yêu cầu trả hàng
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về yêu cầu trả hàng và hoàn tiền</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)' }}>{selected.id}</p>
                  <p className="text-muted-foreground text-sm">
                    Đơn hàng: <Link to={`/orders/${selected.orderId}`} className="text-primary hover:underline">{selected.orderNumber}</Link>
                  </p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* P3.26: Progress bar */}
              <div className="p-3 rounded-xl bg-muted/20">
                <div className="flex items-center justify-between">
                  {RETURN_STEPS.map((step, i) => {
                    const currentIdx = getStepIndex(selected.status);
                    const isDone = i <= currentIdx && currentIdx >= 0;
                    return (
                      <div key={step} className="flex items-center gap-1">
                        <div className={`flex flex-col items-center ${i > 0 ? 'flex-1' : ''}`}>
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
                            isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                          </div>
                          <span className={`text-[10px] mt-1 text-center ${isDone ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                        </div>
                        {i < RETURN_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${isDone ? 'bg-primary' : 'bg-muted'}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Nhà cung cấp', value: selected.supplierName },
                  { label: 'Lý do', value: selected.reason },
                  { label: 'Phương thức hoàn tiền', value: selected.refundMethod },
                  { label: 'Số tiền hoàn', value: formatPrice(selected.refundAmount), highlight: true },
                  { label: 'Ngày tạo', value: selected.createdAt },
                  ...(selected.resolvedAt ? [{ label: 'Ngày xử lý', value: selected.resolvedAt }] : []),
                ].map(item => (
                  <div key={item.label} className="p-2.5 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm ${'highlight' in item && item.highlight ? 'text-primary' : ''}`}
                      style={{ fontFamily: 'highlight' in item && item.highlight ? 'var(--font-heading)' : undefined }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <p className="text-sm mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Mô tả</p>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </div>

              <div>
                <p className="text-sm mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Sản phẩm trả ({selected.items.length})</p>
                <div className="space-y-2">
                  {selected.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          SL: {item.quantity} × {formatPrice(item.unitPrice)} = <span className="text-primary">{formatPrice(item.quantity * item.unitPrice)}</span>
                        </p>
                        {item.note && <p className="text-xs text-muted-foreground mt-0.5">Ghi chú: {item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.sellerNote && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Phản hồi NCC</p>
                  <p className="text-sm text-muted-foreground">{selected.sellerNote}</p>
                </div>
              )}

              {selected.adminNote && (
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Ghi chú Admin</p>
                  <p className="text-sm text-muted-foreground">{selected.adminNote}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}