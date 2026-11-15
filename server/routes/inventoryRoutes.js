import { Router } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../index.js';
import { Inventory, InventoryMovement, UsedPart } from '../models/index.js';

const router = Router();
const allowedFields = [
  'name',
  'description',
  'category',
  'brand',
  'sku',
  'quantity',
  'minimumStock',
  'unitPrice',
  'status',
];

// parse pagination query params
const getPagination = (query) => {
  const limit = Number(query.limit ?? 100);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 100,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

// build filter conditions for inventory queries
const getInventoryFilters = (query) => {
  const where = {};
  if (query.category) where.category = { [Op.like]: `%${query.category}%` };
  if (query.status) where.status = query.status;
  if (query.name) where.name = { [Op.like]: `%${query.name}%` };
  if (query.brand) where.brand = { [Op.like]: `%${query.brand}%` };
  return where;
};

// generate next sequential sku code (e.g. INV-001)
const generateNextSku = async () => {
  const items = await Inventory.findAll({ attributes: ['id', 'sku'] });
  const maxNumber = items.reduce((max, item) => {
    const match = String(item.sku ?? '').match(/^INV-(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `INV-${String(maxNumber + 1).padStart(3, '0')}`;
};

// normalize incoming body fields from ui or api
const normalizeInventoryPayload = (body) => {
  const payload = {};
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) payload[field] = body[field];
  });

  if (payload.quantity === undefined && body.stock !== undefined) {
    payload.quantity = Math.max(0, Number(body.stock) || 0);
  }
  if (payload.minimumStock === undefined && body.minStock !== undefined) {
    payload.minimumStock = Math.max(0, Number(body.minStock) || 0);
  }
  if (payload.unitPrice === undefined && body.price !== undefined) {
    payload.unitPrice = Math.max(0, Number(body.price) || 0);
  }
  if (payload.brand === undefined && body.supplier !== undefined) {
    payload.brand = String(body.supplier || '').trim() || null;
  }
  if (payload.quantity !== undefined && !body.status) {
    payload.status = Number(payload.quantity) > 0 ? 'disponible' : 'agotado';
  }

  return payload;
};

// list all inventory items
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getInventoryFilters(req.query);

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [['id', 'DESC']],
      include: [
        { model: InventoryMovement, as: 'movements' },
        { model: UsedPart, as: 'usedParts' },
      ],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: { total: count, limit, offset },
      message: 'Inventory retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting inventory:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// get single inventory item by id
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

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Inventory item retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting inventory item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// create new inventory item
router.post('/', async (req, res) => {
  try {
    const payload = normalizeInventoryPayload(req.body);
    if (!payload.sku) {
      payload.sku = await generateNextSku();
    }

    if (!payload.name || !payload.category || !payload.sku) {
      return res.status(400).json({ success: false, message: 'Incomplete inventory data' });
    }

    const existing = await Inventory.findOne({ where: { sku: payload.sku } });
    if (existing) {
      payload.sku = `INV-${Date.now().toString().slice(-5)}`;
    }

    const item = await Inventory.create(payload);
    return res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully',
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid inventory data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// update existing inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (req.body.id !== undefined && Number(req.body.id) !== Number(item.id)) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = normalizeInventoryPayload(req.body);
    await item.update(payload);

    return res.status(200).json({
      success: true,
      data: item,
      message: 'Inventory item updated successfully',
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// adjust inventory stock and record movement
router.patch('/:id/stock', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Inventory.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const prevQuantity = Number(item.quantity) || 0;
    const nextQuantity =
      req.body.quantity !== undefined
        ? Math.max(0, Number(req.body.quantity) || 0)
        : Math.max(0, prevQuantity + (Number(req.body.delta) || 0));

    const actualDelta = nextQuantity - prevQuantity;

    await item.update(
      {
        quantity: nextQuantity,
        status: nextQuantity > 0 ? 'disponible' : 'agotado',
      },
      { transaction }
    );

    if (actualDelta !== 0) {
      await InventoryMovement.create(
        {
          inventoryItemId: item.id,
          movementType: actualDelta > 0 ? 'entrada' : 'salida',
          quantity: Math.abs(actualDelta),
          reason: req.body.reason || 'Ajuste manual en inventario',
          performedBy: req.body.performedBy ? Number(req.body.performedBy) : null,
          date: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      data: item,
      message: 'Inventory stock adjusted successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adjusting inventory stock:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// delete inventory item and clean up related movements
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const item = await Inventory.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    await InventoryMovement.destroy({ where: { inventoryItemId: item.id }, transaction });
    await UsedPart.update(
      { inventoryItemId: null, itemType: 'service' },
      { where: { inventoryItemId: item.id }, transaction }
    );
    await item.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting inventory item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
