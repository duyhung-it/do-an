// ============================================================
// AdminInventoryPage — Quản lý kho hàng IMEI
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import {
  Package, Search, AlertTriangle, TrendingDown, CheckCircle,
  Plus, Download, Upload, QrCode, RefreshCw, Filter,
  BarChart3, ArrowUpDown, Edit2, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { productApi } from '../../services/api';
import type { Product } from '../../types';
import { toast } from 'sonner';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

interface InventoryItem {
  productId: string;
  productName: string;
  brand: string;
  sku: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
  sellingPrice: number;
  totalValue: number;
  status: 'Đủ hàng' | 'Sắp hết' | 'Hết hàng';
  imeis: string[];
  variantName?: string;
}

function getStockStatus(stock: number, min = 5): InventoryItem['status'] {
  if (stock === 0) return 'Hết hàng';
  if (stock <= min) return 'Sắp hết';
  return 'Đủ hàng';
}

function buildInventory(products: Product[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const p of products) {
    for (const v of p.variants) {
      const stock = v.stock;
      items.push({
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        sku: v.sku,
        categoryName: p.categoryName,
        currentStock: stock,
        minStock: 5,
        sellingPrice: v.price || p.price,
        totalValue: (v.price || p.price) * stock,
        status: getStockStatus(stock),
        imeis: [],
        variantName: v.name,
      });
    }
  }
  return items;
}

export function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);
  const [showImeiInput, setShowImeiInput] = useState<string | null>(null);
  const [imeiInput, setImeiInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const products = await productApi.getAll();
      const inv = buildInventory(products);
      setInventory(inv);
      setBrands([...new Set(inv.map(i => i.brand))].sort());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = inventory.filter(item => {
    const matchSearch = !search || item.productName.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchBrand = brandFilter === 'all' || item.brand === brandFilter;
    return matchSearch && matchStatus && matchBrand;
  });

  const stats = {
    total: inventory.length,
    available: inventory.filter(i => i.status === 'Đủ hàng').length,
    low: inventory.filter(i => i.status === 'Sắp hết').length,
    outOfStock: inventory.filter(i => i.status === 'Hết hàng').length,
    totalValue: inventory.reduce((sum, i) => sum + i.totalValue, 0),
  };

  const handleAddImei = (sku: string) => {
    if (!imeiInput.trim()) return;
    const imeis = imeiInput.split('\n').map(i => i.trim()).filter(Boolean);
    setInventory(prev => prev.map(item =>
      item.sku === sku ? { ...item, imeis: [...item.imeis, ...imeis] } : item
    ));
    setImeiInput('');
    setShowImeiInput(null);
    toast.success(`Đã thêm ${imeis.length} IMEI`);
  };

  const statusColors: Record<string, string> = {
    'Đủ hàng': 'bg-green-100 text-green-700',
    'Sắp hết': 'bg-amber-100 text-amber-700',
    'Hết hàng': 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Kho hàng' }]} />

      <div className="flex items-center justify-between mb-6 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>
          <p className="text-muted-foreground mt-0.5">Theo dõi tồn kho và quản lý IMEI thiết bị</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Tính năng xuất Excel đang phát triển')}>
            <Download className="h-4 w-4 mr-1" /> Xuất Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Tính năng nhập Excel đang phát triển')}>
            <Upload className="h-4 w-4 mr-1" /> Nhập Excel
          </Button>
          <Button size="sm" className="bg-[#e31837] hover:bg-[#c91432]" onClick={() => toast.info('Tính năng thêm sản phẩm sẽ redirect về trang sản phẩm')}>
            <Plus className="h-4 w-4 mr-1" /> Nhập hàng
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Tổng SKU', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đủ hàng', value: stats.available, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Sắp hết', value: stats.low, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Hết hàng', value: stats.outOfStock, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Giá trị tồn kho', value: formatPrice(stats.totalValue), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50', wide: true },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`border-0 shadow-sm ${(stat as any).wide ? 'col-span-2 md:col-span-1' : ''}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-sm">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-5">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Tìm theo tên, SKU, thương hiệu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đủ hàng">Đủ hàng</option>
              <option value="Sắp hết">Sắp hết</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>
            <select
              className="h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
            >
              <option value="all">Tất cả thương hiệu</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <Button variant="ghost" size="icon" onClick={fetchData} title="Làm mới">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {filtered.length} SKU {statusFilter !== 'all' || brandFilter !== 'all' ? '(đã lọc)' : 'tổng cộng'}
            </CardTitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Không có dữ liệu tồn kho phù hợp</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-gray-50/50">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Sản phẩm</th>
                  <th className="text-left font-medium px-4 py-3">SKU</th>
                  <th className="text-left font-medium px-4 py-3">Thương hiệu</th>
                  <th className="text-left font-medium px-4 py-3">Phân loại</th>
                  <th className="text-right font-medium px-4 py-3">Tồn kho</th>
                  <th className="text-right font-medium px-4 py-3">Giá bán</th>
                  <th className="text-right font-medium px-4 py-3">Giá trị</th>
                  <th className="text-center font-medium px-4 py-3">Trạng thái</th>
                  <th className="text-center font-medium px-4 py-3">IMEI</th>
                  <th className="text-center font-medium px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.slice(0, 50).map((item, idx) => (
                  <>
                    <tr key={`${item.sku}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium line-clamp-1">{item.productName}</p>
                        {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.sku}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{item.brand}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px]">{item.categoryName}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-semibold ${item.currentStock === 0 ? 'text-red-500' : item.currentStock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                            {item.currentStock}
                          </span>
                          {item.status === 'Sắp hết' && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {formatPrice(item.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        {formatPrice(item.totalValue)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`border-0 text-[10px] ${statusColors[item.status]}`}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mx-auto"
                          onClick={() => setShowImeiInput(showImeiInput === item.sku ? null : item.sku)}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          {item.imeis.length > 0 ? `${item.imeis.length} IMEI` : 'Thêm'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info('Điều chỉnh tồn kho')}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => toast.info('Lịch sử nhập xuất')}>
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {/* IMEI input row */}
                    {showImeiInput === item.sku && (
                      <tr key={`imei-${item.sku}`}>
                        <td colSpan={10} className="px-4 pb-3">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <p className="text-sm font-semibold text-blue-800 mb-2">
                              <QrCode className="inline h-4 w-4 mr-1" />
                              Thêm IMEI cho: {item.productName} — {item.variantName}
                            </p>
                            {item.imeis.length > 0 && (
                              <div className="mb-2 flex gap-1 flex-wrap">
                                {item.imeis.map(imei => (
                                  <code key={imei} className="text-xs bg-white border border-blue-200 px-2 py-0.5 rounded">{imei}</code>
                                ))}
                              </div>
                            )}
                            <textarea
                              className="w-full h-20 border rounded-lg p-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Nhập IMEI (mỗi dòng 1 IMEI)&#10;351234567890123&#10;351234567890456"
                              value={imeiInput}
                              onChange={e => setImeiInput(e.target.value)}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAddImei(item.sku)}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Thêm IMEI
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setShowImeiInput(null)}>
                                Đóng
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 50 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t">
            Hiển thị 50 / {filtered.length} mục. Dùng bộ lọc để thu hẹp kết quả.
          </div>
        )}
      </Card>
    </div>
  );
}
