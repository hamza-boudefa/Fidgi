import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';
import { OrderStatus } from '@/models/Order';

// Test endpoint to verify inventory restoration functionality
export async function GET(request: NextRequest) {
  try {
    console.log('Testing inventory restoration functionality...');

    // Get a cancelled order to test with
    const cancelledOrder = await Order.findOne({
      where: { status: OrderStatus.CANCELLED },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!cancelledOrder) {
      return NextResponse.json({
        success: false,
        message: 'No cancelled orders found to test with',
      });
    }

    console.log(`Found cancelled order: ${cancelledOrder.id}`);
    console.log(`Order has ${(cancelledOrder as any).items.length} items`);

    // Get current inventory quantities before restoration
    const beforeQuantities = [];
    for (const item of (cancelledOrder as any).items) {
      if (item.type === 'custom') {
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        beforeQuantities.push({
          itemId: item.id,
          type: 'custom',
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
            prebuiltId: item.prebuiltFidgiId,
            fidgiColor: { id: prebuiltFidgi.fidgiColorId, quantity: fidgiColor?.quantity || 0 },
            keycap: { id: prebuiltFidgi.keycapId, quantity: keycap?.quantity || 0 },
            switch: { id: prebuiltFidgi.switchId, quantity: switchType?.quantity || 0 },
          });
        }
      }
    }

    // Simulate inventory restoration by incrementing quantities
    console.log('Simulating inventory restoration...');
    for (const item of (cancelledOrder as any).items) {
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

    // Get inventory quantities after restoration
    const afterQuantities = [];
    for (const item of (cancelledOrder as any).items) {
      if (item.type === 'custom') {
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        afterQuantities.push({
          itemId: item.id,
          type: 'custom',
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
          
          afterQuantities.push({
            itemId: item.id,
            type: 'prebuilt',
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
      message: 'Inventory restoration test completed',
      data: {
        orderId: cancelledOrder.id,
        orderStatus: cancelledOrder.status,
        itemCount: (cancelledOrder as any).items.length,
        beforeQuantities,
        afterQuantities,
        restorationSummary: afterQuantities.map((after, index) => {
          const before = beforeQuantities[index];
          return {
            itemId: after.itemId,
            type: after.type,
            changes: {
              fidgiColor: {
                before: before.fidgiColor.quantity,
                after: after.fidgiColor.quantity,
                restored: after.fidgiColor.quantity - before.fidgiColor.quantity,
              },
              keycap: {
                before: before.keycap.quantity,
                after: after.keycap.quantity,
                restored: after.keycap.quantity - before.keycap.quantity,
              },
              switch: {
                before: before.switch.quantity,
                after: after.switch.quantity,
                restored: after.switch.quantity - before.switch.quantity,
              },
            },
          };
        }),
      },
    });
  } catch (error) {
    console.error('Error testing inventory restoration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test inventory restoration' },
      { status: 500 }
    );
  }
}
