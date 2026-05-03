// ============================================================
// BuyerMegaMenu — Mega Menu cho Buyer navigation
// C10.01–C10.10: nhóm 30+ items thành 5 menu chính, grid layout
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Package, Building2, ClipboardList, FileText, ScrollText, Truck, CreditCard,
  Heart, Copy, Tag, MessageSquare, FileUp, Zap, BarChart3, Star, RotateCcw,
  Users, Bell, ClipboardCheck, Wallet, Gavel, Handshake, FolderOpen,
  Shield, Award, FileBarChart, Puzzle, ShoppingCart, ChevronDown, Layers,
  Wrench, DollarSign, HelpCircle, Search, ArrowRight,
} from 'lucide-react';
import type { ElementType } from 'react';

// --- Kiểu dữ liệu ---
interface MegaMenuItem {
  path: string;
  label: string;
  icon: ElementType;
  description: string;
}

interface MegaMenuGroup {
  key: string;
  label: string;
  icon: ElementType;
  items: MegaMenuItem[];
}

// --- C10.03–C10.08: Menu groups ---
const megaMenuGroups: MegaMenuGroup[] = [
  {
    key: 'products',
    label: 'Sản phẩm',
    icon: Layers,
    items: [
      { path: '/products', label: 'Tất cả sản phẩm', icon: Package, description: 'Duyệt danh mục sản phẩm' },
      { path: '/suppliers', label: 'Nhà cung cấp', icon: Building2, description: 'Tìm & đánh giá NCC' },
      { path: '/compare', label: 'So sánh sản phẩm', icon: Search, description: 'So sánh giá & chất lượng' },
      { path: '/wishlist', label: 'Yêu thích', icon: Heart, description: 'Sản phẩm đã lưu' },
      { path: '/promotions', label: 'Khuyến mãi', icon: Tag, description: 'Ưu đãi & giảm giá' },
      { path: '/reviews', label: 'Đánh giá', icon: Star, description: 'Đánh giá sản phẩm & NCC' },
    ],
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    icon: ClipboardList,
    items: [
      { path: '/orders', label: 'Đơn hàng', icon: ClipboardList, description: 'Quản lý đơn đặt hàng' },
      { path: '/cart', label: 'Giỏ hàng', icon: ShoppingCart, description: 'Sản phẩm trong giỏ' },
      { path: '/quick-order', label: 'Đặt nhanh', icon: Zap, description: 'Đặt hàng bằng mã SP' },
      { path: '/bulk-order', label: 'Đặt từ file', icon: FileUp, description: 'Upload file Excel/CSV' },
      { path: '/templates', label: 'Đơn hàng mẫu', icon: Copy, description: 'Mẫu đặt hàng lặp lại' },
      { path: '/shipments', label: 'Vận chuyển', icon: Truck, description: 'Theo dõi giao hàng' },
      { path: '/returns', label: 'Trả hàng', icon: RotateCcw, description: 'Yêu cầu đổi/trả' },
    ],
  },
  {
    key: 'tools',
    label: 'Công cụ',
    icon: Wrench,
    items: [
      { path: '/rfq', label: 'Yêu cầu báo giá', icon: FileText, description: 'Gửi RFQ đến NCC' },
      { path: '/contracts', label: 'Hợp đồng', icon: ScrollText, description: 'Quản lý hợp đồng' },
      { path: '/auctions', label: 'Đấu giá', icon: Gavel, description: 'Tham gia đấu giá' },
      { path: '/price-agreements', label: 'Thoả thuận giá', icon: Handshake, description: 'Giá thoả thuận dài hạn' },
      { path: '/pr-list', label: 'Yêu cầu mua', icon: ClipboardCheck, description: 'PR nội bộ' },
      { path: '/grn', label: 'Nhận hàng', icon: Package, description: 'Phiếu nhận hàng GRN' },
      { path: '/reports', label: 'Tạo báo cáo', icon: FileBarChart, description: 'Báo cáo tuỳ chỉnh' },
      { path: '/integrations', label: 'Tích hợp', icon: Puzzle, description: 'API & kết nối hệ thống' },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    icon: DollarSign,
    items: [
      { path: '/payments', label: 'Thanh toán', icon: CreditCard, description: 'Lịch sử & quản lý' },
      { path: '/invoices', label: 'Hoá đơn', icon: FileText, description: 'Hoá đơn mua hàng' },
      { path: '/budget', label: 'Ngân sách', icon: Wallet, description: 'Quản lý ngân sách' },
      { path: '/loyalty', label: 'Thân thiết', icon: Award, description: 'Tích điểm & ưu đãi' },
      { path: '/analytics', label: 'Phân tích chi phí', icon: BarChart3, description: 'Thống kê chi tiêu' },
    ],
  },
  {
    key: 'support',
    label: 'Hỗ trợ',
    icon: HelpCircle,
    items: [
      { path: '/chat', label: 'Tin nhắn', icon: MessageSquare, description: 'Chat với NCC & hỗ trợ' },
      { path: '/warranty', label: 'Bảo hành', icon: Shield, description: 'Theo dõi bảo hành' },
      { path: '/documents', label: 'Tài liệu', icon: FolderOpen, description: 'Kho tài liệu' },
      { path: '/notifications', label: 'Thông báo', icon: Bell, description: 'Cập nhật hệ thống' },
      { path: '/team', label: 'Nhóm mua', icon: Users, description: 'Quản lý nhóm mua hàng' },
    ],
  },
];

// Tất cả paths (dùng cho mobile)
export const allBuyerNavPaths = megaMenuGroups.flatMap(g => g.items.map(i => i.path));

// --- Desktop Mega Menu ---
export function BuyerMegaMenu() {
  const location = useLocation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback((key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenKey(key);
  }, []);

  const handleClose = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpenKey(null), 150);
  }, []);

  const handleKeepOpen = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // C10.09: Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    if (openKey) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openKey]);

  const isGroupActive = (group: MegaMenuGroup) => {
    return group.items.some(item =>
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path)
    );
  };

  return (
    <div ref={menuRef} className="hidden lg:flex items-center">
      {megaMenuGroups.map(group => {
        const isOpen = openKey === group.key;
        const active = isGroupActive(group);

        return (
          <div
            key={group.key}
            className="relative"
            onMouseEnter={() => handleOpen(group.key)}
            onMouseLeave={handleClose}
          >
            {/* Trigger */}
            <button
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors
                ${active ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
              `}
              onClick={() => setOpenKey(isOpen ? null : group.key)}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <group.icon className="h-4 w-4" />
              <span>{group.label}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* C10.09: Dropdown with animation */}
            {isOpen && (
              <div
                className="absolute top-full left-0 pt-1 z-50"
                onMouseEnter={handleKeepOpen}
                onMouseLeave={handleClose}
              >
                <div
                  className="bg-card border rounded-xl shadow-lg p-4 min-w-[480px] animate-in fade-in slide-in-from-top-2 duration-200"
                  role="menu"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                    <group.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                      {group.label}
                    </span>
                  </div>

                  {/* C10.03: Grid layout */}
                  <div className={`grid gap-1 ${group.items.length > 6 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {group.items.map(item => {
                      const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpenKey(null)}
                          className={`
                            flex items-start gap-3 p-2.5 rounded-lg transition-colors group/item
                            ${isActive
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/70'
                            }
                          `}
                          role="menuitem"
                        >
                          <div className={`
                            mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                            ${isActive
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted/80 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary'
                            }
                          `}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm truncate">{item.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- C10.10: Mobile Menu with collapsible sections ---
interface MobileMenuProps {
  onNavigate: () => void;
}

export function BuyerMobileMenu({ onNavigate }: MobileMenuProps) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (key: string) => {
    setOpenSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-1">
      {megaMenuGroups.map(group => {
        const isOpen = openSections.includes(group.key);
        const active = group.items.some(item =>
          item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
        );

        return (
          <div key={group.key}>
            {/* Section header */}
            <button
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                ${active ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted/50'}
              `}
              onClick={() => toggleSection(group.key)}
            >
              <div className="flex items-center gap-2.5">
                <div className={`
                  h-7 w-7 rounded-md flex items-center justify-center
                  ${active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}
                `}>
                  <group.icon className="h-3.5 w-3.5" />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)' }}>{group.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Section items */}
            {isOpen && (
              <div className="ml-4 mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                {group.items.map(item => {
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                        ${isActive
                          ? 'bg-primary/10 text-primary border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ArrowRight className="h-3 w-3 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
