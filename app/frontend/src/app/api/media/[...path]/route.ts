import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_MINIO_BASE_URL = 'http://localhost:9000';
const INTERNAL_MINIO_BASE_URL = 'http://minio:9000';
const CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';
const RETRIABLE_UPSTREAM_STATUSES = new Set([502, 503, 504]);

function warningPayload(message: string, extra: Record<string, unknown>): Record<string, unknown> {
  return {
    level: 'warn',
    route: 'api/media',
    message,
    ...extra,
  };
}

function resolveMinioBaseUrls(): string[] {
  const configured = process.env.MEDIA_ORIGIN_BASE_URL || process.env.NEXT_PUBLIC_MEDIA_ORIGIN_BASE_URL;
  const candidates = [configured, DEFAULT_MINIO_BASE_URL, INTERNAL_MINIO_BASE_URL]
    .filter(Boolean)
    .map((url) => (url as string).replace(/\/+$/, ''));

  return [...new Set(candidates)];
}

function encodePathSegments(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  return segments
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

function buildUpstreamUrl(baseUrl: string, pathValue: string, search: string): string {
  const normalized = pathValue.replace(/^\/+/, '');
  const pathOnly = normalized.split('?')[0] || '';
  const encodedPath = encodePathSegments(pathOnly);
  const query = search || (normalized.includes('?') ? `?${normalized.split('?').slice(1).join('?')}` : '');
  return `${baseUrl}/${encodedPath}${query}`;
}

export async function GET(
  request: NextRequest,
  context: { params: { path?: string[] } },
): Promise<NextResponse> {
  const pathParts = context.params.path || [];
  if (pathParts.length === 0) {
    return NextResponse.json({ error: 'Missing media path' }, { status: 400 });
  }

  const rawPath = pathParts.join('/');
  let upstream: Response | null = null;
  let attempted = 0;
  for (const baseUrl of resolveMinioBaseUrls()) {
    attempted += 1;
    try {
      const response = await fetch(buildUpstreamUrl(baseUrl, rawPath, request.nextUrl.search), {
        method: 'GET',
        headers: {
          Accept: 'image/*,*/*;q=0.8',
        },
        cache: 'no-store',
      });

      upstream = response;
      if (!RETRIABLE_UPSTREAM_STATUSES.has(response.status)) {
        break;
      }

      console.warn(
        JSON.stringify(
          warningPayload('retrying_media_upstream', {
            baseUrl,
            status: response.status,
            path: rawPath,
          }),
        ),
      );
    } catch {
      console.warn(
        JSON.stringify(
          warningPayload('media_upstream_request_failed', {
            baseUrl,
            path: rawPath,
          }),
        ),
      );
      continue;
    }
  }

  if (!upstream) {
    console.warn(
      JSON.stringify(
        warningPayload('all_media_upstream_candidates_failed', {
          attempts: attempted,
          path: rawPath,
        }),
      ),
    );
    return NextResponse.json({ error: 'Media upstream unavailable' }, { status: 502 });
  }

  if (upstream.status === 404) {
    const notFoundBody = await upstream.text();
    return new NextResponse(notFoundBody, {
      status: 404,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Media fetch failed' },
      {
        status: upstream.status,
        headers: {
          'Cache-Control': upstream.headers.get('cache-control') || 'no-store',
        },
      },
    );
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const contentLength = upstream.headers.get('content-length');
  const etag = upstream.headers.get('etag');
  const lastModified = upstream.headers.get('last-modified');
  const body = await upstream.arrayBuffer();

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Cache-Control': CACHE_CONTROL,
  };
  if (contentLength) {
    headers['Content-Length'] = contentLength;
  }
  if (etag) {
    headers['ETag'] = etag;
  }
  if (lastModified) {
    headers['Last-Modified'] = lastModified;
  }

  return new NextResponse(body, {
    status: 200,
    headers,
  });
}
