import { GIFTS, type GiftId } from './gifts';
import { CORE_WEIGHT, MINISTRIES, SUPPORT_WEIGHT, type Ministry } from './ministries';

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

/** Logs a submission row. Returns true on success. Never throws. */
export async function logSubmission(row: {
  name: string; email: string; wantsFollowUp: boolean; topGifts: string; interest: string; areas: string; ranking: string;
}): Promise<boolean> {
  const key = process.env.NOTION_API_KEY;
  const db = process.env.NOTION_SUBMISSIONS_DB_ID;
  if (!key || !db) return false;
  try {
    const res = await fetch(`${BASE}/pages`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        parent: { database_id: db },
        properties: {
          Name: { title: rt(row.name || 'Anonymous') },
          Email: { email: row.email },
          'Wants follow-up': { checkbox: row.wantsFollowUp },
          Status: { select: { name: row.wantsFollowUp ? 'New' : 'No follow-up needed' } },
          'Top gifts': { rich_text: rt(row.topGifts) },
          'Interested in serving': { rich_text: rt(row.interest || '') },
          'Suggested areas': { rich_text: rt(row.areas || '') },
          'Full ranking': { rich_text: rt(row.ranking) },
        },
      }),
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
    return true;
  } catch (err) {
    console.error('[gifts] Notion submission log failed', err);
    return false;
  }
}
