import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Equipment = sequelize.define(
  'Equipment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    deviceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    accessories: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    physicalCondition: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observations: {
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
