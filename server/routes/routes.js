// Main imports ES MODULE
import express from 'express';
import { sequelize } from '../index.js';
import cors from 'cors'

// Routes
import userRoutes from "./userRoutes.js"

const app = express();
const port = process.env.PORT;

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
)
app.use(express.json());

// Endpoints
app.use('/users', userRoutes)

// Initiate server
sequelize
    .authenticate()
    .then(() => {
        console.log("Connection success");
        return sequelize.sync()
    })
    .then(() => {
        console.log("Synchronizing Database Models")
        app.listen(port, () => {
            console.log(`Server is being listen on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Connection failed:", error);
    })