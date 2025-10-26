"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ArrowLeft,
  Plus,
  Minus,
  X,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Image from 'next/image'

// Types
interface FidgiColor {
  id: string | number
  name: string
  colorHex: string
  imageUrl: string
  price: number
  cost: number
  quantity: number
  isActive: boolean
}

interface KeycapDesign {
  id: string | number
  name: string
  imageUrl: string
  price: number
  cost: number
  quantity: number
  isActive: boolean
  category: string
}

interface SwitchType {
  id: string | number
  name: string
  description: string
  price: number
  cost: number
  quantity: number
  isActive: boolean
}

interface PrebuiltFidgi {
  id: string | number
  name: string
  description: string
  price: number
  cost: number
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

interface OrderItem {
  id: string
  type: 'custom' | 'prebuilt'
  fidgiColorId?: string | number
  keycapId?: string | number
  switchId?: string | number
  prebuiltFidgiId?: string | number
  quantity: number
  unitPrice: number
  totalPrice: number
  unitCost: number
  totalCost: number
  profit: number
  fidgiColor?: FidgiColor
  keycap?: KeycapDesign
  switchType?: SwitchType
  prebuiltFidgi?: PrebuiltFidgi
}

interface CustomerInfo {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  notes: string
}

type OrderSource = 'website' | 'instagram' | 'tiktok' | 'facebook' | 'in_person' | 'phone' | 'other'

export default function CreateOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Product data
  const [fidgiColors, setFidgiColors] = useState<FidgiColor[]>([])
  const [keycapDesigns, setKeycapDesigns] = useState<KeycapDesign[]>([])
  const [switchTypes, setSwitchTypes] = useState<SwitchType[]>([])
  const [prebuiltFidgis, setPrebuiltFidgis] = useState<PrebuiltFidgi[]>([])
  
