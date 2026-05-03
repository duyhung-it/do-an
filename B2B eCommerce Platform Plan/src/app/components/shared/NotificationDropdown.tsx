// ============================================================
// Dropdown thông báo — Filter tabs, nhóm thời gian, badge type
// Nhóm 28C: icon màu theo loại, link "Xem tất cả", priority badge
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Bell, Check, CheckCheck, Trash2, Package,
  ClipboardList, Settings, MessageCircle, Filter,
  FileText, ScrollText, CreditCard, Truck, ShieldCheck,
  Star, RotateCcw, AlertCircle, ArrowRight, Wallet,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useNotifications } from '../../context/NotificationContext';
import type { AppNotification, NotificationType, NotificationPriority } from '../../types';

const typeIcon: Record<NotificationType, React.ReactNode> = {
  order: <ClipboardList className="h-4 w-4 text-blue-500" />,
  product: <Package className="h-4 w-4 text-purple-500" />,
  system: <Settings className="h-4 w-4 text-gray-500" />,
  message: <MessageCircle className="h-4 w-4 text-green-500" />,
  rfq: <FileText className="h-4 w-4 text-indigo-500" />,
  contract: <ScrollText className="h-4 w-4 text-cyan-500" />,
  payment: <CreditCard className="h-4 w-4 text-amber-500" />,
  shipment: <Truck className="h-4 w-4 text-orange-500" />,
  approval: <ShieldCheck className="h-4 w-4 text-red-500" />,
  review: <Star className="h-4 w-4 text-yellow-500" />,
  credit: <Wallet className="h-4 w-4 text-teal-500" />,
  return: <RotateCcw className="h-4 w-4 text-pink-500" />,
};

const typeLabel: Record<NotificationType, string> = {
  order: 'Đơn hàng',
  product: 'Sản phẩm',
  system: 'Hệ thống',
  message: 'Tin nhắn',
  rfq: 'Báo giá',
  contract: 'Hợp đồng',
  payment: 'Thanh toán',
  shipment: 'Vận chuyển',
  approval: 'Phê duyệt',
  review: 'Đánh giá',
  credit: 'Tín dụng',
  return: 'Trả hàng',
};

const priorityBadge: Record<NotificationPriority, { label: string; className: string }> = {
  low: { label: '', className: '' },
  medium: { label: '', className: '' },
  high: { label: 'Quan trọng', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  urgent: { label: 'Khẩn cấp', className: 'bg-red-100 text-red-700 border-red-200' },
};

type FilterType = 'all' | 'unread' | NotificationType;

/** Group notifications by relative time */
function groupByTime(items: AppNotification[]): { label: string; items: AppNotification[] }[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  const groups: Record<string, AppNotification[]> = {};
  for (const item of items) {
    const date = item.createdAt.slice(0, 10);
    let label: string;
    if (date === today) label = 'Hôm nay';
    else if (date === yesterday) label = 'Hôm qua';
    else label = 'Trước đó';
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  const order = ['Hôm nay', 'Hôm qua', 'Trước đó'];
  return order.filter(l => groups[l]).map(label => ({ label, items: groups[label] }));
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const {
    notifications, unreadCount,
    markAsRead, markAllAsRead, deleteNotification, refresh,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const grouped = useMemo(() => groupByTime(filtered), [filtered]);

  // Count per type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notifications) {
      if (!n.isRead) counts[n.type] = (counts[n.type] ?? 0) + 1;
    }
    return counts;
  }, [notifications]);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) refresh();
  };

  const handleClick = (noti: AppNotification) => {
    if (!noti.isRead) markAsRead(noti.id);
    const url = noti.actionUrl ?? noti.link;
    if (url) {
      navigate(url);
      setOpen(false);
    }
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'order', label: 'Đơn hàng' },
    { key: 'payment', label: 'Thanh toán' },
    { key: 'rfq', label: 'Báo giá' },
    { key: 'message', label: 'Tin nhắn' },
    { key: 'system', label: 'Hệ thống' },
  ];

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="flex items-center gap-2">
            Thông báo
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} mới</Badge>
            )}
          </h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7" onClick={markAllAsRead}>
              <CheckCheck className="mr-1 h-3 w-3" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
          {filters.map(f => {
            const count = f.key === 'all'
              ? unreadCount
              : f.key === 'unread'
                ? unreadCount
                : (typeCounts[f.key] ?? 0);
            return (
              <button
                key={f.key}
                className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {count > 0 && (
                  <span className={`ml-1 ${filter === f.key ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Không có thông báo' : filter === 'unread' ? 'Không có thông báo chưa đọc' : `Không có thông báo ${typeLabel[filter as NotificationType] ?? ''}`}
              </p>
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.label}>
                <div className="px-3 py-1.5 bg-muted/50">
                  <span className="text-xs text-muted-foreground">{group.label}</span>
                </div>
                {group.items.map(noti => (
                  <div key={noti.id}>
                    <div
                      className={`flex gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !noti.isRead ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleClick(noti)}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {typeIcon[noti.type] ?? <Bell className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={!noti.isRead ? 'font-medium' : ''}>{noti.title}</p>
                          {!noti.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{noti.message}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-muted-foreground text-xs">{noti.createdAt}</span>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {typeLabel[noti.type] ?? noti.type}
                          </Badge>
                          {noti.priority && priorityBadge[noti.priority]?.label && (
                            <Badge variant="outline" className={`text-xs px-1.5 py-0 ${priorityBadge[noti.priority].className}`}>
                              {priorityBadge[noti.priority].label}
                            </Badge>
                          )}
                        </div>
                        {noti.isActionable && noti.actionLabel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1.5 h-6 text-xs"
                            onClick={e => { e.stopPropagation(); handleClick(noti); }}
                          >
                            {noti.actionLabel}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {!noti.isRead && (
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={e => { e.stopPropagation(); markAsRead(noti.id); }}
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          className="text-muted-foreground hover:text-destructive"
                          onClick={e => { e.stopPropagation(); deleteNotification(noti.id); }}
                          title="Xoá"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            ))
          )}
        </ScrollArea>

        {/* Footer — Xem tất cả (28C.02) */}
        <div className="p-2 border-t">
          <Link to="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-center">
              Xem tất cả thông báo <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
