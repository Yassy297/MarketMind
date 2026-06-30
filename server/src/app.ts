import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '@/routes/auth.routes';
import apiRoutes from '@/routes/api.routes';
import { requireAuth } from '@/middleware/auth.middleware';
import { env } from '@/config/env';

dotenv.config();

const app = express();
app.disable('x-powered-by');

const allowedOrigins = [
  env.frontendOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
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
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketmind-server' });
});

app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

export default app;
