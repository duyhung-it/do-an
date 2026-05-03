// ============================================================
// Quản lý thuế & hoá đơn Admin
// Stats, Filter, DataTable, Chi tiết hoá đơn chuyên nghiệp,
// Cập nhật TT, Print preview, Tổng hợp thuế, Xuất CSV
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Receipt, DollarSign, AlertTriangle, CheckCircle2, Clock, Download,
  FileText, Printer, Send, Eye,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { invoiceApi } from '../../services/adminApi';
import { toast } from 'sonner';
import type {
  Invoice, InvoiceStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatCompact = (n: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(n);

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Số hoá đơn', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'type', label: 'Loại', visible: true, sortable: true },
  { key: 'supplierName', label: 'NCC', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'subtotal', label: 'Tiền hàng', visible: true, sortable: true },
  { key: 'taxAmount', label: 'Thuế', visible: true, sortable: true },
  { key: 'totalAmount', label: 'Tổng cộng', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true, type: 'select',
    options: ['Bản nháp', 'Đã xuất', 'Đã gửi', 'Đã thanh toán', 'Quá hạn', 'Đã huỷ'] },
  { key: 'issuedDate', label: 'Ngày xuất', visible: true, sortable: true },
  { key: 'dueDate', label: 'Hạn TT', visible: true, sortable: true },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Bản nháp', value: 'Bản nháp' },
    { label: 'Đã xuất', value: 'Đã xuất' },
    { label: 'Đã gửi', value: 'Đã gửi' },
    { label: 'Đã thanh toán', value: 'Đã thanh toán' },
    { label: 'Quá hạn', value: 'Quá hạn' },
    { label: 'Đã huỷ', value: 'Đã huỷ' },
  ]},
  { key: 'type', label: 'Loại hoá đơn', type: 'select', options: [
    { label: 'Bán hàng', value: 'Bán hàng' },
    { label: 'Trả hàng', value: 'Trả hàng' },
    { label: 'Điều chỉnh', value: 'Điều chỉnh' },
  ]},
];

