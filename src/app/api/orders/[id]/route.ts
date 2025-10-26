import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, initializeDatabase } from '@/models';
import { OrderStatus } from '@/models/Order';

// Function to restore inventory from provided order data
async function restoreInventoryFromOrderData(orderData: any) {
  try {
    console.log(`Starting inventory restoration from order data for order ${orderData.id}`);
    console.log(`Order data items:`, JSON.stringify(orderData.items, null, 2));

    if (!orderData.items || orderData.items.length === 0) {
      console.log(`No items to restore for order ${orderData.id}`);
      return true;
    }

    // Restore inventory for all items
    for (const item of orderData.items) {
      console.log(`Processing item ${item.id}: type=${item.type}, quantity=${item.quantity}`);
      console.log(`Item details:`, JSON.stringify(item, null, 2));
      
      if (item.type === 'custom') {
        // Restore component quantities for custom items
        const fidgiColorId = item.fidgiColorId || item.fidgiColor?.id;
        const keycapId = item.keycapId || item.keycap?.id;
        const switchId = item.switchId || item.switch?.id;
        
        console.log(`Extracted IDs - FidgiColor: ${fidgiColorId}, Keycap: ${keycapId}, Switch: ${switchId}`);
        
        if (fidgiColorId) {
          const beforeUpdate = await FidgiColor.findByPk(fidgiColorId);
          const beforeQuantity = beforeUpdate?.getDataValue('quantity') || beforeUpdate?.quantity || 0;
          
          await FidgiColor.increment('quantity', {
            by: item.quantity,
            where: { id: fidgiColorId },
          });
          
          const afterUpdate = await FidgiColor.findByPk(fidgiColorId);
          const afterQuantity = afterUpdate?.getDataValue('quantity') || afterUpdate?.quantity || 0;
          
          console.log(`Restored FidgiColor ${fidgiColorId}: ${beforeQuantity} → ${afterQuantity} (+${item.quantity})`);
        }
        
        if (keycapId) {
          const beforeUpdate = await KeycapDesign.findByPk(keycapId);
          const beforeQuantity = beforeUpdate?.getDataValue('quantity') || beforeUpdate?.quantity || 0;
          
          await KeycapDesign.increment('quantity', {
            by: item.quantity,
            where: { id: keycapId },
          });
          
          const afterUpdate = await KeycapDesign.findByPk(keycapId);
          const afterQuantity = afterUpdate?.getDataValue('quantity') || afterUpdate?.quantity || 0;
          
          console.log(`Restored KeycapDesign ${keycapId}: ${beforeQuantity} → ${afterQuantity} (+${item.quantity})`);
        }
        
        if (switchId) {
          const beforeUpdate = await SwitchType.findByPk(switchId);
          const beforeQuantity = beforeUpdate?.getDataValue('quantity') || beforeUpdate?.quantity || 0;
          
          await SwitchType.increment('quantity', {
            by: item.quantity,
            where: { id: switchId },
          });
          
          const afterUpdate = await SwitchType.findByPk(switchId);
          const afterQuantity = afterUpdate?.getDataValue('quantity') || afterUpdate?.quantity || 0;
          
          console.log(`Restored SwitchType ${switchId}: ${beforeQuantity} → ${afterQuantity} (+${item.quantity})`);
        }
      } else if (item.type === 'prebuilt') {
        // For prebuilt items, restore component quantities
        const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId);
        if (prebuiltFidgi) {
          console.log(`Restoring components for prebuilt ${item.prebuiltFidgiId}:`);
          
          // Restore FidgiColor
          const beforeFidgi = await FidgiColor.findByPk(prebuiltFidgi.fidgiColorId);
          await FidgiColor.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.fidgiColorId },
          });
          const afterFidgi = await FidgiColor.findByPk(prebuiltFidgi.fidgiColorId);
          console.log(`  FidgiColor ${prebuiltFidgi.fidgiColorId}: ${beforeFidgi?.quantity} → ${afterFidgi?.quantity} (+${item.quantity})`);
          
          // Restore KeycapDesign
          const beforeKeycap = await KeycapDesign.findByPk(prebuiltFidgi.keycapId);
          await KeycapDesign.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.keycapId },
          });
          const afterKeycap = await KeycapDesign.findByPk(prebuiltFidgi.keycapId);
          console.log(`  KeycapDesign ${prebuiltFidgi.keycapId}: ${beforeKeycap?.quantity} → ${afterKeycap?.quantity} (+${item.quantity})`);
          
          // Restore SwitchType
          const beforeSwitch = await SwitchType.findByPk(prebuiltFidgi.switchId);
          await SwitchType.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.switchId },
          });
          const afterSwitch = await SwitchType.findByPk(prebuiltFidgi.switchId);
          console.log(`  SwitchType ${prebuiltFidgi.switchId}: ${beforeSwitch?.quantity} → ${afterSwitch?.quantity} (+${item.quantity})`);
        } else {
          console.error(`PrebuiltFidgi ${item.prebuiltFidgiId} not found for item ${item.id}`);
        }
      } else {
        console.warn(`Unknown item type: ${item.type} for item ${item.id}`);
      }
    }

    console.log(`Successfully restored inventory from order data for order ${orderData.id}`);
    return true;
  } catch (error) {
    console.error(`Error restoring inventory from order data for order ${orderData.id}:`, error);
    throw error;
  }
}

