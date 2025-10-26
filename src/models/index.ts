import sequelize, { initializeDatabase } from '../config/database';
import FidgiColor from './FidgiColor';
import KeycapDesign from './KeycapDesign';
import SwitchType from './SwitchType';
import PrebuiltFidgi from './PrebuiltFidgi';
import OtherFidget from './OtherFidget';
import Order from './Order';
import OrderItem from './OrderItem';
import ItemImage from './ItemImage';
import Admin, { AdminRole } from './Admin';

// Define associations
PrebuiltFidgi.belongsTo(FidgiColor, { foreignKey: 'fidgiColorId', as: 'fidgiColor' });
PrebuiltFidgi.belongsTo(KeycapDesign, { foreignKey: 'keycapId', as: 'keycap' });
PrebuiltFidgi.belongsTo(SwitchType, { foreignKey: 'switchId', as: 'switch' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(FidgiColor, { foreignKey: 'fidgiColorId', as: 'fidgiColor' });
OrderItem.belongsTo(KeycapDesign, { foreignKey: 'keycapId', as: 'keycap' });
OrderItem.belongsTo(SwitchType, { foreignKey: 'switchId', as: 'switch' });
OrderItem.belongsTo(PrebuiltFidgi, { foreignKey: 'prebuiltFidgiId', as: 'prebuiltFidgi' });
OrderItem.belongsTo(OtherFidget, { foreignKey: 'otherFidgetId', as: 'otherFidget' });

// ItemImage associations
ItemImage.belongsTo(FidgiColor, { foreignKey: 'itemId', constraints: false, scope: { itemType: 'fidgiColor' } });
ItemImage.belongsTo(KeycapDesign, { foreignKey: 'itemId', constraints: false, scope: { itemType: 'keycapDesign' } });
ItemImage.belongsTo(SwitchType, { foreignKey: 'itemId', constraints: false, scope: { itemType: 'switchType' } });
ItemImage.belongsTo(PrebuiltFidgi, { foreignKey: 'itemId', constraints: false, scope: { itemType: 'prebuiltFidgi' } });
ItemImage.belongsTo(OtherFidget, { foreignKey: 'itemId', constraints: false, scope: { itemType: 'otherFidget' } });

// Reverse associations for items to images
FidgiColor.hasMany(ItemImage, { foreignKey: 'itemId', as: 'itemImages', scope: { itemType: 'fidgiColor' } });
KeycapDesign.hasMany(ItemImage, { foreignKey: 'itemId', as: 'itemImages', scope: { itemType: 'keycapDesign' } });
SwitchType.hasMany(ItemImage, { foreignKey: 'itemId', as: 'itemImages', scope: { itemType: 'switchType' } });
PrebuiltFidgi.hasMany(ItemImage, { foreignKey: 'itemId', as: 'itemImages', scope: { itemType: 'prebuiltFidgi' } });
OtherFidget.hasMany(ItemImage, { foreignKey: 'itemId', as: 'itemImages', scope: { itemType: 'otherFidget' } });

// Database initialization is handled by the imported initializeDatabase function

export {
  sequelize,
  FidgiColor,
  KeycapDesign,
  SwitchType,
  PrebuiltFidgi,
  OtherFidget,
  Order,
  OrderItem,
  ItemImage,
  Admin,
  AdminRole,
  initializeDatabase,
};
