import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from '@/routes/auth.routes';
import dashboardRoutes from '@/routes/dashboard.routes';
import stockRoutes from '@/routes/stock.routes';
import { requireAuth } from '@/middleware/auth.middleware';
import { env } from '@/config/env';
import { getRecentlyViewed } from '@/controllers/stock.controller';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.middleware';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = [
  env.frontendOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketmind-server' });
});

app.use('/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stocks', stockRoutes);
app.get('/api/recently-viewed', requireAuth, getRecentlyViewed);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
