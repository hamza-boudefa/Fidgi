import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const itemType = formData.get('itemType') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!itemType) {
      return NextResponse.json({ success: false, error: 'Item type is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Set upload folder based on item type
    let uploadFolder = `fidgi-store/${itemType}`;
    switch (itemType) {
      case 'fidgiColor':
        uploadFolder = `fidgi-store/colors`;
        break;
      case 'keycapDesign':
        uploadFolder = `fidgi-store/keycaps`;
        break;
      case 'switchType':
        uploadFolder = `fidgi-store/switches`;
        break;
      case 'prebuiltFidgi':
        uploadFolder = `fidgi-store/prebuilt`;
        break;
    }

    console.log('Uploading to Cloudinary:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      itemType,
      folder: uploadFolder
    });

    // Convert file to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary using data URL
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: uploadFolder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      public_id: `${itemType}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    });

    console.log('Upload successful:', result);

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        folder: uploadFolder,
        itemType
      }
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
