import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface OtherFidgetAttributes {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  imageUrl: string;
  images: string[]; // Array of image URLs
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface OtherFidgetCreationAttributes extends Optional<OtherFidgetAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OtherFidget extends Model<OtherFidgetAttributes, OtherFidgetCreationAttributes> implements OtherFidgetAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public price!: number;
  public cost!: number;
  public quantity!: number;
  public imageUrl!: string;
  public images!: string[]; // Array of image URLs
  public category!: string;
  public isActive!: boolean;
  public isFeatured!: boolean;
  public tags!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to calculate profit
  public getProfit(): number {
    return this.price - this.cost;
  }

  // Method to check if in stock
  public isInStock(): boolean {
    return this.quantity > 0;
  }

  // Method to check if low stock (10 or less)
  public isLowStock(): boolean {
    return this.quantity > 0 && this.quantity <= 10;
  }
}

OtherFidget.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'OtherFidget',
    tableName: 'other_fidgets',
    timestamps: true,
  }
);

export default OtherFidget;
