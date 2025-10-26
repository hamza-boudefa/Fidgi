"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FidgiButton } from '@/components/ui/FidgiButton'
import { ItemCardCarousel } from '@/components/ui/ItemCardCarousel'
import { ItemDetailsPopup } from '@/components/ui/ItemDetailsPopup'
import { useCart } from '@/contexts/CartContext'
import { 
  ShoppingCart, 
  Star,
  Heart,
  Share2,
  Loader2,
  X,
  Filter
} from 'lucide-react'
import Image from 'next/image'

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

interface OtherFidgetSectionProps {
  onAddToCart?: (item: any) => void
  sessionId?: string
}

export default function OtherFidgetSection({ onAddToCart, sessionId }: OtherFidgetSectionProps) {
  const { addOtherFidgetToCart } = useCart()
  const [otherFidgets, setOtherFidgets] = useState<OtherFidget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<(string | number)[]>([])
  const [isItemDetailsPopupOpen, setIsItemDetailsPopupOpen] = useState(false)
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<{
    id: string;
    name: string;
    description?: string;
    price: number;
    cost?: number;
    images: string[];
    type: 'otherFidget';
    category?: string;
    quantity?: number;
    isActive?: boolean;
  } | null>(null)

  // Generate session ID if not provided
  const [generatedSessionId] = useState(() => sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Helper function to get images for an item
  const getItemImages = (item: OtherFidget) => {
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

  // Open item details popup
  const openItemDetails = (item: OtherFidget) => {
    const itemWithDetails = {
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      images: getItemImages(item),
      type: 'otherFidget' as const,
      category: item.category,
      quantity: item.quantity,
      isActive: item.isActive
    }
    setSelectedItemForDetails(itemWithDetails)
    setIsItemDetailsPopupOpen(true)
  }

  // Load other fidgets from API
  useEffect(() => {
    const loadOtherFidgets = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products/other-fidgets?active=true')
        
        if (!response.ok) {
          throw new Error('Failed to load other fidgets')
        }

        const data = await response.json()
        setOtherFidgets(data.data)
        setError(null)
      } catch (err) {
        console.error('Error loading other fidgets:', err)
        setError('Failed to load other fidgets. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadOtherFidgets()
  }, [])

  // Add to cart function
  const addToCart = async (item: OtherFidget) => {
    try {
      addOtherFidgetToCart(item)
      if (onAddToCart) {
        onAddToCart(item)
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
    }
  }

  // Toggle favorite
  const toggleFavorite = (id: string | number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    )
  }

  // Get unique categories
  const categories = ['all', ...new Set(otherFidgets.map(item => item.category))]

  // Filter other fidgets by category
  const filteredFidgets = selectedCategory === 'all' 
    ? otherFidgets 
    : otherFidgets.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading other fidgets...</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Other Fidgets</h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Discover our collection of stress-relieving fidget toys and accessories
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      {/* {selectedCategory === 'all' && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Fidgets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFidgets
              .filter(item => item.isFeatured)
              .map((item) => (
                <OtherFidgetCard
                  key={item.id}
                  item={item}
                  onAddToCart={addToCart}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  getItemImages={getItemImages}
                  openItemDetails={openItemDetails}
                />
              ))}
          </div>
        </div>
      )} */}

      {/* All Other Fidgets */}
      <div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8">
          {selectedCategory === 'all' ? 'All Other Fidgets' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Fidgets`}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFidgets.map((item) => (
            <OtherFidgetCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              getItemImages={getItemImages}
              openItemDetails={openItemDetails}
            />
          ))}
        </div>
      </div>

      {filteredFidgets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No fidgets found in this category.</p>
        </div>
      )}

      {/* Item Details Popup */}
      <ItemDetailsPopup
        isOpen={isItemDetailsPopupOpen}
        onClose={() => setIsItemDetailsPopupOpen(false)}
        item={selectedItemForDetails}
      />
    </div>
  )
}

interface OtherFidgetCardProps {
  item: OtherFidget
  onAddToCart: (item: OtherFidget) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  getItemImages: (item: OtherFidget) => string[]
  openItemDetails: (item: OtherFidget) => void
}

function OtherFidgetCard({ item, onAddToCart, isFavorite, onToggleFavorite, getItemImages, openItemDetails }: OtherFidgetCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await onAddToCart(item)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const isOutOfStock = item.quantity === 0

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative cursor-pointer"
      onClick={() => !isOutOfStock && openItemDetails(item)}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 sm:h-52 lg:h-56 bg-muted">
          <ItemCardCarousel
            images={getItemImages(item)}
            alt={item.name}
            className="w-full h-full"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {item.isFeatured && (
              <Badge className="bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={onToggleFavorite}
              className="h-8 w-8 p-0"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">{item.name}</h4>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{item.description}</p>
          
          {/* Category */}
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Price and Actions */}
          <div className="space-y-3 mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{item.price} TND</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
