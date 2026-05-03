// ============================================================
// AdminBlogPage — Quản lý Blog & Bài viết
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, RefreshCw, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import { blogApi } from '../../services/api';
import type { BlogPost, PaginationParams } from '../../types';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const categoryOptions = ['Tất cả', 'So sánh', 'Review', 'Mẹo sử dụng', 'Tin tức', 'Hướng dẫn'];

export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Review', excerpt: '', isPublished: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params: PaginationParams = { page, pageSize: PAGE_SIZE };
    const filters: Record<string, unknown> = {};
    if (search) filters.search = search;
    const res = await blogApi.getPaginated(params, filters);
    let data = res.data;
    if (categoryFilter !== 'Tất cả') data = data.filter(p => p.category === categoryFilter);
    setPosts(data);
    setTotal(res.total);
    setLoading(false);
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTogglePublish = async (post: BlogPost) => {
    await blogApi.update(post.id, { isPublished: !post.isPublished });
    toast.success(post.isPublished ? 'Đã ẩn bài viết' : 'Đã đăng bài viết');
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await blogApi.delete(deleteTarget.id);
    toast.success('Đã xóa bài viết');
    setDeleteTarget(null);
    fetchData();
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    await blogApi.create({
      ...formData,
      slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      content: '',
      author: 'Admin',
      coverImage: '',
      tags: [],
      viewCount: 0,
      publishedAt: new Date().toISOString(),
    });
    toast.success('Đã tạo bài viết mới');
    setShowForm(false);
    setFormData({ title: '', category: 'Review', excerpt: '', isPublished: false });
    fetchData();
  };

  const columns = [
    {
      key: 'title', label: 'Tiêu đề',
      render: (v: string, row: BlogPost) => (
        <div>
          <p className="font-medium line-clamp-1">{v}</p>
          <p className="text-xs text-muted-foreground">{row.author} · {row.viewCount.toLocaleString()} lượt xem</p>
        </div>
      ),
    },
    { key: 'category', label: 'Danh mục', render: (v: string) => <Badge variant="outline">{v}</Badge> },
    {
      key: 'isPublished', label: 'Trạng thái',
      render: (v: boolean) => (
        <Badge variant={v ? 'default' : 'secondary'}>{v ? 'Đã đăng' : 'Nháp'}</Badge>
      ),
    },
    {
      key: 'publishedAt', label: 'Ngày đăng',
      render: (v: string) => <span className="text-sm text-muted-foreground">{new Date(v).toLocaleDateString('vi-VN')}</span>,
    },
    {
      key: 'actions', label: '',
      render: (_: unknown, row: BlogPost) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleTogglePublish(row)}>
            {row.isPublished ? <Eye className="h-4 w-4 text-yellow-500" /> : <Eye className="h-4 w-4 text-green-500" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const published = posts.filter(p => p.isPublished).length;
  const totalViews = posts.reduce((s, p) => s + p.viewCount, 0);

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Blog & Bài viết' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Blog & Bài viết</h1>
          <p className="text-muted-foreground">Quản lý nội dung blog và bài viết trên nền tảng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />Tạo bài viết</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng bài viết" value={total} icon={<FileText className="h-5 w-5 text-primary" />} />
        <StatsCard title="Đã đăng" value={published} icon={<Eye className="h-5 w-5 text-green-500" />} color="success" />
        <StatsCard title="Bản nháp" value={total - published} icon={<Edit2 className="h-5 w-5 text-yellow-500" />} color="warning" />
        <StatsCard title="Tổng lượt xem" value={totalViews.toLocaleString()} icon={<BookOpen className="h-5 w-5 text-blue-500" />} color="info" />
      </div>

      <FilterBar
        search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Tìm tiêu đề, tác giả..."
        filters={[
          { key: 'category', label: 'Danh mục', value: categoryFilter, onChange: setCategoryFilter, options: categoryOptions },
        ]}
      />

      <SimpleTable
        columns={columns}
        data={posts}
        loading={loading}
        emptyMessage="Không có bài viết nào"
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Badge variant="outline">{selected.category}</Badge>
                <Badge variant={selected.isPublished ? 'default' : 'secondary'}>{selected.isPublished ? 'Đã đăng' : 'Nháp'}</Badge>
              </div>
              <p className="text-muted-foreground">{selected.excerpt}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Tác giả: <strong>{selected.author}</strong></span>
                <span>Lượt xem: <strong>{selected.viewCount.toLocaleString()}</strong></span>
                <span>Tags: {selected.tags.join(', ')}</span>
                <span>Ngày: {new Date(selected.publishedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
            <Button onClick={() => { handleTogglePublish(selected!); setSelected(null); }}>
              {selected?.isPublished ? 'Ẩn bài viết' : 'Đăng bài'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Tạo bài viết mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Nhập tiêu đề bài viết..." />
            </div>
            <div>
              <Label>Danh mục</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                {categoryOptions.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Tóm tắt</Label>
              <Input value={formData.excerpt} onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))} placeholder="Mô tả ngắn về bài viết..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo bài viết</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa bài viết <strong>"{deleteTarget?.title}"</strong>? Hành động này không thể hoàn tác.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
