import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let poolConfig;
// Neon connection
if (process.env.DB_CONNECTION_STRING) {
  poolConfig = {
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  };
} 
// Local connection
else {
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  };
}

export const db = new Pool(poolConfig);

db.on('connect', () => {
  console.log("Connected to database")
})