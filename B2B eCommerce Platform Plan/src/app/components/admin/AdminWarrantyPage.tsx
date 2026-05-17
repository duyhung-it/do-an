import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Eye, RefreshCw, Shield, Wrench, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { adminWarrantyApi } from '../../services/adminBackendApi';

type WarrantyRow = {
  id: string;
  claimNumber: string;
  orderId?: string;
  productId?: string;
  customerName: string;
  customerPhone: string;
  issueDescription: string;
  status: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ['NEW', 'PROCESSING', 'RESOLVED', 'REJECTED'];

const nextStatuses = (status: string) => {
  if (status === 'NEW') return ['PROCESSING', 'REJECTED'];
  if (status === 'PROCESSING') return ['RESOLVED'];
  return [];
};

const formatDate = (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : '-';

function StatusPill({ status }: { status: string }) {
  const className = status === 'REJECTED'
    ? 'border-red-200 bg-red-50 text-red-700'
    : status === 'RESOLVED'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'PROCESSING'
        ? 'border-blue-200 bg-blue-50 text-blue-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';
  return <Badge variant="outline" className={className}>{status}</Badge>;
}

export function AdminWarrantyPage() {
  const [rows, setRows] = useState<WarrantyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<WarrantyRow | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = status === 'all' ? [] : [{ key: 'status', label: 'Status', value: status }];
      const page = await adminWarrantyApi.getPaginated({ page: 1, pageSize: 100 }, undefined, filters, search || undefined);
      setRows(page.data as WarrantyRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc warranty claim');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: rows.length,
    fresh: rows.filter(row => row.status === 'NEW').length,
    processing: rows.filter(row => row.status === 'PROCESSING').length,
    resolved: rows.filter(row => row.status === 'RESOLVED').length,
    rejected: rows.filter(row => row.status === 'REJECTED').length,
  }), [rows]);

  const openDetail = async (row: WarrantyRow) => {
    setSelected(row);
    setNextStatus('');
    setNote(row.resolutionNote ?? '');
    try {
      const detail = await adminWarrantyApi.getById(row.id);
      setSelected(detail as WarrantyRow);
      setNote((detail as WarrantyRow).resolutionNote ?? '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc chi tiet warranty');
    }
  };

  const updateStatus = async () => {
    if (!selected || !nextStatus) return;
    setSaving(true);
    try {
      const updated = await adminWarrantyApi.updateStatus(selected.id, nextStatus, note);
      setSelected(updated as WarrantyRow);
      setNextStatus('');
      await fetchData();
      toast.success('Da cap nhat warranty claim');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cap nhat warranty that bai');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Bao hanh' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Quan ly bao hanh</h1>
          <p className="text-muted-foreground">Xu ly warranty claim theo state machine BE.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Lam moi
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card><CardContent className="p-4"><Shield className="mb-2 h-4 w-4 text-blue-600" /><p className="text-muted-foreground">Tong</p><p className="text-xl">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Wrench className="mb-2 h-4 w-4 text-amber-600" /><p className="text-muted-foreground">Moi</p><p className="text-xl">{stats.fresh}</p></CardContent></Card>
        <Card><CardContent className="p-4"><RefreshCw className="mb-2 h-4 w-4 text-blue-600" /><p className="text-muted-foreground">Dang xu ly</p><p className="text-xl">{stats.processing}</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle className="mb-2 h-4 w-4 text-emerald-600" /><p className="text-muted-foreground">Da xong</p><p className="text-xl">{stats.resolved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><XCircle className="mb-2 h-4 w-4 text-red-600" /><p className="text-muted-foreground">Tu choi</p><p className="text-xl">{stats.rejected}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tim ma claim, khach hang, dien thoai..." />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full lg:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca trang thai</SelectItem>
              {STATUSES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Claim</th>
                <th className="px-4 py-3 text-left">Khach hang</th>
                <th className="px-4 py-3 text-left">Su co</th>
                <th className="px-4 py-3 text-center">Trang thai</th>
                <th className="px-4 py-3 text-center">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>Dang tai...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>Khong co warranty claim</td></tr>
              ) : rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><p className="font-medium">{row.claimNumber}</p><p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p></td>
                  <td className="px-4 py-3"><p>{row.customerName}</p><p className="text-xs text-muted-foreground">{row.customerPhone}</p></td>
                  <td className="px-4 py-3 max-w-sm"><p className="line-clamp-2">{row.issueDescription}</p></td>
                  <td className="px-4 py-3 text-center"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(row)}><Eye className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.claimNumber}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Khach hang</p><p>{selected.customerName}</p></div>
                <div><p className="text-muted-foreground">Dien thoai</p><p>{selected.customerPhone}</p></div>
                <div><p className="text-muted-foreground">Order ID</p><p>{selected.orderId ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Product ID</p><p>{selected.productId ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Trang thai</p><StatusPill status={selected.status} /></div>
                <div><p className="text-muted-foreground">Cap nhat</p><p>{formatDate(selected.updatedAt)}</p></div>
              </div>
              <div><p className="text-muted-foreground">Mo ta su co</p><p className="rounded-md bg-muted p-3">{selected.issueDescription}</p></div>

              {nextStatuses(selected.status).length > 0 && (
                <div className="grid gap-3 rounded-md border p-3">
                  <Label>Chuyen trang thai</Label>
                  <div className="flex gap-2">
                    <Select value={nextStatus} onValueChange={setNextStatus}>
                      <SelectTrigger><SelectValue placeholder="Chon trang thai tiep theo" /></SelectTrigger>
                      <SelectContent>{nextStatuses(selected.status).map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={updateStatus} disabled={!nextStatus || saving}>{saving ? 'Dang luu...' : 'Cap nhat'}</Button>
                  </div>
                  <Textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Resolution note" rows={3} />
                </div>
              )}

              {selected.resolutionNote && (
                <div><p className="text-muted-foreground">Resolution note</p><p className="rounded-md bg-emerald-50 p-3 text-emerald-800">{selected.resolutionNote}</p></div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Dong</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
