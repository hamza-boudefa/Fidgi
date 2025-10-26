import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, UPLOAD_PRESETS } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const itemType = formData.get('itemType') as string;
    const folder = formData.get('folder') as string;

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

    // Set upload folder based on item type (no presets for now)
    let uploadFolder = folder || `fidgi-store/${itemType}`;
    let preset: string | undefined; // Don't use presets initially

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
      default:
        uploadFolder = `fidgi-store/${itemType}`;
    }

    console.log('Uploading to Cloudinary:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      itemType,
      folder: uploadFolder,
      preset
    });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, uploadFolder, preset);

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
    console.error('Cloudinary upload API error:', error);
    return NextResponse.json({ 
    success: false, 
    error: 'Failed to upload image',
    details: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 500 });
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const itemType = formData.get('itemType') as string;
    const folder = formData.get('folder') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    if (!itemType) {
      return NextResponse.json({ success: false, error: 'Item type is required' }, { status: 400 });
    }

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          success: false, 
          error: `Invalid file type for ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.` 
        }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json({ 
          success: false, 
          error: `File ${file.name} too large. Maximum size is 10MB.` 
        }, { status: 400 });
      }
    }

    // Set upload folder based on item type (no presets for now)
    let uploadFolder = folder || `fidgi-store/${itemType}`;
    let preset: string | undefined; // Don't use presets initially

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
      default:
        uploadFolder = `fidgi-store/${itemType}`;
    }

    console.log('Uploading multiple files to Cloudinary:', {
      fileCount: files.length,
      itemType,
      folder: uploadFolder,
      preset
    });

    // Upload all files
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, uploadFolder, preset)
    );

    const results = await Promise.all(uploadPromises);

    console.log('Multiple upload successful:', results);

    return NextResponse.json({
      success: true,
      data: {
        uploads: results.map(result => ({
          public_id: result.public_id,
          secure_url: result.secure_url
        })),
        folder: uploadFolder,
        itemType,
        count: results.length
      }
    });

  } catch (error) {
    console.error('Cloudinary multiple upload API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
