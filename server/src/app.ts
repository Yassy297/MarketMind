import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '@/routes/auth.routes';
import { requireAuth } from '@/middleware/auth.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketmind-server' });
});

app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.use('/auth', authRoutes);

export default app;
