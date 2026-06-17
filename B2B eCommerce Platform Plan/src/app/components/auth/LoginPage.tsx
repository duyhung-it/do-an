// ============================================================
// Trang đăng nhập — Redesign UI-D Đợt 16
// D16.02–D16.05: Form card, demo accounts, social login
// ============================================================

import { Chrome, Eye, EyeOff, LogIn, Mail, Monitor } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole } from '../../utils/roles';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const demoAccounts = [
  { label: 'Khách hàng', email: 'khachhang@gmail.com', password: '123456', color: 'bg-blue-100 text-blue-600', initials: 'KH' },
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
    if (isAdminRole(role)) return '/admin';
    return '/';
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
        localStorage.setItem('cellphones_remember_email', email);
      } else {
        localStorage.removeItem('cellphones_remember_email');
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
    const saved = localStorage.getItem('cellphones_remember_email');
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-950/30 flex items-center justify-center shadow-sm">
            <Mail className="h-8 w-8 text-red-600" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl font-bold">
            {forgotSent ? 'Kiểm tra email' : 'Quên mật khẩu'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {forgotSent
              ? `Đã gửi link khôi phục tới ${forgotEmail}`
              : 'Nhập email đã đăng ký để nhận link đặt lại mật khẩu'}
          </p>
        </div>

        {forgotSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 text-center">
              <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                Vui lòng kiểm tra hộp thư và click vào link để đặt lại mật khẩu.
              </p>
            </div>
            <Button variant="outline" className="w-full h-11" onClick={() => { setShowForgotPw(false); setForgotSent(false); }}>
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
              className="h-11"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setShowForgotPw(false)}>
                Huỷ
              </Button>
              <Button className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-medium" onClick={handleForgotPassword}>
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
      <div className="text-center lg:text-left mb-8">
        {/* Desktop logo (hidden on mobile since AuthLayout shows it) */}
        <div className="hidden lg:flex items-center gap-2.5 mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-200/50 group-hover:shadow-red-300/70 transition-all hover:scale-105">
              <span className="text-white text-sm font-black" style={{ fontFamily: 'var(--font-heading)' }}>CPS</span>
            </div>
            <div>
              <p className="text-lg font-black" style={{ fontFamily: 'var(--font-heading)' }}>CellPhones Store</p>
              <p className="text-xs text-muted-foreground">Chuỗi bán lẻ điện thoại #1 Việt Nam</p>
            </div>
          </Link>
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Chào mừng trở lại 👋
        </h1>
        <p className="text-base text-muted-foreground">Đăng nhập để tiếp tục</p>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-11 gap-2 font-medium hover:bg-muted transition-colors" type="button">
          <Chrome className="h-5 w-5" /> Google
        </Button>
        <Button variant="outline" className="h-11 gap-2 font-medium hover:bg-muted transition-colors" type="button">
          <Monitor className="h-5 w-5" /> Microsoft
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground font-medium tracking-wider">hoặc đăng nhập bằng email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-3">
          <Label htmlFor="email" className="font-semibold text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
            className={`h-11 transition-all ${errors.email ? 'border-destructive focus:ring-destructive/50' : 'focus:ring-red-500/20'}`}
            autoComplete="email"
          />
          {errors.email && <p className="text-destructive text-xs font-medium flex items-center gap-1"><span>⚠</span> {errors.email}</p>}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password" className="font-semibold text-foreground">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
              className={`h-11 pr-10 transition-all ${errors.password ? 'border-destructive focus:ring-destructive/50' : 'focus:ring-red-500/20'}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs font-medium flex items-center gap-1"><span>⚠</span> {errors.password}</p>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={v => setRememberMe(v === true)}
            />
            <label htmlFor="remember" className="text-muted-foreground text-sm cursor-pointer select-none font-medium">
              Ghi nhớ tài khoản
            </label>
          </div>
          <button
            type="button"
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            onClick={() => { setShowForgotPw(true); setForgotEmail(email); }}
          >
            Quên mật khẩu?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-bold text-base bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all text-white"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
              Đang xử lý...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-base">
              <LogIn className="h-5 w-5" />
              Đăng nhập
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-sm pt-2">
        <span className="text-muted-foreground">Chưa có tài khoản? </span>
        <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold transition-colors" style={{ fontWeight: 600 }}>Đăng ký ngay</Link>
      </div>

      {/* Demo accounts section */}
      <div className="border-t pt-6">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-4 text-center font-semibold">✨ Tài khoản Demo</p>
        <div className="grid gap-3">
          {demoAccounts.map(acc => (
            <button
              key={acc.email}
              type="button"
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left group relative overflow-hidden shadow-xs hover:shadow-sm"
              onClick={() => fillDemo(acc)}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/50 dark:via-red-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${acc.color} shadow-sm font-bold text-sm`}>
                {acc.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{acc.label}</p>
                <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
              </div>
              <span className="text-xs text-red-600 font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                Sử dụng
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
