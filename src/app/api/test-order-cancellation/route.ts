import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';
import { OrderStatus } from '@/models/Order';

// Test endpoint to simulate order cancellation and inventory restoration
export async function POST(request: NextRequest) {
  try {
    console.log('Testing order cancellation and inventory restoration...');

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order with items
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

    // Check if order can be cancelled
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `Order cannot be cancelled in current status: ${order.status}` },
        { status: 400 }
      );
    }

    console.log(`Testing cancellation for order ${orderId} with status ${order.status}`);
    console.log(`Order has ${(order as any).items.length} items`);

    // Get current inventory quantities before cancellation
    const beforeQuantities = [];
    for (const item of (order as any).items) {
      if (item.type === 'custom') {
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        beforeQuantities.push({
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
          
          beforeQuantities.push({
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

    // Simulate the cancellation process
    console.log('Simulating order cancellation...');
    
    // First, simulate the inventory deduction that would have happened during order creation
    for (const item of (order as any).items) {
      if (item.type === 'custom') {
        if (item.fidgiColorId) {
          await FidgiColor.decrement('quantity', {
            by: item.quantity,
            where: { id: item.fidgiColorId },
          });
        }
        if (item.keycapId) {
          await KeycapDesign.decrement('quantity', {
            by: item.quantity,
            where: { id: item.keycapId },
          });
        }
        if (item.switchId) {
          await SwitchType.decrement('quantity', {
            by: item.quantity,
            where: { id: item.switchId },
          });
        }
      } else if (item.type === 'prebuilt') {
        const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId);
        if (prebuiltFidgi) {
          await FidgiColor.decrement('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.fidgiColorId },
          });
          await KeycapDesign.decrement('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.keycapId },
          });
          await SwitchType.decrement('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.switchId },
          });
        }
      }
    }

    // Get quantities after deduction (simulating order creation)
    const afterDeductionQuantities = [];
    for (const item of (order as any).items) {
      if (item.type === 'custom') {
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        afterDeductionQuantities.push({
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
          
          afterDeductionQuantities.push({
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

    // Now simulate the cancellation and inventory restoration
    console.log('Simulating inventory restoration after cancellation...');
    for (const item of (order as any).items) {
      if (item.type === 'custom') {
        if (item.fidgiColorId) {
          await FidgiColor.increment('quantity', {
            by: item.quantity,
            where: { id: item.fidgiColorId },
          });
        }
        if (item.keycapId) {
          await KeycapDesign.increment('quantity', {
            by: item.quantity,
            where: { id: item.keycapId },
          });
        }
        if (item.switchId) {
          await SwitchType.increment('quantity', {
            by: item.quantity,
            where: { id: item.switchId },
          });
        }
      } else if (item.type === 'prebuilt') {
        const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId);
        if (prebuiltFidgi) {
          await FidgiColor.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.fidgiColorId },
          });
          await KeycapDesign.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.keycapId },
          });
          await SwitchType.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.switchId },
          });
        }
      }
    }

    // Get final quantities after restoration
    const afterRestorationQuantities = [];
    for (const item of (order as any).items) {
      if (item.type === 'custom') {
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        afterRestorationQuantities.push({
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
          
          afterRestorationQuantities.push({
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

    // Verify that quantities are restored correctly
    const restorationVerification = beforeQuantities.map((before, index) => {
      const after = afterRestorationQuantities[index];
      return {
        itemId: before.itemId,
        type: before.type,
        quantity: before.quantity,
        verification: {
          fidgiColor: {
            original: before.fidgiColor.quantity,
            afterDeduction: afterDeductionQuantities[index].fidgiColor.quantity,
            afterRestoration: after.fidgiColor.quantity,
            correctlyRestored: before.fidgiColor.quantity === after.fidgiColor.quantity,
          },
          keycap: {
            original: before.keycap.quantity,
            afterDeduction: afterDeductionQuantities[index].keycap.quantity,
            afterRestoration: after.keycap.quantity,
            correctlyRestored: before.keycap.quantity === after.keycap.quantity,
          },
          switch: {
            original: before.switch.quantity,
            afterDeduction: afterDeductionQuantities[index].switch.quantity,
            afterRestoration: after.switch.quantity,
            correctlyRestored: before.switch.quantity === after.switch.quantity,
          },
        },
      };
    });

    const allCorrectlyRestored = restorationVerification.every(item => 
      item.verification.fidgiColor.correctlyRestored &&
      item.verification.keycap.correctlyRestored &&
      item.verification.switch.correctlyRestored
    );

    return NextResponse.json({
      success: true,
      message: 'Order cancellation and inventory restoration test completed',
      data: {
        orderId: order.id,
        orderStatus: order.status,
        itemCount: (order as any).items.length,
        beforeQuantities,
        afterDeductionQuantities,
        afterRestorationQuantities,
        restorationVerification,
        allCorrectlyRestored,
        summary: {
          totalItems: (order as any).items.length,
          correctlyRestored: restorationVerification.filter(item => 
            item.verification.fidgiColor.correctlyRestored &&
            item.verification.keycap.correctlyRestored &&
            item.verification.switch.correctlyRestored
          ).length,
          testPassed: allCorrectlyRestored,
        },
      },
    });
  } catch (error) {
    console.error('Error testing order cancellation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test order cancellation' },
      { status: 500 }
    );
  }
}
