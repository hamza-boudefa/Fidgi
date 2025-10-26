import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting basic seeding...');

    // Clear existing data
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });

    console.log('Existing data cleared');

    // Create one of each type
    const color = await FidgiColor.create({
      name: 'Test Black',
      colorHex: '#000000',
      imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Test+Black',
      price: 15.00,
      cost: 8.00,
      quantity: 50,
      isActive: true,
    });

    const keycap = await KeycapDesign.create({
      name: 'Test Avengers',
      imageUrl: 'https://placehold.net/400x400/cc6600/ffffff?text=Test+Avengers',
      price: 8.00,
      cost: 3.00,
      quantity: 100,
      isActive: true,
      category: 'superhero',
    });

    const switchType = await SwitchType.create({
      name: 'Test Silent',
      description: 'Soft and quiet feel',
      price: 0.00,
      cost: 2.00,
      quantity: 200,
      isActive: true,
    });

    const prebuilt = await PrebuiltFidgi.create({
      name: 'Test Combo',
      description: 'Test black Fidgi with Avengers keycap and silent switch',
      imageUrl: 'https://placehold.net/600x400/000000/ffffff?text=Test+Combo',
      fidgiColorId: color.id,
      keycapId: keycap.id,
      switchId: switchType.id,
      price: 20.00,
      cost: 13.00,
      originalPrice: 23.00,
      discount: 13.04,
      isActive: true,
      isFeatured: true,
      tags: ['test', 'combo', 'silent'],
    });

    console.log('Basic seeding completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Basic database seeded successfully',
      data: {
        color: color.id,
        keycap: keycap.id,
        switch: switchType.id,
        prebuilt: prebuilt.id,
      }
    });
  } catch (error) {
    console.error('Error in basic seeding:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
