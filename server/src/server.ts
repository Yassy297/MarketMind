import app from '@/app';
import { connectDB } from '@/config/db';
import { env } from '@/config/env';

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`MarketMind server running on http://localhost:${env.port}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
