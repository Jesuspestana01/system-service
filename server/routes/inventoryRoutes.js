import { Router } from 'express';
import { Op } from 'sequelize';
import { Inventory, InventoryMovement, UsedPart } from '../models/index.js';

const router = Router();
const allowedFields = ['name', 'description', 'category', 'brand', 'sku', 'quantity', 'minimumStock', 'unitPrice', 'status'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getInventoryFilters = (query) => {
  const where = {};
  if (query.category) where.category = { [Op.like]: `%${query.category}%` };
  if (query.status) where.status = query.status;
  if (query.name) where.name = { [Op.like]: `%${query.name}%` };
  if (query.brand) where.brand = { [Op.like]: `%${query.brand}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getInventoryFilters(req.query);

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: InventoryMovement, as: 'movements' },
        { model: UsedPart, as: 'usedParts' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Inventory retrieved successfully' });
  } catch (error) {
    console.error('Error getting inventory:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id, {
      include: [
        { model: InventoryMovement, as: 'movements' },
        { model: UsedPart, as: 'usedParts' },
      ],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    return res.status(200).json({ success: true, data: item, message: 'Inventory item retrieved successfully' });
  } catch (error) {
    console.error('Error getting inventory item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.name || !payload.category || !payload.sku) {
      return res.status(400).json({ success: false, message: 'Incomplete inventory data' });
    }

    const existing = await Inventory.findOne({ where: { sku: payload.sku } });
    if (existing) return res.status(409).json({ success: false, message: 'Inventory item already exists' });

    const item = await Inventory.create(payload);
    return res.status(201).json({ success: true, data: item, message: 'Inventory item created successfully' });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid inventory data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await item.update(payload);
    return res.status(200).json({ success: true, data: item, message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const movementsCount = await InventoryMovement.count({ where: { inventoryItemId: req.params.id } });
    const usedPartsCount = await UsedPart.count({ where: { inventoryItemId: req.params.id } });

    if (movementsCount > 0 || usedPartsCount > 0) {
      return res.status(409).json({ success: false, message: 'Cannot delete this inventory item because it has related movements or used parts' });
    }

    await item.destroy();
    return res.status(200).json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
