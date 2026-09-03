import path from 'node:path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret: string = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const frontendOrigin: string = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const finnhubApiKey: string = process.env.FINNHUB_API_KEY ?? '';
const marketauxApiKey: string = process.env.MARKETAUX_API_KEY ?? '';
const upstoxApiKey: string = process.env.UPSTOX_API_KEY ?? '';
const upstoxApiSecret: string = process.env.UPSTOX_API_SECRET ?? '';
const upstoxAccessToken: string = process.env.UPSTOX_ACCESS_TOKEN ?? '';

type Env = {
  port: number;
  jwtSecret: string;
  mongoUri: string;
  frontendOrigin: string;
  finnhubApiKey: string;
  marketauxApiKey: string;
  upstoxApiKey: string;
  upstoxApiSecret: string;
  upstoxAccessToken: string;
  marketProviderIn?: string;
  marketProviderUs?: string;
  marketProviderDefault?: string;
  isProduction: boolean;
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
};

export const env: Env = {
  port: Number(process.env.PORT ?? 5000),
  jwtSecret,
  mongoUri: process.env.MONGO_URI ?? process.env.MONGODB_URI ?? '',
  frontendOrigin,
  finnhubApiKey,
  marketauxApiKey,
  upstoxApiKey,
  upstoxApiSecret,
  upstoxAccessToken,
  marketProviderIn: process.env.MARKET_PROVIDER_IN,
  marketProviderUs: process.env.MARKET_PROVIDER_US,
  marketProviderDefault: process.env.MARKET_PROVIDER_DEFAULT,
  isProduction,
  accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES ?? 15),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30)
};
