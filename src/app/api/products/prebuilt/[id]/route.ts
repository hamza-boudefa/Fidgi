import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';
import { initializeDatabase } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/prebuilt/[id] - Get specific prebuilt Fidgi
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const prebuiltFidgi = await PrebuiltFidgi.findByPk(id, {
      include: [
        { model: FidgiColor, as: 'fidgiColor' },
        { model: KeycapDesign, as: 'keycap' },
        { model: SwitchType, as: 'switch' },
      ],
    });
    
    if (!prebuiltFidgi) {
      return NextResponse.json(
        { success: false, error: 'Prebuilt Fidgi not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prebuiltFidgi,
    });
  } catch (error) {
    console.error('Error fetching prebuilt Fidgi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prebuilt Fidgi' },
      { status: 500 }
    );
  }
}

// PUT /api/products/prebuilt/[id] - Update prebuilt Fidgi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const prebuiltFidgi = await PrebuiltFidgi.findByPk(id);
    
    if (!prebuiltFidgi) {
      return NextResponse.json(
        { success: false, error: 'Prebuilt Fidgi not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      imageUrl,
      fidgiColorId,
      keycapId,
      switchId,
      price,
      originalPrice,
      discount,
      isActive,
      isFeatured,
      tags,
    } = body;

    // Validate referenced components if provided
    if (fidgiColorId || keycapId || switchId) {
      const [fidgiColor, keycap, switchType] = await Promise.all([
        fidgiColorId ? FidgiColor.findByPk(fidgiColorId) : Promise.resolve(true),
        keycapId ? KeycapDesign.findByPk(keycapId) : Promise.resolve(true),
        switchId ? SwitchType.findByPk(switchId) : Promise.resolve(true),
      ]);

      if (fidgiColorId && !fidgiColor) {
        return NextResponse.json(
          { success: false, error: 'Referenced FidgiColor not found' },
          { status: 400 }
        );
      }
      if (keycapId && !keycap) {
        return NextResponse.json(
          { success: false, error: 'Referenced KeycapDesign not found' },
          { status: 400 }
        );
      }
      if (switchId && !switchType) {
        return NextResponse.json(
          { success: false, error: 'Referenced SwitchType not found' },
          { status: 400 }
        );
      }
    }

    await prebuiltFidgi.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(imageUrl && { imageUrl }),
      ...(fidgiColorId && { fidgiColorId }),
      ...(keycapId && { keycapId }),
      ...(switchId && { switchId }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
      ...(discount !== undefined && { discount: parseFloat(discount) }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(tags && { tags }),
    });

    // Fetch updated prebuilt with associations
    const updatedPrebuilt = await PrebuiltFidgi.findByPk(prebuiltFidgi.id, {
      include: [
        { model: FidgiColor, as: 'fidgiColor' },
        { model: KeycapDesign, as: 'keycap' },
        { model: SwitchType, as: 'switch' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: updatedPrebuilt,
    });
  } catch (error) {
    console.error('Error updating prebuilt Fidgi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prebuilt Fidgi' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/prebuilt/[id] - Delete prebuilt Fidgi
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const prebuiltFidgi = await PrebuiltFidgi.findByPk(id);
    
    if (!prebuiltFidgi) {
      return NextResponse.json(
        { success: false, error: 'Prebuilt Fidgi not found' },
        { status: 404 }
      );
    }

    await prebuiltFidgi.destroy();

    return NextResponse.json({
      success: true,
      message: 'Prebuilt Fidgi deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting prebuilt Fidgi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prebuilt Fidgi' },
      { status: 500 }
    );
  }
}
