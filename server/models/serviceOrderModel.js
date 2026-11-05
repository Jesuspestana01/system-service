import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const ServiceOrder = sequelize.define(
  'ServiceOrder',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    equipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    receivedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    assignedTechnician: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    reportedProblem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('recibido', 'en revisión', 'en reparación', 'pendiente', 'resuelto', 'entregado', 'cancelado'),
      allowNull: false,
      defaultValue: 'recibido',
    },
    priority: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
      allowNull: false,
      defaultValue: 'media',
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    finalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'service_orders',
    freezeTableName: true,
    timestamps: true,
  }
);

export { ServiceOrder };
