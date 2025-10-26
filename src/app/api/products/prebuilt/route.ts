import { NextRequest, NextResponse } from 'next/server';
import { PrebuiltFidgi, FidgiColor, KeycapDesign, SwitchType } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/products/prebuilt - Get all prebuilt Fidgis
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const tag = searchParams.get('tag');
    
    const whereClause: any = {};
    if (activeOnly) whereClause.isActive = true;
    if (featured) whereClause.isFeatured = true;
    if (tag) whereClause.tags = { [require('sequelize').Op.contains]: [tag] };
    
    const prebuiltFidgis = await PrebuiltFidgi.findAll({
      where: whereClause,
      include: [
        { model: FidgiColor, as: 'fidgiColor' },
        { model: KeycapDesign, as: 'keycap' },
        { model: SwitchType, as: 'switch' },
      ],
      order: [['isFeatured', 'DESC'], ['name', 'ASC']],
    });

    return NextResponse.json({
      success: true,
      data: prebuiltFidgis,
      count: prebuiltFidgis.length,
    });
  } catch (error) {
    console.error('Error fetching prebuilt Fidgis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prebuilt Fidgis' },
      { status: 500 }
    );
  }
}

// POST /api/products/prebuilt - Create new prebuilt Fidgi
export async function POST(request: NextRequest) {
  try {
    
    
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
      discount = 0,
      isActive = true,
      isFeatured = false,
      tags = [],
    } = body;

    // Validate required fields
    if (!name || !description || !imageUrl || !fidgiColorId || !keycapId || !switchId || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that referenced components exist
    const [fidgiColor, keycap, switchType] = await Promise.all([
      FidgiColor.findByPk(fidgiColorId),
      KeycapDesign.findByPk(keycapId),
      SwitchType.findByPk(switchId),
    ]);

    if (!fidgiColor || !keycap || !switchType) {
      return NextResponse.json(
        { success: false, error: 'One or more referenced components not found' },
        { status: 400 }
      );
    }

    const prebuiltFidgi = await PrebuiltFidgi.create({
      name,
      description,
      imageUrl,
      fidgiColorId,
      keycapId,
      switchId,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice || price),
      discount: parseFloat(discount),
      isActive,
      isFeatured,
      tags,
    });

    // Fetch the created prebuilt with associations
    const createdPrebuilt = await PrebuiltFidgi.findByPk(prebuiltFidgi.id, {
      include: [
        { model: FidgiColor, as: 'fidgiColor' },
        { model: KeycapDesign, as: 'keycap' },
        { model: SwitchType, as: 'switch' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: createdPrebuilt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating prebuilt Fidgi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prebuilt Fidgi' },
      { status: 500 }
    );
  }
}
