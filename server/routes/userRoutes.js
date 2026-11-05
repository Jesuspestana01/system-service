import { Router } from "express";
import { User } from "../models/userModel.js";
import { sequelize } from "../index.js";

const router = Router();

// GET all users
router.get("/", async (request, response) => {
  try {
    const users = await User.findAll();
    return response.json({ users });
  } catch (error) {
    console.error("Something went wrong:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
});

// Create a user
router.post("/", async (request, response) => {
  const t = await sequelize.transaction();
  try {
    let data = request.body;

    const userExist = await User.findOne({
      where: {
        email: data.email,
      }});

    if (userExist) {
      return response.status(409).json({ message: "User already exists" });
    }

    // create new user
    const newUser = await User.create(
      {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      },
        { t },
    );

    await t.commit();
    return response.status(201).json({
      success: true,
      data: {
        userId: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    await t.rollback()
    // Check if body data is ok
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.name === "SequelizeValidationError"
    ) {
      return response
        .status(400)
        .json({
          status: "error",
          message: "Body data is incomplete or unique",
          error: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
    }
    console.error("Error creating user:", error);
    return response.status(500).json({
      message: "An error has ocurred during user creation:",
      error,
    });
  }
});
export default router;