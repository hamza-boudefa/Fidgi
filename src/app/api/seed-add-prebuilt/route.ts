import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding prebuilt items to database...');

    // Get existing items
    const colors = await FidgiColor.findAll({ limit: 3 });
    const keycaps = await KeycapDesign.findAll({ limit: 3 });
    const switches = await SwitchType.findAll({ limit: 3 });

    console.log('Found items:', {
      colors: colors.length,
      keycaps: keycaps.length,
      switches: switches.length
    });

    if (colors.length === 0 || keycaps.length === 0 || switches.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not enough base items found. Please run seed-add-items first.' 
      }, { status: 400 });
    }

    // Create prebuilt items
    const prebuilt1 = await PrebuiltFidgi.create({
      name: 'Avengers Classic',
      description: 'Classic black Fidgi with Avengers keycap and silent switch',
      imageUrl: 'https://placehold.net/600x400/000000/ffffff?text=Avengers+Classic',
      fidgiColorId: colors[0].id,
      keycapId: keycaps[0].id,
      switchId: switches[0].id,
      price: 20.00,
      cost: 13.00,
      originalPrice: 23.00,
      discount: 13.04,
      isActive: true,
      isFeatured: true,
      tags: ['avengers', 'classic', 'silent'],
    });

    const prebuilt2 = await PrebuiltFidgi.create({
      name: 'Iron Man Special',
      description: 'Ocean blue Fidgi with Iron Man keycap and clicky switch',
      imageUrl: 'https://placehold.net/600x400/0066cc/ffffff?text=Iron+Man+Special',
      fidgiColorId: colors[1]?.id || colors[0].id,
      keycapId: keycaps[1]?.id || keycaps[0].id,
      switchId: switches[1]?.id || switches[0].id,
      price: 24.00,
      cost: 14.00,
      originalPrice: 26.00,
      discount: 7.69,
      isActive: true,
      isFeatured: true,
      tags: ['iron-man', 'blue', 'clicky'],
    });

    const prebuilt3 = await PrebuiltFidgi.create({
      name: 'Hulk Smash',
      description: 'Forest green Fidgi with Hulk keycap and clicky switch',
      imageUrl: 'https://placehold.net/600x400/228b22/ffffff?text=Hulk+Smash',
      fidgiColorId: colors[2]?.id || colors[0].id,
      keycapId: keycaps[2]?.id || keycaps[0].id,
      switchId: switches[2]?.id || switches[0].id,
      price: 24.00,
      cost: 14.00,
      originalPrice: 26.00,
      discount: 7.69,
      isActive: true,
      isFeatured: false,
      tags: ['hulk', 'green', 'clicky'],
    });

    console.log('Prebuilt items added successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Prebuilt items added successfully',
      data: {
        prebuilts: [prebuilt1.id, prebuilt2.id, prebuilt3.id],
        totalItems: {
          colors: colors.length,
          keycaps: keycaps.length,
          switches: switches.length,
          prebuilts: 3
        }
      }
    });
  } catch (error) {
    console.error('Error adding prebuilt items:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
