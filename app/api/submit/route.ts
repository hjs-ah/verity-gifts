import { NextResponse } from 'next/server';
import { GIFT_MAP } from '@/lib/gifts';
import { cleanName, encodeAnswers, nameKey } from '@/lib/identity';
import { esc, mailConfig, sendEmail } from '@/lib/mail';
import { attachContact, findSubmission, getMinistryConfig, upsertCompletion } from '@/lib/notion';
import { buildResults, validateAnswers, type Answers } from '@/lib/scoring';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Email me my results." Adds the email to the person's existing row (creating the row if the
 * completion log missed), emails them a copy, and tells the ministry when a follow-up was requested.
 */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, 'submit'), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  // Honeypot: real people never see or fill this field.
  if (typeof body.website === 'string' && body.website.length > 0) return NextResponse.json({ ok: true });

  const first = cleanName(body.first);
  const last = cleanName(body.last);
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const interest = typeof body.interest === 'string' ? body.interest.trim().slice(0, 120) : '';
  const wantsFollowUp = body.wantsFollowUp === true;

  if (!first || !last) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const invalid = validateAnswers(body.answers);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  // Results are recomputed on the server so what we record can never disagree with what the person saw.
  const config = await getMinistryConfig();
  const results = buildResults(body.answers as Answers, config.show ? config.ministries : []);
  const fullName = `${first} ${last}`;
  const key = nameKey(first, last);
  const topNames = results.top.map((g) => GIFT_MAP[g.id].name);
  const areaNames = results.ministries.map((m) => m.ministry.name);
  const rankingText = results.gifts.map((g) => `${g.rank}. ${GIFT_MAP[g.id].name}: ${g.score}/${g.max}`).join('\n');

  // 1) Notion: attach the email to the person's row.
  let record = await findSubmission(key);
  if (!record) {
    await upsertCompletion(
      { fullName, key, answers: encodeAnswers(body.answers as Answers), topGifts: topNames.join(', '), areas: areaNames.join(', '), ranking: rankingText },
      null,
    );
    record = await findSubmission(key);
  }
  const saved = record ? await attachContact(record, { email, wantsFollowUp, interest }) : false;

  // 2) Email: the person's copy, and a heads-up to the ministry if they asked for follow-up.
  const mail = mailConfig();
  let personEmailed = false;
  if (mail) {
    try {
      await sendEmail({
        from: mail.from, to: email, reply_to: mail.ministryTo, subject: 'Your Spiritual Gifts results',
        text: `${first}, here are your results.\n\n${results.summary}\n\nTop gifts:\n${results.top
          .map((g) => `${g.rank}. ${GIFT_MAP[g.id].name} (${g.score}/${g.max}): ${GIFT_MAP[g.id].tagline}`).join('\n')}${areaNames.length ? `\n\nAreas that may fit:\n${areaNames.map((n) => `- ${n}`).join('\n')}` : ''}\n\nFull ranking:\n${rankingText}`,
        html: `<h2 style="margin:0 0 12px">Your Spiritual Gifts results</h2>
          <p>${esc(results.summary)}</p>
          <ol>${results.top.map((g) => `<li><strong>${esc(GIFT_MAP[g.id].name)}</strong> (${g.score}/${g.max}) ${esc(GIFT_MAP[g.id].tagline)}</li>`).join('')}</ol>
          ${areaNames.length ? `<p><strong>Areas that may fit</strong></p><ul>${areaNames.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
          <p style="color:#5B6B6E;font-size:13px">Reply to this email to reach the Verity team.</p>`,
      });
      personEmailed = true;
    } catch (err) {
      console.error('[gifts] User copy failed', err);
    }
    if (wantsFollowUp) {
      try {
        await sendEmail({
          from: mail.from, to: mail.ministryTo, reply_to: email,
          subject: `Follow-up requested: ${fullName} (${topNames.join(', ')})`,
          text: [`Follow-up requested`, '', `Name: ${fullName}`, `Email: ${email}`, `Interested in serving in: ${interest || '(not chosen)'}`, `Top gifts: ${topNames.join(', ')}`].join('\n'),
          html: `<h2 style="margin:0 0 12px">Follow-up requested</h2><p><strong>${esc(fullName)}</strong> &lt;${esc(email)}&gt;<br/>Interested in serving in: ${esc(interest || '(not chosen)')}</p><p><strong>Top gifts:</strong> ${esc(topNames.join(', '))}</p>`,
        });
      } catch (err) {
        console.error('[gifts] Ministry follow-up email failed', err);
      }
    }
  }

  if (saved || personEmailed) return NextResponse.json({ ok: true, emailed: personEmailed });
  if (!mail && !process.env.NOTION_SUBMISSIONS_DB_ID) {
    return NextResponse.json({ error: 'Saving is not set up yet. Your results are still on screen.' }, { status: 503 });
  }
  return NextResponse.json({ error: 'We could not send that just now. Please try again.' }, { status: 502 });
}
