// ============================================================
// Chi tiết hợp đồng — Buyer (P2 Đợt 3: P2.04–P2.10)
// Timeline, Milestones, Phụ lục, T&C Accordion, Print, History
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, FileText, CalendarDays, Truck, PenLine, CheckCircle2,
  ShoppingCart, Clock, History, AlertTriangle, Package, Printer, Download,
  File, FileSpreadsheet, FileImage, ChevronDown, ChevronRight, Clipboard,
  Shield, FileCheck, XCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { contractApi } from '../../services/api';
import type { Contract } from '../../types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';

const fmtPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p);

// ─── P2.04: Contract Timeline (Horizontal) ───────────────
function ContractTimeline({ contract }: { contract: Contract }) {
  const steps = [
    { label: 'Tạo', icon: FileText, date: contract.createdAt, done: true },
    { label: 'Gửi duyệt', icon: Clipboard, date: contract.createdAt, done: ['Chờ ký', 'Đang thực hiện', 'Hoàn thành', 'Hết hạn'].includes(contract.status) },
    { label: 'Ký kết', icon: PenLine, date: contract.signedAt ?? '', done: !!contract.signedAt },
    { label: 'Hiệu lực', icon: Shield, date: contract.startDate, done: ['Đang thực hiện', 'Hoàn thành', 'Hết hạn'].includes(contract.status) },
    { label: 'Hoàn thành', icon: CheckCircle2, date: contract.endDate, done: ['Hoàn thành', 'Hết hạn'].includes(contract.status) },
  ];

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const isLast = i === steps.length - 1;
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                  s.done
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={`text-xs text-center ${s.done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                {s.date && <span className="text-[10px] text-muted-foreground">{s.date}</span>}
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-1.5rem] rounded-full transition-all ${s.done ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
      {/* P2.10 Mobile: vertical */}
      <div className="sm:hidden relative pl-8 space-y-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="relative">
              <div className={`absolute -left-8 top-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                s.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {i < steps.length - 1 && (
                <div className={`absolute -left-[16px] top-8 w-0.5 h-[calc(100%+1rem)] ${s.done ? 'bg-primary' : 'bg-muted'}`} />
              )}
              <div className="pl-2">
                <p className={`text-sm ${s.done ? '' : 'text-muted-foreground'}`}>{s.label}</p>
                {s.date && <p className="text-xs text-muted-foreground">{s.date}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── P2.06: Mock Attachments ──────────────────────────────
const mockAttachments = [
  { id: 'att-1', name: 'Hợp đồng gốc.pdf', type: 'pdf', size: '2.4 MB', date: '2025-02-15' },
  { id: 'att-2', name: 'Bảng giá phụ lục.xlsx', type: 'excel', size: '156 KB', date: '2025-02-16' },
  { id: 'att-3', name: 'Biên bản bàn giao.docx', type: 'word', size: '890 KB', date: '2025-03-01' },
  { id: 'att-4', name: 'Hình ảnh mẫu.png', type: 'image', size: '3.1 MB', date: '2025-02-20' },
];

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf': return { icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
    case 'excel': return { icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' };
    case 'word': return { icon: FileCheck, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
    case 'image': return { icon: FileImage, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' };
    default: return { icon: File, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' };
  }
}

// ─── P2.07: Mock Terms & Conditions ───────────────────────
const mockTerms = [
  { id: 'tc-1', title: 'Điều 1: Phạm vi hợp đồng', content: 'Hợp đồng này quy định việc cung cấp hàng hoá/dịch vụ giữa hai bên theo các điều khoản và điều kiện được nêu dưới đây. Bên bán cam kết cung cấp đầy đủ số lượng, chất lượng sản phẩm theo bảng kê kèm hợp đồng.' },
  { id: 'tc-2', title: 'Điều 2: Giá cả và thanh toán', content: 'Giá cả theo thỏa thuận trong bảng kê đính kèm. Thanh toán thực hiện qua chuyển khoản ngân hàng, theo các mốc được ghi trong phần milestones. Thời hạn thanh toán không quá 30 ngày kể từ ngày nhận hóa đơn.' },
  { id: 'tc-3', title: 'Điều 3: Giao hàng và vận chuyển', content: 'Bên bán chịu trách nhiệm giao hàng đến địa điểm do Bên mua chỉ định. Chi phí vận chuyển do Bên bán chịu trừ khi có thỏa thuận khác. Thời gian giao hàng tuân thủ lịch trình trong hợp đồng.' },
  { id: 'tc-4', title: 'Điều 4: Bảo hành và đổi trả', content: 'Sản phẩm được bảo hành 12 tháng kể từ ngày giao. Bên mua có quyền yêu cầu đổi trả nếu sản phẩm không đạt chất lượng cam kết trong vòng 7 ngày kể từ ngày nhận hàng.' },
  { id: 'tc-5', title: 'Điều 5: Bất khả kháng', content: 'Không bên nào chịu trách nhiệm cho việc không thực hiện nghĩa vụ do sự kiện bất khả kháng (thiên tai, dịch bệnh, chiến tranh, ...). Bên bị ảnh hưởng phải thông báo cho bên kia trong vòng 3 ngày.' },
];

// ─── P2.09: Mock History (Enhanced) ──────────────────────
const mockHistory = [
  { date: '2025-02-15 09:00', action: 'Tạo hợp đồng', user: 'Lê Hoàng Anh', avatar: 'LA', details: 'Tạo hợp đồng mới từ RFQ-2025-005', color: 'primary' as const },
  { date: '2025-02-15 14:30', action: 'Cập nhật điều khoản', user: 'Lê Hoàng Anh', avatar: 'LA', details: 'Sửa điều khoản thanh toán: 30 → 45 ngày', color: 'info' as const },
  { date: '2025-02-16 10:00', action: 'Gửi cho NCC', user: 'Hệ thống', avatar: 'HT', details: 'Tự động gửi email đến nhà cung cấp', color: 'neutral' as const },
  { date: '2025-02-18 15:20', action: 'NCC đã ký', user: 'Nguyễn Văn B', avatar: 'NB', details: 'Nhà cung cấp xác nhận và ký hợp đồng', color: 'success' as const },
  { date: '2025-02-18 16:45', action: 'Buyer ký', user: 'Lê Hoàng Anh', avatar: 'LA', details: 'Đã ký hợp đồng điện tử', color: 'success' as const },
  { date: '2025-02-20 08:00', action: 'Bắt đầu hiệu lực', user: 'Hệ thống', avatar: 'HT', details: 'Hợp đồng chính thức có hiệu lực', color: 'primary' as const },
];

// ─── Mock linked orders ───────────────────────────────────
const mockLinkedOrders = [
  { id: 'ord-101', orderNumber: 'DH-2025-101', date: '2025-03-01', amount: 45000000, status: 'Đã giao' },
  { id: 'ord-102', orderNumber: 'DH-2025-102', date: '2025-03-10', amount: 32000000, status: 'Đang xử lý' },
];

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export function BuyerContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [openTerms, setOpenTerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    contractApi.getById(id).then(c => setContract(c ?? null)).finally(() => setLoading(false));
  }, [id]);

  const handleSign = async () => {
    if (!contract) return;
    try {
      const bothSigned = contract.signedBySeller;
      const newStatus = bothSigned ? 'Đang thực hiện' : contract.status;
      await contractApi.updateStatus(contract.id, newStatus);
      setContract(prev => prev ? {
        ...prev, signedByBuyer: true,
        signedAt: bothSigned ? new Date().toISOString().slice(0, 10) : prev.signedAt,
        status: newStatus,
      } : null);
      toast.success('Đã ký hợp đồng thành công');
    } catch { toast.error('Có lỗi xảy ra'); }
    setShowSignDialog(false);
  };

  const handleCreateOrder = () => {
    toast.success('Đã tạo đơn hàng từ hợp đồng (giả lập)');
    navigate('/orders');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleTerm = useCallback((id: string) => {
    setOpenTerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  if (loading) return <DetailSkeleton />;
  if (!contract) return (
    <div className="container mx-auto px-4 py-6 text-center py-12">
      <XCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
      <p className="text-muted-foreground">Không tìm thấy hợp đồng</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/contracts')}>Quay lại</Button>
    </div>
  );

  const milestonesDone = contract.milestones.filter(m => m.status === 'Hoàn thành').length;
  const milestonesTotal = contract.milestones.length;
  const progressPct = milestonesTotal > 0 ? Math.round((milestonesDone / milestonesTotal) * 100) : 0;
  const canSign = contract.status === 'Chờ ký' && !contract.signedByBuyer;
  const isExpiringSoon = new Date(contract.endDate) <= new Date(Date.now() + 30 * 86400000) && ['Đang thực hiện'].includes(contract.status);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Hợp đồng', href: '/contracts' },
        { label: contract.contractNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 style={{ fontFamily: 'var(--font-heading)' }}>{contract.contractNumber}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="text-muted-foreground mt-0.5">Tạo ngày {contract.createdAt}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* P2.08: Print */}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> In
          </Button>
          {canSign && (
            <Button onClick={() => setShowSignDialog(true)}>
              <PenLine className="h-4 w-4 mr-1" /> Ký hợp đồng
            </Button>
          )}
          {contract.status === 'Đang thực hiện' && (
            <Button variant="outline" onClick={handleCreateOrder}>
              <ShoppingCart className="h-4 w-4 mr-1" /> Tạo đơn hàng
            </Button>
          )}
        </div>
      </div>

      {/* Warning */}
      {isExpiringSoon && (
        <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            Hợp đồng sắp hết hạn vào <strong>{contract.endDate}</strong>. Hãy liên hệ NCC để gia hạn.
          </AlertDescription>
        </Alert>
      )}

      {/* P2.04: Timeline */}
      <Card className="print:hidden">
        <CardContent className="p-5 sm:p-6">
          <ContractTimeline contract={contract} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FileText className="mr-1 h-3.5 w-3.5 hidden sm:inline" /> Tổng quan
              </TabsTrigger>
              <TabsTrigger value="milestones" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Clock className="mr-1 h-3.5 w-3.5 hidden sm:inline" /> Mốc
              </TabsTrigger>
              <TabsTrigger value="attachments" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Download className="mr-1 h-3.5 w-3.5 hidden sm:inline" /> Phụ lục
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Package className="mr-1 h-3.5 w-3.5 hidden sm:inline" /> Đơn hàng
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <History className="mr-1 h-3.5 w-3.5 hidden sm:inline" /> Lịch sử
              </TabsTrigger>
            </TabsList>

            {/* Tab: Tổng quan */}
            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Parties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Các bên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Bên mua</p>
                      <p style={{ fontFamily: 'var(--font-heading)' }}>{contract.buyerCompany}</p>
                      <p className="text-muted-foreground text-sm mt-0.5">{contract.buyerName}</p>
                      <Badge variant={contract.signedByBuyer ? 'default' : 'secondary'} className="mt-2">
                        {contract.signedByBuyer ? '✓ Đã ký' : 'Chưa ký'}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Bên bán</p>
                      <p style={{ fontFamily: 'var(--font-heading)' }}>{contract.supplierName}</p>
                      <Badge variant={contract.signedBySeller ? 'default' : 'secondary'} className="mt-2">
                        {contract.signedBySeller ? '✓ Đã ký' : 'Chưa ký'}
                      </Badge>
                    </div>
                  </div>
                  {contract.signedAt && (
                    <p className="text-muted-foreground mt-3 text-sm">
                      📅 Ký chính thức: <strong>{contract.signedAt}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Hàng hoá ({contract.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-10">#</TableHead>
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
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right" style={{ fontFamily: 'var(--font-heading)' }}>{item.quantity.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                            <TableCell className="text-right">{fmtPrice(item.unitPrice)}</TableCell>
                            <TableCell className="text-right" style={{ fontFamily: 'var(--font-heading)' }}>{fmtPrice(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={5} className="text-right" style={{ fontFamily: 'var(--font-heading)' }}>
                            Tổng giá trị
                          </TableCell>
                          <TableCell className="text-right text-primary text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                            {fmtPrice(contract.totalAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* P2.07: Terms & Conditions Accordion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Điều khoản hợp đồng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockTerms.map(term => (
                    <Collapsible key={term.id} open={openTerms.has(term.id)} onOpenChange={() => toggleTerm(term.id)}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/60 transition-colors text-left">
                        <span className="text-sm">{term.title}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openTerms.has(term.id) ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground leading-relaxed">
                          {term.content}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* P2.05: Tab: Mốc tiến độ */}
            <TabsContent value="milestones" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Mốc thanh toán / giao hàng
                    </CardTitle>
                    <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                      {milestonesDone}/{milestonesTotal}
                    </span>
                  </div>
                  {milestonesTotal > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Tiến độ tổng thể</span>
                        <span style={{ fontFamily: 'var(--font-heading)' }}>{progressPct}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {contract.milestones.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>Không có mốc tiến độ</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contract.milestones.map(ms => {
                        const isDone = ms.status === 'Hoàn thành';
                        const isOverdue = ms.status === 'Quá hạn';
                        return (
                          <div
                            key={ms.id}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                              isDone
                                ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                                : isOverdue
                                ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/30'
                                : 'border-border'
                            }`}
                          >
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-emerald-500 text-white' : isOverdue ? 'bg-red-500 text-white' : 'bg-muted'
                            }`}>
                              {isDone ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <span className="text-xs text-muted-foreground">○</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`${isDone ? 'line-through text-muted-foreground' : ''}`}>
                                {ms.title}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" /> Hạn: {ms.dueDate}
                                </span>
                                {ms.amount > 0 && (
                                  <span style={{ fontFamily: 'var(--font-heading)' }}>
                                    {fmtPrice(ms.amount)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <StatusBadge status={ms.status} size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* P2.06: Tab: Phụ lục */}
            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" /> Tài liệu đính kèm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockAttachments.map(att => {
                      const fileVis = getFileIcon(att.type);
                      const FileIcon = fileVis.icon;
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/40 transition-colors group"
                        >
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${fileVis.color}`}>
                            <FileIcon className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{att.name}</p>
                            <p className="text-xs text-muted-foreground">{att.size} · {att.date}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-60 group-hover:opacity-100 transition-opacity"
                            onClick={() => toast.success(`Đang tải ${att.name}...`)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Đơn hàng liên kết */}
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" /> Đơn hàng liên kết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockLinkedOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>Chưa có đơn hàng nào</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {mockLinkedOrders.map(o => (
                        <button
                          key={o.id}
                          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:bg-muted/40 hover:border-primary/20 transition-all text-left"
                          onClick={() => navigate(`/orders/${o.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <IconWrapper icon={Package} variant="primary" size="sm" />
                            <div>
                              <p style={{ fontFamily: 'var(--font-heading)' }}>{o.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{o.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p style={{ fontFamily: 'var(--font-heading)' }}>{fmtPrice(o.amount)}</p>
                            <StatusBadge status={o.status} size="sm" className="mt-0.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {contract.status === 'Đang thực hiện' && (
                    <Button variant="outline" className="w-full mt-4" onClick={handleCreateOrder}>
                      <ShoppingCart className="mr-1 h-4 w-4" /> Tạo đơn hàng từ hợp đồng
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* P2.09: Tab: Lịch sử thay đổi */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Lịch sử thay đổi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-8 space-y-6">
                    {mockHistory.map((h, i) => {
                      const colorMap = {
                        primary: 'bg-blue-500',
                        success: 'bg-emerald-500',
                        info: 'bg-sky-500',
                        neutral: 'bg-slate-400',
                      };
                      return (
                        <div key={i} className="relative">
                          {/* Dot */}
                          <div className={`absolute -left-8 top-0.5 h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] ${colorMap[h.color]}`}>
                            {h.avatar.charAt(0)}
                          </div>
                          {/* Line */}
                          {i < mockHistory.length - 1 && (
                            <div className="absolute -left-[22px] top-5 w-0.5 h-[calc(100%+0.75rem)] bg-border" />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span style={{ fontFamily: 'var(--font-heading)' }} className="text-sm">{h.action}</span>
                              <Badge variant="outline" className="text-xs h-5 px-1.5">{h.user}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{h.details}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{h.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Value */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm mb-1">Giá trị hợp đồng</p>
              <p className="text-2xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                {fmtPrice(contract.totalAmount)}
              </p>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4.5 w-4.5 text-primary" /> Thông tin
              </CardTitle>
            </CardHeader>
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
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-sm">{contract.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-5 grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-muted/40">
                <p className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {contract.items.length}
                </p>
                <p className="text-xs text-muted-foreground">Sản phẩm</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/40">
                <p className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {milestonesTotal > 0 ? `${progressPct}%` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Tiến độ</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/40">
                <p className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {mockLinkedOrders.length}
                </p>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/40">
                <p className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {mockAttachments.length}
                </p>
                <p className="text-xs text-muted-foreground">Tài liệu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sign dialog */}
      <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ký hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn xác nhận ký hợp đồng <strong>{contract.contractNumber}</strong> với giá trị <strong>{fmtPrice(contract.totalAmount)}</strong>.
              {!contract.signedBySeller && ' Lưu ý: Nhà cung cấp chưa ký hợp đồng này.'}
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

// ─── Info Row Helper ──────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-sm">{label}:</span>
      <span className="ml-auto text-right text-sm">{value}</span>
    </div>
  );
}