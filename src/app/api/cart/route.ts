import { NextRequest, NextResponse } from 'next/server';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, OtherFidget } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
 
    dbInitialized = true;
  }
};

// Session-based cart storage (in production, use Redis or database)
const cartStorage = new Map<string, any[]>();

// GET /api/cart - Get current cart
export async function GET(request: NextRequest) {
  try {
   
    
    const sessionId = request.headers.get('x-session-id') || 'default';
    const cart = cartStorage.get(sessionId) || [];
    
    // Enrich cart items with current product data
    const enrichedCart = await Promise.all(
      cart.map(async (item) => {
        if (item.type === 'custom') {
          const [fidgiColor, keycap, switchType] = await Promise.all([
            FidgiColor.findByPk(item.fidgiColorId),
            KeycapDesign.findByPk(item.keycapId),
            SwitchType.findByPk(item.switchId),
          ]);
          
          return {
            ...item,
            fidgiColor,
            keycap,
            switchType,
            unitPrice: (fidgiColor?.price || 0) + (keycap?.price || 0) + (switchType?.price || 0),
            totalPrice: ((fidgiColor?.price || 0) + (keycap?.price || 0) + (switchType?.price || 0)) * item.quantity,
          };
        } else if (item.type === 'prebuilt') {
          const prebuiltFidgi = await PrebuiltFidgi.findByPk(item.prebuiltFidgiId, {
            include: [
              { model: FidgiColor, as: 'fidgiColor' },
              { model: KeycapDesign, as: 'keycap' },
              { model: SwitchType, as: 'switch' },
            ],
          });
          
          return {
            ...item,
            prebuiltFidgi,
            unitPrice: prebuiltFidgi?.price || 0,
            totalPrice: (prebuiltFidgi?.price || 0) * item.quantity,
          };
        } else if (item.type === 'other-fidget') {
          const otherFidget = await OtherFidget.findByPk(item.otherFidgetId);
          
          return {
            ...item,
            otherFidget,
            unitPrice: otherFidget?.price || 0,
            totalPrice: (otherFidget?.price || 0) * item.quantity,
          };
        }
        return item;
      })
    );

    const totalAmount = enrichedCart.reduce((sum, item) => sum + item.totalPrice, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedCart,
        totalAmount,
        itemCount: enrichedCart.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart/add - Add item to cart
export async function POST(request: NextRequest) {
  try {
    
    
    const sessionId = request.headers.get('x-session-id') || 'default';
    const body = await request.json();
    const { type, fidgiColorId, keycapId, switchId, prebuiltFidgiId, quantity = 1 } = body;

    // Validate required fields
    if (!type || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid item data' },
        { status: 400 }
      );
    }

    let cart = cartStorage.get(sessionId) || [];
    let newItem;

    if (type === 'custom') {
      if (!fidgiColorId || !keycapId || !switchId) {
        return NextResponse.json(
          { success: false, error: 'Missing required components for custom item' },
          { status: 400 }
        );
      }

      // Check if item already exists in cart
      const existingItem = cart.find(
        item => item.type === 'custom' && 
        item.fidgiColorId === fidgiColorId && 
        item.keycapId === keycapId && 
        item.switchId === switchId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newItem = {
          id: Date.now().toString(),
          type: 'custom',
          fidgiColorId,
          keycapId,
          switchId,
          quantity,
        };
        cart.push(newItem);
      }
    } else if (type === 'prebuilt') {
      if (!prebuiltFidgiId) {
        return NextResponse.json(
          { success: false, error: 'Missing prebuilt Fidgi ID' },
          { status: 400 }
        );
      }

      // Check if item already exists in cart
      const existingItem = cart.find(
        item => item.type === 'prebuilt' && item.prebuiltFidgiId === prebuiltFidgiId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newItem = {
          id: Date.now().toString(),
          type: 'prebuilt',
          prebuiltFidgiId,
          quantity,
        };
        cart.push(newItem);
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid item type' },
        { status: 400 }
      );
    }

    cartStorage.set(sessionId, cart);

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: { item: newItem || 'updated existing item' },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT /api/cart/update - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'default';
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid update data' },
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

    if (quantity === 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }

    cartStorage.set(sessionId, cart);

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/clear - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'default';
    cartStorage.set(sessionId, []);

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
