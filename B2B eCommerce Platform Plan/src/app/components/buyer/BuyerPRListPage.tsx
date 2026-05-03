// ============================================================
// Trang Yêu cầu mua hàng nội bộ — Buyer (Nhóm 30)
// Bao gồm: thống kê, bộ lọc, DataTable, tạo/sửa PR,
//           gửi duyệt, duyệt/từ chối, tạo đơn từ PR
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, FileText, Send,
  Plus, Eye, Trash2, ShoppingCart, PenLine, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { prApi } from '../../services/prApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  PurchaseRequisition, PRStatus, PRPriority, PRItem, PRStats,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ALL_STATUSES: PRStatus[] = ['Bản nháp', 'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã tạo đơn', 'Đóng'];
const ALL_PRIORITIES: PRPriority[] = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];

const priorityColor: Record<PRPriority, string> = {
  'Thấp': 'text-gray-500',
  'Trung bình': 'text-blue-600',
  'Cao': 'text-orange-600',
  'Khẩn cấp': 'text-red-600',
};

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select',
    options: ALL_STATUSES.map(s => ({ label: s, value: s })),
  },
  {
    key: 'department', label: 'Bộ phận', type: 'select',
    options: prApi.getDepartments().map(d => ({ label: d, value: d })),
  },
  {
    key: 'priority', label: 'Độ ưu tiên', type: 'select',
    options: ALL_PRIORITIES.map(p => ({ label: p, value: p })),
  },
];

// --- Tạo empty PR item ---
const emptyItem = (): PRItem => ({
  productId: '', productName: '', quantity: 1, estimatedPrice: 0,
  unit: 'Cái', specification: '', note: '',
});

