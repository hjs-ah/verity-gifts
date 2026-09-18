/**
 * The gift library, built from the framework our leadership teaches:
 * six groups of gifts. Where the same gift appears in more than one group
 * (Prophecy, Healing, Teaching, Helps), it is scored once and belongs to each group.
 *
 * This file is the single source of truth for gift names, groups, and result copy.
 */

export type CategoryId = 'manifestation' | 'office' | 'motivational' | 'support' | 'worship' | 'sign';

export interface Category {
  id: CategoryId;
  /** Short name used on results. */
  name: string;
  /** Full title used in the intro. */
  title: string;
  scripture?: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: 'manifestation', name: 'Manifestation', title: 'The Manifestation Gifts', scripture: '1 Corinthians 12:7\u201311',
    blurb: 'Gifts that reveal and demonstrate the supernatural activity of the Holy Spirit in real time.' },
  { id: 'office', name: 'Ministry / Office', title: 'The Ministry / Office Gifts', scripture: 'Ephesians 4:11\u201313',
    blurb: 'Leadership offices given by Christ to build, mature, and govern the Church and to equip the saints.' },
  { id: 'motivational', name: 'Motivational / Grace', title: 'The Motivational / Grace Gifts', scripture: 'Romans 12:6\u20138',
    blurb: 'Gifts that shape personality, motivation, and service. They explain how believers naturally serve in the Body.' },
  { id: 'support', name: 'Support', title: 'The Support Gifts (Helps and Governments)', scripture: '1 Corinthians 12:28',
    blurb: 'Gifts that stabilize and support ministry and keep the church functioning smoothly.' },
  { id: 'worship', name: 'Worship & Priestly', title: 'The Worship & Priestly Gifts',
    blurb: 'Gifts that minister to God directly and lead others into His presence.' },
  { id: 'sign', name: 'Sign', title: 'The Sign Gifts', scripture: 'Mark 16:17\u201318',
    blurb: 'Gifts that demonstrate divine authority and confirm the gospel with power.' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export type GiftId =
  | 'word-of-wisdom' | 'word-of-knowledge' | 'faith' | 'healing' | 'miracles' | 'prophecy'
  | 'discerning' | 'tongues' | 'interpretation'
  | 'apostle' | 'prophet' | 'evangelist' | 'pastor' | 'teaching'
  | 'serving' | 'exhortation' | 'giving' | 'leadership' | 'mercy'
  | 'governments'
  | 'worship' | 'intercession' | 'creative'
  | 'casting-out' | 'protection';

export interface Gift {
  id: GiftId;
  name: string;
  categories: CategoryId[];
  /** True for the five-fold offices that church leadership recognizes and affirms. */
  office?: boolean;
  /** What the gift is, in our leadership's words. */
  tagline: string;
  /** A verb phrase used to build the written summary: "You are wired to ___". */
  does: string;
}

export const GIFTS: Gift[] = [
  // Manifestation
  { id: 'word-of-wisdom', name: 'Word of Wisdom', categories: ['manifestation'],
    tagline: 'Divine strategy, solutions, and instructions from God for situations.',
    does: 'receive God\u2019s strategy for hard situations' },
  { id: 'word-of-knowledge', name: 'Word of Knowledge', categories: ['manifestation'],
    tagline: 'Supernatural revelation of facts, details, or truth unknown naturally.',
    does: 'receive what God reveals about people and situations' },
  { id: 'faith', name: 'Faith', categories: ['manifestation'],
    tagline: 'Mountain-moving confidence that produces supernatural results.',
    does: 'trust God for what looks impossible' },
  { id: 'healing', name: 'Gifts of Healing', categories: ['manifestation', 'sign'],
    tagline: 'Power to cure sickness, restore health, and reverse physical conditions, including laying hands on the sick.',
    does: 'pray for the sick with expectation' },
  { id: 'miracles', name: 'Working of Miracles', categories: ['manifestation'],
    tagline: 'Divine intervention that suspends natural laws.',
    does: 'expect God to intervene supernaturally' },
  { id: 'prophecy', name: 'Prophecy', categories: ['manifestation', 'motivational'],
    tagline: 'Speaking God\u2019s heart: edification, exhortation, and comfort, and boldly declaring truth and calling for righteousness.',
    does: 'speak God\u2019s heart with boldness' },
  { id: 'discerning', name: 'Discerning of Spirits', categories: ['manifestation'],
    tagline: 'Ability to identify demonic, divine, or human spirits.',
    does: 'discern whether a spirit is divine, human, or demonic' },
  { id: 'tongues', name: 'Tongues', categories: ['manifestation'],
    tagline: 'Spirit-given languages for prayer, worship, and intercession.',
    does: 'pray and worship in the Spirit' },
  { id: 'interpretation', name: 'Interpretation of Tongues', categories: ['manifestation'],
    tagline: 'Making tongues understandable to the Body.',
    does: 'make Spirit-given messages understood' },

  // Ministry / Office
  { id: 'apostle', name: 'Apostle', categories: ['office'], office: true,
    tagline: 'Governs, establishes doctrine, sets order, and builds foundations.',
    does: 'build foundations and set order' },
  { id: 'prophet', name: 'Prophet', categories: ['office'], office: true,
    tagline: 'Reveals God\u2019s mind, warns, directs, and confirms.',
    does: 'hear God\u2019s direction and warn and confirm' },
  { id: 'evangelist', name: 'Evangelist', categories: ['office'], office: true,
    tagline: 'Preaches Christ, wins souls, and ignites revival.',
    does: 'win souls for Christ' },
  { id: 'pastor', name: 'Pastor', categories: ['office'], office: true,
    tagline: 'Shepherds, nurtures, protects, and guides the flock.',
    does: 'shepherd and protect people' },
  { id: 'teaching', name: 'Teaching', categories: ['office', 'motivational'],
    tagline: 'Grounds believers in doctrine, truth, and understanding, and makes complex things simple.',
    does: 'ground people in truth and doctrine' },

  // Motivational / Grace
  { id: 'serving', name: 'Serving / Helps', categories: ['motivational', 'support'],
    tagline: 'Meets practical needs, supports leaders, and strengthens operations.',
    does: 'meet practical needs and support leaders' },
  { id: 'exhortation', name: 'Exhortation', categories: ['motivational'],
    tagline: 'Encourages, motivates, strengthens, and comforts.',
    does: 'encourage and strengthen people' },
  { id: 'giving', name: 'Giving', categories: ['motivational'],
    tagline: 'Supplies resources, funds ministry, and meets needs generously.',
    does: 'resource God\u2019s work generously' },
  { id: 'leadership', name: 'Leadership / Administration', categories: ['motivational'],
    tagline: 'Organizes, directs, manages, and brings order.',
    does: 'organize, direct, and bring order' },
  { id: 'mercy', name: 'Mercy', categories: ['motivational'],
    tagline: 'Shows compassion, emotional care, and tenderness to the hurting.',
    does: 'show compassion to the hurting' },

  // Support
  { id: 'governments', name: 'Governments', categories: ['support'],
    tagline: 'Oversight, coordination, and structural leadership.',
    does: 'provide oversight and structure' },

  // Worship & Priestly
  { id: 'worship', name: 'Praise & Worship Leadership', categories: ['worship'],
    tagline: 'Ushers the Body into God\u2019s presence.',
    does: 'usher people into God\u2019s presence' },
  { id: 'intercession', name: 'Intercession', categories: ['worship'],
    tagline: 'Stands in the gap, prays burdens, and breaks spiritual resistance.',
    does: 'stand in the gap in prayer' },
  { id: 'creative', name: 'Creative Expression', categories: ['worship'],
    tagline: 'Prophetic art, dance, psalms, and spiritual songs.',
    does: 'express worship through creative gifts' },

  // Sign
  { id: 'casting-out', name: 'Casting Out Devils', categories: ['sign'],
    tagline: 'Authority to expel demons.',
    does: 'stand in authority against demonic oppression' },
  { id: 'protection', name: 'Supernatural Protection', categories: ['sign'],
    tagline: 'Divine preservation in danger.',
    does: 'walk in God\u2019s covering in dangerous places' },
];

export const GIFT_MAP = Object.fromEntries(GIFTS.map((g) => [g.id, g])) as Record<GiftId, Gift>;

/** Scripture references for a gift, taken from the groups it belongs to. */
export function giftScripture(g: Gift): string {
  return g.categories.map((c) => CATEGORY_MAP[c].scripture).filter(Boolean).join('; ');
}
