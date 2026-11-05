import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Inventory = sequelize.define(
  'Inventory',
  {
    id: { // identificador único del producto del inventario
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { // nombre del repuesto o material
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: { // descripción del producto
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: { // categoría o tipo de producto
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    brand: { // marca del repuesto
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sku: { // código interno del producto
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    quantity: { // cantidad disponible en inventario
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    minimumStock: { // stock mínimo recomendado
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    unitPrice: { // precio unitario del producto
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: { // estado del producto en inventario
      type: DataTypes.ENUM('disponible', 'agotado', 'en revisión'),
      allowNull: false,
      defaultValue: 'disponible',
    },
  },
  {
    tableName: 'inventory',
    freezeTableName: true,
    timestamps: true,
  }
);

export { Inventory };
