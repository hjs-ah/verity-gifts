import { NextResponse } from 'next/server';
import { GIFT_MAP } from '@/lib/gifts';
import { buildResults, validateAnswers, type Answers } from '@/lib/scoring';
import { getMinistryConfig, logSubmission } from '@/lib/notion';
import { clientKey, rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function sendEmail(payload: {
  from: string; to: string; subject: string; html: string; text: string; reply_to?: string;
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, 'submit'), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real people never see or fill this field.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
  const interest = typeof body.interest === 'string' ? body.interest.trim().slice(0, 120) : '';
  const wantsFollowUp = body.wantsFollowUp === true;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  const invalid = validateAnswers(body.answers);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  // Results are recomputed on the server so what we record can never disagree with what the person saw.
  const config = await getMinistryConfig();
  const results = buildResults(body.answers as Answers, config.show ? config.ministries : []);
  const topNames = results.top.map((g) => GIFT_MAP[g.id].name);
  const areaNames = results.ministries.map((m) => m.ministry.name);
  const who = name || 'Someone';
  const rankingText = results.gifts.map((g) => `${g.rank}. ${GIFT_MAP[g.id].name}: ${g.score}/${g.max}`).join('\n');

  // 1) Durable record in Notion. This is the follow-up list, so it does not depend on email working.
  const logged = await logSubmission({
    name, email, wantsFollowUp, interest,
    topGifts: topNames.join(', '),
    areas: areaNames.join(', '),
    ranking: rankingText,
  });

  // 2) Notice to the ministry, and a copy to the person, via Resend.
  const from = process.env.RESEND_FROM;
  const ministryTo = process.env.MINISTRY_TO_EMAIL;
  const emailReady = Boolean(process.env.RESEND_API_KEY && from && ministryTo);
  let ministryNotified = false;

  if (emailReady) {
    const text = [
      'Gifts form completed', '',
      `Name: ${name || '(not given)'}`,
      `Email: ${email}`,
      `Wants a follow-up: ${wantsFollowUp ? 'Yes' : 'No, just wanted a copy'}`,
      `Interested in serving in: ${interest || '(not chosen)'}`, '',
      `Top gifts: ${topNames.join(', ')}`,
      ...(areaNames.length ? ['', 'Suggested areas:', ...areaNames.map((n) => `- ${n}`)] : []),
      '', 'Full ranking:', rankingText,
    ].join('\n');

    const html = `
      <h2 style="margin:0 0 12px">Gifts form completed</h2>
      <p><strong>${esc(name || '(name not given)')}</strong> &lt;${esc(email)}&gt;<br/>
      Wants a follow-up: <strong>${wantsFollowUp ? 'Yes' : 'No, just wanted a copy'}</strong><br/>
      Interested in serving in: ${esc(interest || '(not chosen)')}</p>
      <p><strong>Top gifts:</strong> ${esc(topNames.join(', '))}</p>
      ${areaNames.length ? `<p><strong>Suggested areas:</strong></p><ul>${areaNames.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <p><strong>Full ranking</strong></p>
      <ol>${results.gifts.map((g) => `<li>${esc(GIFT_MAP[g.id].name)}: ${g.score}/${g.max}</li>`).join('')}</ol>`;

    try {
      await sendEmail({ from: from!, to: ministryTo!, reply_to: email, subject: `Gifts form completed: ${who} (${topNames.join(', ')})`, text, html });
      ministryNotified = true;
    } catch (err) {
      console.error('[gifts] Ministry email failed', err);
    }

    // The person's own copy. A failure here should not undo anything above.
    if (ministryNotified) {
      try {
        await sendEmail({
          from: from!, to: email, reply_to: ministryTo!,
          subject: 'Your Spiritual Gifts results',
          text: `${name ? `${name}, ` : ''}here are your results.\n\n${results.summary}\n\nTop gifts:\n${results.top
            .map((g) => `${g.rank}. ${GIFT_MAP[g.id].name} (${g.score}/${g.max}): ${GIFT_MAP[g.id].tagline}`)
            .join('\n')}${areaNames.length ? `\n\nAreas that may fit:\n${areaNames.map((n) => `- ${n}`).join('\n')}` : ''}\n\nFull ranking:\n${rankingText}`,
          html: `<h2 style="margin:0 0 12px">Your Spiritual Gifts results</h2>
            <p>${esc(results.summary)}</p>
            <ol>${results.top.map((g) => `<li><strong>${esc(GIFT_MAP[g.id].name)}</strong> (${g.score}/${g.max}) ${esc(GIFT_MAP[g.id].tagline)}</li>`).join('')}</ol>
            ${areaNames.length ? `<p><strong>Areas that may fit</strong></p><ul>${areaNames.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
            <p style="color:#5B6B6E;font-size:13px">Reply to this email to reach the Verity team.</p>`,
        });
      } catch (err) {
        console.error('[gifts] User copy failed', err);
      }
    }
  }

  if (logged || ministryNotified) return NextResponse.json({ ok: true, emailed: ministryNotified });

  if (!emailReady && !process.env.NOTION_SUBMISSIONS_DB_ID) {
    console.warn('[gifts] Neither Notion nor email is configured. Would have recorded:', { who, email, topNames, interest, wantsFollowUp });
    return NextResponse.json({ error: 'Saving is not set up yet. Your results are still on screen.' }, { status: 503 });
  }
  return NextResponse.json({ error: 'We could not send that just now. Please try again.' }, { status: 502 });
}
