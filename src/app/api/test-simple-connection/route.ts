import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Test a simple query
    const result = await sequelize.query('SELECT 1 as test');
    console.log('Query result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: { test: result }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
