import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminMiddleware';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, OtherFidget } from '@/models';
import { Op } from 'sequelize';

// GET /api/admin/inventory - Get inventory overview
async function handler(req: NextRequest) {
  try {
    
    const { searchParams } = new URL(req.url);
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '10');
    const category = searchParams.get('category'); // 'colors', 'keycaps', 'switches', 'prebuilt', 'other-fidgets', 'all'
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    // Build where clause for search
    const searchWhere = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ]
    } : {};

    // Get inventory data based on category - using optimized individual queries
    let inventoryData: any = {};

    if (category === 'all' || category === 'bases' || !category) {
      const colors = await FidgiColor.findAll({
        where: { isActive: true, ...searchWhere },
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'name', 'colorHex', 'price', 'cost', 'quantity', 'isActive', 'imageUrl', 'images', 'createdAt', 'updatedAt'],
      });
      
      // Debug: Log quantities for bases
      console.log('=== BASES DEBUG ===');
      console.log('Low stock threshold:', lowStockThreshold);
      colors.forEach((color, index) => {
        console.log(`Base ${index + 1}: ${color.name} - Quantity: ${color.quantity}`);
      });
      
      const lowStockBases = colors.filter(c => c.quantity <= lowStockThreshold);
      const outOfStockBases = colors.filter(c => c.quantity === 0);
      
      console.log(`Bases - Total: ${colors.length}, Low Stock: ${lowStockBases.length}, Out of Stock: ${outOfStockBases.length}`);
      
      inventoryData.bases = {
        items: colors,
        total: colors.length,
        lowStock: lowStockBases.length,
        outOfStock: outOfStockBases.length,
        totalValue: colors.reduce((sum, c) => sum + ((c.price || 0) * (c.quantity || 0)), 0),
      };
    }

    if (category === 'all' || category === 'keycaps' || !category) {
      const keycaps = await KeycapDesign.findAll({
        where: { isActive: true, ...searchWhere },
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'name', 'price', 'cost', 'quantity', 'isActive', 'imageUrl', 'images', 'category', 'createdAt', 'updatedAt'],
      });
      
      // Debug: Log quantities for keycaps
      console.log('=== KEYCAPS DEBUG ===');
      keycaps.forEach((keycap, index) => {
        console.log(`Keycap ${index + 1}: ${keycap.name} - Quantity: ${keycap.quantity}`);
      });
      
      const lowStockKeycaps = keycaps.filter(k => k.quantity <= lowStockThreshold);
      const outOfStockKeycaps = keycaps.filter(k => k.quantity === 0);
      
      console.log(`Keycaps - Total: ${keycaps.length}, Low Stock: ${lowStockKeycaps.length}, Out of Stock: ${outOfStockKeycaps.length}`);
      
      inventoryData.keycaps = {
        items: keycaps,
        total: keycaps.length,
        lowStock: lowStockKeycaps.length,
        outOfStock: outOfStockKeycaps.length,
        totalValue: keycaps.reduce((sum, k) => sum + ((k.price || 0) * (k.quantity || 0)), 0),
      };
    }

    if (category === 'all' || category === 'switches' || !category) {
      const switches = await SwitchType.findAll({
        where: { isActive: true, ...searchWhere },
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'name', 'description', 'price', 'cost', 'quantity', 'isActive', 'imageUrl', 'images', 'createdAt', 'updatedAt'],
      });
      
      // Debug: Log quantities for switches
      console.log('=== SWITCHES DEBUG ===');
      switches.forEach((switchType, index) => {
        console.log(`Switch ${index + 1}: ${switchType.name} - Quantity: ${switchType.quantity}`);
      });
      
      const lowStockSwitches = switches.filter(s => s.quantity <= lowStockThreshold);
      const outOfStockSwitches = switches.filter(s => s.quantity === 0);
      
      console.log(`Switches - Total: ${switches.length}, Low Stock: ${lowStockSwitches.length}, Out of Stock: ${outOfStockSwitches.length}`);
      
      inventoryData.switches = {
        items: switches,
        total: switches.length,
        lowStock: lowStockSwitches.length,
        outOfStock: outOfStockSwitches.length,
        totalValue: switches.reduce((sum, s) => sum + ((s.price || 0) * (s.quantity || 0)), 0),
      };
    }

    if (category === 'all' || category === 'prebuilt' || !category) {
      // First, let's try a simple query to see if we get any prebuilt items
      const prebuiltCount = await PrebuiltFidgi.count({ where: { isActive: true, ...searchWhere } });
      console.log('Prebuilt items count:', prebuiltCount);
      
      const prebuilt = await PrebuiltFidgi.findAll({
        where: { isActive: true, ...searchWhere },
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'name', 'description', 'price', 'cost', 'originalPrice', 'discount', 'isActive', 'isFeatured', 'imageUrl', 'images', 'tags', 'fidgiColorId', 'keycapId', 'switchId', 'createdAt', 'updatedAt'],
        include: [
          {
            model: FidgiColor,
            as: 'fidgiColor',
            attributes: ['id', 'name', 'quantity', 'isActive']
          },
          {
            model: KeycapDesign,
            as: 'keycap',
            attributes: ['id', 'name', 'quantity', 'isActive']
          },
          {
            model: SwitchType,
            as: 'switch',
            attributes: ['id', 'name', 'quantity', 'isActive']
          }
        ]
      });
      
      // Debug: Check if associations are working
      console.log('Prebuilt items with associations:', prebuilt.length);
      if (prebuilt.length > 0) {
        console.log('First prebuilt item structure:', JSON.stringify(prebuilt[0], null, 2));
      }
      
      // Calculate stock status for prebuilt items based on component availability
      const prebuiltWithStockStatus = await Promise.all(prebuilt.map(async (item) => {
        let fidgiColorQty = 0;
        let keycapQty = 0;
        let switchQty = 0;
        
        // If associations didn't work, fetch component data manually
        if (!(item as any).fidgiColor || !(item as any).keycap || !(item as any).switch) {
          console.log('Associations not working, fetching components manually for:', item.name);
          
          try {
            const [fidgiColor, keycap, switchType] = await Promise.all([
              FidgiColor.findByPk(item.fidgiColorId, { attributes: ['quantity'] }),
              KeycapDesign.findByPk(item.keycapId, { attributes: ['quantity'] }),
              SwitchType.findByPk(item.switchId, { attributes: ['quantity'] })
            ]);
            
            fidgiColorQty = fidgiColor?.quantity || 0;
            keycapQty = keycap?.quantity || 0;
            switchQty = switchType?.quantity || 0;
          } catch (error) {
            console.error('Error fetching component data:', error);
          }
        } else {
          fidgiColorQty = (item as any).fidgiColor?.quantity || 0;
          keycapQty = (item as any).keycap?.quantity || 0;
          switchQty = (item as any).switch?.quantity || 0;
        }
        
        const isOutOfStock = (fidgiColorQty === 0) || (keycapQty === 0) || (switchQty === 0);
        const hasLowStock = (fidgiColorQty <= 10) || (keycapQty <= 10) || (switchQty <= 10);
        
        // Additional debug: Check if any component is exactly at the threshold
        const componentsAtThreshold = [
          { name: 'fidgiColor', qty: fidgiColorQty, isLow: fidgiColorQty <= 10, isOut: fidgiColorQty === 0 },
          { name: 'keycap', qty: keycapQty, isLow: keycapQty <= 10, isOut: keycapQty === 0 },
          { name: 'switch', qty: switchQty, isLow: switchQty <= 10, isOut: switchQty === 0 }
        ];
        
        console.log(`  Component details:`, componentsAtThreshold);
        
        // Debug logging
        console.log(`Prebuilt ${item.name}:`, {
          fidgiColor: fidgiColorQty,
          keycap: keycapQty,
          switch: switchQty,
          isOutOfStock,
          hasLowStock
        });
        
        return {
          ...item,
          isOutOfStock,
          hasLowStock
        };
      }));

      // Debug: Show detailed breakdown of each item's status
      console.log('=== DETAILED STOCK ANALYSIS ===');
      prebuiltWithStockStatus.forEach((item, index) => {
        console.log(`Item ${index + 1}: ${item.name}`);
        console.log(`  - isOutOfStock: ${item.isOutOfStock}`);
        console.log(`  - hasLowStock: ${item.hasLowStock}`);
        console.log(`  - Will be counted as: ${item.isOutOfStock ? 'OUT OF STOCK' : (item.hasLowStock ? 'LOW STOCK' : 'AVAILABLE')}`);
      });

      const lowStockCount = prebuiltWithStockStatus.filter(item => item.hasLowStock && !item.isOutOfStock).length;
      const outOfStockCount = prebuiltWithStockStatus.filter(item => item.isOutOfStock).length;
      const availableCount = prebuiltWithStockStatus.filter(item => !item.hasLowStock && !item.isOutOfStock).length;

      console.log(`=== FINAL STOCK COUNTS ===`);
      console.log(`Total items: ${prebuilt.length}`);
      console.log(`Available: ${availableCount}`);
      console.log(`Low Stock: ${lowStockCount}`);
      console.log(`Out of Stock: ${outOfStockCount}`);

      inventoryData.prebuilt = {
        items: prebuilt,
        total: prebuilt.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalValue: prebuilt.reduce((sum, p) => sum + (p.price || 0), 0), // Prebuilt items are unique
      };
    }

    if (category === 'all' || category === 'other-fidgets' || !category) {
      const otherFidgets = await OtherFidget.findAll({
        where: { isActive: true, ...searchWhere },
        order: [[sortBy, sortOrder]],
        attributes: ['id', 'name', 'description', 'price', 'cost', 'quantity', 'isActive', 'isFeatured', 'imageUrl', 'images', 'category', 'tags', 'createdAt', 'updatedAt'],
      });
      
      // Debug: Log quantities for other fidgets
      console.log('=== OTHER FIDGETS DEBUG ===');
      otherFidgets.forEach((fidget, index) => {
        console.log(`Other Fidget ${index + 1}: ${fidget.name} - Quantity: ${fidget.quantity}`);
      });
      
      const lowStockOtherFidgets = otherFidgets.filter(f => f.quantity <= lowStockThreshold && f.quantity > 0);
      const outOfStockOtherFidgets = otherFidgets.filter(f => f.quantity === 0);
      
      console.log(`Other Fidgets - Total: ${otherFidgets.length}, Low Stock: ${lowStockOtherFidgets.length}, Out of Stock: ${outOfStockOtherFidgets.length}`);
      
      inventoryData.otherFidgets = {
        items: otherFidgets,
        total: otherFidgets.length,
        lowStock: lowStockOtherFidgets.length,
        outOfStock: outOfStockOtherFidgets.length,
        totalValue: otherFidgets.reduce((sum, f) => sum + ((f.price || 0) * (f.quantity || 0)), 0),
      };
    }

    // Calculate overall summary
    const allCategories = Object.values(inventoryData);
    const totalItems = allCategories.reduce((sum: number, cat: any) => sum + (cat?.total || 0), 0);
    const totalLowStock = allCategories.reduce((sum: number, cat: any) => sum + (cat?.lowStock || 0), 0);
    const totalOutOfStock = allCategories.reduce((sum: number, cat: any) => sum + (cat?.outOfStock || 0), 0);
    const totalValue = allCategories.reduce((sum: number, cat: any) => sum + (cat?.totalValue || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        ...inventoryData,
        summary: {
          totalItems,
          totalLowStock,
          totalOutOfStock,
          totalValue,
          lowStockThreshold,
        },
      },
    });
  } catch (error) {
    console.error('Admin inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/inventory - Update inventory quantities
async function updateHandler(req: NextRequest) {
  try {
    
    const body = await req.json();
    const { updates } = body; // Array of { type, id, quantity }

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates must be an array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const update of updates) {
      const { type, id, quantity } = update;

      if (typeof quantity !== 'number' || quantity < 0) {
        results.push({ type, id, success: false, error: 'Invalid quantity' });
        continue;
      }

      try {
        let model;
        switch (type) {
          case 'base':
            model = FidgiColor;
            break;
          case 'keycap':
            model = KeycapDesign;
            break;
          case 'switch':
            model = SwitchType;
            break;
          case 'other-fidget':
            model = OtherFidget;
            break;
          default:
            results.push({ type, id, success: false, error: 'Invalid type' });
            continue;
        }

        const item = await model.findByPk(id);
        if (!item) {
          results.push({ type, id, success: false, error: 'Item not found' });
          continue;
        }

        await item.update({ quantity });
        results.push({ type, id, success: true, newQuantity: quantity });
      } catch (error) {
        results.push({ type, id, success: false, error: 'Update failed' });
      }
    }

    return NextResponse.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
export const PUT = withAdminAuth(updateHandler);
