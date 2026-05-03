// ============================================================
// Cấu hình quy tắc phê duyệt — Seller
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Settings, Plus, Edit2, Trash2, Save, ArrowLeft, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { approvalApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { ApprovalRule, ApprovalType, StaffRole } from '../../types';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const approvalTypes: ApprovalType[] = ['Đơn hàng', 'Báo giá', 'Hợp đồng', 'Sản phẩm', 'Xuất kho'];
const staffRoles: StaffRole[] = ['Chủ DN', 'Quản lý', 'Nhân viên bán hàng', 'Thủ kho', 'Kế toán'];
const conditionLabels: Record<string, string> = { amount_gt: 'Số tiền lớn hơn', always: 'Luôn luôn' };

function getRulePreview(rule: { type: ApprovalType; condition: string; threshold?: number; approverRole: StaffRole }): string {
  if (rule.condition === 'always') {
    return `Mọi ${rule.type.toLowerCase()} → ${rule.approverRole} phải duyệt`;
  }
  return `${rule.type} > ${formatPrice(rule.threshold ?? 0)} → ${rule.approverRole} phải duyệt`;
}

export function SellerApprovalRulesPage() {
  const { user } = useAuth();
  const supplierId = user?.supplierId ?? 'sup-01';
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [formType, setFormType] = useState<ApprovalType>('Đơn hàng');
  const [formCondition, setFormCondition] = useState<'amount_gt' | 'always'>('amount_gt');
  const [formThreshold, setFormThreshold] = useState<number>(50000000);
  const [formApproverRole, setFormApproverRole] = useState<StaffRole>('Chủ DN');
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApprovalRule | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await approvalApi.getRules(supplierId);
      setRules(data);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const resetForm = () => {
    setFormType('Đơn hàng');
    setFormCondition('amount_gt');
    setFormThreshold(50000000);
    setFormApproverRole('Chủ DN');
    setFormIsActive(true);
    setEditingRule(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setFormType(rule.type);
    setFormCondition(rule.condition);
    setFormThreshold(rule.threshold ?? 0);
    setFormApproverRole(rule.approverRole);
    setFormIsActive(rule.isActive);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (formCondition === 'amount_gt' && formThreshold <= 0) {
      toast.error('Ngưỡng phải lớn hơn 0');
      return;
    }

    // Check duplicate (cùng type + condition + approverRole, trừ chính nó)
    const isDuplicate = rules.some(r =>
      r.type === formType &&
      r.condition === formCondition &&
      r.approverRole === formApproverRole &&
      r.id !== editingRule?.id
    );
    if (isDuplicate) {
      toast.error('Quy tắc tương tự đã tồn tại');
      return;
    }

    try {
      if (editingRule) {
        await approvalApi.updateRule(editingRule.id, {
          type: formType,
          condition: formCondition,
          threshold: formCondition === 'amount_gt' ? formThreshold : undefined,
          approverRole: formApproverRole,
          isActive: formIsActive,
        });
        toast.success('Đã cập nhật quy tắc');
      } else {
        await approvalApi.createRule({
          supplierId,
          type: formType,
          condition: formCondition,
          threshold: formCondition === 'amount_gt' ? formThreshold : undefined,
          approverRole: formApproverRole,
          isActive: formIsActive,
        });
        toast.success('Đã tạo quy tắc mới');
      }
      setShowForm(false);
      fetchRules();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await approvalApi.deleteRule(deleteTarget.id);
    toast.success('Đã xoá quy tắc');
    setShowDelete(false);
    setDeleteTarget(null);
    fetchRules();
  };

  const handleToggle = async (rule: ApprovalRule) => {
    await approvalApi.updateRule(rule.id, { isActive: !rule.isActive });
    toast.success(rule.isActive ? 'Đã tắt quy tắc' : 'Đã bật quy tắc');
    fetchRules();
  };

  const activeRules = rules.filter(r => r.isActive);
  const inactiveRules = rules.filter(r => !r.isActive);

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[
        { label: 'Phê duyệt', href: '/seller/approvals' },
        { label: 'Quy tắc' },
      ]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Quy tắc phê duyệt
          </h1>
          <p className="text-muted-foreground">Cấu hình điều kiện phê duyệt tự động cho đơn hàng, báo giá, hợp đồng</p>
        </div>
        <div className="flex gap-2">
          <Link to="/seller/approvals">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm quy tắc
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Đang tải...</p>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="mb-2">Chưa có quy tắc phê duyệt</h2>
          <p className="text-muted-foreground mb-6">Tạo quy tắc để tự động yêu cầu phê duyệt khi đơn hàng vượt ngưỡng</p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo quy tắc đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active rules */}
          {activeRules.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Đang hoạt động ({activeRules.length})
              </h3>
              <div className="space-y-3">
                {activeRules.map(rule => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={() => openEdit(rule)}
                    onDelete={() => { setDeleteTarget(rule); setShowDelete(true); }}
                    onToggle={() => handleToggle(rule)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive rules */}
          {inactiveRules.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-5 w-5" />
                Đã tắt ({inactiveRules.length})
              </h3>
              <div className="space-y-3">
                {inactiveRules.map(rule => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={() => openEdit(rule)}
                    onDelete={() => { setDeleteTarget(rule); setShowDelete(true); }}
                    onToggle={() => handleToggle(rule)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Sửa quy tắc' : 'Thêm quy tắc phê duyệt'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Loại *</Label>
              <Select value={formType} onValueChange={v => setFormType(v as ApprovalType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {approvalTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Điều kiện *</Label>
              <Select value={formCondition} onValueChange={v => setFormCondition(v as 'amount_gt' | 'always')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount_gt">Số tiền lớn hơn</SelectItem>
                  <SelectItem value="always">Luôn luôn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formCondition === 'amount_gt' && (
              <div className="grid gap-2">
                <Label>Ngưỡng (VNĐ) *</Label>
                <Input type="number" value={formThreshold} onChange={e => setFormThreshold(Number(e.target.value))} min={1} />
                <p className="text-muted-foreground">{formatPrice(formThreshold)}</p>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Người duyệt (vai trò) *</Label>
              <Select value={formApproverRole} onValueChange={v => setFormApproverRole(v as StaffRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {staffRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>{formIsActive ? 'Đang bật' : 'Đang tắt'}</Label>
            </div>
            {/* Preview */}
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p className="text-muted-foreground">Xem trước:</p>
                <p className="mt-1">{getRulePreview({
                  type: formType,
                  condition: formCondition,
                  threshold: formCondition === 'amount_gt' ? formThreshold : undefined,
                  approverRole: formApproverRole,
                })}</p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Huỷ</Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {editingRule ? 'Cập nhật' : 'Tạo quy tắc'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá quy tắc</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc muốn xoá quy tắc này? Hành động không thể hoàn tác.</p>
          {deleteTarget && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p>{getRulePreview(deleteTarget)}</p>
              </CardContent>
            </Card>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Huỷ</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-component: RuleCard ---
function RuleCard({ rule, onEdit, onDelete, onToggle }: {
  rule: ApprovalRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <Card className={`${!rule.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline">{rule.type}</Badge>
            <Badge variant={rule.condition === 'always' ? 'secondary' : 'default'}>
              {rule.condition === 'always' ? 'Luôn luôn' : `> ${formatPrice(rule.threshold ?? 0)}`}
            </Badge>
            <Badge variant="secondary">{rule.approverRole}</Badge>
          </div>
          <p className="text-muted-foreground">{getRulePreview(rule)}</p>
          <p className="text-muted-foreground mt-1">Tạo ngày: {rule.createdAt}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch checked={rule.isActive} onCheckedChange={onToggle} />
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
