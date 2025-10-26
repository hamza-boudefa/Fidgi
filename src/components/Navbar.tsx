"use client"

import { useState } from "react"
import { Menu, X, ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import SplitText from "@/components/SplitText"
import Shuffle from "./ui/shadcn-io/shuffle"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import ReviewOrderPopup from '@/components/popups/ReviewOrderPopup'
import ShippingInfoPopup from '@/components/popups/ShippingInfoPopup'
import OrderConfirmationPopup from '@/components/popups/OrderConfirmationPopup'
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Popup states
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false)
  const [isShippingPopupOpen, setIsShippingPopupOpen] = useState(false)
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false)
  
  // Order states
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    items: any[]
    totalAmount: number
    itemCount: number
    deliveryInfo: any
  } | null>(null)
  
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItemQuantity, 
    getCartTotalItems, 
    getCartTotalPrice, 
    clearCart 
  } = useCart()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Checkout handlers
  const handleProceedToShipping = () => {
    setIsReviewPopupOpen(false)
    setIsShippingPopupOpen(true)
  }

  const handleSubmitOrder = async (orderForm: any) => {
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
    setConfirmedOrder(null) // Clear confirmed order data
    setIsConfirmationPopupOpen(false)
  }

  const handleStartNewOrder = () => {
    startNewOrder()
  }

  const navLinks = [
    // { href: "#world", label: "Home" },
    { href: "#treasure_box", label: "Build Your Own" },
    { href: "#prebuilt_fidgis", label: "Ready-Made" },
    { href: "#other_fidgets", label: "Other Fidgets" },
    // { href: "#reach_out", label: "Reach Out" },
  ]
  const smoothScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
    setIsMenuOpen(false)
  }


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-3">
        {/* Logo */}
        <button onClick={() => smoothScroll('#world')} className="flex items-center group">
          <div className="flex items-center gap-1 sm:gap-2">
            <Image 
              src="/logo.png" 
              alt="logo" 
              width={48} 
              height={48} 
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground transition-all duration-300">
              Fidgi™
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center bg-[#00000080] backdrop-blur-xs rounded-full px-3 py-2 border border-white/10 shadow-lg">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => smoothScroll(link.href)}
                className="relative cursor-pointer px-3 lg:px-4 py-2 !text-black text-sm lg:text-base font-medium rounded-full transition-all duration-300 group overflow-hidden hover:bg-white/10"
              >
                <span className="relative z-10 transition-all duration-300">
                  
                  <Shuffle
                    text={link.label}
                    shuffleDirection="right"
                    duration={0.5}
                    animationMode="evenodd"
                    shuffleTimes={2}
                    ease="power3.out"
                    stagger={0.05}
                    threshold={0.1}
                    triggerOnce={false}
                    triggerOnHover={true}
                    respectReducedMotion={true}
                    className="text-white"
                    style={{
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins',
                      fontWeight: 'semibold',
                      paddingTop: '8px',
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => smoothScroll('#treasure_box')}
            className="ml-2 bg-white/90 text-black rounded-full px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium transition-all duration-300 border border-white/20 hover:bg-white hover:text-black"
          >
            <span className="hidden sm:inline">Shop Now</span>
            <span className="sm:hidden">Shop</span>
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="ml-2 bg-white/90 text-black rounded-full px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium transition-all duration-300 border border-white/20 hover:bg-white hover:text-black"
          >
            <ShoppingCart className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Cart ({getCartTotalItems()})</span>
            <span className="sm:hidden">({getCartTotalItems()})</span>
          </Button>
          
        
        </div>

        {/* Tablet Navigation */}
        <div className="hidden md:flex lg:hidden items-center gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => smoothScroll('#treasure_box')}
            className="bg-white/90 text-black rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 border border-white/20 hover:bg-white hover:text-black"
          >
            Shop Now
          </Button> */}
            <Button
                className={`bg-white/90 text-black rounded-full px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-medium mt-2 transition-all duration-300 border border-white/20 ${isMenuOpen ? "animate-in slide-in-from-bottom-2" : ""}`}
                style={{ animationDelay: "400ms" }}
              >
                <span className="cursor-pointer hover:text-white" onClick={() => smoothScroll('#reach_out')}>
                  Reach Out
                </span>
              </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="bg-white/90 text-black rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 border border-white/20 hover:bg-white hover:text-black"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({getCartTotalItems()})
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 text-foreground transition-all duration-300 rounded-full hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <div className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : "rotate-0"}`}>
            {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
          </div>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden transition-all duration-500 ease-out ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <div className="mt-4 mx-2 sm:mx-4">
          <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {navLinks.map((link, index) => (
                <span
                  key={link.href}
                  className={`relative cursor-pointer text-black group ${isMenuOpen ? "animate-in slide-in-from-top-2" : ""}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => smoothScroll(link.href)}
                >
                  <SplitText
                    text={link.label}
                    className="text-xl sm:text-2xl font-semibold text-center text-black"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                    onLetterAnimationComplete={() => {}}
                  />
                </span>
              ))}
              {/* <Button
                variant="outline"
                className={`bg-white/90 text-black rounded-full px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-medium mt-2 transition-all duration-300 border border-white/20 ${isMenuOpen ? "animate-in slide-in-from-bottom-2" : ""}`}
                style={{ animationDelay: "300ms" }}
                onClick={() => {
                  smoothScroll('#treasure_box')
                  setIsMenuOpen(false)
                }}
              >
                Shop Now
              </Button> */}
              
              <Button
                variant="outline"
                className={`bg-white/90 text-black rounded-full px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-medium mt-2 transition-all duration-300 border border-white/20 ${isMenuOpen ? "animate-in slide-in-from-bottom-2" : ""}`}
                style={{ animationDelay: "350ms" }}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Cart ({getCartTotalItems()})
              </Button>
              
              <Button
                asChild
                className={`bg-white/90 text-black rounded-full px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-medium mt-2 transition-all duration-300 border border-white/20 ${isMenuOpen ? "animate-in slide-in-from-bottom-2" : ""}`}
                style={{ animationDelay: "400ms" }}
              >
                <span className="cursor-pointer hover:text-white" onClick={() => smoothScroll('#reach_out')}>
                  Reach Out
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Shopping Cart ({getCartTotalItems()} items)</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cartItems.map((item) => (
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
                            width={48}
                            height={48}
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
                            width={48}
                            height={48}
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
                        className={`w-12 h-12 flex items-center justify-center text-gray-500 text-xs ${
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
                          backgroundSize: '6px 6px',
                          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                        }}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-xs">
                            {item.type === 'custom' 
                              ? item.fidgiColor?.name || 'Custom'
                              : item.type === 'prebuilt'
                              ? item.prebuiltFidgi?.name || 'Prebuilt'
                              : item.otherFidget?.name || 'Other Fidget'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {item.type === 'custom' 
                          ? 'Custom Clicker' 
                          : item.type === 'prebuilt'
                          ? item.prebuiltFidgi?.name || 'Prebuilt Fidget'
                          : item.otherFidget?.name || 'Other Fidget'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'custom' 
                          ? `${item.fidgiColor?.name} • ${item.keycap?.name}`
                          : item.type === 'prebuilt'
                          ? 'Prebuilt fidget'
                          : 'Other fidget'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold">{item.totalPrice} TND</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {cartItems.length > 0 && (
            <>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>{getCartTotalPrice()} TND</span>
                </div>
              </div>
            </>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  clearCart()
                  setIsCartOpen(false)
                }}
                className="flex-1"
              >
                Clear Cart
              </Button>
            )}
            <Button
              onClick={() => {
                console.log('Checkout button clicked, cartItems:', cartItems.length, cartItems)
                console.log('isReviewPopupOpen before:', isReviewPopupOpen)
                setIsCartOpen(false)
                if (cartItems.length > 0) {
                  console.log('Opening review popup')
                  setIsReviewPopupOpen(true)
                  console.log('isReviewPopupOpen after setState:', true)
                }
              }}
              className="flex-1"
              disabled={cartItems.length === 0}
            >
              {cartItems.length > 0 ? 'Checkout' : 'Continue Shopping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup Components */}
      
      {/* Debug indicator */}
      {isReviewPopupOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'red',
          color: 'white',
          padding: '20px',
          zIndex: 9999,
          borderRadius: '8px'
        }}>
          Review popup should be open!
        </div>
      )}
      
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
    </nav>
  )
}
