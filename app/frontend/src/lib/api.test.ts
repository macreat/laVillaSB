import { afterEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError } from './api';

type MockResponseInit = {
  status: number;
  headers?: Record<string, string>;
  body?: string | null;
};

function mockFetch(init: MockResponseInit) {
  const response = new Response(init.body ?? null, {
    status: init.status,
    headers: init.headers,
  });
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api.request empty-body handling', () => {
  it('resolves to null on a 204 without parsing a body', async () => {
    mockFetch({ status: 204 });

    await expect(api.request('POST', '/api/admin/logout')).resolves.toBeNull();
  });

  it('resolves to null on a non-JSON empty body without throwing', async () => {
    mockFetch({ status: 200, headers: { 'Content-Type': 'text/plain' } });

    await expect(api.request('POST', '/api/admin/logout')).resolves.toBeNull();
  });

  it('still parses JSON bodies when present', async () => {
    mockFetch({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    });

    await expect(api.request('GET', '/api/admin/me')).resolves.toEqual({ ok: true });
  });
});

describe('api.request error handling', () => {
  it('exposes the upstream status and server message on failure', async () => {
    mockFetch({
      status: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Not found' }),
    });

    const error = await api.request('GET', '/api/v1/cart/orders').catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).message).toBe('Not found');
  });

  it('falls back to a generic message for unparseable error bodies', async () => {
    mockFetch({ status: 502, headers: { 'Content-Type': 'text/html' } });

    const error = await api.request('GET', '/api/v1/cart/orders').catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).message).toBe('Request failed (502)');
  });
});
