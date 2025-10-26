import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// GET /api/inventory/low-stock - Get low stock items
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');
    
    const [lowStockColors, lowStockKeycaps, lowStockSwitches] = await Promise.all([
      FidgiColor.findAll({
        where: {
          isActive: true,
          quantity: { [require('sequelize').Op.lte]: threshold },
        },
        order: [['quantity', 'ASC']],
      }),
      KeycapDesign.findAll({
        where: {
          isActive: true,
          quantity: { [require('sequelize').Op.lte]: threshold },
        },
        order: [['quantity', 'ASC']],
      }),
      SwitchType.findAll({
        where: {
          isActive: true,
          quantity: { [require('sequelize').Op.lte]: threshold },
        },
        order: [['quantity', 'ASC']],
      }),
    ]);

    const lowStockItems = [
      ...lowStockColors.map(item => ({ ...item.toJSON(), type: 'color' })),
      ...lowStockKeycaps.map(item => ({ ...item.toJSON(), type: 'keycap' })),
      ...lowStockSwitches.map(item => ({ ...item.toJSON(), type: 'switch' })),
    ].sort((a, b) => a.quantity - b.quantity);

    return NextResponse.json({
      success: true,
      data: {
        items: lowStockItems,
        count: lowStockItems.length,
        threshold,
        summary: {
          colors: lowStockColors.length,
          keycaps: lowStockKeycaps.length,
          switches: lowStockSwitches.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}
