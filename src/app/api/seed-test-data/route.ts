import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Seeding test data with different stock levels...');

    // Clear existing data
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });

    // Create FidgiColors with different stock levels
    const fidgiColors = await Promise.all([
      FidgiColor.create({
        name: 'Classic Black',
        colorHex: '#000000',
        price: 15.00,
        cost: 8.00,
        quantity: 45, // Good stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Classic+Black'
      }),
      FidgiColor.create({
        name: 'Ocean Blue',
        colorHex: '#0066CC',
        price: 18.00,
        cost: 9.00,
        quantity: 5, // Low stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Ocean+Blue'
      }),
      FidgiColor.create({
        name: 'Fire Red',
        colorHex: '#FF0000',
        price: 20.00,
        cost: 10.00,
        quantity: 0, // Out of stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Fire+Red'
      }),
      FidgiColor.create({
        name: 'Forest Green',
        colorHex: '#00AA00',
        price: 16.00,
        cost: 8.50,
        quantity: 25, // Good stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/00aa00/ffffff?text=Forest+Green'
      })
    ]);

    // Create KeycapDesigns with different stock levels
    const keycaps = await Promise.all([
      KeycapDesign.create({
        name: 'Avengers',
        price: 8.00,
        cost: 3.00,
        quantity: 12, // Good stock
        isActive: true,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/cc6600/ffffff?text=Avengers'
      }),
      KeycapDesign.create({
        name: 'Black Panther',
        price: 8.00,
        cost: 3.00,
        quantity: 2, // Low stock
        isActive: true,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Black+Panther'
      }),
      KeycapDesign.create({
        name: 'Iron Man',
        price: 8.00,
        cost: 3.00,
        quantity: 0, // Out of stock
        isActive: true,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Iron+Man'
      }),
      KeycapDesign.create({
        name: 'Captain America',
        price: 8.00,
        cost: 3.00,
        quantity: 8, // Good stock
        isActive: true,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Captain+America'
      })
    ]);

    // Create SwitchTypes with different stock levels
    const switches = await Promise.all([
      SwitchType.create({
        name: 'Clicky',
        description: 'Crisp tactile click',
        price: 0.00,
        cost: 2.00,
        quantity: 50, // Good stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/666666/ffffff?text=Clicky'
      }),
      SwitchType.create({
        name: 'Silent',
        description: 'Soft and quiet feel',
        price: 0.00,
        cost: 2.00,
        quantity: 3, // Low stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/999999/ffffff?text=Silent'
      }),
      SwitchType.create({
        name: 'Linear',
        description: 'Smooth linear feel',
        price: 0.00,
        cost: 2.00,
        quantity: 0, // Out of stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/cccccc/ffffff?text=Linear'
      }),
      SwitchType.create({
        name: 'Tactile',
        description: 'Tactile feedback',
        price: 0.00,
        cost: 2.00,
        quantity: 15, // Good stock
        isActive: true,
        imageUrl: 'https://placehold.net/400x400/333333/ffffff?text=Tactile'
      })
    ]);

    // Create PrebuiltFidgi items (wait for components to be created first)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to ensure components are created
    
    const prebuiltItems = await Promise.all([
      PrebuiltFidgi.create({
        name: 'Hero Combo',
        description: 'Black base with Avengers keycap and Clicky switch',
        fidgiColorId: fidgiColors[0].id, // Classic Black (45 stock)
        keycapId: keycaps[0].id, // Avengers (12 stock)
        switchId: switches[0].id, // Clicky (50 stock)
        price: 25.00,
        cost: 13.00, // 8 + 3 + 2
        originalPrice: 30.00,
        discount: 16.67,
        isActive: true,
        isFeatured: true,
        tags: ['hero', 'combo'],
        imageUrl: 'https://placehold.net/600x400/000000/ffffff?text=Hero+Combo'
      }),
      PrebuiltFidgi.create({
        name: 'Ocean Hero',
        description: 'Ocean Blue base with Black Panther keycap and Silent switch',
        fidgiColorId: fidgiColors[1].id, // Ocean Blue (5 stock - LOW)
        keycapId: keycaps[1].id, // Black Panther (2 stock - LOW)
        switchId: switches[1].id, // Silent (3 stock - LOW)
        price: 28.00,
        cost: 14.00, // 9 + 3 + 2
        originalPrice: 32.00,
        discount: 12.50,
        isActive: true,
        isFeatured: false,
        tags: ['ocean', 'hero'],
        imageUrl: 'https://placehold.net/600x400/0066cc/ffffff?text=Ocean+Hero'
      }),
      PrebuiltFidgi.create({
        name: 'Fire Storm',
        description: 'Fire Red base with Iron Man keycap and Linear switch',
        fidgiColorId: fidgiColors[2].id, // Fire Red (0 stock - OUT)
        keycapId: keycaps[2].id, // Iron Man (0 stock - OUT)
        switchId: switches[2].id, // Linear (0 stock - OUT)
        price: 30.00,
        cost: 15.00, // 10 + 3 + 2
        originalPrice: 35.00,
        discount: 14.29,
        isActive: true,
        isFeatured: false,
        tags: ['fire', 'storm'],
        imageUrl: 'https://placehold.net/600x400/ff0000/ffffff?text=Fire+Storm'
      }),
      PrebuiltFidgi.create({
        name: 'Forest Captain',
        description: 'Forest Green base with Captain America keycap and Tactile switch',
        fidgiColorId: fidgiColors[3].id, // Forest Green (25 stock)
        keycapId: keycaps[3].id, // Captain America (8 stock)
        switchId: switches[3].id, // Tactile (15 stock)
        price: 26.00,
        cost: 13.50, // 8.5 + 3 + 2
        originalPrice: 30.00,
        discount: 13.33,
        isActive: true,
        isFeatured: true,
        tags: ['forest', 'captain'],
        imageUrl: 'https://placehold.net/600x400/00aa00/ffffff?text=Forest+Captain'
      })
    ]);

    console.log('Test data seeded successfully!');
    console.log('FidgiColors:', fidgiColors.length);
    console.log('Keycaps:', keycaps.length);
    console.log('Switches:', switches.length);
    console.log('Prebuilt items:', prebuiltItems.length);

    return NextResponse.json({ 
      success: true, 
      message: 'Test data seeded successfully with different stock levels',
      data: {
        fidgiColors: fidgiColors.length,
        keycaps: keycaps.length,
        switches: switches.length,
        prebuiltItems: prebuiltItems.length,
        stockLevels: {
          goodStock: 3, // Items with quantity > 10
          lowStock: 3, // Items with quantity <= 10 and > 0
          outOfStock: 3 // Items with quantity = 0
        }
      }
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed test data' }, { status: 500 });
  }
}
