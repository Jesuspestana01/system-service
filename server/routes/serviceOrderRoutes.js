import { Router } from "express";
import { Op } from "sequelize";
import { sequelize } from "../index.js";
import {
  ServiceOrder,
  Client,
  Equipment,
  User,
  ServiceHistory,
  UsedPart,
  Attachment,
  Payment,
  Inventory,
} from "../models/index.js";

const router = Router();

const allowedFields = [
  "orderNumber",
  "clientId",
  "equipmentId",
  "receivedBy",
  "assignedTechnician",
  "reportedProblem",
  "diagnosis",
  "solution",
  "status",
  "priority",
  "discountPercent",
  "estimatedCost",
  "finalCost",
  "receivedAt",
  "deliveredAt",
];

// relations included when fetching an order
const orderIncludes = [
  { model: Client, as: "client" },
  { model: Equipment, as: "equipment" },
  { model: User, as: "receivedByUser" },
  { model: User, as: "assignedTechnicianUser" },
  {
    model: ServiceHistory,
    as: "history",
    include: [{ model: User, as: "user" }],
  },
  {
    model: UsedPart,
    as: "usedParts",
    include: [{ model: Inventory, as: "inventoryItem" }],
  },
  { model: Attachment, as: "attachments" },
  { model: Payment, as: "payments" },
];

// parse pagination params from query
const getPagination = (query) => {
  const limit = Number(query.limit ?? 100);
  const offset = Number(query.offset ?? 0);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 100,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : 0,
  };
};

// build where clause from query filters
const getOrderFilters = (query) => {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.clientId) where.clientId = query.clientId;
  if (query.assignedTechnician) where.assignedTechnician = query.assignedTechnician;
  if (query.orderNumber) where.orderNumber = { [Op.like]: `%${query.orderNumber}%` };
  return where;
};

// find order by numeric primary key or orderNumber code
const findOrderByIdentifier = async (identifier, options = {}) => {
  const raw = String(identifier ?? "").trim();
  if (/^\d+$/.test(raw)) {
    const byPk = await ServiceOrder.findByPk(Number(raw), options);
    if (byPk) return byPk;
  }
  return ServiceOrder.findOne({
    ...options,
    where: { ...(options.where || {}), orderNumber: raw },
  });
};

