// ============================================================
// Quản lý bảo hành — Buyer (P3 Đợt 8: P3.27–P3.30)
// Warranty cards, expiring alerts, multi-step claim form
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, Clock, AlertTriangle, CheckCircle2, XCircle, Plus,
  Wrench, Eye, Calendar, ChevronRight, Camera, Upload,
  ArrowRight, ArrowLeft, Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { ProgressRing } from '../shared/ProgressRing';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { useAuth } from '../../context/AuthContext';
import { warrantyApi, warrantyClaimApi } from '../../services/warrantyApi';
import { toast } from 'sonner';
import type {
  Warranty, WarrantyClaim, ClaimType,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

type WarrantyRow = Warranty & { daysRemaining: number };

const getWarrantyStoreName = (item: { sellerCompany?: string }) => item.sellerCompany || 'CELLPHONES';

const warrantyColumns: ColumnConfig[] = [
  { key: 'warrantyNumber', label: 'Mã BH', visible: true, sortable: true },
  { key: 'productName', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'sellerCompany', label: 'Cửa hàng', visible: true, sortable: true },
  { key: 'endDate', label: 'Hết hạn', visible: true, sortable: true },
  { key: 'daysRemaining', label: 'Còn lại', visible: true, sortable: true,
    render: (item: WarrantyRow) => {
      const isExpiring = item.daysRemaining > 0 && item.daysRemaining <= 30;
      const isExpired = item.daysRemaining <= 0;
      return (
        <span className={isExpired ? 'text-muted-foreground' : isExpiring ? 'text-amber-600' : 'text-emerald-600'}
          style={{ fontFamily: 'var(--font-heading)' }}>
          {isExpired ? 'Hết hạn' : `${item.daysRemaining} ngày`}
        </span>
      );
    },
  } as ColumnConfig & { render: (item: WarrantyRow) => React.ReactNode },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
    render: (item: WarrantyRow) => <StatusBadge status={item.status} />,
  } as ColumnConfig & { render: (item: WarrantyRow) => React.ReactNode },
];

const claimColumns: ColumnConfig[] = [
  { key: 'claimNumber', label: 'Mã KN', visible: true, sortable: true },
  { key: 'productName', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'claimType', label: 'Loại', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
    render: (item: WarrantyClaim) => <StatusBadge status={item.status} />,
  } as ColumnConfig & { render: (item: WarrantyClaim) => React.ReactNode },
  { key: 'createdAt', label: 'Ngày gửi', visible: true, sortable: true,
    render: (item: WarrantyClaim) => <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>,
  } as ColumnConfig & { render: (item: WarrantyClaim) => React.ReactNode },
];

const warrantyFilters: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Còn hạn', value: 'Còn hạn' }, { label: 'Sắp hết', value: 'Sắp hết' },
    { label: 'Hết hạn', value: 'Hết hạn' }, { label: 'Bị huỷ', value: 'Bị huỷ' },
  ]},
];

const claimFilters: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Mới tạo', value: 'Mới tạo' }, { label: 'Đang xem xét', value: 'Đang xem xét' },
    { label: 'Chấp nhận', value: 'Chấp nhận' }, { label: 'Từ chối', value: 'Từ chối' },
    { label: 'Đang sửa chữa', value: 'Đang sửa chữa' }, { label: 'Đã giải quyết', value: 'Đã giải quyết' },
  ]},
  { key: 'claimType', label: 'Loại', type: 'select', options: [
    { label: 'Sửa chữa', value: 'Sửa chữa' }, { label: 'Thay thế', value: 'Thay thế' }, { label: 'Hoàn tiền', value: 'Hoàn tiền' },
  ]},
];

