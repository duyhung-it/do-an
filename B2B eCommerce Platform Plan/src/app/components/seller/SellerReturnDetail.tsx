// ============================================================
// Chi tiết yêu cầu trả hàng — Seller
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  RotateCcw, ArrowLeft, Clock, CheckCircle2, XCircle,
  DollarSign, Package, AlertTriangle, Image as ImageIcon,
  MessageSquare, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { returnApi } from '../../services/api';
import { toast } from 'sonner';
import type { ReturnRequest, ReturnStatus } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const statusSteps: { key: ReturnStatus; label: string; icon: React.ElementType }[] = [
  { key: 'Chờ duyệt', label: 'Chờ duyệt', icon: Clock },
  { key: 'Đã duyệt', label: 'Đã duyệt', icon: CheckCircle2 },
  { key: 'Đang xử lý', label: 'Đang xử lý', icon: Package },
  { key: 'Đã hoàn tiền', label: 'Hoàn tiền', icon: DollarSign },
];

function getStepIdx(status: ReturnStatus): number {
  if (status === 'Từ chối') return 0;
  if (status === 'Đã đóng') return 3;
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function SellerReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerNote, setSellerNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await returnApi.getById(id);
      setRet(data ?? null);
      if (data?.sellerNote) setSellerNote(data.sellerNote);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async () => {
    if (!ret) return;
    try {
      await returnApi.approve(ret.id);
      toast.success('Đã duyệt yêu cầu trả hàng');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleReject = async () => {
    if (!ret || !confirm('Từ chối yêu cầu trả hàng này?')) return;
    try {
      await returnApi.reject(ret.id, sellerNote || 'Không đáp ứng điều kiện trả hàng');
      toast.success('Đã từ chối yêu cầu');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleProcessRefund = async () => {
    if (!ret) return;
    try {
      await returnApi.processRefund(ret.id);
      toast.success('Đã xử lý hoàn tiền');
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

  if (!ret) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <RotateCcw className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy yêu cầu trả hàng</h2>
        <Button className="mt-4" onClick={() => navigate('/seller/returns')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const isRejected = ret.status === 'Từ chối';
  const stepIdx = getStepIdx(ret.status);
  const totalQty = ret.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Trả hàng', href: '/seller/returns' },
        { label: `RET-${ret.id.slice(-6).toUpperCase()}` },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/seller/returns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={RotateCcw}
            variant={ret.status === 'Đã hoàn tiền' || ret.status === 'Đã đóng' ? 'success' : isRejected ? 'danger' : 'warning'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>Yêu cầu trả hàng</h1>
              <StatusBadge status={ret.status} />
              <Badge variant="outline">{ret.reason}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Đơn hàng: {ret.orderNumber} · Khách: {ret.buyerName} ({ret.buyerCompany})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/seller/orders/${ret.orderId}`)}>
            <FileText className="h-4 w-4 mr-1" /> Xem đơn hàng
          </Button>
          {ret.status === 'Chờ duyệt' && (
            <>
              <Button variant="destructive" size="sm" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-1" /> Từ chối
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Duyệt
              </Button>
            </>
          )}
          {ret.status === 'Đã duyệt' && (
            <Button onClick={handleProcessRefund}>
              <DollarSign className="h-4 w-4 mr-1" /> Hoàn tiền
            </Button>
          )}
        </div>
      </div>

      {/* Rejected warning */}
      {isRejected && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Yêu cầu đã bị từ chối. {ret.sellerNote && `Lý do: ${ret.sellerNote}`}
          </p>
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
                        active ? current ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs text-center max-w-[80px] leading-tight ${
                        active ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}>{step.label}</span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-1.5rem] rounded-full ${i < stepIdx ? 'bg-primary' : 'bg-muted'}`} />
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
        <SummaryCard label="Hoàn tiền" value={formatPrice(ret.refundAmount)} icon={DollarSign} highlight />
        <SummaryCard label="Sản phẩm trả" value={`${totalQty} SP`} icon={Package} />
        <SummaryCard label="Phương thức" value={ret.refundMethod} icon={DollarSign} />
        <SummaryCard label="Ngày yêu cầu" value={ret.createdAt} icon={Clock} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin khách hàng */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin khách hàng</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Người mua" value={ret.buyerName} />
            <InfoRow label="Công ty" value={ret.buyerCompany} />
            <InfoRow label="Đơn hàng" value={ret.orderNumber} />
            <InfoRow label="Lý do" value={ret.reason} />
            <InfoRow label="Ngày tạo" value={ret.createdAt} />
            {ret.resolvedAt && <InfoRow label="Ngày xử lý" value={ret.resolvedAt} />}
          </CardContent>
        </Card>

        {/* Mô tả & Ghi chú */}
        <Card>
          <CardHeader><CardTitle className="text-base">Mô tả & Ghi chú</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mô tả từ khách hàng</p>
              <p className="text-sm">{ret.description || 'Không có mô tả'}</p>
            </div>
            {ret.adminNote && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú Admin</p>
                  <p className="text-sm bg-blue-50/50 dark:bg-blue-950/10 p-2 rounded-lg">{ret.adminNote}</p>
                </div>
              </>
            )}
            {ret.sellerNote && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú của bạn</p>
                  <p className="text-sm bg-muted/30 p-2 rounded-lg">{ret.sellerNote}</p>
                </div>
              </>
            )}
            {!showNoteForm && ret.status === 'Chờ duyệt' && (
              <Button variant="outline" size="sm" onClick={() => setShowNoteForm(true)}>
                <MessageSquare className="h-4 w-4 mr-1" /> Thêm ghi chú
              </Button>
            )}
            {showNoteForm && (
              <div className="space-y-2">
                <Label>Ghi chú phản hồi</Label>
                <Textarea value={sellerNote} onChange={e => setSellerNote(e.target.value)} rows={3} placeholder="Nhập ghi chú..." />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hình ảnh */}
      {ret.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Hình ảnh đính kèm ({ret.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {ret.images.map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted flex items-center justify-center border">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danh sách sản phẩm trả */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sản phẩm trả ({ret.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ret.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-muted/20 border">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.productName}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>SL: {item.quantity}</span>
                    <span>Đơn giá: {formatPrice(item.unitPrice)}</span>
                    <Badge variant="outline" className="text-xs">{item.reason}</Badge>
                  </div>
                  {item.note && <p className="text-xs text-muted-foreground mt-1">{item.note}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-primary">{formatPrice(item.quantity * item.unitPrice)}</p>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="flex items-center gap-8">
              <span className="font-medium">Tổng hoàn tiền:</span>
              <span className="text-lg text-primary font-medium">{formatPrice(ret.refundAmount)}</span>
            </div>
          </div>
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
