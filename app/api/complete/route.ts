import { NextResponse } from 'next/server';
import { GIFT_MAP } from '@/lib/gifts';
import { cleanName, encodeAnswers, nameKey } from '@/lib/identity';
import { esc, mailConfig, sendEmail } from '@/lib/mail';
import { findSubmission, getMinistryConfig, upsertCompletion } from '@/lib/notion';
import { buildResults, validateAnswers, type Answers } from '@/lib/scoring';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/**
 * Called the moment someone finishes. Logs the completion to Notion (one row per person)
 * and, when email is set up, tells the ministry "Gifts form completed". No email address needed.
 */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, 'complete'), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const first = cleanName(body.first);
  const last = cleanName(body.last);
  if (!first || !last) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  const invalid = validateAnswers(body.answers);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const config = await getMinistryConfig();
  const results = buildResults(body.answers as Answers, config.show ? config.ministries : []);
  const fullName = `${first} ${last}`;
  const key = nameKey(first, last);
  const topNames = results.top.map((g) => GIFT_MAP[g.id].name);
  const areaNames = results.ministries.map((m) => m.ministry.name);
  const rankingText = results.gifts.map((g) => `${g.rank}. ${GIFT_MAP[g.id].name}: ${g.score}/${g.max}`).join('\n');

  const existing = await findSubmission(key);
  const log = await upsertCompletion(
    { fullName, key, answers: encodeAnswers(body.answers as Answers), topGifts: topNames.join(', '), areas: areaNames.join(', '), ranking: rankingText },
    existing,
  );

  let emailed = false;
  const mail = mailConfig();
  if (mail) {
    const retake = Boolean(existing);
    const subject = `${retake ? 'Gifts form retaken' : 'Gifts form completed'}: ${fullName} (${topNames.join(', ')})`;
    try {
      await sendEmail({
        from: mail.from, to: mail.ministryTo, subject,
        text: [retake ? 'Gifts form retaken' : 'Gifts form completed', '', `Name: ${fullName}`, `Top gifts: ${topNames.join(', ')}`,
          ...(areaNames.length ? ['', 'Suggested areas:', ...areaNames.map((n) => `- ${n}`)] : []), '', 'Full ranking:', rankingText].join('\n'),
        html: `<h2 style="margin:0 0 12px">${retake ? 'Gifts form retaken' : 'Gifts form completed'}</h2>
          <p><strong>${esc(fullName)}</strong></p>
          <p><strong>Top gifts:</strong> ${esc(topNames.join(', '))}</p>
          ${areaNames.length ? `<p><strong>Suggested areas:</strong></p><ul>${areaNames.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
          <p><strong>Full ranking</strong></p><ol>${results.gifts.map((g) => `<li>${esc(GIFT_MAP[g.id].name)}: ${g.score}/${g.max}</li>`).join('')}</ol>`,
      });
      emailed = true;
    } catch (err) {
      console.error('[gifts] Completion email failed', err);
    }
  }

  return NextResponse.json({ ok: log.ok || emailed, logged: log.ok, created: log.created, emailed });
}
