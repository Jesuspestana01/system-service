import { Router } from 'express';
import { Op } from 'sequelize';
import { Equipment, Client, ServiceOrder } from '../models/index.js';

const router = Router();
const allowedFields = ['clientId', 'deviceType', 'brand', 'model', 'serialNumber', 'color', 'accessories', 'physicalCondition', 'observations'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getEquipmentFilters = (query) => {
  const where = {};
  if (query.clientId) where.clientId = query.clientId;
  if (query.deviceType) where.deviceType = { [Op.like]: `%${query.deviceType}%` };
  if (query.brand) where.brand = { [Op.like]: `%${query.brand}%` };
  if (query.model) where.model = { [Op.like]: `%${query.model}%` };
  if (query.serialNumber) where.serialNumber = { [Op.like]: `%${query.serialNumber}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getEquipmentFilters(req.query);

    const { count, rows } = await Equipment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: Client, as: 'client' },
        { model: ServiceOrder, as: 'serviceOrders' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Equipment retrieved successfully' });
  } catch (error) {
    console.error('Error getting equipment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: ServiceOrder, as: 'serviceOrders' },
      ],
    });

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    return res.status(200).json({ success: true, data: equipment, message: 'Equipment retrieved successfully' });
  } catch (error) {
    console.error('Error getting equipment by id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.clientId || !payload.deviceType || !payload.brand || !payload.model || !payload.serialNumber) {
      return res.status(400).json({ success: false, message: 'Incomplete equipment data' });
    }

    const clientExists = await Client.findByPk(payload.clientId);
    if (!clientExists) {
      return res.status(400).json({ success: false, message: 'Client does not exist' });
    }

    const equipment = await Equipment.create(payload);
    return res.status(201).json({ success: true, data: equipment, message: 'Equipment created successfully' });
  } catch (error) {
    console.error('Error creating equipment:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid equipment data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
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
      if (!clientExists) {
        return res.status(400).json({ success: false, message: 'Client does not exist' });
      }
    }

    await equipment.update(payload);
    return res.status(200).json({ success: true, data: equipment, message: 'Equipment updated successfully' });
  } catch (error) {
    console.error('Error updating equipment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    const orderCount = await ServiceOrder.count({ where: { equipmentId: req.params.id } });
    if (orderCount > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete equipment because it has related service orders' });
    }

    await equipment.destroy();
    return res.status(200).json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
