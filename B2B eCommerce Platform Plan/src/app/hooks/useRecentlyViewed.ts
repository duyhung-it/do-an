// ============================================================
// useRecentlyViewed — Hook lưu & lấy sản phẩm đã xem gần đây
// Dùng localStorage, max 8 sản phẩm
// ============================================================

import { useState, useEffect, useCallback } from 'react';

const KEY = 'cellphones_recently_viewed';
const MAX = 8;

export interface RecentItem {
  id: string;
  name: string;
  image: string;
  price: number;
  brand: string;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]');
    } catch { return []; }
  });

  const addItem = useCallback((item: RecentItem) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  return { items, addItem, clear };
}
