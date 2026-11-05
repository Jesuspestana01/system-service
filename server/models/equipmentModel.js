import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Equipment = sequelize.define(
  'Equipment',
  {
    id: { // identificador único del equipo
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: { // referencia al cliente dueño del equipo
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    deviceType: { // tipo de dispositivo (iPhone, MacBook, iPad, etc.)
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    brand: { // marca del equipo
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: { // modelo del equipo
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    serialNumber: { // número de serie del equipo
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    color: { // color del equipo
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    accessories: { // accesorios entregados con el equipo
      type: DataTypes.TEXT,
      allowNull: true,
    },
    physicalCondition: { // estado físico del equipo al recibirlo
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observations: { // observaciones adicionales del equipo
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'equipment',
    freezeTableName: true,
    timestamps: true,
  }
);

export { Equipment };
