import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing inventory data...');
    
    // Get all items
    const colors = await FidgiColor.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'price', 'cost', 'quantity', 'imageUrl']
    });
    
    const keycaps = await KeycapDesign.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'price', 'cost', 'quantity', 'imageUrl']
    });
    
    const switches = await SwitchType.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'price', 'cost', 'quantity', 'imageUrl']
    });
    
    const prebuilt = await PrebuiltFidgi.findAll({
      where: { isActive: true },
      include: [
        { model: FidgiColor, as: 'fidgiColor', attributes: ['id', 'name', 'quantity'] },
        { model: KeycapDesign, as: 'keycap', attributes: ['id', 'name', 'quantity'] },
        { model: SwitchType, as: 'switch', attributes: ['id', 'name', 'quantity'] },
      ],
      attributes: ['id', 'name', 'price', 'cost', 'imageUrl']
    });
    
    // Calculate stock levels
    const colorStats = {
      total: colors.length,
      lowStock: colors.filter(c => c.quantity > 0 && c.quantity <= 10).length,
      outOfStock: colors.filter(c => c.quantity === 0).length
    };
    
    const keycapStats = {
      total: keycaps.length,
      lowStock: keycaps.filter(k => k.quantity > 0 && k.quantity <= 10).length,
      outOfStock: keycaps.filter(k => k.quantity === 0).length
    };
    
    const switchStats = {
      total: switches.length,
      lowStock: switches.filter(s => s.quantity > 0 && s.quantity <= 10).length,
      outOfStock: switches.filter(s => s.quantity === 0).length
    };
    
    // Calculate prebuilt stock based on component availability
    let prebuiltLowStock = 0;
    let prebuiltOutOfStock = 0;
    
    prebuilt.forEach(item => {
      const baseStock = (item as any).fidgiColor?.quantity || 0;
      const keycapStock = (item as any).keycap?.quantity || 0;
      const switchStock = (item as any).switch?.quantity || 0;
      const minStock = Math.min(baseStock, keycapStock, switchStock);
      
      if (minStock === 0) {
        prebuiltOutOfStock++;
      } else if (minStock <= 10) {
        prebuiltLowStock++;
      }
    });
    
    const prebuiltStats = {
      total: prebuilt.length,
      lowStock: prebuiltLowStock,
      outOfStock: prebuiltOutOfStock
    };
    
    console.log('Inventory stats:');
    console.log('Colors:', colorStats);
    console.log('Keycaps:', keycapStats);
    console.log('Switches:', switchStats);
    console.log('Prebuilt:', prebuiltStats);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        colors: {
          items: colors,
          stats: colorStats
        },
        keycaps: {
          items: keycaps,
          stats: keycapStats
        },
        switches: {
          items: switches,
          stats: switchStats
        },
        prebuilt: {
          items: prebuilt,
          stats: prebuiltStats
        },
        summary: {
          totalLowStock: colorStats.lowStock + keycapStats.lowStock + switchStats.lowStock + prebuiltStats.lowStock,
          totalOutOfStock: colorStats.outOfStock + keycapStats.outOfStock + switchStats.outOfStock + prebuiltStats.outOfStock
        }
      }
    });
  } catch (error) {
    console.error('Error testing inventory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