export function BuyerPRListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data
  const [prList, setPrList] = useState<PurchaseRequisition[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<PRStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination, sort, filter
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'myApproval'>('all');

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null);

  // Form state
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formDepartment, setFormDepartment] = useState('');
  const [formPriority, setFormPriority] = useState<PRPriority>('Trung bình');
  const [formJustification, setFormJustification] = useState('');
  const [formItems, setFormItems] = useState<PRItem[]>([emptyItem()]);
  const [formApproverId, setFormApproverId] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  const companyId = 'comp-01';

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const appliedFilters = [...filters];
      const [res, statsRes] = await Promise.all([
        prApi.getByCompany(companyId, pagination, sort, appliedFilters, search),
        prApi.getStats(companyId),
      ]);

      let data = res.data;
      // Filter "Chờ tôi duyệt"
      if (activeTab === 'myApproval' && user) {
        data = data.filter(p => p.approverId === user.id && p.status === 'Chờ duyệt');
      }

      setPrList(data);
      setTotal(activeTab === 'myApproval' ? data.length : res.total);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search, activeTab, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Form ---
  const resetForm = () => {
    setFormDepartment('');
    setFormPriority('Trung bình');
    setFormJustification('');
    setFormItems([emptyItem()]);
    setFormApproverId('');
    setFormMode('create');
    setSelectedPR(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (pr: PurchaseRequisition) => {
    setSelectedPR(pr);
    setFormMode('edit');
    setFormDepartment(pr.department);
    setFormPriority(pr.priority);
    setFormJustification(pr.justification);
    setFormItems(pr.items.length > 0 ? [...pr.items] : [emptyItem()]);
    setFormApproverId(pr.approverId ?? '');
    setShowForm(true);
  };

  const calcTotal = () => formItems.reduce((sum, i) => sum + i.quantity * i.estimatedPrice, 0);

  const handleItemChange = (index: number, field: keyof PRItem, value: string | number) => {
    setFormItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => setFormItems(prev => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!formDepartment || !formJustification || formItems.some(i => !i.productName || !i.quantity)) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    const payload: Partial<PurchaseRequisition> = {
      department: formDepartment,
      priority: formPriority,
      justification: formJustification,
      items: formItems,
      totalEstimate: calcTotal(),
      status: 'Bản nháp',
    };
    if (formMode === 'edit' && selectedPR) {
      await prApi.update(selectedPR.id, payload);
      toast.success('Đã cập nhật yêu cầu');
    } else {
      await prApi.create(payload);
      toast.success('Đã lưu nháp yêu cầu');
    }
    setShowForm(false);
    resetForm();
    fetchData();
  };

  const handleSubmitForApproval = async () => {
    if (!formDepartment || !formJustification || formItems.some(i => !i.productName || !i.quantity)) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    if (!formApproverId) {
      toast.error('Vui lòng chọn người duyệt'); return;
    }
    const approver = prApi.getApprovers().find(a => a.id === formApproverId);
    const payload: Partial<PurchaseRequisition> = {
      department: formDepartment,
      priority: formPriority,
      justification: formJustification,
      items: formItems,
      totalEstimate: calcTotal(),
      status: 'Chờ duyệt',
      approverId: formApproverId,
      approverName: approver?.name,
    };
    if (formMode === 'edit' && selectedPR) {
      await prApi.update(selectedPR.id, payload);
    } else {
      await prApi.create({ ...payload, status: 'Chờ duyệt' });
    }
    toast.success('Đã gửi yêu cầu duyệt');
    setShowForm(false);
    resetForm();
    fetchData();
  };

  // --- Approve / Reject ---
  const handleApprove = async () => {
    if (!selectedPR) return;
    await prApi.approve(selectedPR.id);
    toast.success(`Đã duyệt ${selectedPR.prNumber}`);
    setShowApprovalDialog(false);
    setSelectedPR(null);
    fetchData();
  };

  const handleReject = async () => {
    if (!selectedPR || !rejectionNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối'); return;
    }
    await prApi.reject(selectedPR.id, rejectionNote);
    toast.success(`Đã từ chối ${selectedPR.prNumber}`);
    setShowRejectDialog(false);
    setRejectionNote('');
    setSelectedPR(null);
    fetchData();
  };

  // --- Create Order from PR ---
  const handleCreateOrder = async (pr: PurchaseRequisition) => {
    await prApi.createOrderFromPR(pr.id);
    toast.success(`Đã tạo đơn hàng từ ${pr.prNumber}`);
    fetchData();
  };

  // --- Delete ---
  const handleDelete = async (pr: PurchaseRequisition) => {
    if (pr.status !== 'Bản nháp' && pr.status !== 'Từ chối') {
      toast.error('Chỉ xoá được yêu cầu ở trạng thái Bản nháp hoặc Từ chối'); return;
    }
    await prApi.delete(pr.id);
    toast.success(`Đã xoá ${pr.prNumber}`);
    fetchData();
  };

  // --- Columns ---
  const columns: (ColumnConfig & { render?: (item: PurchaseRequisition) => React.ReactNode })[] = [
    { key: 'prNumber', label: 'Mã YCMH', visible: true, sortable: true },
    { key: 'requesterName', label: 'Người yêu cầu', visible: true, sortable: true },
    { key: 'department', label: 'Bộ phận', visible: true, sortable: true },
    {
      key: 'items', label: 'Số SP', visible: true, sortable: false,
      render: (item) => <span>{item.items.length} sản phẩm</span>,
    },
    {
      key: 'totalEstimate', label: 'Tổng dự kiến', visible: true, sortable: true,
      render: (item) => <span className="font-medium">{formatPrice(item.totalEstimate)}</span>,
    },
    {
      key: 'priority', label: 'Ưu tiên', visible: true, sortable: true,
      render: (item) => (
        <span className={`font-medium ${priorityColor[item.priority]}`}>
          {item.priority === 'Khẩn cấp' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
          {item.priority}
        </span>
      ),
    },
    {
      key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true,
      render: (item) => <span>{formatDate(item.createdAt)}</span>,
    },
  ];

  // --- Stats cards ---
  const statsCards = stats ? [
    { label: 'Tổng YCMH', value: stats.total, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Chờ duyệt', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Đã duyệt', value: stats.approved, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Từ chối', value: stats.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Đã tạo đơn', value: stats.ordered, icon: ShoppingCart, color: 'text-purple-600 bg-purple-50' },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Yêu cầu mua hàng' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Yêu cầu mua hàng nội bộ
          </h1>
          <p className="text-muted-foreground">Quản lý yêu cầu mua hàng, phê duyệt và tạo đơn</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo yêu cầu
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statsCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-semibold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setActiveTab('all'); setPagination(p => ({ ...p, page: 1 })); }}
        >
          Tất cả
        </Button>
        <Button
          variant={activeTab === 'myApproval' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setActiveTab('myApproval'); setPagination(p => ({ ...p, page: 1 })); }}
        >
          <Clock className="h-3 w-3 mr-1" />
          Chờ tôi duyệt
        </Button>
      </div>

      {/* Filter */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã PR, người YC, sản phẩm..."
      />

      {/* Table */}
      <div className="mt-4">
        <DataTable
          data={prList}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={p => p.id}
          loading={loading}
          renderActions={(pr) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/pr-list/${pr.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
              {(pr.status === 'Bản nháp' || pr.status === 'Từ chối') && (
                <Button size="sm" variant="ghost" onClick={() => openEdit(pr)}>
                  <PenLine className="h-4 w-4" />
                </Button>
              )}
              {pr.status === 'Chờ duyệt' && pr.approverId === user?.id && (
                <>
                  <Button size="sm" variant="ghost" className="text-green-600" onClick={() => { setSelectedPR(pr); setShowApprovalDialog(true); }}>
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { setSelectedPR(pr); setShowRejectDialog(true); }}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              {pr.status === 'Đã duyệt' && (
                <Button size="sm" variant="ghost" className="text-purple-600" onClick={() => handleCreateOrder(pr)}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
              {(pr.status === 'Bản nháp' || pr.status === 'Từ chối') && (
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(pr)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Tạo / Sửa PR ==================== */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Tạo yêu cầu mua hàng' : 'Sửa yêu cầu mua hàng'}</DialogTitle>
            <DialogDescription>
              Điền thông tin yêu cầu và danh sách sản phẩm cần mua
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bộ phận <span className="text-red-500">*</span></Label>
                <Select value={formDepartment} onValueChange={setFormDepartment}>
                  <SelectTrigger><SelectValue placeholder="Chọn bộ phận" /></SelectTrigger>
                  <SelectContent>
                    {prApi.getDepartments().map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Độ ưu tiên</Label>
                <Select value={formPriority} onValueChange={v => setFormPriority(v as PRPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_PRIORITIES.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Lý do yêu cầu <span className="text-red-500">*</span></Label>
              <Textarea
                value={formJustification}
                onChange={e => setFormJustification(e.target.value)}
                placeholder="Mô tả lý do cần mua hàng..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Danh sách sản phẩm cần mua</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" /> Thêm dòng
                </Button>
              </div>

              <div className="space-y-3">
                {formItems.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="md:col-span-4">
                          <Label className="text-xs">Tên sản phẩm *</Label>
                          <Input
                            value={item.productName}
                            onChange={e => handleItemChange(idx, 'productName', e.target.value)}
                            placeholder="Nhập tên SP..."
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label className="text-xs">SL *</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Giá dự kiến</Label>
                          <Input
                            type="number"
                            min={0}
                            value={item.estimatedPrice}
                            onChange={e => handleItemChange(idx, 'estimatedPrice', Number(e.target.value))}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label className="text-xs">ĐVT</Label>
                          <Input
                            value={item.unit}
                            onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-xs">Quy cách KT</Label>
                          <Input
                            value={item.specification}
                            onChange={e => handleItemChange(idx, 'specification', e.target.value)}
                            placeholder="Đặc tả..."
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => removeItem(idx)}
                            disabled={formItems.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {item.quantity > 0 && item.estimatedPrice > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          Thành tiền: {formatPrice(item.quantity * item.estimatedPrice)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-right mt-2">
                <span className="font-medium">Tổng dự kiến: {formatPrice(calcTotal())}</span>
              </div>
            </div>

            <Separator />

            {/* Người duyệt */}
            <div>
              <Label>Người duyệt (chọn để gửi duyệt)</Label>
              <Select value={formApproverId} onValueChange={setFormApproverId}>
                <SelectTrigger><SelectValue placeholder="Chọn người duyệt" /></SelectTrigger>
                <SelectContent>
                  {prApi.getApprovers().map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
              Huỷ
            </Button>
            <Button variant="secondary" onClick={handleSaveDraft} className="gap-2">
              <FileText className="h-4 w-4" /> Lưu nháp
            </Button>
            <Button onClick={handleSubmitForApproval} className="gap-2">
              <Send className="h-4 w-4" /> Gửi duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Chi tiết PR ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết {selectedPR?.prNumber}</DialogTitle>
          </DialogHeader>
          {selectedPR && (
            <div className="space-y-4">
              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Người yêu cầu:</span>
                  <p className="font-medium">{selectedPR.requesterName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bộ phận:</span>
                  <p className="font-medium">{selectedPR.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Độ ưu tiên:</span>
                  <p className={`font-medium ${priorityColor[selectedPR.priority]}`}>{selectedPR.priority}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div className="mt-0.5"><StatusBadge status={selectedPR.status} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <p className="font-medium">{formatDate(selectedPR.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tổng dự kiến:</span>
                  <p className="font-medium">{formatPrice(selectedPR.totalEstimate)}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Lý do:</span>
                <p className="text-sm">{selectedPR.justification}</p>
              </div>

              <Separator />

              {/* Timeline */}
              <div>
                <p className="font-medium mb-2">Lịch trình</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Tạo yêu cầu — {formatDate(selectedPR.createdAt)}</span>
                  </div>
                  {selectedPR.approverId && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Gửi duyệt cho {selectedPR.approverName}</span>
                    </div>
                  )}
                  {selectedPR.approvedAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Đã duyệt — {formatDate(selectedPR.approvedAt)}</span>
                    </div>
                  )}
                  {selectedPR.rejectionNote && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <div>
                        <span>Từ chối</span>
                        <p className="text-muted-foreground">{selectedPR.rejectionNote}</p>
                      </div>
                    </div>
                  )}
                  {selectedPR.linkedOrderId && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Đã tạo đơn hàng: {selectedPR.linkedOrderId}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Danh sách SP */}
              <div>
                <p className="font-medium mb-2">Sản phẩm ({selectedPR.items.length})</p>
                <div className="space-y-2">
                  {selectedPR.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        {item.specification && (
                          <p className="text-xs text-muted-foreground">{item.specification}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p>{item.quantity} {item.unit} × {formatPrice(item.estimatedPrice)}</p>
                        <p className="font-medium">{formatPrice(item.quantity * item.estimatedPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-2 font-medium">
                  Tổng: {formatPrice(selectedPR.totalEstimate)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Duyệt ==================== */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu {selectedPR?.prNumber}?</DialogTitle>
            <DialogDescription>
              Bạn xác nhận duyệt yêu cầu mua hàng này?
            </DialogDescription>
          </DialogHeader>
          {selectedPR && (
            <div className="text-sm space-y-2">
              <p>Người yêu cầu: <strong>{selectedPR.requesterName}</strong></p>
              <p>Bộ phận: <strong>{selectedPR.department}</strong></p>
              <p>Tổng dự kiến: <strong>{formatPrice(selectedPR.totalEstimate)}</strong></p>
              <p>Lý do: {selectedPR.justification}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Huỷ</Button>
            <Button onClick={handleApprove} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Từ chối ==================== */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối {selectedPR?.prNumber}</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối để người yêu cầu có thể chỉnh sửa
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Lý do từ chối <span className="text-red-500">*</span></Label>
            <Textarea
              value={rejectionNote}
              onChange={e => setRejectionNote(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionNote(''); }}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleReject} className="gap-2">
              <XCircle className="h-4 w-4" /> Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}