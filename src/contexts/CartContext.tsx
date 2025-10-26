"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
type FidgiColor = {
  id: string | number
  name: string
  colorHex: string
  imageUrl: string
  price: number
  quantity: number
  isActive: boolean
}

type KeycapDesign = {
  id: string | number
  name: string
  imageUrl: string
  price: number
  quantity: number
  isActive: boolean
  category: string
}

type SwitchType = {
  id: string | number
  name: string
  description: string
  price: number
  quantity: number
  isActive: boolean
}

type PrebuiltFidgi = {
  id: string | number
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  imageUrl: string
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  fidgiColor: FidgiColor
  keycap: KeycapDesign
  switch: SwitchType
}

type OtherFidget = {
  id: string | number
  name: string
  description: string
  price: number
  cost: number
  quantity: number
  imageUrl: string
  images?: string[]
  category: string
  isActive: boolean
  isFeatured: boolean
  tags: string[]
}

export type CartItem = {
  id: string
  type: 'custom' | 'prebuilt' | 'other-fidget'
  // For custom items
  fidgiColorId?: string | number
  keycapId?: string | number
  switchId?: string | number
  fidgiColor?: FidgiColor
  keycap?: KeycapDesign
  switchType?: SwitchType
  // For prebuilt items
  prebuiltFidgiId?: string | number
  prebuiltFidgi?: PrebuiltFidgi
  // For other fidgets
  otherFidgetId?: string | number
  otherFidget?: OtherFidget
  // Common fields
  quantity: number
  unitPrice: number
  totalPrice: number
}

type CartContextType = {
  cartItems: CartItem[]
  addCustomToCart: (fidgiColor: FidgiColor, keycap: KeycapDesign, switchType: SwitchType, quantity: number) => void
  addPrebuiltToCart: (prebuiltFidgi: PrebuiltFidgi) => void
  addOtherFidgetToCart: (otherFidget: OtherFidget, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, newQuantity: number) => void
  getCartTotalItems: () => number
  getCartTotalPrice: () => number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('fidgi-cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('fidgi-cart', JSON.stringify(cartItems))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cartItems])

  const addCustomToCart = (fidgiColor: FidgiColor, keycap: KeycapDesign, switchType: SwitchType, quantity: number) => {
    try {
      const fidgiPrice = Number(fidgiColor.price) || 0;
      const keycapPrice = Number(keycap.price) || 0;
      const switchPrice = Number(switchType.price) || 0;
      const unitPrice = fidgiPrice + keycapPrice + switchPrice;
      const totalPrice = unitPrice * quantity;

      const cartItem: CartItem = {
        id: Date.now().toString(),
        type: 'custom',
        fidgiColorId: fidgiColor.id,
        keycapId: keycap.id,
        switchId: switchType.id,
        quantity,
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
        fidgiColor,
        keycap,
        switchType
      }

      setCartItems(prev => [...prev, cartItem])
    } catch (error) {
      console.error('Error adding custom item to cart:', error)
    }
  }

  const addPrebuiltToCart = (prebuiltFidgi: PrebuiltFidgi) => {
    try {
      const unitPrice = Number(prebuiltFidgi.price) || 0;
      const totalPrice = unitPrice * 1; // Prebuilt items are always quantity 1

      const cartItem: CartItem = {
        id: Date.now().toString(),
        type: 'prebuilt',
        prebuiltFidgiId: prebuiltFidgi.id,
        quantity: 1,
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
        prebuiltFidgi
      }

      setCartItems(prev => [...prev, cartItem])
    } catch (error) {
      console.error('Error adding prebuilt item to cart:', error)
    }
  }

  const addOtherFidgetToCart = (otherFidget: OtherFidget, quantity: number = 1) => {
    try {
      const unitPrice = Number(otherFidget.price) || 0;
      const totalPrice = unitPrice * quantity;

      const cartItem: CartItem = {
        id: Date.now().toString(),
        type: 'other-fidget',
        otherFidgetId: otherFidget.id,
        quantity,
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
        otherFidget
      }

      setCartItems(prev => [...prev, cartItem])
    } catch (error) {
      console.error('Error adding other fidget to cart:', error)
    }
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const unitPrice = Number(item.unitPrice) || 0;
        const totalPrice = unitPrice * newQuantity;
        return { 
          ...item, 
          quantity: newQuantity, 
          totalPrice: isNaN(totalPrice) ? 0 : totalPrice 
        };
      }
      return item;
    }))
  }

  const getCartTotalItems = () => cartItems.reduce((total, item) => total + (item.quantity || 0), 0)

  const getCartTotalPrice = () => cartItems.reduce((total, item) => {
    const itemTotal = Number(item.totalPrice) || 0;
    return total + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0)

  const clearCart = () => {
    setCartItems([])
  }

  const value: CartContextType = {
    cartItems,
    addCustomToCart,
    addPrebuiltToCart,
    addOtherFidgetToCart,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotalItems,
    getCartTotalPrice,
    clearCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
