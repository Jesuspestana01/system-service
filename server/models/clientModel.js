import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Client = sequelize.define(
  'Client',
  {
    id: { // identificador único del cliente
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { // nombre del cliente
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: { // apellido del cliente
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    identityDocument: { // documento de identidad del cliente
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: { // correo electrónico del cliente
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: { // teléfono de contacto del cliente
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    address: { // dirección del cliente (opcional)
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'clients',
    freezeTableName: true,
    timestamps: true,
  }
);

export { Client };
