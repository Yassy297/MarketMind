import api from './api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

// The server sets httpOnly access/refresh cookies on these calls - no token is
// ever exposed to client-side JS, and the browser sends the cookies automatically
// on subsequent requests (withCredentials: true in api.ts).
export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', input);
  return response.data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', input);
  return response.data;
}

export async function fetchMe(): Promise<{ user: AuthUser }> {
  const response = await api.get<{ user: AuthUser }>('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
