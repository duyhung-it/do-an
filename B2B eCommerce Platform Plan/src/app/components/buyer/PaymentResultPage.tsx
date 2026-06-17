import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Home,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatusBadge } from '../shared/StatusBadge';
import { orderApi, paymentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { Order, Payment } from '../../types';

const formatPrice = (value?: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const isPaidStatus = (status?: string | null) => {
  const normalized = (status ?? '').toUpperCase();
  return normalized === 'PAID' || normalized === 'SUCCESS' || status === 'Đã thanh toán';
};

const isFailedStatus = (status?: string | null) => {
  const normalized = (status ?? '').toUpperCase();
  return ['FAILED', 'FAIL', 'CANCELLED', 'CANCELED', 'PAYMENT_FAILED'].includes(normalized);
};

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { clearCart } = useCart();
  const clearedCartRef = useRef(false);

  const paymentId = searchParams.get('paymentId') || '';
  const orderId = searchParams.get('orderId') || '';
  const requestId = searchParams.get('requestId') || '';
  const queryStatus = searchParams.get('status') || '';
  const provider = searchParams.get('provider') || 'VNPAY';

  const resolvedOrderId = order?.id || payment?.orderId || orderId;
  const resolvedPaymentId = payment?.id || paymentId;

  const state = useMemo(() => {
    if (payment) {
      if (isPaidStatus(payment.status) || payment.remainingAmount <= 0) return 'success';
      if (isFailedStatus(queryStatus)) return 'failed';
      return 'pending';
    }
    if (isPaidStatus(queryStatus)) return 'checking';
    if (isFailedStatus(queryStatus)) return 'failed';
    return 'pending';
  }, [payment, queryStatus]);

  const loadResult = async () => {
    setLoading(true);
    setError('');
    try {
      let fetchedPayment: Payment | null = null;
      let fetchedOrder: Order | null = null;

      if (paymentId) {
        fetchedPayment = await paymentApi.getById(paymentId, user);
        setPayment(fetchedPayment);
      }

      const targetOrderId = orderId || fetchedPayment?.orderId;
      if (targetOrderId) {
        fetchedOrder = await orderApi.getById(targetOrderId, user);
        setOrder(fetchedOrder);
      }

      if (!fetchedPayment && !fetchedOrder) {
        setError('Chưa lấy được trạng thái thanh toán mới nhất. Vui lòng thử tải lại hoặc kiểm tra trong danh sách đơn hàng.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lấy được kết quả thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, orderId, user?.id]);

  useEffect(() => {
    if (loading || state !== 'success' || clearedCartRef.current) return;
    clearedCartRef.current = true;
    clearCart().catch(() => undefined);
  }, [clearCart, loading, state]);

  const header = {
    success: {
      icon: CheckCircle2,
      title: 'Thanh toán thành công',
      description: 'Cảm ơn bạn. Đơn hàng đã được ghi nhận thanh toán thành công.',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    failed: {
      icon: AlertCircle,
      title: 'Thanh toán chưa thành công',
      description: 'Giao dịch chưa hoàn tất. Bạn có thể thử thanh toán lại hoặc chọn phương thức khác.',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    checking: {
      icon: RefreshCw,
      title: 'Đang xác nhận thanh toán',
      description: 'Hệ thống đang cập nhật kết quả giao dịch. Vui lòng chờ trong giây lát.',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    pending: {
      icon: Clock,
      title: 'Đang chờ xác nhận',
      description: 'Giao dịch đang được xử lý. Đơn hàng sẽ cập nhật khi có kết quả thanh toán.',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  }[state];

  const HeaderIcon = header.icon;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Kết quả thanh toán' },
      ]} />

      <Card className={`border ${header.className}`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                <HeaderIcon className={`h-6 w-6 ${state === 'checking' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold tracking-normal">{header.title}</h1>
                  <Badge variant="outline">{provider}</Badge>
                </div>
                <p className="mt-1 text-sm opacity-90">{header.description}</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadResult}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tải lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Mã thanh toán" value={resolvedPaymentId || 'Chưa có'} />
              <InfoRow label="Mã giao dịch" value={requestId || 'Đang cập nhật'} />
              <InfoRow label="Trạng thái thanh toán" value={payment ? <StatusBadge status={payment.status} /> : queryStatus || 'Chưa rõ'} />
              <InfoRow label="Phương thức" value={payment?.method || provider} />
              <InfoRow label="Số tiền" value={formatPrice(payment?.amount || order?.totalAmount)} />
              <InfoRow label="Đã thanh toán" value={formatPrice(payment?.paidAmount)} />
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Trạng thái thanh toán được cập nhật tự động từ hệ thống. Nếu vừa thanh toán xong nhưng thông tin chưa đổi, bạn hãy bấm tải lại sau vài giây.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Đơn hàng liên quan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Mã đơn" value={order?.orderNumber || payment?.orderNumber || resolvedOrderId || 'Chưa có'} />
            <InfoRow label="Trạng thái đơn" value={order ? <StatusBadge status={order.status} /> : 'Chưa tải'} />
            <InfoRow label="Thanh toán đơn" value={order ? <StatusBadge status={order.paymentStatus} /> : 'Chưa tải'} />
            <InfoRow label="Tổng tiền" value={formatPrice(order?.totalAmount || payment?.amount)} />

            <div className="flex flex-col gap-2 pt-2">
              {resolvedOrderId && (
                <Link to={`/orders/${resolvedOrderId}`}>
                  <Button className="w-full">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Xem đơn hàng
                  </Button>
                </Link>
              )}
              {resolvedPaymentId && (
                <Link to={`/payments/${resolvedPaymentId}`}>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Xem thanh toán
                  </Button>
                </Link>
              )}
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-medium">{value}</div>
    </div>
  );
}
