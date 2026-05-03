// ============================================================
// Trung tâm tài liệu — Dùng chung Buyer & Seller (Nhóm 37B)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, FileText, FileSpreadsheet, Image, File, Upload, Search, Download,
  Share2, Trash2, Archive, Eye, X, Plus, Grid3X3, List, Clock, Tag,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// Dialog components with DialogDescription for accessibility
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { copyToClipboard } from '../ui/utils';
import { AppBreadcrumb } from './AppBreadcrumb';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { documentApi } from '../../services/documentApi';
import { toast } from 'sonner';
import type { Document, DocCategory, DocStatus, PaginationParams, SortParams, ColumnConfig } from '../../types';

// --- Constants ---
const DOC_CATEGORIES: { value: DocCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'Hợp đồng', label: 'Hợp đồng', icon: <FileText className="h-4 w-4" /> },
  { value: 'Hoá đơn', label: 'Hoá đơn', icon: <FileText className="h-4 w-4" /> },
  { value: 'Chứng chỉ', label: 'Chứng chỉ', icon: <FileText className="h-4 w-4" /> },
  { value: 'Báo giá', label: 'Báo giá', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: 'Phiếu xuất', label: 'Phiếu xuất', icon: <FileText className="h-4 w-4" /> },
  { value: 'GRN', label: 'GRN', icon: <FileText className="h-4 w-4" /> },
  { value: 'Khác', label: 'Khác', icon: <File className="h-4 w-4" /> },
];

const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'docx', label: 'Word' },
  { value: 'png', label: 'Ảnh PNG' },
  { value: 'jpg', label: 'Ảnh JPG' },
];

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
    case 'xlsx': return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    case 'docx': return <FileText className="h-8 w-8 text-blue-600" />;
    case 'png': case 'jpg': return <Image className="h-8 w-8 text-purple-500" />;
    default: return <File className="h-8 w-8 text-muted-foreground" />;
  }
}

