// ============================================================
// Wishlist Context — Quản lý trạng thái danh sách yêu thích
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';
import type { WishlistItem } from '../types';

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  removeById: (id: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistApi.getByUser(user.id);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    const newItem = await wishlistApi.add(user.id, productId);
    setItems(prev => {
      if (prev.some(i => i.productId === productId)) return prev;
      return [newItem, ...prev];
    });
  }, [user]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    await wishlistApi.removeByProduct(user.id, productId);
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, [user]);

  const removeById = useCallback(async (id: string) => {
    await wishlistApi.remove(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(i => i.productId === productId);
  }, [items]);

  const clearWishlist = useCallback(async () => {
    if (!user) return;
    await wishlistApi.clear(user.id);
    setItems([]);
  }, [user]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        loading,
        addToWishlist,
        removeFromWishlist,
        removeById,
        isInWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist phải được dùng bên trong WishlistProvider');
  return ctx;
}
