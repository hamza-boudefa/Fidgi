// "use client"

// import { Suspense, useState } from "react"
// import { Canvas } from "@react-three/fiber"
// import { OrbitControls, Environment } from "@react-three/drei"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { 
//   ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, Star, Check, 
//   Plus, Minus, RotateCcw, X, MapPin, Phone, User, Mail, CreditCard, 
//   Trash2, ListOrdered, Home
// } from "lucide-react"

// import { Scene } from "./scene"
// import { ColorPicker, OptionSelector } from "./ui"
// import { useCustomizerState } from "./hooks"
// import { HOUSING_COLORS, SWITCH_TYPES, KEYCAP_OPTIONS } from "./config/index"

// const steps = [
//   { id: "housing", title: "Housing", subtitle: "Choose your base color" },
//   { id: "switch", title: "Switch", subtitle: "Select switch type" },
//   { id: "keycap", title: "Keycap", subtitle: "Pick your design" },
// ]

// const DEFAULT_STATE = {
//   currentStep: "housing",
//   housingColor: HOUSING_COLORS[0].value,
//   switchType: SWITCH_TYPES[0].value,
//   keycap: KEYCAP_OPTIONS[0].value,
// }

// type CartItem = {
//   id: number;
//   housingColor: string;
//   switchType: string;
//   keycap: string;
//   quantity: number;
//   price: number;
//   customizations: {
//     housingColor: string;
//     switchType: string;
//     keycap: string;
//   };
// }

// type OrderForm = {
//   fullName: string;
//   phone: string;
//   email: string;
//   address: string;
//   city: string;
//   postalCode: string;
//   notes: string;
// }

// type OrderStep = "customizing" | "review" | "shipping" | "confirmation"

// export default function FidgetClickerCustomizer() {
//   const { state, updateState, updateStep, resetState } = useCustomizerState()
//   const [isWishlisted, setIsWishlisted] = useState(false)
//   const [quantity, setQuantity] = useState(1)
//   const [cartItems, setCartItems] = useState<CartItem[]>([])
//   const [orderStep, setOrderStep] = useState<OrderStep>("customizing")
//   const [orderForm, setOrderForm] = useState<OrderForm>({
//     fullName: "",
//     phone: "",
//     email: "",
//     address: "",
//     city: "",
//     postalCode: "",
//     notes: ""
//   })
//   const [isCartOpen, setIsCartOpen] = useState(false)
//   const [orderConfirmed, setOrderConfirmed] = useState(false)

//   const currentStepIndex = steps.findIndex((step) => step.id === state.currentStep)
//   const currentStepData = steps[currentStepIndex]

//   const canGoNext = currentStepIndex < steps.length - 1
//   const canGoPrev = currentStepIndex > 0
//   const price = 20
//   const totalPrice = price * quantity

//   const handleNext = () => {
//     if (canGoNext) {
//       updateStep(steps[currentStepIndex + 1].id as any)
//     }
//   }

//   const handlePrev = () => {
//     if (canGoPrev) {
//       updateStep(steps[currentStepIndex - 1].id as any)
//     }
//   }

//   const increaseQuantity = () => setQuantity(prev => prev + 1)
//   const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

//   const addToCart = () => {
//     const newItem: CartItem = {
//       id: Date.now(),
//       ...state,
//       quantity,
//       price: totalPrice,
//       customizations: {
//         housingColor: state.housingColor,
//         switchType: state.switchType,
//         keycap: state.keycap
//       }
//     }
//     setCartItems(prev => [...prev, newItem])
//     resetToDefault()
//   }

//   const removeFromCart = (itemId: number) => {
//     setCartItems(prev => prev.filter(item => item.id !== itemId))
//   }

//   const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
//     if (newQuantity < 1) return
//     setCartItems(prev => prev.map(item => 
//       item.id === itemId 
//         ? { ...item, quantity: newQuantity, price: price * newQuantity }
//         : item
//     ))
//   }

//   const resetToDefault = () => {
//     resetState()
//     setQuantity(1)
//   }

//   const clearCart = () => {
//     setCartItems([])
//     setIsCartOpen(false)
//   }

//   const proceedToReview = () => {
//     if (cartItems.length === 0) {
//       addToCart()
//     }
//     setOrderStep("review")
//   }

//   const proceedToShipping = () => {
//     setOrderStep("shipping")
//   }

