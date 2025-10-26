import { NextRequest, NextResponse } from 'next/server';
import { ItemImage } from '@/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing ItemImage model...');
    
    // Test creating a simple item image
    const testImage = await ItemImage.create({
      itemId: 'test-id',
      itemType: 'fidgiColor',
      imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Test',
      altText: 'Test image',
      isPrimary: true,
      sortOrder: 0
    });
    
    console.log('Test image created:', testImage.id);
    
    // Clean up
    await testImage.destroy();
    console.log('Test image deleted');
    
    return NextResponse.json({ 
      success: true, 
      message: 'ItemImage model is working',
      data: {
        testCreated: true,
        testDeleted: true
      }
    });
  } catch (error) {
    console.error('ItemImage test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
