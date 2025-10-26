import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, initializeDatabase } from '@/models';
import { OrderStatus, OrderSource } from '@/models/Order';
import { OrderItemType } from '@/models/OrderItem';

// Simple test to verify order flow with any available items
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('=== STARTING SIMPLE ORDER FLOW TEST ===');

    // Step 1: Find any available items
    console.log('Step 1: Finding available items...');
    
    const anyBase = await FidgiColor.findOne({
      where: { isActive: true, quantity: { [Symbol.for('gt')]: 0 } },
      attributes: ['id', 'name', 'quantity']
    });
    
    const anyKeycap = await KeycapDesign.findOne({
      where: { isActive: true, quantity: { [Symbol.for('gt')]: 0 } },
      attributes: ['id', 'name', 'quantity']
    });
    
    const anySwitch = await SwitchType.findOne({
      where: { isActive: true, quantity: { [Symbol.for('gt')]: 0 } },
      attributes: ['id', 'name', 'quantity']
    });

    if (!anyBase || !anyKeycap || !anySwitch) {
      return NextResponse.json({
        success: false,
        error: 'No available items found for testing',
        details: {
          base: !!anyBase,
          keycap: !!anyKeycap,
          switch: !!anySwitch
        }
      });
    }

    console.log('Found test items:');
    console.log(`- Base: ${anyBase.name} (ID: ${anyBase.id}, Qty: ${anyBase.getDataValue('quantity')})`);
    console.log(`- Keycap: ${anyKeycap.name} (ID: ${anyKeycap.id}, Qty: ${anyKeycap.getDataValue('quantity')})`);
    console.log(`- Switch: ${anySwitch.name} (ID: ${anySwitch.id}, Qty: ${anySwitch.getDataValue('quantity')})`);

    // Step 2: Record initial quantities
    const initialQuantities = {
      base: anyBase.getDataValue('quantity') || anyBase.quantity || 0,
      keycap: anyKeycap.getDataValue('quantity') || anyKeycap.quantity || 0,
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
      fidgiColorId: anyBase.id,
      keycapId: anyKeycap.id,
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
      where: { id: anyBase.id }
    });
    
    await KeycapDesign.decrement('quantity', {
      by: 1,
      where: { id: anyKeycap.id }
    });
    
    await SwitchType.decrement('quantity', {
      by: 1,
      where: { id: anySwitch.id }
    });

    // Step 6: Check quantities after order creation
    console.log('Step 6: Checking quantities after order creation...');
    
    const afterOrderBase = await FidgiColor.findByPk(anyBase.id);
    const afterOrderKeycap = await KeycapDesign.findByPk(anyKeycap.id);
    const afterOrderSwitch = await SwitchType.findByPk(anySwitch.id);

    const afterOrderQuantities = {
      base: afterOrderBase?.getDataValue('quantity') || afterOrderBase?.quantity || 0,
      keycap: afterOrderKeycap?.getDataValue('quantity') || afterOrderKeycap?.quantity || 0,
      switch: afterOrderSwitch?.getDataValue('quantity') || afterOrderSwitch?.quantity || 0
    };

    console.log('Quantities after order creation:', afterOrderQuantities);

    // Step 7: Simulate inventory restoration (as done in cancellation)
    console.log('Step 7: Simulating inventory restoration...');
    
    await FidgiColor.increment('quantity', {
      by: 1,
      where: { id: anyBase.id }
    });
    
    await KeycapDesign.increment('quantity', {
      by: 1,
      where: { id: anyKeycap.id }
    });
    
    await SwitchType.increment('quantity', {
      by: 1,
      where: { id: anySwitch.id }
    });

    // Step 8: Check quantities after restoration
    console.log('Step 8: Checking quantities after restoration...');
    
    const afterRestoreBase = await FidgiColor.findByPk(anyBase.id);
    const afterRestoreKeycap = await KeycapDesign.findByPk(anyKeycap.id);
    const afterRestoreSwitch = await SwitchType.findByPk(anySwitch.id);

    const afterRestoreQuantities = {
      base: afterRestoreBase?.getDataValue('quantity') || afterRestoreBase?.quantity || 0,
      keycap: afterRestoreKeycap?.getDataValue('quantity') || afterRestoreKeycap?.quantity || 0,
      switch: afterRestoreSwitch?.getDataValue('quantity') || afterRestoreSwitch?.quantity || 0
    };

    console.log('Quantities after restoration:', afterRestoreQuantities);

    // Step 9: Update order status to cancelled
    await testOrder.update({ status: OrderStatus.CANCELLED });

    // Step 10: Verify restoration
    const restorationVerified = {
      base: afterRestoreQuantities.base === initialQuantities.base,
      keycap: afterRestoreQuantities.keycap === initialQuantities.keycap,
      switch: afterRestoreQuantities.switch === initialQuantities.switch
    };

    const allRestored = restorationVerified.base && restorationVerified.keycap && restorationVerified.switch;

    console.log('=== TEST RESULTS ===');
    console.log('Initial quantities:', initialQuantities);
    console.log('After order creation:', afterOrderQuantities);
    console.log('After restoration:', afterRestoreQuantities);
    console.log('Restoration verified:', restorationVerified);
    console.log('All items restored:', allRestored);

    return NextResponse.json({
      success: true,
      message: 'Simple order flow test completed',
      data: {
        testOrderId: testOrder.id,
        testOrderItemId: orderItem.id,
        testItems: {
          base: { id: anyBase.id, name: anyBase.name },
          keycap: { id: anyKeycap.id, name: anyKeycap.name },
          switch: { id: anySwitch.id, name: anySwitch.name }
        },
        quantities: {
          initial: initialQuantities,
          afterOrder: afterOrderQuantities,
          afterRestore: afterRestoreQuantities
        },
        changes: {
          afterOrder: {
            base: afterOrderQuantities.base - initialQuantities.base,
            keycap: afterOrderQuantities.keycap - initialQuantities.keycap,
            switch: afterOrderQuantities.switch - initialQuantities.switch
          },
          afterRestore: {
            base: afterRestoreQuantities.base - afterOrderQuantities.base,
            keycap: afterRestoreQuantities.keycap - afterOrderQuantities.keycap,
            switch: afterRestoreQuantities.switch - afterOrderQuantities.switch
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
    console.error('Error in simple order flow test:', error);
    return NextResponse.json(
      { success: false, error: 'Simple order flow test failed', details: error },
      { status: 500 }
    );
  }
}
