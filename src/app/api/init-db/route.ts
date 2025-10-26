import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/config/database';
// Import models to ensure they are loaded and associations are set up
import '@/models';

// Track initialization status
let isInitialized = false;
let isInitializing = false;

// POST /api/init-db - Initialize database and seed data (only once)
export async function POST(request: NextRequest) {
  try {
    // If already initialized, return success
    if (isInitialized) {
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        cached: true
      });
    }

    // If currently initializing, wait a bit and check again
    if (isInitializing) {
      // Wait up to 10 seconds for initialization to complete
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        if (isInitialized) {
          return NextResponse.json({
            success: true,
            message: 'Database initialized (waited for completion)',
            cached: true
          });
        }
      }
      return NextResponse.json({
        success: false,
        error: 'Database initialization timeout'
      }, { status: 408 });
    }

    // Start initialization
    isInitializing = true;
    console.log('🚀 Starting database initialization...');
    
    // Initialize database connection and sync models
    await initializeDatabase();
    
    isInitialized = true;
    isInitializing = false;
    
    console.log('✅ Database initialization completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    isInitializing = false;
    console.error('❌ Error initializing database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
