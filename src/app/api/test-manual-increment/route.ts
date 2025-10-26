import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, initializeDatabase } from '@/models';

// Test endpoint to manually test quantity increment
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('Testing manual quantity increment...');

    const body = await request.json();
    const { itemId, itemType, incrementBy = 1 } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { success: false, error: 'itemId and itemType are required' },
        { status: 400 }
      );
    }

    let beforeQuantity = 0;
    let afterQuantity = 0;
    let itemName = '';

    if (itemType === 'fidgiColor') {
      const beforeItem = await FidgiColor.findByPk(itemId);
      beforeQuantity = beforeItem?.getDataValue('quantity') || beforeItem?.quantity || 0;
      itemName = beforeItem?.name || 'Unknown';
      
      await FidgiColor.increment('quantity', {
        by: incrementBy,
        where: { id: itemId },
      });
      
      const afterItem = await FidgiColor.findByPk(itemId);
      afterQuantity = afterItem?.getDataValue('quantity') || afterItem?.quantity || 0;
      
    } else if (itemType === 'keycap') {
      const beforeItem = await KeycapDesign.findByPk(itemId);
      beforeQuantity = beforeItem?.getDataValue('quantity') || beforeItem?.quantity || 0;
      itemName = beforeItem?.name || 'Unknown';
      
      await KeycapDesign.increment('quantity', {
        by: incrementBy,
        where: { id: itemId },
      });
      
      const afterItem = await KeycapDesign.findByPk(itemId);
      afterQuantity = afterItem?.getDataValue('quantity') || afterItem?.quantity || 0;
      
    } else if (itemType === 'switch') {
      const beforeItem = await SwitchType.findByPk(itemId);
      beforeQuantity = beforeItem?.getDataValue('quantity') || beforeItem?.quantity || 0;
      itemName = beforeItem?.name || 'Unknown';
      
      await SwitchType.increment('quantity', {
        by: incrementBy,
        where: { id: itemId },
      });
      
      const afterItem = await SwitchType.findByPk(itemId);
      afterQuantity = afterItem?.getDataValue('quantity') || afterItem?.quantity || 0;
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid itemType. Must be fidgiColor, keycap, or switch' },
        { status: 400 }
      );
    }

    console.log(`Manual increment test: ${itemName} (${itemType}) - ${beforeQuantity} → ${afterQuantity} (+${incrementBy})`);

    return NextResponse.json({
      success: true,
      message: 'Manual increment test completed',
      data: {
        itemId,
        itemType,
        itemName,
        beforeQuantity,
        afterQuantity,
        incrementBy,
        change: afterQuantity - beforeQuantity,
        testPassed: (afterQuantity - beforeQuantity) === incrementBy
      },
    });
  } catch (error) {
    console.error('Error testing manual increment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test manual increment' },
      { status: 500 }
    );
  }
}
