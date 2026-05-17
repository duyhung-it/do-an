import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, DollarSign, Eye, RefreshCw, RotateCcw, XCircle } from 'lucide-react';
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
import { adminTradeInApi } from '../../services/adminBackendApi';

type TradeInRow = {
  id: string;
  requestNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deviceName: string;
  brand: string;
  model: string;
  condition: string;
  estimatedValue: number;
  finalValuation?: number;
  targetProductId?: string;
  status: string;
  images: string[];
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ['AWAITING_VALUATION', 'VALUED', 'ACCEPTED', 'REJECTED', 'COMPLETED'];

const statusTone: Record<string, string> = {
  AWAITING_VALUATION: 'border-amber-200 bg-amber-50 text-amber-700',
  VALUED: 'border-blue-200 bg-blue-50 text-blue-700',
  ACCEPTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  COMPLETED: 'border-slate-200 bg-slate-50 text-slate-700',
};

const formatMoney = (value?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0));

const formatDate = (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : '-';

const nextStatuses = (status: string) => {
  if (status === 'AWAITING_VALUATION') return ['REJECTED'];
  if (status === 'VALUED') return ['ACCEPTED', 'REJECTED'];
  return [];
};

function StatusPill({ status }: { status: string }) {
  return <Badge variant="outline" className={statusTone[status] ?? ''}>{status}</Badge>;
}

export function AdminTradeInPage() {
  const [rows, setRows] = useState<TradeInRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<TradeInRow | null>(null);
  const [finalValuation, setFinalValuation] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = statusFilter === 'all' ? [] : [{ key: 'status', label: 'Status', value: statusFilter }];
      const page = await adminTradeInApi.getPaginated({ page: 1, pageSize: 100 }, undefined, filters, search || undefined);
      setRows(page.data as TradeInRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc trade-in');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: rows.length,
    awaiting: rows.filter(row => row.status === 'AWAITING_VALUATION').length,
    valued: rows.filter(row => row.status === 'VALUED').length,
    accepted: rows.filter(row => row.status === 'ACCEPTED').length,
    completed: rows.filter(row => row.status === 'COMPLETED').length,
    value: rows.reduce((sum, row) => sum + Number(row.finalValuation ?? row.estimatedValue ?? 0), 0),
  }), [rows]);

  const syncSelected = (updated: TradeInRow) => {
    setSelected(updated);
    setRows(current => current.map(row => row.id === updated.id ? updated : row));
  };

  const openDetail = async (row: TradeInRow) => {
    setSelected(row);
    setFinalValuation(String(row.finalValuation ?? row.estimatedValue ?? 0));
    setAdminNote(row.adminNote ?? '');
    setNextStatus('');
    try {
      const detail = await adminTradeInApi.getById(row.id);
      const item = detail as TradeInRow;
      setSelected(item);
      setFinalValuation(String(item.finalValuation ?? item.estimatedValue ?? 0));
      setAdminNote(item.adminNote ?? '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc chi tiet trade-in');
    }
  };

  const valuate = async () => {
    if (!selected) return;
    const amount = Number(finalValuation);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Gia dinh gia phai >= 0');
      return;
    }
    setSaving(true);
    try {
      const updated = await adminTradeInApi.valuate(selected.id, amount, adminNote.trim() || undefined);
      syncSelected(updated as TradeInRow);
      await fetchData();
      toast.success('Da dinh gia trade-in');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dinh gia that bai');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async () => {
    if (!selected || !nextStatus) return;
    setSaving(true);
    try {
      const updated = await adminTradeInApi.updateStatus(selected.id, nextStatus, adminNote.trim() || undefined);
      syncSelected(updated as TradeInRow);
      setNextStatus('');
      await fetchData();
      toast.success('Da cap nhat trang thai trade-in');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cap nhat trang thai that bai');
    } finally {
      setSaving(false);
    }
  };

  const complete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminTradeInApi.complete(selected.id);
      syncSelected(updated as TradeInRow);
      await fetchData();
      toast.success('Da hoan thanh trade-in');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Hoan thanh trade-in that bai');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Thu cu doi moi' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Yeu cau thu cu doi moi</h1>
          <p className="text-muted-foreground">Dinh gia va xu ly trade-in theo contract BE.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Lam moi
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Card><CardContent className="p-4"><RotateCcw className="mb-2 h-4 w-4 text-blue-600" /><p className="text-muted-foreground">Tong</p><p className="text-xl">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="mb-2 h-4 w-4 text-amber-600" /><p className="text-muted-foreground">Cho dinh gia</p><p className="text-xl">{stats.awaiting}</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="mb-2 h-4 w-4 text-blue-600" /><p className="text-muted-foreground">Da dinh gia</p><p className="text-xl">{stats.valued}</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle className="mb-2 h-4 w-4 text-emerald-600" /><p className="text-muted-foreground">Accepted</p><p className="text-xl">{stats.accepted}</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle className="mb-2 h-4 w-4 text-slate-600" /><p className="text-muted-foreground">Completed</p><p className="text-xl">{stats.completed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="mb-2 h-4 w-4 text-purple-600" /><p className="text-muted-foreground">Gia tri</p><p className="text-lg">{formatMoney(stats.value)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tim ma, khach hang, dien thoai, may..." />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca trang thai</SelectItem>
              {STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Yeu cau</th>
                <th className="px-4 py-3 text-left">Khach hang</th>
                <th className="px-4 py-3 text-left">Thiet bi</th>
                <th className="px-4 py-3 text-right">Gia uoc tinh</th>
                <th className="px-4 py-3 text-right">Gia cuoi</th>
                <th className="px-4 py-3 text-center">Trang thai</th>
                <th className="px-4 py-3 text-center">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>Dang tai...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>Khong co trade-in</td></tr>
              ) : rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><p className="font-medium">{row.requestNumber}</p><p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p></td>
                  <td className="px-4 py-3"><p>{row.customerName}</p><p className="text-xs text-muted-foreground">{row.customerPhone}</p></td>
                  <td className="px-4 py-3"><p className="font-medium">{row.deviceName}</p><p className="text-xs text-muted-foreground">{row.condition}</p></td>
                  <td className="px-4 py-3 text-right">{formatMoney(row.estimatedValue)}</td>
                  <td className="px-4 py-3 text-right">{row.finalValuation ? formatMoney(row.finalValuation) : '-'}</td>
                  <td className="px-4 py-3 text-center"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-center"><Button variant="ghost" size="sm" onClick={() => openDetail(row)}><Eye className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.requestNumber}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Khach hang</p><p>{selected.customerName}</p></div>
                <div><p className="text-muted-foreground">Dien thoai</p><p>{selected.customerPhone}</p></div>
                <div><p className="text-muted-foreground">Thiet bi</p><p>{selected.deviceName}</p></div>
                <div><p className="text-muted-foreground">Tinh trang</p><p>{selected.condition}</p></div>
                <div><p className="text-muted-foreground">Gia uoc tinh</p><p>{formatMoney(selected.estimatedValue)}</p></div>
                <div><p className="text-muted-foreground">Gia cuoi</p><p>{selected.finalValuation ? formatMoney(selected.finalValuation) : '-'}</p></div>
                <div><p className="text-muted-foreground">Trang thai</p><StatusPill status={selected.status} /></div>
                <div><p className="text-muted-foreground">Cap nhat</p><p>{formatDate(selected.updatedAt)}</p></div>
              </div>

              <div className="grid gap-2">
                <Label>Ghi chu admin</Label>
                <Textarea value={adminNote} onChange={event => setAdminNote(event.target.value)} rows={3} placeholder="Ghi chu dinh gia / ly do tu choi..." />
              </div>

              {selected.status === 'AWAITING_VALUATION' && (
                <div className="grid gap-3 rounded-md border p-3">
                  <Label>Gia dinh gia cuoi</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} value={finalValuation} onChange={event => setFinalValuation(event.target.value)} />
                    <Button onClick={valuate} disabled={saving || !finalValuation}>
                      <DollarSign className="mr-1 h-4 w-4" /> Dinh gia
                    </Button>
                  </div>
                </div>
              )}

              {nextStatuses(selected.status).length > 0 && (
                <div className="grid gap-3 rounded-md border p-3">
                  <Label>Chuyen trang thai</Label>
                  <div className="flex gap-2">
                    <Select value={nextStatus} onValueChange={setNextStatus}>
                      <SelectTrigger><SelectValue placeholder="Chon trang thai" /></SelectTrigger>
                      <SelectContent>{nextStatuses(selected.status).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={updateStatus} disabled={saving || !nextStatus}>Cap nhat</Button>
                  </div>
                </div>
              )}

              {selected.status === 'ACCEPTED' && (
                <Button className="w-full" onClick={complete} disabled={saving}>
                  <CheckCircle className="mr-1 h-4 w-4" /> Danh dau hoan thanh
                </Button>
              )}

              {selected.status === 'REJECTED' && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <XCircle className="mr-1 inline h-4 w-4" /> Yeu cau da bi tu choi.
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Dong</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
