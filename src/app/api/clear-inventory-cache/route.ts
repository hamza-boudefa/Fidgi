import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint doesn't actually clear server-side cache,
    // but it can be used to trigger a refresh
    return NextResponse.json({
      success: true,
      message: 'Cache clear requested. Please refresh the admin inventory page.'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