//   const handleOrderFormChange = (field: keyof OrderForm, value: string) => {
//     setOrderForm(prev => ({ ...prev, [field]: value }))
//   }

//   const submitOrder = () => {
//     // Simulate order submission
//     console.log("Order submitted:", { items: cartItems, customer: orderForm })
//     setOrderStep("confirmation")
//     setOrderConfirmed(true)
//   }

//   const startNewOrder = () => {
//     setCartItems([])
//     setOrderStep("customizing")
//     setOrderForm({
//       fullName: "",
//       phone: "",
//       email: "",
//       address: "",
//       city: "",
//       postalCode: "",
//       notes: ""
//     })
//     setOrderConfirmed(false)
//     resetToDefault()
//   }

//   const getCartTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0)
//   const getCartTotalPrice = () => cartItems.reduce((total, item) => total + item.price, 0)

//   const getOptionLabel = (type: "housing" | "switch" | "keycap", value: string) => {
//     const options = type === "housing" ? HOUSING_COLORS : type === "switch" ? SWITCH_TYPES : KEYCAP_OPTIONS
//     return options.find(opt => opt.value === value)?.label || value
//   }

//   // Render different content based on order step
//   const renderContent = () => {
//     switch (orderStep) {
//       case "review":
//         return renderReviewStep()
//       case "shipping":
//         return renderShippingStep()
//       case "confirmation":
//         return renderConfirmationStep()
//       default:
//         return renderCustomizingStep()
//     }
//   }

//   const renderCustomizingStep = () => (
//     <>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
//           <div className="text-sm text-muted-foreground">
//             Step {currentStepIndex + 1} of {steps.length}
//             {cartItems.length > 0 && ` • ${getCartTotalItems()} in cart`}
//           </div>
//         </div>

//         <div className="flex space-x-2">
//           {steps.map((step, index) => (
//             <div
//               key={step.id}
//               className={`flex-1 h-2 rounded-full transition-colors ${
//                 index <= currentStepIndex ? "bg-primary" : "bg-muted"
//               }`}
//             />
//           ))}
//         </div>

//         <p className="text-muted-foreground text-lg">{currentStepData.subtitle}</p>
//       </div>

//       <Card className="p-6 space-y-6 shadow-lg">
//         {state.currentStep === "housing" && (
//           <div className="space-y-4">
//             <h3 className="font-semibold text-lg">Housing Color</h3>
//             <ColorPicker
//               colors={HOUSING_COLORS}
//               selectedColor={state.housingColor}
//               onColorSelect={(color) => updateState("housingColor", color)}
//               title=""
//             />
//           </div>
//         )}

//         {state.currentStep === "switch" && (
//           <div className="space-y-4">
//             <h3 className="font-semibold text-lg">Switch Type</h3>
//             <OptionSelector
//               options={SWITCH_TYPES as any}
//               selectedOption={state.switchType}
//               onOptionSelect={(option) => updateState("switchType", option)}
//               title=""
//               layout="horizontal"
//             />
//           </div>
//         )}

//         {state.currentStep === "keycap" && (
//           <div className="space-y-4">
//             <h3 className="font-semibold text-lg">Keycap Design</h3>
//             <OptionSelector
//               options={KEYCAP_OPTIONS}
//               selectedOption={state.keycap}
//               onOptionSelect={(option) => updateState("keycap", option)}
//               title=""
//               layout="grid"
//             />
//           </div>
//         )}
//       </Card>

//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <Button
//             variant="outline"
//             onClick={handlePrev}
//             disabled={!canGoPrev}
//             className="flex items-center space-x-2 px-6 py-3"
//           >
//             <ChevronLeft className="h-4 w-4" />
//             <span>Previous</span>
//           </Button>

//           {canGoNext ? (
//             <Button onClick={handleNext} className="flex items-center px-6 py-3">
//               <span>Next</span>
//               <ChevronRight className="h-4 w-4 ml-2" />
//             </Button>
//           ) : (
//             <Button className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700">
//               <Check className="h-4 w-4 mr-2" />
//               <span>Complete</span>
//             </Button>
//           )}
//         </div>

