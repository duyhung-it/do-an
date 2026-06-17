// ============================================================
// Chi tiết hoá đơn — Buyer
// Thông tin hoá đơn, danh sách sản phẩm, thuế, tổng cộng
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  FileText, ArrowLeft, Building2, Calendar, Hash, DollarSign,
  CheckCircle2, Clock, AlertTriangle, Printer, Download,
  CreditCard, Receipt,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { invoiceBuyerApi } from '../../services/api';
import { toast } from 'sonner';
import type { Invoice } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const getInvoiceStoreCompany = (invoice: Pick<Invoice, 'supplierCompany'>) => invoice.supplierCompany || 'CELLPHONES';
const getInvoiceBuyerName = (invoice: Pick<Invoice, 'buyerCompany'>) => invoice.buyerCompany || 'Khách hàng';

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function BuyerInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const inv = await invoiceBuyerApi.getById(id);
      setInvoice(inv ?? null);
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

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy hoá đơn</h2>
        <p className="text-muted-foreground mt-2">Hoá đơn này không tồn tại hoặc đã bị xoá</p>
        <Button className="mt-4" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const daysLeft = getDaysUntilDue(invoice.dueDate);
  const isOverdue = invoice.status === 'Quá hạn' || (daysLeft < 0 && !['Đã thanh toán', 'Đã huỷ'].includes(invoice.status));
  const isNearDue = daysLeft >= 0 && daysLeft <= 7 && !['Đã thanh toán', 'Đã huỷ'].includes(invoice.status);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Hoá đơn', href: '/invoices' },
        { label: invoice.invoiceNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={Receipt}
            variant={invoice.status === 'Đã thanh toán' ? 'success' : isOverdue ? 'danger' : 'primary'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{invoice.invoiceNumber}</h1>
              <StatusBadge status={invoice.status} />
              <Badge variant="outline">{invoice.type}</Badge>
              {isOverdue && <Badge variant="destructive">Quá hạn {Math.abs(daysLeft)} ngày</Badge>}
              {isNearDue && <Badge variant="outline" className="border-amber-500 text-amber-600">{daysLeft} ngày</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">Đơn hàng: {invoice.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            toast.success('Đang in hoá đơn...');
            window.print();
          }}>
            <Printer className="h-4 w-4 mr-1" /> In
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Đã tải hoá đơn PDF')}>
            <Download className="h-4 w-4 mr-1" /> Tải PDF
          </Button>
          <Button variant="outline" onClick={() => navigate(`/orders/${invoice.orderId}`)}>
            <FileText className="h-4 w-4 mr-1" /> Xem đơn hàng
          </Button>
        </div>
      </div>

      {/* Warning banner */}
      {isOverdue && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Hoá đơn này đã quá hạn <strong>{Math.abs(daysLeft)} ngày</strong>. Vui lòng thanh toán ngay để tránh phí trễ hạn.
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <SummaryCard label="Tạm tính" value={formatPrice(invoice.subtotal)} icon={DollarSign} />
        <SummaryCard label="Khuyến mãi" value={`-${formatPrice(invoice.discountAmount ?? 0)}`} icon={Receipt} />
        <SummaryCard label={`Thuế (${invoice.taxRate}%)`} value={formatPrice(invoice.taxAmount)} icon={Receipt} />
        <SummaryCard
          label="Tổng cộng"
          value={formatPrice(invoice.totalAmount)}
          icon={CreditCard}
          highlight
        />
        <SummaryCard
          label="Hạn thanh toán"
          value={invoice.dueDate}
          icon={Calendar}
          danger={isOverdue}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bên bán */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Bên bán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Building2} label="Cửa hàng" value={getInvoiceStoreCompany(invoice)} />
            <InfoRow icon={Hash} label="Mã số thuế" value={invoice.supplierTaxCode} />
          </CardContent>
        </Card>

        {/* Bên mua */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Bên mua
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Building2} label="Khách hàng" value={getInvoiceBuyerName(invoice)} />
            <InfoRow icon={Hash} label="Mã số thuế" value={invoice.buyerTaxCode} />
          </CardContent>
        </Card>
      </div>

      {/* Thông tin hoá đơn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Thông tin hoá đơn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoRow icon={Hash} label="Số hoá đơn" value={invoice.invoiceNumber} />
            <InfoRow icon={FileText} label="Loại" value={invoice.type} />
            <InfoRow icon={Calendar} label="Ngày phát hành" value={invoice.issuedDate} />
            <InfoRow icon={Clock} label="Hạn thanh toán" value={invoice.dueDate} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={invoice.createdAt} />
            {invoice.paidDate && (
              <InfoRow icon={CheckCircle2} label="Ngày thanh toán" value={invoice.paidDate} />
            )}
          </div>
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết sản phẩm ({invoice.items.length})</CardTitle>
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
                  <th className="text-right py-2 pr-4">Thuế</th>
                  <th className="text-right py-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-4">{item.description}</td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4 text-right">{formatPrice(item.unitPrice)}</td>
                    <td className="py-3 pr-4 text-right">{item.taxRate}%</td>
                    <td className="py-3 text-right font-medium">{formatPrice(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span>{formatPrice(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <span className="text-muted-foreground">Thuế ({invoice.taxRate}%):</span>
              <span>{formatPrice(invoice.taxAmount)}</span>
            </div>
            {(invoice.discountAmount ?? 0) > 0 && (
              <div className="flex items-center gap-8 text-sm text-emerald-600">
                <span>Khuyến mãi:</span>
                <span>-{formatPrice(invoice.discountAmount ?? 0)}</span>
              </div>
            )}
            <Separator className="w-48" />
            <div className="flex items-center gap-8">
              <span className="font-medium">Tổng cộng:</span>
              <span className="text-lg text-primary font-medium">{formatPrice(invoice.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!['Đã thanh toán', 'Đã huỷ'].includes(invoice.status) && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Thanh toán hoá đơn này</p>
              <p className="text-muted-foreground text-sm">
                Số tiền cần thanh toán: <span className="text-primary font-medium">{formatPrice(invoice.totalAmount)}</span>
              </p>
            </div>
            <Button onClick={() => navigate(`/payments`)}>
              <CreditCard className="h-4 w-4 mr-1" /> Đi đến thanh toán
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Helpers ──
function SummaryCard({
  label, value, icon: Icon, highlight, danger,
}: { label: string; value: string; icon: React.ElementType; highlight?: boolean; danger?: boolean }) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : danger ? 'border-red-300 bg-red-50/30 dark:bg-red-950/10' : ''}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-primary text-primary-foreground'
          : danger ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
          : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-medium ${highlight ? 'text-primary' : danger ? 'text-red-600' : ''}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon: IconComp, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconComp className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-sm min-w-[120px]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
