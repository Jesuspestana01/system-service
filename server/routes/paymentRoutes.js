import { Router } from 'express';
import { Op } from 'sequelize';
import { Payment, ServiceOrder } from '../models/index.js';

const router = Router();
const allowedFields = ['serviceOrderId', 'amount', 'paymentMethod', 'paymentStatus', 'paymentDate'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getPaymentFilters = (query) => {
  const where = {};
  if (query.serviceOrderId) where.serviceOrderId = query.serviceOrderId;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) where.paymentMethod = { [Op.like]: `%${query.paymentMethod}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getPaymentFilters(req.query);

    const { count, rows } = await Payment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [{ model: ServiceOrder, as: 'serviceOrder' }],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Payments retrieved successfully' });
  } catch (error) {
    console.error('Error getting payments:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: ServiceOrder, as: 'serviceOrder' }],
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.status(200).json({ success: true, data: payment, message: 'Payment retrieved successfully' });
  } catch (error) {
    console.error('Error getting payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.serviceOrderId || !payload.amount || !payload.paymentMethod) {
      return res.status(400).json({ success: false, message: 'Incomplete payment data' });
    }

    const orderExists = await ServiceOrder.findByPk(payload.serviceOrderId);
    if (!orderExists) return res.status(400).json({ success: false, message: 'Service order does not exist' });

    const payment = await Payment.create(payload);
    return res.status(201).json({ success: true, data: payment, message: 'Payment created successfully' });
  } catch (error) {
    console.error('Error creating payment:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid payment data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await payment.update(payload);
    return res.status(200).json({ success: true, data: payment, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await payment.destroy();
    return res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
