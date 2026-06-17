// ============================================================
// Chi tiết thanh toán — Buyer
// Timeline, QR, lịch sử giao dịch, xác nhận CK
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  CreditCard, ArrowLeft, CheckCircle2, Clock, DollarSign,
  FileText, Building2, Calendar, Upload, QrCode,
  AlertTriangle, Shield, Truck, Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { paymentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { Payment } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const getPaymentStoreName = (payment: Pick<Payment, 'supplierName'>) => payment.supplierName || 'CELLPHONES';

const today = new Date().toISOString().slice(0, 10);

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date(today).getTime();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function BuyerPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadNote, setUploadNote] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await paymentApi.getById(id, user);
      setPayment(p ?? null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUploadProof = async () => {
    if (!payment) return;
    if (!uploadUrl.trim()) { toast.error('Vui lòng nhập URL chứng từ'); return; }
    try {
      await paymentApi.recordTransaction(payment.id, {
        paymentId: payment.id,
        amount: 0,
        method: 'Chuyển khoản',
        transactionRef: `PROOF-${Date.now()}`,
        note: `Chứng từ CK: ${uploadUrl}${uploadNote ? ` — ${uploadNote}` : ''}`,
        paidAt: today,
      });
      toast.success('Đã gửi xác nhận chuyển khoản');
      setShowUpload(false);
      setUploadUrl('');
      setUploadNote('');
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

  if (!payment) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy thanh toán</h2>
        <p className="text-muted-foreground mt-2">Khoản thanh toán này không tồn tại hoặc đã bị xoá</p>
        <Button className="mt-4" onClick={() => navigate('/payments')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const paidPct = payment.amount > 0 ? Math.round((payment.paidAmount / payment.amount) * 100) : 0;
  const daysLeft = getDaysUntilDue(payment.dueDate);
  const isOverdue = daysLeft < 0 && payment.remainingAmount > 0;
  const isNearDue = daysLeft >= 0 && daysLeft <= 7 && payment.remainingAmount > 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Thanh toán', href: '/payments' },
        { label: payment.invoiceNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper
            icon={CreditCard}
            variant={payment.status === 'Đã thanh toán' ? 'success' : payment.status === 'Quá hạn' ? 'danger' : 'primary'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{payment.invoiceNumber}</h1>
              <StatusBadge status={payment.status} />
              <Badge variant="outline">{payment.method}</Badge>
              {isOverdue && <Badge variant="destructive">Quá hạn {Math.abs(daysLeft)} ngày</Badge>}
              {isNearDue && <Badge variant="outline" className="border-amber-500 text-amber-600">{daysLeft} ngày</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">Đơn hàng: {payment.orderNumber} · Cửa hàng: {getPaymentStoreName(payment)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {payment.remainingAmount > 0 && (
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4 mr-1" /> Xác nhận CK
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/orders/${payment.orderId}`)}>
            <FileText className="h-4 w-4 mr-1" /> Xem đơn hàng
          </Button>
        </div>
      </div>

      {/* Warning banners */}
      {isOverdue && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <Ban className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Khoản thanh toán này đã quá hạn <strong>{Math.abs(daysLeft)} ngày</strong>. Vui lòng thanh toán ngay.
          </p>
        </div>
      )}
      {isNearDue && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Khoản thanh toán sẽ đến hạn trong <strong>{daysLeft} ngày</strong>.
          </p>
        </div>
      )}

      {/* Payment Timeline */}
      <Card>
        <CardContent className="p-4">
          <PaymentTimeline payment={payment} />
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Tổng tiền" value={formatPrice(payment.amount)} color="text-foreground" bg="bg-muted/30" />
        <SummaryCard label="Đã thanh toán" value={formatPrice(payment.paidAmount)} color="text-emerald-600" bg="bg-emerald-50/50 dark:bg-emerald-950/10" />
        <SummaryCard label="Còn lại" value={formatPrice(payment.remainingAmount)} color="text-red-600" bg="bg-red-50/50 dark:bg-red-950/10" />
        <SummaryCard label="Hạn thanh toán" value={payment.dueDate} color={isOverdue ? 'text-red-600' : 'text-foreground'} bg="bg-muted/30" />
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tiến trình thanh toán</span>
            <span className="text-sm font-medium">{paidPct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                paidPct >= 100 ? 'bg-emerald-500' : paidPct > 0 ? 'bg-blue-500' : 'bg-muted-foreground/20'
              }`}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin thanh toán */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={FileText} label="Mã hoá đơn" value={payment.invoiceNumber} />
            <InfoRow icon={FileText} label="Đơn hàng" value={payment.orderNumber} />
            <InfoRow icon={Building2} label="Cửa hàng" value={getPaymentStoreName(payment)} />
            <InfoRow icon={Shield} label="Phương thức" value={payment.method} />
            <Separator />
            <InfoRow icon={Calendar} label="Ngày tạo" value={payment.createdAt} />
            <InfoRow icon={Clock} label="Hạn thanh toán" value={payment.dueDate} />
          </CardContent>
        </Card>

        {/* QR + Bank info */}
        {payment.remainingAmount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4" /> Thanh toán qua QR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {/* QR mock */}
                <div className="h-40 w-40 rounded-xl bg-muted/30 border p-3 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-20 w-20 text-muted-foreground mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground">Quét QR để thanh toán</p>
                  </div>
                </div>
                {/* Bank info */}
                <div className="w-full space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Ngân hàng</p>
                      <p>Vietcombank</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Số tài khoản</p>
                      <p className="font-mono">0071 001 234 567</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Chủ tài khoản</p>
                      <p>{getPaymentStoreName(payment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Số tiền</p>
                      <p className="text-primary font-medium">{formatPrice(payment.remainingAmount)}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground">Nội dung CK</p>
                    <p className="text-xs font-mono">{payment.invoiceNumber} - {payment.orderNumber}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lịch sử giao dịch */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Lịch sử giao dịch ({payment.transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payment.transactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Chưa có giao dịch nào</p>
          ) : (
            <div className="relative pl-8 space-y-0">
              {[...payment.transactions].reverse().map((txn, idx) => (
                <div key={txn.id} className="relative pb-6 last:pb-0">
                  <div className={`absolute -left-8 top-0.5 w-4 h-4 rounded-full border-2 ${
                    idx === 0
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-background border-muted-foreground/30'
                  }`} />
                  {idx < payment.transactions.length - 1 && (
                    <div className="absolute -left-6 top-4 w-0.5 h-[calc(100%-0.5rem)] bg-border" />
                  )}
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-emerald-600 font-medium">
                        {txn.amount > 0 ? formatPrice(txn.amount) : 'Xác nhận CK'}
                      </span>
                      <span className="text-muted-foreground text-sm">{txn.paidAt}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {txn.method}{txn.bankName ? ` · ${txn.bankName}` : ''} · {txn.transactionRef}
                    </p>
                    {txn.note && <p className="text-muted-foreground text-xs mt-1">{txn.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload proof dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển khoản</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">Hoá đơn</p>
              <p className="font-medium">{payment.invoiceNumber} · {payment.orderNumber}</p>
              <p className="text-muted-foreground text-sm">
                Còn lại: <span className="text-red-600">{formatPrice(payment.remainingAmount)}</span>
              </p>
            </div>
            <div>
              <Label>URL chứng từ chuyển khoản *</Label>
              <Input
                value={uploadUrl}
                onChange={e => setUploadUrl(e.target.value)}
                placeholder="https://link-anh-chung-tu.png"
              />
              <p className="text-xs text-muted-foreground mt-1">Dán link ảnh chụp chứng từ CK từ ngân hàng</p>
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={uploadNote}
                onChange={e => setUploadNote(e.target.value)}
                placeholder="VD: Đã CK qua Vietcombank, mã GD: 123456..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>Huỷ</Button>
            <Button onClick={handleUploadProof}>
              <Upload className="h-4 w-4 mr-1" /> Gửi xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ──
function PaymentTimeline({ payment }: { payment: Payment }) {
  const steps = [
    { label: 'Tạo hoá đơn', icon: FileText, done: true, date: payment.createdAt },
    { label: 'Gửi yêu cầu', icon: Truck, done: true, date: payment.createdAt },
    {
      label: 'Nhận thanh toán', icon: DollarSign, done: payment.paidAmount > 0,
      date: payment.transactions.length > 0 ? payment.transactions[payment.transactions.length - 1].paidAt : '',
    },
    {
      label: 'Hoàn tất', icon: CheckCircle2, done: payment.status === 'Đã thanh toán',
      date: payment.status === 'Đã thanh toán' && payment.transactions.length > 0
        ? payment.transactions[payment.transactions.length - 1].paidAt : '',
    },
  ];

  return (
    <div className="flex items-center gap-1 py-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                s.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-center max-w-[70px] leading-tight">{s.label}</span>
              {s.date && <span className="text-[9px] text-muted-foreground">{s.date}</span>}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-2rem] rounded-full ${s.done ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className={`p-4 text-center ${bg} rounded-xl`}>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-lg font-medium ${color}`}>{value}</p>
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
