import { GIFTS, type GiftId } from './gifts';

/**
 * The question bank. Add or edit statements freely.
 * Rules the scoring depends on:
 *   - every gift has the same number of statements (the build fails if not)
 *   - statements are first-person ("I ...") and answered on the 1-5 scale below
 * To lengthen the assessment, add a statement to EVERY gift. Nothing else changes.
 */
const BANK: Record<GiftId, string[]> = {
  'word-of-wisdom': [
    'In difficult situations, God gives me clear direction or a solution I did not reason my way to.',
    'People bring me hard situations because they trust the direction I receive.',
    'I often know what step to take next when others are stuck.',
  ],
  'word-of-knowledge': [
    'God has shown me facts or details about a person or situation that I could not have known naturally.',
    'I sometimes receive specific information while praying that later proves accurate.',
    'When I share what I have received, people confirm that it was right.',
  ],
  faith: [
    'I take bold steps because I am convinced God will come through.',
    'When circumstances look impossible, my confidence in God grows rather than shrinks.',
    'I have seen God do the seemingly impossible after I believed Him for it.',
  ],
  healing: [
    'I feel drawn to pray for the sick, expecting them to be healed.',
    'I have seen people\u2019s health improve or be restored after I prayed for them.',
    'I feel compassion and boldness when I lay hands on someone who is sick.',
  ],
  miracles: [
    'I expect God to step in supernaturally, beyond what natural means can explain.',
    'I have seen things happen after prayer that natural laws cannot account for.',
    'I feel at ease praying for things that only a miracle can fix.',
  ],
  prophecy: [
    'I receive words from God that build up, encourage, or comfort others.',
    'I feel compelled to speak God\u2019s truth boldly, even when it is uncomfortable.',
    'People tell me that a word I shared was exactly what they needed.',
  ],
  discerning: [
    'I can often tell whether something is from God, from people, or from a demonic source.',
    'I sense spiritual influences in a room or a person before anything is said.',
    'Leaders ask me to weigh in when something does not feel spiritually right.',
  ],
  tongues: [
    'Praying in the Spirit is a regular and natural part of my prayer life.',
    'I feel closest to God when I worship or intercede in a Spirit-given language.',
    'I use my prayer language to pray through things I cannot put into words.',
  ],
  interpretation: [
    'When someone speaks in tongues, I often sense what is being said.',
    'I have given the meaning of a message in tongues so that others were built up.',
    'I feel a nudge to speak up when a message in tongues needs to be understood.',
  ],
  apostle: [
    'I feel drawn to start new works and lay foundations where nothing exists.',
    'I care deeply about sound doctrine and right order in how a church is built.',
    'I think about raising up and sending leaders, not just leading myself.',
  ],
  prophet: [
    'I sense God\u2019s direction for a church or group and feel responsible to deliver it.',
    'I feel compelled to warn when I see spiritual danger or drift.',
    'People come to me to confirm what they believe God is saying about their direction.',
  ],
  evangelist: [
    'I look for chances to tell people who do not know Christ about Him.',
    'I carry a deep burden for lost people and want to see them saved.',
    'I am energized by outreach, altar calls, and moments when people give their lives to Christ.',
  ],
  pastor: [
    'I feel responsible for the spiritual well-being of the people around me.',
    'I follow up with people over time and stay with them through hard seasons.',
    'I feel protective of people when something threatens their faith.',
  ],
  teaching: [
    'I enjoy explaining Scripture so that others understand it and can apply it.',
    'I love digging into doctrine and grounding believers in truth.',
    'People tell me that I make complicated ideas simple.',
  ],
  serving: [
    'I would rather help behind the scenes than be up front.',
    'I see practical needs and jump in without being asked.',
    'I feel fulfilled when my work makes it easier for leaders to do theirs.',
  ],
  exhortation: [
    'People leave conversations with me feeling stronger and more motivated.',
    'I naturally speak comfort and encouragement to discouraged people.',
    'I enjoy gently challenging people to take their next step of growth.',
  ],
  giving: [
    'I feel real joy when I give toward something God is doing.',
    'I look for ways to give quietly, without needing recognition.',
    'I notice financial needs around me and want to help meet them.',
  ],
  leadership: [
    'I turn big goals into clear steps, roles, and timelines.',
    'People tend to follow when I step up to lead.',
    'Disorganized events or projects bother me until someone brings order.',
  ],
  mercy: [
    'I notice people who are hurting, even when they try to hide it.',
    'I feel deeply for people in pain and want to walk with them.',
    'I would rather show compassion than win an argument.',
  ],
  governments: [
    'I think about the oversight, policies, and accountability that keep a ministry healthy long term.',
    'I enjoy coordinating several teams so they work together well.',
    'I am comfortable making decisions about structure that others may not like at first.',
  ],
  worship: [
    'I can sense when a room is ready for God\u2019s presence and how to lead people into it.',
    'I feel called to lead others in praise and worship.',
    'When I lead worship, I stay aware of the flow of the Spirit and follow it.',
  ],
  intercession: [
    'I feel a burden to pray for people and situations until I sense a release.',
    'I am drawn to pray for a person or situation, sometimes without knowing why.',
    'I gladly spend extended time in prayer standing in the gap for others.',
  ],
  creative: [
    'I express worship or prophetic messages through art, dance, poetry, or song.',
    'I often receive creative ideas during worship that I feel God wants shared.',
    'People tell me that something I created helped them encounter God.',
  ],
  'casting-out': [
    'I am not intimidated by demonic activity and sense authority to confront it.',
    'I have prayed for people and seen them set free from bondage or oppression.',
    'I feel drawn to help people find freedom from spiritual oppression.',
  ],
  protection: [
    'I have experienced God\u2019s supernatural protection in a dangerous situation.',
    'I sense God\u2019s covering when I go into risky or hostile places.',
    'I pray with confidence that God will preserve people from harm.',
  ],
};

export interface Question {
  id: string;
  gift: GiftId;
  text: string;
}

export const ITEMS_PER_GIFT = BANK['word-of-wisdom'].length;

// Guard: every gift must have the same number of statements, so scores stay comparable.
for (const g of GIFTS) {
  if (!BANK[g.id] || BANK[g.id].length !== ITEMS_PER_GIFT) {
    throw new Error(`Gift "${g.id}" has ${BANK[g.id]?.length ?? 0} statements; expected ${ITEMS_PER_GIFT}.`);
  }
}

/**
 * Presentation order. Statements are interleaved so two statements for the same
 * gift never appear back to back, and neighboring gifts come from different groups.
 */
const ROUND_ORDER: GiftId[] = [
  'word-of-wisdom', 'apostle', 'serving', 'intercession', 'healing', 'giving', 'casting-out', 'pastor',
  'exhortation', 'worship', 'discerning', 'teaching', 'leadership', 'tongues', 'governments', 'evangelist',
  'creative', 'mercy', 'faith', 'protection', 'prophet', 'word-of-knowledge', 'miracles', 'interpretation', 'prophecy',
];

if (ROUND_ORDER.length !== GIFTS.length || GIFTS.some((g) => !ROUND_ORDER.includes(g.id))) {
  throw new Error('ROUND_ORDER must list every gift exactly once.');
}

const ROUND_SHIFT = 7; // coprime with 25, so each round starts somewhere new

function buildQuestions(): Question[] {
  const out: Question[] = [];
  for (let round = 0; round < ITEMS_PER_GIFT; round++) {
    for (let i = 0; i < ROUND_ORDER.length; i++) {
      const gift = ROUND_ORDER[(i + round * ROUND_SHIFT) % ROUND_ORDER.length];
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
