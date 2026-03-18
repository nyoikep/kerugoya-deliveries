// src/contexts/CartContext.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useCart, CartItem } from '@/hooks/useCart';

interface CartContextType {
  cartItems: CartItem[];
  isHydrated: boolean;
  addToCart: (product: { id: string; name: string; price: number; description?: string }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
