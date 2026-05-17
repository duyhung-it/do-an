import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Eye, ImageIcon, Monitor, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { adminBannerApi } from '../../services/adminBackendApi';

type BannerRow = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

const emptyForm = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  position: 'HOME',
  sortOrder: '0',
  isActive: true,
};

const positions = ['HOME', 'CATEGORY', 'PRODUCT', 'PROMOTION', 'POPUP'];

export function AdminBannerPage() {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<BannerRow | null>(null);
  const [editing, setEditing] = useState<BannerRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      setBanners(await adminBannerApi.getAll() as BannerRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc banner');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  const stats = useMemo(() => ({
    total: banners.length,
    active: banners.filter(item => item.isActive).length,
    inactive: banners.filter(item => !item.isActive).length,
    positions: new Set(banners.map(item => item.position)).size,
  }), [banners]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (banner: BannerRow) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      position: banner.position || 'HOME',
      sortOrder: String(banner.sortOrder ?? 0),
      isActive: banner.isActive,
    });
    setFormOpen(true);
  };

  const payload = () => ({
    title: form.title.trim(),
    imageUrl: form.imageUrl.trim(),
    linkUrl: form.linkUrl.trim() || undefined,
    position: form.position,
    sortOrder: Number(form.sortOrder || 0),
    isActive: form.isActive,
  });

  const saveBanner = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Title va imageUrl la bat buoc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminBannerApi.update(editing.id, payload());
        toast.success('Da cap nhat banner');
      } else {
        await adminBannerApi.create(payload());
        toast.success('Da tao banner');
      }
      setFormOpen(false);
      await loadBanners();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Luu banner that bai');
    } finally {
      setSaving(false);
    }
  };

  const toggleBanner = async (banner: BannerRow) => {
    try {
      await adminBannerApi.update(banner.id, {
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        position: banner.position,
        sortOrder: banner.sortOrder,
        isActive: !banner.isActive,
      });
      await loadBanners();
      toast.success('Da cap nhat trang thai banner');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cap nhat banner that bai');
    }
  };

  const deleteBanner = async (banner: BannerRow) => {
    if (!window.confirm(`Xoa banner "${banner.title}"?`)) return;
    try {
      await adminBannerApi.delete(banner.id);
      await loadBanners();
      toast.success('Da xoa banner');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xoa banner that bai');
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Banner' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2"><ImageIcon className="h-6 w-6 text-primary" /> Quan ly banner</h1>
          <p className="text-muted-foreground">CRUD banner theo contract BE: title, imageUrl, linkUrl, position, sortOrder, isActive.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBanners} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Lam moi
          </Button>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Them banner</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Monitor className="mb-2 h-5 w-5 text-blue-600" /><p className="text-muted-foreground">Tong banner</p><p className="text-xl font-semibold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Eye className="mb-2 h-5 w-5 text-emerald-600" /><p className="text-muted-foreground">Dang bat</p><p className="text-xl font-semibold">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Eye className="mb-2 h-5 w-5 text-slate-600" /><p className="text-muted-foreground">Dang tat</p><p className="text-xl font-semibold">{stats.inactive}</p></CardContent></Card>
        <Card><CardContent className="p-4"><ImageIcon className="mb-2 h-5 w-5 text-violet-600" /><p className="text-muted-foreground">Vi tri</p><p className="text-xl font-semibold">{stats.positions}</p></CardContent></Card>
      </div>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Dang tai banner...</CardContent></Card>
      ) : banners.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Chua co banner</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map(banner => (
            <Card key={banner.id} className={!banner.isActive ? 'opacity-70' : ''}>
              <div className="relative aspect-[16/6] bg-muted">
                <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 flex gap-2">
                  <Badge className="bg-black/70 text-white">{banner.position}</Badge>
                  <Badge variant={banner.isActive ? 'default' : 'secondary'}>{banner.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setPreviewItem(banner)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(banner)}><Edit2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{banner.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{banner.linkUrl || '-'}</p>
                  </div>
                  <Switch checked={banner.isActive} onCheckedChange={() => toggleBanner(banner)} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Sort order: {banner.sortOrder}</span>
                  <span>{banner.updatedAt ? new Date(banner.updatedAt).toLocaleDateString('vi-VN') : '-'}</span>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteBanner(banner)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Xoa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing ? 'Sua banner' : 'Them banner'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2"><Label>Title *</Label><Input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></div>
            <div className="grid gap-2"><Label>Image URL *</Label><Input value={form.imageUrl} onChange={event => setForm(current => ({ ...current, imageUrl: event.target.value }))} /></div>
            <div className="grid gap-2"><Label>Link URL</Label><Input value={form.linkUrl} onChange={event => setForm(current => ({ ...current, linkUrl: event.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Position</Label>
                <Select value={form.position} onValueChange={value => setForm(current => ({ ...current, position: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{positions.map(position => <SelectItem key={position} value={position}>{position}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Sort order</Label><Input type="number" value={form.sortOrder} onChange={event => setForm(current => ({ ...current, sortOrder: event.target.value }))} /></div>
            </div>
            <label className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={value => setForm(current => ({ ...current, isActive: value }))} />
              Dang hoat dong
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Huy</Button>
            <Button onClick={saveBanner} disabled={saving}>{saving ? 'Dang luu...' : 'Luu'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{previewItem?.title}</DialogTitle></DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <img src={previewItem.imageUrl} alt={previewItem.title} className="max-h-80 w-full rounded-md object-cover" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Position</p><p>{previewItem.position}</p></div>
                <div><p className="text-muted-foreground">Status</p><p>{previewItem.isActive ? 'ACTIVE' : 'INACTIVE'}</p></div>
                <div><p className="text-muted-foreground">Link</p><p>{previewItem.linkUrl || '-'}</p></div>
                <div><p className="text-muted-foreground">Sort order</p><p>{previewItem.sortOrder}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
