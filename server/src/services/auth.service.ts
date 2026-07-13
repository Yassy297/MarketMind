import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '../types/auth';
import { User, type IUser } from '../models/User';

class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    if (!email || !name || input.password.length < 6) {
      throw new Error('Please provide a valid name, email, and password with at least 6 characters.');
    }

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

    return this.buildAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: IUser): AuthResponse {
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      env.jwtSecret,
      { expiresIn: '1h' }
    );

    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    return { token, user: authUser };
  }
}

export const authService = new AuthService();
