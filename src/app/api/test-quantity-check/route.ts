import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, initializeDatabase } from '@/models';

// Simple test to check current quantities and test restoration
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('=== CHECKING CURRENT INVENTORY QUANTITIES ===');

    // Find the specific items mentioned in the test
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

    const currentQuantities = {
      testYelloBase: testYelloBase ? {
        id: testYelloBase.id,
        name: testYelloBase.name,
        quantity: testYelloBase.getDataValue('quantity') || testYelloBase.quantity || 0
      } : null,
      blackKeycap: blackKeycap ? {
        id: blackKeycap.id,
        name: blackKeycap.name,
        quantity: blackKeycap.getDataValue('quantity') || blackKeycap.quantity || 0
      } : null,
      anySwitch: anySwitch ? {
        id: anySwitch.id,
        name: anySwitch.name,
        quantity: anySwitch.getDataValue('quantity') || anySwitch.quantity || 0
      } : null
    };

    console.log('Current quantities found:');
    console.log('- Test Yello Base:', currentQuantities.testYelloBase);
    console.log('- Black Keycap:', currentQuantities.blackKeycap);
    console.log('- Any Switch:', currentQuantities.anySwitch);

    return NextResponse.json({
      success: true,
      message: 'Current inventory quantities checked',
      data: {
        currentQuantities,
        testInstructions: {
          step1: 'Note the current quantities above',
          step2: 'Create an order with these items',
          step3: 'Check quantities after order creation (should be -1)',
          step4: 'Cancel the order',
          step5: 'Check quantities after cancellation (should be back to original)',
          step6: 'Use POST /api/test-complete-order-flow to run automated test'
        },
        availableForTest: {
          testYelloBase: !!testYelloBase,
          blackKeycap: !!blackKeycap,
          anySwitch: !!anySwitch,
          allAvailable: !!(testYelloBase && blackKeycap && anySwitch)
        }
      }
    });

  } catch (error) {
    console.error('Error checking quantities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check quantities' },
      { status: 500 }
    );
  }
}
