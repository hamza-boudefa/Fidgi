import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG ITEMS TEST ===');
    
    // Get one order with items
    const order = await Order.findOne({
      attributes: ['id', 'customerName', 'totalAmount', 'status', 'createdAt'],
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'quantity'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'No orders found' });
    }

    console.log('Order found:', order.id);
    console.log('Order items raw:', (order as any).items);
    console.log('Order items type:', typeof (order as any).items);
    console.log('Order items length:', (order as any).items?.length);

    const items = (order as any).items || [];
    console.log('Items array:', items);
    console.log('Items array length:', items.length);

    if (items.length > 0) {
      console.log('First item:', items[0]);
      console.log('First item quantity:', items[0].quantity);
      console.log('First item quantity type:', typeof items[0].quantity);
    }

    // Test the calculation
    let totalItems = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Item ${i}:`, item);
      console.log(`Item ${i} quantity:`, item.quantity);
      console.log(`Item ${i} quantity type:`, typeof item.quantity);
      const quantity = Number(item.quantity) || 0;
      console.log(`Item ${i} quantity as number:`, quantity);
      totalItems += quantity;
      console.log(`Running total after item ${i}:`, totalItems);
    }

    console.log('Final total items:', totalItems);

    return NextResponse.json({ 
      success: true, 
      data: {
        order: {
          id: order.id,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        },
        items: items,
        itemCount: totalItems,
        debug: {
          itemsLength: items.length,
          firstItem: items[0] || null,
          totalCalculated: totalItems
        }
      }
    });
  } catch (error) {
    console.error('Debug items error:', error);
    return NextResponse.json({ success: false, error: 'Failed to debug items' }, { status: 500 });
  }
}