// Function to restore inventory quantities when an order is cancelled
async function restoreInventoryForOrder(orderId: string) {
  try {
    console.log(`Starting inventory restoration for order ${orderId}`);
    
    const orderWithItems = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!orderWithItems) {
      throw new Error(`Order ${orderId} not found`);
    }

    const items = (orderWithItems as any).items;
    console.log(`Found order ${orderId} with ${items.length} items to restore`);

    if (items.length === 0) {
      console.log(`No items to restore for order ${orderId}`);
      return true;
    }

    // Restore inventory for all items
    for (const item of items) {
      console.log(`Processing item ${item.id}: type=${item.type}, quantity=${item.quantity}`);
      
      if (item.type === 'custom') {
        // Restore component quantities for custom items
        if (item.fidgiColorId) {
          const beforeUpdate = await FidgiColor.findByPk(item.fidgiColorId);
          await FidgiColor.increment('quantity', {
            by: item.quantity,
            where: { id: item.fidgiColorId },
          });
          const afterUpdate = await FidgiColor.findByPk(item.fidgiColorId);
          console.log(`Restored FidgiColor ${item.fidgiColorId}: ${beforeUpdate?.quantity} → ${afterUpdate?.quantity} (+${item.quantity})`);
        }
        
        if (item.keycapId) {
          const beforeUpdate = await KeycapDesign.findByPk(item.keycapId);
          await KeycapDesign.increment('quantity', {
            by: item.quantity,
            where: { id: item.keycapId },
          });
          const afterUpdate = await KeycapDesign.findByPk(item.keycapId);
          console.log(`Restored KeycapDesign ${item.keycapId}: ${beforeUpdate?.quantity} → ${afterUpdate?.quantity} (+${item.quantity})`);
        }
        
        if (item.switchId) {
          const beforeUpdate = await SwitchType.findByPk(item.switchId);
          await SwitchType.increment('quantity', {
            by: item.quantity,
            where: { id: item.switchId },
          });
          const afterUpdate = await SwitchType.findByPk(item.switchId);
          console.log(`Restored SwitchType ${item.switchId}: ${beforeUpdate?.quantity} → ${afterUpdate?.quantity} (+${item.quantity})`);
        }
      } else if (item.type === 'prebuilt') {
        // For prebuilt items, restore component quantities
        const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId);
        if (prebuiltFidgi) {
          console.log(`Restoring components for prebuilt ${item.prebuiltFidgiId}:`);
          
          // Restore FidgiColor
          const beforeFidgi = await FidgiColor.findByPk(prebuiltFidgi.fidgiColorId);
          await FidgiColor.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.fidgiColorId },
          });
          const afterFidgi = await FidgiColor.findByPk(prebuiltFidgi.fidgiColorId);
          console.log(`  FidgiColor ${prebuiltFidgi.fidgiColorId}: ${beforeFidgi?.quantity} → ${afterFidgi?.quantity} (+${item.quantity})`);
          
          // Restore KeycapDesign
          const beforeKeycap = await KeycapDesign.findByPk(prebuiltFidgi.keycapId);
          await KeycapDesign.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.keycapId },
          });
          const afterKeycap = await KeycapDesign.findByPk(prebuiltFidgi.keycapId);
          console.log(`  KeycapDesign ${prebuiltFidgi.keycapId}: ${beforeKeycap?.quantity} → ${afterKeycap?.quantity} (+${item.quantity})`);
          
          // Restore SwitchType
          const beforeSwitch = await SwitchType.findByPk(prebuiltFidgi.switchId);
          await SwitchType.increment('quantity', {
            by: item.quantity,
            where: { id: prebuiltFidgi.switchId },
          });
          const afterSwitch = await SwitchType.findByPk(prebuiltFidgi.switchId);
          console.log(`  SwitchType ${prebuiltFidgi.switchId}: ${beforeSwitch?.quantity} → ${afterSwitch?.quantity} (+${item.quantity})`);
        } else {
          console.error(`PrebuiltFidgi ${item.prebuiltFidgiId} not found for item ${item.id}`);
        }
      } else {
        console.warn(`Unknown item type: ${item.type} for item ${item.id}`);
      }
    }

    console.log(`Successfully restored inventory for order ${orderId}`);
    return true;
  } catch (error) {
    console.error(`Error restoring inventory for order ${orderId}:`, error);
    throw error;
  }
}

