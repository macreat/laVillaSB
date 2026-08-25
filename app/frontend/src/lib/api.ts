import type { LoginPayload, LoginResponse, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8010';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('lavilla_token', token);
      } else {
        localStorage.removeItem('lavilla_token');
      }
    }
  }

  private setSessionCookie() {
    if (typeof window === 'undefined') return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `lavilla_session=1; Path=/; SameSite=Lax${secure}`;
  }

  private clearSessionCookie() {
    if (typeof window === 'undefined') return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `lavilla_session=; Path=/; SameSite=Lax; Max-Age=0${secure}`;
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('lavilla_token');
    }
    return this.token;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message || data?.error || `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data as T;
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>(
      'POST',
      '/api/admin/login',
      payload,
    );
    this.setToken(data.token);
    this.setSessionCookie();
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('POST', '/api/admin/logout');
    } finally {
      this.setToken(null);
      this.clearSessionCookie();
    }
  }

  async me(): Promise<User> {
    return this.request<User>('GET', '/api/admin/me');
  }

  async proxyGet<T>(service: string, path: string): Promise<T> {
    return this.request<T>('GET', `/api/v1/${service}/${path}`);
  }

  async proxyPost<T>(
    service: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>('POST', `/api/v1/${service}/${path}`, body);
  }

  async proxyPut<T>(
    service: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    return this.request<T>('PUT', `/api/v1/${service}/${path}`, body);
  }

  async proxyDelete<T>(
    service: string,
    path: string,
  ): Promise<T> {
    return this.request<T>('DELETE', `/api/v1/${service}/${path}`);
  }
}

export const api = new ApiClient();
