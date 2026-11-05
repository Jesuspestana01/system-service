import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Attachment = sequelize.define(
  'Attachment',
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
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'attachments',
    freezeTableName: true,
    timestamps: true,
  }
);

export { Attachment };