//         {!canGoNext && (
//           <Card className="p-6 space-y-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
//             <div className="flex items-center justify-between">
//               <span className="font-semibold text-lg">Quantity</span>
//               <div className="flex items-center space-x-3">
//                 <Button variant="outline" size="icon" onClick={decreaseQuantity} className="h-10 w-10">
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="w-12 text-center font-bold text-xl">{quantity}</span>
//                 <Button variant="outline" size="icon" onClick={increaseQuantity} className="h-10 w-10">
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-2xl font-bold">
//               <span>Total Price:</span>
//               <span className="text-primary">{totalPrice} TND</span>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <Button variant="outline" size="lg" className="w-full py-4" onClick={addToCart}>
//                 <Plus className="h-5 w-5 mr-2" />
//                 Add to Cart
//               </Button>
              
//               <Button size="lg" className="w-full py-4 bg-primary hover:bg-primary/90" 
//                 onClick={proceedToReview}>
//                 <ListOrdered className="h-5 w-5 mr-2" />
//                 Review Order ({getCartTotalItems() + (canGoNext ? 0 : 1)})
//               </Button>
//             </div>

//             {cartItems.length > 0 && (
//               <div className="pt-4 border-t border-border">
//                 <div className="text-sm text-muted-foreground flex justify-between">
//                   <span>Cart: {getCartTotalItems()} item(s)</span>
//                   <span className="font-semibold">Total: {getCartTotalPrice()} TND</span>
//                 </div>
//               </div>
//             )}
//           </Card>
//         )}
//       </div>
//     </>
//   )

//   const renderReviewStep = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Review Your Order</h2>
//         <Badge variant="secondary" className="text-sm px-3 py-1">Step 1 of 3</Badge>
//       </div>

//       <Card className="p-6 shadow-lg">
//         <div className="space-y-4">
//           <h3 className="font-semibold text-xl">Order Items ({getCartTotalItems()} items)</h3>
//           <div className="space-y-4">
//             {cartItems.map((item) => (
//               <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
//                     <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg" 
//                          style={{ backgroundColor: item.customizations.housingColor }} />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-lg">Custom Fidget Clicker</p>
//                     <p className="text-sm text-muted-foreground">
//                       {getOptionLabel("housing", item.customizations.housingColor)} • 
//                       {getOptionLabel("switch", item.customizations.switchType)} • 
//                       {getOptionLabel("keycap", item.customizations.keycap)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center space-x-2">
//                     <Button variant="outline" size="icon" className="h-8 w-8" 
//                       onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}>
//                       <Minus className="h-3 w-3" />
//                     </Button>
//                     <span className="w-8 text-center font-semibold">{item.quantity}</span>
//                     <Button variant="outline" size="icon" className="h-8 w-8"
//                       onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>
//                       <Plus className="h-3 w-3" />
//                     </Button>
//                   </div>
//                   <span className="font-bold text-lg w-20 text-right">{item.price} TND</span>
//                   <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
//                     <Trash2 className="h-4 w-4 text-red-500" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <Separator />
          
//           <div className="flex justify-between items-center font-bold text-2xl">
//             <span>Total</span>
//             <span className="text-primary">{getCartTotalPrice()} TND</span>
//           </div>
//         </div>
//       </Card>

//       <div className="flex space-x-4">
//         <Button variant="outline" className="flex-1 py-3" onClick={() => setOrderStep("customizing")}>
//           <ChevronLeft className="h-4 w-4 mr-2" />
//           Continue Shopping
//         </Button>
//         <Button className="flex-1 py-3 bg-primary hover:bg-primary/90" onClick={proceedToShipping}>
//           Proceed to Shipping
//           <ChevronRight className="h-4 w-4 ml-2" />
//         </Button>
//       </div>
//     </div>
//   )

//   const renderShippingStep = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Shipping Information</h2>
//         <Badge variant="secondary" className="text-sm px-3 py-1">Step 2 of 3</Badge>
//       </div>

