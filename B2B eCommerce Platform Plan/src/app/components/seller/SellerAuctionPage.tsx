// ============================================================
// Đấu giá ngược — Seller (Nhóm 34D)
// Danh sách phiên được mời, xem chi tiết, gửi bid
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Gavel, Eye, Clock, Send, Trophy, TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { auctionApi } from '../../services/auctionApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  ReverseAuction, AuctionBid, AuctionBidItem, AuctionStatus,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ALL_STATUSES: AuctionStatus[] = ['Đang mở', 'Đã đóng', 'Đã chọn NCC', 'Đã huỷ'];
const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
];

function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState('');
  const ref = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Đã kết thúc'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}p` : `${h}h ${m}p`);
    };
    calc(); ref.current = setInterval(calc, 60000);
    return () => clearInterval(ref.current);
  }, [endTime]);
  return timeLeft;
}

function CountdownBadge({ endTime }: { endTime: string }) {
  const tl = useCountdown(endTime);
  const expired = tl === 'Đã kết thúc';
  return (
    <Badge variant={expired ? 'secondary' : 'default'} className={`gap-1 ${!expired ? 'bg-orange-100 text-orange-700 border-orange-200' : ''}`}>
      <Clock className="h-3 w-3" /> {tl}
    </Badge>
  );
}

