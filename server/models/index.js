import { Client } from './clientModel.js';
import { User } from './userModel.js';
import { Equipment } from './equipmentModel.js';
import { ServiceOrder } from './serviceOrderModel.js';
import { Inventory } from './inventoryModel.js';
import { ServiceHistory } from './serviceHistoryModel.js';
import { InventoryMovement } from './inventoryMovementModel.js';
import { UsedPart } from './usedPartModel.js';
import { Attachment } from './attachmentModel.js';
import { Payment } from './paymentModel.js';

Client.hasMany(Equipment, { foreignKey: 'clientId', as: 'equipment' });
Equipment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Client.hasMany(ServiceOrder, { foreignKey: 'clientId', as: 'serviceOrders' });
ServiceOrder.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Equipment.hasMany(ServiceOrder, { foreignKey: 'equipmentId', as: 'serviceOrders' });
ServiceOrder.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

User.hasMany(ServiceOrder, { foreignKey: 'receivedBy', as: 'receivedOrders' });
ServiceOrder.belongsTo(User, { foreignKey: 'receivedBy', as: 'receivedByUser' });

User.hasMany(ServiceOrder, { foreignKey: 'assignedTechnician', as: 'assignedOrders' });
ServiceOrder.belongsTo(User, { foreignKey: 'assignedTechnician', as: 'assignedTechnicianUser' });

Inventory.hasMany(InventoryMovement, { foreignKey: 'inventoryItemId', as: 'movements' });
InventoryMovement.belongsTo(Inventory, { foreignKey: 'inventoryItemId', as: 'inventoryItem' });

User.hasMany(InventoryMovement, { foreignKey: 'performedBy', as: 'inventoryMovements' });
InventoryMovement.belongsTo(User, { foreignKey: 'performedBy', as: 'performedByUser' });

ServiceOrder.hasMany(ServiceHistory, { foreignKey: 'serviceOrderId', as: 'history' });
ServiceHistory.belongsTo(ServiceOrder, { foreignKey: 'serviceOrderId', as: 'serviceOrder' });

User.hasMany(ServiceHistory, { foreignKey: 'userId', as: 'serviceHistory' });
ServiceHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Inventory.hasMany(UsedPart, { foreignKey: 'inventoryItemId', as: 'usedParts' });
UsedPart.belongsTo(Inventory, { foreignKey: 'inventoryItemId', as: 'inventoryItem' });

ServiceOrder.hasMany(UsedPart, { foreignKey: 'serviceOrderId', as: 'usedParts' });
UsedPart.belongsTo(ServiceOrder, { foreignKey: 'serviceOrderId', as: 'serviceOrder' });

ServiceOrder.hasMany(Attachment, { foreignKey: 'serviceOrderId', as: 'attachments' });
Attachment.belongsTo(ServiceOrder, { foreignKey: 'serviceOrderId', as: 'serviceOrder' });

User.hasMany(Attachment, { foreignKey: 'uploadedBy', as: 'uploadedAttachments' });
Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });

ServiceOrder.hasMany(Payment, { foreignKey: 'serviceOrderId', as: 'payments' });
Payment.belongsTo(ServiceOrder, { foreignKey: 'serviceOrderId', as: 'serviceOrder' });

export { Client, User, Equipment, ServiceOrder, Inventory, ServiceHistory, InventoryMovement, UsedPart, Attachment, Payment };
