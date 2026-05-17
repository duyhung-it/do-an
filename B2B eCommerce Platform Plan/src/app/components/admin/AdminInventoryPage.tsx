import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Edit, History, Package, RefreshCw, Search, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { adminInventoryApi } from '../../services/adminBackendApi';

type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

type InventoryItem = {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  brand: string;
  categoryName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  sellingPrice: number;
  totalValue: number;
  status: InventoryStatus;
  lowStock: boolean;
  imeiSerials: string[];
  updatedAt: string;
};

type StockMovement = {
  id: string;
  type: string;
  quantityBefore: number;
  quantityAfter: number;
  delta: number;
  reason?: string;
  createdByName?: string;
  createdAt: string;
};

type StockForm = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  stock: string;
  minStock: string;
  reason: string;
};

const statusLabels: Record<InventoryStatus, string> = {
  IN_STOCK: 'Du hang',
  LOW_STOCK: 'Sap het',
  OUT_OF_STOCK: 'Het hang',
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

function StockBadge({ status }: { status: InventoryStatus }) {
  const color = {
    IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200',
    OUT_OF_STOCK: 'bg-red-50 text-red-700 border-red-200',
  }[status];

  return <Badge variant="outline" className={color}>{statusLabels[status] ?? status}</Badge>;
}

export function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [stockForm, setStockForm] = useState<StockForm | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryApi.getPaginated(
        { page: 1, pageSize: 200 },
        undefined,
        [
          ...(statusFilter === 'all' ? [] : [{ key: 'status', label: 'Trang thai', value: statusFilter }]),
          ...(brandFilter === 'all' ? [] : [{ key: 'brand', label: 'Hang', value: brandFilter }]),
        ],
        search,
      );
      const rows = res.data as InventoryItem[];
      setInventory(rows);
      if (statusFilter === 'all' && brandFilter === 'all' && !search.trim()) {
        setBrands([...new Set(rows.map(item => item.brand).filter(Boolean))].sort());
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc ton kho');
    } finally {
      setLoading(false);
    }
  }, [brandFilter, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    totalSku: inventory.length,
    available: inventory.filter(item => item.status === 'IN_STOCK').length,
    low: inventory.filter(item => item.status === 'LOW_STOCK').length,
    out: inventory.filter(item => item.status === 'OUT_OF_STOCK').length,
    totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
  }), [inventory]);

  const openAdjustStock = (item: InventoryItem) => {
    setStockForm({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      stock: String(item.currentStock),
      minStock: String(item.minStock),
      reason: '',
    });
    setStockDialogOpen(true);
  };

  const openMovements = async (item: InventoryItem) => {
    setMovementItem(item);
    setMovementDialogOpen(true);
    setLoadingMovements(true);
    try {
      const res = await adminInventoryApi.movements(item.productId, { page: 1, pageSize: 20 });
      setMovements(res.data as StockMovement[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc lich su ton kho');
      setMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  };

  const saveStock = async () => {
    if (!stockForm) return;
    const nextStock = Number(stockForm.stock);
    const nextMinStock = Number(stockForm.minStock);
    if (!Number.isFinite(nextStock) || nextStock < 0 || !Number.isInteger(nextStock)) {
      toast.error('Ton kho phai la so nguyen >= 0');
      return;
    }
    if (!Number.isFinite(nextMinStock) || nextMinStock < 0 || !Number.isInteger(nextMinStock)) {
      toast.error('Muc canh bao phai la so nguyen >= 0');
      return;
    }

    setSaving(true);
    try {
      await adminInventoryApi.adjust(stockForm.id, {
        stock: nextStock,
        minStock: nextMinStock,
        reason: stockForm.reason.trim() || 'Dieu chinh tu admin FE',
      });
      toast.success('Da cap nhat ton kho');
      setStockDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cap nhat ton kho that bai');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Quan tri', href: '/admin' }, { label: 'Kho hang' }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1>Kho hang</h1>
          <p className="text-muted-foreground">Theo doi ton kho, nguong canh bao, IMEI va lich su dieu chinh tu BE admin inventory.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Lam moi
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><Package className="h-5 w-5 text-blue-600" /><div><p className="text-muted-foreground">Tong SKU</p><p className="text-xl font-semibold">{stats.totalSku}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-600" /><div><p className="text-muted-foreground">Du hang</p><p className="text-xl font-semibold">{stats.available}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-amber-600" /><div><p className="text-muted-foreground">Sap het</p><p className="text-xl font-semibold">{stats.low}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="h-5 w-5 text-red-600" /><div><p className="text-muted-foreground">Het hang</p><p className="text-xl font-semibold">{stats.out}</p></div></CardContent></Card>
        <Card className="col-span-2 lg:col-span-1"><CardContent className="p-4"><p className="text-muted-foreground">Gia tri ton</p><p className="text-lg font-semibold">{formatPrice(stats.totalValue)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Tim san pham, bien the, SKU..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca trang thai</SelectItem>
              <SelectItem value="IN_STOCK">Du hang</SelectItem>
              <SelectItem value="LOW_STOCK">Sap het</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Het hang</SelectItem>
            </SelectContent>
          </Select>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-full lg:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tat ca hang</SelectItem>
              {brands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b py-3">
          <CardTitle className="text-sm">{inventory.length} SKU</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : inventory.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Khong co du lieu ton kho phu hop</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">San pham</th>
                  <th className="px-4 py-3 text-left font-medium">SKU / IMEI</th>
                  <th className="px-4 py-3 text-left font-medium">Hang</th>
                  <th className="px-4 py-3 text-left font-medium">Danh muc</th>
                  <th className="px-4 py-3 text-right font-medium">Ton</th>
                  <th className="px-4 py-3 text-right font-medium">Canh bao</th>
                  <th className="px-4 py-3 text-right font-medium">Gia tri</th>
                  <th className="px-4 py-3 text-center font-medium">Trang thai</th>
                  <th className="px-4 py-3 text-center font-medium">Thao tac</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 min-w-[240px]">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-muted-foreground">{item.variantName}</p>
                      <p className="text-xs text-muted-foreground">Cap nhat {formatDateTime(item.updatedAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5">{item.sku}</code>
                      <p className="mt-1 text-xs text-muted-foreground">{item.imeiSerials.length} IMEI/serial</p>
                    </td>
                    <td className="px-4 py-3">{item.brand}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{item.categoryName}</Badge></td>
                    <td className="px-4 py-3 text-right font-semibold">{item.currentStock}</td>
                    <td className="px-4 py-3 text-right">{item.minStock}</td>
                    <td className="px-4 py-3 text-right">
                      <p>{formatPrice(item.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.sellingPrice)}</p>
                    </td>
                    <td className="px-4 py-3 text-center"><StockBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openAdjustStock(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openMovements(item)}>
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dieu chinh ton kho</DialogTitle>
          </DialogHeader>
          {stockForm && (
            <div className="grid gap-4">
              <div>
                <p className="font-medium">{stockForm.productName}</p>
                <p className="text-muted-foreground">{stockForm.variantName} - {stockForm.sku}</p>
              </div>
              <div className="grid gap-2">
                <Label>Ton kho moi</Label>
                <Input
                  type="number"
                  min={0}
                  value={stockForm.stock}
                  onChange={event => setStockForm(prev => prev ? { ...prev, stock: event.target.value } : prev)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Muc canh bao</Label>
                <Input
                  type="number"
                  min={0}
                  value={stockForm.minStock}
                  onChange={event => setStockForm(prev => prev ? { ...prev, minStock: event.target.value } : prev)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Ly do dieu chinh</Label>
                <Textarea
                  rows={3}
                  value={stockForm.reason}
                  onChange={event => setStockForm(prev => prev ? { ...prev, reason: event.target.value } : prev)}
                  placeholder="Vi du: Kiem kho cuoi ngay"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogOpen(false)}>Huy</Button>
            <Button onClick={saveStock} disabled={saving}>{saving ? 'Dang luu...' : 'Luu ton kho'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lich su dieu chinh</DialogTitle>
          </DialogHeader>
          {movementItem && (
            <div className="text-sm">
              <p className="font-medium">{movementItem.productName}</p>
              <p className="text-muted-foreground">{movementItem.variantName} - {movementItem.sku}</p>
            </div>
          )}
          {loadingMovements ? (
            <div className="p-8 flex justify-center"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Chua co lich su dieu chinh</div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Thoi gian</th>
                    <th className="px-3 py-2 text-left font-medium">Loai</th>
                    <th className="px-3 py-2 text-right font-medium">Truoc</th>
                    <th className="px-3 py-2 text-right font-medium">Sau</th>
                    <th className="px-3 py-2 text-right font-medium">Lech</th>
                    <th className="px-3 py-2 text-left font-medium">Ly do</th>
                    <th className="px-3 py-2 text-left font-medium">Nguoi tao</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {movements.map(item => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{formatDateTime(item.createdAt)}</td>
                      <td className="px-3 py-2">{item.type}</td>
                      <td className="px-3 py-2 text-right">{item.quantityBefore}</td>
                      <td className="px-3 py-2 text-right">{item.quantityAfter}</td>
                      <td className="px-3 py-2 text-right font-medium">{item.delta > 0 ? `+${item.delta}` : item.delta}</td>
                      <td className="px-3 py-2">{item.reason || '-'}</td>
                      <td className="px-3 py-2">{item.createdByName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementDialogOpen(false)}>Dong</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
