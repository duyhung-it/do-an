// ============================================================
// AdminPriceAgreementPage — Quản lý thỏa thuận giá toàn sàn (D6)
// Stats, DataTable, Chi tiết TT, SP, Đơn hàng liên kết, Hành động Admin
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Handshake, Clock, TrendingDown, DollarSign, Eye, Ban, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import { toast } from 'sonner';
import type { PriceAgreement } from '../../types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);
const formatDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const mockAgreements: PriceAgreement[] = [
  {
    id: 'PA-001', type: 'Thỏa thuận giá', status: 'Hiệu lực',
    sellerId: 'S01', sellerName: 'Tech Solutions VN',
    buyerId: 'B01', buyerName: 'Công ty ABC',
    startDate: '2026-01-01', endDate: '2026-12-31',
    items: [
      { id: 'PAI-001', agreementId: 'PA-001', productId: 'P01', productName: 'MacBook Pro 14"', originalPrice: 52000000, agreedPrice: 48000000, discountPercent: 7.7, minQuantity: 5, maxQuantity: 50, validUntil: '2026-12-31' },
      { id: 'PAI-002', agreementId: 'PA-001', productId: 'P02', productName: 'iPhone 16 Pro Max', originalPrice: 34000000, agreedPrice: 31500000, discountPercent: 7.4, minQuantity: 10, maxQuantity: 100, validUntil: '2026-12-31' },
    ],
    totalValue: 2500000000, orders: [], note: 'Hợp đồng mua sắm thiết bị IT Q1-Q4', createdAt: '2025-12-15T00:00:00',
  },
  {
    id: 'PA-002', type: 'Hợp đồng khung', status: 'Hiệu lực',
    sellerId: 'S02', sellerName: 'Digital World',
    buyerId: 'B02', buyerName: 'Tập đoàn XYZ',
    startDate: '2026-01-15', endDate: '2026-07-15',
    items: [
      { id: 'PAI-003', agreementId: 'PA-002', productId: 'P03', productName: 'Samsung Galaxy S25', originalPrice: 28000000, agreedPrice: 25000000, discountPercent: 10.7, minQuantity: 20, maxQuantity: 200, validUntil: '2026-07-15' },
    ],
    totalValue: 1000000000, orders: [], note: 'HĐ khung mua điện thoại Q1-2/2026', createdAt: '2026-01-10T00:00:00',
  },
  {
    id: 'PA-003', type: 'Đặt hàng mở', status: 'Sắp hết hạn',
    sellerId: 'S03', sellerName: 'Network Pro',
    buyerId: 'B03', buyerName: 'Ngân hàng DEF',
    startDate: '2025-10-01', endDate: '2026-04-15',
    items: [
      { id: 'PAI-004', agreementId: 'PA-003', productId: 'P04', productName: 'Switch Cisco SG350', originalPrice: 12000000, agreedPrice: 10500000, discountPercent: 12.5, minQuantity: 2, maxQuantity: 20, validUntil: '2026-04-15' },
    ],
    totalValue: 420000000, orders: [], note: 'Thiết bị mạng theo yêu cầu', createdAt: '2025-09-20T00:00:00',
  },
  {
    id: 'PA-004', type: 'Thỏa thuận giá', status: 'Đã hết hạn',
    sellerId: 'S01', sellerName: 'Tech Solutions VN',
    buyerId: 'B04', buyerName: 'Công ty GHI',
    startDate: '2025-01-01', endDate: '2025-12-31',
    items: [],
    totalValue: 800000000, orders: [], note: 'Hết hạn 31/12/2025', createdAt: '2024-12-20T00:00:00',
  },
  {
    id: 'PA-005', type: 'Hợp đồng khung', status: 'Tạm ngừng',
    sellerId: 'S04', sellerName: 'Office World',
    buyerId: 'B05', buyerName: 'Công ty JKL',
    startDate: '2026-02-01', endDate: '2026-11-30',
    items: [],
    totalValue: 350000000, orders: [], note: 'Tạm ngừng do tranh chấp', createdAt: '2026-01-25T00:00:00',
  },
];

const statusOptions = ['Tất cả', 'Hiệu lực', 'Sắp hết hạn', 'Đã hết hạn', 'Tạm ngừng', 'Đã hủy'];
const typeOptions = ['Tất cả', 'Thỏa thuận giá', 'Hợp đồng khung', 'Đặt hàng mở'];

