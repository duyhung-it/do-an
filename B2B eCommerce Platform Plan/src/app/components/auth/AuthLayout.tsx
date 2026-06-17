// ============================================================
// AuthLayout — Redesign UI Premium
// Split Layout: Form (trái) + Branding Premium (phải)
// Carousel với animated stats, trust signals
// ============================================================

import { CheckCircle, Globe, Lock, Shield, Star, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole, normalizeRole } from '../../utils/roles';

const slides = [
  {
    icon: Globe,
    title: 'Mua sắm công nghệ chính hãng',
    description: 'Tìm điện thoại, phụ kiện và thiết bị công nghệ với thông tin rõ ràng, giao hàng toàn quốc.',
    stat: '50K+',
    statLabel: 'Khách hàng',
    accent: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Shield,
    title: 'An toàn & Bảo mật tuyệt đối',
    description: 'Mọi giao dịch được bảo vệ bởi hệ thống thanh toán an toàn và mã hóa SSL.',
    stat: '100%',
    statLabel: 'Bảo mật',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: TrendingUp,
    title: 'Tiết kiệm chi phí đáng kể',
    description: 'Săn ưu đãi theo mùa, mã giảm giá và quà tặng khi mua sắm tại CELLPHONES.',
    stat: '30%',
    statLabel: 'Tiết kiệm trung bình',
    accent: 'from-amber-400 to-orange-500',
  },
];

const trustBadges = [
  { icon: CheckCircle, label: 'Đã xác minh' },
  { icon: Lock, label: 'SSL bảo mật' },
  { icon: Star, label: 'Được yêu thích' },
  { icon: Zap, label: 'Nhanh chóng' },
];

export function AuthLayout() {
  const { isAuthenticated, loading, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-muted-foreground text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const redirectTo =
      isAdminRole(user.role) ? '/admin' :
      normalizeRole(user.role) === 'SUPPLIER' ? '/dashboard' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen flex">
      {/* Left — Form area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile branding header */}
        <div className="lg:hidden p-4" style={{ background: 'linear-gradient(135deg, #8a0e23, #c91432)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-white text-xs font-black" style={{ fontFamily: 'var(--font-heading)' }}>CP</span>
            </div>
            <span className="text-white font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              CELLPHONES
            </span>
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 bg-background">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="lg:hidden py-3 px-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 CELLPHONES · <Link to="/privacy" className="hover:underline">Bảo mật</Link> · <Link to="/terms" className="hover:underline">Điều khoản</Link>
          </p>
        </div>
      </div>

      {/* Right — Branding panel (desktop only) */}
      <div className="hidden lg:flex w-[480px] xl:w-[540px] relative overflow-hidden">
        {/* Multi-layer background with brand colors */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #6b0b1c 0%, #8a0e23 25%, #a8102a 50%, #c91432 75%, #e31837 100%)' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(227,24,55,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,20,50,0.15),transparent_55%)]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")',
        }} />
        {/* Premium glow orbs */}
        <div className="absolute top-32 -right-20 w-72 h-72 rounded-full bg-red-400/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-red-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-between p-10 text-white w-full">
          {/* Top: Logo */}
          <Link to="/" className="flex items-center gap-3 self-start group">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-all">
              <span className="text-white font-black text-sm" style={{ fontFamily: 'var(--font-heading)' }}>CP</span>
            </div>
            <div>
              <p className="text-white font-black text-xl leading-none" style={{ fontFamily: 'var(--font-heading)' }}>CELLPHONES</p>
              <p className="text-red-100/50 text-xs mt-0.5">Điện thoại và phụ kiện chính hãng</p>
            </div>
          </Link>

          {/* Center: Carousel */}
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm py-8">
            {/* Icon */}
            <div className={`h-24 w-24 mx-auto mb-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-500 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
              <slide.icon className="h-12 w-12 text-white" />
            </div>

            {/* Stat highlight */}
            <div className={`mb-8 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className={`inline-flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/20`}>
                <span className="text-6xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {slide.stat}
                </span>
                <span className="text-white/70 text-xs mt-2 uppercase tracking-wide font-medium">{slide.statLabel}</span>
              </div>
            </div>

            <h3 className={`text-white font-black text-2xl mb-4 transition-all duration-500 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              style={{ fontFamily: 'var(--font-heading)' }}>
              {slide.title}
            </h3>
            <p className={`text-white/80 leading-relaxed transition-all duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}>
              {slide.description}
            </p>

            {/* Slide indicators */}
            <div className="flex gap-2 mt-8">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/25 hover:bg-white/40'}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>

          {/* Bottom: Trust badges */}
          <div className="w-full border-t border-white/15 pt-7">
            <p className="text-white/50 text-xs text-center mb-5 uppercase tracking-wider font-semibold">Được tin tưởng bởi</p>
            <div className="grid grid-cols-4 gap-2">
              {trustBadges.map(badge => (
                <div key={badge.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all border border-white/10">
                  <badge.icon className="h-5 w-5 text-white" />
                  <span className="text-white/70 text-[11px] text-center leading-tight font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs text-center mt-6">
              © 2025 CELLPHONES · Bảo mật · Điều khoản
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
