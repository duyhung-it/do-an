// ============================================================
// Chi tiết phiên đấu giá ngược — Buyer
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Gavel, ArrowLeft, Clock, CheckCircle2, DollarSign, Users,
  Award, Trophy, Package, FileText, XCircle, Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { auctionApi } from '../../services/auctionApi';
import { toast } from 'sonner';
import type { ReverseAuction, AuctionBid, AuctionStatus } from '../../types';

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

const statusColors: Record<AuctionStatus, string> = {
  'Bản nháp': 'bg-gray-100 text-gray-700',
  'Đang mở': 'bg-green-100 text-green-700',
  'Đã đóng': 'bg-blue-100 text-blue-700',
  'Đã chọn NCC': 'bg-purple-100 text-purple-700',
  'Đã huỷ': 'bg-red-100 text-red-700',
};

export function BuyerAuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<ReverseAuction | null>(null);
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSelectWinner = async (bidId: string) => {
    if (!auction) return;
    try {
      await auctionApi.selectWinner(auction.id, bidId);
      toast.success('Đã chọn nhà cung cấp trúng thầu');
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
        <Button className="mt-4" onClick={() => navigate('/auctions')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const isOpen = auction.status === 'Đang mở';
  const lowestBid = bids.length > 0 ? bids[0] : null;
  const savings = lowestBid ? Math.round((1 - lowestBid.totalPrice / auction.maxBudget) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Đấu giá ngược', href: '/auctions' },
        { label: auction.auctionNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auctions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={Gavel}
            variant={auction.status === 'Đã chọn NCC' ? 'success' : isOpen ? 'warning' : 'primary'}
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
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Ngân sách tối đa" value={formatPrice(auction.maxBudget)} icon={DollarSign} />
        <SummaryCard label="Số báo giá" value={`${bids.length}`} icon={FileText} />
        <SummaryCard
          label="Giá thấp nhất"
          value={lowestBid ? formatPrice(lowestBid.totalPrice) : 'Chưa có'}
          icon={Award}
          highlight
        />
        <SummaryCard label="Tiết kiệm" value={savings > 0 ? `${savings}%` : '—'} icon={Trophy} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin phiên */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin phiên đấu giá</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã phiên" value={auction.auctionNumber} />
            <InfoRow label="Tiêu đề" value={auction.title} />
            <InfoRow label="Bắt đầu" value={auction.startTime} />
            <InfoRow label="Kết thúc" value={auction.endTime} />
            <InfoRow label="Ngân sách" value={formatPrice(auction.maxBudget)} />
            <InfoRow label="Ngày tạo" value={auction.createdAt} />
            {auction.winnerName && (
              <>
                <Separator />
                <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-200/50">
                  <Trophy className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">NCC trúng thầu</p>
                    <p className="text-sm">{auction.winnerName}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* NCC được mời */}
        <Card>
          <CardHeader><CardTitle className="text-base">Nhà cung cấp được mời ({auction.invitedSupplierNames.length})</CardTitle></CardHeader>
          <CardContent>
            {auction.invitedSupplierNames.length > 0 ? (
              <div className="space-y-2">
                {auction.invitedSupplierNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{name}</span>
                    {auction.winnerId === auction.invitedSupplierIds[i] && (
                      <Badge variant="secondary" className="ml-auto text-xs">Trúng thầu</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có NCC được mời</p>
            )}
            {auction.description && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mô tả yêu cầu</p>
                  <p className="text-sm">{auction.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm cần mua ({auction.items.length})</CardTitle>
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
                  <th className="text-right py-2">Ngân sách</th>
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

      {/* Danh sách báo giá */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Báo giá nhận được ({bids.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có báo giá nào</p>
          ) : (
            <div className="space-y-3">
              {bids.map((bid, idx) => {
                const isWinner = bid.id === auction.winnerBidId;
                return (
                  <div key={bid.id} className={`flex items-center gap-4 p-3 rounded-lg border ${isWinner ? 'border-green-300 bg-green-50/30 dark:bg-green-950/10' : 'bg-muted/20'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx === 0 ? <Trophy className="h-4 w-4" /> : <span className="text-sm">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{bid.supplierName}</p>
                        {isWinner && <Badge variant="secondary" className="text-xs">Trúng thầu</Badge>}
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Giao trong {bid.deliveryDays} ngày · Bảo hành: {bid.warranty}
                      </p>
                      {bid.note && <p className="text-xs text-muted-foreground">{bid.note}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-primary">{formatPrice(bid.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((1 - bid.totalPrice / auction.maxBudget) * 100)}% tiết kiệm
                      </p>
                    </div>
                    {auction.status === 'Đã đóng' && !auction.winnerId && (
                      <Button size="sm" onClick={() => handleSelectWinner(bid.id)}>
                        Chọn
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
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
