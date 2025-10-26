import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor } from '@/models';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing item creation...');
    
    // Try to create a simple FidgiColor
    const color = await FidgiColor.create({
      name: 'Test Color',
      colorHex: '#FF0000',
      imageUrl: 'https://placehold.net/400x400/ff0000/ffffff?text=Test',
      price: 15.00,
      cost: 8.00,
      quantity: 10,
      isActive: true,
    });
    
    console.log('Item created successfully:', color.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item created successfully',
      data: { id: color.id, name: color.name }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
