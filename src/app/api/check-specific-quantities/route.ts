import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get the first item of each type to check their quantities
    const [firstColor, firstKeycap, firstSwitch] = await Promise.all([
      FidgiColor.findOne({ 
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity']
      }),
      KeycapDesign.findOne({ 
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity']
      }),
      SwitchType.findOne({ 
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity']
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        firstColor: firstColor ? {
          id: firstColor.id,
          name: firstColor.name,
          quantity: firstColor.quantity
        } : null,
        firstKeycap: firstKeycap ? {
          id: firstKeycap.id,
          name: firstKeycap.name,
          quantity: firstKeycap.quantity
        } : null,
        firstSwitch: firstSwitch ? {
          id: firstSwitch.id,
          name: firstSwitch.name,
          quantity: firstSwitch.quantity
        } : null
      }
    });
  } catch (error) {
    console.error('Check specific quantities error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}
