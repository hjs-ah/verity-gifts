import { GIFTS, type GiftId } from './gifts';

/**
 * The question bank. Add or edit statements freely.
 * Rules the scoring depends on:
 *   - every gift has the same number of statements
 *   - statements are first-person ("I ...") and answered on the 1-5 scale below
 * To grow the assessment, add a 5th statement to each gift. Nothing else changes.
 */
const BANK: Record<GiftId, string[]> = {
  leadership: [
    'I can see where a group needs to go before others can.',
    'People tend to follow when I step up to lead.',
    'I am comfortable making decisions that others may not agree with right away.',
    'I get energized when I am asked to cast vision for a team or project.',
  ],
  giving: [
    'I feel real joy when I give toward something God is doing.',
    'I look for ways to give quietly, without needing recognition.',
    'I trust God to provide for me, so giving generously does not feel risky.',
    'I notice financial needs around me and want to help meet them.',
  ],
  administration: [
    'I turn big goals into clear steps and timelines.',
    'I notice when a process is broken and enjoy fixing it.',
    'Disorganized events or projects bother me until someone brings order.',
    'I keep track of details, deadlines, and resources without much effort.',
  ],
  knowledge: [
    'I love digging deeply into Scripture and its background.',
    'I remember facts, passages, and ideas, and I connect them well.',
    'I enjoy research and study more than most people I know.',
    'I feel uneasy when people settle for shallow answers about faith.',
  ],
  prophecy: [
    'I feel compelled to speak God\u2019s truth even when it is uncomfortable.',
    'I often sense what God is saying about a situation before others do.',
    'I am burdened when sin or injustice is being ignored.',
    'People have told me that something I shared was exactly what they needed to hear.',
  ],
  mercy: [
    'I notice people who are hurting, even when they try to hide it.',
    'I feel deeply for people in pain and want to walk with them.',
    'I am drawn to people whom others overlook or avoid.',
    'I would rather show compassion than win an argument.',
  ],
  hospitality: [
    'I love opening my home or space to make people feel welcome.',
    'I notice newcomers and go out of my way to include them.',
    'I enjoy hosting people, including those I barely know.',
    'People tell me they feel at home around me.',
  ],
  discernment: [
    'I can often tell when something spiritual is off before I can explain why.',
    'I test what I hear against Scripture before I accept it.',
    'I can sense the real motives behind a person\u2019s words or actions.',
    'People ask me to weigh in when they are unsure whether something is from God.',
  ],
  encouragement: [
    'People leave conversations with me feeling stronger.',
    'I naturally speak hope to discouraged people.',
    'I enjoy helping people take the next step in their growth.',
    'I am quick to notice what someone is doing well and say so.',
  ],
  evangelism: [
    'I look for chances to share my faith with people who do not know Christ.',
    'I can explain the gospel in a simple way that connects.',
    'I feel a burden for people who are far from God.',
    'I am comfortable starting spiritual conversations with people who do not attend church.',
  ],
  teaching: [
    'I enjoy explaining Scripture so that others understand it.',
    'I prepare and organize material so people can learn step by step.',
    'I get excited when someone finally understands something I taught.',
    'People say I make complicated ideas easy to follow.',
  ],
  service: [
    'I would rather help behind the scenes than be up front.',
    'I see practical needs and jump in without being asked.',
    'I feel fulfilled after finishing tasks that make other people\u2019s work easier.',
    'I am happy to do small, unnoticed jobs that keep ministry running.',
  ],
  shepherding: [
    'I feel responsible for the spiritual well-being of the people around me.',
    'I follow up with people over time, not just once.',
    'I am willing to walk with someone through a long season of growth.',
    'People trust me with their struggles and ask for my guidance.',
  ],
  wisdom: [
    'People often come to me for counsel on hard decisions.',
    'I can see how biblical truth applies to a complicated situation.',
    'I stay calm and clear when others are confused.',
    'The advice I give tends to hold up well over time.',
  ],
  faith: [
    'I take bold steps because I am convinced God will come through.',
    'When circumstances look impossible, my confidence in God grows rather than shrinks.',
    'I pray with expectation that God will answer specific requests.',
    'Others draw courage from watching me trust God through a hard season.',
  ],
  apostleship: [
    'I am drawn to starting new ministries or works where none exist.',
    'I enjoy launching things and equipping others to carry them forward.',
    'I am comfortable crossing cultural or geographic lines to advance the mission.',
    'I think in terms of multiplying leaders, not just my own impact.',
  ],
};

export interface Question {
  id: string;
  gift: GiftId;
  text: string;
}

export const ITEMS_PER_GIFT = BANK.leadership.length;

// Guard: every gift must have the same number of statements.
for (const g of GIFTS) {
  if (BANK[g.id].length !== ITEMS_PER_GIFT) {
    throw new Error(`Gift "${g.id}" has ${BANK[g.id].length} statements; expected ${ITEMS_PER_GIFT}.`);
  }
}

/**
 * Fixed presentation order. Statements are interleaved so two statements for
 * the same gift never appear back to back, which keeps the person from
 * "seeing the pattern" and answering the category instead of the statement.
 */
const ROUND_ORDER: GiftId[] = [
  'leadership', 'mercy', 'knowledge', 'hospitality', 'prophecy', 'giving', 'teaching', 'faith',
  'shepherding', 'service', 'discernment', 'administration', 'evangelism', 'wisdom', 'encouragement', 'apostleship',
];

function buildQuestions(): Question[] {
  const out: Question[] = [];
  for (let round = 0; round < ITEMS_PER_GIFT; round++) {
    for (let i = 0; i < ROUND_ORDER.length; i++) {
      const gift = ROUND_ORDER[(i + round * 5) % ROUND_ORDER.length];
      out.push({ id: `${gift}-${round + 1}`, gift, text: BANK[gift][round] });
    }
  }
  return out;
}

export const QUESTIONS: Question[] = buildQuestions();

export const SCALE = [
  { value: 1, label: 'Not at all like me' },
  { value: 2, label: 'A little like me' },
  { value: 3, label: 'Somewhat like me' },
  { value: 4, label: 'Mostly like me' },
  { value: 5, label: 'Consistently like me' },
] as const;
