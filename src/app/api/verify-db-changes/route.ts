import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get the specific items we modified
    const [validTeal, blackPanther, silent] = await Promise.all([
      FidgiColor.findOne({ 
        where: { name: 'Valid Teal' },
        attributes: ['id', 'name', 'quantity']
      }),
      KeycapDesign.findOne({ 
        where: { name: 'Black Panther' },
        attributes: ['id', 'name', 'quantity']
      }),
      SwitchType.findOne({ 
        where: { name: 'Silent' },
        attributes: ['id', 'name', 'quantity']
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        validTeal: validTeal ? {
          id: validTeal.id,
          name: validTeal.name,
          quantity: validTeal.quantity,
          shouldBeLowStock: validTeal.quantity <= 10
        } : null,
        blackPanther: blackPanther ? {
          id: blackPanther.id,
          name: blackPanther.name,
          quantity: blackPanther.quantity,
          shouldBeOutOfStock: blackPanther.quantity === 0
        } : null,
        silent: silent ? {
          id: silent.id,
          name: silent.name,
          quantity: silent.quantity,
          shouldBeOK: silent.quantity > 10
        } : null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Verify DB changes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
