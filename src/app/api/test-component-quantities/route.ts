import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '10');

    // Get all components with their quantities
    const [colors, keycaps, switches] = await Promise.all([
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
      })
    ]);

    // Debug: Log the actual quantities
    console.log('=== TEST ENDPOINT DEBUG ===');
    console.log('Low stock threshold:', lowStockThreshold);
    console.log('Colors:', colors.map(c => ({ name: c.name, quantity: c.quantity })));
    console.log('Keycaps:', keycaps.map(k => ({ name: k.name, quantity: k.quantity })));
    console.log('Switches:', switches.map(s => ({ name: s.name, quantity: s.quantity })));

    // Calculate stock status for each component type
    const basesAnalysis = {
      total: colors.length,
      lowStock: colors.filter(c => c.quantity <= lowStockThreshold).length,
      outOfStock: colors.filter(c => c.quantity === 0).length,
      items: colors.map(c => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        status: c.quantity === 0 ? 'OUT' : (c.quantity <= lowStockThreshold ? 'LOW' : 'OK')
      }))
    };

    const keycapsAnalysis = {
      total: keycaps.length,
      lowStock: keycaps.filter(k => k.quantity <= lowStockThreshold).length,
      outOfStock: keycaps.filter(k => k.quantity === 0).length,
      items: keycaps.map(k => ({
        id: k.id,
        name: k.name,
        quantity: k.quantity,
        status: k.quantity === 0 ? 'OUT' : (k.quantity <= lowStockThreshold ? 'LOW' : 'OK')
      }))
    };

    const switchesAnalysis = {
      total: switches.length,
      lowStock: switches.filter(s => s.quantity <= lowStockThreshold).length,
      outOfStock: switches.filter(s => s.quantity === 0).length,
      items: switches.map(s => ({
        id: s.id,
        name: s.name,
        quantity: s.quantity,
        status: s.quantity === 0 ? 'OUT' : (s.quantity <= lowStockThreshold ? 'LOW' : 'OK')
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        lowStockThreshold,
        bases: basesAnalysis,
        keycaps: keycapsAnalysis,
        switches: switchesAnalysis
      }
    });
  } catch (error) {
    console.error('Test component quantities error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
