const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  }

  return data as T;
}

export async function registerUser(input: { email: string; password: string; name: string }) {
  return request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function loginUser(input: { email: string; password: string }) {
  return request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function fetchCurrentUser(token: string) {
  return request<{ user: { id: string; email: string; name: string } }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
