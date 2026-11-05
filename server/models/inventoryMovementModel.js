import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const InventoryMovement = sequelize.define(
  'InventoryMovement',
  {
    id: { // identificador único del movimiento
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inventoryItemId: { // producto del inventario que se movió
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    movementType: { // tipo de movimiento: entrada o salida
      type: DataTypes.ENUM('entrada', 'salida'),
      allowNull: false,
    },
    quantity: { // cantidad movida
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: { // motivo del movimiento
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    performedBy: { // usuario que realizó el movimiento
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    date: { // fecha del movimiento
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'inventory_movements',
    freezeTableName: true,
    timestamps: true,
  }
);

export { InventoryMovement };
