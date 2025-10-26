import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, initializeDatabase, sequelize } from '@/models';
import { OrderStatus } from '@/models/Order';
import { QueryTypes } from 'sequelize';

// Function to re-fetch and update inventory quantities after order validation
async function refreshInventoryAfterOrder(orderId: string) {
  try {
    console.log(`Refreshing inventory after order ${orderId} validation...`);
    
    const orderWithItems = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!orderWithItems) {
      throw new Error(`Order ${orderId} not found for inventory refresh`);
    }

    const items = (orderWithItems as any).items;
    console.log(`Found ${items.length} items to refresh inventory for`);

    // Re-fetch current inventory quantities for all components used in this order
    const inventoryUpdates = [];
    
    for (const item of items) {
      if (item.type === 'custom') {
        // Re-fetch current quantities for custom items
        const fidgiColor = await FidgiColor.findByPk(item.fidgiColorId);
        const keycap = await KeycapDesign.findByPk(item.keycapId);
        const switchType = await SwitchType.findByPk(item.switchId);
        
        inventoryUpdates.push({
          itemId: item.id,
          type: 'custom',
          quantity: item.quantity,
          fidgiColor: { id: item.fidgiColorId, currentQuantity: fidgiColor?.quantity || 0 },
          keycap: { id: item.keycapId, currentQuantity: keycap?.quantity || 0 },
          switch: { id: item.switchId, currentQuantity: switchType?.quantity || 0 },
        });
      } else if (item.type === 'prebuilt') {
        // Re-fetch current quantities for prebuilt items
        const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId);
        if (prebuiltFidgi) {
          const fidgiColor = await FidgiColor.findByPk(prebuiltFidgi.fidgiColorId);
          const keycap = await KeycapDesign.findByPk(prebuiltFidgi.keycapId);
          const switchType = await SwitchType.findByPk(prebuiltFidgi.switchId);
          
          inventoryUpdates.push({
            itemId: item.id,
            type: 'prebuilt',
            quantity: item.quantity,
            prebuiltId: item.prebuiltFidgiId,
            fidgiColor: { id: prebuiltFidgi.fidgiColorId, currentQuantity: fidgiColor?.quantity || 0 },
            keycap: { id: prebuiltFidgi.keycapId, currentQuantity: keycap?.quantity || 0 },
            switch: { id: prebuiltFidgi.switchId, currentQuantity: switchType?.quantity || 0 },
          });
        }
      }
    }

    console.log(`Inventory refresh completed for order ${orderId}:`, inventoryUpdates);
    return inventoryUpdates;
  } catch (error) {
    console.error(`Error refreshing inventory for order ${orderId}:`, error);
    throw error;
  }
}

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    console.log('Initializing database...');
    
    console.log('Database initialized successfully');
    dbInitialized = true;
  } else {
    console.log('Database already initialized');
  }
};

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const whereClause: any = {};
    if (status) whereClause.status = status;
    
    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'type', 'quantity', 'unitPrice', 'totalPrice', 'unitCost', 'totalCost', 'profit', 'fidgiColorId', 'keycapId', 'switchId', 'prebuiltFidgiId'],
          include: [
            { model: FidgiColor, as: 'fidgiColor' },
            { model: KeycapDesign, as: 'keycap' },
            { model: SwitchType, as: 'switch' },
            { 
              model: PrebuiltFidgi, 
              as: 'prebuiltFidgi',
              include: [
                { model: FidgiColor, as: 'fidgiColor', attributes: ['id', 'name', 'cost'] },
                { model: KeycapDesign, as: 'keycap', attributes: ['id', 'name', 'cost'] },
                { model: SwitchType, as: 'switch', attributes: ['id', 'name', 'cost'] },
              ]
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: orders.rows,
      count: orders.count,
      pagination: {
        limit,
        offset,
        total: orders.count,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    console.log('Order creation started');
    
    
    const body = await request.json();
    console.log('Order request body:', JSON.stringify(body, null, 2));
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      customerPostalCode,
      customerNotes,
      items,
      shippingCost = 0,
      source = 'website',
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !customerCity || !customerPostalCode || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate and check inventory for each item
    console.log('Starting item validation for items:', items);
    let totalAmount = 0;
    let totalCost = 0;
    let totalProfit = 0;
    const validatedItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      const { type, fidgiBaseId, keycapId, switchId, prebuiltFidgiId, quantity } = item;

      if (type === 'custom') {
        // Validate custom item components
        console.log('Validating custom components:', { fidgiBaseId, keycapId, switchId });
        const [fidgiBase, keycap, switchType] = await Promise.all([
          FidgiColor.findByPk(fidgiBaseId, { attributes: ['id', 'name', 'price', 'cost', 'quantity', 'isActive'] }),
          KeycapDesign.findByPk(keycapId, { attributes: ['id', 'name', 'price', 'cost', 'quantity', 'isActive'] }),
          SwitchType.findByPk(switchId, { attributes: ['id', 'name', 'description', 'price', 'cost', 'quantity', 'isActive'] }),
        ]);

        console.log('Found components:', { 
          fidgiBase: fidgiBase ? { id: fidgiBase.id, name: fidgiBase.name, price: fidgiBase.price } : null,
          keycap: keycap ? { id: keycap.id, name: keycap.name, price: keycap.price } : null,
          switchType: switchType ? { id: switchType.id, name: switchType.name, price: switchType.price } : null
        });

        if (!fidgiBase || !keycap || !switchType) {
          console.log('Missing components:', { fidgiBase, keycap, switchType });
          return NextResponse.json(
            { success: false, error: 'One or more components not found' },
            { status: 400 }
          );
        }

        // Check inventory for all components
        if (fidgiBase.quantity < quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for base color ${fidgiBase.name}` },
            { status: 400 }
          );
        }
        if (keycap.quantity < quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for keycap ${keycap.name}` },
            { status: 400 }
          );
        }
        if (switchType.quantity < quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for switch ${switchType.name}` },
            { status: 400 }
          );
        }

        // Extract prices and costs safely, handling both model instances and plain objects
        const fidgiBasePrice = fidgiBase.price || (fidgiBase as any).get?.('price') || 0;
        const keycapPrice = keycap.price || (keycap as any).get?.('price') || 0;
        const switchPrice = switchType.price || (switchType as any).get?.('price') || 0;
        
        const fidgiBaseCost = fidgiBase.cost || (fidgiBase as any).get?.('cost') || 0;
        const keycapCost = keycap.cost || (keycap as any).get?.('cost') || 0;
        const switchCost = switchType.cost || (switchType as any).get?.('cost') || 0;
        
        console.log('Raw prices and costs:', { 
          fidgiBasePrice, keycapPrice, switchPrice,
          fidgiBaseCost, keycapCost, switchCost
        });
        
        const unitPrice = parseFloat(String(fidgiBasePrice)) + parseFloat(String(keycapPrice)) + parseFloat(String(switchPrice));
        const unitCost = parseFloat(String(fidgiBaseCost)) + parseFloat(String(keycapCost)) + parseFloat(String(switchCost));
        
        if (isNaN(unitPrice) || isNaN(unitCost)) {
          throw new Error(`Invalid price/cost calculation: fidgiBasePrice=${fidgiBasePrice}, keycapPrice=${keycapPrice}, switchPrice=${switchPrice}, fidgiBaseCost=${fidgiBaseCost}, keycapCost=${keycapCost}, switchCost=${switchCost}`);
        }
        
        const itemTotal = unitPrice * quantity;
        const itemCost = unitCost * quantity;
        const itemProfit = itemTotal - itemCost;
        
        totalAmount += itemTotal;
        totalCost += itemCost;
        totalProfit += itemProfit;
        
        console.log('Price calculation:', {
          fidgiBasePrice: fidgiBase.price,
          keycapPrice: keycap.price,
          switchPrice: switchType.price,
          unitPrice,
          quantity,
          itemTotal,
          totalAmount
        });
        
        // Check for NaN values
        if (isNaN(unitPrice) || isNaN(itemTotal)) {
          throw new Error(`Invalid price calculation: fidgiBase.price=${fidgiBase.price}, keycap.price=${keycap.price}, switchType.price=${switchType.price}, unitPrice=${unitPrice}, itemTotal=${itemTotal}`);
        }

        validatedItems.push({
          type: 'custom',
          fidgiColorId: fidgiBaseId, // Fixed: use fidgiColorId instead of fidgiBaseId
          keycapId,
          switchId,
          quantity,
          unitPrice,
          totalPrice: itemTotal,
          unitCost,
          totalCost: itemCost,
          profit: itemProfit,
        });
      } else if (type === 'prebuilt') {
        // Validate prebuilt item using raw SQL to avoid association issues
        const [prebuiltResult] = await sequelize.query(`
          SELECT p.*, 
                 fc.id as fidgi_color_id, fc.name as fidgi_color_name, fc.price as fidgi_color_price, fc.cost as fidgi_color_cost, fc.quantity as fidgi_color_quantity,
                 kd.id as keycap_id, kd.name as keycap_name, kd.price as keycap_price, kd.cost as keycap_cost, kd.quantity as keycap_quantity,
                 st.id as switch_id, st.name as switch_name, st.price as switch_price, st.cost as switch_cost, st.quantity as switch_quantity
          FROM prebuilt_fidgis p
          LEFT JOIN fidgi_colors fc ON p."fidgiColorId" = fc.id
          LEFT JOIN keycap_designs kd ON p."keycapId" = kd.id
          LEFT JOIN switch_types st ON p."switchId" = st.id
          WHERE p.id = :prebuiltFidgiId AND p."isActive" = true
        `, {
          replacements: { prebuiltFidgiId },
          type: QueryTypes.SELECT
        });
        
        const prebuiltFidgi = prebuiltResult as any;

        console.log('Prebuilt item found:', prebuiltFidgi ? {
          id: prebuiltFidgi.id,
          name: prebuiltFidgi.name,
          price: prebuiltFidgi.price,
          fidgiColor: (prebuiltFidgi as any).fidgiColor ? {
            id: (prebuiltFidgi as any).fidgiColor.id,
            name: (prebuiltFidgi as any).fidgiColor.name,
            quantity: (prebuiltFidgi as any).fidgiColor.quantity
          } : null
        } : null);

        if (!prebuiltFidgi) {
          return NextResponse.json(
            { success: false, error: 'Prebuilt Fidgi not found' },
            { status: 400 }
          );
        }

        // Check component availability for all components
        if (prebuiltFidgi.fidgi_color_quantity < quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for base color ${prebuiltFidgi.fidgi_color_name}` },
            { status: 400 }
          );
        }
        if (prebuiltFidgi.keycap_quantity < quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for keycap ${prebuiltFidgi.keycap_name}` },
            { status: 400 }
          );
        }
        if (prebuiltFidgi.switch_quantity < quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for switch ${prebuiltFidgi.switch_name}` },
            { status: 400 }
          );
        }

        const unitPrice = parseFloat(prebuiltFidgi.price);
        // Calculate cost from components if prebuilt cost is 0
        let unitCost = parseFloat(prebuiltFidgi.cost || 0);
        if (unitCost === 0) {
          const fidgiColorCost = parseFloat(prebuiltFidgi.fidgi_color_cost || 0);
          const keycapCost = parseFloat(prebuiltFidgi.keycap_cost || 0);
          const switchCost = parseFloat(prebuiltFidgi.switch_cost || 0);
          unitCost = fidgiColorCost + keycapCost + switchCost;
        }
        const itemTotal = unitPrice * quantity;
        const itemCost = unitCost * quantity;
        const itemProfit = itemTotal - itemCost;
        
        totalAmount += itemTotal;
        totalCost += itemCost;
        totalProfit += itemProfit;
        
        console.log('Prebuilt price calculation:', {
          prebuiltPrice: prebuiltFidgi.price,
          unitPrice,
          quantity,
          itemTotal,
          totalAmount
        });
        
        // Check for NaN values in prebuilt
        if (isNaN(unitPrice) || isNaN(itemTotal)) {
          throw new Error(`Invalid prebuilt price calculation: prebuiltPrice=${prebuiltFidgi.price}, unitPrice=${unitPrice}, itemTotal=${itemTotal}`);
        }

        validatedItems.push({
          type: 'prebuilt',
          prebuiltFidgiId,
          quantity,
          unitPrice,
          totalPrice: itemTotal,
          unitCost,
          totalCost: itemCost,
          profit: itemProfit,
        });
      }
    }

    // Create order
    console.log('Creating order with data:', {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      customerPostalCode,
      customerNotes,
      status: OrderStatus.PENDING,
      totalAmount: totalAmount + shippingCost,
      shippingCost,
    });
    
    // Convert empty email string to null to avoid validation errors
    const processedCustomerEmail = customerEmail && customerEmail.trim() !== '' ? customerEmail : null;

    const order = await Order.create({
      customerName,
      customerPhone,
      customerEmail: processedCustomerEmail,
      customerAddress,
      customerCity,
      customerPostalCode,
      customerNotes,
      status: OrderStatus.PENDING,
      totalAmount: totalAmount + shippingCost,
      totalCost,
      totalProfit,
      shippingCost,
      source,
    });
    
    console.log('Order created, raw object:', order.toJSON());
    
    // Get the order ID from the created object
    const orderId = order.getDataValue('id') || order.id;
    
    console.log('Order created successfully:', {
      id: orderId,
      customerName: order.customerName,
      totalAmount: order.totalAmount
    });
    
    if (!orderId) {
      throw new Error('Order was created but ID is missing');
    }

    // Create order items
    const orderItemsToCreate = validatedItems.map(item => ({
      ...item,
      orderId: orderId,
    }));
    
    console.log('Creating order items:', JSON.stringify(orderItemsToCreate, null, 2));
    
    // Validate each item before creating
    for (const item of orderItemsToCreate) {
      console.log('Validating order item:', item);
      if (isNaN(item.unitPrice) || isNaN(item.totalPrice)) {
        throw new Error(`Invalid price values: unitPrice=${item.unitPrice}, totalPrice=${item.totalPrice}`);
      }
    }
    
    await OrderItem.bulkCreate(orderItemsToCreate);
    
    console.log('Order items created successfully');

    // Update inventory
    console.log('Starting inventory update for order creation...');
    for (const item of validatedItems) {
      if (item.type === 'custom') {
        // Update all component quantities
        await FidgiColor.decrement('quantity', {
          by: item.quantity,
          where: { id: item.fidgiColorId },
        });
        await KeycapDesign.decrement('quantity', {
          by: item.quantity,
          where: { id: item.keycapId },
        });
        await SwitchType.decrement('quantity', {
          by: item.quantity,
          where: { id: item.switchId },
        });
      } else if (item.type === 'prebuilt') {
        // Get component IDs from the prebuilt item
        const [prebuiltResult] = await sequelize.query(`
          SELECT "fidgiColorId", "keycapId", "switchId"
          FROM prebuilt_fidgis
          WHERE id = :prebuiltFidgiId
        `, {
          replacements: { prebuiltFidgiId: item.prebuiltFidgiId },
          type: QueryTypes.SELECT
        });
        
        if (prebuiltResult) {
          const prebuiltData = prebuiltResult as any;
          // Update all component quantities for prebuilt
          await FidgiColor.decrement('quantity', {
            by: item.quantity,
            where: { id: prebuiltData.fidgiColorId },
          });
          await KeycapDesign.decrement('quantity', {
            by: item.quantity,
            where: { id: prebuiltData.keycapId },
          });
          await SwitchType.decrement('quantity', {
            by: item.quantity,
            where: { id: prebuiltData.switchId },
          });
        }
      }
    }

    console.log('Inventory updated successfully for order creation');

    // Re-fetch inventory quantities after order validation
    try {
      const inventoryRefresh = await refreshInventoryAfterOrder(orderId);
      console.log('Inventory refresh completed:', inventoryRefresh);
    } catch (refreshError) {
      console.error('Error refreshing inventory after order creation:', refreshError);
      // Don't fail the order creation if inventory refresh fails
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'type', 'quantity', 'unitPrice', 'totalPrice', 'unitCost', 'totalCost', 'profit', 'fidgiColorId', 'keycapId', 'switchId', 'prebuiltFidgiId'],
          include: [
            { model: FidgiColor, as: 'fidgiColor' },
            { model: KeycapDesign, as: 'keycap' },
            { model: SwitchType, as: 'switch' },
            { 
              model: PrebuiltFidgi, 
              as: 'prebuiltFidgi',
              include: [
                { model: FidgiColor, as: 'fidgiColor', attributes: ['id', 'name', 'cost'] },
                { model: KeycapDesign, as: 'keycap', attributes: ['id', 'name', 'cost'] },
                { model: SwitchType, as: 'switch', attributes: ['id', 'name', 'cost'] },
              ]
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: completeOrder,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
