// ============================================================
// Chi tiết phiên đấu giá ngược — Seller (xem từ góc NCC)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Gavel, ArrowLeft, Clock, CheckCircle2, DollarSign, Users,
  Award, Trophy, Package, Send, Timer, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { auctionApi } from '../../services/auctionApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { ReverseAuction, AuctionBid } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

function getTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Đã kết thúc';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)} ngày ${h % 24}h`;
  return `${h}h ${m}m`;
}

export function SellerAuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const supplierId = user?.supplierId ?? 'sup-01';

  const [auction, setAuction] = useState<ReverseAuction | null>(null);
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [bidDelivery, setBidDelivery] = useState('7');
  const [bidWarranty, setBidWarranty] = useState('12 tháng');
  const [bidNote, setBidNote] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [auctionData, bidsData] = await Promise.all([
        auctionApi.getById(id),
        auctionApi.getBids(id),
      ]);
      setAuction(auctionData);
      setBids(bidsData);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const myBid = bids.find(b => b.supplierId === supplierId);
  const myRank = bids.findIndex(b => b.supplierId === supplierId) + 1;
  const isOpen = auction?.status === 'Đang mở';
  const isWinner = auction?.winnerId === supplierId;

  const handleSubmitBid = async () => {
    if (!auction || !bidPrice) return;
    try {
      await auctionApi.submitBid({
        auctionId: auction.id,
        supplierId,
        supplierName: user?.name ?? 'NCC',
        items: auction.items.map(item => ({
          auctionItemId: item.id,
          unitPrice: parseFloat(bidPrice) / auction.items.length,
          note: '',
        })),
        totalPrice: parseFloat(bidPrice),
        deliveryDays: parseInt(bidDelivery),
        warranty: bidWarranty,
        note: bidNote,
      });
      toast.success('Đã gửi báo giá thành công');
      setShowBidDialog(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Gavel className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy phiên đấu giá</h2>
        <Button className="mt-4" onClick={() => navigate('/seller/auctions')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const lowestBid = bids.length > 0 ? bids[0] : null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Đấu giá ngược', href: '/seller/auctions' },
        { label: auction.auctionNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/seller/auctions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={Gavel}
            variant={isWinner ? 'success' : isOpen ? 'warning' : 'primary'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{auction.auctionNumber}</h1>
              <StatusBadge status={auction.status} />
              {isOpen && (
                <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1">
                  <Timer className="h-3 w-3" /> {getTimeLeft(auction.endTime)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{auction.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen && !myBid && (
            <Button onClick={() => setShowBidDialog(true)}>
              <Send className="h-4 w-4 mr-1" /> Gửi báo giá
            </Button>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {isWinner && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50/80 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30">
          <Trophy className="h-6 w-6 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">Chúc mừng! Bạn đã trúng thầu phiên đấu giá này.</p>
            {myBid && <p className="text-sm text-green-600 dark:text-green-400">Giá trúng thầu: {formatPrice(myBid.totalPrice)}</p>}
          </div>
        </div>
      )}

      {/* My bid status */}
      {myBid && !isWinner && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30">
          <FileText className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Bạn đã gửi báo giá: <strong>{formatPrice(myBid.totalPrice)}</strong> — Xếp hạng: #{myRank}/{bids.length}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Ngân sách tối đa" value={formatPrice(auction.maxBudget)} icon={DollarSign} />
        <SummaryCard label="Tổng báo giá" value={`${bids.length}`} icon={FileText} />
        <SummaryCard
          label="Giá thấp nhất"
          value={lowestBid ? formatPrice(lowestBid.totalPrice) : 'Chưa có'}
          icon={Award}
          highlight
        />
        <SummaryCard label="Báo giá của bạn" value={myBid ? formatPrice(myBid.totalPrice) : 'Chưa gửi'} icon={Send} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin phiên */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin phiên đấu giá</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã phiên" value={auction.auctionNumber} />
            <InfoRow label="Tiêu đề" value={auction.title} />
            <InfoRow label="Người mua" value={`${auction.buyerName} (${auction.buyerCompany})`} />
            <InfoRow label="Bắt đầu" value={auction.startTime} />
            <InfoRow label="Kết thúc" value={auction.endTime} />
            <InfoRow label="Ngân sách" value={formatPrice(auction.maxBudget)} />
            {auction.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mô tả yêu cầu</p>
                  <p className="text-sm">{auction.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Báo giá của bạn */}
        <Card>
          <CardHeader><CardTitle className="text-base">Báo giá của bạn</CardTitle></CardHeader>
          <CardContent>
            {myBid ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-lg text-primary font-medium">{formatPrice(myBid.totalPrice)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tiết kiệm {Math.round((1 - myBid.totalPrice / auction.maxBudget) * 100)}% so với ngân sách
                  </p>
                </div>
                <InfoRow label="Giao hàng" value={`${myBid.deliveryDays} ngày`} />
                <InfoRow label="Bảo hành" value={myBid.warranty} />
                {myBid.note && <InfoRow label="Ghi chú" value={myBid.note} />}
                <InfoRow label="Xếp hạng" value={`#${myRank} / ${bids.length} báo giá`} />
                <InfoRow label="Ngày gửi" value={myBid.submittedAt} />
              </div>
            ) : (
              <div className="text-center py-8">
                <Send className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-3">Bạn chưa gửi báo giá cho phiên này</p>
                {isOpen && (
                  <Button onClick={() => setShowBidDialog(true)}>
                    <Send className="h-4 w-4 mr-1" /> Gửi báo giá ngay
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm cần báo giá ({auction.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Sản phẩm</th>
                  <th className="text-right py-2 pr-4">SL</th>
                  <th className="text-left py-2 pr-4">ĐVT</th>
                  <th className="text-right py-2">Ngân sách tối đa</th>
                </tr>
              </thead>
              <tbody>
                {auction.items.map((item, idx) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{item.productName}</p>
                      {item.specification && <p className="text-xs text-muted-foreground">{item.specification}</p>}
                    </td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4">{item.unit}</td>
                    <td className="py-3 text-right font-medium">{formatPrice(item.maxBudget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bảng xếp hạng */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Bảng xếp hạng ({bids.length} báo giá)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có báo giá nào</p>
          ) : (
            <div className="space-y-2">
              {bids.map((bid, idx) => {
                const isMine = bid.supplierId === supplierId;
                const isBidWinner = bid.id === auction.winnerBidId;
                return (
                  <div key={bid.id} className={`flex items-center gap-4 p-3 rounded-lg border ${
                    isBidWinner ? 'border-green-300 bg-green-50/30 dark:bg-green-950/10'
                    : isMine ? 'border-primary/30 bg-primary/5'
                    : 'bg-muted/20'
                  }`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx === 0 ? <Trophy className="h-4 w-4" /> : <span className="text-sm">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{isMine ? `${bid.supplierName} (Bạn)` : bid.supplierName}</p>
                        {isBidWinner && <Badge variant="secondary" className="text-xs">Trúng thầu</Badge>}
                        {isMine && !isBidWinner && <Badge variant="outline" className="text-xs">Của bạn</Badge>}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Giao {bid.deliveryDays} ngày · BH: {bid.warranty}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-medium ${isMine ? 'text-primary' : ''}`}>{formatPrice(bid.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((1 - bid.totalPrice / auction.maxBudget) * 100)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog gửi báo giá */}
      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi báo giá</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="font-medium">{auction.title}</p>
              <p className="text-xs text-muted-foreground">Ngân sách: {formatPrice(auction.maxBudget)}</p>
            </div>
            <div>
              <Label>Tổng giá báo (VND) *</Label>
              <Input
                type="number"
                value={bidPrice}
                onChange={e => setBidPrice(e.target.value)}
                placeholder="Nhập tổng giá báo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thời gian giao (ngày)</Label>
                <Input
                  type="number"
                  value={bidDelivery}
                  onChange={e => setBidDelivery(e.target.value)}
                />
              </div>
              <div>
                <Label>Bảo hành</Label>
                <Input
                  value={bidWarranty}
                  onChange={e => setBidWarranty(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={bidNote}
                onChange={e => setBidNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBidDialog(false)}>Huỷ</Button>
            <Button onClick={handleSubmitBid} disabled={!bidPrice}>
              <Send className="h-4 w-4 mr-1" /> Gửi báo giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, highlight }: {
  label: string; value: string; icon: React.ElementType; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-medium ${highlight ? 'text-primary' : ''}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm min-w-[120px]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
