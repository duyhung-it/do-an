// ============================================================
// Đấu giá ngược — Buyer (Nhóm 34C)
// Stats, DataTable, Countdown, Tạo phiên, Chi tiết, Chọn NCC
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Gavel, Plus, Eye, Trash2, Trophy, Clock, CheckCircle2,
  Users2, TrendingDown, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
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
  ReverseAuction, AuctionBid, AuctionStats, AuctionItem, AuctionStatus,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ALL_STATUSES: AuctionStatus[] = ['Bản nháp', 'Đang mở', 'Đã đóng', 'Đã chọn NCC', 'Đã huỷ'];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
];

const emptyItem = (): AuctionItem => ({ id: `ai-new-${Date.now()}`, productName: '', quantity: 1, unit: 'Cái', specification: '', maxBudget: 0 });

// --- Countdown hook ---
function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Đã kết thúc'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}p` : `${h}h ${m}p ${s}s`);
    };
    calc();
    intervalRef.current = setInterval(calc, 1000);
    return () => clearInterval(intervalRef.current);
  }, [endTime]);

  return timeLeft;
}

function CountdownBadge({ endTime }: { endTime: string }) {
  const timeLeft = useCountdown(endTime);
  const isExpired = timeLeft === 'Đã kết thúc';
  return (
    <Badge variant={isExpired ? 'secondary' : 'default'} className={`gap-1 ${!isExpired ? 'bg-orange-100 text-orange-700 border-orange-200' : ''}`}>
      <Clock className="h-3 w-3" /> {timeLeft}
    </Badge>
  );
}

