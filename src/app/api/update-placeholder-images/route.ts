import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Updating placeholder images to use placehold.net...');

    // Update FidgiColor images
    const fidgiColors = await FidgiColor.findAll();
    for (const color of fidgiColors) {
      const newImageUrl = `https://placehold.net/400x400/${color.colorHex?.replace('#', '') || '000000'}/ffffff?text=${encodeURIComponent(color.name)}`;
      await color.update({ imageUrl: newImageUrl });
      console.log(`Updated FidgiColor ${color.name}: ${newImageUrl}`);
    }

    // Update KeycapDesign images
    const keycaps = await KeycapDesign.findAll();
    for (const keycap of keycaps) {
      const newImageUrl = `https://placehold.net/400x400/0066cc/ffffff?text=${encodeURIComponent(keycap.name)}`;
      await keycap.update({ imageUrl: newImageUrl });
      console.log(`Updated KeycapDesign ${keycap.name}: ${newImageUrl}`);
    }

    // Update SwitchType images
    const switches = await SwitchType.findAll();
    for (const switchType of switches) {
      const newImageUrl = `https://placehold.net/400x400/ff6600/ffffff?text=${encodeURIComponent(switchType.name)}`;
      await switchType.update({ imageUrl: newImageUrl });
      console.log(`Updated SwitchType ${switchType.name}: ${newImageUrl}`);
    }

    // Update PrebuiltFidgi images
    const prebuiltItems = await PrebuiltFidgi.findAll();
    for (const prebuilt of prebuiltItems) {
      const newImageUrl = `https://placehold.net/600x400/00aa00/ffffff?text=${encodeURIComponent(prebuilt.name)}`;
      await prebuilt.update({ imageUrl: newImageUrl });
      console.log(`Updated PrebuiltFidgi ${prebuilt.name}: ${newImageUrl}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All placeholder images updated successfully',
      data: {
        fidgiColorsUpdated: fidgiColors.length,
        keycapsUpdated: keycaps.length,
        switchesUpdated: switches.length,
        prebuiltUpdated: prebuiltItems.length
      }
    });
  } catch (error) {
    console.error('Error updating placeholder images:', error);
    return NextResponse.json({ success: false, error: 'Failed to update placeholder images' }, { status: 500 });
  }
}
