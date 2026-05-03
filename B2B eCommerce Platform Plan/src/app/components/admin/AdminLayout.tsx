// ============================================================
// AdminLayout — Layout Admin nâng cấp UI-C Đợt 13
// C13.01–C13.04: grouped sidebar, badge counts, breadcrumb
// ============================================================

import { useState, Suspense, useCallback, type ElementType } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, FolderTree, PackageCheck, ClipboardList, Settings,
  Menu, X, ChevronLeft, ShieldCheck, LogOut, Star, FileText, ScrollText, BarChart3,
  Truck, Wallet, Activity, Receipt, ChevronDown, PanelLeftClose, PanelLeft,
  Gavel, Handshake, Shield, Award, RotateCcw, Warehouse, FolderOpen, FileBarChart,
  DollarSign, Mail, LayoutGrid, MapPin, Tag, Building2,
} from 'lucide-react';
import { Button } from '../ui/button';
// Badge replaced with <span> for sidebar items
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { NotificationDropdown } from '../shared/NotificationDropdown';
import { ScrollToTop } from '../shared/ScrollToTop';
import { CommandPalette } from '../shared/CommandPalette';
import { ScrollToTopButton } from '../shared/ScrollToTopButton';
import { TableSkeleton } from '../shared/PageSkeleton';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// --- C13.01: Admin sidebar grouped ---
interface SidebarItem {
  path: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
  badgeCount?: number;
}

interface SidebarSection {
  key: string;
  label: string;
  items: SidebarItem[];
}

const adminSections: SidebarSection[] = [
  {
    key: 'overview',
    label: 'Tổng quan',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { path: '/admin/analytics', label: 'Phân tích & BI', icon: BarChart3 },
      { path: '/admin/reports', label: 'Báo cáo', icon: FileBarChart },
      { path: '/admin/report-builder', label: 'Tạo báo cáo tùy chỉnh', icon: FileBarChart },
    ],
  },
  {
    key: 'catalog',
    label: 'Sản phẩm & Danh mục',
    items: [
      { path: '/admin/products', label: 'Duyệt sản phẩm', icon: PackageCheck, badgeCount: 5 },
      { path: '/admin/categories', label: 'Danh mục', icon: FolderTree },
      { path: '/admin/inventory', label: 'Kho hàng & IMEI', icon: Warehouse },
      { path: '/admin/warehouses', label: 'Kho toàn sàn', icon: Warehouse },
      { path: '/admin/combos', label: 'Combo sản phẩm', icon: Tag },
    ],
  },
  {
    key: 'commerce',
    label: 'Bán hàng',
    items: [
      { path: '/admin/orders', label: 'Đơn hàng', icon: ClipboardList },
      { path: '/admin/returns', label: 'Trả hàng', icon: RotateCcw },
      { path: '/admin/promotions', label: 'Khuyến mãi', icon: Star },
      { path: '/admin/trade-in', label: 'Thu cũ đổi mới', icon: Truck, badgeCount: 3 },
      { path: '/admin/banners', label: 'Banner quảng cáo', icon: LayoutGrid },
    ],
  },
  {
    key: 'content',
    label: 'Nội dung',
    items: [
      { path: '/admin/blog', label: 'Blog & Bài viết', icon: FileText },
      { path: '/admin/email-templates', label: 'Email Templates', icon: Mail },
      { path: '/admin/documents', label: 'Tài liệu', icon: FolderOpen },
    ],
  },
  {
    key: 'customers',
    label: 'Khách hàng & Đối tác',
    items: [
      { path: '/admin/customers', label: 'Người dùng', icon: Users },
      { path: '/admin/suppliers', label: 'Nhà cung cấp', icon: Users },
      { path: '/admin/certificates', label: 'Chứng chỉ NCC', icon: ShieldCheck },
      { path: '/admin/reviews', label: 'Đánh giá', icon: Star },
      { path: '/admin/loyalty', label: 'Khách hàng thân thiết', icon: Award },
      { path: '/admin/warranty', label: 'Bảo hành', icon: Shield },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    items: [
      { path: '/admin/payments', label: 'Thanh toán', icon: Wallet },
      { path: '/admin/invoices', label: 'Hoá đơn', icon: Receipt },
      { path: '/admin/debit-credit', label: 'Ghi nợ / Ghi có', icon: Receipt },
      { path: '/admin/platform-fees', label: 'Phí sàn', icon: DollarSign },
    ],
  },
  {
    key: 'logistics',
    label: 'Vận hành & Logistics',
    items: [
      { path: '/admin/shipments', label: 'Giao hàng', icon: Truck },
      { path: '/admin/stores', label: 'Cửa hàng', icon: Building2 },
    ],
  },
  {
    key: 'b2b',
    label: 'Procurement B2B',
    items: [
      { path: '/admin/rfqs', label: 'RFQ', icon: FileText },
      { path: '/admin/contracts', label: 'Hợp đồng', icon: ScrollText },
      { path: '/admin/budgets', label: 'Ngân sách', icon: Wallet },
      { path: '/admin/purchase-requisitions', label: 'Yêu cầu mua hàng', icon: ClipboardList },
      { path: '/admin/grns', label: 'Biên bản nhận hàng', icon: PackageCheck },
    ],
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    items: [
      { path: '/admin/auctions', label: 'Đấu giá ngược', icon: Gavel },
      { path: '/admin/price-agreements', label: 'Thỏa thuận giá', icon: Handshake },
      { path: '/admin/sla', label: 'Giám sát SLA', icon: ShieldCheck },
    ],
  },
  {
    key: 'system',
    label: 'Hệ thống',
    items: [
      { path: '/admin/activity-logs', label: 'Nhật ký hoạt động', icon: Activity },
      { path: '/admin/settings', label: 'Cấu hình', icon: Settings },
    ],
  },
];


