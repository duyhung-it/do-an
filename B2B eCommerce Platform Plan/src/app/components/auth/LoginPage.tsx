// ============================================================
// Trang đăng nhập — Redesign UI-D Đợt 16
// D16.02–D16.05: Form card, demo accounts, social login
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff, LogIn, KeyRound, Mail, Chrome, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';

const demoAccounts = [
  { label: 'Người mua', email: 'khachhang@gmail.com', password: '123456', color: 'bg-blue-100 text-blue-600', initials: 'NM' },
  { label: 'Nhà cung cấp', email: 'ncc@cellphones.vn', password: '123456', color: 'bg-emerald-100 text-emerald-600', initials: 'NC' },
  { label: 'Quản trị viên', email: 'admin@cellphones.vn', password: '123456', color: 'bg-purple-100 text-purple-600', initials: 'QT' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const from = (location.state as { from?: string })?.from;

  const getDefaultRedirect = (role: string): string => {
    switch (role) {
      case 'Nhà cung cấp': return '/seller';
      case 'Quản trị viên': return '/admin';
      default: return '/';
    }
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errs.password = 'Mật khẩu phải ít nhất 6 ký tự';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const authUser = await login({ email, password });
      if (rememberMe) {
        localStorage.setItem('b2b_remember_email', email);
      } else {
        localStorage.removeItem('b2b_remember_email');
      }
      toast.success('Đăng nhập thành công!');
      const redirectTo = from || getDefaultRedirect(authUser?.role ?? '');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Restore remembered email
  useState(() => {
    const saved = localStorage.getItem('b2b_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  });

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }
    await new Promise(r => setTimeout(r, 500));
    setForgotSent(true);
    toast.success('Đã gửi email khôi phục mật khẩu');
  };

  const fillDemo = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
  };

  // Forgot password view
  if (showForgotPw) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>
            {forgotSent ? 'Kiểm tra email' : 'Quên mật khẩu'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {forgotSent
              ? `Đã gửi link khôi phục tới ${forgotEmail}`
              : 'Nhập email đã đăng ký để nhận link đặt lại mật khẩu'}
          </p>
        </div>

        {forgotSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 text-center">
              <p className="text-emerald-800 dark:text-emerald-300 text-sm">
                Vui lòng kiểm tra hộp thư và click vào link để đặt lại mật khẩu.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setShowForgotPw(false); setForgotSent(false); }}>
              Quay lại đăng nhập
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForgotPw(false)}>
                Huỷ
              </Button>
              <Button className="flex-1" onClick={handleForgotPassword}>
                Gửi email khôi phục
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center lg:text-left">
        {/* Desktop logo (hidden on mobile since AuthLayout shows it) */}
        <div className="hidden lg:flex items-center gap-2.5 mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <span className="text-white text-sm" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>B2B</span>
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>VietB2B</span>
          </Link>
        </div>
        <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
          Chào mừng trở lại 👋
        </h2>
        <p className="text-muted-foreground mt-1">Hãy đăng nhập vào tài khoản của bạn</p>
      </div>

      {/* D16.04: Social login buttons (UI only) */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-10 gap-2" type="button">
          <Chrome className="h-4 w-4" /> Google
        </Button>
        <Button variant="outline" className="h-10 gap-2" type="button">
          <Monitor className="h-4 w-4" /> Microsoft
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">hoặc đăng nhập bằng email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
            className={errors.email ? 'border-destructive' : ''}
            autoComplete="email"
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              autoComplete="current-password"
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={v => setRememberMe(v === true)}
            />
            <label htmlFor="remember" className="text-muted-foreground text-sm cursor-pointer select-none">
              Ghi nhớ
            </label>
          </div>
          <button
            type="button"
            className="text-primary hover:underline text-sm"
            onClick={() => { setShowForgotPw(true); setForgotEmail(email); }}
          >
            Quên mật khẩu?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang đăng nhập...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Chưa có tài khoản? </span>
        <Link to="/register" className="text-primary hover:underline" style={{ fontWeight: 500 }}>Đăng ký ngay</Link>
      </div>

      {/* D16.03: Demo accounts redesign */}
      <div className="border-t pt-5">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3 text-center font-medium">✨ Tài khoản demo</p>
        <div className="grid gap-2">
          {demoAccounts.map(acc => (
            <button
              key={acc.email}
              type="button"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/[0.03] transition-all text-left group relative overflow-hidden"
              onClick={() => fillDemo(acc)}
            >
              {/* Hover shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${acc.color} shadow-sm`}>
                <span className="text-xs font-bold">{acc.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{acc.label}</p>
                <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
              </div>
              <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                Điền →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
