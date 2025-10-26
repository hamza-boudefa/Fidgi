import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

export enum OrderItemType {
  CUSTOM = 'custom',
  PREBUILT = 'prebuilt',
  OTHER_FIDGET = 'other-fidget',
}

interface OrderItemAttributes {
  id: string;
  orderId: string;
  type: OrderItemType;
  fidgiColorId?: string;
  keycapId?: string;
  switchId?: string;
  prebuiltFidgiId?: string;
  otherFidgetId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
  profit: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public type!: OrderItemType;
  public fidgiColorId?: string;
  public keycapId?: string;
  public switchId?: string;
  public prebuiltFidgiId?: string;
  public otherFidgetId?: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public unitCost!: number;
  public totalCost!: number;
  public profit!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(OrderItemType)),
      allowNull: false,
    },
    fidgiColorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    keycapId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    switchId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    prebuiltFidgiId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    otherFidgetId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    profit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
  }
);

export default OrderItem;
