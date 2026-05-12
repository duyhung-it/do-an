// ============================================================
// AdminWarehousePage — Tổng quan kho hàng (D14)
// Stats, DataTable kho, Map giả lập, PieChart phân bổ, Chi tiết
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Warehouse, Package, RefreshCw, Eye, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

interface WarehouseData {
  id: string;
  branchName: string;
  name: string;
  type: string;
  city: string;
  address: string;
  capacity: number;
  currentUsage: number;
  totalValue: number;
  transfers: number;
  status: string;
}

const mockWarehouses: WarehouseData[] = [
  { id: 'WH-01', branchName: 'CN HCM Quận 7', name: 'Kho HCM Chính', type: 'Kho chính', city: 'TP. HCM', address: '123 Nguyễn Văn Linh, Q.7', capacity: 10000, currentUsage: 8200, totalValue: 15200000000, transfers: 24, status: 'Hoạt động' },
  { id: 'WH-02', branchName: 'CN Hà Nội Cầu Giấy', name: 'Kho Hà Nội', type: 'Kho vùng', city: 'Hà Nội', address: '45 Xuân Thủy, Cầu Giấy', capacity: 5000, currentUsage: 4100, totalValue: 8400000000, transfers: 12, status: 'Hoạt động' },
  { id: 'WH-03', branchName: 'CN Đà Nẵng', name: 'Kho Đà Nẵng', type: 'Kho vùng', city: 'Đà Nẵng', address: '88 Nguyễn Văn Linh, Hải Châu', capacity: 3000, currentUsage: 1800, totalValue: 3200000000, transfers: 8, status: 'Hoạt động' },
  { id: 'WH-04', branchName: 'CN Hải Phòng', name: 'Kho Hải Phòng', type: 'Kho phụ', city: 'Hải Phòng', address: '27 Đinh Tiên Hoàng, Hồng Bàng', capacity: 4000, currentUsage: 3600, totalValue: 5800000000, transfers: 15, status: 'Hoạt động' },
  { id: 'WH-05', branchName: 'CN Cần Thơ', name: 'Kho Cần Thơ', type: 'Kho phụ', city: 'Cần Thơ', address: '12 Nguyễn Trãi, Ninh Kiều', capacity: 2000, currentUsage: 300, totalValue: 480000000, transfers: 3, status: 'Ít hoạt động' },
  { id: 'WH-06', branchName: 'CN HCM Bình Thạnh', name: 'Kho HCM Phụ', type: 'Kho phụ', city: 'TP. HCM', address: '55 Xô Viết Nghệ Tĩnh, Bình Thạnh', capacity: 1500, currentUsage: 1420, totalValue: 2100000000, transfers: 18, status: 'Sắp đầy' },
];

const cityDist = [
  { name: 'TP. HCM', value: 2 },
  { name: 'Hà Nội', value: 1 },
  { name: 'Đà Nẵng', value: 1 },
  { name: 'Hải Phòng', value: 1 },
  { name: 'Cần Thơ', value: 1 },
];

const typeDist = [
  { name: 'Kho chính', value: 1 },
  { name: 'Kho vùng', value: 2 },
  { name: 'Kho phụ', value: 3 },
];

