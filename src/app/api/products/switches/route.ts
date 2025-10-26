import { NextRequest, NextResponse } from 'next/server';
import { SwitchType } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/switches - Get all switches
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const whereClause = activeOnly ? { isActive: true } : {};
    
    const switches = await SwitchType.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    return NextResponse.json({
      success: true,
      data: switches,
      count: switches.length,
    });
  } catch (error) {
    console.error('Error fetching switches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch switches' },
      { status: 500 }
    );
  }
}

// POST /api/products/switches - Create new switch
export async function POST(request: NextRequest) {
  try {
    
    
    const body = await request.json();
    const { name, description, price, quantity, isActive = true } = body;

    // Validate required fields
    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const switchType = await SwitchType.create({
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      isActive,
    });

    return NextResponse.json({
      success: true,
      data: switchType,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating switch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create switch' },
      { status: 500 }
    );
  }
}
