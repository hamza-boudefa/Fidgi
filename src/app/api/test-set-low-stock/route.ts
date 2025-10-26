import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Get one prebuilt item
    const prebuiltItem = await PrebuiltFidgi.findOne({
      where: { isActive: true },
      include: [
        {
          model: FidgiColor,
          as: 'fidgiColor'
        },
        {
          model: KeycapDesign,
          as: 'keycap'
        },
        {
          model: SwitchType,
          as: 'switch'
        }
      ]
    });

    if (!prebuiltItem) {
      return NextResponse.json({
        success: false,
        error: 'No prebuilt items found'
      });
    }

    // Temporarily set one component to low stock (quantity = 5)
    if ((prebuiltItem as any).fidgiColor) {
      await (prebuiltItem as any).fidgiColor.update({ quantity: 5 });
    }

    return NextResponse.json({
      success: true,
      message: `Set ${(prebuiltItem as any).fidgiColor?.name} quantity to 5 for testing`,
      data: {
        prebuiltItem: {
          name: prebuiltItem.name,
          fidgiColor: {
            name: (prebuiltItem as any).fidgiColor?.name,
            quantity: 5
          }
        }
      }
    });
  } catch (error) {
    console.error('Test set low stock error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
