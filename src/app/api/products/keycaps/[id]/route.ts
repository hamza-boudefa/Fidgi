import { NextRequest, NextResponse } from 'next/server';
import { KeycapDesign } from '@/models';
import { initializeDatabase } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/keycaps/[id] - Get specific keycap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const keycap = await KeycapDesign.findByPk(id);
    
    if (!keycap) {
      return NextResponse.json(
        { success: false, error: 'Keycap not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: keycap,
    });
  } catch (error) {
    console.error('Error fetching keycap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch keycap' },
      { status: 500 }
    );
  }
}

// PUT /api/products/keycaps/[id] - Update keycap
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const keycap = await KeycapDesign.findByPk(id);
    
    if (!keycap) {
      return NextResponse.json(
        { success: false, error: 'Keycap not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, imageUrl, price, quantity, isActive, category } = body;

    await keycap.update({
      ...(name && { name }),
      ...(imageUrl && { imageUrl }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(quantity !== undefined && { quantity: parseInt(quantity) }),
      ...(isActive !== undefined && { isActive }),
      ...(category && { category }),
    });

    return NextResponse.json({
      success: true,
      data: keycap,
    });
  } catch (error) {
    console.error('Error updating keycap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update keycap' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/keycaps/[id] - Delete keycap
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const keycap = await KeycapDesign.findByPk(id);
    
    if (!keycap) {
      return NextResponse.json(
        { success: false, error: 'Keycap not found' },
        { status: 404 }
      );
    }

    await keycap.destroy();

    return NextResponse.json({
      success: true,
      message: 'Keycap deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting keycap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete keycap' },
      { status: 500 }
    );
  }
}
