// ============================================================
// Chi tiết Thoả thuận giá / HĐ khung — Seller
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Handshake, ArrowLeft, Clock, CheckCircle2, DollarSign,
  FileText, Building2, BarChart3, TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { priceAgreementApi } from '../../services/priceAgreementApi';
import type { PriceAgreement, AgreementOrder } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export function SellerPriceAgreementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<PriceAgreement | null>(null);
  const [orders, setOrders] = useState<AgreementOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [agData, ordData] = await Promise.all([
        priceAgreementApi.getById(id),
        priceAgreementApi.getOrders(id),
      ]);
      setAgreement(agData);
      setOrders(ordData);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Handshake className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy thoả thuận</h2>
        <Button className="mt-4" onClick={() => navigate('/seller/price-agreements')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const usedPercent = agreement.totalContractValue > 0
    ? Math.round((agreement.usedValue / agreement.totalContractValue) * 100) : 0;
  const remaining = agreement.totalContractValue - agreement.usedValue;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Thoả thuận giá', href: '/seller/price-agreements' },
        { label: agreement.agreementNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/seller/price-agreements')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={Handshake}
            variant={agreement.status === 'Hiệu lực' ? 'success' : agreement.status === 'Đã hết hạn' || agreement.status === 'Đã huỷ' ? 'danger' : 'primary'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{agreement.agreementNumber}</h1>
              <StatusBadge status={agreement.status} />
              <Badge variant="outline">{agreement.type}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{agreement.title}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Giá trị HĐ" value={formatPrice(agreement.totalContractValue)} icon={DollarSign} highlight />
        <SummaryCard label="Đã sử dụng" value={`${formatPrice(agreement.usedValue)} (${usedPercent}%)`} icon={BarChart3} />
        <SummaryCard label="Còn lại" value={formatPrice(remaining)} icon={DollarSign} />
        <SummaryCard label="Số đơn hàng" value={`${orders.length}`} icon={FileText} />
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tiến độ sử dụng</span>
            <span className="text-sm font-medium">{usedPercent}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usedPercent > 90 ? 'bg-red-500' : usedPercent > 70 ? 'bg-amber-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Đã dùng: {formatPrice(agreement.usedValue)}</span>
            <span>Tổng: {formatPrice(agreement.totalContractValue)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin thoả thuận</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã" value={agreement.agreementNumber} />
            <InfoRow label="Loại" value={agreement.type} />
            <InfoRow label="Hiệu lực từ" value={agreement.startDate} />
            <InfoRow label="Hết hạn" value={agreement.endDate} />
            <InfoRow label="Ngày tạo" value={agreement.createdAt} />
            {agreement.approvedBy && <InfoRow label="Người duyệt" value={agreement.approvedBy} />}
            {agreement.approvedAt && <InfoRow label="Ngày duyệt" value={agreement.approvedAt} />}
          </CardContent>
        </Card>

        {/* Đối tác */}
        <Card>
          <CardHeader><CardTitle className="text-base">Đối tác</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Bạn (Nhà cung cấp)</p>
              <p className="font-medium">{agreement.sellerName}</p>
              <p className="text-sm text-muted-foreground">{agreement.sellerCompany}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-1">Bên mua</p>
              <p className="font-medium">{agreement.buyerName}</p>
              <p className="text-sm text-muted-foreground">{agreement.buyerCompany}</p>
            </div>
            {agreement.note && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm">{agreement.note}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm trong thoả thuận ({agreement.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Sản phẩm</th>
                  <th className="text-right py-2 pr-4">Giá gốc</th>
                  <th className="text-right py-2 pr-4">Giá TT</th>
                  <th className="text-right py-2 pr-4">Giảm</th>
                  <th className="text-right py-2 pr-4">SL tối thiểu</th>
                  <th className="text-left py-2">ĐVT</th>
                </tr>
              </thead>
              <tbody>
                {agreement.items.map((item, idx) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-4 font-medium">{item.productName}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground line-through">{formatPrice(item.originalPrice)}</td>
                    <td className="py-3 pr-4 text-right text-primary font-medium">{formatPrice(item.agreedPrice)}</td>
                    <td className="py-3 pr-4 text-right">
                      <Badge variant="secondary" className="text-xs">-{item.discountPercent}%</Badge>
                    </td>
                    <td className="py-3 pr-4 text-right">{item.minQuantity}</td>
                    <td className="py-3">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Đơn hàng liên kết */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Đơn hàng liên kết ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/seller/orders/${order.orderId}`)}
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <span className="font-medium">{formatPrice(order.amount)}</span>
                </div>
              ))}
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
