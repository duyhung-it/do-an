// ============================================================
// Notification Context — Quản lý thông báo realtime (giả lập)
// ============================================================

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode,
} from 'react';
import { notificationApi } from '../services/api';
import { useAuth } from './AuthContext';
import type { AppNotification } from '../types';
import { toast } from 'sonner';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Interval polling realtime (giả lập) — 30 giây
const POLL_INTERVAL = 30_000;

// Danh sách thông báo mẫu sẽ được tạo ngẫu nhiên
const randomNotifications = [
  { type: 'order' as const, title: 'Đơn hàng mới', priority: 'high' as const, category: 'giao_dich' as const, messages: [
    'Bạn có đơn hàng mới từ khách hàng ABC',
    'Đơn hàng DH-202500031 vừa được tạo',
    'Khách hàng đã đặt hàng 50 sản phẩm',
  ]},
  { type: 'product' as const, title: 'Cập nhật sản phẩm', priority: 'medium' as const, category: 'he_thong' as const, messages: [
    'Sản phẩm "Cảm biến nhiệt độ" đã được admin duyệt',
    'Có sản phẩm mới trong danh mục Điện tử',
    'Giá sản phẩm "Thép cuộn HRC" vừa được cập nhật',
  ]},
  { type: 'message' as const, title: 'Tin nhắn mới', priority: 'medium' as const, category: 'tuong_tac' as const, messages: [
    'Cửa hàng đã phản hồi tin nhắn của bạn',
    'Bạn có tin nhắn mới từ CELLPHONES',
    'Khách hàng hỏi về sản phẩm iPhone 15',
  ]},
  { type: 'system' as const, title: 'Thông báo hệ thống', priority: 'low' as const, category: 'he_thong' as const, messages: [
    'Hệ thống vừa được cập nhật phiên bản mới',
    'Chương trình khuyến mãi tháng 3 đã bắt đầu',
    'Nhắc nhở: Cập nhật thông tin tài khoản',
  ]},
  { type: 'payment' as const, title: 'Nhắc thanh toán', priority: 'urgent' as const, category: 'canh_bao' as const, messages: [
    'Có khoản thanh toán sắp đến hạn',
    'Thanh toán đơn DH-202500012 quá hạn 2 ngày',
  ]},
  { type: 'rfq' as const, title: 'Báo giá mới', priority: 'high' as const, category: 'giao_dich' as const, messages: [
    'Cửa hàng vừa gửi báo giá cho yêu cầu của bạn',
    'Có báo giá mới cần xem xét',
  ]},
  { type: 'shipment' as const, title: 'Cập nhật vận chuyển', priority: 'medium' as const, category: 'giao_dich' as const, messages: [
    'Đơn hàng của bạn đang được vận chuyển',
    'Đơn vị vận chuyển đã lấy hàng thành công',
  ]},
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevUnreadRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const [all, count] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(all);
      setUnreadCount(count);

      // Hiển thị toast nếu có thông báo mới
      if (prevUnreadRef.current > 0 && count > prevUnreadRef.current) {
        const newest = all.find(n => !n.isRead);
        if (newest) {
          toast.info(newest.title, { description: newest.message });
        }
      }
      prevUnreadRef.current = count;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lần đầu + polling
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    refresh();
    const timer = setInterval(() => {
      // Giả lập nhận thông báo mới ngẫu nhiên
      simulateNewNotification();
      refresh();
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [isAuthenticated, refresh]);

  const simulateNewNotification = async () => {
    // 30% cơ hội tạo thông báo mới mỗi lần poll
    if (Math.random() > 0.3) return;
    const group = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
    const message = group.messages[Math.floor(Math.random() * group.messages.length)];
    const noti: AppNotification = {
      id: `noti-${Date.now()}`,
      type: group.type,
      title: group.title,
      message,
      isRead: false,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      priority: group.priority,
      category: group.category,
      isActionable: false,
    };
    // Thêm trực tiếp vào API mock
    await notificationApi.add(noti);
  };

  const markAsRead = useCallback(async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const noti = notifications.find(n => n.id === id);
    await notificationApi.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (noti && !noti.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications phải được dùng bên trong NotificationProvider');
  return ctx;
}