//       <Card className="p-6 shadow-lg">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="fullName" className="text-sm font-semibold">Full Name *</Label>
//               <Input
//                 id="fullName"
//                 value={orderForm.fullName}
//                 onChange={(e) => handleOrderFormChange("fullName", e.target.value)}
//                 placeholder="John Doe"
//                 className="mt-1"
//               />
//             </div>
//             <div>
//               <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
//               <Input
//                 id="phone"
//                 value={orderForm.phone}
//                 onChange={(e) => handleOrderFormChange("phone", e.target.value)}
//                 placeholder="+216 XX XXX XXX"
//                 className="mt-1"
//               />
//             </div>
//             <div>
//               <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={orderForm.email}
//                 onChange={(e) => handleOrderFormChange("email", e.target.value)}
//                 placeholder="john@example.com"
//                 className="mt-1"
//               />
//             </div>
//           </div>
          
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="address" className="text-sm font-semibold">Delivery Address *</Label>
//               <Input
//                 id="address"
//                 value={orderForm.address}
//                 onChange={(e) => handleOrderFormChange("address", e.target.value)}
//                 placeholder="Street address"
//                 className="mt-1"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
//                 <Input
//                   id="city"
//                   value={orderForm.city}
//                   onChange={(e) => handleOrderFormChange("city", e.target.value)}
//                   placeholder="City"
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="postalCode" className="text-sm font-semibold">Postal Code</Label>
//                 <Input
//                   id="postalCode"
//                   value={orderForm.postalCode}
//                   onChange={(e) => handleOrderFormChange("postalCode", e.target.value)}
//                   placeholder="XXXX"
//                   className="mt-1"
//                 />
//               </div>
//             </div>
//             <div>
//               <Label htmlFor="notes" className="text-sm font-semibold">Delivery Notes</Label>
//               <Textarea
//                 id="notes"
//                 value={orderForm.notes}
//                 onChange={(e) => handleOrderFormChange("notes", e.target.value)}
//                 placeholder="Any special delivery instructions..."
//                 rows={3}
//                 className="mt-1"
//               />
//             </div>
//           </div>
//         </div>
//       </Card>

//       <div className="flex space-x-4">
//         <Button variant="outline" className="flex-1 py-3" onClick={() => setOrderStep("review")}>
//           <ChevronLeft className="h-4 w-4 mr-2" />
//           Back to Review
//         </Button>
//         <Button 
//         variant="outline"
//           className="flex-1 py-3 bg-green-600 hover:bg-green-700" 
//           onClick={submitOrder}
//           disabled={!orderForm.fullName || !orderForm.phone || !orderForm.address || !orderForm.city}
//         >
//           <CreditCard className="h-4 w-4 mr-2" />
//           Place Order
//         </Button>
//       </div>
//     </div>
//   )

//   const renderConfirmationStep = () => (
//     <div className="space-y-8 text-center">
//       <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
//         <Check className="h-10 w-10 text-green-600" />
//       </div>
      
//       <div>
//         <h2 className="text-3xl font-bold text-green-600">Order Confirmed!</h2>
//         <p className="text-muted-foreground mt-3 text-lg">
//           Thank you for your purchase. Your order has been successfully placed.
//         </p>
//       </div>

//       <Card className="p-6 max-w-md mx-auto shadow-lg">
//         <div className="space-y-4">
//           <div className="flex justify-between text-lg">
//             <span>Order Total:</span>
//             <span className="font-bold">{getCartTotalPrice()} TND</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Items:</span>
//             <span>{getCartTotalItems()} item(s)</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Delivery to:</span>
//             <span className="text-right font-semibold">{orderForm.city}</span>
//           </div>
//         </div>
//       </Card>

//       <Button onClick={startNewOrder} className="bg-primary hover:bg-primary/90 px-8 py-3">
//         <RotateCcw className="h-4 w-4 mr-2" />
//         Start New Order
//       </Button>
//     </div>
//   )

//   return (
//     <div className="w-full h-full max-w-6xl mx-auto bg-background shadow-2xl rounded-3xl ">
//       <header className="border-b border-border rounded-3xl bg-card/50 backdrop-blur-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <div className="font-bold text-2xl text-foreground">ClickCraft</div>
//               <Badge variant="secondary" className="hidden sm:inline-flex">
//                 Premium
//               </Badge>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               {orderStep === "customizing" && cartItems.length > 0 && (
//                 <Badge variant="default" className="bg-primary text-primary-foreground">
//                   {getCartTotalItems()} items - {getCartTotalPrice()} TND
//                 </Badge>
//               )}
              
//               {orderStep === "customizing" && (
//                 <Button variant="outline" size="sm"    onClick={proceedToReview}>
//                   <ShoppingCart className="h-4 w-4 mr-2" />
//                   Cart ({getCartTotalItems()})
//                 </Button>
//               )}
              
