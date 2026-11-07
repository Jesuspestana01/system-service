import { Router } from 'express';
import { Op } from 'sequelize';
import { Client, Equipment, ServiceOrder } from '../models/index.js';

const router = Router();
const allowedFields = ['name', 'lastName', 'identityDocument', 'email', 'phone', 'address'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getClientFilters = (query) => {
  const where = {};
  if (query.name) where.name = { [Op.like]: `%${query.name}%` };
  if (query.lastName) where.lastName = { [Op.like]: `%${query.lastName}%` };
  if (query.email) where.email = { [Op.like]: `%${query.email}%` };
  if (query.identityDocument) where.identityDocument = { [Op.like]: `%${query.identityDocument}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getClientFilters(req.query);

    const { count, rows } = await Client.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: Equipment, as: 'equipment' },
        { model: ServiceOrder, as: 'serviceOrders' },
      ],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: { total: count, limit, offset },
      message: 'Clients retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: ServiceOrder, as: 'serviceOrders' },
      ],
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    return res.status(200).json({ success: true, data: client, message: 'Client retrieved successfully' });
  } catch (error) {
    console.error('Error getting client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.name || !payload.lastName || !payload.identityDocument || !payload.email || !payload.phone) {
      return res.status(400).json({ success: false, message: 'Incomplete client data' });
    }

    const exists = await Client.findOne({
      where: {
        [Op.or]: [{ email: payload.email }, { identityDocument: payload.identityDocument }],
      },
    });

    if (exists) {
      return res.status(409).json({ success: false, message: 'Client already exists' });
    }

    const client = await Client.create(payload);
    return res.status(201).json({ success: true, data: client, message: 'Client created successfully' });
  } catch (error) {
    console.error('Error creating client:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid client data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await client.update(payload);
    return res.status(200).json({ success: true, data: client, message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const equipmentCount = await Equipment.count({ where: { clientId: req.params.id } });
    const ordersCount = await ServiceOrder.count({ where: { clientId: req.params.id } });

    if (equipmentCount > 0 || ordersCount > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete this client because it has related equipment or service orders' });
    }

    await client.destroy();
    return res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
