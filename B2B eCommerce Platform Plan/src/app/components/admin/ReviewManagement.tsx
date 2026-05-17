import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, MessageSquare, RefreshCw, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { adminReviewApi } from '../../services/adminBackendApi';

type ReviewRow = {
  id: string;
  productId?: string;
  orderId?: string;
  customerName: string;
  rating: number;
  title?: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ['PENDING', 'APPROVED', 'HIDDEN'];
const RATINGS = ['1', '2', '3', '4', '5'];

const formatDate = (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : '-';

function StatusPill({ status }: { status: string }) {
  const className = status === 'APPROVED'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : status === 'HIDDEN'
      ? 'border-slate-200 bg-slate-50 text-slate-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  return <Badge variant="outline" className={className}>{status}</Badge>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-3.5 w-3.5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'}`} />
      ))}
    </div>
  );
}

export function ReviewManagement() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [rating, setRating] = useState('all');
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = [
        ...(status === 'all' ? [] : [{ key: 'status', label: 'Status', value: status }]),
        ...(rating === 'all' ? [] : [{ key: 'rating', label: 'Rating', value: rating }]),
      ];
      const page = await adminReviewApi.getPaginated({ page: 1, pageSize: 100 }, undefined, filters, search || undefined);
      setRows(page.data as ReviewRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc danh gia');
    } finally {
      setLoading(false);
    }
  }, [rating, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter(row => row.status === 'PENDING').length,
    approved: rows.filter(row => row.status === 'APPROVED').length,
    hidden: rows.filter(row => row.status === 'HIDDEN').length,
    avg: rows.length ? Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / rows.length) * 10) / 10 : 0,
  }), [rows]);

  const applyAction = async (id: string, action: 'approve' | 'hide') => {
    setSaving(true);
    try {
      const updated = action === 'approve'
        ? await adminReviewApi.approve(id)
        : await adminReviewApi.hide(id);
      setRows(current => current.map(row => row.id === id ? updated as ReviewRow : row));
      setSelected(current => current?.id === id ? updated as ReviewRow : current);
      toast.success(action === 'approve' ? 'Da duyet danh gia' : 'Da an danh gia');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cap nhat danh gia that bai');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await adminReviewApi.delete(deleteId);
      setRows(current => current.filter(row => row.id !== deleteId));
      setSelected(current => current?.id === deleteId ? null : current);
      setDeleteId(null);
      toast.success('Da xoa danh gia');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xoa danh gia that bai');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Quan tri', href: '/admin' }, { label: 'Danh gia' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Quan ly danh gia</h1>
          <p className="text-muted-foreground">Duyet, an hoac xoa review theo moderation contract BE.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Lam moi
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card><CardContent className="p-4"><MessageSquare className="mb-2 h-4 w-4 text-blue-600" /><p className="text-muted-foreground">Tong</p><p className="text-xl">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><RefreshCw className="mb-2 h-4 w-4 text-amber-600" /><p className="text-muted-foreground">Pending</p><p className="text-xl">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" /><p className="text-muted-foreground">Approved</p><p className="text-xl">{stats.approved}</p></CardContent></Card>
        <Card><CardContent className="p-4"><EyeOff className="mb-2 h-4 w-4 text-slate-600" /><p className="text-muted-foreground">Hidden</p><p className="text-xl">{stats.hidden}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Star className="mb-2 h-4 w-4 fill-yellow-400 text-yellow-400" /><p className="text-muted-foreground">TB sao</p><p className="text-xl">{stats.avg}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tim khach hang, tieu de, noi dung..." />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full lg:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca trang thai</SelectItem>
              {STATUSES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca sao</SelectItem>
              {RATINGS.map(item => <SelectItem key={item} value={item}>{item} sao</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Khach hang</th>
                <th className="px-4 py-3 text-left">Danh gia</th>
                <th className="px-4 py-3 text-left">Noi dung</th>
                <th className="px-4 py-3 text-center">Trang thai</th>
                <th className="px-4 py-3 text-center">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>Dang tai...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>Khong co danh gia</td></tr>
              ) : rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><p className="font-medium">{row.customerName}</p><p className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</p></td>
                  <td className="px-4 py-3"><Stars rating={row.rating} /><p className="mt-1 text-xs text-muted-foreground">{row.title || '-'}</p></td>
                  <td className="px-4 py-3 max-w-md"><p className="line-clamp-2">{row.content}</p></td>
                  <td className="px-4 py-3 text-center"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
                      {row.status !== 'APPROVED' && <Button variant="ghost" size="sm" disabled={saving} onClick={() => applyAction(row.id, 'approve')}><CheckCircle2 className="h-4 w-4 text-emerald-600" /></Button>}
                      {row.status !== 'HIDDEN' && <Button variant="ghost" size="sm" disabled={saving} onClick={() => applyAction(row.id, 'hide')}><EyeOff className="h-4 w-4 text-slate-600" /></Button>}
                      <Button variant="ghost" size="sm" disabled={saving} onClick={() => setDeleteId(row.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi tiet danh gia</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">{selected.customerName}</p><Stars rating={selected.rating} /></div>
                <StatusPill status={selected.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Product ID</p><p>{selected.productId ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Order ID</p><p>{selected.orderId ?? '-'}</p></div>
                <div><p className="text-muted-foreground">Created</p><p>{formatDate(selected.createdAt)}</p></div>
                <div><p className="text-muted-foreground">Updated</p><p>{formatDate(selected.updatedAt)}</p></div>
              </div>
              <div><p className="text-muted-foreground">Tieu de</p><p>{selected.title || '-'}</p></div>
              <div><p className="text-muted-foreground">Noi dung</p><p className="rounded-md bg-muted p-3 whitespace-pre-wrap">{selected.content}</p></div>
              <div className="flex gap-2">
                {selected.status !== 'APPROVED' && <Button size="sm" disabled={saving} onClick={() => applyAction(selected.id, 'approve')}><CheckCircle2 className="mr-1 h-4 w-4" /> Duyet</Button>}
                {selected.status !== 'HIDDEN' && <Button size="sm" variant="outline" disabled={saving} onClick={() => applyAction(selected.id, 'hide')}><EyeOff className="mr-1 h-4 w-4" /> An</Button>}
                <Button size="sm" variant="destructive" disabled={saving} onClick={() => setDeleteId(selected.id)}><Trash2 className="mr-1 h-4 w-4" /> Xoa</Button>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Dong</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoa danh gia?</AlertDialogTitle>
            <AlertDialogDescription>Hanh dong nay xoa review tren BE va khong the hoan tac.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huy</AlertDialogCancel>
            <AlertDialogAction onClick={deleteReview}>Xoa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
