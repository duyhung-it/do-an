// ============================================================
// AdminWarrantyPage — Quản lý bảo hành toàn hệ thống (D9)
// Stats, DataTable claim, Chi tiết, Hành động can thiệp
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Shield, Clock, CheckCircle, XCircle, RefreshCw, Eye, Wrench, AlertTriangle } from 'lucide-react';
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
import type { WarrantyClaim } from '../../types';

const formatDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const mockClaims: (WarrantyClaim & { buyerName: string; sellerName: string })[] = [
  {
    id: 'WC-001', warrantyId: 'W-001', buyerId: 'B01', buyerName: 'Công ty ABC',
    sellerId: 'S01', sellerName: 'Tech Solutions VN',
    productName: 'MacBook Pro 14" M3', claimType: 'Sửa chữa',
    description: 'Màn hình bị sọc sau 3 tháng sử dụng, cần thay thế',
    status: 'Đang xử lý', resolution: undefined, resolvedAt: undefined,
    createdAt: '2026-03-20T10:00:00',
  },
  {
    id: 'WC-002', warrantyId: 'W-002', buyerId: 'B02', buyerName: 'Tập đoàn XYZ',
    sellerId: 'S02', sellerName: 'Digital World',
    productName: 'Samsung Galaxy S25 Ultra', claimType: 'Thay thế',
    description: 'Pin bị phồng, thiết bị không sạc được',
    status: 'Chờ phản hồi NCC', resolution: undefined, resolvedAt: undefined,
    createdAt: '2026-03-25T14:00:00',
  },
  {
    id: 'WC-003', warrantyId: 'W-003', buyerId: 'B03', buyerName: 'Ngân hàng DEF',
    sellerId: 'S03', sellerName: 'Network Pro',
    productName: 'Switch Cisco SG350-28', claimType: 'Hoàn tiền',
    description: 'Thiết bị lỗi từ nhà máy, không kết nối được',
    status: 'Đã giải quyết', resolution: 'Đã hoàn tiền 100% giá trị đơn hàng',
    resolvedAt: '2026-03-30T16:00:00', createdAt: '2026-03-15T09:00:00',
  },
  {
    id: 'WC-004', warrantyId: 'W-004', buyerId: 'B04', buyerName: 'Công ty GHI',
    sellerId: 'S01', sellerName: 'Tech Solutions VN',
    productName: 'iPhone 16 Pro Max 256GB', claimType: 'Sửa chữa',
    description: 'Camera sau bị mờ sau khi rớt nhẹ, cần kiểm tra',
    status: 'Từ chối', resolution: 'Lỗi do tác động vật lý, không thuộc bảo hành',
    resolvedAt: '2026-04-01T11:00:00', createdAt: '2026-03-28T08:00:00',
  },
  {
    id: 'WC-005', warrantyId: 'W-005', buyerId: 'B05', buyerName: 'Công ty JKL',
    sellerId: 'S04', sellerName: 'Office World',
    productName: 'Máy in HP LaserJet Pro MFP', claimType: 'Sửa chữa',
    description: 'Kẹt giấy liên tục và in sọc sau 2 tuần sử dụng',
    status: 'Mới gửi', resolution: undefined, resolvedAt: undefined,
    createdAt: '2026-04-07T08:30:00',
  },
];

const statusOptions = ['Tất cả', 'Mới gửi', 'Đang xử lý', 'Chờ phản hồi NCC', 'Đã giải quyết', 'Từ chối'];
const typeOptions = ['Tất cả', 'Sửa chữa', 'Thay thế', 'Hoàn tiền'];

