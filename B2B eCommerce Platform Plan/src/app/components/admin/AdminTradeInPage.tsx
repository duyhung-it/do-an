// ============================================================
// AdminTradeInPage — Quản lý Thu cũ đổi mới
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw, Search, CheckCircle, XCircle, Clock,
  DollarSign, RefreshCw, Eye, ChevronDown,
  Package, TrendingUp, Users, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { tradeInApi } from '../../services/api';
import type { TradeInRequest } from '../../types';
import { toast } from 'sonner';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUS_COLORS: Record<string, string> = {
  'Chờ định giá': 'bg-amber-100 text-amber-700',
  'Đã định giá': 'bg-blue-100 text-blue-700',
  'Chấp nhận': 'bg-green-100 text-green-700',
  'Từ chối': 'bg-red-100 text-red-700',
  'Đã hoàn thành': 'bg-gray-100 text-gray-700',
};

export function AdminTradeInPage() {
  const [requests, setRequests] = useState<TradeInRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<TradeInRequest | null>(null);
  const [finalValue, setFinalValue] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tradeInApi.getPaginated({ page: 1, pageSize: 100 });
      setRequests(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.customerName.toLowerCase().includes(search.toLowerCase()) || r.model.toLowerCase().includes(search.toLowerCase()) || r.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Chờ định giá').length,
    accepted: requests.filter(r => r.status === 'Chấp nhận' || r.status === 'Đã hoàn thành').length,
    totalValue: requests.filter(r => r.finalValue).reduce((sum, r) => sum + (r.finalValue || 0), 0),
  };

  const handleUpdateStatus = async (id: string, status: TradeInRequest['status'], value?: number) => {
    setProcessing(true);
    try {
      await tradeInApi.updateStatus(id, status, value);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, finalValue: value ?? r.finalValue } : r));
      setSelected(null);
      toast.success(`Đã cập nhật trạng thái: ${status}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Thu cũ đổi mới' }]} />

      <div className="flex items-center justify-between mb-6 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Yêu cầu Thu cũ đổi mới</h1>
          <p className="text-muted-foreground mt-0.5">Quản lý, định giá và xử lý yêu cầu thu máy cũ</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng yêu cầu', value: stats.total, icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Chờ định giá', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Đã chấp nhận', value: stats.accepted, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Tổng giá trị thu', value: formatPrice(stats.totalValue), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b py-3 px-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10 h-9" placeholder="Tìm khách hàng, model..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <div className="divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse flex gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Không có yêu cầu nào</p>
                </div>
              ) : (
                filtered.map(req => (
                  <div
                    key={req.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === req.id ? 'bg-blue-50' : ''}`}
                    onClick={() => { setSelected(req); setFinalValue(String(req.estimatedValue)); }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                          <RotateCcw className="h-5 w-5 text-[#e31837]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{req.brand} {req.model}</p>
                          <p className="text-xs text-muted-foreground">{req.storage} • {req.condition}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{req.customerName} • {req.customerPhone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`border-0 text-[10px] ${STATUS_COLORS[req.status]}`}>
                          {req.status}
                        </Badge>
                        <p className="text-xs font-semibold text-[#e31837] mt-1">{formatPrice(req.estimatedValue)}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <Card className="border-0 shadow-sm sticky top-20">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">Chi tiết yêu cầu</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  {[
                    { label: 'Khách hàng', value: selected.customerName },
                    { label: 'Điện thoại', value: selected.customerPhone },
                    { label: 'Thương hiệu', value: selected.brand },
                    { label: 'Model', value: selected.model },
                    { label: 'Dung lượng', value: selected.storage },
                    { label: 'Tình trạng', value: selected.condition },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-1.5 border-b border-dashed border-gray-100 last:border-0 text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 border-b border-dashed border-gray-100 text-sm">
                    <span className="text-muted-foreground">Giá ước tính</span>
                    <span className="font-bold text-[#e31837]">{formatPrice(selected.estimatedValue)}</span>
                  </div>
                  {selected.finalValue && (
                    <div className="flex justify-between py-1.5 text-sm">
                      <span className="text-muted-foreground">Giá cuối</span>
                      <span className="font-bold text-green-600">{formatPrice(selected.finalValue)}</span>
                    </div>
                  )}
                </div>

                {selected.note && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Ghi chú:</p>
                    <p className="text-sm">{selected.note}</p>
                  </div>
                )}

                {selected.status === 'Chờ định giá' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">Giá định giá cuối cùng (VNĐ)</label>
                      <Input
                        type="number"
                        value={finalValue}
                        onChange={e => setFinalValue(e.target.value)}
                        placeholder="Nhập giá định giá..."
                        className="font-mono"
                      />
                      {finalValue && <p className="text-xs text-[#e31837] mt-1">{formatPrice(Number(finalValue))}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={processing}
                        onClick={() => handleUpdateStatus(selected.id, 'Chấp nhận', Number(finalValue))}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        disabled={processing}
                        onClick={() => handleUpdateStatus(selected.id, 'Từ chối')}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Từ chối
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={processing || !finalValue}
                      onClick={() => handleUpdateStatus(selected.id, 'Đã định giá', Number(finalValue))}
                    >
                      Lưu định giá (chưa xác nhận)
                    </Button>
                  </div>
                )}

                {selected.status === 'Đã định giá' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={processing}
                      onClick={() => handleUpdateStatus(selected.id, 'Chấp nhận', selected.finalValue)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Xác nhận
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gray-700 hover:bg-gray-800"
                      disabled={processing}
                      onClick={() => handleUpdateStatus(selected.id, 'Đã hoàn thành', selected.finalValue)}
                    >
                      Hoàn thành
                    </Button>
                  </div>
                )}

                {selected.status === 'Chấp nhận' && (
                  <Button
                    size="sm"
                    className="w-full bg-gray-700 hover:bg-gray-800"
                    disabled={processing}
                    onClick={() => handleUpdateStatus(selected.id, 'Đã hoàn thành', selected.finalValue)}
                  >
                    Đánh dấu hoàn thành
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm sticky top-20">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chọn một yêu cầu để xem chi tiết và xử lý</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
