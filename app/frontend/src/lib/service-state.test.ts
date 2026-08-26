import { describe, expect, it } from 'vitest';

import { isServiceUnavailable, resolveAdminDataState } from './service-state';

describe('isServiceUnavailable', () => {
  it.each([404, 502, 503])('treats %i as service unavailable', (status) => {
    expect(isServiceUnavailable(status)).toBe(true);
  });

  it('treats a missing status (network failure) as unavailable', () => {
    expect(isServiceUnavailable(null)).toBe(true);
    expect(isServiceUnavailable(undefined)).toBe(true);
  });

  it.each([200, 400, 401, 500])('does not treat %i as unavailable', (status) => {
    expect(isServiceUnavailable(status)).toBe(false);
  });
});

describe('resolveAdminDataState', () => {
  it('prefers loading over everything else', () => {
    expect(
      resolveAdminDataState({ loading: true, unavailable: true, itemCount: 0 }),
    ).toBe('loading');
  });

  it('reports offline once loading finishes on an unavailable service', () => {
    expect(
      resolveAdminDataState({ loading: false, unavailable: true, itemCount: 0 }),
    ).toBe('offline');
  });

  it('reports empty only when data loaded but there are no rows', () => {
    expect(
      resolveAdminDataState({ loading: false, unavailable: false, itemCount: 0 }),
    ).toBe('empty');
    expect(
      resolveAdminDataState({ loading: false, unavailable: true, itemCount: 3 }),
    ).toBe('offline');
  });

  it('reports ready when rows exist', () => {
    expect(
      resolveAdminDataState({ loading: false, unavailable: false, itemCount: 3 }),
    ).toBe('ready');
  });
});
