// ============================================================
// Danh sách hoá đơn — Seller
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Plus, Eye, Send, Printer, Download,
  DollarSign, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { invoiceSellerApi, orderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type {
  Invoice, InvoiceStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig, Order,
} from '../../types';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Số HĐ', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'buyerName', label: 'Bên mua', visible: true, sortable: true },
  { key: 'totalAmount', label: 'Tổng tiền', visible: true, sortable: true },
  { key: 'taxAmount', label: 'Thuế', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'issuedDate', label: 'Ngày xuất', visible: true, sortable: true },
  { key: 'dueDate', label: 'Hạn TT', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select',
    options: ['Bản nháp', 'Đã xuất', 'Đã gửi', 'Đã thanh toán', 'Quá hạn', 'Đã huỷ'].map(v => ({ label: v, value: v })),
  },
  {
    key: 'type', label: 'Loại', type: 'select',
    options: ['Bán hàng', 'Trả hàng', 'Điều chỉnh'].map(v => ({ label: v, value: v })),
  },
  { key: 'buyerName', label: 'Bên mua', type: 'text' },
  { key: 'search', label: 'Tìm kiếm', type: 'text' },
];

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate">{label}</p>
          <p className="text-xl truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const statusNextMap: Record<string, InvoiceStatus[]> = {
  'Bản nháp': ['Đã xuất'],
  'Đã xuất': ['Đã gửi', 'Đã huỷ'],
  'Đã gửi': ['Đã thanh toán', 'Quá hạn'],
  'Quá hạn': ['Đã thanh toán'],
};

