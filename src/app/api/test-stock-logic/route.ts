import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get one prebuilt item
    const prebuiltItem = await PrebuiltFidgi.findOne({
      where: { isActive: true },
      include: [
        {
          model: FidgiColor,
          as: 'fidgiColor',
          attributes: ['id', 'name', 'quantity']
        },
        {
          model: KeycapDesign,
          as: 'keycap',
          attributes: ['id', 'name', 'quantity']
        },
        {
          model: SwitchType,
          as: 'switch',
          attributes: ['id', 'name', 'quantity']
        }
      ]
    });

    if (!prebuiltItem) {
      return NextResponse.json({
        success: false,
        error: 'No prebuilt items found'
      });
    }

    // Test the stock logic
    const fidgiColorQty = (prebuiltItem as any).fidgiColor?.quantity || 0;
    const keycapQty = (prebuiltItem as any).keycap?.quantity || 0;
    const switchQty = (prebuiltItem as any).switch?.quantity || 0;

    const isOutOfStock = (fidgiColorQty === 0) || (keycapQty === 0) || (switchQty === 0);
    const hasLowStock = (fidgiColorQty <= 10) || (keycapQty <= 10) || (switchQty <= 10);

    return NextResponse.json({
      success: true,
      data: {
        prebuiltItem: {
          name: prebuiltItem.name,
          components: {
            fidgiColor: { quantity: fidgiColorQty, isLow: fidgiColorQty <= 10, isOut: fidgiColorQty === 0 },
            keycap: { quantity: keycapQty, isLow: keycapQty <= 10, isOut: keycapQty === 0 },
            switch: { quantity: switchQty, isLow: switchQty <= 10, isOut: switchQty === 0 }
          },
          stockStatus: {
            isOutOfStock,
            hasLowStock,
            classification: isOutOfStock ? 'OUT OF STOCK' : (hasLowStock ? 'LOW STOCK' : 'AVAILABLE')
          }
        }
      }
    });
  } catch (error) {
    console.error('Test stock logic error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
