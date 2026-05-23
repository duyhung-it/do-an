// ============================================================
// Chi tiết yêu cầu trả hàng — Buyer
// Progress steps, items, refund info, notes
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  RotateCcw, ArrowLeft, Package, CheckCircle2, XCircle,
  Clock, DollarSign, FileText, AlertTriangle, Banknote,
  Image as ImageIcon, MessageSquare, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { returnApi } from '../../services/api';
import type { ReturnRequest, ReturnStatus } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const getReturnStoreName = (returnReq: Pick<ReturnRequest, 'supplierName'>) => returnReq.supplierName || 'CELLPHONES';

const statusSteps: { key: ReturnStatus; label: string; icon: React.ElementType }[] = [
  { key: 'Chờ duyệt', label: 'Gửi yêu cầu', icon: Clock },
  { key: 'Đã duyệt', label: 'Được duyệt', icon: CheckCircle2 },
  { key: 'Đang xử lý', label: 'Đang xử lý', icon: Package },
  { key: 'Đã hoàn tiền', label: 'Hoàn tiền', icon: Banknote },
];

function getStepIndex(status: ReturnStatus): number {
  if (status === 'Từ chối') return 1;
  if (status === 'Đã đóng') return 3;
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function BuyerReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnReq, setReturnReq] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await returnApi.getById(id);
      setReturnReq(r ?? null);
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

  if (!returnReq) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <RotateCcw className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy yêu cầu trả hàng</h2>
        <p className="text-muted-foreground mt-2">Yêu cầu trả hàng này không tồn tại hoặc đã bị xoá</p>
        <Button className="mt-4" onClick={() => navigate('/returns')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const isRejected = returnReq.status === 'Từ chối';
  const stepIdx = getStepIndex(returnReq.status);
  const totalItemValue = returnReq.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Trả hàng', href: '/returns' },
        { label: `Yêu cầu #${returnReq.id.slice(-6)}` },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/returns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={RotateCcw}
            variant={returnReq.status === 'Đã hoàn tiền' ? 'success' : isRejected ? 'danger' : 'warning'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>Yêu cầu trả hàng #{returnReq.id.slice(-6)}</h1>
              <StatusBadge status={returnReq.status} />
              <Badge variant="outline">{returnReq.reason}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Đơn hàng: {returnReq.orderNumber} · Cửa hàng: {getReturnStoreName(returnReq)}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/orders/${returnReq.orderId}`)}>
          <FileText className="h-4 w-4 mr-1" /> Xem đơn hàng
        </Button>
      </div>

      {/* Rejected warning */}
      {isRejected && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">Yêu cầu đã bị từ chối</p>
            {returnReq.sellerNote && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Lý do: {returnReq.sellerNote}</p>
            )}
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {!isRejected && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const StepIcon = step.icon;
                const active = i <= stepIdx;
                const current = i === stepIdx;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                        active
                          ? current ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs text-center max-w-[80px] leading-tight ${
                        active ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-1.5rem] rounded-full ${
                        i < stepIdx ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Số SP trả" value={`${returnReq.items.length} sản phẩm`} icon={Package} />
        <SummaryCard label="Giá trị SP" value={formatPrice(totalItemValue)} icon={DollarSign} />
        <SummaryCard label="Hoàn tiền" value={formatPrice(returnReq.refundAmount)} icon={Banknote} highlight />
        <SummaryCard label="Hình thức" value={returnReq.refundMethod} icon={Building2} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin yêu cầu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Thông tin yêu cầu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã yêu cầu" value={returnReq.id} />
            <InfoRow label="Đơn hàng" value={returnReq.orderNumber} />
            <InfoRow label="Cửa hàng" value={getReturnStoreName(returnReq)} />
            <InfoRow label="Lý do" value={returnReq.reason} />
            <InfoRow label="Ngày tạo" value={returnReq.createdAt} />
            {returnReq.resolvedAt && <InfoRow label="Ngày xử lý" value={returnReq.resolvedAt} />}
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mô tả chi tiết</p>
              <p className="text-sm">{returnReq.description || 'Không có mô tả'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Hình ảnh & Ghi chú */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Ghi chú & Hình ảnh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Images */}
            {returnReq.images.length > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <ImageIcon className="h-4 w-4 inline mr-1" />
                  Hình ảnh đính kèm ({returnReq.images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {returnReq.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center border overflow-hidden">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không có hình ảnh đính kèm</p>
            )}

            <Separator />

            {/* Seller note */}
            {returnReq.sellerNote && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ghi chú từ cửa hàng</p>
                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50">
                  <p className="text-sm">{returnReq.sellerNote}</p>
                </div>
              </div>
            )}

            {/* Admin note */}
            {returnReq.adminNote && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ghi chú từ Admin</p>
                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50">
                  <p className="text-sm">{returnReq.adminNote}</p>
                </div>
              </div>
            )}

            {!returnReq.sellerNote && !returnReq.adminNote && (
              <p className="text-sm text-muted-foreground">Chưa có ghi chú</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sản phẩm trả hàng */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm trả hàng ({returnReq.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {returnReq.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>SL: {item.quantity}</span>
                    <span>·</span>
                    <span>{formatPrice(item.unitPrice)}</span>
                    <span>·</span>
                    <Badge variant="outline" className="text-xs">{item.reason}</Badge>
                  </div>
                  {item.note && <p className="text-xs text-muted-foreground mt-1">{item.note}</p>}
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-medium">{formatPrice(item.quantity * item.unitPrice)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng giá trị sản phẩm</span>
            <span className="font-medium">{formatPrice(totalItemValue)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-medium">Số tiền hoàn trả</span>
            <span className="text-lg text-primary font-medium">{formatPrice(returnReq.refundAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helpers ──
function SummaryCard({
  label, value, icon: Icon, highlight,
}: { label: string; value: string; icon: React.ElementType; highlight?: boolean }) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
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
