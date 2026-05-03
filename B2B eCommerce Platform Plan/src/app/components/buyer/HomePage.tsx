// ============================================================
// CELLPHONES — HomePage
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Smartphone, ChevronRight, Star, ShoppingCart, Heart, Zap,
  Search, ArrowRight, Shield, Truck, RotateCcw, Award,
  CheckCircle, TrendingUp, Clock, Headphones, Watch, Battery, Cpu,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { productApi, categoryApi, blogApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import type { Product, Category, BlogPost } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { toast } from 'sonner';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible: v };
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>{children}</div>;
}

function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setT({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [target]);
  return (
    <div className="flex items-center gap-1.5">
      {[t.h, t.m, t.s].map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="bg-black/20 rounded-lg px-2.5 py-1.5 min-w-[44px] text-center">
            <span className="text-lg font-bold text-white">{String(v).padStart(2, '0')}</span>
            <p className="text-[9px] text-white/60 uppercase">{['Giờ', 'Phút', 'Giây'][i]}</p>
          </div>
          {i < 2 && <span className="text-white/60 font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : product.discountPercent ?? 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để mua hàng'); navigate('/login'); return; }
    setAdding(true);
    try {
      await addItem({ productId: product.id, productName: product.name, productImage: product.images[0], brand: product.brand, quantity: 1, unitPrice: product.price, originalPrice: product.originalPrice, totalPrice: product.price, variantName: product.variants[0]?.name, variantId: product.variants[0]?.id });
      toast.success(`Đã thêm vào giỏ hàng`);
    } finally { setAdding(false); }
  };

  return (
    <Link to={`/products/${product.id}`}>
      <Card className="group overflow-hidden card-interactive h-full border-0 shadow-sm bg-white dark:bg-card">
        <div className="aspect-square overflow-hidden relative bg-gray-50 dark:bg-muted/30">
          <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover img-zoom" />
          {discountPct > 0 && (
            <div className="absolute top-2 left-2 bg-[#e31837] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPct}%
            </div>
          )}
          {product.isNew && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Mới</div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <button className="h-8 w-8 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center hover:bg-white press-down" onClick={handleAddToCart} disabled={adding} title="Thêm vào giỏ">
              {adding ? <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <ShoppingCart className="h-4 w-4 text-[#e31837]" />}
            </button>
            <button className="h-8 w-8 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center hover:bg-white press-down" onClick={e => e.preventDefault()} title="Yêu thích">
              <Heart className="h-4 w-4 text-[#e31837]" />
            </button>
          </div>
        </div>
        <CardContent className="p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{product.brand}</p>
          <p className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px] leading-snug">{product.name}</p>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-0.5">({product.reviewCount})</span>
          </div>
          <div>
            <p className="text-[#e31837] font-bold text-base">{formatPrice(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


const BRANDS = [
  { name: 'Apple', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { name: 'Samsung', img: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { name: 'Xiaomi', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg' },
  { name: 'OPPO', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/OPPO_LOGO_2019.svg' },
  { name: 'Vivo', img: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Vivo_logo_2019.svg' },
  { name: 'Realme', img: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Realme_Logo.svg' },
];

const CAT_ICONS: Record<string, React.ElementType> = { 'Điện thoại': Smartphone, 'Phụ kiện': Award, 'Tai nghe': Headphones, 'Đồng hồ thông minh': Watch, 'Sạc & Pin dự phòng': Battery, 'Thiết bị công nghệ': Cpu };

export function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState<Product[]>([]);
  const [hot, setHot] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const flashEnd = new Date(Date.now() + 8 * 3600_000);
  const { items: recentItems } = useRecentlyViewed();

  useEffect(() => {
    Promise.all([
      productApi.getFeatured(8).then(setFeatured),
      productApi.getHot(6).then(setHot),
      categoryApi.getAll().then(setCategories),
      blogApi.getLatest(3).then(setBlogs),
    ]);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0a0d] via-[#c91432] to-[#e31837] min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.3),transparent_60%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />
        
        {/* Animated Background Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />

        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" /> Siêu thị điện thoại #1 Việt Nam
              </Badge>
              <h1 className="text-white mb-6 leading-tight text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Điện thoại chính hãng, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-500">Giá tốt nhất thị trường</span>
              </h1>
              <p className="mb-8 text-red-50/90 text-lg md:text-xl max-w-lg leading-relaxed">
                Hàng trăm mẫu điện thoại từ Apple, Samsung, Xiaomi và nhiều hãng khác. Bảo hành chính hãng, đổi trả trong 7 ngày.
              </p>
              <form className="flex gap-2 max-w-lg mb-10 group" onSubmit={e => { e.preventDefault(); if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`); }}>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-primary" />
                  <Input 
                    className="pl-12 h-14 bg-white/95 border-0 rounded-2xl shadow-xl text-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-yellow-400" 
                    placeholder="Tìm điện thoại, phụ kiện..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8 bg-black hover:bg-gray-900 rounded-2xl shadow-xl text-lg transition-transform hover:scale-105">
                  Tìm
                </Button>
              </form>
              <div className="flex gap-8">
                {[{ v: 50000, s: '+', l: 'Sản phẩm' }, { v: 200, s: '+', l: 'Cửa hàng' }, { v: 1000000, s: '+', l: 'Khách hàng' }].map((s, idx) => (
                  <div key={s.l} className="text-center animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                    <p className="text-2xl md:text-3xl font-black text-white drop-shadow-md">
                      <AnimatedNumber value={s.v} format={n => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M${s.s}` : n >= 1000 ? `${(n / 1000).toFixed(0)}K${s.s}` : `${n}${s.s}`} />
                    </p>
                    <p className="text-red-200/80 text-sm font-medium uppercase tracking-wider mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block relative h-[500px]">
              {/* Main floating image */}
              <div className="absolute inset-0 flex items-center justify-center animate-[bounce_6s_ease-in-out_infinite]">
                <div className="relative w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/10 ring-1 ring-white/20 backdrop-blur-sm bg-gradient-to-b from-white/5 to-white/0">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800" alt="Iphone" className="w-full h-auto object-cover" />
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute top-1/4 -left-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-[pulse_4s_ease-in-out_infinite]">
                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                <div><p className="text-sm font-bold text-gray-800">Đơn hàng mới</p><p className="text-xs font-medium text-green-600">+125 hôm nay</p></div>
              </div>
              <div className="absolute bottom-1/4 -right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-[pulse_5s_ease-in-out_infinite_animation-delay-2000]">
                <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center"><TrendingUp className="h-5 w-5 text-[#e31837]" /></div>
                <div><p className="text-sm font-bold text-gray-800">Doanh thu</p><p className="text-xs font-medium text-[#e31837]">+22.5%</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Shield, title: 'Bảo hành chính hãng', sub: '12 tháng tại hãng', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
            { icon: Truck, title: 'Giao hàng nhanh', sub: 'Nội thành 2-4 tiếng', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
            { icon: RotateCcw, title: 'Đổi trả 7 ngày', sub: '1 đổi 1 miễn phí', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
            { icon: Award, title: 'Hàng chính hãng', sub: 'Cam kết bồi thường', gradient: 'from-[#e31837] to-[#c91432]', bg: 'bg-red-50' },
          ].map((item, i) => (
            <Card key={item.title} className="border-0 shadow-md hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </CardContent>
              {/* Bottom accent */}
              <div className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${item.gradient} transition-all duration-500`} />
            </Card>
          ))}
        </div>
      </section>

      {/* flash deals animated */}
      <Reveal className="container mx-auto px-4 mb-10">
        <div className="relative group overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e31837] via-[#ff6b35] to-[#f9a826] bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />
          <div className="relative p-[1px]">
            <div className="bg-black/95 backdrop-blur-xl rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#ff6b35] blur-xl opacity-50 animate-pulse" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[#e31837] to-[#ff6b35] flex items-center justify-center shadow-inner">
                      <Zap className="h-8 w-8 text-white fill-white animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-[#ff6b35] font-black text-2xl md:text-3xl uppercase tracking-wider">
                      Flash Sale Cuối Tuần
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base mt-1 font-medium">Săn sale sập sàn - Giá rẽ bàng hoàng</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 flex-wrap justify-center">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm shadow-inner">
                    <Countdown target={flashEnd} />
                  </div>
                  <Link to="/products?isHot=true">
                    <Button size="lg" className="bg-gradient-to-r from-[#e31837] to-[#ff6b35] text-white hover:from-[#c91432] hover:to-[#e31837] border-0 font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 group-hover:animate-pulse">
                      Săn Ngay <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>


      {/* Brands */}
      <Reveal className="container mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Thương hiệu nổi bật</h2>
          <Link to="/products" className="text-[#e31837] text-sm flex items-center gap-1 hover:underline">Tất cả <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {BRANDS.map(b => (
            <Link key={b.name} to={`/products?brand=${b.name}`}>
              <Card className="border hover:border-[#e31837]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white group">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <img src={b.img} alt={b.name} className="h-8 object-contain grayscale group-hover:grayscale-0 transition-all" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-[#e31837] transition-colors">{b.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Categories */}
      <Reveal className="container mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Danh mục sản phẩm</h2>
          <Link to="/products" className="text-[#e31837] text-sm flex items-center gap-1 hover:underline">Xem tất cả <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.slice(0, 6).map(cat => {
            const Icon = CAT_ICONS[cat.name] ?? Smartphone;
            return (
              <Link key={cat.id} to={`/products?categoryId=${cat.id}`}>
                <Card className="border hover:border-[#e31837]/40 hover:shadow-md hover:-translate-y-0.5 transition-all group bg-white">
                  <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-red-50 group-hover:bg-[#e31837] flex items-center justify-center transition-colors">
                      <Icon className="h-6 w-6 text-[#e31837] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-center leading-tight">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.productCount} sản phẩm</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Reveal>

      {/* Hot products */}
      <section className="bg-gray-100 py-10 mb-0">
        <Reveal className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1.5 bg-[#e31837] rounded-full" />
              <h2 className="text-xl font-bold">Sản phẩm bán chạy</h2>
            </div>
            <Link to="/products?isHot=true" className="text-[#e31837] text-sm flex items-center gap-1 hover:underline">Xem thêm <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {hot.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </Reveal>
      </section>

      {/* Featured products */}
      <Reveal className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1.5 bg-[#e31837] rounded-full" />
            <h2 className="text-xl font-bold">Sản phẩm nổi bật</h2>
          </div>
          <Link to="/products?isFeatured=true" className="text-[#e31837] text-sm flex items-center gap-1 hover:underline">Xem thêm <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </Reveal>

      {/* Price ranges */}
      <Reveal className="bg-gradient-to-r from-gray-900 to-gray-800 py-10 mb-0">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Tìm điện thoại theo ngân sách</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Dưới 5 triệu', href: '/products?maxPrice=5000000', color: 'from-blue-500 to-blue-600' },
              { label: '5 - 10 triệu', href: '/products?minPrice=5000000&maxPrice=10000000', color: 'from-green-500 to-green-600' },
              { label: '10 - 15 triệu', href: '/products?minPrice=10000000&maxPrice=15000000', color: 'from-yellow-500 to-orange-500' },
              { label: '15 - 20 triệu', href: '/products?minPrice=15000000&maxPrice=20000000', color: 'from-orange-500 to-red-500' },
              { label: 'Trên 20 triệu', href: '/products?minPrice=20000000', color: 'from-purple-500 to-pink-500' },
            ].map(r => (
              <Link key={r.label} to={r.href}>
                <div className={`bg-gradient-to-br ${r.color} rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200`}>
                  <Smartphone className="h-8 w-8 text-white/80 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">{r.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Blog */}
      {blogs.length > 0 && (
        <Reveal className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1.5 bg-[#e31837] rounded-full" />
              <h2 className="text-xl font-bold">Blog công nghệ</h2>
            </div>
            <Link to="/blog" className="text-[#e31837] text-sm flex items-center gap-1 hover:underline">Tất cả bài viết <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {blogs.map(b => (
              <Link key={b.id} to={`/blog/${b.slug}`}>
                <Card className="overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all border-0 shadow-sm bg-white">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <ImageWithFallback src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge className="absolute top-2 left-2 bg-[#e31837] text-white border-0 text-[10px]">{b.category}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#e31837] transition-colors">{b.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{b.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(b.publishedAt).toLocaleDateString('vi-VN')}</span>
                      <span>{b.viewCount.toLocaleString('vi-VN')} lượt xem</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {/* Testimonials */}
      <Reveal className="bg-gray-50 py-16 mb-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-4">Khách hàng nói gì về CELLPHONES</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Hơn 1 triệu khách hàng đã tin tưởng và lựa chọn CELLPHONES trong hành trình trải nghiệm công nghệ của mình.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Nguyễn Văn A', role: 'Khách hàng', text: 'Tuyệt vời! Giá quá ngon so với thị trường. Sẽ tiếp tục mua ủng hộ.', rating: 5, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
              { name: 'Trần Thị B', role: 'Khách hàng', text: 'Nhân viên tư vấn siêu nhiệt tình. Giao hàng cực kỳ nhanh chỉ trong 2 tiếng.', rating: 5, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
              { name: 'Lê Hoàng C', role: 'Khách hàng V.I.P', text: 'Chính sách thu cũ đổi mới rất minh bạch. Định giá máy thu vào cũng khá cao.', rating: 4, avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
            ].map((t, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white group">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic line-clamp-3">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary transition-all" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Recently Viewed */}
      {recentItems.length > 0 && (
        <Reveal className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1.5 bg-[#e31837] rounded-full" />
              <h2 className="text-xl font-bold">Sản phẩm đã xem</h2>
            </div>
            <button
              onClick={() => { localStorage.removeItem('cellphones_recently_viewed'); window.location.reload(); }}
              className="text-xs text-muted-foreground hover:text-[#e31837] transition-colors underline"
            >
              Xóa lịch sử
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {recentItems.map(item => (
              <Link key={item.id} to={`/products/${item.id}`}>
                <Card className="card-interactive border-0 shadow-sm bg-white overflow-hidden">
                  <div className="aspect-square overflow-hidden relative bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover img-zoom"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x120/f5f5f5/999?text=SP'; }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{item.brand}</p>
                    <p className="text-xs font-medium line-clamp-2 leading-tight mt-0.5">{item.name}</p>
                    <p className="text-[#e31837] text-xs font-bold mt-1">{formatPrice(item.price)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {/* Trade-in CTA */}

      <Reveal className="container mx-auto px-4 pb-10">
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-gray-900 to-gray-800">
          <CardContent className="p-8 text-center">
            <RotateCcw className="h-12 w-12 text-[#e31837] mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Thu cũ đổi mới — Lên đời smartphone dễ dàng</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">Định giá thiết bị cũ ngay tại nhà, đổi sang máy mới với mức giá ưu đãi nhất thị trường.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/trade-in"><Button className="bg-[#e31837] hover:bg-[#c91432]">Định giá ngay <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
              <Link to="/products?isNew=true"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Xem máy mới</Button></Link>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
