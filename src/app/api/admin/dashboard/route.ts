import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminMiddleware';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, OtherFidget } from '@/models';
import { OrderStatus } from '@/models/Order';
import { Op } from 'sequelize';

// GET /api/admin/dashboard - Get dashboard overview data
async function handler(req: NextRequest) {
  try {
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get orders data with optimized queries
    const [
      totalOrders,
      recentOrders,
      ordersLast30Days,
      ordersLast7Days,
      pendingOrders,
      completedOrders,
      totalRevenue,
      revenueLast30Days,
      revenueLast7Days,
    ] = await Promise.all([
      Order.count(),
      Order.findAll({
        attributes: ['id', 'customerName', 'totalAmount', 'status', 'createdAt'],
        include: [
          {
            model: OrderItem,
            as: 'items',
            attributes: ['id', 'quantity'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      Order.count({
        where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
      }),
      Order.count({
        where: { createdAt: { [Op.gte]: sevenDaysAgo } }
      }),
      Order.count({ where: { status: OrderStatus.PENDING } }),
      Order.count({ where: { status: OrderStatus.DELIVERED } }),
      Order.sum('totalAmount'),
      Order.sum('totalAmount', {
        where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
      }),
      Order.sum('totalAmount', {
        where: { createdAt: { [Op.gte]: sevenDaysAgo } }
      }),
    ]);

    // Get inventory data with optimized queries
    const [
      fidgiColorCount,
      keycapDesignCount,
      switchTypeCount,
      prebuiltFidgiCount,
      otherFidgetCount,
      fidgiColorLowStock,
      keycapDesignLowStock,
      switchTypeLowStock,
      otherFidgetLowStock,
      fidgiColorOutOfStock,
      keycapDesignOutOfStock,
      switchTypeOutOfStock,
      otherFidgetOutOfStock,
      fidgiColorValue,
      keycapDesignValue,
      switchTypeValue,
      prebuiltFidgiValue,
      otherFidgetValue,
    ] = await Promise.all([
      FidgiColor.count({ where: { isActive: true } }),
      KeycapDesign.count({ where: { isActive: true } }),
      SwitchType.count({ where: { isActive: true } }),
      PrebuiltFidgi.count({ where: { isActive: true } }),
      OtherFidget.count({ where: { isActive: true } }),
      
      FidgiColor.count({ where: { quantity: { [Op.lte]: 10 }, isActive: true } }),
      KeycapDesign.count({ where: { quantity: { [Op.lte]: 10 }, isActive: true } }),
      SwitchType.count({ where: { quantity: { [Op.lte]: 10 }, isActive: true } }),
      OtherFidget.count({ where: { quantity: { [Op.lte]: 10 }, isActive: true } }),
      
      FidgiColor.count({ where: { quantity: 0, isActive: true } }),
      KeycapDesign.count({ where: { quantity: 0, isActive: true } }),
      SwitchType.count({ where: { quantity: 0, isActive: true } }),
      OtherFidget.count({ where: { quantity: 0, isActive: true } }),
      
      FidgiColor.sum('price', { where: { isActive: true } }),
      KeycapDesign.sum('price', { where: { isActive: true } }),
      SwitchType.sum('price', { where: { isActive: true } }),
      PrebuiltFidgi.sum('price', { where: { isActive: true } }),
      OtherFidget.sum('price', { where: { isActive: true } }),
    ]);

    const totalProducts = fidgiColorCount + keycapDesignCount + switchTypeCount + prebuiltFidgiCount + otherFidgetCount;
    const lowStockProducts = fidgiColorLowStock + keycapDesignLowStock + switchTypeLowStock + otherFidgetLowStock;
    const outOfStockProducts = fidgiColorOutOfStock + keycapDesignOutOfStock + switchTypeOutOfStock + otherFidgetOutOfStock;
    const totalInventoryValue = (fidgiColorValue || 0) + (keycapDesignValue || 0) + (switchTypeValue || 0) + (prebuiltFidgiValue || 0) + (otherFidgetValue || 0);

    // Get order status distribution
    const orderStatusDistribution = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize!.fn('COUNT', Order.sequelize!.col('id')), 'count']
      ],
      group: ['status'],
      raw: true,
    });

    // Get top selling products (from order items)
    const topSellingProducts = await OrderItem.findAll({
      attributes: [
        'type',
        'fidgiColorId',
        'keycapId',
        'switchId',
        'prebuiltFidgiId',
        [OrderItem.sequelize!.fn('SUM', OrderItem.sequelize!.col('quantity')), 'totalQuantity'],
        [OrderItem.sequelize!.fn('SUM', OrderItem.sequelize!.col('totalPrice')), 'totalRevenue']
      ],
      group: ['type', 'fidgiColorId', 'keycapId', 'switchId', 'prebuiltFidgiId'],
      order: [[OrderItem.sequelize!.fn('SUM', OrderItem.sequelize!.col('quantity')), 'DESC']],
      limit: 10,
      raw: true,
    });

    // Calculate growth rates
    const orderGrowthRate = ordersLast7Days > 0 
      ? ((ordersLast7Days - (ordersLast30Days - ordersLast7Days)) / (ordersLast30Days - ordersLast7Days)) * 100 
      : 0;
    
    const revenueGrowthRate = revenueLast7Days && revenueLast30Days && (revenueLast30Days - revenueLast7Days) > 0
      ? ((revenueLast7Days - (revenueLast30Days - revenueLast7Days)) / (revenueLast30Days - revenueLast7Days)) * 100
      : 0;

    const dashboardData = {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        totalProducts,
        pendingOrders,
        completedOrders,
        orderGrowthRate: Math.round(orderGrowthRate * 100) / 100,
        revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,
      },
      recentActivity: {
        recentOrders: recentOrders.map(order => {
          const items = (order as any).items || [];
          console.log('Dashboard API - Order items:', items);
          console.log('Dashboard API - Items length:', items.length);
          
          // Manual calculation to debug
          let totalItems = 0;
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(`Dashboard API - Item ${i}:`, item);
            console.log(`Dashboard API - Item ${i} quantity:`, item.quantity, 'type:', typeof item.quantity);
            const quantity = Number(item.quantity) || 0;
            console.log(`Dashboard API - Item ${i} quantity as number:`, quantity);
            totalItems += quantity;
            console.log(`Dashboard API - Running total after item ${i}:`, totalItems);
          }
          console.log('Dashboard API - Final total items:', totalItems);
          
          return {
            id: order.id,
            customerName: order.customerName,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            itemCount: totalItems,
          };
        }),
      },
      inventory: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue: totalInventoryValue || 0,
      },
      analytics: {
        orderStatusDistribution: orderStatusDistribution.map(item => ({
          status: item.status,
          count: parseInt((item as any).count as string),
        })),
        topSellingProducts: topSellingProducts.map(item => ({
          type: (item as any).type,
          fidgiColorId: (item as any).fidgiColorId,
          keycapId: (item as any).keycapId,
          switchId: (item as any).switchId,
          prebuiltFidgiId: (item as any).prebuiltFidgiId,
          totalQuantity: parseInt((item as any).totalQuantity as string),
          totalRevenue: parseFloat((item as any).totalRevenue as string),
        })),
      },
      timeframes: {
        last7Days: {
          orders: ordersLast7Days,
          revenue: revenueLast7Days || 0,
        },
        last30Days: {
          orders: ordersLast30Days,
          revenue: revenueLast30Days || 0,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
