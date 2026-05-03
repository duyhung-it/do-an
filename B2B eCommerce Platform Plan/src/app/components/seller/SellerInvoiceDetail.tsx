// ============================================================
// Chi tiết hoá đơn — Seller
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  FileText, ArrowLeft, Clock, CheckCircle2, AlertTriangle,
  DollarSign, Building2, Printer, Download, Send, Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { invoiceSellerApi } from '../../services/api';
import { toast } from 'sonner';
import type { Invoice, InvoiceStatus } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const statusSteps: { key: InvoiceStatus; label: string; icon: React.ElementType }[] = [
  { key: 'Bản nháp', label: 'Bản nháp', icon: FileText },
  { key: 'Đã xuất', label: 'Đã xuất', icon: CheckCircle2 },
  { key: 'Đã gửi', label: 'Đã gửi', icon: Send },
  { key: 'Đã thanh toán', label: 'Thanh toán', icon: DollarSign },
];

function getStepIdx(status: InvoiceStatus): number {
  if (status === 'Quá hạn') return 2;
  if (status === 'Đã huỷ') return 0;
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function SellerInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await invoiceSellerApi.getById(id);
      setInvoice(data ?? null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSend = async () => {
    if (!invoice) return;
    try {
      await invoiceSellerApi.send(invoice.id);
      toast.success('Đã gửi hoá đơn cho khách hàng');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleCancel = async () => {
    if (!invoice || !confirm('Huỷ hoá đơn này?')) return;
    try {
      await invoiceSellerApi.cancel(invoice.id);
      toast.success('Đã huỷ hoá đơn');
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

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy hoá đơn</h2>
        <Button className="mt-4" onClick={() => navigate('/seller/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const isOverdue = invoice.status === 'Quá hạn';
  const isCancelled = invoice.status === 'Đã huỷ';
  const stepIdx = getStepIdx(invoice.status);
  const daysOverdue = isOverdue
    ? Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Hoá đơn', href: '/seller/invoices' },
        { label: invoice.invoiceNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/seller/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={FileText}
            variant={invoice.status === 'Đã thanh toán' ? 'success' : isOverdue ? 'danger' : 'primary'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{invoice.invoiceNumber}</h1>
              <StatusBadge status={invoice.status} />
              <Badge variant="outline">{invoice.type}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Đơn hàng: {invoice.orderNumber} · Khách: {invoice.buyerCompany}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Đang in hoá đơn...')}>
            <Printer className="h-4 w-4 mr-1" /> In
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Đang tải PDF...')}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
          {(invoice.status === 'Đã xuất' || invoice.status === 'Bản nháp') && (
            <Button size="sm" onClick={handleSend}>
              <Send className="h-4 w-4 mr-1" /> Gửi cho khách
            </Button>
          )}
          {invoice.status !== 'Đã thanh toán' && invoice.status !== 'Đã huỷ' && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              <Ban className="h-4 w-4 mr-1" /> Huỷ
            </Button>
          )}
        </div>
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Hoá đơn đã quá hạn {daysOverdue} ngày (hạn: {invoice.dueDate})
          </p>
        </div>
      )}

      {/* Progress Steps */}
      {!isCancelled && (
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
        <SummaryCard label="Tổng tiền" value={formatPrice(invoice.totalAmount)} icon={DollarSign} highlight />
        <SummaryCard label="Tiền hàng" value={formatPrice(invoice.subtotal)} icon={FileText} />
        <SummaryCard label="Thuế VAT" value={`${formatPrice(invoice.taxAmount)} (${invoice.taxRate}%)`} icon={FileText} />
        <SummaryCard label="Hạn thanh toán" value={invoice.dueDate} icon={Clock} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bên bán */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Bên bán
          </CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Công ty" value={invoice.supplierCompany} />
            <InfoRow label="Người liên hệ" value={invoice.supplierName} />
            <InfoRow label="Mã số thuế" value={invoice.supplierTaxCode} />
          </CardContent>
        </Card>

        {/* Bên mua */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Bên mua (Khách hàng)
          </CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Công ty" value={invoice.buyerCompany} />
            <InfoRow label="Người liên hệ" value={invoice.buyerName} />
            <InfoRow label="Mã số thuế" value={invoice.buyerTaxCode} />
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết hoá đơn ({invoice.items.length} dòng)</CardTitle>
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
                    <td className="py-3 pr-4 font-medium">{item.description}</td>
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
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-muted-foreground">Tiền hàng:</span>
              <span>{formatPrice(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <span className="text-muted-foreground">Thuế ({invoice.taxRate}%):</span>
              <span>{formatPrice(invoice.taxAmount)}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="font-medium">Tổng cộng:</span>
              <span className="text-lg text-primary font-medium">{formatPrice(invoice.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin bổ sung */}
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin bổ sung</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Ngày xuất" value={invoice.issuedDate} />
          <InfoRow label="Hạn thanh toán" value={invoice.dueDate} />
          {invoice.paidDate && <InfoRow label="Ngày thanh toán" value={invoice.paidDate} />}
          <InfoRow label="Ngày tạo" value={invoice.createdAt} />
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            </>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Đơn hàng liên kết</span>
            <Button variant="outline" size="sm" onClick={() => navigate(`/seller/orders/${invoice.orderId}`)}>
              {invoice.orderNumber}
            </Button>
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
      <span className="text-muted-foreground text-sm min-w-[140px]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
