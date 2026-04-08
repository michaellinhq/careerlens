'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface CartRole {
  roleId: string;
  industryId: string;
}

interface CartContextValue {
  cart: CartRole[];
  addToCart: (roleId: string, industryId: string) => void;
  removeFromCart: (roleId: string) => void;
  isInCart: (roleId: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  isInCart: () => false,
  clearCart: () => {},
});

const STORAGE_KEY = 'careerlens_cart';
const MAX_CART = 8;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartRole[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  const addToCart = useCallback((roleId: string, industryId: string) => {
    setCart(prev => {
      if (prev.length >= MAX_CART) return prev;
      if (prev.some(r => r.roleId === roleId)) return prev;
      return [...prev, { roleId, industryId }];
    });
  }, []);

  const removeFromCart = useCallback((roleId: string) => {
    setCart(prev => prev.filter(r => r.roleId !== roleId));
  }, []);

  const isInCart = useCallback((roleId: string) => {
    return cart.some(r => r.roleId === roleId);
  }, [cart]);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <CartContext value={{ cart, addToCart, removeFromCart, isInCart, clearCart }}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  return useContext(CartContext);
}
