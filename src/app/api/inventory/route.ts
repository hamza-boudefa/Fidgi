import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/inventory - Get inventory status for all products
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '10');
    
    const [colors, keycaps, switches] = await Promise.all([
      FidgiColor.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
      }),
      KeycapDesign.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
      }),
      SwitchType.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
      }),
    ]);

    // Calculate low stock items
    const lowStockColors = colors.filter(color => color.quantity <= lowStockThreshold);
    const lowStockKeycaps = keycaps.filter(keycap => keycap.quantity <= lowStockThreshold);
    const lowStockSwitches = switches.filter(switchType => switchType.quantity <= lowStockThreshold);

    const inventory = {
      colors: {
        total: colors.length,
        lowStock: lowStockColors.length,
        items: colors,
      },
      keycaps: {
        total: keycaps.length,
        lowStock: lowStockKeycaps.length,
        items: keycaps,
      },
      switches: {
        total: switches.length,
        lowStock: lowStockSwitches.length,
        items: switches,
      },
      summary: {
        totalItems: colors.length + keycaps.length + switches.length,
        totalLowStock: lowStockColors.length + lowStockKeycaps.length + lowStockSwitches.length,
        lowStockThreshold,
      },
    };

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
