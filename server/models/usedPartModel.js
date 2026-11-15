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
    inventoryItemId: { // repuesto del inventario (nulo cuando es un servicio o mano de obra)
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'inventory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    itemType: { // tipo de cargo: 'inventory' o 'service'
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'inventory',
    },
    code: { // código o sku de referencia
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    name: { // descripción o nombre del concepto cobrado
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    quantity: { // cantidad utilizada
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: { // precio unitario al momento de usarlo
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountPercent: { // porcentaje de descuento en la línea
      type: DataTypes.DECIMAL(5, 2),
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
