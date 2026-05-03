// ============================================================
// Seller — Xử lý bảo hành & khiếu nại (Nhóm 40D)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Wrench, CheckCircle2, XCircle, Clock, Eye, Timer,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { useAuth } from '../../context/AuthContext';
import { warrantyClaimApi } from '../../services/warrantyApi';
import { toast } from 'sonner';
import type {
  WarrantyClaim, ClaimStatus,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const claimColumns: ColumnConfig[] = [
  { key: 'claimNumber', label: 'Mã KN', visible: true, sortable: true },
  { key: 'productName', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'buyerCompany', label: 'Khách hàng', visible: true, sortable: true },
  { key: 'claimType', label: 'Loại', visible: true, sortable: true,
    render: (item: WarrantyClaim) => {
      const icons: Record<string, React.ReactNode> = {
        'Sửa chữa': <Wrench className="h-3 w-3 inline mr-1" />,
        'Thay thế': <Shield className="h-3 w-3 inline mr-1" />,
        'Hoàn tiền': <Clock className="h-3 w-3 inline mr-1" />,
      };
      return <span className="flex items-center gap-1">{icons[item.claimType]}{item.claimType}</span>;
    },
  } as ColumnConfig & { render: (item: WarrantyClaim) => React.ReactNode },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
    render: (item: WarrantyClaim) => <StatusBadge status={item.status} />,
  } as ColumnConfig & { render: (item: WarrantyClaim) => React.ReactNode },
  { key: 'createdAt', label: 'Ngày gửi', visible: true, sortable: true,
    render: (item: WarrantyClaim) => <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>,
  } as ColumnConfig & { render: (item: WarrantyClaim) => React.ReactNode },
  { key: 'daysWaiting', label: 'Ngày chờ', visible: true, sortable: false,
    render: (item: WarrantyClaim) => {
      const days = Math.ceil((Date.now() - new Date(item.createdAt).getTime()) / 86400000);
      return <Badge variant={days > 7 ? 'destructive' : days > 3 ? 'outline' : 'secondary'}>{days} ngày</Badge>;
    },
  } as ColumnConfig & { render: (item: WarrantyClaim) => React.ReactNode },
];

const claimFilters: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Mới tạo', value: 'Mới tạo' },
    { label: 'Đang xem xét', value: 'Đang xem xét' },
    { label: 'Chấp nhận', value: 'Chấp nhận' },
    { label: 'Từ chối', value: 'Từ chối' },
    { label: 'Đang sửa chữa', value: 'Đang sửa chữa' },
    { label: 'Đã giải quyết', value: 'Đã giải quyết' },
  ]},
  { key: 'claimType', label: 'Loại', type: 'select', options: [
    { label: 'Sửa chữa', value: 'Sửa chữa' },
    { label: 'Thay thế', value: 'Thay thế' },
    { label: 'Hoàn tiền', value: 'Hoàn tiền' },
  ]},
];