const ADMIN_SIDEBAR_MINI_KEY = 'admin_sidebar_mini';
const ADMIN_SECTIONS_KEY = 'admin_sidebar_sections';

function isItemActive(pathname: string, item: SidebarItem) {
  return item.exact
    ? pathname === item.path
    : pathname.startsWith(item.path) && pathname !== '/admin';
}

function AdminSidebarContent({
  pathname,
  onNavigate,
  mini = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  mini?: boolean;
}) {
  const [collapsedSections, setCollapsedSections] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(ADMIN_SECTIONS_KEY) || '[]'); } catch { return []; }
  });

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      try { localStorage.setItem(ADMIN_SECTIONS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`py-4 ${mini ? 'px-3 flex justify-center' : 'px-4'}`}>
        <Link to="/admin" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-900/40 shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          {!mini && (
            <div>
              <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-heading)' }}>Quản trị</p>
              <p className="text-white/40 text-[10px] leading-none mt-0.5">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      <div className="h-px bg-white/[0.06] mx-3" />

      {/* Quick stats */}
      {!mini && (
        <div className="mx-3 my-2 p-2.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-base font-black text-indigo-300" style={{ fontFamily: 'var(--font-heading)' }}>1,247</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Người dùng</p>
            </div>
            <div className="text-center">
              <p className="text-base font-black text-indigo-300" style={{ fontFamily: 'var(--font-heading)' }}>38</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Đơn hôm nay</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {adminSections.map(section => {
          const isCollapsed = collapsedSections.includes(section.key);
          const hasActive = section.items.some(item => isItemActive(pathname, item));

          return (
            <div key={section.key} className={mini ? '' : 'mb-1'}>
              {!mini && (
                <button
                  className="w-full flex items-center justify-between px-2 py-2 mt-1 text-[10px] text-white/30 uppercase tracking-[0.08em] hover:text-white/50 transition-colors"
                  onClick={() => toggleSection(section.key)}
                >
                  <span className={hasActive ? 'text-indigo-400/70' : ''}>{section.label}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
              )}
              {mini && <div className="h-px bg-white/[0.05] my-2 mx-1" />}

              {(!isCollapsed || mini) && (
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const isActive = isItemActive(pathname, item);

                    if (mini) {
                      return (
                        <TooltipProvider key={item.path}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Link to={item.path} onClick={onNavigate}
                                className={`flex items-center justify-center h-9 w-full rounded-lg transition-all relative ${
                                  isActive
                                    ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.badgeCount && item.badgeCount > 0 && (
                                  <span className="absolute -top-1 -right-1 h-4 min-w-[14px] rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center px-0.5">
                                    {item.badgeCount}
                                  </span>
                                )}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-gray-900 text-white border-white/10">{item.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <Link key={item.path} to={item.path} onClick={onNavigate}
                        className={`flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                            : 'text-white/50 hover:text-white/85 hover:bg-white/5'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                        <span className="flex-1">{item.label}</span>
                        {item.badgeCount && item.badgeCount > 0 && (
                          <span className="h-5 min-w-[20px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center px-1">
                            {item.badgeCount}
                          </span>
                        )}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="h-px bg-white/[0.06] mx-3" />

      {/* Footer */}
      <div className="p-3">
        {!mini && (
          <Link to="/"
            className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
        )}
      </div>
    </div>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mini, setMini] = useState(() => {
    try { return localStorage.getItem(ADMIN_SIDEBAR_MINI_KEY) === 'true'; } catch { return false; }
  });

  const toggleMini = useCallback(() => {
    setMini(prev => {
      const next = !prev;
      try { localStorage.setItem(ADMIN_SIDEBAR_MINI_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${mini ? 'w-[68px]' : 'w-[240px]'}`}
        style={{ background: 'linear-gradient(180deg, #0d0f1a 0%, #111322 100%)' }}
      >
        <div className="sticky top-0 h-screen overflow-y-auto relative flex flex-col">
          <AdminSidebarContent pathname={location.pathname} mini={mini} />
          <button
            className="absolute top-[72px] -right-3 h-6 w-6 rounded-full border border-white/10 bg-[#1a1d2e] shadow-lg flex items-center justify-center hover:bg-[#22263e] transition-colors z-10 text-white/50 hover:text-white/80"
            onClick={toggleMini}
            title={mini ? 'Mở rộng' : 'Thu gọn'}
          >
            {mini ? <PanelLeft className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 bg-[#f5f7fa] dark:bg-background">
        <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[240px] p-0 border-0" style={{ background: 'linear-gradient(180deg, #0d0f1a 0%, #111322 100%)' }}>
                    <AdminSidebarContent pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>
              <span className="lg:hidden font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Quản trị</span>
            </div>

            <div className="flex items-center gap-2">
              <NotificationDropdown />
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-border/50">
                  <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
                    <AvatarFallback className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 font-bold">{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Quản trị viên</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={handleLogout} title="Đăng xuất">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 min-h-[calc(100vh-3.5rem)]">
          <ScrollToTop />
          <Suspense fallback={<TableSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <CommandPalette context="admin" />
      <ScrollToTopButton />
    </div>
  );
}
