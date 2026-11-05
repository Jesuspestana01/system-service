import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pendiente', 'pagado', 'fallido', 'reembolsado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
    freezeTableName: true,
    timestamps: true,
  }
);

export { Payment };
