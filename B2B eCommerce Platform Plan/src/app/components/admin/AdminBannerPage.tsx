// ============================================================
// AdminBannerPage — Quản lý Banner quảng cáo
// Route: /admin/banners
// Hỗ trợ: trang đích, target role, lịch chạy, preview
// ============================================================

import { useState } from 'react';
import { ImageIcon, Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Target, Monitor } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatsCard } from '../shared/StatsCard';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  targetPage: 'home' | 'products' | 'promotions' | 'all';
  targetRole: 'all' | 'buyer' | 'seller';
  startDate: string;
  endDate: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'popup' | 'notification';
  clickCount: number;
  impressions: number;
  priority: number;
}

const mockBanners: Banner[] = [
  {
    id: '1', title: 'iPhone 16 Pro Max - Sale 15%',
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&h=300&fit=crop',
    linkUrl: '/products?brand=Apple&categoryId=cat-01',
    targetPage: 'home', targetRole: 'all', position: 'hero',
    startDate: '2026-04-01', endDate: '2026-04-30', isActive: true,
    clickCount: 3420, impressions: 45230, priority: 1,
  },
  {
    id: '2', title: 'Samsung Galaxy S25 Ultra Ra Mắt',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=300&fit=crop',
    linkUrl: '/products?brand=Samsung',
    targetPage: 'home', targetRole: 'buyer', position: 'hero',
    startDate: '2026-04-10', endDate: '2026-05-10', isActive: true,
    clickCount: 2180, impressions: 31050, priority: 2,
  },
  {
    id: '3', title: 'Flash Sale Cuối Tuần - Giảm Đến 40%',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
    linkUrl: '/promotions',
    targetPage: 'promotions', targetRole: 'buyer', position: 'popup',
    startDate: '2026-04-14', endDate: '2026-04-20', isActive: true,
    clickCount: 1560, impressions: 18900, priority: 1,
  },
  {
    id: '4', title: 'Phí sàn ưu đãi cho NCC mới',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
    linkUrl: '/seller',
    targetPage: 'home', targetRole: 'seller', position: 'notification',
    startDate: '2026-04-01', endDate: '2026-06-30', isActive: true,
    clickCount: 340, impressions: 5600, priority: 1,
  },
  {
    id: '5', title: 'Tết Sale 2026 (Đã hết hạn)',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop',
    linkUrl: '/promotions/tet',
    targetPage: 'all', targetRole: 'all', position: 'hero',
    startDate: '2026-01-01', endDate: '2026-02-15', isActive: false,
    clickCount: 12400, impressions: 89100, priority: 1,
  },
];

const positionLabel: Record<Banner['position'], string> = {
  hero: 'Hero Banner', sidebar: 'Sidebar', popup: 'Popup', notification: 'Thông báo',
};
const pageLabel: Record<Banner['targetPage'], string> = {
  home: 'Trang chủ', products: 'Sản phẩm', promotions: 'Khuyến mãi', all: 'Tất cả',
};

export function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [previewItem, setPreviewItem] = useState<Banner | null>(null);
  const [editItem, setEditItem] = useState<Banner | null>(null);

  const activeCount = banners.filter(b => b.isActive).length;
  const totalClicks = banners.reduce((s, b) => s + b.clickCount, 0);
  const totalImpressions = banners.reduce((s, b) => s + b.impressions, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

  const handleToggle = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
    toast.success('Đã cập nhật trạng thái banner');
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    toast.success('Đã xoá banner');
  };

  const isExpired = (b: Banner) => new Date(b.endDate) < new Date();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Quản lý Banner' }]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý Banner</h1>
          <p className="text-sm text-muted-foreground mt-1">Cấu hình banner quảng cáo theo trang, đối tượng và thời gian</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Thêm Banner</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Đang hoạt động" value={activeCount} icon={Monitor} variant="success" />
        <StatsCard title="Tổng lượt click" value={totalClicks} format={n => n.toLocaleString()} icon={Target} variant="primary" />
        <StatsCard title="Lượt hiển thị" value={totalImpressions} format={n => n.toLocaleString()} icon={Eye} variant="info" />
        <StatsCard title="CTR trung bình" value={Number(avgCTR)} format={n => `${n}%`} icon={Calendar} variant="warning" />
      </div>

      {/* Banner Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {banners.map(banner => (
          <Card key={banner.id} className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${!banner.isActive ? 'opacity-70' : ''}`}>
            {/* Image */}
            <div className="relative h-40 bg-muted img-zoom">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              {isExpired(banner) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-bold bg-red-600 px-3 py-1 rounded-full">Đã hết hạn</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className="text-xs font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {positionLabel[banner.position]}
                </span>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => setPreviewItem(banner)} className="h-7 w-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow">
                  <Eye className="h-3.5 w-3.5 text-gray-700" />
                </button>
                <button onClick={() => setEditItem({ ...banner })} className="h-7 w-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow">
                  <Edit2 className="h-3.5 w-3.5 text-gray-700" />
                </button>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-tight">{banner.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{banner.linkUrl}</p>
                </div>
                <Switch checked={banner.isActive} onCheckedChange={() => handleToggle(banner.id)} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{pageLabel[banner.targetPage]}</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">
                  {banner.targetRole === 'all' ? 'Tất cả' : banner.targetRole === 'buyer' ? 'Người mua' : 'NCC'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 rounded-lg p-2">
                <div><span className="text-muted-foreground">Từ:</span> <b>{banner.startDate}</b></div>
                <div><span className="text-muted-foreground">Đến:</span> <b>{banner.endDate}</b></div>
                <div><span className="text-muted-foreground">Clicks:</span> <b>{banner.clickCount.toLocaleString()}</b></div>
                <div><span className="text-muted-foreground">CTR:</span> <b>{banner.impressions > 0 ? ((banner.clickCount / banner.impressions) * 100).toFixed(1) : 0}%</b></div>
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2" onClick={() => handleDelete(banner.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Xoá
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xem trước Banner</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full rounded-lg object-cover max-h-64" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Tiêu đề:</span> {previewItem.title}</div>
                <div><span className="text-muted-foreground">Link:</span> {previewItem.linkUrl}</div>
                <div><span className="text-muted-foreground">Trang:</span> {pageLabel[previewItem.targetPage]}</div>
                <div><span className="text-muted-foreground">Vị trí:</span> {positionLabel[previewItem.position]}</div>
                <div><span className="text-muted-foreground">Từ:</span> {previewItem.startDate}</div>
                <div><span className="text-muted-foreground">Đến:</span> {previewItem.endDate}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
