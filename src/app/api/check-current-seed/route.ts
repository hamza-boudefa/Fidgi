import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, ItemImage } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking current database state...');

    const colorCount = await FidgiColor.count();
    const keycapCount = await KeycapDesign.count();
    const switchCount = await SwitchType.count();
    const prebuiltCount = await PrebuiltFidgi.count();
    const imageCount = await ItemImage.count();

    console.log('Current counts:', {
      colors: colorCount,
      keycaps: keycapCount,
      switches: switchCount,
      prebuilt: prebuiltCount,
      images: imageCount
    });

    // Get sample data
    const sampleColor = await FidgiColor.findOne({
      include: [
        {
          model: ItemImage,
          as: 'images',
          where: { itemType: 'fidgiColor' }
        }
      ]
    });

    const sampleKeycap = await KeycapDesign.findOne({
      include: [
        {
          model: ItemImage,
          as: 'images',
          where: { itemType: 'keycapDesign' }
        }
      ]
    });

    const samplePrebuilt = await PrebuiltFidgi.findOne({
      include: [
        {
          model: ItemImage,
          as: 'images',
          where: { itemType: 'prebuiltFidgi' }
        }
      ]
    });

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          colors: colorCount,
          keycaps: keycapCount,
          switches: switchCount,
          prebuilt: prebuiltCount,
          images: imageCount
        },
        samples: {
          color: sampleColor ? {
            id: sampleColor.id,
            name: sampleColor.name,
            imageCount: sampleColor.images?.length || 0,
            images: sampleColor.images || []
          } : null,
          keycap: sampleKeycap ? {
            id: sampleKeycap.id,
            name: sampleKeycap.name,
            imageCount: sampleKeycap.images?.length || 0,
            images: sampleKeycap.images || []
          } : null,
          prebuilt: samplePrebuilt ? {
            id: samplePrebuilt.id,
            name: samplePrebuilt.name,
            imageCount: samplePrebuilt.images?.length || 0,
            images: samplePrebuilt.images || []
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
