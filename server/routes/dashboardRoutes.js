import { Router } from "express";
import { Op } from "sequelize";
import { sequelize } from "../index.js";
import { Client, Inventory, ServiceOrder } from "../models/index.js";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const { count: servicesCount } = await ServiceOrder.findAndCountAll();
    const { count: customerCount } = await Client.findAndCountAll();
    const { count: inventoryCount } = await Inventory.findAndCountAll({
      where: {
        quantity: {
          [Op.lt]: sequelize.col("minimumStock"),
        },
      },
      limit: 0,
    });

    res.status(200).json({
      success: true,
      count: {
        orders: servicesCount,
        customers: customerCount,
        inventory: inventoryCount,
      },
      message: "Total items count retrieved successfully",
    });
  } catch (error) {
    console.error("Error deleting service order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;
