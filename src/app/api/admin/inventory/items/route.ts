import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminMiddleware';
import { FidgiColor, KeycapDesign, SwitchType, PrebuiltFidgi, OtherFidget } from '@/models';


// Initialize database connection
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {

    dbInitialized = true;
  }
};

// POST /api/admin/inventory/items - Create new item
async function createItemHandler(req: NextRequest) {
  try {
    
    
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Type and data are required' },
        { status: 400 }
      );
    }

    let newItem;
    let model;

    switch (type) {
      case 'base':
        model = FidgiColor;
        newItem = await FidgiColor.create({
          name: data.name,
          colorHex: data.colorHex,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl || 'https://placehold.net/4.png',
          images: data.images || [], // Store multiple images as JSON array
          isActive: true,
        });
        break;

      case 'keycap':
        model = KeycapDesign;
        newItem = await KeycapDesign.create({
          name: data.name,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl || 'https://placehold.net/4.png',
          images: data.images || [], // Store multiple images as JSON array
          category: data.category || 'general',
          isActive: true,
        });
        break;

      case 'switch':
        model = SwitchType;
        newItem = await SwitchType.create({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl || 'https://placehold.net/4.png',
          images: data.images || [], // Store multiple images as JSON array
          isActive: true,
        });
        break;

      case 'prebuilt':
        // Validate required fields for prebuilt
        if (!data.name || !data.description || !data.fidgiColorId || !data.keycapId || !data.switchId || data.price === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for prebuilt fidget' },
            { status: 400 }
          );
        }

        // Validate that referenced components exist and get their costs
        const [fidgiColor, keycap, switchType] = await Promise.all([
          FidgiColor.findByPk(data.fidgiColorId, { attributes: ['id', 'cost'] }),
          KeycapDesign.findByPk(data.keycapId, { attributes: ['id', 'cost'] }),
          SwitchType.findByPk(data.switchId, { attributes: ['id', 'cost'] }),
        ]);

        if (!fidgiColor || !keycap || !switchType) {
          return NextResponse.json(
            { success: false, error: 'One or more referenced components not found' },
            { status: 400 }
          );
        }

        model = PrebuiltFidgi;
        // Calculate cost from components - ensure we get the actual cost values
        const fidgiCost = parseFloat(String(fidgiColor.cost)) || 0;
        const keycapCost = parseFloat(String(keycap.cost)) || 0;
        const switchCost = parseFloat(String(switchType.cost)) || 0;
        const calculatedCost = fidgiCost + keycapCost + switchCost;
        
        console.log('Component costs:', { fidgiCost, keycapCost, switchCost, calculatedCost });

        newItem = await PrebuiltFidgi.create({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          cost: calculatedCost, // Use calculated cost instead of manual input
          originalPrice: parseFloat(data.originalPrice) || parseFloat(data.price) || 0,
          discount: parseFloat(data.discount) || 0,
          fidgiColorId: data.fidgiColorId,
          keycapId: data.keycapId,
          switchId: data.switchId,
          imageUrl: data.imageUrl || '/api/placeholder/300/300',
          images: data.images || [], // Store multiple images as JSON array
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          isActive: true,
          isFeatured: data.isFeatured || false,
          // Note: Prebuilt items don't have quantity - they are unique products
        });
        break;

      case 'other-fidget':
        // Validate required fields for other fidget
        if (!data.name || !data.description || !data.price || !data.category) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields for other fidget' },
            { status: 400 }
          );
        }

        model = OtherFidget;
        newItem = await OtherFidget.create({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl || 'https://placehold.net/4.png',
          images: data.images || [],
          category: data.category,
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          isActive: true,
          isFeatured: data.isFeatured || false,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid item type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        item: newItem,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} item created successfully`
      }
    });
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/inventory/items - Update existing item
async function updateItemHandler(req: NextRequest) {
  try {

    
    const body = await req.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json(
        { success: false, error: 'Type, id, and data are required' },
        { status: 400 }
      );
    }

    let model;
    let updateData: any = {};

    switch (type) {
      case 'base':
        model = FidgiColor;
        updateData = {
          name: data.name,
          colorHex: data.colorHex,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl,
          images: data.images || [], // Include images array in update
        };
        break;

      case 'keycap':
        model = KeycapDesign;
        updateData = {
          name: data.name,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl,
          images: data.images || [], // Include images array in update
          category: data.category,
        };
        break;

      case 'switch':
        model = SwitchType;
        updateData = {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl,
          images: data.images || [], // Include images array in update
        };
        break;

      case 'prebuilt':
        model = PrebuiltFidgi;
        
        // Get component costs for calculation
        const [fidgiColor, keycap, switchType] = await Promise.all([
          FidgiColor.findByPk(data.fidgiColorId, { attributes: ['id', 'cost'] }),
          KeycapDesign.findByPk(data.keycapId, { attributes: ['id', 'cost'] }),
          SwitchType.findByPk(data.switchId, { attributes: ['id', 'cost'] }),
        ]);

        if (!fidgiColor || !keycap || !switchType) {
          return NextResponse.json(
            { success: false, error: 'One or more referenced components not found' },
            { status: 400 }
          );
        }

        // Calculate cost from components - ensure we get the actual cost values
        const fidgiCost = parseFloat(String(fidgiColor.cost)) || 0;
        const keycapCost = parseFloat(String(keycap.cost)) || 0;
        const switchCost = parseFloat(String(switchType.cost)) || 0;
        const calculatedCost = fidgiCost + keycapCost + switchCost;
        
        console.log('Update component costs:', { fidgiCost, keycapCost, switchCost, calculatedCost });

        updateData = {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          cost: calculatedCost, // Use calculated cost instead of manual input
          originalPrice: parseFloat(data.originalPrice) || parseFloat(data.price) || 0,
          discount: parseFloat(data.discount) || 0,
          fidgiColorId: data.fidgiColorId,
          keycapId: data.keycapId,
          switchId: data.switchId,
          imageUrl: data.imageUrl,
          images: data.images || [], // Include images array in update
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          isFeatured: data.isFeatured || false,
        };
        break;

      case 'other-fidget':
        model = OtherFidget;
        updateData = {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price) || 0,
          cost: parseFloat(data.cost) || 0,
          quantity: parseInt(data.quantity) || 0,
          imageUrl: data.imageUrl,
          images: data.images || [],
          category: data.category,
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          isFeatured: data.isFeatured || false,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid item type' },
          { status: 400 }
        );
    }

    const item = await model.findByPk(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    await item.update(updateData);

    // If this is a component (base, keycap, or switch) and cost was updated,
    // update all affected prebuilt items
    if ((type === 'base' || type === 'keycap' || type === 'switch') && 'cost' in updateData) {
      try {
        const componentType = type === 'base' ? 'base' : type === 'keycap' ? 'keycap' : 'switch';
        const prebuiltItems = await PrebuiltFidgi.findAll({
          where: componentType === 'base' ? { fidgiColorId: id } :
                 componentType === 'keycap' ? { keycapId: id } :
                 { switchId: id }
        });

        // Update costs for all affected prebuilt items
        for (const prebuilt of prebuiltItems) {
          try {
            await prebuilt.updateCostFromComponents();
          } catch (error) {
            console.error(`Error updating prebuilt ${prebuilt.id} cost:`, error);
          }
        }
      } catch (error) {
        console.error('Error updating prebuilt costs:', error);
        // Don't fail the main update if prebuilt cost update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        item: item,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} item updated successfully`
      }
    });
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/inventory/items - Delete item (soft delete)
async function deleteItemHandler(req: NextRequest) {
  try {
   
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and id are required' },
        { status: 400 }
      );
    }

    let model;
    switch (type) {
      case 'base':
        model = FidgiColor;
        break;
      case 'keycap':
        model = KeycapDesign;
        break;
      case 'switch':
        model = SwitchType;
        break;
      case 'prebuilt':
        model = PrebuiltFidgi;
        break;
      case 'other-fidget':
        model = OtherFidget;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid item type' },
          { status: 400 }
        );
    }

    const item = await model.findByPk(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    await item.update({ isActive: false });

    return NextResponse.json({
      success: true,
      data: {
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} item deleted successfully`
      }
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/inventory/items - Update prebuilt costs when component costs change
async function updatePrebuiltCostsHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { componentType, componentId } = body;

    if (!componentType || !componentId) {
      return NextResponse.json(
        { success: false, error: 'Component type and ID are required' },
        { status: 400 }
      );
    }

    // Find all prebuilt items that use this component
    let whereClause = {};
    if (componentType === 'base') {
      whereClause = { fidgiColorId: componentId };
    } else if (componentType === 'keycap') {
      whereClause = { keycapId: componentId };
    } else if (componentType === 'switch') {
      whereClause = { switchId: componentId };
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid component type' },
        { status: 400 }
      );
    }

    const prebuiltItems = await PrebuiltFidgi.findAll({
      where: whereClause,
      include: [
        { model: FidgiColor, as: 'fidgiColor' },
        { model: KeycapDesign, as: 'keycap' },
        { model: SwitchType, as: 'switch' }
      ]
    });

    // Update costs for all affected prebuilt items
    const updateResults = [];
    for (const prebuilt of prebuiltItems) {
      try {
        const calculatedCost = await prebuilt.calculateCostFromComponents();
        await prebuilt.update({ cost: calculatedCost });
        updateResults.push({
          id: prebuilt.id,
          name: prebuilt.name,
          newCost: calculatedCost
        });
      } catch (error) {
        console.error(`Error updating prebuilt ${prebuilt.id}:`, error);
        updateResults.push({
          id: prebuilt.id,
          name: prebuilt.name,
          error: 'Failed to update cost'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Updated ${updateResults.length} prebuilt items`,
        results: updateResults
      }
    });
  } catch (error) {
    console.error('Update prebuilt costs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prebuilt costs' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createItemHandler);
export const PUT = withAdminAuth(updateItemHandler);
export const PATCH = withAdminAuth(updatePrebuiltCostsHandler);
export const DELETE = withAdminAuth(deleteItemHandler);
