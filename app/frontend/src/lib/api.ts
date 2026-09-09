import type { LoginPayload, LoginResponse, User } from './types';

// Empty means same-origin: the browser hits /api/... on whatever host served
// the page, and next.config rewrites it to the gateway internally.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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

    const contentType = res.headers.get('content-type') ?? '';
    const contentLength = Number(res.headers.get('content-length') ?? '0');
    const hasBody =
      res.status !== 204 &&
      res.status !== 304 &&
      (contentType.includes('application/json') || contentLength > 0);

    let data: unknown = null;
    if (hasBody) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const message =
        (data as { message?: string; error?: string } | null)?.message ||
        (data as { message?: string; error?: string } | null)?.error ||
        `Request failed (${res.status})`;
      throw new ApiError(message, res.status);
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
