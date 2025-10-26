import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing URL upload...');
    
    // Use a public test image URL
    const testImageUrl = 'https://picsum.photos/200/200';
    
    console.log('Uploading from URL:', testImageUrl);
    
    const result = await cloudinary.uploader.upload(
      testImageUrl,
      {
        folder: 'fidgi-store/test',
        resource_type: 'auto',
        public_id: `test-url-${Date.now()}`
      }
    );
    
    console.log('URL upload result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'URL upload successful',
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        folder: result.folder
      }
    });
  } catch (error) {
    console.error('URL upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'URL upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
