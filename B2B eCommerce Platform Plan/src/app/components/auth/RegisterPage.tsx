// ============================================================
// Trang đăng ký — Redesign UI-D Đợt 16
// D16.06–D16.07: Multi-step UI, password strength
// ============================================================

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, UserPlus, Check, X, ArrowLeft, ArrowRight, Chrome, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { RegisterData } from '../../types';

type FormErrors = Partial<Record<keyof RegisterData | 'confirmPassword', string>>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: 'Ít nhất 6 ký tự', passed: password.length >= 6 },
    { label: 'Chứa chữ thường (a-z)', passed: /[a-z]/.test(password) },
    { label: 'Chứa chữ hoa (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'Chứa số (0-9)', passed: /[0-9]/.test(password) },
    { label: 'Chứa ký tự đặc biệt (!@#$...)', passed: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.passed).length;

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: 'bg-gray-200' },
    1: { label: 'Rất yếu', color: 'bg-red-500' },
    2: { label: 'Yếu', color: 'bg-orange-500' },
    3: { label: 'Trung bình', color: 'bg-yellow-500' },
    4: { label: 'Mạnh', color: 'bg-green-500' },
    5: { label: 'Rất mạnh', color: 'bg-emerald-500' },
  };

  const level = levels[score] ?? levels[0];
  return { score, label: level.label, color: level.color, checks };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Độ mạnh: {strength.label}</span>
      </div>
      <div className="grid gap-1">
        {strength.checks.map(check => (
          <div key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.passed ? (
              <Check className="h-3 w-3 text-green-500 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <span className={check.passed ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// D16.06: Step definitions
const steps = ['Tài khoản', 'Thông tin', 'Xác nhận'];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<RegisterData & { confirmPassword: string }>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'Người mua',
    companyName: '',
    taxCode: '',     // DB-A.09
    address: '',     // DB-A.09
    city: '',        // DB-A.09
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (step: number): boolean => {
    const errs: FormErrors = {};

    if (step === 0) {
      if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
      if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
      else if (form.password.length < 6) errs.password = 'Mật khẩu phải ít nhất 6 ký tự';
      else {
        const strength = getPasswordStrength(form.password);
        if (strength.score < 3) errs.password = 'Mật khẩu quá yếu, cần ít nhất 3/5 tiêu chí';
      }
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (step === 1) {
      if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
      else if (form.fullName.length > 50) errs.fullName = 'Họ tên tối đa 50 ký tự';
      if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
      else if (!/^0\d{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
      // DB-A.09: Tên công ty bắt buộc cho cả Người mua & NCC
      if (!form.companyName?.trim()) {
        errs.companyName = 'Vui lòng nhập tên công ty / tổ chức';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(0) || !validateStep(1)) return;
    setLoading(true);
    try {
      const { confirmPassword: _, ...data } = form;
      const authUser = await register(data);
      toast.success('Đăng ký thành công!');
      const redirectTo = authUser.role === 'Nhà cung cấp' ? '/seller' : '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="hidden lg:flex items-center gap-2.5 mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <span className="text-white text-sm" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>B2B</span>
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>VietB2B</span>
          </Link>
        </div>
        <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
          Tạo tài khoản 🚀
        </h2>
        <p className="text-muted-foreground mt-1">Tham gia sàn TMĐT B2B hàng đầu Việt Nam</p>
      </div>

      {/* D16.06: Step indicator */}
      <div className="flex items-center justify-center gap-1">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div key={idx} className="flex items-center">
              {idx > 0 && (
                <div className={`h-0.5 w-8 sm:w-12 mx-1.5 transition-all duration-500 ${isDone ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-border'}`} />
              )}
              <div className="flex items-center gap-1.5">
                <div className={`
                  h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isActive ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-indigo-200' : ''}
                  ${isDone ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : ''}
                  ${!isActive && !isDone ? 'bg-muted text-muted-foreground' : ''}
                `}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: Account */}
      {currentStep === 0 && (
        <div className="space-y-4">
          {/* Social signup */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-10 gap-2" type="button">
              <Chrome className="h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="h-10 gap-2" type="button">
              <Monitor className="h-4 w-4" /> Microsoft
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">hoặc đăng ký bằng email</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="your@email.com"
              className={errors.email ? 'border-destructive' : ''}
              autoComplete="email"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Mật khẩu *</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => updateField('password', e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
            <PasswordStrengthBar password={form.password} />
          </div>

          <div className="grid gap-2">
            <Label>Xác nhận mật khẩu *</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => updateField('confirmPassword', e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="text-green-600 flex items-center gap-1 text-xs">
                <Check className="h-3 w-3" /> Mật khẩu khớp
              </p>
            )}
          </div>

          <Button
            className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
            onClick={nextStep}
          >
            Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Info */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Vai trò *</Label>
            <Select
              value={form.role}
              onValueChange={v => updateField('role', v as RegisterData['role'])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Người mua">Người mua</SelectItem>
                <SelectItem value="Nhà cung cấp">Nhà cung cấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Họ và tên *</Label>
            <Input
              value={form.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
              className={errors.fullName ? 'border-destructive' : ''}
              maxLength={50}
            />
            {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Số điện thoại *</Label>
            <Input
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder="0901234567"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
          </div>

          {/* DB-A.09: Tên công ty luôn hiển thị (bắt buộc cho B2B) */}
          <div className="grid gap-2">
            <Label>Tên công ty / Tổ chức *</Label>
            <Input
              value={form.companyName}
              onChange={e => updateField('companyName', e.target.value)}
              placeholder="Công ty TNHH..."
              className={errors.companyName ? 'border-destructive' : ''}
            />
            {errors.companyName && <p className="text-destructive text-xs">{errors.companyName}</p>}
          </div>

          {/* DB-A.09: Mã số thuế (tuỳ chọn) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Mã số thuế</Label>
              <Input
                value={form.taxCode ?? ''}
                onChange={e => updateField('taxCode', e.target.value)}
                placeholder="0123456789"
              />
            </div>
            <div className="grid gap-2">
              <Label>Thành phố</Label>
              <Input
                value={form.city ?? ''}
                onChange={e => updateField('city', e.target.value)}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-11" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <Button
              className="flex-1 h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
              onClick={nextStep}
            >
              Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <h4 className="text-sm font-bold">Xác nhận thông tin</h4>
            </div>
            <div className="grid gap-2 text-sm">
              {[
                { label: 'Email', value: form.email },
                { label: 'Họ tên', value: form.fullName },
                { label: 'Điện thoại', value: form.phone },
                { label: 'Vai trò', value: form.role },
                ...(form.companyName ? [{ label: 'Công ty', value: form.companyName }] : []),
                ...(form.taxCode ? [{ label: 'Mã số thuế', value: form.taxCode }] : []),
                ...(form.city ? [{ label: 'Thành phố', value: form.city }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-11" type="button" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Sửa lại
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 font-semibold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Hoàn tất đăng ký
                </span>
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Đã có tài khoản? </span>
        <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 500 }}>Đăng nhập</Link>
      </div>
    </div>
  );
}