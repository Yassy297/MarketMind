import path from 'node:path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret: string = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const frontendOrigin: string = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

type Env = {
  port: number;
  jwtSecret: string;
  mongoUri: string;
  frontendOrigin: string;
};

export const env: Env = {
  port: Number(process.env.PORT ?? 5000),
  jwtSecret,
  mongoUri: process.env.MONGO_URI ?? process.env.MONGODB_URI ?? '',
  frontendOrigin,
};
