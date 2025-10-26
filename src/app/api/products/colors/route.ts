import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/colors - Get all colors
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const whereClause = activeOnly ? { isActive: true } : {};
    
    const colors = await FidgiColor.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'colorHex', 'price', 'quantity', 'isActive', 'imageUrl', 'images', 'createdAt', 'updatedAt']
    });

    return NextResponse.json({
      success: true,
      data: colors,
      count: colors.length,
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}

// POST /api/products/colors - Create new color
export async function POST(request: NextRequest) {
  try {
    
    
    const body = await request.json();
    const { name, colorHex, imageUrl, price, quantity, isActive = true } = body;

    // Validate required fields
    if (!name || !colorHex || !imageUrl || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate color hex format
    if (!/^#[0-9A-F]{6}$/i.test(colorHex)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color hex format' },
        { status: 400 }
      );
    }

    const color = await FidgiColor.create({
      name,
      colorHex,
      imageUrl,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      isActive,
    });

    return NextResponse.json({
      success: true,
      data: color,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create color' },
      { status: 500 }
    );
  }
}
