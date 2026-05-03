// ============================================================
// Chi tiết Yêu cầu mua hàng — Buyer
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ClipboardList, ArrowLeft, Clock, CheckCircle2, XCircle, FileText,
  Send, ShoppingCart, DollarSign, Building2, AlertTriangle, User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { prApi } from '../../services/prApi';
import { toast } from 'sonner';
import type { PurchaseRequisition, PRStatus } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const priorityColors: Record<string, string> = {
  'Thấp': 'bg-gray-100 text-gray-700',
  'Trung bình': 'bg-blue-100 text-blue-700',
  'Cao': 'bg-orange-100 text-orange-700',
  'Khẩn cấp': 'bg-red-100 text-red-700',
};

const statusSteps: { key: PRStatus; label: string; icon: React.ElementType }[] = [
  { key: 'Bản nháp', label: 'Bản nháp', icon: FileText },
  { key: 'Chờ duyệt', label: 'Chờ duyệt', icon: Clock },
  { key: 'Đã duyệt', label: 'Đã duyệt', icon: CheckCircle2 },
  { key: 'Đã tạo đơn', label: 'Tạo đơn', icon: ShoppingCart },
];

function getStepIdx(status: PRStatus): number {
  if (status === 'Từ chối' || status === 'Đóng') return 2;
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function BuyerPRDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pr, setPR] = useState<PurchaseRequisition | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await prApi.getById(id);
      setPR(data);
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

  if (!pr) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy yêu cầu mua hàng</h2>
        <Button className="mt-4" onClick={() => navigate('/pr')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const isRejected = pr.status === 'Từ chối';
  const stepIdx = getStepIdx(pr.status);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Yêu cầu mua hàng', href: '/pr' },
        { label: pr.prNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/pr')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={ClipboardList}
            variant={pr.status === 'Đã duyệt' || pr.status === 'Đã tạo đơn' ? 'success' : isRejected ? 'danger' : 'primary'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{pr.prNumber}</h1>
              <StatusBadge status={pr.status} />
              <Badge className={priorityColors[pr.priority]}>{pr.priority}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Phòng ban: {pr.department} · Người yêu cầu: {pr.requesterName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pr.linkedOrderId && (
            <Button variant="outline" onClick={() => navigate(`/orders/${pr.linkedOrderId}`)}>
              <ShoppingCart className="h-4 w-4 mr-1" /> Xem đơn hàng
            </Button>
          )}
          {pr.linkedRFQId && (
            <Button variant="outline" onClick={() => navigate(`/rfq/${pr.linkedRFQId}`)}>
              <FileText className="h-4 w-4 mr-1" /> Xem RFQ
            </Button>
          )}
        </div>
      </div>

      {/* Rejection */}
      {isRejected && pr.rejectionNote && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">Yêu cầu bị từ chối</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{pr.rejectionNote}</p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {!isRejected && pr.status !== 'Đóng' && (
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
        <SummaryCard label="Tổng dự toán" value={formatPrice(pr.totalEstimate)} icon={DollarSign} highlight />
        <SummaryCard label="Số sản phẩm" value={`${pr.items.length} mục`} icon={ClipboardList} />
        <SummaryCard label="Ngày tạo" value={pr.createdAt} icon={Clock} />
        <SummaryCard label="Người duyệt" value={pr.approverName ?? 'Chưa có'} icon={User} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin chung */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin yêu cầu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã PR" value={pr.prNumber} />
            <InfoRow label="Phòng ban" value={pr.department} />
            <InfoRow label="Người yêu cầu" value={pr.requesterName} />
            <InfoRow label="Độ ưu tiên" value={pr.priority} />
            <InfoRow label="Ngày tạo" value={pr.createdAt} />
            <InfoRow label="Cập nhật" value={pr.updatedAt} />
            {pr.approverName && <InfoRow label="Người duyệt" value={pr.approverName} />}
            {pr.approvedAt && <InfoRow label="Ngày duyệt" value={pr.approvedAt} />}
          </CardContent>
        </Card>

        {/* Lý do */}
        <Card>
          <CardHeader><CardTitle className="text-base">Lý do & Ghi chú</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lý do mua hàng</p>
              <p className="text-sm">{pr.justification || 'Không có lý do'}</p>
            </div>
            {pr.rejectionNote && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lý do từ chối</p>
                  <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-200/50">
                    <p className="text-sm">{pr.rejectionNote}</p>
                  </div>
                </div>
              </>
            )}
            {pr.linkedOrderId && (
              <>
                <Separator />
                <InfoRow label="Đơn hàng liên kết" value={pr.linkedOrderId} />
              </>
            )}
            {pr.linkedRFQId && (
              <InfoRow label="RFQ liên kết" value={pr.linkedRFQId} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách sản phẩm ({pr.items.length})</CardTitle>
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
                  <th className="text-right py-2 pr-4">Giá ước tính</th>
                  <th className="text-right py-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {pr.items.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{item.productName}</p>
                      {item.specification && <p className="text-xs text-muted-foreground">{item.specification}</p>}
                      {item.note && <p className="text-xs text-muted-foreground mt-0.5">Ghi chú: {item.note}</p>}
                    </td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4">{item.unit}</td>
                    <td className="py-3 pr-4 text-right">{formatPrice(item.estimatedPrice)}</td>
                    <td className="py-3 text-right font-medium">{formatPrice(item.quantity * item.estimatedPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="flex items-center gap-8">
              <span className="font-medium">Tổng dự toán:</span>
              <span className="text-lg text-primary font-medium">{formatPrice(pr.totalEstimate)}</span>
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
