import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Download, Eye, Package, RefreshCw, Truck, XCircle } from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { adminShipmentApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type { ActiveFilter, ColumnConfig, FilterConfig, PaginationParams, Shipment, SortParams } from '../../types';

const SHIPMENT_STATUSES = ['AWAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

const columns: (ColumnConfig & { render?: (item: Shipment) => React.ReactNode })[] = [
  { key: 'trackingNumber', label: 'Tracking', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Order', visible: true, sortable: true },
  { key: 'carrierName', label: 'Carrier', visible: true, sortable: true },
  { key: 'status', label: 'Status', visible: true, sortable: true, render: shipment => <StatusBadge status={shipment.status} /> },
  { key: 'estimatedDelivery', label: 'ETA', visible: true, sortable: true },
  { key: 'actualDelivery', label: 'Delivered at', visible: true, sortable: true },
  { key: 'createdAt', label: 'Created', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: SHIPMENT_STATUSES.map(status => ({ label: status, value: status })),
  },
];

const nextShipmentStatuses = (status: string) => {
  if (status === 'AWAITING_PICKUP') return ['IN_TRANSIT'];
  if (status === 'IN_TRANSIT') return ['DELIVERED', 'FAILED'];
  return [];
};

export function AdminShipmentPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        adminShipmentApi.getPaginated({ page: 1, pageSize: 1000 }),
        adminShipmentApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllShipments(allRes.data as Shipment[]);
      setShipments(pageRes.data as Shipment[]);
      setTotal(pageRes.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot load shipments');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, search, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => ({
    total: allShipments.length,
    awaiting: allShipments.filter(shipment => shipment.status === 'AWAITING_PICKUP').length,
    transit: allShipments.filter(shipment => shipment.status === 'IN_TRANSIT').length,
    delivered: allShipments.filter(shipment => shipment.status === 'DELIVERED').length,
    failed: allShipments.filter(shipment => shipment.status === 'FAILED').length,
  }), [allShipments]);

  const syncShipment = (updated: Shipment) => {
    setSelectedShipment(current => current?.id === updated.id ? updated : current);
    setShipments(current => current.map(shipment => shipment.id === updated.id ? updated : shipment));
    setAllShipments(current => current.map(shipment => shipment.id === updated.id ? updated : shipment));
  };

  const openShipment = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNextStatus('');
    try {
      const detail = await adminShipmentApi.getById(shipment.id);
      setSelectedShipment(detail as Shipment);
      syncShipment(detail as Shipment);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot load shipment detail');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedShipment || !nextStatus) return;
    setSavingStatus(true);
    try {
      const updated = await adminShipmentApi.updateStatus(selectedShipment.id, nextStatus);
      syncShipment(updated as Shipment);
      setNextStatus('');
      await fetchData();
      toast.success('Shipment status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot update shipment status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tracking', 'Order', 'Carrier', 'Status', 'ETA', 'Delivered at', 'Created'];
    const rows = allShipments.map(shipment => [
      shipment.trackingNumber,
      shipment.orderNumber,
      shipment.carrierName,
      shipment.status,
      shipment.estimatedDelivery ?? '',
      shipment.actualDelivery ?? '',
      shipment.createdAt ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderListItem = (shipment: Shipment) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{shipment.trackingNumber}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span>Order: {shipment.orderNumber}</span>
              <span>Carrier: {shipment.carrierName}</span>
              <span>ETA: {shipment.estimatedDelivery ?? '-'}</span>
            </div>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Shipments' }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Shipment management</h1>
          <p className="text-muted-foreground">Real admin shipment data from BE shipment contract.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={allShipments.length === 0}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><CardContent className="p-4"><Package className="mb-2 h-4 w-4 text-blue-500" /><p className="text-muted-foreground">Total</p><p className="text-xl">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="mb-2 h-4 w-4 text-amber-500" /><p className="text-muted-foreground">Awaiting</p><p className="text-xl">{stats.awaiting}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Truck className="mb-2 h-4 w-4 text-indigo-500" /><p className="text-muted-foreground">In transit</p><p className="text-xl">{stats.transit}</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle2 className="mb-2 h-4 w-4 text-green-500" /><p className="text-muted-foreground">Delivered</p><p className="text-xl">{stats.delivered}</p></CardContent></Card>
        <Card><CardContent className="p-4"><XCircle className="mb-2 h-4 w-4 text-red-500" /><p className="text-muted-foreground">Failed</p><p className="text-xl">{stats.failed}</p></CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={next => { setFilters(next); setPagination(current => ({ ...current, page: 1 })); }}
        searchValue={search}
        onSearchChange={value => { setSearch(value); setPagination(current => ({ ...current, page: 1 })); }}
        searchPlaceholder="Search tracking, order, customer..."
      />

      <DataTable
        data={shipments}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={openShipment}
        getId={shipment => shipment.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        emptyTitle="No shipments"
        emptyDescription="No admin shipments matched the current filters."
        renderActions={(shipment: Shipment) => (
          <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); openShipment(shipment); }} title="View">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
      />

      <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {selectedShipment?.trackingNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedShipment.status} />
                <span className="text-muted-foreground">{selectedShipment.carrierName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Order</p><p>{selectedShipment.orderNumber}</p></div>
                <div><p className="text-muted-foreground">Tracking</p><p>{selectedShipment.trackingNumber}</p></div>
                <div><p className="text-muted-foreground">ETA</p><p>{selectedShipment.estimatedDelivery ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Delivered at</p><p>{selectedShipment.actualDelivery ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Created</p><p>{selectedShipment.createdAt ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Updated</p><p>{(selectedShipment as unknown as { updatedAt?: string }).updatedAt ?? '-'}</p></div>
              </div>

              <Separator />

              {nextShipmentStatuses(selectedShipment.status).length > 0 && (
                <div className="flex gap-2">
                  <Select value={nextStatus} onValueChange={setNextStatus}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Update status..." /></SelectTrigger>
                    <SelectContent>
                      {nextShipmentStatuses(selectedShipment.status).map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} disabled={!nextStatus || savingStatus}>
                    {savingStatus ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
