import { NextRequest, NextResponse } from 'next/server';
import { sequelize, initializeDatabase } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    console.log('Initializing database for check...');
    await initializeDatabase();
    console.log('Database initialized successfully for check');
    dbInitialized = true;
  }
};

// GET /api/check-db - Check database tables
export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initDB();
    
    console.log('Checking database tables...');
    
    // Check if orders table exists
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
    `);
    
    console.log('Orders table exists:', results.length > 0);
    
    if (results.length > 0) {
      // Check orders table structure
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'orders'
        ORDER BY ordinal_position
      `);
      
      console.log('Orders table columns:', columns);
      
      // Check if there are any records
      const [count] = await sequelize.query(`
        SELECT COUNT(*) as count FROM orders
      `);
      
      console.log('Orders count:', count);
      
      // Get a sample record
      const [sample] = await sequelize.query(`
        SELECT * FROM orders LIMIT 1
      `);
      
      console.log('Sample order:', sample);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ordersTableExists: results.length > 0,
        columns: results.length > 0 ? await sequelize.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'orders'
          ORDER BY ordinal_position
        `) : null,
        count: results.length > 0 ? await sequelize.query(`
          SELECT COUNT(*) as count FROM orders
        `) : null,
        sample: results.length > 0 ? await sequelize.query(`
          SELECT * FROM orders LIMIT 1
        `) : null
      }
    });
  } catch (error) {
    console.error('Check database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
