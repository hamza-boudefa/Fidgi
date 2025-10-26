import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Count prebuilt items
    const prebuiltCount = await PrebuiltFidgi.count({ where: { isActive: true } });
    
    // Test 2: Get one prebuilt item with associations
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
    
    // Test 3: Get component quantities manually
    let manualQuantities = null;
    if (prebuiltItem) {
      const [fidgiColor, keycap, switchType] = await Promise.all([
        FidgiColor.findByPk(prebuiltItem.fidgiColorId, { attributes: ['quantity'] }),
        KeycapDesign.findByPk(prebuiltItem.keycapId, { attributes: ['quantity'] }),
        SwitchType.findByPk(prebuiltItem.switchId, { attributes: ['quantity'] })
      ]);
      
      manualQuantities = {
        fidgiColor: fidgiColor?.quantity,
        keycap: keycap?.quantity,
        switch: switchType?.quantity
      };
    }
    
    return NextResponse.json({
      success: true,
      data: {
        prebuiltCount,
        prebuiltItem: prebuiltItem ? {
          id: prebuiltItem.id,
          name: prebuiltItem.name,
          fidgiColorId: prebuiltItem.fidgiColorId,
          keycapId: prebuiltItem.keycapId,
          switchId: prebuiltItem.switchId,
          associations: {
            fidgiColor: (prebuiltItem as any).fidgiColor,
            keycap: (prebuiltItem as any).keycap,
            switch: (prebuiltItem as any).switch
          },
          manualQuantities
        } : null
      }
    });
  } catch (error) {
    console.error('Test prebuilt error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
