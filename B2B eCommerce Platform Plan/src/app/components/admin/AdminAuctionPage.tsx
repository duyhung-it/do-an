// ============================================================
// AdminAuctionPage — Quản lý phiên đấu giá ngược toàn sàn (D5)
// Stats, DataTable, Chi tiết phiên, Danh sách bid, Hành động Admin
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Gavel, TrendingDown, Users, DollarSign, Clock, Eye, Ban, RefreshCw, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { QuickStatsCard } from '../shared/QuickStatsCard';
import { FilterBar } from '../shared/FilterBar';
import { toast } from 'sonner';
import type { ReverseAuction, AuctionBid } from '../../types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

const formatDateTime = (s: string) =>
  new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ---- Mock data ----
const mockAuctions: ReverseAuction[] = [
  {
    id: 'AUC-001', title: 'Mua 500 laptop văn phòng Q2/2026', buyerId: 'B01', buyerName: 'Công ty ABC',
    description: 'Cần mua laptop Dell/HP core i5 gen 12, RAM 16GB', status: 'Đang mở',
    startTime: '2026-04-01T08:00:00', endTime: '2026-04-10T18:00:00',
    items: [{ productName: 'Laptop văn phòng', quantity: 500, unit: 'Chiếc', specification: 'Core i5, RAM 16GB', maxBudget: 15000000 }],
    maxBudget: 7500000000, bids: [], invitedSuppliers: ['S01', 'S02'], createdAt: '2026-03-28T09:00:00',
  },
  {
    id: 'AUC-002', title: 'Cung cấp thiết bị mạng văn phòng', buyerId: 'B02', buyerName: 'Tập đoàn XYZ',
    description: 'Switch, Router, Access Point cho 3 tầng văn phòng', status: 'Đã đóng',
    startTime: '2026-03-15T08:00:00', endTime: '2026-03-25T18:00:00',
    items: [{ productName: 'Switch 24 port', quantity: 10, unit: 'Cái', specification: 'Cisco SG350', maxBudget: 5000000 }],
    maxBudget: 200000000, bids: [], invitedSuppliers: ['S03'], createdAt: '2026-03-10T09:00:00',
  },
  {
    id: 'AUC-003', title: 'Mua máy in đa năng 200 chiếc', buyerId: 'B03', buyerName: 'Ngân hàng DEF',
    description: 'Máy in laser đa năng A4, tốc độ 30ppm', status: 'Đã chọn NCC',
    startTime: '2026-03-01T08:00:00', endTime: '2026-03-08T18:00:00',
    items: [{ productName: 'Máy in đa năng', quantity: 200, unit: 'Chiếc', specification: 'Laser A4 30ppm', maxBudget: 8000000 }],
    maxBudget: 1600000000, bids: [], invitedSuppliers: ['S01', 'S04'], createdAt: '2026-02-25T09:00:00',
  },
  {
    id: 'AUC-004', title: 'Thiết bị lưu trữ NAS 50TB', buyerId: 'B04', buyerName: 'Công ty GHI',
    description: 'NAS enterprise 50TB RAID 6 cho data center', status: 'Đang mở',
    startTime: '2026-04-05T08:00:00', endTime: '2026-04-15T18:00:00',
    items: [{ productName: 'NAS 50TB', quantity: 2, unit: 'Hệ thống', specification: 'RAID 6, 50TB', maxBudget: 150000000 }],
    maxBudget: 300000000, bids: [], invitedSuppliers: ['S02', 'S05'], createdAt: '2026-04-02T09:00:00',
  },
];