  // Order data
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  })
  const [orderSource, setOrderSource] = useState<OrderSource>('website')
  
  // UI states
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedProductType, setSelectedProductType] = useState<'custom' | 'prebuilt'>('custom')
  const [selectedFidgi, setSelectedFidgi] = useState<FidgiColor | null>(null)
  const [selectedKeycap, setSelectedKeycap] = useState<KeycapDesign | null>(null)
  const [selectedSwitch, setSelectedSwitch] = useState<SwitchType | null>(null)
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<PrebuiltFidgi | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        const authResponse = await fetch('/api/admin/auth/me')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }

        // Load product data
        const [colorsRes, keycapsRes, switchesRes, prebuiltRes] = await Promise.all([
          fetch('/api/products/colors?active=true'),
          fetch('/api/products/keycaps?active=true'),
          fetch('/api/products/switches?active=true'),
          fetch('/api/products/prebuilt?active=true')
        ])

        if (!colorsRes.ok || !keycapsRes.ok || !switchesRes.ok || !prebuiltRes.ok) {
          throw new Error('Failed to load product data')
        }

        const [colorsData, keycapsData, switchesData, prebuiltData] = await Promise.all([
          colorsRes.json(),
          keycapsRes.json(),
          switchesRes.json(),
          prebuiltRes.json()
        ])

        setFidgiColors(colorsData.data)
        setKeycapDesigns(keycapsData.data)
        setSwitchTypes(switchesData.data)
        setPrebuiltFidgis(prebuiltData.data)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load product data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const addCustomItem = () => {
    if (!selectedFidgi || !selectedKeycap || !selectedSwitch) return

    const unitPrice = Number(selectedFidgi.price) + Number(selectedKeycap.price) + Number(selectedSwitch.price)
    const unitCost = Number(selectedFidgi.cost) + Number(selectedKeycap.cost) + Number(selectedSwitch.cost)
    const totalPrice = unitPrice * quantity
    const totalCost = unitCost * quantity
    const profit = totalPrice - totalCost

    const newItem: OrderItem = {
      id: Date.now().toString(),
      type: 'custom',
      fidgiColorId: selectedFidgi.id,
      keycapId: selectedKeycap.id,
      switchId: selectedSwitch.id,
      quantity,
      unitPrice,
      totalPrice,
      unitCost,
      totalCost,
      profit,
      fidgiColor: selectedFidgi,
      keycap: selectedKeycap,
      switchType: selectedSwitch
    }

    setOrderItems(prev => [...prev, newItem])
    resetProductSelection()
    setShowProductSelector(false)
  }

  const addPrebuiltItem = () => {
    if (!selectedPrebuilt) return

    const unitPrice = Number(selectedPrebuilt.price)
    const unitCost = Number(selectedPrebuilt.cost)
    const totalPrice = unitPrice * quantity
    const totalCost = unitCost * quantity
    const profit = totalPrice - totalCost

    const newItem: OrderItem = {
      id: Date.now().toString(),
      type: 'prebuilt',
      prebuiltFidgiId: selectedPrebuilt.id,
      quantity,
      unitPrice,
      totalPrice,
      unitCost,
      totalCost,
      profit,
      prebuiltFidgi: selectedPrebuilt
    }

    setOrderItems(prev => [...prev, newItem])
    resetProductSelection()
    setShowProductSelector(false)
  }

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const totalPrice = item.unitPrice * newQuantity
        const totalCost = item.unitCost * newQuantity
        const profit = totalPrice - totalCost
        return { ...item, quantity: newQuantity, totalPrice, totalCost, profit }
      }
      return item
    }))
  }

  const resetProductSelection = () => {
    setSelectedFidgi(null)
    setSelectedKeycap(null)
    setSelectedSwitch(null)
    setSelectedPrebuilt(null)
    setQuantity(1)
  }

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getTotalCost = () => {
    return orderItems.reduce((total, item) => total + item.totalCost, 0)
  }

  const getTotalProfit = () => {
    return orderItems.reduce((total, item) => total + item.profit, 0)
  }

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      setError('Please add at least one item to the order')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderItemsData = orderItems.map(item => {
        if (item.type === 'custom') {
          return {
            type: 'custom',
            fidgiBaseId: item.fidgiColor?.id,
            keycapId: item.keycap?.id,
            switchId: item.switchType?.id,
            quantity: item.quantity
          }
        } else {
          return {
            type: 'prebuilt',
            prebuiltFidgiId: item.prebuiltFidgi?.id,
            quantity: item.quantity
          }
        }
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.fullName,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          customerAddress: customerInfo.address,
          customerCity: customerInfo.city,
          customerPostalCode: customerInfo.postalCode,
          customerNotes: customerInfo.notes,
          items: orderItemsData,
          shippingCost: 0,
          source: orderSource
        })
      })

      if (response.ok) {
        setSuccess(true)
        // Reset form
        setOrderItems([])
        setCustomerInfo({
          fullName: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          postalCode: '',
          notes: ''
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create order')
      }
    } catch (err) {
      console.error('Error creating order:', err)
      setError('Failed to create order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Created Successfully!</h2>
          <p className="text-muted-foreground mb-4">The order has been created and added to the system.</p>
          <div className="space-x-4">
            <Button onClick={() => setSuccess(false)}>
              Create Another Order
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/orders')}>
              View All Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orders</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-2">Create a new order for a customer</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Customer Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="source">Order Source</Label>
                <select
                  id="source"
                  value={orderSource}
                  onChange={(e) => setOrderSource(e.target.value as OrderSource)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="website">Website</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="in_person">In Person</option>
                  <option value="phone">Phone</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </form>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <Button
                onClick={() => setShowProductSelector(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet</p>
                <p className="text-sm">Click "Add Item" to start building the order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        {item.type === 'custom' ? (
                          item.fidgiColor?.imageUrl ? (
                            <Image
                              src={item.fidgiColor.imageUrl}
                              alt={item.fidgiColor.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div 
                              className="w-12 h-12 flex items-center justify-center text-gray-500 text-xs"
                              style={{ 
                                backgroundColor: item.fidgiColor?.colorHex ? `${item.fidgiColor.colorHex}20` : '#f3f4f6'
                              }}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-xs">{item.fidgiColor?.name || 'Custom'}</div>
                              </div>
                            </div>
                          )
                        ) : (
                          item.prebuiltFidgi?.imageUrl ? (
                            <Image
                              src={item.prebuiltFidgi.imageUrl}
                              alt={item.prebuiltFidgi.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted flex items-center justify-center text-gray-500 text-xs">
                              <div className="text-center">
                                <div className="font-semibold text-xs">{item.prebuiltFidgi?.name || 'Prebuilt'}</div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {item.type === 'custom' ? 'Custom Clicker' : item.prebuiltFidgi?.name || 'Prebuilt Fidget'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.type === 'custom' 
                            ? `${item.fidgiColor?.name} • ${item.keycap?.name} • ${item.switchType?.name}`
                            : item.prebuiltFidgi?.description || 'Prebuilt fidget'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.totalPrice} TND</div>
                        <div className="text-xs text-muted-foreground">
                          Cost: {item.totalCost} TND
                        </div>
                        <div className="text-xs text-green-600">
                          Profit: {item.profit} TND
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Total ({getTotalItems()} items)</span>
                    <span className="font-bold text-lg">{getTotalPrice()} TND</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Total Cost</span>
                    <span>{getTotalCost()} TND</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600 font-semibold">
                    <span>Total Profit</span>
                    <span>{getTotalProfit()} TND</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={orderItems.length === 0 || submitting}
            className="px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              'Create Order'
            )}
          </Button>
        </div>

        {/* Product Selector Dialog */}
        <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product to Order</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Product Type Selection */}
              <div className="flex space-x-4">
                <Button
                  variant={selectedProductType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setSelectedProductType('custom')}
                  className="flex-1"
                >
                  Custom Fidgi
                </Button>
                <Button
                  variant={selectedProductType === 'prebuilt' ? 'default' : 'outline'}
                  onClick={() => setSelectedProductType('prebuilt')}
                  className="flex-1"
                >
                  Prebuilt Fidgi
                </Button>
              </div>

              {selectedProductType === 'custom' ? (
                <div className="space-y-6">
                  {/* Fidgi Color Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Choose Base Color</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {fidgiColors.map((fidgi) => (
                        <div
                          key={fidgi.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedFidgi?.id === fidgi.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedFidgi(fidgi)}
                        >
                          <div className="aspect-square relative mb-2 rounded-lg overflow-hidden">
                            {fidgi.imageUrl ? (
                              <Image
                                src={fidgi.imageUrl}
                                alt={fidgi.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center text-gray-500 text-sm"
                                style={{ 
                                  backgroundColor: fidgi.colorHex ? `${fidgi.colorHex}20` : '#f3f4f6'
                                }}
                              >
                                <div className="text-center">
                                  <div className="font-semibold">{fidgi.name}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sm">{fidgi.name}</p>
                            <p className="text-xs text-muted-foreground">{fidgi.price} TND</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keycap Selection */}
                  {selectedFidgi && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Choose Keycap Design</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {keycapDesigns.map((keycap) => (
                          <div
                            key={keycap.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedKeycap?.id === keycap.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedKeycap(keycap)}
                          >
                            <div className="aspect-square relative mb-2 rounded-lg overflow-hidden">
                              {keycap.imageUrl ? (
                                <Image
                                  src={keycap.imageUrl}
                                  alt={keycap.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-sm bg-gradient-to-br from-blue-500 to-purple-500">
                                  <div className="text-center">
                                    <div className="font-semibold">{keycap.name}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-sm">{keycap.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {keycap.price === 0 ? 'Included' : `+${keycap.price} TND`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Switch Selection */}
                  {selectedFidgi && selectedKeycap && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Choose Switch Type</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {switchTypes.map((sw) => (
                          <div
                            key={sw.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedSwitch?.id === sw.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedSwitch(sw)}
                          >
                            <div className="text-center">
                              <h4 className="font-semibold">{sw.name}</h4>
                              <p className="text-sm text-muted-foreground">{sw.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Prebuilt Fidgi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {prebuiltFidgis.map((fidgi) => (
                      <div
                        key={fidgi.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPrebuilt?.id === fidgi.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedPrebuilt(fidgi)}
                      >
                        <div className="aspect-square relative mb-2 rounded-lg overflow-hidden">
                          {fidgi.imageUrl ? (
                            <Image
                              src={fidgi.imageUrl}
                              alt={fidgi.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm bg-muted">
                              <div className="text-center">
                                <div className="font-semibold">{fidgi.name}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{fidgi.name}</p>
                          <p className="text-xs text-muted-foreground">{fidgi.price} TND</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add Button */}
              {(selectedProductType === 'custom' && selectedFidgi && selectedKeycap && selectedSwitch) ||
               (selectedProductType === 'prebuilt' && selectedPrebuilt) ? (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={selectedProductType === 'custom' ? addCustomItem : addPrebuiltItem}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Order</span>
                  </Button>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
