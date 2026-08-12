import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { ProductImage } from './ProductImage';

describe('ProductImage', () => {
  it('renders fallback when source is missing', () => {
    const html = renderToStaticMarkup(<ProductImage alt="Deck" />);

    expect(html).toContain('product-image-fallback');
  });

  it('renders image when source is available', () => {
    const html = renderToStaticMarkup(
      <ProductImage src="/api/media/catalog-media/uploads/deck.png" alt="Deck" />,
    );

    expect(html).toContain('src="/api/media/catalog-media/uploads/deck.png"');
    expect(html).toContain('alt="Deck"');
  });
});
