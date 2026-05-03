// ============================================================
// Hồ sơ Buyer — 4 tab: Thông tin / Địa chỉ / Bảo mật / Thống kê
// Multi-address CRUD, 2FA, avatar, chart chi tiêu
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  User, MapPin, Lock, ShoppingBag, Star, MessageSquare,
  Save, Eye, EyeOff, AlertCircle, Check, Package, Plus, Trash2,
  Edit2, BarChart3, Shield, ShieldCheck, Upload, Building2,
  Camera, CheckCircle2, Circle, Mail, Phone, CreditCard,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { useAuth } from '../../context/AuthContext';
import { addressApi } from '../../services/api';
import type { ShippingAddress } from '../../types';
import { toast } from 'sonner';

const fmtShort = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr` : n.toLocaleString();

interface ProfileForm {
  fullName: string; email: string; phone: string;
  company: string; position: string; taxId: string;
  address: string; city: string; district: string;
  bio: string; avatarUrl: string;
}
type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

const emptyAddr: Omit<ShippingAddress, 'id'> = {
  userId: '', label: '', fullName: '', phone: '', address: '',
  ward: '', district: '', city: '', country: 'Việt Nam', isDefault: false, notes: '',
};

// ====== Profile Completion ======
function calcProfileCompletion(form: ProfileForm, twoFa: boolean, addressCount: number): { percent: number; items: { label: string; done: boolean }[] } {
  const items = [
    { label: 'Họ tên', done: !!form.fullName.trim() },
    { label: 'Email', done: !!form.email.trim() },
    { label: 'Số điện thoại', done: !!form.phone.trim() },
    { label: 'Công ty', done: !!form.company.trim() },
    { label: 'Chức vụ', done: !!form.position.trim() },
    { label: 'Mã số thuế', done: !!form.taxId.trim() },
    { label: 'Giới thiệu', done: !!form.bio.trim() },
    { label: 'Xác thực 2FA', done: twoFa },
    { label: 'Địa chỉ giao hàng', done: addressCount > 0 },
    { label: 'Ảnh đại diện', done: !!form.avatarUrl },
  ];
  const doneCount = items.filter(i => i.done).length;
  return { percent: Math.round((doneCount / items.length) * 100), items };
}

// ====== Verification Steps ======
function VerificationSteps() {
  const steps = [
    { label: 'Email', icon: Mail, verified: true, description: 'Đã xác minh' },
    { label: 'Số điện thoại', icon: Phone, verified: true, description: 'Đã xác minh' },
    { label: 'CCCD/CMND', icon: CreditCard, verified: false, description: 'Chưa xác minh' },
    { label: 'Công ty', icon: Building2, verified: false, description: 'Chưa xác minh' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Xác minh tài khoản
        </CardTitle>
        <CardDescription>Xác minh tài khoản để tăng uy tín và mở khoá tính năng nâng cao</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-0">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.verified
                    ? 'bg-green-100 border-green-500 text-green-600'
                    : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                }`}>
                  {step.verified ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <p className="text-xs truncate">{step.label}</p>
                  <p className={`text-[10px] ${step.verified ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                </div>
                {!step.verified && (
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => toast.info(`Xác minh ${step.label} (giả lập)`)}>
                    Xác minh
                  </Button>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-full mx-1 mt-[-24px] ${
                  step.verified ? 'bg-green-500' : 'bg-muted-foreground/20'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ====== Address Dialog ======
function AddressDialog({ open, onClose, addr, userId, onSave }: {
  open: boolean; onClose: () => void;
  addr: ShippingAddress | null; userId: string;
  onSave: () => void;
}) {
  const isEdit = !!addr;
  const [form, setForm] = useState({ ...emptyAddr, userId });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (addr) { const { id, ...rest } = addr; setForm(rest); }
    else setForm({ ...emptyAddr, userId });
    setErrors({});
  }, [addr, userId, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.label.trim()) e.label = 'Nhãn bắt buộc';
    if (!form.fullName.trim()) e.fullName = 'Họ tên bắt buộc';
    if (!form.phone.trim()) e.phone = 'SĐT bắt buộc';
    else if (!/^0\d{9}$/.test(form.phone)) e.phone = 'SĐT không hợp lệ';
    if (!form.address.trim()) e.address = 'Địa chỉ bắt buộc';
    if (!form.city.trim()) e.city = 'Thành phố bắt buộc';
    if (!form.district.trim()) e.district = 'Quận/Huyện bắt buộc';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && addr) {
        await addressApi.update(addr.id, form);
        toast.success('Đã cập nhật địa chỉ');
      } else {
        await addressApi.create(form);
        toast.success('Đã thêm địa chỉ');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi');
    } finally { setSaving(false); }
  };

  const u = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới vào danh sách'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Nhãn *</Label>
              <Select value={form.label} onValueChange={v => u('label', v)}>
                <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                <SelectContent>
                  {['Văn phòng', 'Kho hàng', 'Nhà riêng', 'Chi nhánh', 'Khác'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.label && <p className="text-destructive text-xs">{errors.label}</p>}
            </div>
            <div className="grid gap-1">
              <Label>Họ tên người nhận *</Label>
              <Input value={form.fullName} onChange={e => u('fullName', e.target.value)} />
              {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Số điện thoại *</Label>
            <Input value={form.phone} onChange={e => u('phone', e.target.value)} />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
          </div>
          <div className="grid gap-1">
            <Label>Địa chỉ *</Label>
            <Input value={form.address} onChange={e => u('address', e.target.value)} placeholder="Số nhà, đường..." />
            {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="grid gap-1"><Label>Phường/Xã</Label><Input value={form.ward} onChange={e => u('ward', e.target.value)} /></div>
            <div className="grid gap-1"><Label>Quận/Huyện *</Label><Input value={form.district} onChange={e => u('district', e.target.value)} />{errors.district && <p className="text-destructive text-xs">{errors.district}</p>}</div>
            <div className="grid gap-1"><Label>Tỉnh/TP *</Label><Input value={form.city} onChange={e => u('city', e.target.value)} />{errors.city && <p className="text-destructive text-xs">{errors.city}</p>}</div>
          </div>
          <div className="grid gap-1">
            <Label>Ghi chú</Label>
            <Input value={form.notes ?? ''} onChange={e => u('notes', e.target.value)} placeholder="Gọi trước 30 phút..." />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.isDefault} onCheckedChange={v => u('isDefault', v)} />
            <Label>Đặt làm địa chỉ mặc định</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ====== Main ======
export function BuyerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>({
    fullName: user?.fullName ?? '', email: user?.email ?? '',
    phone: '0901234567', company: user?.companyName ?? '',
    position: 'Trưởng phòng thu mua', taxId: '0312345678',
    address: '123 Nguyễn Huệ, Quận 1', city: 'TP. Hồ Chí Minh',
    district: 'Quận 1', bio: 'Doanh nghiệp nhỏ chuyên nhập khẩu linh kiện điện tử.',
    avatarUrl: '',
  });
  const [originalForm] = useState<ProfileForm>({ ...form });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingPw, setSavingPw] = useState(false);
  const [twoFa, setTwoFa] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [editAddr, setEditAddr] = useState<ShippingAddress | null>(null);

  const userId = user?.id ?? 'user-001';

  const fetchAddresses = useCallback(async () => {
    const data = await addressApi.getByUser(userId);
    setAddresses(data);
  }, [userId]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(originalForm), [form, originalForm]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: ProfileErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập SĐT';
    else if (!/^0\d{9}$/.test(form.phone)) e.phone = 'SĐT không hợp lệ';
    if (form.taxId && !/^[0-9]{10}$|^[0-9]{13}$/.test(form.taxId)) e.taxId = 'MST phải 10 hoặc 13 số';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await new Promise(r => setTimeout(r, 400)); toast.success('Đã cập nhật hồ sơ'); } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    const e: Record<string, string> = {};
    if (!currentPw) e.currentPw = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPw) e.newPw = 'Vui lòng nhập mật khẩu mới';
    else if (newPw.length < 6) e.newPw = 'Tối thiểu 6 ký tự';
    if (newPw !== confirmPw) e.confirmPw = 'Không khớp';
    setPwErrors(e);
    if (Object.keys(e).length > 0) return;
    setSavingPw(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      toast.success('Đã đổi mật khẩu');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } finally { setSavingPw(false); }
  };

  // Address handlers
  const handleDeleteAddr = async (id: string) => {
    await addressApi.delete(id);
    toast.success('Đã xoá địa chỉ');
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await addressApi.setDefault(id);
    toast.success('Đã đặt mặc định');
    fetchAddresses();
  };

  // Stats mock
  const stats = [
    { label: 'Tổng đơn hàng', value: 12, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'SP đã mua', value: 45, icon: Package, color: 'text-purple-500' },
    { label: 'NCC đã mua', value: 6, icon: Building2, color: 'text-teal-500' },
    { label: 'Đánh giá', value: 8, icon: Star, color: 'text-yellow-500' },
  ];
  const monthlySpend = useMemo(() =>
    ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map(m => ({
      month: m, amount: Math.floor(5 + Math.random() * 80),
    })), []);
  const totalSpend = monthlySpend.reduce((s, d) => s + d.amount, 0);
  const avgOrder = 12 > 0 ? Math.round((totalSpend * 1000000) / 12) : 0;

  // Profile completion
  const completion = useMemo(() => calcProfileCompletion(form, twoFa, addresses.length), [form, twoFa, addresses.length]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ' }]} />

      {/* Cover + Avatar */}
      <Card className="overflow-hidden">
        {/* Cover photo area */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/80 via-primary/60 to-blue-500/70 relative">
          <button
            className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs transition-colors"
            onClick={() => toast.info('Chức năng đổi ảnh bìa (giả lập)')}
          >
            <Camera className="h-3.5 w-3.5" /> Đổi ảnh bìa
          </button>
        </div>
        <CardContent className="relative pb-4">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10">
            <div className="relative group shrink-0">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarFallback className="text-xl bg-primary/10">{getInitials(user?.fullName ?? 'U')}</AvatarFallback>
              </Avatar>
              <button
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={() => toast.info('Chức năng upload avatar (giả lập)')}
              >
                <Upload className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="truncate">{user?.fullName}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <Badge variant="secondary">{user?.role}</Badge>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Đã xác minh
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile completion bar */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm">Hoàn thiện hồ sơ</span>
              <span className={`text-sm ${completion.percent >= 80 ? 'text-green-600' : completion.percent >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {completion.percent}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completion.percent >= 80 ? 'bg-green-500' : completion.percent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${completion.percent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {completion.items.filter(i => !i.done).map(item => (
                <Badge key={item.label} variant="outline" className="text-xs text-muted-foreground">
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Xác minh tài khoản — P3.36 */}
      <VerificationSteps />

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="info"><User className="mr-1 h-4 w-4" /> Thông tin</TabsTrigger>
          <TabsTrigger value="address"><MapPin className="mr-1 h-4 w-4" /> Địa chỉ</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-1 h-4 w-4" /> Bảo mật</TabsTrigger>
          <TabsTrigger value="stats"><BarChart3 className="mr-1 h-4 w-4" /> Thống kê</TabsTrigger>
        </TabsList>

        {/* ===== Tab Thông tin ===== */}
        <TabsContent value="info" className="space-y-4">
          {hasChanges && <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Bạn có thay đổi chưa lưu.</AlertDescription></Alert>}
          <Card>
            <CardHeader><CardTitle>Thông tin cá nhân</CardTitle><CardDescription>Cập nhật thông tin cá nhân và doanh nghiệp</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Họ và tên *</Label>
                  <Input value={form.fullName} onChange={e => updateField('fullName', e.target.value)} className={errors.fullName ? 'border-destructive' : ''} />
                  {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                  {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Số điện thoại *</Label>
                  <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} className={errors.phone ? 'border-destructive' : ''} />
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Công ty</Label>
                  <Input value={form.company} onChange={e => updateField('company', e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Chức vụ</Label>
                  <Input value={form.position} onChange={e => updateField('position', e.target.value)} placeholder="VD: Trưởng phòng thu mua" />
                </div>
                <div className="grid gap-2">
                  <Label>Mã số thuế</Label>
                  <Input value={form.taxId} onChange={e => updateField('taxId', e.target.value)} placeholder="10 hoặc 13 số" />
                  {errors.taxId && <p className="text-destructive text-xs">{errors.taxId}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Giới thiệu</Label>
                <Textarea value={form.bio} onChange={e => updateField('bio', e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving || !hasChanges}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Tab Địa chỉ ===== */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sổ địa chỉ</CardTitle>
                <CardDescription>Tối đa 10 địa chỉ · {addresses.length}/10</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditAddr(null); setAddrDialogOpen(true); }} disabled={addresses.length >= 10}>
                <Plus className="mr-1 h-4 w-4" /> Thêm
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có địa chỉ nào</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className={`border rounded-lg p-4 relative ${addr.isDefault ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{addr.label}</span>
                          {addr.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                        </div>
                        <p>{addr.fullName} — {addr.phone}</p>
                        <p className="text-muted-foreground">{addr.address}{addr.ward ? `, ${addr.ward}` : ''}</p>
                        <p className="text-muted-foreground">{addr.district}, {addr.city}</p>
                        {addr.notes && <p className="text-muted-foreground italic">{addr.notes}</p>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => { setEditAddr(addr); setAddrDialogOpen(true); }}>
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> Sửa
                        </Button>
                        {!addr.isDefault && (
                          <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)}>Mặc định</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteAddr(addr.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <AddressDialog open={addrDialogOpen} onClose={() => setAddrDialogOpen(false)} addr={editAddr} userId={userId} onSave={fetchAddresses} />
        </TabsContent>

        {/* ===== Tab Bảo mật ===== */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Đổi mật khẩu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Mật khẩu hiện tại *</Label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} value={currentPw}
                    onChange={e => { setCurrentPw(e.target.value); setPwErrors(p => ({ ...p, currentPw: '' })); }}
                    className={`pr-10 ${pwErrors.currentPw ? 'border-destructive' : ''}`} autoComplete="current-password" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwErrors.currentPw && <p className="text-destructive text-xs">{pwErrors.currentPw}</p>}
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label>Mật khẩu mới *</Label>
                <Input type={showPw ? 'text' : 'password'} value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwErrors(p => ({ ...p, newPw: '' })); }}
                  className={pwErrors.newPw ? 'border-destructive' : ''} autoComplete="new-password" />
                {pwErrors.newPw && <p className="text-destructive text-xs">{pwErrors.newPw}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Xác nhận mật khẩu *</Label>
                <Input type={showPw ? 'text' : 'password'} value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwErrors(p => ({ ...p, confirmPw: '' })); }}
                  className={pwErrors.confirmPw ? 'border-destructive' : ''} autoComplete="new-password" />
                {pwErrors.confirmPw && <p className="text-destructive text-xs">{pwErrors.confirmPw}</p>}
                {confirmPw && newPw === confirmPw && <p className="text-green-600 flex items-center gap-1 text-xs"><Check className="h-3 w-3" /> Mật khẩu khớp</p>}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={savingPw}>
                  <Lock className="mr-2 h-4 w-4" /> {savingPw ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Xác thực 2 lớp (2FA)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p>{twoFa ? 'Đang bật' : 'Đang tắt'}</p>
                  <p className="text-muted-foreground">Bảo vệ tài khoản bằng mã OTP khi đăng nhập</p>
                </div>
                <div className="flex items-center gap-2">
                  {twoFa && <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> Đã bật</Badge>}
                  <Switch checked={twoFa} onCheckedChange={v => { setTwoFa(v); toast.success(v ? 'Đã bật 2FA (giả lập)' : 'Đã tắt 2FA'); }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification prefs */}
          <Card>
            <CardHeader><CardTitle>Tuỳ chọn thông báo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Cập nhật đơn hàng', desc: 'Khi đơn hàng thay đổi trạng thái', key: 'order' },
                { label: 'Sản phẩm mới', desc: 'Khi có sản phẩm phù hợp', key: 'product' },
                { label: 'Khuyến mãi', desc: 'Chương trình khuyến mãi', key: 'promo' },
                { label: 'Tin nhắn', desc: 'Tin nhắn từ NCC', key: 'message' },
              ].map((item, i) => (
                <NotificationPrefItem key={item.key} item={item} isLast={i === 3} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Tab Thống kê ===== */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-8 w-8 ${s.color} shrink-0`} />
                  <div><p className="text-2xl">{s.value}</p><p className="text-muted-foreground text-xs">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-2xl text-blue-500">{fmtShort(totalSpend * 1000000)} ₫</p><p className="text-muted-foreground">Tổng chi tiêu</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl text-green-500">{fmtShort(avgOrder)} ₫</p><p className="text-muted-foreground">TB/đơn hàng</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl text-purple-500">{stats[2].value}</p><p className="text-muted-foreground">NCC đã giao dịch</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Chi tiêu theo tháng (triệu ₫)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`${v} tr ₫`, 'Chi tiêu']} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/orders')}><ShoppingBag className="mr-2 h-4 w-4" /> Xem đơn hàng</Button>
            <Button variant="outline" onClick={() => navigate('/chat')}><MessageSquare className="mr-2 h-4 w-4" /> Tin nhắn</Button>
            <Button variant="outline" onClick={() => navigate('/products')}><Package className="mr-2 h-4 w-4" /> Tiếp tục mua sắm</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Notification preference toggle item */
function NotificationPrefItem({ item, isLast }: { item: { label: string; desc: string; key: string }; isLast: boolean }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <>
      <div className="flex items-center justify-between">
        <div><p>{item.label}</p><p className="text-muted-foreground text-xs">{item.desc}</p></div>
        <Switch checked={enabled} onCheckedChange={v => { setEnabled(v); toast.success(v ? `Đã bật ${item.label}` : `Đã tắt ${item.label}`); }} />
      </div>
      {!isLast && <Separator />}
    </>
  );
}