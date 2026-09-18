import { GIFTS, type GiftId } from './gifts';
import { CORE_WEIGHT, MINISTRIES, SUPPORT_WEIGHT, type Ministry } from './ministries';
import { HERO_DEFAULTS, cleanHeroColor, cleanHeroImage, cleanHeroText, type HeroSettings } from './hero';

/**
 * Notion helpers. Uses plain fetch against the Notion REST API (no SDK).
 * Everything here degrades gracefully: if Notion is not configured or is down,
 * the site falls back to lib/ministries.ts and keeps working.
 */
const NOTION_VERSION = '2022-06-28';
const BASE = 'https://api.notion.com/v1';

const headers = () => ({
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json',
});

const giftIdByName = new Map(GIFTS.map((g) => [g.name.toLowerCase(), g.id]));

/* eslint-disable @typescript-eslint/no-explicit-any */
const plain = (rt: any[] | undefined) => (rt ?? []).map((t) => t.plain_text ?? '').join('').trim();
const gifts = (prop: any, weight: number) =>
  ((prop?.multi_select ?? []) as { name: string }[])
    .map((o) => giftIdByName.get(o.name.toLowerCase()))
    .filter((id): id is GiftId => Boolean(id))
    .map((id) => ({ id, weight }));

export interface MinistryConfig {
  ministries: Ministry[];
  /** Master switch. False hides the whole "Where these gifts could serve" section. */
  show: boolean;
  source: 'notion' | 'file';
}

export async function getMinistryConfig(): Promise<MinistryConfig> {
  const masterOff = process.env.SHOW_MINISTRY_AREAS === 'false';
  const key = process.env.NOTION_API_KEY;
  const db = process.env.NOTION_MINISTRIES_DB_ID;

  let ministries: Ministry[] = MINISTRIES.filter((m) => m.active);
  let source: MinistryConfig['source'] = 'file';

  if (key && db) {
    try {
      const res = await fetch(`${BASE}/databases/${db}/query`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          filter: { property: 'Active', checkbox: { equals: true } },
          sorts: [{ property: 'Sort order', direction: 'ascending' }],
          page_size: 50,
        }),
        next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error(`Notion ${res.status}`);
      const data = await res.json();
      ministries = (data.results as any[]).map((page) => {
        const p = page.properties;
        return {
          id: page.id as string,
          name: plain(p['Name']?.title),
          blurb: plain(p['Description']?.rich_text),
          href: (p['Link']?.url as string | null) || undefined,
          active: true,
          gifts: [...gifts(p['Core gifts'], CORE_WEIGHT), ...gifts(p['Supporting gifts'], SUPPORT_WEIGHT)],
        } satisfies Ministry;
      }).filter((m) => m.name && m.gifts.length > 0);
      source = 'notion';
    } catch (err) {
      console.error('[gifts] Notion ministries failed, using fallback file', err);
    }
  }

  return { ministries, show: !masterOff && ministries.length > 0, source };
}

const rt = (s: string) => [{ type: 'text', text: { content: s.slice(0, 1900) } }];
const today = () => new Date().toISOString().slice(0, 10);

export const submissionsReady = () => Boolean(process.env.NOTION_API_KEY && process.env.NOTION_SUBMISSIONS_DB_ID);

export interface SubmissionRecord {
  id: string;
  attempts: number;
  answers: string;
  completedAt: string | null;
  hasEmail: boolean;
  status: string | null;
  topGifts: string;
  history: string;
}

/** Finds the one row for this person (by name key). Returns null if none, or if Notion is not configured or fails. */
export async function findSubmission(key: string): Promise<SubmissionRecord | null> {
  if (!submissionsReady()) return null;
  try {
    const res = await fetch(`${BASE}/databases/${process.env.NOTION_SUBMISSIONS_DB_ID}/query`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ filter: { property: 'Name key', rich_text: { equals: key } }, page_size: 1 }),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
    const page = (await res.json()).results?.[0];
    if (!page) return null;
    const p = page.properties;
    return {
      id: page.id,
      attempts: typeof p['Attempts']?.number === 'number' ? p['Attempts'].number : 1,
      answers: plain(p['Answers']?.rich_text),
      completedAt: p['Last completed']?.date?.start ?? page.created_time ?? null,
      hasEmail: Boolean(p['Email']?.email),
      status: p['Status']?.select?.name ?? null,
      topGifts: plain(p['Top gifts']?.rich_text),
      history: plain(p['History']?.rich_text),
    };
  } catch (err) {
    console.error('[gifts] Notion lookup failed', err);
    return null;
  }
}

