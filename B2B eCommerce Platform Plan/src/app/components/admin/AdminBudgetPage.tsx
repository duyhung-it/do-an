// ============================================================
// AdminBudgetPage — Quản lý Ngân sách mua hàng (Admin)
// Admin thiết lập, theo dõi và phê duyệt ngân sách theo bộ phận
// ============================================================

import { useState, useEffect } from 'react';
import {
  Wallet, Search, Plus, Edit, Trash2, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, BarChart3, DollarSign, RefreshCw,
  Download, X, Target, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatsCard } from '../shared/StatsCard';
import { EmptyState } from '../shared/EmptyState';
import { budgetApi } from '../../services/budgetApi';
import { toast } from 'sonner';
import type { Budget } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PERIODS = ['Tháng này', 'Quý này', 'Năm này'];
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1,
}).format(n);

function BudgetBar({ budget, spent }: { budget: number; spent: number }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{fmt(spent)} đã dùng</span>
        <span className={pct >= 90 ? 'text-red-600 font-bold' : ''}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Còn lại: {fmt(Math.max(0, budget - spent))}</span>
        <span>Tổng: {fmt(budget)}</span>
      </div>
    </div>
  );
}

function BudgetFormDialog({ budget, onClose, onSave }: {
  budget?: Budget;
  onClose: () => void;
  onSave: (data: Partial<Budget>) => void;
}) {
  const [form, setForm] = useState({
    department: budget?.department ?? '',
    period: budget?.period ?? 'monthly',
    year: budget?.year ?? new Date().getFullYear(),
    month: budget?.month ?? new Date().getMonth() + 1,
    totalBudget: budget?.totalBudget ?? 0,
    alertThreshold: budget?.alertThreshold ?? 80,
    notes: budget?.notes ?? '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{budget ? 'Chỉnh sửa ngân sách' : 'Thêm ngân sách mới'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Bộ phận / Phòng ban *</label>
            <Input placeholder="vd: Phòng Mua hàng, Phòng IT..." value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Chu kỳ</label>
              <select className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value as Budget['period'] }))}>
                <option value="monthly">Theo tháng</option>
                <option value="quarterly">Theo quý</option>
                <option value="yearly">Theo năm</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Năm</label>
              <Input type="number" min={2024} max={2030} value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} />
            </div>
          </div>
          {form.period === 'monthly' && (
            <div>
              <label className="text-sm font-medium mb-1 block">Tháng</label>
              <select className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Ngân sách (VNĐ) *</label>
            <Input
              type="number" min={0} step={1000000}
              value={form.totalBudget}
              onChange={e => setForm(f => ({ ...f, totalBudget: parseFloat(e.target.value) || 0 }))}
            />
            {form.totalBudget > 0 && <p className="text-xs text-muted-foreground mt-1">{fmt(form.totalBudget)}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ngưỡng cảnh báo (%)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number" min={50} max={100} className="w-24"
                value={form.alertThreshold}
                onChange={e => setForm(f => ({ ...f, alertThreshold: parseInt(e.target.value) || 80 }))}
              />
              <span className="text-sm text-muted-foreground">— Cảnh báo khi đã dùng &gt; {form.alertThreshold}% ngân sách</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ghi chú</label>
            <textarea className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none" rows={2} placeholder="Ghi chú về ngân sách..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t justify-end">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={() => {
            if (!form.department || form.totalBudget <= 0) { toast.error('Điền đầy đủ thông tin'); return; }
            onSave(form);
            onClose();
          }}>
            {budget ? 'Lưu thay đổi' : 'Tạo ngân sách'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminBudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Budget | undefined>();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('Tháng này');

  const load = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getAll('all', new Date().getFullYear());
      setBudgets(res);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Partial<Budget>) => {
    try {
      if (editTarget) {
        await budgetApi.update(editTarget.id, data);
        toast.success('Đã cập nhật ngân sách');
      } else {
        await budgetApi.create(data as Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Đã tạo ngân sách mới');
      }
      load();
      setEditTarget(undefined);
    } catch {
      toast.error('Lỗi lưu ngân sách');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá ngân sách này?')) return;
    try {
      await budgetApi.delete(id);
      toast.success('Đã xoá ngân sách');
      load();
    } catch {
      toast.error('Lỗi xoá ngân sách');
    }
  };

  const filtered = budgets.filter(b =>
    !search || b.department.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate stats
  const totalBudget = filtered.reduce((s, b) => s + b.totalBudget, 0);
  const totalSpent = filtered.reduce((s, b) => s + b.spentAmount, 0);
  const overBudget = filtered.filter(b => b.spentAmount > b.totalBudget);
  const nearLimit = filtered.filter(b => {
    const pct = b.totalBudget > 0 ? (b.spentAmount / b.totalBudget) * 100 : 0;
    return pct >= b.alertThreshold && b.spentAmount <= b.totalBudget;
  });

  // Chart data
  const barData = filtered.slice(0, 8).map(b => ({
    name: b.department.replace('Phòng ', '').slice(0, 12),
    budget: Math.round(b.totalBudget / 1e6),
    spent: Math.round(b.spentAmount / 1e6),
  }));

  const pieData = [
    { name: 'Đã dùng', value: totalSpent },
    { name: 'Còn lại', value: Math.max(0, totalBudget - totalSpent) },
  ];

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Quản lý ngân sách' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Quản lý ngân sách mua hàng
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Xuất báo cáo</Button>
          <Button onClick={() => { setEditTarget(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Thêm ngân sách
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Tổng ngân sách" value={totalBudget} format={fmt} icon={Wallet} variant="primary" />
        <StatsCard title="Đã chi" value={totalSpent} format={fmt} icon={TrendingUp} variant="warning" />
        <StatsCard title="Còn lại" value={Math.max(0, totalBudget - totalSpent)} format={fmt} icon={DollarSign} variant="success" />
        <StatsCard title="Vượt ngân sách" value={overBudget.length} icon={AlertTriangle} variant="danger" />
      </div>

      {/* Alerts */}
      {overBudget.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">
            {overBudget.map(b => b.department).join(', ')} đã vượt ngân sách!
          </p>
        </div>
      )}
      {nearLimit.length > 0 && overBudget.length === 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{nearLimit.map(b => b.department).join(', ')} gần đạt ngưỡng cảnh báo</p>
        </div>
      )}

      {/* Charts */}
      {!loading && filtered.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Ngân sách vs. Chi tiêu theo bộ phận (triệu ₫)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(v: number) => [v + 'M ₫']} />
                    <Bar dataKey="budget" name="Ngân sách" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Đã chi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" /> Tỷ lệ sử dụng tổng thể
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                      <Cell fill="#3b82f6" />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt(v)]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Đã dùng <span className="font-bold text-primary">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%</span> ngân sách tổng
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter + Table */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm bộ phận..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={period} onChange={e => setPeriod(e.target.value)}>
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-10 w-10" />}
            title="Chưa có ngân sách nào"
            description="Tạo ngân sách đầu tiên cho các bộ phận"
            action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Tạo ngân sách</Button>}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(b => {
              const pct = b.totalBudget > 0 ? (b.spentAmount / b.totalBudget) * 100 : 0;
              const isOver = b.spentAmount > b.totalBudget;
              const isNear = pct >= b.alertThreshold && !isOver;
              return (
                <Card key={b.id} className={isOver ? 'border-red-300' : isNear ? 'border-amber-300' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isOver ? 'bg-red-100' : isNear ? 'bg-amber-100' : 'bg-green-100'}`}>
                          <Building2 className={`h-5 w-5 ${isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-green-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{b.department}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.period === 'monthly' ? `Tháng ${b.month}/${b.year}` :
                             b.period === 'quarterly' ? `Q${b.quarter}/${b.year}` : `Năm ${b.year}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOver && <Badge variant="destructive">Vượt ngân sách</Badge>}
                        {isNear && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Gần ngưỡng</Badge>}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTarget(b); setShowForm(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(b.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <BudgetBar budget={b.totalBudget} spent={b.spentAmount} />
                    {b.notes && <p className="text-xs text-muted-foreground mt-2 italic">{b.notes}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <BudgetFormDialog
          budget={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
