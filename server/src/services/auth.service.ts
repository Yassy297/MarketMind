import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AppearancePreference, AuthUser, LoginInput, RegisterInput } from '../types/auth';
import { User, type IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function toAuthUser(user: IUser): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    appearance: user.appearance === 'light' || user.appearance === 'dark' ? user.appearance : 'system'
  };
}

function signAccessToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: `${env.accessTokenTtlMinutes}m` }
  );
}

class AuthService {
  async register(input: RegisterInput): Promise<TokenPair> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const password = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      watchlist: []
    });

    return this.issueTokenPair(user);
  }

  async login(input: LoginInput): Promise<TokenPair> {
    const email = input.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    return this.issueTokenPair(user);
  }

  async refresh(rawToken: string): Promise<TokenPair> {
    const tokenHash = hashToken(rawToken);
    const existing = await RefreshToken.findOne({ tokenHash });

    if (!existing || existing.revokedAt || existing.expiresAt.getTime() < Date.now()) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    const user = await User.findById(existing.user);
    if (!user) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    // Rotate: revoke the used refresh token so it can never be replayed.
    existing.revokedAt = new Date();
    await existing.save();

    return this.issueTokenPair(user);
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Authentication required.');
    }
    return toAuthUser(user);
  }

  async updateAppearance(userId: string, appearance: AppearancePreference): Promise<AuthUser> {
    const user = await User.findByIdAndUpdate(userId, { appearance }, { new: true });
    if (!user) {
      throw new Error('Authentication required.');
    }
    return toAuthUser(user);
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await RefreshToken.updateOne({ tokenHash, revokedAt: { $exists: false } }, { revokedAt: new Date() });
  }

  private async issueTokenPair(user: IUser): Promise<TokenPair> {
    const accessToken = signAccessToken(user);

    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user: user._id,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: toAuthUser(user)
    };
  }
}

export const authService = new AuthService();
