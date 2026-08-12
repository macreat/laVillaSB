import { describe, expect, it } from 'vitest';

import { toSameOriginMediaUrl } from './media-proxy';

describe('toSameOriginMediaUrl', () => {
  it('maps absolute MinIO URL to same-origin media proxy path', () => {
    expect(toSameOriginMediaUrl('http://localhost:9000/catalog-media/uploads/deck.png')).toBe(
      '/api/media/catalog-media/uploads/deck.png',
    );
  });

  it('preserves encoded and unicode-safe paths via URL parser', () => {
    expect(
      toSameOriginMediaUrl('http://localhost:9000/catalog-media/uploads/Foto%20(1)%20-%20ni%C3%B1o.png'),
    ).toBe('/api/media/catalog-media/uploads/Foto%20(1)%20-%20ni%C3%B1o.png');
  });

  it('returns empty string for nullish values', () => {
    expect(toSameOriginMediaUrl(null)).toBe('');
    expect(toSameOriginMediaUrl('')).toBe('');
  });

  it('rejects unsafe javascript and data URLs', () => {
    expect(toSameOriginMediaUrl('javascript:alert(1)')).toBe('');
    expect(toSameOriginMediaUrl('data:image/svg+xml;base64,PHN2Zy8+')).toBe('');
  });

  it('rejects relative traversal segments', () => {
    expect(toSameOriginMediaUrl('../secrets.png')).toBe('');
    expect(toSameOriginMediaUrl('/catalog-media/../secrets.png')).toBe('');
  });
});
