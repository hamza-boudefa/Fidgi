import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor } from '@/models';
import { initializeDatabase } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/colors/[id] - Get specific color
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const color = await FidgiColor.findByPk(id);
    
    if (!color) {
      return NextResponse.json(
        { success: false, error: 'Color not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: color,
    });
  } catch (error) {
    console.error('Error fetching color:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch color' },
      { status: 500 }
    );
  }
}

// PUT /api/products/colors/[id] - Update color
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const color = await FidgiColor.findByPk(id);
    
    if (!color) {
      return NextResponse.json(
        { success: false, error: 'Color not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, colorHex, imageUrl, price, quantity, isActive } = body;

    // Validate color hex format if provided
    if (colorHex && !/^#[0-9A-F]{6}$/i.test(colorHex)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color hex format' },
        { status: 400 }
      );
    }

    await color.update({
      ...(name && { name }),
      ...(colorHex && { colorHex }),
      ...(imageUrl && { imageUrl }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(quantity !== undefined && { quantity: parseInt(quantity) }),
      ...(isActive !== undefined && { isActive }),
    });

    return NextResponse.json({
      success: true,
      data: color,
    });
  } catch (error) {
    console.error('Error updating color:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update color' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/colors/[id] - Delete color
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const color = await FidgiColor.findByPk(id);
    
    if (!color) {
      return NextResponse.json(
        { success: false, error: 'Color not found' },
        { status: 404 }
      );
    }

    await color.destroy();

    return NextResponse.json({
      success: true,
      message: 'Color deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete color' },
      { status: 500 }
    );
  }
}
