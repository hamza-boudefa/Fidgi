import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [width, height] = resolvedParams.params;
    
    const w = parseInt(width) || 300;
    const h = parseInt(height) || 300;
    
    // Validate dimensions
    if (w > 2000 || h > 2000 || w < 1 || h < 1) {
      return new NextResponse('Invalid dimensions', { status: 400 });
    }
    
    // Create a simple 1x1 transparent PNG as data URL
    const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    return new NextResponse(pngDataUrl, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Placeholder API error:', error);
    return new NextResponse('Error generating placeholder', { status: 500 });
  }
}
