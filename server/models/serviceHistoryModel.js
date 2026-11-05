import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const ServiceHistory = sequelize.define(
  'ServiceHistory',
  {
    id: { // identificador único del histórico
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceOrderId: { // orden de servicio relacionada con este evento
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userId: { // usuario que realizó la acción
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    action: { // acción que se realizó
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: { // detalle de la acción realizada
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previousStatus: { // estado anterior de la orden
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    newStatus: { // estado nuevo de la orden
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    createdAt: { // fecha y hora del evento
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'service_history',
    freezeTableName: true,
    timestamps: false,
  }
);

export { ServiceHistory };
