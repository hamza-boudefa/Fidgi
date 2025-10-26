import { NextRequest, NextResponse } from 'next/server';
import { SwitchType } from '@/models';


// GET /api/products/switches/[id] - Get specific switch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const switchType = await SwitchType.findByPk(id);
    
    if (!switchType) {
      return NextResponse.json(
        { success: false, error: 'Switch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: switchType,
    });
  } catch (error) {
    console.error('Error fetching switch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch switch' },
      { status: 500 }
    );
  }
}

// PUT /api/products/switches/[id] - Update switch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const switchType = await SwitchType.findByPk(id);
    
    if (!switchType) {
      return NextResponse.json(
        { success: false, error: 'Switch not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, price, quantity, isActive } = body;

    await switchType.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(quantity !== undefined && { quantity: parseInt(quantity) }),
      ...(isActive !== undefined && { isActive }),
    });

    return NextResponse.json({
      success: true,
      data: switchType,
    });
  } catch (error) {
    console.error('Error updating switch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update switch' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/switches/[id] - Delete switch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    
    const { id } = await params;
    const switchType = await SwitchType.findByPk(id);
    
    if (!switchType) {
      return NextResponse.json(
        { success: false, error: 'Switch not found' },
        { status: 404 }
      );
    }

    await switchType.destroy();

    return NextResponse.json({
      success: true,
      message: 'Switch deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting switch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete switch' },
      { status: 500 }
    );
  }
}
