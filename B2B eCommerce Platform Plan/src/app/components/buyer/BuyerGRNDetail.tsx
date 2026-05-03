// ============================================================
// Chi tiết Biên bản nhận hàng (GRN) — Buyer
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Package, ArrowLeft, CheckCircle2, AlertTriangle, FileText,
  ClipboardCheck, Star, Image as ImageIcon, Clock, Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { grnApi } from '../../services/grnApi';
import { toast } from 'sonner';
import type { GoodsReceivedNote, GRNStatus } from '../../types';

const stepList: { key: GRNStatus; label: string; icon: React.ElementType }[] = [
  { key: 'Chờ xác nhận', label: 'Chờ xác nhận', icon: Clock },
  { key: 'Đã xác nhận', label: 'Đã xác nhận', icon: CheckCircle2 },
];

function getStepIdx(status: GRNStatus): number {
  if (status === 'Có vấn đề') return 0;
  if (status === 'Đã đóng') return 1;
  const idx = stepList.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function BuyerGRNDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grn, setGRN] = useState<GoodsReceivedNote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await grnApi.getById(id);
      setGRN(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirm = async () => {
    if (!grn) return;
    try {
      await grnApi.confirm(grn.id);
      toast.success('Đã xác nhận nhận hàng');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleReport = async () => {
    if (!grn) return;
    try {
      await grnApi.reportIssue(grn.id, 'Có vấn đề cần kiểm tra lại');
      toast.success('Đã báo cáo vấn đề');
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

  if (!grn) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy biên bản nhận hàng</h2>
        <Button className="mt-4" onClick={() => navigate('/grn')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const hasIssues = grn.status === 'Có vấn đề';
  const totalOrdered = grn.items.reduce((s, i) => s + i.orderedQty, 0);
  const totalReceived = grn.items.reduce((s, i) => s + i.receivedQty, 0);
  const totalAccepted = grn.items.reduce((s, i) => s + i.acceptedQty, 0);
  const totalDefect = grn.items.reduce((s, i) => s + i.defectQty, 0);
  const stepIdx = getStepIdx(grn.status);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Nhận hàng', href: '/grn' },
        { label: grn.grnNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/grn')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={ClipboardCheck}
            variant={grn.status === 'Đã xác nhận' || grn.status === 'Đã đóng' ? 'success' : hasIssues ? 'danger' : 'warning'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{grn.grnNumber}</h1>
              <StatusBadge status={grn.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              Đơn hàng: {grn.orderNumber} · NCC: {grn.supplierName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/orders/${grn.orderId}`)}>
            <FileText className="h-4 w-4 mr-1" /> Xem đơn hàng
          </Button>
          {grn.status === 'Chờ xác nhận' && (
            <>
              <Button variant="destructive" size="sm" onClick={handleReport}>
                <AlertTriangle className="h-4 w-4 mr-1" /> Báo vấn đề
              </Button>
              <Button onClick={handleConfirm}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Xác nhận OK
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Issue warning */}
      {hasIssues && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Biên bản nhận hàng này có vấn đề cần xử lý. {grn.linkedReturnId && 'Đã tạo yêu cầu trả hàng liên kết.'}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Đặt hàng" value={`${totalOrdered} SP`} icon={Truck} />
        <SummaryCard label="Đã nhận" value={`${totalReceived} SP`} icon={Package} />
        <SummaryCard label="Chấp nhận" value={`${totalAccepted} SP`} icon={CheckCircle2} highlight />
        <SummaryCard label="Lỗi/Thiếu" value={`${totalDefect} SP`} icon={AlertTriangle} danger={totalDefect > 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin chung */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin biên bản</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã GRN" value={grn.grnNumber} />
            <InfoRow label="Đơn hàng" value={grn.orderNumber} />
            <InfoRow label="Nhà cung cấp" value={grn.supplierName} />
            <InfoRow label="Ngày nhận" value={grn.receivedAt} />
            {grn.confirmedAt && <InfoRow label="Ngày xác nhận" value={grn.confirmedAt} />}
            <InfoRow label="Ngày tạo" value={grn.createdAt} />
            <Separator />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground min-w-[120px]">Chất lượng</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < grn.qualityScore ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                ))}
                <span className="text-sm ml-1">{grn.qualityScore}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ghi chú & Hình ảnh */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ghi chú & Hình ảnh</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ghi chú tổng quan</p>
              <p className="text-sm">{grn.overallNote || 'Không có ghi chú'}</p>
            </div>
            {grn.imageUrls.length > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <ImageIcon className="h-4 w-4 inline mr-1" /> Hình ảnh ({grn.imageUrls.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {grn.imageUrls.map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center border">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không có hình ảnh</p>
            )}
            {grn.linkedReturnId && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Yêu cầu trả hàng</span>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/returns/${grn.linkedReturnId}`)}>
                    Xem trả hàng
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết sản phẩm ({grn.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Sản phẩm</th>
                  <th className="text-right py-2 pr-4">Đặt</th>
                  <th className="text-right py-2 pr-4">Nhận</th>
                  <th className="text-right py-2 pr-4">OK</th>
                  <th className="text-right py-2 pr-4">Lỗi</th>
                  <th className="text-left py-2">Lý do lỗi</th>
                </tr>
              </thead>
              <tbody>
                {grn.items.map((item, idx) => (
                  <tr key={idx} className={`border-b last:border-0 ${item.defectQty > 0 ? 'bg-red-50/30 dark:bg-red-950/5' : ''}`}>
                    <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </td>
                    <td className="py-3 pr-4 text-right">{item.orderedQty}</td>
                    <td className="py-3 pr-4 text-right">{item.receivedQty}</td>
                    <td className="py-3 pr-4 text-right text-green-600">{item.acceptedQty}</td>
                    <td className="py-3 pr-4 text-right">
                      {item.defectQty > 0 ? (
                        <span className="text-red-600 font-medium">{item.defectQty}</span>
                      ) : '0'}
                    </td>
                    <td className="py-3">
                      {item.defectReason && <Badge variant="outline" className="text-xs">{item.defectReason}</Badge>}
                      {item.defectNote && <p className="text-xs text-muted-foreground mt-0.5">{item.defectNote}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, highlight, danger }: {
  label: string; value: string; icon: React.ElementType; highlight?: boolean; danger?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : danger ? 'border-red-300 bg-red-50/30 dark:bg-red-950/10' : ''}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-primary text-primary-foreground'
          : danger ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
          : 'bg-muted text-muted-foreground'
        }`}><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-medium ${highlight ? 'text-primary' : danger ? 'text-red-600' : ''}`}>{value}</p>
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
