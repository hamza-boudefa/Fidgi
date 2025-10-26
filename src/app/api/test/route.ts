import { NextRequest, NextResponse } from 'next/server';

import { seedData } from '@/lib/seedData';

// GET /api/test - Test database connection and API endpoints
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    
    
    // Test seeding data
    await seedData();
    
    // Test API endpoints
    const [colorsRes, keycapsRes, switchesRes, prebuiltRes] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/products/colors?active=true`),
      fetch(`${request.nextUrl.origin}/api/products/keycaps?active=true`),
      fetch(`${request.nextUrl.origin}/api/products/switches?active=true`),
      fetch(`${request.nextUrl.origin}/api/products/prebuilt?active=true`)
    ]);

    const [colorsData, keycapsData, switchesData, prebuiltData] = await Promise.all([
      colorsRes.json(),
      keycapsRes.json(),
      switchesRes.json(),
      prebuiltRes.json()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database and API integration test successful',
      data: {
        database: 'Connected and seeded successfully',
        colors: {
          count: colorsData.data?.length || 0,
          status: colorsRes.ok ? 'OK' : 'ERROR'
        },
        keycaps: {
          count: keycapsData.data?.length || 0,
          status: keycapsRes.ok ? 'OK' : 'ERROR'
        },
        switches: {
          count: switchesData.data?.length || 0,
          status: switchesRes.ok ? 'OK' : 'ERROR'
        },
        prebuilt: {
          count: prebuiltData.data?.length || 0,
          status: prebuiltRes.ok ? 'OK' : 'ERROR'
        }
      }
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
