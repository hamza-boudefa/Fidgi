import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderSource {
  WEBSITE = 'website',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
  IN_PERSON = 'in_person',
  PHONE = 'phone',
  OTHER = 'other'
}

interface OrderAttributes {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerCity: string;
  customerPostalCode: string;
  customerNotes?: string;
  status: OrderStatus;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  shippingCost: number;
  source: OrderSource;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'customerEmail' | 'customerNotes' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public customerName!: string;
  public customerPhone!: string;
  public customerEmail?: string;
  public customerAddress!: string;
  public customerCity!: string;
  public customerPostalCode!: string;
  public customerNotes?: string;
  public status!: OrderStatus;
  public totalAmount!: number;
  public totalCost!: number;
  public totalProfit!: number;
  public shippingCost!: number;
  public source!: OrderSource;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address',
        },
      },
    },
    customerAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    customerCity: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    customerPostalCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    customerNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalProfit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(OrderSource)),
      allowNull: false,
      defaultValue: OrderSource.WEBSITE,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  }
);

export default Order;
