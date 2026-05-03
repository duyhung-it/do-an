// ============================================================
// AdminPlatformFeePage — Quản lý Phí Sàn (Platform Fees)
// Routes: /admin/platform-fees
// Bao gồm: transaction fee, subscription fee, listing fee
// ============================================================

import { useState, useEffect } from 'react';
import { DollarSign, Percent, Edit2, Plus, TrendingUp, Package, CreditCard, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatsCard } from '../shared/StatsCard';

interface PlatformFee {
  id: string;
  type: 'transaction' | 'subscription' | 'listing';
  name: string;
  description: string;
  value: number;         // % hoặc VNĐ cố định
  valueType: 'percent' | 'fixed';
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  appliesTo: 'all' | 'seller' | 'buyer';
  category?: string;
  updatedAt: string;
}

const mockFees: PlatformFee[] = [
  { id: '1', type: 'transaction', name: 'Phí giao dịch chuẩn', description: 'Áp dụng cho tất cả đơn hàng', value: 2.5, valueType: 'percent', minAmount: 5000, maxAmount: 5000000, isActive: true, appliesTo: 'seller', updatedAt: '2026-04-10' },
  { id: '2', type: 'transaction', name: 'Phí giao dịch cao cấp', description: 'Đơn hàng trên 50 triệu', value: 1.8, valueType: 'percent', minAmount: 90000, maxAmount: 10000000, isActive: true, appliesTo: 'seller', updatedAt: '2026-04-10' },
  { id: '3', type: 'subscription', name: 'Gói Cơ bản', description: 'Tối đa 100 sản phẩm, 50 đơn/tháng', value: 299000, valueType: 'fixed', isActive: true, appliesTo: 'seller', updatedAt: '2026-04-01' },
  { id: '4', type: 'subscription', name: 'Gói Doanh nghiệp', description: 'Không giới hạn SP, ưu tiên hiển thị', value: 999000, valueType: 'fixed', isActive: true, appliesTo: 'seller', updatedAt: '2026-04-01' },
  { id: '5', type: 'subscription', name: 'Gói Cao cấp', description: 'Toàn bộ tính năng + API access', value: 2499000, valueType: 'fixed', isActive: false, appliesTo: 'seller', updatedAt: '2026-04-01' },
  { id: '6', type: 'listing', name: 'Phí đăng sản phẩm nổi bật', description: 'Hiển thị trang nhất 7 ngày', value: 50000, valueType: 'fixed', isActive: true, appliesTo: 'seller', updatedAt: '2026-04-05' },
  { id: '7', type: 'listing', name: 'Phí tin nhắn quảng cáo', description: 'Gửi notification đến buyer', value: 20000, valueType: 'fixed', isActive: true, appliesTo: 'seller', updatedAt: '2026-04-05' },
];

const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const typeColor: Record<PlatformFee['type'], string> = {
  transaction: 'bg-blue-50 text-blue-700 border-blue-200',
  subscription: 'bg-purple-50 text-purple-700 border-purple-200',
  listing: 'bg-amber-50 text-amber-700 border-amber-200',
};
const typeLabel: Record<PlatformFee['type'], string> = {
  transaction: 'Giao dịch', subscription: 'Đăng ký', listing: 'Đăng tin',
};

export function AdminPlatformFeePage() {
  const [fees, setFees] = useState<PlatformFee[]>(mockFees);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = filterType === 'all' ? fees : fees.filter(f => f.type === filterType);
  const totalRevExpected = fees.filter(f => f.type === 'transaction' && f.isActive).reduce((s, f) => s + f.value, 0);

  const handleToggle = (id: string) => {
    setFees(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
    toast.success('Đã cập nhật trạng thái phí');
  };

  const handleEdit = (fee: PlatformFee) => {
    setEditId(fee.id);
    setEditValue(fee.value.toString());
  };

  const handleSave = (id: string) => {
    setFees(prev => prev.map(f => f.id === id ? { ...f, value: Number(editValue), updatedAt: new Date().toISOString().split('T')[0] } : f));
    setEditId(null);
    toast.success('Đã cập nhật mức phí');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Phí sàn' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Quản lý Phí Sàn
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Cấu hình phí giao dịch, đăng ký và đăng tin</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Thêm loại phí
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Phí giao dịch" value={fees.filter(f => f.type === 'transaction' && f.isActive).length} icon={TrendingUp} variant="primary" subtitle="Đang kích hoạt" />
        <StatsCard title="Gói đăng ký" value={fees.filter(f => f.type === 'subscription' && f.isActive).length} icon={CreditCard} variant="success" subtitle="Đang hoạt động" />
        <StatsCard title="Phí đăng tin" value={fees.filter(f => f.type === 'listing' && f.isActive).length} icon={Package} variant="warning" subtitle="Đang kích hoạt" />
        <StatsCard title="Tổng % phí giao dịch" value={totalRevExpected} format={v => `${v.toFixed(1)}%`} icon={Percent} variant="info" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'transaction', 'subscription', 'listing'] as const).map(t => (
          <Button
            key={t}
            variant={filterType === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(t)}
          >
            {t === 'all' ? 'Tất cả' : typeLabel[t as PlatformFee['type']]}
          </Button>
        ))}
      </div>

      {/* Fee Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(fee => (
          <Card key={fee.id} className={`transition-all duration-200 hover:shadow-md ${!fee.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeColor[fee.type]}`}>
                    {typeLabel[fee.type]}
                  </span>
                  <CardTitle className="text-base mt-2">{fee.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{fee.description}</p>
                </div>
                <Switch checked={fee.isActive} onCheckedChange={() => handleToggle(fee.id)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Value edit */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                {editId === fee.id ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="h-7 text-sm w-28"
                      type="number"
                    />
                    <span className="text-xs text-muted-foreground">{fee.valueType === 'percent' ? '%' : 'VNĐ'}</span>
                    <Button size="sm" className="h-7 text-xs ml-auto" onClick={() => handleSave(fee.id)}>Lưu</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditId(null)}>Huỷ</Button>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-primary">
                      {fee.valueType === 'percent' ? `${fee.value}%` : FMT.format(fee.value)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {fee.valueType === 'percent' ? 'đơn hàng' : 'tháng'}</span>
                    <button onClick={() => handleEdit(fee)} className="ml-auto text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Min/Max */}
              {(fee.minAmount || fee.maxAmount) && (
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {fee.minAmount && <span>Tối thiểu: {FMT.format(fee.minAmount)}</span>}
                  {fee.maxAmount && <span>Tối đa: {FMT.format(fee.maxAmount)}</span>}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <span>Áp dụng cho: <b className="text-foreground">{fee.appliesTo === 'seller' ? 'Nhà cung cấp' : fee.appliesTo === 'buyer' ? 'Người mua' : 'Tất cả'}</b></span>
                <span>Cập nhật: {fee.updatedAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