const mockBids: Record<string, AuctionBid[]> = {
  'AUC-001': [
    { id: 'BID-001', auctionId: 'AUC-001', sellerId: 'S01', sellerName: 'Tech Solutions VN', totalPrice: 7200000000, itemPrices: [], deliveryDays: 45, paymentTerms: 'Net 30', note: 'Hàng chính hãng Dell', submittedAt: '2026-04-03T10:00:00', status: 'Đang xem xét' },
    { id: 'BID-002', auctionId: 'AUC-001', sellerId: 'S02', sellerName: 'HP Vietnam Partner', totalPrice: 7350000000, itemPrices: [], deliveryDays: 30, paymentTerms: 'Net 45', note: 'HP EliteBook đảm bảo', submittedAt: '2026-04-04T14:00:00', status: 'Đang xem xét' },
  ],
  'AUC-002': [
    { id: 'BID-003', auctionId: 'AUC-002', sellerId: 'S03', sellerName: 'Network Pro', totalPrice: 185000000, itemPrices: [], deliveryDays: 14, paymentTerms: 'Thanh toán ngay', note: 'Bảo hành 3 năm', submittedAt: '2026-03-18T09:00:00', status: 'Đã chọn' },
  ],
  'AUC-003': [
    { id: 'BID-004', auctionId: 'AUC-003', sellerId: 'S01', sellerName: 'Tech Solutions VN', totalPrice: 1520000000, itemPrices: [], deliveryDays: 21, paymentTerms: 'Net 30', note: 'Canon MF445dw', submittedAt: '2026-03-03T10:00:00', status: 'Thắng' },
    { id: 'BID-005', auctionId: 'AUC-003', sellerId: 'S04', sellerName: 'Office World', totalPrice: 1580000000, itemPrices: [], deliveryDays: 28, paymentTerms: 'Net 30', note: 'HP LaserJet Pro', submittedAt: '2026-03-04T11:00:00', status: 'Thua' },
  ],
};

const statusOptions = ['Tất cả', 'Đang mở', 'Đã đóng', 'Đã chọn NCC', 'Đã hủy'];

