// ============================================================
// Chi tiết yêu cầu báo giá — Buyer (xem + so sánh báo giá)
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, FileText, Building2, CalendarDays, Truck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { rfqApi, quotationApi } from '../../services/api';
import type { RFQ, Quotation } from '../../types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function BuyerRFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionQuot, setActionQuot] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      rfqApi.getById(id),
      quotationApi.getByRFQ(id),
    ]).then(([rfqData, quots]) => {
      setRfq(rfqData ?? null);
      setQuotations(quots);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleQuotationAction = async () => {
    if (!actionQuot) return;
    try {
      if (actionQuot.action === 'accept') {
        await quotationApi.accept(actionQuot.id);
        toast.success('Đã chấp nhận báo giá');
      } else {
        await quotationApi.reject(actionQuot.id);
        toast.success('Đã từ chối báo giá');
      }
      // Reload
      if (id) {
        const [rfqData, quots] = await Promise.all([
          rfqApi.getById(id),
          quotationApi.getByRFQ(id),
        ]);
        setRfq(rfqData ?? null);
        setQuotations(quots);
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    }
    setActionQuot(null);
  };

  if (loading) return <DetailSkeleton />;
  if (!rfq) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Không tìm thấy yêu cầu báo giá</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/rfq')}>Quay lại</Button>
    </div>
  );

  const hasQuotations = quotations.length > 0;
  const pendingQuotations = quotations.filter(q => q.status === 'Chờ phản hồi');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Yêu cầu báo giá', href: '/rfq' },
        { label: rfq.rfqNumber },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/rfq')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>{rfq.rfqNumber}</h1>
            <StatusBadge status={rfq.status} />
          </div>
          <p className="text-muted-foreground">Tạo ngày {rfq.createdAt}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin NCC */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Nhà cung cấp</CardTitle></CardHeader>
            <CardContent>
              {rfq.supplierName ? (
                <div className="space-y-1">
                  <p className="font-medium">{rfq.supplierName}</p>
                  <p className="text-muted-foreground">Mã NCC: {rfq.supplierId}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa chọn nhà cung cấp cụ thể</p>
              )}
            </CardContent>
          </Card>

          {/* Danh sách sản phẩm yêu cầu */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Sản phẩm yêu cầu ({rfq.items.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className="text-right">Giá mục tiêu</TableHead>
                      <TableHead>Quy cách</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfq.items.map((item, idx) => (
                      <TableRow key={item.id ?? idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          {item.targetPrice ? formatPrice(item.targetPrice) : '—'}
                        </TableCell>
                        <TableCell>{item.specifications ?? '—'}</TableCell>
                        <TableCell>{item.notes ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Báo giá nhận được */}
          {hasQuotations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Báo giá nhận được ({quotations.length})
                  {pendingQuotations.length > 0 && (
                    <Badge variant="secondary">{pendingQuotations.length} chờ phản hồi</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotations.map(q => (
                  <div key={q.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{q.supplierName}</p>
                        <p className="text-muted-foreground">Gửi ngày {q.createdAt} · Hiệu lực đến {q.validUntil}</p>
                      </div>
                      <StatusBadge status={q.status} />
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead className="text-right">SL</TableHead>
                            <TableHead className="text-right">Đơn giá</TableHead>
                            <TableHead className="text-right">Thành tiền</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {q.items.map((item, idx) => (
                            <TableRow key={item.id ?? idx}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                              <TableCell className="text-right font-medium">{formatPrice(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Tổng cộng</TableCell>
                            <TableCell className="text-right font-medium">{formatPrice(q.totalAmount)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground">Thanh toán:</span>{' '}
                        <span>{q.paymentTerms}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Giao hàng:</span>{' '}
                        <span>{q.deliveryDays} ngày</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hiệu lực:</span>{' '}
                        <span>{q.validUntil}</span>
                      </div>
                    </div>

                    {q.notes && (
                      <p className="text-muted-foreground bg-muted p-3 rounded-md">{q.notes}</p>
                    )}

                    {q.status === 'Chờ phản hồi' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => setActionQuot({ id: q.id, action: 'accept' })}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Chấp nhận
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActionQuot({ id: q.id, action: 'reject' })}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* So sánh nếu có >= 2 báo giá */}
          {quotations.length >= 2 && (
            <Card>
              <CardHeader><CardTitle>So sánh báo giá</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tiêu chí</TableHead>
                        {quotations.map(q => (
                          <TableHead key={q.id}>{q.supplierName}<br /><span className="text-muted-foreground font-normal">{q.createdAt}</span></TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Tổng giá</TableCell>
                        {quotations.map(q => {
                          const isLowest = q.totalAmount === Math.min(...quotations.map(x => x.totalAmount));
                          return (
                            <TableCell key={q.id} className={isLowest ? 'text-green-600 font-medium' : ''}>
                              {formatPrice(q.totalAmount)}
                              {isLowest && <Badge variant="secondary" className="ml-1">Tốt nhất</Badge>}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Thời gian giao</TableCell>
                        {quotations.map(q => {
                          const isFastest = q.deliveryDays === Math.min(...quotations.map(x => x.deliveryDays));
                          return (
                            <TableCell key={q.id} className={isFastest ? 'text-green-600 font-medium' : ''}>
                              {q.deliveryDays} ngày
                              {isFastest && <Badge variant="secondary" className="ml-1">Nhanh nhất</Badge>}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Thanh toán</TableCell>
                        {quotations.map(q => <TableCell key={q.id}>{q.paymentTerms}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Hiệu lực</TableCell>
                        {quotations.map(q => <TableCell key={q.id}>{q.validUntil}</TableCell>)}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Trạng thái</TableCell>
                        {quotations.map(q => <TableCell key={q.id}><StatusBadge status={q.status} /></TableCell>)}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={CalendarDays} label="Ngày giao" value={rfq.deliveryDate} />
              <InfoRow icon={Clock} label="Hết hạn" value={rfq.expiresAt} />
              <Separator />
              <InfoRow icon={Truck} label="Giao hàng" value={rfq.shippingTerms} />
              <InfoRow icon={FileText} label="Thanh toán" value={rfq.paymentTerms} />
              {rfq.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Ghi chú:</p>
                    <p>{rfq.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Người gửi</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">{rfq.buyerName}</p>
              <p className="text-muted-foreground">{rfq.buyerCompany}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={!!actionQuot} onOpenChange={() => setActionQuot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionQuot?.action === 'accept' ? 'Chấp nhận báo giá?' : 'Từ chối báo giá?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionQuot?.action === 'accept'
                ? 'Bạn chắc chắn muốn chấp nhận báo giá này? Trạng thái YCBG sẽ được cập nhật.'
                : 'Bạn chắc chắn muốn từ chối báo giá này?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleQuotationAction}>
              {actionQuot?.action === 'accept' ? 'Chấp nhận' : 'Từ chối'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-auto text-right">{value}</span>
    </div>
  );
}