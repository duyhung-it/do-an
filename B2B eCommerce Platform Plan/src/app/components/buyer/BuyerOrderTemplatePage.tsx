// ============================================================
// Template đơn hàng — Buyer (P3 Đợt 7: P3.17–P3.18, P3.19)
// Template cards, Create from order flow
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Plus, Trash2, ShoppingCart, RotateCcw, Edit2, Save, X, Package,
  Copy, Clock, TrendingUp, ChevronRight, Layers, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { templateApi, orderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { OrderTemplate, ColumnConfig, OrderTemplateItem, Order } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

const columns: ColumnConfig[] = [
  { key: 'name', label: 'Tên template', visible: true, sortable: true },
  { key: 'supplierName', label: 'Nhà cung cấp', visible: true, sortable: true },
  { key: 'itemCount', label: 'Số SP', visible: true, sortable: true },
  { key: 'lastUsed', label: 'Lần dùng cuối', visible: true, sortable: true },
  { key: 'usageCount', label: 'Số lần dùng', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

export function BuyerOrderTemplatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [showDetail, setShowDetail] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  // P3.18: Create from order
  const [showFromOrder, setShowFromOrder] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState<OrderTemplate | null>(null);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [reorderItems, setReorderItems] = useState<OrderTemplateItem[]>([]);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { const data = await templateApi.getByUser(user.id); setTemplates(data); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // P3.18: Fetch recent orders for "Create from order"
  const openFromOrder = async () => {
    setShowFromOrder(true);
    if (recentOrders.length === 0) {
      const res = await orderApi.getPaginated({ page: 1, pageSize: 10 });
      setRecentOrders(res.data);
    }
  };

  const handleOpenDetail = (tpl: OrderTemplate) => { setSelectedTemplate(tpl); setShowDetail(true); };
  const handleOpenReorder = (tpl: OrderTemplate) => {
    setSelectedTemplate(tpl);
    setReorderItems(tpl.items.map(i => ({ ...i })));
    setShowReorder(true);
  };

  const handleConfirmReorder = async () => {
    if (!selectedTemplate) return;
    try {
      const order = await templateApi.createOrderFromTemplate(selectedTemplate.id);
      toast.success(`Đã tạo đơn hàng ${order.orderNumber} từ template "${selectedTemplate.name}"`);
      setShowReorder(false); fetchTemplates();
      navigate(`/orders/${order.id}`);
    } catch { toast.error('Không thể tạo đơn hàng'); }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    await templateApi.delete(selectedTemplate.id);
    toast.success(`Đã xoá template "${selectedTemplate.name}"`);
    setShowDelete(false); setSelectedTemplate(null); fetchTemplates();
  };

  const handleCreate = async () => {
    if (!createName.trim()) { toast.error('Vui lòng nhập tên template'); return; }
    if (!user) return;
    await templateApi.create({
      userId: user.id, name: createName.trim(), description: createDescription.trim(),
      items: [], supplierId: '', supplierName: '',
    });
    toast.success('Đã tạo template mới');
    setShowCreate(false); setCreateName(''); setCreateDescription(''); fetchTemplates();
  };

  // P3.18: Create template from selected order
  const handleCreateFromOrder = async () => {
    if (!selectedOrderId || !user) return;
    const order = recentOrders.find(o => o.id === selectedOrderId);
    if (!order) return;
    await templateApi.create({
      userId: user.id,
      name: `Template từ ${order.orderNumber}`,
      description: `Tạo tự động từ đơn hàng ${order.orderNumber}`,
      items: order.items.map(item => ({
        productId: item.productId, productName: item.productName,
        productImage: item.productImage ?? '', quantity: item.quantity,
        unitPrice: item.unitPrice, unit: item.unit,
      })),
      supplierId: order.supplierId, supplierName: order.supplierName,
    });
    toast.success(`Đã tạo template từ đơn ${order.orderNumber}`);
    setShowFromOrder(false); setSelectedOrderId(''); fetchTemplates();
  };

  const handleAddAllToCart = async (tpl: OrderTemplate) => {
    for (const item of tpl.items) {
      await addItem({
        productId: item.productId, productName: item.productName,
        productImage: item.productImage, supplierId: tpl.supplierId,
        supplierName: tpl.supplierName, quantity: item.quantity, unitPrice: item.unitPrice,
      });
    }
    toast.success(`Đã thêm ${tpl.items.length} SP từ "${tpl.name}" vào giỏ hàng`);
  };

  const tableData = templates.map(t => ({
    ...t, itemCount: t.items.length, lastUsed: t.lastUsed ?? 'Chưa sử dụng',
  }));

  // Empty state
  if (!loading && templates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <AppBreadcrumb items={[{ label: 'Đơn hàng mẫu' }]} />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Layers className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Bạn chưa có template nào</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Tạo template từ đơn hàng đã đặt để đặt hàng nhanh hơn!</p>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreate(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Tạo template mới
            </Button>
            <Button variant="outline" onClick={openFromOrder} className="gap-1.5">
              <Copy className="h-4 w-4" /> Tạo từ đơn hàng
            </Button>
          </div>
        </div>
        <CreateTemplateDialog open={showCreate} onClose={() => setShowCreate(false)} name={createName} description={createDescription}
          onNameChange={setCreateName} onDescriptionChange={setCreateDescription} onSubmit={handleCreate} />
        <FromOrderDialog open={showFromOrder} onClose={() => setShowFromOrder(false)} orders={recentOrders}
          selectedId={selectedOrderId} onSelectId={setSelectedOrderId} onSubmit={handleCreateFromOrder} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Đơn hàng mẫu' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Layers className="h-6 w-6 text-primary" /> Đơn hàng mẫu
          </h1>
          <p className="text-muted-foreground mt-1">{templates.length} template</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Tạo mới
          </Button>
          <Button variant="outline" onClick={openFromOrder} className="gap-1.5">
            <Copy className="h-4 w-4" /> Tạo từ đơn hàng
          </Button>
        </div>
      </div>

      {/* P3.17: Mobile template cards */}
      <div className="md:hidden space-y-3">
        {templates.map(tpl => {
          const total = tpl.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
          return (
            <Card key={tpl.id} className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
              onClick={() => handleOpenDetail(tpl)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* P3.17: Icon */}
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontFamily: 'var(--font-heading)' }}>{tpl.name}</p>
                    <p className="text-muted-foreground text-sm truncate">{tpl.supplierName || 'Chưa có NCC'}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs gap-0.5">
                        <Package className="h-2.5 w-2.5" /> {tpl.items.length} SP
                      </Badge>
                      {total > 0 && (
                        <span className="text-xs text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(total)}</span>
                      )}
                      <Badge variant="secondary" className="text-[10px] gap-0.5">
                        <RotateCcw className="h-2.5 w-2.5" /> {tpl.usageCount}x
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                </div>
                {/* Quick actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={e => { e.stopPropagation(); handleOpenReorder(tpl); }}>
                    <RotateCcw className="h-3 w-3" /> Sử dụng
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={e => { e.stopPropagation(); handleAddAllToCart(tpl); }}>
                    <ShoppingCart className="h-3 w-3" /> Thêm giỏ
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={e => { e.stopPropagation(); setSelectedTemplate(tpl); setShowDelete(true); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* P3.17: Desktop DataTable */}
      <div className="hidden md:block">
        <DataTable
          columns={columns} data={tableData} totalItems={tableData.length}
          pagination={{ page: 1, pageSize: 50 }}
          onPaginationChange={() => {}} onSortChange={() => {}}
          getId={row => row.id} loading={loading}
          onRowClick={row => handleOpenDetail(templates.find(t => t.id === row.id)!)}
          renderActions={row => {
            const tpl = templates.find(t => t.id === row.id)!;
            return (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleOpenReorder(tpl); }} title="Đặt lại">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleAddAllToCart(tpl); }} title="Thêm vào giỏ">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedTemplate(tpl); setShowDelete(true); }} className="text-destructive hover:text-destructive" title="Xoá">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          }}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>Chi tiết template đơn hàng</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedTemplate.description || 'Không có mô tả'}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'NCC', value: selectedTemplate.supplierName || '—' },
                  { label: 'Số lần dùng', value: String(selectedTemplate.usageCount) },
                  { label: 'Lần dùng cuối', value: selectedTemplate.lastUsed ?? 'Chưa sử dụng' },
                  { label: 'Ngày tạo', value: selectedTemplate.createdAt },
                ].map(item => (
                  <div key={item.label} className="p-2.5 rounded-lg bg-muted/20">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <p className="text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)' }} className="text-sm mb-2">Sản phẩm ({selectedTemplate.items.length})</p>
                {selectedTemplate.items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Chưa có sản phẩm</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTemplate.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50">
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                          <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm">{item.productName}</p>
                          <p className="text-muted-foreground text-xs">{item.quantity} {item.unit} × {formatPrice(item.unitPrice)}</p>
                        </div>
                        <p className="text-primary shrink-0 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(item.quantity * item.unitPrice)}</p>
                      </div>
                    ))}
                    <div className="text-right pt-2 border-t">
                      <span className="text-muted-foreground text-sm">Tổng dự kiến: </span>
                      <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(selectedTemplate.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
            {selectedTemplate && selectedTemplate.items.length > 0 && (
              <Button onClick={() => { setShowDetail(false); handleOpenReorder(selectedTemplate); }} className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Sử dụng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reorder Dialog */}
      <Dialog open={showReorder} onOpenChange={setShowReorder}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xác nh���n đặt hàng từ template</DialogTitle>
            <DialogDescription>Đặt lại "{selectedTemplate?.name}" với giá hiện tại</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {reorderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50">
                  <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                    <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{item.productName}</p>
                    <p className="text-muted-foreground text-xs">{formatPrice(item.unitPrice)}/{item.unit}</p>
                  </div>
                  <Input type="number" className="w-20 text-center h-8" value={item.quantity} min={1}
                    onChange={e => { const newItems = [...reorderItems]; newItems[i] = { ...newItems[i], quantity: Math.max(1, Number(e.target.value)) }; setReorderItems(newItems); }} />
                  <p className="text-primary shrink-0 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(item.quantity * item.unitPrice)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-right pt-2 border-t">
            <span className="text-muted-foreground text-sm">Tổng: </span>
            <span className="text-primary text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(reorderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReorder(false)}>Huỷ</Button>
            <Button onClick={handleConfirmReorder} className="gap-1.5"><ShoppingCart className="h-4 w-4" /> Đặt hàng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá template</DialogTitle>
            <DialogDescription>Hành động này không thể hoàn tác</DialogDescription>
          </DialogHeader>
          <p className="text-muted-foreground">Bạn có chắc muốn xoá template "{selectedTemplate?.name}"?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Huỷ</Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-1.5"><Trash2 className="h-4 w-4" /> Xoá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <CreateTemplateDialog open={showCreate} onClose={() => setShowCreate(false)} name={createName} description={createDescription}
        onNameChange={setCreateName} onDescriptionChange={setCreateDescription} onSubmit={handleCreate} />

      {/* P3.18: From Order Dialog */}
      <FromOrderDialog open={showFromOrder} onClose={() => setShowFromOrder(false)} orders={recentOrders}
        selectedId={selectedOrderId} onSelectId={setSelectedOrderId} onSubmit={handleCreateFromOrder} />
    </div>
  );
}

// ─── Create Template Dialog ──────────────────────────────
function CreateTemplateDialog({ open, onClose, name, description, onNameChange, onDescriptionChange, onSubmit }: {
  open: boolean; onClose: () => void; name: string; description: string;
  onNameChange: (v: string) => void; onDescriptionChange: (v: string) => void; onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo template đơn hàng mới</DialogTitle>
          <DialogDescription>Template giúp bạn đặt hàng nhanh hơn cho các đơn lặp lại</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Tên template <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={e => onNameChange(e.target.value)} placeholder="VD: Linh kiện hàng tháng" />
          </div>
          <div className="grid gap-2">
            <Label>Mô tả</Label>
            <Textarea value={description} onChange={e => onDescriptionChange(e.target.value)} placeholder="Mô tả ngắn..." rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={onSubmit} className="gap-1.5"><Save className="h-4 w-4" /> Tạo template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── P3.18: Create from Order Dialog ─────────────────────
function FromOrderDialog({ open, onClose, orders, selectedId, onSelectId, onSubmit }: {
  open: boolean; onClose: () => void; orders: Order[]; selectedId: string;
  onSelectId: (id: string) => void; onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" /> Tạo template từ đơn hàng
          </DialogTitle>
          <DialogDescription>Chọn đơn hàng cũ để tạo template tự động</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Đang tải đơn hàng...</p>
          ) : (
            orders.map(order => (
              <button
                key={order.id}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedId === order.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
                }`}
                onClick={() => onSelectId(order.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontFamily: 'var(--font-heading)' }} className="text-sm">{order.orderNumber}</span>
                  <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{order.supplierName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{order.items.length} SP</span>
                  <span>·</span>
                  <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(order.totalAmount)}</span>
                  <span>·</span>
                  <span>{order.orderDate}</span>
                </div>
              </button>
            ))
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={onSubmit} disabled={!selectedId} className="gap-1.5">
            <ArrowRight className="h-4 w-4" /> Tạo template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}