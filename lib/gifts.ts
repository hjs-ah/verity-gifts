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
  /** Where this gift typically shows up, in our leadership's words (e.g. "Worship service, preaching, exhortation"). */
  whereItShows: string;
  /** What our leadership teaches is at stake for the church when this gift goes uncultivated. */
  stakes: string;
  /** A short caveat some gifts carry, in our leadership's words. Shown only when present. */
  note?: string;
}

export const GIFTS: Gift[] = [
  // Manifestation
  { id: 'word-of-wisdom', name: 'Word of Wisdom', categories: ['manifestation'],
    tagline: 'Divine strategy, solutions, and instructions from God for situations.',
    does: 'receive God\u2019s strategy for hard situations',
    whereItShows: 'Decision-making, planning, and situations that need God\u2019s strategy.',
    stakes: 'Decisions become flesh-driven and confusion increases when no one carries divine strategy.' },
  { id: 'word-of-knowledge', name: 'Word of Knowledge', categories: ['manifestation'],
    tagline: 'Supernatural revelation of facts, details, or truth unknown naturally.',
    does: 'receive what God reveals about people and situations',
    whereItShows: 'Deliverance, altar calls, pastoral counseling, prophetic ministry.',
    stakes: 'Hidden issues stay hidden, deception grows, and breakthroughs are delayed.' },
  { id: 'faith', name: 'Faith', categories: ['manifestation'],
    tagline: 'Mountain-moving confidence that produces supernatural results.',
    does: 'trust God for what looks impossible',
    whereItShows: 'Intercession, healing lines, building projects, impossible situations.',
    stakes: 'Fear dominates, bold moves stop, and miracles are never attempted.' },
  { id: 'healing', name: 'Gifts of Healing', categories: ['manifestation', 'sign'],
    tagline: 'Power to cure sickness, restore health, and reverse physical conditions, including laying hands on the sick.',
    does: 'pray for the sick with expectation',
    whereItShows: 'Healing lines, prayer teams, hospital ministry.',
    stakes: 'Sickness and suffering remain, and hope and faith weaken.' },
  { id: 'miracles', name: 'Working of Miracles', categories: ['manifestation'],
    tagline: 'Divine intervention that suspends natural laws.',
    does: 'expect God to intervene supernaturally',
    whereItShows: 'Deliverance, crisis intervention, supernatural breakthroughs.',
    stakes: 'Without supernatural intervention, impossible situations stay impossible.' },
  { id: 'prophecy', name: 'Prophecy', categories: ['manifestation', 'motivational'],
    tagline: 'Speaking God\u2019s heart: edification, exhortation, and comfort, and boldly declaring truth and calling for righteousness.',
    does: 'speak God\u2019s heart with boldness',
    whereItShows: 'Worship service, preaching, exhortation, direction for the church.',
    stakes: 'Direction and correction are lost, and encouragement dries up.' },
  { id: 'discerning', name: 'Discerning of Spirits', categories: ['manifestation'],
    tagline: 'Ability to identify demonic, divine, or human spirits.',
    does: 'discern whether a spirit is divine, human, or demonic',
    whereItShows: 'Deliverance, leadership decisions, worship atmosphere, counseling.',
    stakes: 'Wolves enter unnoticed, deception spreads, and spiritual contamination grows.' },
  { id: 'tongues', name: 'Tongues', categories: ['manifestation'],
    tagline: 'Spirit-given languages for prayer, worship, and intercession.',
    does: 'pray and worship in the Spirit',
    whereItShows: 'Intercession, worship, prophetic flow, personal edification.',
    stakes: 'Prayer becomes weak and the spiritual atmosphere declines.' },
  { id: 'interpretation', name: 'Interpretation of Tongues', categories: ['manifestation'],
    tagline: 'Making tongues understandable to the Body.',
    does: 'make Spirit-given messages understood',
    whereItShows: 'Public worship, prophetic messages, corporate prayer.',
    stakes: 'Worship loses clarity, and tongues bring no edification.' },

  // Ministry / Office
  { id: 'apostle', name: 'Apostle', categories: ['office'], office: true,
    tagline: 'Governs, establishes doctrine, sets order, and builds foundations.',
    does: 'build foundations and set order',
    whereItShows: 'Church government, doctrine, foundations, oversight of ministries.',
    stakes: 'Foundations and order are lost, doctrine drifts, and churches become unstable.' },
  { id: 'prophet', name: 'Prophet', categories: ['office'], office: true,
    tagline: 'Reveals God\u2019s mind, warns, directs, and confirms.',
    does: 'hear God\u2019s direction and warn and confirm',
    whereItShows: 'Direction, warning, correction, spiritual climate.',
    stakes: 'Sin goes unchallenged and vision becomes cloudy without warning or direction.' },
  { id: 'evangelist', name: 'Evangelist', categories: ['office'], office: true,
    tagline: 'Preaches Christ, wins souls, and ignites revival.',
    does: 'win souls for Christ',
    whereItShows: 'Outreach, soul-winning, revival, street ministry.',
    stakes: 'The church turns inward and becomes stagnant without soul-winning and outreach.' },
  { id: 'pastor', name: 'Pastor', categories: ['office'], office: true,
    tagline: 'Shepherds, nurtures, protects, and guides the flock.',
    does: 'shepherd and protect people',
    whereItShows: 'Care, counseling, protection, nurturing, spiritual covering.',
    stakes: 'Sheep scatter and wounds go unhealed without care and protection.' },
  { id: 'teaching', name: 'Teaching', categories: ['office', 'motivational'],
    tagline: 'Grounds believers in doctrine, truth, and understanding, and makes complex things simple.',
    does: 'ground people in truth and doctrine',
    whereItShows: 'Classes, small groups, discipleship, youth ministry.',
    stakes: 'Scripture gets misunderstood, confusion spreads, and growth stops.' },

  // Motivational / Grace
  { id: 'serving', name: 'Serving / Helps', categories: ['motivational', 'support'],
    tagline: 'Meets practical needs, supports leaders, and strengthens operations.',
    does: 'meet practical needs and support leaders',
    whereItShows: 'Setup, logistics, hospitality, assisting leaders and pastors.',
    stakes: 'Leaders burn out, tasks pile up, and ministries collapse under the pressure.' },
  { id: 'exhortation', name: 'Exhortation', categories: ['motivational'],
    tagline: 'Encourages, motivates, strengthens, and comforts.',
    does: 'encourage and strengthen people',
    whereItShows: 'Encouragement, counseling, altar ministry, motivation.',
    stakes: 'Discouragement rises and people quit easily without a reason to keep going.' },
  { id: 'giving', name: 'Giving', categories: ['motivational'],
    tagline: 'Supplies resources, funds ministry, and meets needs generously.',
    does: 'resource God\u2019s work generously',
    whereItShows: 'Funding vision, supporting missions, meeting needs.',
    stakes: 'Ministries lack resources, outreach dies, and vision cannot be funded.' },
  { id: 'leadership', name: 'Leadership / Administration', categories: ['motivational'],
    tagline: 'Organizes, directs, manages, and brings order.',
    does: 'organize, direct, and bring order',
    whereItShows: 'Planning, organizing, scheduling, ministry structure.',
    stakes: 'Chaos increases: poor planning, wasted resources, and no structure.' },
  { id: 'mercy', name: 'Mercy', categories: ['motivational'],
    tagline: 'Shows compassion, emotional care, and tenderness to the hurting.',
    does: 'show compassion to the hurting',
    whereItShows: 'Counseling, hospital visits, compassion ministry.',
    stakes: 'The church grows harsh, and wounded people remain broken.' },

  // Support
  { id: 'governments', name: 'Governments', categories: ['support'],
    tagline: 'Oversight, coordination, and structural leadership.',
    does: 'provide oversight and structure',
    whereItShows: 'Leadership boards, ministry oversight, coordination.',
    stakes: 'Without coordination, ministries compete instead of cooperating.' },

  // Worship & Priestly
  { id: 'worship', name: 'Praise & Worship Leadership', categories: ['worship'],
    tagline: 'Ushers the Body into God\u2019s presence.',
    does: 'usher people into God\u2019s presence',
    whereItShows: 'Music, worship flow, atmosphere, ushering in presence.',
    stakes: 'The atmosphere goes dry, hearts stay closed, and worship sees no breakthrough.' },
  { id: 'intercession', name: 'Intercession', categories: ['worship'],
    tagline: 'Stands in the gap, prays burdens, and breaks spiritual resistance.',
    does: 'stand in the gap in prayer',
    whereItShows: 'Prayer teams, warfare, covering leadership, altar ministry.',
    stakes: 'Spiritual covering is lost, attacks increase, and breakthroughs are delayed.' },
  { id: 'creative', name: 'Creative Expression', categories: ['worship'],
    tagline: 'Prophetic art, dance, psalms, and spiritual songs.',
    does: 'express worship through creative gifts',
    whereItShows: 'Dance, prophetic art, psalms, spiritual songs.',
    stakes: 'Worship becomes rigid, with no room for prophetic expression.' },

  // Sign
  { id: 'casting-out', name: 'Casting Out Devils', categories: ['sign'],
    tagline: 'Authority to expel demons.',
    does: 'stand in authority against demonic oppression',
    whereItShows: 'Casting out demons, breaking bondage, spiritual warfare.',
    stakes: 'Oppression increases and demons remain unchallenged.',
    note: 'Every born-again believer carries authority to cast out devils in Jesus’ name — it comes from Christ, not a special sign gift. Not everyone is trained or submitted enough yet to do it safely and effectively.' },
  { id: 'protection', name: 'Supernatural Protection', categories: ['sign'],
    tagline: 'Divine preservation in danger.',
    does: 'walk in God\u2019s covering in dangerous places',
    whereItShows: 'Mission trips, dangerous assignments, spiritual warfare.',
    stakes: 'Fear rises and testimonies decrease without evidence of God’s covering.',
    note: 'Not everyday covering — this is when the Holy Spirit steps in dramatically, visibly, or strategically because an assignment or destiny is under attack, a demonic plot is unfolding, or natural protection isn’t enough.' },
];

export const GIFT_MAP = Object.fromEntries(GIFTS.map((g) => [g.id, g])) as Record<GiftId, Gift>;

/** Scripture references for a gift, taken from the groups it belongs to. */
export function giftScripture(g: Gift): string {
  return g.categories.map((c) => CATEGORY_MAP[c].scripture).filter(Boolean).join('; ');
}
