import { Router } from 'express';
import { Op } from 'sequelize';
import { UsedPart, ServiceOrder, Inventory } from '../models/index.js';

const router = Router();
const allowedFields = ['serviceOrderId', 'inventoryItemId', 'quantity', 'unitPrice'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getUsedPartFilters = (query) => {
  const where = {};
  if (query.serviceOrderId) where.serviceOrderId = query.serviceOrderId;
  if (query.inventoryItemId) where.inventoryItemId = query.inventoryItemId;
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getUsedPartFilters(req.query);

    const { count, rows } = await UsedPart.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: ServiceOrder, as: 'serviceOrder' },
        { model: Inventory, as: 'inventoryItem' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Used parts retrieved successfully' });
  } catch (error) {
    console.error('Error getting used parts:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const usedPart = await UsedPart.findByPk(req.params.id, {
      include: [
        { model: ServiceOrder, as: 'serviceOrder' },
        { model: Inventory, as: 'inventoryItem' },
      ],
    });

    if (!usedPart) {
      return res.status(404).json({ success: false, message: 'Used part not found' });
    }

    return res.status(200).json({ success: true, data: usedPart, message: 'Used part retrieved successfully' });
  } catch (error) {
    console.error('Error getting used part:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const transaction = await UsedPart.sequelize.transaction();

  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.serviceOrderId || !payload.inventoryItemId || !payload.quantity) {
      return res.status(400).json({ success: false, message: 'Incomplete used part data' });
    }

    const serviceOrderExists = await ServiceOrder.findByPk(payload.serviceOrderId, { transaction });
    if (!serviceOrderExists) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Service order does not exist' });
    }

    const inventoryItem = await Inventory.findByPk(payload.inventoryItemId, { transaction });
    if (!inventoryItem) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Inventory item does not exist' });
    }

    if (Number(inventoryItem.quantity) < Number(payload.quantity)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Not enough stock for this item' });
    }

    await inventoryItem.update({ quantity: Number(inventoryItem.quantity) - Number(payload.quantity) }, { transaction });
    const usedPart = await UsedPart.create(payload, { transaction });

    await transaction.commit();
    return res.status(201).json({ success: true, data: usedPart, message: 'Used part created successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating used part:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid used part data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const usedPart = await UsedPart.findByPk(req.params.id);
    if (!usedPart) {
      return res.status(404).json({ success: false, message: 'Used part not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await usedPart.update(payload);
    return res.status(200).json({ success: true, data: usedPart, message: 'Used part updated successfully' });
  } catch (error) {
    console.error('Error updating used part:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const usedPart = await UsedPart.findByPk(req.params.id);
    if (!usedPart) {
      return res.status(404).json({ success: false, message: 'Used part not found' });
    }

    await usedPart.destroy();
    return res.status(200).json({ success: true, message: 'Used part deleted successfully' });
  } catch (error) {
    console.error('Error deleting used part:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
