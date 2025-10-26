import { NextRequest, NextResponse } from 'next/server';
import { seedData } from '@/lib/seedData';
// Import models to ensure they are loaded and associations are set up
import '@/models';

// POST /api/seed-db - Seed database with initial data
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed initial data
    await seedData();
    
    console.log('✅ Database seeding completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