// Initialize database connection

// GET /api/orders/[id] - Get specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    
    const { id } = await params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: FidgiColor, as: 'fidgiColor' },
            { model: KeycapDesign, as: 'keycap' },
            { model: SwitchType, as: 'switch' },
            { model: PrebuiltFidgi, as: 'prebuiltFidgi' },
          ],
        },
      ],
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    
    const { id } = await params;
    const order = await Order.findByPk(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, customerNotes, orderData } = body;
    
    console.log('PUT /api/orders/[id] - Request body:', JSON.stringify(body, null, 2));

    // Prevent updating cancelled orders
    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { success: false, error: 'Cannot update cancelled orders' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // If order is being cancelled, restore inventory
    if (status === OrderStatus.CANCELLED) {
      console.log(`Order ${id} status changing to CANCELLED - restoring inventory`);
      console.log(`Current order status: ${order.status}, new status: ${status}`);
      
      try {
        if (orderData && orderData.items && orderData.items.length > 0) {
          // Use provided order data for restoration
          console.log(`Using provided order data for restoration:`, JSON.stringify(orderData, null, 2));
          await restoreInventoryFromOrderData(orderData);
        } else {
          // Fallback to fetching order data from database
          console.log(`No order data provided, fetching from database...`);
          await restoreInventoryForOrder(id);
        }
        console.log(`Inventory restoration completed for order ${id}`);
      } catch (restoreError) {
        console.error(`Failed to restore inventory for order ${id}:`, restoreError);
        console.error('Restore error details:', restoreError);
        // Continue with status update even if restoration fails
      }
    }

    await order.update({
      ...(status && { status }),
      ...(customerNotes !== undefined && { customerNotes }),
    });

    // Fetch updated order with items
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: FidgiColor, as: 'fidgiColor' },
            { model: KeycapDesign, as: 'keycap' },
            { model: SwitchType, as: 'switch' },
            { model: PrebuiltFidgi, as: 'prebuiltFidgi' },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    
    const { id } = await params;
    const order = await Order.findByPk(id, {
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

    // Only allow cancellation of pending or confirmed orders
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'Order cannot be cancelled in current status' },
        { status: 400 }
      );
    }

    // Restore inventory
    await restoreInventoryForOrder(id);

    // Update order status to cancelled
    await order.update({ status: OrderStatus.CANCELLED });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
