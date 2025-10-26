"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ItemModal from '@/components/admin/ItemModal'
import { 
  Package, 
  Search, 
  Filter,
  Plus,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogOut,
  Trash2,
  Palette,
  Keyboard,
  Zap,
  Layers
} from 'lucide-react'

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
  // Component associations for prebuilt items
  fidgiColor?: {
    id: string
    name: string
    quantity: number
    isActive: boolean
  }
  keycap?: {
    id: string
    name: string
    quantity: number
    isActive: boolean
  }
  switch?: {
    id: string
    name: string
    quantity: number
    isActive: boolean
  }
}

interface InventoryData {
  bases: {
    items: InventoryItem[]
    total: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  keycaps: {
    items: InventoryItem[]
    total: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  switches: {
    items: InventoryItem[]
    total: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  prebuilt: {
    items: InventoryItem[]
    total: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  otherFidgets: {
    items: InventoryItem[]
    total: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  summary: {
    totalItems: number
    totalLowStock: number
    totalOutOfStock: number
    totalValue: number
    lowStockThreshold: number
  }
}

export default function AdminInventoryPage() {
  const router = useRouter()
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('bases')
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editQuantity, setEditQuantity] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [modalItem, setModalItem] = useState<InventoryItem | null>(null)
  const [modalType, setModalType] = useState<'base' | 'keycap' | 'switch' | 'prebuilt' | 'other-fidget'>('base')
  const [availableBases, setAvailableBases] = useState<any[]>([])
  const [availableKeycaps, setAvailableKeycaps] = useState<any[]>([])
  const [availableSwitches, setAvailableSwitches] = useState<any[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  console.log('inventoryData',inventoryData)
  if (inventoryData?.prebuilt) {
    console.log('=== PREBUILT DATA DEBUG ===');
    console.log('Prebuilt data structure:', inventoryData.prebuilt);
    console.log('Prebuilt items count:', inventoryData.prebuilt.items?.length);
    if (inventoryData.prebuilt.items?.length > 0) {
      console.log('First prebuilt item structure:', inventoryData.prebuilt.items[0]);
    }
    console.log('=== END PREBUILT DEBUG ===');
  }
  const loadInventory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Check authentication
      const authResponse = await fetch('/api/admin/auth/me')
      if (!authResponse.ok) {
        router.push('/admin/login')
        return
      }

      // Load inventory data with caching (only for initial load, not refresh)
      if (!isRefresh) {
        const now = Date.now()
        const cacheKey = 'inventory-data'
        const cachedData = sessionStorage.getItem(cacheKey)
        const cacheTime = sessionStorage.getItem(`${cacheKey}-time`)
        
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 30000) { // 30 second cache
          const data = JSON.parse(cachedData)
          setInventoryData(data.data)
          if (data.data) {
            setAvailableBases(data.data.bases?.items || [])
            setAvailableKeycaps(data.data.keycaps?.items || [])
            setAvailableSwitches(data.data.switches?.items || [])
          }
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/admin/inventory')
      if (!response.ok) {
        throw new Error('Failed to load inventory data')
      }
      const data = await response.json()
      setInventoryData(data.data)
      
      // Cache the data
      const now = Date.now()
      const cacheKey = 'inventory-data'
      sessionStorage.setItem(cacheKey, JSON.stringify(data))
      sessionStorage.setItem(`${cacheKey}-time`, now.toString())
      
      // Set available options for prebuilt items
      if (data.data) {
        setAvailableBases(data.data.bases?.items || [])
        setAvailableKeycaps(data.data.keycaps?.items || [])
        setAvailableSwitches(data.data.switches?.items || [])
      }
    } catch (err) {
      console.error('Inventory load error:', err)
      setError('Failed to load inventory data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [router])

  const handleEditQuantity = (item: InventoryItem) => {
    setEditingItem(item)
    setEditQuantity(item.quantity)
  }

  const handleSaveQuantity = async () => {
    if (!editingItem) return

    setIsUpdating(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: [{
            type: editingItem.type,
            id: editingItem.id,
            quantity: editQuantity
          }]
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Clear cache and reload inventory data
          sessionStorage.removeItem('inventory-data')
          sessionStorage.removeItem('inventory-data-time')
          const inventoryResponse = await fetch('/api/admin/inventory')
          if (inventoryResponse.ok) {
            const data = await inventoryResponse.json()
            setInventoryData(data.data)
          }
          setEditingItem(null)
          // Show success message
          alert('Quantity updated successfully!')
        } else {
          throw new Error(result.error || 'Failed to update quantity')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update quantity')
      }
    } catch (err) {
      console.error('Update error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity'
      setError(errorMessage)
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleAddItem = (type: 'base' | 'keycap' | 'switch' | 'prebuilt' | 'other-fidget') => {
    setAddingItem(true)
    // Simulate a brief delay for better UX
    setTimeout(() => {
      setModalType(type)
      setModalItem(null)
      setShowItemModal(true)
      setAddingItem(false)
    }, 200)
  }

  const handleEditItem = (item: InventoryItem) => {
    setModalType(item.type)
    setModalItem(item)
    setShowItemModal(true)
  }

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

    try {
      const response = await fetch(`/api/admin/inventory/items?type=${item.type}&id=${item.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Clear cache and reload inventory data
        sessionStorage.removeItem('inventory-data')
        sessionStorage.removeItem('inventory-data-time')
        const inventoryResponse = await fetch('/api/admin/inventory')
        if (inventoryResponse.ok) {
          const data = await inventoryResponse.json()
          setInventoryData(data.data)
        }
        alert('Item deleted successfully!')
      } else {
        throw new Error('Failed to delete item')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete item')
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.trim()) {
      setSearching(true)
      // Simulate search delay for better UX
      setTimeout(() => setSearching(false), 300)
    }
  }

  const handleSaveItem = async (data: any) => {
    try {
      const url = modalItem ? '/api/admin/inventory/items' : '/api/admin/inventory/items'
      const method = modalItem ? 'PUT' : 'POST'
      
      const body = modalItem 
        ? { type: modalType, id: modalItem.id, data }
        : { type: modalType, data }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        // Clear cache and reload inventory data
        sessionStorage.removeItem('inventory-data')
        sessionStorage.removeItem('inventory-data-time')
        const inventoryResponse = await fetch('/api/admin/inventory')
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json()
          setInventoryData(inventoryData.data)
          
          // Update available options
          if (inventoryData.data) {
            setAvailableBases(inventoryData.data.bases?.items || [])
            setAvailableKeycaps(inventoryData.data.keycaps?.items || [])
            setAvailableSwitches(inventoryData.data.switches?.items || [])
          }
        }
        alert(modalItem ? 'Item updated successfully!' : 'Item created successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save item')
      }
    } catch (err) {
      console.error('Save error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save item'
      alert(`Error: ${errorMessage}`)
      throw err
    }
  }

  const getFilteredItems = () => {
    if (!inventoryData) return []
    
    let items: InventoryItem[] = []
    
    if (selectedCategory === 'all' || selectedCategory === 'bases') {
      items = [...items, ...inventoryData.bases.items.map(item => ({ ...item, type: 'base' as const }))]
    }
    if (selectedCategory === 'all' || selectedCategory === 'keycaps') {
      items = [...items, ...inventoryData.keycaps.items.map(item => ({ ...item, type: 'keycap' as const }))]
    }
    if (selectedCategory === 'all' || selectedCategory === 'switches') {
      items = [...items, ...inventoryData.switches.items.map(item => ({ ...item, type: 'switch' as const }))]
    }
    if (selectedCategory === 'all' || selectedCategory === 'prebuilt') {
      items = [...items, ...inventoryData.prebuilt.items.map(item => ({ ...item, type: 'prebuilt' as const }))]
    }
    if (selectedCategory === 'all' || selectedCategory === 'other-fidgets') {
      items = [...items, ...inventoryData.otherFidgets.items.map(item => ({ ...item, type: 'other-fidget' as const }))]
    }

    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return items
  }

  const getStockStatus = (quantity: number | undefined, itemType: string, item?: any) => {
    // For prebuilt items, check component stock levels
    if (itemType === 'prebuilt' && item) {
      console.log('Prebuilt item for stock calculation:', item);
      
      // Handle different possible data structures
      let baseStock = 0;
      let keycapStock = 0;
      let switchStock = 0;
      
      // Try different ways to access the component data
      if (item.fidgiColor) {
        baseStock = Number(item.fidgiColor.quantity) || 0;
      }
      if (item.keycap) {
        keycapStock = Number(item.keycap.quantity) || 0;
      }
      if (item.switch) {
        switchStock = Number(item.switch.quantity) || 0;
      }
      
      console.log('Prebuilt component stocks:', { baseStock, keycapStock, switchStock });
      
      // Get the minimum stock across all components
      const minStock = Math.min(baseStock, keycapStock, switchStock);
      
      if (minStock === 0) {
        return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' }
      }
      
      if (minStock <= 10) { // 10 and less is low stock
        return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
      }
      
      return { status: 'Available', color: 'bg-green-100 text-green-800' }
    }
    
    // For regular inventory items (bases, keycaps, switches)
    if (quantity === undefined || quantity === null) {
      return { status: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (quantity <= 10) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    )
  }

  if (error || !inventoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error || 'Failed to load inventory'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const filteredItems = getFilteredItems()

  // Calculate stock counts from inventory data
  const calculateStockCounts = () => {
    if (!inventoryData) return { totalLowStock: 0, totalOutOfStock: 0 }

    let totalLowStock = 0
    let totalOutOfStock = 0

    // Calculate for bases
    if (inventoryData.bases?.items) {
      inventoryData.bases.items.forEach(item => {
        if (item.quantity === 0) {
          totalOutOfStock++
        } else if (item.quantity <= 10) {
          totalLowStock++
        }
      })
    }

    // Calculate for keycaps
    if (inventoryData.keycaps?.items) {
      inventoryData.keycaps.items.forEach(item => {
        if (item.quantity === 0) {
          totalOutOfStock++
        } else if (item.quantity <= 10) {
          totalLowStock++
        }
      })
    }

    // Calculate for switches
    if (inventoryData.switches?.items) {
      inventoryData.switches.items.forEach(item => {
        if (item.quantity === 0) {
          totalOutOfStock++
        } else if (item.quantity <= 10) {
          totalLowStock++
        }
      })
    }

    // Calculate for prebuilt items
    if (inventoryData.prebuilt?.items) {
      inventoryData.prebuilt.items.forEach(item => {
        const stockStatus = getStockStatus(item.quantity, item.type, item)
        if (stockStatus.status === 'Out of Stock') {
          totalOutOfStock++
        } else if (stockStatus.status === 'Low Stock') {
          totalLowStock++
        }
      })
    }

    // Calculate for other fidgets
    if (inventoryData.otherFidgets?.items) {
      inventoryData.otherFidgets.items.forEach(item => {
        if (item.quantity === 0) {
          totalOutOfStock++
        } else if (item.quantity <= 10) {
          totalLowStock++
        }
      })
    }

    return { totalLowStock, totalOutOfStock }
  }

  const stockCounts = calculateStockCounts()

  // Calculate total revenue from all items
  const calculateTotalRevenue = () => {
    if (!inventoryData) return 0

    let totalRevenue = 0

    // Calculate for bases
    if (inventoryData.bases?.items) {
      inventoryData.bases.items.forEach(item => {
        totalRevenue += (item.price || 0) * (item.quantity || 0)
      })
    }

    // Calculate for keycaps
    if (inventoryData.keycaps?.items) {
      inventoryData.keycaps.items.forEach(item => {
        totalRevenue += (item.price || 0) * (item.quantity || 0)
      })
    }

    // Calculate for switches
    if (inventoryData.switches?.items) {
      inventoryData.switches.items.forEach(item => {
        totalRevenue += (item.price || 0) * (item.quantity || 0)
      })
    }

    // Calculate for prebuilt items
    if (inventoryData.prebuilt?.items) {
      inventoryData.prebuilt.items.forEach(item => {
        totalRevenue += (item.price || 0) // Prebuilt items are unique, so quantity is 1
      })
    }

    // Calculate for other fidgets
    if (inventoryData.otherFidgets?.items) {
      inventoryData.otherFidgets.items.forEach(item => {
        totalRevenue += (item.price || 0) * (item.quantity || 0)
      })
    }

    return totalRevenue
  }

  const totalRevenue = calculateTotalRevenue()
  
  // Ensure totalRevenue is always a valid number
  const safeTotalRevenue = isNaN(totalRevenue) || totalRevenue === null || totalRevenue === undefined ? 0 : totalRevenue

  // Calculate total profit from all items
  const calculateTotalProfit = () => {
    if (!inventoryData) return 0

    let totalProfit = 0

    // Calculate for bases
    if (inventoryData.bases?.items) {
      inventoryData.bases.items.forEach(item => {
        const profit = (item.price || 0) - (item.cost || 0)
        totalProfit += profit * (item.quantity || 0)
      })
    }

    // Calculate for keycaps
    if (inventoryData.keycaps?.items) {
      inventoryData.keycaps.items.forEach(item => {
        const profit = (item.price || 0) - (item.cost || 0)
        totalProfit += profit * (item.quantity || 0)
      })
    }

    // Calculate for switches
    if (inventoryData.switches?.items) {
      inventoryData.switches.items.forEach(item => {
        const profit = (item.price || 0) - (item.cost || 0)
        totalProfit += profit * (item.quantity || 0)
      })
    }

    // Calculate for prebuilt items
    if (inventoryData.prebuilt?.items) {
      inventoryData.prebuilt.items.forEach(item => {
        const profit = (item.price || 0) - (item.cost || 0)
        totalProfit += profit // Prebuilt items are unique, so quantity is 1
      })
    }

    // Calculate for other fidgets
    if (inventoryData.otherFidgets?.items) {
      inventoryData.otherFidgets.items.forEach(item => {
        const profit = (item.price || 0) - (item.cost || 0)
        totalProfit += profit * (item.quantity || 0)
      })
    }

    return totalProfit
  }

  const totalProfit = calculateTotalProfit()
  
  // Ensure totalProfit is always a valid number
  const safeTotalProfit = isNaN(totalProfit) || totalProfit === null || totalProfit === undefined ? 0 : totalProfit

  // Debug: Log the profit calculation
  console.log('=== PROFIT CALCULATION DEBUG ===')
  console.log('Total Revenue:', safeTotalRevenue)
  console.log('Total Profit:', safeTotalProfit)
  if (inventoryData) {
    console.log('Bases items with costs:', inventoryData.bases?.items?.map(item => ({
      name: item.name,
      price: item.price,
      cost: item.cost,
      quantity: item.quantity,
      profit: (item.price || 0) - (item.cost || 0)
    })))
    console.log('Keycaps items with costs:', inventoryData.keycaps?.items?.map(item => ({
      name: item.name,
      price: item.price,
      cost: item.cost,
      quantity: item.quantity,
      profit: (item.price || 0) - (item.cost || 0)
    })))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
                ← Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 ml-4">Inventory Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadInventory(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  // Clear all cache
                  sessionStorage.removeItem('inventory-data')
                  sessionStorage.removeItem('inventory-data-time')
                  // Force reload
                  await loadInventory(true)
                }}
                disabled={refreshing}
                className="bg-red-50 text-red-700 hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Force Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {inventoryData.summary.totalItems}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stockCounts.totalLowStock}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stockCounts.totalOutOfStock}
                </p>
              </div>
            </div>
          </Card>

          {/* <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {safeTotalRevenue.toFixed(2)} TND
                </p>
              </div>
            </div>
          </Card> */}

          {/* <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className={`text-2xl font-semibold ${safeTotalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {safeTotalProfit.toFixed(2)} TND
                </p>
              </div>
            </div>
          </Card> */}
        </div>

        {/* Tab Navigation */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <Label htmlFor="search">Search Items</Label>
              <div className="relative mt-1">
                {searching ? (
                  <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                {[
                  { 
                    id: 'bases', 
                    name: 'Bases', 
                    icon: Palette,
                    stats: inventoryData?.bases ? {
                      total: inventoryData.bases.total,
                      lowStock: inventoryData.bases.items?.filter(item => item.quantity > 0 && item.quantity <= 10).length || 0,
                      outOfStock: inventoryData.bases.items?.filter(item => item.quantity === 0).length || 0,
                      totalValue: inventoryData.bases.totalValue
                    } : null
                  },
                  { 
                    id: 'keycaps', 
                    name: 'Keycaps', 
                    icon: Keyboard,
                    stats: inventoryData?.keycaps ? {
                      total: inventoryData.keycaps.total,
                      lowStock: inventoryData.keycaps.items?.filter(item => item.quantity > 0 && item.quantity <= 10).length || 0,
                      outOfStock: inventoryData.keycaps.items?.filter(item => item.quantity === 0).length || 0,
                      totalValue: inventoryData.keycaps.totalValue
                    } : null
                  },
                  { 
                    id: 'switches', 
                    name: 'Switches', 
                    icon: Zap,
                    stats: inventoryData?.switches ? {
                      total: inventoryData.switches.total,
                      lowStock: inventoryData.switches.items?.filter(item => item.quantity > 0 && item.quantity <= 10).length || 0,
                      outOfStock: inventoryData.switches.items?.filter(item => item.quantity === 0).length || 0,
                      totalValue: inventoryData.switches.totalValue
                    } : null
                  },
                  { 
                    id: 'prebuilt', 
                    name: 'Prebuilt', 
                    icon: Layers,
                    stats: inventoryData?.prebuilt ? {
                      total: inventoryData.prebuilt.total,
                      lowStock: inventoryData.prebuilt.items?.filter(item => {
                        console.log('=== PREBUILT ITEM FILTER DEBUG ===');
                        console.log('Item:', item);
                        console.log('Item type:', typeof item);
                        console.log('Item keys:', Object.keys(item));
                        console.log('Has fidgiColor:', !!item.fidgiColor);
                        console.log('Has keycap:', !!item.keycap);
                        console.log('Has switch:', !!item.switch);
                        if (item.fidgiColor) console.log('FidgiColor data:', item.fidgiColor);
                        if (item.keycap) console.log('Keycap data:', item.keycap);
                        if (item.switch) console.log('Switch data:', item.switch);
                        
                        const stockStatus = getStockStatus(item.quantity, item.type, item);
                        console.log('Prebuilt stock status result:', stockStatus);
                        console.log('=== END DEBUG ===');
                        return stockStatus.status === 'Low Stock';
                      }).length || 0,
                      outOfStock: inventoryData.prebuilt.items?.filter(item => {
                        const stockStatus = getStockStatus(item.quantity, item.type, item);
                        return stockStatus.status === 'Out of Stock';
                      }).length || 0,
                      totalValue: inventoryData.prebuilt.totalValue
                    } : null
                  },
                  { 
                    id: 'other-fidgets', 
                    name: 'Other Fidgets', 
                    icon: Package,
                    stats: inventoryData?.otherFidgets ? {
                      total: inventoryData.otherFidgets.total,
                      lowStock: inventoryData.otherFidgets.items?.filter(item => item.quantity > 0 && item.quantity <= 10).length || 0,
                      outOfStock: inventoryData.otherFidgets.items?.filter(item => item.quantity === 0).length || 0,
                      totalValue: inventoryData.otherFidgets.totalValue
                    } : null
                  }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = selectedCategory === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      <span>{tab.name}</span>
                      {tab.stats && (
                        <div className="ml-2 flex space-x-1">
                          <Badge variant={tab.stats.outOfStock > 0 ? 'destructive' : 'secondary'} className="text-xs">
                            {tab.stats.outOfStock} out
                          </Badge>
                          <Badge variant={tab.stats.lowStock > 0 ? 'destructive' : 'secondary'} className="text-xs">
                            {tab.stats.lowStock} low
                          </Badge>
                        </div>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Statistics */}
            {inventoryData && (
  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    {(() => {
      const currentStats = inventoryData[selectedCategory as keyof InventoryData] as any
      if (!currentStats) return null
      
      // Calculate stock counts from actual items
      let outOfStockCount = 0;
      let lowStockCount = 0;
      
      if (currentStats.items) {
        currentStats.items.forEach((item: any) => {
          if (selectedCategory === 'prebuilt') {
            // For prebuilt items, use the getStockStatus function
            const stockStatus = getStockStatus(item.quantity, item.type, item);
            if (stockStatus.status === 'Out of Stock') {
              outOfStockCount++;
            } else if (stockStatus.status === 'Low Stock') {
              lowStockCount++;
            }
          } else {
            // For regular items (bases, keycaps, switches)
            if (item.quantity === 0) {
              outOfStockCount++;
            } else if (item.quantity <= 10) {
              lowStockCount++;
            }
          }
        });
      }
      
      return (
        <>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="ml-2 text-sm font-medium text-blue-900">Total Items</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{currentStats.total}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="ml-2 text-sm font-medium text-yellow-900">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{lowStockCount}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-600" />
              <span className="ml-2 text-sm font-medium text-red-900">Out of Stock</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{outOfStockCount}</p>
          </div>
        </>
      )
    })()}
  </div>
)}
          </div>
        </Card>

        {/* Inventory Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {selectedCategory === 'bases' ? 'Base Colors' : 
                 selectedCategory === 'keycaps' ? 'Keycap Designs' :
                 selectedCategory === 'switches' ? 'Switch Types' :
                 selectedCategory === 'prebuilt' ? 'Prebuilt Fidgis' :
                 selectedCategory === 'other-fidgets' ? 'Other Fidgets' : 'Items'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
            <Button
              onClick={() => {
                // Convert plural category to singular for API
                const itemType = selectedCategory === 'bases' ? 'base' :
                                selectedCategory === 'keycaps' ? 'keycap' :
                                selectedCategory === 'switches' ? 'switch' :
                                selectedCategory === 'prebuilt' ? 'prebuilt' :
                                selectedCategory === 'other-fidgets' ? 'other-fidget' : 'base';
                handleAddItem(itemType as 'base' | 'keycap' | 'switch' | 'prebuilt' | 'other-fidget');
              }}
              className="bg-primary hover:bg-primary/90"
              disabled={addingItem}
            >
              {addingItem ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add {selectedCategory === 'bases' ? 'Base' : 
                   selectedCategory === 'keycaps' ? 'Keycap' :
                   selectedCategory === 'switches' ? 'Switch' :
                   selectedCategory === 'prebuilt' ? 'Prebuilt' :
                   selectedCategory === 'other-fidgets' ? 'Other Fidget' : 'Item'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedCategory === 'bases' ? 'Base Color' : 
                     selectedCategory === 'keycaps' ? 'Keycap Design' :
                     selectedCategory === 'switches' ? 'Switch Type' :
                     selectedCategory === 'prebuilt' ? 'Prebuilt Fidgi' :
                     selectedCategory === 'other-fidgets' ? 'Other Fidget' : 'Item'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.type, item)
                  return (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.type === 'base' && item.colorHex && (
                            <div 
                              className="w-6 h-6 rounded border-2 border-gray-200 mr-3"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                            {item.category && (
                              <div className="text-xs text-gray-400 mt-1">
                                Category: {item.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.price} TND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.cost} TND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`${(item.price - item.cost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(item.price - item.cost).toFixed(2)} TND
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.type === 'prebuilt' ? (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        ) : editingItem?.id === item.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={handleSaveQuantity}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditQuantity(item)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditQuantity(item)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Qty
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Item
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteItem(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Item Modal */}
      <ItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSave={handleSaveItem}
        item={modalItem}
        type={modalType}
        colors={availableBases}
        keycaps={availableKeycaps}
        switches={availableSwitches}
      />
    </div>
  )
}
