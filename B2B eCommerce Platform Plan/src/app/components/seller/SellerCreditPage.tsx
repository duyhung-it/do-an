// ============================================================
// Quản lý hạn mức tín dụng — Seller (Nhóm 26B)
// DataTable, tạo/sửa, lịch sử GD, cảnh báo, tạm ngưng
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Plus, Eye, Edit2, Pause, Play, Trash2,
  Download, Search, AlertTriangle, TrendingUp, TrendingDown, Users,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { creditApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  CreditLimit, CreditTransaction, CreditStats, CreditStatus, PaymentTerms,
  PaginationParams, SortParams, ActiveFilter,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatShort = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} tr`;
  return new Intl.NumberFormat('vi-VN').format(n);
};

const ALL_STATUSES: CreditStatus[] = ['Hoạt động', 'Tạm ngưng', 'Hết hạn', 'Chờ duyệt'];
const ALL_TERMS: PaymentTerms[] = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90'];

export function SellerCreditPage() {
  const { user } = useAuth();
  const supplierId = user?.supplierId ?? 'sup-01';

  const [credits, setCredits] = useState<CreditLimit[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [searchText, setSearchText] = useState('');

  // Dialogs
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<CreditLimit | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  // Form
  const [form, setForm] = useState({
    buyerName: '', buyerCompany: '', buyerId: '',
    creditLimit: '', paymentTerms: 'Net 30' as PaymentTerms, expiryDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters: ActiveFilter[] = [...filters];
      if (searchText) activeFilters.push({ key: 'search', value: searchText, label: `Tìm: ${searchText}` });
      const [res, s] = await Promise.all([
        creditApi.getSellerCredits(supplierId, pagination, sort, activeFilters),
        creditApi.getSellerStats(supplierId),
      ]);
      setCredits(res.data);
      setTotal(res.total);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, [supplierId, pagination, sort, filters, searchText]);

  useEffect(() => { loadData(); }, [loadData]);

  const openDetail = async (credit: CreditLimit) => {
    setSelected(credit);
    setShowDetail(true);
    const txns = await creditApi.getTransactions(credit.id);
    setTransactions(txns);
  };

  const openCreate = () => {
    setEditMode(false);
    setForm({ buyerName: '', buyerCompany: '', buyerId: '', creditLimit: '', paymentTerms: 'Net 30', expiryDate: '' });
    setShowCreate(true);
  };

  const openEdit = (credit: CreditLimit) => {
    setEditMode(true);
    setSelected(credit);
    setForm({
      buyerName: credit.buyerName, buyerCompany: credit.buyerCompany, buyerId: credit.buyerId,
      creditLimit: String(credit.creditLimit), paymentTerms: credit.paymentTerms, expiryDate: credit.expiryDate,
    });
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!form.buyerName.trim() || !form.creditLimit || !form.expiryDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      if (editMode && selected) {
        await creditApi.update(selected.id, {
          creditLimit: Number(form.creditLimit),
          paymentTerms: form.paymentTerms,
          expiryDate: form.expiryDate,
        });
        toast.success('Đã cập nhật hạn mức');
      } else {
        await creditApi.create({
          buyerId: form.buyerId || `user-${Date.now()}`,
          buyerName: form.buyerName,
          buyerCompany: form.buyerCompany,
          supplierId,
          supplierName: user?.companyName ?? 'NCC',
          creditLimit: Number(form.creditLimit),
          paymentTerms: form.paymentTerms,
          status: 'Hoạt động',
          approvedBy: user?.fullName ?? '',
          expiryDate: form.expiryDate,
        });
        toast.success('Đã tạo hạn mức tín dụng mới');
      }
      setShowCreate(false);
      loadData();
    } catch {
      toast.error('Lỗi khi lưu hạn mức');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (credit: CreditLimit) => {
    try {
      await creditApi.toggleStatus(credit.id);
      toast.success(credit.status === 'Hoạt động' ? 'Đã tạm ngưng' : 'Đã kích hoạt');
      loadData();
    } catch {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá hạn mức tín dụng này?')) return;
    try {
      await creditApi.delete(id);
      toast.success('Đã xoá');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xoá');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Khách hàng', 'Công ty', 'Hạn mức', 'Đã dùng', 'Còn lại', 'Điều khoản', 'Trạng thái', 'Hết hạn'];
    const rows = credits.map(c => [c.buyerName, c.buyerCompany, c.creditLimit, c.usedAmount, c.availableAmount, c.paymentTerms, c.status, c.expiryDate]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tin-dung-seller-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất CSV');
  };

  const usagePercent = (c: CreditLimit) => Math.round((c.usedAmount / c.creditLimit) * 100);

  const statCards = stats ? [
    { label: 'Tổng đã cấp', value: formatShort(stats.totalCreditGiven), icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
    { label: 'Đang sử dụng', value: formatShort(stats.totalUsed), icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
    { label: 'Tài khoản HĐ', value: stats.activeAccounts, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Cảnh báo', value: stats.warningAccounts, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ] : [];

  const columns = [
    {
      key: 'buyerName' as const, label: 'Khách hàng', sortable: true,
      render: (c: CreditLimit) => (
        <div>
          <p className="font-medium">{c.buyerName}</p>
          <p className="text-muted-foreground text-xs">{c.buyerCompany}</p>
        </div>
      ),
    },
    {
      key: 'creditLimit' as const, label: 'Hạn mức', sortable: true,
      render: (c: CreditLimit) => <span>{formatShort(c.creditLimit)}</span>,
    },
    {
      key: 'usedAmount' as const, label: 'Sử dụng', sortable: true,
      render: (c: CreditLimit) => {
        const pct = usagePercent(c);
        const color = pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-yellow-600' : 'text-green-600';
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center justify-between mb-1">
              <span className={color}>{formatShort(c.usedAmount)}</span>
              <span className="text-muted-foreground text-xs">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    {
      key: 'availableAmount' as const, label: 'Còn lại', sortable: true,
      render: (c: CreditLimit) => <span className="text-primary">{formatShort(c.availableAmount)}</span>,
    },
    { key: 'paymentTerms' as const, label: 'Điều khoản', sortable: true },
    {
      key: 'status' as const, label: 'Trạng thái', sortable: true,
      render: (c: CreditLimit) => {
        const pct = usagePercent(c);
        return (
          <div className="flex items-center gap-1">
            <StatusBadge status={c.status} />
            {c.status === 'Hoạt động' && pct >= 80 && (
              <AlertTriangle className={`h-3.5 w-3.5 ${pct >= 100 ? 'text-red-500' : 'text-yellow-500'}`} />
            )}
          </div>
        );
      },
    },
    { key: 'expiryDate' as const, label: 'Hết hạn', sortable: true },
  ];

  const filterConfigs = [
    { key: 'status', label: 'Trạng thái', type: 'select' as const, options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
    { key: 'paymentTerms', label: 'Điều khoản', type: 'select' as const, options: ALL_TERMS.map(t => ({ label: t, value: t })) },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2"><CreditCard className="h-6 w-6" /> Quản lý tín dụng</h1>
          <p className="text-muted-foreground">Cấp và quản lý hạn mức tín dụng cho khách hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="mr-1 h-4 w-4" /> Xuất CSV</Button>
          <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Cấp hạn mức</Button>
        </div>
      </div>

      {/* Thẻ thống kê */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(card => (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{card.label}</p>
                  <p className="text-lg">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm khách hàng..."
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="pl-9"
          />
        </div>
        <FilterBar
          filters={filterConfigs}
          activeFilters={filters}
          onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        />
      </div>

      {/* Bảng */}
      <DataTable
        columns={columns}
        data={credits}
        loading={loading}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={c => c.id}
        renderActions={c => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => openDetail(c)} title="Chi tiết"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => openEdit(c)} title="Sửa"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => handleToggle(c)} title={c.status === 'Hoạt động' ? 'Tạm ngưng' : 'Kích hoạt'}>
              {c.status === 'Hoạt động' ? <Pause className="h-4 w-4 text-orange-500" /> : <Play className="h-4 w-4 text-green-500" />}
            </Button>
            {c.usedAmount === 0 && (
              <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} title="Xoá" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        emptyMessage="Chưa có hạn mức tín dụng nào"
      />

      {/* Dialog tạo/sửa */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Cập nhật hạn mức' : 'Cấp hạn mức tín dụng mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editMode && (
              <>
                <div>
                  <Label className="mb-1 block">Tên khách hàng *</Label>
                  <Input value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="Nhập tên khách hàng" />
                </div>
                <div>
                  <Label className="mb-1 block">Công ty *</Label>
                  <Input value={form.buyerCompany} onChange={e => setForm(f => ({ ...f, buyerCompany: e.target.value }))} placeholder="Nhập tên công ty" />
                </div>
              </>
            )}
            <div>
              <Label className="mb-1 block">Hạn mức tín dụng (VNĐ) *</Label>
              <Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))} placeholder="500000000" />
            </div>
            <div>
              <Label className="mb-1 block">Điều khoản thanh toán</Label>
              <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v as PaymentTerms }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Ngày hết hạn *</Label>
              <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editMode ? 'Cập nhật' : 'Tạo'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog chi tiết + Lịch sử GD */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Chi tiết hạn mức tín dụng
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selected.buyerName}</p>
                  <p className="text-muted-foreground">{selected.buyerCompany}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">Hạn mức</p>
                  <p className="text-lg">{formatPrice(selected.creditLimit)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">Đã sử dụng</p>
                  <p className="text-lg text-orange-600">{formatPrice(selected.usedAmount)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">Còn lại</p>
                  <p className="text-lg text-primary">{formatPrice(selected.availableAmount)}</p>
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                  <span>Sử dụng {usagePercent(selected)}%</span>
                  <span>{formatShort(selected.usedAmount)} / {formatShort(selected.creditLimit)}</span>
                </div>
                <Progress value={usagePercent(selected)} className="h-2" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Điều khoản</p>
                  <p>{selected.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phê duyệt bởi</p>
                  <p>{selected.approvedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ngày tạo</p>
                  <p>{selected.createdAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Hết hạn</p>
                  <p>{selected.expiryDate}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-3">Lịch sử giao dịch ({transactions.length})</p>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Chưa có giao dịch</p>
                ) : (
                  <div className="space-y-0">
                    {transactions.map((txn, idx) => (
                      <div key={txn.id} className="flex gap-3 pb-3 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${
                            txn.type === 'Sử dụng' ? 'bg-orange-500' : txn.type === 'Thanh toán' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          {idx < transactions.length - 1 && <div className="w-0.5 flex-1 bg-muted-foreground/20 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{txn.type}</p>
                            <span className={
                              txn.type === 'Sử dụng' ? 'text-orange-600' : 'text-green-600'
                            }>
                              {txn.type === 'Sử dụng' ? '-' : '+'}{formatPrice(txn.amount)}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">{txn.orderNumber} — {txn.note}</p>
                          <p className="text-muted-foreground text-xs">{txn.createdAt} · Số dư: {formatPrice(txn.balance)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
