"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FidgiButton } from '@/components/ui/FidgiButton'
import { Check, RotateCcw } from 'lucide-react'

interface OrderForm {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  notes: string
}

interface ConfirmedOrder {
  items: any[]
  totalAmount: number
  itemCount: number
  deliveryInfo: OrderForm
}

interface OrderConfirmationPopupProps {
  isOpen: boolean
  onClose: () => void
  onStartNewOrder: () => void
  confirmedOrder: ConfirmedOrder | null
}

export default function OrderConfirmationPopup({
  isOpen,
  onClose,
  onStartNewOrder,
  confirmedOrder
}: OrderConfirmationPopupProps) {
  const handleStartNewOrder = () => {
    onStartNewOrder()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Order Confirmed!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto"
          >
            <Check className="h-10 w-10 text-green-600" />
          </motion.div>
          
          <div>
            <h2 className="text-3xl font-bold text-green-600">Order Confirmed!</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {confirmedOrder && (
            <Card className="p-6 max-w-lg mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Order Total:</span>
                  <span className="font-bold">{confirmedOrder.totalAmount} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{confirmedOrder.itemCount} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="text-right font-semibold">{confirmedOrder.deliveryInfo.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="text-right font-semibold">{confirmedOrder.deliveryInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-right font-semibold">
                    {confirmedOrder.deliveryInfo.email || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Address:</span>
                  <span className="text-right font-semibold">{confirmedOrder.deliveryInfo.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>City:</span>
                  <span className="text-right font-semibold">{confirmedOrder.deliveryInfo.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>Postal Code:</span>
                  <span className="text-right font-semibold">{confirmedOrder.deliveryInfo.postalCode}</span>
                </div>
                {confirmedOrder.deliveryInfo.notes && (
                  <div className="flex justify-between">
                    <span>Notes:</span>
                    <span className="text-right font-semibold">{confirmedOrder.deliveryInfo.notes}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <FidgiButton onClick={handleStartNewOrder} className="px-8 py-3">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Order
            </FidgiButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
