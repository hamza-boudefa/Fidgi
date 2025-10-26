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

// GET /api/products/other-fidgets - Get all other fidgets
export async function GET(request: NextRequest) {
  try {
    await initDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    
    const whereClause: any = {};
    if (activeOnly) whereClause.isActive = true;
    if (featured) whereClause.isFeatured = true;
    if (category) whereClause.category = category;
    if (tag) whereClause.tags = { [require('sequelize').Op.contains]: [tag] };
    
    const otherFidgets = await OtherFidget.findAll({
      where: whereClause,
      order: [['isFeatured', 'DESC'], ['name', 'ASC']],
    });

    return NextResponse.json({
      success: true,
      data: otherFidgets,
      count: otherFidgets.length,
    });
  } catch (error) {
    console.error('Error fetching other fidgets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch other fidgets' },
      { status: 500 }
    );
  }
}

// POST /api/products/other-fidgets - Create new other fidget
export async function POST(request: NextRequest) {
  try {
    await initDB();
    
    const body = await request.json();
    const {
      name,
      description,
      price,
      cost = 0,
      quantity = 0,
      imageUrl,
      images = [],
      category,
      isActive = true,
      isFeatured = false,
      tags = [],
    } = body;

    // Validate required fields
    if (!name || !description || !price || !imageUrl || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, price, imageUrl, category' },
        { status: 400 }
      );
    }

    // Validate price and cost are numbers
    if (isNaN(parseFloat(price)) || isNaN(parseFloat(cost))) {
      return NextResponse.json(
        { success: false, error: 'Price and cost must be valid numbers' },
        { status: 400 }
      );
    }

    const otherFidget = await OtherFidget.create({
      name,
      description,
      price: parseFloat(price),
      cost: parseFloat(cost),
      quantity: parseInt(quantity) || 0,
      imageUrl,
      images: Array.isArray(images) ? images : [],
      category,
      isActive,
      isFeatured,
      tags: Array.isArray(tags) ? tags : [],
    });

    return NextResponse.json({
      success: true,
      data: otherFidget,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating other fidget:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create other fidget' },
      { status: 500 }
    );
  }
}
