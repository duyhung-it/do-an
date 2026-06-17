// ============================================================
// Notification Context — Quản lý thông báo từ BE
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

// Interval polling — 30 giây
const POLL_INTERVAL = 30_000;

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
    const timer = setInterval(refresh, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [isAuthenticated, refresh]);

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
