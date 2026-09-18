import { CATEGORIES, CATEGORY_MAP, GIFTS, GIFT_MAP, type CategoryId, type GiftId } from './gifts';
import { ITEMS_PER_GIFT, QUESTIONS } from './questions';
import type { Ministry } from './ministries';

export const MIN_SCORE = ITEMS_PER_GIFT;       // every statement answered 1
export const MAX_SCORE = ITEMS_PER_GIFT * 5;   // every statement answered 5

export type Answers = Record<string, number>;

export interface GiftScore {
  id: GiftId;
  score: number;
  max: number;
  /** 0-1, where 0 = lowest possible and 1 = highest possible for this gift. */
  strength: number;
  /** How many statements were answered with a 5. Used as the tie-breaker. */
  peaks: number;
  /** 1-based position. */
  rank: number;
  tier: 'primary' | 'supporting' | 'developing';
}

export interface MinistryFit {
  ministry: Ministry;
  fit: number;
  /** Which of the person's top gifts point here, strongest first. */
  because: GiftId[];
}

export interface CategoryScore {
  id: CategoryId;
  /** Average strength (0-1) of the gifts in this group. */
  strength: number;
  rank: number;
}

export interface Results {
  gifts: GiftScore[];
  categories: CategoryScore[];
  top: GiftScore[];
  /** Gifts tied with the #3 gift that did not make the top three. */
  ties: GiftScore[];
  ministries: MinistryFit[];
  notes: string[];
  summary: string;
}

/** Validates a raw answers object. Returns an error string, or null if it is complete and valid. */
export function validateAnswers(answers: unknown): string | null {
  if (!answers || typeof answers !== 'object') return 'Answers are missing.';
  const a = answers as Record<string, unknown>;
  for (const q of QUESTIONS) {
    const v = a[q.id];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5) return `Answer for ${q.id} is missing or invalid.`;
  }
  return null;
}

export function scoreAnswers(answers: Answers): GiftScore[] {
  const totals = new Map<GiftId, { score: number; peaks: number }>();
  for (const g of GIFTS) totals.set(g.id, { score: 0, peaks: 0 });
  for (const q of QUESTIONS) {
    const v = answers[q.id] ?? 0;
    const t = totals.get(q.gift)!;
    t.score += v;
    if (v === 5) t.peaks += 1;
  }
  const order = new Map(GIFTS.map((g, i) => [g.id, i]));
  const rows = GIFTS.map((g) => {
    const t = totals.get(g.id)!;
    return {
      id: g.id,
      score: t.score,
      max: MAX_SCORE,
      strength: (t.score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE),
      peaks: t.peaks,
    };
  }).sort((a, b) => b.score - a.score || b.peaks - a.peaks || order.get(a.id)! - order.get(b.id)!);

  return rows.map((r, i) => ({
    ...r,
    rank: i + 1,
    tier: i < 3 ? 'primary' : i < 6 ? 'supporting' : 'developing',
  }));
}

function matchMinistries(gifts: GiftScore[], ministries: Ministry[]): MinistryFit[] {
  const byId = new Map(gifts.map((g) => [g.id, g]));
  const topSix = new Set(gifts.slice(0, 6).map((g) => g.id));
  return ministries.filter((m) => m.active)
    .map((ministry) => {
      const totalWeight = ministry.gifts.reduce((s, g) => s + g.weight, 0);
      const fit = ministry.gifts.reduce((s, g) => s + g.weight * (byId.get(g.id)?.strength ?? 0), 0) / totalWeight;
      const because = ministry.gifts
        .filter((g) => topSix.has(g.id))
        .map((g) => byId.get(g.id)!)
        .sort((a, b) => a.rank - b.rank)
        .map((g) => g.id);
      return { ministry, fit, because };
    })
    .filter((m) => m.because.length > 0)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 4);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function buildResults(answers: Answers, ministries: Ministry[] = []): Results {
  const gifts = scoreAnswers(answers);
  const top = gifts.slice(0, 3);
  const ties = gifts.slice(3).filter((g) => g.score === top[2].score);
  const matched = matchMinistries(gifts, ministries);

  const notes: string[] = [];
  const mean = gifts.reduce((s, g) => s + g.score, 0) / gifts.length / ITEMS_PER_GIFT;
  if (mean >= 4.2) {
    notes.push('You rated most statements very high. Read your results as a relative ranking, not a total.');
  } else if (mean <= 2.0) {
    notes.push('You rated most statements low. Read your results as a relative ranking, and consider retaking when you have more ministry experience to draw from.');
  }
  if (ties.length > 0) {
    notes.push(`${joinList(ties.map((t) => GIFT_MAP[t.id].name))} scored the same as ${GIFT_MAP[top[2].id].name}. Treat them as equally strong.`);
  }

  if (top.some((g) => GIFT_MAP[g.id].office)) {
    notes.push('Apostle, Prophet, Evangelist, and Pastor are ministry offices that church leadership recognizes and affirms. Treat this as a starting point for a conversation with your pastor.');
  }

  const categories: CategoryScore[] = CATEGORIES.map((c) => {
    const members = gifts.filter((g) => GIFT_MAP[g.id].categories.includes(c.id));
    return { id: c.id, strength: members.reduce((s, g) => s + g.strength, 0) / members.length, rank: 0 };
  })
    .sort((a, b) => b.strength - a.strength)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  const does = top.map((g) => GIFT_MAP[g.id].does);
  const first = matched[0]?.ministry.name;
  const second = matched[1]?.ministry.name;
  const where = first && second ? ` The areas at Verity where that mix is most needed are ${first} and ${second}.` : first ? ` The area at Verity where that mix is most needed is ${first}.` : '';
  const summary = `Your strongest gifts are ${joinList(top.map((g) => GIFT_MAP[g.id].name))}. You are wired to ${does[0]}, ${does[1]}, and ${does[2]}. Across the six groups, your gifting leans most toward ${CATEGORY_MAP[categories[0].id].name}.${where}`;

  return { gifts, categories, top, ties, ministries: matched, notes, summary };
}
