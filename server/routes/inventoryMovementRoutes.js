import { Router } from 'express';
import { Op } from 'sequelize';
import { InventoryMovement, Inventory, User } from '../models/index.js';

const router = Router();
const allowedFields = ['inventoryItemId', 'movementType', 'quantity', 'reason', 'performedBy', 'date'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getMovementFilters = (query) => {
  const where = {};
  if (query.inventoryItemId) where.inventoryItemId = query.inventoryItemId;
  if (query.movementType) where.movementType = query.movementType;
  if (query.performedBy) where.performedBy = query.performedBy;
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getMovementFilters(req.query);

    const { count, rows } = await InventoryMovement.findAndCountAll({
      where,
      limit,
      offset,
      order: [['date', 'DESC']],
      include: [
        { model: Inventory, as: 'inventoryItem' },
        { model: User, as: 'performedByUser' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Inventory movements retrieved successfully' });
  } catch (error) {
    console.error('Error getting inventory movements:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movement = await InventoryMovement.findByPk(req.params.id, {
      include: [
        { model: Inventory, as: 'inventoryItem' },
        { model: User, as: 'performedByUser' },
      ],
    });

    if (!movement) {
      return res.status(404).json({ success: false, message: 'Inventory movement not found' });
    }

    return res.status(200).json({ success: true, data: movement, message: 'Inventory movement retrieved successfully' });
  } catch (error) {
    console.error('Error getting inventory movement:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const transaction = await InventoryMovement.sequelize.transaction();

  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.inventoryItemId || !payload.movementType || !payload.quantity) {
      return res.status(400).json({ success: false, message: 'Incomplete inventory movement data' });
    }

    const inventoryItem = await Inventory.findByPk(payload.inventoryItemId, { transaction });
    if (!inventoryItem) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Inventory item does not exist' });
    }

    let newQuantity = Number(inventoryItem.quantity);
    if (payload.movementType === 'entrada') {
      newQuantity += Number(payload.quantity);
    } else if (payload.movementType === 'salida') {
      newQuantity -= Number(payload.quantity);
      if (newQuantity < 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Inventory quantity cannot be negative' });
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid movement type' });
    }

    await inventoryItem.update({ quantity: newQuantity }, { transaction });
    const movement = await InventoryMovement.create(payload, { transaction });

    await transaction.commit();
    return res.status(201).json({ success: true, data: movement, message: 'Inventory movement created successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating inventory movement:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid inventory movement data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const movement = await InventoryMovement.findByPk(req.params.id);
    if (!movement) {
      return res.status(404).json({ success: false, message: 'Inventory movement not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await movement.update(payload);
    return res.status(200).json({ success: true, data: movement, message: 'Inventory movement updated successfully' });
  } catch (error) {
    console.error('Error updating inventory movement:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const movement = await InventoryMovement.findByPk(req.params.id);
    if (!movement) {
      return res.status(404).json({ success: false, message: 'Inventory movement not found' });
    }

    await movement.destroy();
    return res.status(200).json({ success: true, message: 'Inventory movement deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory movement:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