export function AdminAuctionPage() {
  const [auctions, setAuctions] = useState<ReverseAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<ReverseAuction | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ auction: ReverseAuction; action: 'suspend' | 'cancel' } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setAuctions(mockAuctions);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = auctions.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: auctions.length,
    open: auctions.filter(a => a.status === 'Đang mở').length,
    closed: auctions.filter(a => a.status === 'Đã đóng' || a.status === 'Đã chọn NCC').length,
    avgBids: auctions.length > 0
      ? Math.round(Object.values(mockBids).reduce((s, b) => s + b.length, 0) / auctions.length * 10) / 10
      : 0,
    totalValue: auctions.reduce((s, a) => s + a.maxBudget, 0),
  };

  const columns = [
    { key: 'id', label: 'Mã phiên', render: (v: string) => <span className="font-mono text-xs text-muted-foreground">{v}</span> },
    {
      key: 'title', label: 'Tiêu đề',
      render: (v: string, row: ReverseAuction) => (
        <div>
          <p className="font-medium line-clamp-1">{v}</p>
          <p className="text-xs text-muted-foreground">{row.buyerName}</p>
        </div>
      ),
    },
    {
      key: 'bids', label: 'Số Bid',
      render: (_: unknown, row: ReverseAuction) => {
        const bids = mockBids[row.id] || [];
        return <Badge variant="outline">{bids.length} bid</Badge>;
      },
    },
    {
      key: 'maxBudget', label: 'Ngân sách tối đa',
      render: (v: number) => <span className="text-primary font-medium">{formatCurrency(v)}</span>,
    },
    {
      key: 'endTime', label: 'Kết thúc',
      render: (v: string) => <span className="text-xs">{formatDateTime(v)}</span>,
    },
    {
      key: 'status', label: 'Trạng thái',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'actions', label: '',
      render: (_: unknown, row: ReverseAuction) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
          {row.status === 'Đang mở' && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmAction({ auction: row, action: 'cancel' })}>
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleAction = () => {
    if (!confirmAction) return;
    setAuctions(prev => prev.map(a => a.id === confirmAction.auction.id
      ? { ...a, status: confirmAction.action === 'cancel' ? 'Đã hủy' : 'Đã đóng' }
      : a
    ));
    toast.success(confirmAction.action === 'cancel' ? 'Đã hủy phiên đấu giá' : 'Đã tạm ngừng phiên');
    setConfirmAction(null);
  };

  const selectedBids = selected ? (mockBids[selected.id] || []) : [];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Quản lý đấu giá' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Gavel className="h-6 w-6 text-primary" /> Quản lý đấu giá ngược</h1>
          <p className="text-muted-foreground">Giám sát và quản lý các phiên đấu giá trên sàn</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <QuickStatsCard title="Tổng phiên" value={stats.total} icon={<Gavel className="h-5 w-5 text-primary" />} />
        <QuickStatsCard title="Đang mở" value={stats.open} icon={<Clock className="h-5 w-5 text-green-500" />} color="success" />
        <QuickStatsCard title="Đã đóng" value={stats.closed} icon={<TrendingDown className="h-5 w-5 text-gray-500" />} />
        <QuickStatsCard title="Bid trung bình" value={`${stats.avgBids}/phiên`} icon={<Users className="h-5 w-5 text-blue-500" />} color="info" />
        <QuickStatsCard title="Tổng giá trị NS" value={formatCurrency(stats.totalValue)} icon={<DollarSign className="h-5 w-5 text-purple-500" />} color="warning" />
      </div>

      {/* Filter */}
      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm phiên, buyer..."
        filters={[{ key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
      />

      {/* Table */}
      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Không có phiên đấu giá nào" pagination />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Buyer:</span> <strong>{selected.buyerName}</strong></div>
                <div><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge status={selected.status} /></div>
                <div><span className="text-muted-foreground">Bắt đầu:</span> {formatDateTime(selected.startTime)}</div>
                <div><span className="text-muted-foreground">Kết thúc:</span> {formatDateTime(selected.endTime)}</div>
                <div className="col-span-2"><span className="text-muted-foreground">NS tối đa:</span> <strong className="text-primary">{formatCurrency(selected.maxBudget)}</strong></div>
                <div className="col-span-2"><span className="text-muted-foreground">Mô tả:</span> {selected.description}</div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Danh sách sản phẩm yêu cầu</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {['Sản phẩm', 'Số lượng', 'Đơn vị', 'Thông số', 'NS tối đa/đơn vị'].map(h => (
                          <th key={h} className="text-left px-3 py-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2 font-medium">{item.productName}</td>
                          <td className="px-3 py-2">{item.quantity.toLocaleString()}</td>
                          <td className="px-3 py-2">{item.unit}</td>
                          <td className="px-3 py-2 text-muted-foreground">{item.specification}</td>
                          <td className="px-3 py-2 text-primary">{formatCurrency(item.maxBudget)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bids */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Danh sách bid ({selectedBids.length})
                </h4>
                {selectedBids.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 border rounded-lg">Chưa có bid nào</p>
                ) : (
                  <div className="space-y-2">
                    {[...selectedBids].sort((a, b) => a.totalPrice - b.totalPrice).map((bid, idx) => (
                      <div key={bid.id} className={`border rounded-lg p-3 ${bid.status === 'Thắng' ? 'border-green-500 bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-medium">{bid.sellerName}</p>
                              <p className="text-xs text-muted-foreground">{bid.note}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatCurrency(bid.totalPrice)}</p>
                            <p className="text-xs text-muted-foreground">Giao {bid.deliveryDays} ngày · {bid.paymentTerms}</p>
                          </div>
                          <StatusBadge status={bid.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {selected?.status === 'Đang mở' && (
              <Button variant="destructive" onClick={() => { setConfirmAction({ auction: selected, action: 'cancel' }); setSelected(null); }}>
                <Ban className="h-4 w-4 mr-1" /> Hủy phiên
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Xác nhận hành động</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Bạn có chắc muốn <strong>{confirmAction?.action === 'cancel' ? 'hủy' : 'tạm ngừng'}</strong> phiên đấu giá{' '}
            <strong>"{confirmAction?.auction.title}"</strong>? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleAction}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
