import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileText, Receipt, RefreshCw } from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { adminInvoiceApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type { ActiveFilter, ColumnConfig, FilterConfig, Invoice, PaginationParams, SortParams } from '../../types';

const INVOICE_STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

const formatPrice = (value?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0));

const formatCompact = (value?: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(Number(value ?? 0));

const columns: (ColumnConfig & { render?: (item: Invoice) => React.ReactNode })[] = [
  { key: 'invoiceNumber', label: 'Invoice', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Order', visible: true, sortable: true },
  { key: 'buyerName', label: 'Customer', visible: true, sortable: true },
  { key: 'subtotal', label: 'Subtotal', visible: true, sortable: true, render: invoice => formatPrice(invoice.subtotal) },
  { key: 'taxAmount', label: 'Tax', visible: true, sortable: true, render: invoice => formatPrice(invoice.taxAmount) },
  { key: 'totalAmount', label: 'Total', visible: true, sortable: true, render: invoice => formatPrice(invoice.totalAmount) },
  { key: 'status', label: 'Status', visible: true, sortable: true, render: invoice => <StatusBadge status={invoice.status} /> },
  { key: 'issueDate', label: 'Issue date', visible: true, sortable: true },
  { key: 'dueDate', label: 'Due date', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: INVOICE_STATUSES.map(status => ({ label: status, value: status })),
  },
];

export function AdminInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        adminInvoiceApi.getPaginated({ page: 1, pageSize: 1000 }),
        adminInvoiceApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllInvoices(allRes.data as Invoice[]);
      setInvoices(pageRes.data as Invoice[]);
      setTotal(pageRes.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot load invoices');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, search, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const totalAmount = allInvoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount ?? 0), 0);
    const totalTax = allInvoices.reduce((sum, invoice) => sum + Number(invoice.taxAmount ?? 0), 0);
    const pending = allInvoices.filter(invoice => invoice.status === 'PENDING').length;
    const paid = allInvoices.filter(invoice => invoice.status === 'PAID').length;
    const overdue = allInvoices.filter(invoice => invoice.status === 'OVERDUE').length;
    return { count: allInvoices.length, totalAmount, totalTax, pending, paid, overdue };
  }, [allInvoices]);

  const syncInvoice = (updated: Invoice) => {
    setSelectedInvoice(current => current?.id === updated.id ? updated : current);
    setInvoices(current => current.map(invoice => invoice.id === updated.id ? updated : invoice));
    setAllInvoices(current => current.map(invoice => invoice.id === updated.id ? updated : invoice));
  };

  const openInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNextStatus('');
    try {
      const detail = await adminInvoiceApi.getById(invoice.id);
      setSelectedInvoice(detail as Invoice);
      syncInvoice(detail as Invoice);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot load invoice detail');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedInvoice || !nextStatus) return;
    setSavingStatus(true);
    try {
      const updated = await adminInvoiceApi.updateStatus(selectedInvoice.id, nextStatus);
      syncInvoice(updated as Invoice);
      setNextStatus('');
      await fetchData();
      toast.success('Invoice status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot update invoice status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const blob = await adminInvoiceApi.download(invoice.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice PDF downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot download invoice');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Invoice', 'Order', 'Customer', 'Subtotal', 'Tax', 'Total', 'Status', 'Issue date', 'Due date'];
    const rows = allInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.orderNumber,
      invoice.buyerName ?? invoice.customerName ?? '',
      String(invoice.subtotal ?? 0),
      String(invoice.taxAmount ?? 0),
      String(invoice.totalAmount ?? 0),
      invoice.status,
      invoice.issueDate ?? invoice.issuedDate ?? '',
      invoice.dueDate ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderListItem = (invoice: Invoice) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span>Order: {invoice.orderNumber}</span>
              <span>Customer: {invoice.buyerName ?? invoice.customerName}</span>
              <span>Total: {formatPrice(invoice.totalAmount)}</span>
              <span>Tax: {formatPrice(invoice.taxAmount)}</span>
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Invoices' }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Invoice management</h1>
          <p className="text-muted-foreground">Real admin invoice data from BE invoice contract.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={allInvoices.length === 0}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Invoices</p><p className="text-xl">{stats.count}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total</p><p className="text-xl">{formatCompact(stats.totalAmount)} VND</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Tax</p><p className="text-xl">{formatCompact(stats.totalTax)} VND</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Pending</p><p className="text-xl">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Overdue</p><p className="text-xl text-red-600">{stats.overdue}</p></CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={next => { setFilters(next); setPagination(current => ({ ...current, page: 1 })); }}
        searchValue={search}
        onSearchChange={value => { setSearch(value); setPagination(current => ({ ...current, page: 1 })); }}
        searchPlaceholder="Search invoice, order, customer..."
      />

      <DataTable
        data={invoices}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={openInvoice}
        getId={invoice => invoice.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        emptyTitle="No invoices"
        emptyDescription="No admin invoices matched the current filters."
        renderActions={(invoice: Invoice) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); openInvoice(invoice); }} title="View">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); handleDownload(invoice); }} title="Download PDF">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedInvoice.status} />
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedInvoice)}>
                  <Download className="mr-1 h-3.5 w-3.5" /> PDF
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Order</p><p>{selectedInvoice.orderNumber}</p></div>
                <div><p className="text-muted-foreground">Customer</p><p>{selectedInvoice.buyerName ?? selectedInvoice.customerName}</p></div>
                <div><p className="text-muted-foreground">Issue date</p><p>{selectedInvoice.issueDate ?? selectedInvoice.issuedDate}</p></div>
                <div><p className="text-muted-foreground">Due date</p><p>{selectedInvoice.dueDate}</p></div>
                <div><p className="text-muted-foreground">Subtotal</p><p>{formatPrice(selectedInvoice.subtotal)}</p></div>
                <div><p className="text-muted-foreground">Tax</p><p>{formatPrice(selectedInvoice.taxAmount)}</p></div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(selectedInvoice.totalAmount)}</span>
              </div>

              <div className="flex gap-2">
                <Select value={nextStatus} onValueChange={setNextStatus}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Update status..." /></SelectTrigger>
                  <SelectContent>
                    {INVOICE_STATUSES.filter(status => status !== selectedInvoice.status).map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusUpdate} disabled={!nextStatus || savingStatus}>
                  {savingStatus ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