//               <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
//                 Support
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
//           <div className="lg:col-span-1 order-2 lg:order-1 w-full">
//             <div className="sticky top-24 h-[500px]">
//               <div className="relative w-full h-full bg-gradient-to-br from-card to-muted/30 rounded-3xl border border-border/50 overflow-hidden ">
//                 <Canvas camera={{ position: [0, 0, 8], fov: 50 }} shadows className="w-full h-full" dpr={[1, 2]}>
//                   <Suspense fallback={null}>
//                     <Scene state={state} />
//                     <OrbitControls
//                       enablePan={false}
//                       enableZoom={true}
//                       enableRotate={true}
//                       autoRotate={orderStep === "customizing"}
//                       autoRotateSpeed={0.3}
//                       maxPolarAngle={Math.PI / 1.8}
//                       minDistance={5}
//                       maxDistance={12}
//                       zoomSpeed={0.5}
//                     />
//                     <Environment preset="city" />
//                   </Suspense>
//                 </Canvas>

//                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
//                   <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 text-xs text-muted-foreground">
//                     Drag • Zoom • Explore
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="order-1 lg:order-2 space-y-8 flex flex-col justify-center">
//             {renderContent()}
//           </div>
//         </div>
//       </div>

//       {/* Cart Dialog */}
//       <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle className="text-xl">Shopping Cart ({getCartTotalItems()} items)</DialogTitle>
//           </DialogHeader>
          
//           <div className="space-y-4 max-h-96 overflow-y-auto">
//             {cartItems.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                 <p>Your cart is empty</p>
//               </div>
//             ) : (
//               cartItems.map((item) => (
//                 <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
//                       <div className="w-8 h-8 rounded-full border border-white" 
//                            style={{ backgroundColor: item.customizations.housingColor }} />
//                     </div>
//                     <div>
//                       <p className="font-semibold">Custom Clicker</p>
//                       <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <span className="font-bold">{item.price} TND</span>
//                     <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
          
//           {cartItems.length > 0 && (
//             <>
//               <Separator />
//               <div className="flex justify-between items-center font-bold text-lg">
//                 <span>Total</span>
//                 <span>{getCartTotalPrice()} TND</span>
//               </div>
//             </>
//           )}
          
//           <DialogFooter className="flex flex-col sm:flex-row gap-3">
//             {cartItems.length > 0 && (
//               <Button variant="outline" onClick={clearCart} className="flex-1">
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Clear Cart
//               </Button>
//             )}
//             <Button 
//               onClick={() => {
//                 setIsCartOpen(false)
//                 if (cartItems.length > 0) setOrderStep("review")
//               }} 
//               className="flex-1"
//               disabled={cartItems.length === 0}
//             >
//               {cartItems.length > 0 ? 'Checkout' : 'Continue Shopping'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }
"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  ChevronLeft, ChevronRight, ShoppingCart, Check, 
  Plus, Minus, RotateCcw, X, CreditCard, 
  Trash2, ListOrdered
} from "lucide-react"

import { Scene } from "./scene"
import { ColorPicker, OptionSelector } from "./ui"
import { useCustomizerState } from "./hooks"
import { HOUSING_COLORS, SWITCH_TYPES, KEYCAP_OPTIONS } from "./config/index"

const steps = [
  { id: "housing", title: "Housing", subtitle: "Choose your base color" },
  { id: "switch", title: "Switch", subtitle: "Select switch type" },
  { id: "keycap", title: "Keycap", subtitle: "Pick your design" },
  { id: "emoji", title: "Emoji", subtitle: "Add a fun emoji" },
]

const EMOJI_OPTIONS = [
  { value: "fire", label: " Fire", emoji: "🔥" },
  { value: "watermelon", label: "Watermelon", emoji: "🍉" },
  { value: "cherry", label: " Cherry", emoji: "🍒" },
  { value: "eggplant", label: " Eggplant", emoji: "🍆" },
  { value: "chocolate", label: " Chocolate", emoji: "💩" },
  { value: "pepper", label: "Pepper", emoji: "🌶️" },
  { value: "rose", label: " Rose", emoji: "🌹" },
  { value: "heart", label: " Heart", emoji: "❤️" },
  { value: "banana", label: " Banana", emoji: "🍌" },
  { value: "peach", label: " Peach", emoji: "🍑" },
  { value: "UFO", label: " UFO", emoji: "🛸" },
  { value: "no emoji", label: " No Emoji", emoji: "" },
]