export function SellerAuctionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sellerId = user?.supplierId ?? 'sup-01';

  const [auctions, setAuctions] = useState<ReverseAuction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'endTime', direction: 'asc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showDetail, setShowDetail] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<ReverseAuction | null>(null);
  const [myBid, setMyBid] = useState<AuctionBid | null>(null);

  // Bid form
  const [bidItems, setBidItems] = useState<AuctionBidItem[]>([]);
  const [bidDeliveryDays, setBidDeliveryDays] = useState(14);
  const [bidPaymentTerms, setBidPaymentTerms] = useState('Net 30');
  const [bidNote, setBidNote] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auctionApi.getBySeller(sellerId, pagination, sort, filters, search);
      setAuctions(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [sellerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (auction: ReverseAuction) => {
    setSelectedAuction(auction);
    const bid = await auctionApi.getMyBid(auction.id, sellerId);
    setMyBid(bid);
    setShowDetail(true);
  };

  const openBidForm = (auction: ReverseAuction) => {
    setSelectedAuction(auction);
    setBidItems(auction.items.map(ai => ({
      auctionItemId: ai.id,
      productName: ai.productName,
      unitPrice: 0,
      quantity: ai.quantity,
      amount: 0,
    })));
    setBidDeliveryDays(14);
    setBidPaymentTerms('Net 30');
    setBidNote('');
    setShowBidForm(true);
  };

  const handleBidItemChange = (idx: number, price: number) => {
    setBidItems(prev => prev.map((bi, i) =>
      i === idx ? { ...bi, unitPrice: price, amount: price * bi.quantity } : bi
    ));
  };

  const handleSubmitBid = async () => {
    if (bidItems.some(bi => bi.unitPrice <= 0)) {
      toast.error('Vui lòng nhập giá cho tất cả sản phẩm'); return;
    }
    const totalPrice = bidItems.reduce((s, bi) => s + bi.amount, 0);
    await auctionApi.submitBid({
      auctionId: selectedAuction!.id,
      sellerId,
      sellerName: user?.fullName ?? '',
      sellerCompany: user?.companyName ?? '',
      items: bidItems,
      totalPrice,
      deliveryDays: bidDeliveryDays,
      paymentTerms: bidPaymentTerms,
      note: bidNote,
    });
    toast.success('Đã gửi báo giá đấu thầu!');
    setShowBidForm(false);
    fetchData();
  };

  const columns: (ColumnConfig & { render?: (item: ReverseAuction) => React.ReactNode })[] = [
    { key: 'auctionNumber', label: 'Mã phiên', visible: true, sortable: true },
    { key: 'title', label: 'Tiêu đề', visible: true, sortable: true,
      render: (a) => <span className="line-clamp-1 max-w-[200px]">{a.title}</span>,
    },
    { key: 'buyerCompany', label: 'Người mua', visible: true, sortable: true },
    { key: 'maxBudget', label: 'Giá trần', visible: true, sortable: true,
      render: (a) => <span className="font-medium">{formatPrice(a.maxBudget)}</span>,
    },
    { key: 'endTime', label: 'Còn lại', visible: true, sortable: true,
      render: (a) => a.status === 'Đang mở' ? <CountdownBadge endTime={a.endTime} /> : <span className="text-muted-foreground">{formatDate(a.endTime)}</span>,
    },
    { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (a) => {
        if (a.winnerId === sellerId) return <Badge className="bg-green-100 text-green-700 gap-1"><Trophy className="h-3 w-3" /> Trúng thầu!</Badge>;
        return <StatusBadge status={a.status} />;
      },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Đấu giá' }]} />

      <div className="mb-6">
        <h1 className="flex items-center gap-2"><Gavel className="h-6 w-6" /> Đấu giá ngược</h1>
        <p className="text-muted-foreground">Xem các phiên đấu giá được mời tham gia và gửi báo giá</p>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã phiên, tiêu đề..."
      />

      <div className="mt-4">
        <DataTable
          data={auctions}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={a => a.id}
          loading={loading}
          renderActions={(auction) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/seller/auctions/${auction.id}`)}><Eye className="h-4 w-4" /></Button>
              {auction.status === 'Đang mở' && (
                <Button size="sm" variant="ghost" className="text-green-600" onClick={() => openBidForm(auction)}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Chi tiết phiên ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAuction?.title}</DialogTitle>
          </DialogHeader>
          {selectedAuction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Mã phiên:</span><p className="font-medium">{selectedAuction.auctionNumber}</p></div>
                <div><span className="text-muted-foreground">Người mua:</span><p className="font-medium">{selectedAuction.buyerCompany}</p></div>
                <div><span className="text-muted-foreground">Giá trần:</span><p className="font-medium">{formatPrice(selectedAuction.maxBudget)}</p></div>
                <div>
                  <span className="text-muted-foreground">Còn lại:</span>
                  <div className="mt-0.5">{selectedAuction.status === 'Đang mở' ? <CountdownBadge endTime={selectedAuction.endTime} /> : <StatusBadge status={selectedAuction.status} />}</div>
                </div>
              </div>
              <p className="text-sm">{selectedAuction.description}</p>

              <Separator />
              <div>
                <p className="font-medium mb-2">Sản phẩm cần mua</p>
                <div className="space-y-2">
                  {selectedAuction.items.map(item => (
                    <div key={item.id} className="flex justify-between p-2 bg-muted/30 rounded text-sm">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-muted-foreground">{item.specification}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p>{item.quantity} {item.unit}</p>
                        <p className="text-muted-foreground">Trần: {formatPrice(item.maxBudget)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My bid */}
              {myBid && (
                <>
                  <Separator />
                  <div className={`p-3 rounded-lg border ${myBid.isWinner ? 'border-green-300 bg-green-50' : 'bg-muted/30'}`}>
                    <p className="font-medium mb-2 flex items-center gap-2">
                      Báo giá của bạn
                      {myBid.isWinner && <Badge className="bg-green-100 text-green-700 gap-1"><Trophy className="h-3 w-3" /> Trúng thầu</Badge>}
                    </p>
                    <div className="text-sm space-y-1">
                      <p>Tổng giá: <strong className="text-primary">{formatPrice(myBid.totalPrice)}</strong></p>
                      <p>Giao hàng: {myBid.deliveryDays} ngày · Thanh toán: {myBid.paymentTerms}</p>
                      {myBid.note && <p className="text-muted-foreground">Ghi chú: {myBid.note}</p>}
                    </div>
                  </div>
                </>
              )}

              {!myBid && selectedAuction.status === 'Đang mở' && (
                <div className="flex justify-end">
                  <Button onClick={() => { setShowDetail(false); openBidForm(selectedAuction); }} className="gap-2">
                    <Send className="h-4 w-4" /> Gửi báo giá
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Gửi bid ==================== */}
      <Dialog open={showBidForm} onOpenChange={o => { if (!o) setShowBidForm(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gửi báo giá đấu thầu</DialogTitle>
            <DialogDescription>{selectedAuction?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Giá cho từng sản phẩm</Label>
              <div className="space-y-2">
                {bidItems.map((bi, idx) => (
                  <div key={bi.auctionItemId} className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/30 rounded">
                    <div className="col-span-5 text-sm">
                      <p className="font-medium">{bi.productName}</p>
                      <p className="text-muted-foreground">SL: {bi.quantity}</p>
                    </div>
                    <div className="col-span-4">
                      <Input type="number" min={0} value={bi.unitPrice}
                        onChange={e => handleBidItemChange(idx, Number(e.target.value))}
                        placeholder="Đơn giá (VNĐ)" />
                    </div>
                    <div className="col-span-3 text-right text-sm font-medium">
                      {formatPrice(bi.amount)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-right text-sm mt-2">
                Tổng: <strong className="text-primary">{formatPrice(bidItems.reduce((s, bi) => s + bi.amount, 0))}</strong>
                {selectedAuction && (
                  <span className="text-muted-foreground ml-2">
                    (Trần: {formatPrice(selectedAuction.maxBudget)})
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thời gian giao hàng (ngày)</Label>
                <Input type="number" min={1} value={bidDeliveryDays} onChange={e => setBidDeliveryDays(Number(e.target.value))} />
              </div>
              <div>
                <Label>Điều khoản thanh toán</Label>
                <Select value={bidPaymentTerms} onValueChange={setBidPaymentTerms}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Ghi chú</Label>
              <Textarea value={bidNote} onChange={e => setBidNote(e.target.value)} placeholder="Cam kết, điều kiện bổ sung..." rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBidForm(false)}>Huỷ</Button>
            <Button onClick={handleSubmitBid} className="gap-2"><Send className="h-4 w-4" /> Gửi báo giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}