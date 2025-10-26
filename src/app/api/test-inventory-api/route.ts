import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '10');

    // Get all components with debug logging
    console.log('=== TEST INVENTORY API DEBUG ===');
    console.log('Low stock threshold:', lowStockThreshold);
    
    const [colors, keycaps, switches, prebuilt] = await Promise.all([
      FidgiColor.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity']
      }),
      KeycapDesign.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity']
      }),
      SwitchType.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity']
      }),
      PrebuiltFidgi.findAll({
        where: { isActive: true },
        attributes: ['id', 'name']
      })
    ]);

    console.log('Colors:', colors.map(c => ({ name: c.name, quantity: c.quantity })));
    console.log('Keycaps:', keycaps.map(k => ({ name: k.name, quantity: k.quantity })));
    console.log('Switches:', switches.map(s => ({ name: s.name, quantity: s.quantity })));

    // Calculate stock counts for each category
    const basesData = {
      total: colors.length,
      lowStock: colors.filter(c => c.quantity <= lowStockThreshold).length,
      outOfStock: colors.filter(c => c.quantity === 0).length,
      totalValue: colors.reduce((sum, c) => sum + (c.quantity || 0), 0)
    };

    const keycapsData = {
      total: keycaps.length,
      lowStock: keycaps.filter(k => k.quantity <= lowStockThreshold).length,
      outOfStock: keycaps.filter(k => k.quantity === 0).length,
      totalValue: keycaps.reduce((sum, k) => sum + (k.quantity || 0), 0)
    };

    const switchesData = {
      total: switches.length,
      lowStock: switches.filter(s => s.quantity <= lowStockThreshold).length,
      outOfStock: switches.filter(s => s.quantity === 0).length,
      totalValue: switches.reduce((sum, s) => sum + (s.quantity || 0), 0)
    };

    const prebuiltData = {
      total: prebuilt.length,
      lowStock: 0, // Will be calculated based on components
      outOfStock: 0, // Will be calculated based on components
      totalValue: 0
    };

    // Calculate summary
    const allCategories = [basesData, keycapsData, switchesData, prebuiltData];
    const totalItems = allCategories.reduce((sum, cat) => sum + cat.total, 0);
    const totalLowStock = allCategories.reduce((sum, cat) => sum + cat.lowStock, 0);
    const totalOutOfStock = allCategories.reduce((sum, cat) => sum + cat.outOfStock, 0);

    return NextResponse.json({
      success: true,
      data: {
        bases: basesData,
        keycaps: keycapsData,
        switches: switchesData,
        prebuilt: prebuiltData,
        summary: {
          totalItems,
          totalLowStock,
          totalOutOfStock,
          totalValue: 0,
          lowStockThreshold
        }
      }
    });
  } catch (error) {
    console.error('Test inventory API error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
