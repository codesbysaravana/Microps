import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development' || process.argv.some(arg => arg.includes('ts-node') || arg.includes('nodemon'));
const envFile = isDev ? '.env.development' : '.env.production';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config();

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'microps',
        port: parseInt(process.env.PGPORT || '5432'),
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});
