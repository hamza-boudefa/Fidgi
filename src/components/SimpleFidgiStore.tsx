"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FidgiButton } from '@/components/ui/FidgiButton'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { ItemCardCarousel } from '@/components/ui/ItemCardCarousel'
import { ItemDetailsPopup } from '@/components/ui/ItemDetailsPopup'
import { useCart, CartItem } from '@/contexts/CartContext'
import ReviewOrderPopup from '@/components/popups/ReviewOrderPopup'
import ShippingInfoPopup from '@/components/popups/ShippingInfoPopup'
import OrderConfirmationPopup from '@/components/popups/OrderConfirmationPopup'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  X, 
  CreditCard, 
  RotateCcw,
  Star,
  Heart,
  Share2,
  Loader2
} from 'lucide-react'
import Image from 'next/image'


// API Data Types
interface FidgiColor {
  id: string | number
  name: string
  colorHex: string
  imageUrl: string
  images?: string[]
  price: number
  quantity: number
  isActive: boolean
}

interface KeycapDesign {
  id: string | number
  name: string
  imageUrl: string
  images?: string[]
  price: number
  quantity: number
  isActive: boolean
  category: string
}

interface SwitchType {
  id: string | number
  name: string
  description: string
  imageUrl?: string
  images?: string[]
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
  images?: string[]
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  fidgiColor: FidgiColor
  keycap: KeycapDesign
  switch: SwitchType
}

type OrderForm = {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  notes: string
}

type CustomizationStep = 'color' | 'keycap' | 'switch' | 'checkout'

