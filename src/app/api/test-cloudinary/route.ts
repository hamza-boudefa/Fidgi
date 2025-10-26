import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test basic connection
    const result = await cloudinary.api.ping();
    console.log('Cloudinary ping result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary connection successful',
      data: result
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cloudinary connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json({ success: false, error: 'Public ID is required' }, { status: 400 });
    }
    
    // Test image info retrieval
    const imageInfo = await cloudinary.api.resource(publicId);
    console.log('Image info:', imageInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Image info retrieved successfully',
      data: imageInfo
    });
  } catch (error) {
    console.error('Cloudinary image info error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get image info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
