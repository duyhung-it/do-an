// ============================================================
// Trang khuyến mãi — Danh sách khuyến mãi đang hoạt động
// ============================================================

import { useState, useEffect } from 'react';
import { Percent, DollarSign, Gift, BarChart3, Tag, Timer, Copy, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { copyToClipboard } from '../ui/utils';
import { promotionApi } from '../../services/api';
import type { Promotion, PaginatedResponse } from '../../types';
import { toast } from 'sonner';
import { GridSkeleton } from '../shared/PageSkeleton';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const PAGE_SIZE = 12;

const typeIcons: Record<string, typeof Percent> = {
  'Phần trăm': Percent,
  'Số tiền': DollarSign,
  'Mua X tặng Y': Gift,
  'Giảm theo số lượng': BarChart3,
};

const GRADIENT_COLORS = [
  'from-blue-500/15 to-cyan-500/10',
  'from-purple-500/15 to-pink-500/10',
  'from-green-500/15 to-emerald-500/10',
  'from-amber-500/15 to-orange-500/10',
  'from-rose-500/15 to-red-500/10',
  'from-indigo-500/15 to-violet-500/10',
];

function CountdownDisplay({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Đã hết hạn'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 7) { setTimeLeft(`Còn ${days} ngày`); return; }
      if (days > 0) { setTimeLeft(`${days}d ${hours}h ${mins}m`); return; }
      setTimeLeft(`${hours}h ${mins}m`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  const diff = new Date(endDate).getTime() - Date.now();
  const isUrgent = diff > 0 && diff < 7 * 86400000;

  return (
    <span className={`flex items-center gap-1 text-xs ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`}>
      <Timer className="h-3 w-3" />
      {timeLeft}
    </span>
  );
}

function PromotionCard({ promo, colorIdx }: { promo: Promotion; colorIdx: number }) {
  const Icon = typeIcons[promo.type] ?? Tag;
  const daysLeft = Math.max(0, Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / 86400000));
  const usagePercent = promo.usageLimit > 0 ? Math.round((promo.usedCount / promo.usageLimit) * 100) : 0;
  const gradientClass = GRADIENT_COLORS[colorIdx % GRADIENT_COLORS.length];

  const getDiscountText = () => {
    if (promo.type === 'Phần trăm') return `Giảm ${promo.value}%`;
    if (promo.type === 'Số tiền') return `Giảm ${formatPrice(promo.value)}`;
    if (promo.type === 'Mua X tặng Y') return `Mua X tặng ${promo.value}`;
    return `Giảm theo SL: ${promo.value}%`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-sm">
      <div className={`bg-gradient-to-br ${gradientClass} px-4 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Badge variant="secondary" className="text-xs">{promo.type}</Badge>
          </div>
        </div>
        <CountdownDisplay endDate={promo.endDate} />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="line-clamp-1">{promo.name}</h3>
          <p className="text-muted-foreground line-clamp-2 mt-0.5">{promo.description}</p>
        </div>

        <div className="text-primary text-2xl">{getDiscountText()}</div>

        <div className="space-y-1 text-muted-foreground">
          {promo.minOrderValue > 0 && (
            <p>Đơn tối thiểu: {formatPrice(promo.minOrderValue)}</p>
          )}
          {promo.maxDiscount > 0 && promo.type === 'Phần trăm' && (
            <p>Giảm tối đa: {formatPrice(promo.maxDiscount)}</p>
          )}
          <p>
            HSD: {new Date(promo.startDate).toLocaleDateString('vi-VN')} – {new Date(promo.endDate).toLocaleDateString('vi-VN')}
          </p>
        </div>

        {promo.usageLimit > 0 && (
          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>Đã dùng {promo.usedCount}/{promo.usageLimit}</span>
              <span>{usagePercent}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        <Button
          className="w-full group-hover:shadow-md transition-shadow"
          variant="outline"
          onClick={() => {
            copyToClipboard(promo.code);
            toast.success(`Đã sao chép mã: ${promo.code}`);
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Sao chép mã: <span className="font-mono ml-1 text-primary">{promo.code}</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function BuyerPromotionPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<PaginatedResponse<Promotion> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    promotionApi.getActiveAll({ page, pageSize: PAGE_SIZE }, search || undefined)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Khuyến mãi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Khuyến mãi
          </h1>
          <p className="text-muted-foreground">Khám phá các chương trình ưu đãi đang có trên sàn</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm khuyến mãi, mã..."
            className="pl-10"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : !data || data.data.length === 0 ? (
        <div className="py-16 text-center">
          <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="mb-2">Không có khuyến mãi nào</h2>
          <p className="text-muted-foreground">
            {search ? 'Thử tìm kiếm với từ khoá khác' : 'Hiện tại chưa có chương trình khuyến mãi nào đang hoạt động'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((promo, idx) => (
              <PromotionCard key={promo.id} promo={promo} colorIdx={idx} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Trang trước
              </Button>
              <span className="text-muted-foreground">
                Trang {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}