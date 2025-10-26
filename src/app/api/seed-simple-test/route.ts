import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Seeding simple test data...');

    // Clear existing data
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });

    // Create components first
    const color1 = await FidgiColor.create({
      name: 'Classic Black',
      colorHex: '#000000',
      price: 15.00,
      cost: 8.00,
      quantity: 45, // Good stock
      isActive: true,
      imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Classic+Black'
    });

    const color2 = await FidgiColor.create({
      name: 'Ocean Blue',
      colorHex: '#0066CC',
      price: 18.00,
      cost: 9.00,
      quantity: 5, // Low stock
      isActive: true,
      imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Ocean+Blue'
    });

    const color3 = await FidgiColor.create({
      name: 'Fire Red',
      colorHex: '#FF0000',
      price: 20.00,
      cost: 10.00,
      quantity: 0, // Out of stock
      isActive: true,
      imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Fire+Red'
    });

    const keycap1 = await KeycapDesign.create({
      name: 'Avengers',
      price: 8.00,
      cost: 3.00,
      quantity: 12, // Good stock
      isActive: true,
      category: 'superhero',
      imageUrl: 'https://placehold.net/400x400/cc6600/ffffff?text=Avengers'
    });

    const keycap2 = await KeycapDesign.create({
      name: 'Black Panther',
      price: 8.00,
      cost: 3.00,
      quantity: 2, // Low stock
      isActive: true,
      category: 'superhero',
      imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Black+Panther'
    });

    const keycap3 = await KeycapDesign.create({
      name: 'Iron Man',
      price: 8.00,
      cost: 3.00,
      quantity: 0, // Out of stock
      isActive: true,
      category: 'superhero',
      imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Iron+Man'
    });

    const switch1 = await SwitchType.create({
      name: 'Clicky',
      description: 'Crisp tactile click',
      price: 0.00,
      cost: 2.00,
      quantity: 50, // Good stock
      isActive: true,
      imageUrl: 'https://placehold.net/400x400/666666/ffffff?text=Clicky'
    });

    const switch2 = await SwitchType.create({
      name: 'Silent',
      description: 'Soft and quiet feel',
      price: 0.00,
      cost: 2.00,
      quantity: 3, // Low stock
      isActive: true,
      imageUrl: 'https://placehold.net/400x400/999999/ffffff?text=Silent'
    });

    const switch3 = await SwitchType.create({
      name: 'Linear',
      description: 'Smooth linear feel',
      price: 0.00,
      cost: 2.00,
      quantity: 0, // Out of stock
      isActive: true,
      imageUrl: 'https://placehold.net/400x400/cccccc/ffffff?text=Linear'
    });

    // Now create prebuilt items
    const prebuilt1 = await PrebuiltFidgi.create({
      name: 'Hero Combo',
      description: 'Black base with Avengers keycap and Clicky switch',
      fidgiColorId: color1.id,
      keycapId: keycap1.id,
      switchId: switch1.id,
      price: 25.00,
      cost: 13.00,
      originalPrice: 30.00,
      discount: 16.67,
      isActive: true,
      isFeatured: true,
      tags: ['hero', 'combo'],
      imageUrl: 'https://placehold.net/600x400/000000/ffffff?text=Hero+Combo'
    });

    const prebuilt2 = await PrebuiltFidgi.create({
      name: 'Ocean Hero',
      description: 'Ocean Blue base with Black Panther keycap and Silent switch',
      fidgiColorId: color2.id,
      keycapId: keycap2.id,
      switchId: switch2.id,
      price: 28.00,
      cost: 14.00,
      originalPrice: 32.00,
      discount: 12.50,
      isActive: true,
      isFeatured: false,
      tags: ['ocean', 'hero'],
      imageUrl: 'https://placehold.net/600x400/0066cc/ffffff?text=Ocean+Hero'
    });

    const prebuilt3 = await PrebuiltFidgi.create({
      name: 'Fire Storm',
      description: 'Fire Red base with Iron Man keycap and Linear switch',
      fidgiColorId: color3.id,
      keycapId: keycap3.id,
      switchId: switch3.id,
      price: 30.00,
      cost: 15.00,
      originalPrice: 35.00,
      discount: 14.29,
      isActive: true,
      isFeatured: false,
      tags: ['fire', 'storm'],
      imageUrl: 'https://placehold.net/600x400/ff0000/ffffff?text=Fire+Storm'
    });

    console.log('Simple test data seeded successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Simple test data seeded successfully',
      data: {
        components: {
          colors: 3,
          keycaps: 3,
          switches: 3
        },
        prebuilt: 3,
        stockLevels: {
          goodStock: 3, // Hero Combo (all components in stock)
          lowStock: 1, // Ocean Hero (all components low stock)
          outOfStock: 1 // Fire Storm (all components out of stock)
        }
      }
    });
  } catch (error) {
    console.error('Error seeding simple test data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
