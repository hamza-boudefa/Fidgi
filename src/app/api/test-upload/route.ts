import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing simple upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    console.log('Uploading test image...');
    
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${testImageBuffer.toString('base64')}`,
      {
        folder: 'fidgi-store/test',
        resource_type: 'auto',
        public_id: `test-${Date.now()}`
      }
    );
    
    console.log('Upload result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        folder: result.folder
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
