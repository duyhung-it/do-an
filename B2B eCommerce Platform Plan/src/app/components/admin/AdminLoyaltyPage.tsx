// ============================================================
// AdminLoyaltyPage — Quản lý chương trình khách hàng thân thiết (D10)
// Stats, Phân bố tier, DataTable khách hàng, Cấu hình tier, Quản lý phần thưởng
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
  { tier: 'Đồng',      minSpend: 0,          maxSpend: 5000000,    pointRate: 1,   color: '#b87333' },
  { tier: 'Bạc',       minSpend: 5000000,     maxSpend: 20000000,   pointRate: 1.5, color: '#94a3b8' },
  { tier: 'Vàng',      minSpend: 20000000,    maxSpend: 50000000,   pointRate: 2,   color: '#eab308' },
  { tier: 'Kim cương', minSpend: 50000000,    maxSpend: Infinity,   pointRate: 3,   color: '#3b82f6' },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

const mockPrograms: LoyaltyProgram[] = [
  { id: 'LP-001', customerId: 'C01', customerName: 'Nguyễn Văn An', tier: 'Vàng',      points: 12500, totalSpend: 32000000,  pointsExpiry: '2026-12-31', joinedAt: '2025-01-10', nextTierThreshold: 50000000, nextTierName: 'Kim cương' },
  { id: 'LP-002', customerId: 'C02', customerName: 'Trần Thị Bình',  tier: 'Kim cương', points: 48000, totalSpend: 85000000,  pointsExpiry: '2026-12-31', joinedAt: '2024-06-15' },
  { id: 'LP-003', customerId: 'C03', customerName: 'Lê Hoàng Cường', tier: 'Bạc',       points: 3200,  totalSpend: 9500000,   pointsExpiry: '2026-12-31', joinedAt: '2025-08-20', nextTierThreshold: 20000000, nextTierName: 'Vàng' },
  { id: 'LP-004', customerId: 'C04', customerName: 'Phạm Minh Đức',  tier: 'Đồng',      points: 850,   totalSpend: 2200000,   pointsExpiry: '2026-06-30', joinedAt: '2026-01-05', nextTierThreshold: 5000000, nextTierName: 'Bạc' },
  { id: 'LP-005', customerId: 'C05', customerName: 'Hoàng Thị Hà',   tier: 'Vàng',      points: 18200, totalSpend: 41000000,  pointsExpiry: '2026-12-31', joinedAt: '2024-11-01', nextTierThreshold: 50000000, nextTierName: 'Kim cương' },
];

const mockRewards: LoyaltyReward[] = [
  { id: 'R-001', name: 'Voucher giảm 100K', description: 'Voucher giảm giá 100.000₫ cho đơn từ 2 triệu', pointsCost: 1000, category: 'Voucher', available: true, stock: 50 },
  { id: 'R-002', name: 'Miễn phí vận chuyển', description: 'Miễn phí vận chuyển 1 đơn hàng', pointsCost: 500, category: 'Ưu đãi giao hàng', available: true, stock: 100 },
  { id: 'R-003', name: 'Voucher giảm 5%', description: 'Voucher giảm 5% không giới hạn giá trị', pointsCost: 2000, category: 'Voucher', available: true, stock: 20 },
  { id: 'R-004', name: 'Bảo hành mở rộng 6 tháng', description: 'Tặng thêm 6 tháng bảo hành sản phẩm', pointsCost: 5000, category: 'Dịch vụ', available: true, stock: 30 },
  { id: 'R-005', name: 'Trade-in +10%', description: 'Cộng thêm 10% giá trị thu mua khi đổi máy cũ', pointsCost: 3000, category: 'Dịch vụ', available: false, stock: 10 },
];

const tierOptions = ['Tất cả', 'Đồng', 'Bạc', 'Vàng', 'Kim cương'];

