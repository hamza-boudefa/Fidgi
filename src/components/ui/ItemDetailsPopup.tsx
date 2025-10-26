"use client"

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent } from './dialog';
import { cn } from '@/lib/utils';

interface ItemDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    cost?: number;
    images: string[];
    type: 'fidgiColor' | 'keycapDesign' | 'switchType' | 'prebuiltFidgi' | 'otherFidget';
    colorHex?: string;
    category?: string;
    quantity?: number;
    isActive?: boolean;
  } | null;
  
}

export function ItemDetailsPopup({ isOpen, onClose, item }: ItemDetailsPopupProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
      setIsZoomed(false);
    }
  }, [isOpen]);

  if (!item) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No item details available</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'fidgiColor': return 'Base Color';
      case 'keycapDesign': return 'Keycap Design';
      case 'switchType': return 'Switch Type';
      case 'prebuiltFidgi': return 'Prebuilt Fidget';
      case 'otherFidget': return 'Other Fidget';
      default: return 'Item';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="max-w-6xl w-[95vw] h-auto max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col" showCloseButton={false}>
        {/* Header - Responsive */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b bg-background">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{item.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{getItemTypeLabel(item.type)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row overflow-auto flex-1 min-h-0">
          {/* Image Section - Responsive */}
          <div className="w-full lg:w-1/2 flex-shrink-0 p-4 sm:p-6 bg-secondary/30">
            <div className="space-y-4">
              {/* Main Image Container */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-background shadow-medium">
                <img
                  src={item.images[currentImageIndex]}
                  alt={`${item.name} ${currentImageIndex + 1}`}
                  className={cn(
                    "w-full h-full object-cover cursor-pointer transition-transform duration-300",
                    isZoomed ? "scale-150" : "scale-100"
                  )}
                  onClick={toggleZoom}
                />
                
                {/* Zoom Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3 h-9 w-9 shadow-medium hover:scale-105 transition-transform"
                  onClick={toggleZoom}
                >
                  {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </Button>

                {/* Navigation Arrows - Only show if multiple images */}
                {item.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 shadow-medium hover:scale-105 transition-transform"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 shadow-medium hover:scale-105 transition-transform"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                {item.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-foreground/80 text-background text-xs sm:text-sm px-3 py-1.5 rounded-full backdrop-blur">
                    {currentImageIndex + 1} / {item.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation - Responsive grid */}
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                        index === currentImageIndex 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => goToImage(index)}
                    >
                      <img
                        src={image}
                        alt={`${item.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section - Responsive with scroll */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 space-y-4 flex-1 min-h-0">
            {/* Scroll indicator for mobile */}
            <div className="lg:hidden -mt-2 mb-2 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <ChevronRight className="h-3 w-3 rotate-90" />
                <span>Scroll for details</span>
              </div>
            </div>
            {/* Price Card */}
            <div className="bg-gradient-to-br from-success/10 to-success/5 p-4 sm:p-5 rounded-xl border border-success/20 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-success">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                {item.price === 0 && (
                  <span className="bg-success/15 text-success text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">
                    Included
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-card p-4 sm:p-5 rounded-xl border shadow-soft">
                <h3 className="font-semibold text-base sm:text-lg mb-2">Description</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Color Swatch */}
            {item.colorHex && (
              <div className="bg-card p-4 sm:p-5 rounded-xl border shadow-soft">
                <h3 className="font-semibold text-base sm:text-lg mb-3">Color</h3>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-border shadow-soft flex-shrink-0"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  {/* <div className="min-w-0">
                    <p className="font-mono font-medium text-sm sm:text-base">{item.colorHex}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Hex Color Code</p>
                  </div> */}
                </div>
              </div>
            )}

            {/* Category */}
            {item.category && (
              <div className="bg-card p-4 sm:p-5 rounded-xl border shadow-soft">
                <h3 className="font-semibold text-base sm:text-lg mb-3">Category</h3>
                <span className="inline-flex items-center bg-primary/10 text-primary text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">
                  {item.category}
                </span>
              </div>
            )}

            {/* Prebuilt Badge */}
            {item.type === 'prebuiltFidgi' && (
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-4 sm:p-5 rounded-xl border border-accent/20 shadow-soft">
                <h3 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  Ready to Use
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This is a pre-built Fidgi combination with carefully selected components for the best experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
