// ============================================================
// Quản lý NCC nâng cao — Admin
// Stats, Filter, DataTable/CardView, Chi tiết NCC (tabs),
// Khoá/Mở khoá, Xác minh, Xuất CSV
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2, ShieldCheck, ShieldOff, Star, Package, ClipboardList, DollarSign,
  Download, Eye, Lock, Unlock, CheckCircle2, Users, MapPin,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { supplierApi, productApi, orderApi, staffApi } from '../../services/api';
import { certificateApi, activityApi } from '../../services/adminApi';
import { toast } from 'sonner';
import type {
  Supplier, Product, Order, StaffMember, BusinessCertificate, ActivityLog,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatCompact = (n: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(n);

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'companyName', label: 'Công ty', visible: true, sortable: true },
  { key: 'contactPerson', label: 'Liên hệ', visible: true, sortable: true },
  { key: 'city', label: 'Tỉnh/TP', visible: true, sortable: true },
  { key: 'rating', label: 'Đánh giá', visible: true, sortable: true },
  { key: 'productCount', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'reviewCount', label: 'Đánh giá', visible: true, sortable: true },
  { key: 'yearEstablished', label: 'Năm TL', visible: true, sortable: true },
  { key: 'isVerified', label: 'Xác minh', visible: true, sortable: true },
  { key: 'isActive', label: 'Trạng thái', visible: true, sortable: true },
  // DB-B.19: Thêm cột mới (ẩn mặc định)
  { key: 'employees', label: 'Nhân viên', visible: false, sortable: true },
  { key: 'website', label: 'Website', visible: false, sortable: false },
  { key: 'taxId', label: 'MST', visible: false, sortable: false },
  { key: 'representative', label: 'Đại diện', visible: false, sortable: false },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'isVerified', label: 'Xác minh', type: 'select', options: [
    { label: 'Đã xác minh', value: 'true' },
    { label: 'Chưa xác minh', value: 'false' },
  ]},
  { key: 'isActive', label: 'Trạng thái', type: 'select', options: [
    { label: 'Hoạt động', value: 'true' },
    { label: 'Bị khoá', value: 'false' },
  ]},
  { key: 'city', label: 'Tỉnh/TP', type: 'select', options: [
    { label: 'Hồ Chí Minh', value: 'Hồ Chí Minh' },
    { label: 'Hà Nội', value: 'Hà Nội' },
    { label: 'Đà Nẵng', value: 'Đà Nẵng' },
    { label: 'Hải Phòng', value: 'Hải Phòng' },
    { label: 'Bình Dương', value: 'Bình Dương' },
    { label: 'Cần Thơ', value: 'Cần Thơ' },
  ]},
];

