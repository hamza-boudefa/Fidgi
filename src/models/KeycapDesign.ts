import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface KeycapDesignAttributes {
  id: string;
  name: string;
  imageUrl: string;
  images: string[]; // Array of image URLs
  price: number;
  cost: number;
  quantity: number;
  isActive: boolean;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface KeycapDesignCreationAttributes extends Optional<KeycapDesignAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class KeycapDesign extends Model<KeycapDesignAttributes, KeycapDesignCreationAttributes> implements KeycapDesignAttributes {
  public id!: string;
  public name!: string;
  public imageUrl!: string;
  public images!: string[]; // Array of image URLs
  public price!: number;
  public cost!: number;
  public quantity!: number;
  public isActive!: boolean;
  public category!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KeycapDesign.init(
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
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'default',
    },
  },
  {
    sequelize,
    modelName: 'KeycapDesign',
    tableName: 'keycap_designs',
    timestamps: true,
  }
);

export default KeycapDesign;
