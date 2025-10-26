import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing prebuilt items with component data...');
    
    const prebuiltItems = await PrebuiltFidgi.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'price', 'cost', 'fidgiColorId', 'keycapId', 'switchId'],
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
      limit: 3
    });

    console.log('Found prebuilt items:', prebuiltItems.length);
    
    // Calculate stock status for each prebuilt item
    const prebuiltWithStock = prebuiltItems.map(item => {
      const baseStock = (item as any).fidgiColor?.quantity || 0;
      const keycapStock = (item as any).keycap?.quantity || 0;
      const switchStock = (item as any).switch?.quantity || 0;
      
      const minStock = Math.min(baseStock, keycapStock, switchStock);
      
      let status = 'Available';
      if (minStock === 0) {
        status = 'Out of Stock';
      } else if (minStock <= 10) {
        status = 'Low Stock';
      }

      return {
        id: item.id,
        name: item.name,
        baseStock,
        keycapStock,
        switchStock,
        minStock,
        status,
        components: {
          fidgiColor: (item as any).fidgiColor,
          keycap: (item as any).keycap,
          switch: (item as any).switch
        }
      };
    });

    console.log('Prebuilt items with stock calculation:', JSON.stringify(prebuiltWithStock, null, 2));

    return NextResponse.json({
      success: true,
      data: prebuiltWithStock,
      total: prebuiltItems.length
    });
  } catch (error) {
    console.error('Test prebuilt stock error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test prebuilt stock calculation' },
      { status: 500 }
    );
  }
}
