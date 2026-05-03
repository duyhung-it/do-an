// ============================================================
// Hồ sơ NCC — 4 tab: Thông tin / Chứng chỉ / Thuế & Ngân hàng / Cấu hình
// Mức hoàn thiện hồ sơ, upload logo/cover, thuế/ngân hàng, cấu hình NCC
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import {
  ShieldCheck, AlertCircle, Save, RotateCcw, Plus, Trash2, Award, AlertTriangle,
  Building2, CreditCard, Settings, Globe, Users, Factory, CheckCircle2,
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { supplierApi, certificateSellerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Supplier, BusinessCertificate, CertificateType } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// ====== Types ======
type ProfileForm = {
  companyName: string; contactPerson: string; email: string; phone: string;
  address: string; city: string; description: string;
  website: string; yearsExperience: string; employees: string; productionCapacity: string;
  logoUrl: string; coverUrl: string;
};
type TaxForm = {
  legalName: string; taxId: string; registeredAddress: string; representative: string;
  bankName: string; accountNumber: string; branch: string; accountHolder: string;
  defaultVat: string;
};
type ConfigForm = {
  notifyNewOrder: boolean; notifyRfq: boolean; notifyPayment: boolean;
  currency: string; language: string; timezone: string;
  autoConfirmThreshold: string; defaultProcessingDays: string;
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-destructive flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3 shrink-0" />{error}</p>;
}

// ====== Profile Completion ======
function ProfileCompletion({ form, taxForm }: { form: ProfileForm; taxForm: TaxForm }) {
  const fields = [
    form.companyName, form.contactPerson, form.email, form.phone,
    form.address, form.city, form.description, form.website,
    form.yearsExperience, form.employees, form.productionCapacity,
    taxForm.legalName, taxForm.taxId, taxForm.bankName, taxForm.accountNumber,
  ];
  const filled = fields.filter(f => f.trim().length > 0).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">Mức độ hoàn thiện hồ sơ</span>
          <span className={pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}>{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
        </div>
        {pct < 100 && <p className="text-muted-foreground mt-1">Hoàn thành {filled}/{fields.length} trường để tối ưu hồ sơ</p>}
      </CardContent>
    </Card>
  );
}

// ====== Main ======
export function SellerProfile() {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Profile form
  const [form, setForm] = useState<ProfileForm>({
    companyName: '', contactPerson: '', email: '', phone: '',
    address: '', city: '', description: '',
    website: '', yearsExperience: '', employees: '', productionCapacity: '',
    logoUrl: '', coverUrl: '',
  });
  const [originalForm, setOriginalForm] = useState<ProfileForm | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  // Tax & Bank form
  const [taxForm, setTaxForm] = useState<TaxForm>({
    legalName: '', taxId: '', registeredAddress: '', representative: '',
    bankName: '', accountNumber: '', branch: '', accountHolder: '',
    defaultVat: '10',
  });
  const [originalTax, setOriginalTax] = useState<TaxForm | null>(null);
  const [taxErrors, setTaxErrors] = useState<Partial<Record<keyof TaxForm, string>>>({});
  const [taxConfigured, setTaxConfigured] = useState(false);

  // Config form
  const [config, setConfig] = useState<ConfigForm>({
    notifyNewOrder: true, notifyRfq: true, notifyPayment: true,
    currency: 'VND', language: 'vi', timezone: 'Asia/Ho_Chi_Minh',
    autoConfirmThreshold: '50', defaultProcessingDays: '3',
  });
  const [originalConfig, setOriginalConfig] = useState<ConfigForm | null>(null);

  const hasProfileChanges = useMemo(() => originalForm && JSON.stringify(form) !== JSON.stringify(originalForm), [form, originalForm]);
  const hasTaxChanges = useMemo(() => originalTax && JSON.stringify(taxForm) !== JSON.stringify(originalTax), [taxForm, originalTax]);
  const hasConfigChanges = useMemo(() => originalConfig && JSON.stringify(config) !== JSON.stringify(originalConfig), [config, originalConfig]);

  useEffect(() => {
    if (user?.supplierId) {
      supplierApi.getById(user.supplierId).then(s => {
        if (s) {
          setSupplier(s);
          const fd: ProfileForm = {
            companyName: s.companyName, contactPerson: s.contactPerson,
            email: s.email, phone: s.phone, address: s.address, city: s.city,
            description: s.description,
            website: s.website || '',
            yearsExperience: s.yearsExperience ? String(s.yearsExperience) : String(new Date().getFullYear() - s.yearEstablished),
            employees: s.employees ? String(s.employees) : '50-200',
            productionCapacity: s.productionCapacity || '',
            logoUrl: s.logoUrl, coverUrl: s.coverUrl,
          };
          setForm(fd); setOriginalForm(fd);
          // DB-B.18: Load tax/bank từ supplier mới
          const td: TaxForm = {
            legalName: s.companyName,
            taxId: s.taxId || '0312345678',
            registeredAddress: s.address,
            representative: s.representative || s.contactPerson,
            bankName: s.bankName || 'Vietcombank',
            accountNumber: s.bankAccount || '0012345678901',
            branch: 'TP.HCM',
            accountHolder: s.representative || s.contactPerson,
            defaultVat: '10',
          };
          setTaxForm(td); setOriginalTax(td); setTaxConfigured(true);
          setOriginalConfig({ ...config });
        }
        setLoading(false);
      });
    } else { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.supplierId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasProfileChanges || hasTaxChanges || hasConfigChanges) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasProfileChanges, hasTaxChanges, hasConfigChanges]);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const validateProfile = (): boolean => {
    const e: Partial<Record<keyof ProfileForm, string>> = {};
    if (!form.companyName.trim()) e.companyName = 'Vui lòng nhập tên doanh nghiệp';
    if (!form.contactPerson.trim()) e.contactPerson = 'Vui lòng nhập người liên hệ';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập SĐT';
    else if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'SĐT không hợp lệ';
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) { toast.error('Kiểm tra lại thông tin'); return; }
    setSaving(true);
    try { await new Promise(r => setTimeout(r, 400)); setOriginalForm({ ...form }); toast.success('Đã cập nhật hồ sơ'); } finally { setSaving(false); }
  };

  const validateTax = (): boolean => {
    const e: Partial<Record<keyof TaxForm, string>> = {};
    if (!taxForm.legalName.trim()) e.legalName = 'Bắt buộc';
    if (!taxForm.taxId.trim()) e.taxId = 'Bắt buộc';
    else if (!/^[0-9]{10}$|^[0-9]{13}$/.test(taxForm.taxId)) e.taxId = 'MST phải 10 hoặc 13 số';
    if (taxForm.accountNumber && !/^[0-9]{8,20}$/.test(taxForm.accountNumber)) e.accountNumber = 'Số TK 8-20 số';
    setTaxErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveTax = async () => {
    if (!validateTax()) { toast.error('Kiểm tra lại thông tin thuế'); return; }
    setSaving(true);
    try { await new Promise(r => setTimeout(r, 400)); setOriginalTax({ ...taxForm }); setTaxConfigured(true); toast.success('Đã cập nhật thuế & ngân hàng'); } finally { setSaving(false); }
  };

  const saveConfig = async () => {
    setSaving(true);
    try { await new Promise(r => setTimeout(r, 400)); setOriginalConfig({ ...config }); toast.success('Đã lưu cấu hình'); } finally { setSaving(false); }
  };

  if (loading) return <DetailSkeleton />;
  if (!supplier) return <div className="text-center py-16"><p className="text-muted-foreground">Không tìm thấy thông tin nhà cung cấp.</p></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Hồ sơ' }]} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Hồ sơ doanh nghiệp</h1>
          <p className="text-muted-foreground">Quản lý thông tin, chứng chỉ, thuế và cấu hình</p>
        </div>
        {taxConfigured && (
          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Đã cấu hình thuế</Badge>
        )}
      </div>

      <ProfileCompletion form={form} taxForm={taxForm} />

      {/* Cover + Logo */}
      <Card>
        <div className="h-40 rounded-t-lg overflow-hidden relative">
          <ImageWithFallback src={form.coverUrl || supplier.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Button variant="secondary" size="sm">Đổi ảnh bìa</Button>
          </div>
        </div>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-background -mt-10 shrink-0">
            <ImageWithFallback src={form.logoUrl || supplier.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="truncate">{supplier.companyName}</h3>
              {supplier.isVerified && <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> Đã xác minh</Badge>}
            </div>
            <p className="text-muted-foreground">{supplier.city}, {supplier.country}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl text-primary">{supplier.productCount}</p><p className="text-muted-foreground">Sản phẩm</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl text-primary">{supplier.rating}</p><p className="text-muted-foreground">Đánh giá</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl text-primary">{supplier.reviewCount}</p><p className="text-muted-foreground">Nhận xét</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-1"><Building2 className="h-4 w-4" /> Thông tin</TabsTrigger>
          <TabsTrigger value="certs" className="flex items-center gap-1"><Award className="h-4 w-4" /> Chứng chỉ</TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-1"><CreditCard className="h-4 w-4" /> Thuế & NH</TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1"><Settings className="h-4 w-4" /> Cấu hình</TabsTrigger>
        </TabsList>

        {/* ===== Tab Thông tin ===== */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Thông tin cơ bản</CardTitle>
                {hasProfileChanges && (
                  <Button variant="outline" size="sm" onClick={() => { if (originalForm) { setForm({ ...originalForm }); setErrors({}); toast.info('Đã hoàn tác'); } }}>
                    <RotateCcw className="mr-1 h-4 w-4" /> Hoàn tác
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasProfileChanges && (
                <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Bạn có thay đổi chưa lưu.</AlertDescription></Alert>
              )}

              <div className="grid gap-2">
                <Label>Tên doanh nghiệp *</Label>
                <Input value={form.companyName} onChange={e => updateField('companyName', e.target.value)} className={errors.companyName ? 'border-destructive' : ''} />
                <FieldError error={errors.companyName} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Người liên hệ *</Label>
                  <Input value={form.contactPerson} onChange={e => updateField('contactPerson', e.target.value)} className={errors.contactPerson ? 'border-destructive' : ''} />
                  <FieldError error={errors.contactPerson} />
                </div>
                <div className="grid gap-2">
                  <Label>Số điện thoại *</Label>
                  <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} className={errors.phone ? 'border-destructive' : ''} />
                  <FieldError error={errors.phone} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                <FieldError error={errors.email} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Địa chỉ *</Label><Input value={form.address} onChange={e => updateField('address', e.target.value)} className={errors.address ? 'border-destructive' : ''} /><FieldError error={errors.address} /></div>
                <div className="grid gap-2"><Label>Thành phố</Label><Input value={form.city} onChange={e => updateField('city', e.target.value)} /></div>
              </div>

              {/* New fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Website</Label>
                  <Input value={form.website} onChange={e => updateField('website', e.target.value)} placeholder="https://..." />
                </div>
                <div className="grid gap-2">
                  <Label>Số năm kinh nghiệm</Label>
                  <Input value={form.yearsExperience} onChange={e => updateField('yearsExperience', e.target.value)} placeholder="VD: 10" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Quy mô nhân sự</Label>
                  <Select value={form.employees} onValueChange={v => updateField('employees', v)}>
                    <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                    <SelectContent>
                      {['1-10', '11-50', '50-200', '200-500', '500+'].map(v => <SelectItem key={v} value={v}>{v} người</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1"><Factory className="h-3.5 w-3.5" /> Năng lực sản xuất</Label>
                  <Input value={form.productionCapacity} onChange={e => updateField('productionCapacity', e.target.value)} placeholder="VD: 10.000 SP/tháng" />
                </div>
              </div>

              {/* Logo / Cover URLs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>URL Logo</Label><Input value={form.logoUrl} onChange={e => updateField('logoUrl', e.target.value)} placeholder="https://..." /></div>
                <div className="grid gap-2"><Label>URL Ảnh bìa</Label><Input value={form.coverUrl} onChange={e => updateField('coverUrl', e.target.value)} placeholder="https://..." /></div>
              </div>

              <div className="grid gap-2">
                <Label>Giới thiệu doanh nghiệp</Label>
                <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={5} placeholder="Mô tả chi tiết về doanh nghiệp, lĩnh vực kinh doanh, thế mạnh..." />
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={saveProfile} disabled={saving || !hasProfileChanges}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Tab Chứng chỉ ===== */}
        <TabsContent value="certs">
          <CertificateSection supplierId={supplier.id} supplierName={supplier.companyName} />
        </TabsContent>

        {/* ===== Tab Thuế & Ngân hàng ===== */}
        <TabsContent value="tax">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Thuế & Ngân hàng</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {hasTaxChanges && (
                <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Bạn có thay đổi chưa lưu.</AlertDescription></Alert>
              )}

              {/* Thuế */}
              <div className="space-y-4">
                <h3 className="border-b pb-2">Thông tin thuế</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tên công ty (pháp lý) *</Label>
                    <Input value={taxForm.legalName} onChange={e => setTaxForm(p => ({ ...p, legalName: e.target.value }))} />
                    <FieldError error={taxErrors.legalName} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mã số thuế *</Label>
                    <Input value={taxForm.taxId} onChange={e => setTaxForm(p => ({ ...p, taxId: e.target.value }))} placeholder="10 hoặc 13 số" />
                    <FieldError error={taxErrors.taxId} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Địa chỉ đăng ký</Label>
                  <Input value={taxForm.registeredAddress} onChange={e => setTaxForm(p => ({ ...p, registeredAddress: e.target.value }))} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Người đại diện</Label>
                    <Input value={taxForm.representative} onChange={e => setTaxForm(p => ({ ...p, representative: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Thuế suất mặc định (GTGT)</Label>
                    <Select value={taxForm.defaultVat} onValueChange={v => setTaxForm(p => ({ ...p, defaultVat: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10% (nội địa)</SelectItem>
                        <SelectItem value="8">8% (ưu đãi)</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="0">0% (xuất khẩu)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Ngân hàng */}
              <div className="space-y-4">
                <h3 className="border-b pb-2">Thông tin ngân hàng</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Ngân hàng</Label>
                    <Select value={taxForm.bankName} onValueChange={v => setTaxForm(p => ({ ...p, bankName: v }))}>
                      <SelectTrigger><SelectValue placeholder="Chọn ngân hàng" /></SelectTrigger>
                      <SelectContent>
                        {['Vietcombank', 'VietinBank', 'BIDV', 'Techcombank', 'MB Bank', 'ACB', 'Sacombank', 'TPBank', 'VPBank', 'HDBank'].map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Chi nhánh</Label>
                    <Input value={taxForm.branch} onChange={e => setTaxForm(p => ({ ...p, branch: e.target.value }))} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Số tài khoản</Label>
                    <Input value={taxForm.accountNumber} onChange={e => setTaxForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="8-20 số" />
                    <FieldError error={taxErrors.accountNumber} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Chủ tài khoản</Label>
                    <Input value={taxForm.accountHolder} onChange={e => setTaxForm(p => ({ ...p, accountHolder: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {hasTaxChanges && (
                  <Button variant="ghost" onClick={() => { if (originalTax) { setTaxForm({ ...originalTax }); setTaxErrors({}); } }}>Hoàn tác</Button>
                )}
                <Button onClick={saveTax} disabled={saving || !hasTaxChanges}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thuế & ngân hàng'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Tab Cấu hình ===== */}
        <TabsContent value="config">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Cấu hình NCC</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Thông báo email */}
              <div className="space-y-4">
                <h3 className="border-b pb-2">Thông báo email</h3>
                {[
                  { key: 'notifyNewOrder' as const, label: 'Đơn hàng mới', desc: 'Nhận email khi có đơn hàng mới' },
                  { key: 'notifyRfq' as const, label: 'Yêu cầu báo giá', desc: 'Nhận email khi có RFQ mới' },
                  { key: 'notifyPayment' as const, label: 'Thanh toán', desc: 'Nhận email khi có thanh toán hoặc quá hạn' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p>{item.label}</p>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={config[item.key]} onCheckedChange={v => setConfig(p => ({ ...p, [item.key]: v }))} />
                  </div>
                ))}
              </div>

              {/* Đơn vị & Ngôn ngữ */}
              <div className="space-y-4">
                <h3 className="border-b pb-2">Đơn vị & Ngôn ngữ</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Đơn vị tiền tệ</Label>
                    <Select value={config.currency} onValueChange={v => setConfig(p => ({ ...p, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Ngôn ngữ</Label>
                    <Select value={config.language} onValueChange={v => setConfig(p => ({ ...p, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem><SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Múi giờ</Label>
                    <Select value={config.timezone} onValueChange={v => setConfig(p => ({ ...p, timezone: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">UTC+7 (VN)</SelectItem><SelectItem value="Asia/Bangkok">UTC+7 (TH)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tự động xử lý */}
              <div className="space-y-4">
                <h3 className="border-b pb-2">Tự động xử lý</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tự động xác nhận đơn dưới (triệu ₫)</Label>
                    <Input type="number" value={config.autoConfirmThreshold} onChange={e => setConfig(p => ({ ...p, autoConfirmThreshold: e.target.value }))} />
                    <p className="text-muted-foreground">Đơn hàng dưới ngưỡng này sẽ tự động xác nhận, bỏ qua phê duyệt</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Thời gian xử lý mặc định (ngày)</Label>
                    <Input type="number" value={config.defaultProcessingDays} onChange={e => setConfig(p => ({ ...p, defaultProcessingDays: e.target.value }))} />
                    <p className="text-muted-foreground">Áp dụng khi tạo đơn hàng mới</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveConfig} disabled={saving || !hasConfigChanges}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Sub-component: Chứng chỉ doanh nghiệp
// ============================================================
const CERT_TYPES: CertificateType[] = ['Giấy phép kinh doanh', 'ISO 9001', 'ISO 14001', 'HACCP', 'CE', 'FDA', 'Khác'];

function CertificateSection({ supplierId, supplierName }: { supplierId: string; supplierName: string }) {
  const [certs, setCerts] = useState<BusinessCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: '' as CertificateType, name: '', issuedBy: '', issuedDate: '', expiryDate: '', documentUrl: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCerts = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    try { setCerts(await certificateSellerApi.getBySeller(supplierId)); } finally { setLoading(false); }
  }, [supplierId]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 86400000);
  const expiringSoon = certs.filter(c => c.status === 'Đã xác minh' && new Date(c.expiryDate) <= in30Days && new Date(c.expiryDate) > now);
  const expired = certs.filter(c => c.status === 'Hết hạn' || (c.status === 'Đã xác minh' && new Date(c.expiryDate) < now));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Tên chứng chỉ bắt buộc';
    if (!form.type) e.type = 'Chọn loại chứng chỉ';
    if (form.expiryDate && form.issuedDate && form.expiryDate <= form.issuedDate) e.expiryDate = 'Ngày hết hạn phải sau ngày cấp';
    if (form.documentUrl && !/^https?:\/\//.test(form.documentUrl)) e.documentUrl = 'URL không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    try {
      await certificateSellerApi.create({
        supplierId, supplierName, type: form.type, name: form.name,
        issuedBy: form.issuedBy, issuedDate: form.issuedDate,
        expiryDate: form.expiryDate, documentUrl: form.documentUrl || '/docs/placeholder.pdf',
      });
      toast.success('Đã nộp chứng chỉ');
      setShowAdd(false);
      setForm({ type: '' as CertificateType, name: '', issuedBy: '', issuedDate: '', expiryDate: '', documentUrl: '' });
      fetchCerts();
    } catch { toast.error('Lỗi khi nộp chứng chỉ'); }
  };

  const handleDelete = async (cert: BusinessCertificate) => {
    try { await certificateSellerApi.delete(cert.id); toast.success('Đã xoá chứng chỉ'); fetchCerts(); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Lỗi'); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Chứng chỉ doanh nghiệp</CardTitle>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="mr-1 h-4 w-4" /> Thêm</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {expired.length > 0 && (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{expired.length} chứng chỉ đã hết hạn — vui lòng cập nhật</AlertDescription></Alert>
        )}
        {expiringSoon.length > 0 && (
          <Alert><AlertTriangle className="h-4 w-4 text-amber-500" /><AlertDescription>{expiringSoon.length} chứng chỉ sắp hết hạn trong 30 ngày</AlertDescription></Alert>
        )}

        {loading ? (
          <p className="text-muted-foreground text-center py-4">Đang tải...</p>
        ) : certs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Chưa có chứng chỉ nào</p>
        ) : (
          <div className="space-y-3">
            {certs.map(cert => (
              <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{cert.name}</span>
                    <Badge variant="outline">{cert.type}</Badge>
                    <StatusBadge status={cert.status} />
                  </div>
                  <p className="text-muted-foreground mt-1">{cert.issuedBy} — Hạn: {cert.expiryDate}</p>
                </div>
                {['Chưa xác minh', 'Từ chối'].includes(cert.status) && (
                  <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => handleDelete(cert)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nộp chứng chỉ mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Loại chứng chỉ *</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as CertificateType }))}>
                <SelectTrigger><SelectValue placeholder="Chọn loại..." /></SelectTrigger>
                <SelectContent>{CERT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Tên chứng chỉ *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: ISO 9001:2015" />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Cơ quan cấp</Label>
              <Input value={form.issuedBy} onChange={e => setForm(f => ({ ...f, issuedBy: e.target.value }))} placeholder="VD: Bureau Veritas" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ngày cấp</Label>
                <Input type="date" value={form.issuedDate} onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Ngày hết hạn</Label>
                <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                {errors.expiryDate && <p className="text-destructive text-sm">{errors.expiryDate}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>URL tài liệu</Label>
              <Input value={form.documentUrl} onChange={e => setForm(f => ({ ...f, documentUrl: e.target.value }))} placeholder="https://..." />
              {errors.documentUrl && <p className="text-destructive text-sm">{errors.documentUrl}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Huỷ</Button>
            <Button onClick={handleAdd}><Plus className="mr-1 h-4 w-4" /> Nộp chứng chỉ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}