// generate next sequential orderNumber (e.g. OS-1001)
const generateNextOrderNumber = async (transaction) => {
  const orders = await ServiceOrder.findAll({
    attributes: ["id", "orderNumber"],
    transaction,
  });
  const maxNumber = orders.reduce((max, item) => {
    const match = String(item.orderNumber ?? "").match(/(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1000);
  return `OS-${maxNumber + 1}`;
};

// resolve technician user id from id or full name
const resolveTechnicianId = async (value, transaction) => {
  if (!value || value === "Sin asignar") return null;
  if (/^\d+$/.test(String(value))) {
    const user = await User.findByPk(Number(value), { transaction });
    return user ? user.id : null;
  }
  const users = await User.findAll({ transaction });
  const target = String(value).trim().toLowerCase();
  const matched = users.find((u) => {
    const fullName = `${u.name ?? ""} ${u.lastName ?? ""}`.trim().toLowerCase();
    return fullName === target || String(u.name ?? "").trim().toLowerCase() === target;
  });
  return matched ? matched.id : null;
};

// resolve receiver user id with fallback to any existing user
const resolveReceiverUserId = async (receivedBy, fallbackTechId, transaction) => {
  if (receivedBy && /^\d+$/.test(String(receivedBy))) {
    const user = await User.findByPk(Number(receivedBy), { transaction });
    if (user) return user.id;
  }
  if (fallbackTechId) return fallbackTechId;
  const anyUser = await User.findOne({ order: [["id", "ASC"]], transaction });
  return anyUser ? anyUser.id : null;
};

// recalculate and persist order finalCost based on usedParts and discountPercent
const recalculateOrderCosts = async (serviceOrderId, transaction) => {
  const order = await ServiceOrder.findByPk(serviceOrderId, { transaction });
  if (!order) return;
  const items = await UsedPart.findAll({ where: { serviceOrderId }, transaction });

  const gross = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const lineDiscounts = items.reduce((sum, item) => {
    const lineGross = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    return sum + lineGross * ((Number(item.discountPercent) || 0) / 100);
  }, 0);
  const afterLine = gross - lineDiscounts;
  const globalDiscount = afterLine * ((Number(order.discountPercent) || 0) / 100);
  const finalCost = Math.max(0, afterLine - globalDiscount);

  await order.update(
    {
      estimatedCost: Number(gross.toFixed(2)),
      finalCost: Number(finalCost.toFixed(2)),
    },
    { transaction }
  );
};

// list all service orders
router.get("/", async (req, res) => {
  try {
    const { limit, offset } = getPagination(req.query);
    const where = getOrderFilters(req.query);

    const { count, rows } = await ServiceOrder.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [["id", "DESC"]],
      include: orderIncludes,
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: { total: count, limit, offset },
      message: "Service orders retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting service orders:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// get single service order by id or orderNumber
router.get("/:id", async (req, res) => {
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, {
      include: orderIncludes,
    });

    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    return res.status(200).json({
      success: true,
      data: serviceOrder,
      message: "Service order retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting service order by id:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// create new service order and associated equipment
router.post("/", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const clientId = Number(req.body.clientId ?? req.body.customerId);
    if (!clientId) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Client is required" });
    }

    const clientExists = await Client.findByPk(clientId, { transaction });
    if (!clientExists) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Client does not exist" });
    }

    // find or create equipment if device details were sent
    let equipmentId = req.body.equipmentId ? Number(req.body.equipmentId) : null;
    if (!equipmentId) {
      const serialNumber = String(req.body.serialNumber ?? req.body.serial ?? "").trim().toUpperCase();
      const deviceType = String(req.body.deviceType ?? "iPhone").trim();
      const model = String(req.body.model ?? req.body.device ?? deviceType).trim();

      if (!serialNumber) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "Equipment serial number is required" });
      }

      let equipment = await Equipment.findOne({ where: { serialNumber }, transaction });
      if (equipment) {
        await equipment.update(
          {
            clientId,
            deviceType,
            model,
            color: req.body.color ?? equipment.color,
            accessories: req.body.accessories ?? equipment.accessories,
            physicalCondition: req.body.physicalCondition ?? equipment.physicalCondition,
          },
          { transaction }
        );
      } else {
        equipment = await Equipment.create(
          {
            clientId,
            deviceType,
            brand: req.body.brand || "Apple",
            model,
            serialNumber,
            color: req.body.color || null,
            accessories: req.body.accessories || null,
            physicalCondition: req.body.physicalCondition || null,
          },
          { transaction }
        );
      }
      equipmentId = equipment.id;
    }

    const assignedTechnician = await resolveTechnicianId(
      req.body.assignedTechnician ?? req.body.technicianId ?? req.body.technician,
      transaction
    );
    const receivedBy = await resolveReceiverUserId(
      req.body.receivedBy,
      assignedTechnician,
      transaction
    );

    if (!receivedBy) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "At least one registered user is required to receive the order",
      });
    }

    const orderNumber = req.body.orderNumber || (await generateNextOrderNumber(transaction));
    const created = await ServiceOrder.create(
      {
        orderNumber,
        clientId,
        equipmentId,
        receivedBy,
        assignedTechnician,
        reportedProblem: req.body.reportedProblem ?? "",
        diagnosis: req.body.diagnosis ?? null,
        status: req.body.status || "Recibido",
        priority: req.body.priority || "media",
        discountPercent: Number(req.body.discountPercent) || 0,
        receivedAt: req.body.receivedAt || new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    const fullOrder = await ServiceOrder.findByPk(created.id, { include: orderIncludes });
    return res.status(201).json({
      success: true,
      data: fullOrder,
      message: "Service order created successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating service order:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// update order and its equipment data
const handleUpdateOrderAndEquipment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, { transaction });
    if (!serviceOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const clientId = Number(req.body.clientId ?? req.body.customerId ?? serviceOrder.clientId);
    const equipment = await Equipment.findByPk(serviceOrder.equipmentId, { transaction });

    if (equipment) {
      const nextSerial = String(
        req.body.serialNumber ?? req.body.serial ?? equipment.serialNumber
      )
        .trim()
        .toUpperCase();

      await equipment.update(
        {
          clientId,
          deviceType: req.body.deviceType ?? equipment.deviceType,
          model: req.body.model ?? req.body.device ?? equipment.model,
          serialNumber: nextSerial,
          color: req.body.color !== undefined ? req.body.color : equipment.color,
          accessories: req.body.accessories !== undefined ? req.body.accessories : equipment.accessories,
          physicalCondition:
            req.body.physicalCondition !== undefined
              ? req.body.physicalCondition
              : equipment.physicalCondition,
        },
        { transaction }
      );
    }

    const orderUpdates = { clientId };
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) orderUpdates[field] = req.body[field];
    });

    if (
      req.body.assignedTechnician !== undefined ||
      req.body.technicianId !== undefined ||
      req.body.technician !== undefined
    ) {
      orderUpdates.assignedTechnician = await resolveTechnicianId(
        req.body.assignedTechnician ?? req.body.technicianId ?? req.body.technician,
        transaction
      );
    }

    await serviceOrder.update(orderUpdates, { transaction });
    await transaction.commit();

    const updated = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(200).json({
      success: true,
      data: updated,
      message: "Service order updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating service order:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

router.put("/:id", handleUpdateOrderAndEquipment);
router.put("/:id/equipment", handleUpdateOrderAndEquipment);

// update order status
router.patch("/:id/status", async (req, res) => {
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id);
    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    await serviceOrder.update({
      status,
      deliveredAt: status === "Entregado" ? new Date() : serviceOrder.deliveredAt,
    });

    const updated = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(200).json({
      success: true,
      data: updated,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// update order initial diagnosis and reported problem
router.patch("/:id/diagnosis", async (req, res) => {
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id);
    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    await serviceOrder.update({
      reportedProblem: req.body.reportedProblem ?? serviceOrder.reportedProblem ?? "",
      diagnosis: req.body.diagnosis ?? serviceOrder.diagnosis ?? "",
    });

    const updated = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(200).json({
      success: true,
      data: updated,
      message: "Order diagnosis updated successfully",
    });
  } catch (error) {
    console.error("Error updating diagnosis:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// add technician report to service history
router.post("/:id/reports", async (req, res) => {
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id);
    if (!serviceOrder) {
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const description = String(req.body.note ?? req.body.description ?? "").trim();
    if (!description) {
      return res.status(400).json({ success: false, message: "Report note is required" });
    }

    const authorId = await resolveTechnicianId(req.body.userId ?? req.body.author);
    const userId =
      authorId ||
      serviceOrder.assignedTechnician ||
      serviceOrder.receivedBy ||
      (await resolveReceiverUserId(null, null));

    const entry = await ServiceHistory.create({
      serviceOrderId: serviceOrder.id,
      userId,
      action: req.body.author ? `Informe técnico · ${req.body.author}` : "Informe técnico",
      description,
      createdAt: new Date(),
    });

    const fullEntry = await ServiceHistory.findByPk(entry.id, {
      include: [{ model: User, as: "user" }],
    });

    return res.status(201).json({
      success: true,
      data: fullEntry,
      message: "Report added successfully",
    });
  } catch (error) {
    console.error("Error adding order report:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// delete technician report from service history
router.delete("/:id/reports/:reportId", async (req, res) => {
  try {
    const report = await ServiceHistory.findByPk(req.params.reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    await report.destroy();
    return res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting order report:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// add billing item (inventory part or custom service)
router.post("/:id/items", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, { transaction });
    if (!serviceOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const itemType = req.body.type === "service" ? "service" : "inventory";
    const quantity = Math.max(1, Number(req.body.quantity) || 1);
    const unitPrice = Math.max(0, Number(req.body.unitPrice) || 0);
    const discountPercent = Math.min(100, Math.max(0, Number(req.body.discountPercent) || 0));

    let usedPart;

    if (itemType === "inventory" && req.body.inventoryItemId) {
      const inventoryItem = await Inventory.findByPk(req.body.inventoryItemId, { transaction });
      if (!inventoryItem) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Inventory item not found" });
      }
      if (inventoryItem.trackStock !== false) {
        if (Number(inventoryItem.quantity) < quantity) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: "Not enough stock available" });
        }

        await inventoryItem.update(
          { quantity: Number(inventoryItem.quantity) - quantity },
          { transaction }
        );
      }

      // merge quantity if this inventory item is already on the order
      const existing = await UsedPart.findOne({
        where: {
          serviceOrderId: serviceOrder.id,
          inventoryItemId: inventoryItem.id,
          itemType: "inventory",
        },
        transaction,
      });

      if (existing) {
        usedPart = await existing.update(
          { quantity: Number(existing.quantity) + quantity },
          { transaction }
        );
      } else {
        usedPart = await UsedPart.create(
          {
            serviceOrderId: serviceOrder.id,
            inventoryItemId: inventoryItem.id,
            itemType: "inventory",
            code: inventoryItem.sku || `INV-${inventoryItem.id}`,
            name: inventoryItem.name,
            quantity,
            unitPrice: unitPrice || Number(inventoryItem.unitPrice) || 0,
            discountPercent,
          },
          { transaction }
        );
      }
    } else {
      usedPart = await UsedPart.create(
        {
          serviceOrderId: serviceOrder.id,
          inventoryItemId: null,
          itemType: "service",
          code: req.body.code || "SERVICIO",
          name: String(req.body.name || "Servicio técnico").trim(),
          quantity,
          unitPrice,
          discountPercent,
        },
        { transaction }
      );
    }

    await recalculateOrderCosts(serviceOrder.id, transaction);
    await transaction.commit();

    const updatedOrder = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(201).json({
      success: true,
      data: updatedOrder,
      item: usedPart,
      message: "Billing item added successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding billing item:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// update billing item quantity, unitPrice or discountPercent
router.patch("/:id/items/:itemId", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, { transaction });
    if (!serviceOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const usedPart = await UsedPart.findByPk(req.params.itemId, { transaction });
    if (!usedPart) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Billing item not found" });
    }

    // adjust inventory stock if quantity changed on an inventory item
    if (req.body.quantity !== undefined && usedPart.inventoryItemId) {
      const nextQty = Math.max(1, Number(req.body.quantity) || 1);
      const delta = nextQty - Number(usedPart.quantity);
      if (delta !== 0) {
        const inventoryItem = await Inventory.findByPk(usedPart.inventoryItemId, { transaction });
        if (inventoryItem && inventoryItem.trackStock !== false) {
          if (delta > 0 && Number(inventoryItem.quantity) < delta) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "Not enough stock available" });
          }
          await inventoryItem.update(
            { quantity: Math.max(0, Number(inventoryItem.quantity) - delta) },
            { transaction }
          );
        }
      }
    }

    await usedPart.update(
      {
        quantity:
          req.body.quantity !== undefined
            ? Math.max(1, Number(req.body.quantity) || 1)
            : usedPart.quantity,
        unitPrice:
          req.body.unitPrice !== undefined
            ? Math.max(0, Number(req.body.unitPrice) || 0)
            : usedPart.unitPrice,
        discountPercent:
          req.body.discountPercent !== undefined
            ? Math.min(100, Math.max(0, Number(req.body.discountPercent) || 0))
            : usedPart.discountPercent,
      },
      { transaction }
    );

    await recalculateOrderCosts(serviceOrder.id, transaction);
    await transaction.commit();

    const updatedOrder = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Billing item updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating billing item:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// remove billing item and restore stock if from inventory
router.delete("/:id/items/:itemId", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, { transaction });
    if (!serviceOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const usedPart = await UsedPart.findByPk(req.params.itemId, { transaction });
    if (!usedPart) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Billing item not found" });
    }

    if (usedPart.inventoryItemId) {
      const inventoryItem = await Inventory.findByPk(usedPart.inventoryItemId, { transaction });
      if (inventoryItem && inventoryItem.trackStock !== false) {
        await inventoryItem.update(
          { quantity: Number(inventoryItem.quantity) + Number(usedPart.quantity) },
          { transaction }
        );
      }
    }

    await usedPart.destroy({ transaction });
    await recalculateOrderCosts(serviceOrder.id, transaction);
    await transaction.commit();

    const updatedOrder = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Billing item removed successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error removing billing item:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// update global billing discount percent
router.patch("/:id/billing", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, { transaction });
    if (!serviceOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const discountPercent = Math.min(100, Math.max(0, Number(req.body.discountPercent) || 0));
    await serviceOrder.update({ discountPercent }, { transaction });
    await recalculateOrderCosts(serviceOrder.id, transaction);
    await transaction.commit();

    const updatedOrder = await ServiceOrder.findByPk(serviceOrder.id, { include: orderIncludes });
    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Order billing updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating order billing:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// delete service order and restore stock of any used parts
router.delete("/:id", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const serviceOrder = await findOrderByIdentifier(req.params.id, { transaction });
    if (!serviceOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Service order not found" });
    }

    const usedParts = await UsedPart.findAll({
      where: { serviceOrderId: serviceOrder.id },
      transaction,
    });
    for (const part of usedParts) {
      if (part.inventoryItemId) {
        const inventoryItem = await Inventory.findByPk(part.inventoryItemId, { transaction });
        if (inventoryItem) {
          await inventoryItem.update(
            { quantity: Number(inventoryItem.quantity) + Number(part.quantity) },
            { transaction }
          );
        }
      }
    }

    await ServiceHistory.destroy({ where: { serviceOrderId: serviceOrder.id }, transaction });
    await UsedPart.destroy({ where: { serviceOrderId: serviceOrder.id }, transaction });
    await Attachment.destroy({ where: { serviceOrderId: serviceOrder.id }, transaction });
    await Payment.destroy({ where: { serviceOrderId: serviceOrder.id }, transaction });
    await serviceOrder.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ success: true, message: "Service order deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting service order:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
