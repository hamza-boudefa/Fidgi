import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get the first item of each type with raw database values
    const [firstColor, firstKeycap, firstSwitch] = await Promise.all([
      FidgiColor.findOne({ 
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity'],
        raw: true // Get raw database values
      }),
      KeycapDesign.findOne({ 
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity'],
        raw: true
      }),
      SwitchType.findOne({ 
        where: { isActive: true },
        attributes: ['id', 'name', 'quantity'],
        raw: true
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        firstColor,
        firstKeycap,
        firstSwitch,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Check DB values error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
