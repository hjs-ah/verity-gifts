/**
 * The gift library. This is the single source of truth for gift names,
 * Scripture references, and result copy. Edit here; nothing else needs to change.
 */

export type GiftId =
  | 'leadership' | 'giving' | 'administration' | 'knowledge'
  | 'prophecy' | 'mercy' | 'hospitality' | 'discernment'
  | 'encouragement' | 'evangelism' | 'teaching' | 'service'
  | 'shepherding' | 'wisdom' | 'faith' | 'apostleship';

export interface Gift {
  id: GiftId;
  name: string;
  scripture: string;
  /** One line shown on the top-gift cards. */
  tagline: string;
  /** A verb phrase used to build the written summary: "You're wired to ___". */
  does: string;
  /** Two sentences shown in the expanded view and used as AI context. */
  description: string;
}

export const GIFTS: Gift[] = [
  {
    id: 'leadership', name: 'Leadership', scripture: 'Romans 12:8',
    tagline: 'You point the way, and people willingly follow.',
    does: 'set direction and rally people',
    description: 'You sense where a group needs to go and help others move together toward it. People trust your steadiness when decisions are hard.',
  },
  {
    id: 'giving', name: 'Giving', scripture: 'Romans 12:8',
    tagline: 'You find joy in putting resources behind what God is doing.',
    does: 'resource God\u2019s work generously',
    description: 'You give with gladness, often quietly, and you notice needs others miss. Generosity feels like participation, not obligation.',
  },
  {
    id: 'administration', name: 'Administration', scripture: '1 Corinthians 12:28',
    tagline: 'You bring order so good ideas actually get finished.',
    does: 'turn vision into workable plans',
    description: 'You organize people, time, and resources so the work runs well. You are at your best when a big goal needs a clear path.',
  },
  {
    id: 'knowledge', name: 'Knowledge', scripture: '1 Corinthians 12:8',
    tagline: 'You dig deep into truth and help it make sense.',
    does: 'study deeply and make truth clear',
    description: 'You love Scripture and ideas, and you retain what you learn. Others rely on you for accurate, well-grounded understanding.',
  },
  {
    id: 'prophecy', name: 'Prophecy', scripture: 'Romans 12:6',
    tagline: 'You speak God\u2019s truth with conviction, even when it costs you.',
    does: 'speak God\u2019s truth with conviction',
    description: 'You sense what God is saying about a person or situation and feel compelled to say it. Your words tend to expose what needs to be seen and call people back to God.',
  },
  {
    id: 'mercy', name: 'Mercy', scripture: 'Romans 12:8',
    tagline: 'You notice hurting people and stay with them.',
    does: 'come alongside people in pain',
    description: 'You feel what others feel and are drawn to the overlooked. People experience real safety in your presence.',
  },
  {
    id: 'hospitality', name: 'Hospitality', scripture: '1 Peter 4:9\u201310',
    tagline: 'You make people feel like they belong.',
    does: 'make people feel welcome and at home',
    description: 'You open your space and your attention to others, including strangers. Newcomers often say they felt seen because of you.',
  },
  {
    id: 'discernment', name: 'Discernment', scripture: '1 Corinthians 12:10',
    tagline: 'You can tell what is true and what is off.',
    does: 'test what is true and spot what is off',
    description: 'You sense the spiritual reality behind words, motives, and movements, and you weigh it against Scripture. Leaders lean on you when something does not sit right.',
  },
  {
    id: 'encouragement', name: 'Encouragement', scripture: 'Romans 12:8',
    tagline: 'People leave your presence stronger than they arrived.',
    does: 'strengthen people and speak hope',
    description: 'You see potential and say so, and you help people take their next step. Discouraged people seek you out.',
  },
  {
    id: 'evangelism', name: 'Evangelism', scripture: 'Ephesians 4:11',
    tagline: 'You help people meet Jesus.',
    does: 'introduce people to Jesus',
    description: 'You carry a burden for people far from God and start spiritual conversations naturally. You explain the gospel in ways people can hear.',
  },
  {
    id: 'teaching', name: 'Teaching', scripture: 'Romans 12:7',
    tagline: 'You make truth understandable and usable.',
    does: 'explain truth so people can learn and apply it',
    description: 'You organize what you know so others can follow it step by step. You feel the most alive when someone finally gets it.',
  },
  {
    id: 'service', name: 'Service', scripture: 'Romans 12:7',
    tagline: 'You meet practical needs so others can thrive.',
    does: 'meet practical needs so others can thrive',
    description: 'You see what needs doing and do it, often without being asked. The work you do behind the scenes keeps ministry running.',
  },
  {
    id: 'shepherding', name: 'Shepherding', scripture: 'Ephesians 4:11',
    tagline: 'You care for people over the long haul.',
    does: 'care for people over the long haul',
    description: 'You feel responsible for the spiritual well-being of others and follow up over time. People trust you with their struggles.',
  },
  {
    id: 'wisdom', name: 'Wisdom', scripture: '1 Corinthians 12:8',
    tagline: 'You see how truth applies to real, hard situations.',
    does: 'apply truth to hard decisions',
    description: 'You stay clear when others are confused, and your counsel tends to hold up. People bring you decisions they cannot untangle alone.',
  },
  {
    id: 'faith', name: 'Faith', scripture: '1 Corinthians 12:9',
    tagline: 'You trust God when the odds look impossible.',
    does: 'trust God for what looks impossible',
    description: 'Your confidence in God grows when circumstances shrink. Your expectant prayer and bold steps stretch the faith of those around you.',
  },
  {
    id: 'apostleship', name: 'Apostleship', scripture: 'Ephesians 4:11',
    tagline: 'You pioneer new works and multiply leaders.',
    does: 'pioneer new works and multiply leaders',
    description: 'You are drawn to start what does not yet exist and to send others out. You think in terms of expansion and reproduction, not just personal impact.',
  },
];

export const GIFT_MAP = Object.fromEntries(GIFTS.map((g) => [g.id, g])) as Record<GiftId, Gift>;
