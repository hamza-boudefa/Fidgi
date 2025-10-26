import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, initializeDatabase } from '@/models';
import { OrderStatus } from '@/models/Order';

// Test endpoint to verify cancellation with order data
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('Testing cancellation with order data...');

    // Find a pending or confirmed order to test with
    const testOrder = await Order.findOne({
      where: { 
        status: [OrderStatus.PENDING, OrderStatus.CONFIRMED] 
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!testOrder) {
      return NextResponse.json({
        success: false,
        message: 'No pending or confirmed orders found to test with',
      });
    }

    console.log(`Found test order: ${testOrder.id} with status ${testOrder.status}`);
    console.log(`Order has ${(testOrder as any).items.length} items`);

    // Get current inventory quantities
    const currentInventory = [];
    for (const item of (testOrder as any).items) {
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

    // Prepare the order data for cancellation
    const orderDataForCancellation = {
      id: testOrder.id,
      items: (testOrder as any).items.map(item => ({
        id: item.id,
        type: item.type,
        quantity: item.quantity,
        fidgiColorId: item.fidgiColorId,
        keycapId: item.keycapId,
        switchId: item.switchId,
        prebuiltFidgiId: item.prebuiltFidgiId,
      }))
    };

    return NextResponse.json({
      success: true,
      message: 'Test order found - ready for cancellation with data',
      data: {
        orderId: testOrder.id,
        orderStatus: testOrder.status,
        itemCount: (testOrder as any).items.length,
        currentInventory,
        orderDataForCancellation,
        testInstructions: {
          step1: 'Current inventory quantities (before cancellation)',
          step2: 'Use PUT /api/orders/[id] with the provided orderDataForCancellation',
          step3: 'Check console logs for detailed restoration process',
          step4: 'Verify inventory quantities are restored correctly',
        },
        testPayload: {
          method: 'PUT',
          url: `/api/orders/${testOrder.id}`,
          body: {
            status: 'cancelled',
            orderData: orderDataForCancellation
          }
        },
      },
    });
  } catch (error) {
    console.error('Error testing cancellation with data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test cancellation with data' },
      { status: 500 }
    );
  }
}
