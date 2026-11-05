import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Attachment = sequelize.define(
  'Attachment',
  {
    id: { // identificador único del archivo adjunto
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceOrderId: { // orden de servicio asociada al archivo
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    fileName: { // nombre del archivo adjunto
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: { // URL o ruta del archivo almacenado
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileType: { // tipo de archivo (imagen, PDF, etc.)
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    uploadedBy: { // usuario que subió el archivo
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    uploadedAt: { // fecha de subida del archivo
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