function getFileIconSmall(fileType: string) {
  switch (fileType) {
    case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
    case 'xlsx': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    case 'docx': return <FileText className="h-4 w-4 text-blue-600" />;
    case 'png': case 'jpg': return <Image className="h-4 w-4 text-purple-500" />;
    default: return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

// --- Upload Dialog ---
function UploadDialog({ open, onOpenChange, onUpload }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpload: (data: Partial<Document>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocCategory>('Khác');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Vui lòng nhập tên tài liệu'); return; }
    setSaving(true);
    try {
      await onUpload({
        name: name.trim(),
        fileName: fileName || `${name.trim()}.${fileType}`,
        fileType,
        fileSize: Math.floor(Math.random() * 5_000_000) + 100_000,
        category,
        tags,
        description,
      });
      setName(''); setCategory('Khác'); setDescription(''); setTags([]); setFileName('');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Tải lên tài liệu
          </DialogTitle>
          <DialogDescription>
            Tải lên hợp đồng, báo giá, hoặc tài liệu quan trọng khác
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Drop zone giả lập */}
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => {
              const ext = fileType || 'pdf';
              setFileName(`TaiLieu_${Date.now()}.${ext}`);
              toast.info('Đã chọn tệp (giả lập)');
            }}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Kéo thả hoặc click để chọn tệp</p>
            {fileName && <Badge variant="secondary" className="mt-2">{fileName}</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Tên tài liệu *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên tài liệu" />
            </div>
            <div>
              <Label>Danh mục</Label>
              <Select value={category} onValueChange={v => setCategory(v as DocCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Loại tệp</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FILE_TYPE_OPTIONS.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Thẻ (tags)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Nhập tag, nhấn Enter"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter(x => x !== t))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả ngắn về tài liệu" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang tải...' : 'Tải lên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Detail Dialog ---
function DocumentDetailDialog({ doc, open, onOpenChange }: {
  doc: Document | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [versions, setVersions] = useState<{ version: number; updatedBy: string; updatedAt: string; note: string }[]>([]);

  useEffect(() => {
    if (doc) {
      documentApi.getVersionHistory(doc.id).then(setVersions);
    }
  }, [doc]);

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Chi tiết tài liệu
          </DialogTitle>
          <DialogDescription>Xem thông tin và lịch sử tài liệu</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Icon + info */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-lg">
              {getFileIcon(doc.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate">{doc.name}</h4>
              <p className="text-sm text-muted-foreground">{doc.fileName}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{doc.category}</Badge>
                <Badge variant="secondary">{doc.fileType.toUpperCase()}</Badge>
                <StatusBadge status={doc.status} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Kích thước:</span>{' '}
              <span>{documentApi.formatFileSize(doc.fileSize)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phiên bản:</span>{' '}
              <span>v{doc.version}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Người tải:</span>{' '}
              <span>{doc.uploadedByName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Công ty:</span>{' '}
              <span>{doc.companyName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ngày tạo:</span>{' '}
              <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cập nhật:</span>{' '}
              <span>{new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {doc.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mô tả:</p>
              <p className="text-sm">{doc.description}</p>
            </div>
          )}

          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.map(t => (
                <Badge key={t} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" /> {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Version history */}
          {versions.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Lịch sử phiên bản:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {versions.map(v => (
                  <div key={v.version} className="flex items-center gap-3 text-sm p-2 bg-muted/30 rounded">
                    <Badge variant="outline" className="shrink-0">v{v.version}</Badge>
                    <div className="flex-1 min-w-0">
                      <span>{v.note}</span>
                      <span className="text-muted-foreground ml-2">— {v.updatedBy}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(v.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---
export function DocumentCenterPage() {
  const { user } = useAuth();

  // Data
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; byCategory: { category: DocCategory; count: number }[]; totalSize: number; recentCount: number } | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | ''>('');
  const [searchText, setSearchText] = useState('');
  const [filterFileType, setFilterFileType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination & sort
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Dialogs
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [result, st] = await Promise.all([
        documentApi.getByUser(
          user?.id || '',
          pagination,
          sort,
          {
            category: selectedCategory || undefined,
            fileType: filterFileType || undefined,
            dateFrom: filterDateFrom || undefined,
            dateTo: filterDateTo || undefined,
          },
          searchText || undefined,
        ),
        documentApi.getStats(user?.id),
      ]);
      setDocuments(result.data);
      setTotalItems(result.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [user?.id, pagination, sort, selectedCategory, searchText, filterFileType, filterDateFrom, filterDateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Actions
  const handleUpload = async (data: Partial<Document>) => {
    await documentApi.upload({
      ...data,
      uploadedBy: user?.id || 'user-001',
      uploadedByName: user?.fullName || 'Người dùng',
      companyId: 'buyer-001',
      companyName: user?.companyName || 'Công ty',
    });
    toast.success('Đã tải lên tài liệu thành công');
    fetchData();
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Bạn có chắc muốn xoá "${doc.name}"?`)) return;
    await documentApi.delete(doc.id);
    toast.success('Đã xoá tài liệu');
    fetchData();
  };

  const handleArchive = async (doc: Document) => {
    await documentApi.update(doc.id, { status: doc.status === 'Lưu trữ' ? 'Hiệu lực' : 'Lưu trữ' });
    toast.success(doc.status === 'Lưu trữ' ? 'Đã khôi phục tài liệu' : 'Đã lưu trữ tài liệu');
    fetchData();
  };

  const handleDownload = (doc: Document) => {
    toast.success(`Đang tải xuống "${doc.fileName}"...`);
  };

  const handleShare = (doc: Document) => {
    copyToClipboard(`${window.location.origin}/documents?id=${doc.id}`);
    toast.success('Đã sao chép liên kết tài liệu');
  };

  // Columns
  const columns: (ColumnConfig & { render?: (item: Document) => React.ReactNode })[] = [
    {
      key: 'name', label: 'Tên tài liệu', visible: true, sortable: true,
      render: (d: Document) => (
        <div className="flex items-center gap-2 min-w-0">
          {getFileIconSmall(d.fileType)}
          <div className="min-w-0">
            <p className="truncate">{d.name}</p>
            <p className="text-xs text-muted-foreground truncate">{d.fileName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category', label: 'Danh mục', visible: true, sortable: true,
      render: (d: Document) => <Badge variant="outline">{d.category}</Badge>,
    },
    {
      key: 'fileSize', label: 'Kích thước', visible: true, sortable: true,
      render: (d: Document) => <span className="text-sm">{documentApi.formatFileSize(d.fileSize)}</span>,
    },
    {
      key: 'version', label: 'Phiên bản', visible: true, sortable: true,
      render: (d: Document) => <span className="text-sm">v{d.version}</span>,
    },
    {
      key: 'uploadedByName', label: 'Người tải', visible: true, sortable: true,
    },
    {
      key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (d: Document) => <StatusBadge status={d.status} />,
    },
    {
      key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true,
      render: (d: Document) => <span className="text-sm">{new Date(d.createdAt).toLocaleDateString('vi-VN')}</span>,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Tài liệu' }]} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          <h1>Trung tâm tài liệu</h1>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="mr-2 h-4 w-4" /> Tải lên
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><FolderOpen className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Tổng tài liệu</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Clock className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl">{stats.recentCount}</p>
                <p className="text-sm text-muted-foreground">Tuần này</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><File className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl">{documentApi.formatFileSize(stats.totalSize)}</p>
                <p className="text-sm text-muted-foreground">Dung lượng</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Tag className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl">{stats.byCategory.filter(c => c.count > 0).length}</p>
                <p className="text-sm text-muted-foreground">Danh mục</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar danh mục */}
        <div className="lg:w-[250px] shrink-0">
          <Card>
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground mb-2 px-2">Danh mục</p>
              <button
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                  selectedCategory === '' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
                onClick={() => { setSelectedCategory(''); setPagination({ ...pagination, page: 1 }); }}
              >
                <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4" /> Tất cả</span>
                {stats && <Badge variant="secondary" className="text-xs">{stats.total}</Badge>}
              </button>
              {DOC_CATEGORIES.map(cat => {
                const count = stats?.byCategory.find(c => c.category === cat.value)?.count || 0;
                return (
                  <button
                    key={cat.value}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                      selectedCategory === cat.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => { setSelectedCategory(cat.value); setPagination({ ...pagination, page: 1 }); }}
                  >
                    <span className="flex items-center gap-2">{cat.icon} {cat.label}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0">
          {/* FilterBar */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tài liệu..."
                      className="pl-9"
                      value={searchText}
                      onChange={e => { setSearchText(e.target.value); setPagination({ ...pagination, page: 1 }); }}
                    />
                  </div>
                </div>
                <Select value={filterFileType} onValueChange={v => { setFilterFileType(v === 'all' ? '' : v); setPagination({ ...pagination, page: 1 }); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Loại tệp" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {FILE_TYPE_OPTIONS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  className="w-[140px]"
                  value={filterDateFrom}
                  onChange={e => { setFilterDateFrom(e.target.value); setPagination({ ...pagination, page: 1 }); }}
                  placeholder="Từ ngày"
                />
                <Input
                  type="date"
                  className="w-[140px]"
                  value={filterDateTo}
                  onChange={e => { setFilterDateTo(e.target.value); setPagination({ ...pagination, page: 1 }); }}
                  placeholder="Đến ngày"
                />
                {/* View toggle */}
                <div className="flex items-center border rounded-md">
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} rounded-l-md transition-colors`}
                    onClick={() => setViewMode('list')}
                    title="Danh sách"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} rounded-r-md transition-colors`}
                    onClick={() => setViewMode('grid')}
                    title="Lưới"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid view */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setSelectedDoc(doc); setShowDetail(true); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-muted rounded-lg shrink-0">{getFileIcon(doc.fileType)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      <span className="text-xs text-muted-foreground">{documentApi.formatFileSize(doc.fileSize)}</span>
                      <span className="text-xs text-muted-foreground">v{doc.version}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                    {/* Quick actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDownload(doc); }} title="Tải xuống">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleShare(doc); }} title="Chia sẻ">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleArchive(doc); }} title={doc.status === 'Lưu trữ' ? 'Khôi phục' : 'Lưu trữ'}>
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={e => { e.stopPropagation(); handleDelete(doc); }} title="Xoá">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {documents.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có tài liệu nào</p>
                </div>
              )}
            </div>
          ) : (
            /* List view — DataTable */
            <DataTable<Document>
              data={documents}
              columns={columns}
              totalItems={totalItems}
              pagination={pagination}
              sort={sort}
              onPaginationChange={setPagination}
              onSortChange={setSort}
              getId={d => d.id}
              loading={loading}
              onRowClick={d => { setSelectedDoc(d); setShowDetail(true); }}
              renderActions={(doc: Document) => (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDownload(doc); }} title="Tải xuống">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleShare(doc); }} title="Chia sẻ">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleArchive(doc); }}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={e => { e.stopPropagation(); handleDelete(doc); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          )}

          {/* Grid pagination */}
          {viewMode === 'grid' && totalItems > pagination.pageSize && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline" size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {Math.ceil(totalItems / pagination.pageSize)}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={pagination.page >= Math.ceil(totalItems / pagination.pageSize)}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UploadDialog open={showUpload} onOpenChange={setShowUpload} onUpload={handleUpload} />
      <DocumentDetailDialog doc={selectedDoc} open={showDetail} onOpenChange={setShowDetail} />
    </div>
  );
}