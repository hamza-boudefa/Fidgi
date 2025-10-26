"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface ItemCardCarouselProps {
  images: string[]
  alt: string
  className?: string
  showNavigation?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  onImageClick?: () => void
}

export function ItemCardCarousel({ 
  images, 
  alt, 
  className = "",
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onImageClick
}: ItemCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, autoPlayInterval, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          No image available
        </div>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={`relative bg-muted rounded-lg overflow-hidden group ${className}`}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover cursor-pointer"
          onClick={onImageClick}
          unoptimized
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
         <div className="w-full h-full flex items-center justify-center text-muted-foreground">
         {images.length > 1 && <div className="text-center">
            <div className="text-lg font-semibold">{alt}</div>
            <div className="text-xs opacity-75">No Image</div>
          </div>}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden group ${className}`}>
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-cover cursor-pointer"
              onClick={onImageClick}
              unoptimized
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {images.length < 1 && <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-semibold">{alt}</div>
                <div className="text-xs opacity-75">No Image</div>
              </div>
            </div>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {showNavigation && images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white z-10"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white z-10"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-black shadow-lg' 
                  : 'bg-black/50 hover:bg-black/75'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}
