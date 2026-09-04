export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const APPEARANCE_OPTIONS = ['system', 'light', 'dark'] as const;
export type AppearancePreference = (typeof APPEARANCE_OPTIONS)[number];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  appearance: AppearancePreference;
}

export interface AuthResponse {
  user: AuthUser;
}
