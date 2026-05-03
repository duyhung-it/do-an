// ============================================================
// AdminLoyaltyPage — Quản lý chương trình khách hàng thân thiết (D10)
// Stats, Phân bố tier, DataTable buyer, Cấu hình tier, Quản lý phần thưởng
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Award, Star, Users, Coins, Gift, RefreshCw, Settings2, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import { toast } from 'sonner';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { LoyaltyProgram, LoyaltyReward } from '../../types';

const TIER_COLORS: Record<string, string> = {
  'Đồng': '#b87333',
  'Bạc': '#94a3b8',
  'Vàng': '#eab308',
  'Kim cương': '#3b82f6',
};

const TIER_CONFIG = [
  { tier: 'Đồng', minSpend: 0, maxSpend: 50000000, pointRate: 1, color: '#b87333' },
  { tier: 'Bạc', minSpend: 50000000, maxSpend: 200000000, pointRate: 1.5, color: '#94a3b8' },
  { tier: 'Vàng', minSpend: 200000000, maxSpend: 500000000, pointRate: 2, color: '#eab308' },
  { tier: 'Kim cương', minSpend: 500000000, maxSpend: Infinity, pointRate: 3, color: '#3b82f6' },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

const mockPrograms: (LoyaltyProgram & { buyerName: string; companyName: string })[] = [
  { id: 'LP-001', buyerId: 'B01', buyerName: 'Nguyễn Văn A', companyName: 'Công ty ABC', tier: 'Vàng', points: 12500, totalSpend: 320000000, pointsExpiry: '2026-12-31', joinedAt: '2025-01-10', transactions: [], rewards: [] },
  { id: 'LP-002', buyerId: 'B02', buyerName: 'Trần Thị B', companyName: 'Tập đoàn XYZ', tier: 'Kim cương', points: 48000, totalSpend: 850000000, pointsExpiry: '2026-12-31', joinedAt: '2024-06-15', transactions: [], rewards: [] },
  { id: 'LP-003', buyerId: 'B03', buyerName: 'Lê Văn C', companyName: 'Ngân hàng DEF', tier: 'Bạc', points: 3200, totalSpend: 95000000, pointsExpiry: '2026-12-31', joinedAt: '2025-08-20', transactions: [], rewards: [] },
  { id: 'LP-004', buyerId: 'B04', buyerName: 'Phạm Thị D', companyName: 'Công ty GHI', tier: 'Đồng', points: 850, totalSpend: 22000000, pointsExpiry: '2026-06-30', joinedAt: '2026-01-05', transactions: [], rewards: [] },
  { id: 'LP-005', buyerId: 'B05', buyerName: 'Hoàng Văn E', companyName: 'Công ty JKL', tier: 'Vàng', points: 18200, totalSpend: 410000000, pointsExpiry: '2026-12-31', joinedAt: '2024-11-01', transactions: [], rewards: [] },
];

const mockRewards: LoyaltyReward[] = [
  { id: 'R-001', name: 'Giảm 100K đơn hàng', description: 'Voucher giảm giá 100.000₫', pointsRequired: 1000, type: 'Voucher', value: 100000, isActive: true, stock: 50 },
  { id: 'R-002', name: 'Giao hàng miễn phí', description: 'Miễn phí vận chuyển 1 đơn hàng', pointsRequired: 500, type: 'Dịch vụ', value: 0, isActive: true, stock: 100 },
  { id: 'R-003', name: 'Giảm 5% đơn hàng', description: 'Voucher giảm % không giới hạn', pointsRequired: 2000, type: 'Voucher', value: 0, isActive: true, stock: 20 },
  { id: 'R-004', name: 'Ưu tiên xử lý RFQ', description: 'Đẩy RFQ lên đầu danh sách trong 7 ngày', pointsRequired: 3000, type: 'Dịch vụ', value: 0, isActive: true, stock: 30 },
  { id: 'R-005', name: 'Bảo hành mở rộng 6 tháng', description: 'Tặng thêm 6 tháng bảo hành', pointsRequired: 5000, type: 'Dịch vụ', value: 0, isActive: false, stock: 10 },
];

const tierOptions = ['Tất cả', 'Đồng', 'Bạc', 'Vàng', 'Kim cương'];

export function AdminLoyaltyPage() {
  const [programs, setPrograms] = useState<typeof mockPrograms>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('Tất cả');
  const [tab, setTab] = useState<'members' | 'rewards' | 'config'>('members');
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [rewardForm, setRewardForm] = useState({ name: '', description: '', pointsRequired: '', stock: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setPrograms(mockPrograms);
    setRewards(mockRewards);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = programs.filter(p => {
    const matchSearch = !search || p.buyerName.toLowerCase().includes(search.toLowerCase()) || p.companyName.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'Tất cả' || p.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const tierDist = ['Đồng', 'Bạc', 'Vàng', 'Kim cương'].map(tier => ({
    name: tier,
    value: programs.filter(p => p.tier === tier).length,
    color: TIER_COLORS[tier],
  }));

  const stats = {
    total: programs.length,
    totalPoints: programs.reduce((s, p) => s + p.points, 0),
    totalSpend: programs.reduce((s, p) => s + p.totalSpend, 0),
    diamond: programs.filter(p => p.tier === 'Kim cương').length,
  };

  const memberColumns = [
    { key: 'buyerName', label: 'Thành viên', render: (v: string, row: typeof mockPrograms[0]) => (
      <div>
        <p className="font-medium">{v}</p>
        <p className="text-xs text-muted-foreground">{row.companyName}</p>
      </div>
    )},
    {
      key: 'tier', label: 'Tier',
      render: (v: string) => (
        <Badge style={{ backgroundColor: `${TIER_COLORS[v]}20`, color: TIER_COLORS[v], borderColor: TIER_COLORS[v] }}>
          <Star className="h-3 w-3 mr-1" fill="currentColor" /> {v}
        </Badge>
      ),
    },
    { key: 'points', label: 'Điểm hiện có', render: (v: number) => <span className="font-bold text-primary">{v.toLocaleString()} pt</span> },
    { key: 'totalSpend', label: 'Chi tiêu tích lũy', render: (v: number) => <span>{formatCurrency(v)}</span> },
    { key: 'joinedAt', label: 'Ngày tham gia', render: (v: string) => <span className="text-xs">{new Date(v).toLocaleDateString('vi-VN')}</span> },
  ];

  const rewardColumns = [
    { key: 'name', label: 'Phần thưởng', render: (v: string, row: LoyaltyReward) => (
      <div>
        <p className="font-medium">{v}</p>
        <p className="text-xs text-muted-foreground">{row.description}</p>
      </div>
    )},
    { key: 'pointsRequired', label: 'Điểm cần', render: (v: number) => <Badge variant="outline">{v.toLocaleString()} pt</Badge> },
    { key: 'type', label: 'Loại', render: (v: string) => <Badge variant="secondary">{v}</Badge> },
    { key: 'stock', label: 'Tồn', render: (v: number) => <span>{v}</span> },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (v: boolean) => <Badge variant={v ? 'default' : 'outline'}>{v ? 'Hoạt động' : 'Tạm ngừng'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (_: unknown, row: LoyaltyReward) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => {
            setRewards(prev => prev.map(r => r.id === row.id ? { ...r, isActive: !r.isActive } : r));
            toast.success(row.isActive ? 'Đã tạm ngừng phần thưởng' : 'Đã kích hoạt phần thưởng');
          }}>
            {row.isActive ? 'Tạm ngừng' : 'Kích hoạt'}
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
            setRewards(prev => prev.filter(r => r.id !== row.id));
            toast.success('Đã xóa phần thưởng');
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddReward = () => {
    if (!rewardForm.name || !rewardForm.pointsRequired) return;
    const newReward: LoyaltyReward = {
      id: `R-${Date.now()}`,
      name: rewardForm.name,
      description: rewardForm.description,
      pointsRequired: parseInt(rewardForm.pointsRequired),
      type: 'Voucher',
      value: 0,
      isActive: true,
      stock: parseInt(rewardForm.stock) || 10,
    };
    setRewards(prev => [...prev, newReward]);
    setRewardForm({ name: '', description: '', pointsRequired: '', stock: '' });
    setShowRewardForm(false);
    toast.success('Đã thêm phần thưởng mới');
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Khách hàng thân thiết' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Chương trình Khách hàng thân thiết</h1>
          <p className="text-muted-foreground">Quản lý thành viên, phần thưởng và cấu hình tier</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng thành viên" value={stats.total} icon={<Users className="h-5 w-5 text-primary" />} />
        <StatsCard title="Kim cương" value={stats.diamond} icon={<Star className="h-5 w-5 text-blue-500" />} color="info" />
        <StatsCard title="Tổng điểm đã phát" value={`${(stats.totalPoints / 1000).toFixed(1)}K pt`} icon={<Coins className="h-5 w-5 text-yellow-500" />} color="warning" />
        <StatsCard title="Chi tiêu tích lũy" value={formatCurrency(stats.totalSpend)} icon={<Gift className="h-5 w-5 text-purple-500" />} color="success" />
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-4">
        {[{ key: 'members', label: 'Thành viên', icon: Users }, { key: 'rewards', label: 'Phần thưởng', icon: Gift }, { key: 'config', label: 'Cấu hình tier', icon: Settings2 }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex items-center gap-1.5 pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Phân bố Tier</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={tierDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {tierDist.map(entry => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <FilterBar
                search={search} onSearchChange={setSearch}
                searchPlaceholder="Tìm thành viên, công ty..."
                filters={[{ key: 'tier', label: 'Tier', value: tierFilter, onChange: setTierFilter, options: tierOptions }]}
              />
            </div>
          </div>

          <DataTable columns={memberColumns} data={filtered} loading={loading} emptyMessage="Không có thành viên nào" pagination />
        </div>
      )}

      {tab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowRewardForm(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm phần thưởng</Button>
          </div>
          <DataTable columns={rewardColumns} data={rewards} loading={loading} emptyMessage="Chưa có phần thưởng" />
        </div>
      )}

      {tab === 'config' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Điều kiện tier & tỷ lệ tích điểm</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TIER_CONFIG.map(t => (
                  <div key={t.tier} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${t.color}20` }}>
                        <Star className="h-4 w-4" style={{ color: t.color }} fill={t.color} />
                      </div>
                      <span className="font-bold" style={{ color: t.color }}>{t.tier}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Chi tiêu tối thiểu:</p>
                      <p className="font-semibold">{formatCurrency(t.minSpend)}</p>
                      {t.maxSpend !== Infinity && <p className="text-xs text-muted-foreground">đến {formatCurrency(t.maxSpend)}</p>}
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-muted-foreground">Tỷ lệ tích điểm:</p>
                        <p className="font-bold text-primary">{t.pointRate}x điểm/₫</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 gap-1">
                      <Edit className="h-3 w-3" /> Chỉnh sửa
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Reward Dialog */}
      <Dialog open={showRewardForm} onOpenChange={setShowRewardForm}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Thêm phần thưởng mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tên phần thưởng</Label><Input value={rewardForm.name} onChange={e => setRewardForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Voucher giảm 200K" /></div>
            <div><Label>Mô tả</Label><Input value={rewardForm.description} onChange={e => setRewardForm(p => ({ ...p, description: e.target.value }))} placeholder="Mô tả chi tiết" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Điểm cần</Label><Input type="number" value={rewardForm.pointsRequired} onChange={e => setRewardForm(p => ({ ...p, pointsRequired: e.target.value }))} placeholder="1000" /></div>
              <div><Label>Số lượng</Label><Input type="number" value={rewardForm.stock} onChange={e => setRewardForm(p => ({ ...p, stock: e.target.value }))} placeholder="50" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRewardForm(false)}>Hủy</Button>
            <Button onClick={handleAddReward} disabled={!rewardForm.name || !rewardForm.pointsRequired}>Thêm phần thưởng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
