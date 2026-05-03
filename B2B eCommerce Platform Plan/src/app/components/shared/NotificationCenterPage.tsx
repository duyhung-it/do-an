// ============================================================
// Trung tâm thông báo — Nhóm 28B
// Tabs, filter, group by day, action buttons, empty state
// Dùng chung cho Buyer + Seller
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell, Check, CheckCheck, Trash2, Package, Search,
  ClipboardList, Settings, MessageCircle, Filter,
  FileText, ScrollText, CreditCard, Truck, ShieldCheck,
  Star, RotateCcw, AlertCircle, Download, Wallet,
  ChevronRight, BellOff, Inbox,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { AppBreadcrumb } from './AppBreadcrumb';
import { useNotifications } from '../../context/NotificationContext';
import { notificationApi } from '../../services/api';
import { toast } from 'sonner';
import type { AppNotification, NotificationType, NotificationPriority } from '../../types';

// --- Icon & label maps ---
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

const typeBgColor: Record<NotificationType, string> = {
  order: 'bg-blue-50',
  product: 'bg-purple-50',
  system: 'bg-gray-50',
  message: 'bg-green-50',
  rfq: 'bg-indigo-50',
  contract: 'bg-cyan-50',
  payment: 'bg-amber-50',
  shipment: 'bg-orange-50',
  approval: 'bg-red-50',
  review: 'bg-yellow-50',
  credit: 'bg-teal-50',
  return: 'bg-pink-50',
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

const priorityConfig: Record<NotificationPriority, { label: string; className: string; dot: string }> = {
  low: { label: 'Thấp', className: 'text-gray-500', dot: 'bg-gray-300' },
  medium: { label: 'Trung bình', className: 'text-blue-500', dot: 'bg-blue-400' },
  high: { label: 'Cao', className: 'text-orange-500', dot: 'bg-orange-400' },
  urgent: { label: 'Khẩn cấp', className: 'text-red-600', dot: 'bg-red-500' },
};

const ALL_TYPES: NotificationType[] = ['order', 'product', 'system', 'message', 'rfq', 'contract', 'payment', 'shipment', 'approval', 'review', 'credit', 'return'];
const ALL_PRIORITIES: NotificationPriority[] = ['low', 'medium', 'high', 'urgent'];

type TabKey = 'all' | 'unread' | 'important';

/** Group notifications by relative time (28B.07) */
function groupByTime(items: AppNotification[]): { label: string; items: AppNotification[] }[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);

  const groups: Record<string, AppNotification[]> = {};
  for (const item of items) {
    const date = item.createdAt.slice(0, 10);
    let label: string;
    if (date >= today) label = 'Hôm nay';
    else if (date >= yesterday) label = 'Hôm qua';
    else if (date >= weekAgo) label = 'Tuần trước';
    else label = 'Cũ hơn';
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  const order = ['Hôm nay', 'Hôm qua', 'Tuần trước', 'Cũ hơn'];
  return order.filter(l => groups[l]).map(label => ({ label, items: groups[label] }));
}

export function NotificationCenterPage() {
  const navigate = useNavigate();
  const {
    notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refresh,
  } = useNotifications();

  const [tab, setTab] = useState<TabKey>('all');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  useEffect(() => { refresh(); }, [refresh]);

  // Filter logic
  const filtered = useMemo(() => {
    let data = [...notifications];

    // Tab filter
    if (tab === 'unread') data = data.filter(n => !n.isRead);
    if (tab === 'important') data = data.filter(n => n.priority === 'high' || n.priority === 'urgent');

    // Type filter
    if (filterType) data = data.filter(n => n.type === filterType);

    // Priority filter
    if (filterPriority) data = data.filter(n => n.priority === filterPriority);

    // Search
    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }

    return data;
  }, [notifications, tab, filterType, filterPriority, searchText]);

  const grouped = useMemo(() => groupByTime(filtered), [filtered]);

  // Stats
  const importantCount = useMemo(
    () => notifications.filter(n => !n.isRead && (n.priority === 'high' || n.priority === 'urgent')).length,
    [notifications],
  );

  const handleClick = (noti: AppNotification) => {
    if (!noti.isRead) markAsRead(noti.id);
    const url = noti.actionUrl ?? noti.link;
    if (url) navigate(url);
  };

  const handleDeleteAll = async () => {
    if (!confirm('Bạn có chắc muốn xoá tất cả thông báo đã đọc?')) return;
    const readOnes = notifications.filter(n => n.isRead);
    for (const n of readOnes) {
      await deleteNotification(n.id);
    }
    toast.success(`Đã xoá ${readOnes.length} thông báo`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thông báo' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Trung tâm thông báo
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" /> Đọc tất cả
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-1" /> Xoá đã đọc
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab('all')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground">Tổng cộng</p>
              <p className="text-2xl">{notifications.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab('unread')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground">Chưa đọc</p>
              <p className="text-2xl">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab('important')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground">Quan trọng</p>
              <p className="text-2xl">{importantCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Filters */}
      <Tabs value={tab} onValueChange={v => setTab(v as TabKey)} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <TabsList>
            <TabsTrigger value="all">
              Tất cả
              <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Chưa đọc
              {unreadCount > 0 && <Badge className="ml-1">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="important">
              Quan trọng
              {importantCount > 0 && <Badge variant="destructive" className="ml-1">{importantCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Tìm thông báo..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={v => setFilterType(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {ALL_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">{typeIcon[t]} {typeLabel[t]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={v => setFilterPriority(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {ALL_PRIORITIES.map(p => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${priorityConfig[p].dot}`} />
                      {priorityConfig[p].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content — shared for all tabs */}
        {['all', 'unread', 'important'].map(tabKey => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-2">
            {/* Empty state (28B.08) */}
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">Không có thông báo nào</p>
                  <p className="text-muted-foreground mt-1">
                    {tab === 'unread' ? 'Tất cả thông báo đã được đọc' :
                     tab === 'important' ? 'Không có thông báo quan trọng' :
                     'Bạn sẽ nhận được thông báo khi có hoạt động mới'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Grouped by day (28B.07) */
              grouped.map(group => (
                <div key={group.label}>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
                    <p className="text-muted-foreground flex items-center gap-2">
                      {group.label}
                      <Badge variant="outline">{group.items.length}</Badge>
                    </p>
                  </div>
                  <div className="space-y-2">
                    {group.items.map(noti => (
                      <NotificationCard
                        key={noti.id}
                        notification={noti}
                        onClick={() => handleClick(noti)}
                        onMarkRead={() => markAsRead(noti.id)}
                        onDelete={() => deleteNotification(noti.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// --- Notification Card Component (28B.04, 28B.06) ---
function NotificationCard({
  notification: noti,
  onClick,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onClick: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all group ${
        !noti.isRead ? 'border-l-4 border-l-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Icon */}
          <div className={`h-10 w-10 rounded-full ${typeBgColor[noti.type]} flex items-center justify-center shrink-0`}>
            {typeIcon[noti.type] ?? <Bell className="h-4 w-4" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={!noti.isRead ? 'font-medium' : ''}>{noti.title}</span>
                {!noti.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                {noti.priority && (noti.priority === 'high' || noti.priority === 'urgent') && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      noti.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                    }`}
                  >
                    {priorityConfig[noti.priority].label}
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-xs whitespace-nowrap shrink-0">{noti.createdAt}</span>
            </div>

            <p className="text-muted-foreground mt-0.5 line-clamp-2">{noti.message}</p>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {typeLabel[noti.type] ?? noti.type}
                </Badge>
                {noti.priority && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${priorityConfig[noti.priority].dot}`} />
                    {priorityConfig[noti.priority].label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Action button */}
                {noti.isActionable && noti.actionLabel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={e => { e.stopPropagation(); onClick(); }}
                  >
                    {noti.actionLabel} <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                )}
                {!noti.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={e => { e.stopPropagation(); onMarkRead(); }}
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                {/* Delete / swipe dismiss mobile (28B.06) */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={e => { e.stopPropagation(); onDelete(); }}
                  title="Xoá"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
