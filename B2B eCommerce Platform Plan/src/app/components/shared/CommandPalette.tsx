// ============================================================
// Command Palette — Ctrl+K mở search box trung tâm (Nhóm 21A)
// 21A.01-06: Search pages/orders/products/suppliers, keyboard nav,
//            recent searches, tích hợp BuyerLayout & SellerLayout
// ============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Search, Command, CornerDownLeft, ArrowUp, ArrowDown, X,
  Home, Package, ClipboardList, Building2, FileText, ScrollText,
  Truck, CreditCard, Heart, Tag, MessageSquare, LayoutDashboard,
  Warehouse, Users, BarChart3, History, ShieldCheck, Settings,
  Clock, Copy, Zap, FileUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 21A.02: Searchable items
interface SearchItem {
  id: string;
  label: string;
  group: 'Trang' | 'Đơn hàng' | 'Sản phẩm' | 'NCC' | 'Gần đây';
  path: string;
  icon: React.ElementType;
  keywords?: string;
}

const BUYER_PAGES: SearchItem[] = [
  { id: 'p-home', label: 'Trang chủ', group: 'Trang', path: '/', icon: Home },
  { id: 'p-products', label: 'Sản phẩm', group: 'Trang', path: '/products', icon: Package, keywords: 'danh sách sản phẩm' },
  { id: 'p-suppliers', label: 'Nhà cung cấp', group: 'Trang', path: '/suppliers', icon: Building2 },
  { id: 'p-orders', label: 'Đơn hàng', group: 'Trang', path: '/orders', icon: ClipboardList },
  { id: 'p-rfq', label: 'Yêu cầu báo giá', group: 'Trang', path: '/rfq', icon: FileText },
  { id: 'p-contracts', label: 'Hợp đồng', group: 'Trang', path: '/contracts', icon: ScrollText },
  { id: 'p-shipments', label: 'Vận chuyển', group: 'Trang', path: '/shipments', icon: Truck },
  { id: 'p-payments', label: 'Thanh toán', group: 'Trang', path: '/payments', icon: CreditCard },
  { id: 'p-wishlist', label: 'Yêu thích', group: 'Trang', path: '/wishlist', icon: Heart },
  { id: 'p-templates', label: 'Đơn hàng mẫu', group: 'Trang', path: '/templates', icon: Copy },
  { id: 'p-invoices', label: 'Hoá đơn', group: 'Trang', path: '/invoices', icon: FileText },
  { id: 'p-promotions', label: 'Khuyến mãi', group: 'Trang', path: '/promotions', icon: Tag },
  { id: 'p-chat', label: 'Tin nhắn', group: 'Trang', path: '/chat', icon: MessageSquare },
  { id: 'p-bulk', label: 'Đặt hàng từ file', group: 'Trang', path: '/bulk-order', icon: FileUp },
  { id: 'p-quick', label: 'Đặt nhanh', group: 'Trang', path: '/quick-order', icon: Zap },
  { id: 'p-cart', label: 'Giỏ hàng', group: 'Trang', path: '/cart', icon: Package },
  { id: 'p-pr', label: 'Yêu cầu mua hàng', group: 'Trang', path: '/pr-list', icon: ClipboardList, keywords: 'purchase requisition PR yêu cầu nội bộ' },
];

const SELLER_PAGES: SearchItem[] = [
  { id: 'sp-dash', label: 'Tổng quan', group: 'Trang', path: '/seller', icon: LayoutDashboard },
  { id: 'sp-products', label: 'Sản phẩm', group: 'Trang', path: '/seller/products', icon: Package },
  { id: 'sp-orders', label: 'Đơn hàng', group: 'Trang', path: '/seller/orders', icon: ClipboardList },
  { id: 'sp-rfq', label: 'Báo giá', group: 'Trang', path: '/seller/rfq', icon: FileText },
  { id: 'sp-contracts', label: 'Hợp đồng', group: 'Trang', path: '/seller/contracts', icon: ScrollText },
  { id: 'sp-warehouse', label: 'Kho hàng', group: 'Trang', path: '/seller/warehouse', icon: Warehouse },
  { id: 'sp-shipments', label: 'Vận chuyển', group: 'Trang', path: '/seller/shipments', icon: Truck },
  { id: 'sp-payments', label: 'Công nợ', group: 'Trang', path: '/seller/payments', icon: CreditCard },
  { id: 'sp-promotions', label: 'Khuyến mãi', group: 'Trang', path: '/seller/promotions', icon: Tag },
  { id: 'sp-invoices', label: 'Hoá đơn', group: 'Trang', path: '/seller/invoices', icon: FileText },
  { id: 'sp-approvals', label: 'Phê duyệt', group: 'Trang', path: '/seller/approvals', icon: ShieldCheck },
  { id: 'sp-staff', label: 'Nhân viên', group: 'Trang', path: '/seller/staff', icon: Users },
  { id: 'sp-reports', label: 'Báo cáo', group: 'Trang', path: '/seller/reports', icon: BarChart3 },
  { id: 'sp-activity', label: 'Nhật ký', group: 'Trang', path: '/seller/activity', icon: History },
  { id: 'sp-chat', label: 'Tin nhắn', group: 'Trang', path: '/seller/chat', icon: MessageSquare },
  { id: 'sp-profile', label: 'Hồ sơ', group: 'Trang', path: '/seller/profile', icon: Settings },
];

