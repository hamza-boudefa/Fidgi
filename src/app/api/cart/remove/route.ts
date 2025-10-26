import { NextRequest, NextResponse } from 'next/server';

// Session-based cart storage (in production, use Redis or database)
const cartStorage = new Map<string, any[]>();

// DELETE /api/cart/remove - Remove specific item from cart
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'default';
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    let cart = cartStorage.get(sessionId) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    cart.splice(itemIndex, 1);
    cartStorage.set(sessionId, cart);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

