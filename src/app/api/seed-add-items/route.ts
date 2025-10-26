import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding items to database...');

    // Create a few FidgiColors
    const color1 = await FidgiColor.create({
      name: 'Classic Black',
      colorHex: '#000000',
      imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Classic+Black',
      price: 15.00,
      cost: 8.00,
      quantity: 50,
      isActive: true,
    });

    const color2 = await FidgiColor.create({
      name: 'Ocean Blue',
      colorHex: '#0066CC',
      imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Ocean+Blue',
      price: 18.00,
      cost: 9.00,
      quantity: 30,
      isActive: true,
    });

    const color3 = await FidgiColor.create({
      name: 'Fire Red',
      colorHex: '#FF0000',
      imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Fire+Red',
      price: 20.00,
      cost: 10.00,
      quantity: 5,
      isActive: true,
    });

    // Create a few KeycapDesigns
    const keycap1 = await KeycapDesign.create({
      name: 'Avengers',
      imageUrl: 'https://placehold.net/400x400/cc6600/ffffff?text=Avengers',
      price: 8.00,
      cost: 3.00,
      quantity: 100,
      isActive: true,
      category: 'superhero',
    });

    const keycap2 = await KeycapDesign.create({
      name: 'Black Panther',
      imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Black+Panther',
      price: 8.00,
      cost: 3.00,
      quantity: 80,
      isActive: true,
      category: 'superhero',
    });

    const keycap3 = await KeycapDesign.create({
      name: 'Iron Man',
      imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Iron+Man',
      price: 8.00,
      cost: 3.00,
      quantity: 85,
      isActive: true,
      category: 'superhero',
    });

    // Create a few SwitchTypes
    const switch1 = await SwitchType.create({
      name: 'Silent',
      description: 'Soft and quiet feel',
      price: 0.00,
      cost: 2.00,
      quantity: 200,
      isActive: true,
    });

    const switch2 = await SwitchType.create({
      name: 'Clicky',
      description: 'Crisp tactile click',
      price: 0.00,
      cost: 2.00,
      quantity: 200,
      isActive: true,
    });

    const switch3 = await SwitchType.create({
      name: 'Linear',
      description: 'Smooth linear feel',
      price: 0.00,
      cost: 2.00,
      quantity: 15,
      isActive: true,
    });

    console.log('Items added successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Items added successfully',
      data: {
        colors: [color1.id, color2.id, color3.id],
        keycaps: [keycap1.id, keycap2.id, keycap3.id],
        switches: [switch1.id, switch2.id, switch3.id],
      }
    });
  } catch (error) {
    console.error('Error adding items:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
