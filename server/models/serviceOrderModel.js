import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const ServiceOrder = sequelize.define(
  'ServiceOrder',
  {
    id: { // identificador único de la orden de servicio
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: { // número correlativo de la orden
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    clientId: { // referencia al cliente asociado a la orden
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    equipmentId: { // referencia al equipo que está siendo reparado
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    receivedBy: { // usuario que recibió el equipo
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    assignedTechnician: { // técnico asignado a la reparación
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    reportedProblem: { // problema reportado por el cliente
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diagnosis: { // diagnóstico técnico del equipo
      type: DataTypes.TEXT,
      allowNull: true,
    },
    solution: { // solución aplicada a la reparación
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: { // estado actual de la orden
      type: DataTypes.ENUM('recibido', 'en revisión', 'en reparación', 'pendiente', 'resuelto', 'entregado', 'cancelado'),
      allowNull: false,
      defaultValue: 'recibido',
    },
    priority: { // prioridad de la solicitud
      type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
      allowNull: false,
      defaultValue: 'media',
    },
    estimatedCost: { // costo estimado de la reparación
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    finalCost: { // costo final de la reparación
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    receivedAt: { // fecha en que se recibió el equipo
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deliveredAt: { // fecha en que se entregó el equipo
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
