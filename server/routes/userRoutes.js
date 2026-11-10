import { Router } from 'express';
import { Op } from 'sequelize';
import { User, ServiceOrder, Attachment, InventoryMovement, ServiceHistory } from '../models/index.js';

const router = Router();

const allowedFields = ['name', 'lastName', 'username', 'email', 'password', 'role', 'status'];

const getPagination = (query) => {
  const limit = Number(query.limit ?? 10);
  const offset = Number(query.offset ?? 0);

  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const plainUser = user.toJSON ? user.toJSON() : { ...user };
  delete plainUser.password;
  return plainUser;
};

const getUserFilters = (query) => {
  const where = {};

  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.name) where.name = { [Op.like]: `%${query.name}%` };
  if (query.email) where.email = { [Op.like]: `%${query.email}%` };

  return where;
};

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getUserFilters(req.query);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit,
        offset,
      },
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: ServiceOrder, as: 'receivedOrders' },
        { model: ServiceOrder, as: 'assignedOrders' },
        { model: InventoryMovement, as: 'inventoryMovements' },
        { model: ServiceHistory, as: 'serviceHistory' },
        { model: Attachment, as: 'uploadedAttachments' },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.post('/', async (req, res) => {
  const { body } = req;

  try {
    const payload = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) payload[field] = body[field];
    });

    if (!payload.name || !payload.lastName || !payload.username || !payload.email || !payload.password || !payload.role) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete user data',
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: payload.email }, { username: payload.username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const newUser = await User.create(payload);

    return res.status(201).json({
      success: true,
      data: sanitizeUser(newUser),
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (req.body.id !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Primary key cannot be modified',
      });
    }

    await user.update(payload);

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const relatedOrdersCount = await ServiceOrder.count({ where: { [Op.or]: [{ receivedBy: req.params.id }, { assignedTechnician: req.params.id }] } });
    const relatedHistoryCount = await ServiceHistory.count({ where: { userId: req.params.id } });
    const relatedMovementsCount = await InventoryMovement.count({ where: { performedBy: req.params.id } });
    const relatedAttachmentsCount = await Attachment.count({ where: { uploadedBy: req.params.id } });

    if (relatedOrdersCount > 0 || relatedHistoryCount > 0 || relatedMovementsCount > 0 || relatedAttachmentsCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete this user because it has related records',
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.post('/login', async (req, res) => {
  let data = req.body;
  // Validation to confirm if user exists and the password is correct
  try {
    const existingUser = await User.findOne({
      where: {
        email: data.email,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist." });
    } else {
      if (existingUser) {
         let comparison = data.password == existingUser.password
        if (comparison == false) {
          return res.status(401).json({ message: "Invalid credentials." });
        }
      }
    }
    const userRole = existingUser.role
    const payload = {
      sub: existingUser.id,
      role: userRole.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    };
    console.log(userRole.name);
    let token = jwt.sign(payload, process.env.SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
      path: "/",
      domain: "localhost",
    });

    console.log("Cookie being set:", token);
    res.status(200).json({ message: "Login OK" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Database error occurred" });
  }
})

export default router;