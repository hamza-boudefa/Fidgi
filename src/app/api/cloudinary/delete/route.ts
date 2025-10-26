import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary, deleteMultipleFromCloudinary, extractPublicId } from '@/lib/cloudinary';

// DELETE /api/cloudinary/delete - Delete images from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs array is required' },
        { status: 400 }
      );
    }

    console.log('Deleting images from Cloudinary:', urls);

    // Delete multiple images
    const results = await deleteMultipleFromCloudinary(urls);

    console.log('Delete results:', results);

    return NextResponse.json({
      success: true,
      data: {
        deleted: results.success,
        failed: results.failed,
        total: urls.length,
        successCount: results.success.length,
        failedCount: results.failed.length
      }
    });

  } catch (error) {
    console.error('Cloudinary delete API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete images from Cloudinary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/cloudinary/delete - Delete single image from Cloudinary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Deleting single image from Cloudinary:', url);

    const publicId = extractPublicId(url);
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Invalid Cloudinary URL' },
        { status: 400 }
      );
    }

    const deleted = await deleteFromCloudinary(publicId);

    if (deleted) {
      return NextResponse.json({
        success: true,
        data: {
          url,
          publicId,
          deleted: true
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image from Cloudinary' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Cloudinary delete API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete image from Cloudinary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
