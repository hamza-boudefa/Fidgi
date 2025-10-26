"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  X,
  Clock,
  Truck,
  Package,
  Loader2,
  LogOut,
  Calendar,
  Plus
} from 'lucide-react'

interface OrderItem {
  id: number
  type: string
  quantity: number
  unitPrice: number
  totalPrice: number
  unitCost: number
  totalCost: number
  profit: number
  fidgiColor?: {
    id: number
    name: string
    colorHex: string
    cost: number
  }
  keycap?: {
    id: number
    name: string
    cost: number
  }
  switch?: {
    id: number
    name: string
    cost: number
  }
  prebuiltFidgi?: {
    id: number
    name: string
    cost: number
    fidgiColor?: {
      id: number
      name: string
      cost: number
    }
    keycap?: {
      id: number
      name: string
      cost: number
    }
    switch?: {
      id: number
      name: string
      cost: number
    }
  }
  otherFidget?: {
    id: number
    name: string
    cost: number
  }
}

interface Order {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerPostalCode: string
  customerNotes?: string
  status: string
  totalAmount: number
  totalCost: number
  totalProfit: number
  shippingCost: number
  source: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

interface OrdersData {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
  }
  statusCounts: Array<{
    status: string
    count: number
  }>
  deliveredSummary?: {
    totalRevenue: number
    totalProfit: number
    deliveredCount: number
  }
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
console.log("ordersData",ordersData)
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        const authResponse = await fetch('/api/admin/auth/me')
        if (!authResponse.ok) {
          router.push('/admin/login')
          return
        }

