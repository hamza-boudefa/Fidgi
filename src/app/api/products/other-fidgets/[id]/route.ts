import { NextRequest, NextResponse } from 'next/server';
import { OtherFidget } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    const { initializeDatabase } = await import('@/models');
    await initializeDatabase();
    dbInitialized = true;
  }
};

// GET /api/products/other-fidgets/[id] - Get specific other fidget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    
    const { id } = await params;
    
    const otherFidget = await OtherFidget.findByPk(id);
    
    if (!otherFidget) {
      return NextResponse.json(
        { success: false, error: 'Other fidget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: otherFidget,
    });
  } catch (error) {
    console.error('Error fetching other fidget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch other fidget' },
      { status: 500 }
    );
  }
}

// PUT /api/products/other-fidgets/[id] - Update specific other fidget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    
    const { id } = await params;
    const body = await request.json();
    
    const otherFidget = await OtherFidget.findByPk(id);
    
    if (!otherFidget) {
      return NextResponse.json(
        { success: false, error: 'Other fidget not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.cost !== undefined) updateData.cost = parseFloat(body.cost);
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity);
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];
    if (body.category !== undefined) updateData.category = body.category;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];

    await otherFidget.update(updateData);

    return NextResponse.json({
      success: true,
      data: otherFidget,
    });
  } catch (error) {
    console.error('Error updating other fidget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update other fidget' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/other-fidgets/[id] - Delete specific other fidget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    
    const { id } = await params;
    
    const otherFidget = await OtherFidget.findByPk(id);
    
    if (!otherFidget) {
      return NextResponse.json(
        { success: false, error: 'Other fidget not found' },
        { status: 404 }
      );
    }

    await otherFidget.destroy();

    return NextResponse.json({
      success: true,
      message: 'Other fidget deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting other fidget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete other fidget' },
      { status: 500 }
    );
  }
}
