// ============================================================
// Thoả thuận giá — Buyer (Nhóm 35D)
// Danh sách TT, chi tiết SP giá TT vs giá gốc, đơn hàng liên kết
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Handshake, Eye, ShoppingCart, AlertTriangle, CheckCircle2, FileText,
  TrendingDown, Clock, Ban,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { priceAgreementApi } from '../../services/priceAgreementApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  PriceAgreement, AgreementOrder, AgreementStatus, AgreementType,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
const formatShort = (v: number) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)} tr`;
  return formatPrice(v);
};
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ALL_TYPES: AgreementType[] = ['Thoả thuận giá', 'HĐ khung', 'Đơn hàng mở'];
const ALL_STATUSES: AgreementStatus[] = ['Bản nháp', 'Chờ duyệt', 'Hiệu lực', 'Sắp hết hạn', 'Đã hết hạn', 'Đã huỷ'];

const filterConfigs: FilterConfig[] = [
  { key: 'type', label: 'Loại', type: 'select', options: ALL_TYPES.map(t => ({ label: t, value: t })) },
  { key: 'status', label: 'Trạng thái', type: 'select', options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
];

export function BuyerPriceAgreementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyerId = user?.id ?? 'user-001';

  const [agreements, setAgreements] = useState<PriceAgreement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number; active: number; expiringSoon: number; expired: number; avgDiscount: number;
  } | null>(null);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Detail
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<PriceAgreement | null>(null);
  const [detailOrders, setDetailOrders] = useState<AgreementOrder[]>([]);
  const [detailTab, setDetailTab] = useState('products');

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        priceAgreementApi.getByBuyer(buyerId, pagination, sort, filters, search),
        priceAgreementApi.getStats(buyerId, 'buyer'),
      ]);
      setAgreements(res.data);
      setTotal(res.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [buyerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (ag: PriceAgreement) => {
    setSelected(ag);
    setDetailTab('products');
    const orders = await priceAgreementApi.getOrders(ag.id);
    setDetailOrders(orders);
    setShowDetail(true);
  };

  // Quick order from agreement
  const handleQuickOrder = (ag: PriceAgreement) => {
    toast.success(`Đã thêm ${ag.items.length} SP với giá TT vào giỏ hàng`);
    navigate('/cart');
  };

  // --- Columns ---
  const columns: (ColumnConfig & { render?: (item: PriceAgreement) => React.ReactNode })[] = [
    { key: 'agreementNumber', label: 'Mã TT', visible: true, sortable: true },
    { key: 'type', label: 'Loại', visible: true, sortable: true,
      render: (a) => <Badge variant="outline">{a.type}</Badge>,
    },
    { key: 'sellerCompany', label: 'NCC', visible: true, sortable: true },
    { key: 'itemCount', label: 'Số SP', visible: true, sortable: false,
      render: (a) => <span>{a.items.length}</span>,
    },
    { key: 'totalContractValue', label: 'Giá trị', visible: true, sortable: true,
      render: (a) => {
        const pct = a.totalContractValue > 0 ? Math.round((a.usedValue / a.totalContractValue) * 100) : 0;
        return (
          <div className="min-w-[110px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatShort(a.usedValue)}</span><span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      },
    },
    { key: 'endDate', label: 'Hiệu lực', visible: true, sortable: true,
      render: (a) => {
        const daysLeft = Math.ceil((new Date(a.endDate).getTime() - Date.now()) / 86400000);
        return (
          <div>
            <p className="text-sm">{formatDate(a.endDate)}</p>
            {daysLeft > 0 && daysLeft <= 30 && (
              <span className="text-xs text-orange-600 flex items-center gap-1"><Clock className="h-3 w-3" />Còn {daysLeft} ngày</span>
            )}
          </div>
        );
      },
    },
    { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  const statsCards = stats ? [
    { label: 'Tổng TT', value: stats.total, icon: Handshake, color: 'text-blue-600 bg-blue-50' },
    { label: 'Hiệu lực', value: stats.active, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Sắp hết hạn', value: stats.expiringSoon, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Giảm giá TB', value: `${stats.avgDiscount}%`, icon: TrendingDown, color: 'text-indigo-600 bg-indigo-50' },
  ] : [];

  // Detail order columns for nested table
  const orderColumns: (ColumnConfig & { render?: (item: AgreementOrder) => React.ReactNode })[] = [
    { key: 'orderNumber', label: 'Mã ĐH', visible: true, sortable: true },
    { key: 'date', label: 'Ngày', visible: true, sortable: true, render: (o) => <span>{formatDate(o.date)}</span> },
    { key: 'amount', label: 'Giá trị', visible: true, sortable: true,
      render: (o) => o.amount > 0 ? <span className="font-medium">{formatPrice(o.amount)}</span> : <span className="text-muted-foreground">—</span>,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Thoả thuận giá' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2"><Handshake className="h-6 w-6" /> Thoả thuận giá</h1>
          <p className="text-muted-foreground">Xem thoả thuận giá & HĐ khung đã ký với NCC</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsCards.map(card => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color}`}><card.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-semibold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã TT, NCC..."
      />

      <div className="mt-4">
        <DataTable
          data={agreements}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={a => a.id}
          loading={loading}
          renderActions={(ag) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/price-agreements/${ag.id}`)}><Eye className="h-4 w-4" /></Button>
              {(ag.status === 'Hiệu lực' || ag.status === 'Sắp hết hạn') && (
                <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleQuickOrder(ag)}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Chi tiết ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Mã:</span><p className="font-medium">{selected.agreementNumber}</p></div>
                <div><span className="text-muted-foreground">NCC:</span><p className="font-medium">{selected.sellerCompany}</p></div>
                <div><span className="text-muted-foreground">Loại:</span><p><Badge variant="outline">{selected.type}</Badge></p></div>
                <div><span className="text-muted-foreground">Trạng thái:</span><div className="mt-0.5"><StatusBadge status={selected.status} /></div></div>
              </div>

              {/* Expiring warning */}
              {(() => {
                const daysLeft = Math.ceil((new Date(selected.endDate).getTime() - Date.now()) / 86400000);
                if (daysLeft > 0 && daysLeft <= 30) return (
                  <div className="p-2 bg-yellow-50 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
                    <AlertTriangle className="h-4 w-4" /> Thoả thuận sắp hết hạn: còn {daysLeft} ngày
                  </div>
                );
                return null;
              })()}

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Đã sử dụng: {formatShort(selected.usedValue)} / {formatShort(selected.totalContractValue)}</span>
                  <span>{selected.totalContractValue > 0 ? Math.round((selected.usedValue / selected.totalContractValue) * 100) : 0}%</span>
                </div>
                <Progress value={selected.totalContractValue > 0 ? Math.round((selected.usedValue / selected.totalContractValue) * 100) : 0} className="h-3" />
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList>
                  <TabsTrigger value="products">Sản phẩm ({selected.items.length})</TabsTrigger>
                  <TabsTrigger value="orders">Đơn hàng ({detailOrders.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-2 mt-3">
                  {selected.items.map(item => (
                    <div key={item.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <div className="flex gap-3 mt-1 text-sm">
                          <span className="text-muted-foreground line-through">{formatPrice(item.originalPrice)}</span>
                          <span className="text-primary font-medium">{formatPrice(item.agreedPrice)}</span>
                          <Badge className="bg-green-100 text-green-700 text-xs">-{item.discountPercent}%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">SL: {item.minQuantity}–{item.maxQuantity} {item.unit}</p>
                      </div>
                      {(selected.status === 'Hiệu lực' || selected.status === 'Sắp hết hạn') && (
                        <Button size="sm" variant="outline" className="gap-1 shrink-0"
                          onClick={() => { toast.success(`Đã thêm ${item.productName} vào giỏ`); }}>
                          <ShoppingCart className="h-3 w-3" /> Đặt hàng
                        </Button>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="orders" className="mt-3">
                  {detailOrders.length > 0 ? (
                    <DataTable
                      data={detailOrders}
                      columns={orderColumns}
                      totalItems={detailOrders.length}
                      pagination={{ page: 1, pageSize: 10 }}
                      sort={{ field: 'date', direction: 'desc' }}
                      onPaginationChange={() => {}}
                      onSortChange={() => {}}
                      getId={o => o.id}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Chưa có đơn hàng theo thoả thuận này</p>
                  )}
                </TabsContent>
              </Tabs>

              {selected.note && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{selected.note}</p>
                </>
              )}

              {(selected.status === 'Hiệu lực' || selected.status === 'Sắp hết hạn') && (
                <div className="flex justify-end">
                  <Button onClick={() => handleQuickOrder(selected)} className="gap-2">
                    <ShoppingCart className="h-4 w-4" /> Đặt hàng nhanh
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}