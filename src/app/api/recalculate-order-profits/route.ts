import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi } from '@/models';
import { QueryTypes } from 'sequelize';
import sequelize from '@/config/database';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting order profit recalculation...');
    
    // Get all orders with their items
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: FidgiColor, as: 'fidgiColor' },
            { model: KeycapDesign, as: 'keycap' },
            { model: SwitchType, as: 'switch' },
            { model: PrebuiltFidgi, as: 'prebuiltFidgi' },
          ],
        },
      ],
    });

    console.log(`Found ${orders.length} orders to recalculate`);

    let updatedOrders = 0;
    let updatedItems = 0;

    for (const order of orders) {
      let orderTotalCost = 0;
      let orderTotalProfit = 0;
      let hasUpdates = false;

      for (const item of (order as any).items) {
        let newUnitCost = 0;
        let newTotalCost = 0;
        let newProfit = 0;

        if (item.type === 'custom') {
          // Calculate cost from components
          const fidgiCost = parseFloat(String(item.fidgiColor?.cost || 0));
          const keycapCost = parseFloat(String(item.keycap?.cost || 0));
          const switchCost = parseFloat(String(item.switch?.cost || 0));
          
          newUnitCost = fidgiCost + keycapCost + switchCost;
          newTotalCost = newUnitCost * item.quantity;
          newProfit = item.totalPrice - newTotalCost;
        } else if (item.type === 'prebuilt') {
          // For prebuilt items, get cost from components
          if (item.prebuiltFidgi) {
            const [prebuiltResult] = await sequelize.query(`
              SELECT 
                fc.cost as fidgi_color_cost,
                kd.cost as keycap_cost,
                st.cost as switch_cost
              FROM prebuilt_fidgis p
              LEFT JOIN fidgi_colors fc ON p."fidgiColorId" = fc.id
              LEFT JOIN keycap_designs kd ON p."keycapId" = kd.id
              LEFT JOIN switch_types st ON p."switchId" = st.id
              WHERE p.id = :prebuiltFidgiId
            `, {
              replacements: { prebuiltFidgiId: item.prebuiltFidgi.id },
              type: QueryTypes.SELECT
            });

            if (prebuiltResult) {
              const prebuiltData = prebuiltResult as any;
              const fidgiCost = parseFloat(prebuiltData.fidgi_color_cost || 0);
              const keycapCost = parseFloat(prebuiltData.keycap_cost || 0);
              const switchCost = parseFloat(prebuiltData.switch_cost || 0);
              
              newUnitCost = fidgiCost + keycapCost + switchCost;
              newTotalCost = newUnitCost * item.quantity;
              newProfit = item.totalPrice - newTotalCost;
            }
          }
        }

        // Update item if costs changed
        if (newUnitCost !== item.unitCost || newTotalCost !== item.totalCost || newProfit !== item.profit) {
          await item.update({
            unitCost: newUnitCost,
            totalCost: newTotalCost,
            profit: newProfit,
          });
          updatedItems++;
          hasUpdates = true;
        }

        orderTotalCost += newTotalCost;
        orderTotalProfit += newProfit;
      }

      // Update order totals if any items were updated
      if (hasUpdates) {
        await order.update({
          totalCost: orderTotalCost,
          totalProfit: orderTotalProfit,
        });
        updatedOrders++;
      }
    }

    console.log(`Recalculation complete: ${updatedOrders} orders, ${updatedItems} items updated`);

    return NextResponse.json({
      success: true,
      message: `Recalculated profits for ${updatedOrders} orders and ${updatedItems} items`,
      data: {
        updatedOrders,
        updatedItems,
        totalOrders: orders.length,
      },
    });
  } catch (error) {
    console.error('Error recalculating order profits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to recalculate order profits' },
      { status: 500 }
    );
  }
}
