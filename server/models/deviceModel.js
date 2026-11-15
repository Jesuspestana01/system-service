import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

// catalog of equipment models grouped by device type (iPhone, MacBook, iPad, etc.)
const DeviceModel = sequelize.define(
  'DeviceModel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
  },
  {
    tableName: 'device_models',
    freezeTableName: true,
    timestamps: true,
  }
);

export { DeviceModel };