export function AdminInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'issuedDate', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<InvoiceStatus | ''>('');
  const [tab, setTab] = useState<'list' | 'tax'>('list');
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        invoiceApi.getPaginated({ page: 1, pageSize: 1000 }),
        invoiceApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllInvoices(allRes.data);
      setInvoices(pageRes.data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Stats ---
  const stats = useMemo(() => {
    const totalRevenue = allInvoices.reduce((s, i) => s + i.subtotal, 0);
    const totalTax = allInvoices.reduce((s, i) => s + i.taxAmount, 0);
    const byStatus: Record<string, number> = {};
    let overdue = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (const inv of allInvoices) {
      byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
      if (inv.status === 'Quá hạn' || (inv.dueDate < today && !['Đã thanh toán', 'Đã huỷ'].includes(inv.status))) {
        overdue++;
      }
    }
    return { total: allInvoices.length, totalRevenue, totalTax, byStatus, overdue };
  }, [allInvoices]);

  // --- Biểu đồ phân bố trạng thái ---
  const statusChartData = useMemo(() => {
    return Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));
  }, [stats.byStatus]);

  // --- Biểu đồ doanh thu thuế theo tháng ---
  const monthlyTaxData = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; tax: number }> = {};
    for (const inv of allInvoices) {
      const month = inv.issuedDate.slice(0, 7);
      if (!map[month]) map[month] = { month, revenue: 0, tax: 0 };
      map[month].revenue += inv.subtotal;
      map[month].tax += inv.taxAmount;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [allInvoices]);

  // --- Tổng hợp thuế GTGT theo tháng ---
  const taxSummary = useMemo(() => {
    const map: Record<string, { month: string; invoiceCount: number; subtotal: number; taxAmount: number; totalAmount: number }> = {};
    for (const inv of allInvoices) {
      if (inv.status === 'Đã huỷ') continue;
      const month = inv.issuedDate.slice(0, 7);
      if (!map[month]) map[month] = { month, invoiceCount: 0, subtotal: 0, taxAmount: 0, totalAmount: 0 };
      map[month].invoiceCount++;
      map[month].subtotal += inv.subtotal;
      map[month].taxAmount += inv.taxAmount;
      map[month].totalAmount += inv.totalAmount;
    }
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [allInvoices]);

  // --- Inline edit trạng thái ---
  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    if (field === 'status') {
      const updated = await invoiceApi.updateStatus(id, value as InvoiceStatus);
      setInvoices(prev => prev.map(i => i.id === id ? updated : i));
      setAllInvoices(prev => prev.map(i => i.id === id ? updated : i));
      toast.success('Đã cập nhật trạng thái hoá đơn');
    }
  };

  // --- Cập nhật trạng thái từ dialog ---
  const handleStatusUpdate = async () => {
    if (!selectedInvoice || !statusToUpdate) return;
    try {
      const updated = await invoiceApi.updateStatus(selectedInvoice.id, statusToUpdate as InvoiceStatus);
      setSelectedInvoice(updated);
      setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
      setAllInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
      setStatusToUpdate('');
      toast.success('Đã cập nhật trạng thái');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  // --- In hoá đơn ---
  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Hoá đơn ${selectedInvoice?.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .text-right { text-align: right; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .totals { margin-top: 12px; text-align: right; }
        h2 { text-align: center; margin: 20px 0; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Số HĐ', 'Đơn hàng', 'Loại', 'NCC', 'Người mua', 'Tiền hàng', 'Thuế', 'Tổng', 'Trạng thái', 'Ngày xuất', 'Hạn TT'];
    const rows = allInvoices.map(i => [
      i.invoiceNumber, i.orderNumber, i.type, i.supplierName, i.buyerName,
      i.subtotal.toString(), i.taxAmount.toString(), i.totalAmount.toString(),
      i.status, i.issuedDate, i.dueDate,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoa-don-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- Export bảng tổng hợp thuế ---
  const handleExportTaxCSV = () => {
    const headers = ['Tháng', 'Số HĐ', 'Tiền hàng', 'Thuế GTGT', 'Tổng cộng'];
    const rows = taxSummary.map(t => [
      t.month, t.invoiceCount.toString(), t.subtotal.toString(),
      t.taxAmount.toString(), t.totalAmount.toString(),
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tong-hop-thue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất bảng tổng hợp thuế');
  };

  // --- List view ---
  const renderListItem = (inv: Invoice) => (
    <Card className={`hover:shadow-md transition-shadow ${
      inv.status === 'Quá hạn' ? 'border-red-200' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{inv.invoiceNumber}</span>
            <span className="text-muted-foreground">({inv.type})</span>
          </div>
          <StatusBadge status={inv.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Đơn: {inv.orderNumber}</span>
          <span>{inv.supplierName} → {inv.buyerName}</span>
          <span className="text-primary">{formatPrice(inv.totalAmount)}</span>
          <span>Thuế: {formatPrice(inv.taxAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Thuế & Hoá đơn' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý thuế & hoá đơn</h1>
          <p className="text-muted-foreground">Giám sát hoá đơn và doanh thu thuế toàn hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng hoá đơn</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Doanh thu</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl">{formatCompact(stats.totalRevenue)} ₫</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng thuế GTGT</span>
              <Receipt className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xl text-indigo-600">{formatCompact(stats.totalTax)} ₫</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đã thanh toán</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl text-green-600">{stats.byStatus['Đã thanh toán'] || 0}</p>
          </CardContent>
        </Card>
        <Card className={stats.overdue > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Quá hạn</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xl text-red-600">{stats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Tabs --- */}
      <Tabs value={tab} onValueChange={v => setTab(v as 'list' | 'tax')}>
        <TabsList>
          <TabsTrigger value="list">Danh sách hoá đơn</TabsTrigger>
          <TabsTrigger value="tax">Tổng hợp thuế</TabsTrigger>
        </TabsList>

        {/* --- Tab Danh sách --- */}
        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Biểu đồ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="font-medium mb-3">Phân bố trạng thái</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie key="pie-invoice-status" data={statusChartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {statusChartData.map((entry, idx) => (
                          <Cell key={`cell-invoice-status-${idx}-${entry.name}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip key="tooltip-invoice-status" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="font-medium mb-3">Doanh thu & thuế theo tháng</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTaxData}>
                      <CartesianGrid key="grid-invoice-monthly" strokeDasharray="3 3" />
                      <XAxis key="xaxis-invoice-monthly" dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis key="yaxis-invoice-monthly" tick={{ fontSize: 11 }} />
                      <Tooltip key="tooltip-invoice-monthly" formatter={(value: number) => formatPrice(value)} />
                      <Legend key="legend-invoice-monthly" />
                      <Bar key="bar-invoice-revenue" dataKey="revenue" name="Doanh thu" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar key="bar-invoice-tax" dataKey="tax" name="Thuế GTGT" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cảnh báo */}
          {stats.overdue > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3 flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Có {stats.overdue} hoá đơn quá hạn chưa thanh toán.</span>
              </CardContent>
            </Card>
          )}

          <FilterBar
            filters={filterConfigs}
            activeFilters={filters}
            onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
            searchValue={search}
            onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
            searchPlaceholder="Tìm số HĐ, đơn hàng, NCC, mã số thuế..."
          />

          <DataTable
            data={invoices}
            columns={columns}
            totalItems={total}
            pagination={pagination}
            sort={sort}
            onPaginationChange={setPagination}
            onSortChange={setSort}
            onInlineEdit={handleInlineEdit}
            onRowClick={i => { setSelectedInvoice(i); setStatusToUpdate(''); }}
            getId={i => i.id}
            renderListItem={renderListItem}
            loading={loading}
            viewModes={['table', 'list']}
            renderActions={(inv: Invoice) => (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }} title="Chi tiết">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          />
        </TabsContent>

        {/* --- Tab Tổng hợp thuế --- */}
        <TabsContent value="tax" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Bảng tổng hợp thuế GTGT theo tháng</p>
            <Button variant="outline" size="sm" onClick={handleExportTaxCSV}>
              <Download className="mr-1 h-4 w-4" /> Xuất bảng thuế
            </Button>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead className="text-right">Số hoá đơn</TableHead>
                    <TableHead className="text-right">Tiền hàng</TableHead>
                    <TableHead className="text-right">Thuế GTGT</TableHead>
                    <TableHead className="text-right">Tổng cộng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxSummary.map(row => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">{row.invoiceCount}</TableCell>
                      <TableCell className="text-right">{formatPrice(row.subtotal)}</TableCell>
                      <TableCell className="text-right text-indigo-600">{formatPrice(row.taxAmount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(row.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                  {taxSummary.length > 0 && (
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-medium">Tổng</TableCell>
                      <TableCell className="text-right font-medium">{taxSummary.reduce((s, r) => s + r.invoiceCount, 0)}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(taxSummary.reduce((s, r) => s + r.subtotal, 0))}</TableCell>
                      <TableCell className="text-right font-medium text-indigo-600">{formatPrice(taxSummary.reduce((s, r) => s + r.taxAmount, 0))}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(taxSummary.reduce((s, r) => s + r.totalAmount, 0))}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Chi tiết hoá đơn --- */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Hoá đơn {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Trạng thái + hành động */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <StatusBadge status={selectedInvoice.status} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrint}>
                    <Printer className="mr-1 h-3.5 w-3.5" /> In
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('Đã gửi lại hoá đơn cho người mua (giả lập)')}>
                    <Send className="mr-1 h-3.5 w-3.5" /> Gửi lại
                  </Button>
                </div>
              </div>

              {/* Cập nhật trạng thái */}
              {!['Đã thanh toán', 'Đã huỷ'].includes(selectedInvoice.status) && (
                <div className="flex items-center gap-2">
                  <Select value={statusToUpdate} onValueChange={v => setStatusToUpdate(v as InvoiceStatus)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chuyển trạng thái..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['Bản nháp', 'Đã xuất', 'Đã gửi', 'Đã thanh toán', 'Quá hạn', 'Đã huỷ']
                        .filter(s => s !== selectedInvoice.status)
                        .map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleStatusUpdate} disabled={!statusToUpdate}>
                    Cập nhật
                  </Button>
                </div>
              )}

              <Separator />

              {/* Nội dung hoá đơn (print-friendly) */}
              <div ref={printRef}>
                {/* Header 2 bên */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium mb-1">Nhà cung cấp</p>
                    <p className="font-medium">{selectedInvoice.supplierCompany}</p>
                    <p className="text-muted-foreground">{selectedInvoice.supplierName}</p>
                    <p className="text-muted-foreground">MST: {selectedInvoice.supplierTaxCode}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Người mua</p>
                    <p className="font-medium">{selectedInvoice.buyerCompany}</p>
                    <p className="text-muted-foreground">{selectedInvoice.buyerName}</p>
                    <p className="text-muted-foreground">MST: {selectedInvoice.buyerTaxCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-muted-foreground">Số hoá đơn</p>
                    <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Loại</p>
                    <p>{selectedInvoice.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày xuất</p>
                    <p>{selectedInvoice.issuedDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hạn thanh toán</p>
                    <p>{selectedInvoice.dueDate}</p>
                  </div>
                </div>

                {/* Bảng hàng hoá */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">SL</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thuế (%)</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{item.taxRate}%</TableCell>
                        <TableCell className="text-right">{formatPrice(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Tổng cộng */}
                <div className="mt-4 space-y-1 text-right">
                  <div className="flex justify-end gap-8">
                    <span className="text-muted-foreground">Tiền hàng:</span>
                    <span>{formatPrice(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-end gap-8">
                    <span className="text-muted-foreground">Thuế GTGT ({selectedInvoice.taxRate}%):</span>
                    <span className="text-indigo-600">{formatPrice(selectedInvoice.taxAmount)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-end gap-8">
                    <span className="font-medium">Tổng cộng:</span>
                    <span className="font-medium text-primary">{formatPrice(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="mt-4">
                    <p className="text-muted-foreground">Ghi chú: {selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}