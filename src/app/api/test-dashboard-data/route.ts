import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing dashboard data...');
    
    // Test basic order query
    const orders = await Order.findAll({
      attributes: ['id', 'customerName', 'totalAmount', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 3,
    });

    console.log('Basic orders:', JSON.stringify(orders, null, 2));

    // Test orders with items
    const ordersWithItems = await Order.findAll({
      attributes: ['id', 'customerName', 'totalAmount', 'status', 'createdAt'],
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'quantity'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 3,
    });

    console.log('Orders with items:', JSON.stringify(ordersWithItems, null, 2));

    // Process the data like the dashboard API does
    const processedOrders = ordersWithItems.map(order => {
      const items = (order as any).items || [];
      console.log('Test API - Order items:', items);
      console.log('Test API - Items length:', items.length);
      
      // Manual calculation to debug
      let totalItems = 0;
      for (const item of items) {
        console.log('Test API - Processing item:', item);
        console.log('Test API - Item quantity:', item.quantity, 'type:', typeof item.quantity);
        totalItems += Number(item.quantity) || 0;
        console.log('Test API - Running total:', totalItems);
      }
      
      console.log('Test API - Final total items:', totalItems);
      
      return {
        id: order.id,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: totalItems,
      };
    });

    console.log('Processed orders:', JSON.stringify(processedOrders, null, 2));

    return NextResponse.json({ 
      success: true, 
      data: {
        basicOrders: orders,
        ordersWithItems: ordersWithItems,
        processedOrders: processedOrders
      }
    });
  } catch (error) {
    console.error('Test dashboard data error:', error);
    return NextResponse.json({ success: false, error: 'Failed to test dashboard data' }, { status: 500 });
  }
}