export interface CompletionInput {
  fullName: string; key: string; answers: string; topGifts: string; ranking: string; areas: string;
}

/**
 * Logs a completed assessment. One row per person: a retake updates the row,
 * bumps Attempts, and appends the earlier top gifts to History so nothing is lost.
 */
export async function upsertCompletion(input: CompletionInput, existing?: SubmissionRecord | null): Promise<{ ok: boolean; created: boolean }> {
  if (!submissionsReady()) return { ok: false, created: false };
  try {
    const found = existing === undefined ? await findSubmission(input.key) : existing;
    const shared = {
      Answers: { rich_text: rt(input.answers) },
      'Top gifts': { rich_text: rt(input.topGifts) },
      'Suggested areas': { rich_text: rt(input.areas) },
      'Full ranking': { rich_text: rt(input.ranking) },
      'Last completed': { date: { start: today() } },
    };
    let res: Response;
    if (found) {
      const line = `${(found.completedAt ?? '').slice(0, 10) || 'earlier'}: ${found.topGifts}`;
      const history = [found.history, line].filter(Boolean).join('\n').slice(-1800);
      res = await fetch(`${BASE}/pages/${found.id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ properties: { ...shared, Attempts: { number: found.attempts + 1 }, History: { rich_text: rt(history) } } }),
      });
    } else {
      res = await fetch(`${BASE}/pages`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_SUBMISSIONS_DB_ID },
          properties: {
            ...shared,
            Name: { title: rt(input.fullName) },
            'Name key': { rich_text: rt(input.key) },
            Attempts: { number: 1 },
            'Wants follow-up': { checkbox: false },
            Status: { select: { name: 'No email yet' } },
          },
        }),
      });
    }
    if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
    return { ok: true, created: !found };
  } catch (err) {
    console.error('[gifts] Notion completion log failed', err);
    return { ok: false, created: false };
  }
}

/** Adds contact details to an existing row. Never downgrades a status the ministry team has already moved. */
export async function attachContact(
  record: SubmissionRecord,
  c: { email: string; wantsFollowUp: boolean; interest: string },
): Promise<boolean> {
  if (!submissionsReady()) return false;
  try {
    const worked = record.status === 'Contacted' || record.status === 'Placed';
    const res = await fetch(`${BASE}/pages/${record.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        properties: {
          Email: { email: c.email },
          'Wants follow-up': { checkbox: c.wantsFollowUp },
          'Interested in serving': { rich_text: rt(c.interest) },
          ...(worked ? {} : { Status: { select: { name: c.wantsFollowUp ? 'New' : 'No follow-up needed' } } }),
        },
      }),
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
    return true;
  } catch (err) {
    console.error('[gifts] Notion contact update failed', err);
    return false;
  }
}


// The Site Settings database ID is not a secret. Override with NOTION_SETTINGS_DB_ID if it ever moves.
const SETTINGS_DB_ID = process.env.NOTION_SETTINGS_DB_ID || '3f12f8242e7f43c495333f3d7af71ac6';

/** Header banner settings from the first row of the Site Settings database. Falls back to defaults on any problem. */
export async function getHeroSettings(): Promise<HeroSettings> {
  if (!process.env.NOTION_API_KEY) return HERO_DEFAULTS;
  try {
    const res = await fetch(`${BASE}/databases/${SETTINGS_DB_ID}/query`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ page_size: 1 }),
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Notion ${res.status}`);
    const p = (await res.json()).results?.[0]?.properties;
    if (!p) return HERO_DEFAULTS;
    return {
      text: cleanHeroText(plain(p['Header text']?.rich_text)),
      color: cleanHeroColor(plain(p['Background color']?.rich_text)),
      imageUrl: cleanHeroImage(p['Background image URL']?.url),
    };
  } catch (err) {
    console.error('[gifts] Notion site settings failed, using defaults', err);
    return HERO_DEFAULTS;
  }
}
