import net from "node:net";
import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

net.setDefaultAutoSelectFamily(false);

dotenv.config();

let sequelize = null;
const neonConnectionString = process.env.NEON_CONNECTION_STRING || process.env.CONNECTION_STRING;

if (neonConnectionString) {
  console.log('Trying to connect to Neon DB...');
  const tempSequelize = new Sequelize(neonConnectionString, {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    await tempSequelize.authenticate();
    console.log('Successful connection to Neon DB');
    sequelize = tempSequelize;
  } catch (error) {
    console.warn('Could not connect to Neon DB. Falling back to local PostgreSQL...');
    console.warn(`Error detail: ${error.message || error.original?.code || error}`);
  }
} else {
  console.log('No Neon DB connection string detected in the environment.');
}

if (!sequelize) {
  console.log('Trying to connect to local PostgreSQL...');
  const localSequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: process.env.DB_DIALECT || 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    }
  );

  try {
    await localSequelize.authenticate();
    console.log('Successful connection to local PostgreSQL');
    sequelize = localSequelize;
  } catch (error) {
    console.error('Critical error: Could not connect to the local database either.');
    console.error(error);
    process.exit(1);
  }
}

export { sequelize };