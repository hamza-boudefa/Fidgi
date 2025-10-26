import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';
import { Op } from 'sequelize';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const defaultCostPercentage = parseFloat(searchParams.get('defaultCostPercentage') || '0.4'); // 40% of price by default

    let updatedCount = 0;

    // Update bases (FidgiColor) - set cost to 40% of price if cost is 0 or null
    const bases = await FidgiColor.findAll({
      where: { 
        isActive: true, 
        [Op.or]: [
          { cost: 0 },
          { cost: null },
          { cost: '0' },
          { cost: '0.00' }
        ]
      }
    });
    
    for (const base of bases) {
      const price = Number(base.price) || 0;
      const newCost = price > 0 ? price * defaultCostPercentage : 5; // Minimum cost of 5 TND if price is 0
      await base.update({ cost: newCost });
      updatedCount++;
    }

    // Update keycaps (KeycapDesign) - set cost to 40% of price if cost is 0 or null
    const keycaps = await KeycapDesign.findAll({
      where: { 
        isActive: true, 
        [Op.or]: [
          { cost: 0 },
          { cost: null },
          { cost: '0' },
          { cost: '0.00' }
        ]
      }
    });
    
    for (const keycap of keycaps) {
      const price = Number(keycap.price) || 0;
      const newCost = price > 0 ? price * defaultCostPercentage : 3; // Minimum cost of 3 TND if price is 0
      await keycap.update({ cost: newCost });
      updatedCount++;
    }

    // Update switches (SwitchType) - set cost to 40% of price if cost is 0 or null
    const switches = await SwitchType.findAll({
      where: { 
        isActive: true, 
        [Op.or]: [
          { cost: 0 },
          { cost: null },
          { cost: '0' },
          { cost: '0.00' }
        ]
      }
    });
    
    for (const switchType of switches) {
      const price = Number(switchType.price) || 0;
      const newCost = price > 0 ? price * defaultCostPercentage : 2; // Minimum cost of 2 TND if price is 0
      await switchType.update({ cost: newCost });
      updatedCount++;
    }

    // Update prebuilt items - recalculate cost from components
    const prebuiltItems = await PrebuiltFidgi.findAll({
      where: { isActive: true }
    });
    
    for (const prebuilt of prebuiltItems) {
      // Calculate cost from components
      const calculatedCost = await prebuilt.calculateCostFromComponents();
      await prebuilt.update({ cost: calculatedCost });
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated costs for ${updatedCount} items`,
      data: {
        updatedCount,
        defaultCostPercentage,
        basesUpdated: bases.length,
        keycapsUpdated: keycaps.length,
        switchesUpdated: switches.length,
        prebuiltUpdated: prebuiltItems.length
      }
    });
  } catch (error) {
    console.error('Update costs error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
