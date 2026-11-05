import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Payment = sequelize.define(
  'Payment',
  {
    id: { // identificador único del pago
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceOrderId: { // orden de servicio asociada al pago
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    amount: { // monto del pago
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentMethod: { // método de pago usado
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentStatus: { // estado del pago
      type: DataTypes.ENUM('pendiente', 'pagado', 'fallido', 'reembolsado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    paymentDate: { // fecha en que se registró el pago
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
