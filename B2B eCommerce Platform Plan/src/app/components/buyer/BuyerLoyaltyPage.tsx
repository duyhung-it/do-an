// ============================================================
// Buyer — Chương trình khách hàng thân thiết (Nhóm 41C)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Award, Gift, Star, TrendingUp, TrendingDown, Clock, Gem,
  ShoppingBag, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { useAuth } from '../../context/AuthContext';
import { loyaltyApi } from '../../services/loyaltyApi';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type {
  LoyaltyProgram, LoyaltyTransaction, LoyaltyReward, LoyaltyTxnType,
  PaginationParams, ColumnConfig,
} from '../../types';

// Tier config
const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; hex: string }> = {
  'Đồng':      { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', hex: '#CD7F32' },
  'Bạc':       { color: 'text-gray-500',  bg: 'bg-gray-100',  border: 'border-gray-300',  hex: '#C0C0C0' },
  'Vàng':      { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-400', hex: '#FFD700' },
  'Kim cương': { color: 'text-cyan-500',  bg: 'bg-cyan-50',   border: 'border-cyan-300',  hex: '#B9F2FF' },
};

const TIER_BENEFITS = [
  { tier: 'Đồng',      discount: '0%', freeShip: 'Không', priorityCS: 'Không', gift: 'Không' },
  { tier: 'Bạc',       discount: '2%', freeShip: 'Đơn > 5tr', priorityCS: 'Không', gift: 'Quà sinh nhật' },
  { tier: 'Vàng',      discount: '5%', freeShip: 'Đơn > 2tr', priorityCS: 'Có', gift: 'Quà sinh nhật + quý' },
  { tier: 'Kim cương', discount: '10%', freeShip: 'Tất cả đơn', priorityCS: 'VIP 24/7', gift: 'Quà hàng tháng' },
];

const benefitColumns: ColumnConfig[] = [
  { key: 'tier', label: 'Hạng', visible: true, sortable: false },
  { key: 'discount', label: 'Giảm giá', visible: true, sortable: false },
  { key: 'freeShip', label: 'Miễn phí ship', visible: true, sortable: false },
  { key: 'priorityCS', label: 'Ưu tiên CSKH', visible: true, sortable: false },
  { key: 'gift', label: 'Quà tặng', visible: true, sortable: false },
];

const txnColumns: (ColumnConfig & { render?: (item: LoyaltyTransaction) => React.ReactNode })[] = [
  {
    key: 'createdAt', label: 'Ngày', visible: true, sortable: true,
    render: (item: LoyaltyTransaction) => <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>,
  },
  {
    key: 'type', label: 'Loại', visible: true, sortable: true,
    render: (item: LoyaltyTransaction) => {
      const map: Record<string, string> = {
        'Tích': 'bg-green-100 text-green-700',
        'Tiêu': 'bg-blue-100 text-blue-700',
        'Hết hạn': 'bg-gray-100 text-gray-600',
        'Thưởng': 'bg-purple-100 text-purple-700',
      };
      return <Badge className={map[item.type] || ''}>{item.type}</Badge>;
    },
  },
  {
    key: 'points', label: 'Điểm', visible: true, sortable: true,
    render: (item: LoyaltyTransaction) => (
      <span className={item.points >= 0 ? 'text-green-600' : 'text-red-500'}>
        {item.points >= 0 ? '+' : ''}{item.points.toLocaleString()}
      </span>
    ),
  },
  { key: 'description', label: 'Mô tả', visible: true, sortable: false },
];

// ===== Hero Section =====
function TierHero({ program }: { program: LoyaltyProgram }) {
  const config = TIER_CONFIG[program.tier] || TIER_CONFIG['Đồng'];
  const progressPercent = program.nextTierThreshold
    ? Math.min(100, Math.round((program.currentPoints / program.nextTierThreshold) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* VIP Card — P3.39 */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${config.hex}30 0%, ${config.hex}60 50%, ${config.hex}90 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: config.hex, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-15" style={{ backgroundColor: config.hex, transform: 'translate(-20%, 20%)' }} />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: config.hex, boxShadow: `0 8px 32px ${config.hex}60` }}
            >
              <Gem className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${config.bg} ${config.color} border ${config.border} text-base px-4 py-1`}>
                  {program.tier}
                </Badge>
                <span className="text-sm text-muted-foreground">Member</span>
              </div>
              <p className="text-4xl">
                {program.currentPoints.toLocaleString()}
                <span className="text-base text-muted-foreground ml-2">điểm</span>
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Chi tiêu tích luỹ: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(program.lifetimeSpend)}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-sm">
            {program.nextTierThreshold ? (
              <div className="bg-white/40 backdrop-blur rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến tới <span className="font-medium">{program.nextTierName}</span></span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-3 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%`, backgroundColor: config.hex }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Còn <span className="font-medium">{(program.nextTierThreshold - program.currentPoints).toLocaleString()}</span> điểm để lên hạng
                </p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur rounded-xl p-4 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <p className="text-sm">Bạn đã đạt hạng cao nhất!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Tab: Tổng quan =====
function OverviewTab({ program, stats }: {
  program: LoyaltyProgram;
  stats: { currentPoints: number; expiringPoints: number; expiryDate: string; monthlyEarned: { month: string; earned: number; spent: number }[] } | null;
}) {
  const fmtCur = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl">{program.currentPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Điểm hiện có</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gem className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
            <p className="text-2xl">{program.tier}</p>
            <p className="text-xs text-muted-foreground">Hạng thành viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xl">{fmtCur(program.lifetimeSpend)}</p>
            <p className="text-xs text-muted-foreground">Chi tiêu tích luỹ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl text-amber-600">{stats?.expiringPoints ?? 0}</p>
            <p className="text-xs text-muted-foreground">Điểm sắp hết hạn ({stats?.expiryDate ? new Date(stats.expiryDate).toLocaleDateString('vi-VN') : '—'})</p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng lợi ích */}
      <Card>
        <CardHeader><CardTitle>Bảng lợi ích theo hạng</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {benefitColumns.map(c => <th key={c.key} className="text-left py-2 px-3">{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {TIER_BENEFITS.map(b => {
                  const isActive = b.tier === program.tier;
                  return (
                    <tr key={b.tier} className={`border-b ${isActive ? 'bg-primary/5' : ''}`}>
                      <td className="py-2 px-3">
                        <Badge className={`${TIER_CONFIG[b.tier]?.bg} ${TIER_CONFIG[b.tier]?.color}`}>
                          {b.tier}
                        </Badge>
                        {isActive && <span className="ml-1 text-xs text-primary">← Bạn</span>}
                      </td>
                      <td className="py-2 px-3">{b.discount}</td>
                      <td className="py-2 px-3">{b.freeShip}</td>
                      <td className="py-2 px-3">{b.priorityCS}</td>
                      <td className="py-2 px-3">{b.gift}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Biểu đồ tích/tiêu 6 tháng */}
      {stats && stats.monthlyEarned.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Điểm tích / tiêu 6 tháng gần nhất</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyEarned}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="earned" name="Tích điểm" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Tiêu điểm" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== Tab: Lịch sử điểm =====
function HistoryTab({ buyerId }: { buyerId: string }) {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [filterType, setFilterType] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loyaltyApi.getTransactions(
        buyerId, pagination,
        filterType ? filterType as LoyaltyTxnType : undefined,
      );
      setTransactions(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [buyerId, pagination, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filterType} onValueChange={v => { setFilterType(v === '__all__' ? '' : v); setPagination(p => ({ ...p, page: 1 })); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tất cả loại" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả loại</SelectItem>
            <SelectItem value="Tích">Tích điểm</SelectItem>
            <SelectItem value="Tiêu">Tiêu điểm</SelectItem>
            <SelectItem value="Hết hạn">Hết hạn</SelectItem>
            <SelectItem value="Thưởng">Thưởng</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable<LoyaltyTransaction>
        data={transactions}
        columns={txnColumns}
        totalItems={total}
        pagination={pagination}
        sort={{ field: 'createdAt', direction: 'desc' }}
        onPaginationChange={setPagination}
        onSortChange={() => {}}
        getId={t => t.id}
        loading={loading}
      />
    </div>
  );
}

// ===== Tab: Đổi thưởng =====
function RewardsTab({ program, onRedeemed }: { program: LoyaltyProgram; onRedeemed: () => void }) {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmReward, setConfirmReward] = useState<LoyaltyReward | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loyaltyApi.getRewards({ page: 1, pageSize: 20 }).then(res => {
      setRewards(res.data);
      setLoading(false);
    });
  }, []);

  const handleRedeem = async () => {
    if (!confirmReward) return;
    setRedeeming(true);
    try {
      const result = await loyaltyApi.redeemReward(confirmReward.id, program.id);
      if (result.success) {
        toast.success(`Đổi thưởng thành công! Mã: ${result.code}`);
        setConfirmReward(null);
        onRedeemed();
        // Refresh rewards
        const res = await loyaltyApi.getRewards({ page: 1, pageSize: 20 });
        setRewards(res.data);
      } else {
        toast.error('Không đủ điểm hoặc phần thưởng đã hết');
      }
    } finally {
      setRedeeming(false);
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Voucher': <Gift className="h-8 w-8 text-green-500" />,
    'Giảm giá': <TrendingDown className="h-8 w-8 text-blue-500" />,
    'Ưu đãi giao hàng': <ShoppingBag className="h-8 w-8 text-purple-500" />,
    'Quà tặng': <Award className="h-8 w-8 text-amber-500" />,
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Đang tải phần thưởng...</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map(r => {
          const canAfford = program.currentPoints >= r.pointsCost;
          return (
            <Card key={r.id} className={`transition-all ${canAfford ? 'hover:shadow-md' : 'opacity-70'}`}>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  {categoryIcons[r.category] || <Gift className="h-8 w-8 text-gray-400" />}
                  <Badge variant="secondary">{r.pointsCost.toLocaleString()} điểm</Badge>
                </div>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground">Còn {r.stock}</span>
                  <Button
                    size="sm"
                    disabled={!canAfford || r.stock <= 0}
                    onClick={() => setConfirmReward(r)}
                  >
                    Đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmReward} onOpenChange={() => setConfirmReward(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận đổi thưởng</DialogTitle>
            <DialogDescription>
              Bạn có chắc đổi <strong>{confirmReward?.name}</strong> với <strong>{confirmReward?.pointsCost.toLocaleString()} điểm</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Điểm hiện có: <span className="font-medium text-foreground">{program.currentPoints.toLocaleString()}</span>
            <br />
            Sau khi đổi: <span className="font-medium text-foreground">{((program.currentPoints - (confirmReward?.pointsCost ?? 0))).toLocaleString()}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReward(null)}>Huỷ</Button>
            <Button onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? 'Đang xử lý...' : 'Xác nhận đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== Main Page =====
export function BuyerLoyaltyPage() {
  const { user } = useAuth();
  const buyerId = user?.id || 'buyer-001';
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [stats, setStats] = useState<{ currentPoints: number; expiringPoints: number; expiryDate: string; monthlyEarned: { month: string; earned: number; spent: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        loyaltyApi.getProgram(buyerId),
        loyaltyApi.getStats(buyerId),
      ]);
      setProgram(p);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !program) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12 text-muted-foreground">Đang tải chương trình thân thiết...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Thân thiết' }]} />

      <div className="flex items-center gap-2">
        <Award className="h-6 w-6 text-primary" />
        <h1>Chương trình Khách hàng thân thiết</h1>
      </div>

      {/* Hero */}
      <TierHero program={program} />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Star className="h-4 w-4" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Lịch sử điểm
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1">
            <Gift className="h-4 w-4" /> Đổi thưởng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab program={program} stats={stats} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab buyerId={buyerId} />
        </TabsContent>
        <TabsContent value="rewards">
          <RewardsTab program={program} onRedeemed={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}