export function AdminWarrantyPage() {
  const [claims, setClaims] = useState<typeof mockClaims>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<typeof mockClaims[0] | null>(null);
  const [interveneNote, setInterveneNote] = useState('');
  const [showIntervene, setShowIntervene] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setClaims(mockClaims);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = claims.filter(c => {
    const matchSearch = !search || c.productName.toLowerCase().includes(search.toLowerCase()) ||
      c.buyerName.toLowerCase().includes(search.toLowerCase()) || c.sellerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || c.status === statusFilter;
    const matchType = typeFilter === 'Tất cả' || c.claimType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: claims.length,
    processing: claims.filter(c => ['Mới gửi', 'Đang xử lý', 'Chờ phản hồi NCC'].includes(c.status)).length,
    resolved: claims.filter(c => c.status === 'Đã giải quyết').length,
    rejected: claims.filter(c => c.status === 'Từ chối').length,
    avgDays: 5,
  };

  const columns = [
    { key: 'id', label: 'Mã Claim', render: (item: typeof mockClaims[0]) => <span className="font-mono text-xs text-muted-foreground">{item.id}</span> },
    {
      key: 'productName', label: 'Sản phẩm',
      render: (item: typeof mockClaims[0]) => (
        <div>
          <p className="font-medium text-sm">{item.productName}</p>
          <p className="text-xs text-muted-foreground">{item.buyerName} → {item.sellerName}</p>
        </div>
      ),
    },
    {
      key: 'claimType', label: 'Loại',
      render: (item: typeof mockClaims[0]) => (
        <Badge variant="outline" className={
          item.claimType === 'Hoàn tiền' ? 'border-red-300 text-red-600' :
          item.claimType === 'Thay thế' ? 'border-blue-300 text-blue-600' :
          'border-orange-300 text-orange-600'
        }>{item.claimType}</Badge>
      ),
    },
    {
      key: 'status', label: 'Trạng thái',
      render: (item: typeof mockClaims[0]) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt', label: 'Ngày gửi',
      render: (item: typeof mockClaims[0]) => <span className="text-xs">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'actions', label: '',
      render: (item: typeof mockClaims[0]) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(item)}><Eye className="h-4 w-4" /></Button>
          {['Mới gửi', 'Chờ phản hồi NCC'].includes(item.status) && (
            <Button size="sm" variant="ghost" className="text-orange-600" onClick={() => { setSelected(item); setShowIntervene(true); }}>
              <Wrench className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleIntervene = () => {
    if (!selected || !interveneNote.trim()) return;
    setClaims(prev => prev.map(c => c.id === selected.id
      ? { ...c, status: 'Đang xử lý', resolution: `[Admin can thiệp] ${interveneNote}` }
      : c
    ));
    toast.success('Đã can thiệp và cập nhật claim');
    setShowIntervene(false);
    setInterveneNote('');
    setSelected(null);
  };

  const handleClose = () => {
    if (!selected) return;
    setClaims(prev => prev.map(c => c.id === selected.id
      ? { ...c, status: 'Đã giải quyết', resolution: 'Admin đóng claim', resolvedAt: new Date().toISOString() }
      : c
    ));
    toast.success('Đã đóng claim bảo hành');
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Quản lý bảo hành' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Quản lý bảo hành</h1>
          <p className="text-muted-foreground">Giám sát và can thiệp claim bảo hành trên toàn sàn</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatsCard title="Tổng Claim" value={stats.total} icon={Shield} />
        <StatsCard title="Đang xử lý" value={stats.processing} icon={Clock} variant="warning" />
        <StatsCard title="Đã giải quyết" value={stats.resolved} icon={CheckCircle} variant="success" />
        <StatsCard title="Từ chối" value={stats.rejected} icon={XCircle} variant="danger" />
        <StatsCard title="TG xử lý TB" value={stats.avgDays} format={(n) => `${n} ngày`} icon={Clock} variant="info" />
      </div>

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm sản phẩm, buyer, NCC..."
        filters={[
          { key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: statusOptions },
          { key: 'type', label: 'Loại claim', value: typeFilter, onChange: setTypeFilter, options: typeOptions },
        ]}
      />

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Không có claim bảo hành nào" pagination getId={item => item.id} />

      {/* Detail Dialog */}
      <Dialog open={!!selected && !showIntervene} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Chi tiết Claim — {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Sản phẩm:</span> <strong>{selected.productName}</strong></div>
                <div><span className="text-muted-foreground">Loại claim:</span> <Badge variant="outline">{selected.claimType}</Badge></div>
                <div><span className="text-muted-foreground">Buyer:</span> {selected.buyerName}</div>
                <div><span className="text-muted-foreground">NCC:</span> {selected.sellerName}</div>
                <div><span className="text-muted-foreground">Ngày gửi:</span> {formatDate(selected.createdAt)}</div>
                <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge status={selected.status} /></div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium mb-1">Mô tả sự cố:</p>
                <p className="text-muted-foreground">{selected.description}</p>
              </div>
              {selected.resolution && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium mb-1 text-green-700">Kết quả giải quyết:</p>
                  <p className="text-green-600">{selected.resolution}</p>
                  {selected.resolvedAt && <p className="text-xs text-muted-foreground mt-1">{formatDate(selected.resolvedAt)}</p>}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selected && ['Mới gửi', 'Chờ phản hồi NCC'].includes(selected.status) && (
              <>
                <Button variant="outline" className="text-orange-600" onClick={() => setShowIntervene(true)}>
                  <Wrench className="h-4 w-4 mr-1" /> Can thiệp
                </Button>
                <Button variant="outline" className="text-destructive" onClick={handleClose}>
                  Đóng Claim
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Intervene Dialog */}
      <Dialog open={showIntervene} onOpenChange={() => setShowIntervene(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" /> Can thiệp Admin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Can thiệp vào claim <strong>{selected?.id}</strong> — {selected?.productName}</p>
            <div>
              <Label>Ghi chú can thiệp</Label>
              <Textarea
                placeholder="Nhập hướng xử lý, yêu cầu NCC phản hồi trong 24h..."
                value={interveneNote}
                onChange={e => setInterveneNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntervene(false)}>Hủy</Button>
            <Button onClick={handleIntervene} disabled={!interveneNote.trim()}>Xác nhận can thiệp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
