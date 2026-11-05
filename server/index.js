import { Sequelize } from "sequelize";
import dotenv from 'dotenv'

dotenv.config();

// Debug info
console.log('Connecting to database:', process.env.CONNECTION_STRING)

// Initialize instance of Sequelize
const sequelize = process.env.CONNECTION_STRING 
  ? new Sequelize(process.env.CONNECTION_STRING, {
      logging: console.log(),
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    })
  : new Sequelize(
      process.env.DB_NAME, 
      process.env.DB_USER, 
      process.env.DB_PASSWORD, 
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false,
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        }
      }
    );

export {sequelize};