        // Load orders data
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          ...(selectedStatus !== 'all' && { status: selectedStatus }),
          ...(searchTerm && { search: searchTerm }),
        })

        const response = await fetch(`/api/admin/orders?${params}`)
        if (!response.ok) {
          throw new Error('Failed to load orders data')
        }
        const data = await response.json()
        
        // Calculate cost and profit for each order
        const ordersWithCostProfit = data.data.orders.map((order: any) => {
          const { totalCost, totalProfit } = calculateOrderCostAndProfit(order);
          return {
            ...order,
            totalCost,
            totalProfit
          };
        });

        // Calculate delivered orders summary
        const deliveredSummary = calculateDeliveredOrdersSummary(ordersWithCostProfit);

        setOrdersData({
          ...data.data,
          orders: ordersWithCostProfit,
          deliveredSummary
        });
      } catch (err) {
        console.error('Orders load error:', err)
        setError('Failed to load orders data')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [router, selectedStatus, searchTerm, currentPage])

  const handleStatusChange = async (orderId: number, newStatus: string, currentStatus: string) => {
    try {
      // Prevent updating cancelled orders
      if (currentStatus === 'cancelled') {
        alert('Cannot update cancelled orders')
        return
      }

      // Prevent cancelling already cancelled orders
      if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
        alert('Cannot update cancelled orders')
        return
      }

      // For cancellation, we need to send order data to extract items for inventory restoration
      let requestBody: any = { status: newStatus };
      
      if (newStatus === 'cancelled') {
        // Find the order in the current orders data to get items
        const orderToCancel = ordersData?.orders.find(order => order.id === orderId);
        if (orderToCancel) {
          requestBody = {
            status: newStatus,
            orderData: {
              id: orderToCancel.id,
              items: orderToCancel.items || []
            }
          };
          console.log('Cancelling order with data:', requestBody);
        }
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        // Reload orders data and recalculate cost/profit
        const ordersResponse = await fetch(`/api/admin/orders?page=${currentPage}&limit=20`)
        if (ordersResponse.ok) {
          const data = await ordersResponse.json()
          
          // Recalculate cost and profit for each order (same logic as loadOrders)
          const ordersWithCalculations = data.data.orders.map((order: any) => {
            const { totalCost, totalProfit } = calculateOrderCostAndProfit(order);
            return {
              ...order,
              totalCost,
              totalProfit
            };
          });

          // Recalculate delivered summary
          const deliveredSummary = calculateDeliveredOrdersSummary(ordersWithCalculations);

          setOrdersData({
            ...data.data,
            orders: ordersWithCalculations,
            deliveredSummary
          });
        }
      }
    } catch (err) {
      console.error('Status update error:', err)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Package className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return `${Number(amount || 0).toFixed(2)} TND`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate cost and profit for a single order item
  const calculateItemCostAndProfit = (item: OrderItem) => {
    let unitCost = 0;
    let totalCost = 0;
    let profit = 0;

    if (item.type === 'custom') {
      // For custom items, sum the costs of components
      unitCost = (Number(item.fidgiColor?.cost) || 0) + 
                 (Number(item.keycap?.cost) || 0) + 
                 (Number(item.switch?.cost) || 0);
    } else if (item.type === 'prebuilt' && item.prebuiltFidgi) {
      // For prebuilt items, calculate cost from components
      // The prebuilt item should have its component costs available
      const prebuiltCost = Number(item.prebuiltFidgi.cost) || 0;
      
      // If prebuilt cost is 0, we need to calculate from components
      // This would require the component data to be available in the prebuilt item
      if (prebuiltCost > 0) {
        unitCost = prebuiltCost;
      } else {
        // Fallback: try to get component costs from the prebuilt item's associations
        // This assumes the API includes component cost data in the prebuilt item
        const baseCost = Number((item.prebuiltFidgi as any)?.fidgiColor?.cost) || 0;
        const keycapCost = Number((item.prebuiltFidgi as any)?.keycap?.cost) || 0;
        const switchCost = Number((item.prebuiltFidgi as any)?.switch?.cost) || 0;
        
        unitCost = baseCost + keycapCost + switchCost;
      }
    }

    totalCost = unitCost * item.quantity;
    profit = Number(item.totalPrice) - totalCost;

    return {
      unitCost,
      totalCost,
      profit
    };
  };

  // Calculate total cost and profit for an entire order
  const calculateOrderCostAndProfit = (order: any) => {
    let totalCost = 0;
    let totalProfit = 0;

    order.items.forEach((item: OrderItem) => {
      const itemCalculations = calculateItemCostAndProfit(item);
      totalCost += itemCalculations.totalCost;
      totalProfit += itemCalculations.profit;
    });

    return {
      totalCost,
      totalProfit
    };
  };

  // Calculate summary statistics for delivered orders only
  const calculateDeliveredOrdersSummary = (orders: Order[]) => {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    
    let totalRevenue = 0;
    let totalProfit = 0;
    
    deliveredOrders.forEach(order => {
      totalRevenue += Number(order.totalAmount) || 0;
      const { totalProfit: orderProfit } = calculateOrderCostAndProfit(order);
      totalProfit += orderProfit;
    });

    return {
      totalRevenue,
      totalProfit,
      deliveredCount: deliveredOrders.length
    };
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error || !ordersData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error || 'Failed to load orders'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
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
              <h1 className="text-xl font-semibold text-gray-900 ml-4">Order Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/admin/orders/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {ordersData.summary.totalOrders}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(ordersData.deliveredSummary?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {ordersData.deliveredSummary?.deliveredCount || 0} delivered orders
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className={`text-2xl font-semibold ${(ordersData.deliveredSummary?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(ordersData.deliveredSummary?.totalProfit || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  From delivered orders only
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by customer name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Page {ordersData.pagination.page} of {ordersData.pagination.totalPages}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersData.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items.length} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatCurrency(order.totalCost || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${(order.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(order.totalProfit || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="capitalize">
                        {order.source || 'website'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
                          disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          className={`text-xs border-gray-300 rounded-md focus:border-primary focus:ring-primary ${
                            order.status === 'cancelled' || order.status === 'delivered' ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {ordersData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((ordersData.pagination.page - 1) * ordersData.pagination.limit) + 1} to{' '}
                {Math.min(ordersData.pagination.page * ordersData.pagination.limit, ordersData.pagination.total)} of{' '}
                {ordersData.pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(ordersData.pagination.totalPages, prev + 1))}
                  disabled={currentPage === ordersData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Order #{selectedOrder.id}</h3>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerName || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerEmail || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerPhone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">City:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerCity || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <span className="ml-2 font-medium capitalize">{selectedOrder.source || 'website'}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2 font-medium">{selectedOrder.customerAddress || 'Not provided'}</span>
                  </div>
                  {selectedOrder.customerPostalCode && (
                    <div className="mt-2">
                      <span className="text-gray-500">Postal Code:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerPostalCode}</span>
                    </div>
                  )}
                  {selectedOrder.customerNotes && (
                    <div className="mt-2">
                      <span className="text-gray-500">Notes:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerNotes}</span>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => {
                      const itemCalculations = calculateItemCostAndProfit(item);
                      
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              {item.type === 'custom' 
                                ? `Custom Fidget: ${item.fidgiColor?.name || 'Unknown'} + ${item.keycap?.name || 'Unknown'} + ${(item.switch?.name || (item as any).switchType?.name) || 'Unknown'}`
                                : item.type === 'prebuilt'
                                ? `Prebuilt: ${item.prebuiltFidgi?.name || 'Unknown'}`
                                : `Other Fidget: ${item.otherFidget?.name || 'Unknown'}`
                              }
                            </div>
                            <div className="font-medium">
                              {formatCurrency(Number(item.totalPrice) || 0)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span>Quantity: {item.quantity} × {formatCurrency(Number(item.unitPrice) || 0)}</span>
                            </div>
                            <div>
                              <span>Unit Cost: {formatCurrency(itemCalculations.unitCost)}</span>
                            </div>
                            <div>
                              <span>Total Cost: {formatCurrency(itemCalculations.totalCost)}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${itemCalculations.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Item Profit: {formatCurrency(itemCalculations.profit)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Show component cost breakdown for custom items */}
                          {item.type === 'custom' && (
                            <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                              <div>Component Costs:</div>
                              <div className="grid grid-cols-3 gap-2 mt-1">
                                <div>Base: {formatCurrency(Number(item.fidgiColor?.cost) || 0)}</div>
                                <div>Keycap: {formatCurrency(Number(item.keycap?.cost) || 0)}</div>
                                <div>Switch: {formatCurrency(Number(item.switch?.cost) || 0)}</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Show component cost breakdown for prebuilt items */}
                          {item.type === 'prebuilt' && item.prebuiltFidgi && (
                            <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                              <div>Prebuilt Component Costs:</div>
                              <div className="grid grid-cols-3 gap-2 mt-1">
                                <div>Base: {formatCurrency(Number(item.prebuiltFidgi.fidgiColor?.cost) || 0)}</div>
                                <div>Keycap: {formatCurrency(Number(item.prebuiltFidgi.keycap?.cost) || 0)}</div>
                                <div>Switch: {formatCurrency(Number(item.prebuiltFidgi.switch?.cost) || 0)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalCost || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                      <span>Profit:</span>
                      <span className={`${(selectedOrder.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedOrder.totalProfit || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

