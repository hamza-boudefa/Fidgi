import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking current database data...');
    
    const colors = await FidgiColor.findAll();
    const keycaps = await KeycapDesign.findAll();
    const switches = await SwitchType.findAll();
    const prebuilt = await PrebuiltFidgi.findAll();
    
    console.log('Current data:');
    console.log('Colors:', colors.length);
    console.log('Keycaps:', keycaps.length);
    console.log('Switches:', switches.length);
    console.log('Prebuilt:', prebuilt.length);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        colors: colors.map(c => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          cost: c.cost,
          imageUrl: c.imageUrl
        })),
        keycaps: keycaps.map(k => ({
          id: k.id,
          name: k.name,
          quantity: k.quantity,
          price: k.price,
          cost: k.cost,
          imageUrl: k.imageUrl
        })),
        switches: switches.map(s => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          cost: s.cost,
          imageUrl: s.imageUrl
        })),
        prebuilt: prebuilt.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          cost: p.cost,
          imageUrl: p.imageUrl
        }))
      }
    });
  } catch (error) {
    console.error('Error checking current data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
