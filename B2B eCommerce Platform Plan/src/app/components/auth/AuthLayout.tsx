// ============================================================
// AuthLayout — Redesign UI Premium
// Split Layout: Form (trái) + Branding Premium (phải)
// Carousel với animated stats, trust signals
// ============================================================

import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router';
import { Globe, Shield, TrendingUp, Users, CheckCircle, Star, Lock, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const slides = [
  {
    icon: Globe,
    title: 'Nền tảng B2B số 1 Việt Nam',
    description: 'Kết nối hơn 50.000 doanh nghiệp và 5.000+ nhà cung cấp uy tín trên toàn quốc.',
    stat: '50K+',
    statLabel: 'Doanh nghiệp',
    accent: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Shield,
    title: 'An toàn & Bảo mật tuyệt đối',
    description: 'Mọi giao dịch được bảo vệ bởi hệ thống xác minh NCC đa tầng và mã hóa SSL.',
    stat: '100%',
    statLabel: 'NCC đã xác minh',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: TrendingUp,
    title: 'Tiết kiệm chi phí đáng kể',
    description: 'Trung bình doanh nghiệp tiết kiệm 30% chi phí mua hàng khi sử dụng VietB2B.',
    stat: '30%',
    statLabel: 'Tiết kiệm trung bình',
    accent: 'from-amber-400 to-orange-500',
  },
];

const trustBadges = [
  { icon: CheckCircle, label: 'Đã xác minh' },
  { icon: Lock, label: 'SSL bảo mật' },
  { icon: Star, label: 'Top Platform' },
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
      user.role === 'Quản trị viên' ? '/admin' :
      user.role === 'Nhà cung cấp' ? '/seller' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen flex">
      {/* Left — Form area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile branding header */}
        <div className="lg:hidden p-4" style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-white text-xs font-black" style={{ fontFamily: 'var(--font-heading)' }}>B2B</span>
            </div>
            <span className="text-white font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              VietB2B
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
            © 2025 VietB2B · <Link to="/privacy" className="hover:underline">Bảo mật</Link> · <Link to="/terms" className="hover:underline">Điều khoản</Link>
          </p>
        </div>
      </div>

      {/* Right — Branding panel (desktop only) */}
      <div className="hidden lg:flex w-[480px] xl:w-[540px] relative overflow-hidden">
        {/* Multi-layer background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #0d0f1a 0%, #1e1b4b 40%, #312e81 100%)' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_55%)]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")',
        }} />
        {/* Glow orbs */}
        <div className="absolute top-20 -right-10 w-60 h-60 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-between p-10 text-white w-full">
          {/* Top: Logo */}
          <Link to="/" className="flex items-center gap-3 self-start group">
            <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <span className="text-white font-black text-sm" style={{ fontFamily: 'var(--font-heading)' }}>B2B</span>
            </div>
            <div>
              <p className="text-white font-black text-xl leading-none" style={{ fontFamily: 'var(--font-heading)' }}>VietB2B</p>
              <p className="text-indigo-300/60 text-xs mt-0.5">Nền tảng B2B #1 Việt Nam</p>
            </div>
          </Link>

          {/* Center: Carousel */}
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm py-8">
            {/* Icon */}
            <div className={`h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${slide.accent} bg-opacity-20 p-0.5 transition-all duration-500 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
              <div className="h-full w-full rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <slide.icon className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Stat highlight */}
            <div className={`mb-5 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className={`inline-flex flex-col items-center bg-gradient-to-br ${slide.accent} bg-opacity-10 rounded-2xl px-8 py-4 border border-white/10`}>
                <span className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {slide.stat}
                </span>
                <span className="text-white/60 text-sm mt-1">{slide.statLabel}</span>
              </div>
            </div>

            <h3 className={`text-white font-bold text-xl mb-3 transition-all duration-500 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              style={{ fontFamily: 'var(--font-heading)' }}>
              {slide.title}
            </h3>
            <p className={`text-indigo-200/70 leading-relaxed transition-all duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}>
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
          <div className="w-full border-t border-white/10 pt-6">
            <p className="text-white/40 text-xs text-center mb-4 uppercase tracking-wider">Được tin tưởng bởi</p>
            <div className="grid grid-cols-4 gap-3">
              {trustBadges.map(badge => (
                <div key={badge.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <badge.icon className="h-4 w-4 text-indigo-300" />
                  <span className="text-white/50 text-[10px] text-center leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="text-white/25 text-xs text-center mt-5">
              © 2025 VietB2B · Bảo mật · Điều khoản
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
