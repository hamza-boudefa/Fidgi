import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, initializeDatabase } from '@/models';
import { OrderStatus } from '@/models/Order';

// Test endpoint to verify the controller logic
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('Testing controller logic...');

    const body = await request.json();
    const { orderId, testData } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('Test data received:', JSON.stringify(testData, null, 2));

    // Find the order
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`Found order: ${order.id} with status ${order.status}`);
    console.log(`Order has ${(order as any).items.length} items`);

    // Get current inventory quantities
    const currentInventory = [];
    for (const item of (order as any).items) {
      if (item.type === 'custom') {
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        currentInventory.push({
          itemId: item.id,
          type: 'custom',
          quantity: item.quantity,
          fidgiColor: { id: item.fidgiColorId, quantity: fidgiColor?.quantity || 0 },
          keycap: { id: item.keycapId, quantity: keycap?.quantity || 0 },
          switch: { id: item.switchId, quantity: switchType?.quantity || 0 },
        });
      } else if (item.type === 'prebuilt') {
        const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId);
        if (prebuiltFidgi) {
          const fidgiColor = await FidgiColor.findByPk(prebuiltFidgi.fidgiColorId);
          const keycap = await KeycapDesign.findByPk(prebuiltFidgi.keycapId);
          const switchType = await SwitchType.findByPk(prebuiltFidgi.switchId);
          
          currentInventory.push({
            itemId: item.id,
            type: 'prebuilt',
            quantity: item.quantity,
            prebuiltId: item.prebuiltFidgiId,
            fidgiColor: { id: prebuiltFidgi.fidgiColorId, quantity: fidgiColor?.quantity || 0 },
            keycap: { id: prebuiltFidgi.keycapId, quantity: keycap?.quantity || 0 },
            switch: { id: prebuiltFidgi.switchId, quantity: switchType?.quantity || 0 },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Controller test completed',
      data: {
        orderId: order.id,
        orderStatus: order.status,
        itemCount: (order as any).items.length,
        currentInventory,
        testData,
        controllerTest: {
          status: 'ready',
          message: 'Controller is working, ready to test cancellation',
        },
      },
    });
  } catch (error) {
    console.error('Error testing controller:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test controller' },
      { status: 500 }
    );
  }
}
