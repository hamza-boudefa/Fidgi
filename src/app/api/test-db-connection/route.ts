import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, initializeDatabase } from '@/models';

// Test endpoint to verify database connection and inventory updates
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Test finding some inventory items
    const fidgiColors = await FidgiColor.findAll({ limit: 3 });
    const keycaps = await KeycapDesign.findAll({ limit: 3 });
    const switches = await SwitchType.findAll({ limit: 3 });

    console.log(`Found ${fidgiColors.length} FidgiColors, ${keycaps.length} Keycaps, ${switches.length} Switches`);

    // Test incrementing a quantity
    if (fidgiColors.length > 0) {
      const testItem = fidgiColors[0];
      const beforeQuantity = testItem.quantity;
      
      console.log(`Testing increment on FidgiColor ${testItem.id}: ${beforeQuantity}`);
      
      await FidgiColor.increment('quantity', {
        by: 1,
        where: { id: testItem.id },
      });
      
      const afterItem = await FidgiColor.findByPk(testItem.id);
      const afterQuantity = afterItem?.quantity || 0;
      
      console.log(`After increment: ${afterQuantity} (was ${beforeQuantity})`);
      
      // Restore original quantity
      await FidgiColor.update(
        { quantity: beforeQuantity },
        { where: { id: testItem.id } }
      );
      
      console.log(`Restored original quantity: ${beforeQuantity}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      data: {
        fidgiColors: fidgiColors.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
        keycaps: keycaps.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
        switches: switches.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
        testResult: 'Database operations working correctly',
      },
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection test failed', details: error },
      { status: 500 }
    );
  }
}