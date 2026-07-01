import dotenv from 'dotenv';
import path from 'path';
import app from './app';

const isDev = process.env.NODE_ENV === 'development' || process.argv.some(arg => arg.includes('ts-node') || arg.includes('nodemon'));
const envFile = isDev ? '.env.development' : '.env.production';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config(); // fallback to default .env

// Use port 8000 to avoid conflict with the learning server (which uses 5000)
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`[Backend API] Server is running on http://localhost:${PORT}`);
});
