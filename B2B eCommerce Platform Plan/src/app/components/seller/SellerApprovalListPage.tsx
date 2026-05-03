// ============================================================
// Danh sách yêu cầu phê duyệt nội bộ — Seller
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import {
  CheckCircle2, XCircle, Clock, ClipboardCheck, FileText, Settings,
  AlertTriangle, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { approvalApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type {
  ApprovalRequest, ApprovalStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const columns: ColumnConfig[] = [
  { key: 'type', label: 'Loại', visible: true, sortable: true },
  { key: 'referenceName', label: 'Tham chiếu', visible: true, sortable: true },
  { key: 'referenceAmount', label: 'Số tiền', visible: true, sortable: true },
  { key: 'requestedByName', label: 'Người yêu cầu', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'type', label: 'Loại', type: 'select',
    options: ['Đơn hàng', 'Báo giá', 'Hợp đồng', 'Sản phẩm', 'Xuất kho'].map(v => ({ label: v, value: v })),
  },
  {
    key: 'status', label: 'Trạng thái', type: 'select',
    options: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'].map(v => ({ label: v, value: v })),
  },
  { key: 'requestedBy', label: 'Người yêu cầu', type: 'text' },
];

// Stat card
function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-muted-foreground">{label}</p>
          <p className="text-xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerApprovalListPage() {
  const { user } = useAuth();
  const supplierId = user?.supplierId ?? 'sup-01';

  const [data, setData] = useState<ApprovalRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'done' | 'all'>('pending');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  // Dialog
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [responseNote, setResponseNote] = useState('');
  const [processing, setProcessing] = useState(false);

  // Stats
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Apply tab filter
      const tabFilter: ActiveFilter[] = tab === 'pending'
        ? [{ key: 'status', value: 'Chờ duyệt' }]
        : tab === 'done'
          ? [] // done = Đã duyệt + Từ chối — sẽ filter client-side
          : [];

      const allFilters = [...tabFilter, ...filters];
      const res = await approvalApi.getBySeller(supplierId, pagination, sort, allFilters);

      if (tab === 'done') {
        const doneData = res.data.filter(a => a.status !== 'Chờ duyệt');
        setData(doneData);
        setTotal(doneData.length);
      } else {
        setData(res.data);
        setTotal(res.total);
      }

      // Stats
      const count = await approvalApi.getPendingCount(supplierId);
      setPendingCount(count);
      const allRes = await approvalApi.getBySeller(supplierId, { page: 1, pageSize: 100 });
      const today = new Date().toISOString().slice(0, 10);
      setApprovedToday(allRes.data.filter(a => a.status === 'Đã duyệt' && a.respondedAt === today).length);
      setRejectedToday(allRes.data.filter(a => a.status === 'Từ chối' && a.respondedAt === today).length);
    } finally {
      setLoading(false);
    }
  }, [supplierId, pagination, sort, filters, tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await approvalApi.approve(selected.id, responseNote || undefined);
      toast.success(`Đã duyệt yêu cầu ${selected.referenceName}`);
      setShowApprove(false);
      setShowDetail(false);
      setResponseNote('');
      fetchData();
    } catch {
      toast.error('Lỗi khi duyệt');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !responseNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setProcessing(true);
    try {
      await approvalApi.reject(selected.id, responseNote);
      toast.success(`Đã từ chối yêu cầu ${selected.referenceName}`);
      setShowReject(false);
      setShowDetail(false);
      setResponseNote('');
      fetchData();
    } catch {
      toast.error('Lỗi khi từ chối');
    } finally {
      setProcessing(false);
    }
  };

  const openDetail = (item: ApprovalRequest) => {
    setSelected(item);
    setShowDetail(true);
  };

  // Format table data for DataTable
  const tableData = useMemo(() => data.map(d => ({
    ...d,
    referenceAmount: d.referenceAmount ? formatPrice(d.referenceAmount) : '—',
    _rawAmount: d.referenceAmount,
  })), [data]);

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Phê duyệt' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Phê duyệt nội bộ
          </h1>
          <p className="text-muted-foreground">Quản lý yêu cầu phê duyệt đơn hàng, báo giá, hợp đồng</p>
        </div>
        <Link to="/seller/approvals/rules">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Cấu hình quy tắc
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Chờ duyệt" value={pendingCount} icon={Clock} color="bg-amber-500" />
        <StatCard label="Đã duyệt hôm nay" value={approvedToday} icon={CheckCircle2} color="bg-green-500" />
        <StatCard label="Từ chối hôm nay" value={rejectedToday} icon={XCircle} color="bg-red-500" />
        <StatCard label="Tổng yêu cầu" value={total} icon={BarChart3} color="bg-blue-500" />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => { setTab(v as typeof tab); setPagination(p => ({ ...p, page: 1 })); }}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Chờ duyệt
            {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="done">Đã xử lý</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <FilterBar
          filters={filterConfigs.filter(f => tab === 'all' || f.key !== 'status')}
          activeFilters={filters}
          onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        />

        <TabsContent value={tab} className="mt-4">
          {/* Desktop */}
          <div className="hidden md:block">
            <DataTable
              data={tableData}
              columns={columns}
              totalItems={total}
              pagination={pagination}
              sort={sort}
              onPaginationChange={setPagination}
              onSortChange={setSort}
              getId={r => r.id}
              onRowClick={(row) => openDetail(data.find(d => d.id === row.id)!)}
              renderActions={(row) => {
                const item = data.find(d => d.id === row.id)!;
                if (item.status !== 'Chờ duyệt') return null;
                return (
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={(e) => {
                      e.stopPropagation(); setSelected(item); setResponseNote(''); setShowApprove(true);
                    }}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => {
                      e.stopPropagation(); setSelected(item); setResponseNote(''); setShowReject(true);
                    }}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }}
              loading={loading}
            />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {loading && <p className="text-center text-muted-foreground py-8">Đang tải...</p>}
            {!loading && data.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{tab === 'pending' ? 'Không có yêu cầu nào chờ duyệt' : 'Không có yêu cầu nào'}</p>
              </div>
            )}
            {data.map(item => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(item)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="truncate">{item.referenceName}</p>
                      {item.referenceAmount && <p className="text-primary">{formatPrice(item.referenceAmount)}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Bởi {item.requestedByName}</span>
                    <span>{item.createdAt}</span>
                  </div>
                  {item.status === 'Chờ duyệt' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={(e) => {
                        e.stopPropagation(); setSelected(item); setResponseNote(''); setShowApprove(true);
                      }}>
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Duyệt
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={(e) => {
                        e.stopPropagation(); setSelected(item); setResponseNote(''); setShowReject(true);
                      }}>
                        <XCircle className="mr-1 h-4 w-4" /> Từ chối
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu phê duyệt</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* P5.25: Approval flow visualization */}
              <div className="flex items-center justify-between px-2">
                {[
                  { label: 'Tạo yêu cầu', done: true },
                  { label: 'Chờ duyệt', done: selected.status !== 'Chờ duyệt' || false },
                  { label: selected.status === 'Từ chối' ? 'Từ chối' : 'Đã duyệt', done: selected.status === 'Đã duyệt' || selected.status === 'Từ chối' },
                ].map((step, idx, arr) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${
                        step.done
                          ? (step.label === 'Từ chối' ? 'bg-red-500 text-white' : 'bg-green-500 text-white')
                          : (selected.status === 'Chờ duyệt' && idx === 1 ? 'bg-amber-500 text-white animate-pulse' : 'bg-muted text-muted-foreground')
                      }`}>
                        {step.done ? (step.label === 'Từ chối' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />) : idx + 1}
                      </div>
                      <span className="text-xs mt-1 text-center">{step.label}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${step.done ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">{selected.type}</Badge>
                <StatusBadge status={selected.status} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-muted-foreground">Tham chiếu</Label>
                  <p>{selected.referenceName}</p>
                </div>
                {selected.referenceAmount && (
                  <div>
                    <Label className="text-muted-foreground">Số tiền</Label>
                    <p className="text-primary">{formatPrice(selected.referenceAmount)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Người yêu cầu</Label>
                  <p>{selected.requestedByName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Người duyệt</Label>
                  <p>{selected.approverName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p>{selected.createdAt}</p>
                </div>
                {selected.respondedAt && (
                  <div>
                    <Label className="text-muted-foreground">Ngày xử lý</Label>
                    <p>{selected.respondedAt}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Ghi chú yêu cầu</Label>
                <p className="mt-1 p-2 bg-muted rounded-lg">{selected.note}</p>
              </div>
              {selected.responseNote && (
                <div>
                  <Label className="text-muted-foreground">Phản hồi</Label>
                  <p className="mt-1 p-2 bg-muted rounded-lg">{selected.responseNote}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
            {selected?.status === 'Chờ duyệt' && (
              <>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setResponseNote(''); setShowApprove(true); }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt
                </Button>
                <Button variant="destructive" onClick={() => { setResponseNote(''); setShowReject(true); }}>
                  <XCircle className="mr-2 h-4 w-4" /> Từ chối
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Xác nhận duyệt yêu cầu "{selected?.referenceName}"?</p>
          <div className="grid gap-2">
            <Label>Ghi chú (tuỳ chọn)</Label>
            <Textarea value={responseNote} onChange={e => setResponseNote(e.target.value)} placeholder="Ghi chú phê duyệt..." rows={3} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApprove(false)} disabled={processing}>Huỷ</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={processing}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {processing ? 'Đang xử lý...' : 'Xác nhận duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Từ chối yêu cầu "{selected?.referenceName}"?</p>
          <div className="grid gap-2">
            <Label>Lý do từ chối *</Label>
            <Textarea value={responseNote} onChange={e => setResponseNote(e.target.value)} placeholder="Vui lòng nhập lý do từ chối..." rows={3} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReject(false)} disabled={processing}>Huỷ</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              <XCircle className="mr-2 h-4 w-4" />
              {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}