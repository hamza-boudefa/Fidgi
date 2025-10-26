import sequelize from '../config/database';

export const addDatabaseIndexes = async () => {
  try {
    console.log('Adding database indexes for better performance...');
    
    // Add indexes for commonly queried columns
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders("createdAt");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders("customerEmail");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_fidgi_colors_is_active ON fidgi_colors("isActive");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_fidgi_colors_quantity ON fidgi_colors(quantity);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_keycap_designs_is_active ON keycap_designs("isActive");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_keycap_designs_quantity ON keycap_designs(quantity);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_switch_types_is_active ON switch_types("isActive");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_switch_types_quantity ON switch_types(quantity);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_prebuilt_fidgis_is_active ON prebuilt_fidgis("isActive");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_type ON order_items(type);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items("orderId");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins("isActive");
    `);
    
    console.log('Database indexes added successfully!');
  } catch (error) {
    console.error('Error adding database indexes:', error);
  }
};
