import { Router } from 'express';
import { Op } from 'sequelize';
import { ServiceHistory, ServiceOrder, User } from '../models/index.js';

const router = Router();
const allowedFields = ['serviceOrderId', 'userId', 'action', 'description', 'previousStatus', 'newStatus'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getHistoryFilters = (query) => {
  const where = {};
  if (query.serviceOrderId) where.serviceOrderId = query.serviceOrderId;
  if (query.userId) where.userId = query.userId;
  if (query.action) where.action = { [Op.like]: `%${query.action}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getHistoryFilters(req.query);

    const { count, rows } = await ServiceHistory.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: ServiceOrder, as: 'serviceOrder' },
        { model: User, as: 'user' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Service history retrieved successfully' });
  } catch (error) {
    console.error('Error getting service history:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const history = await ServiceHistory.findByPk(req.params.id, {
      include: [
        { model: ServiceOrder, as: 'serviceOrder' },
        { model: User, as: 'user' },
      ],
    });

    if (!history) {
      return res.status(404).json({ success: false, message: 'History entry not found' });
    }

    return res.status(200).json({ success: true, data: history, message: 'History entry retrieved successfully' });
  } catch (error) {
    console.error('Error getting history entry:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.serviceOrderId || !payload.userId || !payload.action) {
      return res.status(400).json({ success: false, message: 'Incomplete history data' });
    }

    const orderExists = await ServiceOrder.findByPk(payload.serviceOrderId);
    if (!orderExists) return res.status(400).json({ success: false, message: 'Service order does not exist' });

    const userExists = await User.findByPk(payload.userId);
    if (!userExists) return res.status(400).json({ success: false, message: 'User does not exist' });

    const entry = await ServiceHistory.create(payload);
    return res.status(201).json({ success: true, data: entry, message: 'History entry created successfully' });
  } catch (error) {
    console.error('Error creating history entry:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid history data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const history = await ServiceHistory.findByPk(req.params.id);
    if (!history) {
      return res.status(404).json({ success: false, message: 'History entry not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await history.update(payload);
    return res.status(200).json({ success: true, data: history, message: 'History entry updated successfully' });
  } catch (error) {
    console.error('Error updating history entry:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const history = await ServiceHistory.findByPk(req.params.id);
    if (!history) {
      return res.status(404).json({ success: false, message: 'History entry not found' });
    }

    await history.destroy();
    return res.status(200).json({ success: true, message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
