import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, ItemImage } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Deleting existing data and seeding with multiple images...');

    // Clear all existing data
    await ItemImage.destroy({ where: {} });
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });

    console.log('Existing data cleared');

    // Create FidgiColors with multiple images
    const colors = [
      {
        name: 'Classic Black',
        colorHex: '#000000',
        price: 15.00,
        cost: 8.00,
        quantity: 45,
        images: [
          'https://placehold.net/400x400/000000/ffffff?text=Classic+Black',
          'https://placehold.net/400x400/333333/ffffff?text=Classic+Black+2',
          'https://placehold.net/400x400/666666/ffffff?text=Classic+Black+3'
        ]
      },
      {
        name: 'Ocean Blue',
        colorHex: '#0066CC',
        price: 18.00,
        cost: 9.00,
        quantity: 5,
        images: [
          'https://placehold.net/400x400/0066cc/ffffff?text=Ocean+Blue',
          'https://placehold.net/400x400/0088ff/ffffff?text=Ocean+Blue+2',
          'https://placehold.net/400x400/00aaff/ffffff?text=Ocean+Blue+3'
        ]
      },
      {
        name: 'Fire Red',
        colorHex: '#FF0000',
        price: 20.00,
        cost: 10.00,
        quantity: 0,
        images: [
          'https://placehold.net/400x400/ff0000/ffffff?text=Fire+Red',
          'https://placehold.net/400x400/ff3333/ffffff?text=Fire+Red+2',
          'https://placehold.net/400x400/ff6666/ffffff?text=Fire+Red+3'
        ]
      },
      {
        name: 'Forest Green',
        colorHex: '#00AA00',
        price: 16.00,
        cost: 8.50,
        quantity: 25,
        images: [
          'https://placehold.net/400x400/00aa00/ffffff?text=Forest+Green',
          'https://placehold.net/400x400/00cc00/ffffff?text=Forest+Green+2',
          'https://placehold.net/400x400/00ee00/ffffff?text=Forest+Green+3'
        ]
      }
    ];

    // Create KeycapDesigns with multiple images
    const keycaps = [
      {
        name: 'Avengers',
        price: 8.00,
        cost: 3.00,
        quantity: 12,
        category: 'superhero',
        images: [
          'https://placehold.net/400x400/cc6600/ffffff?text=Avengers',
          'https://placehold.net/400x400/ff8800/ffffff?text=Avengers+2',
          'https://placehold.net/400x400/ffaa00/ffffff?text=Avengers+3'
        ]
      },
      {
        name: 'Black Panther',
        price: 8.00,
        cost: 3.00,
        quantity: 2,
        category: 'superhero',
        images: [
          'https://placehold.net/400x400/000000/ffffff?text=Black+Panther',
          'https://placehold.net/400x400/333333/ffffff?text=Black+Panther+2',
          'https://placehold.net/400x400/666666/ffffff?text=Black+Panther+3'
        ]
      },
      {
        name: 'Iron Man',
        price: 8.00,
        cost: 3.00,
        quantity: 0,
        category: 'superhero',
        images: [
          'https://placehold.net/400x400/ff6600/ffffff?text=Iron+Man',
          'https://placehold.net/400x400/ff8800/ffffff?text=Iron+Man+2',
          'https://placehold.net/400x400/ffaa00/ffffff?text=Iron+Man+3'
        ]
      },
      {
        name: 'Captain America',
        price: 8.00,
        cost: 3.00,
        quantity: 8,
        category: 'superhero',
        images: [
          'https://placehold.net/400x400/0066cc/ffffff?text=Captain+America',
          'https://placehold.net/400x400/0088ff/ffffff?text=Captain+America+2',
          'https://placehold.net/400x400/00aaff/ffffff?text=Captain+America+3'
        ]
      }
    ];

    // Create SwitchTypes with multiple images
    const switches = [
      {
        name: 'Clicky',
        description: 'Crisp tactile click',
        price: 0.00,
        cost: 2.00,
        quantity: 50,
        images: [
          'https://placehold.net/400x400/666666/ffffff?text=Clicky',
          'https://placehold.net/400x400/888888/ffffff?text=Clicky+2',
          'https://placehold.net/400x400/aaaaaa/ffffff?text=Clicky+3'
        ]
      },
      {
        name: 'Silent',
        description: 'Soft and quiet feel',
        price: 0.00,
        cost: 2.00,
        quantity: 3,
        images: [
          'https://placehold.net/400x400/999999/ffffff?text=Silent',
          'https://placehold.net/400x400/bbbbbb/ffffff?text=Silent+2',
          'https://placehold.net/400x400/dddddd/ffffff?text=Silent+3'
        ]
      },
      {
        name: 'Linear',
        description: 'Smooth linear feel',
        price: 0.00,
        cost: 2.00,
        quantity: 0,
        images: [
          'https://placehold.net/400x400/cccccc/ffffff?text=Linear',
          'https://placehold.net/400x400/eeeeee/ffffff?text=Linear+2',
          'https://placehold.net/400x400/ffffff/000000?text=Linear+3'
        ]
      },
      {
        name: 'Tactile',
        description: 'Tactile feedback',
        price: 0.00,
        cost: 2.00,
        quantity: 15,
        images: [
          'https://placehold.net/400x400/333333/ffffff?text=Tactile',
          'https://placehold.net/400x400/555555/ffffff?text=Tactile+2',
          'https://placehold.net/400x400/777777/ffffff?text=Tactile+3'
        ]
      }
    ];

    // Create items and their images
    const createdColors = [];
    for (const colorData of colors) {
      const { images, ...colorProps } = colorData;
      const color = await FidgiColor.create({
        ...colorProps,
        isActive: true,
        imageUrl: images[0] // Set primary image
      });
      
      // Add multiple images
      for (let i = 0; i < images.length; i++) {
        await ItemImage.create({
          itemId: color.id,
          itemType: 'fidgiColor',
          imageUrl: images[i],
          altText: `${color.name} image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i
        });
      }
      
      createdColors.push(color);
    }

    const createdKeycaps = [];
    for (const keycapData of keycaps) {
      const { images, ...keycapProps } = keycapData;
      const keycap = await KeycapDesign.create({
        ...keycapProps,
        isActive: true,
        imageUrl: images[0] // Set primary image
      });
      
      // Add multiple images
      for (let i = 0; i < images.length; i++) {
        await ItemImage.create({
          itemId: keycap.id,
          itemType: 'keycapDesign',
          imageUrl: images[i],
          altText: `${keycap.name} image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i
        });
      }
      
      createdKeycaps.push(keycap);
    }

    const createdSwitches = [];
    for (const switchData of switches) {
      const { images, ...switchProps } = switchData;
      const switchType = await SwitchType.create({
        ...switchProps,
        isActive: true,
        imageUrl: images[0] // Set primary image
      });
      
      // Add multiple images
      for (let i = 0; i < images.length; i++) {
        await ItemImage.create({
          itemId: switchType.id,
          itemType: 'switchType',
          imageUrl: images[i],
          altText: `${switchType.name} image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i
        });
      }
      
      createdSwitches.push(switchType);
    }

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
        images: [
          'https://placehold.net/600x400/000000/ffffff?text=Hero+Combo',
          'https://placehold.net/600x400/333333/ffffff?text=Hero+Combo+2',
          'https://placehold.net/600x400/666666/ffffff?text=Hero+Combo+3'
        ]
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
        images: [
          'https://placehold.net/600x400/0066cc/ffffff?text=Ocean+Hero',
          'https://placehold.net/600x400/0088ff/ffffff?text=Ocean+Hero+2',
          'https://placehold.net/600x400/00aaff/ffffff?text=Ocean+Hero+3'
        ]
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
        images: [
          'https://placehold.net/600x400/ff0000/ffffff?text=Fire+Storm',
          'https://placehold.net/600x400/ff3333/ffffff?text=Fire+Storm+2',
          'https://placehold.net/600x400/ff6666/ffffff?text=Fire+Storm+3'
        ]
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
        images: [
          'https://placehold.net/600x400/00aa00/ffffff?text=Forest+Captain',
          'https://placehold.net/600x400/00cc00/ffffff?text=Forest+Captain+2',
          'https://placehold.net/600x400/00ee00/ffffff?text=Forest+Captain+3'
        ]
      }
    ];

    const createdPrebuilt = [];
    for (const prebuiltData of prebuiltItems) {
      const { images, ...prebuiltProps } = prebuiltData;
      const prebuilt = await PrebuiltFidgi.create({
        ...prebuiltProps,
        imageUrl: images[0] // Set primary image
      });
      
      // Add multiple images
      for (let i = 0; i < images.length; i++) {
        await ItemImage.create({
          itemId: prebuilt.id,
          itemType: 'prebuiltFidgi',
          imageUrl: images[i],
          altText: `${prebuilt.name} image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i
        });
      }
      
      createdPrebuilt.push(prebuilt);
    }

    console.log('Seeding completed successfully!');
    console.log('Created:', {
      colors: createdColors.length,
      keycaps: createdKeycaps.length,
      switches: createdSwitches.length,
      prebuilt: createdPrebuilt.length
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with multiple images',
      data: {
        colors: createdColors.length,
        keycaps: createdKeycaps.length,
        switches: createdSwitches.length,
        prebuilt: createdPrebuilt.length,
        totalImages: (createdColors.length + createdKeycaps.length + createdSwitches.length + createdPrebuilt.length) * 3,
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
