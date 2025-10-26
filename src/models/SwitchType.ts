import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface SwitchTypeAttributes {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images: string[]; // Array of image URLs
  price: number;
  cost: number;
  quantity: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SwitchTypeCreationAttributes extends Optional<SwitchTypeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SwitchType extends Model<SwitchTypeAttributes, SwitchTypeCreationAttributes> implements SwitchTypeAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public imageUrl!: string;
  public images!: string[]; // Array of image URLs
  public price!: number;
  public cost!: number;
  public quantity!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SwitchType.init(
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
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'https://placehold.net/4.png',
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'SwitchType',
    tableName: 'switch_types',
    timestamps: true,
  }
);

export default SwitchType;