const cityOptions = ['Tất cả', 'TP. HCM', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
const typeOptions = ['Tất cả', 'Kho chính', 'Kho vùng', 'Kho phụ'];

export function AdminWarehousePage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<WarehouseData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setWarehouses(mockWarehouses);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = warehouses.filter(w => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.branchName.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'Tất cả' || w.city === cityFilter;
    const matchType = typeFilter === 'Tất cả' || w.type === typeFilter;
    return matchSearch && matchCity && matchType;
  });

  const stats = {
    total: warehouses.length,
    totalValue: warehouses.reduce((s, w) => s + w.totalValue, 0),
    totalCapacity: warehouses.reduce((s, w) => s + w.capacity, 0),
    totalUsage: warehouses.reduce((s, w) => s + w.currentUsage, 0),
    totalTransfers: warehouses.reduce((s, w) => s + w.transfers, 0),
  };

  const overallUsagePct = Math.round(stats.totalUsage / stats.totalCapacity * 100);

  const columns = [
    { key: 'branchName', label: 'Chi nhánh', render: (item: WarehouseData) => <span className="font-medium text-sm">{item.branchName}</span> },
    {
      key: 'name', label: 'Kho hàng',
      render: (item: WarehouseData) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{item.address}</p>
        </div>
      ),
    },
    {
      key: 'type', label: 'Loại',
      render: (item: WarehouseData) => <Badge variant="outline">{item.type}</Badge>,
    },
    { key: 'city', label: 'Thành phố', render: (item: WarehouseData) => <span className="text-sm">{item.city}</span> },
    {
      key: 'currentUsage', label: 'Sử dụng',
      render: (item: WarehouseData) => {
        const pct = Math.round(item.currentUsage / item.capacity * 100);
        return (
          <div className="w-28">
            <div className="flex justify-between text-xs mb-1">
              <span>{item.currentUsage.toLocaleString()}</span>
              <span className={pct > 90 ? 'text-red-500 font-bold' : ''}>{pct}%</span>
            </div>
            <Progress value={pct} className={`h-1.5 ${pct > 90 ? '[&>div]:bg-red-500' : pct > 70 ? '[&>div]:bg-yellow-500' : ''}`} />
          </div>
        );
      },
    },
    {
      key: 'totalValue', label: 'Giá trị tồn',
      render: (item: WarehouseData) => <span className="text-primary font-medium">{formatCurrency(item.totalValue)}</span>,
    },
    {
      key: 'status', label: 'Trạng thái',
      render: (item: WarehouseData) => (
        <Badge variant={item.status === 'Hoạt động' ? 'default' : item.status === 'Sắp đầy' ? 'destructive' : 'outline'}>{item.status}</Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: WarehouseData) => (
        <Button size="sm" variant="ghost" onClick={() => setSelected(item)}><Eye className="h-4 w-4" /></Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Kho hàng' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Warehouse className="h-6 w-6 text-primary" /> Tổng quan kho hàng</h1>
          <p className="text-muted-foreground">Quản lý và giám sát kho hàng của tất cả chi nhánh</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Làm mới</Button>
      </div>

      {/* Cảnh báo kho sắp đầy */}
      {warehouses.filter(w => w.status === 'Sắp đầy').length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>{warehouses.filter(w => w.status === 'Sắp đầy').length} kho đang sắp đầy (&gt;90% công suất)</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatsCard title="Tổng số kho" value={stats.total} icon={Warehouse} />
        <StatsCard title="Giá trị tổng" value={stats.totalValue} format={formatCurrency} icon={Package} variant="success" />
        <StatsCard title="Sử dụng chung" value={overallUsagePct} format={(n) => `${n}%`} icon={TrendingUp} variant="info" />
        <StatsCard title="Số chi nhánh" value={new Set(warehouses.map(w => w.branchName)).size} icon={Package} variant="purple" />
        <StatsCard title="Lệnh chuyển kho" value={stats.totalTransfers} icon={Package} variant="warning" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Phân bổ theo thành phố</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cityDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`}>
                    {cityDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Phân bổ theo loại kho</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, value }) => `${name} (${value})`}>
                    {typeDist.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map giả lập */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Phân bổ kho theo vùng</CardTitle></CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-blue-50 to-green-50 rounded-xl h-48 overflow-hidden border">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Bản đồ kho hàng (Tích hợp Google Maps API)</p>
            </div>
            {[
              { city: 'Hà Nội', top: '15%', left: '52%', count: 1 },
              { city: 'Hải Phòng', top: '18%', left: '58%', count: 1 },
              { city: 'Đà Nẵng', top: '45%', left: '55%', count: 1 },
              { city: 'TP. HCM', top: '72%', left: '48%', count: 2 },
              { city: 'Cần Thơ', top: '80%', left: '43%', count: 1 },
            ].map(m => (
              <div key={m.city} className="absolute flex flex-col items-center" style={{ top: m.top, left: m.left }}>
                <div className="bg-primary text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  {m.count}
                </div>
                <span className="text-xs bg-white px-1 rounded shadow-sm mt-0.5 whitespace-nowrap">{m.city}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter + Table */}
      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm tên kho, chi nhánh..."
        filters={[
          { key: 'city', label: 'Thành phố', value: cityFilter, onChange: setCityFilter, options: cityOptions },
          { key: 'type', label: 'Loại kho', value: typeFilter, onChange: setTypeFilter, options: typeOptions },
        ]}
      />
      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Không tìm thấy kho nào" pagination getId={item => item.id} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5" /> {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Chi nhánh:</span> <strong>{selected.branchName}</strong></div>
                <div><span className="text-muted-foreground">Loại kho:</span> <Badge variant="outline">{selected.type}</Badge></div>
                <div className="col-span-2"><span className="text-muted-foreground">Địa chỉ:</span> {selected.address}, {selected.city}</div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Sức chứa đã dùng:</span>
                  <span className="font-bold">{selected.currentUsage.toLocaleString()} / {selected.capacity.toLocaleString()} đơn vị</span>
                </div>
                <Progress value={Math.round(selected.currentUsage / selected.capacity * 100)} className="h-3" />
                <p className="text-xs text-right mt-1 text-muted-foreground">{Math.round(selected.currentUsage / selected.capacity * 100)}% sức chứa</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Giá trị tồn kho:</span> <strong className="text-primary">{formatCurrency(selected.totalValue)}</strong></div>
                <div><span className="text-muted-foreground">Lệnh chuyển kho:</span> <strong>{selected.transfers} lệnh</strong></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
