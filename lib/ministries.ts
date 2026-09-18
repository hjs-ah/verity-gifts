import type { GiftId } from './gifts';

/**
 * Where gifts can serve.
 *
 * This file is the FALLBACK. When the Notion "Ministry Areas" database is connected
 * (NOTION_API_KEY + NOTION_MINISTRIES_DB_ID), Notion is used instead and this list is ignored.
 *  - Core gifts weigh 3, supporting gifts weigh 1 when matching people to areas.
 *  - `active: false` hides an area without deleting it.
 *  - `href` (optional) adds a "Learn more" link on the result card.
 */
export interface Ministry {
  id: string;
  name: string;
  blurb: string;
  gifts: { id: GiftId; weight: number }[];
  active: boolean;
  href?: string;
}

export const CORE_WEIGHT = 3;
export const SUPPORT_WEIGHT = 1;

const area = (
  id: string, name: string, blurb: string, core: GiftId[], support: GiftId[], active: boolean,
): Ministry => ({
  id, name, blurb, active,
  gifts: [...core.map((g) => ({ id: g, weight: CORE_WEIGHT })), ...support.map((g) => ({ id: g, weight: SUPPORT_WEIGHT }))],
});

export const MINISTRIES: Ministry[] = [
  area('learning', 'Verity Learning Center & Truth Bible Institute',
    'Teach, mentor, and help build the classes and curriculum that ground people in Scripture.',
    ['teaching', 'word-of-knowledge'], ['word-of-wisdom', 'pastor', 'leadership', 'exhortation'], true),
  area('cohort', 'Chess Not Checkers (Men\u2019s Cohort)',
    'Mentor and walk alongside men and young men in a long-term discipleship cohort.',
    ['pastor', 'word-of-wisdom'], ['exhortation', 'leadership', 'prophecy', 'teaching'], true),
  area('giving', 'Verity Giving & Community Impact',
    'Fund and steward giving initiatives, including water donations and other community needs.',
    ['giving'], ['leadership', 'mercy', 'serving', 'governments'], true),
  // Placeholders until the pastor confirms these exist. Turn on with active: true.
  area('outreach', 'Outreach & Missions',
    'Take the gospel and practical help into neighborhoods, and start new works.',
    ['evangelist', 'apostle'], ['mercy', 'faith', 'giving', 'serving'], false),
  area('welcome', 'Welcome & Serving Team',
    'Greet, host, and make sure every guest is seen and every need is met from the moment they arrive.',
    ['serving'], ['exhortation', 'mercy'], false),
  area('care', 'Prayer & Pastoral Care',
    'Pray with people, follow up in hard seasons, and help others hear from God.',
    ['intercession', 'pastor', 'mercy'], ['discerning', 'healing', 'prophecy', 'faith', 'casting-out'], false),
  area('worship', 'Worship & Creative Arts',
    'Lead people into God\u2019s presence through music, worship, and creative expression.',
    ['worship', 'creative'], ['tongues', 'interpretation', 'prophecy'], false),
  area('operations', 'Ministry Leadership & Operations',
    'Lead teams, plan events, and build the systems that keep ministry moving.',
    ['leadership', 'governments'], ['apostle', 'serving'], false),
];
