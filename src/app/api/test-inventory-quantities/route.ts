import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, initializeDatabase } from '@/models';

// Test endpoint to check current inventory quantities
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    console.log('Checking current inventory quantities...');

    // Get all active items with their quantities
    const fidgiColors = await FidgiColor.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'quantity'],
      order: [['name', 'ASC']]
    });

    const keycaps = await KeycapDesign.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'quantity'],
      order: [['name', 'ASC']]
    });

    const switches = await SwitchType.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'quantity'],
      order: [['name', 'ASC']]
    });

    console.log('Current inventory quantities:');
    console.log('FidgiColors:', fidgiColors.map(item => ({ id: item.id, name: item.name, quantity: item.getDataValue('quantity') })));
    console.log('Keycaps:', keycaps.map(item => ({ id: item.id, name: item.name, quantity: item.getDataValue('quantity') })));
    console.log('Switches:', switches.map(item => ({ id: item.id, name: item.name, quantity: item.getDataValue('quantity') })));

    return NextResponse.json({
      success: true,
      message: 'Current inventory quantities retrieved',
      data: {
        fidgiColors: fidgiColors.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.getDataValue('quantity') || item.quantity || 0
        })),
        keycaps: keycaps.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.getDataValue('quantity') || item.quantity || 0
        })),
        switches: switches.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.getDataValue('quantity') || item.quantity || 0
        })),
        summary: {
          totalFidgiColors: fidgiColors.length,
          totalKeycaps: keycaps.length,
          totalSwitches: switches.length,
          totalItems: fidgiColors.length + keycaps.length + switches.length
        }
      },
    });
  } catch (error) {
    console.error('Error checking inventory quantities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check inventory quantities' },
      { status: 500 }
    );
  }
}
