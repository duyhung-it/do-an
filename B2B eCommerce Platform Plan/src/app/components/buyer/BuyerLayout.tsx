// ============================================================
// Customer Layout — CELLPHONES Store
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import {
  Smartphone, Search, ShoppingCart, Heart, User, Menu, X,
  Phone, MapPin, Clock, ChevronDown, Bell, LogOut,
  Tag, Headphones, Watch, Battery, Cpu,
  Facebook, Youtube, Instagram, Shield, Truck, Award, RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { MiniCart } from './MiniCart';
import { toast } from 'sonner';
import { categoryApi, productApi } from '../../services/api';
import type { Category, Product } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { productDetailPath } from '../../utils/productLinks';
import { isAdminRole } from '../../utils/roles';


const NAV_CATEGORIES = [
  { label: 'Điện thoại', href: '/products?categoryId=cat-01', icon: Smartphone, brands: ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme'] },
  { label: 'Phụ kiện', href: '/products?categoryId=cat-02', icon: Tag, brands: ['Anker', 'Baseus', 'Ugreen', 'Belkin'] },
  { label: 'Tai nghe', href: '/products?categoryId=cat-03', icon: Headphones, brands: ['Sony', 'Apple', 'JBL', 'Marshall', 'Sennheiser'] },
  { label: 'Đồng hồ TM', href: '/products?categoryId=cat-04', icon: Watch, brands: ['Apple Watch', 'Samsung', 'Garmin', 'Amazfit', 'Huawei'] },
  { label: 'Sạc & Pin', href: '/products?categoryId=cat-05', icon: Battery, brands: ['Anker', 'Pisen', 'Samsung', 'Xiaomi'] },
  { label: 'Thiết bị CN', href: '/products?categoryId=cat-06', icon: Cpu },
  { label: 'Khuyến mãi', href: '/promotions', icon: Tag },
];

const PRICE_RANGES = [
  { label: 'Dưới 5 triệu', href: '/products?maxPrice=5000000' },
  { label: '5 - 10 triệu', href: '/products?minPrice=5000000&maxPrice=10000000' },
  { label: '10 - 15 triệu', href: '/products?minPrice=10000000&maxPrice=15000000' },
  { label: '15 - 20 triệu', href: '/products?minPrice=15000000&maxPrice=20000000' },
  { label: 'Trên 20 triệu', href: '/products?minPrice=20000000' },
];

const MENU_CATEGORY_CONFIG = [
  { slug: 'dien-thoai', label: 'Điện thoại', icon: Smartphone },
  { slug: 'phu-kien', label: 'Phụ kiện', icon: Tag },
  { slug: 'tai-nghe', label: 'Tai nghe', icon: Headphones },
  { slug: 'dong-ho-thong-minh', label: 'Đồng hồ TM', icon: Watch },
  { slug: 'sac-pin', label: 'Sạc & Pin', icon: Battery },
  { slug: 'thiet-bi-cong-nghe', label: 'Thiết bị CN', icon: Cpu },
];

type BuyerNavCategory = {
  label: string;
  href: string;
  icon: React.ElementType;
  categoryId?: string;
  brands?: string[];
};

const flattenCategories = (categories: Category[]): Category[] =>
  categories.flatMap(category => [category, ...flattenCategories(category.children ?? [])]);

const collectCategoryIds = (category: Category): string[] => [
  category.id,
  ...(category.children ?? []).flatMap(child => collectCategoryIds(child)),
];

const buildPriceHref = (rangeHref: string, categoryId?: string) => {
  if (!categoryId) return rangeHref;
  return `${rangeHref}${rangeHref.includes('?') ? '&' : '?'}categoryId=${encodeURIComponent(categoryId)}`;
};

const buildBuyerNavCategories = (categories: Category[], products: Product[]): BuyerNavCategory[] => {
  const flatCategories = flattenCategories(categories);

  return [
    ...MENU_CATEGORY_CONFIG.map(config => {
      const category = flatCategories.find(item => item.slug === config.slug);
      const categoryIds = category ? new Set(collectCategoryIds(category)) : new Set<string>();
      const brands = Array.from(new Set(
        products
          .filter(product => categoryIds.has(product.categoryId))
          .map(product => product.brand)
          .filter(Boolean)
      )).sort((a, b) => a.localeCompare(b, 'vi'));

      return {
        label: config.label,
        href: category ? `/products?categoryId=${category.id}` : '/products',
        icon: config.icon,
        categoryId: category?.id,
        brands,
      };
    }),
    { label: 'Khuyến mãi', href: '/promotions', icon: Tag },
  ];
};

const FALLBACK_NAV_CATEGORIES: BuyerNavCategory[] = [
  ...MENU_CATEGORY_CONFIG.map(config => ({
    label: config.label,
    href: `/products?categorySlug=${config.slug}`,
    icon: config.icon,
    brands: [],
  })),
  { label: 'Khuyến mãi', href: '/promotions', icon: Tag },
];

export function BuyerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<BuyerNavCategory[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setAutocompleteOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      productApi.getAll({ search: search.trim() }).then(res => {
        setSearchResults(res.data.slice(0, 5));
        setAutocompleteOpen(true);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      categoryApi.getAll(),
      productApi.getPaginated({ page: 1, pageSize: 1000 }),
    ])
      .then(([categories, productsPage]) => {
        if (!mounted) return;
        setNavCategories(buildBuyerNavCategories(categories, productsPage.data));
      })
      .catch(() => {
        if (mounted) setNavCategories([]);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAutocompleteOpen(false);
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  const displayedNavCategories = navCategories.length > 0 ? navCategories : FALLBACK_NAV_CATEGORIES;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <div className="bg-[#c91432] text-white text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Hotline: 1800.2097 (Miễn phí)</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> T2-CN: 8:00 - 21:30</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Hơn 200 cửa hàng toàn quốc</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/trade-in" className="hover:underline">Thu cũ đổi mới</Link>
            <Link to="/imei-check" className="hover:underline">Kiểm tra IMEI</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5'
          : 'bg-white shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="h-9 w-9 bg-gradient-to-br from-[#e31837] to-[#c91432] rounded-lg flex items-center justify-center shadow-md shadow-red-200 group-hover:shadow-red-300 transition-shadow">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[#e31837] font-black text-lg leading-none tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>CELLPHONES</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">⚡ Siêu thị #1 Việt Nam</p>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative" onBlur={() => setTimeout(() => setAutocompleteOpen(false), 200)}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10 pr-24 h-10 bg-gray-100/80 border-0 rounded-full focus:bg-white focus:ring-2 focus:ring-[#e31837]/30 focus:shadow-md transition-all placeholder:text-muted-foreground/60"
                  placeholder="Tìm điện thoại, phụ kiện..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => { if (search.trim()) setAutocompleteOpen(true); }}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 bg-[#e31837] hover:bg-[#c91432] shadow-sm">
                  Tìm
                </Button>

                {/* Autocomplete Dropdown */}
                {autocompleteOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-muted-foreground px-2 pb-2">Sản phẩm gợi ý</p>
                      {searchResults.map(p => (
                        <Link 
                          key={p.id} 
                          to={productDetailPath(p)}
                          className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <div className="h-12 w-12 rounded-md overflow-hidden shrink-0 bg-white">
                            <ImageWithFallback src={p.images[0]} alt={p.name} className="h-full w-full object-contain" />
                          </div>
                          <div>
                            <p className="text-sm font-medium group-hover:text-[#e31837] transition-colors">{p.name}</p>
                            <p className="text-[#e31837] text-xs font-bold mt-0.5">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-2 text-center border-t">
                      <button onClick={handleSearch} className="text-sm text-[#e31837] hover:underline font-medium">
                        Xem tất cả kết quả cho "{search}"
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Wishlist */}
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Heart className="h-5 w-5" />
                  {wishCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#e31837]">{wishCount}</Badge>}
                </Button>
              </Link>

              {/* Cart */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setMiniCartOpen(!miniCartOpen)}>
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#e31837]">{itemCount}</Badge>}
                </Button>
                {miniCartOpen && <MiniCart onClose={() => setMiniCartOpen(false)} />}
              </div>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" /> : <User className="h-5 w-5" />}
                  </Button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border z-50 py-2">
                      <div className="px-4 py-2 border-b">
                        <p className="font-semibold text-sm truncate">{user?.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      {[
                        { href: '/profile', label: 'Tài khoản của tôi', icon: User },
                        { href: '/loyalty', label: 'Hạng thành viên', icon: Award },
                        { href: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
                        { href: '/returns', label: 'Trả hàng & hoàn tiền', icon: RotateCcw },
                        { href: '/wishlist', label: 'Yêu thích', icon: Heart },
                        { href: '/warranty', label: 'Bảo hành', icon: Shield },
                        { href: '/notifications', label: 'Thông báo', icon: Bell },
                      ].map(item => (
                        <Link key={item.href} to={item.href} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </Link>
                      ))}
                      {isAdminRole(user?.role) && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-[#e31837] hover:bg-red-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Award className="h-4 w-4" />Admin Panel
                        </Link>
                      )}
                      <div className="border-t mt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                          <LogOut className="h-4 w-4" />Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="bg-[#e31837] hover:bg-[#c91432] hidden sm:flex">Đăng nhập</Button>
                  <Button variant="ghost" size="icon" className="sm:hidden"><User className="h-5 w-5" /></Button>
                </Link>
              )}

              {/* Mobile menu */}
              <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 pb-1 border-t pt-1">
            {displayedNavCategories.map(cat => (
              <div key={cat.label} className="relative group" onMouseLeave={() => setActiveMenu(null)}>
                <Link
                  to={cat.href}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-red-50 hover:text-[#e31837] transition-colors group-hover:text-[#e31837]"
                  onMouseEnter={() => cat.brands?.length ? setActiveMenu(cat.label) : setActiveMenu(null)}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                  {!!cat.brands?.length && <ChevronDown className="h-3 w-3 opacity-60" />}
                </Link>
                {/* Mega dropdown */}
                {!!cat.brands?.length && activeMenu === cat.label && (
                  <div
                    className="absolute top-full left-0 mt-1 w-[260px] bg-white shadow-xl rounded-xl border z-50 p-5"
                    onMouseEnter={() => setActiveMenu(cat.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <div className="grid gap-5">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Thương hiệu</p>
                        <div className="space-y-1">
                          {cat.brands.map(b => (
                            <Link key={b} to={`/products?brand=${encodeURIComponent(b)}${cat.categoryId ? `&categoryId=${encodeURIComponent(cat.categoryId)}` : ''}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 hover:text-[#e31837] text-sm transition-colors" onClick={() => setActiveMenu(null)}>
                              <cat.icon className="h-3.5 w-3.5" />{b}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Theo mức giá</p>
                        <div className="space-y-1">
                          {PRICE_RANGES.map(r => (
                            <Link key={r.label} to={buildPriceHref(r.href, cat.categoryId)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 hover:text-[#e31837] text-sm transition-colors" onClick={() => setActiveMenu(null)}>
                              <Tag className="h-3.5 w-3.5" />{r.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10 bg-gray-100 border-0" placeholder="Tìm điện thoại..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </form>
              <div className="space-y-1">
                {displayedNavCategories.map(cat => (
                  <Link key={cat.label} to={cat.href} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-red-50 hover:text-[#e31837] text-sm">
                    <cat.icon className="h-4 w-4" />{cat.label}
                  </Link>
                ))}
                <div className="border-t pt-2 mt-2">
                  <Link to="/trade-in" className="flex items-center gap-2 p-2.5 text-sm hover:text-[#e31837]"><RotateCcw className="h-4 w-4" />Thu cũ đổi mới</Link>
                  <Link to="/imei-check" className="flex items-center gap-2 p-2.5 text-sm hover:text-[#e31837]"><Shield className="h-4 w-4" />Kiểm tra IMEI</Link>
                </div>
                {!isAuthenticated && (
                  <div className="flex gap-2 mt-3">
                    <Link to="/login" className="flex-1"><Button className="w-full bg-[#e31837] hover:bg-[#c91432]">Đăng nhập</Button></Link>
                    <Link to="/register" className="flex-1"><Button variant="outline" className="w-full">Đăng ký</Button></Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        {/* Benefits bar */}
        <div className="bg-[#e31837]">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: 'Bảo hành chính hãng', sub: '12 tháng tại hãng' },
                { icon: Truck, label: 'Giao hàng nhanh', sub: 'Nội thành 2-4 tiếng' },
                { icon: RotateCcw, label: 'Đổi trả dễ dàng', sub: '7 ngày 1 đổi 1' },
                { icon: Award, label: '100% hàng chính hãng', sub: 'Cam kết bồi thường' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="h-7 w-7 text-white/80 shrink-0" />
                  <div><p className="text-white text-sm font-semibold">{item.label}</p><p className="text-red-200 text-xs">{item.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-[#e31837] rounded-lg flex items-center justify-center"><Smartphone className="h-4 w-4 text-white" /></div>
                <span className="text-white font-bold text-lg">CELLPHONES</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">Siêu thị điện thoại & phụ kiện công nghệ hàng đầu Việt Nam. Hàng chính hãng, giá tốt, bảo hành uy tín.</p>
              <div className="flex gap-3">
                {[Facebook, Youtube, Instagram].map((Icon, i) => (
                  <button key={i} className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#e31837] transition-colors">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {[
              { title: 'Mua sắm', links: [{ href: '/products?categoryId=cat-01', label: 'Điện thoại' }, { href: '/products?categoryId=cat-03', label: 'Tai nghe' }, { href: '/products?categoryId=cat-04', label: 'Đồng hồ TM' }, { href: '/promotions', label: 'Khuyến mãi' }, { href: '/products?isNew=true', label: 'Sản phẩm mới' }] },
              { title: 'Dịch vụ', links: [{ href: '/trade-in', label: 'Thu cũ đổi mới' }, { href: '/imei-check', label: 'Kiểm tra IMEI' }, { href: '/warranty', label: 'Tra cứu bảo hành' }, { href: '/stores', label: 'Hệ thống cửa hàng' }] },
              { title: 'Thông tin', links: [{ href: '/blog', label: 'Blog công nghệ' }, { href: '/stores', label: 'Hệ thống cửa hàng' }, { href: '/promotions', label: 'Ưu đãi hiện có' }, { href: '/warranty', label: 'Chính sách bảo hành' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l.href}><Link to={l.href} className="text-sm hover:text-[#e31837] transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">© 2025 CELLPHONES. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Điện thoại: 1800.2097</span>
              <span>•</span>
              <span>Email: support@cellphones.vn</span>
            </div>
          </div>
        </div>
      </footer>
      {/* Mobile Bottom Navigation — pb-safe for iOS safe area */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-border/50 pb-safe">
        <div className="grid grid-cols-5 h-14">
          {[
            { href: '/', icon: 'home', label: 'Trang chủ' },
            { href: '/products', icon: 'search', label: 'Sản phẩm' },
            { href: '/cart', icon: 'cart', label: 'Giỏ hàng', badge: itemCount },
            { href: '/wishlist', icon: 'heart', label: 'Yêu thích', badge: wishCount },
            { href: isAuthenticated ? '/profile' : '/login', icon: 'user', label: isAuthenticated ? (user?.fullName?.split(' ')[0] ?? 'Tôi') : 'Đăng nhập' },
          ].map(item => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${isActive ? 'text-[#e31837]' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {/* Icon */}
                <div className="relative">
                  {item.icon === 'home' && (
                    <svg className="h-5 w-5" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  )}
                  {item.icon === 'search' && (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                    </svg>
                  )}
                  {item.icon === 'cart' && (
                    <svg className="h-5 w-5" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 1.8}>
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  )}
                  {item.icon === 'heart' && (
                    <svg className="h-5 w-5" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  )}
                  {item.icon === 'user' && (
                    <svg className="h-5 w-5" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                  {/* Badge */}
                  {!!item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#e31837] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium leading-none">{item.label}</span>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#e31837] rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
