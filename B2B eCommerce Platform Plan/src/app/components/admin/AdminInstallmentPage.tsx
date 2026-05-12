// ============================================================
// AdminInstallmentPage — Quản lý gói trả góp
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Edit2, Trash2, RefreshCw, Banknote, Percent, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import type { InstallmentPlan } from '../../types';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

const mockPlans: InstallmentPlan[] = [
  { id: 'ip-001', bankName: 'VPBank', months: [3, 6, 9, 12, 18, 24], interestRate: 0, minAmount: 3000000, maxAmount: 100000000, isActive: true },
  { id: 'ip-002', bankName: 'Home Credit', months: [6, 9, 12, 18, 24], interestRate: 1.79, minAmount: 3000000, maxAmount: 80000000, isActive: true },
  { id: 'ip-003', bankName: 'MCredit', months: [6, 9, 12], interestRate: 2.5, minAmount: 3000000, maxAmount: 50000000, isActive: true },
  { id: 'ip-004', bankName: 'Shinhan Finance', months: [3, 6, 9, 12], interestRate: 0, minAmount: 5000000, maxAmount: 60000000, isActive: true },
  { id: 'ip-005', bankName: 'FE Credit', months: [3, 6, 9, 12, 18], interestRate: 1.5, minAmount: 3000000, isActive: true },
  { id: 'ip-006', bankName: 'HD SAISON', months: [6, 9, 12, 18, 24], interestRate: 1.99, minAmount: 5000000, isActive: false },
];

const emptyForm: Omit<InstallmentPlan, 'id'> = {
  bankName: '', months: [6, 12], interestRate: 0, minAmount: 3000000, isActive: true,
};

export function AdminInstallmentPage() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [deleteTarget, setDeleteTarget] = useState<InstallmentPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<InstallmentPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [monthsInput, setMonthsInput] = useState('6,12,24');

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setPlans(mockPlans);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.bankName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || (statusFilter === 'Hoạt động' ? p.isActive : !p.isActive);
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setMonthsInput('6,12,24');
    setShowForm(true);
  };

  const openEdit = (plan: InstallmentPlan) => {
    setEditTarget(plan);
    setForm({ ...plan });
    setMonthsInput(plan.months.join(','));
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.bankName.trim()) {
      toast.error('Vui lòng nhập tên ngân hàng');
      return;
    }
    const months = monthsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (months.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 kỳ hạn');
      return;
    }
    const data = { ...form, months };
    if (editTarget) {
      setPlans(prev => prev.map(p => p.id === editTarget.id ? { ...data, id: editTarget.id } : p));
      toast.success('Đã cập nhật gói trả góp');
    } else {
      setPlans(prev => [...prev, { ...data, id: `ip-${Date.now()}` }]);
      toast.success('Đã thêm gói trả góp mới');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPlans(prev => prev.filter(p => p.id !== deleteTarget.id));
    toast.success('Đã xóa gói trả góp');
    setDeleteTarget(null);
  };

  const handleToggle = (plan: InstallmentPlan) => {
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p));
    toast.success(plan.isActive ? 'Đã tạm ngừng gói' : 'Đã kích hoạt gói');
  };

  const columns = [
    {
      key: 'bankName', label: 'Ngân hàng / Đối tác',
      render: (item: InstallmentPlan) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Banknote className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{item.bankName}</p>
        </div>
      ),
    },
    {
      key: 'months', label: 'Kỳ hạn (tháng)',
      render: (item: InstallmentPlan) => (
        <div className="flex flex-wrap gap-1">
          {item.months.map(m => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
        </div>
      ),
    },
    {
      key: 'interestRate', label: 'Lãi suất',
      render: (item: InstallmentPlan) => (
        <Badge variant={item.interestRate === 0 ? 'default' : 'secondary'} className={item.interestRate === 0 ? 'bg-emerald-500' : ''}>
          {item.interestRate === 0 ? '0% lãi' : `${item.interestRate}%/tháng`}
        </Badge>
      ),
    },
    {
      key: 'minAmount', label: 'Giá tối thiểu',
      render: (item: InstallmentPlan) => <span className="text-sm">{formatCurrency(item.minAmount)}</span>,
    },
    {
      key: 'maxAmount', label: 'Giá tối đa',
      render: (item: InstallmentPlan) => <span className="text-sm text-muted-foreground">{item.maxAmount ? formatCurrency(item.maxAmount) : '—'}</span>,
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (item: InstallmentPlan) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>
          {item.isActive ? 'Hoạt động' : 'Tạm ngừng'}
        </Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: InstallmentPlan) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleToggle(item)} title={item.isActive ? 'Tạm ngừng' : 'Kích hoạt'}>
            <Percent className={`h-4 w-4 ${item.isActive ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = plans.filter(p => p.isActive).length;
  const zeroInterestCount = plans.filter(p => p.interestRate === 0 && p.isActive).length;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Trả góp' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Quản lý trả góp</h1>
          <p className="text-muted-foreground">Cấu hình các gói trả góp với ngân hàng và đối tác tài chính</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Thêm gói trả góp</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng gói" value={plans.length} icon={CreditCard} />
        <StatsCard title="Đang hoạt động" value={activeCount} icon={TrendingUp} variant="success" />
        <StatsCard title="Gói 0% lãi suất" value={zeroInterestCount} icon={Percent} variant="info" />
        <StatsCard title="Đối tác" value={new Set(plans.map(p => p.bankName)).size} icon={Banknote} variant="warning" />
      </div>

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm tên ngân hàng..."
        filters={[
          { key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: ['Tất cả', 'Hoạt động', 'Tạm ngừng'] },
        ]}
      />

      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Chưa có gói trả góp nào" />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editTarget ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editTarget ? 'Chỉnh sửa gói trả góp' : 'Thêm gói trả góp mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tên ngân hàng / đối tác *</Label>
              <Input
                value={form.bankName}
                onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))}
                placeholder="VPBank, Home Credit, Shinhan..."
              />
            </div>
            <div>
              <Label>Kỳ hạn (tháng) — phân cách bởi dấu phẩy</Label>
              <Input
                value={monthsInput}
                onChange={e => setMonthsInput(e.target.value)}
                placeholder="3,6,9,12,18,24"
              />
              <p className="text-xs text-muted-foreground mt-1">VD: 6,12,24</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Lãi suất (%/tháng)</Label>
                <Input
                  type="number" step="0.01"
                  value={form.interestRate}
                  onChange={e => setForm(p => ({ ...p, interestRate: parseFloat(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">0 = miễn lãi</p>
              </div>
              <div>
                <Label>Giá tối thiểu (₫)</Label>
                <Input
                  type="number"
                  value={form.minAmount}
                  onChange={e => setForm(p => ({ ...p, minAmount: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label>Giá tối đa (₫) — tùy chọn</Label>
              <Input
                type="number"
                value={form.maxAmount ?? ''}
                onChange={e => setForm(p => ({ ...p, maxAmount: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Để trống nếu không giới hạn"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox" id="isActive"
                checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive" className="cursor-pointer">Kích hoạt ngay</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editTarget ? 'Lưu thay đổi' : 'Thêm gói'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa gói trả góp <strong>"{deleteTarget?.bankName}"</strong>? Khách hàng sẽ không thể chọn gói này khi mua hàng.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
