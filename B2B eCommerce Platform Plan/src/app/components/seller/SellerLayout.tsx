// ============================================================
// SellerLayout — Layout Seller nâng cấp UI-C Đợt 12
// C12.01–C12.10: sidebar grouped, collapsible, mini mode
// ============================================================

import { useState, Suspense, useCallback, type ElementType } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, ClipboardList, User, Menu, X, ChevronLeft, Store, LogOut,
  MessageSquare, FileText, ScrollText, Warehouse, Truck, CreditCard, Users, Tag,
  ClipboardCheck, History, Star, RotateCcw, Bell, ReceiptText, Gavel, Handshake,
  ShieldCheck, FolderOpen, Shield, FileBarChart, Puzzle, ChevronDown, Settings,
  PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
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

// --- C12.01–C12.06: Grouped sidebar items ---
interface SidebarItem {
  path: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
}

interface SidebarSection {
  key: string;
  label: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    key: 'main',
    label: 'Chính',
    items: [
      { path: '/seller', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
      { path: '/seller/products', label: 'Sản phẩm', icon: Package },
      { path: '/seller/orders', label: 'Đơn hàng', icon: ClipboardList },
    ],
  },
  {
    key: 'sales',
    label: 'Bán hàng',
    items: [
      { path: '/seller/rfq', label: 'Báo giá', icon: FileText },
      { path: '/seller/contracts', label: 'Hợp đồng', icon: ScrollText },
      { path: '/seller/promotions', label: 'Khuyến mãi', icon: Tag },
      { path: '/seller/auctions', label: 'Đấu giá', icon: Gavel },
      { path: '/seller/price-agreements', label: 'Thoả thuận giá', icon: Handshake },
    ],
  },
  {
    key: 'ops',
    label: 'Vận hành',
    items: [
      { path: '/seller/warehouse', label: 'Kho hàng', icon: Warehouse },
      { path: '/seller/shipments', label: 'Vận chuyển', icon: Truck },
      { path: '/seller/returns', label: 'Trả hàng', icon: RotateCcw },
      { path: '/seller/warranty', label: 'Bảo hành', icon: Shield },
      { path: '/seller/sla', label: 'Cam kết DV', icon: ShieldCheck },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    items: [
      { path: '/seller/payments', label: 'Công nợ', icon: CreditCard },
      { path: '/seller/invoices', label: 'Hoá đơn', icon: FileText },
      { path: '/seller/credits', label: 'Tín dụng', icon: CreditCard },
      { path: '/seller/debit-credit', label: 'Ghi nợ/có', icon: ReceiptText },
    ],
  },
  {
    key: 'settings',
    label: 'Cài đặt',
    items: [
      { path: '/seller/staff', label: 'Nhân viên', icon: Users },
      { path: '/seller/approvals', label: 'Phê duyệt', icon: ClipboardCheck },
      { path: '/seller/activity', label: 'Nhật ký', icon: History },
      { path: '/seller/documents', label: 'Tài liệu', icon: FolderOpen },
      { path: '/seller/integrations', label: 'Tích hợp', icon: Puzzle },
      { path: '/seller/reports/builder', label: 'Tạo báo cáo', icon: FileBarChart },
      { path: '/seller/reviews', label: 'Đánh giá', icon: Star },
      { path: '/seller/notifications', label: 'Thông báo', icon: Bell },
      { path: '/seller/chat', label: 'Tin nhắn', icon: MessageSquare },
      { path: '/seller/profile', label: 'Hồ sơ', icon: User },
    ],
  },
];

const SIDEBAR_MINI_KEY = 'seller_sidebar_mini';
const SIDEBAR_SECTIONS_KEY = 'seller_sidebar_sections';

function isItemActive(pathname: string, item: SidebarItem) {
  return item.exact
    ? pathname === item.path
    : pathname.startsWith(item.path) && pathname !== '/seller';
}

// --- Sidebar content (shared for desktop + mobile) ---
function SidebarContent({
  pathname,
  onNavigate,
  mini = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  mini?: boolean;
}) {
  // C12.07: Collapsible sections (lưu localStorage)
  const [collapsedSections, setCollapsedSections] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SIDEBAR_SECTIONS_KEY) || '[]');
    } catch { return []; }
  });

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      try { localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`py-4 ${mini ? 'px-3 flex justify-center' : 'px-4'}`}>
        <Link to="/seller" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#e31837] to-[#c91432] flex items-center justify-center shadow-lg shadow-red-900/30 shrink-0">
            <Store className="h-4 w-4 text-white" />
          </div>
          {!mini && (
            <div>
              <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: 'var(--font-heading)' }}>Kênh NCC</p>
              <p className="text-white/40 text-[10px] leading-none mt-0.5">Seller Portal</p>
            </div>
          )}
        </Link>
      </div>

      <div className="h-px bg-white/[0.06] mx-3" />

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {sidebarSections.map(section => {
          const isCollapsed = collapsedSections.includes(section.key);
          const hasActive = section.items.some(item => isItemActive(pathname, item));

          return (
            <div key={section.key} className={mini ? '' : 'mb-1'}>
              {/* Section label */}
              {!mini && (
                <button
                  className="w-full flex items-center justify-between px-2 py-2 mt-1 text-[10px] text-white/30 uppercase tracking-[0.08em] hover:text-white/50 transition-colors"
                  onClick={() => toggleSection(section.key)}
                >
                  <span className={hasActive ? 'text-[#e31837]/70' : ''}>{section.label}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
              )}
              {mini && <div className="h-px bg-white/[0.05] my-2 mx-1" />}

              {/* Section items */}
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
                                className={`flex items-center justify-center h-9 w-full rounded-lg transition-all ${
                                  isActive
                                    ? 'bg-[#e31837]/20 text-[#e31837] shadow-sm'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                              >
                                <item.icon className="h-4 w-4" />
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
                            ? 'bg-[#e31837]/15 text-[#e31837] font-medium shadow-sm'
                            : 'text-white/50 hover:text-white/85 hover:bg-white/5'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#e31837]' : ''}`} />
                        <span>{item.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e31837]" />}
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
            Về cửa hàng
          </Link>
        )}
      </div>
    </div>
  );
}

