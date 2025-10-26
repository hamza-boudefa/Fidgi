import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting manual seeding...');

    // Clear existing data
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });

    console.log('Existing data cleared');

    // Create FidgiColors one by one
    const colors = [];
    const colorData = [
      { name: 'Classic Black', colorHex: '#000000', price: 15.00, cost: 8.00, quantity: 50 },
      { name: 'Ocean Blue', colorHex: '#0066CC', price: 18.00, cost: 9.00, quantity: 30 },
      { name: 'Fire Red', colorHex: '#FF0000', price: 20.00, cost: 10.00, quantity: 5 },
      { name: 'Forest Green', colorHex: '#228B22', price: 18.00, cost: 9.00, quantity: 25 },
      { name: 'Sunset Orange', colorHex: '#FF6600', price: 20.00, cost: 10.00, quantity: 0 },
    ];

    for (const colorInfo of colorData) {
      const color = await FidgiColor.create({
        ...colorInfo,
        imageUrl: `https://placehold.net/400x400/${colorInfo.colorHex.substring(1)}/ffffff?text=${encodeURIComponent(colorInfo.name)}`,
        isActive: true,
      });
      colors.push(color);
      console.log(`Created color: ${color.name}`);
    }

    // Create KeycapDesigns one by one
    const keycaps = [];
    const keycapData = [
      { name: 'Avengers', price: 8.00, cost: 3.00, quantity: 100, category: 'superhero' },
      { name: 'Black Panther', price: 8.00, cost: 3.00, quantity: 80, category: 'superhero' },
      { name: 'Captain America', price: 8.00, cost: 3.00, quantity: 90, category: 'superhero' },
      { name: 'Hulk', price: 8.00, cost: 3.00, quantity: 75, category: 'superhero' },
      { name: 'Iron Man', price: 8.00, cost: 3.00, quantity: 85, category: 'superhero' },
      { name: 'Thor', price: 8.00, cost: 3.00, quantity: 2, category: 'superhero' },
      { name: 'Spider-Man', price: 8.00, cost: 3.00, quantity: 0, category: 'superhero' },
    ];

    for (const keycapInfo of keycapData) {
      const keycap = await KeycapDesign.create({
        ...keycapInfo,
        imageUrl: `https://placehold.net/400x400/cc6600/ffffff?text=${encodeURIComponent(keycapInfo.name)}`,
        isActive: true,
      });
      keycaps.push(keycap);
      console.log(`Created keycap: ${keycap.name}`);
    }

    // Create SwitchTypes one by one
    const switches = [];
    const switchData = [
      { name: 'Silent', description: 'Soft and quiet feel', price: 0.00, cost: 2.00, quantity: 200 },
      { name: 'Clicky', description: 'Crisp tactile click', price: 0.00, cost: 2.00, quantity: 200 },
      { name: 'Linear', description: 'Smooth linear feel', price: 0.00, cost: 2.00, quantity: 15 },
      { name: 'Tactile', description: 'Tactile feedback', price: 0.00, cost: 2.00, quantity: 0 },
    ];

    for (const switchInfo of switchData) {
      const switchType = await SwitchType.create({
        ...switchInfo,
        imageUrl: `https://placehold.net/400x400/666666/ffffff?text=${encodeURIComponent(switchInfo.name)}`,
        isActive: true,
      });
      switches.push(switchType);
      console.log(`Created switch: ${switchType.name}`);
    }

    // Create PrebuiltFidgis one by one
    const prebuiltData = [
      {
        name: 'Avengers Classic',
        description: 'Classic black Fidgi with Avengers keycap and silent switch',
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
      },
      {
        name: 'Iron Man Special',
        description: 'Ocean blue Fidgi with Iron Man keycap and clicky switch',
        fidgiColorId: colors[1].id,
        keycapId: keycaps[4].id,
        switchId: switches[1].id,
        price: 24.00,
        cost: 14.00,
        originalPrice: 26.00,
        discount: 7.69,
        isActive: true,
        isFeatured: true,
        tags: ['iron-man', 'blue', 'clicky'],
      },
      {
        name: 'Hulk Smash',
        description: 'Forest green Fidgi with Hulk keycap and clicky switch',
        fidgiColorId: colors[3].id,
        keycapId: keycaps[3].id,
        switchId: switches[1].id,
        price: 24.00,
        cost: 14.00,
        originalPrice: 26.00,
        discount: 7.69,
        isActive: true,
        isFeatured: false,
        tags: ['hulk', 'green', 'clicky'],
      },
    ];

    const prebuilts = [];
    for (const prebuiltInfo of prebuiltData) {
      const prebuilt = await PrebuiltFidgi.create({
        ...prebuiltInfo,
        imageUrl: `https://placehold.net/600x400/000000/ffffff?text=${encodeURIComponent(prebuiltInfo.name)}`,
      });
      prebuilts.push(prebuilt);
      console.log(`Created prebuilt: ${prebuilt.name}`);
    }

    console.log('Manual seeding completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with manual approach',
      data: {
        colors: colors.length,
        keycaps: keycaps.length,
        switches: switches.length,
        prebuilts: prebuilts.length,
        stockLevels: {
          goodStock: colors.filter(c => c.quantity > 10).length + 
                    keycaps.filter(k => k.quantity > 10).length + 
                    switches.filter(s => s.quantity > 10).length,
          lowStock: colors.filter(c => c.quantity > 0 && c.quantity <= 10).length + 
                   keycaps.filter(k => k.quantity > 0 && k.quantity <= 10).length + 
                   switches.filter(s => s.quantity > 0 && s.quantity <= 10).length,
          outOfStock: colors.filter(c => c.quantity === 0).length + 
                     keycaps.filter(k => k.quantity === 0).length + 
                     switches.filter(s => s.quantity === 0).length
        }
      }
    });
  } catch (error) {
    console.error('Error in manual seeding:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