// Mock search items for orders/products/suppliers
const MOCK_ORDERS: SearchItem[] = [
  { id: 'o-001', label: 'DH-2025-00001 — Lê Hoàng Anh', group: 'Đơn hàng', path: '/orders/order-001', icon: ClipboardList, keywords: 'đơn hàng DH 001' },
  { id: 'o-002', label: 'DH-2025-00002 — Trần Minh Đức', group: 'Đơn hàng', path: '/orders/order-002', icon: ClipboardList, keywords: 'đơn hàng DH 002' },
  { id: 'o-003', label: 'DH-2025-00003 — Nguyễn Hoàng Phúc', group: 'Đơn hàng', path: '/orders/order-003', icon: ClipboardList, keywords: 'đơn hàng DH 003' },
  { id: 'o-004', label: 'DH-2025-00004 — Phạm Thuý Dung', group: 'Đơn hàng', path: '/orders/order-004', icon: ClipboardList },
  { id: 'o-005', label: 'DH-2025-00005 — Vũ Thanh Hải', group: 'Đơn hàng', path: '/orders/order-005', icon: ClipboardList },
];

const MOCK_PRODUCTS: SearchItem[] = [
  { id: 'pr-001', label: 'Bo mạch Arduino Mega 2560', group: 'Sản phẩm', path: '/products/prod-001', icon: Package, keywords: 'arduino board' },
  { id: 'pr-002', label: 'Cảm biến nhiệt độ DS18B20', group: 'Sản phẩm', path: '/products/prod-002', icon: Package, keywords: 'cảm biến sensor' },
  { id: 'pr-003', label: 'Module WiFi ESP32-WROOM', group: 'Sản phẩm', path: '/products/prod-003', icon: Package, keywords: 'wifi module esp' },
  { id: 'pr-004', label: 'Vải cotton 100% tự nhiên', group: 'Sản phẩm', path: '/products/prod-004', icon: Package, keywords: 'vải cotton' },
  { id: 'pr-005', label: 'Thép hình H200x200 Q235', group: 'Sản phẩm', path: '/products/prod-005', icon: Package, keywords: 'thép hình' },
];

const MOCK_SUPPLIERS: SearchItem[] = [
  { id: 'su-001', label: 'Công ty TNHH Phương Nam Electronics', group: 'NCC', path: '/suppliers/sup-01', icon: Building2, keywords: 'phương nam electronics' },
  { id: 'su-002', label: 'Dệt may Sài Gòn TPHCM', group: 'NCC', path: '/suppliers/sup-02', icon: Building2, keywords: 'dệt may sài gòn' },
  { id: 'su-003', label: 'Thép Việt Nhật JSC', group: 'NCC', path: '/suppliers/sup-03', icon: Building2, keywords: 'thép việt nhật' },
  { id: 'su-004', label: 'Bao bì Đông Á Pack', group: 'NCC', path: '/suppliers/sup-04', icon: Building2, keywords: 'bao bì đông á' },
];

const RECENT_KEY = 'cmd_palette_recent';
const MAX_RECENT = 5;

function getRecentSearches(): SearchItem[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch { return []; }
}

function saveRecentSearch(item: SearchItem) {
  const recent = getRecentSearches().filter(r => r.id !== item.id);
  recent.unshift({ ...item, group: 'Gần đây' });
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

// Group icon map
const groupIcons: Record<string, React.ElementType> = {
  'Trang': Home,
  'Đơn hàng': ClipboardList,
  'Sản phẩm': Package,
  'NCC': Building2,
  'Gần đây': Clock,
};

interface CommandPaletteProps {
  context: 'buyer' | 'seller';
}

export function CommandPalette({ context }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // All items
  const allItems = useMemo(() => {
    const pages = context === 'seller' ? SELLER_PAGES : BUYER_PAGES;
    return [...pages, ...MOCK_ORDERS, ...MOCK_PRODUCTS, ...MOCK_SUPPLIERS];
  }, [context]);

  // 21A.02-03: Filter + group by type
  const results = useMemo(() => {
    if (!query.trim()) {
      const recent = getRecentSearches();
      return recent.length > 0 ? recent : allItems.slice(0, 8);
    }
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords?.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q),
    );
  }, [query, allItems]);

  // 21A.03: Group results
  const grouped = useMemo(() => {
    const groups = new Map<string, SearchItem[]>();
    for (const item of results) {
      const g = groups.get(item.group) ?? [];
      g.push(item);
      groups.set(item.group, g);
    }
    return Array.from(groups.entries());
  }, [results]);

  const flatResults = useMemo(() => results, [results]);

  // 21A.01: Ctrl+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // 21A.04: Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      const item = flatResults[selectedIndex];
      saveRecentSearch(item);
      navigate(item.path);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, [flatResults, selectedIndex, navigate]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    saveRecentSearch(item);
    navigate(item.path);
    setOpen(false);
  };

  if (!open) return null;

  let globalIdx = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-[15vh] z-50 mx-auto max-w-lg rounded-xl bg-background border shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Tìm trang, đơn hàng, sản phẩm, NCC..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {flatResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy kết quả cho &quot;{query}&quot;
                </div>
              ) : (
                grouped.map(([group, items]) => {
                  const GroupIcon = groupIcons[group] ?? Search;
                  return (
                    <div key={group}>
                      <div className="px-4 py-1.5 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                        <GroupIcon className="h-3 w-3" />
                        {group}
                      </div>
                      {items.map(item => {
                        globalIdx++;
                        const idx = globalIdx;
                        const isActive = idx === selectedIndex;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            data-idx={idx}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1 truncate">{item.label}</span>
                            {isActive && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-2 border-t flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> Di chuyển</span>
              <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> Chọn</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Đóng</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Trigger button component for layouts
export function CommandPaletteTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors text-sm"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Tìm kiếm...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded border text-[10px]">
        <Command className="h-2.5 w-2.5" />K
      </kbd>
    </button>
  );
}