export function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // C12.08: Mini mode
  const [mini, setMini] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_MINI_KEY) === 'true'; } catch { return false; }
  });

  const toggleMini = useCallback(() => {
    setMini(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_MINI_KEY, String(next)); } catch { /* ignore */ }
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
        style={{ background: 'linear-gradient(180deg, #0f1117 0%, #131620 100%)' }}
      >
        <div className="sticky top-0 h-screen overflow-y-auto relative flex flex-col">
          <SidebarContent pathname={location.pathname} mini={mini} />
          {/* Toggle button */}
          <button
            className="absolute top-[72px] -right-3 h-6 w-6 rounded-full border border-white/10 bg-[#1a1d27] shadow-lg flex items-center justify-center hover:bg-[#22263a] transition-colors z-10 text-white/50 hover:text-white/80"
            onClick={toggleMini}
            title={mini ? 'Mở rộng' : 'Thu gọn'}
          >
            {mini ? <PanelLeft className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 bg-[#f5f7fa] dark:bg-background">
        {/* Top header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <div className="lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[240px] p-0 border-0" style={{ background: 'linear-gradient(180deg, #0f1117 0%, #131620 100%)' }}>
                    <SidebarContent pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>
              <span className="lg:hidden font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Kênh NCC</span>
            </div>

            <div className="flex items-center gap-2">
              <NotificationDropdown />
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-border/50">
                  <Avatar className="h-8 w-8 ring-2 ring-[#e31837]/20">
                    <AvatarFallback className="text-xs bg-[#e31837]/10 text-[#e31837] font-bold">{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Nhà cung cấp</p>
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
      <CommandPalette context="seller" />
      <ScrollToTopButton />
    </div>
  );
}
