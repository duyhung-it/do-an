// ============================================================
// DocumentCenterPage â€” Trung tÃ¢m tÃ i liá»‡u B2B
// NhÃ³m 37: B20-B22 (16 bÆ°á»›c)
// DÃ¹ng chung cho Buyer (/documents) vÃ  Seller (/seller/documents)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, FileSpreadsheet, FileImage, File, FolderOpen,
  Upload, Download, Share2, Trash2, Eye, Search, Filter,
  Plus, Tag, Clock, User, ChevronRight, X, MoreHorizontal,
  CheckCircle, Archive, Link2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { EmptyState } from '../shared/EmptyState';
import { documentApi } from '../../services/documentApi';
import { useAuth } from '../../context/AuthContext';
import type { Document as BizDocument, DocCategory } from '../../types';

// Helper: map fileType â†’ MIME-like string for icon
function toMime(fileType: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  return map[fileType.toLowerCase()] ?? 'application/octet-stream';
}
import { toast } from 'sonner';

// ---- Types ----
type ViewMode = 'grid' | 'list';

interface DocFilter {
  category: DocCategory | 'Táº¥t cáº£';
  dateFrom: string;
  dateTo: string;
  fileType: string;
  tags: string[];
  search: string;
}

// ---- File Icon ----
function FileIcon({ mimeType, fileType, size = 'md' }: { mimeType?: string; fileType?: string; size?: 'sm' | 'md' | 'lg' }) {
  const mime = mimeType ?? toMime(fileType ?? '');
  const sz = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  if (mime.includes('pdf')) return <FileText className={`${sz} text-red-500`} />;
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv'))
    return <FileSpreadsheet className={`${sz} text-green-600`} />;
  if (mime.includes('image')) return <FileImage className={`${sz} text-blue-500`} />;
  if (mime.includes('word') || mime.includes('document'))
    return <FileText className={`${sz} text-blue-700`} />;
  return <File className={`${sz} text-gray-400`} />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const CATEGORIES: (DocCategory | 'Táº¥t cáº£')[] = [
  'Táº¥t cáº£', 'Há»£p Ä‘á»“ng', 'HÃ³a Ä‘Æ¡n', 'Chá»©ng chá»‰', 'BÃ¡o giÃ¡', 'Phiáº¿u xuáº¥t', 'GRN', 'KhÃ¡c',
];

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  'Há»£p Ä‘á»“ng': FileText,
  'HÃ³a Ä‘Æ¡n': FileSpreadsheet,
  'Chá»©ng chá»‰': CheckCircle,
  'BÃ¡o giÃ¡': FileText,
  'Phiáº¿u xuáº¥t': Archive,
  'GRN': FolderOpen,
  'KhÃ¡c': File,
};

const MOCK_TAGS = ['quan-trong', 'can-ky', 'het-han', 'luu-tru', 'chia-se'];

