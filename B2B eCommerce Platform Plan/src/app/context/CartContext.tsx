// ============================================================
// Cart Context — Quản lý trạng thái giỏ hàng toàn ứng dụng
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cartApi } from '../services/api';
import type { CartItem } from '../types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartApi.getItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const existing = items.find(
      i => i.productId === item.productId && i.variantName === item.variantName,
    );
    if (existing) {
      const updated = await cartApi.updateQuantity(existing.id, existing.quantity + item.quantity);
      setItems(prev => prev.map(i => (i.id === existing.id ? updated : i)));
    } else {
      const newItem = await cartApi.addItem(item);
      setItems(prev => [...prev, newItem]);
    }
  }, [items]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return;
    const updated = await cartApi.updateQuantity(id, quantity);
    setItems(prev => prev.map(i => (i.id === id ? updated : i)));
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await cartApi.removeItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        loading,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong CartProvider');
  return ctx;
}