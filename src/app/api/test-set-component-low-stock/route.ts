import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function POST(request: NextRequest) {
  try {
    // Get one component of each type
    const [color, keycap, switchType] = await Promise.all([
      FidgiColor.findOne({ where: { isActive: true } }),
      KeycapDesign.findOne({ where: { isActive: true } }),
      SwitchType.findOne({ where: { isActive: true } })
    ]);

    if (!color || !keycap || !switchType) {
      return NextResponse.json({
        success: false,
        error: 'Could not find components to test with'
      });
    }

    // Set quantities to test values
    await Promise.all([
      color.update({ quantity: 5 }), // Low stock
      keycap.update({ quantity: 0 }), // Out of stock
      switchType.update({ quantity: 8 }) // Low stock
    ]);

    // Force database sync
    await color.reload();
    await keycap.reload();
    await switchType.reload();

    return NextResponse.json({
      success: true,
      message: 'Set test quantities: Base=5 (low), Keycap=0 (out), Switch=8 (low)',
      data: {
        bases: { name: color.name, quantity: 5, status: 'LOW' },
        keycaps: { name: keycap.name, quantity: 0, status: 'OUT' },
        switches: { name: switchType.name, quantity: 8, status: 'LOW' }
      }
    });
  } catch (error) {
    console.error('Test set component low stock error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
