import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, Admin, AdminRole } from '../models';
import { hashPassword } from './auth';

export const seedData = async () => {
  try {
    // Clear existing data first to avoid conflicts
    await PrebuiltFidgi.destroy({ where: {} });
    await FidgiColor.destroy({ where: {} });
    await KeycapDesign.destroy({ where: {} });
    await SwitchType.destroy({ where: {} });
    
    // Seed Fidgi Colors
    const fidgiColors = await FidgiColor.bulkCreate([
      {
        name: 'Classic Black',
        colorHex: '#000000',
        imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Classic+Black',
        price: 15.00,
        cost: 8.00,
        quantity: 50,
        isActive: true,
      },
      {
        name: 'Pure White',
        colorHex: '#FFFFFF',
        imageUrl: 'https://placehold.net/400x400/ffffff/000000?text=Pure+White',
        price: 15.00,
        cost: 8.00,
        quantity: 45,
        isActive: true,
      },
      {
        name: 'Ocean Blue',
        colorHex: '#0066CC',
        imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Ocean+Blue',
        price: 18.00,
        cost: 9.00,
        quantity: 30,
        isActive: true,
      },
      {
        name: 'Forest Green',
        colorHex: '#228B22',
        imageUrl: 'https://placehold.net/400x400/228b22/ffffff?text=Forest+Green',
        price: 18.00,
        cost: 9.00,
        quantity: 25,
        isActive: true,
      },
      {
        name: 'Sunset Orange',
        colorHex: '#FF6600',
        imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Sunset+Orange',
        price: 20.00,
        cost: 10.00,
        quantity: 20,
        isActive: true,
      },
      {
        name: 'Fire Red',
        colorHex: '#FF0000',
        imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Fire+Red',
        price: 20.00,
        cost: 10.00,
        quantity: 5,
        isActive: true,
      },
      {
        name: 'Deep Purple',
        colorHex: '#800080',
        imageUrl: 'https://placehold.net/400x400/800080/ffffff?text=Deep+Purple',
        price: 19.00,
        cost: 9.50,
        quantity: 0,
        isActive: true,
      },
    ]);

    // Seed Keycap Designs
    const keycapDesigns = await KeycapDesign.bulkCreate([
      {
        name: 'Avengers',
        imageUrl: 'https://placehold.net/400x400/cc6600/ffffff?text=Avengers',
        price: 8.00,
        cost: 3.00,
        quantity: 100,
        isActive: true,
        category: 'superhero',
      },
      {
        name: 'Black Panther',
        imageUrl: 'https://placehold.net/400x400/000000/ffffff?text=Black+Panther',
        price: 8.00,
        cost: 3.00,
        quantity: 80,
        isActive: true,
        category: 'superhero',
      },
      {
        name: 'Captain America',
        imageUrl: 'https://placehold.net/400x400/0066cc/ffffff?text=Captain+America',
        price: 8.00,
        cost: 3.00,
        quantity: 90,
        isActive: true,
        category: 'superhero',
      },
      {
        name: 'Hulk',
        imageUrl: 'https://placehold.net/400x400/00aa00/ffffff?text=Hulk',
        price: 8.00,
        cost: 3.00,
        quantity: 75,
        isActive: true,
        category: 'superhero',
      },
      {
        name: 'Iron Man',
        imageUrl: 'https://placehold.net/400x400/ff6600/ffffff?text=Iron+Man',
        price: 8.00,
        cost: 3.00,
        quantity: 85,
        isActive: true,
        category: 'superhero',
      },
      {
        name: 'Thor',
        imageUrl: 'https://placehold.net/400x400/ffaa00/ffffff?text=Thor',
        price: 8.00,
        cost: 3.00,
        quantity: 2,
        isActive: true,
        category: 'superhero',
      },
      {
        name: 'Spider-Man',
        imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Spider-Man',
        price: 8.00,
        cost: 3.00,
        quantity: 0,
        isActive: true,
        category: 'superhero',
      },
    ]);

    // Seed Switch Types
    const switchTypes = await SwitchType.bulkCreate([
      {
        name: 'Silent',
        description: 'Soft and quiet feel',
        price: 0.00,
        cost: 2.00,
        quantity: 200,
        isActive: true,
      },
      {
        name: 'Clicky',
        description: 'Crisp tactile click',
        price: 0.00,
        cost: 2.00,
        quantity: 200,
        isActive: true,
      },
      {
        name: 'Linear',
        description: 'Smooth linear feel',
        price: 0.00,
        cost: 2.00,
        quantity: 15,
        isActive: true,
      },
      {
        name: 'Tactile',
        description: 'Tactile feedback',
        price: 0.00,
        cost: 2.00,
        quantity: 0,
        isActive: true,
      },
    ]);

    // Seed Prebuilt Fidgis
    console.log('Creating prebuilt fidgis with IDs:', {
      fidgiColorId: fidgiColors[0].id,
      keycapId: keycapDesigns[0].id,
      switchId: switchTypes[0].id
    });
    
    const prebuiltFidgis = await Promise.all([
      PrebuiltFidgi.create({
        name: 'Avengers Classic',
        description: 'Classic black Fidgi with Avengers keycap and silent switch',
        imageUrl: 'https://placehold.net/600x400/000000/ffffff?text=Avengers+Classic',
        fidgiColorId: fidgiColors[0].id,
        keycapId: keycapDesigns[0].id,
        switchId: switchTypes[0].id,
        price: 20.00,
        cost: 13.00,
        originalPrice: 23.00,
        discount: 13.04,
        isActive: true,
        isFeatured: true,
        tags: ['avengers', 'classic', 'silent'],
      }),
      PrebuiltFidgi.create({
        name: 'Iron Man Special',
        description: 'Ocean blue Fidgi with Iron Man keycap and clicky switch',
        imageUrl: 'https://placehold.net/600x400/0066cc/ffffff?text=Iron+Man+Special',
        fidgiColorId: fidgiColors[2].id,
        keycapId: keycapDesigns[4].id,
        switchId: switchTypes[1].id,
        price: 24.00,
        cost: 14.00,
        originalPrice: 26.00,
        discount: 7.69,
        isActive: true,
        isFeatured: true,
        tags: ['iron-man', 'blue', 'clicky'],
      }),
      PrebuiltFidgi.create({
        name: 'Hulk Smash',
        description: 'Forest green Fidgi with Hulk keycap and clicky switch',
        imageUrl: 'https://placehold.net/600x400/228b22/ffffff?text=Hulk+Smash',
        fidgiColorId: fidgiColors[3].id,
        keycapId: keycapDesigns[3].id,
        switchId: switchTypes[1].id,
        price: 24.00,
        cost: 14.00,
        originalPrice: 26.00,
        discount: 7.69,
        isActive: true,
        isFeatured: false,
        tags: ['hulk', 'green', 'clicky'],
      }),
      PrebuiltFidgi.create({
        name: 'Captain America Shield',
        description: 'Pure white Fidgi with Captain America keycap and linear switch',
        imageUrl: 'https://placehold.net/600x400/ffffff/000000?text=Captain+America+Shield',
        fidgiColorId: fidgiColors[1].id,
        keycapId: keycapDesigns[2].id,
        switchId: switchTypes[2].id,
        price: 23.00,
        cost: 13.00,
        originalPrice: 25.00,
        discount: 8.00,
        isActive: true,
        isFeatured: true,
        tags: ['captain-america', 'white', 'linear'],
      }),
      PrebuiltFidgi.create({
        name: 'Fire Storm',
        description: 'Fire red Fidgi with Spider-Man keycap and tactile switch',
        imageUrl: 'https://placehold.net/600x400/ff0000/ffffff?text=Fire+Storm',
        fidgiColorId: fidgiColors[5].id,
        keycapId: keycapDesigns[6].id,
        switchId: switchTypes[3].id,
        price: 28.00,
        cost: 15.00,
        originalPrice: 30.00,
        discount: 6.67,
        isActive: true,
        isFeatured: false,
        tags: ['spider-man', 'red', 'tactile'],
      }),
    ]);

    // Seed Admin User
    const adminPassword = await hashPassword('admin123');
    const admin = await Admin.create({
      email: 'admin@fidgi.com',
      password: adminPassword,
      name: 'Admin User',
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${fidgiColors.length} Fidgi colors`);
    console.log(`Created ${keycapDesigns.length} keycap designs`);
    console.log(`Created ${switchTypes.length} switch types`);
    console.log(`Created ${prebuiltFidgis.length} prebuilt Fidgis`);
    console.log(`Created admin user: ${admin.email}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