export function AdminPriceAgreementPage() {
  const [agreements, setAgreements] = useState<PriceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<PriceAgreement | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ ag: PriceAgreement; action: 'suspend' | 'cancel' } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setAgreements(mockAgreements);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = agreements.filter(a => {
    const matchSearch = !search || a.sellerName.toLowerCase().includes(search.toLowerCase()) ||
      a.buyerName.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || a.status === statusFilter;
    const matchType = typeFilter === 'Tất cả' || a.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: agreements.length,
    active: agreements.filter(a => a.status === 'Hiệu lực').length,
    expiringSoon: agreements.filter(a => a.status === 'Sắp hết hạn').length,
    expired: agreements.filter(a => a.status === 'Đã hết hạn').length,
    totalValue: agreements.filter(a => a.status === 'Hiệu lực').reduce((s, a) => s + a.totalValue, 0),
  };

  const columns = [
    { key: 'id', label: 'Mã TT', render: (v: string) => <span className="font-mono text-xs text-muted-foreground">{v}</span> },
    {
      key: 'type', label: 'Loại',
      render: (v: string) => <Badge variant="outline">{v}</Badge>,
    },
    {
      key: 'sellerName', label: 'NCC → Buyer',
      render: (v: string, row: PriceAgreement) => (
        <div>
          <p className="font-medium">{v}</p>
          <p className="text-xs text-muted-foreground">→ {row.buyerName}</p>
        </div>
      ),
    },
    {
      key: 'items', label: 'Số SP',
      render: (v: PriceAgreement['items']) => <Badge variant="secondary">{v.length} SP</Badge>,
    },
    {
      key: 'totalValue', label: 'Giá trị',
      render: (v: number) => <span className="text-primary font-medium">{formatCurrency(v)}</span>,
    },
    {
      key: 'endDate', label: 'Hết hạn',
      render: (v: string) => {
        const days = Math.ceil((new Date(v).getTime() - Date.now()) / 86400000);
        return (
          <div>
            <p className="text-xs">{formatDate(v)}</p>
            {days > 0 && days < 30 && <p className="text-xs text-orange-500">Còn {days} ngày</p>}
            {days <= 0 && <p className="text-xs text-red-500">Đã hết hạn</p>}
          </div>
        );
      },
    },
    { key: 'status', label: 'Trạng thái', render: (v: string) => <StatusBadge status={v} /> },
    {
      key: 'actions', label: '',
      render: (_: unknown, row: PriceAgreement) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
          {(row.status === 'Hiệu lực' || row.status === 'Sắp hết hạn') && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmAction({ ag: row, action: 'suspend' })}>
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleAction = () => {
    if (!confirmAction) return;
    setAgreements(prev => prev.map(a => a.id === confirmAction.ag.id
      ? { ...a, status: 'Tạm ngừng' }
      : a
    ));
    toast.success('Đã tạm ngừng thỏa thuận giá');
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Thỏa thuận giá' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Handshake className="h-6 w-6 text-primary" /> Quản lý thỏa thuận giá</h1>
          <p className="text-muted-foreground">Giám sát các thỏa thuận giá và hợp đồng khung toàn sàn</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatsCard title="Tổng TT" value={stats.total} icon={<Handshake className="h-5 w-5 text-primary" />} />
        <StatsCard title="Hiệu lực" value={stats.active} icon={<CheckCircle className="h-5 w-5 text-green-500" />} color="success" />
        <StatsCard title="Sắp hết hạn" value={stats.expiringSoon} icon={<Clock className="h-5 w-5 text-orange-500" />} color="warning" />
        <StatsCard title="Đã hết hạn" value={stats.expired} icon={<TrendingDown className="h-5 w-5 text-gray-500" />} />
        <StatsCard title="Giá trị hiệu lực" value={formatCurrency(stats.totalValue)} icon={<DollarSign className="h-5 w-5 text-purple-500" />} color="info" />
      </div>

      {/* Filter */}
      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm NCC, Buyer, mã TT..."
        filters={[
          { key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: statusOptions },
          { key: 'type', label: 'Loại', value: typeFilter, onChange: setTypeFilter, options: typeOptions },
        ]}
      />

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Không có thỏa thuận nào" pagination />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" /> {selected?.type} — {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">NCC:</span> <strong>{selected.sellerName}</strong></div>
                <div><span className="text-muted-foreground">Buyer:</span> <strong>{selected.buyerName}</strong></div>
                <div><span className="text-muted-foreground">Hiệu lực:</span> {formatDate(selected.startDate)} → {formatDate(selected.endDate)}</div>
                <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge status={selected.status} /></div>
                <div><span className="text-muted-foreground">Tổng giá trị DK:</span> <strong className="text-primary">{formatCurrency(selected.totalValue)}</strong></div>
                <div><span className="text-muted-foreground">Ghi chú:</span> {selected.note}</div>
              </div>

              {selected.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Danh sách sản phẩm thỏa thuận</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          {['Sản phẩm', 'Giá gốc', 'Giá TT', 'Giảm %', 'SL min/max'].map(h => (
                            <th key={h} className="text-left px-3 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map(item => (
                          <tr key={item.id} className="border-t hover:bg-muted/30">
                            <td className="px-3 py-2 font-medium">{item.productName}</td>
                            <td className="px-3 py-2 text-muted-foreground line-through">{formatCurrency(item.originalPrice)}</td>
                            <td className="px-3 py-2 font-bold text-green-600">{formatCurrency(item.agreedPrice)}</td>
                            <td className="px-3 py-2"><Badge variant="secondary" className="text-green-600">-{item.discountPercent.toFixed(1)}%</Badge></td>
                            <td className="px-3 py-2 text-muted-foreground">{item.minQuantity} – {item.maxQuantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {(selected?.status === 'Hiệu lực' || selected?.status === 'Sắp hết hạn') && (
              <Button variant="destructive" onClick={() => { setConfirmAction({ ag: selected!, action: 'suspend' }); setSelected(null); }}>
                <Ban className="h-4 w-4 mr-1" /> Tạm ngừng TT
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">Xác nhận tạm ngừng</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">
            Bạn có chắc muốn tạm ngừng thỏa thuận <strong>"{confirmAction?.ag.id}"</strong>?
            Điều này sẽ ảnh hưởng đến việc đặt hàng theo thỏa thuận này.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleAction}>Xác nhận tạm ngừng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
