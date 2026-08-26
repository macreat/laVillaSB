export type AdminDataState = 'loading' | 'offline' | 'empty' | 'ready';

const SERVICE_UNAVAILABLE_STATUSES: ReadonlySet<number> = new Set([404, 502, 503]);

/**
 * Classifies an upstream HTTP status (or a missing one, i.e. a network
 * failure) as "the backing service is not really serving this endpoint".
 */
export function isServiceUnavailable(status: number | null | undefined): boolean {
  return status === undefined || status === null || SERVICE_UNAVAILABLE_STATUSES.has(status);
}

export function resolveAdminDataState(params: {
  loading: boolean;
  unavailable: boolean;
  itemCount: number;
}): AdminDataState {
  if (params.loading) return 'loading';
  if (params.unavailable) return 'offline';
  if (params.itemCount === 0) return 'empty';
  return 'ready';
}