export function BuyerAuctionListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyerId = user?.id ?? 'user-001';

  const [auctions, setAuctions] = useState<ReverseAuction[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AuctionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showSelectWinner, setShowSelectWinner] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<ReverseAuction | null>(null);
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [selectedBidId, setSelectedBidId] = useState('');

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formItems, setFormItems] = useState<AuctionItem[]>([emptyItem()]);
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formInvited, setFormInvited] = useState('');

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        auctionApi.getByBuyer(buyerId, pagination, sort, filters, search),
        auctionApi.getStats(buyerId, 'buyer'),
      ]);
      setAuctions(res.data);
      setTotal(res.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [buyerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Open detail ---
  const openDetail = async (auction: ReverseAuction) => {
    setSelectedAuction(auction);
    const b = await auctionApi.getBids(auction.id);
    setBids(b);
    setShowDetail(true);
  };

  // --- Form ---
  const resetForm = () => {
    setFormTitle(''); setFormDesc(''); setFormItems([emptyItem()]);
    setFormStartTime(''); setFormEndTime(''); setFormInvited('');
  };

  const handleCreate = async () => {
    if (!formTitle || !formEndTime || formItems.some(i => !i.productName)) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    const maxBudget = formItems.reduce((s, i) => s + i.maxBudget, 0);
    const invNames = formInvited.split(',').map(s => s.trim()).filter(Boolean);
    await auctionApi.create({
      title: formTitle,
      description: formDesc,
      buyerId,
      buyerName: user?.fullName ?? '',
      buyerCompany: user?.companyName ?? '',
      items: formItems,
      startTime: formStartTime || new Date().toISOString(),
      endTime: new Date(formEndTime).toISOString(),
      maxBudget,
      invitedSupplierIds: invNames.map((_, i) => `sup-inv-${i}`),
      invitedSupplierNames: invNames,
    });
    toast.success('Đã tạo phiên đấu giá');
    setShowForm(false);
    resetForm();
    fetchData();
  };

  // --- Select winner ---
  const handleSelectWinner = async () => {
    if (!selectedAuction || !selectedBidId) return;
    await auctionApi.selectWinner(selectedAuction.id, selectedBidId);
    toast.success('Đã chọn NCC trúng thầu!');
    setShowSelectWinner(false);
    setShowDetail(false);
    fetchData();
  };

  // --- Columns ---
  const columns: (ColumnConfig & { render?: (item: ReverseAuction) => React.ReactNode })[] = [
    { key: 'auctionNumber', label: 'Mã phiên', visible: true, sortable: true },
    { key: 'title', label: 'Tiêu đề', visible: true, sortable: true,
      render: (a) => <span className="line-clamp-1 max-w-[200px]">{a.title}</span>,
    },
    { key: 'itemCount', label: 'Số SP', visible: true, sortable: false,
      render: (a) => <span>{a.items.length}</span>,
    },
    { key: 'endTime', label: 'Thời gian còn lại', visible: true, sortable: true,
      render: (a) => a.status === 'Đang mở' ? <CountdownBadge endTime={a.endTime} /> : <span className="text-muted-foreground">{formatDate(a.endTime)}</span>,
    },
    { key: 'totalBids', label: 'Số bid', visible: true, sortable: true,
      render: (a) => <Badge variant="outline">{a.totalBids}</Badge>,
    },
    { key: 'maxBudget', label: 'Giá trần', visible: true, sortable: true,
      render: (a) => <span className="font-medium">{formatPrice(a.maxBudget)}</span>,
    },
    { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (a) => {
        if (a.status === 'Đã chọn NCC') return (
          <div className="flex items-center gap-1">
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><Trophy className="h-3 w-3" /> Đã chọn NCC</Badge>
          </div>
        );
        return <StatusBadge status={a.status} />;
      },
    },
  ];

  // --- Stats ---
  const statsCards = stats ? [
    { label: 'Tổng phiên', value: stats.total, icon: Gavel, color: 'text-blue-600 bg-blue-50' },
    { label: 'Đang mở', value: stats.open, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Đã đóng', value: stats.closed, icon: AlertTriangle, color: 'text-gray-600 bg-gray-50' },
    { label: 'Đã chọn NCC', value: stats.selected, icon: Trophy, color: 'text-green-600 bg-green-50' },
    { label: 'TB bid/phiên', value: stats.avgBidsPerAuction, icon: Users2, color: 'text-purple-600 bg-purple-50' },
    { label: 'TB tiết kiệm', value: `${stats.avgSavingsPercent}%`, icon: TrendingDown, color: 'text-indigo-600 bg-indigo-50' },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Đấu giá ngược' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2"><Gavel className="h-6 w-6" /> Đấu giá ngược</h1>
          <p className="text-muted-foreground">Tạo phiên đấu giá để NCC cạnh tranh giá tốt nhất</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo phiên
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statsCards.map(card => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-semibold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              <Button size="sm" variant="ghost" onClick={() => navigate(`/auctions/${auction.id}`)}><Eye className="h-4 w-4" /></Button>
              {auction.status === 'Đang mở' && (
                <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                  await auctionApi.cancel(auction.id); toast.success('Đã huỷ phiên'); fetchData();
                }}><Trash2 className="h-4 w-4" /></Button>
              )}
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Tạo phiên ==================== */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phiên đấu giá ngược</DialogTitle>
            <DialogDescription>NCC sẽ cạnh tranh để đưa ra giá tốt nhất cho bạn</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tiêu đề <span className="text-red-500">*</span></Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="VD: Mua linh kiện Q2/2025" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Yêu cầu chi tiết..." rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bắt đầu</Label>
                <Input type="datetime-local" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
              </div>
              <div>
                <Label>Kết thúc <span className="text-red-500">*</span></Label>
                <Input type="datetime-local" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>NCC được mời (tên, cách nhau bởi dấu phẩy)</Label>
              <Input value={formInvited} onChange={e => setFormInvited(e.target.value)} placeholder="VD: NCC A, NCC B, NCC C" />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Sản phẩm cần mua</Label>
                <Button size="sm" variant="outline" onClick={() => setFormItems(prev => [...prev, emptyItem()])}>
                  <Plus className="h-3 w-3 mr-1" /> Thêm SP
                </Button>
              </div>
              <div className="space-y-3">
                {formItems.map((item, idx) => (
                  <div key={item.id} className="p-3 border rounded-lg space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Input value={item.productName}
                          onChange={e => setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, productName: e.target.value } : it))}
                          placeholder="Tên sản phẩm" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={1} value={item.quantity}
                          onChange={e => setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))}
                          placeholder="SL" />
                      </div>
                      <div className="col-span-2">
                        <Select value={item.unit} onValueChange={v => setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, unit: v } : it))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Cái', 'Bộ', 'Mét', 'Kg', 'Tấn', 'Cây', 'Thùng'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={0} value={item.maxBudget}
                          onChange={e => setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, maxBudget: Number(e.target.value) } : it))}
                          placeholder="Giá trần" />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <Button size="sm" variant="ghost" className="text-red-500"
                          disabled={formItems.length <= 1}
                          onClick={() => setFormItems(prev => prev.filter((_, i) => i !== idx))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Input value={item.specification}
                      onChange={e => setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, specification: e.target.value } : it))}
                      placeholder="Quy cách / yêu cầu kỹ thuật" className="text-sm" />
                  </div>
                ))}
              </div>
              <p className="text-right text-sm mt-2">
                Tổng giá trần: <strong>{formatPrice(formItems.reduce((s, i) => s + i.maxBudget, 0))}</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Huỷ</Button>
            <Button onClick={handleCreate} className="gap-2"><Gavel className="h-4 w-4" /> Mở đấu giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Chi tiết phiên ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAuction?.title}</DialogTitle>
          </DialogHeader>
          {selectedAuction && (
            <div className="space-y-4">
              {/* Info + Countdown */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Mã phiên:</span>
                  <p className="font-medium">{selectedAuction.auctionNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusBadge status={selectedAuction.status} />
                    {selectedAuction.status === 'Đang mở' && <CountdownBadge endTime={selectedAuction.endTime} />}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Giá trần:</span>
                  <p className="font-medium">{formatPrice(selectedAuction.maxBudget)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tổng bid:</span>
                  <p className="font-medium">{selectedAuction.totalBids}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bắt đầu:</span>
                  <p>{formatDate(selectedAuction.startTime)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kết thúc:</span>
                  <p>{formatDate(selectedAuction.endTime)}</p>
                </div>
              </div>

              <p className="text-sm">{selectedAuction.description}</p>

              {/* NCC mời */}
              <div>
                <span className="text-sm text-muted-foreground">NCC được mời:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedAuction.invitedSupplierNames.map(n => (
                    <Badge key={n} variant="outline">{n}</Badge>
                  ))}
                </div>
              </div>

              {/* Winner banner */}
              {selectedAuction.winnerName && (
                <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">NCC trúng thầu: {selectedAuction.winnerName}</span>
                </div>
              )}

              {/* Items */}
              <Separator />
              <div>
                <p className="font-medium mb-2">Sản phẩm cần mua ({selectedAuction.items.length})</p>
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

              {/* Bids ranking */}
              {bids.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Bảng xếp hạng bid ({bids.length})</p>
                    <div className="space-y-3">
                      {bids.map((bid, idx) => {
                        const savingsPercent = selectedAuction.maxBudget > 0
                          ? Math.round(((selectedAuction.maxBudget - bid.totalPrice) / selectedAuction.maxBudget) * 100)
                          : 0;
                        return (
                          <div key={bid.id} className={`p-3 rounded-lg border ${bid.isWinner ? 'border-green-300 bg-green-50' : 'bg-background'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  idx === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                  #{idx + 1}
                                </span>
                                <div>
                                  <p className="font-medium">{bid.sellerCompany}</p>
                                  <p className="text-sm text-muted-foreground">{bid.sellerName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-primary">{formatPrice(bid.totalPrice)}</p>
                                {savingsPercent > 0 && (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    <TrendingDown className="h-3 w-3 mr-1" />Tiết kiệm {savingsPercent}%
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                              <div><span className="text-muted-foreground">Giao:</span> {bid.deliveryDays} ngày</div>
                              <div><span className="text-muted-foreground">Thanh toán:</span> {bid.paymentTerms}</div>
                              {bid.note && <div><span className="text-muted-foreground">Ghi chú:</span> {bid.note}</div>}
                            </div>

                            {/* Detail items */}
                            <div className="mt-2 space-y-1">
                              {bid.items.map(bi => (
                                <div key={bi.auctionItemId} className="flex justify-between text-xs text-muted-foreground">
                                  <span>{bi.productName} × {bi.quantity}</span>
                                  <span>{formatPrice(bi.unitPrice)}/đv → {formatPrice(bi.amount)}</span>
                                </div>
                              ))}
                            </div>

                            {bid.isWinner && (
                              <div className="mt-2 flex items-center gap-1 text-green-600 text-sm"><Trophy className="h-4 w-4" /> NCC trúng thầu</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Select winner button */}
              {selectedAuction.status === 'Đang mở' && bids.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={() => { setSelectedBidId(bids[0]?.id ?? ''); setShowSelectWinner(true); }}
                    className="gap-2"><Trophy className="h-4 w-4" /> Chọn NCC trúng thầu</Button>
                </div>
              )}
              {selectedAuction.status === 'Đã đóng' && bids.length > 0 && !selectedAuction.winnerId && (
                <div className="flex justify-end">
                  <Button onClick={() => { setSelectedBidId(bids[0]?.id ?? ''); setShowSelectWinner(true); }}
                    className="gap-2"><Trophy className="h-4 w-4" /> Chọn NCC trúng thầu</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Chọn NCC thắng ==================== */}
      <Dialog open={showSelectWinner} onOpenChange={setShowSelectWinner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn NCC trúng thầu</DialogTitle>
            <DialogDescription>Chọn báo giá tốt nhất từ danh sách dưới đây</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {bids.map(bid => (
              <label key={bid.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${selectedBidId === bid.id ? 'border-primary bg-primary/5' : ''}`}>
                <input type="radio" name="winner" value={bid.id} checked={selectedBidId === bid.id}
                  onChange={() => setSelectedBidId(bid.id)} className="accent-primary" />
                <div className="flex-1">
                  <p className="font-medium">{bid.sellerCompany}</p>
                  <p className="text-sm text-muted-foreground">Giao {bid.deliveryDays} ngày · {bid.paymentTerms}</p>
                </div>
                <span className="text-lg font-semibold text-primary">{formatPrice(bid.totalPrice)}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectWinner(false)}>Huỷ</Button>
            <Button onClick={handleSelectWinner} disabled={!selectedBidId} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Xác nhận chọn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}