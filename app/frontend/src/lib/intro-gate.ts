export const INTRO_SESSION_KEY = 'lavilla_intro_seen';

export function shouldShowIntro(sessionValue: string | null): boolean {
  return sessionValue !== 'true';
}
