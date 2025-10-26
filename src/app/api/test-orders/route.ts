import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, initializeDatabase } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    console.log('Initializing database for test orders...');
    await initializeDatabase();
    console.log('Database initialized successfully for test orders');
    dbInitialized = true;
  }
};

// GET /api/test-orders - Test orders query
export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initDB();
    
    console.log('Testing orders query...');
    
    // Test simple orders query
    const orders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
    });
    
    console.log('Orders found:', orders.length);
    console.log('First order:', orders[0] ? {
      id: orders[0].id,
      customerName: orders[0].customerName,
      customerEmail: orders[0].customerEmail,
      customerPhone: orders[0].customerPhone,
      totalAmount: orders[0].totalAmount
    } : 'No orders found');
    
    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          customerCity: order.customerCity,
          customerPostalCode: order.customerPostalCode,
          customerNotes: order.customerNotes,
          status: order.status,
          totalAmount: order.totalAmount,
          shippingCost: order.shippingCost,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Test orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