// const DEFAULT_STATE = {
//   currentStep: "housing",
//   housingColor: HOUSING_COLORS[0].value,
//   switchType: SWITCH_TYPES[0].value,
//   keycap: KEYCAP_OPTIONS[0].value,
//   emoji: EMOJI_OPTIONS[0].value,
// }

type CartItem = {
  id: number;
  housingColor: string;
  switchType: string;
  keycap: string;
  emoji: string;
  quantity: number;
  price: number;
  customizations: {
    housingColor: string;
    switchType: string;
    keycap: string;
    emoji: string;
  };
}

type OrderForm = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

type OrderStep = "customizing" | "review" | "shipping" | "confirmation"

export default function FidgetClickerCustomizer() {
  const { state, updateState, updateStep, resetState } = useCustomizerState()
  const [quantity, setQuantity] = useState(1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderStep, setOrderStep] = useState<OrderStep>("customizing")
  const [orderForm, setOrderForm] = useState<OrderForm>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: ""
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)

  const currentStepIndex = steps.findIndex((step) => step.id === state.currentStep)
  const currentStepData = steps[currentStepIndex]

  const canGoNext = currentStepIndex < steps.length - 1
  const canGoPrev = currentStepIndex > 0
  const price = 20
  const totalPrice = price * quantity

  const handleNext = () => {
    if (canGoNext) {
      updateStep(steps[currentStepIndex + 1].id as any)
    }
  }

  const handlePrev = () => {
    if (canGoPrev) {
      updateStep(steps[currentStepIndex - 1].id as any)
    }
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  const addToCart = () => {
    const newItem: any = {
      id: Date.now(),
      ...state,
      quantity,
      price: totalPrice,
      customizations: {
        housingColor: state.housingColor,
        switchType: state.switchType,
        keycap: state.keycap,
        emoji: state.emoji as any
      }
    }
    setCartItems(prev => [...prev, newItem])
    resetToDefault()
  }

  const removeFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, price: price * newQuantity }
        : item
    ))
  }

  const resetToDefault = () => {
    resetState()
    setQuantity(1)
  }

  const clearCart = () => {
    setCartItems([])
    setIsCartOpen(false)
  }

  const proceedToReview = () => {
    if (cartItems.length === 0) {
      addToCart()
    }
    setOrderStep("review")
  }

  const proceedToShipping = () => {
    setOrderStep("shipping")
  }

  const handleOrderFormChange = (field: keyof OrderForm, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }))
  }

  const submitOrder = () => {
    // Simulate order submission
    console.log("Order submitted:", { items: cartItems, customer: orderForm })
    setOrderStep("confirmation")
    setOrderConfirmed(true)
  }

  const startNewOrder = () => {
    setCartItems([])
    setOrderStep("customizing")
    setOrderForm({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      notes: ""
    })
    setOrderConfirmed(false)
    resetToDefault()
  }

  const getCartTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0)
  const getCartTotalPrice = () => cartItems.reduce((total, item) => total + item.price, 0)

  const getOptionLabel = (type: "housing" | "switch" | "keycap" | "emoji", value: string) => {
    const options = type === "housing" ? HOUSING_COLORS : 
                   type === "switch" ? SWITCH_TYPES : 
                   type === "emoji" ? EMOJI_OPTIONS : KEYCAP_OPTIONS as any
    return options.find((opt: any) => opt.value === value)?.label  || value
  }

  const getEmojiByValue = (value: string) => {
    return EMOJI_OPTIONS.find((opt: any) => opt.value === value)?.emoji || "❓"
  }

  // Render different content based on order step
  const renderContent = () => {
    switch (orderStep) {
      case "review":
        return renderReviewStep()
      case "shipping":
        return renderShippingStep()
      case "confirmation":
        return renderConfirmationStep()
      default:
        return renderCustomizingStep()
    }
  }

  const renderCustomizingStep = () => (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
            {cartItems.length > 0 && ` • ${getCartTotalItems()} in cart`}
          </div>
        </div>

        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-colors ${
                index <= currentStepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-muted-foreground text-lg">{currentStepData.subtitle}</p>
      </div>

      <Card className="p-6 space-y-6 shadow-lg">
        {state.currentStep === "housing" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Housing Color</h3>
            <ColorPicker
              colors={HOUSING_COLORS}
              selectedColor={state.housingColor}
              onColorSelect={(color) => updateState("housingColor", color)}
              title=""
            />
          </div>
        )}

        {state.currentStep === "switch" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Switch Type</h3>
            <OptionSelector
              options={SWITCH_TYPES as any}
              selectedOption={state.switchType}
              onOptionSelect={(option) => updateState("switchType", option)}
              title=""
              layout="horizontal"
            />
          </div>
        )}

        {state.currentStep === "keycap" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Keycap Design</h3>
            <OptionSelector
              options={KEYCAP_OPTIONS}
              selectedOption={state.keycap}
              onOptionSelect={(option) => updateState("keycap", option)}
              title=""
              layout="grid"
            />
          </div>
        )}

        {state.currentStep === "emoji" as any && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Your Emoji</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji.value}
                  onClick={() => updateState("emoji", emoji.value)}
                  className={`p-4 w-24 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                    state.emoji === emoji.value
                      ? "border-primary bg-primary/10 scale-105 shadow-md"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="text-4xl text-center mb-2">{emoji.emoji}</div>
                  <div className="text-sm font-medium text-center">{emoji.label}</div>
                </button>
              ))}
            </div>
            {state.emoji && (
              <div className="text-center mt-4 p-3 bg-muted/30 rounded-lg">
                <span className="text-lg font-semibold">Selected: </span>
                <span className="text-2xl ml-2">{getEmojiByValue(state.emoji)}</span>
                <span className="ml-2 text-muted-foreground">{getOptionLabel("emoji", state.emoji)}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="flex items-center space-x-2 px-6 py-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {canGoNext ? (
            <Button onClick={handleNext} className="flex items-center px-6 py-3">
              <span>Next</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              <span>Complete</span>
            </Button>
          )}
        </div>

        {!canGoNext && (
          <Card className="p-6 space-y-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Quantity</span>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="icon" onClick={decreaseQuantity} className="h-10 w-10">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                <Button variant="outline" size="icon" onClick={increaseQuantity} className="h-10 w-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-2xl font-bold">
              <span>Total Price:</span>
              <span className="text-primary">{totalPrice} TND</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="w-full py-4" onClick={addToCart}>
                <Plus className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button size="lg" className="w-full py-4 bg-primary hover:bg-primary/90" 
                onClick={proceedToReview}>
                <ListOrdered className="h-5 w-5 mr-2" />
                Review Order ({getCartTotalItems() + (canGoNext ? 0 : 1)})
              </Button>
            </div>

            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Cart: {getCartTotalItems()} item(s)</span>
                  <span className="font-semibold">Total: {getCartTotalPrice()} TND</span>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Review Your Order</h2>
        <Badge variant="secondary" className="text-sm px-3 py-1">Step 1 of 3</Badge>
      </div>

      <Card className="p-6 shadow-lg">
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Order Items ({getCartTotalItems()} items)</h3>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center relative">
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg" 
                         style={{ backgroundColor: item.customizations.housingColor }} />
                    <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 border-2 border-white">
                      <span className="text-xl">{getEmojiByValue(item.customizations.emoji)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Custom Fidget Clicker</p>
                    <p className="text-sm text-muted-foreground">
                      {getOptionLabel("housing", item.customizations.housingColor)} • 
                      {getOptionLabel("switch", item.customizations.switchType)} • 
                      {getOptionLabel("keycap", item.customizations.keycap)} • 
                      {getOptionLabel("emoji", item.customizations.emoji)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" 
                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8"
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-bold text-lg w-20 text-right">{item.price} TND</span>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center font-bold text-2xl">
            <span>Total</span>
            <span className="text-primary">{getCartTotalPrice()} TND</span>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline" className="flex-1 py-3" onClick={() => setOrderStep("customizing")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <Button className="flex-1 py-3 bg-primary hover:bg-primary/90" onClick={proceedToShipping}>
          Proceed to Shipping
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderShippingStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shipping Information</h2>
        <Badge variant="secondary" className="text-sm px-3 py-1">Step 2 of 3</Badge>
      </div>

      <Card className="p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-semibold">Full Name *</Label>
              <Input
                id="fullName"
                value={orderForm.fullName}
                onChange={(e) => handleOrderFormChange("fullName", e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
              <Input
                id="phone"
                value={orderForm.phone}
                onChange={(e) => handleOrderFormChange("phone", e.target.value)}
                placeholder="+216 XX XXX XXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={orderForm.email}
                onChange={(e) => handleOrderFormChange("email", e.target.value)}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-sm font-semibold">Delivery Address *</Label>
              <Input
                id="address"
                value={orderForm.address}
                onChange={(e) => handleOrderFormChange("address", e.target.value)}
                placeholder="Street address"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                <Input
                  id="city"
                  value={orderForm.city}
                  onChange={(e) => handleOrderFormChange("city", e.target.value)}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="postalCode" className="text-sm font-semibold">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={orderForm.postalCode}
                  onChange={(e) => handleOrderFormChange("postalCode", e.target.value)}
                  placeholder="XXXX"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-semibold">Delivery Notes</Label>
              <Textarea
                id="notes"
                value={orderForm.notes}
                onChange={(e) => handleOrderFormChange("notes", e.target.value)}
                placeholder="Any special delivery instructions..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline" className="flex-1 py-3" onClick={() => setOrderStep("review")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Review
        </Button>
        <Button 
          variant="outline"
          className="flex-1 py-3 bg-green-600 hover:bg-green-700" 
          onClick={submitOrder}
          disabled={!orderForm.fullName || !orderForm.phone || !orderForm.address || !orderForm.city}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Place Order
        </Button>
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="space-y-8 text-center">
      <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-green-600">Order Confirmed!</h2>
        <p className="text-muted-foreground mt-3 text-lg">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      <Card className="p-6 max-w-md mx-auto shadow-lg">
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Order Total:</span>
            <span className="font-bold">{getCartTotalPrice()} TND</span>
          </div>
          <div className="flex justify-between">
            <span>Items:</span>
            <span>{getCartTotalItems()} item(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery to:</span>
            <span className="text-right font-semibold">{orderForm.city}</span>
          </div>
        </div>
      </Card>

      <Button onClick={startNewOrder} className="bg-primary hover:bg-primary/90 px-8 py-3">
        <RotateCcw className="h-4 w-4 mr-2" />
        Start New Order
      </Button>
    </div>
  )

  return (
    <div className="w-full h-full max-w-6xl mx-auto bg-background shadow-2xl rounded-3xl ">
      <header className="border-b border-border rounded-3xl bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="font-bold text-2xl text-foreground">ClickCraft</div>
              {/* <Badge variant="secondary" className="hidden sm:inline-flex">
                Premium
              </Badge> */}
            </div>
            
            <div className="flex items-center space-x-4">
              {orderStep === "customizing" && cartItems.length > 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {getCartTotalItems()} items - {getCartTotalPrice()} TND
                </Badge>
              )}
              
              {orderStep === "customizing" && (
                <Button variant="outline" size="sm"    onClick={proceedToReview}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({getCartTotalItems()})
                </Button>
              )}
              
              {/* <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Support
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="lg:col-span-1 order-2 lg:order-1 w-full">
            <div className="sticky top-24 h-[500px]">
              <div className="relative w-full h-full bg-gradient-to-br from-card to-muted/30 rounded-3xl border border-border/50 overflow-hidden ">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }} shadows className="w-full h-full" dpr={[1, 2]}>
                  <Suspense fallback={null}>
                    <Scene state={state} />
                    <OrbitControls
                      enablePan={false}
                      enableZoom={true}
                      enableRotate={true}
                      autoRotate={orderStep === "customizing"}
                      autoRotateSpeed={0.3}
                      maxPolarAngle={Math.PI / 1.8}
                      minDistance={5}
                      maxDistance={12}
                      zoomSpeed={0.5}
                    />
                    <Environment preset="city" />
                  </Suspense>
                </Canvas>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 text-xs text-muted-foreground">
                    Drag • Zoom • Explore
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8 flex flex-col justify-center">
            {renderContent()}
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
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center relative">
                      <div className="w-8 h-8 rounded-full border border-white" 
                           style={{ backgroundColor: item.customizations.housingColor }} />
                      <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 border border-white text-xs">
                        {getEmojiByValue(item.customizations.emoji)}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">Custom Clicker</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold">{item.price} TND</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {cartItems.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{getCartTotalPrice()} TND</span>
              </div>
            </>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            {cartItems.length > 0 && (
              <Button variant="outline" onClick={clearCart} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
            <Button 
              onClick={() => {
                setIsCartOpen(false)
                if (cartItems.length > 0) setOrderStep("review")
              }} 
              className="flex-1"
              disabled={cartItems.length === 0}
            >
              {cartItems.length > 0 ? 'Checkout' : 'Continue Shopping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}