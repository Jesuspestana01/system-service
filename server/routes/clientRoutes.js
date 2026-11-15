import { Router } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../index.js';
import {
  Client,
  Equipment,
  ServiceOrder,
  User,
  UsedPart,
  Inventory,
  ServiceHistory,
  Attachment,
  Payment,
} from '../models/index.js';

const router = Router();
const allowedFields = ['name', 'lastName', 'identityDocument', 'email', 'phone', 'address'];

// parse pagination params from query
const getPagination = (query) => {
  const limit = Number(query.limit ?? 100);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 100,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

// build filter conditions for client queries
const getClientFilters = (query) => {
  const where = {};
  if (query.name) where.name = { [Op.like]: `%${query.name}%` };
  if (query.lastName) where.lastName = { [Op.like]: `%${query.lastName}%` };
  if (query.email) where.email = { [Op.like]: `%${query.email}%` };
  if (query.identityDocument) where.identityDocument = { [Op.like]: `%${query.identityDocument}%` };
  return where;
};

// normalize incoming body fields from ui or api
const normalizeClientPayload = (body, isUpdate = false) => {
  const payload = {};
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) payload[field] = body[field];
  });

  if (!payload.identityDocument && body.document !== undefined) {
    payload.identityDocument = String(body.document).trim();
  }

  if (payload.name !== undefined && !body.lastName) {
    const parts = String(payload.name).trim().split(/\s+/);
    payload.name = parts[0] || '';
    payload.lastName = parts.slice(1).join(' ') || '-';
  }

  if (!isUpdate && (!payload.email || !String(payload.email).trim())) {
    const cleanDoc = String(payload.identityDocument || Date.now())
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    payload.email = `cliente.${cleanDoc}@ispot.local`;
  } else if (isUpdate && payload.email !== undefined && !String(payload.email).trim()) {
    delete payload.email;
  }

  return payload;
};

// list all clients with equipment and service orders
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getClientFilters(req.query);

    const { count, rows } = await Client.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
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

// get single client by id with full order history
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: Equipment, as: 'equipment' },
        {
          model: ServiceOrder,
          as: 'serviceOrders',
          include: [
            { model: Equipment, as: 'equipment' },
            { model: User, as: 'assignedTechnicianUser' },
            {
              model: UsedPart,
              as: 'usedParts',
              include: [{ model: Inventory, as: 'inventoryItem' }],
            },
          ],
        },
      ],
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    return res.status(200).json({
      success: true,
      data: client,
      message: 'Client retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// create new client
router.post('/', async (req, res) => {
  try {
    const payload = normalizeClientPayload(req.body, false);

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
    return res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully',
    });
  } catch (error) {
    console.error('Error creating client:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid client data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// update existing client by id
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (req.body.id !== undefined && Number(req.body.id) !== Number(client.id)) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = normalizeClientPayload(req.body, true);
    await client.update(payload);

    const updated = await Client.findByPk(client.id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: ServiceOrder, as: 'serviceOrders' },
      ],
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Client updated successfully',
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// delete client and associated orders/equipment in transaction
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const client = await Client.findByPk(req.params.id, { transaction });
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const clientOrders = await ServiceOrder.findAll({
      where: { clientId: client.id },
      transaction,
    });

    for (const order of clientOrders) {
      await ServiceHistory.destroy({ where: { serviceOrderId: order.id }, transaction });
      await UsedPart.destroy({ where: { serviceOrderId: order.id }, transaction });
      await Attachment.destroy({ where: { serviceOrderId: order.id }, transaction });
      await Payment.destroy({ where: { serviceOrderId: order.id }, transaction });
    }

    await ServiceOrder.destroy({ where: { clientId: client.id }, transaction });
    await Equipment.destroy({ where: { clientId: client.id }, transaction });
    await client.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting client:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
