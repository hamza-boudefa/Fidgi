"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Save, Loader2, Plus, Trash2, Move, Image as ImageIcon, Check } from 'lucide-react'
import { CloudinaryUpload } from '@/components/ui/CloudinaryUpload' // Updated for otherFidget support

interface InventoryItem {
  id: number
  name: string
  price: number
  cost: number
  quantity: number
  isActive: boolean
  type: 'base' | 'keycap' | 'switch' | 'prebuilt' | 'other-fidget'
  colorHex?: string
  description?: string
  category?: string
  imageUrl?: string
  images?: string[] // Multiple images
  originalPrice?: number
  discount?: number
  fidgiColorId?: number
  keycapId?: number
  switchId?: number
  tags?: string[]
  isFeatured?: boolean
}

interface ImageItem {
  id: string
  url: string
  altText: string
  isPrimary: boolean
  sortOrder: number
}

interface ItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  item?: InventoryItem | null
  type: 'base' | 'keycap' | 'switch' | 'prebuilt' | 'other-fidget'
  colors?: any[]
  keycaps?: any[]
  switches?: any[]
}

export default function ItemModal({ 
  isOpen, 
  onClose, 
  onSave, 
  item, 
  type,
  colors = [],
  keycaps = [],
  switches = []
}: ItemModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [images, setImages] = useState<ImageItem[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [reorderSuccess, setReorderSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        price: item.price || 0,
        cost: item.cost || 0,
        quantity: type === 'prebuilt' ? 1 : (item.quantity || 0), // Prebuilt items don't have quantity
        description: item.description || '',
        colorHex: item.colorHex || '',
        category: item.category || '',
        imageUrl: item.imageUrl || '',
        originalPrice: item.originalPrice || item.price || 0,
        discount: item.discount || 0,
        fidgiColorId: item.fidgiColorId || '',
        keycapId: item.keycapId || '',
        switchId: item.switchId || '',
        tags: item.tags ? item.tags.join(', ') : '',
        isFeatured: item.isFeatured || false,
      })
      
      // Initialize images from item
      if (item.images && item.images.length > 0) {
        const imageItems: ImageItem[] = item.images.map((url, index) => ({
          id: `img-${index}`,
          url,
          altText: `${item.name} image ${index + 1}`,
          isPrimary: false, // Remove primary logic
          sortOrder: index
        }))
        setImages(imageItems)
      } else if (item.imageUrl) {
        // If no multiple images but has single imageUrl, convert it
        setImages([{
          id: 'img-0',
          url: item.imageUrl,
          altText: `${item.name} image`,
          isPrimary: true,
          sortOrder: 0
        }])
      } else {
        setImages([])
      }
    } else {
      setFormData({
        name: '',
        price: 0,
        cost: 0,
        quantity: type === 'prebuilt' ? 1 : 0, // Prebuilt items don't have quantity
        description: '',
        colorHex: '',
        category: '',
        imageUrl: '',
        originalPrice: 0,
        discount: 0,
        fidgiColorId: '',
        keycapId: '',
        switchId: '',
        tags: '',
        isFeatured: false,
      })
      setImages([])
    }
    setNewImageUrl('')
    setErrors({})
  }, [item, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be positive'
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Cost must be positive'
    }

    if (type !== 'prebuilt' && formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be positive'
    }

    if (type === 'base') {
      if (!formData.colorHex) {
        newErrors.colorHex = 'Color hex is required for bases'
      } else if (!/^#[0-9A-F]{6}$/i.test(formData.colorHex)) {
        newErrors.colorHex = 'Color hex must be in format #RRGGBB (e.g., #FF0000)'
      }
    }

    if (type === 'switch' && !formData.description?.trim()) {
      newErrors.description = 'Description is required for switches'
    }

    if (type === 'prebuilt') {
      if (!formData.description?.trim()) {
        newErrors.description = 'Description is required for prebuilt fidgets'
      }
      if (!formData.fidgiColorId) newErrors.fidgiColorId = 'Fidgi color is required'
      if (!formData.keycapId) newErrors.keycapId = 'Keycap is required'
      if (!formData.switchId) newErrors.switchId = 'Switch is required'
    }

    if (type === 'other-fidget') {
      if (!formData.description?.trim()) {
        newErrors.description = 'Description is required for other fidgets'
      }
      if (!formData.category?.trim()) {
        newErrors.category = 'Category is required for other fidgets'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Include images in the form data
      const submitData = {
        ...formData,
        images: images.map(img => img.url),
        imageUrl: images.length > 0 ? images[0].url : formData.imageUrl // Keep primary image as imageUrl for backward compatibility
      }
      await onSave(submitData)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Auto-calculate cost for prebuilt items when components change
    if (type === 'prebuilt' && (field === 'fidgiColorId' || field === 'keycapId' || field === 'switchId')) {
      calculatePrebuiltCost(value, field)
    }
  }

  const calculatePrebuiltCost = (componentId: string, componentType: string) => {
    if (!componentId) return

    // Find the component and get its cost
    let componentCost = 0
    if (componentType === 'fidgiColorId') {
      const component = colors.find(c => c.id.toString() === componentId.toString())
      componentCost = component?.cost || 0
    } else if (componentType === 'keycapId') {
      const component = keycaps.find(k => k.id.toString() === componentId.toString())
      componentCost = component?.cost || 0
    } else if (componentType === 'switchId') {
      const component = switches.find(s => s.id.toString() === componentId.toString())
      componentCost = component?.cost || 0
    }

    // Calculate total cost from all selected components
    const fidgiCost = componentType === 'fidgiColorId' ? componentCost : 
      (formData.fidgiColorId ? (colors.find(c => c.id.toString() === formData.fidgiColorId.toString())?.cost || 0) : 0)
    const keycapCost = componentType === 'keycapId' ? componentCost : 
      (formData.keycapId ? (keycaps.find(k => k.id.toString() === formData.keycapId.toString())?.cost || 0) : 0)
    const switchCost = componentType === 'switchId' ? componentCost : 
      (formData.switchId ? (switches.find(s => s.id.toString() === formData.switchId.toString())?.cost || 0) : 0)

    const totalCost = fidgiCost + keycapCost + switchCost
    setFormData(prev => ({ ...prev, cost: totalCost }))
  }

  // Image management functions
  const addImage = () => {
    if (!newImageUrl.trim()) return
    
    const newImage: ImageItem = {
      id: `img-${Date.now()}`,
      url: newImageUrl.trim(),
      altText: `${formData.name || 'Item'} image ${images.length + 1}`,
      isPrimary: images.length === 0, // First image is primary
      sortOrder: images.length
    }
    
    setImages(prev => [...prev, newImage])
    setNewImageUrl('')
  }

  const removeImage = async (imageId: string) => {
    setDeletingImageId(imageId);
    const imageToRemove = images.find(img => img.id === imageId);
    
    // If the image is a Cloudinary URL, delete it from CDN
    if (imageToRemove?.url && imageToRemove.url.includes('cloudinary.com')) {
      try {
        console.log('Deleting image from Cloudinary:', imageToRemove.url);
        const response = await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: imageToRemove.url }),
        });

        const result = await response.json();
        if (result.success) {
          console.log('Successfully deleted from Cloudinary:', result.data);
        } else {
          console.warn('Failed to delete from Cloudinary:', result.error);
        }
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    // Remove from local state
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      return updated
    });
    
    // Automatically update the database with remaining images
    if (item?.id) {
      const remainingUrls = images
        .filter(img => img.id !== imageId)
        .map(img => img.url);
      updateItemInDatabase(remainingUrls);
    }
    
    setDeletingImageId(null);
  }


  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const currentIndex = prev.findIndex(img => img.id === imageId)
      if (currentIndex === -1) return prev
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      
      const updated = [...prev]
      const [movedImage] = updated.splice(currentIndex, 1)
      updated.splice(newIndex, 0, movedImage)
      
      // Update sortOrder
      return updated.map((img, index) => ({ ...img, sortOrder: index }))
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
      }
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    setImages(prev => {
      const updated = [...prev]
      const draggedItem = updated[draggedIndex]
      
      // Remove dragged item
      updated.splice(draggedIndex, 1)
      
      // Insert at new position
      const newIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
      updated.splice(newIndex, 0, draggedItem)
      
      // Update sortOrder
      const reordered = updated.map((img, index) => ({ ...img, sortOrder: index }))
      
      // Automatically update the database with the new order
      if (item?.id) {
        const imageUrls = reordered.map(img => img.url)
        updateItemInDatabase(imageUrls)
      }
      
      return reordered
    })
    
    // Show success animation
    setReorderSuccess(true)
    setTimeout(() => setReorderSuccess(false), 1000)
    
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const updateItemInDatabase = async (imageUrls: string[]) => {
    if (!item?.id) return;
    
    try {
      console.log('Updating item in database with images:', imageUrls);
      
      const response = await fetch('/api/admin/inventory/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          id: item.id,
          data: {
            ...formData,
            images: imageUrls
          }
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Successfully updated item in database');
      } else {
        console.error('Failed to update item in database:', result.error);
      }
    } catch (error) {
      console.error('Error updating item in database:', error);
    }
  };

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {item ? `Edit ${type}` : `Add New ${type}`}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                </div>
              )}
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={errors.price ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <Label htmlFor="cost">
                    Cost *
                    {type === 'prebuilt' && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Auto-calculated from components)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                    className={errors.cost ? 'border-red-500' : ''}
                    disabled={isLoading || type === 'prebuilt'}
                    placeholder={type === 'prebuilt' ? 'Calculated automatically' : 'Enter cost'}
                  />
                  {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
                  {type === 'prebuilt' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Cost is automatically calculated from the selected base, keycap, and switch components.
                    </p>
                  )}
                </div>

                {type !== 'prebuilt' && (
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      className={errors.quantity ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                )}

                {type === 'base' && (
                  <div>
                    <Label htmlFor="colorHex">Color *</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="colorHex"
                          value={formData.colorHex}
                          onChange={(e) => handleInputChange('colorHex', e.target.value)}
                          placeholder="#000000"
                          className={errors.colorHex ? 'border-red-500' : ''}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.colorHex || '#000000'}
                          onChange={(e) => handleInputChange('colorHex', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
                          disabled={isLoading}
                        />
                        {formData.colorHex && (
                          <div 
                            className="w-8 h-8 border border-gray-300 rounded"
                            style={{ backgroundColor: formData.colorHex }}
                            title={formData.colorHex}
                          />
                        )}
                      </div>
                    </div>
                    {errors.colorHex && <p className="text-red-500 text-sm mt-1">{errors.colorHex}</p>}
                    
                    {/* Color Presets */}
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Quick colors:</p>
                      <div className="flex gap-2 flex-wrap">
                        {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000', '#008000', '#000080'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleInputChange('colorHex', color)}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer hover:scale-110 transition-transform disabled:opacity-50"
                            style={{ backgroundColor: color }}
                            disabled={isLoading}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {type === 'keycap' && (
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="e.g., superhero, gaming"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {type === 'switch' && (
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="e.g., Soft and quiet feel"
                      rows={2}
                      className={errors.description ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                )}

                {type === 'other-fidget' && (
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="e.g., Stress-relieving fidget spinner with smooth rotation"
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                )}

                {type === 'other-fidget' && (
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="e.g., Spinner, Cube, Ring, Ball"
                      className={errors.category ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>
                )}

                {type === 'other-fidget' && (
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., stress-relief, portable, quiet"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {type === 'other-fidget' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded"
                      disabled={isLoading}
                    />
                    <Label htmlFor="isFeatured">Featured Item</Label>
                  </div>
                )}
              </div>

              {/* Description - only for prebuilt (switches have their own description field) */}
              {type === 'prebuilt' && (
                <div>
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              )}

              {/* Cloudinary Image Upload */}
              <div>
                <Label>Images</Label>
                <div className="space-y-4">
                  {/* Cloudinary Upload Component */}
                  <CloudinaryUpload
                    itemType={type === 'base' ? 'fidgiColor' : 
                             type === 'keycap' ? 'keycapDesign' : 
                             type === 'switch' ? 'switchType' : 
                             type === 'prebuilt' ? 'prebuiltFidgi' :
                             'otherFidget'}
                    onUpload={(urls) => {
                      console.log('=== ItemModal onUpload called ===');
                      console.log('URLs received:', urls);
                      console.log('Number of URLs:', urls.length);
                      console.log('Current images count:', images.length);
                      
                      // Convert Cloudinary URLs to ImageItem format
                      setImages(prev => {
                        const currentLength = prev.length;
                        console.log('Previous images count:', currentLength);
                        
                        const newImages: ImageItem[] = urls.map((url, index) => ({
                          id: `cloudinary-${Date.now()}-${index}`,
                          url,
                          altText: `${formData.name || 'Item'} image ${currentLength + index + 1}`,
                          isPrimary: false, // Remove primary logic
                          sortOrder: currentLength + index
                        }));
                        
                        console.log('New images to add:', newImages);
                        console.log('Total images after adding:', currentLength + newImages.length);
                        
                        const result = [...prev, ...newImages];
                        console.log('Final images array:', result);
                        return result;
                      });
                    }}
                    onDelete={(urls) => {
                      console.log('=== ItemModal onDelete called ===');
                      console.log('Remaining URLs after deletion:', urls);
                      
                      // Update images array to match remaining URLs
                      setImages(prev => {
                        const updated = prev.filter(img => urls.includes(img.url));
                        console.log('Updated images after deletion:', updated);
                        return updated;
                      });
                      
                      // Automatically update the database
                      if (item?.id) {
                        updateItemInDatabase(urls);
                      }
                    }}
                    multiple={true}
                    maxFiles={10}
                  />

                  {/* Existing Images Management */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-600">
                            {images.length} image{images.length !== 1 ? 's' : ''}
                          </p>
                          {reorderSuccess && (
                            <div className="flex items-center gap-1 text-xs text-green-600 animate-pulse">
                              <Check className="h-3 w-3" />
                              <span>Reordered!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Move className="h-3 w-3" />
                          <span>Drag to reorder</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {images.map((image, index) => (
                          <div key={image.id} className="relative">
                            {/* Drop indicator line */}
                            {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-green-400 rounded-full z-10"></div>
                            )}
                            
                            <div
                              className={`group relative border-2 rounded-lg p-3 transition-all duration-200 ${
                                draggedIndex === index
                                  ? 'opacity-50 scale-95 shadow-lg border-blue-400 bg-blue-50'
                                  : dragOverIndex === index && draggedIndex !== null
                                  ? 'border-green-400 bg-green-50 scale-105 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, index)}
                              onDragEnd={handleDragEnd}
                            >
                            <div className="flex items-start gap-3">
                              {/* Enhanced drag handle */}
                              <div className={`flex items-center justify-center w-8 h-16 cursor-move transition-all duration-200 ${
                                draggedIndex === index 
                                  ? 'text-blue-500 scale-110' 
                                  : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'
                              }`}>
                                <div className="flex flex-col gap-1">
                                  <div className={`w-1 h-1 bg-current rounded-full transition-all duration-200 ${
                                    draggedIndex === index ? 'animate-pulse' : ''
                                  }`}></div>
                                  <div className={`w-1 h-1 bg-current rounded-full transition-all duration-200 ${
                                    draggedIndex === index ? 'animate-pulse' : ''
                                  }`}></div>
                                  <div className={`w-1 h-1 bg-current rounded-full transition-all duration-200 ${
                                    draggedIndex === index ? 'animate-pulse' : ''
                                  }`}></div>
                                  <div className={`w-1 h-1 bg-current rounded-full transition-all duration-200 ${
                                    draggedIndex === index ? 'animate-pulse' : ''
                                  }`}></div>
                                  <div className={`w-1 h-1 bg-current rounded-full transition-all duration-200 ${
                                    draggedIndex === index ? 'animate-pulse' : ''
                                  }`}></div>
                                  <div className={`w-1 h-1 bg-current rounded-full transition-all duration-200 ${
                                    draggedIndex === index ? 'animate-pulse' : ''
                                  }`}></div>
                                </div>
                              </div>
                              
                              {/* Image preview */}
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={image.url}
                                  alt={image.altText}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) {
                                      fallback.style.display = 'flex'
                                    }
                                  }}
                                />
                                <div className="w-full h-full items-center justify-center text-gray-400" style={{ display: 'none' }}>
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                              </div>

                              {/* Image info and controls */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium truncate">{image.altText}</p>
                                  {draggedIndex === index && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      Dragging
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate mb-2">{image.url}</p>
                                
                                {/* Drop zone indicator */}
                                {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                                  <div className="absolute inset-0 border-2 border-dashed border-green-400 bg-green-50 rounded-lg flex items-center justify-center">
                                    <div className="text-green-600 text-sm font-medium">
                                      Drop here
                                    </div>
                                  </div>
                                )}
                                
                                {/* Controls */}
                                <div className="flex items-center gap-1 mt-2">
                                  
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveImage(image.id, 'up')}
                                    disabled={index === 0 || isLoading}
                                    className="text-xs px-2 py-1 h-6"
                                  >
                                    <Move className="h-3 w-3 rotate-[-90deg]" />
                                  </Button>
                                  
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveImage(image.id, 'down')}
                                    disabled={index === images.length - 1 || isLoading}
                                    className="text-xs px-2 py-1 h-6"
                                  >
                                    <Move className="h-3 w-3 rotate-90" />
                                  </Button>
                                  
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeImage(image.id)}
                                    disabled={isLoading || deletingImageId === image.id}
                                    className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700"
                                  >
                                    {deletingImageId === image.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback single image URL for backward compatibility */}
                  {images.length === 0 && (
                    <div>
                      <Label htmlFor="imageUrl">Primary Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                        placeholder="/path/to/image.jpg"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used as the primary image if no multiple images are added.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prebuilt specific fields */}
              {type === 'prebuilt' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fidgiColorId">Fidgi Color <span className="text-red-500">*</span></Label>
                      <select
                        id="fidgiColorId"
                        value={formData.fidgiColorId}
                        onChange={(e) => handleInputChange('fidgiColorId', e.target.value)}
                        className={`w-full p-2 border rounded-md ${errors.fidgiColorId ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isLoading}
                      >
                        <option value="">Select Color</option>
                        {colors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                      {errors.fidgiColorId && <p className="text-red-500 text-sm mt-1">{errors.fidgiColorId}</p>}
                    </div>

                    <div>
                      <Label htmlFor="keycapId">Keycap <span className="text-red-500">*</span></Label>
                      <select
                        id="keycapId"
                        value={formData.keycapId}
                        onChange={(e) => handleInputChange('keycapId', e.target.value)}
                        className={`w-full p-2 border rounded-md ${errors.keycapId ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isLoading}
                      >
                        <option value="">Select Keycap</option>
                        {keycaps.map((keycap) => (
                          <option key={keycap.id} value={keycap.id}>
                            {keycap.name}
                          </option>
                        ))}
                      </select>
                      {errors.keycapId && <p className="text-red-500 text-sm mt-1">{errors.keycapId}</p>}
                    </div>

                    <div>
                      <Label htmlFor="switchId">Switch <span className="text-red-500">*</span></Label>
                      <select
                        id="switchId"
                        value={formData.switchId}
                        onChange={(e) => handleInputChange('switchId', e.target.value)}
                        className={`w-full p-2 border rounded-md ${errors.switchId ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isLoading}
                      >
                        <option value="">Select Switch</option>
                        {switches.map((switchItem) => (
                          <option key={switchItem.id} value={switchItem.id}>
                            {switchItem.name}
                          </option>
                        ))}
                      </select>
                      {errors.switchId && <p className="text-red-500 text-sm mt-1">{errors.switchId}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., avengers, gaming, limited"
                      disabled={isLoading}
                    />
                  </div>

                  {/* <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded"
                      disabled={isLoading}
                    />
                    <Label htmlFor="isFeatured">Featured Item</Label>
                  </div> */}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="min-w-[120px] flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>{item ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>{item ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
