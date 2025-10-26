import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface FidgiColorAttributes {
  id: string;
  name: string;
  colorHex: string;
  imageUrl: string;
  images: string[]; // Array of image URLs
  price: number;
  cost: number;
  quantity: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FidgiColorCreationAttributes extends Optional<FidgiColorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class FidgiColor extends Model<FidgiColorAttributes, FidgiColorCreationAttributes> implements FidgiColorAttributes {
  public id!: string;
  public name!: string;
  public colorHex!: string;
  public imageUrl!: string;
  public images!: string[]; // Array of image URLs
  public price!: number;
  public cost!: number;
  public quantity!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FidgiColor.init(
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
    colorHex: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
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
    modelName: 'FidgiColor',
    tableName: 'fidgi_colors',
    timestamps: true,
  }
);

export default FidgiColor;
