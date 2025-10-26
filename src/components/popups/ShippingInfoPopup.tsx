"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FidgiButton } from '@/components/ui/FidgiButton'
import { CreditCard, Loader2 } from 'lucide-react'

interface OrderForm {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  notes: string
}

interface ShippingInfoPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmitOrder: (orderForm: OrderForm) => void
  isSubmitting: boolean
  error: string | null
}

export default function ShippingInfoPopup({
  isOpen,
  onClose,
  onSubmitOrder,
  isSubmitting,
  error
}: ShippingInfoPopupProps) {
  const [orderForm, setOrderForm] = useState<OrderForm>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  })

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitOrder(orderForm)
  }

  const isFormValid = orderForm.fullName && orderForm.phone && orderForm.address && orderForm.city && orderForm.postalCode

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Shipping Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Delivery Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">Full Name *</Label>
                <Input
                  id="fullName"
                  value={orderForm.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
                <Input
                  id="phone"
                  value={orderForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email (optional)"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-sm font-semibold">Address *</Label>
                <Input
                  id="address"
                  value={orderForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your full address"
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                <Input
                  id="city"
                  value={orderForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter your city"
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode" className="text-sm font-semibold">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={orderForm.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="Enter postal code"
                  className="mt-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-semibold">Order Notes</Label>
                <Textarea
                  id="notes"
                  value={orderForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special instructions for your order (optional)"
                  rows={3}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Back to Review
            </Button>
            <FidgiButton
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Place Order
                </>
              )}
            </FidgiButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