// ===== Process Claim Dialog =====
function ProcessClaimDialog({ claim, open, onOpenChange, onProcess }: {
  claim: WarrantyClaim | null; open: boolean; onOpenChange: (v: boolean) => void;
  onProcess: (id: string, status: ClaimStatus, resolution: string) => void;
}) {
  const [action, setAction] = useState<'accept' | 'reject'>('accept');
  const [resolution, setResolution] = useState('');

  if (!claim) return null;

  const handleSubmit = () => {
    if (action === 'reject' && !resolution.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    const nextStatus: ClaimStatus = action === 'accept' ? 'Chấp nhận' : 'Từ chối';
    onProcess(claim.id, nextStatus, resolution);
    setResolution('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Xử lý khiếu nại {claim.claimNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Sản phẩm:</span> {claim.productName}</div>
            <div><span className="text-muted-foreground">Khách hàng:</span> {claim.buyerCompany}</div>
            <div><span className="text-muted-foreground">Loại:</span> {claim.claimType}</div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mô tả vấn đề:</p>
            <div className="p-3 bg-muted/30 rounded-md text-sm">{claim.issueDescription}</div>
          </div>

          <div>
            <Label>Hành động *</Label>
            <Select value={action} onValueChange={v => setAction(v as 'accept' | 'reject')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="accept">Chấp nhận — Nhập phương án xử lý</SelectItem>
                <SelectItem value="reject">Từ chối — Nhập lý do</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{action === 'accept' ? 'Phương án xử lý & thời gian' : 'Lý do từ chối *'}</Label>
            <Textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={3}
              placeholder={action === 'accept' ? 'VD: Sẽ sửa chữa trong 5 ngày, giao lại cho KH...' : 'Nhập lý do từ chối bắt buộc...'}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button variant={action === 'reject' ? 'destructive' : 'default'} onClick={handleSubmit}>
            {action === 'accept' ? 'Chấp nhận' : 'Từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Main Page =====
export function SellerWarrantyPage() {
  const { user } = useAuth();
  const sellerId = user?.supplierId || 'sup-001';

  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [showProcess, setShowProcess] = useState(false);
  const [stats, setStats] = useState<{
    total: number; newCount: number; reviewing: number; accepted: number;
    rejected: number; repairing: number; resolved: number; avgResolutionDays: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        warrantyClaimApi.getBySeller(sellerId, pagination, sort, filters, search),
        warrantyClaimApi.getStats(sellerId, 'seller'),
      ]);
      setClaims(res.data);
      setTotal(res.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [sellerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProcess = async (id: string, status: ClaimStatus, resolution: string) => {
    await warrantyClaimApi.updateStatus(id, status, resolution);
    toast.success(status === 'Từ chối' ? 'Đã từ chối khiếu nại' : 'Đã chấp nhận khiếu nại');
    fetchData();
  };

  const handleQuickAction = async (claim: WarrantyClaim, status: ClaimStatus) => {
    await warrantyClaimApi.updateStatus(claim.id, status);
    toast.success(`Đã cập nhật trạng thái: ${status}`);
    fetchData();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Bảo hành' }]} />

      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1>Xử lý bảo hành & Khiếu nại</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Tổng', value: stats.total, icon: <Shield className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-50' },
            { label: 'Mới / Đang xem', value: stats.newCount + stats.reviewing, icon: <Clock className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-50' },
            { label: 'Đang sửa', value: stats.repairing, icon: <Wrench className="h-5 w-5 text-indigo-500" />, bg: 'bg-indigo-50' },
            { label: 'Đã giải quyết', value: stats.resolved, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, bg: 'bg-green-50' },
            { label: 'TG xử lý TB', value: `${stats.avgResolutionDays} ngày`, icon: <Timer className="h-5 w-5 text-purple-500" />, bg: 'bg-purple-50' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>{s.icon}</div>
                <div>
                  <p className="text-xl">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter + Table */}
      <FilterBar
        filters={claimFilters}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã KN, sản phẩm, khách hàng..."
      />

      <DataTable<WarrantyClaim>
        data={claims}
        columns={claimColumns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={c => c.id}
        loading={loading}
        renderActions={claim => (
          <div className="flex gap-1">
            {(claim.status === 'Mới tạo' || claim.status === 'Đang xem xét') && (
              <Button size="sm" onClick={e => { e.stopPropagation(); setSelectedClaim(claim); setShowProcess(true); }}>
                Xử lý
              </Button>
            )}
            {claim.status === 'Chấp nhận' && (
              <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); handleQuickAction(claim, 'Đang sửa chữa'); }}>
                Bắt đầu SC
              </Button>
            )}
            {claim.status === 'Đang sửa chữa' && (
              <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); handleQuickAction(claim, 'Đã giải quyết'); }}>
                Hoàn tất
              </Button>
            )}
          </div>
        )}
      />

      {/* Process Dialog */}
      <ProcessClaimDialog
        claim={selectedClaim}
        open={showProcess}
        onOpenChange={setShowProcess}
        onProcess={handleProcess}
      />
    </div>
  );
}
