import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const User = sequelize.define(
  'User',
  {
    id: { // identificador único del usuario
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { // nombre del usuario
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: { // apellido del usuario
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: { // nombre de usuario para iniciar sesión
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: { // correo electrónico del usuario
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: { // contraseña del usuario encriptada
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: { // rol del usuario: administrador, técnico o recepción
      type: DataTypes.ENUM('administrador', 'técnico', 'recepción'),
      allowNull: false,
    },
    status: { // estado del usuario: activo o inactivo
      type: DataTypes.ENUM('activo', 'inactivo'),
      allowNull: false,
      defaultValue: 'activo',
    },
  },
  {
    tableName: 'users',
    freezeTableName: true,
    timestamps: true,
  }
);

export { User };