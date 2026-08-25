import { describe, expect, it } from 'vitest';

import { shouldShowIntro } from './intro-gate';

describe('shouldShowIntro', () => {
  it('shows the intro when the current session has not seen it', () => {
    expect(shouldShowIntro(null)).toBe(true);
  });

  it('hides the intro after it has been seen in the current session', () => {
    expect(shouldShowIntro('true')).toBe(false);
  });
});
