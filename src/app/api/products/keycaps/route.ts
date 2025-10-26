import { NextRequest, NextResponse } from 'next/server';
import { KeycapDesign } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/keycaps - Get all keycaps
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const category = searchParams.get('category');
    
    const whereClause: any = {};
    if (activeOnly) whereClause.isActive = true;
    if (category) whereClause.category = category;
    
    const keycaps = await KeycapDesign.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    return NextResponse.json({
      success: true,
      data: keycaps,
      count: keycaps.length,
    });
  } catch (error) {
    console.error('Error fetching keycaps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch keycaps' },
      { status: 500 }
    );
  }
}

// POST /api/products/keycaps - Create new keycap
export async function POST(request: NextRequest) {
  try {
    
    
    const body = await request.json();
    const { name, imageUrl, price, quantity, isActive = true, category = 'default' } = body;

    // Validate required fields
    if (!name || !imageUrl || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const keycap = await KeycapDesign.create({
      name,
      imageUrl,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      isActive,
      category,
    });

    return NextResponse.json({
      success: true,
      data: keycap,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating keycap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create keycap' },
      { status: 500 }
    );
  }
}
