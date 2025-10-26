import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, ItemImage } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding multiple images to existing items...');

    // Get all existing items
    const colors = await FidgiColor.findAll();
    const keycaps = await KeycapDesign.findAll();
    const switches = await SwitchType.findAll();
    const prebuilt = await PrebuiltFidgi.findAll();

    // Add multiple images to each color
    for (const color of colors) {
      const images = [
        `https://placehold.net/400x400/${color.colorHex?.replace('#', '') || '000000'}/ffffff?text=${encodeURIComponent(color.name)}`,
        `https://placehold.net/400x400/${color.colorHex?.replace('#', '') || '000000'}/ffffff?text=${encodeURIComponent(color.name)}+2`,
        `https://placehold.net/400x400/${color.colorHex?.replace('#', '') || '000000'}/ffffff?text=${encodeURIComponent(color.name)}+3`
      ];

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
    }

    // Add multiple images to each keycap
    for (const keycap of keycaps) {
      const images = [
        `https://placehold.net/400x400/cc6600/ffffff?text=${encodeURIComponent(keycap.name)}`,
        `https://placehold.net/400x400/ff6600/ffffff?text=${encodeURIComponent(keycap.name)}+2`,
        `https://placehold.net/400x400/0066cc/ffffff?text=${encodeURIComponent(keycap.name)}+3`
      ];

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
    }

    // Add multiple images to each switch
    for (const switchType of switches) {
      const images = [
        `https://placehold.net/400x400/666666/ffffff?text=${encodeURIComponent(switchType.name)}`,
        `https://placehold.net/400x400/999999/ffffff?text=${encodeURIComponent(switchType.name)}+2`,
        `https://placehold.net/400x400/cccccc/ffffff?text=${encodeURIComponent(switchType.name)}+3`
      ];

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
    }

    // Add multiple images to each prebuilt item
    for (const prebuiltItem of prebuilt) {
      const images = [
        `https://placehold.net/600x400/00aa00/ffffff?text=${encodeURIComponent(prebuiltItem.name)}`,
        `https://placehold.net/600x400/0066cc/ffffff?text=${encodeURIComponent(prebuiltItem.name)}+2`,
        `https://placehold.net/600x400/ff6600/ffffff?text=${encodeURIComponent(prebuiltItem.name)}+3`
      ];

      for (let i = 0; i < images.length; i++) {
        await ItemImage.create({
          itemId: prebuiltItem.id,
          itemType: 'prebuiltFidgi',
          imageUrl: images[i],
          altText: `${prebuiltItem.name} image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i
        });
      }
    }

    console.log('Multiple images added successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Multiple images added to all items',
      data: {
        colorsUpdated: colors.length,
        keycapsUpdated: keycaps.length,
        switchesUpdated: switches.length,
        prebuiltUpdated: prebuilt.length,
        totalImagesAdded: (colors.length + keycaps.length + switches.length + prebuilt.length) * 3
      }
    });
  } catch (error) {
    console.error('Error adding multiple images:', error);
    return NextResponse.json({ success: false, error: 'Failed to add multiple images' }, { status: 500 });
  }
}