// ---- Upload Dialog ----
function UploadDialog({ onClose, onUpload }: { onClose: () => void; onUpload: (doc: BizDocument) => void }) {
  const [form, setForm] = useState({
    name: '',
    category: 'KhÃ¡c' as DocCategory,
    tags: '',
    description: '',
    fileSize: 0,
    mimeType: 'application/pdf',
    fileName: '',
  });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file: File) => {
    setForm(f => ({
      ...f,
      name: f.name || file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Vui lÃ²ng nháº­p tÃªn tÃ i liá»‡u'); return; }
    setUploading(true);
    try {
      const doc = await documentApi.upload({
        name: form.name,
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        description: form.description,
        fileSize: form.fileSize || 102400,
        mimeType: form.mimeType,
        fileName: form.fileName || form.name + '.pdf',
        fileUrl: '#',
      });
      toast.success('Táº£i lÃªn thÃ nh cÃ´ng!');
      onUpload(doc as BizDocument);
      onClose();
    } catch {
      toast.error('Lá»—i táº£i lÃªn');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Táº£i tÃ i liá»‡u lÃªn</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 space-y-4">
          {/* Drag-drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            {form.fileName ? (
              <p className="font-medium text-primary">{form.fileName}</p>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">KÃ©o tháº£ file vÃ o Ä‘Ã¢y</p>
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>Chá»n file</span>
                  </Button>
                  <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                </label>
              </>
            )}
            {form.fileSize > 0 && <p className="text-sm text-muted-foreground mt-1">{formatFileSize(form.fileSize)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">TÃªn tÃ i liá»‡u *</label>
              <Input placeholder="Nháº­p tÃªn..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Danh má»¥c</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as DocCategory }))}
              >
                {CATEGORIES.filter(c => c !== 'Táº¥t cáº£').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tags (phÃ¢n cÃ¡ch báº±ng dáº¥u pháº©y)</label>
            <Input placeholder="vd: hop-dong, quan-trong, 2026" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">MÃ´ táº£</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
              rows={2}
              placeholder="Ghi chÃº vá» tÃ i liá»‡u..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t justify-end">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Huá»·</Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Äang táº£i...' : 'Táº£i lÃªn'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Detail Dialog ----
function DocDetailDialog({ doc, onClose, onDelete }: { doc: BizDocument; onClose: () => void; onDelete: (id: string) => void }) {
  const handleDownload = () => {
    toast.success(`Äang táº£i xuá»‘ng: ${doc.fileName}`);
  };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?doc=' + doc.id)
      .then(() => toast.success('ÄÃ£ sao chÃ©p link chia sáº»!'))
      .catch(() => toast.info('Link: ' + window.location.href));
  };
  const handleArchive = async () => {
    await documentApi.update(doc.id, { isArchived: !doc.isArchived });
    toast.success(doc.isArchived ? 'ÄÃ£ bá» lÆ°u trá»¯' : 'ÄÃ£ lÆ°u trá»¯ tÃ i liá»‡u');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Chi tiáº¿t tÃ i liá»‡u</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <FileIcon fileType={doc.fileType} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold truncate">{doc.name}</p>
              <p className="text-sm text-muted-foreground">{doc.fileName}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Danh má»¥c:</span>
              <Badge variant="outline">{doc.category}</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>NgÃ y táº£i lÃªn: {formatDate(doc.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>NgÆ°á»i táº£i: {doc.uploadedByName}</span>
            </div>
            {doc.version && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <File className="h-4 w-4" />
                <span>PhiÃªn báº£n: v{doc.version}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {doc.description && (
            <p className="text-sm text-muted-foreground border-l-2 pl-3">{doc.description}</p>
          )}

          {/* Version history */}
          {doc.versionHistory && doc.versionHistory.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Lá»‹ch sá»­ phiÃªn báº£n</p>
              <div className="space-y-1">
                {doc.versionHistory.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-muted-foreground p-1.5 rounded bg-muted/30">
                    <span>v{v.version} â€” {v.uploadedByName}</span>
                    <span>{formatDate(v.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 p-4 border-t">
          <Button size="sm" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-1" /> Táº£i xuá»‘ng
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" /> Chia sáº»
          </Button>
          <Button size="sm" variant="outline" onClick={handleArchive}>
            <Archive className="h-4 w-4 mr-1" /> {doc.isArchived ? 'Bá» lÆ°u trá»¯' : 'LÆ°u trá»¯'}
          </Button>
          <Button
            size="sm" variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => { onDelete(doc.id); onClose(); }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> XoÃ¡
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Doc Card (Grid View) ----
function DocCard({ doc, onView, onDelete }: {
  doc: BizDocument;
  onView: (doc: BizDocument) => void;
  onDelete: (id: string) => void;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group relative" onClick={() => onView(doc)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <FileIcon fileType={doc.fileType} size="md" />
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">{doc.category}</Badge>
            <div className="relative">
              <Button
                variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => { e.stopPropagation(); setMenu(!menu); }}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
              {menu && (
                <div className="absolute right-0 top-6 bg-background border rounded-lg shadow-lg py-1 z-10 w-36" onClick={e => e.stopPropagation()}>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2" onClick={() => { toast.success('Äang táº£i xuá»‘ng...'); setMenu(false); }}>
                    <Download className="h-3.5 w-3.5" /> Táº£i xuá»‘ng
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2" onClick={() => { navigator.clipboard.writeText('#'); toast.success('ÄÃ£ sao chÃ©p link!'); setMenu(false); }}>
                    <Link2 className="h-3.5 w-3.5" /> Copy link
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted text-destructive flex items-center gap-2" onClick={() => { onDelete(doc.id); setMenu(false); }}>
                    <Trash2 className="h-3.5 w-3.5" /> XoÃ¡
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="font-medium truncate mb-1">{doc.name}</p>
        <p className="text-sm text-muted-foreground truncate mb-2">{doc.fileName}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>{formatDate(doc.createdAt)}</span>
        </div>

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {doc.tags.slice(0, 2).map(t => (
              <Badge key={t} variant="secondary" className="text-xs py-0 px-1.5">{t}</Badge>
            ))}
            {doc.tags.length > 2 && <Badge variant="secondary" className="text-xs py-0 px-1.5">+{doc.tags.length - 2}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Doc Row (List View) ----
function DocRow({ doc, onView, onDelete }: {
  doc: BizDocument;
  onView: (doc: BizDocument) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg cursor-pointer transition-colors"
      onClick={() => onView(doc)}
    >
      <FileIcon fileType={doc.fileType} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{doc.name}</p>
        <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">{doc.category}</Badge>
      <span className="text-sm text-muted-foreground shrink-0 w-16 text-right">{formatFileSize(doc.fileSize)}</span>
      <span className="text-sm text-muted-foreground shrink-0 w-24 text-right">{formatDate(doc.createdAt)}</span>
      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success('Äang táº£i xuá»‘ng...')}>
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(doc.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---- Stats Cards ----
function DocStats({ docs }: { docs: BizDocument[] }) {
  const stats = CATEGORIES.filter(c => c !== 'Táº¥t cáº£').map(cat => ({
    name: cat,
    count: docs.filter(d => d.category === cat).length,
    Icon: CATEGORY_ICONS[cat as string] ?? File,
  }));
  const total = docs.length;
  const totalSize = docs.reduce((s, d) => s + (d.fileSize || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <Card className="col-span-2 sm:col-span-2">
        <CardContent className="p-3">
          <p className="text-muted-foreground text-xs mb-1">Tá»•ng tÃ i liá»‡u</p>
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(totalSize)}</p>
        </CardContent>
      </Card>
      {stats.map(s => (
        <Card key={s.name} className="col-span-1">
          <CardContent className="p-3">
            <s.Icon className="h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{s.count}</p>
            <p className="text-xs text-muted-foreground truncate">{s.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---- Main Page ----
export function DocumentCenterPage({ mode = 'buyer' }: { mode?: 'buyer' | 'seller' }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<BizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<BizDocument | null>(null);
  const [filter, setFilter] = useState<DocFilter>({
    category: 'Táº¥t cáº£',
    dateFrom: '',
    dateTo: '',
    fileType: '',
    tags: [],
    search: '',
  });

  const breadcrumb = mode === 'seller'
    ? [{ label: 'KÃªnh ngÆ°á»i bÃ¡n', href: '/seller' }, { label: 'Trung tÃ¢m tÃ i liá»‡u' }]
    : [{ label: 'Trang chá»§', href: '/' }, { label: 'TÃ i liá»‡u' }];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentApi.getByUser(
        user?.id ?? '',
        { page: 1, pageSize: 100 },
        { field: 'createdAt', direction: 'desc' },
      );
      setDocs(res.data as BizDocument[]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Filter
  const filtered = docs.filter(doc => {
    if (filter.category !== 'Táº¥t cáº£' && doc.category !== filter.category) return false;
    if (filter.search && !doc.name.toLowerCase().includes(filter.search.toLowerCase()) &&
        !doc.fileName.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.fileType) {
      const ft = doc.fileType ?? '';
      if (filter.fileType === 'pdf' && ft !== 'pdf') return false;
      if (filter.fileType === 'excel' && !['xlsx','xls','csv'].includes(ft)) return false;
      if (filter.fileType === 'image' && !['png','jpg','jpeg','gif'].includes(ft)) return false;
    }
    if (filter.tags.length > 0 && !filter.tags.some(t => doc.tags.includes(t))) return false;
    if (filter.dateFrom && doc.createdAt < filter.dateFrom) return false;
    if (filter.dateTo && doc.createdAt > filter.dateTo) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      await documentApi.delete(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success('ÄÃ£ xoÃ¡ tÃ i liá»‡u');
    } catch {
      toast.error('Lá»—i xoÃ¡ tÃ i liá»‡u');
    }
  };

  const handleUpload = (doc: BizDocument) => {
    setDocs(prev => [doc, ...prev]);
  };

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={breadcrumb} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Trung tÃ¢m tÃ i liá»‡u
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quáº£n lÃ½ táº¥t cáº£ há»£p Ä‘á»“ng, hÃ³a Ä‘Æ¡n, chá»©ng chá»‰ vÃ  tÃ i liá»‡u kinh doanh
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-1" /> Táº£i lÃªn tÃ i liá»‡u
        </Button>
      </div>

      {/* Stats */}
      <DocStats docs={docs} />

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-4">
        {/* Sidebar â€” Category Tree */}
        <div className="hidden lg:block w-48 shrink-0">
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm">Danh má»¥c</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-0.5">
                {CATEGORIES.map(cat => {
                  const count = cat === 'Táº¥t cáº£' ? docs.length : docs.filter(d => d.category === cat).length;
                  const Icon = cat === 'Táº¥t cáº£' ? FolderOpen : (CATEGORY_ICONS[cat as string] ?? File);
                  return (
                    <button
                      key={cat}
                      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${filter.category === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => setFilter(f => ({ ...f, category: cat }))}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="truncate">{cat}</span>
                      </span>
                      <span className={`text-xs ${filter.category === cat ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="TÃ¬m tÃªn, file..."
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              />
            </div>

            {/* Mobile category select */}
            <select
              className="lg:hidden border rounded-md px-2 py-1.5 text-sm bg-background"
              value={filter.category}
              onChange={e => setFilter(f => ({ ...f, category: e.target.value as DocCategory | 'Táº¥t cáº£' }))}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              className="border rounded-md px-2 py-1.5 text-sm bg-background"
              value={filter.fileType}
              onChange={e => setFilter(f => ({ ...f, fileType: e.target.value }))}
            >
              <option value="">Táº¥t cáº£ loáº¡i file</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="image">áº¢nh</option>
            </select>

            <Input
              type="date"
              className="w-auto"
              value={filter.dateFrom}
              onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
            />
            <Input
              type="date"
              className="w-auto"
              value={filter.dateTo}
              onChange={e => setFilter(f => ({ ...f, dateTo: e.target.value }))}
            />

            {/* Tags filter */}
            <div className="flex gap-1 flex-wrap">
              {MOCK_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={filter.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setFilter(f => ({
                    ...f,
                    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
                  }))}
                >
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* View toggle */}
            <div className="ml-auto flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className="h-7 w-7 p-0" onClick={() => setViewMode('grid')}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                  <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
              </Button>
              <Button
                size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'}
                className="h-7 w-7 p-0" onClick={() => setViewMode('list')}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                  <rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/>
                  <rect x="1" y="12" width="14" height="2" rx="1"/>
                </svg>
              </Button>
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{filtered.length} tÃ i liá»‡u</span>
            {(filter.search || filter.category !== 'Táº¥t cáº£' || filter.tags.length > 0) && (
              <Button
                variant="ghost" size="sm" className="h-6 text-xs"
                onClick={() => setFilter({ category: 'Táº¥t cáº£', dateFrom: '', dateTo: '', fileType: '', tags: [], search: '' })}
              >
                <X className="h-3 w-3 mr-1" /> XoÃ¡ bá»™ lá»c
              </Button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-10 w-10" />}
              title="ChÆ°a cÃ³ tÃ i liá»‡u nÃ o"
              description="Táº£i lÃªn tÃ i liá»‡u Ä‘áº§u tiÃªn cá»§a báº¡n Ä‘á»ƒ báº¯t Ä‘áº§u"
              action={<Button onClick={() => setShowUpload(true)}><Plus className="h-4 w-4 mr-1" /> Táº£i lÃªn ngay</Button>}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(doc => (
                <DocCard key={doc.id} doc={doc} onView={setSelectedDoc} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-2 space-y-0">
                <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground font-medium border-b mb-1">
                  <span className="flex-1">TÃªn tÃ i liá»‡u</span>
                  <span className="w-20 shrink-0">Danh má»¥c</span>
                  <span className="w-16 text-right shrink-0">KÃ­ch thÆ°á»›c</span>
                  <span className="w-24 text-right shrink-0">NgÃ y táº¡o</span>
                  <span className="w-16 shrink-0"></span>
                </div>
                {filtered.map(doc => (
                  <DocRow key={doc.id} doc={doc} onView={setSelectedDoc} onDelete={handleDelete} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      {selectedDoc && <DocDetailDialog doc={selectedDoc} onClose={() => setSelectedDoc(null)} onDelete={handleDelete} />}
    </div>
  );
}