export function SellerInvoiceListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const supplierId = user?.supplierId ?? 'sup-01';

  const [data, setData] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'issuedDate', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  // Stats
  const [stats, setStats] = useState({ total: 0, issued: 0, pending: 0, overdue: 0, totalRevenue: 0 });

  // Dialogs
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [createOrderId, setCreateOrderId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        invoiceSellerApi.getBySeller(supplierId, pagination, sort, filters),
        invoiceSellerApi.getStats(supplierId),
      ]);
      setData(res.data);
      setTotal(res.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [supplierId, pagination, sort, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = (inv: Invoice) => {
    setSelected(inv);
    setShowDetail(true);
  };

  const handleStatusChange = async (inv: Invoice, newStatus: InvoiceStatus) => {
    try {
      await invoiceSellerApi.updateStatus(inv.id, newStatus);
      toast.success(`Đã chuyển trạng thái thành "${newStatus}"`);
      fetchData();
      if (selected?.id === inv.id) {
        setSelected({ ...inv, status: newStatus });
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleSendEmail = async (inv: Invoice) => {
    try {
      await invoiceSellerApi.sendEmail(inv.id);
      toast.success(`Đã gửi hoá đơn ${inv.invoiceNumber} qua email`);
      fetchData();
    } catch {
      toast.error('Lỗi khi gửi email');
    }
  };

  const handleCreateFromOrder = async () => {
    if (!createOrderId) return;
    try {
      const inv = await invoiceSellerApi.createFromOrder(createOrderId, supplierId);
      toast.success(`Đã tạo hoá đơn ${inv.invoiceNumber}`);
      setShowCreate(false);
      setCreateOrderId('');
      fetchData();
    } catch {
      toast.error('Lỗi khi tạo hoá đơn');
    }
  };

  const openCreateDialog = async () => {
    const orders = await orderApi.getBySeller(supplierId);
    setSellerOrders(orders.filter(o => o.status === 'Đã giao'));
    setCreateOrderId('');
    setShowCreate(true);
  };

  const exportCSV = () => {
    const headers = ['Số HĐ', 'Đơn hàng', 'Bên mua', 'Tổng tiền', 'Thuế', 'Trạng thái', 'Ngày xuất', 'Hạn TT'];
    const rows = data.map(i => [i.invoiceNumber, i.orderNumber, i.buyerName, i.totalAmount, i.taxAmount, i.status, i.issuedDate, i.dueDate]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hoa-don.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất CSV');
  };

  // Formatted table data
  const tableData = useMemo(() => data.map(d => ({
    ...d,
    totalAmount: formatPrice(d.totalAmount),
    taxAmount: formatPrice(d.taxAmount),
  })), [data]);

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Hoá đơn' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Quản lý hoá đơn
          </h1>
          <p className="text-muted-foreground">Xuất và quản lý hoá đơn điện tử</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> Xuất CSV
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Xuất hoá đơn
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Tổng HĐ" value={stats.total} icon={FileText} color="bg-blue-500" />
        <StatCard label="Đã xuất" value={stats.issued} icon={CheckCircle2} color="bg-green-500" />
        <StatCard label="Chờ TT" value={stats.pending} icon={Clock} color="bg-amber-500" />
        <StatCard label="Quá hạn" value={stats.overdue} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Doanh thu" value={formatPrice(stats.totalRevenue)} icon={DollarSign} color="bg-purple-500" />
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
      />

      {/* Desktop DataTable */}
      <div className="hidden md:block mt-4">
        <DataTable
          data={tableData}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={r => r.id}
          loading={loading}
          onRowClick={(row) => openDetail(data.find(d => d.id === row.id)!)}
          renderActions={(row) => {
            const inv = data.find(d => d.id === row.id)!;
            const nextStatuses = statusNextMap[inv.status] || [];
            return (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/seller/invoices/${inv.id}`); }}>
                  <Eye className="h-4 w-4" />
                </Button>
                {inv.status === 'Đã xuất' && (
                  <Button size="sm" variant="ghost" className="text-blue-600" onClick={(e) => { e.stopPropagation(); handleSendEmail(inv); }}>
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                {nextStatuses.length > 0 && (
                  <Select onValueChange={(v) => handleStatusChange(inv, v as InvoiceStatus)}>
                    <SelectTrigger className="h-8 w-24" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Chuyển" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          }}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mt-4">
        {loading && <p className="text-center text-muted-foreground py-8">Đang tải...</p>}
        {!loading && data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Chưa có hoá đơn nào</p>
          </div>
        )}
        {data.map(inv => (
          <Card key={inv.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(inv)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p>{inv.invoiceNumber}</p>
                  <p className="text-muted-foreground">{inv.buyerName}</p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary">{formatPrice(inv.totalAmount)}</span>
                <span className="text-muted-foreground">{inv.issuedDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail / Preview Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hoá đơn {selected?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selected && <InvoicePreview invoice={selected} />}
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
            {selected?.status === 'Đã xuất' && (
              <Button variant="outline" onClick={() => { handleSendEmail(selected); setShowDetail(false); }}>
                <Send className="mr-2 h-4 w-4" /> Gửi email
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> In
            </Button>
            {selected && (statusNextMap[selected.status] || []).map(s => (
              <Button key={s} onClick={() => { handleStatusChange(selected, s); setShowDetail(false); }}>
                {s}
              </Button>
            ))}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuất hoá đơn từ đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Chọn đơn hàng đã giao *</Label>
              <Select value={createOrderId} onValueChange={setCreateOrderId}>
                <SelectTrigger><SelectValue placeholder="Chọn đơn hàng..." /></SelectTrigger>
                <SelectContent>
                  {sellerOrders.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber} — {o.buyerName} — {formatPrice(o.totalAmount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {sellerOrders.length === 0 && (
              <p className="text-muted-foreground">Không có đơn hàng đã giao để xuất hoá đơn.</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button onClick={handleCreateFromOrder} disabled={!createOrderId}>
              <Plus className="mr-2 h-4 w-4" /> Tạo hoá đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-component: Invoice Preview ---
function InvoicePreview({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-4 print:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-primary">HOÁ ĐƠN GTGT</h2>
          <p className="text-muted-foreground">Số: {invoice.invoiceNumber}</p>
          <p className="text-muted-foreground">Ngày: {invoice.issuedDate}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={invoice.status} />
          <p className="text-muted-foreground mt-1">Hạn TT: {invoice.dueDate}</p>
        </div>
      </div>

      <Separator />

      {/* Seller / Buyer info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground">Bên bán</Label>
          <p>{invoice.supplierCompany}</p>
          <p className="text-muted-foreground">MST: {invoice.supplierTaxCode}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Bên mua</Label>
          <p>{invoice.buyerCompany}</p>
          <p className="text-muted-foreground">MST: {invoice.buyerTaxCode}</p>
        </div>
      </div>

      <Separator />

      {/* Items table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Mô tả</th>
              <th className="text-right p-2">SL</th>
              <th className="text-right p-2">Đơn giá</th>
              <th className="text-right p-2">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.quantity.toLocaleString()}</td>
                <td className="p-2 text-right">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                <td className="p-2 text-right">{new Intl.NumberFormat('vi-VN').format(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cộng tiền hàng:</span>
            <span>{new Intl.NumberFormat('vi-VN').format(invoice.subtotal)} ₫</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thuế GTGT ({invoice.taxRate}%):</span>
            <span>{new Intl.NumberFormat('vi-VN').format(invoice.taxAmount)} ₫</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Tổng cộng:</span>
            <span className="text-primary">{new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)} ₫</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div>
          <Label className="text-muted-foreground">Ghi chú</Label>
          <p className="mt-1">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}