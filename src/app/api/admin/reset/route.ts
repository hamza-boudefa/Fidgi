import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, Admin } from '@/models';

// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    
    dbInitialized = true;
  }
};

// POST /api/admin/reset - Reset admin records (for debugging)
export async function POST(request: NextRequest) {
  try {
    
    
    // Delete all admin records
    await Admin.destroy({
      where: {},
      truncate: true
    });

    return NextResponse.json({
      success: true,
      message: 'All admin records deleted. You can now use the setup endpoint to create a new admin.'
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Reset failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

