// ============================================================
// Tab Chuyển kho — dùng trong SellerWarehouse (Nhóm 38B)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft, Plus, Package, Truck, CheckCircle2, XCircle, Clock, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { StatusBadge } from '../shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { warehouseTransferApi } from '../../services/warehouseTransferApi';
import { warehouseApi } from '../../services/api';
import { toast } from 'sonner';
import type { WarehouseTransfer, Warehouse, TransferItem } from '../../types';

// --- Status timeline steps ---
const TIMELINE_STEPS: { status: string; icon: React.ReactNode; label: string }[] = [
  { status: 'Bản nháp', icon: <Clock className="h-4 w-4" />, label: 'Tạo' },
  { status: 'Chờ duyệt', icon: <Clock className="h-4 w-4" />, label: 'Duyệt' },
  { status: 'Đang chuyển', icon: <Truck className="h-4 w-4" />, label: 'Đang chuyển' },
  { status: 'Đã nhận', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Đã nhận' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'Bản nháp': return 0;
    case 'Chờ duyệt': return 1;
    case 'Đang chuyển': return 2;
    case 'Đã nhận': return 3;
    case 'Đã huỷ': return -1;
    default: return 0;
  }
}

// --- Transfer Detail Dialog ---
function TransferDetailDialog({ transfer, open, onOpenChange, onAction }: {
  transfer: WarehouseTransfer | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAction: (id: string, action: 'approve' | 'ship' | 'receive' | 'cancel') => void;
}) {
  if (!transfer) return null;
  const stepIdx = getStepIndex(transfer.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Chi tiết chuyển kho {transfer.transferNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Timeline */}
          {transfer.status !== 'Đã huỷ' && (
            <div className="flex items-center justify-between px-4">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step.status} className="flex flex-col items-center gap-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    i <= stepIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs ${i <= stepIdx ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`absolute h-0.5 w-12 ${i < stepIdx ? 'bg-primary' : 'bg-muted'}`} style={{ display: 'none' }} />
                  )}
                </div>
              ))}
            </div>
          )}
          {transfer.status === 'Đã huỷ' && (
            <Badge variant="destructive" className="mx-auto">Đã huỷ</Badge>
          )}

          <Separator />

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Kho nguồn:</span>{' '}
              <span>{transfer.fromWarehouseName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Kho đích:</span>{' '}
              <span>{transfer.toWarehouseName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Người yêu cầu:</span>{' '}
              <span>{transfer.requestedBy}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Người duyệt:</span>{' '}
              <span>{transfer.approvedBy || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ngày tạo:</span>{' '}
              <span>{new Date(transfer.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>{' '}
              <StatusBadge status={transfer.status} />
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sản phẩm chuyển:</p>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-2">Sản phẩm</th>
                    <th className="text-right p-2">SL chuyển</th>
                    <th className="text-right p-2">SL nhận</th>
                    <th className="text-left p-2">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{item.productName}</td>
                      <td className="text-right p-2">{item.quantity.toLocaleString()}</td>
                      <td className="text-right p-2">{item.actualReceived?.toLocaleString() ?? '—'}</td>
                      <td className="p-2 text-muted-foreground">{item.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transfer.note && (
            <div>
              <p className="text-sm text-muted-foreground">Ghi chú:</p>
              <p className="text-sm">{transfer.note}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          {transfer.status === 'Bản nháp' && (
            <Button onClick={() => { onAction(transfer.id, 'approve'); onOpenChange(false); }}>Gửi duyệt</Button>
          )}
          {transfer.status === 'Chờ duyệt' && (
            <Button onClick={() => { onAction(transfer.id, 'ship'); onOpenChange(false); }}>Duyệt & Chuyển</Button>
          )}
          {transfer.status === 'Đang chuyển' && (
            <Button onClick={() => { onAction(transfer.id, 'receive'); onOpenChange(false); }}>Xác nhận nhận</Button>
          )}
          {(transfer.status === 'Bản nháp' || transfer.status === 'Chờ duyệt') && (
            <Button variant="destructive" onClick={() => { onAction(transfer.id, 'cancel'); onOpenChange(false); }}>Huỷ</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Create Transfer Dialog ---
function CreateTransferDialog({ open, onOpenChange, warehouses, onCreated }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  warehouses: Warehouse[];
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [fromWh, setFromWh] = useState('');
  const [toWh, setToWh] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<{ productName: string; quantity: string }[]>([{ productName: '', quantity: '' }]);
  const [saving, setSaving] = useState(false);

  const addItem = () => setItems([...items, { productName: '', quantity: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    setItems(next);
  };

  const handleSubmit = async () => {
    if (!fromWh || !toWh || fromWh === toWh) {
      toast.error('Vui lòng chọn kho nguồn và kho đích khác nhau');
      return;
    }
    const validItems = items.filter(it => it.productName.trim() && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }
    setSaving(true);
    try {
      const fromW = warehouses.find(w => w.id === fromWh);
      const toW = warehouses.find(w => w.id === toWh);
      const transferItems: TransferItem[] = validItems.map(it => ({
        productId: `p-${Date.now()}`,
        productName: it.productName,
        quantity: Number(it.quantity),
      }));
      await warehouseTransferApi.create({
        fromWarehouseId: fromWh,
        fromWarehouseName: fromW?.name || '',
        toWarehouseId: toWh,
        toWarehouseName: toW?.name || '',
        items: transferItems,
        requestedBy: user?.fullName || 'NV',
        note,
      });
      toast.success('Đã tạo lệnh chuyển kho');
      setFromWh(''); setToWh(''); setNote('');
      setItems([{ productName: '', quantity: '' }]);
      onOpenChange(false);
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Tạo lệnh chuyển kho
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kho nguồn *</Label>
              <Select value={fromWh} onValueChange={setFromWh}>
                <SelectTrigger><SelectValue placeholder="Chọn kho" /></SelectTrigger>
                <SelectContent>
                  {warehouses.filter(w => w.isActive).map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kho đích *</Label>
              <Select value={toWh} onValueChange={setToWh}>
                <SelectTrigger><SelectValue placeholder="Chọn kho" /></SelectTrigger>
                <SelectContent>
                  {warehouses.filter(w => w.isActive && w.id !== fromWh).map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Sản phẩm chuyển</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Thêm dòng
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Tên sản phẩm"
                    className="flex-1"
                    value={it.productName}
                    onChange={e => updateItem(i, 'productName', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="SL"
                    className="w-24"
                    value={it.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    min={1}
                  />
                  {items.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Ghi chú</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Lý do chuyển kho..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang tạo...' : 'Tạo lệnh'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Tab Component ---
export function SellerWarehouseTransferTab() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stats, setStats] = useState<{ total: number; draft: number; pending: number; shipping: number; received: number; cancelled: number; totalItems: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<WarehouseTransfer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [trs, st, whs] = await Promise.all([
        warehouseTransferApi.getAll(),
        warehouseTransferApi.getStats(),
        user?.supplierId ? warehouseApi.getBySeller(user.supplierId) : Promise.resolve([]),
      ]);
      setTransfers(trs);
      setStats(st);
      setWarehouses(whs);
    } finally {
      setLoading(false);
    }
  }, [user?.supplierId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id: string, action: 'approve' | 'ship' | 'receive' | 'cancel') => {
    switch (action) {
      case 'approve':
        await warehouseTransferApi.approve(id, user?.fullName || 'NV');
        toast.success('Đã gửi duyệt');
        break;
      case 'ship':
        await warehouseTransferApi.ship(id);
        toast.success('Đã duyệt & bắt đầu chuyển');
        break;
      case 'receive':
        await warehouseTransferApi.receive(id);
        toast.success('Đã xác nhận nhận hàng');
        break;
      case 'cancel':
        await warehouseTransferApi.cancel(id);
        toast.success('Đã huỷ lệnh chuyển kho');
        break;
    }
    fetchData();
  };

  const filtered = filterStatus === 'all' ? transfers : transfers.filter(t => t.status === filterStatus);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Tổng lệnh', value: stats.total, icon: <ArrowRightLeft className="h-5 w-5 text-blue-500" />, color: 'bg-blue-50' },
            { label: 'Chờ duyệt', value: stats.pending, icon: <Clock className="h-5 w-5 text-amber-500" />, color: 'bg-amber-50' },
            { label: 'Đang chuyển', value: stats.shipping, icon: <Truck className="h-5 w-5 text-indigo-500" />, color: 'bg-indigo-50' },
            { label: 'Đã nhận', value: stats.received, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, color: 'bg-green-50' },
            { label: 'Tổng SP', value: stats.totalItems.toLocaleString(), icon: <Package className="h-5 w-5 text-purple-500" />, color: 'bg-purple-50' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-xl">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Tạo lệnh chuyển kho
        </Button>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Bản nháp">Bản nháp</SelectItem>
            <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
            <SelectItem value="Đang chuyển">Đang chuyển</SelectItem>
            <SelectItem value="Đã nhận">Đã nhận</SelectItem>
            <SelectItem value="Đã huỷ">Đã huỷ</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} lệnh
        </span>
      </div>

      {/* Transfer list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có lệnh chuyển kho nào</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(t => {
            const totalQty = t.items.reduce((s, it) => s + it.quantity, 0);
            return (
              <Card
                key={t.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setSelectedTransfer(t); setShowDetail(true); }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{t.transferNumber}</Badge>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{t.fromWarehouseName}</span>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{t.toWarehouseName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.items.length} SP · {totalQty.toLocaleString()} đơn vị · {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.status === 'Bản nháp' && (
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleAction(t.id, 'approve'); }}>
                          Gửi duyệt
                        </Button>
                      )}
                      {t.status === 'Chờ duyệt' && (
                        <Button size="sm" onClick={e => { e.stopPropagation(); handleAction(t.id, 'ship'); }}>
                          Duyệt
                        </Button>
                      )}
                      {t.status === 'Đang chuyển' && (
                        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); handleAction(t.id, 'receive'); }}>
                          Nhận hàng
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <CreateTransferDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        warehouses={warehouses}
        onCreated={fetchData}
      />
      <TransferDetailDialog
        transfer={selectedTransfer}
        open={showDetail}
        onOpenChange={setShowDetail}
        onAction={handleAction}
      />
    </div>
  );
}
