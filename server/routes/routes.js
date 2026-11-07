// Main imports ES MODULE
import express from 'express';
import cors from 'cors';
import { sequelize } from '../index.js';

// Routes
import userRoutes from './userRoutes.js';
import clientRoutes from './clientRoutes.js';
import equipmentRoutes from './equipmentRoutes.js';
import serviceOrderRoutes from './serviceOrderRoutes.js';
import serviceHistoryRoutes from './serviceHistoryRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import inventoryMovementRoutes from './inventoryMovementRoutes.js';
import usedPartRoutes from './usedPartRoutes.js';
import attachmentRoutes from './attachmentRoutes.js';
import paymentRoutes from './paymentRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Endpoints
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-movements', inventoryMovementRoutes);
app.use('/api/used-parts', usedPartRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/payments', paymentRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection success');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Synchronizing Database Models');
    app.listen(port, () => {
      console.log(`Server is being listen on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Connection failed:', error);
  });