// ─── P3.27: Warranty Card UI ─────────────────────────────
function WarrantyCard({ warranty, onClick }: { warranty: WarrantyRow; onClick: () => void }) {
  const isExpiring = warranty.daysRemaining > 0 && warranty.daysRemaining <= 30;
  const isExpired = warranty.daysRemaining <= 0;
  const pct = isExpired ? 0 : Math.min(100, (warranty.daysRemaining / 365) * 100);

  return (
    <Card
      className={`cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden ${
        isExpiring ? 'border-amber-300 dark:border-amber-800' :
        isExpired ? 'border-muted opacity-70' : ''
      }`}
      onClick={onClick}
    >
      {/* P3.27: Card top gradient */}
      <div className={`h-1.5 ${
        isExpired ? 'bg-muted' : isExpiring ? 'bg-gradient-to-r from-amber-400 to-red-400' : 'bg-gradient-to-r from-primary to-blue-400'
      }`} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
            isExpired ? 'bg-muted' : isExpiring ? 'bg-amber-100 dark:bg-amber-950/20' : 'bg-primary/10'
          }`}>
            <Shield className={`h-5 w-5 ${isExpired ? 'text-muted-foreground' : isExpiring ? 'text-amber-500' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>{warranty.productName}</p>
            <p className="text-xs text-muted-foreground truncate">{getWarrantyStoreName(warranty)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px]">{warranty.warrantyNumber}</Badge>
              <span className="text-[10px] text-muted-foreground">{warranty.orderNumber}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
        </div>

        <Separator className="my-3" />

        {/* P3.27: Serial, dates, status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Bắt đầu:</span>
            <p className="text-sm">{warranty.startDate}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Hết hạn:</span>
            <p className="text-sm">{warranty.endDate}</p>
          </div>
        </div>

        {/* P3.28: Countdown / expiring alert */}
        <div className={`mt-3 flex items-center justify-between p-2 rounded-lg ${
          isExpired ? 'bg-muted/30' :
          isExpiring ? 'bg-amber-50 dark:bg-amber-950/10' : 'bg-emerald-50/50 dark:bg-emerald-950/10'
        }`}>
          <div className="flex items-center gap-1.5">
            {isExpired ? <Clock className="h-3.5 w-3.5 text-muted-foreground" /> :
              isExpiring ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> :
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
            <span className={`text-xs ${
              isExpired ? 'text-muted-foreground' :
              isExpiring ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`} style={{ fontFamily: 'var(--font-heading)' }}>
              {isExpired ? 'Đã hết hạn' : isExpiring ? `Còn ${warranty.daysRemaining} ngày!` : `Còn ${warranty.daysRemaining} ngày`}
            </span>
          </div>
          <StatusBadge status={warranty.status} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── P3.28: Expiring Alert Banner ────────────────────────
function ExpiringAlert({ warranties }: { warranties: WarrantyRow[] }) {
  const expiring = warranties.filter(w => w.daysRemaining > 0 && w.daysRemaining <= 30);
  if (expiring.length === 0) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="p-4 flex items-center gap-3 flex-wrap">
        <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            {expiring.length} sản phẩm sắp hết bảo hành!
          </p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {expiring.slice(0, 3).map(w => (
              <Badge key={w.id} variant="destructive" className="text-[10px] gap-0.5">
                {w.productName.slice(0, 20)}... — {w.daysRemaining} ngày
              </Badge>
            ))}
            {expiring.length > 3 && <Badge variant="outline" className="text-[10px]">+{expiring.length - 3} khác</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── P3.29: Multi-step Claim Form ────────────────────────
type ClaimStep = 'product' | 'describe' | 'images' | 'confirm';

function MultiStepClaimDialog({ open, onOpenChange, warranties, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; warranties: WarrantyRow[]; onCreated: () => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState<ClaimStep>('product');
  const [warrantyId, setWarrantyId] = useState('');
  const [claimType, setClaimType] = useState<ClaimType>('Sửa chữa');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const activeWarranties = warranties.filter(w => w.status === 'Còn hạn' || w.status === 'Sắp hết');
  const selectedW = activeWarranties.find(w => w.id === warrantyId);

  const STEPS: { key: ClaimStep; label: string; icon: typeof Package }[] = [
    { key: 'product', label: 'Chọn SP', icon: Package },
    { key: 'describe', label: 'Mô tả lỗi', icon: Wrench },
    { key: 'images', label: 'Gửi hình', icon: Camera },
    { key: 'confirm', label: 'Xác nhận', icon: CheckCircle2 },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  const handleSubmit = async () => {
    if (!warrantyId || !description.trim()) { toast.error('Thiếu thông tin'); return; }
    if (!selectedW) return;
    setSaving(true);
    try {
      await warrantyClaimApi.create({
        warrantyId, productId: selectedW.productId, productName: selectedW.productName,
        buyerId: user?.id || '', buyerCompany: user?.companyName || '',
        sellerId: selectedW.sellerId, sellerCompany: selectedW.sellerCompany,
        issueDescription: description, claimType,
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      });
      toast.success('Đã gửi yêu cầu bảo hành');
      resetForm(); onOpenChange(false); onCreated();
    } finally { setSaving(false); }
  };

  const resetForm = () => { setStep('product'); setWarrantyId(''); setDescription(''); setImageUrl(''); };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Yêu cầu bảo hành
          </DialogTitle>
          <DialogDescription>Điền thông tin theo từng bước</DialogDescription>
        </DialogHeader>

        {/* P3.29: Step indicator */}
        <div className="flex items-center gap-0 justify-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < stepIdx;
            const isCurrent = i === stepIdx;
            return (
              <div key={s.key} className="flex items-center">
                {i > 0 && <div className={`w-8 h-0.5 ${isDone ? 'bg-primary' : 'bg-muted'}`} />}
                <div className={`flex flex-col items-center gap-0.5 ${isCurrent ? '' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${
                    isDone ? 'bg-primary text-primary-foreground' :
                    isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className={`text-[10px] ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="min-h-[200px]">
          {/* Step 1: Select product */}
          {step === 'product' && (
            <div className="space-y-4">
              <div>
                <Label>Chọn sản phẩm có bảo hành <span className="text-red-500">*</span></Label>
                <div className="space-y-2 mt-2 max-h-[250px] overflow-y-auto">
                  {activeWarranties.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Không có bảo hành nào đang hiệu lực</p>
                  ) : (
                    activeWarranties.map(w => (
                      <button
                        key={w.id}
                        onClick={() => setWarrantyId(w.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          warrantyId === w.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                      >
                        <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{w.productName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{w.warrantyNumber}</span>
                          <span>·</span>
                          <span>{getWarrantyStoreName(w)}</span>
                          <span>·</span>
                          <span className={w.daysRemaining <= 30 ? 'text-amber-500' : 'text-emerald-500'}>
                            {w.daysRemaining} ngày
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <Label>Loại yêu cầu <span className="text-red-500">*</span></Label>
                <Select value={claimType} onValueChange={v => setClaimType(v as ClaimType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sửa chữa">Sửa chữa</SelectItem>
                    <SelectItem value="Thay thế">Thay thế</SelectItem>
                    <SelectItem value="Hoàn tiền">Hoàn tiền</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Describe issue */}
          {step === 'describe' && (
            <div className="space-y-4">
              <div>
                <Label>Mô tả chi tiết vấn đề <span className="text-red-500">*</span></Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                  placeholder="Mô tả chi tiết lỗi / vấn đề bạn gặp phải..." />
              </div>
            </div>
          )}

          {/* Step 3: Upload images */}
          {step === 'images' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm">Kéo thả hoặc nhấn để tải ảnh</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG (mock)</p>
              </div>
              <div>
                <Label>Hoặc nhập URL ảnh</Label>
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedW && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Xem lại thông tin trước khi gửi:</p>
              {[
                { label: 'Sản phẩm', value: selectedW.productName },
                { label: 'Loại', value: claimType },
                { label: 'Cửa hàng', value: getWarrantyStoreName(selectedW) },
                { label: 'Mô tả', value: description.slice(0, 100) + (description.length > 100 ? '...' : '') },
                { label: 'Ảnh', value: imageUrl ? '1 ảnh đính kèm' : 'Không có ảnh' },
              ].map(item => (
                <div key={item.label} className="p-2.5 rounded-lg bg-muted/20 flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {stepIdx > 0 && (
            <Button variant="outline" onClick={() => setStep(STEPS[stepIdx - 1].key)} className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
            </Button>
          )}
          <div className="flex-1" />
          {step === 'confirm' ? (
            <Button onClick={handleSubmit} disabled={saving} className="gap-1">
              {saving ? 'Đang gửi...' : <><CheckCircle2 className="h-3.5 w-3.5" /> Gửi yêu cầu</>}
            </Button>
          ) : (
            <Button
              onClick={() => setStep(STEPS[stepIdx + 1].key)}
              disabled={(step === 'product' && !warrantyId) || (step === 'describe' && !description.trim())}
              className="gap-1"
            >
              Tiếp <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Warranty Detail Dialog ──────────────────────────────
function WarrantyDetailDialog({ warranty, claims, open, onOpenChange }: {
  warranty: WarrantyRow | null; claims: WarrantyClaim[]; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  if (!warranty) return null;
  const relatedClaims = claims.filter(c => c.warrantyId === warranty.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> {warranty.warrantyNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sản phẩm', value: warranty.productName },
              { label: 'Cửa hàng', value: getWarrantyStoreName(warranty) },
              { label: 'Đơn hàng', value: warranty.orderNumber },
              { label: 'Trạng thái', value: warranty.status, badge: true },
              { label: 'Bắt đầu', value: warranty.startDate },
              { label: 'Hết hạn', value: warranty.endDate },
            ].map(item => (
              <div key={item.label} className="p-2.5 rounded-lg bg-muted/20">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                {item.badge ? <div className="mt-0.5"><StatusBadge status={item.value} /></div> : <p className="text-sm">{item.value}</p>}
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground">Điều khoản</span>
            <p className="text-sm mt-1">{warranty.terms}</p>
          </div>
          {relatedClaims.length > 0 && (
            <div>
              <p className="text-sm mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Lịch sử khiếu nại ({relatedClaims.length})</p>
              <div className="space-y-2">
                {relatedClaims.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 text-sm">
                    <div>
                      <span style={{ fontFamily: 'var(--font-heading)' }}>{c.claimNumber}</span>
                      <span className="text-muted-foreground ml-2">{c.claimType}</span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Claim Detail Dialog ─────────────────────────────────
function ClaimDetailDialog({ claim, open, onOpenChange }: {
  claim: WarrantyClaim | null; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  if (!claim) return null;
  const steps = [
    { label: 'Mới tạo', done: true },
    { label: 'Xem xét', done: ['Đang xem xét', 'Chấp nhận', 'Đang sửa chữa', 'Đã giải quyết', 'Đã đóng'].includes(claim.status) },
    { label: 'Chấp nhận', done: ['Chấp nhận', 'Đang sửa chữa', 'Đã giải quyết', 'Đã đóng'].includes(claim.status) },
    { label: 'Sửa chữa', done: ['Đang sửa chữa', 'Đã giải quyết', 'Đã đóng'].includes(claim.status) },
    { label: 'Giải quyết', done: ['Đã giải quyết', 'Đã đóng'].includes(claim.status) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> {claim.claimNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {claim.status !== 'Từ chối' && (
            <div className="flex items-center gap-0.5 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-0.5 shrink-0">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                    s.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>{i + 1}</div>
                  <span className={`text-[10px] ${s.done ? '' : 'text-muted-foreground'}`}>{s.label}</span>
                  {i < steps.length - 1 && <div className={`w-4 h-0.5 ${s.done ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          )}
          {claim.status === 'Từ chối' && <Badge variant="destructive">Đã từ chối</Badge>}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sản phẩm', value: claim.productName },
              { label: 'Cửa hàng', value: getWarrantyStoreName(claim) },
              { label: 'Loại', value: claim.claimType },
              { label: 'Ngày gửi', value: new Date(claim.createdAt).toLocaleDateString('vi-VN') },
            ].map(item => (
              <div key={item.label} className="p-2.5 rounded-lg bg-muted/20">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <p className="text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <span className="text-xs text-muted-foreground">Mô tả vấn đề</span>
            <p className="text-sm mt-1">{claim.issueDescription}</p>
          </div>
          {claim.resolution && (
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20">
              <span className="text-xs text-blue-600 dark:text-blue-400" style={{ fontFamily: 'var(--font-heading)' }}>Phản hồi trung tâm bảo hành</span>
              <p className="text-sm text-muted-foreground mt-1">{claim.resolution}</p>
            </div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════
export function BuyerWarrantyPage() {
  const { user } = useAuth();
  const buyerId = user?.id || 'buyer-001';

  const [warranties, setWarranties] = useState<WarrantyRow[]>([]);
  const [wTotal, setWTotal] = useState(0);
  const [wLoading, setWLoading] = useState(true);
  const [wPagination, setWPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [wSort, setWSort] = useState<SortParams>({ field: 'endDate', direction: 'asc' });
  const [wFilters, setWFilters] = useState<ActiveFilter[]>([]);
  const [wSearch, setWSearch] = useState('');
  const [selectedW, setSelectedW] = useState<WarrantyRow | null>(null);
  const [showWDetail, setShowWDetail] = useState(false);

  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [cTotal, setCTotal] = useState(0);
  const [cLoading, setCLoading] = useState(true);
  const [cPagination, setCPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [cSort, setCSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [cFilters, setCFilters] = useState<ActiveFilter[]>([]);
  const [cSearch, setCSearch] = useState('');
  const [selectedC, setSelectedC] = useState<WarrantyClaim | null>(null);
  const [showCDetail, setShowCDetail] = useState(false);

  const [showCreateClaim, setShowCreateClaim] = useState(false);
  const [stats, setStats] = useState<{ total: number; active: number; expiringSoon: number; expired: number; cancelled: number } | null>(null);
  const [claimStats, setClaimStats] = useState<{ total: number; newCount: number; reviewing: number; resolved: number; avgResolutionDays: number } | null>(null);

  const fetchWarranties = useCallback(async () => {
    setWLoading(true);
    try { const res = await warrantyApi.getByBuyer(buyerId, wPagination, wSort, wFilters, wSearch); setWarranties(res.data); setWTotal(res.total); }
    finally { setWLoading(false); }
  }, [buyerId, wPagination, wSort, wFilters, wSearch]);

  const fetchClaims = useCallback(async () => {
    setCLoading(true);
    try { const res = await warrantyClaimApi.getByBuyer(buyerId, cPagination, cSort, cFilters, cSearch); setClaims(res.data); setCTotal(res.total); }
    finally { setCLoading(false); }
  }, [buyerId, cPagination, cSort, cFilters, cSearch]);

  const fetchStats = useCallback(async () => {
    const [ws, cs] = await Promise.all([warrantyApi.getStats(buyerId, 'buyer'), warrantyClaimApi.getStats(buyerId, 'buyer')]);
    setStats(ws); setClaimStats(cs);
  }, [buyerId]);

  useEffect(() => { fetchWarranties(); }, [fetchWarranties]);
  useEffect(() => { fetchClaims(); }, [fetchClaims]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Bảo hành' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Shield className="h-6 w-6 text-primary" /> Quản lý bảo hành
          </h1>
          <p className="text-muted-foreground mt-1">Theo dõi bảo hành và khiếu nại</p>
        </div>
        <Button onClick={() => setShowCreateClaim(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Yêu cầu bảo hành
        </Button>
      </div>

      {/* P3.28: Expiring alert */}
      <ExpiringAlert warranties={warranties} />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Tổng BH', value: stats.total, icon: Shield, variant: 'primary' as const },
            { label: 'Còn hạn', value: stats.active, icon: CheckCircle2, variant: 'success' as const },
            { label: 'Sắp hết', value: stats.expiringSoon, icon: AlertTriangle, variant: 'warning' as const },
            { label: 'Hết hạn', value: stats.expired, icon: Clock, variant: 'neutral' as const },
            { label: 'Khiếu nại', value: claimStats?.total ?? 0, icon: Wrench, variant: 'danger' as const },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-2.5">
                <IconWrapper icon={s.icon} variant={s.variant} size="sm" />
                <div>
                  <p className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="warranties">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="warranties" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> Bảo hành ({wTotal})
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4" /> Khiếu nại ({cTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warranties" className="space-y-4 mt-4">
          <FilterBar
            filters={warrantyFilters} activeFilters={wFilters}
            onFilterChange={f => { setWFilters(f); setWPagination(p => ({ ...p, page: 1 })); }}
            searchValue={wSearch}
            onSearchChange={v => { setWSearch(v); setWPagination(p => ({ ...p, page: 1 })); }}
            searchPlaceholder="Tìm mã BH, sản phẩm..."
          />

          {/* P3.27/P3.30: Mobile warranty cards */}
          <div className="sm:hidden grid grid-cols-1 gap-3">
            {warranties.map(w => (
              <WarrantyCard key={w.id} warranty={w} onClick={() => { setSelectedW(w); setShowWDetail(true); }} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <DataTable<WarrantyRow>
              data={warranties} columns={warrantyColumns} totalItems={wTotal}
              pagination={wPagination} sort={wSort}
              onPaginationChange={setWPagination} onSortChange={setWSort}
              getId={w => w.id} loading={wLoading}
              onRowClick={w => { setSelectedW(w); setShowWDetail(true); }}
              renderActions={w => (
                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedW(w); setShowWDetail(true); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4 mt-4">
          <FilterBar
            filters={claimFilters} activeFilters={cFilters}
            onFilterChange={f => { setCFilters(f); setCPagination(p => ({ ...p, page: 1 })); }}
            searchValue={cSearch}
            onSearchChange={v => { setCSearch(v); setCPagination(p => ({ ...p, page: 1 })); }}
            searchPlaceholder="Tìm mã KN, sản phẩm..."
          />
          <DataTable<WarrantyClaim>
            data={claims} columns={claimColumns} totalItems={cTotal}
            pagination={cPagination} sort={cSort}
            onPaginationChange={setCPagination} onSortChange={setCSort}
            getId={c => c.id} loading={cLoading}
            onRowClick={c => { setSelectedC(c); setShowCDetail(true); }}
            renderActions={c => (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedC(c); setShowCDetail(true); }}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <WarrantyDetailDialog warranty={selectedW} claims={claims} open={showWDetail} onOpenChange={setShowWDetail} />
      <ClaimDetailDialog claim={selectedC} open={showCDetail} onOpenChange={setShowCDetail} />
      <MultiStepClaimDialog open={showCreateClaim} onOpenChange={setShowCreateClaim} warranties={warranties}
        onCreated={() => { fetchClaims(); fetchStats(); }} />
    </div>
  );
}
