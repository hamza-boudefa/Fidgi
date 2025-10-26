import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get all items with their cost values
    const [colors, keycaps, switches, prebuilt] = await Promise.all([
      FidgiColor.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost', 'quantity'],
        raw: true
      }),
      KeycapDesign.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost', 'quantity'],
        raw: true
      }),
      SwitchType.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost', 'quantity'],
        raw: true
      }),
      PrebuiltFidgi.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost'],
        raw: true
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bases: colors.map(c => ({
          name: c.name,
          price: c.price,
          cost: c.cost,
          costType: typeof c.cost,
          isNull: c.cost === null,
          isUndefined: c.cost === undefined,
          quantity: c.quantity,
          profit: (c.price || 0) - (c.cost || 0)
        })),
        keycaps: keycaps.map(k => ({
          name: k.name,
          price: k.price,
          cost: k.cost,
          costType: typeof k.cost,
          isNull: k.cost === null,
          isUndefined: k.cost === undefined,
          quantity: k.quantity,
          profit: (k.price || 0) - (k.cost || 0)
        })),
        switches: switches.map(s => ({
          name: s.name,
          price: s.price,
          cost: s.cost,
          costType: typeof s.cost,
          isNull: s.cost === null,
          isUndefined: s.cost === undefined,
          quantity: s.quantity,
          profit: (s.price || 0) - (s.cost || 0)
        })),
        prebuilt: prebuilt.map(p => ({
          name: p.name,
          price: p.price,
          cost: p.cost,
          costType: typeof p.cost,
          isNull: p.cost === null,
          isUndefined: p.cost === undefined,
          profit: (p.price || 0) - (p.cost || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Check all costs error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
