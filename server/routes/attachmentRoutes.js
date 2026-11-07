import { Router } from 'express';
import { Op } from 'sequelize';
import { Attachment, ServiceOrder, User } from '../models/index.js';

const router = Router();
const allowedFields = ['serviceOrderId', 'fileName', 'fileUrl', 'fileType', 'uploadedBy', 'uploadedAt'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const getAttachmentFilters = (query) => {
  const where = {};
  if (query.serviceOrderId) where.serviceOrderId = query.serviceOrderId;
  if (query.uploadedBy) where.uploadedBy = query.uploadedBy;
  if (query.fileType) where.fileType = { [Op.like]: `%${query.fileType}%` };
  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getAttachmentFilters(req.query);

    const { count, rows } = await Attachment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: ServiceOrder, as: 'serviceOrder' },
        { model: User, as: 'uploadedByUser' },
      ],
    });

    return res.status(200).json({ success: true, data: rows, pagination: { total: count, limit, offset }, message: 'Attachments retrieved successfully' });
  } catch (error) {
    console.error('Error getting attachments:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id, {
      include: [
        { model: ServiceOrder, as: 'serviceOrder' },
        { model: User, as: 'uploadedByUser' },
      ],
    });

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    return res.status(200).json({ success: true, data: attachment, message: 'Attachment retrieved successfully' });
  } catch (error) {
    console.error('Error getting attachment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (!payload.serviceOrderId || !payload.fileName || !payload.fileUrl) {
      return res.status(400).json({ success: false, message: 'Incomplete attachment data' });
    }

    const orderExists = await ServiceOrder.findByPk(payload.serviceOrderId);
    if (!orderExists) return res.status(400).json({ success: false, message: 'Service order does not exist' });

    if (payload.uploadedBy) {
      const userExists = await User.findByPk(payload.uploadedBy);
      if (!userExists) return res.status(400).json({ success: false, message: 'User does not exist' });
    }

    const attachment = await Attachment.create(payload);
    return res.status(201).json({ success: true, data: attachment, message: 'Attachment created successfully' });
  } catch (error) {
    console.error('Error creating attachment:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Invalid attachment data' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    if (req.body.id !== undefined) {
      return res.status(400).json({ success: false, message: 'Primary key cannot be modified' });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    await attachment.update(payload);
    return res.status(200).json({ success: true, data: attachment, message: 'Attachment updated successfully' });
  } catch (error) {
    console.error('Error updating attachment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    await attachment.destroy();
    return res.status(200).json({ success: true, message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
