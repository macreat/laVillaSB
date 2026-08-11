import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_MINIO_BASE_URL = 'http://localhost:9000';
const INTERNAL_MINIO_BASE_URL = 'http://minio:9000';
const CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

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
  for (const baseUrl of resolveMinioBaseUrls()) {
    try {
      const response = await fetch(buildUpstreamUrl(baseUrl, rawPath, request.nextUrl.search), {
        method: 'GET',
        headers: {
          Accept: 'image/*,*/*;q=0.8',
        },
        cache: 'no-store',
      });

      upstream = response;
      if (response.status !== 502 && response.status !== 503 && response.status !== 504) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (!upstream) {
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
    return NextResponse.json({ error: 'Media fetch failed' }, { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': CACHE_CONTROL,
    },
  });
}
