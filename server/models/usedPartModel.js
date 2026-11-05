import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const UsedPart = sequelize.define(
  'UsedPart',
  {
    id: { // identificador único del repuesto usado
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceOrderId: { // orden de servicio a la que pertenece el repuesto usado
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    inventoryItemId: { // repuesto del inventario que fue consumido
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity: { // cantidad de repuesto utilizada
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: { // precio unitario del repuesto al momento de usarlo
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'used_parts',
    freezeTableName: true,
    timestamps: true,
  }
);

export { UsedPart };
