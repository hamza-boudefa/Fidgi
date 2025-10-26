import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface ItemImageAttributes {
  id: string;
  itemId: string;
  itemType: 'fidgiColor' | 'keycapDesign' | 'switchType' | 'prebuiltFidgi';
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ItemImageCreationAttributes extends Optional<ItemImageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ItemImage extends Model<ItemImageAttributes, ItemImageCreationAttributes> implements ItemImageAttributes {
  public id!: string;
  public itemId!: string;
  public itemType!: 'fidgiColor' | 'keycapDesign' | 'switchType' | 'prebuiltFidgi';
  public imageUrl!: string;
  public altText?: string;
  public isPrimary!: boolean;
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate() {
    // Associations will be defined in index.ts
  }
}

ItemImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'item_id',
    },
    itemType: {
      type: DataTypes.ENUM('fidgiColor', 'keycapDesign', 'switchType', 'prebuiltFidgi'),
      allowNull: false,
      field: 'item_type',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'image_url',
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'alt_text',
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'item_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ItemImage;
