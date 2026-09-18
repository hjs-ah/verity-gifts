import { QUESTIONS } from './questions';
import type { Answers } from './scoring';

/** Trims, collapses spaces, caps length. Returns '' if there is no letter in it. */
export function cleanName(input: unknown): string {
  if (typeof input !== 'string') return '';
  const s = input.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 40);
  return /\p{L}/u.test(s) ? s : '';
}

/** Stable lookup key so "Jo-Ann  O'Neil" and "jo-ann o'neil" are the same person. */
export function nameKey(first: string, last: string): string {
  const norm = (s: string) =>
    s.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}'\- ]/gu, '').replace(/\s+/g, ' ').trim();
  return `${norm(first)}|${norm(last)}`;
}

// A short fingerprint of the question ids, so saved answers from an older question set are never misread.
function fingerprint(): string {
  let h = 5381;
  for (const c of QUESTIONS.map((q) => q.id).join(',')) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h.toString(36);
}

/** answers -> "abc123:5432..." (one digit per question, in question order). */
export function encodeAnswers(answers: Answers): string {
  return `${fingerprint()}:${QUESTIONS.map((q) => String(answers[q.id] ?? 0)).join('')}`;
}

/** Reverse of encodeAnswers. Returns null if it was saved under a different question set. */
export function decodeAnswers(saved: string): Answers | null {
  const [fp, digits] = saved.split(':');
  if (fp !== fingerprint() || !digits || digits.length !== QUESTIONS.length) return null;
  const out: Answers = {};
  for (let i = 0; i < QUESTIONS.length; i++) {
    const v = Number(digits[i]);
    if (!Number.isInteger(v) || v < 1 || v > 5) return null;
    out[QUESTIONS[i].id] = v;
  }
  return out;
}
