import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import FidgiColor from './FidgiColor';
import KeycapDesign from './KeycapDesign';
import SwitchType from './SwitchType';

interface PrebuiltFidgiAttributes {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images: string[]; // Array of image URLs
  fidgiColorId: string;
  keycapId: string;
  switchId: string;
  price: number;
  cost: number;
  originalPrice: number;
  discount: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface PrebuiltFidgiCreationAttributes extends Optional<PrebuiltFidgiAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PrebuiltFidgi extends Model<PrebuiltFidgiAttributes, PrebuiltFidgiCreationAttributes> implements PrebuiltFidgiAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public imageUrl!: string;
  public images!: string[]; // Array of image URLs
  public fidgiColorId!: string;
  public keycapId!: string;
  public switchId!: string;
  public price!: number;
  public cost!: number;
  public originalPrice!: number;
  public discount!: number;
  public isActive!: boolean;
  public isFeatured!: boolean;
  public tags!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to calculate cost from components
  public async calculateCostFromComponents(): Promise<number> {
    try {
      const [fidgiColor, keycap, switchType] = await Promise.all([
        FidgiColor.findByPk(this.fidgiColorId),
        KeycapDesign.findByPk(this.keycapId),
        SwitchType.findByPk(this.switchId)
      ]);

      if (!fidgiColor || !keycap || !switchType) {
        throw new Error('One or more components not found');
      }

      const totalCost = (fidgiColor.cost || 0) + (keycap.cost || 0) + (switchType.cost || 0);
      return totalCost;
    } catch (error) {
      console.error('Error calculating cost from components:', error);
      return 0;
    }
  }

  // Method to update cost from components
  public async updateCostFromComponents(): Promise<void> {
    try {
      const calculatedCost = await this.calculateCostFromComponents();
      await this.update({ cost: calculatedCost });
    } catch (error) {
      console.error('Error updating cost from components:', error);
    }
  }
}

PrebuiltFidgi.init(
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
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    fidgiColorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    keycapId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    switchId: {
      type: DataTypes.UUID,
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
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'PrebuiltFidgi',
    tableName: 'prebuilt_fidgis',
    timestamps: true,
  }
);

export default PrebuiltFidgi;
