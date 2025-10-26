import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminMiddleware';
import { Order, OrderItem, FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, initializeDatabase } from '@/models';

import { OrderStatus } from '@/models/Order';
import { Op } from 'sequelize';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    console.log('Initializing database for admin orders...');
    await initializeDatabase();
    console.log('Database initialized successfully for admin orders');
    dbInitialized = true;
  }
};

// Initialize database connection


// GET /api/admin/orders - Get all orders with filters
async function handler(req: NextRequest) {
  try {
    // Initialize database
    await initDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { customerName: { [Op.iLike]: `%${search}%` } },
        { customerEmail: { [Op.iLike]: `%${search}%` } },
        { customerPhone: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Debug: Check if Order model is working
    console.log('Order model:', Order);
    console.log('Where clause:', whereClause);
    
    // Get orders with pagination
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
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });
    
    console.log('Orders query result:', {
      count: orders.count,
      rowsLength: orders.rows.length,
      firstOrder: orders.rows[0] ? {
        id: orders.rows[0].id,
        customerName: orders.rows[0].customerName,
        hasItems: !!(orders.rows[0] as any).items
      } : null
    });

    // Calculate summary statistics
    const summary = await Order.findAll({
      attributes: [
        [Order.sequelize!.fn('COUNT', Order.sequelize!.col('id')), 'totalOrders'],
        [Order.sequelize!.fn('SUM', Order.sequelize!.col('totalAmount')), 'totalRevenue'],
        [Order.sequelize!.fn('AVG', Order.sequelize!.col('totalAmount')), 'averageOrderValue'],
      ],
      where: whereClause,
      raw: true,
    });

    const statusCounts = await Order.findAll({
      attributes: [
        'status',
        [Order.sequelize!.fn('COUNT', Order.sequelize!.col('id')), 'count']
      ],
      group: ['status'],
      raw: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.rows.map(order => {
          const orderData = order.toJSON();
          console.log('Order data being processed:', {
            id: orderData.id,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            hasItems: !!(orderData as any).items
          });
          
          return {
            id: orderData.id,
            customerName: orderData.customerName || 'Unknown',
            customerEmail: orderData.customerEmail || null,
            customerPhone: orderData.customerPhone || 'Unknown',
            customerAddress: orderData.customerAddress || 'Unknown',
            customerCity: orderData.customerCity || 'Unknown',
            customerPostalCode: orderData.customerPostalCode || 'Unknown',
            customerNotes: orderData.customerNotes || null,
            status: orderData.status || 'pending',
            totalAmount: orderData.totalAmount || 0,
            shippingCost: orderData.shippingCost || 0,
            createdAt: orderData.createdAt,
            updatedAt: orderData.updatedAt,
            items: (orderData as any).items?.map(item => ({
              id: item.id,
              type: item.type,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              fidgiColor: (item as any).fidgiColor,
              keycap: (item as any).keycap,
              switch: (item as any).switch,
              prebuiltFidgi: (item as any).prebuiltFidgi,
            })) || [],
          };
        }),
        pagination: {
          page,
          limit,
          total: orders.count,
          totalPages: Math.ceil(orders.count / limit),
        },
        summary: {
          totalOrders: parseInt((summary[0] as any)?.totalOrders as string) || 0,
          totalRevenue: parseFloat((summary[0] as any)?.totalRevenue as string) || 0,
          averageOrderValue: parseFloat((summary[0] as any)?.averageOrderValue as string) || 0,
        },
        statusCounts: statusCounts.map(item => ({
          status: (item as any).status,
          count: parseInt((item as any).count as string),
        })),
      },
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
