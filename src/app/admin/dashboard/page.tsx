"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogOut,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface AdminData {
  id: number
  email: string
  name: string
  role: string
  lastLoginAt: string
}

interface DashboardData {
  overview: {
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    pendingOrders: number
    completedOrders: number
    orderGrowthRate: number
    revenueGrowthRate: number
  }
  recentActivity: {
    recentOrders: Array<{
      id: number
      customerName: string
      totalAmount: number
      status: string
      createdAt: string
      itemCount: number
    }>
  }
  inventory: {
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    totalInventoryValue: number
  }
  analytics: {
    orderStatusDistribution: Array<{
      status: string
      count: number
    }>
    topSellingProducts: Array<{
      type: string
      totalQuantity: number
      totalRevenue: number
    }>
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Load admin info
      const adminResponse = await fetch('/api/admin/auth/me')
      if (!adminResponse.ok) {
        router.push('/admin/login')
        return
      }
      const adminData = await adminResponse.json()
      setAdmin(adminData.data)

      // Load dashboard data
      const dashboardResponse = await fetch('/api/admin/dashboard')
      if (!dashboardResponse.ok) {
        throw new Error('Failed to load dashboard data')
      }
      const dashboard = await dashboardResponse.json()
      console.log('Dashboard data received:', dashboard.data)
      console.log('Recent orders:', dashboard.data?.recentActivity?.recentOrders)
      if (dashboard.data?.recentActivity?.recentOrders?.length > 0) {
        console.log('First order details:', dashboard.data.recentActivity.recentOrders[0])
        console.log('Order createdAt type:', typeof dashboard.data.recentActivity.recentOrders[0].createdAt)
        console.log('Order totalAmount type:', typeof dashboard.data.recentActivity.recentOrders[0].totalAmount)
        console.log('Order itemCount:', dashboard.data.recentActivity.recentOrders[0].itemCount)
      }
      setDashboardData(dashboard.data)
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error || 'Failed to load dashboard'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0.00 TND';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-primary-foreground">F</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Fidgi Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <span className="text-sm text-gray-600">Welcome, {admin?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
  {/* Quick Actions */}
  <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/orders/create">
            <Button className="h-12 justify-start">
              <Plus className="h-5 w-5 mr-2" />
              Create Order
            </Button>
            </Link>
            <Link href="/admin/inventory">
            <Button variant="outline" className="h-12 justify-start">
              <Package className="h-5 w-5 mr-2" />
              Manage Inventory
            </Button>
            </Link>
            <Link href="/admin/orders">
            <Button variant="outline" className="h-12 justify-start">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Orders
            </Button>
            </Link>
            <Link href="/admin/analytics">
            <Button variant="outline" className="h-12 justify-start">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
            </Link>
          </div>
        </Card>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.overview.totalOrders}
                </p>
                <div className="flex items-center mt-1">
                  {dashboardData.overview.orderGrowthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    dashboardData.overview.orderGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(dashboardData.overview.orderGrowthRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(dashboardData.overview.totalRevenue)}
                </p>
                {/* <div className="flex items-center mt-1">
                  {dashboardData.overview.revenueGrowthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    dashboardData.overview.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(dashboardData.overview.revenueGrowthRate).toFixed(1)}%
                  </span>
                </div> */}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.overview.totalProducts}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.inventory.lowStockProducts} low stock
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.overview.pendingOrders}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.overview.completedOrders} completed
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link href="/admin/orders">
              <Button variant="outline" size="sm" className='cursor-pointer'>
                View All
              </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentActivity.recentOrders?.length > 0 ? (
                dashboardData.recentActivity.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)} • {order.itemCount} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent orders found</p>
                </div>
              )}
            </div>
          </Card>

          {/* Inventory Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">In Stock</span>
                </div>
                <span className="font-semibold">
                  {dashboardData.inventory.totalProducts - dashboardData.inventory.outOfStockProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Low Stock</span>
                </div>
                <span className="font-semibold text-yellow-600">
                  {dashboardData.inventory.lowStockProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm text-gray-600">Out of Stock</span>
                </div>
                <span className="font-semibold text-red-600">
                  {dashboardData.inventory.outOfStockProducts}
                </span>
              </div>
              {/* <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Value</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(dashboardData.inventory.totalInventoryValue)}
                  </span>
                </div>
              </div> */}
            </div>
          </Card>
        </div>

      
      </div>
    </div>
  )
}