export function AdminLoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('Tất cả');
  const [tab, setTab] = useState<'members' | 'rewards' | 'config'>('members');
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [rewardForm, setRewardForm] = useState({ name: '', description: '', pointsCost: '', stock: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setPrograms(mockPrograms);
    setRewards(mockRewards);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = programs.filter(p => {
    const matchSearch = !search || p.customerName.toLowerCase().includes(search.toLowerCase());
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
    { key: 'customerName', label: 'Khách hàng', render: (item: LoyaltyProgram) => (
      <div>
        <p className="font-medium">{item.customerName}</p>
        <p className="text-xs text-muted-foreground">ID: {item.customerId}</p>
      </div>
    )},
    {
      key: 'tier', label: 'Hạng',
      render: (item: LoyaltyProgram) => (
        <Badge style={{ backgroundColor: `${TIER_COLORS[item.tier]}20`, color: TIER_COLORS[item.tier], borderColor: TIER_COLORS[item.tier] }}>
          <Star className="h-3 w-3 mr-1" fill="currentColor" /> {item.tier}
        </Badge>
      ),
    },
    { key: 'points', label: 'Điểm hiện có', render: (item: LoyaltyProgram) => <span className="font-bold text-primary">{item.points.toLocaleString()} pt</span> },
    { key: 'totalSpend', label: 'Chi tiêu tích lũy', render: (item: LoyaltyProgram) => <span>{formatCurrency(item.totalSpend)}</span> },
    { key: 'joinedAt', label: 'Ngày tham gia', render: (item: LoyaltyProgram) => <span className="text-xs">{new Date(item.joinedAt).toLocaleDateString('vi-VN')}</span> },
  ];

  const rewardColumns = [
    { key: 'name', label: 'Phần thưởng', render: (item: LoyaltyReward) => (
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
    )},
    { key: 'pointsCost', label: 'Điểm cần', render: (item: LoyaltyReward) => <Badge variant="outline">{item.pointsCost.toLocaleString()} pt</Badge> },
    { key: 'category', label: 'Loại', render: (item: LoyaltyReward) => <Badge variant="secondary">{item.category}</Badge> },
    { key: 'stock', label: 'Tồn', render: (item: LoyaltyReward) => <span>{item.stock}</span> },
    {
      key: 'available', label: 'Trạng thái',
      render: (item: LoyaltyReward) => <Badge variant={item.available ? 'default' : 'outline'}>{item.available ? 'Hoạt động' : 'Tạm ngừng'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (item: LoyaltyReward) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => {
            setRewards(prev => prev.map(r => r.id === item.id ? { ...r, available: !r.available } : r));
            toast.success(item.available ? 'Đã tạm ngừng phần thưởng' : 'Đã kích hoạt phần thưởng');
          }}>
            {item.available ? 'Tạm ngừng' : 'Kích hoạt'}
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
            setRewards(prev => prev.filter(r => r.id !== item.id));
            toast.success('Đã xóa phần thưởng');
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddReward = () => {
    if (!rewardForm.name || !rewardForm.pointsCost) return;
    const newReward: LoyaltyReward = {
      id: `R-${Date.now()}`,
      name: rewardForm.name,
      description: rewardForm.description,
      pointsCost: parseInt(rewardForm.pointsCost),
      category: 'Voucher',
      available: true,
      stock: parseInt(rewardForm.stock) || 10,
    };
    setRewards(prev => [...prev, newReward]);
    setRewardForm({ name: '', description: '', pointsCost: '', stock: '' });
    setShowRewardForm(false);
    toast.success('Đã thêm phần thưởng mới');
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Khách hàng thân thiết' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Award className="h-6 w-6 text-primary" /> Chương trình Khách hàng thân thiết</h1>
          <p className="text-muted-foreground">Quản lý thành viên, phần thưởng và cấu hình hạng thành viên</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng thành viên" value={stats.total} icon={Users} />
        <StatsCard title="Kim cương" value={stats.diamond} icon={Star} variant="info" />
        <StatsCard title="Tổng điểm đã phát" value={stats.totalPoints / 1000} format={(n) => `${n.toFixed(1)}K pt`} icon={Coins} variant="warning" />
        <StatsCard title="Chi tiêu tích lũy" value={stats.totalSpend} format={formatCurrency} icon={Gift} variant="success" />
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-4">
        {[{ key: 'members', label: 'Thành viên', icon: Users }, { key: 'rewards', label: 'Phần thưởng', icon: Gift }, { key: 'config', label: 'Cấu hình hạng', icon: Settings2 }].map(t => (
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
              <CardHeader><CardTitle>Phân bố Hạng thành viên</CardTitle></CardHeader>
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
                searchPlaceholder="Tìm tên khách hàng..."
                filters={[{ key: 'tier', label: 'Hạng', value: tierFilter, onChange: setTierFilter, options: tierOptions }]}
              />
            </div>
          </div>

          <DataTable columns={memberColumns} data={filtered} loading={loading} emptyMessage="Không có thành viên nào" pagination getId={item => item.id} />
        </div>
      )}

      {tab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowRewardForm(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm phần thưởng</Button>
          </div>
          <DataTable columns={rewardColumns} data={rewards} loading={loading} emptyMessage="Chưa có phần thưởng" getId={item => item.id} />
        </div>
      )}

      {tab === 'config' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Điều kiện hạng & tỷ lệ tích điểm</CardTitle></CardHeader>
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
              <div><Label>Điểm cần</Label><Input type="number" value={rewardForm.pointsCost} onChange={e => setRewardForm(p => ({ ...p, pointsCost: e.target.value }))} placeholder="1000" /></div>
              <div><Label>Số lượng</Label><Input type="number" value={rewardForm.stock} onChange={e => setRewardForm(p => ({ ...p, stock: e.target.value }))} placeholder="50" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRewardForm(false)}>Hủy</Button>
            <Button onClick={handleAddReward} disabled={!rewardForm.name || !rewardForm.pointsCost}>Thêm phần thưởng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
