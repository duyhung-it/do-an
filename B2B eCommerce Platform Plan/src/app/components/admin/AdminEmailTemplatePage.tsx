// ============================================================
// AdminEmailTemplatePage — Quản lý Email Templates
// Route: /admin/email-templates
// Wired to: GET/POST/PATCH/DELETE /api/v1/admin/email-templates
//           POST /api/v1/admin/email-templates/{id}/preview
// BE returns: { id, templateKey, subject, body, isActive, updatedAt }
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Mail, Eye, Edit2, Send, Plus, Search, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { adminEmailTemplateApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';

interface BeTemplate {
  id: string;
  templateKey: string;
  subject: string;
  body: string;
  isActive: boolean;
  updatedAt: string;
}

const categoryColor: Record<string, string> = {
  order: 'bg-blue-50 text-blue-700',
  rfq: 'bg-indigo-50 text-indigo-700',
  payment: 'bg-red-50 text-red-700',
  auth: 'bg-green-50 text-green-700',
  trade_in: 'bg-orange-50 text-orange-700',
  warranty: 'bg-purple-50 text-purple-700',
  system: 'bg-gray-50 text-gray-700',
};

const categoryLabel: Record<string, string> = {
  order: 'Đơn hàng', rfq: 'Báo giá', payment: 'Thanh toán', auth: 'Xác thực',
  trade_in: 'Thu cũ', warranty: 'Bảo hành', system: 'Hệ thống',
};

function categoryFromKey(key: string): string {
  if (key.startsWith('order_')) return 'order';
  if (key.startsWith('rfq_') || key.startsWith('quotation_')) return 'rfq';
  if (key.startsWith('payment_') || key.startsWith('invoice_')) return 'payment';
  if (key.startsWith('welcome') || key.startsWith('verify') || key.startsWith('reset_')) return 'auth';
  if (key.startsWith('trade_in_') || key.startsWith('trade')) return 'trade_in';
  if (key.startsWith('warranty_')) return 'warranty';
  return 'system';
}

export function AdminEmailTemplatePage() {
  const [templates, setTemplates] = useState<BeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<BeTemplate | null>(null);
  const [previewItem, setPreviewItem] = useState<BeTemplate | null>(null);
  const [previewResult, setPreviewResult] = useState<{ subject: string; body: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BeTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ templateKey: '', subject: '', body: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminEmailTemplateApi.getAll();
      setTemplates(data);
    } catch {
      toast.error('Không thể tải email templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = templates.filter(t =>
    t.templateKey.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!createForm.templateKey.trim() || !createForm.subject.trim() || !createForm.body.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      await adminEmailTemplateApi.create(createForm);
      toast.success('Đã tạo email template');
      setShowCreate(false);
      setCreateForm({ templateKey: '', subject: '', body: '', isActive: true });
      fetchData();
    } catch (err: any) {
      toast.error(err.message ?? 'Tạo template thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (item: BeTemplate) => {
    if (!item.subject.trim() || !item.body.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      await adminEmailTemplateApi.update(item.id, {
        templateKey: item.templateKey,
        subject: item.subject,
        body: item.body,
        isActive: item.isActive,
      });
      toast.success('Đã lưu template email');
      setEditItem(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message ?? 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async (t: BeTemplate) => {
    setPreviewItem(t);
    setPreviewResult(null);
    setPreviewLoading(true);
    try {
      const result = await adminEmailTemplateApi.preview(t.id, {});
      setPreviewResult(result);
    } catch {
      setPreviewResult({ subject: t.subject, body: t.body });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminEmailTemplateApi.delete(deleteTarget.id);
      toast.success('Đã xóa template');
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message ?? 'Xóa thất bại');
    }
  };

  const categoryCounts = ['order', 'payment', 'auth', 'warranty', 'trade_in'].reduce((acc, cat) => {
    acc[cat] = templates.filter(t => categoryFromKey(t.templateKey) === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Email Templates' }]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý nội dung email tự động gửi cho người dùng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Thêm template</Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['order', 'payment', 'auth', 'warranty', 'trade_in'] as const).map(cat => (
          <Card key={cat} className="text-center p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{categoryLabel[cat]}</p>
            <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{categoryCounts[cat] ?? 0}</p>
            <p className="text-xs text-muted-foreground">templates</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm template key, subject..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Template list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Không tìm thấy email template nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const cat = categoryFromKey(t.templateKey);
            return (
              <Card key={t.id} className={`transition-all duration-200 hover:shadow-md ${!t.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${t.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Mail className={`h-5 w-5 ${t.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{t.templateKey}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[cat] ?? categoryColor.system}`}>{categoryLabel[cat] ?? cat}</span>
                        {t.isActive
                          ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3 w-3" />Đang bật</span>
                          : <span className="flex items-center gap-1 text-xs text-muted-foreground"><AlertCircle className="h-3 w-3" />Đang tắt</span>
                        }
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Cập nhật: {t.updatedAt?.slice(0, 10) ?? '—'}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => handlePreview(t)} title="Xem trước"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditItem({ ...t })} title="Chỉnh sửa"><Edit2 className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(t)} title="Xóa"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => { setPreviewItem(null); setPreviewResult(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xem trước: {previewItem?.templateKey}</DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : previewResult && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">{previewResult.subject}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Nội dung</p>
                <pre className="text-sm whitespace-pre-wrap font-sans">{previewResult.body}</pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa: {editItem?.templateKey}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Subject</Label>
                <Input value={editItem.subject} onChange={e => setEditItem({ ...editItem, subject: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Nội dung (dùng {`{{varName}}`} cho biến)</Label>
                <Textarea rows={8} value={editItem.body} onChange={e => setEditItem({ ...editItem, body: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="templateActive" checked={editItem.isActive} onChange={e => setEditItem({ ...editItem, isActive: e.target.checked })} />
                <Label htmlFor="templateActive" className="cursor-pointer">Đang kích hoạt</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Huỷ</Button>
            <Button disabled={saving} onClick={() => editItem && handleSave(editItem)}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Thêm template mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Template Key *</Label>
              <Input value={createForm.templateKey} onChange={e => setCreateForm(p => ({ ...p, templateKey: e.target.value }))} placeholder="vd: order_cancelled" />
            </div>
            <div className="space-y-1">
              <Label>Subject *</Label>
              <Input value={createForm.subject} onChange={e => setCreateForm(p => ({ ...p, subject: e.target.value }))} placeholder="Tiêu đề email" />
            </div>
            <div className="space-y-1">
              <Label>Nội dung * (dùng {`{{varName}}`} cho biến)</Label>
              <Textarea rows={8} value={createForm.body} onChange={e => setCreateForm(p => ({ ...p, body: e.target.value }))} placeholder="Nội dung email..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="createActive" checked={createForm.isActive} onChange={e => setCreateForm(p => ({ ...p, isActive: e.target.checked }))} />
              <Label htmlFor="createActive" className="cursor-pointer">Kích hoạt ngay</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button disabled={saving} onClick={handleCreate}>
              {saving ? 'Đang tạo...' : 'Thêm template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa template <strong>"{deleteTarget?.templateKey}"</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Huỷ</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
