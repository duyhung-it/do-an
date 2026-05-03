// ============================================================
// Chi tiết phiếu Ghi nợ / Ghi có — Seller
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ReceiptText, ArrowLeft, CheckCircle2, Clock, XCircle,
  FileText, DollarSign, ArrowRightLeft, Building2,
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
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { debitCreditApi } from '../../services/debitCreditApi';
import { toast } from 'sonner';
import type { DebitCreditNote } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function SellerDebitCreditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<DebitCreditNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReconcile, setShowReconcile] = useState(false);
  const [reconcileNote, setReconcileNote] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await debitCreditApi.getById(id);
      setNote(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReconcile = async () => {
    if (!note) return;
    try {
      await debitCreditApi.reconcile(note.id, reconcileNote);
      toast.success('Đã đối soát thành công');
      setShowReconcile(false);
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

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <ReceiptText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy phiếu</h2>
        <Button className="mt-4" onClick={() => navigate('/seller/debit-credit')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const isDebit = note.type === 'Ghi nợ';
  const canReconcile = note.status === 'Chờ đối soát';

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Ghi nợ / Ghi có', href: '/seller/debit-credit' },
        { label: note.noteNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/seller/debit-credit')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={ReceiptText}
            variant={isDebit ? 'danger' : 'success'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{note.noteNumber}</h1>
              <Badge variant={isDebit ? 'destructive' : 'default'}>{note.type}</Badge>
              <StatusBadge status={note.status} />
            </div>
            <p className="text-muted-foreground mt-1">{note.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canReconcile && (
            <Button onClick={() => setShowReconcile(true)}>
              <ArrowRightLeft className="h-4 w-4 mr-1" /> Đối soát
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Tổng tiền"
          value={formatPrice(note.totalAmount)}
          icon={DollarSign}
          highlight
          color={isDebit ? 'text-red-600' : 'text-green-600'}
        />
        <SummaryCard label="Thuế" value={formatPrice(note.tax)} icon={FileText} />
        <SummaryCard label="Lý do" value={note.reason} icon={ReceiptText} />
        <SummaryCard label="Hoá đơn" value={note.invoiceNumber} icon={FileText} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin phiếu */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin phiếu</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã phiếu" value={note.noteNumber} />
            <InfoRow label="Loại" value={note.type} />
            <InfoRow label="Trạng thái" value={note.status} />
            <InfoRow label="Hoá đơn liên kết" value={note.invoiceNumber} />
            <InfoRow label="Lý do" value={note.reason} />
            <InfoRow label="Ngày tạo" value={formatDate(note.createdAt)} />
            {note.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mô tả chi tiết</p>
                  <p className="text-sm">{note.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Thông tin đối tác */}
        <Card>
          <CardHeader><CardTitle className="text-base">Đối tác</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Nhà cung cấp (Bạn)</p>
              <p className="font-medium">{note.sellerName}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-1">Người mua</p>
              <p className="font-medium">{note.buyerName}</p>
            </div>

            {/* Trạng thái đối soát */}
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Trạng thái đối soát</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {note.sellerConfirmedAt ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    NCC: {note.sellerConfirmedAt ? `Đã xác nhận (${formatDate(note.sellerConfirmedAt)})` : 'Chưa xác nhận'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {note.buyerConfirmedAt ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    Người mua: {note.buyerConfirmedAt ? `Đã xác nhận (${formatDate(note.buyerConfirmedAt)})` : 'Chưa xác nhận'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết khoản mục */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết khoản mục ({note.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Mô tả</th>
                  <th className="text-right py-2 pr-4">SL</th>
                  <th className="text-right py-2 pr-4">Đơn giá</th>
                  <th className="text-right py-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {note.items.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-4 font-medium">{item.description}</td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4 text-right">{formatPrice(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">{formatPrice(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={4} className="py-3 text-right text-muted-foreground">Cộng:</td>
                  <td className="py-3 text-right font-medium">{formatPrice(note.amount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-1 text-right text-muted-foreground">Thuế:</td>
                  <td className="py-1 text-right">{formatPrice(note.tax)}</td>
                </tr>
                <tr className="border-t">
                  <td colSpan={4} className="py-3 text-right font-medium">Tổng cộng:</td>
                  <td className={`py-3 text-right text-lg font-medium ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                    {isDebit ? '+' : '-'}{formatPrice(note.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog đối soát */}
      <ConfirmDialog
        open={showReconcile}
        onOpenChange={setShowReconcile}
        title={`Đối soát phiếu ${note.noteNumber}?`}
        description="Xác nhận cả hai bên đồng ý với nội dung phiếu ghi nợ/ghi có này."
        confirmLabel="Xác nhận đối soát"
        onConfirm={handleReconcile}
      >
        <div className="space-y-3 py-2">
          <div className="p-3 rounded-lg bg-muted/30 border">
            <p className="text-sm"><strong>{note.type}</strong>: {formatPrice(note.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">HĐ: {note.invoiceNumber} · {note.reason}</p>
          </div>
          <div>
            <Label>Ghi chú đối soát</Label>
            <Textarea
              value={reconcileNote}
              onChange={e => setReconcileNote(e.target.value)}
              placeholder="Ghi chú thêm (nếu có)..."
              rows={2}
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, highlight, color }: {
  label: string; value: string; icon: React.ElementType; highlight?: boolean; color?: string;
}) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-medium ${color ?? ''}`}>{value}</p>
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
