import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get a few items from each category to check their cost values
    const [colors, keycaps, switches, prebuilt] = await Promise.all([
      FidgiColor.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost', 'quantity'],
        limit: 3
      }),
      KeycapDesign.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost', 'quantity'],
        limit: 3
      }),
      SwitchType.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost', 'quantity'],
        limit: 3
      }),
      PrebuiltFidgi.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'price', 'cost'],
        limit: 3
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bases: colors.map(c => ({
          name: c.name,
          price: c.price,
          cost: c.cost,
          quantity: c.quantity,
          profit: (c.price || 0) - (c.cost || 0),
          costPercentage: c.price > 0 ? ((c.cost || 0) / c.price * 100).toFixed(1) + '%' : '0%'
        })),
        keycaps: keycaps.map(k => ({
          name: k.name,
          price: k.price,
          cost: k.cost,
          quantity: k.quantity,
          profit: (k.price || 0) - (k.cost || 0)
        })),
        switches: switches.map(s => ({
          name: s.name,
          price: s.price,
          cost: s.cost,
          quantity: s.quantity,
          profit: (s.price || 0) - (s.cost || 0)
        })),
        prebuilt: prebuilt.map(p => ({
          name: p.name,
          price: p.price,
          cost: p.cost,
          profit: (p.price || 0) - (p.cost || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Check costs error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