export function AdminSupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'rating', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // --- Detail state ---
  const [selectedSup, setSelectedSup] = useState<Supplier | null>(null);
  const [supProducts, setSupProducts] = useState<Product[]>([]);
  const [supOrders, setSupOrders] = useState<Order[]>([]);
  const [supStaff, setSupStaff] = useState<StaffMember[]>([]);
  const [supCerts, setSupCerts] = useState<BusinessCertificate[]>([]);
  const [supLogs, setSupLogs] = useState<ActivityLog[]>([]);
  const [detailTab, setDetailTab] = useState('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        supplierApi.getAll(),
        supplierApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllSuppliers(allRes);
      setSuppliers(pageRes.data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Load detail data ---
  const loadDetail = async (sup: Supplier) => {
    setSelectedSup(sup);
    setDetailTab('overview');
    const [prods, ords, staff, certs, logs] = await Promise.all([
      productApi.getBySupplier(sup.id),
      orderApi.getBySeller(sup.id),
      staffApi.getBySeller(sup.id),
      certificateApi.getBySeller(sup.id),
      activityApi.getByUser(sup.id, 20),
    ]);
    setSupProducts(prods);
    setSupOrders(ords);
    setSupStaff(staff);
    setSupCerts(certs);
    setSupLogs(logs);
  };

  // --- Stats ---
  const stats = useMemo(() => {
    const verified = allSuppliers.filter(s => s.isVerified).length;
    const notVerified = allSuppliers.filter(s => !s.isVerified).length;
    const locked = allSuppliers.filter(s => !s.isActive).length;
    const avgRating = allSuppliers.length
      ? (allSuppliers.reduce((sum, s) => sum + s.rating, 0) / allSuppliers.length).toFixed(1)
      : '0';
    return { total: allSuppliers.length, verified, notVerified, locked, avgRating };
  }, [allSuppliers]);

  // --- Actions ---
  const handleToggleLock = async (id: string, isActive: boolean) => {
    await supplierApi.update(id, { isActive });
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));
    setAllSuppliers(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));
    if (selectedSup?.id === id) setSelectedSup(prev => prev ? { ...prev, isActive } : null);
    toast.success(isActive ? 'Đã mở khoá NCC' : 'Đã khoá NCC');
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    await supplierApi.update(id, { isVerified });
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isVerified } : s));
    setAllSuppliers(prev => prev.map(s => s.id === id ? { ...s, isVerified } : s));
    if (selectedSup?.id === id) setSelectedSup(prev => prev ? { ...prev, isVerified } : null);
    toast.success(isVerified ? 'Đã xác minh NCC' : 'Đã huỷ xác minh NCC');
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Công ty', 'Liên hệ', 'Email', 'SĐT', 'Tỉnh/TP', 'Đánh giá', 'Sản phẩm', 'Xác minh', 'Trạng thái'];
    const rows = allSuppliers.map(s => [
      s.companyName, s.contactPerson, s.email, s.phone, s.city,
      s.rating.toString(), s.productCount.toString(),
      s.isVerified ? 'Đã xác minh' : 'Chưa', s.isActive ? 'Hoạt động' : 'Bị khoá',
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ncc-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- Card view ---
  const renderListItem = (sup: Supplier) => (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${!sup.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary">
              {sup.companyName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{sup.companyName}</span>
              {sup.isVerified && <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{sup.city}</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{sup.rating}</span>
              <span className="flex items-center gap-1"><Package className="h-3 w-3" />{sup.productCount} SP</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={sup.isActive ? 'Hoạt động' : 'Bị khoá'} />
              {!sup.isVerified && <Badge variant="outline" className="text-orange-600 border-orange-200">Chưa xác minh</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // --- KPIs for detail ---
  const detailKPIs = useMemo(() => {
    if (!selectedSup) return null;
    const revenue = supOrders.reduce((s, o) => s + o.totalAmount, 0);
    const cancelRate = supOrders.length
      ? Math.round((supOrders.filter(o => o.status === 'Đã huỷ').length / supOrders.length) * 100)
      : 0;
    return { revenue, orders: supOrders.length, products: supProducts.length, cancelRate };
  }, [selectedSup, supOrders, supProducts]);

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Nhà cung cấp' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý nhà cung cấp</h1>
          <p className="text-muted-foreground">Giám sát, xác minh và quản lý NCC trên hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng NCC</span>
              <Building2 className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đã xác minh</span>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl text-green-600">{stats.verified}</p>
          </CardContent>
        </Card>
        <Card className={stats.notVerified > 0 ? 'border-orange-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Chưa xác minh</span>
              <ShieldOff className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl text-orange-600">{stats.notVerified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Bị khoá</span>
              <Lock className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xl">{stats.locked}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">TB đánh giá</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xl">{stats.avgRating} <Star className="inline h-3 w-3 text-yellow-500" /></p>
          </CardContent>
        </Card>
      </div>

      {/* --- Filter + Table --- */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm tên, công ty, email, SĐT..."
      />

      <DataTable
        data={suppliers}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={loadDetail}
        getId={s => s.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={(sup: Supplier) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); loadDetail(sup); }} title="Chi tiết">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleToggleLock(sup.id, !sup.isActive); }}
              title={sup.isActive ? 'Khoá' : 'Mở khoá'}>
              {sup.isActive ? <Lock className="h-3.5 w-3.5 text-red-500" /> : <Unlock className="h-3.5 w-3.5 text-green-500" />}
            </Button>
          </div>
        )}
      />

      {/* --- Chi tiết NCC (Dialog) --- */}
      <Dialog open={!!selectedSup} onOpenChange={() => setSelectedSup(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedSup?.companyName}
              {selectedSup?.isVerified && <ShieldCheck className="h-4 w-4 text-blue-500" />}
            </DialogTitle>
          </DialogHeader>
          {selectedSup && (
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedSup.isActive ? 'Hoạt động' : 'Bị khoá'} />
                <Badge variant="outline" className={selectedSup.isVerified ? 'text-green-600 border-green-200' : 'text-orange-600 border-orange-200'}>
                  {selectedSup.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </Badge>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleToggleLock(selectedSup.id, !selectedSup.isActive)}>
                    {selectedSup.isActive ? <><Lock className="mr-1 h-3.5 w-3.5" /> Khoá</> : <><Unlock className="mr-1 h-3.5 w-3.5" /> Mở khoá</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleVerify(selectedSup.id, !selectedSup.isVerified)}>
                    {selectedSup.isVerified
                      ? <><ShieldOff className="mr-1 h-3.5 w-3.5" /> Huỷ xác minh</>
                      : <><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Xác minh</>}
                  </Button>
                </div>
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList className="flex flex-wrap">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="products">Sản phẩm ({supProducts.length})</TabsTrigger>
                  <TabsTrigger value="orders">Đơn hàng ({supOrders.length})</TabsTrigger>
                  <TabsTrigger value="certs">Chứng chỉ ({supCerts.length})</TabsTrigger>
                  <TabsTrigger value="staff">Nhân viên ({supStaff.length})</TabsTrigger>
                  <TabsTrigger value="logs">Nhật ký</TabsTrigger>
                </TabsList>

                {/* Tab Tổng quan */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  {detailKPIs && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Card><CardContent className="p-3 text-center">
                        <p className="text-muted-foreground">Doanh thu</p>
                        <p className="text-lg text-primary">{formatCompact(detailKPIs.revenue)} ₫</p>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <p className="text-muted-foreground">Đơn hàng</p>
                        <p className="text-lg">{detailKPIs.orders}</p>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <p className="text-muted-foreground">Sản phẩm</p>
                        <p className="text-lg">{detailKPIs.products}</p>
                      </CardContent></Card>
                      <Card><CardContent className="p-3 text-center">
                        <p className="text-muted-foreground">Tỷ lệ huỷ</p>
                        <p className={`text-lg ${detailKPIs.cancelRate > 10 ? 'text-red-600' : ''}`}>{detailKPIs.cancelRate}%</p>
                      </CardContent></Card>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-muted-foreground">Người liên hệ</p><p>{selectedSup.contactPerson}</p></div>
                    <div><p className="text-muted-foreground">Email</p><p>{selectedSup.email}</p></div>
                    <div><p className="text-muted-foreground">SĐT</p><p>{selectedSup.phone}</p></div>
                    <div><p className="text-muted-foreground">Tỉnh/TP</p><p>{selectedSup.city}</p></div>
                    <div><p className="text-muted-foreground">Địa chỉ</p><p>{selectedSup.address}</p></div>
                    <div><p className="text-muted-foreground">Năm thành lập</p><p>{selectedSup.yearEstablished}</p></div>
                    <div><p className="text-muted-foreground">Đánh giá</p>
                      <p className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" />{selectedSup.rating} ({selectedSup.reviewCount})</p>
                    </div>
                    <div><p className="text-muted-foreground">Ngày tạo</p><p>{selectedSup.createdAt}</p></div>
                    {/* DB-B.19: Trường mới */}
                    {selectedSup.employees && <div><p className="text-muted-foreground">Nhân viên</p><p>{selectedSup.employees.toLocaleString()} người</p></div>}
                    {selectedSup.website && <div><p className="text-muted-foreground">Website</p><p className="text-primary">{selectedSup.website}</p></div>}
                    {selectedSup.taxId && <div><p className="text-muted-foreground">MST</p><p>{selectedSup.taxId}</p></div>}
                    {selectedSup.representative && <div><p className="text-muted-foreground">Người đại diện</p><p>{selectedSup.representative}</p></div>}
                    {selectedSup.productionCapacity && <div><p className="text-muted-foreground">Năng lực SX</p><p>{selectedSup.productionCapacity}</p></div>}
                  </div>
                  {selectedSup.description && (
                    <div><p className="text-muted-foreground">Mô tả</p><p>{selectedSup.description}</p></div>
                  )}
                </TabsContent>

                {/* Tab Sản phẩm */}
                <TabsContent value="products" className="mt-4">
                  {supProducts.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có sản phẩm</p>
                    : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {supProducts.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{p.name}</p>
                              <p className="text-muted-foreground">{p.categoryName}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-primary">{formatPrice(p.price)}</p>
                              <StatusBadge status={p.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>

                {/* Tab Đơn hàng */}
                <TabsContent value="orders" className="mt-4">
                  {supOrders.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có đơn hàng</p>
                    : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {supOrders.map(o => (
                          <div key={o.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="min-w-0">
                              <p className="font-medium">{o.orderNumber}</p>
                              <p className="text-muted-foreground truncate">{o.buyerName}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-primary">{formatPrice(o.totalAmount)}</p>
                              <StatusBadge status={o.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>

                {/* Tab Chứng chỉ */}
                <TabsContent value="certs" className="mt-4">
                  {supCerts.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có chứng chỉ</p>
                    : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {supCerts.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-muted-foreground">{c.type} — {c.issuedBy}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-muted-foreground">HH: {c.expiryDate}</p>
                              <StatusBadge status={c.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>

                {/* Tab Nhân viên */}
                <TabsContent value="staff" className="mt-4">
                  {supStaff.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có nhân viên</p>
                    : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {supStaff.map(s => (
                          <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{s.fullName}</p>
                              <p className="text-muted-foreground">{s.email}</p>
                            </div>
                            <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.role}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>

                {/* Tab Nhật ký */}
                <TabsContent value="logs" className="mt-4">
                  {supLogs.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có hoạt động</p>
                    : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {supLogs.map(log => (
                          <div key={log.id} className="p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{log.action}</Badge>
                              <span className="text-muted-foreground">{log.entity}: {log.entityName}</span>
                              <span className="ml-auto text-muted-foreground">{log.createdAt}</span>
                            </div>
                            <p className="text-muted-foreground mt-0.5">{log.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}