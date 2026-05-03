// ============================================================
// Chi tiết hợp đồng — Seller (xem + ký + milestone)
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, FileText, CalendarDays, Truck, PenLine, CheckCircle2,
  ShoppingBag, TrendingUp, Clock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { contractApi } from '../../services/api';
import type { Contract } from '../../types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function SellerContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignDialog, setShowSignDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    contractApi.getById(id).then(c => setContract(c ?? null)).finally(() => setLoading(false));
  }, [id]);

  const handleSign = async () => {
    if (!contract) return;
    try {
      const bothSigned = contract.signedByBuyer;
      const newStatus = bothSigned ? 'Đang thực hiện' : contract.status;
      await contractApi.updateStatus(contract.id, newStatus);
      setContract(prev => prev ? {
        ...prev,
        signedBySeller: true,
        signedAt: bothSigned ? new Date().toISOString().slice(0, 10) : prev.signedAt,
        status: newStatus,
      } : null);
      toast.success('Đã ký hợp đồng thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
    setShowSignDialog(false);
  };

  if (loading) return <DetailSkeleton />;
  if (!contract) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Không tìm thấy hợp đồng</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/seller/contracts')}>Quay lại</Button>
    </div>
  );

  const milestonesDone = contract.milestones.filter(m => m.status === 'Hoàn thành').length;
  const milestonesTotal = contract.milestones.length;
  const progressPct = milestonesTotal > 0 ? Math.round((milestonesDone / milestonesTotal) * 100) : 0;
  const canSign = contract.status === 'Chờ ký' && !contract.signedBySeller;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Hợp đồng', href: '/seller/contracts' },
        { label: contract.contractNumber },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seller/contracts')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>{contract.contractNumber}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="text-muted-foreground">Tạo ngày {contract.createdAt}</p>
        </div>
        {canSign && (
          <Button onClick={() => setShowSignDialog(true)}>
            <PenLine className="h-4 w-4 mr-1" /> Ký hợp đồng
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Các bên</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Bên mua</p>
                  <p className="font-medium">{contract.buyerCompany}</p>
                  <p className="text-muted-foreground">{contract.buyerName}</p>
                  <Badge variant={contract.signedByBuyer ? 'default' : 'secondary'} className="mt-1">
                    {contract.signedByBuyer ? 'Đã ký' : 'Chưa ký'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Bên bán</p>
                  <p className="font-medium">{contract.supplierName}</p>
                  <Badge variant={contract.signedBySeller ? 'default' : 'secondary'} className="mt-1">
                    {contract.signedBySeller ? 'Đã ký' : 'Chưa ký'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader><CardTitle>Hàng hoá ({contract.items.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">SL</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contract.items.map((item, idx) => (
                      <TableRow key={item.id ?? idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">Tổng giá trị</TableCell>
                      <TableCell className="text-right font-medium text-primary">{formatPrice(contract.totalAmount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          {contract.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mốc thanh toán / giao hàng</CardTitle>
                  <span className="text-muted-foreground">{milestonesDone}/{milestonesTotal}</span>
                </div>
                <Progress value={progressPct} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contract.milestones.map(ms => (
                    <div key={ms.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${ms.status === 'Hoàn thành' ? 'text-green-500' : ms.status === 'Quá hạn' ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ms.title}</p>
                        <p className="text-muted-foreground">Hạn: {ms.dueDate} · {ms.amount > 0 ? formatPrice(ms.amount) : '—'}</p>
                      </div>
                      <StatusBadge status={ms.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông tin hợp đồng</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={CalendarDays} label="Bắt đầu" value={contract.startDate} />
              <InfoRow icon={CalendarDays} label="Kết thúc" value={contract.endDate} />
              <InfoRow icon={Truck} label="Giao hàng" value={contract.deliveryDate} />
              <Separator />
              <InfoRow icon={FileText} label="Thanh toán" value={contract.paymentTerms} />
              <InfoRow icon={Truck} label="Vận chuyển" value={contract.shippingTerms} />
              {contract.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Ghi chú:</p>
                    <p>{contract.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground mb-1">Giá trị hợp đồng</p>
              <p className="text-2xl font-medium text-primary">{formatPrice(contract.totalAmount)}</p>
            </CardContent>
          </Card>

          {/* P5.06: Hiệu suất hợp đồng */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Hiệu suất hợp đồng</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Đơn từ HĐ</p>
                  <p className="text-lg">8 đơn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Doanh thu từ HĐ</p>
                  <p className="text-lg text-primary">{formatPrice(contract.totalAmount * 0.65)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Tỉ lệ giao đúng hạn</p>
                  <div className="flex items-center gap-2">
                    <Progress value={87} className="h-2 flex-1" />
                    <span className="text-sm">87%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ký hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn xác nhận ký hợp đồng {contract.contractNumber} với giá trị {formatPrice(contract.totalAmount)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleSign}>Ký hợp đồng</AlertDialogAction>
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