/** Header banner settings. Defaults are used whenever Notion is unset, unreachable, or has a blank/invalid value. */
export interface HeroSettings {
  text: string;
  color: string;
  /** Empty string means "no image, show the color only". */
  imageUrl: string;
}

export const HERO_DEFAULTS: HeroSettings = {
  text: 'Discover your gifts, and put them to work.',
  color: '#2B2B2B',
  imageUrl: '',
};

export function cleanHeroText(v: unknown): string {
  const s = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
  return s || HERO_DEFAULTS.text;
}

/** Accepts #RGB, #RRGGBB (with or without the #), or a plain color name like "navy". */
export function cleanHeroColor(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : '';
  if (/^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s.startsWith('#') ? s : `#${s}`;
  if (/^[a-z]{3,20}$/i.test(s)) return s.toLowerCase();
  return HERO_DEFAULTS.color;
}

/** Only https links or paths on this site (like /hero.jpg) are allowed. */
export function cleanHeroImage(v: unknown): string {
  const s = typeof v === 'string' ? v.trim().slice(0, 2000) : '';
  if (/^https:\/\/[^\s]+$/i.test(s) || /^\/(?!\/)[^\s]*$/.test(s)) return s;
  return '';
}

/** A value that is safe to place inside url("...") in an inline style. */
export function cssUrl(u: string): string {
  const safe = encodeURI(u).replace(/["'()\\]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `url("${safe}")`;
}
