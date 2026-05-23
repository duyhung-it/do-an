// ============================================================
// Chi tiết vận đơn — Buyer
// Timeline, bản đồ giả lập, thông tin chi tiết, events
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Truck, Package, CheckCircle2, XCircle, MapPin, ArrowLeft,
  Clock, Phone, Mail, Building2, Weight, Ruler, DollarSign,
  Calendar, FileText, Navigation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { shipmentApi } from '../../services/api';
import type { Shipment, ShipmentStatus } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const statusSteps: ShipmentStatus[] = ['Chuẩn bị', 'Đã lấy hàng', 'Đang vận chuyển', 'Đang giao', 'Đã giao'];

const statusIcons: Record<string, React.ElementType> = {
  'Chuẩn bị': Package,
  'Đã lấy hàng': Truck,
  'Đang vận chuyển': Navigation,
  'Đang giao': MapPin,
  'Đã giao': CheckCircle2,
  'Thất bại': XCircle,
};

const statusColors: Record<string, string> = {
  'Chuẩn bị': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
  'Đã lấy hàng': 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  'Đang vận chuyển': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
  'Đang giao': 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
  'Đã giao': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  'Thất bại': 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
};

export function BuyerShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const sh = await shipmentApi.getById(id);
      setShipment(sh ?? null);
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

  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy vận đơn</h2>
        <p className="text-muted-foreground mt-2">Vận đơn này không tồn tại hoặc đã bị xoá</p>
        <Button className="mt-4" onClick={() => navigate('/shipments')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const progressPct = shipment.status === 'Thất bại'
    ? 0
    : Math.round(((statusSteps.indexOf(shipment.status) + 1) / statusSteps.length) * 100);

  const Icon = statusIcons[shipment.status] ?? Truck;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Vận chuyển', href: '/shipments' },
        { label: shipment.trackingNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${statusColors[shipment.status] || 'bg-muted'}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{shipment.trackingNumber}</h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-muted-foreground">Đơn hàng: {shipment.orderNumber}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/orders/${shipment.orderId}`)}>
          <FileText className="h-4 w-4 mr-1" /> Xem đơn hàng
        </Button>
      </div>

      {/* Progress bar */}
      {shipment.status !== 'Thất bại' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between text-xs mb-2">
              {statusSteps.map((s, i) => {
                const StepIcon = statusIcons[s] ?? Truck;
                const active = i <= statusSteps.indexOf(shipment.status);
                return (
                  <div key={s} className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className="text-center leading-tight max-w-[70px]">{s}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={progressPct} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Hoàn thành {progressPct}%
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin vận đơn */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" /> Thông tin vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Building2} label="Hãng vận chuyển" value={shipment.carrierName} />
            <InfoRow icon={FileText} label="Mã vận đơn" value={shipment.trackingNumber} />
            <InfoRow icon={DollarSign} label="Phí vận chuyển" value={formatPrice(shipment.shippingFee)} />
            <InfoRow icon={Weight} label="Cân nặng" value={`${shipment.weight} kg`} />
            <InfoRow icon={Ruler} label="Kích thước" value={shipment.dimensions || 'N/A'} />
            <Separator />
            <InfoRow icon={Calendar} label="Ngày tạo" value={shipment.createdAt} />
            <InfoRow icon={Clock} label="Dự kiến giao" value={shipment.estimatedDelivery} />
            {shipment.actualDelivery && (
              <InfoRow icon={CheckCircle2} label="Ngày giao thực tế" value={shipment.actualDelivery} highlight />
            )}
          </CardContent>
        </Card>

        {/* Điểm gửi / nhận */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Lộ trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Điểm gửi */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
                <div className="w-0.5 flex-1 bg-muted-foreground/30" />
              </div>
              <div className="flex-1 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Điểm gửi</p>
                <p className="font-medium">{shipment.supplierName || 'CELLPHONES'}</p>
                <p className="text-muted-foreground text-sm">{shipment.fromAddress}</p>
              </div>
            </div>
            {/* Điểm nhận */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Điểm nhận</p>
                <p className="font-medium">{shipment.buyerName}</p>
                <p className="text-muted-foreground text-sm">{shipment.toAddress}</p>
              </div>
            </div>

            <Separator />

            {/* Bản đồ giả lập */}
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">{shipment.fromAddress?.split(',').slice(-1)[0]?.trim() || 'HCM'}</span>
                </div>
                <div className="flex-1 mx-4 flex items-center">
                  <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30 relative">
                    <Truck className={`h-5 w-5 absolute -top-2.5 text-primary ${
                      shipment.status === 'Đã giao' ? 'right-0'
                      : shipment.status === 'Chuẩn bị' ? 'left-0'
                      : 'left-1/2 -translate-x-1/2'
                    }`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{shipment.toAddress?.split(',').slice(-1)[0]?.trim() || 'Đích'}</span>
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hành trình chi tiết */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Hành trình ({shipment.events.length} sự kiện)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shipment.events.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Chưa có sự kiện nào</p>
          ) : (
            <div className="relative pl-8 space-y-0">
              {[...shipment.events].reverse().map((ev, idx) => (
                <div key={idx} className="relative pb-6 last:pb-0">
                  {/* Dot */}
                  <div className={`absolute -left-8 top-0.5 w-4 h-4 rounded-full border-2 ${
                    idx === 0
                      ? 'bg-primary border-primary'
                      : 'bg-background border-muted-foreground/30'
                  }`} />
                  {/* Line */}
                  {idx < shipment.events.length - 1 && (
                    <div className="absolute -left-6 top-4 w-0.5 h-[calc(100%-0.5rem)] bg-border" />
                  )}
                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={idx === 0 ? 'font-medium' : ''}>{ev.description}</span>
                      <StatusBadge status={ev.status} size="sm" />
                    </div>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {ev.timestamp} · <MapPin className="h-3 w-3 inline" /> {ev.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helper Row ──
function InfoRow({
  icon: IconComp, label, value, highlight,
}: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <IconComp className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-sm min-w-[120px]">{label}</span>
      <span className={`text-sm ${highlight ? 'text-emerald-600 font-medium' : ''}`}>{value}</span>
    </div>
  );
}
