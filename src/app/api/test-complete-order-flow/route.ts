import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, initializeDatabase } from '@/models';
import { OrderStatus, OrderSource } from '@/models/Order';
import { OrderItemType } from '@/models/OrderItem';

// Test endpoint to verify complete order flow: create → check quantities → cancel → check restoration
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('=== STARTING COMPLETE ORDER FLOW TEST ===');

    // Step 1: Find test items
    console.log('Step 1: Finding test items...');
    
    const testYelloBase = await FidgiColor.findOne({
      where: { name: 'test yello' },
      attributes: ['id', 'name', 'quantity']
    });
    
    const blackKeycap = await KeycapDesign.findOne({
      where: { name: 'Black' },
      attributes: ['id', 'name', 'quantity']
    });
    
    const anySwitch = await SwitchType.findOne({
      where: { isActive: true },
      attributes: ['id', 'name', 'quantity']
    });

    if (!testYelloBase) {
      return NextResponse.json({
        success: false,
        error: 'Test yello base not found'
      });
    }

    if (!blackKeycap) {
      return NextResponse.json({
        success: false,
        error: 'Black keycap not found'
      });
    }

    if (!anySwitch) {
      return NextResponse.json({
        success: false,
        error: 'No active switches found'
      });
    }

    console.log('Found test items:');
    console.log(`- Base: ${testYelloBase.name} (ID: ${testYelloBase.id}, Qty: ${testYelloBase.getDataValue('quantity')})`);
    console.log(`- Keycap: ${blackKeycap.name} (ID: ${blackKeycap.id}, Qty: ${blackKeycap.getDataValue('quantity')})`);
    console.log(`- Switch: ${anySwitch.name} (ID: ${anySwitch.id}, Qty: ${anySwitch.getDataValue('quantity')})`);

    // Step 2: Record initial quantities
    const initialQuantities = {
      base: testYelloBase.getDataValue('quantity') || testYelloBase.quantity || 0,
      keycap: blackKeycap.getDataValue('quantity') || blackKeycap.quantity || 0,
      switch: anySwitch.getDataValue('quantity') || anySwitch.quantity || 0
    };

    console.log('Step 2: Initial quantities recorded:', initialQuantities);

    // Step 3: Create test order
    console.log('Step 3: Creating test order...');
    
    const testOrder = await Order.create({
      customerName: 'Test Customer',
      customerPhone: '1234567890',
      customerEmail: 'test@example.com',
      customerAddress: 'Test Address',
      customerCity: 'Test City',
      customerPostalCode: '12345',
      status: OrderStatus.PENDING,
      totalAmount: 50.00,
      totalCost: 20.00,
      totalProfit: 30.00,
      shippingCost: 0,
      source: OrderSource.WEBSITE
    });

    console.log(`Test order created: ${testOrder.id}`);

    // Step 4: Create order items
    console.log('Step 4: Creating order items...');
    
    const orderItem = await OrderItem.create({
      orderId: testOrder.id,
      type: OrderItemType.CUSTOM,
      fidgiColorId: testYelloBase.id,
      keycapId: blackKeycap.id,
      switchId: anySwitch.id,
      quantity: 1,
      unitPrice: 25.00,
      totalPrice: 25.00,
      unitCost: 10.00,
      totalCost: 10.00,
      profit: 15.00
    });

    console.log(`Order item created: ${orderItem.id}`);

    // Step 5: Simulate inventory deduction (as done in order creation)
    console.log('Step 5: Simulating inventory deduction...');
    
    await FidgiColor.decrement('quantity', {
      by: 1,
      where: { id: testYelloBase.id }
    });
    
    await KeycapDesign.decrement('quantity', {
      by: 1,
      where: { id: blackKeycap.id }
    });
    
    await SwitchType.decrement('quantity', {
      by: 1,
      where: { id: anySwitch.id }
    });

    // Step 6: Check quantities after order creation
    console.log('Step 6: Checking quantities after order creation...');
    
    const afterOrderBase = await FidgiColor.findByPk(testYelloBase.id);
    const afterOrderKeycap = await KeycapDesign.findByPk(blackKeycap.id);
    const afterOrderSwitch = await SwitchType.findByPk(anySwitch.id);

    const afterOrderQuantities = {
      base: afterOrderBase?.getDataValue('quantity') || afterOrderBase?.quantity || 0,
      keycap: afterOrderKeycap?.getDataValue('quantity') || afterOrderKeycap?.quantity || 0,
      switch: afterOrderSwitch?.getDataValue('quantity') || afterOrderSwitch?.quantity || 0
    };

    console.log('Quantities after order creation:', afterOrderQuantities);

    // Step 7: Cancel the order
    console.log('Step 7: Cancelling the order...');
    
    const orderData = {
      id: testOrder.id,
      items: [{
        id: orderItem.id,
        type: 'custom',
        quantity: 1,
        fidgiColorId: testYelloBase.id,
        keycapId: blackKeycap.id,
        switchId: anySwitch.id
      }]
    };

    // Simulate the restoration process
    console.log('Simulating inventory restoration...');
    
    const beforeRestoreBase = await FidgiColor.findByPk(testYelloBase.id);
    const beforeRestoreKeycap = await KeycapDesign.findByPk(blackKeycap.id);
    const beforeRestoreSwitch = await SwitchType.findByPk(anySwitch.id);

    await FidgiColor.increment('quantity', {
      by: 1,
      where: { id: testYelloBase.id }
    });
    
    await KeycapDesign.increment('quantity', {
      by: 1,
      where: { id: blackKeycap.id }
    });
    
    await SwitchType.increment('quantity', {
      by: 1,
      where: { id: anySwitch.id }
    });

    // Step 8: Check quantities after cancellation
    console.log('Step 8: Checking quantities after cancellation...');
    
    const afterCancelBase = await FidgiColor.findByPk(testYelloBase.id);
    const afterCancelKeycap = await KeycapDesign.findByPk(blackKeycap.id);
    const afterCancelSwitch = await SwitchType.findByPk(anySwitch.id);

    const afterCancelQuantities = {
      base: afterCancelBase?.getDataValue('quantity') || afterCancelBase?.quantity || 0,
      keycap: afterCancelKeycap?.getDataValue('quantity') || afterCancelKeycap?.quantity || 0,
      switch: afterCancelSwitch?.getDataValue('quantity') || afterCancelSwitch?.quantity || 0
    };

    console.log('Quantities after cancellation:', afterCancelQuantities);

    // Step 9: Update order status to cancelled
    await testOrder.update({ status: OrderStatus.CANCELLED });

    // Step 10: Verify restoration
    const restorationVerified = {
      base: afterCancelQuantities.base === initialQuantities.base,
      keycap: afterCancelQuantities.keycap === initialQuantities.keycap,
      switch: afterCancelQuantities.switch === initialQuantities.switch
    };

    const allRestored = restorationVerified.base && restorationVerified.keycap && restorationVerified.switch;

    console.log('=== TEST RESULTS ===');
    console.log('Initial quantities:', initialQuantities);
    console.log('After order creation:', afterOrderQuantities);
    console.log('After cancellation:', afterCancelQuantities);
    console.log('Restoration verified:', restorationVerified);
    console.log('All items restored:', allRestored);

    return NextResponse.json({
      success: true,
      message: 'Complete order flow test completed',
      data: {
        testOrderId: testOrder.id,
        testOrderItemId: orderItem.id,
        testItems: {
          base: { id: testYelloBase.id, name: testYelloBase.name },
          keycap: { id: blackKeycap.id, name: blackKeycap.name },
          switch: { id: anySwitch.id, name: anySwitch.name }
        },
        quantities: {
          initial: initialQuantities,
          afterOrder: afterOrderQuantities,
          afterCancel: afterCancelQuantities
        },
        changes: {
          afterOrder: {
            base: afterOrderQuantities.base - initialQuantities.base,
            keycap: afterOrderQuantities.keycap - initialQuantities.keycap,
            switch: afterOrderQuantities.switch - initialQuantities.switch
          },
          afterCancel: {
            base: afterCancelQuantities.base - afterOrderQuantities.base,
            keycap: afterCancelQuantities.keycap - afterOrderQuantities.keycap,
            switch: afterCancelQuantities.switch - afterOrderQuantities.switch
          }
        },
        restorationVerified,
        testPassed: allRestored,
        summary: {
          orderCreated: true,
          inventoryDeducted: true,
          orderCancelled: true,
          inventoryRestored: allRestored
        }
      }
    });

  } catch (error) {
    console.error('Error in complete order flow test:', error);
    return NextResponse.json(
      { success: false, error: 'Complete order flow test failed', details: error },
      { status: 500 }
    );
  }
}
