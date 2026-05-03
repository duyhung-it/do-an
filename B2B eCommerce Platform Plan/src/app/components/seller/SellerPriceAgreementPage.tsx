// ============================================================
// Thoả thuận giá — Seller (Nhóm 35C)
// Stats, DataTable, FormDialog, Chi tiết + đơn hàng liên kết
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Handshake, Plus, Eye, CheckCircle2, AlertTriangle, FileText,
  TrendingDown, Clock, Ban,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { priceAgreementApi } from '../../services/priceAgreementApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  PriceAgreement, PriceAgreementItem, AgreementOrder, AgreementType, AgreementStatus,
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

export function SellerPriceAgreementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sellerId = user?.supplierId ?? 'sup-01';

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

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<PriceAgreement | null>(null);
  const [detailOrders, setDetailOrders] = useState<AgreementOrder[]>([]);

  // Form state
  const [formType, setFormType] = useState<AgreementType>('Thoả thuận giá');
  const [formTitle, setFormTitle] = useState('');
  const [formBuyerCompany, setFormBuyerCompany] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formItems, setFormItems] = useState<{
    productName: string; originalPrice: number; agreedPrice: number;
    minQuantity: number; maxQuantity: number; unit: string;
  }[]>([{ productName: '', originalPrice: 0, agreedPrice: 0, minQuantity: 1, maxQuantity: 100, unit: 'Cái' }]);

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        priceAgreementApi.getBySeller(sellerId, pagination, sort, filters, search),
        priceAgreementApi.getStats(sellerId, 'seller'),
      ]);
      setAgreements(res.data);
      setTotal(res.total);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, [sellerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Open detail ---
  const openDetail = async (ag: PriceAgreement) => {
    setSelected(ag);
    const orders = await priceAgreementApi.getOrders(ag.id);
    setDetailOrders(orders);
    setShowDetail(true);
  };

  // --- Form ---
  const resetForm = () => {
    setFormType('Thoả thuận giá'); setFormTitle(''); setFormBuyerCompany('');
    setFormStartDate(''); setFormEndDate(''); setFormNote('');
    setFormItems([{ productName: '', originalPrice: 0, agreedPrice: 0, minQuantity: 1, maxQuantity: 100, unit: 'Cái' }]);
  };

  const handleCreate = async () => {
    if (!formTitle || !formBuyerCompany || !formStartDate || !formEndDate) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    const items: PriceAgreementItem[] = formItems.map((fi, i) => ({
      id: `pai-new-${i}`, agreementId: '', productId: `prod-new-${i}`,
      productName: fi.productName, originalPrice: fi.originalPrice,
      agreedPrice: fi.agreedPrice,
      discountPercent: fi.originalPrice > 0 ? Math.round(((fi.originalPrice - fi.agreedPrice) / fi.originalPrice) * 100) : 0,
      minQuantity: fi.minQuantity, maxQuantity: fi.maxQuantity, unit: fi.unit,
      validFrom: formStartDate, validTo: formEndDate,
    }));
    const totalValue = items.reduce((s, i) => s + i.agreedPrice * i.maxQuantity, 0);
    await priceAgreementApi.create({
      type: formType, title: formTitle,
      sellerId, sellerName: user?.fullName ?? '', sellerCompany: user?.companyName ?? '',
      buyerId: 'user-001', buyerName: '', buyerCompany: formBuyerCompany,
      items, totalContractValue: totalValue,
      startDate: formStartDate, endDate: formEndDate, note: formNote,
    });
    toast.success('Đã tạo thoả thuận giá');
    setShowForm(false); resetForm(); fetchData();
  };

  // --- Columns ---
  const columns: (ColumnConfig & { render?: (item: PriceAgreement) => React.ReactNode })[] = [
    { key: 'agreementNumber', label: 'Mã TT', visible: true, sortable: true },
    { key: 'type', label: 'Loại', visible: true, sortable: true,
      render: (a) => <Badge variant="outline">{a.type}</Badge>,
    },
    { key: 'buyerCompany', label: 'Người mua', visible: true, sortable: true },
    { key: 'itemCount', label: 'Số SP', visible: true, sortable: false,
      render: (a) => <span>{a.items.length}</span>,
    },
    { key: 'totalContractValue', label: 'Giá trị ĐK', visible: true, sortable: true,
      render: (a) => {
        const pct = a.totalContractValue > 0 ? Math.round((a.usedValue / a.totalContractValue) * 100) : 0;
        return (
          <div className="min-w-[120px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatShort(a.usedValue)}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-0.5">/ {formatShort(a.totalContractValue)}</p>
          </div>
        );
      },
    },
    { key: 'endDate', label: 'Hiệu lực', visible: true, sortable: true,
      render: (a) => {
        const daysLeft = Math.ceil((new Date(a.endDate).getTime() - Date.now()) / 86400000);
        return (
          <div>
            <p className="text-sm">{formatDate(a.startDate)} — {formatDate(a.endDate)}</p>
            {daysLeft > 0 && daysLeft <= 30 && (
              <span className="text-xs text-orange-600">Còn {daysLeft} ngày</span>
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
    { label: 'Đã hết hạn', value: stats.expired, icon: Ban, color: 'text-gray-600 bg-gray-50' },
    { label: 'Giảm giá TB', value: `${stats.avgDiscount}%`, icon: TrendingDown, color: 'text-indigo-600 bg-indigo-50' },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Thoả thuận giá' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2"><Handshake className="h-6 w-6" /> Thoả thuận giá</h1>
          <p className="text-muted-foreground">Quản lý thoả thuận giá & HĐ khung với người mua</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo thoả thuận
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
        searchPlaceholder="Tìm mã TT, tiêu đề, người mua..."
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
              <Button size="sm" variant="ghost" onClick={() => navigate(`/seller/price-agreements/${ag.id}`)}><Eye className="h-4 w-4" /></Button>
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Tạo TT ==================== */}
      <Dialog open={showForm} onOpenChange={o => { if (!o) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo thoả thuận giá</DialogTitle>
            <DialogDescription>Thiết lập thoả thuận giá / HĐ khung với buyer</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại <span className="text-red-500">*</span></Label>
                <Select value={formType} onValueChange={v => setFormType(v as AgreementType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Người mua <span className="text-red-500">*</span></Label>
                <Input value={formBuyerCompany} onChange={e => setFormBuyerCompany(e.target.value)} placeholder="Tên công ty người mua" />
              </div>
            </div>
            <div>
              <Label>Tiêu đề <span className="text-red-500">*</span></Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="VD: TT giá linh kiện H1/2025" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Ngày bắt đầu <span className="text-red-500">*</span></Label><Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} /></div>
              <div><Label>Ngày kết thúc <span className="text-red-500">*</span></Label><Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} /></div>
            </div>
            <div><Label>Ghi chú</Label><Textarea value={formNote} onChange={e => setFormNote(e.target.value)} rows={2} /></div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Danh sách SP & giá thoả thuận</Label>
                <Button size="sm" variant="outline" onClick={() => setFormItems(p => [...p, { productName: '', originalPrice: 0, agreedPrice: 0, minQuantity: 1, maxQuantity: 100, unit: 'Cái' }])}>
                  <Plus className="h-3 w-3 mr-1" /> Thêm SP
                </Button>
              </div>
              <div className="space-y-2">
                {formItems.map((fi, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end p-2 border rounded">
                    <div className="col-span-3">
                      <Input value={fi.productName} onChange={e => setFormItems(p => p.map((x, i) => i === idx ? { ...x, productName: e.target.value } : x))} placeholder="Tên SP" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} value={fi.originalPrice} onChange={e => setFormItems(p => p.map((x, i) => i === idx ? { ...x, originalPrice: Number(e.target.value) } : x))} placeholder="Giá gốc" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} value={fi.agreedPrice} onChange={e => setFormItems(p => p.map((x, i) => i === idx ? { ...x, agreedPrice: Number(e.target.value) } : x))} placeholder="Giá TT" />
                    </div>
                    <div className="col-span-1 text-center text-sm text-green-600">
                      {fi.originalPrice > 0 ? `-${Math.round(((fi.originalPrice - fi.agreedPrice) / fi.originalPrice) * 100)}%` : '—'}
                    </div>
                    <div className="col-span-1">
                      <Input type="number" min={1} value={fi.minQuantity} onChange={e => setFormItems(p => p.map((x, i) => i === idx ? { ...x, minQuantity: Number(e.target.value) } : x))} placeholder="Min" />
                    </div>
                    <div className="col-span-1">
                      <Input type="number" min={1} value={fi.maxQuantity} onChange={e => setFormItems(p => p.map((x, i) => i === idx ? { ...x, maxQuantity: Number(e.target.value) } : x))} placeholder="Max" />
                    </div>
                    <div className="col-span-1">
                      <Select value={fi.unit} onValueChange={v => setFormItems(p => p.map((x, i) => i === idx ? { ...x, unit: v } : x))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{['Cái', 'Mét', 'Kg', 'Tấn', 'Cây', 'Cuộn', 'Tấm'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button size="sm" variant="ghost" className="text-red-500" disabled={formItems.length <= 1}
                        onClick={() => setFormItems(p => p.filter((_, i) => i !== idx))}>✕</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Huỷ</Button>
            <Button onClick={handleCreate} className="gap-2"><Plus className="h-4 w-4" /> Tạo thoả thuận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <div><span className="text-muted-foreground">Mã TT:</span><p className="font-medium">{selected.agreementNumber}</p></div>
                <div><span className="text-muted-foreground">Loại:</span><p><Badge variant="outline">{selected.type}</Badge></p></div>
                <div><span className="text-muted-foreground">Người mua:</span><p className="font-medium">{selected.buyerCompany}</p></div>
                <div><span className="text-muted-foreground">Trạng thái:</span><div className="mt-0.5"><StatusBadge status={selected.status} /></div></div>
                <div><span className="text-muted-foreground">Hiệu lực:</span><p>{formatDate(selected.startDate)} — {formatDate(selected.endDate)}</p></div>
                <div><span className="text-muted-foreground">Giá trị:</span><p className="font-medium">{formatPrice(selected.totalContractValue)}</p></div>
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
                  <span>Đã sử dụng: {formatShort(selected.usedValue)}</span>
                  <span>{selected.totalContractValue > 0 ? Math.round((selected.usedValue / selected.totalContractValue) * 100) : 0}%</span>
                </div>
                <Progress value={selected.totalContractValue > 0 ? Math.round((selected.usedValue / selected.totalContractValue) * 100) : 0} className="h-3" />
              </div>

              {/* Items */}
              <Separator />
              <div>
                <p className="font-medium mb-2">Sản phẩm ({selected.items.length})</p>
                <div className="space-y-2">
                  {selected.items.map(item => (
                    <div key={item.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.productName}</p>
                        <Badge className="bg-green-100 text-green-700">-{item.discountPercent}%</Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Giá gốc: <span className="line-through">{formatPrice(item.originalPrice)}</span></span>
                        <span>Giá TT: <strong className="text-primary">{formatPrice(item.agreedPrice)}</strong></span>
                        <span>SL: {item.minQuantity}–{item.maxQuantity} {item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders */}
              {detailOrders.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Đơn hàng theo TT ({detailOrders.length})</p>
                    <div className="space-y-1">
                      {detailOrders.map(o => (
                        <div key={o.id} className="flex justify-between p-2 rounded hover:bg-muted/30 text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{o.orderNumber}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>{formatDate(o.date)}</span>
                            {o.amount > 0 && <span className="font-medium">{formatPrice(o.amount)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selected.approvedBy && (
                <div className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> Duyệt bởi {selected.approvedBy}
                </div>
              )}

              {selected.note && <p className="text-sm text-muted-foreground">{selected.note}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}