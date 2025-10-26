import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Deleting existing data and seeding with simple multiple images...');

    // Clear all existing data
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });

    console.log('Existing data cleared');

    // Create FidgiColors
    const colors = [
      {
        name: 'Classic Black',
        colorHex: '#000000',
        price: 15.00,
        cost: 8.00,
        quantity: 45,
        imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Classic+Black'
      },
      {
        name: 'Ocean Blue',
        colorHex: '#0066CC',
        price: 18.00,
        cost: 9.00,
        quantity: 5,
        imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Ocean+Blue'
      },
      {
        name: 'Fire Red',
        colorHex: '#FF0000',
        price: 20.00,
        cost: 10.00,
        quantity: 0,
        imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Fire+Red'
      },
      {
        name: 'Forest Green',
        colorHex: '#00AA00',
        price: 16.00,
        cost: 8.50,
        quantity: 25,
        imageUrl: 'https://placehold.net/400x400/00aa00/ffffff?text=Forest+Green'
      },
      {
        name: 'Sunset Orange',
        colorHex: '#FF6600',
        price: 17.00,
        cost: 9.00,
        quantity: 8,
        imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Sunset+Orange'
      }
    ];

    // Create KeycapDesigns
    const keycaps = [
      {
        name: 'Avengers',
        price: 8.00,
        cost: 3.00,
        quantity: 12,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/cc6600/ffffff?text=Avengers'
      },
      {
        name: 'Black Panther',
        price: 8.00,
        cost: 3.00,
        quantity: 2,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Black+Panther'
      },
      {
        name: 'Iron Man',
        price: 8.00,
        cost: 3.00,
        quantity: 0,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Iron+Man'
      },
      {
        name: 'Captain America',
        price: 8.00,
        cost: 3.00,
        quantity: 8,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Captain+America'
      },
      {
        name: 'Hulk',
        price: 8.00,
        cost: 3.00,
        quantity: 15,
        category: 'superhero',
        imageUrl: 'https://placehold.net/400x400/00aa00/ffffff?text=Hulk'
      }
    ];

    // Create SwitchTypes
    const switches = [
      {
        name: 'Clicky',
        description: 'Crisp tactile click',
        price: 0.00,
        cost: 2.00,
        quantity: 50,
        imageUrl: 'https://placehold.net/400x400/666666/ffffff?text=Clicky'
      },
      {
        name: 'Silent',
        description: 'Soft and quiet feel',
        price: 0.00,
        cost: 2.00,
        quantity: 3,
        imageUrl: 'https://placehold.net/400x400/999999/ffffff?text=Silent'
      },
      {
        name: 'Linear',
        description: 'Smooth linear feel',
        price: 0.00,
        cost: 2.00,
        quantity: 0,
        imageUrl: 'https://placehold.net/400x400/cccccc/ffffff?text=Linear'
      },
      {
        name: 'Tactile',
        description: 'Tactile feedback',
        price: 0.00,
        cost: 2.00,
        quantity: 15,
        imageUrl: 'https://placehold.net/400x400/333333/ffffff?text=Tactile'
      },
      {
        name: 'Heavy',
        description: 'Heavy tactile feel',
        price: 0.00,
        cost: 2.00,
        quantity: 7,
        imageUrl: 'https://placehold.net/400x400/555555/ffffff?text=Heavy'
      }
    ];

    // Create items
    const createdColors = await FidgiColor.bulkCreate(colors.map(c => ({ ...c, isActive: true })));
    const createdKeycaps = await KeycapDesign.bulkCreate(keycaps.map(k => ({ ...k, isActive: true })));
    const createdSwitches = await SwitchType.bulkCreate(switches.map(s => ({ ...s, isActive: true })));

    console.log('Basic items created');

    // Create PrebuiltFidgi items
    const prebuiltItems = [
      {
        name: 'Hero Combo',
        description: 'Black base with Avengers keycap and Clicky switch',
        fidgiColorId: createdColors[0].id,
        keycapId: createdKeycaps[0].id,
        switchId: createdSwitches[0].id,
        price: 25.00,
        cost: 13.00,
        originalPrice: 30.00,
        discount: 16.67,
        isActive: true,
        isFeatured: true,
        tags: ['hero', 'combo'],
        imageUrl: 'https://placehold.net/600x400/000000/ffffff?text=Hero+Combo'
      },
      {
        name: 'Ocean Hero',
        description: 'Ocean Blue base with Black Panther keycap and Silent switch',
        fidgiColorId: createdColors[1].id,
        keycapId: createdKeycaps[1].id,
        switchId: createdSwitches[1].id,
        price: 28.00,
        cost: 14.00,
        originalPrice: 32.00,
        discount: 12.50,
        isActive: true,
        isFeatured: false,
        tags: ['ocean', 'hero'],
        imageUrl: 'https://placehold.net/600x400/0066cc/ffffff?text=Ocean+Hero'
      },
      {
        name: 'Fire Storm',
        description: 'Fire Red base with Iron Man keycap and Linear switch',
        fidgiColorId: createdColors[2].id,
        keycapId: createdKeycaps[2].id,
        switchId: createdSwitches[2].id,
        price: 30.00,
        cost: 15.00,
        originalPrice: 35.00,
        discount: 14.29,
        isActive: true,
        isFeatured: false,
        tags: ['fire', 'storm'],
        imageUrl: 'https://placehold.net/600x400/ff0000/ffffff?text=Fire+Storm'
      },
      {
        name: 'Forest Captain',
        description: 'Forest Green base with Captain America keycap and Tactile switch',
        fidgiColorId: createdColors[3].id,
        keycapId: createdKeycaps[3].id,
        switchId: createdSwitches[3].id,
        price: 26.00,
        cost: 13.50,
        originalPrice: 30.00,
        discount: 13.33,
        isActive: true,
        isFeatured: true,
        tags: ['forest', 'captain'],
        imageUrl: 'https://placehold.net/600x400/00aa00/ffffff?text=Forest+Captain'
      },
      {
        name: 'Sunset Hulk',
        description: 'Sunset Orange base with Hulk keycap and Heavy switch',
        fidgiColorId: createdColors[4].id,
        keycapId: createdKeycaps[4].id,
        switchId: createdSwitches[4].id,
        price: 27.00,
        cost: 14.00,
        originalPrice: 32.00,
        discount: 15.63,
        isActive: true,
        isFeatured: false,
        tags: ['sunset', 'hulk'],
        imageUrl: 'https://placehold.net/600x400/ff6600/ffffff?text=Sunset+Hulk'
      }
    ];

    const createdPrebuilt = await PrebuiltFidgi.bulkCreate(prebuiltItems);

    console.log('Seeding completed successfully!');
    console.log('Created:', {
      colors: createdColors.length,
      keycaps: createdKeycaps.length,
      switches: createdSwitches.length,
      prebuilt: createdPrebuilt.length
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with basic items',
      data: {
        colors: createdColors.length,
        keycaps: createdKeycaps.length,
        switches: createdSwitches.length,
        prebuilt: createdPrebuilt.length,
        stockLevels: {
          goodStock: createdColors.filter(c => c.quantity > 10).length + 
                    createdKeycaps.filter(k => k.quantity > 10).length + 
                    createdSwitches.filter(s => s.quantity > 10).length,
          lowStock: createdColors.filter(c => c.quantity > 0 && c.quantity <= 10).length + 
                   createdKeycaps.filter(k => k.quantity > 0 && k.quantity <= 10).length + 
                   createdSwitches.filter(s => s.quantity > 0 && s.quantity <= 10).length,
          outOfStock: createdColors.filter(c => c.quantity === 0).length + 
                     createdKeycaps.filter(k => k.quantity === 0).length + 
                     createdSwitches.filter(s => s.quantity === 0).length
        }
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