export default function SimpleFidgiStore() {
  const { 
    cartItems, 
    addCustomToCart, 
    addPrebuiltToCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    getCartTotalItems, 
    getCartTotalPrice, 
    clearCart 
  } = useCart()

  // Helper function to get images for an item
  const getItemImages = (item: any) => {
    if (item.images && item.images.length > 0) {
      return item.images
    }
    if (item.imageUrl) {
      // Check if it's a Cloudinary URL
      if (item.imageUrl.includes('cloudinary.com')) {
        // For Cloudinary URLs, create optimized versions
        const baseUrl = item.imageUrl
        const images = [baseUrl]
        
        // Create different sizes for demo purposes
        if (baseUrl.includes('res.cloudinary.com')) {
          // Extract public_id from Cloudinary URL
          const urlParts = baseUrl.split('/')
          const publicId = urlParts[urlParts.length - 1]
          
          // Create different sizes
          images.push(
            `https://res.cloudinary.com/dngrhp34r/image/upload/w_300,h_300,c_fill,q_auto,f_auto/${publicId}`,
            `https://res.cloudinary.com/dngrhp34r/image/upload/w_600,h_600,c_fill,q_auto,f_auto/${publicId}`
          )
        }
        
        return images
      } else {
        // For non-Cloudinary URLs, create variations for demo
        const baseUrl = item.imageUrl
        const images = [baseUrl]
        
        // Add variations for demo
        if (baseUrl.includes('placehold.net')) {
          // Create variations by modifying the text parameter
          const urlParts = baseUrl.split('?')
          if (urlParts.length > 1) {
            const params = new URLSearchParams(urlParts[1])
            const text = params.get('text') || ''
            images.push(
              baseUrl.replace(`text=${encodeURIComponent(text)}`, `text=${encodeURIComponent(text)}+2`),
              baseUrl.replace(`text=${encodeURIComponent(text)}`, `text=${encodeURIComponent(text)}+3`)
            )
          }
        }
        
        return images
      }
    }
    return []
  }

  // Helper function to open item details popup
  const openItemDetails = (item: any, type: string) => {
    console.log('Opening item details for:', item, 'type:', type);
    const itemWithDetails = {
      ...item,
      type,
      images: getItemImages(item)
    };
    console.log('Item with details:', itemWithDetails);
    setSelectedItemForDetails(itemWithDetails);
    setIsItemDetailsPopupOpen(true);
  }
  
  const [selectedFidgi, setSelectedFidgi] = useState<FidgiColor | null>(null)
  const [selectedKeycap, setSelectedKeycap] = useState<KeycapDesign | null>(null)
  const [selectedSwitch, setSelectedSwitch] = useState<SwitchType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customizationStep, setCustomizationStep] = useState<CustomizationStep>('color')
  const [wishlist, setWishlist] = useState<string[]>([])

  // Popup states
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false)
  const [isShippingPopupOpen, setIsShippingPopupOpen] = useState(false)
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false)
  const [isItemDetailsPopupOpen, setIsItemDetailsPopupOpen] = useState(false)
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any>(null)

  // API Data State
  const [fidgiColors, setFidgiColors] = useState<FidgiColor[]>([])
  const [keycapDesigns, setKeycapDesigns] = useState<KeycapDesign[]>([])
  const [switchTypes, setSwitchTypes] = useState<SwitchType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    items: CartItem[]
    totalAmount: number
    itemCount: number
    deliveryInfo: OrderForm
  } | null>(null)

  // Cart management is now handled with localStorage

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [colorsRes, keycapsRes, switchesRes] = await Promise.all([
          fetch('/api/products/colors?active=true'),
          fetch('/api/products/keycaps?active=true'),
          fetch('/api/products/switches?active=true')
        ])

        if (!colorsRes.ok || !keycapsRes.ok || !switchesRes.ok) {
          throw new Error('Failed to load product data')
        }

        const [colorsData, keycapsData, switchesData] = await Promise.all([
          colorsRes.json(),
          keycapsRes.json(),
          switchesRes.json()
        ])

        setFidgiColors(colorsData.data)
        setKeycapDesigns(keycapsData.data)
        setSwitchTypes(switchesData.data)
        setError(null)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load product data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load cart from API

  const getTotalPrice = () => {
    if (!selectedFidgi || !selectedKeycap || !selectedSwitch) return 0;
  
    const fidgiPrice = Number(selectedFidgi.price) || 0;
    const keycapPrice = Number(selectedKeycap.price) || 0;
    const switchPrice = Number(selectedSwitch.price) || 0;
  
    const total = (fidgiPrice + keycapPrice + switchPrice) * quantity;
    return isNaN(total) ? 0 : total;
  };
  


  const handleNextStep = () => {
    if (customizationStep === 'color' && selectedFidgi) {
      setCustomizationStep('keycap')
    } else if (customizationStep === 'keycap' && selectedKeycap) {
      setCustomizationStep('switch')
    } else if (customizationStep === 'switch' && selectedSwitch) {
      setCustomizationStep('checkout')
    }
  }

  const handlePrevStep = () => {
    if (customizationStep === 'keycap') {
      setCustomizationStep('color')
    } else if (customizationStep === 'switch') {
      setCustomizationStep('keycap')
    } else if (customizationStep === 'checkout') {
      setCustomizationStep('switch')
    }
  }

  const canGoNext = (customizationStep === 'color' && selectedFidgi !== null && selectedFidgi.quantity > 0) || 
                   (customizationStep === 'keycap' && selectedKeycap !== null && selectedKeycap.quantity > 0) ||
                   (customizationStep === 'switch' && selectedSwitch !== null && selectedSwitch.quantity > 0)
  const canGoPrev = customizationStep === 'keycap' || customizationStep === 'switch' || customizationStep === 'checkout'

  // Safety check: if we're on checkout but missing selections or out of stock, go back to appropriate step
  if (customizationStep === 'checkout' && (!selectedFidgi || !selectedKeycap || !selectedSwitch || 
      selectedFidgi?.quantity === 0 || selectedKeycap?.quantity === 0 || selectedSwitch?.quantity === 0)) {
    if (!selectedFidgi || selectedFidgi?.quantity === 0) {
      setCustomizationStep('color')
    } else if (!selectedKeycap || selectedKeycap?.quantity === 0) {
      setCustomizationStep('keycap')
    } else if (!selectedSwitch || selectedSwitch?.quantity === 0) {
      setCustomizationStep('switch')
    }
  }

  const addToCart = () => {
    if (!selectedFidgi || !selectedKeycap || !selectedSwitch || 
        selectedFidgi.quantity === 0 || selectedKeycap.quantity === 0 || selectedSwitch.quantity === 0) return

    addCustomToCart(selectedFidgi, selectedKeycap, selectedSwitch, quantity)
    
    // Reset selections
    setSelectedFidgi(null)
    setSelectedKeycap(null)
    setSelectedSwitch(null)
    setQuantity(1)
  }

  const proceedToReview = () => {
    if (cartItems.length === 0 && selectedFidgi && selectedKeycap && selectedSwitch) {
      addToCart()
    }
    setIsReviewPopupOpen(true)
  }

  const handleProceedToShipping = () => {
    setIsReviewPopupOpen(false)
    setIsShippingPopupOpen(true)
  }


  const handleSubmitOrder = async (orderForm: OrderForm) => {
    setIsSubmittingOrder(true)
    try {
      const orderItems = cartItems.map(item => {
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
          customerName: orderForm.fullName,
          customerPhone: orderForm.phone,
          customerEmail: orderForm.email,
          customerAddress: orderForm.address,
          customerCity: orderForm.city,
          customerPostalCode: orderForm.postalCode,
          customerNotes: orderForm.notes,
          items: orderItems,
          shippingCost: 0,
          source: 'website'
        })
      })

      if (response.ok) {
        // Store order data for confirmation before clearing cart
        setConfirmedOrder({
          items: [...cartItems],
          totalAmount: getCartTotalPrice(),
          itemCount: getCartTotalItems(),
          deliveryInfo: { ...orderForm }
        })
        
        setIsShippingPopupOpen(false)
        setIsConfirmationPopupOpen(true)
        // Clear cart after storing order data
        clearCart()
        setError(null) // Clear any previous errors
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to place order')
      }
    } catch (err) {
      console.error('Error placing order:', err)
      setError('Failed to place order. Please try again.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const startNewOrder = () => {
    clearCart()
    setSelectedFidgi(null)
    setSelectedKeycap(null)
    setQuantity(1)
    setConfirmedOrder(null) // Clear confirmed order data
    setIsConfirmationPopupOpen(false)
  }

  const handleStartNewOrder = () => {
    startNewOrder()
  }

  const toggleWishlist = (fidgiId: string) => {
    setWishlist(prev => 
      prev.includes(fidgiId) 
        ? prev.filter(id => id !== fidgiId)
        : [...prev, fidgiId]
    )
  }

  // Auto-navigate when selections are made
  const handleFidgiSelect = (fidgi: FidgiColor) => {
    setSelectedFidgi(fidgi)
    // Auto-navigate to keycap selection after a short delay
    setTimeout(() => {
      setCustomizationStep('keycap')
    }, 500)
  }

  const handleKeycapSelect = (keycap: KeycapDesign) => {
    setSelectedKeycap(keycap)
    // Auto-navigate to switch selection after a short delay
    setTimeout(() => {
      setCustomizationStep('switch')
    }, 500)
  }

  const handleSwitchSelect = (sw: SwitchType) => {
    setSelectedSwitch(sw)
    // Auto-navigate to checkout after a short delay
    setTimeout(() => {
      setCustomizationStep('checkout')
    }, 500)
  }

  const renderBrowsingStep = () => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <X className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold  text-black">
        Create your own Fidgi Clicker

        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Select your favorite color and keycap design to create a personalized fidget clicker that matches your style.
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="flex justify-center px-4 sm:px-0">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full max-w-4xl">
          <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-full whitespace-nowrap ${
            customizationStep === 'color' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current flex items-center justify-center text-xs font-bold">
              1
            </div>
            <span className="font-semibold text-xs sm:text-sm">Color</span>
          </div>
          <div className="w-4 sm:w-6 h-0.5 bg-muted flex-shrink-0"></div>
          <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-full whitespace-nowrap ${
            customizationStep === 'keycap' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current flex items-center justify-center text-xs font-bold">
              2
            </div>
            <span className="font-semibold text-xs sm:text-sm">Keycap</span>
          </div>
          <div className="w-4 sm:w-6 h-0.5 bg-muted flex-shrink-0"></div>
          <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-full whitespace-nowrap ${
            customizationStep === 'switch' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="font-semibold text-xs sm:text-sm">Switch</span>
          </div>
          <div className="w-4 sm:w-6 h-0.5 bg-muted flex-shrink-0"></div>
          <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-full whitespace-nowrap ${
            customizationStep === 'checkout' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-current flex items-center justify-center text-xs font-bold">
              4
            </div>
            <span className="font-semibold text-xs sm:text-sm">Checkout</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons Above Cards */}
      <div className="flex justify-between items-center px-4 sm:px-0">
        <FidgiButton
          variant="outline"
          onClick={handlePrevStep}
          disabled={!canGoPrev}
          className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
        >
          <span>← Previous</span>
        </FidgiButton>

        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          {customizationStep === 'color' && 'Step 1 of 4'}
          {customizationStep === 'keycap' && 'Step 2 of 4'}
          {customizationStep === 'switch' && 'Step 3 of 4'}
          {customizationStep === 'checkout' && 'Step 4 of 4'}
        </div>

        {(customizationStep === 'color' || customizationStep === 'keycap' || customizationStep === 'switch') && (
          <FidgiButton
            onClick={handleNextStep}
            disabled={!canGoNext}
            className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <span>Next →</span>
          </FidgiButton>
        )}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {customizationStep === 'color' && (
          <motion.div
            key="color"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-center px-4 sm:px-0">Step 1: Choose Your Base Color</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
              {fidgiColors.map((fidgi) => (
                <motion.div
                  key={fidgi.id}
                  whileHover={{ scale: fidgi.quantity > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: fidgi.quantity > 0 ? 0.95 : 1 }}
                  className={`relative group ${fidgi.quantity > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => fidgi.quantity > 0 && openItemDetails(fidgi, 'fidgiColor')}
                >
                  <Card className={`p-4 transition-all duration-300 ${
                    selectedFidgi?.id === fidgi.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}>
                      <div className="aspect-square relative mb-4 rounded-lg overflow-hidden group">
                      <ItemCardCarousel
                        images={getItemImages(fidgi)}
                        alt={fidgi.name}
                        className="w-full h-full"
                        onImageClick={() => openItemDetails(fidgi, 'fidgiColor')}
                      />
                      
                      {fidgi.quantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-20">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Out of Stock
                          </div>
                        </div>
                      )}
                      
                     
                      
                      {selectedFidgi?.id === fidgi.id && fidgi.quantity > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-center">{fidgi.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{fidgi.price} TND</span>
                        {/* Select Button */}
                      <Button
                        variant="outline"
                        size="sm" 
                        className=" cursor-pointer z-20 transition-opacity duration-200 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fidgi.quantity > 0) {
                            handleFidgiSelect(fidgi);
                          }
                        }}
                        disabled={fidgi.quantity === 0}
                      >
                        Select
                      </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {customizationStep === 'keycap' && (
          <motion.div
            key="keycap"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-center px-4 sm:px-0">Step 2: Choose Your Keycap Design</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
              {keycapDesigns.map((keycap) => (
                <motion.div
                  key={keycap.id}
                  whileHover={{ scale: keycap.quantity > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: keycap.quantity > 0 ? 0.95 : 1 }}
                  className={`relative group ${keycap.quantity > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => keycap.quantity > 0 && openItemDetails(keycap, 'keycapDesign')}
                >
                  <Card className={`p-4 transition-all duration-300 ${
                    selectedKeycap?.id === keycap.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}>
                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden group">
                      <ItemCardCarousel
                        images={getItemImages(keycap)}
                        alt={keycap.name}
                        className="w-full h-full"
                        onImageClick={() => openItemDetails(keycap, 'keycapDesign')}
                      />
                      
                      {keycap.quantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-20">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Out of Stock
                          </div>
                        </div>
                      )}
                      
                      
                      {selectedKeycap?.id === keycap.id && keycap.quantity > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-center">{keycap.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {keycap.price === 0 ? 'Included' : `+${keycap.price} TND`}
                        </span>
                        {/* Select Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer z-20 transition-opacity duration-200 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (keycap.quantity > 0) {
                              handleKeycapSelect(keycap);
                            }
                          }}
                          disabled={keycap.quantity === 0}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {customizationStep === 'switch' && (
          <motion.div
            key="switch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-center px-4 sm:px-0">Step 3: Choose Your Switch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto px-4 sm:px-0">
              {switchTypes.map((sw) => (
                <motion.div
                  key={sw.id}
                  whileHover={{ scale: sw.quantity > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: sw.quantity > 0 ? 0.95 : 1 }}
                  className={`relative group ${sw.quantity > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => sw.quantity > 0 && handleSwitchSelect(sw)}
                >
                  <Card className={`p-5 transition-all duration-300 relative ${
                    selectedSwitch?.id === sw.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}>
                    {sw.quantity === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Out of Stock
                        </div>
                      </div>
                    )}
                    
                    {/* Select Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sw.quantity > 0) {
                          handleSwitchSelect(sw);
                        }
                      }}
                      disabled={sw.quantity === 0}
                    >
                      Select
                    </Button>
                    
                    {selectedSwitch?.id === sw.id && sw.quantity > 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 text-center">
                      <h4 className="font-semibold text-lg">{sw.name}</h4>
                      <p className="text-sm text-muted-foreground">{sw.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {customizationStep === 'checkout' && selectedFidgi && selectedKeycap && selectedSwitch && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-center px-4 sm:px-0">Step 4: Review & Checkout</h3>
            
            {/* Selection Summary - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-4 sm:p-6 w-full mx-4 sm:mx-0"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Your Selection</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    {selectedFidgi.imageUrl ? (
                      <Image
                        src={selectedFidgi.imageUrl}
                        alt={selectedFidgi.name}
                        width={64}
                        height={64}
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        className="object-cover"
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 flex items-center justify-center text-gray-500 text-xs ${selectedFidgi.imageUrl ? 'hidden' : ''}`}
                      style={{ 
                        backgroundColor: selectedFidgi?.colorHex ? `${selectedFidgi.colorHex}20` : '#f3f4f6',
                        backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                      }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-xs">{selectedFidgi.name}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedFidgi.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedFidgi.price} TND</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    {selectedKeycap.imageUrl ? (
                      <Image
                        src={selectedKeycap.imageUrl}
                        alt={selectedKeycap.name}
                        width={64}
                        height={64}
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        className="object-cover"
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 flex items-center justify-center text-white text-xs ${selectedKeycap.imageUrl ? 'hidden' : ''}`}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)'
                      }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-xs">{selectedKeycap.name}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedKeycap.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedKeycap.price === 0 ? 'Included' : `+${selectedKeycap.price} TND`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center font-semibold">
                    {selectedSwitch.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedSwitch.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSwitch.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base sm:text-lg">Quantity</span>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-8 sm:w-12 text-center font-bold text-lg sm:text-xl">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-lg sm:text-2xl font-bold">
                  <span>Total Price:</span>
                  <span className="text-primary">{getTotalPrice()} TND</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FidgiButton
                    variant="outline"
                    size="lg"
                    className="w-full text-sm sm:text-base"
                    onClick={addToCart}
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Add to Cart
                  </FidgiButton>
                  
                  <FidgiButton
                    size="lg"
                    className="w-full text-sm sm:text-base"
                    onClick={proceedToReview}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Buy Now
                  </FidgiButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    )
  }




  return (
    <div className="w-full max-w-6xl mx-auto bg-background shadow-2xl rounded-3xl">
      {/* Header */}
      <header className="border-b border-border rounded-t-3xl bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* <div className="font-bold text-lg sm:text-2xl text-foreground">Create your own Fidgi</div> */}
              {/* <Badge variant="secondary" className="hidden sm:inline-flex">
                Premium
              </Badge> */}
            </div>
            
            <div className="flex items-center space-x-4">
              {cartItems.length > 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {getCartTotalItems()} items - {getCartTotalPrice()} TND
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderBrowsingStep()}
        </motion.div>
      </div>


      {/* Popup Components */}
      <ReviewOrderPopup
        isOpen={isReviewPopupOpen}
        onClose={() => setIsReviewPopupOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onProceedToShipping={handleProceedToShipping}
        getCartTotalItems={getCartTotalItems}
        getCartTotalPrice={getCartTotalPrice}
      />

      <ShippingInfoPopup
        isOpen={isShippingPopupOpen}
        onClose={() => setIsShippingPopupOpen(false)}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
        error={error}
      />

      <OrderConfirmationPopup
        isOpen={isConfirmationPopupOpen}
        onClose={() => setIsConfirmationPopupOpen(false)}
        onStartNewOrder={handleStartNewOrder}
        confirmedOrder={confirmedOrder}
      />

      <ItemDetailsPopup
        isOpen={isItemDetailsPopupOpen}
        onClose={() => setIsItemDetailsPopupOpen(false)}
        item={selectedItemForDetails}
      />
    </div>
  )
}