import { Router } from 'express';
import { Op } from 'sequelize';
import { ServiceOrder, Client, Equipment, User, ServiceHistory, UsedPart, Attachment, Payment, Inventory } from '../models/index.js';

const router = Router();
const allowedFields = ['orderNumber', 'clientId', 'equipmentId', 'receivedBy', 'assignedTechnician', 'reportedProblem', 'diagnosis', 'solution', 'status', 'priority', 'estimatedCost', 'finalCost', 'receivedAt', 'deliveredAt'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getOrderFilters = (query) => {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.clientId) where.clientId = query.clientId;
  if (query.assignedTechnician) where.assignedTechnician = query.assignedTechnician;
  if (query.orderNumber) where.orderNumber = { [Op.like]: `%${query.orderNumber}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getOrderFilters(req.query);

    const { count, rows } = await ServiceOrder.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: Client, as: 'client' },
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'receivedByUser' },
        { model: User, as: 'assignedTechnicianUser' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Service orders retrieved successfully' });
  } catch (error) {
    console.error('Error getting service orders:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const serviceOrder = await ServiceOrder.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'receivedByUser' },
        { model: User, as: 'assignedTechnicianUser' },
        { model: ServiceHistory, as: 'history' },
        { model: UsedPart, as: 'usedParts', include: [{ model: Inventory, as: 'inventoryItem' }] },
        { model: Attachment, as: 'attachments' },
        { model: Payment, as: 'payments' },
      ],
    });

    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: 'Service order not found' });
    }

    return res.status(200).json({ success: true, data: serviceOrder, message: 'Service order retrieved successfully' });
  } catch (error) {
    console.error('Error getting service order by id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.orderNumber || !payload.clientId || !payload.equipmentId || !payload.receivedBy || !payload.reportedProblem) {
      return res.status(400).json({ success: false, message: 'Incomplete service order data' });
    }

    const clientExists = await Client.findByPk(payload.clientId);
    if (!clientExists) return res.status(400).json({ success: false, message: 'Client does not exist' });

    const equipmentExists = await Equipment.findByPk(payload.equipmentId);
    if (!equipmentExists) return res.status(400).json({ success: false, message: 'Equipment does not exist' });

    const receivedByExists = await User.findByPk(payload.receivedBy);
    if (!receivedByExists) return res.status(400).json({ success: false, message: 'Receiver user does not exist' });

    if (payload.assignedTechnician) {
      const technicianExists = await User.findByPk(payload.assignedTechnician);
      if (!technicianExists) return res.status(400).json({ success: false, message: 'Assigned technician does not exist' });
    }

    const serviceOrder = await ServiceOrder.create(payload);
    return res.status(201).json({ success: true, data: serviceOrder, message: 'Service order created successfully' });
  } catch (error) {
    console.error('Error creating service order:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid service order data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const serviceOrder = await ServiceOrder.findByPk(req.params.id);
    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: 'Service order not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (payload.clientId) {
      const clientExists = await Client.findByPk(payload.clientId);
      if (!clientExists) return res.status(400).json({ success: false, message: 'Client does not exist' });
    }

    if (payload.equipmentId) {
      const equipmentExists = await Equipment.findByPk(payload.equipmentId);
      if (!equipmentExists) return res.status(400).json({ success: false, message: 'Equipment does not exist' });
    }

    if (payload.receivedBy) {
      const receivedByExists = await User.findByPk(payload.receivedBy);
      if (!receivedByExists) return res.status(400).json({ success: false, message: 'Receiver user does not exist' });
    }

    if (payload.assignedTechnician) {
      const technicianExists = await User.findByPk(payload.assignedTechnician);
      if (!technicianExists) return res.status(400).json({ success: false, message: 'Assigned technician does not exist' });
    }

    await serviceOrder.update(payload);
    return res.status(200).json({ success: true, data: serviceOrder, message: 'Service order updated successfully' });
  } catch (error) {
    console.error('Error updating service order:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const serviceOrder = await ServiceOrder.findByPk(req.params.id);
    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: 'Service order not found' });
    }

    const relatedHistory = await ServiceHistory.count({ where: { serviceOrderId: req.params.id } });
    const relatedUsedParts = await UsedPart.count({ where: { serviceOrderId: req.params.id } });
    const relatedAttachments = await Attachment.count({ where: { serviceOrderId: req.params.id } });
    const relatedPayments = await Payment.count({ where: { serviceOrderId: req.params.id } });

    if (relatedHistory > 0 || relatedUsedParts > 0 || relatedAttachments > 0 || relatedPayments > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete this order because it has related records' });
    }

    await serviceOrder.destroy();
    return res.status(200).json({ success: true, message: 'Service order deleted successfully' });
  } catch (error) {
    console.error('Error deleting service order:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
