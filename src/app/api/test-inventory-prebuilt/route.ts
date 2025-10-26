import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing inventory API prebuilt items...');
    
    const prebuilt = await PrebuiltFidgi.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'description', 'price', 'cost', 'originalPrice', 'discount', 'isActive', 'isFeatured', 'imageUrl', 'tags', 'fidgiColorId', 'keycapId', 'switchId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: FidgiColor,
          as: 'fidgiColor',
          attributes: ['id', 'name', 'quantity', 'isActive']
        },
        {
          model: KeycapDesign,
          as: 'keycap',
          attributes: ['id', 'name', 'quantity', 'isActive']
        },
        {
          model: SwitchType,
          as: 'switch',
          attributes: ['id', 'name', 'quantity', 'isActive']
        }
      ],
      limit: 2
    });
    
    console.log('Prebuilt items from inventory API:', prebuilt.length);
    if (prebuilt.length > 0) {
      console.log('First prebuilt item from inventory API:', JSON.stringify(prebuilt[0], null, 2));
    }

    return NextResponse.json({
      success: true,
      data: prebuilt,
      total: prebuilt.length
    });
  } catch (error) {
    console.error('Test inventory prebuilt error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test inventory prebuilt items' },
      { status: 500 }
    );
  }
}
