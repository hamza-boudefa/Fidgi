"use client"

import React from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Minus, Plus, X } from 'lucide-react'
import { CartItem } from '@/contexts/CartContext'

interface FidgiColor {
  id: string | number
  name: string
  colorHex: string
  imageUrl: string
  price: number
  quantity: number
  isActive: boolean
}

interface KeycapDesign {
  id: string | number
  name: string
  imageUrl: string
  price: number
  quantity: number
  isActive: boolean
  category: string
}

interface SwitchType {
  id: string | number
  name: string
  description: string
  price: number
  quantity: number
  isActive: boolean
}

interface PrebuiltFidgi {
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

interface OtherFidget {
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


interface ReviewOrderPopupProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, newQuantity: number) => void
  onRemoveItem: (itemId: string) => void
  onProceedToShipping: () => void
  getCartTotalItems: () => number
  getCartTotalPrice: () => number
}

export default function ReviewOrderPopup({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToShipping,
  getCartTotalItems,
  getCartTotalPrice
}: ReviewOrderPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Review Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Order Items ({getCartTotalItems()} items)</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      {item.type === 'custom' ? (
                        item.fidgiColor?.imageUrl ? (
                          <Image
                            src={item.fidgiColor.imageUrl}
                            alt={item.fidgiColor.name}
                            width={64}
                            height={64}
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            className="object-cover"
                          />
                        ) : null
                      ) : item.type === 'prebuilt' ? (
                        item.prebuiltFidgi?.imageUrl ? (
                          <Image
                            src={item.prebuiltFidgi.imageUrl}
                            alt={item.prebuiltFidgi.name}
                            width={64}
                            height={64}
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            className="object-cover"
                          />
                        ) : null
                      ) : (
                        item.otherFidget?.imageUrl ? (
                          <Image
                            src={item.otherFidget.imageUrl}
                            alt={item.otherFidget.name}
                            width={64}
                            height={64}
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            className="object-cover"
                          />
                        ) : null
                      )}
                      <div 
                        className={`w-16 h-16 flex items-center justify-center text-gray-500 text-xs ${
                          (item.type === 'custom' && item.fidgiColor?.imageUrl) || 
                          (item.type === 'prebuilt' && item.prebuiltFidgi?.imageUrl) ||
                          (item.type === 'other-fidget' && item.otherFidget?.imageUrl) ? 'hidden' : ''
                        }`}
                        style={{ 
                          backgroundColor: item.type === 'custom' && item.fidgiColor?.colorHex 
                            ? `${item.fidgiColor.colorHex}20` 
                            : '#f3f4f6',
                          backgroundImage: item.type === 'custom' 
                            ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                            : 'none',
                          backgroundSize: '8px 8px',
                          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                        }}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-xs">
                            {item.type === 'custom' 
                              ? item.fidgiColor?.name || 'Custom'
                              : item.prebuiltFidgi?.name || 'Prebuilt'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {item.type === 'custom' 
                          ? 'Custom Fidget Clicker' 
                          : item.type === 'prebuilt'
                          ? item.prebuiltFidgi?.name || 'Prebuilt Fidget'
                          : item.otherFidget?.name || 'Other Fidget'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'custom' 
                          ? `${item.fidgiColor?.name} • ${item.keycap?.name}`
                          : item.type === 'prebuilt'
                          ? 'Prebuilt fidget'
                          : 'Other fidget'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-lg w-20 text-right">{item.totalPrice} TND</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center font-bold text-2xl">
                <span>Total</span>
                <span className="text-primary">{getCartTotalPrice()} TND</span>
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Continue Shopping
            </Button>
            <Button onClick={onProceedToShipping} className="bg-primary hover:bg-primary/90">
              Proceed to Shipping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
